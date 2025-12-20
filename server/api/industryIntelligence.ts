/**
 * Industry Intelligence API Routes
 */

import type { Express, Request, Response } from 'express';
import { getComplianceRequirements, getIndustryWidgets, checkCompliance } from '../services/industryIntelligence';
import { getErrorMessage, logError } from '../utils/errorHandler';

export function registerIndustryIntelligenceRoutes(app: Express) {
  /**
   * GET /api/industry/compliance/:industry
   * Get compliance requirements for industry
   */
  app.get('/api/industry/compliance/:industry', async (req: Request, res: Response) => {
    try {
      const { industry } = req.params;
      const requirements = getComplianceRequirements(industry);

      res.json({
        success: true,
        industry,
        requirements,
      });
    } catch (error) {
      logError(error, 'IndustryIntelligence API - GetCompliance');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * GET /api/industry/widgets/:industry
   * Get industry-specific widgets
   */
  app.get('/api/industry/widgets/:industry', async (req: Request, res: Response) => {
    try {
      const { industry } = req.params;
      const widgets = getIndustryWidgets(industry);

      res.json({
        success: true,
        industry,
        widgets,
      });
    } catch (error) {
      logError(error, 'IndustryIntelligence API - GetWidgets');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/industry/compliance/check
   * Check website compliance
   */
  app.post('/api/industry/compliance/check', async (req: Request, res: Response) => {
    try {
      const { html, industry } = req.body;

      if (!html || !industry) {
        return res.status(400).json({ error: 'html and industry are required' });
      }

      const result = checkCompliance(html, industry);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      logError(error, 'IndustryIntelligence API - CheckCompliance');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });
}

