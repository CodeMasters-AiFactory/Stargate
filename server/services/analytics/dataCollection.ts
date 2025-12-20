/**
 * Data Collection Service
 * Phase 3.5: Advanced Analytics - Data collection pipeline and aggregation
 */

import * as fs from 'fs';
import * as path from 'path';
import { getEvents, type AdvancedAnalyticsEvent } from './eventTracker';

export interface AggregatedData {
  websiteId: string;
  date: string; // YYYY-MM-DD
  metrics: {
    visitors: {
      total: number;
      unique: number;
      new: number;
      returning: number;
    };
    sessions: {
      total: number;
      averageDuration: number; // in seconds
      bounceRate: number; // percentage
    };
    pageViews: {
      total: number;
      averagePerSession: number;
      topPages: Array<{ path: string; views: number; uniqueViews: number }>;
    };
    events: {
      total: number;
      byType: Record<string, number>;
      byCategory: Record<string, number>;
    };
    devices: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
    traffic: {
      sources: Record<string, number>;
      countries: Record<string, number>;
    };
    conversions: {
      total: number;
      rate: number; // percentage
      revenue?: number;
    };
  };
  timestamp: Date;
}

/**
 * Get analytics directory
 */
function getAnalyticsDir(websiteId: string): string {
  const projectDir = path.join(process.cwd(), 'website_projects', websiteId);
  const analyticsDir = path.join(projectDir, 'analytics');
  
  if (!fs.existsSync(analyticsDir)) {
    fs.mkdirSync(analyticsDir, { recursive: true });
  }
  
  return analyticsDir;
}

/**
 * Aggregate events into daily metrics
 */
export async function aggregateDailyData(
  websiteId: string,
  date: Date
): Promise<AggregatedData> {
  const dateStr = date.toISOString().split('T')[0];
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  const events = await getEvents(websiteId, startDate, endDate);
  
  // Calculate metrics
  const uniqueVisitors = new Set<string>();
  const sessions = new Map<string, { start: Date; end: Date; events: AdvancedAnalyticsEvent[] }>();
  const pageViews = new Map<string, { views: number; uniqueViews: Set<string> }>();
  const eventsByType = new Map<string, number>();
  const eventsByCategory = new Map<string, number>();
  const devices = { desktop: 0, mobile: 0, tablet: 0 };
  const sources = new Map<string, number>();
  const countries = new Map<string, number>();
  let conversions = 0;
  let revenue = 0;
  
  events.forEach(event => {
    // Track unique visitors
    uniqueVisitors.add(event.visitorId);
    
    // Track sessions
    if (!sessions.has(event.sessionId)) {
      sessions.set(event.sessionId, {
        start: new Date(event.timestamp),
        end: new Date(event.timestamp),
        events: [],
      });
    }
    const session = sessions.get(event.sessionId)!;
    session.events.push(event);
    if (new Date(event.timestamp) < session.start) {
      session.start = new Date(event.timestamp);
    }
    if (new Date(event.timestamp) > session.end) {
      session.end = new Date(event.timestamp);
    }
    
    // Track page views
    if (event.path) {
      if (!pageViews.has(event.path)) {
        pageViews.set(event.path, { views: 0, uniqueViews: new Set() });
      }
      const pageData = pageViews.get(event.path)!;
      pageData.views++;
      pageData.uniqueViews.add(event.visitorId);
    }
    
    // Track events by type
    eventsByType.set(event.eventType, (eventsByType.get(event.eventType) || 0) + 1);
    eventsByCategory.set(event.eventCategory, (eventsByCategory.get(event.eventCategory) || 0) + 1);
    
    // Track devices
    if (event.device) {
      devices[event.device.type]++;
    }
    
    // Track sources
    if (event.referrer) {
      const source = getSourceFromReferrer(event.referrer);
      sources.set(source, (sources.get(source) || 0) + 1);
    } else {
      sources.set('direct', (sources.get('direct') || 0) + 1);
    }
    
    // Track countries
    if (event.location?.country) {
      countries.set(event.location.country, (countries.get(event.location.country) || 0) + 1);
    }
    
    // Track conversions
    if (event.eventType === 'conversion' || event.eventType === 'purchase') {
      conversions++;
      if (event.eventValue) {
        revenue += event.eventValue;
      }
      if (event.metadata?.revenue) {
        revenue += Number(event.metadata.revenue) || 0;
      }
    }
  });
  
  // Calculate session metrics
  const sessionDurations: number[] = [];
  sessions.forEach(session => {
    const duration = (session.end.getTime() - session.start.getTime()) / 1000; // seconds
    sessionDurations.push(duration);
  });
  
  const averageDuration = sessionDurations.length > 0
    ? sessionDurations.reduce((sum, d) => sum + d, 0) / sessionDurations.length
    : 0;
  
  // Calculate bounce rate (sessions with only 1 pageview)
  const bouncedSessions = Array.from(sessions.values()).filter(
    s => s.events.filter(e => e.eventType === 'pageview' || e.path).length === 1
  ).length;
  const bounceRate = sessions.size > 0 ? (bouncedSessions / sessions.size) * 100 : 0;
  
  // Determine new vs returning visitors (simplified - check if first visit today)
  // In production, track visitor history across days
  const newVisitors = uniqueVisitors.size; // Simplified
  
  // Calculate conversion rate
  const conversionRate = sessions.size > 0 ? (conversions / sessions.size) * 100 : 0;
  
  // Get top pages
  const topPages = Array.from(pageViews.entries())
    .map(([path, data]) => ({
      path,
      views: data.views,
      uniqueViews: data.uniqueViews.size,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
  
  const aggregated: AggregatedData = {
    websiteId,
    date: dateStr,
    metrics: {
      visitors: {
        total: uniqueVisitors.size,
        unique: uniqueVisitors.size,
        new: newVisitors,
        returning: 0, // Would need historical data
      },
      sessions: {
        total: sessions.size,
        averageDuration,
        bounceRate,
      },
      pageViews: {
        total: Array.from(pageViews.values()).reduce((sum, p) => sum + p.views, 0),
        averagePerSession: sessions.size > 0
          ? Array.from(pageViews.values()).reduce((sum, p) => sum + p.views, 0) / sessions.size
          : 0,
        topPages,
      },
      events: {
        total: events.length,
        byType: Object.fromEntries(eventsByType),
        byCategory: Object.fromEntries(eventsByCategory),
      },
      devices,
      traffic: {
        sources: Object.fromEntries(sources),
        countries: Object.fromEntries(countries),
      },
      conversions: {
        total: conversions,
        rate: conversionRate,
        revenue: revenue > 0 ? revenue : undefined,
      },
    },
    timestamp: new Date(),
  };
  
  // Save aggregated data
  await saveAggregatedData(websiteId, aggregated);
  
  return aggregated;
}

/**
 * Save aggregated data
 */
async function saveAggregatedData(websiteId: string, data: AggregatedData): Promise<void> {
  const analyticsDir = getAnalyticsDir(websiteId);
  const aggregatedDir = path.join(analyticsDir, 'aggregated');
  
  if (!fs.existsSync(aggregatedDir)) {
    fs.mkdirSync(aggregatedDir, { recursive: true });
  }
  
  const dataPath = path.join(aggregatedDir, `${data.date}.json`);
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Get aggregated data for date range
 */
export async function getAggregatedData(
  websiteId: string,
  startDate: Date,
  endDate: Date
): Promise<AggregatedData[]> {
  const analyticsDir = getAnalyticsDir(websiteId);
  const aggregatedDir = path.join(analyticsDir, 'aggregated');
  
  if (!fs.existsSync(aggregatedDir)) {
    return [];
  }
  
  const aggregated: AggregatedData[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dataPath = path.join(aggregatedDir, `${dateStr}.json`);
    
    if (fs.existsSync(dataPath)) {
      try {
        const content = fs.readFileSync(dataPath, 'utf-8');
        const data: AggregatedData = JSON.parse(content);
        aggregated.push({
          ...data,
          timestamp: new Date(data.timestamp),
        });
      } catch (error) {
        console.error(`[Data Collection] Failed to load aggregated data for ${dateStr}:`, error);
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return aggregated;
}

/**
 * Get source from referrer URL
 */
function getSourceFromReferrer(referrer: string): string {
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();
    
    // Social media
    if (hostname.includes('facebook')) return 'Facebook';
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'Twitter';
    if (hostname.includes('linkedin')) return 'LinkedIn';
    if (hostname.includes('instagram')) return 'Instagram';
    if (hostname.includes('youtube')) return 'YouTube';
    if (hostname.includes('pinterest')) return 'Pinterest';
    
    // Search engines
    if (hostname.includes('google')) return 'Google';
    if (hostname.includes('bing')) return 'Bing';
    if (hostname.includes('yahoo')) return 'Yahoo';
    if (hostname.includes('duckduckgo')) return 'DuckDuckGo';
    
    return hostname;
  } catch {
    return 'unknown';
  }
}

/**
 * Batch aggregate historical data
 */
export async function batchAggregateData(
  websiteId: string,
  startDate: Date,
  endDate: Date
): Promise<{ aggregated: number; errors: number }> {
  let aggregated = 0;
  let errors = 0;
  
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    try {
      await aggregateDailyData(websiteId, new Date(currentDate));
      aggregated++;
    } catch (error) {
      console.error(`[Data Collection] Failed to aggregate data for ${currentDate.toISOString()}:`, error);
      errors++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return { aggregated, errors };
}

