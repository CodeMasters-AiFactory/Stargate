/**
 * SEO Automation API Routes
 * Automatic schema, sitemap, robots.txt, and meta tag generation
 */

import type { Express, Request, Response } from 'express';
import { optimizeSEO } from '../services/seoAutomation';
import { getErrorMessage, logError } from '../utils/errorHandler';

export function registerSEOAutomationRoutes(app: Express): void {
  /**
   * POST /api/seo-automation/optimize
   * Full SEO optimization with automatic schema, sitemap, and meta tags
   */
  app.post('/api/seo-automation/optimize', async (req: Request, res: Response) => {
    try {
      const { html, clientInfo, pages } = req.body;

      if (!html || !clientInfo) {
        return res.status(400).json({
          success: false,
          error: 'html and clientInfo are required',
        });
      }

      const result = await optimizeSEO(html, clientInfo, pages || []);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      logError(error, 'SEOAutomation API - Optimize');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * GET /api/seo-automation/generate-sitemap
   * Generate XML sitemap
   */
  app.get('/api/seo-automation/generate-sitemap', async (req: Request, res: Response) => {
    try {
      const { pages, baseUrl } = req.query;

      if (!pages || !baseUrl) {
        return res.status(400).json({
          success: false,
          error: 'pages and baseUrl are required',
        });
      }

      const pagesArray = typeof pages === 'string' ? JSON.parse(pages) : pages;
      const sitemap = generateSitemap(pagesArray, baseUrl as string);

      res.setHeader('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      logError(error, 'SEOAutomation API - GenerateSitemap');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * GET /api/seo-automation/generate-robots
   * Generate robots.txt
   */
  app.get('/api/seo-automation/generate-robots', async (req: Request, res: Response) => {
    try {
      const { allowAll, baseUrl } = req.query;

      const robotsTxt = generateRobotsTxt(
        allowAll !== 'false',
        (baseUrl as string) || 'https://example.com'
      );

      res.setHeader('Content-Type', 'text/plain');
      res.send(robotsTxt);
    } catch (error) {
      logError(error, 'SEOAutomation API - GenerateRobots');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });
}

// Helper functions (would be imported from seoAutomation service)
function generateSitemap(pages: Array<{ slug: string; lastmod?: string }>, baseUrl: string): string {
  const urls = pages.map(page => {
    const lastmod = page.lastmod || new Date().toISOString().split('T')[0];
    return `  <url>
    <loc>${baseUrl}/${page.slug === 'index' ? '' : page.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.slug === 'index' ? '1.0' : '0.8'}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function generateRobotsTxt(allowAll: boolean = true, baseUrl: string = 'https://example.com'): string {
  if (allowAll) {
    return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;
  } else {
    return `User-agent: *
Disallow: /

Sitemap: ${baseUrl}/sitemap.xml`;
  }
}
