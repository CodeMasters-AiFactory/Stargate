/**
 * Brand Asset Extractor Service
 * 
 * One-click brand extraction: logos, favicon, social images, color palette,
 * fonts (with files), brand name variations, taglines, contact info.
 * Output: Brand guidelines PDF + asset ZIP
 */

import puppeteer, { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { extractDesignTokens } from './designTokenExtractor';
import { extractAllImages, type ExtractedImage } from './imageExtractor';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';

export interface BrandAssets {
  companyName: string;
  taglines: string[];
  logos: Array<{
    url: string;
    data?: string; // Base64
    type: 'logo' | 'favicon' | 'social';
    size?: { width: number; height: number };
  }>;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    palette: string[];
  };
  fonts: Array<{
    name: string;
    file?: string; // Base64 font file
    url?: string;
  }>;
  contactInfo: {
    emails: string[];
    phones: string[];
    addresses: string[];
    socialMedia: Record<string, string>;
  };
}

/**
 * Extract all brand assets from a website
 */
export async function extractBrandAssets(url: string): Promise<BrandAssets> {
  try {
    console.log(`[Brand Asset Extractor] Extracting from ${url}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const html = await page.content();
    const $ = cheerio.load(html);

    // Extract company name
    const companyName = extractCompanyName(page, $);

    // Extract taglines
    const taglines = extractTaglines($);

    // Extract logos
    const logos = await extractLogos(page, $, url);

    // Extract colors
    const colors = await extractColors(page);

    // Extract fonts
    const fonts = await extractFonts($, url);

    // Extract contact info
    const contactInfo = extractContactInfo($, url);

    await browser.close();

    return {
      companyName,
      taglines,
      logos,
      colors,
      fonts,
      contactInfo,
    };
  } catch (error) {
    logError(error, 'Brand Asset Extractor');
    throw new Error(`Brand asset extraction failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Extract company name
 */
function extractCompanyName(page: Page, $: cheerio.CheerioAPI): string {
  // Try title first
  const title = $('title').text().split('|')[0].split('-')[0].trim();
  if (title && title.length > 3) {
    return title;
  }

  // Try h1
  const h1 = $('h1').first().text().trim();
  if (h1 && h1.length > 3) {
    return h1;
  }

  // Try og:site_name
  const ogSiteName = $('meta[property="og:site_name"]').attr('content');
  if (ogSiteName) {
    return ogSiteName;
  }

  return 'Unknown Company';
}

/**
 * Extract taglines/slogans
 */
function extractTaglines($: cheerio.CheerioAPI): string[] {
  const taglines: string[] = [];

  // Common tagline selectors
  $('[class*="tagline"], [class*="slogan"], [class*="headline"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 200) {
      taglines.push(text);
    }
  });

  // Check meta description for tagline-like content
  const metaDesc = $('meta[name="description"]').attr('content') || '';
  if (metaDesc && metaDesc.length < 200) {
    taglines.push(metaDesc);
  }

  return [...new Set(taglines)].slice(0, 5);
}

/**
 * Extract logos
 */
async function extractLogos(page: Page, $: cheerio.CheerioAPI, baseUrl: string): Promise<BrandAssets['logos']> {
  const logos: BrandAssets['logos'] = [];

  // Favicon
  const favicon = $('link[rel="icon"], link[rel="shortcut icon"]').attr('href');
  if (favicon) {
    const faviconUrl = favicon.startsWith('http') ? favicon : new URL(favicon, baseUrl).href;
    logos.push({
      url: faviconUrl,
      type: 'favicon',
    });
  }

  // Logo images
  $('img[class*="logo"], img[alt*="logo"], img[alt*="Logo"], header img, nav img').each((_, el) => {
    const src = $(el).attr('src');
    if (src) {
      const logoUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
      logos.push({
        url: logoUrl,
        type: 'logo',
      });
    }
  });

  // Open Graph images (social media logos)
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage) {
    logos.push({
      url: ogImage,
      type: 'social',
    });
  }

  // Twitter card image
  const twitterImage = $('meta[name="twitter:image"]').attr('content');
  if (twitterImage) {
    logos.push({
      url: twitterImage,
      type: 'social',
    });
  }

  return [...new Set(logos.map(l => l.url))].slice(0, 10).map(url => ({
    url,
    type: logos.find(l => l.url === url)?.type || 'logo',
  }));
}

/**
 * Extract colors
 */
async function extractColors(page: Page): Promise<BrandAssets['colors']> {
  const designTokens = await extractDesignTokens(page);
  
  const colors = designTokens.colors;
  const palette: string[] = [];

  // Collect all unique colors
  if (colors.primary) palette.push(colors.primary);
  if (colors.secondary) palette.push(colors.secondary);
  if (colors.accent) palette.push(colors.accent);
  if (colors.background) palette.push(colors.background);
  if (colors.text) palette.push(colors.text);

  return {
    primary: colors.primary || '#000000',
    secondary: colors.secondary || '#666666',
    accent: colors.accent || colors.primary || '#000000',
    palette: [...new Set(palette)],
  };
}

/**
 * Extract fonts
 */
async function extractFonts($: cheerio.CheerioAPI, baseUrl: string): Promise<BrandAssets['fonts']> {
  const fonts: BrandAssets['fonts'] = [];
  const foundFonts = new Set<string>();

  // Extract from CSS @font-face
  const styleTags = $('style').toArray();
  for (const styleTag of styleTags) {
    const css = $(styleTag).text();
    const fontFaceMatches = css.match(/@font-face\s*\{[^}]*font-family:\s*['"]?([^'";}]+)['"]?/gi);
    if (fontFaceMatches) {
      fontFaceMatches.forEach(match => {
        const fontNameMatch = match.match(/font-family:\s*['"]?([^'";}]+)['"]?/i);
        if (fontNameMatch && !foundFonts.has(fontNameMatch[1])) {
          foundFonts.add(fontNameMatch[1]);
          fonts.push({ name: fontNameMatch[1] });
        }
      });
    }
  }

  // Extract from link tags (Google Fonts, etc.)
  $('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('family=')) {
      const fontMatch = href.match(/family=([^&:]+)/);
      if (fontMatch && !foundFonts.has(fontMatch[1])) {
        foundFonts.add(fontMatch[1]);
        fonts.push({
          name: fontMatch[1].replace(/\+/g, ' '),
          url: href,
        });
      }
    }
  });

  return fonts.slice(0, 10);
}

/**
 * Extract contact information
 */
function extractContactInfo($: cheerio.CheerioAPI, baseUrl: string): BrandAssets['contactInfo'] {
  const bodyText = $('body').text();
  
  // Extract emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = [...new Set((bodyText.match(emailRegex) || []).slice(0, 5))];

  // Extract phones
  const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  const phones = [...new Set((bodyText.match(phoneRegex) || []).slice(0, 5))];

  // Extract social media links
  const socialMedia: Record<string, string> = {};
  $('a[href*="facebook.com"], a[href*="twitter.com"], a[href*="instagram.com"], a[href*="linkedin.com"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.includes('facebook.com')) socialMedia.facebook = href;
    if (href.includes('twitter.com') || href.includes('x.com')) socialMedia.twitter = href;
    if (href.includes('instagram.com')) socialMedia.instagram = href;
    if (href.includes('linkedin.com')) socialMedia.linkedin = href;
  });

  return {
    emails,
    phones,
    addresses: [],
    socialMedia,
  };
}

/**
 * Generate brand guidelines PDF (simplified - returns JSON for now)
 */
export async function generateBrandGuidelines(assets: BrandAssets): Promise<string> {
  // In a full implementation, this would generate a PDF
  // For now, return JSON representation
  return JSON.stringify({
    brandName: assets.companyName,
    taglines: assets.taglines,
    colors: assets.colors,
    fonts: assets.fonts.map(f => f.name),
    contactInfo: assets.contactInfo,
  }, null, 2);
}

