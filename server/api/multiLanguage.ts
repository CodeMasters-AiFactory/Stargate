/**
 * Multi-Language API Routes
 * Generate websites in multiple languages with RTL support
 */

import type { Express, Request, Response } from 'express';
import {
  generateMultiLanguageWebsite,
  SUPPORTED_LANGUAGES,
  getLanguageSEOMetadata,
  type SupportedLanguage,
} from '../services/multiLanguageGenerator';
import { getErrorMessage, logError } from '../utils/errorHandler';

export function registerMultiLanguageRoutes(app: Express): void {
  /**
   * GET /api/multi-language/languages
   * Get list of supported languages
   */
  app.get('/api/multi-language/languages', (_req: Request, res: Response): void => {
    try {
      res.json({
        success: true,
        languages: SUPPORTED_LANGUAGES,
        count: SUPPORTED_LANGUAGES.length,
      });
    } catch (_error: unknown) {
      logError(_error, 'MultiLanguage API - GetLanguages');
      res.status(500).json({
        success: false,
        error: getErrorMessage(_error),
      });
    }
  });

  /**
   * POST /api/multi-language/generate
   * Generate website in target language
   */
  app.post('/api/multi-language/generate', async (req: Request, res: Response): Promise<void> => {
    try {
      const { html, targetLanguage, sourceLanguage } = req.body;

      if (!html || !targetLanguage) {
        res.status(400).json({
          success: false,
          error: 'html and targetLanguage are required',
        });
        return;
      }

      if (!SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)) {
        res.status(400).json({
          success: false,
          error: `Unsupported language: ${targetLanguage}`,
        });
        return;
      }

      const result = await generateMultiLanguageWebsite(
        html,
        targetLanguage as SupportedLanguage,
        (sourceLanguage as SupportedLanguage) || 'en'
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (_error: unknown) {
      logError(_error, 'MultiLanguage API - Generate');
      res.status(500).json({
        success: false,
        error: getErrorMessage(_error),
      });
    }
  });

  /**
   * POST /api/multi-language/generate-all
   * Generate website in all supported languages
   */
  app.post('/api/multi-language/generate-all', async (req: Request, res: Response): Promise<void> => {
    try {
      const { html, sourceLanguage } = req.body;

      if (!html) {
        res.status(400).json({
          success: false,
          error: 'html is required',
        });
        return;
      }

      const results = await Promise.all(
        SUPPORTED_LANGUAGES.map(lang =>
          generateMultiLanguageWebsite(
            html,
            lang.code,
            (sourceLanguage as SupportedLanguage) || 'en'
          ).then(result => ({
            language: lang.code,
            ...result,
          }))
        )
      );

      res.json({
        success: true,
        languages: results,
        count: results.length,
      });
    } catch (_error: unknown) {
      logError(_error, 'MultiLanguage API - GenerateAll');
      res.status(500).json({
        success: false,
        error: getErrorMessage(_error),
      });
    }
  });

  /**
   * GET /api/multi-language/seo/:language
   * Get SEO metadata for a language
   */
  app.get('/api/multi-language/seo/:language', (req: Request, res: Response): void => {
    try {
      const { language } = req.params;
      const { title, description } = req.query;

      if (!SUPPORTED_LANGUAGES.find(l => l.code === language)) {
        res.status(400).json({
          success: false,
          error: `Unsupported language: ${language}`,
        });
        return;
      }

      const metadata = getLanguageSEOMetadata(language as SupportedLanguage, {
        title: title as string,
        description: description as string,
      });

      res.json({
        success: true,
        metadata,
      });
    } catch (_error: unknown) {
      logError(_error, 'MultiLanguage API - GetSEO');
      res.status(500).json({
        success: false,
        error: getErrorMessage(_error),
      });
    }
  });
}

