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
  app.get('/api/multi-language/languages', (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        languages: SUPPORTED_LANGUAGES,
        count: SUPPORTED_LANGUAGES.length,
      });
    } catch (error) {
      logError(error, 'MultiLanguage API - GetLanguages');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/multi-language/generate
   * Generate website in target language
   */
  app.post('/api/multi-language/generate', async (req: Request, res: Response) => {
    try {
      const { html, targetLanguage, sourceLanguage } = req.body;

      if (!html || !targetLanguage) {
        return res.status(400).json({
          success: false,
          error: 'html and targetLanguage are required',
        });
      }

      if (!SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)) {
        return res.status(400).json({
          success: false,
          error: `Unsupported language: ${targetLanguage}`,
        });
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
    } catch (error) {
      logError(error, 'MultiLanguage API - Generate');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/multi-language/generate-all
   * Generate website in all supported languages
   */
  app.post('/api/multi-language/generate-all', async (req: Request, res: Response) => {
    try {
      const { html, sourceLanguage } = req.body;

      if (!html) {
        return res.status(400).json({
          success: false,
          error: 'html is required',
        });
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
    } catch (error) {
      logError(error, 'MultiLanguage API - GenerateAll');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * GET /api/multi-language/seo/:language
   * Get SEO metadata for a language
   */
  app.get('/api/multi-language/seo/:language', (req: Request, res: Response) => {
    try {
      const { language } = req.params;
      const { title, description } = req.query;

      if (!SUPPORTED_LANGUAGES.find(l => l.code === language)) {
        return res.status(400).json({
          success: false,
          error: `Unsupported language: ${language}`,
        });
      }

      const metadata = getLanguageSEOMetadata(language as SupportedLanguage, {
        title: title as string,
        description: description as string,
      });

      res.json({
        success: true,
        metadata,
      });
    } catch (error) {
      logError(error, 'MultiLanguage API - GetSEO');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });
}

