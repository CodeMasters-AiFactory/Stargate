/**
 * Multi-Modal AI API Routes
 */

import express, { type Express, type Request, type Response } from 'express';
import { analyzeScreenshot, generateWebsiteFromScreenshot, extractBrandBook, processSketch } from '../services/multimodalAI';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { strictRateLimit } from '../middleware/rateLimiter';

export function registerMultiModalAIRoutes(app: Express) {
  /**
   * POST /api/multimodal/screenshot/analyze
   * Analyze screenshot
   */
  app.post('/api/multimodal/screenshot/analyze', strictRateLimit(), express.raw({ type: '*/*', limit: '10mb' }), async (req: Request, res: Response) => {
    try {
      const contentType = req.headers['content-type'] || '';
      let imageBuffer: Buffer;
      let mimeType = 'image/png';

      if (contentType.includes('application/json')) {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (!body.image) {
          return res.status(400).json({ error: 'Image is required (base64 encoded)' });
        }
        imageBuffer = Buffer.from(body.image, 'base64');
        mimeType = body.mimeType || 'image/png';
      } else {
        imageBuffer = req.body;
        mimeType = contentType.split(';')[0] || 'image/png';
      }

      if (!imageBuffer || imageBuffer.length === 0) {
        return res.status(400).json({ error: 'Image is empty' });
      }

      const analysis = await analyzeScreenshot(imageBuffer, mimeType);

      res.json({
        success: true,
        analysis,
      });
    } catch (error) {
      logError(error, 'MultiModalAI API - AnalyzeScreenshot');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/multimodal/screenshot/generate
   * Generate website from screenshot
   */
  app.post('/api/multimodal/screenshot/generate', strictRateLimit(), async (req: Request, res: Response) => {
    try {
      const { analysis, clientInfo } = req.body;

      if (!analysis || !clientInfo) {
        return res.status(400).json({ error: 'analysis and clientInfo are required' });
      }

      const result = await generateWebsiteFromScreenshot(analysis, clientInfo);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      logError(error, 'MultiModalAI API - GenerateFromScreenshot');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/multimodal/brandbook/extract
   * Extract brand book from image
   */
  app.post('/api/multimodal/brandbook/extract', strictRateLimit(), express.raw({ type: '*/*', limit: '10mb' }), async (req: Request, res: Response) => {
    try {
      const contentType = req.headers['content-type'] || '';
      let imageBuffer: Buffer;
      let mimeType = 'image/png';

      if (contentType.includes('application/json')) {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (!body.image) {
          return res.status(400).json({ error: 'Image is required (base64 encoded)' });
        }
        imageBuffer = Buffer.from(body.image, 'base64');
        mimeType = body.mimeType || 'image/png';
      } else {
        imageBuffer = req.body;
        mimeType = contentType.split(';')[0] || 'image/png';
      }

      const brandBook = await extractBrandBook(imageBuffer, mimeType);

      res.json({
        success: true,
        brandBook,
      });
    } catch (error) {
      logError(error, 'MultiModalAI API - ExtractBrandBook');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/multimodal/sketch/process
   * Process sketch/wireframe to website
   */
  app.post('/api/multimodal/sketch/process', strictRateLimit(), express.raw({ type: '*/*', limit: '10mb' }), async (req: Request, res: Response) => {
    try {
      const contentType = req.headers['content-type'] || '';
      let imageBuffer: Buffer;
      let mimeType = 'image/png';

      if (contentType.includes('application/json')) {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (!body.image) {
          return res.status(400).json({ error: 'Image is required (base64 encoded)' });
        }
        imageBuffer = Buffer.from(body.image, 'base64');
        mimeType = body.mimeType || 'image/png';
      } else {
        imageBuffer = req.body;
        mimeType = contentType.split(';')[0] || 'image/png';
      }

      const result = await processSketch(imageBuffer, mimeType);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      logError(error, 'MultiModalAI API - ProcessSketch');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });
}

