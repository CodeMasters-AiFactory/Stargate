/**
 * Template Library API Routes
 * Handles template browsing, searching, and selection
 */

import type { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import {
  TEMPLATE_LIBRARY,
  getTemplatesByCategory,
  getTemplatesByIndustry,
  searchTemplates,
  getAllTemplates,
} from '../services/templateLibrary';
import {
  BRAND_TEMPLATES,
  getBrandTemplatesByCategory,
  getBrandTemplatesByIndustry,
  getBrandTemplateById,
  getAllBrandTemplates,
} from '../services/brandTemplateLibrary';
import { db } from '../db';
import { brandTemplates } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { generateTemplatePreviewSVG } from '../services/templatePreviewGenerator';
import { getErrorMessage } from '../utils/errorHandler';
import { getTemplateIndex, updateTemplateIndex, fastSearch, fastCategoryFilter, fastIndustryFilter } from '../services/templateIndex';
import {
  generateTemplate,
  generateEnhancedTemplate,
  generateIndustryTemplates,
  getTemplateStats,
  INDUSTRIES,
  STYLES,
  type Industry,
  type Style,
} from '../services/aiTemplateGenerator';

export function registerTemplateRoutes(app: Express) {
  // Get all templates (includes generated templates and brand templates) with pagination
  app.get('/api/templates', async (req, res) => {
    try {
      console.log('[Templates API] GET /api/templates - Request received');
      const { category, industry, search, limit, generated, page, pageSize, ranked, brand, country, state, city, isDesignQuality, designCategory, isPremium, freeOnly } = req.query;
      const includeGenerated = generated !== 'false'; // Default to true
      // Note: brand and limit params reserved for future filtering
      void brand; void limit; // Acknowledge params
      const includeRanked = ranked === 'true'; // Only include ranked templates
      
      // Pagination parameters
      const pageNum = page ? Math.max(1, parseInt(page as string, 10)) : 1;
      const size = pageSize ? Math.min(100, Math.max(1, parseInt(pageSize as string, 10))) : 20; // Max 100 per page

      // Fetch templates from database and in-memory sources
      let templates: any[] = [];

      // Build index for fast filtering (only if we have many templates)
      const useIndex = templates.length > 100;
      let index = null;
      if (useIndex) {
        updateTemplateIndex(templates);
        index = getTemplateIndex(templates);
      }

      // Filter by category (use index if available)
      if (category && typeof category === 'string') {
        if (useIndex && index) {
          templates = fastCategoryFilter(category, index);
        } else {
          // Combine brand and regular templates
          const brandTemplates = getBrandTemplatesByCategory(category as any);
          const regularTemplates = getTemplatesByCategory(category, includeGenerated);
          templates = [...brandTemplates, ...regularTemplates];
        }
      }

      // Filter by industry (use index if available)
      if (industry && typeof industry === 'string') {
        if (useIndex && index) {
          templates = fastIndustryFilter(industry, index);
        } else {
          // Combine brand and regular templates
          const brandTemplates = getBrandTemplatesByIndustry(industry);
          const regularTemplates = getTemplatesByIndustry(industry, includeGenerated);
          templates = [...brandTemplates, ...regularTemplates];
        }
      }
      
      // Filter by ranked (only brand templates have rankings)
      if (includeRanked) {
        templates = templates.filter(t => t.ranking !== undefined || BRAND_TEMPLATES.includes(t));
      }

      // Fetch templates from database (always fetch, not just for location filters)
      if (db) {
        try {
          console.log('[Templates API] Fetching templates from database...');
          // Only show approved and active templates to users
          const { and } = await import('drizzle-orm');
          
          // Build base conditions (always required)
          const baseConditions = [
            eq(brandTemplates.isActive, true),
            eq(brandTemplates.isApproved, true)
          ];
          
          // Filter by isDesignQuality if specified
          if (isDesignQuality === 'true') {
            baseConditions.push(eq(brandTemplates.isDesignQuality, true));
          }
          
          // Filter by isPremium (free vs paid templates)
          if (freeOnly === 'true') {
            baseConditions.push(eq(brandTemplates.isPremium, false));
          } else if (isPremium === 'true') {
            baseConditions.push(eq(brandTemplates.isPremium, true));
          }
          
          // Filter by designCategory if specified
          if (designCategory && typeof designCategory === 'string') {
            baseConditions.push(eq(brandTemplates.designCategory, designCategory));
          }
          
          // Build query with all conditions
          let dbQuery = db.select().from(brandTemplates).where(and(...baseConditions));
          
          const locationConditions = [];
          if (country && typeof country === 'string') {
            locationConditions.push(eq(brandTemplates.locationCountry, country));
          }
          if (state && typeof state === 'string') {
            locationConditions.push(eq(brandTemplates.locationState, state));
          }
          if (city && typeof city === 'string') {
            locationConditions.push(eq(brandTemplates.locationCity, city));
          }
          
          if (locationConditions.length > 0) {
            const { and } = await import('drizzle-orm');
            const currentWhere = dbQuery.toSQL().where;
            if (currentWhere) {
              dbQuery = dbQuery.where(and(...locationConditions));
            } else {
              dbQuery = dbQuery.where(and(...locationConditions));
            }
          }
          
          const dbTemplates = await dbQuery;
          
          console.log(`[Templates API] ✅ Loaded ${dbTemplates.length} templates from database`);
          
          // Always use preview endpoint for thumbnails (it will serve actual images or generate SVG)
          // Force override thumbnail to use preview endpoint, ignoring any stored thumbnail value
          const templatesWithThumbnails = dbTemplates.map((t: typeof brandTemplates.$inferSelect) => {
            const template = { ...t };
            // Always use preview endpoint - it will find actual images or generate SVG
            template.thumbnail = `/api/templates/${t.id}/preview?size=thumb`;
            return template;
          });
          
          // Merge database templates with in-memory templates
          templates = [...templates, ...templatesWithThumbnails];
          
          // Sort by ranking if location is specified
          if (country || state || city) {
            templates.sort((a, b) => {
              const aRank = a.rankingPosition ? parseInt(a.rankingPosition) : 999;
              const bRank = b.rankingPosition ? parseInt(b.rankingPosition) : 999;
              return aRank - bRank;
            });
          }
        } catch (dbError) {
          console.error('[Templates API] ❌ Error fetching templates from database:', dbError);
          console.error('[Templates API] Database may not be connected. Check DATABASE_URL environment variable.');
          // Continue without database templates - will use file-based templates
        }
      } else {
        console.warn('[Templates API] ⚠️ Database not available. Loading templates from files...');
        console.warn('[Templates API] Set DATABASE_URL environment variable to enable database storage.');
        
        // Load templates from files when database unavailable
        try {
          const { listTemplates } = await import('../services/templateBasedGenerator');
          const fileTemplates = await listTemplates();
          console.log(`[Templates API] ✅ Loaded ${fileTemplates.length} templates from files`);
          
          // Convert to API format
          const formattedFileTemplates = fileTemplates.map(t => ({
            id: t.id,
            name: t.name,
            brand: t.brand,
            industry: t.industry,
            category: t.industry || 'general',
            thumbnail: null,
            description: `${t.brand} template`,
            isBlueprint: false,
            source: 'file',
          }));
          
          templates = [...templates, ...formattedFileTemplates];
        } catch (fileError) {
          console.error('[Templates API] ❌ Error loading templates from files:', fileError);
        }
      }

      // Search (use index if available)
      if (search && typeof search === 'string') {
        if (useIndex && index) {
          templates = fastSearch(search, index, templates);
        } else {
          templates = searchTemplates(search, includeGenerated);
        }
      }

      // Calculate pagination
      const totalCount = templates.length;
      const totalPages = Math.ceil(totalCount / size);
      const startIndex = (pageNum - 1) * size;
      const endIndex = startIndex + size;
      const paginatedTemplates = templates.slice(startIndex, endIndex);

      // CRITICAL: Force all templates to use preview endpoint for thumbnails
      // This ensures we serve actual images from extracted templates or generate SVG previews
      // Create completely new objects to avoid Drizzle ORM property getters/setters
      const finalTemplates = paginatedTemplates.map(t => {
        return {
          id: t.id,
          name: t.name,
          brand: t.brand,
          industry: t.industry,
          category: t.category || t.industry,
          thumbnail: `/api/templates/${t.id}/preview?size=thumb`, // ALWAYS use preview endpoint
          description: t.description || (t as any).contentData?.text || `${t.brand} template`,
          isBlueprint: t.isBlueprint || false,
          source: 'database',
          ...(t.rankingPosition && { rankingPosition: t.rankingPosition }),
          ...(t.locationCountry && { locationCountry: t.locationCountry }),
          ...(t.locationState && { locationState: t.locationState }),
          ...(t.locationCity && { locationCity: t.locationCity }),
        };
      });

      console.log(`[Templates API] Returning ${finalTemplates.length} templates (page ${pageNum}/${totalPages})`);
      return res.json({
        success: true,
        templates: finalTemplates,
        pagination: {
          page: pageNum,
          pageSize: size,
          totalCount,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
        count: paginatedTemplates.length,
        totalAvailable: includeGenerated ? getAllTemplates(true, 10000).length : TEMPLATE_LIBRARY.length,
        includesGenerated: includeGenerated,
      });
    } catch (error) {
      console.error('[Templates API] Error fetching templates:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch templates',
      });
    }
  });

  // Get template by ID with full contentData
  app.get('/api/templates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Try database first
      if (db) {
        try {
          const [dbTemplate] = await db.select().from(brandTemplates).where(eq(brandTemplates.id, id));
          
          if (dbTemplate) {
            const contentData = (dbTemplate.contentData as any) || {};
            const template = {
              ...dbTemplate,
              contentData: {
                html: contentData.html || '',
                css: dbTemplate.css || '',
              },
            };
            
            return res.json({
              success: true,
              template,
            });
          }
        } catch (dbError) {
          console.warn('[Templates API] Database error loading template:', dbError);
        }
      }
      
      // Try brand templates
      const brandTemplate = getBrandTemplateById(id);
      if (brandTemplate) {
        return res.json({
          success: true,
          template: brandTemplate,
        });
      }
      
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    } catch (error) {
      console.error('[Templates API] Error loading template:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load template',
      });
    }
  });

  // Get template HTML content
  app.get('/api/templates/:id/html', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Try database first
      if (db) {
        try {
          const [dbTemplate] = await db.select().from(brandTemplates).where(eq(brandTemplates.id, id));
          
          if (dbTemplate) {
            const contentData = (dbTemplate.contentData as any) || {};
            const html = contentData.html || '';
            
            return res.json({
              success: true,
              html,
              css: dbTemplate.css || '',
            });
          }
        } catch (dbError) {
          console.warn('[Templates API] Database error loading template HTML:', dbError);
        }
      }
      
      // Try brand templates
      const brandTemplate = getBrandTemplateById(id);
      if (brandTemplate && brandTemplate.contentData?.html) {
        return res.json({
          success: true,
          html: brandTemplate.contentData.html,
          css: brandTemplate.css || '',
        });
      }
      
      return res.status(404).json({
        success: false,
        error: 'Template HTML not found',
      });
    } catch (error) {
      console.error('[Templates API] Error loading template HTML:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load template HTML',
      });
    }
  });

  // Get popular templates - DISABLED
  app.get('/api/templates/popular/:limit?', async (_req, res) => {
    return res.json({
      success: true,
      templates: [],
      count: 0,
    });
  });

  // Get templates by category - DISABLED
  app.get('/api/templates/category/:category', async (_req, res) => {
    return res.json({
      success: true,
      templates: [],
      count: 0,
    });
  });

  // Get templates by industry - DISABLED
  app.get('/api/templates/industry/:industry', async (_req, res) => {
    return res.json({
      success: true,
      templates: [],
      count: 0,
    });
  });

  // Helper function to load and fix template HTML paths
  async function loadAndFixTemplateHtml(templateId: string): Promise<{ html: string; error?: string }> {
    try {
      // Try to get template from database
      let template: any = null;
      if (db) {
        try {
          const [dbTemplate] = await db.select().from(brandTemplates).where(eq(brandTemplates.id, templateId)).limit(1);
          if (dbTemplate) {
            template = dbTemplate;
          }
        } catch (dbError) {
          console.error('[Templates API] Database error loading template:', dbError);
        }
      }
      
      if (!template) {
        return { html: '', error: 'Template not found' };
      }
      
      const contentData = (template.contentData as any) || {};
      const zipName = contentData.zipName;
      
      if (!zipName) {
        return { html: '', error: 'Template files not found' };
      }
      
      // Find template directory
      const extractedDir1 = path.join(process.cwd(), 'downloaded_templates', 'extracted');
      const extractedDir2 = path.join(process.cwd(), 'temp_extracted_templates');
      const templateDirName = zipName.replace('.zip', '');
      
      const possibleDirs = [
        path.join(extractedDir2, templateDirName, templateDirName),
        path.join(extractedDir2, templateDirName),
        path.join(extractedDir1, templateDirName, templateDirName),
        path.join(extractedDir1, templateDirName),
      ];
      
      let templateDir = null;
      for (const dir of possibleDirs) {
        if (fs.existsSync(dir)) {
          templateDir = dir;
          break;
        }
      }
      
      if (!templateDir) {
        return { html: '', error: 'Template directory not found' };
      }
      
      // Find index.html or first HTML file
      const htmlFiles = fs.readdirSync(templateDir)
        .filter(f => /\.html$/i.test(f))
        .sort((a, b) => {
          // Prioritize index.html
          if (a.toLowerCase() === 'index.html') return -1;
          if (b.toLowerCase() === 'index.html') return 1;
          return 0;
        });
      
      if (htmlFiles.length === 0) {
        return { html: '', error: 'No HTML file found in template' };
      }
      
      const htmlFile = path.join(templateDir, htmlFiles[0]);
      const html = fs.readFileSync(htmlFile, 'utf-8');
      
      // Fix relative paths to work with our server
      const baseUrl = `/api/templates/${templateId}/assets`;
      
      // Helper function to clean and normalize URLs
      const normalizeUrl = (url: string): string => {
        let clean = url.replace(/^\.\//, '').replace(/^\//, '');
        clean = clean.replace(/\\/g, '/');
        return clean;
      };
      
      // Replace href attributes (CSS, links) - handle both single and double quotes
      const fixedHtml = html
        .replace(/href=(["'])(?!https?:\/\/|#|data:|mailto:|tel:)([^"']+)\1/gi, (match, quote, url) => {
          if (url.startsWith('#') || url.startsWith('http') || url.startsWith('data:') || url.startsWith('mailto:') || url.startsWith('tel:')) {
            return match;
          }
          const cleanUrl = normalizeUrl(url);
          return `href=${quote}${baseUrl}/${cleanUrl}${quote}`;
        })
        // Replace src attributes (images, scripts) - handle both single and double quotes
        .replace(/src=(["'])(?!https?:\/\/|data:)([^"']+)\1/gi, (match, quote, url) => {
          if (url.startsWith('http') || url.startsWith('data:')) {
            return match;
          }
          const cleanUrl = normalizeUrl(url);
          return `src=${quote}${baseUrl}/${cleanUrl}${quote}`;
        })
        // Replace CSS url() functions in style attributes and <style> tags
        .replace(/url\((["']?)(?!https?:\/\/|data:)([^"')]+)\1\)/gi, (match, quote, url) => {
          if (url.startsWith('http') || url.startsWith('data:')) {
            return match;
          }
          const cleanUrl = normalizeUrl(url);
          return `url(${quote}${baseUrl}/${cleanUrl}${quote})`;
        })
        // Replace action attributes in forms
        .replace(/action=(["'])(?!https?:\/\/|#|javascript:)([^"']+)\1/gi, (match, quote, url) => {
          if (url.startsWith('http') || url.startsWith('#') || url.startsWith('javascript:')) {
            return match;
          }
          const cleanUrl = normalizeUrl(url);
          return `action=${quote}${baseUrl}/${cleanUrl}${quote}`;
        });
      
      return { html: fixedHtml };
    } catch (error) {
      console.error('[Templates API] Error loading template HTML:', error);
      return { html: '', error: error instanceof Error ? error.message : 'Failed to load template HTML' };
    }
  }

  // Get template HTML preview (actual website)
  app.get('/api/templates/:id/preview-html', async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log(`[Templates API] HTML preview request for template: ${id}`);
      
      const result = await loadAndFixTemplateHtml(id);
      
      if (result.error) {
        return res.status(404).json({
          success: false,
          error: result.error,
        });
      }
      
      console.log(`[Templates API] Fixed HTML paths for template: ${id}`);

      // Remove X-Frame-Options to allow iframe embedding
      res.removeHeader('X-Frame-Options');
      res.setHeader('Content-Type', 'text/html');
      return res.send(result.html);
    } catch (error) {
      console.error('[Templates API] Error serving HTML preview:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load template HTML',
      });
    }
  });

  // Get template HTML preview as JSON (for use in final website display)
  app.get('/api/templates/:id/preview-html-json', async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log(`[Templates API] HTML preview JSON request for template: ${id}`);
      
      const result = await loadAndFixTemplateHtml(id);
      
      if (result.error) {
        return res.status(404).json({
          success: false,
          error: result.error,
        });
      }
      
      console.log(`[Templates API] Fixed HTML paths for template: ${id}`);
      
      return res.json({
        success: true,
        html: result.html,
      });
    } catch (error) {
      console.error('[Templates API] Error serving HTML preview JSON:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load template HTML',
      });
    }
  });

  // Serve template assets (CSS, JS, images, etc.)
  app.get('/api/templates/:id/assets/*', async (req, res) => {
    try {
      const { id } = req.params;
      const assetPath = (req.params as Record<string, string>)[0]; // Everything after /assets/
      
      // Get template directory
      let template: any = null;
      if (db) {
        try {
          const [dbTemplate] = await db.select().from(brandTemplates).where(eq(brandTemplates.id, id)).limit(1);
          if (dbTemplate) {
            template = dbTemplate;
          }
        } catch (dbError) {
          console.error('[Templates API] Database error:', dbError);
        }
      }
      
      if (!template) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }
      
      const contentData = (template.contentData as any) || {};
      const zipName = contentData.zipName;
      
      if (!zipName) {
        return res.status(404).json({ success: false, error: 'Template files not found' });
      }
      
      const extractedDir1 = path.join(process.cwd(), 'downloaded_templates', 'extracted');
      const extractedDir2 = path.join(process.cwd(), 'temp_extracted_templates');
      const templateDirName = zipName.replace('.zip', '');
      
      const possibleDirs = [
        path.join(extractedDir2, templateDirName, templateDirName),
        path.join(extractedDir2, templateDirName),
        path.join(extractedDir1, templateDirName, templateDirName),
        path.join(extractedDir1, templateDirName),
      ];
      
      let templateDir = null;
      for (const dir of possibleDirs) {
        if (fs.existsSync(dir)) {
          templateDir = dir;
          break;
        }
      }
      
      if (!templateDir) {
        return res.status(404).json({ success: false, error: 'Template directory not found' });
      }
      
      // Security: prevent directory traversal
      // Normalize path separators (handle both / and \)
      const normalizedPath = assetPath.replace(/\\/g, '/');
      const safePath = path.normalize(normalizedPath).replace(/^(\.\.(\/|\\|$))+/, '');
      const assetFile = path.join(templateDir, safePath);
      
      // Ensure file is within template directory (resolve to absolute paths for comparison)
      const resolvedTemplateDir = path.resolve(templateDir);
      const resolvedAssetFile = path.resolve(assetFile);
      
      if (!resolvedAssetFile.startsWith(resolvedTemplateDir)) {
        console.warn(`[Templates API] Security: Blocked path traversal attempt: ${assetPath}`);
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      
      if (!fs.existsSync(assetFile)) {
        console.warn(`[Templates API] Asset not found: ${assetFile} (requested: ${assetPath})`);
        return res.status(404).json({ success: false, error: `Asset not found: ${assetPath}` });
      }
      
      if (!fs.statSync(assetFile).isFile()) {
        console.warn(`[Templates API] Asset is not a file: ${assetFile}`);
        return res.status(404).json({ success: false, error: 'Asset not found' });
      }
      
      console.log(`[Templates API] ✅ Serving asset: ${assetFile}`);
      
      // Determine content type
      const ext = path.extname(assetFile).toLowerCase();
      const contentTypeMap: Record<string, string> = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.avif': 'image/avif',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
      };
      
      const contentType = contentTypeMap[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.sendFile(assetFile);
    } catch (error) {
      console.error('[Templates API] Error serving asset:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load asset',
      });
    }
  });

  // Get template preview image
  app.get('/api/templates/:id/preview', async (req, res) => {
    try {
      const { id } = req.params;
      const { size } = req.query;
      
      console.log(`[Templates API] Preview request for template: ${id}`);
      
      // Try to get template from database
      let template: any = null;
      if (db) {
        try {
          const [dbTemplate] = await db.select().from(brandTemplates).where(eq(brandTemplates.id, id)).limit(1);
          if (dbTemplate) {
            template = dbTemplate;
            console.log(`[Templates API] Found template: ${template.name}`);
          }
        } catch (dbError) {
          console.error('[Templates API] Database error loading template for preview:', dbError);
        }
      }
      
      if (!template) {
        console.warn(`[Templates API] Template not found: ${id}`);
        return res.status(404).json({
          success: false,
          error: 'Template not found',
        });
      }
      
      const contentData = (template.contentData as any) || {};
      const images = contentData.images || [];
      const zipName = contentData.zipName;
      
      console.log(`[Templates API] Template zipName: ${zipName}, images found: ${images.length}`);
      
      // Try to find and serve actual template image
      if (zipName) {
        // Check both possible extraction directories
        const extractedDir1 = path.join(process.cwd(), 'downloaded_templates', 'extracted');
        const extractedDir2 = path.join(process.cwd(), 'temp_extracted_templates');
        const templateDirName = zipName.replace('.zip', '');
        // Check both possible extraction directories and handle nested structure
        let templateDir = null;
        const possibleDirs = [
          path.join(extractedDir2, templateDirName, templateDirName), // Nested structure
          path.join(extractedDir2, templateDirName), // Direct structure
          path.join(extractedDir1, templateDirName, templateDirName), // Nested in alt dir
          path.join(extractedDir1, templateDirName), // Direct in alt dir
        ];
        
        for (const dir of possibleDirs) {
          if (fs.existsSync(dir)) {
            templateDir = dir;
            break;
          }
        }
        
        if (templateDir && fs.existsSync(templateDir)) {
          console.log(`[Templates API] Found template dir: ${templateDir}`);
          
          // Check multiple possible image directories
          const possibleImageDirs = [
            path.join(templateDir, 'assets', 'images'),
            path.join(templateDir, 'images'),
            path.join(templateDir, 'img'),
            path.join(templateDir, 'assets', 'img'),
            templateDir, // root
          ];
          
          for (const imageDir of possibleImageDirs) {
            if (fs.existsSync(imageDir)) {
              try {
                const imageFiles = fs.readdirSync(imageDir)
                  .filter(f => /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(f));
                
                if (imageFiles.length > 0) {
                  // Prioritize landing page images in this order:
                  // 1. Images referenced in index.html (landing page)
                  // 2. Banner/hero/header images (common landing page elements)
                  // 3. Largest images (likely to be hero/landing images)
                  
                  // Try to find images referenced in index.html first (landing page)
                  const landingPageImages: string[] = [];
                  try {
                    const indexHtmlPath = path.join(templateDir, 'index.html');
                    if (fs.existsSync(indexHtmlPath)) {
                      const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
                      
                      // Extract image src attributes from index.html
                      const imageSrcMatches = indexHtml.match(/src=["']([^"']+\.(jpg|jpeg|png|gif|webp|avif))["']/gi);
                      if (imageSrcMatches) {
                        landingPageImages.push(...imageSrcMatches.map(match => {
                          const srcMatch = match.match(/src=["']([^"']+)/i);
                          return srcMatch ? srcMatch[1].replace(/^\.\//, '').replace(/^\//, '') : null;
                        }).filter((img): img is string => img !== null));
                      }
                      
                      // Extract CSS background-image URLs (many landing pages use these)
                      const bgImageMatches = indexHtml.match(/background-image:\s*url\(["']?([^"')]+\.(jpg|jpeg|png|gif|webp|avif))["']?\)/gi);
                      if (bgImageMatches) {
                        landingPageImages.push(...bgImageMatches.map(match => {
                          const urlMatch = match.match(/url\(["']?([^"')]+)/i);
                          return urlMatch ? urlMatch[1].replace(/^\.\//, '').replace(/^\//, '') : null;
                        }).filter((img): img is string => img !== null));
                      }
                      
                      // Also check inline style attributes
                      const styleMatches = indexHtml.match(/style=["'][^"']*background-image:\s*url\(["']?([^"')]+\.(jpg|jpeg|png|gif|webp|avif))["']?\)/gi);
                      if (styleMatches) {
                        landingPageImages.push(...styleMatches.map(match => {
                          const urlMatch = match.match(/url\(["']?([^"')]+)/i);
                          return urlMatch ? urlMatch[1].replace(/^\.\//, '').replace(/^\//, '') : null;
                        }).filter((img): img is string => img !== null));
                      }
                      
                      console.log(`[Templates API] Found ${landingPageImages.length} images referenced in index.html`);
                    }
                  } catch (e) {
                    console.warn(`[Templates API] Could not parse index.html for landing page images:`, e);
                  }
                  
                  // Find images that match landing page references (check both filename and path)
                  const landingPageMatch = imageFiles.find(f => {
                    const fLower = f.toLowerCase();
                    return landingPageImages.some(lpImg => {
                      const lpImgLower = lpImg.toLowerCase();
                      const lpBasename = path.basename(lpImgLower);
                      // Match by filename or if filename contains the image name
                      return fLower === lpBasename || 
                             fLower.includes(lpBasename) || 
                             lpBasename.includes(fLower.replace(/\.[^.]+$/, ''));
                    });
                  });
                  
                  // If no direct match, prioritize images that appear early in index.html (likely hero/banner)
                  const earlyLandingPageMatch = landingPageImages.length > 0 ? 
                    imageFiles.find(f => {
                      const fLower = f.toLowerCase();
                      // Check if filename matches any landing page image (partial match)
                      return landingPageImages.some(lpImg => {
                        const lpBasename = path.basename(lpImg.toLowerCase());
                        return fLower.includes(lpBasename.split('.')[0]) || lpBasename.includes(fLower.split('.')[0]);
                      });
                    }) : null;
                  
                  // Fallback to banner/hero/header images (common landing page elements)
                  const bannerImage = imageFiles.find(f => /banner|hero|header|main|landing|home|index|slider|carousel/i.test(f));
                  
                  // Final selection priority: 
                  // 1. Direct landing page match (from index.html)
                  // 2. Early landing page match (partial match)
                  // 3. Banner/hero images (by filename)
                  // 4. Largest images (likely hero images)
                  const targetImage = landingPageMatch || earlyLandingPageMatch || bannerImage || imageFiles.sort((a, b) => {
                    try {
                      const sizeA = fs.statSync(path.join(imageDir, a)).size;
                      const sizeB = fs.statSync(path.join(imageDir, b)).size;
                      return sizeB - sizeA; // Largest first
                    } catch { return 0; }
                  })[0];
                  
                  if (targetImage) {
                    const imagePath = path.join(imageDir, targetImage);
                    const ext = path.extname(targetImage).toLowerCase();
                    const contentType = ext === '.png' ? 'image/png' : 
                                       ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                                       ext === '.gif' ? 'image/gif' :
                                       ext === '.webp' ? 'image/webp' :
                                       ext === '.avif' ? 'image/avif' : 'image/png';
                    
                    console.log(`[Templates API] ✅ Serving: ${imagePath}`);
                    res.setHeader('Content-Type', contentType);
                    res.setHeader('Cache-Control', 'public, max-age=3600');
                    return res.sendFile(imagePath);
                  }
                }
              } catch (e) {
                console.warn(`[Templates API] Error reading ${imageDir}:`, e);
              }
            }
          }
          
          console.log(`[Templates API] No images found in any image directory`);
        } else {
          console.warn(`[Templates API] Template directory not found: ${templateDirName}`);
        }
      } else {
        console.warn(`[Templates API] No zipName for template: ${id}`);
      }
      
      // Generate SVG preview as fallback
      console.log(`[Templates API] Generating SVG fallback for template: ${id}`);
      const colors = (template.colors as any) || {};
      const layout = 'modern'; // Default layout
      const svg = generateTemplatePreviewSVG({
        name: template.name,
        colorScheme: {
          primary: colors.primary || '#3b82f6',
          secondary: colors.secondary || '#1e40af',
          accent: colors.accent || '#60a5fa',
          background: colors.background || '#ffffff',
          text: colors.text || '#1f2937',
        },
        layout: layout as 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant',
        category: template.category || template.industry || 'Web Design',
      });
      
      // Adjust size for thumbnail
      const width = size === 'thumb' ? 400 : 800;
      const height = size === 'thumb' ? 300 : 600;
      
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(svg.replace('width="800"', `width="${width}"`).replace('height="600"', `height="${height}"`));
    } catch (error) {
      console.error('[Templates API] Error generating preview:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate preview',
      });
    }
  });

  // ============================================
  // AI Template Generator Endpoints
  // ============================================

  // Get template generator statistics
  app.get('/api/templates/ai/stats', async (_req, res) => {
    try {
      const stats = getTemplateStats();
      return res.json({
        success: true,
        stats: {
          ...stats,
          industries: INDUSTRIES,
          styles: STYLES,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get template stats',
      });
    }
  });

  // Generate a single template
  app.post('/api/templates/ai/generate', async (req, res) => {
    try {
      const { industry, style, variant } = req.body;
      
      if (!industry || !INDUSTRIES.includes(industry)) {
        return res.status(400).json({
          success: false,
          error: `Invalid industry. Must be one of: ${INDUSTRIES.slice(0, 10).join(', ')}...`,
        });
      }
      
      if (!style || !STYLES.includes(style)) {
        return res.status(400).json({
          success: false,
          error: `Invalid style. Must be one of: ${STYLES.join(', ')}`,
        });
      }
      
      const template = await generateTemplate(industry as Industry, style as Style, variant || 0);
      
      return res.json({
        success: true,
        template,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate template',
      });
    }
  });

  // Generate an AI-enhanced template with real content
  app.post('/api/templates/ai/generate-enhanced', async (req, res) => {
    try {
      const { industry, style, businessName } = req.body;
      
      if (!industry || !INDUSTRIES.includes(industry)) {
        return res.status(400).json({
          success: false,
          error: `Invalid industry. Must be one of: ${INDUSTRIES.slice(0, 10).join(', ')}...`,
        });
      }
      
      if (!style || !STYLES.includes(style)) {
        return res.status(400).json({
          success: false,
          error: `Invalid style. Must be one of: ${STYLES.join(', ')}`,
        });
      }
      
      const template = await generateEnhancedTemplate(
        industry as Industry,
        style as Style,
        businessName || 'Your Business'
      );
      
      return res.json({
        success: true,
        template,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate enhanced template',
      });
    }
  });

  // Generate templates for an entire industry
  app.post('/api/templates/ai/generate-industry', async (req, res) => {
    try {
      const { industry, count } = req.body;
      
      if (!industry || !INDUSTRIES.includes(industry)) {
        return res.status(400).json({
          success: false,
          error: `Invalid industry. Must be one of: ${INDUSTRIES.slice(0, 10).join(', ')}...`,
        });
      }
      
      const templates = await generateIndustryTemplates(
        industry as Industry,
        count || 10
      );
      
      return res.json({
        success: true,
        count: templates.length,
        templates,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate industry templates',
      });
    }
  });

  // Get available industries and styles
  app.get('/api/templates/ai/options', async (_req, res) => {
    try {
      return res.json({
        success: true,
        industries: INDUSTRIES,
        styles: STYLES,
        combinations: INDUSTRIES.length * STYLES.length,
        potentialTemplates: INDUSTRIES.length * STYLES.length * 5,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get options',
      });
    }
  });

  /**
   * Get template counts by industry
   * GET /api/templates/counts-by-industry
   */
  app.get('/api/templates/counts-by-industry', async (_req, res) => {
    try {
      const counts: Record<string, number> = {};

      // Get all templates from database
      if (db) {
        try {
          const dbTemplates = await db
            .select({
              industry: brandTemplates.industry,
            })
            .from(brandTemplates)
            .where(eq(brandTemplates.isActive, true));

          // Count by industry
          dbTemplates.forEach((template: { industry: string | null }) => {
            const industry = template.industry || 'general';
            counts[industry] = (counts[industry] || 0) + 1;
          });
        } catch (dbError) {
          console.error('[Templates API] Error fetching counts from database:', dbError);
        }
      }

      // Also include brand templates from library (if any)
      try {
        const brandTemplatesList = getAllBrandTemplates();
        brandTemplatesList.forEach(template => {
          const industry = template.industry || template.category || 'general';
          counts[industry] = (counts[industry] || 0) + 1;
        });
      } catch (error) {
        // Brand templates library might be empty, that's okay
        console.log('[Templates API] No brand templates in library');
      }

      return res.json({
        success: true,
        counts,
        total: Object.values(counts).reduce((sum, count) => sum + count, 0),
      });
    } catch (error) {
      console.error('[Templates API] Error fetching industry counts:', error);
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  // Delete template (non-admin endpoint for marketplace)
  app.delete('/api/templates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { hardDelete } = req.query;
      
      console.log(`[Templates API] DELETE request: ${id}`);
      
      if (!db) {
        return res.status(500).json({
          success: false,
          error: 'Database not available',
        });
      }

      // Check if template exists
      const [existing] = await db.select().from(brandTemplates).where(eq(brandTemplates.id, id)).limit(1);
      
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Template not found',
        });
      }

      // Delete from database
      if (hardDelete === 'true') {
        await db.delete(brandTemplates).where(eq(brandTemplates.id, id));
        console.log(`[Templates API] ✅ Hard deleted template: ${id}`);
      } else {
        await db.update(brandTemplates).set({ isActive: false, updatedAt: new Date() }).where(eq(brandTemplates.id, id));
        console.log(`[Templates API] ✅ Soft deleted template: ${id}`);
      }

      // Try to delete extracted template files (ONLY the specific template's directory)
      const contentData = (existing.contentData as any) || {};
      const zipName = contentData.zipName;
      
      if (zipName && zipName.length > 10) {  // Safety check: zipName must be substantial
        const templateDirName = zipName.replace('.zip', '');
        
        // Safety: Never delete if templateDirName is empty or too short
        if (!templateDirName || templateDirName.length < 5) {
          console.warn(`[Templates API] ⚠️ Skipping directory deletion - invalid templateDirName: ${templateDirName}`);
        } else {
          const extractedDir1 = path.join(process.cwd(), 'downloaded_templates', 'extracted', templateDirName);
          const extractedDir2 = path.join(process.cwd(), 'temp_extracted_templates', templateDirName);
          
          // Try to delete nested structure first
          const nestedDir1 = path.join(extractedDir1, templateDirName);
          const nestedDir2 = path.join(extractedDir2, templateDirName);
          
          const dirsToDelete = [nestedDir1, nestedDir2, extractedDir1, extractedDir2];
          
          for (const dir of dirsToDelete) {
            // Safety: Only delete if path contains the template directory name
            if (fs.existsSync(dir) && dir.includes(templateDirName)) {
              try {
                console.log(`[Templates API] Attempting to delete: ${dir}`);
                fs.rmSync(dir, { recursive: true, force: true });
                console.log(`[Templates API] ✅ Deleted template directory: ${dir}`);
              } catch (err) {
                console.warn(`[Templates API] Could not delete directory ${dir}:`, err);
              }
            }
          }
        }
      } else {
        console.log(`[Templates API] No zipName found for template, skipping directory cleanup`);
      }

      return res.json({
        success: true,
        message: `Template ${id} deleted successfully`,
      });
    } catch (error) {
      console.error('[Templates API] Error deleting template:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete template',
      });
    }
  });

  // Upload template ZIP file
  app.post('/api/templates/upload', async (_req, res) => {
    try {
      // Save uploaded file to Downloads folder, then import it
      const DOWNLOADS_DIR = path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads');

      // For now, provide instructions - full upload will be implemented with multer
      // User can place files in Downloads folder and we'll import them
      return res.json({
        success: true,
        message: 'Please place template ZIP files in your Downloads folder',
        instructions: '1. Place ZIP files in Downloads folder\n2. Run: npm run import-templates\n3. Refresh this page',
        downloadsPath: DOWNLOADS_DIR,
      });
    } catch (error) {
      console.error('[Templates API] Error uploading template:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload template',
      });
    }
  });

  // Transform template with business requirements
  app.post('/api/templates/:id/transform', async (req, res) => {
    try {
      const { id } = req.params;
      const { clientInfo, options } = req.body;

      if (!clientInfo || !clientInfo.businessName) {
        return res.status(400).json({
          success: false,
          error: 'clientInfo with businessName is required',
        });
      }

      const { generateFromTemplate } = await import('../services/templateBasedGenerator');
      
      const result = await generateFromTemplate(id, clientInfo, options);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.errors?.join(', ') || 'Template transformation failed',
        });
      }

      // Fix relative paths to work with our asset serving endpoint
      // Same path fixing logic as preview-html endpoint
      const baseUrl = `/api/templates/${id}/assets`;
      
      const normalizeUrl = (url: string): string => {
        let clean = url.replace(/^\.\//, '').replace(/^\//, '');
        clean = clean.replace(/\\/g, '/');
        return clean;
      };
      
      // Fix paths in HTML
      const fixedHtml = result.html
        .replace(/href=(["'])(?!https?:\/\/|#|data:|mailto:|tel:)([^"']+)\1/gi, (match, quote, url) => {
          if (url.startsWith('#') || url.startsWith('http') || url.startsWith('data:') || url.startsWith('mailto:') || url.startsWith('tel:')) {
            return match;
          }
          const cleanUrl = normalizeUrl(url);
          return `href=${quote}${baseUrl}/${cleanUrl}${quote}`;
        })
        .replace(/src=(["'])(?!https?:\/\/|data:)([^"']+)\1/gi, (match, quote, url) => {
          if (url.startsWith('http') || url.startsWith('data:')) {
            return match;
          }
          const cleanUrl = normalizeUrl(url);
          return `src=${quote}${baseUrl}/${cleanUrl}${quote}`;
        })
        .replace(/url\((["']?)(?!https?:\/\/|data:)([^"')]+)\1\)/gi, (match, quote, url) => {
          if (url.startsWith('http') || url.startsWith('data:')) {
            return match;
          }
          const cleanUrl = normalizeUrl(url);
          return `url(${quote}${baseUrl}/${cleanUrl}${quote})`;
        });
      
      // Fix paths in CSS
      const fixedCss = result.css.replace(/url\((["']?)(?!https?:\/\/|data:)([^"')]+)\1\)/gi, (match, quote, url) => {
        if (url.startsWith('http') || url.startsWith('data:')) {
          return match;
        }
        const cleanUrl = normalizeUrl(url);
        return `url(${quote}${baseUrl}/${cleanUrl}${quote})`;
      });

      return res.json({
        success: true,
        html: fixedHtml,
        css: fixedCss,
        replacedImages: result.replacedImages,
        contentChanges: result.contentChanges,
      });
    } catch (error) {
      console.error('[Templates API] Error transforming template:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transform template',
      });
    }
  });
}

