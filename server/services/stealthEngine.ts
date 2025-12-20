/**
 * Stealth Mode Engine Service
 * 
 * Truly undetectable scraping:
 * - Browser fingerprint randomization
 * - Mouse movement simulation
 * - Scroll behavior mimicry
 * - Timing randomization
 * - Cookie/session management
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface StealthConfig {
  randomizeFingerprint: boolean;
  simulateMouse: boolean;
  simulateScroll: boolean;
  randomizeTiming: boolean;
  manageCookies: boolean;
}

/**
 * Apply stealth mode to a page
 */
export async function applyStealthMode(page: Page, config: StealthConfig = {
  randomizeFingerprint: true,
  simulateMouse: true,
  simulateScroll: true,
  randomizeTiming: true,
  manageCookies: true,
}): Promise<void> {
  try {
    // Randomize user agent
    if (config.randomizeFingerprint) {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      ];
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
      await page.setUserAgent(randomUA);
    }

    // Override webdriver detection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission } as PermissionStatus) :
          originalQuery(parameters)
      );
    });

    // Randomize viewport
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1536, height: 864 },
      { width: 1440, height: 900 },
    ];
    const randomViewport = viewports[Math.floor(Math.random() * viewports.length)];
    await page.setViewport(randomViewport);

    // Simulate mouse movements
    if (config.simulateMouse) {
      page.on('load', async () => {
        await simulateMouseMovements(page);
      });
    }

    // Simulate scroll behavior
    if (config.simulateScroll) {
      page.on('load', async () => {
        await simulateHumanScroll(page);
      });
    }
  } catch (error) {
    logError(error, 'Stealth Engine');
  }
}

/**
 * Simulate mouse movements
 */
async function simulateMouseMovements(page: Page): Promise<void> {
  try {
    const movements = Math.floor(Math.random() * 5) + 3; // 3-7 movements

    for (let i = 0; i < movements; i++) {
      const x = Math.floor(Math.random() * 1920);
      const y = Math.floor(Math.random() * 1080);
      
      await page.mouse.move(x, y, {
        steps: Math.floor(Math.random() * 10) + 5, // 5-14 steps
      });

      // Random delay between movements
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
    }
  } catch (e) {
    // Ignore errors
  }
}

/**
 * Simulate human scroll behavior
 */
async function simulateHumanScroll(page: Page): Promise<void> {
  try {
    const scrolls = Math.floor(Math.random() * 3) + 2; // 2-4 scrolls

    for (let i = 0; i < scrolls; i++) {
      const scrollAmount = Math.floor(Math.random() * 500) + 200;
      await page.evaluate((amount) => {
        window.scrollBy({
          top: amount,
          behavior: 'smooth',
        });
      }, scrollAmount);

      // Random delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    }
  } catch (e) {
    // Ignore errors
  }
}

/**
 * Create stealth browser instance
 */
export async function createStealthBrowser(): Promise<Browser> {
  return await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
    ],
  });
}

/**
 * Randomize timing delays
 */
export function randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

