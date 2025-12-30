/**
 * Visual Verifier Service
 * Screenshot-based verification that template matches original website
 * Uses pixel-diff comparison to ensure visual fidelity
 */

import puppeteer from 'puppeteer';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import * as fs from 'fs';
import * as path from 'path';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface VisualVerificationResult {
  match: boolean;
  similarity: number; // 0-100 percentage
  diffPixels: number;
  totalPixels: number;
  originalScreenshot?: string; // Path to screenshot
  templateScreenshot?: string; // Path to screenshot
  diffScreenshot?: string; // Path to diff image
  errors: string[];
}

/**
 * Take screenshot of a webpage
 */
export async function takeScreenshot(
  page: puppeteer.Page,
  outputPath: string,
  options: {
    fullPage?: boolean;
    width?: number;
    height?: number;
  } = {}
): Promise<string> {
  const { fullPage = true, width = 1920, height = 1080 } = options;

  // Set viewport
  await page.setViewport({ width, height });

  // Wait for page to be fully loaded
  try {
    await page.waitForLoadState?.('networkidle');
  } catch (_error: unknown) {
    // Fallback: wait for network idle or timeout
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {}),
      new Promise((resolve: (value: unknown) => void) => setTimeout(resolve, 3000)),
    ]);
  }

  // Take screenshot
  await page.screenshot({
    path: outputPath,
    fullPage,
    type: 'png',
  });

  return outputPath;
}

/**
 * Compare two images using pixelmatch
 */
export function compareImages(
  img1Path: string,
  img2Path: string,
  diffPath: string
): { diffPixels: number; totalPixels: number; similarity: number } {
  const img1 = PNG.sync.read(fs.readFileSync(img1Path));
  const img2 = PNG.sync.read(fs.readFileSync(img2Path));

  const { width, height } = img1;
  const totalPixels = width * height;

  // Ensure both images are same size
  if (img1.width !== img2.width || img1.height !== img2.height) {
    throw new Error(`Image size mismatch: ${img1.width}x${img1.height} vs ${img2.width}x${img2.height}`);
  }

  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
    threshold: 0.1, // Sensitivity (0-1, lower = more sensitive)
  });

  const similarity = ((totalPixels - diffPixels) / totalPixels) * 100;

  // Save diff image
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  return {
    diffPixels,
    totalPixels,
    similarity,
  };
}

/**
 * Verify template visually matches original website
 */
export async function verifyVisualMatch(
  originalUrl: string,
  templatePreviewUrl: string,
  outputDir: string,
  threshold: number = 95 // Minimum similarity percentage to pass
): Promise<VisualVerificationResult> {
  const errors: string[] = [];
  let browser: puppeteer.Browser | null = null;

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();
  const originalScreenshotPath = path.join(outputDir, `original-${timestamp}.png`);
  const templateScreenshotPath = path.join(outputDir, `template-${timestamp}.png`);
  const diffScreenshotPath = path.join(outputDir, `diff-${timestamp}.png`);

  try {
    console.log(`[VisualVerifier] 🔍 Starting visual verification: ${originalUrl} vs template`);

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Take screenshot of original website
    console.log(`[VisualVerifier] 📸 Taking screenshot of original: ${originalUrl}`);
    const originalPage = await browser.newPage();
    try {
      await originalPage.goto(originalUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      await takeScreenshot(originalPage, originalScreenshotPath, { fullPage: true });
      console.log(`[VisualVerifier] ✅ Original screenshot saved: ${originalScreenshotPath}`);
    } catch (_error: unknown) {
      errors.push(`Failed to screenshot original: ${getErrorMessage(_error)}`);
      logError(_error, 'VisualVerifier - original screenshot');
      await originalPage.close();
      throw _error;
    }
    await originalPage.close();

    // Take screenshot of template preview
    console.log(`[VisualVerifier] 📸 Taking screenshot of template: ${templatePreviewUrl}`);
    const templatePage = await browser.newPage();
    try {
      await templatePage.goto(templatePreviewUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      await takeScreenshot(templatePage, templateScreenshotPath, { fullPage: true });
      console.log(`[VisualVerifier] ✅ Template screenshot saved: ${templateScreenshotPath}`);
    } catch (_error: unknown) {
      errors.push(`Failed to screenshot template: ${getErrorMessage(_error)}`);
      logError(_error, 'VisualVerifier - template screenshot');
      await templatePage.close();
      throw _error;
    }
    await templatePage.close();

    // Compare images
    console.log(`[VisualVerifier] 🔬 Comparing images...`);
    const comparison = compareImages(originalScreenshotPath, templateScreenshotPath, diffScreenshotPath);

    const match = comparison.similarity >= threshold;

    console.log(`[VisualVerifier] ${match ? '✅' : '❌'} Visual match: ${comparison.similarity.toFixed(2)}% (${comparison.diffPixels}/${comparison.totalPixels} pixels differ)`);

    if (browser) {
      await browser.close();
    }

    return {
      match,
      similarity: comparison.similarity,
      diffPixels: comparison.diffPixels,
      totalPixels: comparison.totalPixels,
      originalScreenshot: originalScreenshotPath,
      templateScreenshot: templateScreenshotPath,
      diffScreenshot: diffScreenshotPath,
      errors,
    };
  } catch (_error: unknown) {
    if (browser) {
      await browser.close();
    }
    logError(_error, 'VisualVerifier - verifyVisualMatch');
    errors.push(getErrorMessage(_error));

    return {
      match: false,
      similarity: 0,
      diffPixels: 0,
      totalPixels: 0,
      errors,
    };
  }
}

/**
 * Verify template using stored original screenshot (for re-verification)
 */
export async function verifyTemplateAgainstStoredScreenshot(
  templatePreviewUrl: string,
  originalScreenshotPath: string,
  outputDir: string,
  threshold: number = 95
): Promise<VisualVerificationResult> {
  const errors: string[] = [];
  let browser: puppeteer.Browser | null = null;

  if (!fs.existsSync(originalScreenshotPath)) {
    return {
      match: false,
      similarity: 0,
      diffPixels: 0,
      totalPixels: 0,
      errors: [`Original screenshot not found: ${originalScreenshotPath}`],
    };
  }

  const timestamp = Date.now();
  const templateScreenshotPath = path.join(outputDir, `template-${timestamp}.png`);
  const diffScreenshotPath = path.join(outputDir, `diff-${timestamp}.png`);

  try {
    console.log(`[VisualVerifier] 🔍 Verifying template against stored screenshot`);

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Take screenshot of template preview
    const templatePage = await browser.newPage();
    await templatePage.goto(templatePreviewUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    await takeScreenshot(templatePage, templateScreenshotPath, { fullPage: true });
    await templatePage.close();

    // Compare images
    const comparison = compareImages(originalScreenshotPath, templateScreenshotPath, diffScreenshotPath);
    const match = comparison.similarity >= threshold;

    if (browser) {
      await browser.close();
    }

    return {
      match,
      similarity: comparison.similarity,
      diffPixels: comparison.diffPixels,
      totalPixels: comparison.totalPixels,
      originalScreenshot: originalScreenshotPath,
      templateScreenshot: templateScreenshotPath,
      diffScreenshot: diffScreenshotPath,
      errors,
    };
  } catch (_error: unknown) {
    if (browser) {
      await browser.close();
    }
    logError(_error, 'VisualVerifier - verifyTemplateAgainstStoredScreenshot');
    errors.push(getErrorMessage(_error));

    return {
      match: false,
      similarity: 0,
      diffPixels: 0,
      totalPixels: 0,
      errors,
    };
  }
}

