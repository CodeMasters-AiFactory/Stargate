/**
 * Pricing Intelligence Engine Service
 * 
 * Real-time competitor price monitoring:
 * - Track price changes across competitors
 * - Detect pricing patterns
 * - Generate competitive pricing reports
 * - Alert on price changes
 */

import { scrapeWebsiteFull } from './websiteScraper';
import { getErrorMessage, logError } from '../utils/errorHandler';
import * as cheerio from 'cheerio';

export interface PriceData {
  productName: string;
  price: number;
  currency: string;
  url: string;
  timestamp: Date;
  previousPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
}

export interface PricingIntelligence {
  url: string;
  products: PriceData[];
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  priceTrend: 'increasing' | 'decreasing' | 'stable';
  alerts: Array<{
    type: 'price_drop' | 'price_increase' | 'new_product' | 'out_of_stock';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

/**
 * Analyze pricing intelligence
 */
export async function analyzePricingIntelligence(
  url: string,
  previousData?: PricingIntelligence
): Promise<PricingIntelligence> {
  try {
    console.log(`[Pricing Intelligence] Analyzing ${url}`);

    const scrapedData = await scrapeWebsiteFull(url);

    if (scrapedData.error) {
      throw new Error(`Failed to scrape: ${scrapedData.error}`);
    }

    const $ = cheerio.load(scrapedData.htmlContent);

    // Extract products and prices
    const products = extractProducts($, url);

    // Calculate statistics
    const prices = products.map(p => p.price).filter(p => p > 0);
    const averagePrice = prices.length > 0
      ? prices.reduce((sum, p) => sum + p, 0) / prices.length
      : 0;

    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    };

    // Compare with previous data
    const alerts: PricingIntelligence['alerts'] = [];
    let priceTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';

    if (previousData) {
      const previousAvg = previousData.averagePrice;
      const currentAvg = averagePrice;

      if (currentAvg > previousAvg * 1.05) {
        priceTrend = 'increasing';
        alerts.push({
          type: 'price_increase',
          message: `Average price increased by ${((currentAvg / previousAvg - 1) * 100).toFixed(1)}%`,
          severity: 'medium',
        });
      } else if (currentAvg < previousAvg * 0.95) {
        priceTrend = 'decreasing';
        alerts.push({
          type: 'price_drop',
          message: `Average price decreased by ${((1 - currentAvg / previousAvg) * 100).toFixed(1)}%`,
          severity: 'high',
        });
      }

      // Check for new products
      const previousProductNames = new Set(previousData.products.map(p => p.productName));
      const newProducts = products.filter(p => !previousProductNames.has(p.productName));

      if (newProducts.length > 0) {
        alerts.push({
          type: 'new_product',
          message: `${newProducts.length} new product(s) detected`,
          severity: 'low',
        });
      }

      // Update price changes
      products.forEach(product => {
        const previousProduct = previousData.products.find(
          p => p.productName === product.productName
        );

        if (previousProduct) {
          product.previousPrice = previousProduct.price;
          product.priceChange = product.price - previousProduct.price;
          product.priceChangePercent = (product.priceChange / previousProduct.price) * 100;

          if (product.priceChangePercent < -10) {
            alerts.push({
              type: 'price_drop',
              message: `${product.productName} dropped by ${Math.abs(product.priceChangePercent).toFixed(1)}%`,
              severity: 'high',
            });
          }
        }
      });
    }

    return {
      url,
      products,
      averagePrice,
      priceRange,
      priceTrend,
      alerts,
    };
  } catch (error) {
    logError(error, 'Pricing Intelligence');
    throw new Error(`Pricing intelligence failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Extract products and prices from HTML
 */
function extractProducts($: cheerio.CheerioAPI, baseUrl: string): PriceData[] {
  const products: PriceData[] = [];
  const productPattern = /product|item|card|listing/i;

  // Try common e-commerce selectors
  const productSelectors = [
    '.product',
    '.product-item',
    '.product-card',
    '[data-product]',
    '.item',
    '.listing',
  ];

  productSelectors.forEach(selector => {
    $(selector).each((_, el) => {
      const $el = $(el);
      const productName = $el.find('h1, h2, h3, .title, .name, [data-name]').first().text().trim();
      const priceText = $el.find('.price, .cost, [data-price], .amount').first().text().trim();
      const price = extractPrice(priceText);

      if (productName && price > 0) {
        const productUrl = $el.find('a').attr('href') || baseUrl;
        const absoluteUrl = productUrl.startsWith('http') ? productUrl : new URL(productUrl, baseUrl).href;

        products.push({
          productName,
          price,
          currency: 'USD', // Would need to detect
          url: absoluteUrl,
          timestamp: new Date(),
        });
      }
    });
  });

  // If no products found, try to extract any prices
  if (products.length === 0) {
    const pricePattern = /\$(\d+(?:\.\d{2})?)/g;
    const bodyText = $('body').text();
    const matches = bodyText.match(pricePattern);

    if (matches) {
      matches.slice(0, 10).forEach((match, index) => {
        const price = parseFloat(match.replace('$', ''));
        if (price > 0 && price < 100000) {
          products.push({
            productName: `Product ${index + 1}`,
            price,
            currency: 'USD',
            url: baseUrl,
            timestamp: new Date(),
          });
        }
      });
    }
  }

  return products;
}

/**
 * Extract price from text
 */
function extractPrice(text: string): number {
  const pricePattern = /[\$€£]?(\d+(?:\.\d{2})?)/;
  const match = text.match(pricePattern);
  return match ? parseFloat(match[1]) : 0;
}

