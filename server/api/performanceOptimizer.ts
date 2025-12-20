/**
 * Performance Optimizer API Routes
 */

import type { Express, Request, Response } from 'express';
import { optimizePerformance } from '../services/performanceOptimizer';
import { getErrorMessage, logError } from '../utils/errorHandler';

export function registerPerformanceOptimizerRoutes(app: Express) {
  /**
   * POST /api/performance/optimize
   * Optimize website performance
   */
  app.post('/api/performance/optimize', async (req: Request, res: Response) => {
    try {
      const { html, css } = req.body;

      if (!html || !css) {
        return res.status(400).json({ error: 'html and css are required' });
      }

      const optimization = await optimizePerformance(html, css);

      res.json({
        success: true,
        ...optimization,
      });
    } catch (error) {
      logError(error, 'PerformanceOptimizer API - Optimize');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });
}

