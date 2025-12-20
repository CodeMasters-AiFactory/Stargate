/**
 * SEO Automation Service
 * Comprehensive SEO automation: schema markup, meta tags, sitemap, local SEO
 */

import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { generate } from './multiModelAIOrchestrator';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface SEOOptimization {
  html: string;
  sitemap: string;
  robotsTxt: string;
  schema: any; // JSON-LD schema
  metaTags: {
    title: string;
    description: string;
    keywords: string;
    openGraph: Record<string, string>;
    twitter: Record<string, string>;
  };
  improvements: Array<{
    type: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  seoScore: number; // 0-100
}

/**
 * Generate LocalBusiness schema
 */
function generateLocalBusinessSchema(clientInfo: {
  businessName: string;
  phone: string;
  email: string;
  address: string;
  location: { city: string; state: string; country: string };
  services: Array<{ name: string; description: string }>;
}): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: clientInfo.businessName,
    telephone: clientInfo.phone,
    email: clientInfo.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: clientInfo.address,
      addressLocality: clientInfo.location.city,
      addressRegion: clientInfo.location.state,
      addressCountry: clientInfo.location.country,
    },
    areaServed: {
      '@type': 'City',
      name: `${clientInfo.location.city}, ${clientInfo.location.state}`,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: clientInfo.services.map((service, index) => ({
        '@type': 'Offer',
        position: index + 1,
        itemOffered: {
          '@type': 'Service',
          name: service.name,
          description: service.description,
        },
      })),
    },
  };
}

/**
 * Generate FAQ schema
 */
function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate meta tags
 */
async function generateMetaTags(
  html: string,
  clientInfo: {
    businessName: string;
    industry: string;
    location: { city: string; state: string };
    services: Array<{ name: string }>;
  }
): Promise<{
  title: string;
  description: string;
  keywords: string;
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
}> {
  const $ = cheerio.load(html);
  
  // Generate title
  const title = `${clientInfo.businessName} | ${clientInfo.services[0]?.name || clientInfo.industry} | ${clientInfo.location.city}, ${clientInfo.location.state}`;
  
  // Generate description
  const servicesList = clientInfo.services.map(s => s.name).join(', ');
  const description = `${clientInfo.businessName} provides ${servicesList} in ${clientInfo.location.city}, ${clientInfo.location.state}. Contact us today for a free consultation!`;
  
  // Generate keywords
  const keywords = [
    clientInfo.businessName,
    clientInfo.industry,
    ...clientInfo.services.map(s => s.name),
    clientInfo.location.city,
    clientInfo.location.state,
    `${clientInfo.industry} ${clientInfo.location.city}`,
  ].join(', ');

  // Open Graph tags
  const openGraph = {
    'og:title': title,
    'og:description': description,
    'og:type': 'website',
    'og:locale': 'en_US',
  };

  // Twitter Card tags
  const twitter = {
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
  };

  return {
    title,
    description,
    keywords,
    openGraph,
    twitter,
  };
}

/**
 * Inject SEO tags into HTML
 */
function injectSEOTags(html: string, metaTags: any, schema: any[], clientInfo?: { websiteUrl?: string }): string {
  const $ = cheerio.load(html);

  // Update or add title
  if ($('title').length) {
    $('title').text(metaTags.title);
  } else {
    $('head').prepend(`<title>${metaTags.title}</title>`);
  }

  // Update or add meta description
  if ($('meta[name="description"]').length) {
    $('meta[name="description"]').attr('content', metaTags.description);
  } else {
    $('head').append(`<meta name="description" content="${metaTags.description}">`);
  }

  // Update or add keywords
  if ($('meta[name="keywords"]').length) {
    $('meta[name="keywords"]').attr('content', metaTags.keywords);
  } else {
    $('head').append(`<meta name="keywords" content="${metaTags.keywords}">`);
  }

  // Add Open Graph tags
  Object.entries(metaTags.openGraph).forEach(([property, content]) => {
    if (!$(`meta[property="${property}"]`).length) {
      $('head').append(`<meta property="${property}" content="${content}">`);
    }
  });

  // Add Twitter Card tags
  Object.entries(metaTags.twitter).forEach(([name, content]) => {
    if (!$(`meta[name="${name}"]`).length) {
      $('head').append(`<meta name="${name}" content="${content}">`);
    }
  });

  // Add canonical URL
  const baseUrl = clientInfo?.websiteUrl || 'https://example.com';
  if (!$('link[rel="canonical"]').length) {
    $('head').append(`<link rel="canonical" href="${baseUrl}">`);
  }

  // Add schema JSON-LD
  schema.forEach(s => {
    $('head').append(`<script type="application/ld+json">${JSON.stringify(s)}</script>`);
  });

  return $.html();
}

/**
 * Generate XML sitemap
 */
function generateSitemap(pages: Array<{ slug: string; lastmod?: string }>, baseUrl: string = 'https://example.com'): string {
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

/**
 * Generate robots.txt
 */
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

/**
 * Calculate SEO score
 */
function calculateSEOScore(html: string, metaTags: any, schema: any[]): number {
  let score = 0;

  // Title tag (20 points)
  if (metaTags.title && metaTags.title.length > 30 && metaTags.title.length < 60) {
    score += 20;
  } else if (metaTags.title) {
    score += 10;
  }

  // Meta description (20 points)
  if (metaTags.description && metaTags.description.length > 120 && metaTags.description.length < 160) {
    score += 20;
  } else if (metaTags.description) {
    score += 10;
  }

  // H1 tag (15 points)
  const $ = cheerio.load(html);
  if ($('h1').length === 1) {
    score += 15;
  } else if ($('h1').length > 1) {
    score += 5;
  }

  // Schema markup (20 points)
  if (schema.length > 0) {
    score += 20;
  }

  // Open Graph tags (10 points)
  if (Object.keys(metaTags.openGraph).length >= 4) {
    score += 10;
  }

  // Alt tags on images (10 points)
  const images = $('img');
  const imagesWithAlt = images.filter((_, el) => $(el).attr('alt')).length;
  if (images.length > 0 && imagesWithAlt / images.length >= 0.8) {
    score += 10;
  }

  // Internal links (5 points)
  const internalLinks = $('a[href^="/"], a[href^="#"]').length;
  if (internalLinks >= 5) {
    score += 5;
  }

  return Math.min(100, score);
}

/**
 * Full SEO optimization
 */
export async function optimizeSEO(
  html: string,
  clientInfo: {
    businessName: string;
    industry: string;
    location: { city: string; state: string; country: string };
    services: Array<{ name: string; description: string }>;
    phone: string;
    email: string;
    address: string;
    websiteUrl?: string; // Optional: client's actual website URL
  },
  pages: Array<{ slug: string; name: string }> = []
): Promise<SEOOptimization> {
  try {
    console.log('[SEOAuto] 🔍 Optimizing SEO...');

    const improvements: Array<{ type: string; description: string; impact: 'high' | 'medium' | 'low' }> = [];

    // Generate meta tags
    const metaTags = await generateMetaTags(html, clientInfo);
    improvements.push({
      type: 'meta-tags',
      description: 'Generated optimized title, description, and keywords',
      impact: 'high',
    });

    // Generate schema markup
    const schemas: any[] = [];
    
    // LocalBusiness schema
    const localBusinessSchema = generateLocalBusinessSchema(clientInfo);
    schemas.push(localBusinessSchema);
    improvements.push({
      type: 'schema-markup',
      description: 'Added LocalBusiness schema markup',
      impact: 'high',
    });

    // Organization schema
    const baseUrl = clientInfo.websiteUrl || 'https://example.com';
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: clientInfo.businessName,
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: clientInfo.phone,
        contactType: 'customer service',
        email: clientInfo.email,
      },
    });

    // Inject SEO tags
    html = injectSEOTags(html, metaTags, schemas, clientInfo);

    // Generate sitemap
    const sitemapBaseUrl = clientInfo.websiteUrl || 'https://example.com';
    const sitemapPages = pages.length > 0 
      ? pages 
      : [{ slug: 'index', lastmod: new Date().toISOString().split('T')[0] }];
    const sitemap = generateSitemap(sitemapPages, sitemapBaseUrl);
    improvements.push({
      type: 'sitemap',
      description: 'Generated XML sitemap',
      impact: 'medium',
    });

    // Generate robots.txt
    const robotsBaseUrl = clientInfo.websiteUrl || 'https://example.com';
    const robotsTxt = generateRobotsTxt(true, robotsBaseUrl);
    improvements.push({
      type: 'robots-txt',
      description: 'Generated robots.txt',
      impact: 'low',
    });

    // Calculate SEO score
    const seoScore = calculateSEOScore(html, metaTags, schemas);

    console.log(`[SEOAuto] ✅ SEO optimized: Score ${seoScore}/100, ${improvements.length} improvements`);

    return {
      html,
      sitemap,
      robotsTxt,
      schema: schemas,
      metaTags,
      improvements,
      seoScore,
    };
  } catch (error) {
    logError(error, 'SEOAuto - Optimize');
    throw error;
  }
}

