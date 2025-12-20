/**
 * Neural Website Designer API Routes
 */

import type { Express, Request, Response } from 'express';
import {
  learnFromUserChoice,
  predictDesignChoices,
  generatePersonalizedDesigns,
  getLearningInsights,
  registerDesignPattern,
} from '../services/neuralWebsiteDesigner';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { standardRateLimit } from '../middleware/rateLimiter';

export function registerNeuralDesignerRoutes(app: Express): void {
  /**
   * POST /api/neural-designer/learn
   * Learn from user design choice
   */
  app.post('/api/neural-designer/learn', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { userId, choice } = req.body;

      if (!userId || !choice) {
        return res.status(400).json({
          error: 'userId and choice are required',
        });
      }

      await learnFromUserChoice(userId, choice);

      res.json({
        success: true,
        message: 'Learning recorded',
      });
    } catch (error) {
      logError(error, 'NeuralDesigner API - Learn');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/neural-designer/predict
   * Predict design choices
   */
  app.post('/api/neural-designer/predict', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { userId, element, context } = req.body;

      if (!userId || !element) {
        return res.status(400).json({
          error: 'userId and element are required',
        });
      }

      const prediction = await predictDesignChoices(userId, element, context || {});

      res.json({
        success: true,
        prediction,
      });
    } catch (error) {
      logError(error, 'NeuralDesigner API - Predict');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/neural-designer/generate-personalized
   * Generate personalized design variations
   */
  app.post('/api/neural-designer/generate-personalized', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { userId, baseDesign, count } = req.body;

      if (!userId || !baseDesign) {
        return res.status(400).json({
          error: 'userId and baseDesign are required',
        });
      }

      const designs = await generatePersonalizedDesigns(userId, baseDesign, count || 3);

      res.json({
        success: true,
        designs,
      });
    } catch (error) {
      logError(error, 'NeuralDesigner API - GeneratePersonalized');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * GET /api/neural-designer/insights/:userId
   * Get learning insights
   */
  app.get('/api/neural-designer/insights/:userId', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const insights = await getLearningInsights(userId);

      res.json({
        success: true,
        insights,
      });
    } catch (error) {
      logError(error, 'NeuralDesigner API - GetInsights');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/neural-designer/register-pattern
   * Register a design pattern
   */
  app.post('/api/neural-designer/register-pattern', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const pattern = req.body;

      if (!pattern.name || !pattern.html || !pattern.css) {
        return res.status(400).json({
          error: 'name, html, and css are required',
        });
      }

      const registeredPattern = await registerDesignPattern(pattern);

      res.json({
        success: true,
        pattern: registeredPattern,
      });
    } catch (error) {
      logError(error, 'NeuralDesigner API - RegisterPattern');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });
}

