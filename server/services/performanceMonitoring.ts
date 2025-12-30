/**
 * Performance Monitoring Service
 * Phase 3.1: Performance Optimization - Track Core Web Vitals and performance metrics
 * Enhanced with database persistence
 */

import { debugLog } from '../utils/debugLogger';
import { db } from '../db';
import { performanceMetrics, performanceReports } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  websiteId?: string;
  deviceType?: string;
  browser?: string;
  connectionType?: string;
  metadata?: Record<string, unknown>;
}

export interface PerformanceReport {
  websiteId?: string;
  url: string;
  timestamp: number;
  metrics: PerformanceMetric[];
  summary: {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
    inp?: number;
  };
  scores: {
    performance: number; // 0-100
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
}

/**
 * Record a performance metric (with database persistence)
 */
export async function recordMetric(metric: PerformanceMetric): Promise<void> {
  // #region agent log
  debugLog({ location: 'server/services/performanceMonitoring.ts:46', message: 'recordMetric called', data: { metricName: metric.name, value: metric.value }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' });
  // #endregion

  // Save to database
  if (db) {
    try {
      await db.insert(performanceMetrics).values({
        websiteId: metric.websiteId || '',
        url: metric.url,
        metricName: metric.name,
        value: metric.value.toString(),
        rating: metric.rating,
        deviceType: metric.deviceType,
        browser: metric.browser,
        connectionType: metric.connectionType,
        timestamp: new Date(metric.timestamp),
        metadata: metric.metadata || {},
      });
    } catch (_error) {
      console.error('[Performance Monitoring] Failed to save metric to database:', _error);
    }
  }

  console.log(`[Performance Monitoring] Recorded ${metric.name}: ${metric.value}ms (${metric.rating})`);
}

/**
 * Get metrics for a website (from database)
 */
export async function getMetricsForWebsite(
  websiteId?: string,
  limit: number = 100
): Promise<PerformanceMetric[]> {
  if (!db) {
    return [];
  }

  try {
    let query = db.select().from(performanceMetrics);

    if (websiteId) {
      query = query.where(eq(performanceMetrics.websiteId, websiteId));
    }

    const metrics = await query
      .orderBy(desc(performanceMetrics.timestamp))
      .limit(limit);

    return metrics.map(m => ({
      name: m.metricName,
      value: parseFloat(m.value),
      rating: m.rating as 'good' | 'needs-improvement' | 'poor',
      timestamp: m.timestamp.getTime(),
      url: m.url,
      websiteId: m.websiteId,
      deviceType: m.deviceType,
      browser: m.browser,
      connectionType: m.connectionType,
      metadata: m.metadata as Record<string, unknown>,
    }));
  } catch (_error) {
    console.error('[Performance Monitoring] Failed to get metrics:', _error);
    return [];
  }
}

/**
 * Generate performance report
 */
export async function generatePerformanceReport(
  websiteId?: string,
  url?: string
): Promise<PerformanceReport | null> {
  const metrics = await getMetricsForWebsite(websiteId, 1000);

  if (metrics.length === 0) {
    return null;
  }

  // Filter by URL if provided
  const filteredMetrics = url
    ? metrics.filter(m => m.url === url)
    : metrics;

  // Get latest metrics for each type
  const latestMetrics = new Map<string, PerformanceMetric>();
  filteredMetrics.forEach(metric => {
    const existing = latestMetrics.get(metric.name);
    if (!existing || metric.timestamp > existing.timestamp) {
      latestMetrics.set(metric.name, metric);
    }
  });

  const metricMap = new Map(
    Array.from(latestMetrics.values()).map(m => [m.name.toLowerCase(), m.value])
  );

  // Calculate scores (0-100)
  const performanceScore = calculatePerformanceScore(metricMap);
  const accessibilityScore = 95; // Placeholder - would need actual Lighthouse data
  const bestPracticesScore = 90; // Placeholder
  const seoScore = 92; // Placeholder

  return {
    websiteId,
    url: url || filteredMetrics[0]?.url || '',
    timestamp: Date.now(),
    metrics: Array.from(latestMetrics.values()),
    summary: {
      lcp: metricMap.get('lcp'),
      fid: metricMap.get('fid'),
      cls: metricMap.get('cls'),
      fcp: metricMap.get('fcp'),
      ttfb: metricMap.get('ttfb'),
      inp: metricMap.get('inp'),
    },
    scores: {
      performance: performanceScore,
      accessibility: accessibilityScore,
      bestPractices: bestPracticesScore,
      seo: seoScore,
    },
  };
}

/**
 * Calculate performance score based on Core Web Vitals
 */
function calculatePerformanceScore(metrics: Map<string, number>): number {
  let score = 100;

  // LCP (Largest Contentful Paint) - target: < 2.5s
  const lcp = metrics.get('lcp') || 0;
  if (lcp > 4000) score -= 30;
  else if (lcp > 2500) score -= 20;
  else if (lcp > 2000) score -= 10;

  // FID (First Input Delay) - target: < 100ms
  const fid = metrics.get('fid') || 0;
  if (fid > 300) score -= 25;
  else if (fid > 100) score -= 15;
  else if (fid > 50) score -= 5;

  // CLS (Cumulative Layout Shift) - target: < 0.1
  const cls = metrics.get('cls') || 0;
  if (cls > 0.25) score -= 25;
  else if (cls > 0.1) score -= 15;
  else if (cls > 0.05) score -= 5;

  // FCP (First Contentful Paint) - target: < 1.8s
  const fcp = metrics.get('fcp') || 0;
  if (fcp > 3000) score -= 10;
  else if (fcp > 1800) score -= 5;

  // TTFB (Time to First Byte) - target: < 800ms
  const ttfb = metrics.get('ttfb') || 0;
  if (ttfb > 1500) score -= 10;
  else if (ttfb > 800) score -= 5;

  return Math.max(0, score);
}

/**
 * Get performance trends over time
 */
export async function getPerformanceTrends(
  websiteId?: string,
  days: number = 7
): Promise<Array<{ date: string; score: number; metrics: number }>> {
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const metrics = await getMetricsForWebsite(websiteId, 10000);
  const filteredMetrics = metrics.filter(m => m.timestamp >= cutoffTime);

  // Group by date
  const byDate = new Map<string, PerformanceMetric[]>();
  filteredMetrics.forEach(metric => {
    const date = new Date(metric.timestamp).toISOString().split('T')[0];
    if (!byDate.has(date)) {
      byDate.set(date, []);
    }
    byDate.get(date)!.push(metric);
  });

  // Calculate daily scores
  return Array.from(byDate.entries())
    .map(([date, dayMetrics]) => {
      const metricMap = new Map(
        dayMetrics.map(m => [m.name.toLowerCase(), m.value])
      );
      const score = calculatePerformanceScore(metricMap);
      return {
        date,
        score,
        metrics: dayMetrics.length,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Check if performance meets targets
 */
export function checkPerformanceTargets(metrics: Map<string, number>): {
  passed: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  const lcp = metrics.get('lcp') || 0;
  if (lcp > 2500) {
    issues.push(`LCP is ${lcp}ms (target: < 2500ms)`);
  }

  const fid = metrics.get('fid') || 0;
  if (fid > 100) {
    issues.push(`FID is ${fid}ms (target: < 100ms)`);
  }

  const cls = metrics.get('cls') || 0;
  if (cls > 0.1) {
    issues.push(`CLS is ${cls} (target: < 0.1)`);
  }

  const fcp = metrics.get('fcp') || 0;
  if (fcp > 1800) {
    issues.push(`FCP is ${fcp}ms (target: < 1800ms)`);
  }

  const ttfb = metrics.get('ttfb') || 0;
  if (ttfb > 800) {
    issues.push(`TTFB is ${ttfb}ms (target: < 800ms)`);
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}

/**
 * Get performance reports for a website
 */
export async function getPerformanceReports(
  websiteId?: string,
  limit: number = 10
): Promise<PerformanceReport[]> {
  if (!db) {
    return [];
  }

  try {
    let query = db.select().from(performanceReports);

    if (websiteId) {
      query = query.where(eq(performanceReports.websiteId, websiteId));
    }

    const reports = await query
      .orderBy(desc(performanceReports.timestamp))
      .limit(limit);

    return reports.map(r => ({
      websiteId: r.websiteId,
      url: r.url,
      timestamp: r.timestamp.getTime(),
      metrics: (r.metrics as PerformanceMetric[]) || [],
      summary: (r.summary as PerformanceReport['summary']) || {},
      scores: (r.scores as PerformanceReport['scores']) || {},
    }));
  } catch (_error) {
    console.error('[Performance Monitoring] Failed to get reports:', _error);
    return [];
  }
}

/**
 * Save a performance report
 */
export async function savePerformanceReport(report: PerformanceReport): Promise<void> {
  if (!db) {
    return;
  }

  try {
    await db.insert(performanceReports).values({
      websiteId: report.websiteId || '',
      url: report.url,
      timestamp: new Date(report.timestamp),
      metrics: report.metrics as Record<string, unknown>,
      summary: report.summary as Record<string, unknown>,
      scores: report.scores as Record<string, unknown>,
    });
  } catch (_error) {
    console.error('[Performance Monitoring] Failed to save report:', _error);
  }
}

