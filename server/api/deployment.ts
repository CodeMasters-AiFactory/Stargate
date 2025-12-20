/**
 * Deployment API Routes - 120% Feature
 * One-click deployment to Vercel and Netlify
 */

import type { Express, Request, Response } from 'express';
import { deployWebsite, type DeploymentConfig } from '../engines/deployEngine';
import { getErrorMessage, logError } from '../utils/errorHandler';

export function registerDeploymentRoutes(app: Express): void {
  /**
   * Deploy website to Vercel
   * POST /api/deployment/vercel
   */
  app.post('/api/deployment/vercel', async (req: Request, res: Response) => {
    try {
      const { projectSlug, siteName, apiKey } = req.body;

      if (!projectSlug) {
        return res.status(400).json({ error: 'projectSlug is required' });
      }

      const config: DeploymentConfig = {
        provider: 'vercel',
        apiKey: apiKey || process.env.VERCEL_API_TOKEN,
        siteName: siteName || `merlin-${projectSlug}`,
      };

      const result = await deployWebsite(projectSlug, config);

      if (result.success) {
        return res.json({
          success: true,
          url: result.url,
          message: result.message,
          summary: result.summary,
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.message,
          summary: result.summary,
        });
      }
    } catch (error: unknown) {
      logError(error, 'Deployment API - Vercel');
      const errorMessage = getErrorMessage(error);
      return res.status(500).json({
        success: false,
        error: errorMessage || 'Failed to deploy to Vercel',
      });
    }
  });

  /**
   * Deploy website to Netlify
   * POST /api/deployment/netlify
   */
  app.post('/api/deployment/netlify', async (req: Request, res: Response) => {
    try {
      const { projectSlug, siteName, apiKey } = req.body;

      if (!projectSlug) {
        return res.status(400).json({ error: 'projectSlug is required' });
      }

      const config: DeploymentConfig = {
        provider: 'netlify',
        apiKey: apiKey || process.env.NETLIFY_API_TOKEN,
        siteName: siteName || `merlin-${projectSlug}`,
      };

      const result = await deployWebsite(projectSlug, config);

      if (result.success) {
        return res.json({
          success: true,
          url: result.url,
          message: result.message,
          summary: result.summary,
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.message,
          summary: result.summary,
        });
      }
    } catch (error: unknown) {
      logError(error, 'Deployment API - Netlify');
      const errorMessage = getErrorMessage(error);
      return res.status(500).json({
        success: false,
        error: errorMessage || 'Failed to deploy to Netlify',
      });
    }
  });

  /**
   * Get deployment status
   * GET /api/deployment/status/:projectSlug
   */
  app.get('/api/deployment/status/:projectSlug', async (req: Request, res: Response) => {
    try {
      const { projectSlug } = req.params;
      // TODO: Implement deployment status tracking
      return res.json({
        projectSlug,
        deployments: [],
        message: 'Deployment status tracking coming soon',
      });
    } catch (error: unknown) {
      logError(error, 'Deployment API - Status');
      const errorMessage = getErrorMessage(error);
      return res.status(500).json({
        error: errorMessage || 'Failed to get deployment status',
      });
    }
  });
}

