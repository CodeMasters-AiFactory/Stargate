/**
 * Template Dependency Checker API
 * 
 * Endpoints:
 * - POST /api/templates/check-dependencies - Check selected templates
 * - GET /api/templates/dependency-inventory - Get full inventory
 * - POST /api/templates/check-all - Check all templates
 */

import type { Express, Request, Response } from 'express';
import {
  checkAllTemplates,
  checkTemplates,
  getCurrentDependencyInventory,
} from '../services/templateDependencyChecker';
import { getErrorMessage, logError } from '../utils/errorHandler';

export function registerTemplateDependencyCheckerRoutes(app: Express) {
  /**
   * Check dependencies for specific templates
   * POST /api/templates/check-dependencies
   * Body: { templateIds: string[] }
   */
  app.post('/api/templates/check-dependencies', async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateIds } = req.body;

      if (!Array.isArray(templateIds) || templateIds.length === 0) {
        res.status(400).json({
          success: false,
          error: 'templateIds must be a non-empty array',
        });
        return;
      }

      console.log(`[DependencyChecker] Checking ${templateIds.length} templates...`);

      const results = await checkTemplates(templateIds);

      res.json({
        success: true,
        checked: results.length,
        results,
      });
    } catch (error) {
      logError(error, 'DependencyChecker API');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Get dependency inventory (all templates analyzed)
   * GET /api/templates/dependency-inventory
   */
  app.get('/api/templates/dependency-inventory', async (_req: Request, res: Response): Promise<void> => {
    try {
      console.log('[DependencyChecker] Building dependency inventory...');
      const inventory = await checkAllTemplates();

      res.json({
        success: true,
        inventory,
      });
    } catch (error) {
      logError(error, 'DependencyChecker API - Inventory');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Check all templates (force refresh)
   * POST /api/templates/check-all
   */
  app.post('/api/templates/check-all', async (_req: Request, res: Response): Promise<void> => {
    try {
      console.log('[DependencyChecker] Checking ALL templates...');
      const inventory = await checkAllTemplates();

      res.json({
        success: true,
        message: `Checked ${inventory.checkedTemplates}/${inventory.totalTemplates} templates`,
        inventory,
      });
    } catch (error) {
      logError(error, 'DependencyChecker API - Check All');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Get current dependency inventory (what we have available)
   * GET /api/templates/current-dependencies
   */
  app.get('/api/templates/current-dependencies', async (_req: Request, res: Response): Promise<void> => {
    try {
      const current = await getCurrentDependencyInventory();

      res.json({
        success: true,
        current,
      });
    } catch (error) {
      logError(error, 'DependencyChecker API - Current Dependencies');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Inject dependencies into specific templates
   * POST /api/templates/inject-dependencies
   * Body: { templateIds: string[] }
   */
  app.post('/api/templates/inject-dependencies', async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateIds } = req.body;

      if (!Array.isArray(templateIds) || templateIds.length === 0) {
        res.status(400).json({
          success: false,
          error: 'templateIds must be a non-empty array',
        });
        return;
      }

      console.log(`[DependencyInjector] Injecting dependencies into ${templateIds.length} templates...`);

      const { injectDependencies } = await import('../services/templateDependencyInjector');
      const { db } = await import('../db');
      const { brandTemplates } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');

      if (!db) {
        res.status(500).json({
          success: false,
          error: 'Database not available',
        });
        return;
      }

      const results: Array<{ templateId: string; success: boolean; error?: string }> = [];

      for (const templateId of templateIds) {
        try {
          // Get template from database
          const [template] = await db
            .select()
            .from(brandTemplates)
            .where(eq(brandTemplates.id, templateId))
            .limit(1);

          if (!template) {
            results.push({
              templateId,
              success: false,
              error: 'Template not found',
            });
            continue;
          }

          // Get HTML from contentData
          const contentData = (template.contentData as any) || {};
          const html = contentData.html || '';

          if (!html) {
            results.push({
              templateId,
              success: false,
              error: 'Template has no HTML content',
            });
            continue;
          }

          // Inject dependencies
          const injectedHTML = injectDependencies(html);

          // Update template in database
          await db
            .update(brandTemplates)
            .set({
              contentData: {
                ...contentData,
                html: injectedHTML,
              } as any,
              updatedAt: new Date(),
            })
            .where(eq(brandTemplates.id, templateId));

          results.push({
            templateId,
            success: true,
          });

          console.log(`[DependencyInjector] ✅ Injected dependencies into template: ${templateId}`);
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          console.error(`[DependencyInjector] Error injecting into ${templateId}:`, errorMessage);
          results.push({
            templateId,
            success: false,
            error: errorMessage,
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      res.json({
        success: true,
        message: `Injected dependencies into ${successCount}/${templateIds.length} templates`,
        injected: successCount,
        failed: failCount,
        results,
      });
    } catch (error) {
      logError(error, 'DependencyInjector API');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });
}

