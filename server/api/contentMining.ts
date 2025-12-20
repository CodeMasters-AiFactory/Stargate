/**
 * Content Mining API Routes
 */

import type { Express, Request, Response } from 'express';
import { analyzeCompetitor, analyzeCompetitors } from '../services/contentMining';
import { getErrorMessage, logError } from '../utils/errorHandler';

export function registerContentMiningRoutes(app: Express) {
  /**
   * POST /api/content-mining/analyze
   * Analyze a single competitor
   */
  app.post('/api/content-mining/analyze', async (req: Request, res: Response) => {
    try {
      const { url, industry } = req.body;

      if (!url || !industry) {
        return res.status(400).json({ error: 'url and industry are required' });
      }

      const analysis = await analyzeCompetitor(url, industry);

      res.json({
        success: true,
        analysis,
      });
    } catch (error) {
      logError(error, 'ContentMining API - Analyze');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/content-mining/analyze-multiple
   * Analyze multiple competitors
   */
  app.post('/api/content-mining/analyze-multiple', async (req: Request, res: Response) => {
    try {
      const { urls, industry } = req.body;

      if (!urls || !Array.isArray(urls) || urls.length === 0 || !industry) {
        return res.status(400).json({ error: 'urls (array) and industry are required' });
      }

      const result = await analyzeCompetitors(urls, industry);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      logError(error, 'ContentMining API - AnalyzeMultiple');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });
}

