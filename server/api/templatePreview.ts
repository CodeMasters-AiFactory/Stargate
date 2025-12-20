/**
 * Template Preview API
 * Serves template previews with all dependencies pre-loaded
 * GET /api/template-preview/:templateId
 */

import { brandTemplates } from '@shared/schema';
import * as cheerio from 'cheerio';
import { eq } from 'drizzle-orm';
import type { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { db } from '../db';
import { injectDependencies, processTemplateFile } from '../services/templateDependencyInjector';
import { getErrorMessage, logError } from '../utils/errorHandler';

export function registerTemplatePreviewRoutes(app: Express) {
  /**
   * Get template preview with dependencies pre-loaded
   * GET /api/template-preview/:templateId
   */
  app.get('/api/template-preview/:templateId', async (req, res) => {
    try {
      const { templateId } = req.params;

      // Try to get template from database
      let template: any = null;
      if (db) {
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
          console.error('[TemplatePreview] Database error:', dbError);
        }
      }

      // If not in database, try to find in website_projects
      if (!template) {
        const projectDir = path.join(process.cwd(), 'website_projects', templateId);
        const standaloneFile = path.join(projectDir, 'index-standalone.html');
        const indexFile = path.join(projectDir, 'index.html');

        let htmlFile: string | null = null;
        if (fs.existsSync(standaloneFile)) {
          htmlFile = standaloneFile;
        } else if (fs.existsSync(indexFile)) {
          htmlFile = indexFile;
        }

        if (htmlFile) {
          // Process template with dependencies
          const processedHTML = processTemplateFile(htmlFile);
          res.set('Content-Type', 'text/html');
          res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
          return res.send(processedHTML);
        }
      }

      // If template has contentData with HTML
      if (template?.contentData?.html) {
        // CRITICAL: Prefer bundled HTML (self-contained) if available
        let html = (template.contentData as any)?.bundledHtml || template.contentData.html;
        const isBundled = !!(template.contentData as any)?.bundledHtml;
        
        if (isBundled) {
          console.log(`[TemplatePreview] Using bundled (self-contained) HTML version`);
        }

        // Get original website URL from metadata or sourceUrl field
        const originalUrl = template.sourceUrl ||
                           (template.contentData as any)?.metadata?.url ||
                           (template.contentData as any)?.metadata?.sourceUrl ||
                           'https://www.apple.com'; // Fallback

        console.log(`[TemplatePreview] Using source URL: ${originalUrl}`);

        // CRITICAL: Convert relative URLs to absolute URLs using Cheerio
        try {
          const $ = cheerio.load(html);
          const baseUrl = new URL(originalUrl);

          console.log(`[TemplatePreview] Converting URLs using base: ${baseUrl.origin}`);

          // Convert all link[href] attributes (CSS files)
          $('link[href]').each((_, el) => {
            const href = $(el).attr('href');
            if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('data:') && !href.startsWith('#')) {
              try {
                const absoluteUrl = href.startsWith('/')
                  ? `${baseUrl.origin}${href}`
                  : new URL(href, originalUrl).href;
                $(el).attr('href', absoluteUrl);
                console.log(`[TemplatePreview] Converted CSS: ${href} → ${absoluteUrl}`);
              } catch (e) {
                console.warn(`[TemplatePreview] Failed to convert CSS URL: ${href}`);
              }
            }
          });

          // Convert all script[src] attributes (JS files)
          $('script[src]').each((_, el) => {
            const src = $(el).attr('src');
            if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:') && !src.startsWith('#')) {
              try {
                const absoluteUrl = src.startsWith('/')
                  ? `${baseUrl.origin}${src}`
                  : new URL(src, originalUrl).href;
                $(el).attr('src', absoluteUrl);
                console.log(`[TemplatePreview] Converted JS: ${src} → ${absoluteUrl}`);
              } catch (e) {
                console.warn(`[TemplatePreview] Failed to convert JS URL: ${src}`);
              }
            }
          });

          // Convert all img[src] attributes
          $('img[src]').each((_, el) => {
            const src = $(el).attr('src');
            if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:') && !src.startsWith('#')) {
              try {
                const absoluteUrl = src.startsWith('/')
                  ? `${baseUrl.origin}${src}`
                  : new URL(src, originalUrl).href;
                $(el).attr('src', absoluteUrl);
              } catch (e) {
                // Skip if URL conversion fails
              }
            }
          });

          // Convert all img[srcset] attributes
          $('img[srcset]').each((_, el) => {
            const srcset = $(el).attr('srcset');
            if (srcset) {
              const convertedSrcset = srcset.split(',').map(item => {
                const parts = item.trim().split(/\s+/);
                const url = parts[0];
                if (url && !url.startsWith('http') && !url.startsWith('//') && !url.startsWith('data:')) {
                  try {
                    const absoluteUrl = url.startsWith('/')
                      ? `${baseUrl.origin}${url}`
                      : new URL(url, originalUrl).href;
                    return `${absoluteUrl} ${parts.slice(1).join(' ')}`;
                  } catch {
                    return item;
                  }
                }
                return item;
              }).join(', ');
              $(el).attr('srcset', convertedSrcset);
            }
          });

          // Remove integrity attributes that cause blocking
          $('link[integrity], script[integrity]').each((_, el) => {
            $(el).removeAttr('integrity');
          });

          // CRITICAL: Make all links work correctly in preview mode
          $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
              return; // Skip anchors, JS, email, phone links
            }

            try {
              // Convert relative URLs to absolute
              let absoluteUrl: string;
              if (href.startsWith('http') || href.startsWith('//')) {
                absoluteUrl = href.startsWith('//') ? `https:${href}` : href;
              } else {
                absoluteUrl = href.startsWith('/')
                  ? `${baseUrl.origin}${href}`
                  : new URL(href, originalUrl).href;
              }

              // Check if link is to same domain (internal) or different (external)
              const linkDomain = new URL(absoluteUrl).origin;
              const isInternal = linkDomain === baseUrl.origin;

              if (isInternal) {
                // Internal links: open original site in new tab (since we don't have other pages scraped)
                $(el).attr('href', absoluteUrl);
                $(el).attr('target', '_blank');
                $(el).attr('rel', 'noopener noreferrer');
                $(el).attr('data-preview-mode', 'internal');
              } else {
                // External links: open in new tab
                $(el).attr('href', absoluteUrl);
                $(el).attr('target', '_blank');
                $(el).attr('rel', 'noopener noreferrer');
                $(el).attr('data-preview-mode', 'external');
              }
            } catch (e) {
              // Invalid URL, leave as is
              console.warn(`[TemplatePreview] Invalid link URL: ${href}`);
            }
          });

          html = $.html();
          console.log(`[TemplatePreview] ✅ URL conversion complete`);
        } catch (cheerioError) {
          console.error('[TemplatePreview] Cheerio error:', cheerioError);
          // Fallback to regex if Cheerio fails
          const baseUrl = new URL(originalUrl);
          html = html.replace(/href=["'](\/[^"']+)["']/g, (match, path) => {
            if (path.startsWith('//') || path.startsWith('http')) return match;
            return `href="${baseUrl.origin}${path}"`;
          });

          html = html.replace(/src=["'](\/[^"']+)["']/g, (match, path) => {
            if (path.startsWith('//') || path.startsWith('http')) return match;
            return `src="${baseUrl.origin}${path}"`;
          });
        }

        // CRITICAL: Add base tag to resolve remaining relative URLs
        const baseTag = `<base href="${originalUrl}" target="_blank">`;

        // Add preview mode indicator CSS
        const previewModeCSS = `
<style id="preview-mode-indicator">
  body::before {
    content: "Preview Mode - Links open original site in new tab";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(59, 130, 246, 0.9);
    color: white;
    padding: 8px 16px;
    text-align: center;
    font-size: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    z-index: 999999;
    pointer-events: none;
  }
  a[data-preview-mode] {
    cursor: pointer !important;
  }
</style>`;

        const headIndex = html.indexOf('<head>');
        if (headIndex !== -1) {
          html = html.slice(0, headIndex + 6) + '\n' + baseTag + previewModeCSS + '\n' + html.slice(headIndex + 6);
        }

        // CRITICAL: Inject the scraped CSS if available (MUST be first in <head>)
        const cssToInject = template.css || (template.contentData as any)?.css;
        if (cssToInject) {
          // Find <head> tag and inject CSS right after base tag
          const headStartIndex = html.indexOf('<head>');
          if (headStartIndex !== -1) {
            // Find the end of base tag injection
            const baseEndIndex = html.indexOf('>', headStartIndex + 6) + 1;
            const cssStyleTag = `\n<style id="scraped-template-css">\n${cssToInject}\n</style>\n`;
            html = html.slice(0, baseEndIndex) + cssStyleTag + html.slice(baseEndIndex);
          } else {
            // No <head> tag, create one
            const htmlStartIndex = html.indexOf('<html>');
            if (htmlStartIndex !== -1) {
              const htmlEnd = htmlStartIndex + 6; // Length of '<html>'
              html = html.slice(0, htmlEnd) + '\n<head><style id="scraped-template-css">\n' + cssToInject + '\n</style></head>' + html.slice(htmlEnd);
            } else {
              // No HTML structure, wrap everything
              html = `<!DOCTYPE html><html><head><style id="scraped-template-css">\n${cssToInject}\n</style></head><body>${html}</body></html>`;
            }
          }
        }

        // CRITICAL: Inject the scraped JavaScript if available
        const jsToInject = (template.contentData as any)?.js;
        if (jsToInject) {
          // Find </body> tag and inject JS before it, or append to end
          const bodyEndIndex = html.indexOf('</body>');
          if (bodyEndIndex !== -1) {
            const jsScriptTag = `\n<script id="scraped-template-js">\n${jsToInject}\n</script>\n`;
            html = html.slice(0, bodyEndIndex) + jsScriptTag + html.slice(bodyEndIndex);
          } else {
            // No </body> tag, append to end
            html = html + `\n<script id="scraped-template-js">\n${jsToInject}\n</script>\n`;
          }
        }

        // Inject common dependencies (jQuery, Bootstrap, etc.) - but WITHOUT integrity checks for now
        html = injectDependencies(html);

        res.set('Content-Type', 'text/html');
        res.set('Cache-Control', 'public, max-age=3600');
        return res.send(html);
      }

      // If template has CSS, generate a preview HTML
      if (template?.css) {
        const previewHTML = generatePreviewFromTemplate(template);
        const processedHTML = injectDependencies(previewHTML);

        res.set('Content-Type', 'text/html');
        res.set('Cache-Control', 'public, max-age=3600');
        return res.send(processedHTML);
      }

      // Template not found
      res.status(404).json({
        success: false,
        error: `Template "${templateId}" not found`,
      });
    } catch (error) {
      logError(error, 'TemplatePreview');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Get template preview URL (for iframe src)
   * Returns the URL to use in iframe
   */
  app.get('/api/template-preview-url/:templateId', async (req, res) => {
    try {
      const { templateId } = req.params;
      const previewUrl = `/api/template-preview/${templateId}`;

      res.json({
        success: true,
        url: previewUrl,
      });
    } catch (error) {
      logError(error, 'TemplatePreviewURL');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });
}

/**
 * Generate preview HTML from template metadata
 */
function generatePreviewFromTemplate(template: any): string {
  const colors = template.colors || {
    primary: '#000000',
    secondary: '#000000',
    background: '#FFFFFF',
    text: '#000000',
  };

  const typography = template.typography || {
    headingFont: 'system-ui, sans-serif',
    bodyFont: 'system-ui, sans-serif',
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.name || 'Template Preview'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${typography.bodyFont || 'system-ui, sans-serif'};
      background: ${colors.background || '#FFFFFF'};
      color: ${colors.text || '#000000'};
      line-height: 1.6;
    }
    ${template.css || ''}
    .preview-hero {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, ${colors.primary || '#000000'}20, ${colors.secondary || '#000000'}20);
      padding: 2rem;
      text-align: center;
    }
    .preview-hero h1 {
      font-family: ${typography.headingFont || 'system-ui, sans-serif'};
      font-size: 3rem;
      color: ${colors.text || '#000000'};
      margin-bottom: 1rem;
    }
    .preview-btn {
      background: ${colors.primary || '#000000'};
      color: ${colors.background || '#FFFFFF'};
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      margin: 1rem;
      transition: transform 0.2s;
    }
    .preview-btn:hover {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="preview-hero">
    <div>
      <h1>${template.brand || template.name || 'Template'}</h1>
      <p style="color: ${colors.text || '#000000'}80; font-size: 1.2rem; margin-bottom: 1rem;">
        ${template.name || 'Template Preview'}
      </p>
      <button class="preview-btn" onclick="alert('Template is interactive!')">Get Started</button>
    </div>
  </div>
</body>
</html>
  `.trim();
}

