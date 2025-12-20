/**
 * Safe Scraping Checker
 * 
 * Tests if a website is safe to scrape with our current scraper capabilities.
 * Only scrapes sites that will work 100% correctly.
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { getErrorMessage } from '../utils/errorHandler';

export interface SafeScrapingResult {
  isSafe: boolean;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
  details: {
    hasCloudflare: boolean;
    hasCaptcha: boolean;
    isSPA: boolean;
    loadTime: number;
    htmlSize: number;
    jsSize: number;
  };
}

/**
 * Check if a website is safe to scrape
 * Returns detailed analysis of why it's safe or not
 */
export async function checkIfSafeToScrape(url: string): Promise<SafeScrapingResult> {
  const result: SafeScrapingResult = {
    isSafe: true,
    reason: '',
    confidence: 'high',
    warnings: [],
    details: {
      hasCloudflare: false,
      hasCaptcha: false,
      isSPA: false,
      loadTime: 0,
      htmlSize: 0,
      jsSize: 0,
    },
  };

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    page = await browser.newPage();
    
    // Set reasonable timeout
    page.setDefaultNavigationTimeout(15000);
    
    const startTime = Date.now();
    
    // Navigate to page
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    const loadTime = Date.now() - startTime;
    result.details.loadTime = loadTime;

    if (!response) {
      result.isSafe = false;
      result.reason = 'Failed to load page - no response';
      result.confidence = 'high';
      return result;
    }

    // Check for Cloudflare
    const cloudflareIndicators = [
      'cloudflare',
      'cf-ray',
      'cf-request-id',
      'checking your browser',
      'just a moment',
      'ddos protection',
    ];

    const pageContent = await page.content();
    const pageText = pageContent.toLowerCase();
    const headers = response.headers();

    const hasCloudflareHeader = Object.keys(headers).some(key => 
      key.toLowerCase().includes('cf-') || key.toLowerCase().includes('cloudflare')
    );

    const hasCloudflareText = cloudflareIndicators.some(indicator => 
      pageText.includes(indicator)
    );

    result.details.hasCloudflare = hasCloudflareHeader || hasCloudflareText;

    if (result.details.hasCloudflare) {
      result.isSafe = false;
      result.reason = 'Cloudflare protection detected - will block our scraper';
      result.confidence = 'high';
      result.warnings.push('Cloudflare-protected sites require advanced bypass techniques');
      return result;
    }

    // Check for CAPTCHA
    const captchaIndicators = [
      'captcha',
      'recaptcha',
      'turnstile',
      'hcaptcha',
      'verify you are human',
      'i am not a robot',
    ];

    const hasCaptcha = captchaIndicators.some(indicator => 
      pageText.includes(indicator)
    );

    result.details.hasCaptcha = hasCaptcha;

    if (hasCaptcha) {
      result.isSafe = false;
      result.reason = 'CAPTCHA detected - requires solving service';
      result.confidence = 'high';
      result.warnings.push('CAPTCHA-protected sites require 2Captcha/CapSolver integration');
      return result;
    }

    // Check if it's a heavy SPA
    const htmlSize = pageContent.length;
    result.details.htmlSize = htmlSize;

    // Check JavaScript size
    const scripts = await page.$$eval('script', scripts => 
      scripts.map(s => s.textContent || '').join('\n')
    );
    const jsSize = scripts.length;
    result.details.jsSize = jsSize;

    // If HTML is very small but has lots of JS, it's likely an SPA
    if (htmlSize < 50000 && jsSize > 5) {
      result.details.isSPA = true;
      result.warnings.push('Heavy JavaScript/SPA detected - may need special handling');
      result.confidence = 'medium';
    }

    // Check for blocking indicators
    const blockingIndicators = [
      'access denied',
      '403 forbidden',
      'blocked',
      'rate limit',
      'too many requests',
    ];

    const hasBlocking = blockingIndicators.some(indicator => 
      pageText.includes(indicator)
    );

    if (hasBlocking) {
      result.isSafe = false;
      result.reason = 'Blocking/access denied detected';
      result.confidence = 'high';
      return result;
    }

    // Check load time (very slow = likely heavy/complex)
    if (loadTime > 10000) {
      result.warnings.push('Slow load time - may be complex or resource-heavy');
      result.confidence = 'medium';
    }

    // Check for simple HTML structure (good sign)
    const hasSimpleStructure = htmlSize > 10000 && htmlSize < 500000 && jsSize < 10;
    
    if (hasSimpleStructure && !result.details.hasCloudflare && !hasCaptcha) {
      result.isSafe = true;
      result.reason = 'Simple HTML site - safe to scrape';
      result.confidence = 'high';
    } else if (!result.details.hasCloudflare && !hasCaptcha) {
      result.isSafe = true;
      result.reason = 'No protection detected - should work';
      result.confidence = 'medium';
    }

    return result;

  } catch (error) {
    const errorMsg = getErrorMessage(error);
    
    // Check if it's a timeout (likely blocked or slow)
    if (errorMsg.includes('timeout') || errorMsg.includes('Navigation timeout')) {
      result.isSafe = false;
      result.reason = 'Page load timeout - likely blocked or too slow';
      result.confidence = 'high';
    } else if (errorMsg.includes('net::ERR_') || errorMsg.includes('failed to fetch')) {
      result.isSafe = false;
      result.reason = `Network error: ${errorMsg}`;
      result.confidence = 'high';
    } else {
      result.isSafe = false;
      result.reason = `Error checking site: ${errorMsg}`;
      result.confidence = 'medium';
    }

    return result;
  } finally {
    if (page) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}

/**
 * Quick check - just returns true/false
 */
export async function isSafeToScrape(url: string): Promise<boolean> {
  const result = await checkIfSafeToScrape(url);
  return result.isSafe && result.confidence === 'high';
}

