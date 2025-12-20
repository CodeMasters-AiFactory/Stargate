/**
 * Template Manager API
 * 
 * Endpoints for managing template processing and updates
 */

import type { Express } from 'express';
import {
  processNewTemplate,
  verifyTemplate,
  updateTemplate,
  checkTemplateForChanges,
} from '../services/templateManager';
import {
  checkAllTemplates,
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
} from '../services/templateUpdateScheduler';
import { db } from '../db';
import { templateUpdateLogs } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { getErrorMessage, logError } from '../utils/errorHandler';

export function registerTemplateManagerRoutes(app: Express) {
  /**
   * Process a single template
   * POST /api/template-manager/process/:id
   */
  app.post('/api/template-manager/process/:id', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`[TemplateManager API] Processing template: ${id}`);

      const result = await processNewTemplate(id);

      res.json({
        success: result.success,
        result,
      });
    } catch (error) {
      logError(error, 'TemplateManager API - Process');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Run monthly check now (manual trigger)
   * POST /api/template-manager/check-all
   */
  app.post('/api/template-manager/check-all', async (req, res) => {
    try {
      console.log('[TemplateManager API] Running manual check-all...');

      const result = await checkAllTemplates();

      res.json({
        success: result.errors.length === 0,
        result,
      });
    } catch (error) {
      logError(error, 'TemplateManager API - Check All');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Force update a template
   * POST /api/template-manager/update/:id
   */
  app.post('/api/template-manager/update/:id', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`[TemplateManager API] Force updating template: ${id}`);

      const result = await updateTemplate(id);

      res.json({
        success: result.success,
        result,
      });
    } catch (error) {
      logError(error, 'TemplateManager API - Update');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Check if template source has changed
   * GET /api/template-manager/check/:id
   */
  app.get('/api/template-manager/check/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const result = await checkTemplateForChanges(id);

      res.json({
        success: true,
        result,
      });
    } catch (error) {
      logError(error, 'TemplateManager API - Check Changes');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Verify template renders correctly
   * GET /api/template-manager/verify/:id
   */
  app.get('/api/template-manager/verify/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const isValid = await verifyTemplate(id);

      res.json({
        success: true,
        isValid,
      });
    } catch (error) {
      logError(error, 'TemplateManager API - Verify');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Get scheduler status
   * GET /api/template-manager/status
   */
  app.get('/api/template-manager/status', async (req, res) => {
    try {
      const status = await getSchedulerStatus();

      res.json({
        success: true,
        status,
      });
    } catch (error) {
      logError(error, 'TemplateManager API - Status');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Get update logs
   * GET /api/template-manager/logs
   */
  app.get('/api/template-manager/logs', async (req, res) => {
    try {
      const { templateId, limit = 100 } = req.query;

      if (!db) {
        throw new Error('Database not available');
      }

      let query = db.select().from(templateUpdateLogs);

      if (templateId) {
        query = query.where(eq(templateUpdateLogs.templateId, templateId as string)) as any;
      }

      const logs = await query
        .orderBy(desc(templateUpdateLogs.createdAt))
        .limit(Number(limit));

      res.json({
        success: true,
        logs,
      });
    } catch (error) {
      logError(error, 'TemplateManager API - Logs');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });
}

