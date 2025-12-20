/**
 * SEO Engine 2.0
 * Merlin 7.0 - Module 9
 * Comprehensive SEO: titles, descriptions, OG, Twitter, Schema.org, sitemap, robots.txt
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import type { ProjectConfig } from '../services/projectConfig';
import type { PlannedPage } from '../types/plannedPage';
import type { PageSEOData, SEOStrategy, SitemapEntry, RobotsTxt } from '../types/seoTypes';
import type { IndustryProfile } from './industryEngine';
import { getErrorMessage, logError } from '../utils/errorHandler';

/**
 * Create OpenAI client
 */
function createOpenAIClient(): OpenAI | null {
  if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
}

/**
 * Generate SEO data for a page
 */
export async function generatePageSEO(
  page: PlannedPage,
  projectConfig: ProjectConfig,
  industryProfile: IndustryProfile,
  baseUrl: string = 'https://example.com'
): Promise<PageSEOData> {
  const openai = createOpenAIClient();
  
  if (!openai) {
    return generateFallbackSEO(page, projectConfig, baseUrl);
  }
  
  try {
    const prompt = buildSEOPrompt(page, projectConfig, industryProfile, baseUrl);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO expert. Generate comprehensive SEO metadata including titles, descriptions, OG tags, Twitter cards, and Schema.org markup.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    
    const seo = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      title: seo.title || `${page.title} | ${projectConfig.projectName}`,
      metaDescription: seo.metaDescription || page.seo.description,
      keywords: seo.keywords || page.seo.keywords,
      h1: seo.h1 || page.seo.h1,
      headings: seo.headings || page.seo.headings,
      canonical: seo.canonical || `${baseUrl}/${page.slug}`,
      og: seo.og || {
        title: page.title,
        description: page.seo.description,
        image: `${baseUrl}/assets/images/og-${page.slug}.jpg`,
        url: `${baseUrl}/${page.slug}`,
        type: 'website',
        siteName: projectConfig.projectName,
      },
      twitter: seo.twitter || {
        card: 'summary_large_image',
        title: page.title,
        description: page.seo.description,
        image: `${baseUrl}/assets/images/twitter-${page.slug}.jpg`,
      },
      schema: seo.schema || generateSchemaMarkup(page, projectConfig, industryProfile, baseUrl),
      localSEO: projectConfig.location ? generateLocalSEO(projectConfig) : undefined,
    };
  } catch (error: unknown) {
    logError(error, 'SEO Engine');
    return generateFallbackSEO(page, projectConfig, baseUrl);
  }
}

/**
 * Build SEO prompt
 */
function buildSEOPrompt(
  page: PlannedPage,
  projectConfig: ProjectConfig,
  industryProfile: IndustryProfile,
  baseUrl: string
): string {
  return `Generate comprehensive SEO metadata for this page:

PAGE:
- Title: ${page.title}
- Type: ${page.type}
- Slug: ${page.slug}
- Description: ${page.seo.description}

BUSINESS:
- Name: ${projectConfig.projectName}
- Industry: ${projectConfig.industry}
- Location: ${projectConfig.location.city}, ${projectConfig.location.region}
- Services: ${projectConfig.services.map(s => s.name).join(', ')}

SEO STRATEGY:
- Primary Keywords: ${industryProfile.seoStrategy.primaryKeywords.join(', ')}
- Local SEO: ${industryProfile.seoStrategy.localSEO ? 'Yes' : 'No'}

TASK:
Generate:
1. Title (60-65 chars, includes primary keyword)
2. Meta Description (150-160 chars, compelling)
3. Keywords (5-10 relevant)
4. H1 (main heading)
5. Headings (H2-H6 structure)
6. Canonical URL
7. Open Graph tags
8. Twitter Card tags
9. Schema.org JSON-LD (${industryProfile.seoStrategy.schemaTypes.join(', ')})

Return JSON with all fields.`;
}

/**
 * Generate Schema.org markup
 */
function generateSchemaMarkup(
  page: PlannedPage,
  projectConfig: ProjectConfig,
  industryProfile: IndustryProfile,
  baseUrl: string
): any {
  const schemaType = industryProfile.seoStrategy.schemaTypes[0] || 'LocalBusiness';
  
  const baseSchema: any = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: projectConfig.projectName,
    url: `${baseUrl}/${page.slug}`,
  };
  
  if (schemaType === 'LocalBusiness') {
    baseSchema.address = {
      '@type': 'PostalAddress',
      addressLocality: projectConfig.location.city,
      addressRegion: projectConfig.location.region,
      addressCountry: projectConfig.location.country,
    };
  }
  
  if (page.type === 'home') {
    baseSchema.description = projectConfig.services.map(s => s.name).join(', ');
  }
  
  return baseSchema;
}

/**
 * Generate local SEO data
 */
function generateLocalSEO(projectConfig: ProjectConfig): any {
  return {
    businessName: projectConfig.projectName,
    address: {
      street: '', // Would come from config
      city: projectConfig.location.city,
      region: projectConfig.location.region,
      postalCode: '',
      country: projectConfig.location.country,
    },
    phone: '',
    email: '',
  };
}

/**
 * Generate sitemap.xml
 */
export function generateSitemap(
  pages: PlannedPage[],
  baseUrl: string = 'https://example.com'
): string {
  const entries: SitemapEntry[] = pages.map(page => ({
    url: `${baseUrl}/${page.slug === 'home' ? '' : page.slug}`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: page.type === 'home' ? 'weekly' : 'monthly',
    priority: page.required ? 1.0 : 0.8,
  }));
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  
  return sitemap;
}

/**
 * Generate robots.txt
 */
export function generateRobotsTxt(
  baseUrl: string = 'https://example.com',
  sitemapUrl?: string
): string {
  const robots: RobotsTxt = {
    userAgents: [
      {
        agent: '*',
        allow: ['/'],
        disallow: ['/admin', '/api'],
      },
    ],
    sitemap: sitemapUrl || `${baseUrl}/sitemap.xml`,
  };
  
  let robotsTxt = '';
  for (const agent of robots.userAgents) {
    robotsTxt += `User-agent: ${agent.agent}\n`;
    agent.allow.forEach(path => {
      robotsTxt += `Allow: ${path}\n`;
    });
    agent.disallow.forEach(path => {
      robotsTxt += `Disallow: ${path}\n`;
    });
    robotsTxt += '\n';
  }
  robotsTxt += `Sitemap: ${robots.sitemap}\n`;
  
  return robotsTxt;
}

/**
 * Save SEO files
 */
export function saveSEOFiles(
  sitemap: string,
  robots: string,
  projectSlug: string
): void {
  const outputDir = path.join(process.cwd(), 'website_projects', projectSlug, 'generated-v5');
  
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemap, 'utf-8');
  fs.writeFileSync(path.join(outputDir, 'robots.txt'), robots, 'utf-8');
}

/**
 * Generate fallback SEO
 */
function generateFallbackSEO(
  page: PlannedPage,
  projectConfig: ProjectConfig,
  baseUrl: string
): PageSEOData {
  return {
    title: `${page.title} | ${projectConfig.projectName}`,
    metaDescription: page.seo.description || `${page.title} - ${projectConfig.projectName}`,
    keywords: page.seo.keywords,
    h1: page.seo.h1,
    headings: page.seo.headings,
    canonical: `${baseUrl}/${page.slug}`,
    og: {
      title: page.title,
      description: page.seo.description,
      image: `${baseUrl}/assets/images/og-${page.slug}.jpg`,
      url: `${baseUrl}/${page.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: page.title,
      description: page.seo.description,
      image: `${baseUrl}/assets/images/twitter-${page.slug}.jpg`,
    },
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
    },
  };
}

