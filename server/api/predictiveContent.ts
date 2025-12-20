/**
 * Predictive Content Generator API Routes
 */

import type { Express, Request, Response } from 'express';
import {
  predictContentNeeds,
  analyzeContentGaps,
  predictContentPerformance,
  generateContentSuggestions,
} from '../services/predictiveContentGenerator';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { standardRateLimit } from '../middleware/rateLimiter';

export function registerPredictiveContentRoutes(app: Express): void {
  /**
   * POST /api/predictive-content/predict-needs
   * Predict content needs for a business
   */
  app.post('/api/predictive-content/predict-needs', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { industry, businessInfo } = req.body;

      if (!industry || !businessInfo) {
        return res.status(400).json({
          error: 'industry and businessInfo are required',
        });
      }

      const predictions = await predictContentNeeds(industry, businessInfo);

      res.json({
        success: true,
        predictions,
      });
    } catch (error) {
      logError(error, 'PredictiveContent API - PredictNeeds');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/predictive-content/analyze-gaps
   * Analyze content gaps in existing website
   */
  app.post('/api/predictive-content/analyze-gaps', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { html, industry, businessInfo } = req.body;

      if (!html || !industry) {
        return res.status(400).json({
          error: 'html and industry are required',
        });
      }

      const gaps = await analyzeContentGaps(html, industry, businessInfo || {});

      res.json({
        success: true,
        gaps,
      });
    } catch (error) {
      logError(error, 'PredictiveContent API - AnalyzeGaps');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/predictive-content/predict-performance
   * Predict content performance before publishing
   */
  app.post('/api/predictive-content/predict-performance', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { content, contentType, industry, targetAudience } = req.body;

      if (!content || !contentType || !industry) {
        return res.status(400).json({
          error: 'content, contentType, and industry are required',
        });
      }

      const prediction = await predictContentPerformance(
        content,
        contentType,
        industry,
        targetAudience || 'General audience'
      );

      res.json({
        success: true,
        prediction,
      });
    } catch (error) {
      logError(error, 'PredictiveContent API - PredictPerformance');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/predictive-content/generate-suggestions
   * Generate content suggestions
   */
  app.post('/api/predictive-content/generate-suggestions', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { industry, businessInfo, contentType, count } = req.body;

      if (!industry || !businessInfo || !contentType) {
        return res.status(400).json({
          error: 'industry, businessInfo, and contentType are required',
        });
      }

      const suggestions = await generateContentSuggestions(
        industry,
        businessInfo,
        contentType,
        count || 3
      );

      res.json({
        success: true,
        suggestions,
      });
    } catch (error) {
      logError(error, 'PredictiveContent API - GenerateSuggestions');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });
}

