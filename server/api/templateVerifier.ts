/**
 * Template Verifier API
 * Endpoints for verifying templates
 */

import type { Express } from 'express';
import { verifyTemplate, verifyAllTemplates, printVerificationReport } from '../services/templateVerifier';
import { getErrorMessage, logError } from '../utils/errorHandler';

export function registerTemplateVerifierRoutes(app: Express) {
  /**
   * Verify a single template
   * GET /api/template-verifier/verify/:templateId
   */
  app.get('/api/template-verifier/verify/:templateId', async (req, res) => {
    try {
      const { templateId } = req.params;
      const result = await verifyTemplate(templateId);
      const report = printVerificationReport(result);
      
      console.log(report);
      
      res.json({
        success: true,
        result,
        report,
      });
    } catch (error) {
      logError(error, 'TemplateVerifier API - verify');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Verify all templates
   * GET /api/template-verifier/verify-all
   */
  app.get('/api/template-verifier/verify-all', async (req, res) => {
    try {
      const results = await verifyAllTemplates();
      
      const summary = {
        total: results.length,
        approved: results.filter(r => r.status === 'APPROVED').length,
        warning: results.filter(r => r.status === 'WARNING').length,
        failed: results.filter(r => r.status === 'FAILED').length,
      };
      
      res.json({
        success: true,
        summary,
        results,
      });
    } catch (error) {
      logError(error, 'TemplateVerifier API - verify-all');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });
}

