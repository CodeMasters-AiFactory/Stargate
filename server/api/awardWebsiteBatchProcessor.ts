/**
 * Batch Processing API for Award-Winning Websites
 * Scrapes, rewrites, reimages, SEO evaluates, and verifies all award-winning websites
 */

import type { Express } from 'express';
import { requireAdmin } from '../middleware/permissions';
import { scrapeWebsiteFull } from '../services/websiteScraper';
import { rewritePageContent } from '../services/contentRewriter';
import { generateAIImage } from '../services/aiImageGenerator';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { createTemplateFromScrape } from '../services/websiteScraper';
import { db } from '../db';
import { brandTemplates, templateSources, scrapedContent } from '@shared/schema';
import { eq } from 'drizzle-orm';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const TEMPLATES_DIR = path.join(process.cwd(), 'scraped_templates');

interface ProcessingStatus {
  url: string;
  name: string;
  year: number;
  industry: string;
  stage: 'scraping' | 'rewriting' | 'reimaging' | 'seo' | 'verifying' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
}

/**
 * Process a single website through the full QA pipeline
 */
async function processWebsite(
  url: string,
  name: string,
  year: number,
  industry: string,
  onProgress: (status: ProcessingStatus) => void
): Promise<{ success: boolean; templateId?: string; error?: string }> {
  try {
    // Stage 1: Scrape
    onProgress({
      url,
      name,
      year,
      industry,
      stage: 'scraping',
      progress: 10,
      message: 'Scraping website...',
    });

    const scrapedData = await scrapeWebsiteFull(url, {
      onProgress: (phase, progressPercent, message) => {
        onProgress({
          url,
          name,
          year,
          industry,
          stage: 'scraping',
          progress: 10 + Math.floor(progressPercent * 0.2),
          message: message || 'Scraping...',
        });
      },
    });

    if (scrapedData.error) {
      throw new Error(scrapedData.error);
    }

    // Create template from scraped data
    const template = createTemplateFromScrape(scrapedData);
    template.name = `${name} (${year})`;
    template.industry = industry;
    template.year = year;
    template.awardWinning = true;

    // Stage 2: Rewrite Content
    onProgress({
      url,
      name,
      year,
      industry,
      stage: 'rewriting',
      progress: 30,
      message: 'Rewriting content...',
    });

    const rewrittenHtml = await rewritePageContent(scrapedData.htmlContent, {
      companyName: name,
      industry,
      location: 'Global',
    });

    template.htmlContent = rewrittenHtml;
    template.qaMetadata = {
      ...template.qaMetadata,
      contentRewritten: true,
      rewrittenAt: new Date().toISOString(),
    };

    // Stage 3: Regenerate Images
    onProgress({
      url,
      name,
      year,
      industry,
      stage: 'reimaging',
      progress: 50,
      message: 'Regenerating images...',
    });

    const $ = cheerio.load(rewrittenHtml);
    const images = $('img');
    let imageCount = 0;
    const totalImages = images.length;

    for (let i = 0; i < images.length; i++) {
      const img = images.eq(i);
      const src = img.attr('src');
      const alt = img.attr('alt') || '';

      if (src && !src.startsWith('data:')) {
        try {
          const newImageUrl = await generateAIImage({
            prompt: `${alt || name} ${industry} professional website image`,
            style: 'professional',
            size: '1024x1024',
          });

          if (newImageUrl) {
            img.attr('src', newImageUrl);
            imageCount++;
          }
        } catch (error) {
          console.warn(`[BatchProcessor] Failed to regenerate image ${i + 1}:`, getErrorMessage(error));
        }
      }

      onProgress({
        url,
        name,
        year,
        industry,
        stage: 'reimaging',
        progress: 50 + Math.floor((imageCount / totalImages) * 20),
        message: `Regenerated ${imageCount}/${totalImages} images...`,
      });
    }

    template.htmlContent = $.html();
    template.qaMetadata = {
      ...template.qaMetadata,
      imagesRegenerated: true,
      imagesRegeneratedAt: new Date().toISOString(),
      imagesCount: imageCount,
    };

    // Stage 4: SEO Evaluation
    onProgress({
      url,
      name,
      year,
      industry,
      stage: 'seo',
      progress: 75,
      message: 'Evaluating SEO...',
    });

    const seoHtml = template.htmlContent;
    const $seo = cheerio.load(seoHtml);

    // Add meta tags if missing
    if (!$seo('head meta[name="description"]').length) {
      $seo('head').append(
        `<meta name="description" content="${name} - Award-winning ${industry} website from ${year}">`
      );
    }

    if (!$seo('head meta[name="keywords"]').length) {
      $seo('head').append(
        `<meta name="keywords" content="${industry}, ${name}, award-winning, ${year}">`
      );
    }

    // Ensure title tag
    if (!$seo('head title').length) {
      $seo('head').append(`<title>${name} - Award Winning ${year}</title>`);
    } else {
      $seo('head title').text(`${name} - Award Winning ${year}`);
    }

    // Add Open Graph tags
    if (!$seo('head meta[property="og:title"]').length) {
      $seo('head').append(`<meta property="og:title" content="${name} - Award Winning ${year}">`);
    }
    if (!$seo('head meta[property="og:description"]').length) {
      $seo('head').append(
        `<meta property="og:description" content="${name} - Award-winning ${industry} website from ${year}">`
      );
    }

    // Ensure all images have alt text
    $seo('img').each((_, el) => {
      if (!$seo(el).attr('alt')) {
        $seo(el).attr('alt', `${name} - ${industry}`);
      }
    });

    template.htmlContent = $seo.html();
    template.qaMetadata = {
      ...template.qaMetadata,
      seoEvaluated: true,
      seoEvaluatedAt: new Date().toISOString(),
    };

    // Stage 5: Verification
    onProgress({
      url,
      name,
      year,
      industry,
      stage: 'verifying',
      progress: 90,
      message: 'Verifying template...',
    });

    // Basic verification checks
    const hasContent = template.htmlContent.length > 1000;
    const hasTitle = $seo('head title').length > 0;
    const hasMetaDescription = $seo('head meta[name="description"]').length > 0;
    const hasImages = $seo('img').length > 0;

    const verified = hasContent && hasTitle && hasMetaDescription && hasImages;

    template.qaMetadata = {
      ...template.qaMetadata,
      verified,
      verifiedAt: new Date().toISOString(),
      verificationChecks: {
        hasContent,
        hasTitle,
        hasMetaDescription,
        hasImages,
      },
    };

    // Save template
    if (db) {
      try {
        // Check if source exists
        let sourceId = template.sourceId;
        if (!sourceId) {
          const [source] = await db
            .select()
            .from(templateSources)
            .where(eq(templateSources.companyName, name))
            .limit(1);

          if (source) {
            sourceId = source.id;
          } else {
            // Create new source
            const [newSource] = await db
              .insert(templateSources)
              .values({
                companyName: name,
                url: url,
                industry: industry,
                metadata: {
                  year,
                  awardWinning: true,
                },
              })
              .returning();
            sourceId = newSource.id;
          }
        }

        // Save scraped content
        await db.insert(scrapedContent).values({
          sourceId,
          htmlContent: scrapedData.htmlContent,
          cssContent: scrapedData.cssContent,
          images: scrapedData.images as any,
          textContent: scrapedData.textContent as any,
          designTokens: scrapedData.designTokens as any,
        });

        // Save template
        const contentData = {
          html: template.htmlContent,
          qaMetadata: template.qaMetadata,
        };

        await db.insert(brandTemplates).values({
          id: template.id,
          name: template.name,
          sourceId,
          industry: industry,
          contentData: contentData as any,
          css: scrapedData.cssContent,
          metadata: {
            year,
            awardWinning: true,
            category: template.category,
          } as any,
        });
      } catch (dbError) {
        console.warn('[BatchProcessor] Database save failed, saving to file:', getErrorMessage(dbError));
        // Fallback to file save
        if (!fs.existsSync(TEMPLATES_DIR)) {
          fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
        }
        const templatePath = path.join(TEMPLATES_DIR, `${template.id}.json`);
        fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
      }
    } else {
      // Save to file
      if (!fs.existsSync(TEMPLATES_DIR)) {
        fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
      }
      const templatePath = path.join(TEMPLATES_DIR, `${template.id}.json`);
      fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
    }

    onProgress({
      url,
      name,
      year,
      industry,
      stage: 'complete',
      progress: 100,
      message: 'Processing complete!',
    });

    return { success: true, templateId: template.id };
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    onProgress({
      url,
      name,
      year,
      industry,
      stage: 'error',
      progress: 0,
      message: 'Processing failed',
      error: errorMsg,
    });
    return { success: false, error: errorMsg };
  }
}

export function registerAwardWebsiteBatchProcessorRoutes(app: Express) {
  console.log('[AwardWebsiteBatchProcessor] ✅ Registering batch processor routes...');

  /**
   * Process all award-winning websites through the full QA pipeline
   * POST /api/award-websites/batch-process
   */
  app.post('/api/award-websites/batch-process', requireAdmin, async (req, res) => {
    try {
      const { websites } = req.body;

      if (!Array.isArray(websites) || websites.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Websites array is required',
        });
      }

      // Set up Server-Sent Events for progress updates
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const sendProgress = (status: ProcessingStatus) => {
        res.write(`data: ${JSON.stringify(status)}\n\n`);
      };

      // Process all websites
      const results: Array<{ url: string; success: boolean; templateId?: string; error?: string }> = [];

      for (let i = 0; i < websites.length; i++) {
        const website = websites[i];
        const { url, name, year, industry } = website;

        sendProgress({
          url,
          name,
          year,
          industry,
          stage: 'scraping',
          progress: Math.round((i / websites.length) * 100),
          message: `Processing ${i + 1}/${websites.length}: ${name}...`,
        });

        const result = await processWebsite(url, name, year, industry, sendProgress);
        results.push({ url, ...result });

        // Small delay between websites
        if (i < websites.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      // Send final summary
      sendProgress({
        url: '',
        name: 'Batch Processing Complete',
        year: 0,
        industry: '',
        stage: 'complete',
        progress: 100,
        message: `Processed ${results.filter(r => r.success).length}/${results.length} websites successfully`,
      });

      res.end();
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      console.error('[AwardWebsiteBatchProcessor] Batch processing error:', errorMsg);
      res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
      res.end();
    }
  });
}


