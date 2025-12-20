/**
 * Multi-Language Content Detector Service
 * 
 * Detect all languages on page, extract hreflang URLs, identify translation coverage,
 * export content by language, compare across languages.
 */

import puppeteer, { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface LanguageContent {
  language: string;
  url: string;
  hreflang?: string;
  content: {
    title: string;
    headings: string[];
    paragraphs: string[];
  };
}

export interface MultiLanguageAnalysis {
  url: string;
  detectedLanguages: string[];
  hreflangUrls: Record<string, string>; // lang code -> URL
  primaryLanguage: string;
  translations: LanguageContent[];
  coverage: number; // percentage of languages covered
}

/**
 * Detect languages and extract multi-language content
 */
export async function analyzeMultiLanguage(url: string): Promise<MultiLanguageAnalysis> {
  try {
    console.log(`[Multi-Language Detector] Analyzing ${url}`);

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

    // Detect primary language
    const primaryLanguage = $('html').attr('lang') || 
                           $('meta[http-equiv="content-language"]').attr('content') ||
                           'en';

    // Extract hreflang URLs
    const hreflangUrls: Record<string, string> = {};
    $('link[rel="alternate"][hreflang]').each((_, el) => {
      const lang = $(el).attr('hreflang');
      const href = $(el).attr('href');
      if (lang && href) {
        hreflangUrls[lang] = href.startsWith('http') ? href : new URL(href, url).href;
      }
    });

    // Detect all languages mentioned
    const detectedLanguages = [primaryLanguage, ...Object.keys(hreflangUrls)];
    const uniqueLanguages = [...new Set(detectedLanguages)];

    // Extract content for primary language
    const primaryContent: LanguageContent = {
      language: primaryLanguage,
      url,
      content: {
        title: $('title').text().trim(),
        headings: $('h1, h2, h3').map((_, el) => $(el).text().trim()).get(),
        paragraphs: $('p').map((_, el) => $(el).text().trim()).get().slice(0, 20),
      },
    };

    // Calculate coverage (simplified - based on hreflang presence)
    const coverage = Object.keys(hreflangUrls).length > 0 ? 
      Math.min(100, (Object.keys(hreflangUrls).length / 5) * 100) : 0;

    await browser.close();

    return {
      url,
      detectedLanguages: uniqueLanguages,
      hreflangUrls,
      primaryLanguage,
      translations: [primaryContent],
      coverage: Math.round(coverage),
    };
  } catch (error) {
    logError(error, 'Multi-Language Detector');
    throw new Error(`Multi-language analysis failed: ${getErrorMessage(error)}`);
  }
}

