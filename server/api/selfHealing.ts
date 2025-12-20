/**
 * Self-Healing Website API Routes
 */

import type { Express, Request, Response } from 'express';
import {
  checkWebsiteHealth,
  autoFixWebsite,
  monitorWebsiteHealth,
} from '../services/selfHealingWebsite';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { standardRateLimit } from '../middleware/rateLimiter';

export function registerSelfHealingRoutes(app: Express): void {
  /**
   * POST /api/self-healing/check-health
   * Check website health
   */
  app.post('/api/self-healing/check-health', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { websiteId, html, baseUrl } = req.body;

      if (!websiteId || !html || !baseUrl) {
        return res.status(400).json({
          error: 'websiteId, html, and baseUrl are required',
        });
      }

      const report = await checkWebsiteHealth(websiteId, html, baseUrl);

      res.json({
        success: true,
        report,
      });
    } catch (error) {
      logError(error, 'SelfHealing API - CheckHealth');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/self-healing/auto-fix
   * Auto-fix website issues
   */
  app.post('/api/self-healing/auto-fix', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { websiteId, html, baseUrl } = req.body;

      if (!websiteId || !html || !baseUrl) {
        return res.status(400).json({
          error: 'websiteId, html, and baseUrl are required',
        });
      }

      const result = await autoFixWebsite(websiteId, html, baseUrl);

      res.json({
        success: true,
        html: result.html,
        fixesApplied: result.fixesApplied,
      });
    } catch (error) {
      logError(error, 'SelfHealing API - AutoFix');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/self-healing/monitor
   * Start health monitoring
   */
  app.post('/api/self-healing/monitor', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { websiteId, url, intervalMinutes } = req.body;

      if (!websiteId || !url) {
        return res.status(400).json({
          error: 'websiteId and url are required',
        });
      }

      await monitorWebsiteHealth(websiteId, url, intervalMinutes || 60);

      res.json({
        success: true,
        message: 'Health monitoring started',
      });
    } catch (error) {
      logError(error, 'SelfHealing API - Monitor');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });
}

