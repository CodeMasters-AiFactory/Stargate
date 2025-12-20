/**
 * Template Manager Service
 * 
 * Automatically processes every scraped template to ensure it works:
 * - Extracts ALL CSS (inline + external)
 * - Extracts ALL JS (inline + external)
 * - Converts relative URLs to absolute
 * - Downloads critical images
 * - Stores source URL and hash for change detection
 * - Verifies template renders correctly
 */

import { db } from '../db';
import { brandTemplates, templateUpdateLogs } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { getErrorMessage, logError } from '../utils/errorHandler';
import * as crypto from 'crypto';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { downloadAllAssets } from './assetDownloader';
import { embedFontsInCSS } from './fontExtractor';
import { createBundledTemplate, verifyBundledTemplate } from './templateBundler';

export interface TemplateProcessingResult {
  success: boolean;
  templateId: string;
  cssExtracted: number; // bytes
  jsExtracted: number; // bytes
  urlsConverted: number;
  imagesProcessed: number;
  errors: string[];
}

/**
 * Process a newly scraped template to ensure it works
 * Called automatically after every scrape
 */
export async function processNewTemplate(templateId: string): Promise<TemplateProcessingResult> {
  const errors: string[] = [];
  let cssExtracted = 0;
  let jsExtracted = 0;
  let urlsConverted = 0;
  let imagesProcessed = 0;

  try {
    console.log(`[TemplateManager] 🔄 Processing new template: ${templateId}`);

    if (!db) {
      throw new Error('Database not available');
    }

    // Load template from database
    const [template] = await db
      .select()
      .from(brandTemplates)
      .where(eq(brandTemplates.id, templateId))
      .limit(1);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const contentData = (template.contentData as any) || {};
    let html = contentData.html || '';
    let css = template.css || contentData.css || '';
    let js = contentData.js || '';

    // Get source URL from metadata
    const sourceUrl = contentData.metadata?.url || contentData.metadata?.sourceUrl || '';
    
    if (!sourceUrl) {
      console.warn(`[TemplateManager] ⚠️ No source URL found for template ${templateId}`);
    }

    // Step 1: Extract ALL CSS (ensure we have everything)
    if (html) {
      const $ = cheerio.load(html);
      
      // Extract inline CSS from <style> tags
      $('style').each((_, el) => {
        const inlineCSS = $(el).html() || '';
        if (inlineCSS && !css.includes(inlineCSS)) {
          css += '\n' + inlineCSS;
        }
      });

      // Extract external CSS URLs and download them
      const cssLinks: string[] = [];
      $('link[rel="stylesheet"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('data:')) {
          cssLinks.push(href);
        }
      });

      // Download external CSS files using assetDownloader
      if (cssLinks.length > 0 && sourceUrl) {
        try {
          const assets = await downloadAllAssets(html, css, sourceUrl);
          // Assets are downloaded, but we'll inline them later via bundler
          cssExtracted += assets.totalSize;
          errors.push(...assets.errors);
        } catch (error) {
          errors.push(`Failed to download assets: ${getErrorMessage(error)}`);
        }
      }
    }

    // Step 2: Extract ALL JavaScript
    if (html) {
      const $ = cheerio.load(html);
      
      // Extract inline JS from <script> tags
      $('script:not([src])').each((_, el) => {
        const inlineJS = $(el).html() || '';
        if (inlineJS && !js.includes(inlineJS)) {
          js += '\n' + inlineJS;
        }
      });

      // Extract external JS URLs and download them (skip analytics)
      const jsLinks: string[] = [];
      $('script[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (src && 
            !src.startsWith('data:') &&
            !src.includes('google-analytics') &&
            !src.includes('gtag') &&
            !src.includes('googletagmanager') &&
            !src.includes('facebook.net') &&
            !src.includes('doubleclick') &&
            !src.includes('analytics')) {
          jsLinks.push(src);
        }
      });

      // Download external JS files
      for (const jsUrl of jsLinks) {
        try {
          const absoluteUrl = jsUrl.startsWith('http') 
            ? jsUrl 
            : sourceUrl 
              ? new URL(jsUrl, sourceUrl).href 
              : jsUrl;
          
          const response = await fetch(absoluteUrl);
          if (response.ok) {
            const jsContent = await response.text();
            js += '\n// External JS: ' + jsUrl + '\n' + jsContent;
            jsExtracted += jsContent.length;
          }
        } catch (error) {
          errors.push(`Failed to download JS: ${jsUrl} - ${getErrorMessage(error)}`);
        }
      }
    }

    // Step 3: Convert ALL relative URLs to absolute URLs
    if (html && sourceUrl) {
      try {
        const baseUrl = new URL(sourceUrl);
        
        // Convert CSS links
        html = html.replace(/href=["'](\/[^"']+)["']/g, (match, path) => {
          if (path.startsWith('//') || path.startsWith('http')) return match;
          urlsConverted++;
          return `href="${baseUrl.origin}${path}"`;
        });

        // Convert JS sources
        html = html.replace(/src=["'](\/[^"']+)["']/g, (match, path) => {
          if (path.startsWith('//') || path.startsWith('http')) return match;
          urlsConverted++;
          return `src="${baseUrl.origin}${path}"`;
        });

        // Convert image sources
        html = html.replace(/<img([^>]*)\ssrc=["'](\/[^"']+)["']/g, (match, attrs, path) => {
          if (path.startsWith('//') || path.startsWith('http')) return match;
          urlsConverted++;
          imagesProcessed++;
          return `<img${attrs} src="${baseUrl.origin}${path}"`;
        });
      } catch (error) {
        errors.push(`Failed to convert URLs: ${getErrorMessage(error)}`);
      }
    }

    // Step 4: Embed fonts in CSS
    if (css && sourceUrl) {
      try {
        const fontResult = await embedFontsInCSS(css, sourceUrl);
        css = fontResult.css;
        if (fontResult.fonts.length > 0) {
          console.log(`[TemplateManager] ✅ Embedded ${fontResult.fonts.length} fonts`);
        }
        if (fontResult.errors.length > 0) {
          errors.push(...fontResult.errors);
        }
      } catch (error) {
        console.warn(`[TemplateManager] ⚠️ Font embedding failed: ${getErrorMessage(error)}`);
        errors.push(`Failed to embed fonts: ${getErrorMessage(error)}`);
      }
    }

    // Step 5: Create bundled version (self-contained HTML)
    let bundledHTML = html;
    if (sourceUrl) {
      try {
        const images = contentData.images || [];
        const imagesWithDataUri = images
          .filter((img: any) => img.data)
          .map((img: any) => ({ url: img.url, dataUri: img.data }));
        
        const bundled = await createBundledTemplate(html, css, sourceUrl, imagesWithDataUri);
        bundledHTML = bundled.html;
        console.log(`[TemplateManager] ✅ Created bundled template: ${(bundled.size / 1024 / 1024).toFixed(2)} MB`);
        
        // Verify bundle is self-contained
        const verification = verifyBundledTemplate(bundledHTML);
        if (!verification.isSelfContained) {
          console.warn(`[TemplateManager] ⚠️ Bundle has ${verification.externalDependencies.length} external dependencies`);
        }
      } catch (error) {
        console.warn(`[TemplateManager] ⚠️ Bundling failed: ${getErrorMessage(error)}`);
        errors.push(`Failed to create bundle: ${getErrorMessage(error)}`);
      }
    }

    // Step 6: Calculate content hash for change detection
    const contentHash = crypto
      .createHash('sha256')
      .update(html + css + js)
      .digest('hex');

    // Step 7: Update template in database with processed data
    const updatedContentData = {
      ...contentData,
      html,
      css,
      js,
      bundledHtml: bundledHTML, // Store bundled version for offline use
      metadata: {
        ...contentData.metadata,
        sourceUrl: sourceUrl || contentData.metadata?.sourceUrl,
        lastChecked: new Date().toISOString(),
        processedAt: new Date().toISOString(),
      },
    };

    await db
      .update(brandTemplates)
      .set({
        css: css.trim(),
        contentData: updatedContentData,
        sourceHash: contentHash,
        lastChecked: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(brandTemplates.id, templateId));

    // Step 6: Log processing result
    await db.insert(templateUpdateLogs).values({
      templateId,
      updateType: 'scrape',
      status: errors.length === 0 ? 'success' : 'failed',
      errorMessage: errors.length > 0 ? errors.join('; ') : null,
      changesDetected: {
        cssExtracted,
        jsExtracted,
        urlsConverted,
        imagesProcessed,
      },
    });

    console.log(`[TemplateManager] ✅ Processed template ${templateId}: ${cssExtracted} bytes CSS, ${jsExtracted} bytes JS, ${urlsConverted} URLs converted`);

    return {
      success: errors.length === 0,
      templateId,
      cssExtracted,
      jsExtracted,
      urlsConverted,
      imagesProcessed,
      errors,
    };
  } catch (error) {
    logError(error, 'TemplateManager - Process New Template');
    
    // Log failure
    if (db) {
      try {
        await db.insert(templateUpdateLogs).values({
          templateId,
          updateType: 'scrape',
          status: 'failed',
          errorMessage: getErrorMessage(error),
        });
      } catch (logError) {
        console.error('[TemplateManager] Failed to log error:', logError);
      }
    }

    return {
      success: false,
      templateId,
      cssExtracted,
      jsExtracted,
      urlsConverted,
      imagesProcessed,
      errors: [getErrorMessage(error)],
    };
  }
}

/**
 * Verify a template renders correctly
 */
export async function verifyTemplate(templateId: string): Promise<boolean> {
  try {
    if (!db) return false;

    const [template] = await db
      .select()
      .from(brandTemplates)
      .where(eq(brandTemplates.id, templateId))
      .limit(1);

    if (!template) return false;

    // Check if template has required data
    const contentData = (template.contentData as any) || {};
    const hasHTML = !!contentData.html;
    const hasCSS = !!(template.css || contentData.css);
    
    return hasHTML && hasCSS;
  } catch (error) {
    logError(error, 'TemplateManager - Verify Template');
    return false;
  }
}

/**
 * Update a template by re-scraping from source
 */
export async function updateTemplate(templateId: string): Promise<TemplateProcessingResult> {
  try {
    console.log(`[TemplateManager] 🔄 Updating template: ${templateId}`);

    if (!db) {
      throw new Error('Database not available');
    }

    const [template] = await db
      .select()
      .from(brandTemplates)
      .where(eq(brandTemplates.id, templateId))
      .limit(1);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const contentData = (template.contentData as any) || {};
    const sourceUrl = contentData.metadata?.sourceUrl || contentData.metadata?.url;

    if (!sourceUrl) {
      throw new Error(`No source URL found for template ${templateId}`);
    }

    // Re-scrape the website
    const { scrapeWebsiteFull } = await import('./websiteScraper');
    const scrapedData = await scrapeWebsiteFull(sourceUrl);

    if (!scrapedData.htmlContent) {
      throw new Error('Failed to scrape website');
    }

    // Process the re-scraped data
    const result = await processNewTemplate(templateId);

    // Log update
    await db.insert(templateUpdateLogs).values({
      templateId,
      updateType: 'auto_update',
      status: result.success ? 'success' : 'failed',
      errorMessage: result.errors.length > 0 ? result.errors.join('; ') : null,
      changesDetected: {
        cssExtracted: result.cssExtracted,
        jsExtracted: result.jsExtracted,
        urlsConverted: result.urlsConverted,
      },
    });

    return result;
  } catch (error) {
    logError(error, 'TemplateManager - Update Template');
    return {
      success: false,
      templateId,
      cssExtracted: 0,
      jsExtracted: 0,
      urlsConverted: 0,
      imagesProcessed: 0,
      errors: [getErrorMessage(error)],
    };
  }
}

/**
 * Check if a template's source has changed
 */
export async function checkTemplateForChanges(templateId: string): Promise<{
  changed: boolean;
  currentHash: string;
  newHash: string;
}> {
  try {
    if (!db) {
      throw new Error('Database not available');
    }

    const [template] = await db
      .select()
      .from(brandTemplates)
      .where(eq(brandTemplates.id, templateId))
      .limit(1);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const contentData = (template.contentData as any) || {};
    const sourceUrl = contentData.metadata?.sourceUrl || contentData.metadata?.url;
    const storedHash = template.sourceHash;

    if (!sourceUrl) {
      return { changed: false, currentHash: storedHash || '', newHash: '' };
    }

    // Fetch current version
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch source: ${response.statusText}`);
    }

    const html = await response.text();
    const newHash = crypto.createHash('sha256').update(html).digest('hex');

    return {
      changed: newHash !== storedHash,
      currentHash: storedHash || '',
      newHash,
    };
  } catch (error) {
    logError(error, 'TemplateManager - Check For Changes');
    return { changed: false, currentHash: '', newHash: '' };
  }
}

