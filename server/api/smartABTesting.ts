/**
 * Smart A/B Testing API Routes
 */

import type { Express, Request, Response } from 'express';
import {
  generateABTestVariations,
  startABTest,
  recordTestResult,
  analyzeTestResults,
  implementWinner,
  getActiveTests,
  getTest,
} from '../services/smartABTesting';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { standardRateLimit } from '../middleware/rateLimiter';

export function registerSmartABTestingRoutes(app: Express): void {
  /**
   * POST /api/ab-testing/generate-variations
   * Generate A/B test variations
   */
  app.post('/api/ab-testing/generate-variations', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { originalHtml, elementSelector, clientInfo, variationCount } = req.body;

      if (!originalHtml || !elementSelector) {
        return res.status(400).json({
          error: 'originalHtml and elementSelector are required',
        });
      }

      const variations = await generateABTestVariations(
        originalHtml,
        elementSelector,
        clientInfo || {},
        variationCount || 3
      );

      res.json({
        success: true,
        variations,
      });
    } catch (error) {
      logError(error, 'SmartABTesting API - GenerateVariations');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/ab-testing/start
   * Start an A/B test
   */
  app.post('/api/ab-testing/start', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { name, elementSelector, originalHtml, variations, clientInfo } = req.body;

      if (!name || !elementSelector || !originalHtml || !variations) {
        return res.status(400).json({
          error: 'name, elementSelector, originalHtml, and variations are required',
        });
      }

      const test = await startABTest(name, elementSelector, originalHtml, variations, clientInfo || {});

      res.json({
        success: true,
        test,
      });
    } catch (error) {
      logError(error, 'SmartABTesting API - StartTest');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/ab-testing/record-result
   * Record a test result
   */
  app.post('/api/ab-testing/record-result', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { testId, variationId, converted } = req.body;

      if (!testId || !variationId || typeof converted !== 'boolean') {
        return res.status(400).json({
          error: 'testId, variationId, and converted are required',
        });
      }

      recordTestResult(testId, variationId, converted);

      res.json({
        success: true,
      });
    } catch (error) {
      logError(error, 'SmartABTesting API - RecordResult');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/ab-testing/analyze
   * Analyze test results
   */
  app.post('/api/ab-testing/analyze', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { testId } = req.body;

      if (!testId) {
        return res.status(400).json({
          error: 'testId is required',
        });
      }

      const results = await analyzeTestResults(testId);

      res.json({
        success: true,
        results,
      });
    } catch (error) {
      logError(error, 'SmartABTesting API - AnalyzeResults');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/ab-testing/implement-winner
   * Implement winning variation
   */
  app.post('/api/ab-testing/implement-winner', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { testId, originalHtml } = req.body;

      if (!testId || !originalHtml) {
        return res.status(400).json({
          error: 'testId and originalHtml are required',
        });
      }

      const updatedHtml = await implementWinner(testId, originalHtml);

      res.json({
        success: true,
        html: updatedHtml,
      });
    } catch (error) {
      logError(error, 'SmartABTesting API - ImplementWinner');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * GET /api/ab-testing/active
   * Get active tests
   */
  app.get('/api/ab-testing/active', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const tests = getActiveTests();

      res.json({
        success: true,
        tests,
      });
    } catch (error) {
      logError(error, 'SmartABTesting API - GetActiveTests');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * GET /api/ab-testing/:testId
   * Get test by ID
   */
  app.get('/api/ab-testing/:testId', standardRateLimit(), async (req: Request, res: Response) => {
    try {
      const { testId } = req.params;
      const test = getTest(testId);

      if (!test) {
        return res.status(404).json({
          error: 'Test not found',
        });
      }

      res.json({
        success: true,
        test,
      });
    } catch (error) {
      logError(error, 'SmartABTesting API - GetTest');
      res.status(500).json({
        error: getErrorMessage(error),
      });
    }
  });
}

