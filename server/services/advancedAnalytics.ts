/**
 * Advanced Analytics Service
 * Heatmaps, session recordings, funnel analysis, and user segmentation
 */

import { db } from '../db';
import { analyticsEvents } from '@shared/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

export interface HeatmapData {
  element: string; // CSS selector
  clicks: number;
  position: { x: number; y: number };
  intensity: number; // 0-1
  timestamp: number;
}

export interface SessionRecording {
  sessionId: string;
  websiteId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  events: Array<{
    type: string;
    timestamp: number;
    data: any;
  }>;
  recording: string; // Base64 encoded or URL to recording
}

export interface FunnelStep {
  id: string;
  name: string;
  selector: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface FunnelAnalysis {
  funnelId: string;
  websiteId: string;
  name: string;
  steps: FunnelStep[];
  totalVisitors: number;
  totalConversions: number;
  overallConversionRate: number;
  bottlenecks: Array<{ step: string; issue: string; impact: number }>;
}

export interface UserSegment {
  id: string;
  name: string;
  criteria: {
    deviceType?: string[];
    browser?: string[];
    country?: string[];
    referrer?: string[];
    pagesVisited?: number;
    timeOnSite?: { min: number; max: number };
    conversionEvents?: string[];
  };
  userCount: number;
  conversionRate: number;
}

class AdvancedAnalyticsService {
  /**
   * Generate heatmap data
   */
  async generateHeatmap(
    websiteId: string,
    pagePath: string,
    type: 'click' | 'scroll' | 'move' = 'click',
    dateRange?: { start: Date; end: Date }
  ): Promise<HeatmapData[]> {
    if (!db) {
      return [];
    }

    try {
      const startDate = dateRange?.start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = dateRange?.end || new Date();

      const events = await db
        .select()
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.websiteId, websiteId),
            eq(analyticsEvents.path, pagePath),
            eq(analyticsEvents.eventType, type),
            gte(analyticsEvents.timestamp, startDate),
            sql`${analyticsEvents.timestamp} <= ${endDate}`
          )
        );

      // Aggregate by element position
      const heatmapMap = new Map<string, { clicks: number; x: number; y: number; timestamps: number[] }>();

      events.forEach(event => {
        const metadata = event.metadata as any;
        const element = metadata?.element || 'unknown';
        const x = metadata?.x || 0;
        const y = metadata?.y || 0;

        const key = `${element}-${Math.floor(x / 10)}-${Math.floor(y / 10)}`;
        const existing = heatmapMap.get(key);

        if (existing) {
          existing.clicks += 1;
          existing.timestamps.push(event.timestamp.getTime());
        } else {
          heatmapMap.set(key, {
            clicks: 1,
            x,
            y,
            timestamps: [event.timestamp.getTime()],
          });
        }
      });

      // Convert to heatmap data
      const maxClicks = Math.max(...Array.from(heatmapMap.values()).map(h => h.clicks));
      const heatmapData: HeatmapData[] = Array.from(heatmapMap.entries()).map(([key, data]) => ({
        element: key.split('-')[0],
        clicks: data.clicks,
        position: { x: data.x, y: data.y },
        intensity: maxClicks > 0 ? data.clicks / maxClicks : 0,
        timestamp: Math.max(...data.timestamps),
      }));

      return heatmapData.sort((a, b) => b.clicks - a.clicks);
    } catch (error) {
      console.error('[AdvancedAnalytics] Heatmap generation error:', error);
      return [];
    }
  }

  /**
   * Record session
   */
  async recordSession(
    websiteId: string,
    sessionId: string,
    events: Array<{ type: string; timestamp: number; data: any }>
  ): Promise<string> {
    if (!db) {
      return 'recording-id';
    }

    try {
      // In production, store session recording in blob storage or database
      // For now, return a recording ID
      const recordingId = `recording-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Store events as session recording
      const startTime = new Date(Math.min(...events.map(e => e.timestamp)));
      const endTime = new Date(Math.max(...events.map(e => e.timestamp)));
      const duration = (endTime.getTime() - startTime.getTime()) / 1000;

      console.log(`[AdvancedAnalytics] Recorded session ${recordingId}: ${events.length} events, ${duration}s`);

      return recordingId;
    } catch (error) {
      console.error('[AdvancedAnalytics] Session recording error:', error);
      throw error;
    }
  }

  /**
   * Get session recording
   */
  async getSessionRecording(recordingId: string): Promise<SessionRecording | null> {
    // In production, fetch from database/blob storage
    return null;
  }

  /**
   * Analyze conversion funnel
   */
  async analyzeFunnel(
    websiteId: string,
    steps: Array<{ id: string; name: string; selector: string }>
  ): Promise<FunnelAnalysis> {
    if (!db) {
      return this.getEmptyFunnel(websiteId, steps);
    }

    try {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Get all events for this website
      const events = await db
        .select()
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.websiteId, websiteId),
            gte(analyticsEvents.timestamp, startDate)
          )
        );

      // Track visitors through funnel
      const visitorSteps = new Map<string, Set<string>>(); // sessionId -> step IDs reached
      const stepVisitors = new Map<string, Set<string>>(); // stepId -> sessionIds

      events.forEach(event => {
        const sessionId = event.sessionId;
        const metadata = event.metadata as any;
        const element = metadata?.element;

        steps.forEach(step => {
          if (element && element.includes(step.selector)) {
            if (!visitorSteps.has(sessionId)) {
              visitorSteps.set(sessionId, new Set());
            }
            visitorSteps.get(sessionId)!.add(step.id);

            if (!stepVisitors.has(step.id)) {
              stepVisitors.set(step.id, new Set());
            }
            stepVisitors.get(step.id)!.add(sessionId);
          }
        });
      });

      // Calculate funnel metrics
      const totalVisitors = new Set(events.map(e => e.sessionId)).size;
      const funnelSteps: FunnelStep[] = steps.map((step, index) => {
        const visitors = stepVisitors.get(step.id)?.size || 0;
        const previousVisitors = index > 0
          ? (stepVisitors.get(steps[index - 1].id)?.size || 0)
          : totalVisitors;
        const conversions = index === steps.length - 1 ? visitors : 0;
        const conversionRate = previousVisitors > 0 ? (visitors / previousVisitors) * 100 : 0;
        const dropoffRate = 100 - conversionRate;

        return {
          id: step.id,
          name: step.name,
          selector: step.selector,
          visitors,
          conversions,
          conversionRate,
          dropoffRate,
        };
      });

      // Identify bottlenecks
      const bottlenecks = funnelSteps
        .filter(step => step.dropoffRate > 50)
        .map(step => ({
          step: step.name,
          issue: `High dropoff rate: ${step.dropoffRate.toFixed(1)}%`,
          impact: step.dropoffRate,
        }))
        .sort((a, b) => b.impact - a.impact);

      const totalConversions = funnelSteps[funnelSteps.length - 1]?.visitors || 0;
      const overallConversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;

      return {
        funnelId: `funnel-${websiteId}`,
        websiteId,
        name: 'Conversion Funnel',
        steps: funnelSteps,
        totalVisitors,
        totalConversions,
        overallConversionRate,
        bottlenecks,
      };
    } catch (error) {
      console.error('[AdvancedAnalytics] Funnel analysis error:', error);
      return this.getEmptyFunnel(websiteId, steps);
    }
  }

  /**
   * Create user segment
   */
  async createUserSegment(
    websiteId: string,
    name: string,
    criteria: UserSegment['criteria']
  ): Promise<string> {
    const segmentId = `segment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // In production, save to database
    console.log(`[AdvancedAnalytics] Created user segment: ${segmentId}`);

    return segmentId;
  }

  /**
   * Analyze user segment
   */
  async analyzeUserSegment(
    websiteId: string,
    segmentId: string
  ): Promise<UserSegment | null> {
    // In production, fetch from database and calculate metrics
    return null;
  }

  /**
   * Get all segments for a website
   */
  async getUserSegments(websiteId: string): Promise<UserSegment[]> {
    // In production, fetch from database
    return [];
  }

  private getEmptyFunnel(websiteId: string, steps: Array<{ id: string; name: string; selector: string }>): FunnelAnalysis {
    return {
      funnelId: `funnel-${websiteId}`,
      websiteId,
      name: 'Conversion Funnel',
      steps: steps.map(step => ({
        id: step.id,
        name: step.name,
        selector: step.selector,
        visitors: 0,
        conversions: 0,
        conversionRate: 0,
        dropoffRate: 0,
      })),
      totalVisitors: 0,
      totalConversions: 0,
      overallConversionRate: 0,
      bottlenecks: [],
    };
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();

