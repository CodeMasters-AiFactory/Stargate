/**
 * Time Machine Scraper Service
 * 
 * Scrape ANY website from ANY date using Wayback Machine API.
 * Track competitor pricing/content changes over time.
 */

import fetch from 'node-fetch';
import puppeteer, { Page } from 'puppeteer';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { scrapeWebsiteFull, type ScrapedWebsiteData } from './websiteScraper';

export interface WaybackSnapshot {
  url: string;
  timestamp: string; // ISO format
  available: boolean;
  archiveUrl?: string;
  statusCode?: number;
}

export interface HistoricalScrape {
  url: string;
  date: string;
  scrapedData: ScrapedWebsiteData;
  archiveUrl: string;
}

/**
 * Get available snapshots for a URL from Wayback Machine
 */
export async function getAvailableSnapshots(
  url: string,
  startDate?: Date,
  endDate?: Date
): Promise<WaybackSnapshot[]> {
  try {
    console.log(`[Time Machine] Getting snapshots for ${url}`);

    // Wayback Machine CDX API
    const waybackApiUrl = 'https://web.archive.org/cdx/search/cdx';
    const params = new URLSearchParams({
      url: url,
      output: 'json',
      collapse: 'urlkey',
      limit: '100',
    });

    if (startDate) {
      params.append('from', formatWaybackDate(startDate));
    }
    if (endDate) {
      params.append('to', formatWaybackDate(endDate));
    }

    const response = await fetch(`${waybackApiUrl}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Wayback API error: ${response.statusText}`);
    }

    const data = await response.json() as any[][];
    
    // First row is headers, skip it
    const snapshots: WaybackSnapshot[] = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row && row.length >= 2) {
        const timestamp = row[1]; // Format: YYYYMMDDHHmmss
        const statusCode = parseInt(row[4] || '0');
        
        // Only include successful captures (status 200)
        if (statusCode === 200) {
          const archiveUrl = `https://web.archive.org/web/${timestamp}/${url}`;
          snapshots.push({
            url,
            timestamp: formatTimestamp(timestamp),
            available: true,
            archiveUrl,
            statusCode,
          });
        }
      }
    }

    console.log(`[Time Machine] Found ${snapshots.length} available snapshots`);
    return snapshots;
  } catch (error) {
    logError(error, 'Time Machine - Get Snapshots');
    throw new Error(`Failed to get snapshots: ${getErrorMessage(error)}`);
  }
}

/**
 * Scrape website from a specific date
 */
export async function scrapeFromDate(
  url: string,
  date: Date
): Promise<HistoricalScrape> {
  try {
    console.log(`[Time Machine] Scraping ${url} from ${date.toISOString()}`);

    // Get snapshots around the target date
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - 7); // 7 days before
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 7); // 7 days after

    const snapshots = await getAvailableSnapshots(url, startDate, endDate);
    
    if (snapshots.length === 0) {
      throw new Error(`No snapshots available for ${url} around ${date.toISOString()}`);
    }

    // Find closest snapshot to target date
    const targetTime = date.getTime();
    let closestSnapshot = snapshots[0];
    let minDiff = Math.abs(new Date(snapshots[0].timestamp).getTime() - targetTime);

    for (const snapshot of snapshots) {
      const diff = Math.abs(new Date(snapshot.timestamp).getTime() - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestSnapshot = snapshot;
      }
    }

    if (!closestSnapshot.archiveUrl) {
      throw new Error('No archive URL found');
    }

    console.log(`[Time Machine] Using snapshot from ${closestSnapshot.timestamp}`);

    // Scrape the archived version
    const scrapedData = await scrapeWebsiteFull(
      closestSnapshot.archiveUrl,
      undefined, // companyName
      3, // maxRetries
      2000, // retryDelay
      (phase, current, total, message) => {
        console.log(`[Time Machine] ${phase}: ${Math.round((current / total) * 100)}% - ${message || ''}`);
      }
    );

    return {
      url,
      date: closestSnapshot.timestamp,
      scrapedData,
      archiveUrl: closestSnapshot.archiveUrl,
    };
  } catch (error) {
    logError(error, 'Time Machine - Scrape From Date');
    throw new Error(`Failed to scrape from date: ${getErrorMessage(error)}`);
  }
}

/**
 * Compare two historical versions
 */
export async function compareVersions(
  url: string,
  date1: Date,
  date2: Date
): Promise<{
  version1: HistoricalScrape;
  version2: HistoricalScrape;
  differences: {
    htmlChanged: boolean;
    contentChanged: boolean;
    designChanged: boolean;
    changes: string[];
  };
}> {
  try {
    const version1 = await scrapeFromDate(url, date1);
    const version2 = await scrapeFromDate(url, date2);

    // Compare content
    const htmlChanged = version1.scrapedData.htmlContent !== version2.scrapedData.htmlContent;
    const contentChanged = 
      version1.scrapedData.textContent.title !== version2.scrapedData.textContent.title ||
      version1.scrapedData.textContent.headings.length !== version2.scrapedData.textContent.headings.length;
    
    const designChanged = 
      version1.scrapedData.designTokens.colors.primary !== version2.scrapedData.designTokens.colors.primary;

    const changes: string[] = [];
    if (htmlChanged) changes.push('HTML structure changed');
    if (contentChanged) changes.push('Content changed');
    if (designChanged) changes.push('Design/colors changed');

    return {
      version1,
      version2,
      differences: {
        htmlChanged,
        contentChanged,
        designChanged,
        changes,
      },
    };
  } catch (error) {
    logError(error, 'Time Machine - Compare Versions');
    throw new Error(`Failed to compare versions: ${getErrorMessage(error)}`);
  }
}

/**
 * Format date for Wayback Machine API (YYYYMMDDHHmmss)
 */
function formatWaybackDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Format Wayback timestamp to ISO string
 */
function formatTimestamp(timestamp: string): string {
  // Format: YYYYMMDDHHmmss
  const year = timestamp.substring(0, 4);
  const month = timestamp.substring(4, 6);
  const day = timestamp.substring(6, 8);
  const hours = timestamp.substring(8, 10);
  const minutes = timestamp.substring(10, 12);
  const seconds = timestamp.substring(12, 14);
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

/**
 * Check Wayback Machine availability for a URL
 * Returns information about available snapshots
 */
export async function checkWaybackMachineAvailability(url: string): Promise<{
  availableSnapshots: number;
  oldestTimestamp: string | null;
  newestTimestamp: string | null;
}> {
  try {
    const snapshots = await getAvailableSnapshots(url);
    
    if (snapshots.length === 0) {
      return {
        availableSnapshots: 0,
        oldestTimestamp: null,
        newestTimestamp: null,
      };
    }
    
    return {
      availableSnapshots: snapshots.length,
      oldestTimestamp: snapshots[0].timestamp,
      newestTimestamp: snapshots[snapshots.length - 1].timestamp,
    };
  } catch (error) {
    console.warn(`[Time Machine] Failed to check availability for ${url}:`, error);
    return {
      availableSnapshots: 0,
      oldestTimestamp: null,
      newestTimestamp: null,
    };
  }
}

/**
 * Scrape a historical page from Wayback Machine
 */
export async function scrapeHistoricalPage(url: string, timestamp: string): Promise<HistoricalScrape | null> {
  try {
    // Convert timestamp to Date
    const date = new Date(timestamp);
    const result = await scrapeFromDate(url, date);
    return result;
  } catch (error) {
    console.warn(`[Time Machine] Failed to scrape historical page for ${url}:`, error);
    return null;
  }
}

