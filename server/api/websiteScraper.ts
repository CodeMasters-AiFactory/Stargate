/**
 * Website Scraper API Routes
 * Admin-only endpoints for searching and scraping websites
 */

import { brandTemplates, scrapedContent, templateSources } from '@shared/schema';
import { and, eq, sql } from 'drizzle-orm';
import type { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { db } from '../db';
import { requireAdmin } from '../middleware/permissions';
import {
    createTemplateFromScrape,
    scrapeWebsiteFull,
    searchGoogleRankings,
    type ScrapedWebsiteData
} from '../services/websiteScraper';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { processNewTemplate } from '../services/templateManager';

// Global pause resolvers map for batch confirmation
const globalPauseResolvers = new Map<string, () => void>();

// Local file storage for templates when database is unavailable
const TEMPLATES_DIR = path.join(process.cwd(), 'scraped_templates');

// Ensure templates directory exists
if (!fs.existsSync(TEMPLATES_DIR)) {
  fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
}

/**
 * Save template to local JSON file when database is unavailable
 */
async function saveTemplateToFile(template: any, scrapedData: ScrapedWebsiteData): Promise<void> {
  try {
    const filename = `${template.id}.json`;
    const filepath = path.join(TEMPLATES_DIR, filename);

    const templateData = {
      ...template,
      scrapedAt: new Date().toISOString(),
      scrapedData: {
        url: scrapedData.url,
        companyName: scrapedData.companyName,
        metadata: scrapedData.metadata,
        designTokens: scrapedData.designTokens,
        textContent: scrapedData.textContent,
        imagesCount: scrapedData.images.length,
        htmlLength: scrapedData.htmlContent.length,
        cssLength: scrapedData.cssContent.length,
      },
    };

    fs.writeFileSync(filepath, JSON.stringify(templateData, null, 2));
    console.log(`[Scraper Test] ✅ Template saved to file: ${filepath}`);

    // Also update the templates index
    const indexPath = path.join(TEMPLATES_DIR, 'index.json');
    let index: any[] = [];
    if (fs.existsSync(indexPath)) {
      try {
        index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      } catch (e) {
        index = [];
      }
    }

    // Add or update template in index
    const existingIdx = index.findIndex(t => t.id === template.id);
    const indexEntry = {
      id: template.id,
      name: template.name,
      brand: template.brand,
      industry: template.industry,
      locationCountry: template.locationCountry,
      locationState: template.locationState,
      createdAt: templateData.scrapedAt,
      filename,
    };

    if (existingIdx >= 0) {
      index[existingIdx] = indexEntry;
    } else {
      index.push(indexEntry);
    }

    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    console.log(`[Scraper Test] ✅ Templates index updated: ${index.length} templates`);
  } catch (error) {
    console.error('[Scraper Test] ❌ Failed to save template to file:', error);
    throw error;
  }
}

// Global crawl status tracker
const crawlStatus = new Map<string, {
  templateId: string;
  templateName: string;
  sourceUrl: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  pagesScraped: number;
  totalPages: number;
  currentUrl?: string;
  errors: string[];
  startTime?: Date;
  endTime?: Date;
}>();

export function registerWebsiteScraperRoutes(app: Express) {
  console.log('[WebsiteScraper Routes] ✅ Registering website scraper routes...')
  
  /**
   * Check if a website is safe to scrape
   * POST /api/admin/scraper/check-safe
   * Body: { url: string }
   */
  app.post('/api/admin/scraper/check-safe', requireAdmin, async (req, res) => {
    try {
      const { url } = req.body;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'URL is required',
        });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL format',
        });
      }

      const { checkIfSafeToScrape } = await import('../services/safeScrapingChecker');
      const result = await checkIfSafeToScrape(url);

      return res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      logError(error, 'Scraper API - Check Safe');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });
  
  // Get crawl status (no auth required for status check)
  app.get('/api/admin/scraper/crawl-status/:templateId', async (req, res) => {
    try {
      const { templateId } = req.params;
      const status = crawlStatus.get(templateId) || {
        templateId,
        templateName: 'Unknown',
        sourceUrl: '',
        status: 'idle' as const,
        pagesScraped: 0,
        totalPages: 0,
        errors: [],
      };
      
      return res.json({ success: true, status });
    } catch (error) {
      return res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });
  
  // AUTO-TRIGGER: Crawl Template 1 on server start (background, no blocking)
  (async () => {
    try {
      // Wait for server to be ready
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      if (!db) {
        console.log('[AutoCrawl] ⚠️ Database not available, skipping auto-crawl');
        return;
      }
      
      // Get first template
      const templates = await db
        .select()
        .from(brandTemplates)
        .where(eq(brandTemplates.isActive, true))
        .limit(1);
      
      if (templates.length === 0) {
        console.log('[AutoCrawl] ⚠️ No templates found, skipping auto-crawl');
        return;
      }
      
      const template1 = templates[0];
      
      // Check if already crawled (has pages)
      const { templatePages } = await import('../../shared/schema');
      const existingPages = await db
        .select()
        .from(templatePages)
        .where(eq(templatePages.templateId, template1.id))
        .limit(1);
      
      if (existingPages.length > 0) {
        console.log(`[AutoCrawl] ✅ Template 1 (${template1.name}) already has pages, skipping auto-crawl`);
        return;
      }
      
      // Get source URL
      let sourceUrl: string | null = null;
      if (template1.sourceId) {
        const [source] = await db
          .select()
          .from(templateSources)
          .where(eq(templateSources.id, template1.sourceId))
          .limit(1);
        
        if (source) {
          sourceUrl = source.websiteUrl;
        }
      }
      
      if (!sourceUrl && template1.contentData) {
        const contentData = template1.contentData as any;
        sourceUrl = contentData.url || contentData.sourceUrl || contentData.metadata?.url;
      }
      
      if (sourceUrl) {
        console.log(`\n[AutoCrawl] 🚀🚀🚀 AUTO-STARTING FULL SITE CRAWL FOR TEMPLATE 1 🚀🚀🚀`);
        console.log(`[AutoCrawl] 📄 Template: ${template1.name} (${template1.id})`);
        console.log(`[AutoCrawl] 🌐 Source URL: ${sourceUrl}`);
        console.log(`[AutoCrawl] 🎯 Goal: EXACT CLONE of entire website`);
        console.log(`[AutoCrawl] ⏳ This will take time... watching progress...\n`);
        
        // Set initial status
        crawlStatus.set(template1.id, {
          templateId: template1.id,
          templateName: template1.name,
          sourceUrl,
          status: 'running',
          pagesScraped: 0,
          totalPages: 1000,
          errors: [],
          startTime: new Date(),
        });
        
        const { crawlWebsiteMultiPage } = await import('../services/websiteScraper');
        
        crawlWebsiteMultiPage(sourceUrl, template1.id, 1000, 10, (current, total, url) => {
          // Update status
          const status = crawlStatus.get(template1.id);
          if (status) {
            status.pagesScraped = current;
            status.totalPages = total;
            status.currentUrl = url;
            crawlStatus.set(template1.id, status);
          }
          
          if (current % 10 === 0 || current === 1) {
            console.log(`[AutoCrawl] 📊 Progress: ${current}/${total} pages - ${url.substring(0, 80)}...`);
          }
        }).then(result => {
          const status = crawlStatus.get(template1.id);
          if (status) {
            status.status = 'completed';
            status.pagesScraped = result.pagesScraped;
            status.errors = result.errors;
            status.endTime = new Date();
            crawlStatus.set(template1.id, status);
          }
          
          console.log(`\n[AutoCrawl] ✅✅✅ COMPLETE CLONE FINISHED! ✅✅✅`);
          console.log(`[AutoCrawl] 📊 Total pages scraped: ${result.pagesScraped}`);
          console.log(`[AutoCrawl] 🎯 Template 1 is now an EXACT CLONE of the entire website!`);
          if (result.errors.length > 0) {
            console.warn(`[AutoCrawl] ⚠️ ${result.errors.length} errors occurred (non-critical)`);
          }
        }).catch(error => {
          const status = crawlStatus.get(template1.id);
          if (status) {
            status.status = 'error';
            status.errors.push(getErrorMessage(error));
            status.endTime = new Date();
            crawlStatus.set(template1.id, status);
          }
          console.error(`[AutoCrawl] ❌ Error:`, getErrorMessage(error));
        });
      }
    } catch (error) {
      console.error('[AutoCrawl] ❌ Auto-crawl failed:', getErrorMessage(error));
    }
  })();
  
  /**
   * Crawl Template 1 (first verified template) - Multi-page
   * POST /api/admin/scraper/crawl-template1
   */
  app.post('/api/admin/scraper/crawl-template1', requireAdmin, async (_req, res) => {
    try {
      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }
      
      // Get first verified template from database
      const templates = await db
        .select()
        .from(brandTemplates)
        .where(eq(brandTemplates.isActive, true))
        .limit(1);
      
      if (templates.length === 0) {
        return res.status(404).json({ error: 'No templates found' });
      }
      
      const template1 = templates[0]; // First template
      console.log(`[CrawlTemplate1] Found Template 1: ${template1.id} - ${template1.name}`);
      
      // Get source URL
      let sourceUrl: string | null = null;
      if (template1.sourceId) {
        const [source] = await db
          .select()
          .from(templateSources)
          .where(eq(templateSources.id, template1.sourceId))
          .limit(1);
        
        if (source) {
          sourceUrl = source.websiteUrl;
        }
      }
      
      // Fallback: try to get URL from contentData
      if (!sourceUrl && template1.contentData) {
        const contentData = template1.contentData as any;
        sourceUrl = contentData.url || contentData.sourceUrl || contentData.metadata?.url;
      }
      
      if (!sourceUrl) {
        return res.status(400).json({ error: 'Could not determine source URL for Template 1' });
      }
      
      console.log(`[CrawlTemplate1] Starting multi-page crawl from ${sourceUrl}`);
      
      // Set initial status
      crawlStatus.set(template1.id, {
        templateId: template1.id,
        templateName: template1.name,
        sourceUrl,
        status: 'running',
        pagesScraped: 0,
        totalPages: 1000,
        errors: [],
        startTime: new Date(),
      });
      
      // Start crawling
      const { crawlWebsiteMultiPage } = await import('../services/websiteScraper');
      
      // Run crawl (will take time) - CRAWL ENTIRE SITE
      crawlWebsiteMultiPage(sourceUrl, template1.id, 1000, 10, (current, total, url) => {
        // Update status
        const status = crawlStatus.get(template1.id);
        if (status) {
          status.pagesScraped = current;
          status.totalPages = total;
          status.currentUrl = url;
          crawlStatus.set(template1.id, status);
        }
        
        console.log(`[CrawlTemplate1] Progress: ${current}/${total} - ${url}`);
      }).then(result => {
        const status = crawlStatus.get(template1.id);
        if (status) {
          status.status = 'completed';
          status.pagesScraped = result.pagesScraped;
          status.errors = result.errors;
          status.endTime = new Date();
          crawlStatus.set(template1.id, status);
        }
        
        console.log(`[CrawlTemplate1] ✅ COMPLETE CLONE: ${result.pagesScraped} pages scraped, ${result.errors.length} errors`);
        console.log(`[CrawlTemplate1] 🎯 Template 1 is now a FULL CLONE of the entire website!`);
      }).catch(error => {
        const status = crawlStatus.get(template1.id);
        if (status) {
          status.status = 'error';
          status.errors.push(getErrorMessage(error));
          status.endTime = new Date();
          crawlStatus.set(template1.id, status);
        }
        console.error(`[CrawlTemplate1] ❌ Error:`, getErrorMessage(error));
      });
      
      return res.json({
        success: true,
        message: `Multi-page crawl started for Template 1 (${template1.name})`,
        templateId: template1.id,
        templateName: template1.name,
        sourceUrl,
      });
    } catch (error) {
      logError(error, 'Crawl Template 1');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Multi-page crawl for a template
   * POST /api/admin/scraper/crawl-multipage/:templateId
   */
  app.post('/api/admin/scraper/crawl-multipage/:templateId', requireAdmin, async (req, res) => {
    try {
      const { templateId } = req.params;
      const { maxPages = 50, maxDepth = 3 } = req.body;
      
      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }
      
      // Get template to find its source URL
      const [template] = await db
        .select()
        .from(brandTemplates)
        .where(eq(brandTemplates.id, templateId))
        .limit(1);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      // Get source URL from template source
      let sourceUrl: string | null = null;
      if (template.sourceId) {
        const [source] = await db
          .select()
          .from(templateSources)
          .where(eq(templateSources.id, template.sourceId))
          .limit(1);
        
        if (source) {
          sourceUrl = source.websiteUrl;
        }
      }
      
      // Fallback: try to get URL from contentData
      if (!sourceUrl && template.contentData) {
        const contentData = template.contentData as any;
        sourceUrl = contentData.url || contentData.sourceUrl || contentData.metadata?.url;
      }
      
      if (!sourceUrl) {
        return res.status(400).json({ error: 'Could not determine source URL for template' });
      }
      
      console.log(`[MultiPageCrawl] Starting crawl for template ${templateId} from ${sourceUrl}`);
      
      // Start crawling (this will take time, so we'll return immediately and let it run)
      const { crawlWebsiteMultiPage } = await import('../services/websiteScraper');
      
      // Run crawl in background
      crawlWebsiteMultiPage(sourceUrl, templateId, maxPages, maxDepth, (current, total, url) => {
        console.log(`[MultiPageCrawl] Progress: ${current}/${total} - ${url}`);
      }).then(result => {
        console.log(`[MultiPageCrawl] ✅ Complete: ${result.pagesScraped} pages, ${result.errors.length} errors`);
      }).catch(error => {
        console.error(`[MultiPageCrawl] ❌ Error:`, getErrorMessage(error));
      });
      
      return res.json({
        success: true,
        message: `Multi-page crawl started for template ${templateId}`,
        sourceUrl,
        maxPages,
        maxDepth,
      });
    } catch (error) {
      logError(error, 'Multi-Page Crawl');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Search Google for top companies in industry + location
   * POST /api/admin/scraper/search
   */
  app.post('/api/admin/scraper/search', requireAdmin, async (req, res) => {
    try {
      const { industry, limit } = req.body;

      if (!industry) {
        return res.status(400).json({
          success: false,
          error: 'Industry is required',
        });
      }

      console.log(`[Scraper API] Searching: ${industry}`);

      const results = await searchGoogleRankings(
        industry as string,
        '', // country - no longer required
        '', // state - no longer required
        '', // city - no longer required
        limit || 50
      );

      if (results.length === 0) {
        console.warn(`[Scraper API] ⚠️ No results found for "${industry}"`);
        console.warn(`[Scraper API] 💡 This may be because:`);
        console.warn(`[Scraper API]    1. Google is blocking automated requests`);
        console.warn(`[Scraper API]    2. Google Custom Search API is not configured`);
        console.warn(`[Scraper API]    3. The search query returned no results`);
        console.warn(`[Scraper API] 💡 Solution: Set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID in .env`);
      }

      return res.json({
        success: true,
        results,
        count: results.length,
        warning: results.length === 0 ? 'No results found. Google may be blocking requests or API keys may be missing.' : undefined,
      });
    } catch (error) {
      logError(error, 'Scraper API - Search');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Scrape selected websites
   * POST /api/admin/scraper/scrape
   */
  app.post('/api/admin/scraper/scrape', requireAdmin, async (req, res) => {
    try {
      const { urls, industry, options, isDesignQuality, designCategory, country, state, city } = req.body;

      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'URLs array is required',
        });
      }

      if (!industry) {
        return res.status(400).json({
          success: false,
          error: 'Industry is required',
        });
      }

      const scrapeOptions = options || {
        fullDesign: true,
        fullContent: true,
        createTemplates: true,
      };

      const results: Array<{
        url: string;
        success: boolean;
        data?: ScrapedWebsiteData;
        template?: any;
        error?: string;
      }> = [];

      // Scrape each website
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        console.log(`[Scraper API] Scraping ${i + 1}/${urls.length}: ${url}`);

        try {
          const scrapedData = await scrapeWebsiteFull(
            url,
            undefined, // companyName
            3, // maxRetries
            2000, // retryDelay
            (phase, current, total, message) => {
              // Log progress
              const progressPercent = Math.round((current / total) * 100);
              console.log(`[Scraper API] ${url} - ${phase}: ${progressPercent}% - ${message || ''}`);
            }
          );

          if (scrapedData.error) {
            results.push({
              url,
              success: false,
              error: scrapedData.error,
            });
            continue;
          }

          // Save to database if requested
          let sourceId: string | undefined;
          let template: any;

          if (scrapeOptions.createTemplates && db) {
            // Check if source already exists
            const existingSource = await db
              .select()
              .from(templateSources)
              .where(eq(templateSources.websiteUrl, url))
              .limit(1);

            let currentSource: typeof existingSource[0] | null = null;

            if (existingSource.length > 0) {
              sourceId = existingSource[0].id;
              currentSource = existingSource[0];
            } else {
              // Create new source
              const [newSource] = await db
                .insert(templateSources)
                .values({
                  companyName: scrapedData.companyName,
                  websiteUrl: url,
                  industry: industry,
                  country: null,
                  state: null,
                  city: null,
                  currentRanking: null,
                  isActive: true,
                })
                .returning();

              sourceId = newSource.id;
              currentSource = newSource;
            }

            // Save scraped content
            if (sourceId) {
              await db
                .insert(scrapedContent)
                .values({
                  sourceId,
                  htmlContent: scrapedData.htmlContent,
                  cssContent: scrapedData.cssContent,
                  images: scrapedData.images as any,
                  textContent: scrapedData.textContent as any,
                  designTokens: scrapedData.designTokens as any,
                  version: '1', // Schema expects text, so string is correct
                })
                .onConflictDoNothing();
            }

            // Create template
            if (scrapeOptions.createTemplates && sourceId && currentSource) {
              // Get ranking from source if available (only for non-design-quality templates)
              const ranking = (isDesignQuality ? undefined : (currentSource.currentRanking ? String(currentSource.currentRanking) : undefined));

              template = createTemplateFromScrape(
                scrapedData,
                sourceId,
                industry,
                country,
                state,
                city,
                ranking,
                designCategory || undefined, // designCategory
                isDesignQuality || false, // isDesignQuality
                undefined, // designScore (not available for URL-based scraping)
                undefined // designAwardSource (not available for URL-based scraping)
              );

              // Save template to database
              if (db) {
                await db
                  .insert(brandTemplates)
                  .values({
                    id: template.id,
                    name: template.name,
                    brand: template.brand,
                    category: template.category,
                    industry: template.industry,
                    thumbnail: template.thumbnail,
                    colors: template.colors as any,
                    typography: template.typography as any,
                    layout: template.layout as any,
                    css: template.css,
                    darkMode: template.darkMode || false,
                    tags: template.tags as any,
                    sourceId: template.sourceId,
                    locationCountry: template.locationCountry,
                    locationState: template.locationState,
                    locationCity: template.locationCity,
                    rankingPosition: template.rankingPosition ? String(template.rankingPosition) : null,
                    contentData: template.contentData as any,
                    // Design quality fields
                    isDesignQuality: isDesignQuality || template.isDesignQuality || false,
                    designCategory: designCategory || template.designCategory || null,
                    designScore: template.designScore || null,
                    designAwardSource: template.designAwardSource || null,
                    // Approval system - new templates need approval (default to pending)
                    isApproved: false, // Pending approval - admin must approve
                    isActive: false, // Inactive until approved
                  })
                  .onConflictDoUpdate({
                    target: brandTemplates.id,
                    set: {
                      name: template.name,
                      css: template.css,
                      contentData: template.contentData as any,
                      isDesignQuality: isDesignQuality || template.isDesignQuality || false,
                      designCategory: designCategory || template.designCategory || null,
                      updatedAt: sql`now()`,
                    },
                  });

                // CRITICAL: Automatically process and verify template
                if (template) {
                  try {
                    await processNewTemplate(template.id);
                    console.log(`[Scraper] ✅ Template processed by Template Manager: ${template.id}`);

                    // AUTO-VERIFY: Test template and report status
                    const { verifyTemplate, printVerificationReport } = await import('../services/templateVerifier');
                    const verificationResult = await verifyTemplate(template.id);
                    console.log(printVerificationReport(verificationResult));

                    // Add verification result to template data
                    (template as any).verificationStatus = verificationResult.status;
                    (template as any).verificationScore = verificationResult.score;

                  } catch (processError) {
                    console.error(`[Scraper] ⚠️ Template processing/verification failed for ${template.id}:`, getErrorMessage(processError));
                    // Don't fail the scrape if processing fails
                  }
                }
              } else if (scrapeOptions.createTemplates && !db) {
                // Database not available - save to file as fallback
                console.log(`[Scraper API] ⚠️ Database not available, saving template to file for: ${url}`);
                try {
                  // Generate a unique source ID
                  const sourceId = `src-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                  
                  // Create template object
                  template = createTemplateFromScrape(
                    scrapedData,
                    sourceId,
                    industry,
                    country,
                    state,
                    city,
                    undefined, // ranking
                    designCategory || undefined,
                    isDesignQuality || false,
                    undefined, // designScore
                    undefined // designAwardSource
                  );
                  
                  // Save to local file
                  await saveTemplateToFile(template, scrapedData);
                  console.log(`[Scraper API] ✅ Template saved to file: ${template.id}`);
                } catch (fileError) {
                  console.error(`[Scraper API] ❌ Failed to save template to file:`, getErrorMessage(fileError));
                  // Continue even if file save fails
                }
              }
            }
          }

          results.push({
            url,
            success: true,
            data: scrapedData,
            template: template || undefined,
          });

        } catch (error) {
          const errorMsg = getErrorMessage(error);
          console.error(`[Scraper API] ❌ Error scraping ${url}:`, errorMsg);
          console.error(`[Scraper API] Error details:`, error);
          logError(error, `Scraper API - Scrape ${url}`);

          results.push({
            url,
            success: false,
            error: errorMsg,
          });
        }
      }

      return res.json({
        success: true,
        results,
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      });
    } catch (error) {
      logError(error, 'Scraper API - Scrape');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Get all template sources
   * GET /api/admin/scraper/sources
   */
  app.get('/api/admin/scraper/sources', requireAdmin, async (req, res) => {
    try {
      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }

      const { industry, country, state, city } = req.query;

      let query = db.select().from(templateSources);

      const conditions = [];
      if (industry) {
        conditions.push(eq(templateSources.industry, industry as string));
      }
      if (country) {
        conditions.push(eq(templateSources.country, country as string));
      }
      if (state) {
        conditions.push(eq(templateSources.state, state as string));
      }
      if (city) {
        conditions.push(eq(templateSources.city, city as string));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const sources = await query;

      return res.json({
        success: true,
        sources,
        count: sources.length,
      });
    } catch (error) {
      logError(error, 'Scraper API - Get Sources');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Create template source
   * POST /api/admin/scraper/sources
   */
  app.post('/api/admin/scraper/sources', requireAdmin, async (req, res) => {
    try {
      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }

      const { companyName, websiteUrl, industry, country, state, city, ranking } = req.body;

      if (!companyName || !websiteUrl || !industry || !country) {
        return res.status(400).json({
          success: false,
          error: 'companyName, websiteUrl, industry, and country are required',
        });
      }

      const [source] = await db
        .insert(templateSources)
        .values({
          companyName,
          websiteUrl,
          industry,
          country,
          state: state || null,
          city: city || null,
          currentRanking: ranking || null,
          isActive: true,
        })
        .returning();

      return res.json({
        success: true,
        source,
      });
    } catch (error) {
      logError(error, 'Scraper API - Create Source');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Update template source
   * PUT /api/admin/scraper/sources/:id
   */
  app.put('/api/admin/scraper/sources/:id', requireAdmin, async (req, res) => {
    try {
      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }

      const { id } = req.params;
      const updates = req.body;

      const [source] = await db
        .update(templateSources)
        .set({
          ...updates,
          updatedAt: sql`now()`,
        })
        .where(eq(templateSources.id, id))
        .returning();

      if (!source) {
        return res.status(404).json({
          success: false,
          error: 'Source not found',
        });
      }

      return res.json({
        success: true,
        source,
      });
    } catch (error) {
      logError(error, 'Scraper API - Update Source');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Delete template source
   * DELETE /api/admin/scraper/sources/:id
   */
  app.delete('/api/admin/scraper/sources/:id', requireAdmin, async (req, res) => {
    try {
      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }

      const { id } = req.params;

      await db
        .delete(templateSources)
        .where(eq(templateSources.id, id));

      return res.json({
        success: true,
        message: 'Source deleted',
      });
    } catch (error) {
      logError(error, 'Scraper API - Delete Source');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Test endpoint for scraper (no auth required for testing)
   * POST /api/admin/scraper/test
   * Optional: { url, createTemplate, industry, country, state, city }
   */
  app.post('/api/admin/scraper/test', async (req, res) => {
    try {
      const { url, createTemplate, industry, country, state, city } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'URL is required',
        });
      }

      console.log(`[Scraper Test] Testing scraper on: ${url}`);

      const scrapedData = await scrapeWebsiteFull(url);

      let template = null;
      let sourceId = null;

      // Create template if requested
      if (createTemplate) {
        try {
          console.log('[Scraper Test] Creating template from scraped data...');

          // Generate a unique source ID
          sourceId = `src-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Create template object (works without database)
          console.log('[Scraper Test] Creating template object...');
          template = createTemplateFromScrape(
            scrapedData,
            sourceId,
            industry || 'general',
            country || 'United States',
            state,
            city,
            undefined, // ranking
            undefined, // designCategory
            false, // isDesignQuality
            undefined, // designScore
            undefined // designAwardSource
          );
          console.log(`[Scraper Test] Template object created: ${template.id} - ${template.name}`);

          // Try to save to database if available
          if (db) {
            try {
              // Create or find template source
              const [existingSource] = await db
                .select()
                .from(templateSources)
                .where(eq(templateSources.websiteUrl, url))
                .limit(1);

              if (existingSource) {
                sourceId = existingSource.id;
                template.sourceId = sourceId;
                console.log(`[Scraper Test] Found existing source: ${sourceId}`);
              } else {
                console.log('[Scraper Test] Creating new template source...');
                const [newSource] = await db
                  .insert(templateSources)
                  .values({
                    companyName: scrapedData.companyName,
                    websiteUrl: url,
                    industry: industry || 'general',
                    country: country || 'United States',
                    state: state || null,
                    city: city || null,
                    currentRanking: null,
                    isActive: true,
                  })
                  .returning();
                sourceId = newSource.id;
                template.sourceId = sourceId;
                console.log(`[Scraper Test] Created source: ${sourceId}`);
              }

              // Save scraped content
              console.log('[Scraper Test] Saving scraped content...');
              await db
                .insert(scrapedContent)
                .values({
                  sourceId,
                  htmlContent: scrapedData.htmlContent,
                  cssContent: scrapedData.cssContent,
                  images: scrapedData.images as any,
                  textContent: scrapedData.textContent as any,
                  designTokens: scrapedData.designTokens as any,
                  version: '1',
                })
                .onConflictDoNothing();

              // Save template to database
              console.log('[Scraper Test] Saving template to database...');
              await db
                .insert(brandTemplates)
                .values({
                  id: template.id,
                  name: template.name,
                  brand: template.brand,
                  category: template.category,
                  industry: template.industry,
                  thumbnail: template.thumbnail,
                  colors: template.colors as any,
                  typography: template.typography as any,
                  layout: template.layout as any,
                  css: template.css,
                  darkMode: template.darkMode || false,
                  tags: template.tags as any,
                  sourceId: template.sourceId,
                  locationCountry: template.locationCountry,
                  locationState: template.locationState,
                  locationCity: template.locationCity,
                  rankingPosition: template.rankingPosition || null,
                  contentData: template.contentData as any,
                  // Approval system - new templates need approval (default to pending)
                  isApproved: false, // Pending approval - admin must approve
                  isActive: false, // Inactive until approved
                })
                .onConflictDoUpdate({
                  target: brandTemplates.id,
                  set: {
                    name: template.name,
                    css: template.css,
                    contentData: template.contentData as any,
                    updatedAt: sql`now()`,
                  },
                });

              console.log(`[Scraper Test] ✅ Template saved to database: ${template.id}`);

              // CRITICAL: Automatically process template to ensure it works
              try {
                await processNewTemplate(template.id);
                console.log(`[Scraper Test] ✅ Template processed by Template Manager: ${template.id}`);
              } catch (processError) {
                console.error(`[Scraper Test] ⚠️ Template Manager processing failed for ${template.id}:`, getErrorMessage(processError));
                // Don't fail the scrape if processing fails
              }
            } catch (dbError: any) {
              console.warn('[Scraper Test] ⚠️ Database save failed, saving to local file instead:', dbError.message);
              // Save to local JSON file as fallback
              await saveTemplateToFile(template, scrapedData);
            }
          } else {
            console.log('[Scraper Test] Database not available, saving to local file...');
            // Save to local JSON file
            await saveTemplateToFile(template, scrapedData);
          }
        } catch (templateError: any) {
          console.error('[Scraper Test] ❌ Error creating template:', templateError);
          console.error('[Scraper Test] Error message:', templateError.message);
          // Don't fail the whole request if template creation fails
        }
      }

      return res.json({
        success: true,
        data: {
          url: scrapedData.url,
          companyName: scrapedData.companyName,
          title: scrapedData.metadata.title,
          description: scrapedData.metadata.description,
          htmlLength: scrapedData.htmlContent.length,
          cssLength: scrapedData.cssContent.length,
          imagesCount: scrapedData.images.length,
          headingsCount: scrapedData.textContent.headings.length,
          paragraphsCount: scrapedData.textContent.paragraphs.length,
          colors: scrapedData.designTokens.colors,
          typography: scrapedData.designTokens.typography,
          error: scrapedData.error,
        },
        template: template ? {
          id: template.id,
          name: template.name,
          brand: template.brand,
          industry: template.industry,
          locationCountry: template.locationCountry,
          locationState: template.locationState,
          locationCity: template.locationCity,
        } : null,
      });
    } catch (error) {
      logError(error, 'Scraper Test');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Get a scraped template by ID
   * GET /api/admin/scraper/template/:id
   */
  app.get('/api/admin/scraper/template/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      // First try to load from local file
      const filepath = path.join(TEMPLATES_DIR, `${id}.json`);
      if (fs.existsSync(filepath)) {
        const templateData = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
        return res.json({
          success: true,
          template: templateData,
          source: 'file',
        });
      }

      // Try database
      if (db) {
        try {
          const [template] = await db
            .select()
            .from(brandTemplates)
            .where(eq(brandTemplates.id, id))
            .limit(1);

          if (template) {
            return res.json({
              success: true,
              template,
              source: 'database',
            });
          }
        } catch (dbError) {
          console.warn('[Scraper] Database query failed:', dbError);
        }
      }

      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    } catch (error) {
      logError(error, 'Get Scraped Template');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * List all scraped templates
   * GET /api/admin/scraper/templates
   */
  app.get('/api/admin/scraper/templates', requireAdmin, async (_req, res) => {
    try {
      const templates: any[] = [];

      // Load from local index
      const indexPath = path.join(TEMPLATES_DIR, 'index.json');
      if (fs.existsSync(indexPath)) {
        try {
          const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
          templates.push(...index.map((t: any) => ({ ...t, source: 'file' })));
        } catch (e) {
          console.warn('[Scraper] Failed to load templates index:', e);
        }
      }

      // Also load from database if available
      if (db) {
        try {
          const dbTemplates = await db
            .select({
              id: brandTemplates.id,
              name: brandTemplates.name,
              brand: brandTemplates.brand,
              industry: brandTemplates.industry,
              locationCountry: brandTemplates.locationCountry,
              locationState: brandTemplates.locationState,
              createdAt: brandTemplates.createdAt,
            })
            .from(brandTemplates)
            .where(sql`${brandTemplates.sourceId} IS NOT NULL`)
            .limit(100);

          // Add database templates that aren't already in the list
          for (const t of dbTemplates) {
            if (!templates.find(existing => existing.id === t.id)) {
              templates.push({ ...t, source: 'database' });
            }
          }
        } catch (dbError) {
          console.warn('[Scraper] Database query failed:', dbError);
        }
      }

      return res.json({
        success: true,
        templates,
        count: templates.length,
      });
    } catch (error) {
      logError(error, 'List Scraped Templates');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Generate website from scraped template
   * POST /api/admin/scraper/generate-from-template
   */
  app.post('/api/admin/scraper/generate-from-template', requireAdmin, async (req, res) => {
    try {
      const { templateId, businessName, businessDescription, customizations: _customizations } = req.body;

      if (!templateId) {
        return res.status(400).json({
          success: false,
          error: 'Template ID is required',
        });
      }

      // Load the template
      let template: any = null;

      // First try local file
      const filepath = path.join(TEMPLATES_DIR, `${templateId}.json`);
      if (fs.existsSync(filepath)) {
        template = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      }

      // Try database if not found
      if (!template && db) {
        try {
          const [dbTemplate] = await db
            .select()
            .from(brandTemplates)
            .where(eq(brandTemplates.id, templateId))
            .limit(1);

          if (dbTemplate) {
            template = dbTemplate;
          }
        } catch (dbError) {
          console.warn('[Scraper] Database query failed:', dbError);
        }
      }

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found',
        });
      }

      // Create project config from template
      const projectConfig = {
        projectName: businessName || template.brand || 'New Website',
        projectSlug: (businessName || template.brand || 'new-website')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') + '-' + Date.now(),
        industry: template.industry || 'General Business',
        targetAudience: 'Local customers seeking professional services',
        goals: ['Generate leads', 'Build trust', 'Showcase services'],
        tone: 'professional',
        description: businessDescription || `Professional ${template.industry} services`,
        brandPreferences: {
          primaryColor: template.colors?.primary || '#2563eb',
          secondaryColor: template.colors?.secondary || '#1e40af',
          accentColor: template.colors?.accent || '#3b82f6',
          backgroundColor: template.colors?.background || '#ffffff',
          textColor: template.colors?.text || '#1f2937',
          headingFont: template.typography?.headingFont || 'Inter',
          bodyFont: template.typography?.bodyFont || 'Inter',
        },
        templateId: template.id,
        templateData: template,
      };

      // Return the project config for the wizard to use
      return res.json({
        success: true,
        projectConfig,
        template: {
          id: template.id,
          name: template.name,
          brand: template.brand,
          industry: template.industry,
          colors: template.colors,
          typography: template.typography,
          layout: template.layout,
        },
        message: 'Project config created from template. Use this with the website builder.',
      });
    } catch (error) {
      logError(error, 'Generate From Template');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Bulk scrape top 100 websites for all industries
   * POST /api/admin/scraper/bulk-scrape-all-industries
   */
  app.post('/api/admin/scraper/bulk-scrape-all-industries', requireAdmin, async (req, res) => {
    try {
      const { country = 'United States', state, city, limit = 100 } = req.body;

      // Import industries list
      const { INDUSTRIES } = await import('../services/aiTemplateGenerator');

      console.log(`[Bulk Scraper] Starting bulk scrape for ${INDUSTRIES.length} industries`);
      console.log(`[Bulk Scraper] Target: Top ${limit} per industry`);
      console.log(`[Bulk Scraper] Location: ${city || state || country}`);

      const results: Array<{
        industry: string;
        success: boolean;
        scraped: number;
        failed: number;
        errors?: string[];
      }> = [];

      // Scrape each industry
      for (let i = 0; i < INDUSTRIES.length; i++) {
        const industry = INDUSTRIES[i];
        console.log(`[Bulk Scraper] [${i + 1}/${INDUSTRIES.length}] Processing: ${industry}`);

        try {
          // Search for top 100 companies in this industry
          const searchResults = await searchGoogleRankings(
            industry,
            country,
            state || undefined,
            city || undefined,
            limit
          );

          if (searchResults.length === 0) {
            console.warn(`[Bulk Scraper] ⚠️ No results for ${industry}`);
            results.push({
              industry,
              success: false,
              scraped: 0,
              failed: 0,
              errors: ['No search results found'],
            });
            continue;
          }

          // Scrape each website
          let scraped = 0;
          let failed = 0;
          const errors: string[] = [];

          for (let j = 0; j < searchResults.length; j++) {
            const result = searchResults[j];
            console.log(`[Bulk Scraper]   [${j + 1}/${searchResults.length}] Scraping: ${result.websiteUrl}`);

            try {
              const scrapedData = await scrapeWebsiteFull(result.websiteUrl);

              if (scrapedData.error) {
                failed++;
                errors.push(`${result.websiteUrl}: ${scrapedData.error}`);
                continue;
              }

              // Save to database
              if (db) {
                // Check if source already exists
                const existingSource = await db
                  .select()
                  .from(templateSources)
                  .where(eq(templateSources.websiteUrl, result.websiteUrl))
                  .limit(1);

                let sourceId: string | undefined;

                if (existingSource.length > 0) {
                  sourceId = existingSource[0].id;
                } else {
                  // Create new source
                  const [newSource] = await db
                    .insert(templateSources)
                    .values({
                      companyName: scrapedData.companyName,
                      websiteUrl: result.websiteUrl,
                      industry: industry,
                      country: country,
                      state: state || null,
                      city: city || null,
                      currentRanking: result.ranking || null,
                      isActive: true,
                    })
                    .returning();

                  sourceId = newSource.id;
                }

                // Save scraped content
                if (sourceId) {
                  await db
                    .insert(scrapedContent)
                    .values({
                      sourceId,
                      htmlContent: scrapedData.htmlContent,
                      cssContent: scrapedData.cssContent,
                      images: scrapedData.images as any,
                      textContent: scrapedData.textContent as any,
                      designTokens: scrapedData.designTokens as any,
                      version: '1',
                    })
                    .onConflictDoNothing();
                }

                // Create template
                if (sourceId) {
                  const template = createTemplateFromScrape(
                    scrapedData,
                    sourceId,
                    industry,
                    country,
                    state,
                    city,
                    result.ranking ? String(result.ranking) : undefined,
                    undefined, // designCategory
                    false, // isDesignQuality
                    undefined, // designScore
                    undefined // designAwardSource
                  );

                  // Save template to database
                  await db
                    .insert(brandTemplates)
                    .values({
                      id: template.id,
                      name: template.name,
                      brand: template.brand,
                      category: template.category,
                      industry: template.industry,
                      thumbnail: template.thumbnail,
                      colors: template.colors as any,
                      typography: template.typography as any,
                      layout: template.layout as any,
                      css: template.css,
                      darkMode: template.darkMode || false,
                      tags: template.tags as any,
                      sourceId: template.sourceId,
                      locationCountry: template.locationCountry,
                      locationState: template.locationState,
                      locationCity: template.locationCity,
                      rankingPosition: template.rankingPosition ? String(template.rankingPosition) : null,
                      contentData: template.contentData as any,
                      // Design quality fields (default to false/null for ranking-based scraping)
                      isDesignQuality: template.isDesignQuality || false,
                      designCategory: template.designCategory || null,
                      designScore: template.designScore || null,
                      designAwardSource: template.designAwardSource || null,
                      isActive: true,
                    })
                    .onConflictDoUpdate({
                      target: brandTemplates.id,
                      set: {
                        name: template.name,
                        brand: template.brand,
                        industry: template.industry,
                        isDesignQuality: template.isDesignQuality || false,
                        designCategory: template.designCategory || null,
                        updatedAt: new Date(),
                      },
                    });

                  scraped++;

                  // CRITICAL: Automatically process template to ensure it works
                  try {
                    await processNewTemplate(template.id);
                    console.log(`[Ranking Scraper] ✅ Template processed by Template Manager: ${template.id}`);
                  } catch (processError) {
                    console.error(`[Ranking Scraper] ⚠️ Template Manager processing failed for ${template.id}:`, getErrorMessage(processError));
                    // Don't fail the scrape if processing fails
                  }
                }
              }
            } catch (error) {
              failed++;
              const errorMsg = getErrorMessage(error);
              errors.push(`${result.websiteUrl}: ${errorMsg}`);
              console.error(`[Bulk Scraper] Error scraping ${result.websiteUrl}:`, errorMsg);
            }

            // Rate limiting - wait between requests
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          results.push({
            industry,
            success: scraped > 0,
            scraped,
            failed,
            errors: errors.length > 0 ? errors.slice(0, 5) : undefined, // Limit errors shown
          });

          console.log(`[Bulk Scraper] ✅ ${industry}: ${scraped} scraped, ${failed} failed`);
        } catch (error) {
          const errorMsg = getErrorMessage(error);
          console.error(`[Bulk Scraper] ❌ Error processing ${industry}:`, errorMsg);
          results.push({
            industry,
            success: false,
            scraped: 0,
            failed: 0,
            errors: [errorMsg],
          });
        }
      }

      const totalScraped = results.reduce((sum, r) => sum + r.scraped, 0);
      const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

      console.log(`[Bulk Scraper] ✅ Complete: ${totalScraped} templates scraped, ${totalFailed} failed`);

      return res.json({
        success: true,
        results,
        summary: {
          totalIndustries: INDUSTRIES.length,
          totalScraped,
          totalFailed,
          successfulIndustries: results.filter(r => r.success).length,
        },
      });
    } catch (error) {
      logError(error, 'Bulk Scraper - Scrape All Industries');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Search for design-quality websites (without scraping)
   * POST /api/admin/scraper/search-design-quality
   * Returns list of design websites found, allowing user to select which ones to scrape
   */
  console.log('[WebsiteScraper Routes] ✅ Registering POST /api/admin/scraper/search-design-quality');
  app.post('/api/admin/scraper/search-design-quality', requireAdmin, async (req, res) => {
    try {
      const { designCategory, limit = 100, country = 'United States' } = req.body;

      if (!designCategory) {
        return res.status(400).json({
          success: false,
          error: 'Design category is required',
        });
      }

      console.log(`[Design Scraper API] Searching for design websites: ${designCategory} (limit: ${limit}, country: ${country})`);

      // Import design quality scraper
      const { scrapeTopDesignWebsites, DESIGN_CATEGORIES } = await import('../services/designQualityScraper');

      // Validate category
      if (!DESIGN_CATEGORIES.includes(designCategory)) {
        return res.status(400).json({
          success: false,
          error: `Invalid design category. Must be one of: ${DESIGN_CATEGORIES.join(', ')}`,
        });
      }

      // Search for design websites (without scraping)
      const designWebsites = await scrapeTopDesignWebsites(designCategory, limit, country);

      if (designWebsites.length === 0) {
        console.log(`[Design Scraper API] ⚠️ No websites found for ${designCategory}`);
        return res.json({
          success: true,
          websites: [],
          count: 0,
          message: 'No design-quality websites found. This may be due to Google API limitations or no results for this category.',
        });
      }

      // Return results without scraping
      const results = designWebsites.map((site, index) => ({
        name: site.title || 'Unknown',
        url: site.url,
        description: site.description || '',
        category: site.category,
        awardSource: site.awardSource || 'Unknown',
        ranking: index + 1,
      }));

      console.log(`[Design Scraper API] ✅ Found ${results.length} design websites for ${designCategory}`);

      return res.json({
        success: true,
        websites: results,
        count: results.length,
        category: designCategory,
        country,
      });
    } catch (error) {
      console.error(`[Design Scraper API] ❌ Error in search-design-quality route:`, error);
      logError(error, 'Design Quality Search');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Scrape top design-quality websites by category
   * POST /api/admin/scraper/scrape-design-quality
   */
  console.log('[WebsiteScraper Routes] ✅ Registering POST /api/admin/scraper/scrape-design-quality');
  app.post('/api/admin/scraper/scrape-design-quality', requireAdmin, async (req, res) => {
    try {
      console.log(`[Design Scraper API] ✅ Route hit! Request received for design quality scraping`);
      console.log(`[Design Scraper API] Request body:`, JSON.stringify(req.body, null, 2));
      const { designCategory, limit = 100, country = 'United States', streamProgress = false } = req.body;

      // Check if client wants streaming progress
      const wantsStreaming = req.headers.accept?.includes('text/event-stream') || streamProgress;

      // Global pause key for this scraping session
      const pauseKey = `scrape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      if (wantsStreaming) {
        // Set up Server-Sent Events for real-time progress
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        res.write(': connected\n\n');
        res.write(`data: ${JSON.stringify({
          type: 'connected',
          pauseKey,
        })}\n\n`);
        console.log('[Design Scraper API] ✅ SSE connection established for progress streaming');
      }

      if (!designCategory) {
        console.log(`[Design Scraper API] ❌ Missing designCategory in request body`);
        return res.status(400).json({
          success: false,
          error: 'Design category is required',
        });
      }

      console.log(`[Design Scraper] Starting design quality scrape for category: ${designCategory} (limit: ${limit})`);

      // Import design quality scraper
      const { scrapeTopDesignWebsites, DESIGN_CATEGORIES } = await import('../services/designQualityScraper');

      // Validate category
      if (!DESIGN_CATEGORIES.includes(designCategory)) {
        return res.status(400).json({
          success: false,
          error: `Invalid design category. Must be one of: ${DESIGN_CATEGORIES.join(', ')}`,
        });
      }

      // Send initial progress update
      if (wantsStreaming) {
        res.write(`data: ${JSON.stringify({
          type: 'progress',
          progress: 5,
          message: 'Searching for design award websites...',
          currentUrl: 'Searching...',
        })}\n\n`);
      }

      // Search for design award winners
      const designWebsites = await scrapeTopDesignWebsites(designCategory, limit, country);

      // Send progress update after search
      if (wantsStreaming) {
        res.write(`data: ${JSON.stringify({
          type: 'progress',
          progress: 10,
          message: `Found ${designWebsites.length} website(s) to scrape`,
          currentUrl: `Found ${designWebsites.length} website(s)`,
        })}\n\n`);
      }

      if (designWebsites.length === 0) {
        const errorMsg = `[Design Scraper] ⚠️ No websites found for ${designCategory}. This may be due to:
- Google API limitations or quota exceeded
- No results for this category
- Google API not configured (check GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID)
- Award sites not returning results`;
        console.log(errorMsg);

        if (wantsStreaming) {
          res.write(`data: ${JSON.stringify({
            type: 'error',
            error: 'No websites found. Check server logs for details.',
            progress: 100,
            results: [],
            summary: {
              total: 0,
              successful: 0,
              failed: 0,
              category: designCategory,
            },
          })}\n\n`);
          res.end();
          return;
        }

        return res.json({
          success: false,
          error: 'No design-quality websites found. Check server logs for details.',
          message: 'No design-quality websites found. This feature requires Google Custom Search API configuration or design award site integration.',
          websites: [],
          count: 0,
          results: [],
          summary: {
            total: 0,
            successful: 0,
            failed: 0,
            category: designCategory,
          },
        });
      }

      // Scrape each website in batches of 10
      const results: Array<{
        url: string;
        success: boolean;
        template?: any;
        error?: string;
      }> = [];

      const BATCH_SIZE = 10;
      let currentBatch = 0;
      let shouldContinue = true;

      // Helper function to wait for user confirmation
      const waitForConfirmation = (batchNum: number, processed: number, remaining: number): Promise<void> => {
        return new Promise((resolve, _reject) => {
          // Store resolver in global map
          globalPauseResolvers.set(pauseKey, resolve);

          // Send pause message to client
          if (wantsStreaming) {
            res.write(`data: ${JSON.stringify({
              type: 'batch-complete',
              pauseKey,
              batchNumber: batchNum,
              batchSize: BATCH_SIZE,
              totalProcessed: processed,
              totalRemaining: remaining,
              message: `Batch ${batchNum} complete (${processed} processed, ${remaining} remaining). Click Continue to proceed.`,
            })}\n\n`);
          }

          // Set timeout to auto-continue after 5 minutes (safety measure)
          setTimeout(() => {
            if (globalPauseResolvers.has(pauseKey)) {
              console.log(`[Design Scraper] Auto-continuing after timeout`);
              globalPauseResolvers.delete(pauseKey);
              resolve();
            }
          }, 5 * 60 * 1000); // 5 minutes
        });
      };

      for (let i = 0; i < designWebsites.length && shouldContinue; i++) {
        // Check if we need to pause after a batch of 10
        if (i > 0 && i % BATCH_SIZE === 0) {
          currentBatch++;
          const processed = results.length;
          const remaining = designWebsites.length - i;
          console.log(`[Design Scraper] Batch ${currentBatch} complete. Waiting for user confirmation...`);

          // Wait for user confirmation before continuing
          try {
            await waitForConfirmation(currentBatch, processed, remaining);
            console.log(`[Design Scraper] User confirmed. Continuing with batch ${currentBatch + 1}...`);
          } catch (error) {
            console.log(`[Design Scraper] Scraping cancelled by user`);
            shouldContinue = false;
            break;
          }
        }

        const website = designWebsites[i];
        // Calculate progress: 10% for search, 90% for scraping (10% + 90% * (i+1)/total)
        const baseProgress = 10; // Already completed search phase
        const scrapingProgress = Math.round((i / designWebsites.length) * 90);
        const progress = baseProgress + scrapingProgress;
        console.log(`[Design Scraper] [${i + 1}/${designWebsites.length}] Scraping: ${website.url} (${progress}%)`);

        // Send progress update BEFORE scraping starts
        if (wantsStreaming) {
          res.write(`data: ${JSON.stringify({
            type: 'progress',
            progress: Math.max(progress, 10), // Ensure at least 10% after search
            current: i + 1,
            total: designWebsites.length,
            currentUrl: website.url,
            batchNumber: currentBatch + 1,
            batchPosition: (i % BATCH_SIZE) + 1,
            message: `Starting to scrape ${i + 1} of ${designWebsites.length}: ${website.url}`,
          })}\n\n`);
        }

        try {
          // Send progress update during scraping (mid-point)
          const midProgress = baseProgress + Math.round((i + 0.5) / designWebsites.length * 90);
          if (wantsStreaming) {
            res.write(`data: ${JSON.stringify({
              type: 'progress',
              progress: Math.max(midProgress, progress),
              currentUrl: `Scraping ${website.url}...`,
              message: `Scraping content from ${website.url}`,
            })}\n\n`);
          }

          const scrapedData = await scrapeWebsiteFull(website.url);

          if (scrapedData.error) {
            results.push({
              url: website.url,
              success: false,
              error: scrapedData.error,
            });
            continue;
          }

          // Save to database
          let sourceId: string | undefined;
          let template: any;

          if (db) {
            // Check if source already exists
            const existingSource = await db
              .select()
              .from(templateSources)
              .where(eq(templateSources.websiteUrl, website.url))
              .limit(1);

            if (existingSource.length > 0) {
              sourceId = existingSource[0].id;
            } else {
              // Create new source (no industry/ranking for design quality)
              const [newSource] = await db
                .insert(templateSources)
                .values({
                  companyName: website.title || scrapedData.companyName,
                  websiteUrl: website.url,
                  industry: designCategory, // Use design category as industry
                  country: country,
                  state: null,
                  city: null,
                  currentRanking: null, // No ranking for design quality
                  isActive: true,
                })
                .returning();

              sourceId = newSource.id;
            }

            // Save scraped content
            if (sourceId) {
              await db
                .insert(scrapedContent)
                .values({
                  sourceId,
                  htmlContent: scrapedData.htmlContent,
                  cssContent: scrapedData.cssContent,
                  images: scrapedData.images as any,
                  textContent: scrapedData.textContent as any,
                  designTokens: scrapedData.designTokens as any,
                  version: '1',
                })
                .onConflictDoNothing();
            }

            // Create template with design quality fields
            if (sourceId) {
              template = createTemplateFromScrape(
                scrapedData,
                sourceId,
                designCategory, // Use design category as industry
                country,
                undefined, // No state
                undefined, // No city
                undefined, // No ranking
                designCategory, // Design category
                true, // isDesignQuality = true
                website.designScore, // Design score
                website.awardSource // Award source
              );

              // Save template to database with design quality fields
              await db
                .insert(brandTemplates)
                .values({
                  id: template.id,
                  name: template.name,
                  brand: template.brand,
                  category: template.category,
                  industry: designCategory, // Use design category
                  thumbnail: template.thumbnail,
                  colors: template.colors as any,
                  typography: template.typography as any,
                  layout: template.layout as any,
                  css: template.css,
                  darkMode: template.darkMode || false,
                  tags: template.tags as any,
                  sourceId: template.sourceId,
                  locationCountry: template.locationCountry,
                  locationState: template.locationState,
                  locationCity: template.locationCity,
                  rankingPosition: null, // No ranking for design quality
                  contentData: template.contentData as any,
                  // NEW: Design quality fields
                  isDesignQuality: true,
                  designCategory: designCategory,
                  designScore: website.designScore ? String(website.designScore) : null,
                  designAwardSource: website.awardSource || null,
                  isActive: true,
                })
                .onConflictDoUpdate({
                  target: brandTemplates.id,
                  set: {
                    name: template.name,
                    brand: template.brand,
                    industry: designCategory,
                    designCategory: designCategory,
                    isDesignQuality: true,
                    updatedAt: new Date(),
                  },
                });

              results.push({
                url: website.url,
                success: true,
                template,
              });

              // CRITICAL: Automatically process template to ensure it works
              if (template) {
                try {
                  await processNewTemplate(template.id);
                  console.log(`[Design Scraper] ✅ Template processed by Template Manager: ${template.id}`);
                } catch (processError) {
                  console.error(`[Design Scraper] ⚠️ Template Manager processing failed for ${template.id}:`, getErrorMessage(processError));
                  // Don't fail the scrape if processing fails
                }
              }

              // Send success update if streaming
              if (wantsStreaming) {
                const currentProgress = 10 + Math.round(((i + 1) / designWebsites.length) * 90);
                const currentSuccessful = results.filter(r => r.success).length;
                const currentFailed = results.filter(r => !r.success).length;
                res.write(`data: ${JSON.stringify({
                  type: 'success',
                  url: website.url,
                  templateId: template.id,
                  templateName: template.name,
                  progress: Math.min(currentProgress, 100),
                  current: i + 1,
                  total: designWebsites.length,
                  successful: currentSuccessful,
                  failed: currentFailed,
                })}\n\n`);
              }
            }
          }
        } catch (error) {
          const errorMsg = getErrorMessage(error);
          console.error(`[Design Scraper] ❌ Error scraping ${website.url}:`, errorMsg);
          console.error(`[Design Scraper] Error details:`, error);

          results.push({
            url: website.url,
            success: false,
            error: errorMsg,
          });

          // Send error update if streaming
          if (wantsStreaming) {
            const currentProgress = 10 + Math.round(((i + 1) / designWebsites.length) * 90);
            const currentSuccessful = results.filter(r => r.success).length;
            const currentFailed = results.filter(r => !r.success).length;
            res.write(`data: ${JSON.stringify({
              type: 'error',
              url: website.url,
              error: errorMsg,
              progress: Math.min(currentProgress, 100),
              current: i + 1,
              total: designWebsites.length,
              successful: currentSuccessful,
              failed: currentFailed,
            })}\n\n`);
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log(`[Design Scraper] ✅ Complete: ${successful} templates created, ${failed} failed`);

      // Send final result
      if (wantsStreaming) {
        res.write(`data: ${JSON.stringify({
          type: 'complete',
          success: true,
          results,
          summary: {
            total: designWebsites.length,
            successful,
            failed,
            category: designCategory,
          },
        })}\n\n`);
        return res.end();
      } else {
        return res.json({
          success: true,
          results,
          summary: {
            total: designWebsites.length,
            successful,
            failed,
            category: designCategory,
          },
        });
      }
    } catch (error) {
      console.error(`[Design Scraper API] ❌ Error in scrape-design-quality route:`, error);
      logError(error, 'Design Quality Scraper');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Test endpoint to verify route registration
   * GET /api/admin/scraper/test-design-route
   */
  app.get('/api/admin/scraper/test-design-route', requireAdmin, async (_req, res) => {
    return res.json({
      success: true,
      message: 'Design quality scraper route is registered and accessible',
      timestamp: new Date().toISOString(),
    });
  });

  // Endpoint to continue paused scraping
  app.post('/api/admin/scraper/continue-scraping', requireAdmin, async (req, res) => {
    try {
      const { pauseKey } = req.body;

      if (!pauseKey) {
        return res.status(400).json({
          success: false,
          error: 'pauseKey is required',
        });
      }

      const resolver = globalPauseResolvers.get(pauseKey);
      if (resolver) {
        resolver();
        globalPauseResolvers.delete(pauseKey);
        return res.json({
          success: true,
          message: 'Scraping continued',
        });
      } else {
        return res.status(404).json({
          success: false,
          error: 'Pause key not found or already resolved',
        });
      }
    } catch (error) {
      logError(error, 'Continue Scraping');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Bulk scrape top websites for ALL design categories
   * POST /api/admin/scraper/bulk-scrape-all-design-categories
   */
  console.log('[WebsiteScraper Routes] ✅ Registering POST /api/admin/scraper/bulk-scrape-all-design-categories');
  app.post('/api/admin/scraper/bulk-scrape-all-design-categories', requireAdmin, async (req, res) => {
    try {
      const { limit = 10, country = 'United States' } = req.body;

      // Import design categories
      const { DESIGN_CATEGORIES, scrapeTopDesignWebsites } = await import('../services/designQualityScraper');
      const { processNewTemplate } = await import('../services/templateManager');

      console.log(`[Design Bulk Scraper] Starting bulk scrape for ${DESIGN_CATEGORIES.length} design categories`);
      console.log(`[Design Bulk Scraper] Target: Top ${limit} per category`);

      const results: Array<{
        category: string;
        success: boolean;
        scraped: number;
        failed: number;
        errors?: string[];
      }> = [];

      // Scrape each design category
      for (let i = 0; i < DESIGN_CATEGORIES.length; i++) {
        const category = DESIGN_CATEGORIES[i];
        console.log(`[Design Bulk Scraper] [${i + 1}/${DESIGN_CATEGORIES.length}] Processing: ${category}`);

        try {
          // Search for top design websites in this category
          const designWebsites = await scrapeTopDesignWebsites(category, limit, country);

          if (designWebsites.length === 0) {
            console.warn(`[Design Bulk Scraper] ⚠️ No results for ${category}`);
            results.push({
              category,
              success: false,
              scraped: 0,
              failed: 0,
              errors: ['No design websites found for this category'],
            });
            continue;
          }

          // Scrape each website
          let scraped = 0;
          let failed = 0;
          const errors: string[] = [];

          for (let j = 0; j < designWebsites.length; j++) {
            const website = designWebsites[j];
            console.log(`[Design Bulk Scraper]   [${j + 1}/${designWebsites.length}] Scraping: ${website.url}`);

            try {
              const scrapedData = await scrapeWebsiteFull(website.url);

              if (scrapedData.error) {
                failed++;
                errors.push(`${website.url}: ${scrapedData.error}`);
                continue;
              }

              // Create template from scraped data
              const sourceId = `design-bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              const template = createTemplateFromScrape(
                scrapedData,
                sourceId,
                category, // industry
                country, // country
                undefined, // state
                undefined, // city
                undefined, // ranking
                category, // designCategory
                true, // isDesignQuality
                website.designScore || undefined, // designScore
                website.awardSource || undefined // designAwardSource
              );

              if (template && db) {
                // Save to database
                await db
                  .insert(brandTemplates)
                  .values({
                    id: template.id,
                    sourceUrl: template.sourceUrl,
                    htmlContent: template.htmlContent,
                    cssContent: template.cssContent,
                    jsContent: template.jsContent,
                    assets: template.assets as any,
                    name: template.name,
                    brand: template.brand,
                    category: template.category,
                    industry: category,
                    thumbnail: template.thumbnail,
                    colors: template.colors as any,
                    typography: template.typography as any,
                    layout: template.layout as any,
                    css: template.css,
                    darkMode: template.darkMode || false,
                    tags: template.tags as any,
                    sourceId: template.sourceId,
                    isDesignQuality: true,
                    designCategory: category,
                    designScore: website.designScore ? String(website.designScore) : null,
                    designAwardSource: website.awardSource || null,
                    isActive: true,
                  })
                  .onConflictDoUpdate({
                    target: brandTemplates.id,
                    set: {
                      name: template.name,
                      brand: template.brand,
                      industry: category,
                      isDesignQuality: true,
                      designCategory: category,
                      updatedAt: new Date(),
                    },
                  });

                scraped++;

                // Process template with Template Manager
                try {
                  await processNewTemplate(template.id);
                  console.log(`[Design Bulk Scraper] ✅ Template processed: ${template.id}`);
                } catch (processError) {
                  console.error(`[Design Bulk Scraper] ⚠️ Template processing failed for ${template.id}:`, getErrorMessage(processError));
                }
              } else if (template) {
                // Save to file if no database
                await saveTemplateToFile(template, scrapedData);
                scraped++;
              }
            } catch (error) {
              failed++;
              const errorMsg = getErrorMessage(error);
              errors.push(`${website.url}: ${errorMsg}`);
              console.error(`[Design Bulk Scraper] Error scraping ${website.url}:`, errorMsg);
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          results.push({
            category,
            success: scraped > 0,
            scraped,
            failed,
            errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
          });

          console.log(`[Design Bulk Scraper] ✅ ${category}: ${scraped} scraped, ${failed} failed`);
        } catch (error) {
          const errorMsg = getErrorMessage(error);
          console.error(`[Design Bulk Scraper] ❌ Error processing ${category}:`, errorMsg);
          results.push({
            category,
            success: false,
            scraped: 0,
            failed: 0,
            errors: [errorMsg],
          });
        }

        // Rate limiting between categories
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      const totalScraped = results.reduce((sum, r) => sum + r.scraped, 0);
      const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

      console.log(`[Design Bulk Scraper] ✅ Complete: ${totalScraped} templates scraped, ${totalFailed} failed`);

      return res.json({
        success: true,
        results,
        summary: {
          totalCategories: DESIGN_CATEGORIES.length,
          totalScraped,
          totalFailed,
          successfulCategories: results.filter(r => r.success).length,
        },
      });
    } catch (error) {
      logError(error, 'Design Bulk Scraper - All Categories');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  console.log('[WebsiteScraper Routes] ✅ All website scraper routes registered successfully');
}

