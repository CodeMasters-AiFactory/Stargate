/**
 * Batch Operations Service
 * Performs bulk operations on website pages
 */

import * as cheerio from 'cheerio';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface ImageReplacement {
  originalUrl: string;
  newUrl: string;
  alt?: string;
}

export interface ContentUpdate {
  selector: string; // CSS selector
  type: 'text' | 'html' | 'attribute';
  value: string;
  attribute?: string; // For attribute updates
}

export interface BatchResult {
  success: boolean;
  pagesAffected: number;
  changesCount: number;
  errors: Array<{ page: string; error: string }>;
}

/**
 * Batch replace images across all pages
 */
export async function batchReplaceImages(
  pages: Array<{ slug: string; html: string }>,
  replacements: ImageReplacement[]
): Promise<BatchResult> {
  const result: BatchResult = {
    success: true,
    pagesAffected: 0,
    changesCount: 0,
    errors: [],
  };

  try {
    for (const page of pages) {
      try {
        const $ = cheerio.load(page.html);
        let pageChanges = 0;

        replacements.forEach(replacement => {
          const $images = $(`img[src="${replacement.originalUrl}"]`);
          $images.each((_, img) => {
            $(img).attr('src', replacement.newUrl);
            if (replacement.alt) {
              $(img).attr('alt', replacement.alt);
            }
            pageChanges++;
          });
        });

        if (pageChanges > 0) {
          page.html = $.html();
          result.changesCount += pageChanges;
          result.pagesAffected++;
        }
      } catch (error) {
        result.success = false;
        result.errors.push({
          page: page.slug,
          error: getErrorMessage(error),
        });
      }
    }

    console.log(`[BatchOperations] ✅ Replaced images: ${result.changesCount} changes across ${result.pagesAffected} pages`);

    return result;
  } catch (error) {
    logError(error, 'BatchOperations - ReplaceImages');
    result.success = false;
    return result;
  }
}

/**
 * Batch update content across all pages
 */
export async function batchUpdateContent(
  pages: Array<{ slug: string; html: string }>,
  updates: ContentUpdate[]
): Promise<BatchResult> {
  const result: BatchResult = {
    success: true,
    pagesAffected: 0,
    changesCount: 0,
    errors: [],
  };

  try {
    for (const page of pages) {
      try {
        const $ = cheerio.load(page.html);
        let pageChanges = 0;

        updates.forEach(update => {
          const $elements = $(update.selector);
          $elements.each((_, el) => {
            if (update.type === 'text') {
              $(el).text(update.value);
            } else if (update.type === 'html') {
              $(el).html(update.value);
            } else if (update.type === 'attribute' && update.attribute) {
              $(el).attr(update.attribute, update.value);
            }
            pageChanges++;
          });
        });

        if (pageChanges > 0) {
          page.html = $.html();
          result.changesCount += pageChanges;
          result.pagesAffected++;
        }
      } catch (error) {
        result.success = false;
        result.errors.push({
          page: page.slug,
          error: getErrorMessage(error),
        });
      }
    }

    console.log(`[BatchOperations] ✅ Updated content: ${result.changesCount} changes across ${result.pagesAffected} pages`);

    return result;
  } catch (error) {
    logError(error, 'BatchOperations - UpdateContent');
    result.success = false;
    return result;
  }
}

/**
 * Batch update contact information
 */
export async function batchUpdateContactInfo(
  pages: Array<{ slug: string; html: string }>,
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  }
): Promise<BatchResult> {
  const updates: ContentUpdate[] = [
    {
      selector: 'a[href^="tel:"]',
      type: 'attribute',
      attribute: 'href',
      value: `tel:${contactInfo.phone}`,
    },
    {
      selector: 'a[href^="mailto:"]',
      type: 'attribute',
      attribute: 'href',
      value: `mailto:${contactInfo.email}`,
    },
  ];

  // Also replace text content
  const phoneRegex = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  for (const page of pages) {
    page.html = page.html.replace(phoneRegex, contactInfo.phone);
    page.html = page.html.replace(emailRegex, contactInfo.email);
  }

  return batchUpdateContent(pages, updates);
}

