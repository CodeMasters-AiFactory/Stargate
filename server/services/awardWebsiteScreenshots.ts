/**
 * Service to capture screenshots of award-winning websites
 * Used for displaying live previews in the Merlin package selection carousel
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOTS_DIR = path.join(process.cwd(), 'public', 'award-screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

let browserInstance: Browser | null = null;

/**
 * Get or create browser instance (singleton)
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });
  }
  return browserInstance;
}

/**
 * Generate a safe filename from URL
 */
function getSafeFilename(url: string): string {
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname.replace(/^www\./, ''); // Remove www.
    domain = domain.replace(/\./g, '-');
    // Handle special characters and ensure it's a valid filename
    domain = domain.replace(/[^a-zA-Z0-9-]/g, '-');
    return `${domain}.png`;
  } catch {
    // Fallback: sanitize the entire URL
    return url.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 100) + '.png';
  }
}

/**
 * Capture screenshot of a website
 */
export async function captureWebsiteScreenshot(
  url: string,
  options: {
    width?: number;
    height?: number;
    fullPage?: boolean;
    waitTime?: number;
  } = {}
): Promise<{ success: boolean; filepath?: string; error?: string }> {
  const {
    width = 1280,
    height = 720,
    fullPage = false,
    waitTime = 3000,
  } = options;

  let page: Page | null = null;

  try {
    // Check if screenshot already exists
    const filename = getSafeFilename(url);
    const filepath = path.join(SCREENSHOTS_DIR, filename);

    if (fs.existsSync(filepath)) {
      // Check if file is recent (less than 7 days old)
      const stats = fs.statSync(filepath);
      const daysSinceModified = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
      if (daysSinceModified < 7) {
        return { success: true, filepath: `/award-screenshots/${filename}` };
      }
    }

    const browser = await getBrowser();
    page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width, height });

    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Navigate to URL
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for page to fully load
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    // Take screenshot
    await page.screenshot({
      path: filepath,
      fullPage,
      type: 'png',
    });

    return { success: true, filepath: `/award-screenshots/${filename}` };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[AwardScreenshots] Failed to capture ${url}:`, errorMsg);
    return { success: false, error: errorMsg };
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}

/**
 * Batch capture screenshots for multiple websites
 */
export async function captureBatchScreenshots(
  urls: string[],
  onProgress?: (current: number, total: number, url: string) => void
): Promise<Array<{ url: string; success: boolean; filepath?: string; error?: string }>> {
  const results: Array<{ url: string; success: boolean; filepath?: string; error?: string }> = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    if (onProgress) {
      onProgress(i + 1, urls.length, url);
    }

    const result = await captureWebsiteScreenshot(url);
    results.push({
      url,
      ...result,
    });

    // Small delay between screenshots to avoid overwhelming servers
    if (i < urls.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return results;
}

/**
 * Close browser instance (call on server shutdown)
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

