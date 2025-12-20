/**
 * AI Optimization API Routes
 * Automatic A/B testing, conversion optimization, and AI-driven improvements
 */

import type { Express } from 'express';
import { aiOptimizationService } from '../services/aiOptimization';
import { predictiveAnalyticsService } from '../services/predictiveAnalytics';

export function registerAIOptimizationRoutes(app: Express) {
  // ============================================
  // A/B TESTING
  // ============================================

  // Generate A/B test variants
  app.post('/api/optimization/ab-test/generate-variants', async (req, res) => {
    try {
      const { elementSelector, currentContent, count } = req.body;

      if (!elementSelector || !currentContent) {
        return res.status(400).json({
          success: false,
          error: 'elementSelector and currentContent are required',
        });
      }

      const variants = await aiOptimizationService.generateABTestVariants(
        elementSelector,
        currentContent,
        count || 3
      );

      res.json({
        success: true,
        variants,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate variants',
      });
    }
  });

  // Create A/B test
  app.post('/api/optimization/ab-test', async (req, res) => {
    try {
      const { websiteId, name, elementSelector, variants } = req.body;

      if (!websiteId || !name || !elementSelector || !variants) {
        return res.status(400).json({
          success: false,
          error: 'websiteId, name, elementSelector, and variants are required',
        });
      }

      const testId = await aiOptimizationService.createABTest(
        websiteId,
        name,
        elementSelector,
        variants
      );

      res.json({
        success: true,
        testId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create A/B test',
      });
    }
  });

  // Analyze A/B test results
  app.get('/api/optimization/ab-test/:testId/analyze', async (req, res) => {
    try {
      const { testId } = req.params;
      const analysis = await aiOptimizationService.analyzeABTestResults(testId);

      res.json({
        success: true,
        analysis,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze A/B test',
      });
    }
  });

  // ============================================
  // OPTIMIZATION SUGGESTIONS
  // ============================================

  // Get optimization suggestions
  app.post('/api/optimization/suggestions', async (req, res) => {
    try {
      const { websiteId, analytics } = req.body;

      if (!websiteId || !analytics) {
        return res.status(400).json({
          success: false,
          error: 'websiteId and analytics are required',
        });
      }

      const suggestions = await aiOptimizationService.generateOptimizationSuggestions(
        websiteId,
        analytics
      );

      res.json({
        success: true,
        suggestions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate suggestions',
      });
    }
  });

  // Optimize color scheme
  app.post('/api/optimization/colors', async (req, res) => {
    try {
      const { currentColors, industry } = req.body;

      if (!currentColors || !industry) {
        return res.status(400).json({
          success: false,
          error: 'currentColors and industry are required',
        });
      }

      const optimized = await aiOptimizationService.optimizeColorScheme(
        currentColors,
        industry
      );

      res.json({
        success: true,
        colors: optimized,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to optimize colors',
      });
    }
  });

  // Optimize layout
  app.post('/api/optimization/layout', async (req, res) => {
    try {
      const { currentLayout, analytics } = req.body;

      if (!currentLayout || !analytics) {
        return res.status(400).json({
          success: false,
          error: 'currentLayout and analytics are required',
        });
      }

      const optimized = await aiOptimizationService.optimizeLayout(
        currentLayout,
        analytics
      );

      res.json({
        success: true,
        layout: optimized,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to optimize layout',
      });
    }
  });

  // ============================================
  // CONVERSION FUNNELS
  // ============================================

  // Create conversion funnel
  app.post('/api/optimization/funnels', async (req, res) => {
    try {
      const { websiteId, name, steps } = req.body;

      if (!websiteId || !name || !steps) {
        return res.status(400).json({
          success: false,
          error: 'websiteId, name, and steps are required',
        });
      }

      const funnelId = await aiOptimizationService.createConversionFunnel(
        websiteId,
        name,
        steps
      );

      res.json({
        success: true,
        funnelId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create funnel',
      });
    }
  });

  // Analyze funnel
  app.get('/api/optimization/funnels/:funnelId', async (req, res) => {
    try {
      const { funnelId } = req.params;
      const funnel = await aiOptimizationService.analyzeFunnel(funnelId);

      if (!funnel) {
        return res.status(404).json({
          success: false,
          error: 'Funnel not found',
        });
      }

      res.json({
        success: true,
        funnel,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze funnel',
      });
    }
  });

  // ============================================
  // PREDICTIVE ANALYTICS
  // ============================================

  // Predict visitor behavior
  app.post('/api/analytics/predict/visitor', async (req, res) => {
    try {
      const { websiteId, visitorData } = req.body;

      if (!websiteId || !visitorData) {
        return res.status(400).json({
          success: false,
          error: 'websiteId and visitorData are required',
        });
      }

      const prediction = await predictiveAnalyticsService.predictVisitorBehavior(
        websiteId,
        visitorData
      );

      res.json({
        success: true,
        prediction,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to predict visitor behavior',
      });
    }
  });

  // Predict conversion
  app.post('/api/analytics/predict/conversion', async (req, res) => {
    try {
      const { websiteId, sessionId } = req.body;

      if (!websiteId || !sessionId) {
        return res.status(400).json({
          success: false,
          error: 'websiteId and sessionId are required',
        });
      }

      const prediction = await predictiveAnalyticsService.predictConversion(
        websiteId,
        sessionId
      );

      res.json({
        success: true,
        prediction,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to predict conversion',
      });
    }
  });

  // Analyze trends
  app.get('/api/analytics/trends/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const { metric, days } = req.query;

      const trends = await predictiveAnalyticsService.analyzeTrends(
        websiteId,
        (metric as any) || 'pageviews',
        days ? parseInt(days as string) : 30
      );

      res.json({
        success: true,
        trends,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze trends',
      });
    }
  });

  // Get recommendations
  app.post('/api/analytics/recommendations', async (req, res) => {
    try {
      const { websiteId, analytics } = req.body;

      if (!websiteId || !analytics) {
        return res.status(400).json({
          success: false,
          error: 'websiteId and analytics are required',
        });
      }

      const recommendations = await predictiveAnalyticsService.generateRecommendations(
        websiteId,
        analytics
      );

      res.json({
        success: true,
        recommendations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate recommendations',
      });
    }
  });
}

