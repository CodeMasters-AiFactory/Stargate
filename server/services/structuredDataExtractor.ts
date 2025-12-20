/**
 * Structured Data Extractor Service
 * 
 * Auto-extract JSON-LD, Schema.org, Open Graph, meta tags, microdata, RDFa
 * into unified output.
 */

import * as cheerio from 'cheerio';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface StructuredData {
  jsonLd: any[];
  microdata: any[];
  rdfa: any[];
  openGraph: Record<string, string>;
  twitterCards: Record<string, string>;
  metaTags: Record<string, string>;
}

/**
 * Extract all structured data from HTML
 */
export function extractStructuredData(html: string): StructuredData {
  try {
    const $ = cheerio.load(html);

    // JSON-LD
    const jsonLd: any[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).text());
        jsonLd.push(json);
      } catch (e) {
        // Invalid JSON, skip
      }
    });

    // Microdata
    const microdata: any[] = [];
    $('[itemscope]').each((_, el) => {
      const item: any = {};
      const itemType = $(el).attr('itemtype');
      if (itemType) {
        item['@type'] = itemType;
      }
      $(el).find('[itemprop]').each((_, propEl) => {
        const prop = $(propEl).attr('itemprop');
        const value = $(propEl).attr('content') || $(propEl).text();
        if (prop && value) {
          item[prop] = value;
        }
      });
      if (Object.keys(item).length > 0) {
        microdata.push(item);
      }
    });

    // RDFa (simplified extraction)
    const rdfa: any[] = [];
    $('[typeof], [property]').each((_, el) => {
      const item: any = {};
      const typeofAttr = $(el).attr('typeof');
      if (typeofAttr) {
        item['@type'] = typeofAttr;
      }
      $(el).find('[property]').each((_, propEl) => {
        const prop = $(propEl).attr('property');
        const value = $(propEl).attr('content') || $(propEl).text();
        if (prop && value) {
          item[prop] = value;
        }
      });
      if (Object.keys(item).length > 0) {
        rdfa.push(item);
      }
    });

    // Open Graph tags
    const openGraph: Record<string, string> = {};
    $('meta[property^="og:"]').each((_, el) => {
      const property = $(el).attr('property')?.replace('og:', '') || '';
      const content = $(el).attr('content') || '';
      if (property && content) {
        openGraph[property] = content;
      }
    });

    // Twitter Cards
    const twitterCards: Record<string, string> = {};
    $('meta[name^="twitter:"]').each((_, el) => {
      const name = $(el).attr('name')?.replace('twitter:', '') || '';
      const content = $(el).attr('content') || '';
      if (name && content) {
        twitterCards[name] = content;
      }
    });

    // Meta tags
    const metaTags: Record<string, string> = {};
    $('meta[name], meta[property]').each((_, el) => {
      const name = $(el).attr('name') || $(el).attr('property') || '';
      const content = $(el).attr('content') || '';
      if (name && content && !name.startsWith('og:') && !name.startsWith('twitter:')) {
        metaTags[name] = content;
      }
    });

    return {
      jsonLd,
      microdata,
      rdfa,
      openGraph,
      twitterCards,
      metaTags,
    };
  } catch (error) {
    logError(error, 'Structured Data Extractor');
    return {
      jsonLd: [],
      microdata: [],
      rdfa: [],
      openGraph: {},
      twitterCards: {},
      metaTags: {},
    };
  }
}

