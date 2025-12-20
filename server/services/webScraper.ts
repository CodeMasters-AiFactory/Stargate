/**
 * Web Scraper Service
 * 
 * Fetches and parses content from external websites for competitor analysis.
 * Uses node-fetch and cheerio for robust HTML parsing.
 * Enhanced with rate limiting, retry logic, and better error handling.
 */

import * as cheerio from 'cheerio';

// Use node-fetch for reliable HTTP requests in Node.js
// node-fetch v3 is ESM-only and provides fetch API compatibility
import fetch from 'node-fetch';
import { getErrorMessage, logError } from '../utils/errorHandler';

// Rate limiting: delay between requests to avoid being blocked
const REQUEST_DELAY_MS = 3000; // 3 seconds between requests
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE_MS = 1000; // Base delay for exponential backoff

// Track last request time for rate limiting
let lastRequestTime = 0;

export interface ScrapedWebsite {
  url: string;
  title: string;
  description: string;
  headings: string[];
  keywords: string[];
  content: string;
  links: string[];
  metaKeywords: string[];
  ogTags: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
  };
  error?: string;
}

/**
 * Rate limiting: Ensure minimum delay between requests
 */
async function rateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < REQUEST_DELAY_MS) {
    const waitTime = REQUEST_DELAY_MS - timeSinceLastRequest;
    console.log(`[WebScraper] ⏳ Rate limiting: waiting ${waitTime}ms before next request...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

/**
 * Scrape a website and extract key SEO and content information
 * Enhanced with retry logic and better error handling
 * 
 * @param url - The website URL to scrape
 * @param timeout - Request timeout in milliseconds (default: 15000)
 * @param retryCount - Internal retry counter (default: 0)
 * @returns Scraped website data or partial data with error message
 */
export async function scrapeWebsite(
  url: string, 
  timeout: number = 15000,
  retryCount: number = 0
): Promise<ScrapedWebsite> {
  // Rate limiting: wait before making request
  await rateLimit();
  
  try {
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    
    console.log(`[WebScraper] ${retryCount > 0 ? `[Retry ${retryCount}/${MAX_RETRIES}] ` : ''}Fetching ${fullUrl}...`);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Enhanced headers to appear more like a real browser
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
    };
    
    // Fetch the website with proper headers
    const response = await fetch(fullUrl, {
      signal: controller.signal,
      headers,
      redirect: 'follow', // Follow redirects
    });
    
    clearTimeout(timeoutId);
    
    // Handle HTTP errors with retry logic
    if (!response.ok) {
      const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      
      // Retry on 5xx errors (server errors) or 429 (rate limit)
      if ((response.status >= 500 || response.status === 429) && retryCount < MAX_RETRIES) {
        const retryDelay = RETRY_DELAY_BASE_MS * Math.pow(2, retryCount); // Exponential backoff
        console.log(`[WebScraper] ⚠️ ${errorMsg}. Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return scrapeWebsite(url, timeout, retryCount + 1);
      }
      
      // Don't retry on 4xx errors (client errors like 404, 403)
      if (response.status === 403) {
        throw new Error(`Access forbidden (403): This site may be blocking automated requests. Consider using a browser automation tool like Puppeteer.`);
      }
      if (response.status === 404) {
        throw new Error(`Page not found (404): The URL may be incorrect or the page has been removed.`);
      }
      
      throw new Error(errorMsg);
    }
    
    const html = await response.text();
    
    // Check if response is actually HTML
    if (!html || html.trim().length === 0) {
      throw new Error('Empty response received');
    }
    
    // Check if we got an error page (common patterns)
    if (html.includes('Access Denied') || html.includes('403 Forbidden') || html.includes('Blocked')) {
      throw new Error('Access denied: Website is blocking automated requests');
    }
    
    const $ = cheerio.load(html);
    
    // Extract title
    const title = $('title').text().trim() || 
                  $('meta[property="og:title"]').attr('content') || 
                  $('h1').first().text().trim() || 
                  'Untitled';
    
    // Extract meta description
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       '';
    
    // Extract meta keywords
    const metaKeywords = ($('meta[name="keywords"]').attr('content') || '')
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    
    // Extract headings (h1-h6)
    const headings: string[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings.push(text);
    });
    
    // Extract keywords from content (common words, excluding stop words)
    const bodyText = $('body').text().toLowerCase();
    const words = bodyText.match(/\b[a-z]{4,}\b/g) || [];
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      if (!['the', 'this', 'that', 'with', 'from', 'have', 'been', 'will', 'your', 'their', 'there', 'what', 'when', 'where', 'which', 'about', 'after', 'before', 'could', 'should', 'would'].includes(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    const keywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
    
    // Extract main content (text from paragraphs and divs)
    const content = $('p, div.content, article, main').text().trim().substring(0, 2000);
    
    // Extract links
    const links: string[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.startsWith('http')) {
        links.push(href);
      }
    });
    
    // Extract Open Graph tags
    const ogTags = {
      title: $('meta[property="og:title"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      type: $('meta[property="og:type"]').attr('content'),
    };
    
    // Additional validation
    if (!title && headings.length === 0 && content.length < 100) {
      console.warn(`[WebScraper] ⚠️ Warning: Scraped very little content from ${fullUrl}. This may be a JavaScript-heavy site that requires browser automation.`);
    }
    
    console.log(`[WebScraper] ✅ Successfully scraped ${fullUrl} - Title: "${title.substring(0, 60)}..." (${headings.length} headings, ${keywords.length} keywords)`);
    
    return {
      url: fullUrl,
      title,
      description,
      headings,
      keywords,
      content,
      links: [...new Set(links)].slice(0, 50), // Deduplicate and limit
      metaKeywords,
      ogTags,
    };
    
  } catch (error: unknown) {
    logError(error, 'Web Scraper');
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    const errorMessage = getErrorMessage(error);
    
    console.error(`[WebScraper] ❌ Failed to scrape ${url}:`, errorMessage);
    console.error(`[WebScraper] Error type: ${errorName}`);
    
    // Retry logic for network errors and timeouts
    const isRetryableError = 
      errorName === 'AbortError' || // Timeout
      errorName === 'TypeError' || // Network errors
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ETIMEDOUT') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('network');
    
    if (isRetryableError && retryCount < MAX_RETRIES) {
      const retryDelay = RETRY_DELAY_BASE_MS * Math.pow(2, retryCount); // Exponential backoff
      console.log(`[WebScraper] ⚠️ ${errorMessage}. Retrying in ${retryDelay}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return scrapeWebsite(url, timeout, retryCount + 1);
    }
    
    // Provide user-friendly error messages
    let friendlyError = errorMessage;
    if (errorName === 'AbortError') {
      friendlyError = `Request timeout: The website took too long to respond (${timeout}ms). The site may be slow or unavailable.`;
    } else if (errorMessage.includes('ECONNREFUSED')) {
      friendlyError = 'Connection refused: The website server is not responding. It may be down or blocking requests.';
    } else if (errorMessage.includes('ENOTFOUND')) {
      friendlyError = 'Domain not found: The website URL may be incorrect or the domain does not exist.';
    } else if (errorMessage.includes('CORS') || errorMessage.includes('blocking')) {
      friendlyError = 'Access blocked: This website is blocking automated requests. Consider using browser automation (Puppeteer) for JavaScript-heavy sites.';
    }
    
    // Return partial data with error
    return {
      url: url.startsWith('http') ? url : `https://${url}`,
      title: '',
      description: '',
      headings: [],
      keywords: [],
      content: '',
      links: [],
      metaKeywords: [],
      ogTags: {},
      error: friendlyError,
    };
  }
}

