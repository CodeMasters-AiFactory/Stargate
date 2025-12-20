/**
 * API routes for award-winning website screenshots
 * Used for Merlin package selection carousel
 */

import type { Express } from 'express';
import {
  captureWebsiteScreenshot,
  captureBatchScreenshots,
} from '../services/awardWebsiteScreenshots';
import { getErrorMessage } from '../utils/errorHandler';

export function registerAwardScreenshotRoutes(app: Express) {
  console.log('[AwardScreenshots API] ✅ Registering award screenshot routes...');

  /**
   * Capture screenshot of a single website
   * POST /api/award-screenshots/capture
   */
  app.post('/api/award-screenshots/capture', async (req, res) => {
    try {
      const { url, width, height, fullPage, waitTime } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'URL is required',
        });
      }

      const result = await captureWebsiteScreenshot(url, {
        width,
        height,
        fullPage,
        waitTime,
      });

      if (result.success) {
        res.json({
          success: true,
          filepath: result.filepath,
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || 'Failed to capture screenshot',
        });
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      console.error('[AwardScreenshots API] Error:', errorMsg);
      res.status(500).json({
        success: false,
        error: errorMsg,
      });
    }
  });

  /**
   * Batch capture screenshots for multiple websites
   * POST /api/award-screenshots/batch
   */
  app.post('/api/award-screenshots/batch', async (req, res) => {
    try {
      const { urls } = req.body;

      if (!Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'URLs array is required',
        });
      }

      // Set up Server-Sent Events for progress updates
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const sendProgress = (current: number, total: number, url: string, result?: any) => {
        res.write(
          `data: ${JSON.stringify({
            current,
            total,
            url,
            progress: Math.round((current / total) * 100),
            result,
          })}\n\n`
        );
      };

      // Capture screenshots with progress updates
      const results = await captureBatchScreenshots(urls, (current, total, url) => {
        sendProgress(current, total, url);
      });

      // Send final results
      sendProgress(urls.length, urls.length, '', { complete: true, results });
      res.end();
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      console.error('[AwardScreenshots API] Batch error:', errorMsg);
      res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
      res.end();
    }
  });

  /**
   * Get screenshot status for a list of URLs
   * POST /api/award-screenshots/status
   */
  app.post('/api/award-screenshots/status', async (req, res) => {
    try {
      const { urls } = req.body;

      if (!Array.isArray(urls)) {
        return res.status(400).json({
          success: false,
          error: 'URLs array is required',
        });
      }

      const statuses = urls.map((url) => {
        const filename = url.replace(/[^a-zA-Z0-9]/g, '-') + '.png';
        const filepath = require('path').join(
          process.cwd(),
          'public',
          'award-screenshots',
          filename
        );
        const exists = require('fs').existsSync(filepath);

        return {
          url,
          hasScreenshot: exists,
          filepath: exists ? `/award-screenshots/${filename}` : null,
        };
      });

      res.json({
        success: true,
        statuses,
      });
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      console.error('[AwardScreenshots API] Status error:', errorMsg);
      res.status(500).json({
        success: false,
        error: errorMsg,
      });
    }
  });
}


