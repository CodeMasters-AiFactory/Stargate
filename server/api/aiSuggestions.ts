/**
 * AI Content Suggestions API Routes
 * AI-powered content and design recommendations
 */

import type { Express } from 'express';
import { aiContentSuggestionsService } from '../services/aiContentSuggestions';

export function registerAISuggestionsRoutes(app: Express) {
  // Generate content suggestions
  app.post('/api/ai-suggestions/content', async (req, res) => {
    try {
      const { websiteId, currentContent, context } = req.body;

      if (!websiteId || !currentContent || !context) {
        return res.status(400).json({
          success: false,
          error: 'websiteId, currentContent, and context are required',
        });
      }

      const suggestions = await aiContentSuggestionsService.generateContentSuggestions(
        websiteId,
        currentContent,
        context
      );

      res.json({
        success: true,
        suggestions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate content suggestions',
      });
    }
  });

  // Generate design suggestions
  app.post('/api/ai-suggestions/design', async (req, res) => {
    try {
      const { websiteId, currentDesign, industry } = req.body;

      if (!websiteId || !currentDesign || !industry) {
        return res.status(400).json({
          success: false,
          error: 'websiteId, currentDesign, and industry are required',
        });
      }

      const suggestions = await aiContentSuggestionsService.generateDesignSuggestions(
        websiteId,
        currentDesign,
        industry
      );

      res.json({
        success: true,
        suggestions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate design suggestions',
      });
    }
  });

  // Generate optimization tips
  app.post('/api/ai-suggestions/tips', async (req, res) => {
    try {
      const { websiteId, analytics } = req.body;

      if (!websiteId || !analytics) {
        return res.status(400).json({
          success: false,
          error: 'websiteId and analytics are required',
        });
      }

      const tips = await aiContentSuggestionsService.generateOptimizationTips(
        websiteId,
        analytics
      );

      res.json({
        success: true,
        tips,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate optimization tips',
      });
    }
  });
}

