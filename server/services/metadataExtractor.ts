/**
 * Metadata Extractor Service
 * 
 * Extract metadata (title, description, keywords, Open Graph) from a webpage
 */

import { Page } from 'puppeteer';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface Metadata {
  title: string;
  description: string;
  keywords: string[];
  ogTags: Record<string, string>;
}

/**
 * Extract metadata from a page
 */
export async function extractMetadata(page: Page): Promise<Metadata> {
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
    logError(error, 'Metadata Extractor');
    return {
      title: '',
      description: '',
      keywords: [],
      ogTags: {},
    };
  }
}

