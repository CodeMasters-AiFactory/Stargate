/**
 * Competitor DNA Analyzer Service
 * 
 * One-click full competitor analysis: tech stack, SEO, design patterns, content strategy.
 * Combines BuiltWith-style detection + SEO audit + design token extraction.
 */

import { detectTechStack, type TechStack } from './techStackDetector';
import { extractDesignTokens, type DesignTokens } from './designTokenExtractor';
import { extractMetadata, type Metadata } from './metadataExtractor';
import puppeteer, { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { extractCommonData } from './aiVisionScraper';

export interface CompetitorDNA {
  url: string;
  timestamp: Date;
  
  // Technology Stack
  techStack: TechStack;
  
  // Design DNA
  design: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
      fontSizes: string[];
    };
    spacing: {
      containerMaxWidth: string;
      sectionPadding: string;
    };
    layout: {
      heroStyle: string;
      navigationStyle: string;
      footerStyle: string;
    };
  };
  
  // Content Strategy
  content: {
    wordCount: number;
    readingLevel: string; // e.g., "8th grade"
    keywordDensity: Record<string, number>;
    headings: Array<{ level: number; text: string }>;
    ctas: string[];
    trustSignals: string[];
  };
  
  // SEO Profile
  seo: {
    title: string;
    metaDescription: string;
    h1: string;
    schemaMarkup: any[];
    openGraph: Record<string, string>;
    internalLinks: number;
    externalLinks: number;
    pageSpeed: {
      score: number;
      loadTime: number;
    };
  };
  
  // Business Intelligence
  business: {
    companyName: string;
    contactInfo: {
      emails: string[];
      phones: string[];
      addresses: string[];
    };
    socialMedia: Record<string, string>;
    teamSize?: number;
    pricingStrategy?: string;
  };
}

/**
 * Analyze competitor DNA - complete business X-ray
 */
export async function analyzeCompetitorDNA(url: string): Promise<CompetitorDNA> {
  try {
    console.log(`[Competitor DNA] Analyzing ${url}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get HTML
    const html = await page.content();
    const $ = cheerio.load(html);

    // 1. Technology Stack Detection
    console.log(`[Competitor DNA] Detecting technology stack...`);
    const techStack = await detectTechStack(url);

    // 2. Design DNA Extraction
    console.log(`[Competitor DNA] Extracting design tokens...`);
    const designTokens = await extractDesignTokens(page);

    // 3. Content Analysis
    console.log(`[Competitor DNA] Analyzing content...`);
    const contentAnalysis = await analyzeContent(page, $);

    // 4. SEO Profile
    console.log(`[Competitor DNA] Analyzing SEO...`);
    const seoProfile = await analyzeSEO(page, $, html);

    // 5. Business Intelligence
    console.log(`[Competitor DNA] Extracting business info...`);
    const businessInfo = await extractBusinessInfo(page, $, url);

    await browser.close();

    const dna: CompetitorDNA = {
      url,
      timestamp: new Date(),
      techStack,
      design: {
        colors: {
          primary: designTokens.colors.primary || '#000000',
          secondary: designTokens.colors.secondary || '#666666',
          accent: designTokens.colors.accent || designTokens.colors.primary || '#000000',
          background: designTokens.colors.background || '#FFFFFF',
          text: designTokens.colors.text || '#000000',
        },
        typography: {
          headingFont: designTokens.typography.headingFont || 'system-ui, sans-serif',
          bodyFont: designTokens.typography.bodyFont || 'system-ui, sans-serif',
          fontSizes: extractFontSizes($),
        },
        spacing: {
          containerMaxWidth: designTokens.spacing.containerMaxWidth || '1200px',
          sectionPadding: '60px',
        },
        layout: {
          heroStyle: 'centered',
          navigationStyle: 'horizontal',
          footerStyle: 'standard',
        },
      },
      content: contentAnalysis,
      seo: seoProfile,
      business: businessInfo,
    };

    console.log(`[Competitor DNA] ✅ Analysis complete`);

    return dna;
  } catch (error) {
    logError(error, 'Competitor DNA Analyzer');
    throw new Error(`Competitor DNA analysis failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Analyze content strategy
 */
async function analyzeContent(page: Page, $: cheerio.CheerioAPI): Promise<CompetitorDNA['content']> {
  // Get text content
  const bodyText = $('body').text();
  const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;

  // Extract headings
  const headings: Array<{ level: number; text: string }> = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const level = parseInt(el.tagName[1]);
    const text = $(el).text().trim();
    if (text) {
      headings.push({ level, text });
    }
  });

  // Extract CTAs
  const ctas: string[] = [];
  $('button, a[class*="button"], a[class*="cta"], [class*="call-to-action"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 100) {
      ctas.push(text);
    }
  });

  // Extract trust signals
  const trustSignals: string[] = [];
  $('[class*="trust"], [class*="badge"], [class*="certificate"], [class*="award"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text) {
      trustSignals.push(text);
    }
  });

  // Calculate reading level (simplified Flesch-Kincaid)
  const sentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = wordCount / sentences.length;
  const avgSyllablesPerWord = estimateSyllables(bodyText) / wordCount;
  const readingLevel = Math.round(
    206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  );
  const gradeLevel = readingLevel < 0 ? 'College' : `${Math.max(1, Math.round(readingLevel / 10))}th grade`;

  // Keyword density (top 10 words)
  const words = bodyText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  const sortedWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const keywordDensity: Record<string, number> = {};
  sortedWords.forEach(([word, count]) => {
    keywordDensity[word] = (count / words.length) * 100;
  });

  return {
    wordCount,
    readingLevel: gradeLevel,
    keywordDensity,
    headings,
    ctas: [...new Set(ctas)].slice(0, 10),
    trustSignals: [...new Set(trustSignals)].slice(0, 10),
  };
}

/**
 * Analyze SEO profile
 */
async function analyzeSEO(page: Page, $: cheerio.CheerioAPI, html: string): Promise<CompetitorDNA['seo']> {
  const title = $('title').text().trim() || '';
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const h1 = $('h1').first().text().trim() || '';

  // Schema markup
  const schemaMarkup: any[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).text());
      schemaMarkup.push(json);
    } catch (e) {
      // Invalid JSON, skip
    }
  });

  // Open Graph tags
  const openGraph: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const property = $(el).attr('property')?.replace('og:', '') || '';
    const content = $(el).attr('content') || '';
    if (property && content) {
      openGraph[property] = content;
    }
  });

  // Count links
  const internalLinks = $('a[href^="/"], a[href*="' + page.url().split('/')[2] + '"]').length;
  const externalLinks = $('a[href^="http"]').length - internalLinks;

  // Page speed (simplified - measure load time)
  const loadTime = await page.evaluate(() => {
    const perfData = (window as any).performance?.timing;
    if (perfData) {
      return perfData.loadEventEnd - perfData.navigationStart;
    }
    return 0;
  });

  // Estimate page speed score (0-100)
  const score = loadTime < 2000 ? 90 : loadTime < 4000 ? 70 : loadTime < 6000 ? 50 : 30;

  return {
    title,
    metaDescription,
    h1,
    schemaMarkup,
    openGraph,
    internalLinks,
    externalLinks,
    pageSpeed: {
      score,
      loadTime,
    },
  };
}

/**
 * Extract business information
 */
async function extractBusinessInfo(page: Page, $: cheerio.CheerioAPI, url: string): Promise<CompetitorDNA['business']> {
  // Extract contact info using AI Vision
  let contactData: any = {};
  try {
    const visionResult = await extractCommonData(url);
    contactData = visionResult.fields || {};
  } catch (e) {
    // Fallback to text extraction
  }

  // Extract emails
  const emails: string[] = [];
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const bodyText = $('body').text();
  const emailMatches = bodyText.match(emailRegex) || [];
  emails.push(...emailMatches);

  // Extract phones
  const phones: string[] = [];
  const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  const phoneMatches = bodyText.match(phoneRegex) || [];
  phones.push(...phoneMatches);

  // Extract social media links
  const socialMedia: Record<string, string> = {};
  $('a[href*="facebook.com"], a[href*="twitter.com"], a[href*="instagram.com"], a[href*="linkedin.com"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.includes('facebook.com')) socialMedia.facebook = href;
    if (href.includes('twitter.com') || href.includes('x.com')) socialMedia.twitter = href;
    if (href.includes('instagram.com')) socialMedia.instagram = href;
    if (href.includes('linkedin.com')) socialMedia.linkedin = href;
  });

  // Extract company name (from title or h1)
  const companyName = $('title').text().split('|')[0].trim() || $('h1').first().text().trim() || 'Unknown';

  return {
    companyName,
    contactInfo: {
      emails: [...new Set(emails)].slice(0, 5),
      phones: [...new Set(phones)].slice(0, 5),
      addresses: [],
    },
    socialMedia,
  };
}

/**
 * Extract font sizes from CSS
 */
function extractFontSizes($: cheerio.CheerioAPI): string[] {
  const fontSizes = new Set<string>();
  $('*').each((_, el) => {
    const fontSize = $(el).css('font-size');
    if (fontSize) {
      fontSizes.add(fontSize);
    }
  });
  return Array.from(fontSizes).slice(0, 10);
}

/**
 * Estimate syllables in text (simplified)
 */
function estimateSyllables(text: string): number {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  let syllables = 0;
  words.forEach(word => {
    syllables += Math.max(1, word.match(/[aeiouy]+/g)?.length || 1);
  });
  return syllables;
}

