/**
 * AI Marketplace API Routes
 */

import type { Express, Request, Response } from 'express';
import {
  listFeatures,
  getFeature,
  registerFeature,
  integrateFeature,
  getWebsiteIntegrations,
  updateIntegrationStatus,
  searchFeatures,
} from '../services/aiMarketplace';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { standardRateLimit } from '../middleware/rateLimiter';

export function registerAIMarketplaceRoutes(app: Express): void {
  /**
   * GET /api/marketplace/features
   * List all marketplace features
   */
  app.get('/api/marketplace/features', standardRateLimit(), async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        provider: req.query.provider as string | undefined,
        status: req.query.status as string | undefined,
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      };

      const features = listFeatures(filters);

      res.json({
        success: true,
        features,
        count: features.length,
      });
    } catch (_error: unknown) {
      logError(_error, 'AIMarketplace API - ListFeatures');
      res.status(500).json({
        error: getErrorMessage(_error),
      });
    }
  });

  /**
   * GET /api/marketplace/features/search
   * Search features
   */
  app.get('/api/marketplace/features/search', standardRateLimit(), async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query.q as string;

      if (!query) {
        res.status(400).json({
          error: 'Query parameter "q" is required',
        });
        return;
      }

      const features = searchFeatures(query);

      res.json({
        success: true,
        features,
        count: features.length,
      });
    } catch (_error: unknown) {
      logError(_error, 'AIMarketplace API - SearchFeatures');
      res.status(500).json({
        error: getErrorMessage(_error),
      });
    }
  });

  /**
   * GET /api/marketplace/features/:featureId
   * Get feature by ID
   */
  app.get('/api/marketplace/features/:featureId', standardRateLimit(), async (req: Request, res: Response): Promise<void> => {
    try {
      const { featureId } = req.params;
      const feature = getFeature(featureId);

      if (!feature) {
        res.status(404).json({
          error: 'Feature not found',
        });
        return;
      }

      res.json({
        success: true,
        feature,
      });
    } catch (_error: unknown) {
      logError(_error, 'AIMarketplace API - GetFeature');
      res.status(500).json({
        error: getErrorMessage(_error),
      });
    }
  });

  /**
   * POST /api/marketplace/features/register
   * Register a third-party feature
   */
  app.post('/api/marketplace/features/register', standardRateLimit(), async (req: Request, res: Response): Promise<void> => {
    try {
      const feature = req.body as Record<string, unknown>;

      if (!feature.name || !feature.description || !feature.category) {
        res.status(400).json({
          error: 'name, description, and category are required',
        });
        return;
      }

      const registeredFeature = await registerFeature(feature);

      res.json({
        success: true,
        feature: registeredFeature,
      });
    } catch (_error: unknown) {
      logError(_error, 'AIMarketplace API - RegisterFeature');
      res.status(500).json({
        error: getErrorMessage(_error),
      });
    }
  });

  /**
   * POST /api/marketplace/integrate
   * Integrate a feature into a website
   */
  app.post('/api/marketplace/integrate', standardRateLimit(), async (req: Request, res: Response): Promise<void> => {
    try {
      const { featureId, websiteId, config } = req.body as Record<string, unknown>;

      if (!featureId || !websiteId) {
        res.status(400).json({
          error: 'featureId and websiteId are required',
        });
        return;
      }

      const integration = await integrateFeature(featureId as string, websiteId as string, (config as Record<string, unknown>) || {});

      res.json({
        success: true,
        integration,
      });
    } catch (_error: unknown) {
      logError(_error, 'AIMarketplace API - IntegrateFeature');
      res.status(500).json({
        error: getErrorMessage(_error),
      });
    }
  });

  /**
   * GET /api/marketplace/integrations/:websiteId
   * Get integrations for a website
   */
  app.get('/api/marketplace/integrations/:websiteId', standardRateLimit(), async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId } = req.params;
      const integrations = getWebsiteIntegrations(websiteId);

      res.json({
        success: true,
        integrations,
        count: integrations.length,
      });
    } catch (_error: unknown) {
      logError(_error, 'AIMarketplace API - GetIntegrations');
      res.status(500).json({
        error: getErrorMessage(_error),
      });
    }
  });

  /**
   * PUT /api/marketplace/integrations/:websiteId/:featureId/status
   * Update integration status
   */
  app.put('/api/marketplace/integrations/:websiteId/:featureId/status', standardRateLimit(), async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId, featureId } = req.params;
      const { status } = req.body as Record<string, unknown>;

      if (!status || !['active', 'paused', 'error'].includes(status as string)) {
        res.status(400).json({
          error: 'status must be one of: active, paused, error',
        });
        return;
      }

      updateIntegrationStatus(websiteId, featureId, status as string);

      res.json({
        success: true,
        message: 'Integration status updated',
      });
    } catch (_error: unknown) {
      logError(_error, 'AIMarketplace API - UpdateIntegrationStatus');
      res.status(500).json({
        error: getErrorMessage(_error),
      });
    }
  });
}

