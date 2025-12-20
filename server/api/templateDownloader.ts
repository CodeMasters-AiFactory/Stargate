/**
 * Template Downloader API Routes
 * Admin-only endpoints for downloading templates from external sources
 */

import type { Express } from 'express';
import { requireAdmin } from '../middleware/permissions';
import {
  downloadTemplateMoTemplates,
  fetchTemplateMoTemplates,
  getDownloadProgress,
  type TemplateInfo,
} from '../services/templateDownloader';
import { getErrorMessage, logError } from '../utils/errorHandler';

export function registerTemplateDownloaderRoutes(app: Express): void {
  /**
   * GET /api/admin/templates/download/progress
   * Get current download progress
   */
  app.get('/api/admin/templates/download/progress', requireAdmin, async (req, res) => {
    try {
      const progress = getDownloadProgress();
      res.json(progress);
    } catch (error) {
      logError(error, 'TemplateDownloader API - getProgress');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * GET /api/admin/templates/download/list
   * Fetch list of available templates from TemplateMo
   */
  app.get('/api/admin/templates/download/list', requireAdmin, async (req, res) => {
    try {
      const templates = await fetchTemplateMoTemplates();
      res.json({ templates, count: templates.length });
    } catch (error) {
      logError(error, 'TemplateDownloader API - fetchList');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/admin/templates/download/templatemo
   * Download templates from TemplateMo
   * Query params: limit (optional) - number of templates to download
   */
  app.post('/api/admin/templates/download/templatemo', requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      
      // Start download in background
      downloadTemplateMoTemplates(limit).catch((error) => {
        logError(error, 'TemplateDownloader API - downloadTemplateMo (background)');
      });
      
      res.json({
        message: 'Download started',
        limit: limit || 'all',
      });
    } catch (error) {
      logError(error, 'TemplateDownloader API - downloadTemplateMo');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });
}

