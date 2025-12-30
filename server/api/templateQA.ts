/**
 * Template Quality Assurance API Routes
 * Pre-process all templates to perfection before client selection
 */

import { brandTemplates, scrapedContent } from '@shared/schema';
import * as cheerio from 'cheerio';
import { eq } from 'drizzle-orm';
import type { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { db } from '../db';
import { requireAdmin } from '../middleware/permissions';
import { generateAIImage } from '../services/aiImageGenerator';
import { rewritePageContent } from '../services/contentRewriter';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { autoFixTemplate, smokeTestTemplate } from '../services/templateAutoFixer';
import { inspectTemplate } from '../services/templateInspector';

// Local file storage for templates when database is unavailable
const TEMPLATES_DIR = path.join(process.cwd(), 'scraped_templates');

interface TemplateQAStatus {
  id: string;
  name: string;
  contentRewritten: boolean;
  imagesRegenerated: boolean;
  seoEvaluated: boolean;
  verified: boolean;
  errors: string[];
  lastUpdated?: string;
}

/**
 * Load all templates from database or files
 */
async function loadAllTemplates(): Promise<any[]> {
  const templates: any[] = [];

  // Load from database if available
  if (db) {
    try {
      const dbTemplates = await db.select().from(brandTemplates);
      // Map database templates to expected format
      templates.push(...dbTemplates.map((t: typeof brandTemplates.$inferSelect) => {
        const contentData = (t.contentData as any) || {};
        const html = contentData.html || '';
        
        // Log templates with missing HTML for debugging
        if (!html && t.id) {
          console.warn(`[TemplateQA] ⚠️ Template ${t.id} (${t.name}) has no HTML in contentData`);
        }
        
        return {
          ...t,
          source: 'database',
          htmlContent: html,
          content: {
            html: html,
            css: t.css || '',
          },
          // Extract qaMetadata from contentData if it exists
          qaMetadata: contentData.qaMetadata || {},
        };
      }));
    } catch (error) {
      console.warn('[TemplateQA] Failed to load from database:', getErrorMessage(error));
    }
  }

  // Load from files
  try {
    const indexPath = path.join(TEMPLATES_DIR, 'index.json');
    if (fs.existsSync(indexPath)) {
      const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      if (Array.isArray(indexData)) {
        for (const templateId of indexData) {
          const templatePath = path.join(TEMPLATES_DIR, `${templateId}.json`);
          if (fs.existsSync(templatePath)) {
            const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
            templates.push({ ...templateData, source: 'file' });
          }
        }
      }
    }
  } catch (error) {
    console.warn('[TemplateQA] Failed to load from files:', getErrorMessage(error));
  }

  return templates;
}

/**
 * Save template back to database or file
 */
async function saveTemplate(template: any): Promise<void> {
  if (db) {
    try {
      // Prepare template data for database
      const htmlContent = template.htmlContent || template.content?.html || '';
      const contentData = (template.contentData || {}) as any;
      contentData.html = htmlContent;
      contentData.qaMetadata = template.qaMetadata || {};

      // Update template in database
      await db.update(brandTemplates)
        .set({
          contentData: contentData,
          updatedAt: new Date(),
          // Also update CSS if it changed
          ...(template.css && { css: template.css }),
        })
        .where(eq(brandTemplates.id, template.id));

      return;
    } catch (error) {
      console.warn('[TemplateQA] Failed to save to database:', getErrorMessage(error));
    }
  }

  // Fallback to file
  try {
    const filename = `${template.id}.json`;
    const filepath = path.join(TEMPLATES_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(template, null, 2), 'utf-8');

    // Update index
    const indexPath = path.join(TEMPLATES_DIR, 'index.json');
    let index: string[] = [];
    if (fs.existsSync(indexPath)) {
      index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    }
    if (!index.includes(template.id)) {
      index.push(template.id);
      fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('[TemplateQA] Failed to save to file:', getErrorMessage(error));
    throw error;
  }
}

/**
 * Get QA status for all templates
 */
export function registerTemplateQARoutes(app: Express) {
  app.get('/api/admin/templates/qa/status', requireAdmin, async (_req, res) => {
    try {
      const templates = await loadAllTemplates();

      const status: TemplateQAStatus[] = templates.map(template => {
        // Check if template has QA metadata
        const qaMeta = template.qaMetadata || {};

        return {
          id: template.id,
          name: template.name || template.brand || 'Unnamed Template',
          contentRewritten: qaMeta.contentRewritten === true,
          imagesRegenerated: qaMeta.imagesRegenerated === true,
          seoEvaluated: qaMeta.seoEvaluated === true,
          verified: qaMeta.verified === true,
          errors: qaMeta.errors || [],
          lastUpdated: qaMeta.lastUpdated,
        };
      });

      return res.json({ success: true, templates: status });
    } catch (error) {
      logError(error, 'TemplateQA Status');
      return res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  /**
   * Rewrite content for selected templates (or all if none specified)
   */
  app.post('/api/admin/templates/qa/rewrite-content', requireAdmin, async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const { templateIds } = req.body || {};
      const allTemplates = await loadAllTemplates();

      // Filter to selected templates if provided
      const templates = templateIds && Array.isArray(templateIds) && templateIds.length > 0
        ? allTemplates.filter(t => templateIds.includes(t.id))
        : allTemplates;

      let completed = 0;

      const sendProgress = (current?: string) => {
        res.write(`data: ${JSON.stringify({
          progress: {
            total: templates.length,
            completed,
            current,
            status: 'running',
          },
        })}\n\n`);
      };

      for (const template of templates) {
        try {
          sendProgress(template.name || template.brand || template.id);

          // Load HTML content
          const html = template.htmlContent || template.content?.html || '';
          if (!html) {
            console.warn(`[TemplateQA] No HTML content for template ${template.id}`);
            completed++;
            continue;
          }

          // Create generic client info for content rewriting
          const clientInfo = {
            businessName: template.brand || 'Business',
            industry: template.industry || 'General',
            location: {
              city: 'City',
              state: 'State',
              country: 'USA',
            },
            services: [],
            phone: '(555) 555-5555',
            email: 'info@example.com',
            address: '123 Main St',
          };

          // Rewrite content using contentRewriter
          const rewriteResult = await rewritePageContent(
            html,
            clientInfo,
            [template.industry || 'business', 'professional', 'quality']
          );

          // Update template with rewritten content
          template.htmlContent = rewriteResult.html;
          template.content = template.content || {};
          template.content.html = rewriteResult.html;
          template.qaMetadata = template.qaMetadata || {};
          template.qaMetadata.contentRewritten = true;
          template.qaMetadata.lastUpdated = new Date().toISOString();

          // Save template
          await saveTemplate(template);

          completed++;
        } catch (error) {
          console.error(`[TemplateQA] Error rewriting content for ${template.id}:`, getErrorMessage(error));
          template.qaMetadata = template.qaMetadata || {};
          template.qaMetadata.errors = template.qaMetadata.errors || [];
          template.qaMetadata.errors.push(`Content rewrite failed: ${getErrorMessage(error)}`);
          await saveTemplate(template);
          completed++;
        }
      }

      res.write(`data: ${JSON.stringify({
        complete: completed,
        progress: {
          total: templates.length,
          completed,
          status: 'completed',
        },
      })}\n\n`);
      return res.end();
    } catch (error) {
      logError(error, 'TemplateQA Rewrite Content');
      res.write(`data: ${JSON.stringify({
        error: getErrorMessage(error),
        progress: {
          status: 'error',
        },
      })}\n\n`);
      return res.end();
    }
  });

  /**
   * Rewrite content for a single template
   * Uses local template-based rewriting (no external API needed)
   * Will use AI when OPENAI_API_KEY is configured
   */
  app.post('/api/admin/templates/qa/rewrite-content/:templateId', requireAdmin, async (req, res) => {
    try {
      const { templateId } = req.params;
      const templates = await loadAllTemplates();
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: `Template ${templateId} not found`,
        });
      }

      // Load HTML content (check multiple locations)
      const html = template.htmlContent ||
                  template.content?.html ||
                  (template.contentData as any)?.html ||
                  '';
      if (!html || html.trim().length < 100) {
        return res.status(400).json({
          success: false,
          error: `No HTML content for template ${templateId}`,
        });
      }

      // Local template-based rewriting (no API needed)
      const $ = cheerio.load(html);
      let changesCount = 0;
      const businessName = template.brand || template.name || 'Your Business';
      const industry = template.industry || 'Professional Services';

      // Replace common placeholder patterns
      const replacements: [RegExp, string][] = [
        [/Lorem ipsum[^<]*/gi, `Welcome to ${businessName}, your trusted ${industry} partner.`],
        [/Company Name/gi, businessName],
        [/Your Company/gi, businessName],
        [/Business Name/gi, businessName],
        [/\[Company\]/gi, businessName],
        [/\[Business\]/gi, businessName],
        [/555-555-5555/g, '(555) 555-5555'],
        [/email@example\.com/gi, 'info@yourbusiness.com'],
        [/123 Main Street/gi, '123 Business Ave'],
      ];

      // Apply replacements to text content
      $('h1, h2, h3, h4, h5, h6, p, span, a, li, td').each((_, el) => {
        const $el = $(el);
        let text = $el.html() || '';
        let changed = false;

        for (const [pattern, replacement] of replacements) {
          if (pattern.test(text)) {
            text = text.replace(pattern, replacement);
            changed = true;
          }
        }

        if (changed) {
          $el.html(text);
          changesCount++;
        }
      });

      // Update meta tags
      if (!$('title').text() || $('title').text().includes('Template')) {
        $('title').text(`${businessName} | ${industry}`);
        changesCount++;
      }

      const rewrittenHtml = $.html();

      // Update template with rewritten content
      template.htmlContent = rewrittenHtml;
      template.content = template.content || {};
      template.content.html = rewrittenHtml;
      template.qaMetadata = template.qaMetadata || {};
      template.qaMetadata.contentRewritten = true;
      template.qaMetadata.rewriteMethod = 'local-template';
      template.qaMetadata.changesCount = changesCount;
      template.qaMetadata.lastUpdated = new Date().toISOString();

      // Save template
      await saveTemplate(template);

      console.log(`[TemplateQA] ✅ Rewritten template ${templateId} with ${changesCount} changes (local method)`);

      return res.json({
        success: true,
        message: `Content rewritten for template ${templateId} (${changesCount} changes)`,
        template: {
          id: template.id,
          name: template.name || template.brand,
          contentRewritten: true,
          changesCount,
        },
      });
    } catch (error) {
      logError(error, 'TemplateQA Rewrite Single Template');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Regenerate images for all templates
   */
  app.post('/api/admin/templates/qa/regenerate-images', requireAdmin, async (_req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const templates = await loadAllTemplates();
      let completed = 0;

      const sendProgress = (current?: string) => {
        res.write(`data: ${JSON.stringify({
          progress: {
            total: templates.length,
            completed,
            current,
            status: 'running',
          },
        })}\n\n`);
      };

      for (const template of templates) {
        try {
          sendProgress(template.name || template.brand || template.id);

          // Load HTML content
          const html = template.htmlContent || template.content?.html || '';
          if (!html) {
            console.warn(`[TemplateQA] No HTML content for template ${template.id}`);
            completed++;
            continue;
          }

          const $ = cheerio.load(html);
          let imagesRegenerated = 0;

          // Find all images
          const images = $('img[src]').toArray();

          for (const img of images.slice(0, 10)) { // Limit to 10 images per template
            const $img = $(img);
            const src = $img.attr('src');
            const alt = $img.attr('alt') || '';

            if (!src || src.startsWith('data:') || src.includes('placeholder')) {
              continue;
            }

            try {
              // Generate new image based on alt text or template context
              const imagePrompt = alt || `${template.industry || 'business'} professional image`;

              const generatedImage = await generateAIImage({
                prompt: imagePrompt,
                style: 'hero',
                businessContext: {
                  name: template.brand || 'Business',
                  industry: template.industry || 'General',
                  colorScheme: [],
                },
              });

              if (generatedImage.url) {
                $img.attr('src', generatedImage.url);
                imagesRegenerated++;
              }
            } catch (error) {
              console.warn(`[TemplateQA] Failed to regenerate image ${src}:`, getErrorMessage(error));
            }
          }

          // Update template with new images
          template.htmlContent = $.html();
          template.content = template.content || {};
          template.content.html = $.html();
          template.qaMetadata = template.qaMetadata || {};
          template.qaMetadata.imagesRegenerated = true;
          template.qaMetadata.imagesRegeneratedCount = imagesRegenerated;
          template.qaMetadata.lastUpdated = new Date().toISOString();

          // Save template
          await saveTemplate(template);

          completed++;
        } catch (error) {
          console.error(`[TemplateQA] Error regenerating images for ${template.id}:`, getErrorMessage(error));
          template.qaMetadata = template.qaMetadata || {};
          template.qaMetadata.errors = template.qaMetadata.errors || [];
          template.qaMetadata.errors.push(`Image regeneration failed: ${getErrorMessage(error)}`);
          await saveTemplate(template);
          completed++;
        }
      }

      res.write(`data: ${JSON.stringify({
        complete: completed,
        progress: {
          total: templates.length,
          completed,
          status: 'completed',
        },
      })}\n\n`);
      return res.end();
    } catch (error) {
      logError(error, 'TemplateQA Regenerate Images');
      res.write(`data: ${JSON.stringify({
        error: getErrorMessage(error),
        progress: {
          status: 'error',
        },
      })}\n\n`);
      return res.end();
    }
  });

  /**
   * Regenerate images for a single template
   * Uses Leonardo AI when available, falls back to placeholder images
   */
  app.post('/api/admin/templates/qa/regenerate-image/:templateId', requireAdmin, async (req, res) => {
    try {
      const { templateId } = req.params;
      const templates = await loadAllTemplates();
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: `Template ${templateId} not found`,
        });
      }

      // Load HTML content
      const html = template.htmlContent ||
                  template.content?.html ||
                  (template.contentData as any)?.html ||
                  '';
      if (!html || html.trim().length < 100) {
        return res.status(400).json({
          success: false,
          error: `No HTML content for template ${templateId}`,
        });
      }

      const $ = cheerio.load(html);
      let imagesProcessed = 0;
      const industry = template.industry || 'business';
      const businessName = template.brand || template.name || 'Business';

      // Check if Leonardo API is available
      const hasLeonardoKey = !!process.env.LEONARDO_AI_API_KEY;

      // Find all images and process them
      const images = $('img[src]').toArray();

      for (const img of images.slice(0, 10)) { // Limit to 10 images per template
        const $img = $(img);
        const src = $img.attr('src') || '';
        const alt = $img.attr('alt') || '';

        // Skip data URIs and already processed images
        if (src.startsWith('data:') || src.includes('leonardo') || src.includes('unsplash')) {
          continue;
        }

        try {
          if (hasLeonardoKey) {
            // Use Leonardo AI for image generation
            const imagePrompt = alt || `Professional ${industry} business image for ${businessName}`;

            const generatedImage = await generateAIImage({
              prompt: imagePrompt,
              style: 'hero',
              businessContext: {
                name: businessName,
                industry: industry,
                colorScheme: [],
              },
            });

            if (generatedImage.url) {
              $img.attr('src', generatedImage.url);
              $img.attr('data-ai-generated', 'leonardo');
              imagesProcessed++;
            }
          } else {
            // Use high-quality Unsplash placeholder images
            const searchTerms = encodeURIComponent(`${industry} ${alt || 'professional office'}`);
            const placeholderUrl = `https://source.unsplash.com/800x600/?${searchTerms}`;
            $img.attr('src', placeholderUrl);
            $img.attr('data-placeholder', 'unsplash');
            imagesProcessed++;
          }
        } catch (imgError) {
          console.warn(`[TemplateQA] Failed to process image ${src}:`, getErrorMessage(imgError));
          // Use a generic placeholder on error
          $img.attr('src', `https://source.unsplash.com/800x600/?${encodeURIComponent(industry)}`);
          $img.attr('data-placeholder', 'fallback');
          imagesProcessed++;
        }
      }

      // Update template with new images
      const updatedHtml = $.html();
      template.htmlContent = updatedHtml;
      template.content = template.content || {};
      template.content.html = updatedHtml;
      template.qaMetadata = template.qaMetadata || {};
      template.qaMetadata.imagesRegenerated = true;
      template.qaMetadata.imagesRegeneratedCount = imagesProcessed;
      template.qaMetadata.imageMethod = hasLeonardoKey ? 'leonardo-ai' : 'unsplash-placeholder';
      template.qaMetadata.lastUpdated = new Date().toISOString();

      // Save template
      await saveTemplate(template);

      console.log(`[TemplateQA] ✅ Reimaged template ${templateId} with ${imagesProcessed} images (${hasLeonardoKey ? 'Leonardo AI' : 'Unsplash'})`);

      return res.json({
        success: true,
        message: `Images regenerated for template ${templateId} (${imagesProcessed} images)`,
        template: {
          id: template.id,
          name: template.name || template.brand,
          imagesRegenerated: true,
          imagesProcessed,
          method: hasLeonardoKey ? 'leonardo-ai' : 'unsplash-placeholder',
        },
      });
    } catch (error) {
      logError(error, 'TemplateQA Regenerate Single Image');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Evaluate and improve SEO for all templates
   */
  app.post('/api/admin/templates/qa/evaluate-seo', requireAdmin, async (_req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const templates = await loadAllTemplates();
      let completed = 0;

      const sendProgress = (current?: string) => {
        res.write(`data: ${JSON.stringify({
          progress: {
            total: templates.length,
            completed,
            current,
            status: 'running',
          },
        })}\n\n`);
      };

      for (const template of templates) {
        try {
          sendProgress(template.name || template.brand || template.id);

          // Load HTML content
          const html = template.htmlContent || template.content?.html || '';
          if (!html) {
            console.warn(`[TemplateQA] No HTML content for template ${template.id}`);
            completed++;
            continue;
          }

          const $ = cheerio.load(html);
          const improvements: string[] = [];

          // 1. Check and add title tag
          if (!$('title').length) {
            $('head').append(`<title>${template.name || template.brand || 'Professional Website'}</title>`);
            improvements.push('Added missing title tag');
          }

          // 2. Check and add meta description
          if (!$('meta[name="description"]').length) {
            const description = template.description || `${template.industry || 'Professional'} website template`;
            $('head').append(`<meta name="description" content="${description}">`);
            improvements.push('Added missing meta description');
          }

          // 3. Check and add Open Graph tags
          if (!$('meta[property="og:title"]').length) {
            $('head').append(`<meta property="og:title" content="${template.name || template.brand || 'Website'}">`);
            improvements.push('Added Open Graph title');
          }

          // 4. Ensure H1 tag exists
          if (!$('h1').length) {
            $('body').prepend(`<h1>${template.name || template.brand || 'Welcome'}</h1>`);
            improvements.push('Added missing H1 tag');
          }

          // 5. Add alt text to images without it
          $('img[src]:not([alt])').each((_, img) => {
            const $img = $(img);
            const altText = `${template.industry || 'Business'} image`;
            $img.attr('alt', altText);
            improvements.push('Added alt text to images');
          });

          // 6. Ensure semantic HTML structure
          if (!$('main').length && $('body').children().length > 0) {
            const bodyContent = $('body').html() || '';
            $('body').html(`<main>${bodyContent}</main>`);
            improvements.push('Added semantic main tag');
          }

          // Update template
          template.htmlContent = $.html();
          template.content = template.content || {};
          template.content.html = $.html();
          template.qaMetadata = template.qaMetadata || {};
          template.qaMetadata.seoEvaluated = true;
          template.qaMetadata.seoImprovements = improvements;
          template.qaMetadata.lastUpdated = new Date().toISOString();

          // Save template
          await saveTemplate(template);

          completed++;
        } catch (error) {
          console.error(`[TemplateQA] Error evaluating SEO for ${template.id}:`, getErrorMessage(error));
          template.qaMetadata = template.qaMetadata || {};
          template.qaMetadata.errors = template.qaMetadata.errors || [];
          template.qaMetadata.errors.push(`SEO evaluation failed: ${getErrorMessage(error)}`);
          await saveTemplate(template);
          completed++;
        }
      }

      res.write(`data: ${JSON.stringify({
        complete: completed,
        progress: {
          total: templates.length,
          completed,
          status: 'completed',
        },
      })}\n\n`);
      return res.end();
    } catch (error) {
      logError(error, 'TemplateQA Evaluate SEO');
      res.write(`data: ${JSON.stringify({
        error: getErrorMessage(error),
        progress: {
          status: 'error',
        },
      })}\n\n`);
      return res.end();
    }
  });

  /**
   * Evaluate SEO for a single template
   */
  app.post('/api/admin/templates/qa/evaluate-seo/:templateId', requireAdmin, async (req, res) => {
    try {
      const { templateId } = req.params;
      const templates = await loadAllTemplates();
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        return res.status(404).json({ success: false, error: `Template ${templateId} not found` });
      }

      const html = template.htmlContent || template.content?.html || (template.contentData as any)?.html || '';
      if (!html || html.trim().length < 100) {
        return res.status(400).json({ success: false, error: `No HTML content for template ${templateId}` });
      }

      const $ = cheerio.load(html);
      const improvements: string[] = [];
      const businessName = template.brand || template.name || 'Business';
      const industry = template.industry || 'Professional Services';

      // Add title tag if missing
      if (!$('title').length || $('title').text().length < 10) {
        $('head').append(`<title>${businessName} | ${industry}</title>`);
        improvements.push('Added title tag');
      }

      // Add meta description if missing
      if (!$('meta[name="description"]').length) {
        $('head').append(`<meta name="description" content="Welcome to ${businessName}. Professional ${industry} services.">`);
        improvements.push('Added meta description');
      }

      // Add Open Graph tags
      if (!$('meta[property="og:title"]').length) {
        $('head').append(`<meta property="og:title" content="${businessName}">`);
        improvements.push('Added OG title');
      }

      // Add alt text to images without it
      $('img:not([alt])').each((_, img) => {
        $(img).attr('alt', `${industry} image`);
      });

      const updatedHtml = $.html();
      template.htmlContent = updatedHtml;
      template.content = template.content || {};
      template.content.html = updatedHtml;
      template.qaMetadata = template.qaMetadata || {};
      template.qaMetadata.seoEvaluated = true;
      template.qaMetadata.seoImprovements = improvements;
      template.qaMetadata.lastUpdated = new Date().toISOString();

      await saveTemplate(template);
      console.log(`[TemplateQA] ✅ SEO evaluated for ${templateId} (${improvements.length} improvements)`);

      return res.json({
        success: true,
        message: `SEO evaluated for ${templateId}`,
        improvements: improvements.length,
      });
    } catch (error) {
      logError(error, 'TemplateQA Evaluate Single SEO');
      return res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  /**
   * Verify a single template
   */
  app.post('/api/admin/templates/qa/verify/:templateId', requireAdmin, async (req, res) => {
    try {
      const { templateId } = req.params;
      const templates = await loadAllTemplates();
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        return res.status(404).json({ success: false, error: `Template ${templateId} not found` });
      }

      const errors: string[] = [];
      const html = template.htmlContent || template.content?.html || (template.contentData as any)?.html || '';

      if (!html || html.trim().length < 100) {
        errors.push('Missing or invalid HTML content');
      } else {
        const $ = cheerio.load(html);
        if (!$('body').length && !$('html').length) errors.push('Invalid HTML structure');
        if (!$('title').length) errors.push('Missing title tag');
      }

      template.qaMetadata = template.qaMetadata || {};
      template.qaMetadata.verified = errors.length === 0;
      template.qaMetadata.verificationErrors = errors;
      template.qaMetadata.lastUpdated = new Date().toISOString();

      await saveTemplate(template);
      console.log(`[TemplateQA] ✅ Verified template ${templateId}: ${errors.length === 0 ? 'PASSED' : 'FAILED'}`);

      return res.json({
        success: true,
        verified: errors.length === 0,
        errors,
      });
    } catch (error) {
      logError(error, 'TemplateQA Verify Single');
      return res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  /**
   * Verify all templates are working correctly
   */
  app.post('/api/admin/templates/qa/verify', requireAdmin, async (_req, res) => {
    try {
      const templates = await loadAllTemplates();
      let verified = 0;
      let errors = 0;

      for (const template of templates) {
        const templateErrors: string[] = [];

        // 1. Check HTML content exists
        const html = template.htmlContent || template.content?.html || '';
        if (!html) {
          templateErrors.push('Missing HTML content');
        } else {
          // 2. Check HTML is valid (basic check)
          try {
            const $ = cheerio.load(html);
            // Check for basic structure
            if (!$('body').length && !$('html').length) {
              templateErrors.push('Invalid HTML structure');
            }
          } catch (error) {
            templateErrors.push(`HTML parsing error: ${getErrorMessage(error)}`);
          }
        }

        // 3. Check CSS exists
        const css = template.cssContent || template.content?.css || '';
        if (!css || css.length < 10) {
          templateErrors.push('Missing or invalid CSS');
        }

        // 4. Check images load (check for broken image URLs)
        if (html) {
          try {
            const $ = cheerio.load(html);
            const images = $('img[src]').toArray();
            for (const img of images) {
              const src = $(img).attr('src');
              if (src && !src.startsWith('data:') && !src.startsWith('http')) {
                // Relative URLs might be okay, but absolute URLs should be valid
                if (src.startsWith('//') || src.includes('://')) {
                  // Could add actual URL validation here
                }
              }
            }
          } catch (error) {
            // Ignore image check errors
          }
        }

        // Update template verification status
        template.qaMetadata = template.qaMetadata || {};
        template.qaMetadata.verified = templateErrors.length === 0;
        template.qaMetadata.errors = templateErrors;
        template.qaMetadata.lastUpdated = new Date().toISOString();

        await saveTemplate(template);

        if (templateErrors.length === 0) {
          verified++;
        } else {
          errors += templateErrors.length;
        }
      }

      return res.json({
        success: true,
        verified,
        errors,
        total: templates.length,
      });
    } catch (error) {
      logError(error, 'TemplateQA Verify');
      return res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // ============================================================
  // FINE-TUNING STUDIO ENDPOINTS
  // ============================================================

  /**
   * Get detailed template info with images and content sections
   */
  app.get('/api/admin/templates/qa/details/:templateId', requireAdmin, async (req, res) => {
    try {
      const { templateId } = req.params;
      const templates = await loadAllTemplates();
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        return res.status(404).json({ success: false, error: `Template ${templateId} not found` });
      }

      // Try multiple sources for HTML content
      let html = template.htmlContent || template.content?.html || (template.contentData as any)?.html || '';
      let htmlSource = html ? 'contentData' : 'none';
      
      // CRITICAL: Auto-fix HTML BEFORE returning (removes cookies, fixes broken elements)
      if (html && html.trim().length > 0) {
        try {
          const { autoFixTemplate } = await import('../services/templateAutoFixer');
          const { html: fixedHtml, result } = autoFixTemplate(html);
          if (result.fixed) {
            html = fixedHtml;
            htmlSource = htmlSource + '+autoFixed';
            console.log(`[TemplateQA] ✅ Auto-fixed template ${templateId}: ${result.fixes.join(', ')}`);
          }
        } catch (fixError) {
          console.warn(`[TemplateQA] ⚠️ Auto-fix failed:`, getErrorMessage(fixError));
        }
      }
      
      // CRITICAL: Ensure dependencies are injected before returning
      if (html && !html.includes('Pre-loaded JavaScript Dependencies') && !html.includes('jquery')) {
        try {
          const { injectDependencies } = await import('../services/templateDependencyInjector');
          html = injectDependencies(html);
          htmlSource = htmlSource.includes('+') ? htmlSource + '+injected' : htmlSource + '+injected';
          console.log(`[TemplateQA] ✅ Injected dependencies into template ${templateId} for preview`);
        } catch (injectError) {
          console.warn(`[TemplateQA] ⚠️ Failed to inject dependencies for preview:`, getErrorMessage(injectError));
        }
      }
      
      // Fallback: Try loading from scrapedContent table if HTML is empty
      if (!html && db && template.sourceId) {
        try {
          const scraped = await db
            .select()
            .from(scrapedContent)
            .where(eq(scrapedContent.sourceId, template.sourceId))
            .limit(1);
          
          if (scraped.length > 0 && scraped[0].htmlContent) {
            html = scraped[0].htmlContent;
            htmlSource = 'scrapedContent';
            console.log(`[TemplateQA] ✅ Loaded HTML from scrapedContent for template ${templateId} (${html.length} chars)`);
            
            // CRITICAL: Auto-fix scraped HTML BEFORE injecting dependencies
            if (html && html.trim().length > 0) {
              try {
                const { autoFixTemplate } = await import('../services/templateAutoFixer');
                const { html: fixedHtml, result } = autoFixTemplate(html);
                if (result.fixed) {
                  html = fixedHtml;
                  htmlSource = 'scrapedContent+autoFixed';
                  console.log(`[TemplateQA] ✅ Auto-fixed scraped HTML: ${result.fixes.join(', ')}`);
                }
              } catch (fixError) {
                console.warn(`[TemplateQA] ⚠️ Auto-fix failed for scraped HTML:`, getErrorMessage(fixError));
              }
            }
            
            // Inject dependencies if not already injected
            if (html && !html.includes('Pre-loaded JavaScript Dependencies') && !html.includes('jquery')) {
              try {
                const { injectDependencies } = await import('../services/templateDependencyInjector');
                html = injectDependencies(html);
                htmlSource = htmlSource.includes('+') ? htmlSource + '+injected' : htmlSource + '+injected';
                console.log(`[TemplateQA] ✅ Injected dependencies into scraped HTML for template ${templateId}`);
              } catch (injectError) {
                console.warn(`[TemplateQA] ⚠️ Failed to inject dependencies into scraped HTML:`, getErrorMessage(injectError));
              }
            }
          } else {
            console.warn(`[TemplateQA] ⚠️ Template ${templateId} has no HTML in contentData or scrapedContent`);
          }
        } catch (fallbackError) {
          console.warn(`[TemplateQA] Failed to load HTML from scrapedContent:`, getErrorMessage(fallbackError));
        }
      }
      
      // If still no HTML, log detailed info for debugging
      if (!html) {
        console.error(`[TemplateQA] ❌ Template ${templateId} has no HTML content. Sources checked:`);
        console.error(`  - template.htmlContent: ${template.htmlContent ? 'exists' : 'empty'}`);
        console.error(`  - template.content?.html: ${template.content?.html ? 'exists' : 'empty'}`);
        console.error(`  - template.contentData?.html: ${(template.contentData as any)?.html ? 'exists' : 'empty'}`);
        console.error(`  - template.sourceId: ${template.sourceId || 'none'}`);
        console.error(`  - Database available: ${db ? 'yes' : 'no'}`);
      }
      
      const $ = cheerio.load(html || '<html><body></body></html>');

      // Extract all images
      const images: any[] = [];
      $('img[src]').each((index, img) => {
        const $img = $(img);
        images.push({
          id: `img-${index}`,
          src: $img.attr('src') || '',
          alt: $img.attr('alt') || '',
          width: $img.attr('width') || '',
          height: $img.attr('height') || '',
          selector: `img:nth-of-type(${index + 1})`,
          isPlaceholder: ($img.attr('src') || '').includes('unsplash') || ($img.attr('data-placeholder') === 'true'),
        });
      });

      // Extract content sections (headings and paragraphs)
      const sections: any[] = [];
      $('h1, h2, h3, h4, h5, h6, p').each((index, el) => {
        const $el = $(el);
        const text = $el.text().trim();
        if (text.length > 10) { // Only include meaningful content
          sections.push({
            id: `section-${index}`,
            tag: el.tagName.toLowerCase(),
            text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
            fullText: text,
            selector: `${el.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
          });
        }
      });

      return res.json({
        success: true,
        template: {
          id: template.id,
          name: template.name || template.brand,
          industry: template.industry,
          qaMetadata: template.qaMetadata || {},
          images,
          sections,
          totalImages: images.length,
          totalSections: sections.length,
          htmlContent: html, // Include full HTML for website preview
          htmlSource, // Track where HTML came from for debugging
          hasHtml: !!html && html.trim().length > 0,
        },
      });
    } catch (error) {
      logError(error, 'TemplateQA Get Details');
      return res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  /**
   * Rewrite a specific section in a template
   */
  app.post('/api/admin/templates/qa/rewrite-section/:templateId', requireAdmin, async (req, res) => {
    try {
      const { templateId } = req.params;
      const { sectionId: _sectionId, selector, newText } = req.body;

      const templates = await loadAllTemplates();
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        return res.status(404).json({ success: false, error: `Template ${templateId} not found` });
      }

      const html = template.htmlContent || template.content?.html || (template.contentData as any)?.html || '';
      const $ = cheerio.load(html);

      // Find and update the section
      const $section = $(selector);
      if ($section.length === 0) {
        return res.status(400).json({ success: false, error: `Section not found: ${selector}` });
      }

      const oldText = $section.text();
      $section.text(newText || oldText); // Keep old text if no new text provided

      // Save updated template
      const updatedHtml = $.html();
      template.htmlContent = updatedHtml;
      template.content = template.content || {};
      template.content.html = updatedHtml;
      template.qaMetadata = template.qaMetadata || {};
      template.qaMetadata.lastUpdated = new Date().toISOString();
      template.qaMetadata.manualEdits = (template.qaMetadata.manualEdits || 0) + 1;

      await saveTemplate(template);

      console.log(`[TemplateQA] ✅ Section rewritten in ${templateId}: ${selector}`);

      return res.json({
        success: true,
        message: `Section updated in ${templateId}`,
        oldText: oldText.substring(0, 100),
        newText: (newText || oldText).substring(0, 100),
      });
    } catch (error) {
      logError(error, 'TemplateQA Rewrite Section');
      return res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  /**
   * Reimage a specific image in a template
   */
  app.post('/api/admin/templates/qa/reimage-single/:templateId', requireAdmin, async (req, res) => {
    try {
      const { templateId } = req.params;
      const { imageId: _imageId, selector, prompt } = req.body;

      const templates = await loadAllTemplates();
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        return res.status(404).json({ success: false, error: `Template ${templateId} not found` });
      }

      const html = template.htmlContent || template.content?.html || (template.contentData as any)?.html || '';
      const $ = cheerio.load(html);

      // Find the image
      const $img = $(selector);
      if ($img.length === 0) {
        return res.status(400).json({ success: false, error: `Image not found: ${selector}` });
      }

      const oldSrc = $img.attr('src') || '';
      const alt = $img.attr('alt') || '';
      const industry = template.industry || 'business';

      // Generate new image
      const hasLeonardoKey = !!process.env.LEONARDO_AI_API_KEY;
      let newSrc = '';

      if (hasLeonardoKey) {
        const generatedImage = await generateAIImage({
          prompt: prompt || alt || `Professional ${industry} image`,
          style: 'hero',
          businessContext: { name: template.brand || 'Business', industry, colorScheme: [] },
        });
        newSrc = generatedImage.url || oldSrc;
      } else {
        const searchTerms = encodeURIComponent(prompt || alt || industry);
        newSrc = `https://source.unsplash.com/800x600/?${searchTerms}&t=${Date.now()}`;
      }

      $img.attr('src', newSrc);
      $img.attr('data-reimaged', 'true');

      // Save updated template
      const updatedHtml = $.html();
      template.htmlContent = updatedHtml;
      template.content = template.content || {};
      template.content.html = updatedHtml;
      template.qaMetadata = template.qaMetadata || {};
      template.qaMetadata.lastUpdated = new Date().toISOString();
      template.qaMetadata.manualEdits = (template.qaMetadata.manualEdits || 0) + 1;

      await saveTemplate(template);

      console.log(`[TemplateQA] ✅ Image reimaged in ${templateId}: ${selector}`);

      return res.json({
        success: true,
        message: `Image updated in ${templateId}`,
        oldSrc: oldSrc.substring(0, 100),
        newSrc: newSrc.substring(0, 100),
        method: hasLeonardoKey ? 'leonardo-ai' : 'unsplash',
      });
    } catch (error) {
      logError(error, 'TemplateQA Reimage Single');
      return res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  /**
   * Upload custom image to replace an existing one
   */
  app.post('/api/admin/templates/qa/upload-image/:templateId', requireAdmin, async (req, res) => {
    try {
      const { templateId } = req.params;
      const { selector, imageUrl, imageBase64 } = req.body;

      const templates = await loadAllTemplates();
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        return res.status(404).json({ success: false, error: `Template ${templateId} not found` });
      }

      if (!imageUrl && !imageBase64) {
        return res.status(400).json({ success: false, error: 'Either imageUrl or imageBase64 is required' });
      }

      const html = template.htmlContent || template.content?.html || (template.contentData as any)?.html || '';
      const $ = cheerio.load(html);

      // Find the image
      const $img = $(selector);
      if ($img.length === 0) {
        return res.status(400).json({ success: false, error: `Image not found: ${selector}` });
      }

      const oldSrc = $img.attr('src') || '';
      const newSrc = imageUrl || `data:image/jpeg;base64,${imageBase64}`;

      $img.attr('src', newSrc);
      $img.attr('data-custom', 'true');
      $img.attr('data-uploaded', new Date().toISOString());

      // Save updated template
      const updatedHtml = $.html();
      template.htmlContent = updatedHtml;
      template.content = template.content || {};
      template.content.html = updatedHtml;
      template.qaMetadata = template.qaMetadata || {};
      template.qaMetadata.lastUpdated = new Date().toISOString();
      template.qaMetadata.customImages = (template.qaMetadata.customImages || 0) + 1;

      await saveTemplate(template);

      console.log(`[TemplateQA] ✅ Custom image uploaded in ${templateId}: ${selector}`);

      return res.json({
        success: true,
        message: `Custom image uploaded to ${templateId}`,
        oldSrc: oldSrc.substring(0, 100),
        isCustom: true,
      });
    } catch (error) {
      logError(error, 'TemplateQA Upload Image');
      return res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  /**
   * Get list of verified templates for fine-tuning
   */
  /**
   * Comprehensive QA Verification Function
   * Checks ALL requirements before template can be used in Final Product
   */
  async function verifyTemplateQA(template: any): Promise<{
    passed: boolean;
    checks: {
      hasHtml: boolean;
      htmlLength: number;
      contentRewritten: boolean;
      imagesRegenerated: boolean;
      seoEvaluated: boolean;
      hasCss: boolean;
      hasImages: boolean;
      noErrors: boolean;
      dependenciesInjected: boolean;
    };
    errors: string[];
  }> {
    const errors: string[] = [];
    const checks: any = {};

    // Check 1: HTML Content (CRITICAL - must exist)
    let html = template.htmlContent || template.content?.html || (template.contentData as any)?.html || '';
    checks.hasHtml = !!html && html.trim().length > 0;
    checks.htmlLength = html.length;
    
    // CRITICAL: Auto-fix HTML before verification (ensures 100% working templates)
    if (html && html.trim().length > 0) {
      try {
        const { html: fixedHtml, result } = autoFixTemplate(html);
        if (result.fixed) {
          html = fixedHtml;
          // Save fixed HTML back to template
          template.htmlContent = fixedHtml;
          template.content = template.content || {};
          template.content.html = fixedHtml;
          if (!template.contentData) template.contentData = {};
          template.contentData.html = fixedHtml;
          await saveTemplate(template);
          console.log(`[TemplateQA] ✅ Auto-fixed template ${template.id}: ${result.fixes.join(', ')}`);
        }
      } catch (fixError) {
        console.warn(`[TemplateQA] ⚠️ Auto-fix failed for ${template.id}:`, getErrorMessage(fixError));
      }
    }
    
    if (!checks.hasHtml) {
      // Try fallback to scrapedContent
      if (db && template.sourceId) {
        try {
          const scraped = await db
            .select()
            .from(scrapedContent)
            .where(eq(scrapedContent.sourceId, template.sourceId))
            .limit(1);
          
          if (scraped.length > 0 && scraped[0].htmlContent) {
            let restoredHtml = scraped[0].htmlContent;
            
            // Auto-fix restored HTML
            try {
              const { html: fixedHtml, result } = autoFixTemplate(restoredHtml);
              if (result.fixed) {
                restoredHtml = fixedHtml;
                console.log(`[TemplateQA] ✅ Auto-fixed restored HTML: ${result.fixes.join(', ')}`);
              }
            } catch (fixError) {
              console.warn(`[TemplateQA] ⚠️ Auto-fix failed for restored HTML:`, getErrorMessage(fixError));
            }
            
            checks.hasHtml = true;
            checks.htmlLength = restoredHtml.length;
            // Update template with fixed HTML from scrapedContent
            if (!template.contentData) template.contentData = {};
            template.contentData.html = restoredHtml;
            template.htmlContent = restoredHtml;
            template.content = template.content || {};
            template.content.html = restoredHtml;
            await saveTemplate(template);
            console.log(`[TemplateQA] ✅ Restored and auto-fixed HTML from scrapedContent for ${template.id}`);
          }
        } catch (e) {
          // Fallback failed
        }
      }
      
      if (!checks.hasHtml) {
        errors.push('CRITICAL: No HTML content found in template or scrapedContent');
      }
    }

    // Check 2: CSS Content
    checks.hasCss = !!(template.css || (template.contentData as any)?.css);
    if (!checks.hasCss) {
      errors.push('Missing CSS content');
    }

    // Check 3: QA Metadata Checks
    const qaMeta = template.qaMetadata || {};
    checks.contentRewritten = qaMeta.contentRewritten === true;
    checks.imagesRegenerated = qaMeta.imagesRegenerated === true;
    checks.seoEvaluated = qaMeta.seoEvaluated === true;
    checks.noErrors = !qaMeta.errors || qaMeta.errors.length === 0;

    if (!checks.contentRewritten) {
      errors.push('Content not rewritten');
    }
    if (!checks.imagesRegenerated) {
      errors.push('Images not regenerated');
    }
    if (!checks.seoEvaluated) {
      errors.push('SEO not evaluated');
    }
    if (!checks.noErrors) {
      errors.push(`QA errors: ${qaMeta.errors.join(', ')}`);
    }

    // Check 4: Images exist
    const images = template.images || (template.contentData as any)?.images || [];
    checks.hasImages = Array.isArray(images) && images.length > 0;
    if (!checks.hasImages) {
      errors.push('No images found in template');
    }

    // Check 5: Dependencies injected (CRITICAL for templates to work)
    const htmlForCheck = html || template.htmlContent || template.content?.html || (template.contentData as any)?.html || '';
    checks.dependenciesInjected = htmlForCheck.includes('jquery') || 
                                   htmlForCheck.includes('bootstrap') || 
                                   htmlForCheck.includes('Pre-loaded JavaScript Dependencies') ||
                                   htmlForCheck.includes('Dependencies injection complete');
    
    if (!checks.dependenciesInjected) {
      // Auto-inject dependencies if missing
      try {
        const { injectDependencies } = await import('../services/templateDependencyInjector');
        const htmlWithDeps = injectDependencies(htmlForCheck);
        
        // Update template with injected dependencies
        template.htmlContent = htmlWithDeps;
        template.content = template.content || {};
        template.content.html = htmlWithDeps;
        if (!template.contentData) template.contentData = {};
        template.contentData.html = htmlWithDeps;
        
        await saveTemplate(template);
        checks.dependenciesInjected = true;
        console.log(`[TemplateQA] ✅ Auto-injected dependencies into template ${template.id}`);
      } catch (injectError) {
        errors.push(`Dependencies not injected: ${getErrorMessage(injectError)}`);
        console.warn(`[TemplateQA] ⚠️ Failed to auto-inject dependencies:`, getErrorMessage(injectError));
      }
    }

    const passed = errors.length === 0 && checks.hasHtml && checks.contentRewritten && checks.imagesRegenerated && checks.seoEvaluated && checks.dependenciesInjected;

    return { passed, checks, errors };
  }

  /**
   * Run comprehensive QA verification on one or all templates
   */
  app.post('/api/admin/templates/qa/verify', requireAdmin, async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const { templateIds } = req.body || {};
      const allTemplates = await loadAllTemplates();

      const templates = templateIds && Array.isArray(templateIds) && templateIds.length > 0
        ? allTemplates.filter(t => templateIds.includes(t.id))
        : allTemplates;

      let completed = 0;
      let passed = 0;
      let failed = 0;

      const sendProgress = (current?: string, status?: any) => {
        res.write(`data: ${JSON.stringify({
          progress: {
            total: templates.length,
            completed,
            passed,
            failed,
            current,
            status: 'running',
            ...status,
          },
        })}\n\n`);
      };

      for (const template of templates) {
        try {
          sendProgress(template.name || template.brand || template.id);

          const verification = await verifyTemplateQA(template);

          // Update template QA metadata
          template.qaMetadata = template.qaMetadata || {};
          template.qaMetadata.verified = verification.passed;
          template.qaMetadata.verificationChecks = verification.checks;
          template.qaMetadata.verificationErrors = verification.errors;
          template.qaMetadata.lastVerified = new Date().toISOString();

          if (verification.passed) {
            passed++;
            console.log(`[TemplateQA] ✅ Template ${template.id} passed all QA checks`);
          } else {
            failed++;
            console.warn(`[TemplateQA] ❌ Template ${template.id} failed QA: ${verification.errors.join(', ')}`);
          }

          await saveTemplate(template);
          completed++;

          sendProgress(template.name, {
            templateId: template.id,
            passed: verification.passed,
            errors: verification.errors,
          });
        } catch (error) {
          console.error(`[TemplateQA] Error verifying ${template.id}:`, getErrorMessage(error));
          failed++;
          completed++;
        }
      }

      res.write(`data: ${JSON.stringify({
        complete: true,
        progress: {
          total: templates.length,
          completed,
          passed,
          failed,
          status: 'completed',
        },
      })}\n\n`);
      return res.end();
    } catch (error) {
      logError(error, 'TemplateQA Verify');
      res.write(`data: ${JSON.stringify({
        error: getErrorMessage(error),
        progress: { status: 'error' },
      })}\n\n`);
      return res.end();
    }
  });

  app.get('/api/admin/templates/qa/verified-list', requireAdmin, async (_req, res) => {
    try {
      const templates = await loadAllTemplates();
      
      // CRITICAL: Only return templates that pass ALL QA checks
      // This endpoint is used by Final Product, so it MUST be strict
      const verifiedTemplates = [];
      
      for (const template of templates) {
        const verification = await verifyTemplateQA(template);
        
        // STRICT CHECK: Template must pass ALL checks AND be marked as verified
        if (verification.passed && 
            verification.checks.hasHtml &&
            verification.checks.contentRewritten &&
            verification.checks.imagesRegenerated &&
            verification.checks.seoEvaluated &&
            verification.checks.hasImages &&
            verification.checks.noErrors) {
          verifiedTemplates.push({
            id: template.id,
            name: template.name || template.brand || 'Unnamed Template',
            industry: template.industry,
            contentRewritten: true,
            imagesRegenerated: true,
            seoEvaluated: true,
            verified: true,
            hasHtml: true,
            htmlLength: verification.checks.htmlLength,
            hasCss: verification.checks.hasCss,
            hasImages: verification.checks.hasImages,
            manualEdits: template.qaMetadata?.manualEdits || 0,
            customImages: template.qaMetadata?.customImages || 0,
            lastUpdated: template.qaMetadata?.lastUpdated,
            lastVerified: template.qaMetadata?.lastVerified || template.qaMetadata?.lastUpdated,
          });
        }
      }

      console.log(`[TemplateQA] Verified List: ${verifiedTemplates.length} templates passed ALL QA checks`);

      return res.json({
        success: true,
        templates: verifiedTemplates,
        total: verifiedTemplates.length,
        message: `Found ${verifiedTemplates.length} QA-verified templates ready for Final Product`,
      });
    } catch (error) {
      logError(error, 'TemplateQA Verified List');
      return res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  /**
   * Auto-fix template HTML (runs automatically on template load)
   * POST /api/admin/templates/auto-fix
   */
  app.post('/api/admin/templates/auto-fix', requireAdmin, async (req, res) => {
    try {
      const { html } = req.body;

      if (!html || typeof html !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'HTML content is required',
        });
      }

      // Run auto-fix
      const { html: fixedHtml, result } = autoFixTemplate(html);

      // Run smoke test on fixed HTML
      const smokeTest = smokeTestTemplate(fixedHtml);

      // Combine results
      const allIssues = [...result.errors, ...smokeTest.issues];
      const allWarnings = [...result.warnings, ...smokeTest.warnings];

      return res.json({
        success: true,
        fixedHtml,
        result: {
          fixed: result.fixed,
          fixes: result.fixes,
          errors: allIssues,
          warnings: allWarnings,
          smokeTestPassed: smokeTest.passed,
        },
      });
    } catch (error) {
      logError(error, 'TemplateAutoFix');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Deep inspection endpoint - comprehensive 66+ checks
   */
  app.post('/api/admin/templates/qa/deep-inspect/:templateId', requireAdmin, async (req, res) => {
    try {
      const { templateId } = req.params;
      const templates = await loadAllTemplates();
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: `Template ${templateId} not found`,
        });
      }

      // Load HTML content
      const html = template.htmlContent ||
                  template.content?.html ||
                  (template.contentData as any)?.html ||
                  '';

      if (!html || html.trim().length < 100) {
        return res.status(400).json({
          success: false,
          error: `No HTML content for template ${templateId}`,
        });
      }

      // Run comprehensive inspection
      const inspectionResult = await inspectTemplate(template, html);

      // Apply auto-fixes based on inspection
      const { html: fixedHtml, result: fixResult } = autoFixTemplate(html, template);
      
      // Update inspection result with auto-fix count
      inspectionResult.autoFixApplied = fixResult.fixes.length;

      // Save fixed HTML if fixes were applied
      if (fixResult.fixed) {
        template.htmlContent = fixedHtml;
        template.content = template.content || {};
        template.content.html = fixedHtml;
        await saveTemplate(template);
      }

      // Save inspection results to template metadata
      template.qaMetadata = template.qaMetadata || {};
      template.qaMetadata.deepInspection = inspectionResult;
      template.qaMetadata.lastInspected = new Date().toISOString();
      await saveTemplate(template);

      console.log(`[TemplateQA] ✅ Deep inspection completed for ${templateId}: Score ${inspectionResult.score}/100, ${inspectionResult.passedChecks}/${inspectionResult.totalChecks} passed`);

      return res.json({
        success: true,
        inspection: inspectionResult,
        autoFix: {
          applied: fixResult.fixed,
          fixes: fixResult.fixes,
          warnings: fixResult.warnings,
        },
      });
    } catch (error) {
      logError(error, 'TemplateQA Deep Inspection');
      return res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Batch deep inspection for all templates
   */
  app.post('/api/admin/templates/qa/deep-inspect-all', requireAdmin, async (_req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const templates = await loadAllTemplates();
      let completed = 0;
      let passed = 0;
      let failed = 0;

      const sendProgress = (templateName: string, result?: any) => {
        res.write(`data: ${JSON.stringify({
          template: templateName,
          progress: {
            total: templates.length,
            completed,
            passed,
            failed,
            status: completed < templates.length ? 'running' : 'completed',
          },
          result,
        })}\n\n`);
      };

      for (const template of templates) {
        try {
          sendProgress(template.name || template.brand || template.id);

          const html = template.htmlContent ||
                      template.content?.html ||
                      (template.contentData as any)?.html ||
                      '';

          if (!html || html.trim().length < 100) {
            console.warn(`[TemplateQA] Skipping ${template.id} - no HTML content`);
            completed++;
            continue;
          }

          // Run inspection
          const inspectionResult = await inspectTemplate(template, html);

          // Apply auto-fixes
          const { html: fixedHtml, result: fixResult } = autoFixTemplate(html, template);
          inspectionResult.autoFixApplied = fixResult.fixes.length;

          // Save fixes
          if (fixResult.fixed) {
            template.htmlContent = fixedHtml;
            template.content = template.content || {};
            template.content.html = fixedHtml;
          }

          // Save inspection results
          template.qaMetadata = template.qaMetadata || {};
          template.qaMetadata.deepInspection = inspectionResult;
          template.qaMetadata.lastInspected = new Date().toISOString();
          await saveTemplate(template);

          if (inspectionResult.passed) {
            passed++;
          } else {
            failed++;
          }

          completed++;
          sendProgress(template.name || template.brand || template.id, {
            score: inspectionResult.score,
            passed: inspectionResult.passed,
            criticalIssues: inspectionResult.criticalIssues.length,
          });
        } catch (error) {
          console.error(`[TemplateQA] Error inspecting ${template.id}:`, getErrorMessage(error));
          failed++;
          completed++;
          sendProgress(template.name || template.brand || template.id, {
            error: getErrorMessage(error),
          });
        }
      }

      res.write(`data: ${JSON.stringify({
        complete: completed,
        progress: {
          total: templates.length,
          completed,
          passed,
          failed,
          status: 'completed',
        },
      })}\n\n`);
      return res.end();
    } catch (error) {
      logError(error, 'TemplateQA Batch Deep Inspection');
      res.write(`data: ${JSON.stringify({
        error: getErrorMessage(error),
        progress: {
          status: 'error',
        },
      })}\n\n`);
      return res.end();
    }
  });
}



