/**
 * Visual Diff Report Generator Service
 * 
 * Side-by-side screenshot comparison: original vs scraped,
 * pixel-diff highlighting, change percentage, exportable report.
 */

import puppeteer from 'puppeteer';
import { getErrorMessage, logError } from '../utils/errorHandler';
import * as fs from 'fs';
import * as path from 'path';
import { compareImages, takeScreenshot } from './visualVerifier';

export interface VisualDiffReport {
  originalUrl: string;
  scrapedUrl: string;
  similarity: number; // 0-100 percentage
  differences: {
    pixelDiff: number;
    changePercentage: number;
    highlightedRegions: Array<{ x: number; y: number; width: number; height: number }>;
  };
  screenshots: {
    original: string;
    scraped: string;
    diff?: string;
  };
  timestamp: Date;
}

/**
 * Generate visual diff report
 */
export async function generateVisualDiffReport(
  originalUrl: string,
  scrapedUrl: string
): Promise<VisualDiffReport> {
  try {
    console.log(`[Visual Diff] Comparing ${originalUrl} vs ${scrapedUrl}`);

    const screenshotDir = path.join(process.cwd(), 'temp_screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const timestamp = Date.now();
    const originalScreenshot = path.join(screenshotDir, `original-${timestamp}.png`);
    const scrapedScreenshot = path.join(screenshotDir, `scraped-${timestamp}.png`);
    const diffScreenshot = path.join(screenshotDir, `diff-${timestamp}.png`);

    // Take screenshots
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Screenshot original
    const page1 = await browser.newPage();
    await page1.setViewport({ width: 1920, height: 1080 });
    await page1.goto(originalUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((resolve: (value: unknown) => void) => setTimeout(resolve, 2000));
    await takeScreenshot(page1, originalScreenshot);
    await page1.close();

    // Screenshot scraped
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 1920, height: 1080 });
    await page2.goto(scrapedUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((resolve: (value: unknown) => void) => setTimeout(resolve, 2000));
    await takeScreenshot(page2, scrapedScreenshot);
    await page2.close();

    await browser.close();

    // Compare images
    const comparisonResult = compareImages(originalScreenshot, scrapedScreenshot, diffScreenshot);
    const changePercentage = (1 - (comparisonResult.similarity / 100)) * 100;

    // Calculate pixel diff
    const pixelDiff = comparisonResult.diffPixels;

    return {
      originalUrl,
      scrapedUrl,
      similarity: Math.round(comparisonResult.similarity),
      differences: {
        pixelDiff,
        changePercentage: Math.round(changePercentage),
        highlightedRegions: [], // Would need actual diff image generation
      },
      screenshots: {
        original: originalScreenshot,
        scraped: scrapedScreenshot,
        diff: diffScreenshot,
      },
      timestamp: new Date(),
    };
  } catch (_error: unknown) {
    logError(_error, 'Visual Diff Report');
    throw new Error(`Visual diff report generation failed: ${getErrorMessage(_error)}`);
  }
}

