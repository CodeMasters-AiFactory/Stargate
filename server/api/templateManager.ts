/**
 * Template Manager API
 *
 * Endpoints for managing template processing and updates
 */

import type { Express, Request, Response } from 'express';
import {
  processNewTemplate,
  verifyTemplate,
  updateTemplate,
  checkTemplateForChanges,
} from '../services/templateManager';
import {
  checkAllTemplates,
  getSchedulerStatus,
} from '../services/templateUpdateScheduler';
import { db } from '../db';
import { templateUpdateLogs } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { getErrorMessage, logError } from '../utils/errorHandler';

export function registerTemplateManagerRoutes(app: Express) {
  /**
   * Process a single template
   * POST /api/template-manager/process/:id
   */
  app.post('/api/template-manager/process/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      console.log(`[TemplateManager API] Processing template: ${id}`);

      const result = await processNewTemplate(id);

      res.json({
        success: result.success,
        result,
      });
    } catch (_error: unknown) {
      logError(_error, 'TemplateManager API - Process');
      res.status(500).json({
        success: false,
        error: getErrorMessage(_error),
      });
    }
  });

  /**
   * Run monthly check now (manual trigger)
   * POST /api/template-manager/check-all
   */
  app.post('/api/template-manager/check-all', async (_req: Request, res: Response): Promise<void> => {
    try {
      console.log('[TemplateManager API] Running manual check-all...');

      const result = await checkAllTemplates();

      res.json({
        success: result.errors.length === 0,
        result,
      });
    } catch (_error: unknown) {
      logError(_error, 'TemplateManager API - Check All');
      res.status(500).json({
        success: false,
        error: getErrorMessage(_error),
      });
    }
  });

  /**
   * Force update a template
   * POST /api/template-manager/update/:id
   */
  app.post('/api/template-manager/update/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      console.log(`[TemplateManager API] Force updating template: ${id}`);

      const result = await updateTemplate(id);

      res.json({
        success: result.success,
        result,
      });
    } catch (_error: unknown) {
      logError(_error, 'TemplateManager API - Update');
      res.status(500).json({
        success: false,
        error: getErrorMessage(_error),
      });
    }
  });

  /**
   * Check if template source has changed
   * GET /api/template-manager/check/:id
   */
  app.get('/api/template-manager/check/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await checkTemplateForChanges(id);

      res.json({
        success: true,
        result,
      });
    } catch (_error: unknown) {
      logError(_error, 'TemplateManager API - Check Changes');
      res.status(500).json({
        success: false,
        error: getErrorMessage(_error),
      });
    }
  });

  /**
   * Verify template renders correctly
   * GET /api/template-manager/verify/:id
   */
  app.get('/api/template-manager/verify/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const isValid = await verifyTemplate(id);

      res.json({
        success: true,
        isValid,
      });
    } catch (_error: unknown) {
      logError(_error, 'TemplateManager API - Verify');
      res.status(500).json({
        success: false,
        error: getErrorMessage(_error),
      });
    }
  });

  /**
   * Get scheduler status
   * GET /api/template-manager/status
   */
  app.get('/api/template-manager/status', async (_req: Request, res: Response): Promise<void> => {
    try {
      const status = await getSchedulerStatus();

      res.json({
        success: true,
        status,
      });
    } catch (_error: unknown) {
      logError(_error, 'TemplateManager API - Status');
      res.status(500).json({
        success: false,
        error: getErrorMessage(_error),
      });
    }
  });

  /**
   * Get update logs
   * GET /api/template-manager/logs
   */
  app.get('/api/template-manager/logs', async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateId, limit = 100 } = req.query;

      if (!db) {
        throw new Error('Database not available');
      }

      let query = db.select().from(templateUpdateLogs);

      if (templateId) {
        query = query.where(eq(templateUpdateLogs.templateId, templateId as string));
      }

      const logs = await query
        .orderBy(desc(templateUpdateLogs.createdAt))
        .limit(Number(limit));

      res.json({
        success: true,
        logs,
      });
    } catch (_error: unknown) {
      logError(_error, 'TemplateManager API - Logs');
      res.status(500).json({
        success: false,
        error: getErrorMessage(_error),
      });
    }
  });
}

