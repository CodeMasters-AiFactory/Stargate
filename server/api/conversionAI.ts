/**
 * Conversion AI API Routes
 */

import type { Express, Request, Response } from 'express';
import { predictHeatmap, generateABTestVariations, analyzeConversion } from '../services/conversionAI';
import { getErrorMessage, logError } from '../utils/errorHandler';

export function registerConversionAIRoutes(app: Express) {
  /**
   * POST /api/conversion/heatmap
   * Predict heatmap for a page
   */
  app.post('/api/conversion/heatmap', async (req: Request, res: Response) => {
    try {
      const { html, pageType } = req.body;

      if (!html) {
        return res.status(400).json({ error: 'html is required' });
      }

      const heatmap = await predictHeatmap(html, pageType || 'landing');

      res.json({
        success: true,
        heatmap,
      });
    } catch (error) {
      logError(error, 'ConversionAI API - Heatmap');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/conversion/ab-test
   * Generate A/B test variations
   */
  app.post('/api/conversion/ab-test', async (req: Request, res: Response) => {
    try {
      const { html, elementSelector, count } = req.body;

      if (!html || !elementSelector) {
        return res.status(400).json({ error: 'html and elementSelector are required' });
      }

      const variations = await generateABTestVariations(html, elementSelector, count || 5);

      res.json({
        success: true,
        variations,
      });
    } catch (error) {
      logError(error, 'ConversionAI API - ABTest');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/conversion/analyze
   * Full conversion analysis
   */
  app.post('/api/conversion/analyze', async (req: Request, res: Response) => {
    try {
      const { html, industry } = req.body;

      if (!html || !industry) {
        return res.status(400).json({ error: 'html and industry are required' });
      }

      const analysis = await analyzeConversion(html, industry);

      res.json({
        success: true,
        analysis,
      });
    } catch (error) {
      logError(error, 'ConversionAI API - Analyze');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });
}

