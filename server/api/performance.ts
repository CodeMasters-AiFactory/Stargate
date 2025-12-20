/**
 * Performance API Routes
 * Phase 4.1: Performance Optimization
 */

import { Router, type Express } from 'express';
import {
  recordMetric,
  getMetricsForWebsite,
  generatePerformanceReport,
  getPerformanceTrends,
  checkPerformanceTargets,
  getPerformanceReports,
} from '../services/performanceMonitoring';
import { optimizePerformance } from '../services/performanceOptimizer';
import { debugLog } from '../utils/debugLogger';

const router = Router();

/**
 * Record a performance metric
 * POST /api/performance/metrics
 */
router.post('/metrics', async (req, res) => {
  try {
    const { name, value, rating, url, websiteId } = req.body;

    if (!name || typeof value !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid metric data. Required: name (string), value (number)',
      });
    }

    await recordMetric({
      name,
      value,
      rating: rating || (value < 100 ? 'good' : value < 200 ? 'needs-improvement' : 'poor'),
      timestamp: Date.now(),
      url: url || req.headers.referer || '',
      websiteId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error recording performance metric:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record metric',
    });
  }
});

/**
 * Get performance metrics for a website
 * GET /api/performance/metrics?websiteId=xxx&limit=100
 */
router.get('/metrics', async (req, res) => {
  try {
    const websiteId = req.query.websiteId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 100;

    const metrics = await getMetricsForWebsite(websiteId, limit);

    res.json({
      success: true,
      metrics,
      count: metrics.length,
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch metrics',
    });
  }
});

/**
 * Get performance report
 * GET /api/performance/report?websiteId=xxx&url=xxx
 */
router.get('/report', async (req, res) => {
  try {
    const websiteId = req.query.websiteId as string | undefined;
    const url = req.query.url as string | undefined;

    const report = await generatePerformanceReport(websiteId, url);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'No performance data available',
      });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Error generating performance report:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate report',
    });
  }
});

/**
 * Get performance trends
 * GET /api/performance/trends?websiteId=xxx&days=7
 */
router.get('/trends', async (req, res) => {
  try {
    const websiteId = req.query.websiteId as string | undefined;
    const days = parseInt(req.query.days as string) || 7;

    const trends = await getPerformanceTrends(websiteId, days);

    res.json({
      success: true,
      trends,
      count: trends.length,
    });
  } catch (error) {
    console.error('Error fetching performance trends:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch trends',
    });
  }
});

/**
 * Check performance targets
 * POST /api/performance/check-targets
 */
router.post('/check-targets', async (req, res) => {
  try {
    const { metrics } = req.body;

    if (!metrics || typeof metrics !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid metrics data',
      });
    }

    const metricMap = new Map<string, number>(
      Object.entries(metrics).map(([key, value]) => [
        key.toLowerCase(),
        typeof value === 'number' ? value : parseFloat(String(value)) || 0,
      ])
    );

    const result = checkPerformanceTargets(metricMap);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error checking performance targets:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check targets',
    });
  }
});

/**
 * Register performance API routes
 */
export function registerPerformanceRoutes(app: Express): void {
  // #region agent log
  debugLog({ location: 'server/api/performance.ts:174', message: 'registerPerformanceRoutes executing', data: { hasApp: !!app, hasRouter: !!router }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' });
  // #endregion
  app.use('/api/performance', router);

  // Additional endpoints for enhanced performance dashboard
  app.get('/api/performance/reports/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const { limit } = req.query;
      const reports = await getPerformanceReports(websiteId, limit ? parseInt(limit as string) : 10);

      res.json({
        success: true,
        reports,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get performance reports',
      });
    }
  });

  /**
   * Auto-optimize website
   * POST /api/performance/optimize
   */
  router.post('/optimize', async (req, res) => {
    try {
      const { html, css } = req.body;

      if (!html || !css) {
        return res.status(400).json({
          success: false,
          error: 'HTML and CSS are required',
        });
      }

      const result = await optimizePerformance(html, css);

      res.json({
        success: true,
        optimized: {
          html: result.html,
          css: result.css,
        },
        optimizations: result.optimizations,
        estimatedLoadTime: result.estimatedLoadTime,
        lighthouseScore: result.lighthouseScore,
      });
    } catch (error) {
      console.error('Error optimizing performance:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to optimize',
      });
    }
  });

  // #region agent log
  debugLog({ location: 'server/api/performance.ts:177', message: 'registerPerformanceRoutes complete', data: { success: true }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' });
  // #endregion
}

export default router;
