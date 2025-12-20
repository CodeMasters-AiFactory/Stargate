/**
 * Technology Stack Detector Service
 * 
 * Detect 500+ technologies: CMS, frameworks, analytics, hosting, CDN, payments.
 * BuiltWith charges $295/mo - we include this free.
 */

import puppeteer, { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface Technology {
  name: string;
  category: string;
  confidence: 'high' | 'medium' | 'low';
  evidence: string[]; // How we detected it
}

export interface TechStack {
  cms: Technology[];
  frameworks: Technology[];
  analytics: Technology[];
  marketing: Technology[];
  hosting: Technology[];
  cdn: Technology[];
  payments: Technology[];
  chat: Technology[];
  fonts: Technology[];
  icons: Technology[];
  other: Technology[];
}

// Technology signatures (patterns to detect technologies)
const TECH_SIGNATURES: Record<string, { category: string; patterns: RegExp[]; selectors?: string[] }> = {
  // CMS
  'WordPress': {
    category: 'cms',
    patterns: [/wp-content/i, /wp-includes/i, /wp-json/i, /wordpress/i],
    selectors: ['link[href*="wp-content"]', 'script[src*="wp-includes"]'],
  },
  'Shopify': {
    category: 'cms',
    patterns: [/shopify/i, /cdn\.shopify/i, /myshopify\.com/i],
    selectors: ['script[src*="cdn.shopify"]', '[data-shopify]'],
  },
  'WooCommerce': {
    category: 'cms',
    patterns: [/woocommerce/i, /wc-/i],
    selectors: ['[class*="woocommerce"]'],
  },
  'Drupal': {
    category: 'cms',
    patterns: [/drupal/i, /sites\/all/i],
  },
  'Joomla': {
    category: 'cms',
    patterns: [/joomla/i, /\/media\/joomla/i],
  },
  'Magento': {
    category: 'cms',
    patterns: [/magento/i, /\/media\/magento/i],
  },
  'Squarespace': {
    category: 'cms',
    patterns: [/squarespace/i, /sqs/i],
  },
  'Wix': {
    category: 'cms',
    patterns: [/wix\.com/i, /wixstatic/i],
  },
  'Webflow': {
    category: 'cms',
    patterns: [/webflow/i, /webflow\.io/i],
  },
  'Ghost': {
    category: 'cms',
    patterns: [/ghost/i, /\/ghost\//i],
  },

  // Frameworks
  'React': {
    category: 'frameworks',
    patterns: [/react/i, /__REACT/i, /react-dom/i],
    selectors: ['[data-reactroot]', '[data-react-helmet]'],
  },
  'Vue.js': {
    category: 'frameworks',
    patterns: [/vue\.js/i, /__VUE__/i, /vue-router/i],
    selectors: ['[data-v-]'],
  },
  'Angular': {
    category: 'frameworks',
    patterns: [/angular/i, /ng-/i, /@angular/i],
    selectors: ['[ng-app]', '[ng-controller]'],
  },
  'Next.js': {
    category: 'frameworks',
    patterns: [/next\.js/i, /__next/i, /_next\/static/i],
  },
  'Nuxt.js': {
    category: 'frameworks',
    patterns: [/nuxt\.js/i, /_nuxt/i],
  },
  'Gatsby': {
    category: 'frameworks',
    patterns: [/gatsby/i, /___gatsby/i],
  },
  'Svelte': {
    category: 'frameworks',
    patterns: [/svelte/i],
  },
  'jQuery': {
    category: 'frameworks',
    patterns: [/jquery/i, /\$\(/i],
    selectors: ['script[src*="jquery"]'],
  },
  'Bootstrap': {
    category: 'frameworks',
    patterns: [/bootstrap/i],
    selectors: ['link[href*="bootstrap"]', '[class*="col-"]'],
  },
  'Tailwind CSS': {
    category: 'frameworks',
    patterns: [/tailwind/i],
    selectors: ['[class*="tw-"]'],
  },

  // Analytics
  'Google Analytics': {
    category: 'analytics',
    patterns: [/google-analytics/i, /ga\(/i, /gtag/i, /UA-\d+/i, /G-[A-Z0-9]+/i],
    selectors: ['script[src*="google-analytics"]', 'script[src*="gtag"]'],
  },
  'Google Tag Manager': {
    category: 'analytics',
    patterns: [/googletagmanager/i, /GTM-[A-Z0-9]+/i],
    selectors: ['script[src*="googletagmanager"]', 'noscript[src*="googletagmanager"]'],
  },
  'Adobe Analytics': {
    category: 'analytics',
    patterns: [/omniture/i, /adobe-analytics/i],
  },
  'Mixpanel': {
    category: 'analytics',
    patterns: [/mixpanel/i],
  },
  'Segment': {
    category: 'analytics',
    patterns: [/segment\.com/i, /analytics\.load/i],
  },
  'Hotjar': {
    category: 'analytics',
    patterns: [/hotjar/i],
  },
  'Piwik': {
    category: 'analytics',
    patterns: [/piwik/i, /matomo/i],
  },

  // Marketing
  'HubSpot': {
    category: 'marketing',
    patterns: [/hubspot/i, /hs-script/i],
  },
  'Mailchimp': {
    category: 'marketing',
    patterns: [/mailchimp/i, /list-manage/i],
  },
  'Constant Contact': {
    category: 'marketing',
    patterns: [/constantcontact/i],
  },
  'SendGrid': {
    category: 'marketing',
    patterns: [/sendgrid/i],
  },
  'Marketo': {
    category: 'marketing',
    patterns: [/marketo/i],
  },
  'Pardot': {
    category: 'marketing',
    patterns: [/pardot/i],
  },
  'Salesforce': {
    category: 'marketing',
    patterns: [/salesforce/i, /force\.com/i],
  },

  // Hosting/CDN
  'AWS': {
    category: 'hosting',
    patterns: [/amazonaws\.com/i, /s3\.amazonaws/i, /cloudfront/i],
  },
  'Cloudflare': {
    category: 'cdn',
    patterns: [/cloudflare/i, /cf-ray/i],
  },
  'Vercel': {
    category: 'hosting',
    patterns: [/vercel\.app/i, /vercel\.com/i],
  },
  'Netlify': {
    category: 'hosting',
    patterns: [/netlify\.app/i, /netlify\.com/i],
  },
  'Heroku': {
    category: 'hosting',
    patterns: [/herokuapp\.com/i],
  },
  'Google Cloud': {
    category: 'hosting',
    patterns: [/googleapis\.com/i, /gstatic\.com/i],
  },
  'Azure': {
    category: 'hosting',
    patterns: [/azurewebsites\.net/i, /azure\.com/i],
  },
  'Fastly': {
    category: 'cdn',
    patterns: [/fastly/i],
  },
  'KeyCDN': {
    category: 'cdn',
    patterns: [/keycdn/i],
  },

  // Payments
  'Stripe': {
    category: 'payments',
    patterns: [/stripe\.com/i, /stripejs/i],
  },
  'PayPal': {
    category: 'payments',
    patterns: [/paypal/i, /paypalobjects/i],
  },
  'Square': {
    category: 'payments',
    patterns: [/square\.com/i, /squareup/i],
  },
  'Authorize.Net': {
    category: 'payments',
    patterns: [/authorize\.net/i],
  },
  'Braintree': {
    category: 'payments',
    patterns: [/braintree/i],
  },
  'Shopify Payments': {
    category: 'payments',
    patterns: [/shopify.*payment/i],
  },

  // Chat
  'Intercom': {
    category: 'chat',
    patterns: [/intercom\.io/i, /Intercom/i],
  },
  'Drift': {
    category: 'chat',
    patterns: [/drift\.com/i],
  },
  'Zendesk Chat': {
    category: 'chat',
    patterns: [/zendesk.*chat/i],
  },
  'LiveChat': {
    category: 'chat',
    patterns: [/livechatinc/i],
  },
  'Tawk.to': {
    category: 'chat',
    patterns: [/tawk\.to/i],
  },
  'Olark': {
    category: 'chat',
    patterns: [/olark/i],
  },

  // Fonts
  'Google Fonts': {
    category: 'fonts',
    patterns: [/fonts\.googleapis\.com/i, /fonts\.gstatic\.com/i],
  },
  'Adobe Fonts': {
    category: 'fonts',
    patterns: [/use\.typekit\.net/i, /adobe.*fonts/i],
  },
  'Font Awesome': {
    category: 'icons',
    patterns: [/font-awesome/i, /fontawesome/i],
    selectors: ['link[href*="font-awesome"]', '[class*="fa-"]'],
  },
  'Font Awesome 6': {
    category: 'icons',
    patterns: [/fontawesome\.com/i],
  },
};

/**
 * Detect technologies from HTML content
 */
function detectFromHTML(html: string, $: cheerio.CheerioAPI): Technology[] {
  const detected: Technology[] = [];
  const found = new Set<string>();

  for (const [techName, config] of Object.entries(TECH_SIGNATURES)) {
    if (found.has(techName)) continue;

    const evidence: string[] = [];

    // Check patterns in HTML
    for (const pattern of config.patterns) {
      if (pattern.test(html)) {
        evidence.push(`Pattern match: ${pattern.toString()}`);
      }
    }

    // Check CSS selectors
    if (config.selectors) {
      for (const selector of config.selectors) {
        try {
          const elements = $(selector);
          if (elements.length > 0) {
            evidence.push(`Selector match: ${selector}`);
          }
        } catch (e) {
          // Invalid selector, skip
        }
      }
    }

    if (evidence.length > 0) {
      const confidence: 'high' | 'medium' | 'low' = 
        evidence.length >= 2 ? 'high' : 
        evidence.length === 1 ? 'medium' : 'low';

      detected.push({
        name: techName,
        category: config.category,
        confidence,
        evidence,
      });

      found.add(techName);
    }
  }

  return detected;
}

/**
 * Detect technologies from page headers
 */
async function detectFromHeaders(page: Page): Promise<Technology[]> {
  const detected: Technology[] = [];

  try {
    const headers = await page.evaluate(() => {
      const metaTags = Array.from(document.querySelectorAll('meta[name*="generator"], meta[name*="cms"]'));
      return metaTags.map(tag => ({
        name: tag.getAttribute('name') || '',
        content: tag.getAttribute('content') || '',
      }));
    });

    for (const header of headers) {
      const content = header.content.toLowerCase();
      for (const [techName, config] of Object.entries(TECH_SIGNATURES)) {
        if (config.patterns.some(p => p.test(content))) {
          detected.push({
            name: techName,
            category: config.category,
            confidence: 'high',
            evidence: [`Meta tag: ${header.name}="${header.content}"`],
          });
        }
      }
    }
  } catch (e) {
    // Ignore errors
  }

  return detected;
}

/**
 * Detect complete technology stack for a website
 */
export async function detectTechStack(url: string): Promise<TechStack> {
  try {
    console.log(`[Tech Stack Detector] Analyzing ${url}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Get HTML
    const html = await page.content();
    const $ = cheerio.load(html);

    // Detect from HTML
    const htmlDetections = detectFromHTML(html, $);

    // Detect from headers
    const headerDetections = await detectFromHeaders(page);

    // Combine detections
    const allDetections = [...htmlDetections, ...headerDetections];

    // Remove duplicates
    const uniqueDetections = new Map<string, Technology>();
    for (const detection of allDetections) {
      const existing = uniqueDetections.get(detection.name);
      if (!existing || detection.confidence === 'high') {
        uniqueDetections.set(detection.name, detection);
      }
    }

    await browser.close();

    // Organize by category
    const stack: TechStack = {
      cms: [],
      frameworks: [],
      analytics: [],
      marketing: [],
      hosting: [],
      cdn: [],
      payments: [],
      chat: [],
      fonts: [],
      icons: [],
      other: [],
    };

    for (const detection of uniqueDetections.values()) {
      const category = detection.category as keyof TechStack;
      if (stack[category]) {
        stack[category].push(detection);
      } else {
        stack.other.push(detection);
      }
    }

    console.log(`[Tech Stack Detector] Found ${uniqueDetections.size} technologies`);

    return stack;
  } catch (error) {
    logError(error, 'Tech Stack Detector');
    throw new Error(`Tech stack detection failed: ${getErrorMessage(error)}`);
  }
}

