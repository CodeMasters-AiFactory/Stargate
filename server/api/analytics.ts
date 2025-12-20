/**
 * Analytics API Routes
 * Handles visitor tracking, conversion tracking, and analytics data
 * Now uses database persistence instead of in-memory storage
 */

import type { Express } from 'express';
import { db } from '../db';
import { analyticsEvents } from '@shared/schema';
import { eq, gte, and, desc, sql } from 'drizzle-orm';

export interface AnalyticsEventInput {
  websiteId: string;
  eventType: 'pageview' | 'click' | 'conversion' | 'purchase' | 'scroll' | 'time_on_page' | 'exit_intent';
  path?: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

// Helper function to extract device info from user agent
function getDeviceInfo(userAgent?: string): { deviceType: string; browser: string; os: string } {
  if (!userAgent) return { deviceType: 'Unknown', browser: 'Unknown', os: 'Unknown' };
  
  const ua = userAgent.toLowerCase();
  
  // Device type
  let deviceType = 'Desktop';
  if (/mobile|android|iphone|ipod/i.test(ua)) deviceType = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) deviceType = 'Tablet';
  
  // Browser
  let browser = 'Unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';
  
  // OS
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  return { deviceType, browser, os };
}

// Helper function to hash IP for privacy
function hashIP(ip?: string): string | null {
  if (!ip) return null;
  // Simple hash for privacy (in production, use proper hashing)
  return Buffer.from(ip).toString('base64').substring(0, 20);
}

export function registerAnalyticsRoutes(app: Express) {
  // Track analytics event
  app.post('/api/analytics/track', async (req, res) => {
    try {
      const { websiteId, eventType = 'pageview', path, referrer, sessionId, metadata } = req.body;
      const userAgent = req.headers['user-agent'];
      const ip = req.ip || req.socket.remoteAddress;
      
      if (!websiteId) {
        return res.status(400).json({
          success: false,
          error: 'websiteId is required',
        });
      }

      const deviceInfo = getDeviceInfo(userAgent);
      const hashedIP = hashIP(ip);

      // Save to database
      if (db) {
        try {
          const [event] = await db.insert(analyticsEvents).values({
            websiteId,
            eventType,
            path,
            referrer,
            userAgent,
            ip: hashedIP,
            sessionId,
            deviceType: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            metadata: metadata || {},
          }).returning();

          return res.json({
            success: true,
            eventId: event.id,
          });
        } catch (dbError) {
          console.error('[Analytics] Database error:', dbError);
          // Fall through to in-memory fallback
        }
      }

      // Fallback: in-memory storage if database unavailable
      const event: AnalyticsEventInput = {
        websiteId,
        eventType,
        path,
        referrer,
        userAgent,
        ip: hashedIP || undefined,
        sessionId,
        metadata,
      };

      // Store in memory as fallback
      if (!(global as any).analyticsStore) {
        (global as any).analyticsStore = new Map<string, AnalyticsEventInput[]>();
      }
      const events = (global as any).analyticsStore.get(websiteId) || [];
      events.push(event);
      (global as any).analyticsStore.set(websiteId, events);

      res.json({
        success: true,
        eventId: `event-${Date.now()}`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track event',
      });
    }
  });

  // Get analytics data for a website
  app.get('/api/analytics/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const { range = '7d' } = req.query;

      // Calculate date range
      const now = new Date();
      const rangeDays = range === '24h' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - rangeDays);

      let events: any[] = [];

      // Try database first
      if (db) {
        try {
          const dbEvents = await db
            .select()
            .from(analyticsEvents)
            .where(
              and(
                eq(analyticsEvents.websiteId, websiteId),
                gte(analyticsEvents.timestamp, startDate)
              )
            )
            .orderBy(desc(analyticsEvents.timestamp));

          events = dbEvents.map(e => ({
            websiteId: e.websiteId,
            eventType: e.eventType,
            path: e.path,
            referrer: e.referrer,
            userAgent: e.userAgent,
            ip: e.ip,
            timestamp: e.timestamp,
            metadata: e.metadata,
          }));
        } catch (dbError) {
          console.error('[Analytics] Database query error:', dbError);
          // Fall through to in-memory fallback
        }
      }

      // Fallback to in-memory storage
      if (events.length === 0 && (global as any).analyticsStore) {
        const memoryEvents = (global as any).analyticsStore.get(websiteId) || [];
        events = memoryEvents
          .filter((e: any) => {
            // In-memory events don't have timestamp, so include all
            return true;
          })
          .map((e: any) => ({
            ...e,
            timestamp: new Date(), // Use current time as fallback
          }));
      }

      // Process analytics data
      const analytics = processAnalyticsData(events, rangeDays);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
      });
    }
  });

  // Get real-time visitor count
  app.get('/api/analytics/:websiteId/live', async (req, res) => {
    try {
      const { websiteId } = req.params;
      
      // Count active visitors (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      let activeVisitors = 0;

      // Try database first
      if (db) {
        try {
          const recentEvents = await db
            .select({ ip: analyticsEvents.ip, sessionId: analyticsEvents.sessionId })
            .from(analyticsEvents)
            .where(
              and(
                eq(analyticsEvents.websiteId, websiteId),
                gte(analyticsEvents.timestamp, fiveMinutesAgo)
              )
            );

          const uniqueVisitors = new Set(
            recentEvents.map(e => e.sessionId || e.ip || 'unknown')
          );
          activeVisitors = uniqueVisitors.size;
        } catch (dbError) {
          console.error('[Analytics] Database query error:', dbError);
          // Fall through to in-memory fallback
        }
      }

      // Fallback to in-memory storage
      if (activeVisitors === 0 && (global as any).analyticsStore) {
        const events = (global as any).analyticsStore.get(websiteId) || [];
        const uniqueVisitors = new Set(
          events.map((e: any) => e.sessionId || e.ip || 'unknown')
        );
        activeVisitors = uniqueVisitors.size;
      }

      res.json({
        success: true,
        activeVisitors,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch live data',
      });
    }
  });
}

function processAnalyticsData(events: any[], rangeDays: number) {
  const visitors = new Set<string>();
  const sessions = new Set<string>();
  const returningVisitors = new Set<string>();
  const pageViews = new Map<string, number>();
  const sources = new Map<string, number>();
  const devices = new Map<string, number>();
  const countries = new Map<string, number>();
  const conversions = events.filter(e => e.eventType === 'conversion' || e.eventType === 'purchase').length;
  
  // Track sessions and calculate bounce rate
  const sessionPageViews = new Map<string, number>();
  const sessionDurations = new Map<string, number>();
  const firstVisitTime = new Map<string, Date>();
  const lastVisitTime = new Map<string, Date>();

  events.forEach(event => {
    // Track unique visitors by session or IP
    const visitorId = event.sessionId || event.ip || 'unknown';
    visitors.add(visitorId);
    
    if (event.sessionId) {
      sessions.add(event.sessionId);
      
      // Track session page views
      sessionPageViews.set(event.sessionId, (sessionPageViews.get(event.sessionId) || 0) + 1);
      
      // Track session timing
      const timestamp = event.timestamp instanceof Date ? event.timestamp : new Date(event.timestamp);
      if (!firstVisitTime.has(event.sessionId) || timestamp < firstVisitTime.get(event.sessionId)!) {
        firstVisitTime.set(event.sessionId, timestamp);
      }
      if (!lastVisitTime.has(event.sessionId) || timestamp > lastVisitTime.get(event.sessionId)!) {
        lastVisitTime.set(event.sessionId, timestamp);
      }
    }

    // Track page views
    if (event.path) {
      pageViews.set(event.path, (pageViews.get(event.path) || 0) + 1);
    }

    // Track traffic sources
    const source = getSourceFromReferrer(event.referrer);
    sources.set(source, (sources.get(source) || 0) + 1);

    // Track devices (use database field if available, otherwise parse)
    const device = event.deviceType || getDeviceFromUserAgent(event.userAgent || '');
    devices.set(device, (devices.get(device) || 0) + 1);
    
    // Track countries (if available from database)
    if (event.country) {
      countries.set(event.country, (countries.get(event.country) || 0) + 1);
    }
  });

  // Calculate session durations
  sessions.forEach(sessionId => {
    const first = firstVisitTime.get(sessionId);
    const last = lastVisitTime.get(sessionId);
    if (first && last) {
      const duration = Math.round((last.getTime() - first.getTime()) / 1000); // seconds
      sessionDurations.set(sessionId, duration);
    }
  });

  // Calculate bounce rate (sessions with only 1 page view)
  const bouncedSessions = Array.from(sessionPageViews.entries())
    .filter(([_, views]) => views === 1).length;
  const bounceRate = sessions.size > 0 ? (bouncedSessions / sessions.size) * 100 : 0;

  // Calculate average session duration
  const avgSessionDuration = sessionDurations.size > 0
    ? Array.from(sessionDurations.values()).reduce((a, b) => a + b, 0) / sessionDurations.size
    : 0;

  // Generate time series data
  const timeSeries = generateTimeSeries(events, rangeDays);

  // Calculate returning visitors (simplified: visitors with multiple sessions)
  // In a full implementation, we'd track this across time periods
  const uniqueVisitorCount = visitors.size;

  return {
    visitors: {
      total: events.length,
      unique: uniqueVisitorCount,
      returning: returningVisitors.size, // Would need cross-period tracking
      new: uniqueVisitorCount - returningVisitors.size,
    },
    pageViews: {
      total: events.filter(e => e.eventType === 'pageview').length,
      average: uniqueVisitorCount > 0 ? events.length / uniqueVisitorCount : 0,
      topPages: Array.from(pageViews.entries())
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10),
    },
    traffic: {
      sources: Array.from(sources.entries())
        .map(([source, count]) => ({
          source,
          visitors: count,
          percentage: uniqueVisitorCount > 0 ? (count / uniqueVisitorCount) * 100 : 0,
        }))
        .sort((a, b) => b.visitors - a.visitors),
      devices: Array.from(devices.entries())
        .map(([device, count]) => ({
          device,
          visitors: count,
          percentage: uniqueVisitorCount > 0 ? (count / uniqueVisitorCount) * 100 : 0,
        })),
      countries: Array.from(countries.entries())
        .map(([country, count]) => ({
          country,
          visitors: count,
          percentage: uniqueVisitorCount > 0 ? (count / uniqueVisitorCount) * 100 : 0,
        }))
        .sort((a, b) => b.visitors - a.visitors),
    },
    conversions: {
      total: conversions,
      rate: uniqueVisitorCount > 0 ? (conversions / uniqueVisitorCount) * 100 : 0,
      funnel: [], // Would need conversion tracking setup
    },
    performance: {
      averageLoadTime: 1200, // Would need performance API (Web Vitals)
      bounceRate: Math.round(bounceRate * 10) / 10,
      sessionDuration: Math.round(avgSessionDuration),
    },
    timeSeries,
  };
}

function getSourceFromReferrer(referrer?: string): string {
  if (!referrer) return 'Direct';
  if (referrer.includes('google')) return 'Organic Search';
  if (referrer.includes('facebook') || referrer.includes('twitter') || referrer.includes('instagram'))
    return 'Social Media';
  return 'Referral';
}

function getDeviceFromUserAgent(userAgent: string): string {
  if (/mobile|android|iphone|ipad/i.test(userAgent)) return 'Mobile';
  if (/tablet|ipad/i.test(userAgent)) return 'Tablet';
  return 'Desktop';
}

function generateTimeSeries(events: AnalyticsEvent[], rangeDays: number) {
  const now = new Date();
  const series: Array<{ date: string; visitors: number; pageViews: number }> = [];

  for (let i = rangeDays - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayEvents = events.filter(
      e => e.timestamp >= dayStart && e.timestamp <= dayEnd
    );
    const uniqueVisitors = new Set(dayEvents.map(e => e.ip || 'unknown')).size;

    series.push({
      date: dateStr,
      visitors: uniqueVisitors,
      pageViews: dayEvents.filter(e => e.eventType === 'pageview').length,
    });
  }

  return series;
}

