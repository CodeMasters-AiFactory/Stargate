/**
 * Website Revenue Estimator Service
 * 
 * AI estimates website revenue:
 * - Traffic analysis (via SimilarWeb-style estimation)
 * - Ad revenue calculation
 * - E-commerce sales estimation
 * - Competitor revenue comparison
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import OpenAI from 'openai';
import { getErrorMessage, logError } from '../utils/errorHandler';
import * as cheerio from 'cheerio';

const openaiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openai = openaiKey
  ? new OpenAI({
      apiKey: openaiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    })
  : null;

export interface RevenueEstimate {
  url: string;
  estimatedMonthlyRevenue: number;
  estimatedAnnualRevenue: number;
  revenueSources: {
    ecommerce?: number;
    advertising?: number;
    subscriptions?: number;
    other?: number;
  };
  confidence: number; // 0-100
  methodology: string;
  factors: {
    trafficEstimate?: number;
    conversionRate?: number;
    averageOrderValue?: number;
    adRevenuePerVisitor?: number;
  };
}

/**
 * Estimate website revenue
 */
export async function estimateWebsiteRevenue(url: string): Promise<RevenueEstimate> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log(`[Revenue Estimator] Analyzing ${url}`);

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const html = await page.content();
    const $ = cheerio.load(html);

    // Detect website type
    const isEcommerce = detectEcommerce($);
    const hasAds = detectAds($);
    const hasSubscriptions = detectSubscriptions($);

    // Extract pricing information
    const prices = extractPrices($);
    const averagePrice = prices.length > 0
      ? prices.reduce((sum, p) => sum + p, 0) / prices.length
      : 0;

    // Build context for AI
    const context = `
Website Analysis:
- URL: ${url}
- Type: ${isEcommerce ? 'E-commerce' : hasAds ? 'Content/Media' : 'Other'}
- Has Ads: ${hasAds}
- Has Subscriptions: ${hasSubscriptions}
- Products Found: ${prices.length}
- Average Price: $${averagePrice.toFixed(2)}
- Page Title: ${$('title').text()}
- Meta Description: ${$('meta[name="description"]').attr('content') || 'N/A'}

Content Sample:
${$('body').text().substring(0, 2000)}
`;

    if (openai) {
      const prompt = `Estimate the monthly and annual revenue for this website.

${context}

Consider:
1. Traffic estimates (if e-commerce, estimate based on typical conversion rates)
2. E-commerce revenue (products × average price × estimated conversions)
3. Ad revenue (if ads present, estimate CPM/RPM)
4. Subscription revenue (if subscriptions present)

Return JSON:
{
  "estimatedMonthlyRevenue": number in USD,
  "estimatedAnnualRevenue": number in USD,
  "revenueSources": {
    "ecommerce": number,
    "advertising": number,
    "subscriptions": number,
    "other": number
  },
  "confidence": 0-100,
  "methodology": "how you calculated",
  "factors": {
    "trafficEstimate": number,
    "conversionRate": 0.01-0.05,
    "averageOrderValue": number,
    "adRevenuePerVisitor": 0.01-0.10
  }
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at estimating website revenue based on traffic, business model, and industry benchmarks.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 800,
        temperature: 0.2,
      });

      const estimate: RevenueEstimate = JSON.parse(response.choices[0].message.content || '{}');
      estimate.url = url;

      return estimate;
    }

    // Fallback: simple estimation
    let monthlyRevenue = 0;

    if (isEcommerce && prices.length > 0) {
      // Estimate: 1000 visitors/month × 2% conversion × $50 avg order
      monthlyRevenue = 1000 * 0.02 * averagePrice;
    } else if (hasAds) {
      // Estimate: 10,000 visitors/month × $0.05 RPM
      monthlyRevenue = 10000 * 0.05;
    }

    return {
      url,
      estimatedMonthlyRevenue: monthlyRevenue,
      estimatedAnnualRevenue: monthlyRevenue * 12,
      revenueSources: {
        ecommerce: isEcommerce ? monthlyRevenue : 0,
        advertising: hasAds ? monthlyRevenue : 0,
      },
      confidence: 30,
      methodology: 'Simple estimation based on website type',
      factors: {
        trafficEstimate: isEcommerce ? 1000 : 10000,
        conversionRate: isEcommerce ? 0.02 : undefined,
        averageOrderValue: isEcommerce ? averagePrice : undefined,
        adRevenuePerVisitor: hasAds ? 0.05 : undefined,
      },
    };
  } catch (error) {
    logError(error, 'Revenue Estimator');
    throw new Error(`Revenue estimation failed: ${getErrorMessage(error)}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Detect if site is e-commerce
 */
function detectEcommerce($: cheerio.CheerioAPI): boolean {
  const ecommerceIndicators = [
    'cart', 'checkout', 'add to cart', 'buy now', 'shop', 'store',
    'product', 'price', '$', '€', '£', 'purchase',
  ];

  const bodyText = $('body').text().toLowerCase();
  return ecommerceIndicators.some(indicator => bodyText.includes(indicator));
}

/**
 * Detect if site has ads
 */
function detectAds($: cheerio.CheerioAPI): boolean {
  const adIndicators = [
    'googleads', 'adsense', 'doubleclick', 'advertisement',
    'banner', 'sponsor', 'ad-', 'ads-',
  ];

  const html = $.html().toLowerCase();
  return adIndicators.some(indicator => html.includes(indicator));
}

/**
 * Detect if site has subscriptions
 */
function detectSubscriptions($: cheerio.CheerioAPI): boolean {
  const subscriptionIndicators = [
    'subscribe', 'subscription', 'membership', 'premium',
    'monthly', 'annual', 'plan', 'pricing',
  ];

  const bodyText = $('body').text().toLowerCase();
  return subscriptionIndicators.some(indicator => bodyText.includes(indicator));
}

/**
 * Extract prices from page
 */
function extractPrices($: cheerio.CheerioAPI): number[] {
  const prices: number[] = [];
  const pricePattern = /\$(\d+(?:\.\d{2})?)/g;

  $('body').text().match(pricePattern)?.forEach(match => {
    const price = parseFloat(match.replace('$', ''));
    if (price > 0 && price < 100000) { // Reasonable range
      prices.push(price);
    }
  });

  return prices;
}

