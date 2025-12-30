/**
 * Website Scraper Service
 * 
 * Searches Google for top-ranked companies by industry and location,
 * then scrapes full website content (HTML, CSS, images, text, design tokens)
 * to create pixel-perfect template replicas.
 */

import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import puppeteer, { Browser, Page } from 'puppeteer';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { injectDependencies } from './templateDependencyInjector';
import { extractAllImages } from './imageExtractor';
import { fetchWithAntiBlock, checkRobotsTxt } from './proxyManager';

// Rate limiting
const REQUEST_DELAY_MS = 2000; // 2 seconds between requests
let lastRequestTime = 0;

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < REQUEST_DELAY_MS) {
    const waitTime = REQUEST_DELAY_MS - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

/**
 * Check if an error is retryable (network/timeout errors)
 */
function isRetryableError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage = (error as Error).message || String(error);
  const errorString = errorMessage.toLowerCase();
  
  // Retry on network/timeout errors
  const retryablePatterns = [
    'timeout',
    'network',
    'econnrefused',
    'enotfound',
    'econnreset',
    'etimedout',
    'eai_again',
    'socket hang up',
    'navigation timeout',
    'net::err_',
    'failed to fetch',
    'connection refused',
    'dns',
  ];
  
  return retryablePatterns.some(pattern => errorString.includes(pattern));
}

/**
 * Extract the actual website URL from an award site page
 * Award sites typically have a "Visit Website" button or link
 */
async function extractActualWebsiteFromAwardPage(page: Page, awardPageUrl: string): Promise<string | null> {
  try {
    // Different selectors for different award sites
    const selectors: Record<string, string[]> = {
      'awwwards.com': [
        'a.bt-visit',                           // Main visit button
        'a[href*="visit"]',                     // Any visit link
        '.box-site a[target="_blank"]',         // External links in site box
        'a.icon-website',                       // Website icon link
      ],
      'cssdesignawards.com': [
        'a.visit-website',
        'a[href*="visit-website"]',
        '.website-link a',
        'a[target="_blank"][rel*="noopener"]',
      ],
      'thefwa.com': [
        'a.launch-site',
        '.fwa-button-visit',
        'a[href*="launch"]',
      ],
      'siteinspire.com': [
        'a.website-link',
        'a.visit',
        '.site-link a',
      ],
    };
    
    // Find which award site we're on
    let siteSelectors: string[] = [];
    for (const [site, sels] of Object.entries(selectors)) {
      if (awardPageUrl.includes(site)) {
        siteSelectors = sels;
        break;
      }
    }
    
    // Try each selector
    for (const selector of siteSelectors) {
      try {
        const href = await page.$eval(selector, (el: Element) => (el as HTMLAnchorElement).href);
        if (href &&
            !href.includes('awwwards.com') &&
            !href.includes('cssdesignawards.com') &&
            !href.includes('thefwa.com') &&
            !href.includes('siteinspire.com')) {
          return href;
        }
      } catch (_e) {
        // Selector not found, try next
        continue;
      }
    }
    
    // Fallback: Look for any external link that's not an award site
    const externalLinks = await page.$$eval('a[target="_blank"]', (links: Element[]) =>
      links.map((l) => (l as HTMLAnchorElement).href).filter((href) =>
        href &&
        href.startsWith('http') &&
        !href.includes('awwwards.com') &&
        !href.includes('cssdesignawards.com') &&
        !href.includes('thefwa.com') &&
        !href.includes('siteinspire.com') &&
        !href.includes('twitter.com') &&
        !href.includes('facebook.com') &&
        !href.includes('instagram.com') &&
        !href.includes('linkedin.com')
      )
    );
    
    if (externalLinks.length > 0) {
      return externalLinks[0];
    }
    
    return null;
  } catch (error) {
    console.log(`[WebsiteScraper] Could not extract website URL: ${getErrorMessage(error)}`);
    return null;
  }
}

/**
 * Blacklist of directory/aggregator sites and ad-heavy platforms
 * These are NOT real business websites - they're directories that list businesses
 */
const DIRECTORY_BLACKLIST = [
  // Directory/Aggregator sites
  'yelp.com',
  'yellowpages.com',
  'yellow-pages.com',
  'superpages.com',
  'whitepages.com',
  'dexknows.com',
  'manta.com',
  'citysearch.com',
  'local.com',
  'merchantcircle.com',
  'bizjournals.com',
  'bbb.org',
  'angieslist.com',
  'homeadvisor.com',
  'thumbtack.com',
  'porch.com',
  'houzz.com',
  'nextdoor.com',
  'foursquare.com',
  'tripadvisor.com',
  'zomato.com',
  'opentable.com',
  'resy.com',
  'opendi.us',
  'local.yahoo.com',
  'bing.com/local',
  'google.com/maps',
  'google.com/search',
  'facebook.com',
  'linkedin.com',
  'instagram.com',
  'twitter.com',
  'pinterest.com',
  'tiktok.com',
  'youtube.com',
  // Ad/affiliate sites
  'indeed.com',
  'glassdoor.com',
  'monster.com',
  'careerbuilder.com',
  'ziprecruiter.com',
  'simplyhired.com',
  'snagajob.com',
  'adzuna.com',
  'jooble.org',
  'neuvoo.com',
  // Review sites
  'trustpilot.com',
  'g2.com',
  'capterra.com',
  'getapp.com',
  'softwareadvice.com',
  'clutch.co',
  'goodfirms.co',
  'designrush.com', // This is a directory/aggregator
  'agencyanalytics.com',
  'agencyclients.com',
  // News/media sites
  'cnn.com',
  'bbc.com',
  'reuters.com',
  'bloomberg.com',
  'forbes.com',
  'wsj.com',
  'nytimes.com',
  'washingtonpost.com',
  // E-commerce marketplaces
  'amazon.com',
  'ebay.com',
  'etsy.com',
  'alibaba.com',
  'walmart.com',
  'target.com',
  // Other aggregators
  'crunchbase.com',
  'pitchbook.com',
  'bloomberg.com',
  'reuters.com',
];

/**
 * Check if a URL is a real business website (not a directory/aggregator)
 */
function isRealBusinessWebsite(url: string, title: string, snippet?: string): boolean {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase().replace('www.', '');
    
    // Check blacklist
    for (const blacklistedDomain of DIRECTORY_BLACKLIST) {
      if (domain.includes(blacklistedDomain)) {
        return false;
      }
    }
    
    // Check for directory indicators in URL
    const directoryPatterns = [
      '/directory/',
      '/listings/',
      '/businesses/',
      '/companies/',
      '/search?',
      '/results?',
      '/category/',
      '/browse/',
      '/find/',
      '/locate/',
    ];
    
    const urlLower = url.toLowerCase();
    for (const pattern of directoryPatterns) {
      if (urlLower.includes(pattern)) {
        return false;
      }
    }
    
    // Check title for directory/list article indicators
    const titleLower = title.toLowerCase();
    
    // AGGRESSIVE PATTERN: Any title containing "top" followed by a number anywhere
    // Matches: "Top 10...", "Top 25...", "The Top 100...", "America's Top 50...", etc.
    if (/top\s*\d+/i.test(title)) {
      console.log(`[Filter] Rejected "top X" pattern: ${title}`);
      return false;
    }
    
    // AGGRESSIVE PATTERN: Any title containing a number followed by industry terms
    // Matches: "25 Accounting Firms", "10 Best Lawyers", "50 Companies", etc.
    if (/\d+\s*(accounting|law|lawyer|attorney|consulting|consultant|marketing|design|tech|firm|company|companies|firms|agencies|agency|business|businesses|service|services|provider|providers)/i.test(title)) {
      console.log(`[Filter] Rejected number+industry pattern: ${title}`);
      return false;
    }
    
    // AGGRESSIVE PATTERN: "Best" lists
    if (/best\s*\d+|\d+\s*best|the\s+best/i.test(title)) {
      console.log(`[Filter] Rejected "best" pattern: ${title}`);
      return false;
    }
    
    // AGGRESSIVE PATTERN: Rankings and lists
    if (/ranking|ranked|ratings|rated|review|reviews|list\s+of|guide\s+to|updated\s+\d{4}|^\d{4}\s+/i.test(title)) {
      console.log(`[Filter] Rejected ranking/list pattern: ${title}`);
      return false;
    }
    
    // AGGRESSIVE PATTERN: Aggregator site indicators
    if (/most\s+prestigious|most\s+popular|most\s+trusted|leading|biggest|largest|award|awards/i.test(title)) {
      console.log(`[Filter] Rejected aggregator pattern: ${title}`);
      return false;
    }
    
    // AGGRESSIVE PATTERN: Directory keywords in title
    const directoryTitleKeywords = [
      'directory',
      'listings',
      'find a',
      'find the',
      'search results',
      'browse',
      'all businesses',
      'top companies',
      'companies in',
      'businesses near',
      'near me',
      'local businesses',
      'business directory',
      'yellow pages',
      'white pages',
      'compare',
      'comparison',
      'vs',
      'versus',
      'alternatives',
      'how to find',
      'how to choose',
      'choosing a',
      'hiring a',
      'finding a',
      'ipa 500',
      'ipa-500',
      'vault',
      'score',
    ];
    
    for (const keyword of directoryTitleKeywords) {
      if (titleLower.includes(keyword)) {
        console.log(`[Filter] Rejected keyword "${keyword}": ${title}`);
        return false;
      }
    }
    
    // Check snippet for directory indicators
    if (snippet) {
      const snippetLower = snippet.toLowerCase();
      const directorySnippetKeywords = [
        'view all',
        'see all',
        'browse all',
        'find all',
        'directory of',
        'listings for',
        'search results',
      ];
      
      for (const keyword of directorySnippetKeywords) {
        if (snippetLower.includes(keyword)) {
          return false;
        }
      }
    }
    
    // Must have a proper domain (not IP address)
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
      return false;
    }
    
    // Must be HTTP/HTTPS
    if (!urlObj.protocol.startsWith('http')) {
      return false;
    }
    
    return true;
  } catch (error) {
    // If URL parsing fails, exclude it
    return false;
  }
}

/**
 * Filter search results to only include real business websites
 */
function filterRealBusinesses(results: GoogleSearchResult[]): GoogleSearchResult[] {
  const filtered: GoogleSearchResult[] = [];
  let ranking = 1;
  
  for (const result of results) {
    // Check both companyName AND originalTitle for filtering
    const titleToCheck = result.originalTitle || result.companyName;
    if (isRealBusinessWebsite(result.websiteUrl, titleToCheck, result.snippet)) {
      filtered.push({
        ...result,
        ranking: ranking++,
      });
    } else {
      console.log(`[WebsiteScraper] ❌ Filtered out: "${titleToCheck}" - ${result.websiteUrl}`);
    }
  }
  
  console.log(`[WebsiteScraper] ✅ Kept ${filtered.length} real business websites`);
  return filtered;
}

export interface GoogleSearchResult {
  companyName: string;
  websiteUrl: string;
  ranking: number; // Position in search results (1-50)
  snippet?: string; // Search result snippet
  originalTitle?: string; // Original search result title for filtering
}

export interface ScrapedWebsiteData {
  url: string;
  companyName: string;
  htmlContent: string;
  cssContent: string;
  jsContent: string; // CRITICAL: All JavaScript dependencies
  images: Array<{
    url: string;
    alt?: string;
    type?: string;
    data?: string; // Base64 encoded for storage
    width?: number;
    height?: number;
    size?: number; // Size in bytes
    source?: 'img' | 'background' | 'inline' | 'svg'; // Where image was found
    context?: string; // CSS selector or element info
    failed?: boolean;
    error?: string;
  }>;
  textContent: {
    title: string;
    headings: Array<{ level: number; text: string }>;
    paragraphs: string[];
    lists: string[][];
    links: Array<{ text: string; url: string }>;
  };
  designTokens: {
    colors: {
      primary?: string;
      secondary?: string;
      accent?: string;
      background?: string;
      text?: string;
      [key: string]: string | undefined;
    };
    typography: {
      headingFont?: string;
      bodyFont?: string;
      headingWeight?: string;
      bodySize?: string;
    };
    spacing: {
      sectionPadding?: string;
      containerMaxWidth?: string;
    };
  };
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    ogTags: Record<string, string>;
  };
  error?: string;
  // If this was scraped from an award site page, this contains the actual website URL
  actualWebsiteUrl?: string;
}

/**
 * Search Google for real business websites in an industry and location
 * Uses multiple search strategies to find actual company websites, not list articles
 */
export async function searchGoogleRankings(
  industry: string,
  country: string,
  state?: string,
  city?: string,
  limit: number = 50
): Promise<GoogleSearchResult[]> {
  await rateLimit();

  try {
    // Build location string
    let location = country;
    if (city && state) {
      location = `${city} ${state}`;
    } else if (state) {
      location = state;
    }

    // Use multiple search queries to find REAL business websites
    // Strategy: Search for actual business terms, not "top X" lists
    const searchQueries = [
      // Direct business searches - these find actual company websites
      `${industry} firm ${location}`,
      `${industry} company ${location}`,
      `${industry} services ${location}`,
      `${industry} ${location} -top -best -list -directory -review -compare`,
      `"${industry}" "${location}" site:.com`,
    ];

    console.log(`[WebsiteScraper] Searching for real ${industry} businesses in ${location}`);

    // Use Google Custom Search API if available, otherwise scrape
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    const allResults: GoogleSearchResult[] = [];
    const seenUrls = new Set<string>();

    // Try each query and combine unique results
    for (const query of searchQueries) {
      console.log(`[WebsiteScraper] Query: "${query}"`);
      
      let results: GoogleSearchResult[] = [];
      
      if (apiKey && searchEngineId) {
        console.log(`[WebsiteScraper] ✅ Using Google Custom Search API for: "${query}"`);
        results = await searchGoogleAPI(query, Math.ceil(limit / searchQueries.length) + 10, apiKey, searchEngineId);
        console.log(`[WebsiteScraper] ✅ Google API returned ${results.length} results`);
      } else {
        console.warn(`[WebsiteScraper] ⚠️ Google Custom Search API not configured`);
        console.warn(`[WebsiteScraper] ⚠️ Missing: GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_ENGINE_ID`);
        console.warn(`[WebsiteScraper] ⚠️ Using slow fallback scraping method`);
        results = await searchGoogleScrape(query, Math.ceil(limit / searchQueries.length) + 10);
      }

      // Add unique results
      for (const result of results) {
        const domain = new URL(result.websiteUrl).hostname.toLowerCase();
        if (!seenUrls.has(domain)) {
          seenUrls.add(domain);
          allResults.push({
            ...result,
            ranking: allResults.length + 1,
          });
        }
        
        if (allResults.length >= limit * 2) break; // Get extra for filtering
      }
      
      if (allResults.length >= limit * 2) break;
      
      // Small delay between queries
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`[WebsiteScraper] Found ${allResults.length} unique results before filtering`);
    
    // Return results (filtering happens in the calling functions)
    return allResults.slice(0, limit * 2); // Return extra for filtering
  } catch (error) {
    logError(error, 'Google Search');
    throw new Error(`Failed to search Google: ${getErrorMessage(error)}`);
  }
}

/**
 * Search using Google Custom Search API
 */
async function searchGoogleAPI(
  query: string,
  limit: number,
  apiKey: string,
  searchEngineId: string
): Promise<GoogleSearchResult[]> {
  const results: GoogleSearchResult[] = [];
  let startIndex = 1;
  const maxResults = Math.min(limit, 100); // Google API max is 100

  while (results.length < maxResults) {
    await rateLimit();

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&start=${startIndex}&num=10`;

    try {
      const response = await fetchWithAntiBlock(url, { retries: 2 });
      if (!response.ok) {
        throw new Error(`Google API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as {
        items?: Array<{ link: string; title: string; snippet: string }>;
        queries?: { nextPage?: unknown };
      };

      if (!data.items || data.items.length === 0) {
        break;
      }

      for (const item of data.items) {
        const url = item.link;
        const title = item.title;
        const snippet = item.snippet;

        // Extract company name from title or URL
        const companyName = extractCompanyName(title, url);

        results.push({
          companyName,
          websiteUrl: url,
          ranking: results.length + 1,
          snippet,
          originalTitle: title, // Keep original title for filtering
        });

        if (results.length >= maxResults) {
          break;
        }
      }

      // Check if there are more results
      if (!data.queries?.nextPage) {
        break;
      }

      startIndex += 10;
    } catch (error) {
      console.error(`[WebsiteScraper] Google API error:`, error);
      // Fallback to scraping if API fails
      return await searchGoogleScrape(query, limit);
    }
  }

  // Filter out directories/aggregators - only return real business websites
  const filtered = filterRealBusinesses(results);
  console.log(`[WebsiteScraper] Filtered ${results.length} results → ${filtered.length} real business websites`);
  
  return filtered;
}

/**
 * Search Google by scraping (fallback method)
 * Uses Puppeteer to avoid being blocked
 */
async function searchGoogleScrape(
  query: string,
  limit: number
): Promise<GoogleSearchResult[]> {
  const results: GoogleSearchResult[] = [];
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${Math.min(limit, 100)}`;
    
    console.log(`[WebsiteScraper] Scraping Google with Puppeteer: "${query}"`);
    
    await rateLimit();

    // Use Puppeteer to avoid being blocked
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to Google search
    await page.goto(searchUrl, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });

    // Wait for results to load
    await page.waitForSelector('div.g, div[data-sokoban-container]', { timeout: 10000 }).catch(() => {
      console.log('[WebsiteScraper] No results found or page structure different');
    });

    // Extract search results using multiple selectors (Google changes structure frequently)
    const searchResults = await page.evaluate(() => {
      const results: Array<{ title: string; url: string; snippet: string }> = [];

      // Try multiple selectors for Google search results
      const selectors = [
        'div.g', // Standard Google results
        'div[data-sokoban-container]', // Newer Google structure
        'div.tF2Cxc', // Another variant
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach((el) => {
            const titleEl = el.querySelector('h3') || el.querySelector('a h3');
            const linkEl = el.querySelector('a[href]') as HTMLAnchorElement;
            const snippetEl = el.querySelector('.VwiC3b') || 
                            el.querySelector('span[style*="-webkit-line-clamp"]') ||
                            el.querySelector('.s');

            if (titleEl && linkEl) {
              const title = titleEl.textContent?.trim() || '';
              const href = linkEl.href || '';
              const snippet = snippetEl?.textContent?.trim() || '';

              // Clean Google redirect URL
              let url = href;
              if (href.includes('/url?q=')) {
                try {
                  const urlMatch = href.match(/\/url\?q=([^&]+)/);
                  if (urlMatch) {
                    url = decodeURIComponent(urlMatch[1]);
                  }
                } catch (_e) {
                  // Keep original if decode fails
                }
              }

              if (title && url && !url.startsWith('https://www.google.com')) {
                results.push({ title, url, snippet });
              }
            }
          });
          break; // Use first selector that works
        }
      }

      return results;
    });

    // Process results
    for (let i = 0; i < Math.min(searchResults.length, limit); i++) {
      const result = searchResults[i];
      const companyName = extractCompanyName(result.title, result.url);

      results.push({
        companyName,
        websiteUrl: result.url,
        ranking: i + 1,
        snippet: result.snippet,
        originalTitle: result.title, // Keep original title for filtering
      });
    }

    console.log(`[WebsiteScraper] Found ${results.length} search results using Puppeteer`);
    
    // Filter out directories/aggregators - only return real business websites
    const filtered = filterRealBusinesses(results);
    console.log(`[WebsiteScraper] Filtered ${results.length} results → ${filtered.length} real business websites`);
    
    return filtered;
  } catch (error) {
    console.error(`[WebsiteScraper] Google scraping error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[WebsiteScraper] Error details:`, errorMessage);
    
    // If scraping fails, try a simpler approach: return some mock results for testing
    // In production, you should set up Google Custom Search API
    if (results.length === 0) {
      console.warn(`[WebsiteScraper] ⚠️ No results found. Google may be blocking requests.`);
      console.warn(`[WebsiteScraper] 💡 Recommendation: Set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID in .env`);
    }
    
    // Filter even error results if any exist
    const filtered = filterRealBusinesses(results);
    return filtered;
  } finally {
    if (page) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}

/**
 * Extract company name from title or URL
 */
function extractCompanyName(title: string, url: string): string {
  // Try to extract from title first
  let name = title
    .replace(/\s*-\s*.*$/, '') // Remove everything after dash
    .replace(/\s*\|\s*.*$/, '') // Remove everything after pipe
    .trim();

  // If title extraction failed, try URL
  if (!name || name.length < 3) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      name = domain.split('.')[0]; // Get first part of domain
      name = name.charAt(0).toUpperCase() + name.slice(1);
    } catch {
      name = 'Unknown Company';
    }
  }

  return name;
}

/**
 * Scrape a website for full content and design
 * Uses Puppeteer for JavaScript-heavy sites
 * Includes retry logic with exponential backoff
 */
export async function scrapeWebsiteFull(
  url: string,
  companyName?: string,
  maxRetries: number = 3,
  retryDelay: number = 2000,
  onProgress?: (phase: string, current: number, total: number, message?: string) => void
): Promise<ScrapedWebsiteData> {
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;
  let lastError: unknown = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
      if (attempt > 1) {
        const delay = retryDelay * Math.pow(2, attempt - 2); // Exponential backoff: 2s, 4s, 8s
        console.log(`[WebsiteScraper] ⏳ Retry attempt ${attempt}/${maxRetries} for ${fullUrl} after ${delay}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.log(`[WebsiteScraper] Scraping full website: ${fullUrl}`);
        
        // Check robots.txt before scraping
        const allowed = await checkRobotsTxt(fullUrl);
        if (!allowed) {
          throw new Error(`robots.txt disallows scraping for ${fullUrl}`);
        }
      }

      // Launch browser
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Navigate to page with increased timeout for heavy sites
      // Award sites like Awwwards can be slow to load
      const timeout = fullUrl.includes('awwwards.com') || 
                     fullUrl.includes('cssdesignawards.com') ||
                     fullUrl.includes('thefwa.com') ? 60000 : 30000;
      
      await page.goto(fullUrl, { 
        waitUntil: 'networkidle2', 
        timeout: timeout 
      });

      // Wait for page to fully load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // IMPROVED: If this is an award site page, try to extract the actual website URL
      let redirectUrl: string | null = null;
      if (fullUrl.includes('awwwards.com/sites/') || 
          fullUrl.includes('cssdesignawards.com/sites/') ||
          fullUrl.includes('thefwa.com/cases/') ||
          fullUrl.includes('siteinspire.com/website/')) {
        try {
          redirectUrl = await extractActualWebsiteFromAwardPage(page, fullUrl);
          if (redirectUrl) {
            console.log(`[WebsiteScraper] 🔗 Found actual website URL: ${redirectUrl}`);
          }
        } catch (_e) {
          console.log(`[WebsiteScraper] ℹ️ Could not extract website URL from award page`);
        }
      }

      // Extract HTML
      onProgress?.('html', 1, 10, 'Extracting HTML content...');
      const htmlContent = await page.content();

      // Extract CSS (inline styles + external stylesheets)
      onProgress?.('css', 2, 10, 'Extracting CSS stylesheets...');
      const cssContent = await extractCSS(page, fullUrl);

      // CRITICAL: Extract JavaScript dependencies
      onProgress?.('javascript', 3, 10, 'Extracting JavaScript files...');
      const jsContent = await extractJavaScript(page, fullUrl);

      // Extract images using new comprehensive extractor
      onProgress?.('images', 4, 10, 'Extracting images...');
      const extractedImages = await extractAllImages(page, fullUrl, {
        downloadImages: true,
        extractBackgrounds: true,
        waitForLazyImages: true,
        maxImageSize: 5 * 1024 * 1024, // 5MB max
        onProgress: (current, total, message) => {
          onProgress?.('images', 4, 10, message || `Downloading images (${current}/${total})...`);
        },
      });
      
      // Convert to ScrapedWebsiteData format
      const images = extractedImages.map(img => ({
        url: img.url,
        alt: img.alt,
        type: img.type,
        data: img.data,
        width: img.width,
        height: img.height,
        size: img.size,
        source: img.source,
        context: img.context,
        failed: img.failed,
        error: img.error,
      }));
      
      const successfulImages = images.filter(img => !img.failed).length;
      const failedImages = images.filter(img => img.failed).length;
      console.log(`[WebsiteScraper] ✅ Extracted ${images.length} images (${successfulImages} successful, ${failedImages} failed)`);

      // Extract text content
      onProgress?.('text', 7, 10, 'Extracting text content...');
      const textContent = await extractTextContent(page);

      // Extract design tokens
      onProgress?.('design-tokens', 8, 10, 'Extracting design tokens...');
      const designTokens = await extractDesignTokens(page);

      // Extract metadata
      onProgress?.('metadata', 9, 10, 'Extracting metadata...');
      const metadata = await extractMetadata(page);
      
      onProgress?.('complete', 10, 10, 'Scraping complete!');

      // Extract company name if not provided
      const finalCompanyName = companyName || await extractCompanyNameFromPage(page);

      if (attempt > 1) {
        console.log(`[WebsiteScraper] ✅ Successfully scraped ${fullUrl} on retry attempt ${attempt}`);
      } else {
        console.log(`[WebsiteScraper] ✅ Successfully scraped ${fullUrl}`);
      }

      // Clean up
      if (page) await page.close();
      if (browser) await browser.close();

      return {
        url: fullUrl,
        companyName: finalCompanyName,
        htmlContent,
        cssContent,
        jsContent, // CRITICAL: All JavaScript dependencies downloaded
        images,
        textContent,
        designTokens,
        metadata,
        // Include the actual website URL if this was an award page
        actualWebsiteUrl: redirectUrl || undefined,
      };

    } catch (error) {
      lastError = error;
      const errorMessage = getErrorMessage(error);
      
      // Clean up on error
      if (page) {
        try { await page.close(); } catch (_e) {}
      }
      if (browser) {
        try { await browser.close(); } catch (_e) {}
      }

      // Check if error is retryable
      const isRetryable = isRetryableError(error);
      
      if (attempt < maxRetries && isRetryable) {
        console.warn(`[WebsiteScraper] ⚠️ Attempt ${attempt}/${maxRetries} failed for ${fullUrl}: ${errorMessage}`);
        console.warn(`[WebsiteScraper] 🔄 Will retry (retryable error: ${isRetryable})`);
        // Continue to next retry
        continue;
      } else {
        // Last attempt or non-retryable error
        if (!isRetryable) {
          console.error(`[WebsiteScraper] ❌ Non-retryable error for ${fullUrl}: ${errorMessage}`);
        } else {
          console.error(`[WebsiteScraper] ❌ Failed to scrape ${fullUrl} after ${maxRetries} attempts: ${errorMessage}`);
        }
        
        logError(error, 'Website Scraper');
        
        return {
          url: fullUrl,
          companyName: companyName || 'Unknown',
          htmlContent: '',
          cssContent: '',
          jsContent: '',
          images: [],
          textContent: {
            title: '',
            headings: [],
            paragraphs: [],
            lists: [],
            links: [],
          },
          designTokens: {
            colors: {},
            typography: {},
            spacing: {},
          },
          metadata: {
            title: '',
            description: '',
            keywords: [],
            ogTags: {},
          },
          error: errorMessage,
        };
      }
    }
  }

  // Should never reach here, but TypeScript needs it
  const errorMessage = getErrorMessage(lastError);
  return {
    url: fullUrl,
    companyName: companyName || 'Unknown',
    htmlContent: '',
    cssContent: '',
    images: [],
    textContent: {
      title: '',
      headings: [],
      paragraphs: [],
      lists: [],
      links: [],
    },
    designTokens: {
      colors: {},
      typography: {},
      spacing: {},
    },
    metadata: {
      title: '',
      description: '',
      keywords: [],
      ogTags: {},
    },
    jsContent: '',
    error: errorMessage,
  };
}

/**
 * Extract CSS from page (inline + external stylesheets)
 */
async function extractCSS(page: Page, _baseUrl: string): Promise<string> {
  try {
    const styles: string[] = [];

    // Get inline styles from page
    const inlineStyles = await page.evaluate(() => {
      const inline: string[] = [];
      const styleTags = Array.from(document.querySelectorAll('style'));
      styleTags.forEach(style => {
        if (style.textContent) {
          inline.push(style.textContent);
        }
      });
      return inline;
    });
    styles.push(...inlineStyles);

    // Get external stylesheet URLs
    const stylesheetUrls = await page.evaluate(() => {
      const urls: string[] = [];
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      links.forEach(link => {
        const href = (link as HTMLLinkElement).href;
        if (href) {
          urls.push(href);
        }
      });
      return urls;
    });

    // Fetch external stylesheets from Node.js side (not browser)
    for (const cssUrl of stylesheetUrls) {
      try {
        const response = await fetch(cssUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        if (response.ok) {
          const cssText = await response.text();
          styles.push(`/* ${cssUrl} */\n${cssText}`);
        }
      } catch (_e) {
        // Skip if can't fetch
        console.warn(`[WebsiteScraper] Could not fetch CSS from ${cssUrl}`);
      }
    }

    return styles.join('\n\n');
  } catch (error) {
    console.error('[WebsiteScraper] Error extracting CSS:', error);
    return '';
  }
}

/**
 * Extract JavaScript files from page
 * CRITICAL: Downloads ALL external JS files so template works standalone
 */
async function extractJavaScript(page: Page, _baseUrl: string): Promise<string> {
  try {
    const scripts: string[] = [];

    // Get inline scripts
    const inlineScripts = await page.evaluate(() => {
      const inline: string[] = [];
      const inlineScriptTags = Array.from(document.querySelectorAll('script:not([src])'));
      inlineScriptTags.forEach((script) => {
        if (script.textContent) {
          inline.push(`// Inline script\n${script.textContent}`);
        }
      });
      return inline;
    });
    scripts.push(...inlineScripts);

    // Get external script URLs
    const externalScriptUrls = await page.evaluate(() => {
      const urls: string[] = [];
      const externalScripts = Array.from(document.querySelectorAll('script[src]'));
      externalScripts.forEach((script) => {
        const src = (script as HTMLScriptElement).src;
        if (src &&
            !src.startsWith('data:') &&
            !src.includes('google-analytics') &&
            !src.includes('gtag') &&
            !src.includes('googletagmanager') &&
            !src.includes('facebook.net') &&
            !src.includes('doubleclick') &&
            !src.includes('analytics')) {
          urls.push(src);
        }
      });
      return urls;
    });

    // Fetch external scripts from Node.js side
    for (const src of externalScriptUrls) {
      try {
        const response = await fetchWithAntiBlock(src, { retries: 2 });
        const jsText = await response.text();
        scripts.push(`\n// External JS: ${src}\n${jsText}`);
      } catch (_e) {
        // Skip if can't fetch (might be CORS blocked)
        console.warn(`[WebsiteScraper] Failed to fetch JS: ${src}`);
      }
    }

    const js = scripts.join('\n\n');
    console.log(`[WebsiteScraper] ✅ Extracted ${js.length} chars of JavaScript`);
    return js;
  } catch (error) {
    console.error('[WebsiteScraper] Error extracting JavaScript:', error);
    return '';
  }
}

// NOTE: extractImages() function removed - now using extractAllImages() from imageExtractor.ts

/**
 * Extract structured text content
 */
async function extractTextContent(page: Page): Promise<ScrapedWebsiteData['textContent']> {
  try {
    const content = await page.evaluate(() => {
      const title = document.title || '';
      
      const headings: Array<{ level: number; text: string }> = [];
      for (let i = 1; i <= 6; i++) {
        const elements = Array.from(document.querySelectorAll(`h${i}`));
        elements.forEach(el => {
          const text = el.textContent?.trim();
          if (text) {
            headings.push({ level: i, text });
          }
        });
      }

      const paragraphs: string[] = [];
      const pElements = Array.from(document.querySelectorAll('p'));
      pElements.forEach(p => {
        const text = p.textContent?.trim();
        if (text && text.length > 20) {
          paragraphs.push(text);
        }
      });

      const lists: string[][] = [];
      const listElements = Array.from(document.querySelectorAll('ul, ol'));
      listElements.forEach(list => {
        const items: string[] = [];
        const liElements = Array.from(list.querySelectorAll('li'));
        liElements.forEach(li => {
          const text = li.textContent?.trim();
          if (text) {
            items.push(text);
          }
        });
        if (items.length > 0) {
          lists.push(items);
        }
      });

      const links: Array<{ text: string; url: string }> = [];
      const aElements = Array.from(document.querySelectorAll('a[href]'));
      aElements.forEach(a => {
        const text = a.textContent?.trim();
        const href = (a as HTMLAnchorElement).href;
        if (text && href) {
          links.push({ text, url: href });
        }
      });

      return {
        title,
        headings,
        paragraphs,
        lists,
        links: links.slice(0, 100), // Limit links
      };
    });

    return content;
  } catch (error) {
    console.error('[WebsiteScraper] Error extracting text content:', error);
    return {
      title: '',
      headings: [],
      paragraphs: [],
      lists: [],
      links: [],
    };
  }
}

/**
 * Extract design tokens (colors, typography, spacing)
 */
async function extractDesignTokens(page: Page): Promise<ScrapedWebsiteData['designTokens']> {
  try {
    const tokens = await page.evaluate(() => {
      const colors: Record<string, string> = {};
      const typography: Record<string, string> = {};
      const spacing: Record<string, string> = {};

      // Extract colors from computed styles
      const body = document.body;
      if (body) {
        const computedStyle = window.getComputedStyle(body);
        colors.background = computedStyle.backgroundColor;
        colors.text = computedStyle.color;
      }

      // Extract typography
      const h1 = document.querySelector('h1');
      if (h1) {
        const style = window.getComputedStyle(h1);
        typography.headingFont = style.fontFamily;
        typography.headingWeight = style.fontWeight;
      }

      const p = document.querySelector('p');
      if (p) {
        const style = window.getComputedStyle(p);
        typography.bodyFont = style.fontFamily;
        typography.bodySize = style.fontSize;
      }

      // Extract spacing
      const main = document.querySelector('main') || document.body;
      if (main) {
        const style = window.getComputedStyle(main);
        spacing.sectionPadding = style.padding;
        spacing.containerMaxWidth = style.maxWidth;
      }

      // Try to find primary color from common elements
      const buttons = Array.from(document.querySelectorAll('button, a.button, .btn'));
      if (buttons.length > 0) {
        const btnStyle = window.getComputedStyle(buttons[0] as Element);
        colors.primary = btnStyle.backgroundColor;
      }

      return { colors, typography, spacing };
    });

    return tokens;
  } catch (error) {
    console.error('[WebsiteScraper] Error extracting design tokens:', error);
    return {
      colors: {},
      typography: {},
      spacing: {},
    };
  }
}

/**
 * Extract metadata
 */
async function extractMetadata(page: Page): Promise<ScrapedWebsiteData['metadata']> {
  try {
    const metadata = await page.evaluate(() => {
      const title = document.title || '';
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const keywords = (document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '')
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const ogTags: Record<string, string> = {};
      const ogElements = Array.from(document.querySelectorAll('meta[property^="og:"]'));
      ogElements.forEach(el => {
        const property = el.getAttribute('property');
        const content = el.getAttribute('content');
        if (property && content) {
          ogTags[property] = content;
        }
      });

      return {
        title,
        description,
        keywords,
        ogTags,
      };
    });

    return metadata;
  } catch (error) {
    console.error('[WebsiteScraper] Error extracting metadata:', error);
    return {
      title: '',
      description: '',
      keywords: [],
      ogTags: {},
    };
  }
}

/**
 * Extract company name from page
 */
async function extractCompanyNameFromPage(page: Page): Promise<string> {
  try {
    const name = await page.evaluate(() => {
      // Try title first
      const title = document.title;
      if (title) {
        const cleaned = title
          .replace(/\s*-\s*.*$/, '')
          .replace(/\s*\|\s*.*$/, '')
          .trim();
        if (cleaned.length > 3) {
          return cleaned;
        }
      }

      // Try h1
      const h1 = document.querySelector('h1');
      if (h1 && h1.textContent) {
        return h1.textContent.trim();
      }

      // Try og:site_name
      const ogSiteName = document.querySelector('meta[property="og:site_name"]');
      if (ogSiteName) {
        return ogSiteName.getAttribute('content') || '';
      }

      return 'Unknown Company';
    });

    return name;
  } catch (error) {
    return 'Unknown Company';
  }
}

/**
 * Create template from scraped data
 */
export function createTemplateFromScrape(
  scrapedData: ScrapedWebsiteData,
  sourceId: string,
  industry: string,
  country: string,
  state?: string,
  city?: string,
  ranking?: string,
  designCategory?: string,
  isDesignQuality = false,
  designScore?: number,
  designAwardSource?: string
): {
  id: string;
  name: string;
  brand: string;
  category: string;
  industry: string;
  thumbnail: string;
  colors: Record<string, string>;
  typography: Record<string, string>;
  layout: {
    heroStyle: 'centered';
    maxWidth: string;
    borderRadius: string;
    sections: string[];
  };
  css: string;
  darkMode: boolean;
  tags: string[];
  sourceId: string;
  locationCountry: string;
  locationState: string | null;
  locationCity: string | null;
  rankingPosition: string | null;
  isDesignQuality: boolean;
  designCategory: string | null;
  designScore: string | null;
  designAwardSource: string | null;
  sourceUrl: string;
  contentData: {
    html: string;
    css: string;
    js: string;
    text: ScrapedWebsiteData['textContent'];
    images: ScrapedWebsiteData['images'];
    metadata: ScrapedWebsiteData['metadata'] & { url: string; sourceUrl: string };
  };
} {
  // Extract colors
  const colors = {
    primary: scrapedData.designTokens.colors.primary || '#000000',
    secondary: scrapedData.designTokens.colors.secondary || '#666666',
    accent: scrapedData.designTokens.colors.accent || scrapedData.designTokens.colors.primary || '#000000',
    background: scrapedData.designTokens.colors.background || '#FFFFFF',
    surface: scrapedData.designTokens.colors.background || '#F5F5F5',
    text: scrapedData.designTokens.colors.text || '#000000',
    textMuted: scrapedData.designTokens.colors.text || '#666666',
  };

  // Extract typography
  const typography = {
    headingFont: scrapedData.designTokens.typography.headingFont || 'system-ui, sans-serif',
    bodyFont: scrapedData.designTokens.typography.bodyFont || 'system-ui, sans-serif',
    headingWeight: scrapedData.designTokens.typography.headingWeight || '700',
  };

  // Extract layout sections
  const sections = scrapedData.textContent.headings
    .filter(h => h.level <= 2)
    .map(h => h.text)
    .slice(0, 10);

  const layout = {
    heroStyle: 'centered' as const,
    maxWidth: scrapedData.designTokens.spacing.containerMaxWidth || '1200px',
    borderRadius: '8px',
    sections: sections.length > 0 ? sections : ['hero', 'features', 'about'],
  };

  // Generate template ID (ensure it's not too long - max 255 chars for varchar)
  // Use URL hash to ensure uniqueness even for sites with same name
  const companySlug = scrapedData.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
  const industrySlug = industry.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30);
  const urlHash = scrapedData.url ? Buffer.from(scrapedData.url).toString('base64').substring(0, 8).replace(/[^a-z0-9]/g, '') : Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString();
  const templateId = `${companySlug}-${industrySlug}-${urlHash}-${timestamp}`.substring(0, 200); // Ensure max length

  // CRITICAL: Convert ALL relative URLs to absolute URLs BEFORE storing
  let processedHTML = scrapedData.htmlContent;
  let processedCSS = scrapedData.cssContent;
  const sourceUrl = scrapedData.url || scrapedData.actualWebsiteUrl || '';
  
  if (sourceUrl) {
    try {
      const baseUrl = new URL(sourceUrl);
      console.log(`[TemplateCreator] 🔗 Converting URLs using base: ${baseUrl.origin}`);
      
      // Convert HTML URLs using Cheerio (already imported at top of file)
      const $ = cheerio.load(processedHTML);
      
      // Convert all link[href] attributes (CSS files)
      $('link[href]').each((_index, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('data:') && !href.startsWith('#')) {
          const absoluteUrl = href.startsWith('/')
            ? `${baseUrl.origin}${href}`
            : new URL(href, sourceUrl).href;
          $(el).attr('href', absoluteUrl);
        }
      });

      // Convert all script[src] attributes (JS files)
      $('script[src]').each((_index, el) => {
        const src = $(el).attr('src');
        if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:') && !src.startsWith('#')) {
          const absoluteUrl = src.startsWith('/')
            ? `${baseUrl.origin}${src}`
            : new URL(src, sourceUrl).href;
          $(el).attr('src', absoluteUrl);
        }
      });

      // Convert all img[src] attributes
      $('img[src]').each((_index, el) => {
        const src = $(el).attr('src');
        if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:') && !src.startsWith('#')) {
          const absoluteUrl = src.startsWith('/')
            ? `${baseUrl.origin}${src}`
            : new URL(src, sourceUrl).href;
          $(el).attr('src', absoluteUrl);
        }
      });

      // Convert all img[srcset] attributes
      $('img[srcset]').each((_index, el) => {
        const srcset = $(el).attr('srcset');
        if (srcset) {
          const convertedSrcset = srcset.split(',').map((item: string) => {
            const parts = item.trim().split(/\s+/);
            const url = parts[0];
            if (url && !url.startsWith('http') && !url.startsWith('//') && !url.startsWith('data:')) {
              const absoluteUrl = url.startsWith('/')
                ? `${baseUrl.origin}${url}`
                : new URL(url, sourceUrl).href;
              return `${absoluteUrl} ${parts.slice(1).join(' ')}`;
            }
            return item;
          }).join(', ');
          $(el).attr('srcset', convertedSrcset);
        }
      });

      // Convert all a[href] attributes (links)
      $('a[href]').each((_index, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('data:') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          const absoluteUrl = href.startsWith('/')
            ? `${baseUrl.origin}${href}`
            : new URL(href, sourceUrl).href;
          $(el).attr('href', absoluteUrl);
        }
      });

      // Remove integrity attributes that cause blocking
      $('link[integrity], script[integrity]').each((_index, el) => {
        $(el).removeAttr('integrity');
      });
      
      processedHTML = $.html();
      
      // Convert CSS URLs (background-image, @import, url())
      processedCSS = processedCSS.replace(/url\(['"]?([^'")]+)['"]?\)/g, (match: string, url: string) => {
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) {
          return match;
        }
        const absoluteUrl = url.startsWith('/') 
          ? `${baseUrl.origin}${url}`
          : new URL(url, sourceUrl).href;
        return `url('${absoluteUrl}')`;
      });
      
      console.log(`[TemplateCreator] ✅ All URLs converted to absolute`);
    } catch (urlError) {
      console.warn(`[TemplateCreator] ⚠️ URL conversion failed:`, getErrorMessage(urlError));
    }
  }
  
  // Inject all dependencies into HTML to ensure it works immediately
  try {
    processedHTML = injectDependencies(processedHTML);
    console.log(`[TemplateCreator] ✅ Dependencies injected into template: ${templateId}`);
  } catch (error) {
    console.warn(`[TemplateCreator] ⚠️ Failed to inject dependencies, using original HTML:`, getErrorMessage(error));
    // Continue with original HTML if injection fails
  }

  return {
    id: templateId,
    name: `${scrapedData.companyName} Template`,
    brand: scrapedData.companyName,
    category: 'corporate', // Default, can be updated
    industry: industry,
    thumbnail: scrapedData.images[0]?.url || '',
    colors,
    typography,
    layout,
    css: processedCSS, // Use URL-converted CSS
    darkMode: false,
    tags: [industry, country, ...(state ? [state] : []), ...(city ? [city] : [])],
    sourceId,
    locationCountry: country,
    locationState: state || null,
    locationCity: city || null,
    rankingPosition: ranking || null,
    // NEW: Design Quality fields
    isDesignQuality: isDesignQuality || false,
    designCategory: designCategory || null,
    designScore: designScore ? String(designScore) : null,
    designAwardSource: designAwardSource || null,
    // CRITICAL: Store source URL for URL conversion in preview
    sourceUrl: scrapedData.url || scrapedData.actualWebsiteUrl || '',
    contentData: {
      html: processedHTML, // Use processed HTML with URL conversion and dependencies injected
      css: processedCSS, // Store URL-converted CSS separately for easy access
      js: scrapedData.jsContent, // CRITICAL: Store JavaScript dependencies
      text: scrapedData.textContent,
      images: scrapedData.images,
      metadata: {
        ...scrapedData.metadata,
        url: scrapedData.url || scrapedData.actualWebsiteUrl || '', // Ensure URL is in metadata too
        sourceUrl: scrapedData.url || scrapedData.actualWebsiteUrl || '',
      },
    },
  };
}

/**
 * Multi-page website crawler - FIXED VERSION
 * Crawls entire website starting from homepage and stores all pages
 * Uses shorter timeouts, better error handling, and skips problematic URLs
 */
export async function crawlWebsiteMultiPage(
  startUrl: string,
  templateId: string,
  maxPages: number = 100, // Reasonable limit - most sites don't have 1000 pages
  maxDepth: number = 5, // Reasonable depth
  onProgress?: (current: number, total: number, url: string) => void
): Promise<{ pagesScraped: number; errors: string[] }> {
  const baseUrl = new URL(startUrl);
  const baseOrigin = baseUrl.origin;
  
  const visitedUrls = new Set<string>();
  const toVisit: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
  const errors: string[] = [];
  let pagesScraped = 0;
  
  // URL patterns to skip (files, not pages)
  const skipPatterns = [
    /\.pdf$/i, /\.doc$/i, /\.docx$/i, /\.xls$/i, /\.xlsx$/i,
    /\.zip$/i, /\.rar$/i, /\.exe$/i, /\.dmg$/i,
    /\.jpg$/i, /\.jpeg$/i, /\.png$/i, /\.gif$/i, /\.svg$/i, /\.webp$/i,
    /\.mp4$/i, /\.mp3$/i, /\.avi$/i, /\.mov$/i,
    /\.css$/i, /\.js$/i, /\.json$/i, /\.xml$/i,
    /mailto:/i, /tel:/i, /javascript:/i,
    /\?.*download/i, /\/download\//i,
  ];
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[MultiPageCrawler] 🚀 STARTING FULL SITE CRAWL`);
  console.log(`[MultiPageCrawler] 🌐 URL: ${startUrl}`);
  console.log(`[MultiPageCrawler] 📄 Max pages: ${maxPages}`);
  console.log(`[MultiPageCrawler] 📊 Max depth: ${maxDepth}`);
  console.log(`${'='.repeat(60)}\n`);
  
  // Import database and schema at the TOP
  const { db } = await import('../db');
  const { templatePages } = await import('../../shared/schema');
  const { eq } = await import('drizzle-orm');
  
  // Verify database connection
  if (!db) {
    console.error(`[MultiPageCrawler] ❌ CRITICAL: Database not available!`);
    return { pagesScraped: 0, errors: ['Database not available'] };
  }
  
  console.log(`[MultiPageCrawler] ✅ Database connection verified`);
  
  // Delete existing pages for this template
  try {
    await db.delete(templatePages).where(eq(templatePages.templateId, templateId));
    console.log(`[MultiPageCrawler] 🗑️ Cleared existing pages for template ${templateId}`);
  } catch (_e) {
    console.warn(`[MultiPageCrawler] ⚠️ Could not clear existing pages:`, getErrorMessage(_e));
  }
  
  // Helper to check if URL should be skipped
  const shouldSkipUrl = (url: string): boolean => {
    return skipPatterns.some(pattern => pattern.test(url));
  };
  
  // Scrape a single page with timeout
  const scrapePage = async (url: string): Promise<ScrapedWebsiteData | null> => {
    const SCRAPE_TIMEOUT = 15000; // 15 second timeout per page
    
    try {
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Scrape timeout')), SCRAPE_TIMEOUT);
      });
      
      const scrapePromise = scrapeWebsiteFull(url, undefined, 1, 1000); // 1 retry, 1s delay
      
      const result = await Promise.race([scrapePromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.warn(`[MultiPageCrawler] ⏱️ Timeout or error scraping ${url}`);
      return null;
    }
  };
  
  // Main crawl loop
  while (toVisit.length > 0 && pagesScraped < maxPages) {
    const { url: currentUrl, depth } = toVisit.shift()!;
    
    // Normalize URL
    const normalizedUrl = currentUrl.split('#')[0].replace(/\/$/, '') || currentUrl;
    
    // Skip if already visited
    if (visitedUrls.has(normalizedUrl)) {
      continue;
    }
    
    // Skip if too deep
    if (depth > maxDepth) {
      continue;
    }
    
    // Skip external URLs
    try {
      const urlObj = new URL(normalizedUrl);
      if (urlObj.origin !== baseOrigin) {
        continue;
      }
    } catch (_e) {
      continue;
    }
    
    // Skip file downloads and non-HTML
    if (shouldSkipUrl(normalizedUrl)) {
      console.log(`[MultiPageCrawler] ⏭️ Skipping non-HTML: ${normalizedUrl.substring(0, 60)}...`);
      continue;
    }
    
    visitedUrls.add(normalizedUrl);
    
    console.log(`\n[MultiPageCrawler] 📄 Page ${pagesScraped + 1}/${maxPages} (depth ${depth})`);
    console.log(`[MultiPageCrawler] 🔗 ${normalizedUrl}`);
    
    try {
      // Scrape the page with timeout
      const scrapedData = await scrapePage(normalizedUrl);
      
      if (!scrapedData) {
        errors.push(`${normalizedUrl}: Scrape failed or timed out`);
        continue;
      }
      
      if (scrapedData.error) {
        errors.push(`${normalizedUrl}: ${scrapedData.error}`);
        console.warn(`[MultiPageCrawler] ⚠️ Scrape error: ${scrapedData.error}`);
        continue;
      }
      
      // Extract path from URL
      const urlObj = new URL(normalizedUrl);
      const pagePath = urlObj.pathname || '/';
      const isHomePage = pagePath === '/' || pagePath === '';
      
      // Store page in database
      try {
        await db.insert(templatePages).values({
          templateId,
          url: normalizedUrl,
          path: pagePath,
          htmlContent: scrapedData.htmlContent,
          cssContent: scrapedData.cssContent || '',
          jsContent: scrapedData.jsContent || '',
          images: scrapedData.images as any,
          textContent: scrapedData.textContent as any,
          title: scrapedData.metadata?.title || 'Untitled',
          isHomePage,
          order: isHomePage ? 0 : pagesScraped + 1,
        });
        
        pagesScraped++;
        console.log(`[MultiPageCrawler] ✅ SAVED: ${pagePath} (${pagesScraped} total)`);
        
        // Update progress AFTER successful save
        onProgress?.(pagesScraped, Math.min(maxPages, pagesScraped + toVisit.length), normalizedUrl);
        
      } catch (dbError) {
        const errMsg = getErrorMessage(dbError);
        errors.push(`${normalizedUrl}: Database error - ${errMsg}`);
        console.error(`[MultiPageCrawler] ❌ DB Error: ${errMsg}`);
      }
      
      // Extract internal links
      if (depth < maxDepth && pagesScraped < maxPages && scrapedData.htmlContent) {
        try {
          const $ = cheerio.load(scrapedData.htmlContent);
          const newLinks: string[] = [];

          $('a[href]').each((_index, el) => {
            const href = $(el).attr('href');
            if (!href) return;

            try {
              const absoluteUrl = new URL(href, normalizedUrl).href;
              const absoluteUrlObj = new URL(absoluteUrl);

              // Only same-origin, non-visited, non-file URLs
              if (absoluteUrlObj.origin === baseOrigin) {
                const normalized = absoluteUrl.split('#')[0].replace(/\/$/, '') || absoluteUrl;
                if (!visitedUrls.has(normalized) &&
                    !newLinks.includes(normalized) &&
                    !shouldSkipUrl(normalized)) {
                  newLinks.push(normalized);
                }
              }
            } catch (_e) {
              // Invalid URL
            }
          });

          // Add to queue (limit to prevent explosion)
          const linksToAdd = newLinks.slice(0, 50); // Max 50 links per page
          for (const link of linksToAdd) {
            if (!visitedUrls.has(link) && toVisit.length < maxPages * 2) {
              toVisit.push({ url: link, depth: depth + 1 });
            }
          }

          if (newLinks.length > 0) {
            console.log(`[MultiPageCrawler] 🔍 Found ${newLinks.length} links, queued ${linksToAdd.length}`);
          }
        } catch (_parseError) {
          // Ignore parse errors
        }
      }
      
      // Brief delay between pages (0.5s instead of 2s)
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      errors.push(`${normalizedUrl}: ${errorMsg}`);
      console.error(`[MultiPageCrawler] ❌ Error: ${errorMsg}`);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[MultiPageCrawler] 🎉 CRAWL COMPLETE!`);
  console.log(`[MultiPageCrawler] ✅ Pages scraped: ${pagesScraped}`);
  console.log(`[MultiPageCrawler] ⚠️ Errors: ${errors.length}`);
  console.log(`[MultiPageCrawler] 📋 Queue remaining: ${toVisit.length}`);
  console.log(`${'='.repeat(60)}\n`);
  
  return { pagesScraped, errors };
}

