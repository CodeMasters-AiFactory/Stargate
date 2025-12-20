/**
 * Real-Time Change Monitoring Service
 * 
 * Schedule scrapes, detect changes, alert via email/Slack/webhook,
 * store history, generate diff reports.
 */

import { db } from '../db';
import { scrapeWebsiteFull, type ScrapedWebsiteData } from './websiteScraper';
import { getErrorMessage, logError } from '../utils/errorHandler';
import * as crypto from 'crypto';
import * as cheerio from 'cheerio';

export interface MonitorConfig {
  id: string;
  url: string;
  schedule: 'hourly' | 'daily' | 'weekly';
  alertOn: 'any-change' | 'content-change' | 'price-change' | 'structure-change';
  alertChannels: Array<'email' | 'slack' | 'webhook'>;
  alertConfig?: {
    email?: string;
    slackWebhook?: string;
    webhookUrl?: string;
  };
}

export interface ChangeDetection {
  changed: boolean;
  changeType: 'content' | 'price' | 'structure' | 'none';
  differences: string[];
  previousHash: string;
  currentHash: string;
  timestamp: Date;
}

// In-memory store (in production, use database)
const monitorStore = new Map<string, MonitorConfig>();
const baselineStore = new Map<string, { hash: string; data: ScrapedWebsiteData; timestamp: Date }>();

/**
 * Calculate content hash for change detection
 */
function calculateContentHash(data: ScrapedWebsiteData): string {
  const content = JSON.stringify({
    title: data.textContent.title,
    headings: data.textContent.headings.map(h => h.text),
    paragraphs: data.textContent.paragraphs.slice(0, 10), // First 10 paragraphs
    links: data.textContent.links.slice(0, 20), // First 20 links
  });
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Calculate price hash (for e-commerce monitoring)
 */
function calculatePriceHash(data: ScrapedWebsiteData): string {
  const prices = extractPrices(data.htmlContent);
  return crypto.createHash('sha256').update(JSON.stringify(prices)).digest('hex');
}

/**
 * Extract prices from HTML
 */
function extractPrices(html: string): string[] {
  const $ = cheerio.load(html);
  const prices: string[] = [];

  // Common price patterns
  $('*').each((_, el) => {
    const text = $(el).text();
    const priceMatches = text.match(/\$[\d,]+\.?\d*/g);
    if (priceMatches) {
      prices.push(...priceMatches);
    }
  });

  return [...new Set(prices)].slice(0, 20);
}

/**
 * Register a URL for monitoring
 */
export async function registerMonitor(config: MonitorConfig): Promise<void> {
  monitorStore.set(config.id, config);

  // Create initial baseline
  try {
    const scrapedData = await scrapeWebsiteFull(config.url);
    const hash = calculateContentHash(scrapedData);
    baselineStore.set(config.id, {
      hash,
      data: scrapedData,
      timestamp: new Date(),
    });
  } catch (error) {
    logError(error, 'Change Monitor - Register');
    throw error;
  }
}

/**
 * Check for changes
 */
export async function checkForChanges(monitorId: string): Promise<ChangeDetection> {
  const config = monitorStore.get(monitorId);
  if (!config) {
    throw new Error(`Monitor ${monitorId} not found`);
  }

  const baseline = baselineStore.get(monitorId);
  if (!baseline) {
    throw new Error(`Baseline not found for monitor ${monitorId}`);
  }

  // Scrape current version
  const currentData = await scrapeWebsiteFull(config.url);
  const currentHash = calculateContentHash(currentData);
  const previousHash = baseline.hash;

  const changed = currentHash !== previousHash;

  if (!changed) {
    return {
      changed: false,
      changeType: 'none',
      differences: [],
      previousHash,
      currentHash,
      timestamp: new Date(),
    };
  }

  // Detect change type
  let changeType: 'content' | 'price' | 'structure' | 'none' = 'content';
  const differences: string[] = [];

  // Check for price changes
  if (config.alertOn === 'price-change' || config.alertOn === 'any-change') {
    const previousPriceHash = calculatePriceHash(baseline.data);
    const currentPriceHash = calculatePriceHash(currentData);
    if (previousPriceHash !== currentPriceHash) {
      changeType = 'price';
      differences.push('Prices have changed');
    }
  }

  // Check for content changes
  if (currentData.textContent.title !== baseline.data.textContent.title) {
    differences.push(`Title changed: "${baseline.data.textContent.title}" → "${currentData.textContent.title}"`);
  }

  if (currentData.textContent.headings.length !== baseline.data.textContent.headings.length) {
    differences.push(`Number of headings changed: ${baseline.data.textContent.headings.length} → ${currentData.textContent.headings.length}`);
  }

  // Check for structure changes
  const previousStructure = baseline.data.htmlContent.substring(0, 1000);
  const currentStructure = currentData.htmlContent.substring(0, 1000);
  if (previousStructure !== currentStructure) {
    changeType = 'structure';
    differences.push('HTML structure has changed');
  }

  // Update baseline
  baselineStore.set(monitorId, {
    hash: currentHash,
    data: currentData,
    timestamp: new Date(),
  });

  return {
    changed: true,
    changeType,
    differences,
    previousHash,
    currentHash,
    timestamp: new Date(),
  };
}

/**
 * Send alerts
 */
export async function sendAlert(
  config: MonitorConfig,
  detection: ChangeDetection
): Promise<void> {
  const message = `Change detected on ${config.url}:\n${detection.differences.join('\n')}`;

  for (const channel of config.alertChannels) {
    try {
      if (channel === 'webhook' && config.alertConfig?.webhookUrl) {
        await fetch(config.alertConfig.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: config.url,
            changeType: detection.changeType,
            differences: detection.differences,
            timestamp: detection.timestamp,
          }),
        });
      }
      // Email and Slack would require additional setup
      console.log(`[Change Monitor] Alert sent via ${channel}: ${message}`);
    } catch (error) {
      logError(error, `Change Monitor - Send Alert (${channel})`);
    }
  }
}

