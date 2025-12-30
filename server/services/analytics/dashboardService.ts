/**
 * Advanced Analytics Dashboard Service
 * Phase 3.5: Advanced Analytics - Real-time metrics and historical trends
 */

import { getAggregatedData } from './dataCollection';
import { getEvents } from './eventTracker';

export interface DashboardMetrics {
  websiteId: string;
  period: {
    start: Date;
    end: Date;
    range: '24h' | '7d' | '30d' | '90d' | 'custom';
  };
  visitors: {
    total: number;
    unique: number;
    new: number;
    returning: number;
    change: number; // percentage change from previous period
  };
  sessions: {
    total: number;
    averageDuration: number;
    bounceRate: number;
    change: number;
  };
  pageViews: {
    total: number;
    averagePerSession: number;
    topPages: Array<{ path: string; views: number; uniqueViews: number; change: number }>;
    change: number;
  };
  traffic: {
    sources: Array<{ source: string; visitors: number; percentage: number; change: number }>;
    devices: Array<{ device: string; visitors: number; percentage: number; change: number }>;
    countries: Array<{ country: string; visitors: number; percentage: number; change: number }>;
  };
  conversions: {
    total: number;
    rate: number;
    revenue?: number;
    change: number;
  };
  trends: {
    timeSeries: Array<{ date: string; visitors: number; pageViews: number; conversions: number }>;
    visitorGrowth: number;
    conversionTrend: 'up' | 'down' | 'stable';
  };
  realTime: {
    activeVisitors: number;
    activeSessions: number;
    currentPageViews: number;
  };
}

/**
 * Get dashboard metrics for a website
 */
export async function getDashboardMetrics(
  websiteId: string,
  range: '24h' | '7d' | '30d' | '90d' | 'custom' = '7d',
  startDate?: Date,
  endDate?: Date
): Promise<DashboardMetrics> {
  // Calculate date range
  const now = new Date();
  let start: Date;
  let end: Date = now;
  
  switch (range) {
    case '24h':
      start = new Date(now);
      start.setHours(start.getHours() - 24);
      break;
    case '7d':
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start = new Date(now);
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start = new Date(now);
      start.setDate(start.getDate() - 90);
      break;
    case 'custom':
      start = startDate || new Date(now);
      start.setDate(start.getDate() - 7);
      end = endDate || now;
      break;
    default:
      start = new Date(now);
      start.setDate(start.getDate() - 7);
  }
  
  // Get aggregated data
  const aggregatedData = await getAggregatedData(websiteId, start, end);
  
  // Get previous period for comparison
  const previousStart = new Date(start);
  const previousEnd = new Date(start);
  const periodDuration = end.getTime() - start.getTime();
  previousStart.setTime(previousStart.getTime() - periodDuration);
  previousEnd.setTime(previousEnd.getTime() - periodDuration);
  const previousData = await getAggregatedData(websiteId, previousStart, previousEnd);
  
  // Aggregate current period
  const currentMetrics = aggregateMetrics(aggregatedData);
  const previousMetrics = aggregateMetrics(previousData);
  
  // Calculate changes
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  
  // Get real-time data (last 5 minutes)
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const recentEvents = await getEvents(websiteId, fiveMinutesAgo, now);
  const activeSessions = new Set(recentEvents.map(e => e.sessionId));
  const activeVisitors = new Set(recentEvents.map(e => e.visitorId));
  const currentPageViews = recentEvents.filter(e => e.eventType === 'pageview' || e.path).length;
  
  // Generate time series
  const timeSeries = generateTimeSeries(aggregatedData);
  
  // Calculate trends
  const visitorGrowth = timeSeries.length > 1
    ? ((timeSeries[timeSeries.length - 1].visitors - timeSeries[0].visitors) / timeSeries[0].visitors) * 100
    : 0;
  
  const conversionTrend = currentMetrics.conversions.rate > previousMetrics.conversions.rate
    ? 'up'
    : currentMetrics.conversions.rate < previousMetrics.conversions.rate
    ? 'down'
    : 'stable';
  
  // Get top pages with changes
  const topPages = currentMetrics.pageViews.topPages.map((page: { path: string; views: number }) => {
    const previousPage = previousMetrics.pageViews.topPages.find((p: { path: string }) => p.path === page.path);
    return {
      ...page,
      change: calculateChange(page.views, previousPage?.views || 0),
    };
  });
  
  // Get traffic sources with changes
  const sourcesEntries = Object.entries(currentMetrics.traffic.sources) as [string, number][];
  const sourcesTotal = sourcesEntries.reduce((sum, [, v]) => sum + v, 0);
  const sources = sourcesEntries
    .map(([source, visitors]) => {
      const previous = (previousMetrics.traffic.sources[source] || 0) as number;
      return {
        source,
        visitors,
        percentage: sourcesTotal > 0 ? (visitors / sourcesTotal) * 100 : 0,
        change: calculateChange(visitors, previous),
      };
    })
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 10);
  
  // Get devices with changes
  const devices = [
    { device: 'Desktop', visitors: currentMetrics.devices.desktop },
    { device: 'Mobile', visitors: currentMetrics.devices.mobile },
    { device: 'Tablet', visitors: currentMetrics.devices.tablet },
  ].map(d => {
    const previous = previousMetrics.devices[d.device.toLowerCase() as keyof typeof previousMetrics.devices] || 0;
    const total = currentMetrics.devices.desktop + currentMetrics.devices.mobile + currentMetrics.devices.tablet;
    return {
      ...d,
      visitors: d.visitors,
      percentage: total > 0 ? (d.visitors / total) * 100 : 0,
      change: calculateChange(d.visitors, previous),
    };
  });
  
  // Get countries with changes
  const countriesEntries = Object.entries(currentMetrics.traffic.countries) as [string, number][];
  const countriesTotal = countriesEntries.reduce((sum, [, v]) => sum + v, 0);
  const countries = countriesEntries
    .map(([country, visitors]) => {
      const previous = (previousMetrics.traffic.countries[country] || 0) as number;
      return {
        country,
        visitors,
        percentage: countriesTotal > 0 ? (visitors / countriesTotal) * 100 : 0,
        change: calculateChange(visitors, previous),
      };
    })
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 10);
  
  const dashboard: DashboardMetrics = {
    websiteId,
    period: {
      start,
      end,
      range,
    },
    visitors: {
      ...currentMetrics.visitors,
      change: calculateChange(currentMetrics.visitors.total, previousMetrics.visitors.total),
    },
    sessions: {
      ...currentMetrics.sessions,
      change: calculateChange(currentMetrics.sessions.total, previousMetrics.sessions.total),
    },
    pageViews: {
      total: currentMetrics.pageViews.total,
      averagePerSession: currentMetrics.pageViews.averagePerSession,
      topPages,
      change: calculateChange(currentMetrics.pageViews.total, previousMetrics.pageViews.total),
    },
    traffic: {
      sources,
      devices,
      countries,
    },
    conversions: {
      ...currentMetrics.conversions,
      change: calculateChange(currentMetrics.conversions.total, previousMetrics.conversions.total),
    },
    trends: {
      timeSeries,
      visitorGrowth,
      conversionTrend,
    },
    realTime: {
      activeVisitors: activeVisitors.size,
      activeSessions: activeSessions.size,
      currentPageViews,
    },
  };
  
  return dashboard;
}

/**
 * Aggregate metrics from aggregated data
 */
function aggregateMetrics(aggregatedData: any[]): any {
  if (aggregatedData.length === 0) {
    return {
      visitors: { total: 0, unique: 0, new: 0, returning: 0 },
      sessions: { total: 0, averageDuration: 0, bounceRate: 0 },
      pageViews: { total: 0, averagePerSession: 0, topPages: [] },
      devices: { desktop: 0, mobile: 0, tablet: 0 },
      traffic: { sources: {}, countries: {} },
      conversions: { total: 0, rate: 0, revenue: 0 },
    };
  }
  
  const metrics = aggregatedData.reduce((acc, data) => {
    acc.visitors.total += data.metrics.visitors.total;
    acc.visitors.unique += data.metrics.visitors.unique;
    acc.visitors.new += data.metrics.visitors.new;
    acc.sessions.total += data.metrics.sessions.total;
    acc.sessions.bounceRate += data.metrics.sessions.bounceRate;
    acc.pageViews.total += data.metrics.pageViews.total;
    acc.conversions.total += data.metrics.conversions.total;
    acc.conversions.revenue = (acc.conversions.revenue || 0) + (data.metrics.conversions.revenue || 0);
    
    // Aggregate page views
    data.metrics.pageViews.topPages.forEach((page: any) => {
      const existing = acc.pageViews.topPages.find((p: any) => p.path === page.path);
      if (existing) {
        existing.views += page.views;
        existing.uniqueViews += page.uniqueViews;
      } else {
        acc.pageViews.topPages.push({ ...page });
      }
    });
    
    // Aggregate devices
    acc.devices.desktop += data.metrics.devices.desktop || 0;
    acc.devices.mobile += data.metrics.devices.mobile || 0;
    acc.devices.tablet += data.metrics.devices.tablet || 0;
    
    // Aggregate sources
    Object.entries(data.metrics.traffic.sources).forEach(([source, count]: [string, any]) => {
      acc.traffic.sources[source] = (acc.traffic.sources[source] || 0) + count;
    });
    
    // Aggregate countries
    Object.entries(data.metrics.traffic.countries).forEach(([country, count]: [string, any]) => {
      acc.traffic.countries[country] = (acc.traffic.countries[country] || 0) + count;
    });
    
    return acc;
  }, {
    visitors: { total: 0, unique: 0, new: 0, returning: 0 },
    sessions: { total: 0, averageDuration: 0, bounceRate: 0 },
    pageViews: { total: 0, averagePerSession: 0, topPages: [] },
    devices: { desktop: 0, mobile: 0, tablet: 0 },
    traffic: { sources: {}, countries: {} },
    conversions: { total: 0, rate: 0, revenue: 0 },
  });
  
  // Calculate averages
  metrics.sessions.bounceRate = metrics.sessions.total > 0
    ? metrics.sessions.bounceRate / aggregatedData.length
    : 0;
  metrics.pageViews.averagePerSession = metrics.sessions.total > 0
    ? metrics.pageViews.total / metrics.sessions.total
    : 0;
  metrics.conversions.rate = metrics.sessions.total > 0
    ? (metrics.conversions.total / metrics.sessions.total) * 100
    : 0;
  
  // Sort top pages
  metrics.pageViews.topPages.sort((a: any, b: any) => b.views - a.views);
  
  return metrics;
}

/**
 * Generate time series data
 */
function generateTimeSeries(aggregatedData: any[]): Array<{ date: string; visitors: number; pageViews: number; conversions: number }> {
  return aggregatedData.map(data => ({
    date: data.date,
    visitors: data.metrics.visitors.total,
    pageViews: data.metrics.pageViews.total,
    conversions: data.metrics.conversions.total,
  }));
}

