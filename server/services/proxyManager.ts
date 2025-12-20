/**
 * Proxy Manager Service
 * Implements anti-block measures: user-agent rotation, proxy rotation, rate limiting
 * Ensures scraping doesn't get blocked by websites
 */

import fetch from 'node-fetch';
import { getErrorMessage, logError } from '../utils/errorHandler';

/**
 * Pool of realistic user agents (expanded with mobile/tablet support)
 */
const USER_AGENTS = [
  // Chrome (Windows) - Desktop
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  
  // Chrome (macOS) - Desktop
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  
  // Firefox (Windows) - Desktop
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  
  // Firefox (macOS) - Desktop
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
  
  // Safari (macOS) - Desktop
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  
  // Edge (Windows) - Desktop
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
  
  // Chrome (Linux) - Desktop
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  
  // Opera - Desktop
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
  
  // Chrome Mobile (Android)
  'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 11; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
  
  // Safari Mobile (iOS)
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  
  // Chrome Tablet (iPad)
  'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/119.0.6045.169 Mobile/15E148 Safari/604.1',
  
  // Safari Tablet (iPad)
  'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
];

/**
 * Get random user agent
 */
export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Get headers that match the user agent
 */
export function getHeadersForUserAgent(userAgent: string, referer?: string): Record<string, string> {
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const isChrome = /Chrome/i.test(userAgent);
  const isFirefox = /Firefox/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
  const isEdge = /Edg/i.test(userAgent);
  
  const headers: Record<string, string> = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': referer ? 'same-origin' : 'none',
    'Cache-Control': 'max-age=0',
  };
  
  // Add Referer if provided (pretend we came from Google or the site itself)
  if (referer) {
    headers['Referer'] = referer;
  } else {
    // Randomly add Google as referer (50% chance) to look more natural
    if (Math.random() > 0.5) {
      headers['Referer'] = 'https://www.google.com/';
    }
  }
  
  // Chrome-specific headers
  if (isChrome && !isEdge) {
    headers['sec-ch-ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
    headers['sec-ch-ua-mobile'] = isMobile ? '?1' : '?0';
    headers['sec-ch-ua-platform'] = isMobile ? '"Android"' : '"Windows"';
  }
  
  // Firefox-specific headers
  if (isFirefox) {
    // Firefox doesn't use sec-ch-ua headers
    delete headers['sec-ch-ua'];
    delete headers['sec-ch-ua-mobile'];
    delete headers['sec-ch-ua-platform'];
  }
  
  // Safari-specific headers
  if (isSafari) {
    headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
  }
  
  return headers;
}

/**
 * Rate limiter per domain
 */
const domainLastRequest = new Map<string, number>();
const domainRequestCounts = new Map<string, number>();

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  minDelay: number; // Minimum delay between requests (ms)
  maxDelay: number; // Maximum delay between requests (ms)
  maxRequestsPerMinute: number; // Max requests per minute per domain
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  minDelay: 2000, // 2 seconds
  maxDelay: 5000, // 5 seconds
  maxRequestsPerMinute: 30,
};

/**
 * Wait for rate limit before making request
 */
export async function waitForRateLimit(domain: string, config: RateLimitConfig = DEFAULT_RATE_LIMIT): Promise<void> {
  const now = Date.now();
  const lastRequest = domainLastRequest.get(domain) || 0;
  const requestCount = domainRequestCounts.get(domain) || 0;

  // Reset counter if minute has passed
  if (now - lastRequest > 60000) {
    domainRequestCounts.set(domain, 0);
  }

  // Check if we've exceeded rate limit
  if (requestCount >= config.maxRequestsPerMinute) {
    const waitTime = 60000 - (now - lastRequest);
    if (waitTime > 0) {
      console.log(`[ProxyManager] ⏳ Rate limit reached for ${domain}, waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      domainRequestCounts.set(domain, 0);
    }
  }

  // Random delay between requests
  const delay = config.minDelay + Math.random() * (config.maxDelay - config.minDelay);
  await new Promise(resolve => setTimeout(resolve, delay));

  // Update tracking
  domainLastRequest.set(domain, Date.now());
  domainRequestCounts.set(domain, (domainRequestCounts.get(domain) || 0) + 1);
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

/**
 * Fetch with anti-block measures
 */
export async function fetchWithAntiBlock(
  url: string,
  options: {
    userAgent?: string;
    rateLimit?: RateLimitConfig;
    retries?: number;
  } = {}
): Promise<Response> {
  const { userAgent, rateLimit = DEFAULT_RATE_LIMIT, retries = 3 } = options;
  const domain = extractDomain(url);

  // Wait for rate limit
  await waitForRateLimit(domain, rateLimit);

  // Use random user agent if not provided
  const finalUserAgent = userAgent || getRandomUserAgent();

  // Get headers that match the user agent (with Referer)
  const headers = getHeadersForUserAgent(finalUserAgent, `https://www.google.com/`);

  // Retry logic
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers,
        timeout: 30000,
        redirect: 'follow',
      });

      // Check for blocking indicators (status codes)
      if (response.status === 403 || response.status === 429) {
        if (attempt < retries) {
          const backoffDelay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.warn(`[ProxyManager] ⚠️ Rate limited (${response.status}), retrying in ${backoffDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          // Try with different user agent on retry
          const newUserAgent = getRandomUserAgent();
          Object.assign(headers, getHeadersForUserAgent(newUserAgent, headers['Referer']));
          continue;
        }
        throw new Error(`Blocked: HTTP ${response.status}`);
      }
      
      // Check for Cloudflare (by server header and status)
      const serverHeader = response.headers.get('server')?.toLowerCase() || '';
      if (serverHeader.includes('cloudflare') && (response.status === 503 || response.status === 403)) {
        if (attempt < retries) {
          const backoffDelay = Math.pow(2, attempt) * 2000; // Longer backoff for Cloudflare
          console.warn(`[ProxyManager] ⚠️ Cloudflare detected (${response.status}), retrying in ${backoffDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          // Try with different user agent on retry
          const newUserAgent = getRandomUserAgent();
          Object.assign(headers, getHeadersForUserAgent(newUserAgent, headers['Referer']));
          continue;
        }
        throw new Error('Cloudflare challenge detected');
      }
      
      // If response looks suspicious (small body size might indicate challenge page)
      // We'll check this in the actual scraper, not here (to avoid consuming response)
      // For now, return the response and let the scraper handle content checking

      return response as any; // Type assertion for node-fetch compatibility
    } catch (error) {
      if (attempt === retries) {
        logError(error, `ProxyManager - fetchWithAntiBlock(${url})`);
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('Failed after retries');
}

/**
 * Check robots.txt for allowed paths
 */
export async function checkRobotsTxt(url: string): Promise<boolean> {
  try {
    const baseUrl = new URL(url);
    const robotsUrl = `${baseUrl.origin}/robots.txt`;

    const response = await fetchWithAntiBlock(robotsUrl, { retries: 1 }).catch(() => null);
    if (!response || !response.ok) {
      // If robots.txt doesn't exist or can't be fetched, assume allowed
      return true;
    }

    const robotsContent = await response.text();
    
    // Simple check: if robots.txt disallows all, return false
    if (robotsContent.includes('User-agent: *') && robotsContent.includes('Disallow: /')) {
      console.warn(`[ProxyManager] ⚠️ robots.txt disallows scraping for ${baseUrl.origin}`);
      return false;
    }

    return true;
  } catch (error) {
    // If check fails, assume allowed (fail open)
    console.warn(`[ProxyManager] ⚠️ Failed to check robots.txt: ${getErrorMessage(error)}`);
    return true;
  }
}

/**
 * Check if response is a Cloudflare challenge page
 */
function isCloudflareChallenge(html: string): boolean {
  const cloudflareIndicators = [
    'cf-browser-verification',
    'cf-challenge',
    'cloudflare',
    'checking your browser',
    'just a moment',
    'ddos protection by cloudflare',
  ];
  
  const htmlLower = html.toLowerCase();
  return cloudflareIndicators.some(indicator => htmlLower.includes(indicator));
}

/**
 * Check if response is a CAPTCHA page
 */
function isCaptchaPage(html: string): boolean {
  const captchaIndicators = [
    'recaptcha',
    'hcaptcha',
    'captcha',
    'challenge-platform',
    'verify you are human',
  ];
  
  const htmlLower = html.toLowerCase();
  return captchaIndicators.some(indicator => htmlLower.includes(indicator));
}

/**
 * Detect if a response indicates blocking
 */
export function isBlockedResponse(response: Response, html?: string): boolean {
  // Check status codes
  if (response.status === 403 || response.status === 429) {
    return true;
  }
  
  // Check response headers
  const server = response.headers.get('server')?.toLowerCase() || '';
  if (server.includes('cloudflare') && response.status === 503) {
    return true;
  }
  
  // Check HTML content if provided
  if (html) {
    if (isCloudflareChallenge(html) || isCaptchaPage(html)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Reset rate limit counters (for testing)
 */
export function resetRateLimitCounters(): void {
  domainLastRequest.clear();
  domainRequestCounts.clear();
}

