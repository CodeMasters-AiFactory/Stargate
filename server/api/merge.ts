/**
 * Merge API Routes
 * Handles template merging, image generation, and content rewriting
 */

import type { Express, Request, Response } from 'express';
import { mergeTemplates } from '../services/templateMerger';
import { analyzeImages, analyzeSingleImage } from '../services/imageContextAnalyzer';
import { generateWithLeonardo } from '../services/leonardoImageService';
import * as cheerio from 'cheerio';
import { logError, getErrorMessage } from '../utils/errorHandler';
// generateContent removed - using multiModelAIOrchestrator.generate instead
import { generate } from '../services/multiModelAIOrchestrator';

export function registerMergeRoutes(app: Express) {
  /**
   * POST /api/merge/preview
   * Merge design template with content template
   */
  app.post('/api/merge/preview', async (req: Request, res: Response): Promise<void> => {
    try {
      const { designTemplate, contentTemplate } = req.body;

      if (!designTemplate || !contentTemplate) {
        res.status(400).json({ error: 'Both designTemplate and contentTemplate are required' });
        return;
      }

      // Ensure templates have HTML content - load from database if needed
      let designHtml = designTemplate.contentData?.html || '';
      let contentHtml = contentTemplate.contentData?.html || '';

      // If HTML missing, try to load from database
      if (!designHtml && designTemplate.id) {
        try {
          const { db } = await import('../db');
          const { brandTemplates } = await import('@shared/schema');
          const { eq } = await import('drizzle-orm');
          
          if (db) {
            const [dbTemplate] = await db.select().from(brandTemplates).where(eq(brandTemplates.id, designTemplate.id));
            if (dbTemplate) {
              const contentData = (dbTemplate.contentData as Record<string, unknown>) || {};
              designHtml = contentData.html || '';
              designTemplate.contentData = { html: designHtml, css: dbTemplate.css || '' };
            }
          }
        } catch (_err: unknown) {
          console.warn('[Merge API] Failed to load design template HTML from database:', _err);
        }
      }

      if (!contentHtml && contentTemplate.id) {
        try {
          const { db } = await import('../db');
          const { brandTemplates } = await import('@shared/schema');
          const { eq } = await import('drizzle-orm');
          
          if (db) {
            const [dbTemplate] = await db.select().from(brandTemplates).where(eq(brandTemplates.id, contentTemplate.id));
            if (dbTemplate) {
              const contentData = (dbTemplate.contentData as Record<string, unknown>) || {};
              contentHtml = contentData.html || '';
              contentTemplate.contentData = { html: contentHtml, css: dbTemplate.css || '' };
            }
          }
        } catch (_err: unknown) {
          console.warn('[Merge API] Failed to load content template HTML from database:', _err);
        }
      }

      if (!designHtml) {
        res.status(400).json({ error: 'Design template has no HTML content' });
        return;
      }

      if (!contentHtml) {
        res.status(400).json({ error: 'Content template has no HTML content' });
        return;
      }

      const merged = await mergeTemplates(designTemplate, contentTemplate);

      res.json({
        html: merged.html,
        css: merged.css,
        images: merged.images,
      });
    } catch (error) {
      logError(error, 'Merge API - Preview');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/merge/analyze-images
   * Analyze all images in merged template
   */
  app.post('/api/merge/analyze-images', async (req: Request, res: Response): Promise<void> => {
    try {
      const { mergedTemplate, businessContext, singleImageSrc } = req.body;

      // Handle single image analysis (for on-the-fly generation)
      if (singleImageSrc && mergedTemplate?.html) {
        try {
          const analysis = await analyzeSingleImage(
            mergedTemplate.html,
            singleImageSrc,
            businessContext
          );
          res.json({ analyses: [analysis] });
          return;
        } catch (err) {
          logError(err, 'Merge API - Analyze Single Image');
          res.status(500).json({ error: getErrorMessage(err) });
          return;
        }
      }

      // Handle full template analysis
      if (!mergedTemplate || !mergedTemplate.html) {
        res.status(400).json({ error: 'mergedTemplate with HTML is required' });
        return;
      }

      const analyses = await analyzeImages(mergedTemplate, businessContext);

      res.json({ analyses });
    } catch (error) {
      logError(error, 'Merge API - Analyze Images');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/merge/generate-image
   * Generate single image via Leonardo AI
   */
  app.post('/api/merge/generate-image', async (req: Request, res: Response): Promise<void> => {
    try {
      const { prompt, section, businessContext } = req.body;

      if (!prompt) {
        res.status(400).json({ error: 'Prompt is required' });
        return;
      }

      // Generate image using Leonardo
      const result = await generateWithLeonardo({
        prompt,
        width: section === 'hero' ? 1920 : 1024,
        height: section === 'hero' ? 1080 : 768,
      });

      res.json({
        imageUrl: result.url,
        prompt: result.prompt,
      });
    } catch (error) {
      logError(error, 'Merge API - Generate Image');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/merge/rewrite-section
   * Rewrite content for a single section using SEO keywords
   */
  app.post('/api/merge/rewrite-section', async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        html,
        sectionType,
        businessContext,
        keywords,        // NEW: SEO keywords for this section
        allKeywords,     // NEW: All keywords for general context
        pageKeywords,    // NEW: Full page keywords structure
      } = req.body;

      if (!html) {
        res.status(400).json({ error: 'HTML content is required' });
        return;
      }

      // Parse HTML
      const $ = cheerio.load(html);

      // Extract text content
      const headlines: string[] = [];
      $('h1, h2, h3, h4, h5, h6').each((_index, el) => {
        const text = $(el).text().trim();
        if (text) headlines.push(text);
      });

      const paragraphs: string[] = [];
      $('p').each((_index, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 20) paragraphs.push(text);
      });

      const buttons: string[] = [];
      $('button, .btn, a[class*="button"], a[class*="cta"]').each((_index, el) => {
        const text = $(el).text().trim();
        if (text) buttons.push(text);
      });

      // Build keyword context for SEO-optimized content
      const seoKeywords = keywords || allKeywords || [];
      const keywordString = seoKeywords.slice(0, 5).join(', ');

      // Generate rewritten content using AI content generator
      const businessContextForAI = {
        name: businessContext?.businessName || 'Your Business',
        industry: businessContext?.industry || 'business',
        businessType: businessContext?.industry || 'business',
        services: businessContext?.services || [],
        location: businessContext?.location || '',
        tone: 'professional' as const,
      };

      console.log(`[Merge API] Rewriting ${sectionType} section with ${seoKeywords.length} keywords`);

      // Rewrite headlines with SEO keywords
      if (headlines.length > 0) {
        try {
          const headlinePrompt = seoKeywords.length > 0
            ? `Write an SEO-optimized headline for a ${sectionType} section for ${businessContextForAI.name}, a ${businessContextForAI.industry} business${businessContextForAI.location ? ` in ${businessContextForAI.location}` : ''}. Target keywords: ${keywordString}. Keep it under 80 characters, engaging, and naturally incorporate the keywords.`
            : `Write an engaging headline for a ${sectionType} section for ${businessContextForAI.name}, a ${businessContextForAI.industry} business. Keep it under 80 characters.`;
          
          const rewrittenContent = await generate({
            task: 'content',
            prompt: headlinePrompt,
            temperature: 0.7,
            maxTokens: 100,
          });
          
          const newHeadline = rewrittenContent.content?.trim().substring(0, 80) || headlines[0];
          $('h1, h2, h3, h4, h5, h6').first().text(newHeadline);
        } catch (_err: unknown) {
          console.warn('[Merge API] Failed to rewrite headline, keeping original:', _err);
          // Keep original headline on error
        }
      }

      // Rewrite paragraphs with SEO keywords
      if (paragraphs.length > 0) {
        for (let i = 0; i < Math.min(paragraphs.length, 3); i++) {
          try {
            const paragraphPrompt = seoKeywords.length > 0
              ? `Rewrite this paragraph for ${businessContextForAI.name}, a ${businessContextForAI.industry} business${businessContextForAI.location ? ` in ${businessContextForAI.location}` : ''}. Naturally incorporate these SEO keywords where appropriate: ${keywordString}. Keep the paragraph professional, engaging, and between 50-150 words. Original: ${paragraphs[i]}`
              : `Rewrite this paragraph for ${businessContextForAI.name}, a ${businessContextForAI.industry} business. Keep it professional and engaging. Original: ${paragraphs[i]}`;
            
            const rewrittenContent = await generate({
              task: 'content',
              prompt: paragraphPrompt,
              temperature: 0.7,
              maxTokens: 200,
            });
            
            const newParagraph = rewrittenContent.content?.trim().replace(/\n+/g, ' ') || paragraphs[i];
            $('p').eq(i).text(newParagraph);
          } catch (_err: unknown) {
            console.warn(`[Merge API] Failed to rewrite paragraph ${i}, keeping original:`, _err);
            // Keep original paragraph on error
          }
        }
      }

      // Rewrite buttons/CTAs
      if (buttons.length > 0) {
        try {
          const ctaPrompt = `Create a compelling call-to-action button text for ${businessContextForAI.name}, a ${businessContextForAI.industry} business. Keep it under 5 words, action-oriented, and relevant to their services.`;
          
          const rewrittenContent = await generate({
            task: 'content',
            prompt: ctaPrompt,
            temperature: 0.7,
            maxTokens: 50,
          });
          
          const newCTA = rewrittenContent.content?.trim().substring(0, 30) || buttons[0];
          $('button, .btn, a[class*="button"], a[class*="cta"]').first().text(newCTA);
        } catch (_err: unknown) {
          console.warn('[Merge API] Failed to rewrite CTA, keeping original:', _err);
          // Keep original CTA on error
        }
      }

      const rewrittenHtml = $.html();

      res.json({
        rewrittenHtml,
      });
    } catch (error) {
      logError(error, 'Merge API - Rewrite Section');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });
}

