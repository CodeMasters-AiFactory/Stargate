/**
 * Content Freshness Detector Service
 * 
 * AI determines if content is outdated:
 * - Compares against current events
 * - Detects stale dates/references
 * - Identifies broken promises ("Coming soon" from 2019)
 * - Freshness score 0-100
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import OpenAI from 'openai';
import { getErrorMessage, logError } from '../utils/errorHandler';
import * as cheerio from 'cheerio';

const openaiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openai = openaiKey
  ? new OpenAI({
      apiKey: openaiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    })
  : null;

export interface FreshnessAnalysis {
  url: string;
  freshnessScore: number; // 0-100
  status: 'fresh' | 'stale' | 'outdated' | 'very_outdated';
  issues: Array<{
    type: 'stale_date' | 'broken_promise' | 'outdated_reference' | 'missing_update';
    description: string;
    severity: 'low' | 'medium' | 'high';
    location?: string;
  }>;
  recommendations: string[];
  lastUpdated?: Date;
}

/**
 * Detect content freshness
 */
export async function detectContentFreshness(url: string): Promise<FreshnessAnalysis> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log(`[Content Freshness] Analyzing ${url}`);

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const html = await page.content();
    const $ = cheerio.load(html);

    // Extract dates from page
    const dates = extractDates($);
    const currentYear = new Date().getFullYear();
    const currentDate = new Date();

    // Extract "coming soon" and similar phrases
    const comingSoonPhrases = $('*:contains("coming soon"), *:contains("Coming Soon"), *:contains("COMING SOON")').map((_, el) => ({
      text: $(el).text().trim(),
      tag: el.tagName,
    })).get();

    // Extract copyright years
    const copyrightYears = extractCopyrightYears($);

    // Build context for AI analysis
    const context = `
Website Content Analysis:
- Dates found: ${dates.join(', ')}
- Copyright years: ${copyrightYears.join(', ')}
- "Coming soon" mentions: ${comingSoonPhrases.length}
- Current date: ${currentDate.toISOString()}
- Current year: ${currentYear}

Content sample:
${$('body').text().substring(0, 2000)}
`;

    if (openai) {
      const prompt = `Analyze this website content for freshness. Check for:
1. Stale dates (e.g., "Last updated: 2019")
2. Broken promises (e.g., "Coming soon" from years ago)
3. Outdated references (e.g., "COVID-19 restrictions" in 2024)
4. Missing updates (e.g., copyright year is old)

${context}

Return JSON:
{
  "freshnessScore": 0-100,
  "status": "fresh" | "stale" | "outdated" | "very_outdated",
  "issues": [
    {
      "type": "stale_date" | "broken_promise" | "outdated_reference" | "missing_update",
      "description": "what's wrong",
      "severity": "low" | "medium" | "high",
      "location": "where found"
    }
  ],
  "recommendations": ["what to fix"],
  "lastUpdated": "ISO date if found"
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at detecting outdated website content. Identify stale dates, broken promises, and outdated references.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
        temperature: 0.2,
      });

      const analysis: FreshnessAnalysis = JSON.parse(response.choices[0].message.content || '{}');
      analysis.url = url;

      if (analysis.lastUpdated) {
        analysis.lastUpdated = new Date(analysis.lastUpdated);
      }

      return analysis;
    }

    // Fallback: simple analysis
    const issues: FreshnessAnalysis['issues'] = [];
    let score = 100;

    // Check copyright year
    const latestCopyright = Math.max(...copyrightYears.map(y => parseInt(y)));
    if (latestCopyright < currentYear - 2) {
      issues.push({
        type: 'missing_update',
        description: `Copyright year is ${latestCopyright}, should be ${currentYear}`,
        severity: 'medium',
      });
      score -= 20;
    }

    // Check for old dates
    const oldDates = dates.filter(d => {
      const date = new Date(d);
      const yearsDiff = (currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return yearsDiff > 2;
    });

    if (oldDates.length > 0) {
      issues.push({
        type: 'stale_date',
        description: `Found ${oldDates.length} dates older than 2 years`,
        severity: 'high',
      });
      score -= 30;
    }

    // Check "coming soon"
    if (comingSoonPhrases.length > 0) {
      issues.push({
        type: 'broken_promise',
        description: `Found ${comingSoonPhrases.length} "coming soon" mentions that may be outdated`,
        severity: 'medium',
      });
      score -= 15;
    }

    return {
      url,
      freshnessScore: Math.max(0, score),
      status: score >= 80 ? 'fresh' : score >= 60 ? 'stale' : score >= 40 ? 'outdated' : 'very_outdated',
      issues,
      recommendations: issues.map(i => `Fix: ${i.description}`),
    };
  } catch (error) {
    logError(error, 'Content Freshness Detector');
    throw new Error(`Freshness detection failed: ${getErrorMessage(error)}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Extract dates from HTML
 */
function extractDates($: cheerio.CheerioAPI): string[] {
  const dates: string[] = [];
  const datePatterns = [
    /\d{1,2}\/\d{1,2}\/\d{4}/g, // MM/DD/YYYY
    /\d{4}-\d{2}-\d{2}/g, // YYYY-MM-DD
    /\w+ \d{1,2}, \d{4}/g, // Month DD, YYYY
  ];

  const text = $('body').text();
  datePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      dates.push(...matches);
    }
  });

  return [...new Set(dates)];
}

/**
 * Extract copyright years
 */
function extractCopyrightYears($: cheerio.CheerioAPI): string[] {
  const years: string[] = [];
  const copyrightText = $('*:contains("©"), *:contains("Copyright")').text();
  const yearPattern = /\b(19|20)\d{2}\b/g;
  const matches = copyrightText.match(yearPattern);
  if (matches) {
    years.push(...matches);
  }
  return [...new Set(years)];
}

