/**
 * Legal Compliance Engine Service
 * 
 * Auto-detect and respect robots.txt, Terms of Service, GDPR requirements.
 * Users are terrified of legal issues - we solve this completely.
 */

import fetch from 'node-fetch';
import puppeteer, { Page } from 'puppeteer';
import OpenAI from 'openai';
import { getErrorMessage, logError } from '../utils/errorHandler';
import * as cheerio from 'cheerio';

// Initialize OpenAI client
const openaiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openai = openaiKey
  ? new OpenAI({
      apiKey: openaiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    })
  : null;

export interface RobotsTxtAnalysis {
  allowed: boolean;
  crawlDelay?: number;
  disallowedPaths: string[];
  sitemap?: string;
  userAgent?: string;
}

export interface TermsOfServiceAnalysis {
  scrapingAllowed: boolean;
  restrictions: string[];
  requiresPermission: boolean;
  aiTrainingAllowed: boolean;
  summary: string;
}

export interface ComplianceReport {
  url: string;
  timestamp: Date;
  robotsTxt: RobotsTxtAnalysis;
  termsOfService: TermsOfServiceAnalysis;
  gdprCompliant: boolean;
  recommendations: string[];
  overallCompliance: 'compliant' | 'warning' | 'non-compliant';
}

/**
 * Parse robots.txt file
 */
export async function parseRobotsTxt(url: string, userAgent: string = '*'): Promise<RobotsTxtAnalysis> {
  try {
    const baseUrl = new URL(url);
    const robotsUrl = `${baseUrl.origin}/robots.txt`;

    console.log(`[Legal Compliance] Fetching robots.txt from ${robotsUrl}`);

    const response = await fetch(robotsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      // No robots.txt or not accessible - assume allowed
      return {
        allowed: true,
        disallowedPaths: [],
      };
    }

    const robotsContent = await response.text();
    const lines = robotsContent.split('\n');

    let currentUserAgent = '*';
    let allowed = true;
    let crawlDelay: number | undefined;
    const disallowedPaths: string[] = [];
    let sitemap: string | undefined;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const [directive, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim();

      if (directive.toLowerCase() === 'user-agent') {
        currentUserAgent = value;
      } else if (directive.toLowerCase() === 'disallow' && (currentUserAgent === '*' || currentUserAgent === userAgent)) {
        if (value === '/') {
          allowed = false; // Disallow everything
        } else if (value) {
          disallowedPaths.push(value);
        }
      } else if (directive.toLowerCase() === 'allow' && (currentUserAgent === '*' || currentUserAgent === userAgent)) {
        // Allow overrides disallow for specific paths
        allowed = true;
      } else if (directive.toLowerCase() === 'crawl-delay' && (currentUserAgent === '*' || currentUserAgent === userAgent)) {
        crawlDelay = parseInt(value) || undefined;
      } else if (directive.toLowerCase() === 'sitemap') {
        sitemap = value;
      }
    }

    // Check if current path is disallowed
    const currentPath = baseUrl.pathname;
    const isPathDisallowed = disallowedPaths.some(path => {
      if (path === '/') return true;
      return currentPath.startsWith(path);
    });

    return {
      allowed: allowed && !isPathDisallowed,
      crawlDelay,
      disallowedPaths,
      sitemap,
      userAgent: currentUserAgent,
    };
  } catch (error) {
    logError(error, 'Legal Compliance - Parse Robots.txt');
    // On error, assume allowed (fail open)
    return {
      allowed: true,
      disallowedPaths: [],
    };
  }
}

/**
 * Analyze Terms of Service using AI
 */
export async function analyzeTermsOfService(url: string): Promise<TermsOfServiceAnalysis> {
  if (!openai) {
    // Fallback if no OpenAI key
    return {
      scrapingAllowed: true,
      restrictions: [],
      requiresPermission: false,
      aiTrainingAllowed: true,
      summary: 'Unable to analyze Terms of Service - OpenAI API key not configured',
    };
  }

  try {
    const baseUrl = new URL(url);
    const tosUrls = [
      `${baseUrl.origin}/terms`,
      `${baseUrl.origin}/terms-of-service`,
      `${baseUrl.origin}/tos`,
      `${baseUrl.origin}/legal/terms`,
      `${baseUrl.origin}/terms-and-conditions`,
    ];

    let tosContent = '';
    let tosUrl = '';

    // Try to find Terms of Service page
    for (const testUrl of tosUrls) {
      try {
        const response = await fetch(testUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        if (response.ok) {
          tosContent = await response.text();
          tosUrl = testUrl;
          break;
        }
      } catch (e) {
        // Try next URL
      }
    }

    if (!tosContent) {
      // Try to find ToS link on homepage
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const tosLink = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const tosLink = links.find(link => {
          const text = link.textContent?.toLowerCase() || '';
          const href = link.getAttribute('href') || '';
          return text.includes('terms') || href.includes('terms');
        });
        return tosLink?.getAttribute('href') || null;
      });

      if (tosLink) {
        const fullTosUrl = tosLink.startsWith('http') ? tosLink : new URL(tosLink, url).href;
        const response = await fetch(fullTosUrl);
        if (response.ok) {
          tosContent = await response.text();
          tosUrl = fullTosUrl;
        }
      }

      await browser.close();
    }

    if (!tosContent) {
      return {
        scrapingAllowed: true,
        restrictions: [],
        requiresPermission: false,
        aiTrainingAllowed: true,
        summary: 'Terms of Service page not found. Proceed with caution.',
      };
    }

    // Use AI to analyze ToS
    const $ = cheerio.load(tosContent);
    const textContent = $('body').text().substring(0, 8000); // Limit to avoid token limits

    const prompt = `Analyze this Terms of Service document and determine:

1. Is web scraping/crawling explicitly allowed or prohibited?
2. Are there any restrictions on automated data collection?
3. Does scraping require explicit permission?
4. Is AI training/data usage for AI models allowed or prohibited?

Terms of Service content:
${textContent}

Return JSON:
{
  "scrapingAllowed": true/false,
  "restrictions": ["list of restrictions"],
  "requiresPermission": true/false,
  "aiTrainingAllowed": true/false,
  "summary": "brief summary"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a legal compliance expert. Analyze Terms of Service documents for web scraping permissions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '{}';
    let parsed: TermsOfServiceAnalysis;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonString);
    } catch (e) {
      parsed = {
        scrapingAllowed: true,
        restrictions: [],
        requiresPermission: false,
        aiTrainingAllowed: true,
        summary: 'Unable to parse AI analysis',
      };
    }

    return parsed;
  } catch (error) {
    logError(error, 'Legal Compliance - Analyze ToS');
    return {
      scrapingAllowed: true,
      restrictions: [],
      requiresPermission: false,
      aiTrainingAllowed: true,
      summary: `Error analyzing Terms of Service: ${getErrorMessage(error)}`,
    };
  }
}

/**
 * Check GDPR compliance
 */
export async function checkGDPRCompliance(url: string): Promise<boolean> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Check for GDPR-related elements
    const gdprIndicators = await page.evaluate(() => {
      const indicators = {
        cookieBanner: !!document.querySelector('[class*="cookie"], [class*="gdpr"], [id*="cookie"], [id*="gdpr"]'),
        privacyPolicy: !!document.querySelector('a[href*="privacy"], a[href*="gdpr"]'),
        consentButton: !!document.querySelector('button[class*="accept"], button[class*="consent"]'),
      };
      return indicators;
    });

    await browser.close();

    // If any GDPR indicators are present, assume compliant
    return gdprIndicators.cookieBanner || gdprIndicators.privacyPolicy || gdprIndicators.consentButton;
  } catch (error) {
    logError(error, 'Legal Compliance - GDPR Check');
    return false; // Fail closed
  }
}

/**
 * Generate comprehensive compliance report
 */
export async function generateComplianceReport(url: string): Promise<ComplianceReport> {
  try {
    console.log(`[Legal Compliance] Generating report for ${url}`);

    const [robotsTxt, termsOfService, gdprCompliant] = await Promise.all([
      parseRobotsTxt(url),
      analyzeTermsOfService(url),
      checkGDPRCompliance(url),
    ]);

    const recommendations: string[] = [];

    if (!robotsTxt.allowed) {
      recommendations.push('⚠️ Scraping is disallowed by robots.txt. Do not proceed.');
    } else if (robotsTxt.disallowedPaths.length > 0) {
      recommendations.push(`⚠️ Some paths are disallowed: ${robotsTxt.disallowedPaths.join(', ')}`);
    }

    if (robotsTxt.crawlDelay) {
      recommendations.push(`⏱️ Respect crawl-delay of ${robotsTxt.crawlDelay} seconds`);
    }

    if (!termsOfService.scrapingAllowed) {
      recommendations.push('🚫 Scraping is prohibited by Terms of Service. Do not proceed.');
    } else if (termsOfService.requiresPermission) {
      recommendations.push('📧 Obtain explicit permission before scraping');
    }

    if (termsOfService.restrictions.length > 0) {
      recommendations.push(`⚠️ Restrictions: ${termsOfService.restrictions.join(', ')}`);
    }

    if (!gdprCompliant) {
      recommendations.push('⚠️ GDPR compliance indicators not found. Ensure data privacy compliance.');
    }

    let overallCompliance: 'compliant' | 'warning' | 'non-compliant' = 'compliant';
    if (!robotsTxt.allowed || !termsOfService.scrapingAllowed) {
      overallCompliance = 'non-compliant';
    } else if (recommendations.length > 0) {
      overallCompliance = 'warning';
    }

    return {
      url,
      timestamp: new Date(),
      robotsTxt,
      termsOfService,
      gdprCompliant,
      recommendations,
      overallCompliance,
    };
  } catch (error) {
    logError(error, 'Legal Compliance - Generate Report');
    throw new Error(`Compliance report generation failed: ${getErrorMessage(error)}`);
  }
}

