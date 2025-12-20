/**
 * Quick Start Generator API Routes
 * Handles AI quick-start website generation
 */

import type { Express } from 'express';
import {
  convertQuickStartToProjectConfig,
  generateWebsiteFromQuickStart,
  type QuickStartData,
} from '../services/aiQuickStartGenerator';
import { generateWebsiteWithLLM } from '../services/merlinDesignLLM';
import { logError } from '../utils/errorHandler';
import { standardRateLimit } from '../middleware/rateLimiter';

export function registerQuickStartRoutes(app: Express) {
  // Generate website from quick start data
  app.post('/api/quick-start/generate', standardRateLimit(), async (req, res) => {
    // Reserved for future performance tracking
    // const startTime = Date.now();
    const GENERATION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes timeout
    let timeoutId: NodeJS.Timeout | null = null;
    let hasCompleted = false;
    let hasError = false;

    // Helper function to safely send SSE messages
    const safeSSEWrite = (data: any) => {
      try {
        if (!hasCompleted && !res.closed && !hasError) {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          res.write(message);
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }
        }
      } catch (err: unknown) {
        logError(err, 'Quick Start - SSE write');
      }
    };

    const safeEnd = () => {
      if (!hasCompleted) {
        hasCompleted = true;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        try {
          if (!res.closed) {
            res.end();
          }
        } catch (err: unknown) {
          logError(err, 'Quick Start - Response end');
        }
      }
    };

    timeoutId = setTimeout(() => {
      if (!hasCompleted) {
        hasError = true;
        safeSSEWrite({
          stage: 'error',
          progress: 0,
          error: 'Generation timed out after 5 minutes.',
          message: 'Generation timed out. Please try again.',
        });
        safeEnd();
      }
    }, GENERATION_TIMEOUT_MS);

    try {
      const quickStartData: QuickStartData = req.body;

      if (!quickStartData.businessName || !quickStartData.industry) {
        hasError = true;
        safeSSEWrite({
          stage: 'error',
          progress: 0,
          error: 'Missing required fields: businessName, industry',
          message: 'Please provide all required information.',
        });
        safeEnd();
        return;
      }

      // Set up SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      // Convert quick start data to project config
      safeSSEWrite({
        stage: 'preparing',
        progress: 5,
        message: 'Preparing your website configuration...',
      });

      // Reserved for future use: projectConfig
      convertQuickStartToProjectConfig(quickStartData);

      // Generate website
      safeSSEWrite({
        stage: 'generating',
        progress: 10,
        message: 'Generating your website with AI...',
      });

      const appInstance = (req as any).app;
      const port = process.env.PORT || 5000;

      const website = await generateWebsiteFromQuickStart(
        quickStartData,
        async (config) => {
          return await generateWebsiteWithLLM(
            config,
            'html',
            3,
            appInstance,
            port,
            (progress) => {
              // Forward progress updates
              safeSSEWrite({
                stage: progress.stage || 'generating',
                progress: progress.progress || 0,
                message: progress.message || 'Generating website...',
              });
            }
          );
        }
      );

      safeSSEWrite({
        stage: 'complete',
        progress: 100,
        message: 'Website generated successfully!',
        website,
      });

      safeEnd();
    } catch (error) {
      hasError = true;
      console.error('[Quick Start] Generation error:', error);
      safeSSEWrite({
        stage: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Failed to generate website',
        message: 'An error occurred while generating your website. Please try again.',
      });
      safeEnd();
    }
  });
}

