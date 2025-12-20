/**
 * Self-Healing Scraper Service
 * 
 * AI detects site changes and auto-repairs selectors.
 * Solves #1 user complaint: "My scraper broke when the site updated"
 */

import OpenAI from 'openai';
import puppeteer, { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { extractWithVision } from './aiVisionScraper';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Initialize OpenAI client
const openaiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openai = openaiKey
  ? new OpenAI({
      apiKey: openaiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    })
  : null;

export interface ScraperBaseline {
  url: string;
  htmlHash: string;
  screenshotPath: string;
  selectors: Record<string, string>; // Field name -> CSS selector
  extractedData: Record<string, any>;
  timestamp: Date;
}

export interface ScraperConfig {
  id: string;
  url: string;
  fields: string[]; // Field names to extract
  selectors: Record<string, string>; // Field name -> CSS selector
  baseline?: ScraperBaseline;
}

export interface HealingResult {
  success: boolean;
  newSelectors?: Record<string, string>;
  confidence: number;
  changesDetected: string[];
  message: string;
}

// Store baselines in memory (in production, use database)
const baselineStore = new Map<string, ScraperBaseline>();

/**
 * Calculate hash of HTML content for change detection
 */
function calculateHTMLHash(html: string): string {
  return crypto.createHash('sha256').update(html).digest('hex');
}

/**
 * Create baseline snapshot of a scraper
 */
export async function createBaseline(config: ScraperConfig): Promise<ScraperBaseline> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Get HTML
    const html = await page.content();
    const htmlHash = calculateHTMLHash(html);

    // Take screenshot
    const screenshotDir = path.join(process.cwd(), 'temp_screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    const screenshotPath = path.join(screenshotDir, `baseline-${config.id}-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Extract data using current selectors
    const extractedData: Record<string, any> = {};
    for (const [field, selector] of Object.entries(config.selectors)) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await page.evaluate((el) => el.textContent?.trim(), element);
          extractedData[field] = text || null;
        } else {
          extractedData[field] = null;
        }
      } catch (e) {
        extractedData[field] = null;
      }
    }

    await browser.close();

    const baseline: ScraperBaseline = {
      url: config.url,
      htmlHash,
      screenshotPath,
      selectors: config.selectors,
      extractedData,
      timestamp: new Date(),
    };

    baselineStore.set(config.id, baseline);
    return baseline;
  } catch (error) {
    logError(error, 'Self-Healing Scraper - createBaseline');
    throw new Error(`Failed to create baseline: ${getErrorMessage(error)}`);
  }
}

/**
 * Detect if website structure has changed
 */
export async function detectChanges(config: ScraperConfig): Promise<{
  changed: boolean;
  currentHash: string;
  baselineHash: string;
  brokenSelectors: string[];
}> {
  try {
    const baseline = config.baseline || baselineStore.get(config.id);
    if (!baseline) {
      throw new Error('No baseline found. Create baseline first.');
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 60000 });

    const html = await page.content();
    const currentHash = calculateHTMLHash(html);

    // Check if selectors still work
    const brokenSelectors: string[] = [];
    for (const [field, selector] of Object.entries(baseline.selectors)) {
      try {
        const element = await page.$(selector);
        if (!element) {
          brokenSelectors.push(field);
        }
      } catch (e) {
        brokenSelectors.push(field);
      }
    }

    await browser.close();

    const changed = currentHash !== baseline.htmlHash || brokenSelectors.length > 0;

    return {
      changed,
      currentHash,
      baselineHash: baseline.htmlHash,
      brokenSelectors,
    };
  } catch (error) {
    logError(error, 'Self-Healing Scraper - detectChanges');
    throw new Error(`Failed to detect changes: ${getErrorMessage(error)}`);
  }
}

/**
 * Auto-heal broken scraper using AI
 */
export async function healScraper(config: ScraperConfig): Promise<HealingResult> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Self-healing requires OPENAI_API_KEY.');
  }

  try {
    const baseline = config.baseline || baselineStore.get(config.id);
    if (!baseline) {
      throw new Error('No baseline found. Create baseline first.');
    }

    console.log(`[Self-Healing Scraper] Healing scraper ${config.id} for ${config.url}`);

    // Detect changes
    const changeDetection = await detectChanges(config);
    if (!changeDetection.changed) {
      return {
        success: true,
        confidence: 1.0,
        changesDetected: [],
        message: 'No changes detected. Scraper is still working.',
      };
    }

    console.log(`[Self-Healing Scraper] Changes detected. Broken selectors: ${changeDetection.brokenSelectors.join(', ')}`);

    // Use AI Vision to find new selectors
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Take screenshot
    const screenshotDir = path.join(process.cwd(), 'temp_screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    const screenshotPath = path.join(screenshotDir, `heal-${config.id}-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Get HTML for selector generation
    const html = await page.content();
    const $ = cheerio.load(html);

    await browser.close();

    // Use AI to generate new selectors
    const systemPrompt = `You are an expert web scraping assistant. A website has changed and old CSS selectors no longer work. Analyze the HTML and screenshot to find new selectors for the requested fields.

Return ONLY valid JSON:
{
  "selectors": {
    "fieldName": "new.css.selector"
  },
  "confidence": 0.95,
  "reasoning": "Brief explanation of changes"
}`;

    const userPrompt = `Website URL: ${config.url}

Old selectors that broke:
${JSON.stringify(Object.fromEntries(
  changeDetection.brokenSelectors.map(field => [field, baseline.selectors[field]])
), null, 2)}

Fields that need to be extracted:
${config.fields.join(', ')}

HTML structure (first 5000 chars):
${html.substring(0, 5000)}

Please generate new CSS selectors that will work with the current HTML structure.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '{}';
    console.log(`[Self-Healing Scraper] AI response: ${content.substring(0, 200)}...`);

    // Parse JSON
    let parsed: any;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonString);
    } catch (parseError) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error(`Failed to parse AI response: ${content}`);
      }
    }

    // Verify new selectors work
    const browser2 = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page2 = await browser2.newPage();
    await page2.goto(config.url, { waitUntil: 'networkidle2', timeout: 60000 });

    const verifiedSelectors: Record<string, string> = {};
    let verifiedCount = 0;

    for (const [field, selector] of Object.entries(parsed.selectors || {})) {
      try {
        const element = await page2.$(selector as string);
        if (element) {
          verifiedSelectors[field] = selector as string;
          verifiedCount++;
        }
      } catch (e) {
        // Selector doesn't work, skip it
      }
    }

    await browser2.close();

    // Clean up screenshot
    if (fs.existsSync(screenshotPath)) {
      fs.unlinkSync(screenshotPath);
    }

    const success = verifiedCount > 0;
    const confidence = verifiedCount / config.fields.length;

    if (success) {
      // Update baseline with new selectors
      const updatedBaseline: ScraperBaseline = {
        ...baseline,
        selectors: { ...baseline.selectors, ...verifiedSelectors },
        timestamp: new Date(),
      };
      baselineStore.set(config.id, updatedBaseline);
    }

    return {
      success,
      newSelectors: success ? verifiedSelectors : undefined,
      confidence,
      changesDetected: changeDetection.brokenSelectors,
      message: success
        ? `Successfully healed ${verifiedCount}/${config.fields.length} fields`
        : `Failed to find working selectors. Only ${verifiedCount}/${config.fields.length} fields could be recovered.`,
    };
  } catch (error) {
    logError(error, 'Self-Healing Scraper - healScraper');
    return {
      success: false,
      confidence: 0,
      changesDetected: [],
      message: `Healing failed: ${getErrorMessage(error)}`,
    };
  }
}

/**
 * Run scraper with auto-healing
 */
export async function runWithAutoHealing(
  config: ScraperConfig
): Promise<{
  data: Record<string, any>;
  healed: boolean;
  healingResult?: HealingResult;
}> {
  try {
    // Check if baseline exists, create if not
    if (!config.baseline && !baselineStore.has(config.id)) {
      console.log(`[Self-Healing Scraper] Creating baseline for ${config.id}`);
      const baseline = await createBaseline(config);
      config.baseline = baseline;
    }

    // Detect changes
    const changes = await detectChanges(config);
    if (!changes.changed) {
      // No changes, use existing selectors
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 60000 });

      const baseline = config.baseline || baselineStore.get(config.id)!;
      const data: Record<string, any> = {};

      for (const [field, selector] of Object.entries(baseline.selectors)) {
        try {
          const element = await page.$(selector);
          if (element) {
            const text = await page.evaluate((el) => el.textContent?.trim(), element);
            data[field] = text || null;
          } else {
            data[field] = null;
          }
        } catch (e) {
          data[field] = null;
        }
      }

      await browser.close();

      return { data, healed: false };
    }

    // Changes detected, heal
    console.log(`[Self-Healing Scraper] Changes detected, attempting to heal...`);
    const healingResult = await healScraper(config);

    if (healingResult.success && healingResult.newSelectors) {
      // Use new selectors to extract data
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 60000 });

      const data: Record<string, any> = {};
      const baseline = config.baseline || baselineStore.get(config.id)!;
      const allSelectors = { ...baseline.selectors, ...healingResult.newSelectors };

      for (const [field, selector] of Object.entries(allSelectors)) {
        try {
          const element = await page.$(selector);
          if (element) {
            const text = await page.evaluate((el) => el.textContent?.trim(), element);
            data[field] = text || null;
          } else {
            data[field] = null;
          }
        } catch (e) {
          data[field] = null;
        }
      }

      await browser.close();

      return { data, healed: true, healingResult };
    }

    // Healing failed, return old data
    const baseline = config.baseline || baselineStore.get(config.id)!;
    return {
      data: baseline.extractedData,
      healed: false,
      healingResult,
    };
  } catch (error) {
    logError(error, 'Self-Healing Scraper - runWithAutoHealing');
    throw error;
  }
}

