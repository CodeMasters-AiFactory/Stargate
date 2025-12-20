/**
 * SEO Preview Service
 * Calculates SEO score in real-time
 */

import * as cheerio from 'cheerio';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface SEOScore {
  score: number; // 0-100
  issues: Array<{ type: string; severity: 'error' | 'warning' | 'info'; message: string }>;
  recommendations: string[];
  details: {
    title: { present: boolean; length: number; optimal: boolean };
    metaDescription: { present: boolean; length: number; optimal: boolean };
    headings: { h1Count: number; h1Present: boolean; structure: boolean };
    keywords: { density: number; present: boolean };
    images: { altTags: number; totalImages: number; coverage: number };
    links: { internal: number; external: number };
    mobileFriendly: boolean;
  };
}

/**
 * Calculate SEO score
 */
export async function calculateSEOScore(
  html: string,
  keywords: string[]
): Promise<SEOScore> {
  const issues: Array<{ type: string; severity: 'error' | 'warning' | 'info'; message: string }> = [];
  const recommendations: string[] = [];
  let score = 100;

  try {
    const $ = cheerio.load(html);
    const textContent = $('body').text().toLowerCase();

    // Check title tag
    const title = $('title').text().trim();
    const titleLength = title.length;
    const titlePresent = title.length > 0;
    const titleOptimal = titleLength >= 30 && titleLength <= 60;

    if (!titlePresent) {
      issues.push({ type: 'title', severity: 'error', message: 'Missing title tag' });
      score -= 20;
    } else if (!titleOptimal) {
      issues.push({
        type: 'title',
        severity: 'warning',
        message: `Title length is ${titleLength} characters (optimal: 30-60)`,
      });
      score -= 5;
    }

    // Check meta description
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const metaLength = metaDescription.length;
    const metaPresent = metaDescription.length > 0;
    const metaOptimal = metaLength >= 120 && metaLength <= 160;

    if (!metaPresent) {
      issues.push({ type: 'meta-description', severity: 'error', message: 'Missing meta description' });
      score -= 15;
    } else if (!metaOptimal) {
      issues.push({
        type: 'meta-description',
        severity: 'warning',
        message: `Meta description length is ${metaLength} characters (optimal: 120-160)`,
      });
      score -= 5;
    }

    // Check headings
    const h1s = $('h1').toArray();
    const h1Count = h1s.length;
    const h1Present = h1Count > 0;
    const h1Structure = h1Count === 1; // Should have exactly one H1

    if (!h1Present) {
      issues.push({ type: 'headings', severity: 'error', message: 'Missing H1 heading' });
      score -= 15;
    } else if (!h1Structure) {
      issues.push({
        type: 'headings',
        severity: 'warning',
        message: `Found ${h1Count} H1 headings (should be exactly 1)`,
      });
      score -= 5;
    }

    // Check keyword density
    const keywordCounts: Record<string, number> = {};
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword.toLowerCase(), 'gi');
      const matches = textContent.match(regex);
      keywordCounts[keyword] = matches ? matches.length : 0;
    });

    const totalWords = textContent.split(/\s+/).length;
    const keywordDensity = keywords.length > 0
      ? (Object.values(keywordCounts).reduce((a, b) => a + b, 0) / totalWords) * 100
      : 0;

    const keywordOptimal = keywordDensity >= 1 && keywordDensity <= 3;
    if (!keywordOptimal && keywords.length > 0) {
      issues.push({
        type: 'keywords',
        severity: 'warning',
        message: `Keyword density is ${keywordDensity.toFixed(2)}% (optimal: 1-3%)`,
      });
      score -= 5;
    }

    // Check image alt tags
    const images = $('img').toArray();
    const totalImages = images.length;
    let altTags = 0;

    images.forEach(img => {
      const alt = $(img).attr('alt');
      if (alt && alt.trim().length > 0) {
        altTags++;
      }
    });

    const altCoverage = totalImages > 0 ? (altTags / totalImages) * 100 : 100;

    if (altCoverage < 100 && totalImages > 0) {
      issues.push({
        type: 'images',
        severity: 'warning',
        message: `${totalImages - altTags} images missing alt tags`,
      });
      score -= Math.floor((100 - altCoverage) / 10);
    }

    // Check links
    const internalLinks = $('a[href^="/"], a[href^="#"]').length;
    const externalLinks = $('a[href^="http"]').length;

    if (internalLinks === 0 && externalLinks === 0) {
      issues.push({
        type: 'links',
        severity: 'info',
        message: 'No links found (consider adding internal links)',
      });
      recommendations.push('Add internal links to improve navigation and SEO');
    }

    // Check mobile-friendly (viewport meta)
    const viewport = $('meta[name="viewport"]').attr('content') || '';
    const mobileFriendly = viewport.includes('width=device-width');

    if (!mobileFriendly) {
      issues.push({
        type: 'mobile',
        severity: 'warning',
        message: 'Missing or incorrect viewport meta tag',
      });
      score -= 10;
      recommendations.push('Add viewport meta tag for mobile responsiveness');
    }

    // Generate recommendations
    if (!titlePresent) {
      recommendations.push('Add a descriptive title tag (30-60 characters)');
    }
    if (!metaPresent) {
      recommendations.push('Add a meta description (120-160 characters)');
    }
    if (!h1Present) {
      recommendations.push('Add exactly one H1 heading with primary keyword');
    }
    if (keywordDensity < 1 && keywords.length > 0) {
      recommendations.push('Increase keyword usage naturally throughout content');
    }
    if (altCoverage < 100) {
      recommendations.push('Add alt tags to all images');
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    return {
      score,
      issues,
      recommendations,
      details: {
        title: { present: titlePresent, length: titleLength, optimal: titleOptimal },
        metaDescription: { present: metaPresent, length: metaLength, optimal: metaOptimal },
        headings: { h1Count, h1Present, structure: h1Structure },
        keywords: { density: keywordDensity, present: keywords.length > 0 },
        images: { altTags, totalImages, coverage: altCoverage },
        links: { internal: internalLinks, external: externalLinks },
        mobileFriendly,
      },
    };
  } catch (error) {
    logError(error, 'SEOPreview');
    return {
      score: 0,
      issues: [{ type: 'error', severity: 'error', message: getErrorMessage(error) }],
      recommendations: [],
      details: {
        title: { present: false, length: 0, optimal: false },
        metaDescription: { present: false, length: 0, optimal: false },
        headings: { h1Count: 0, h1Present: false, structure: false },
        keywords: { density: 0, present: false },
        images: { altTags: 0, totalImages: 0, coverage: 0 },
        links: { internal: 0, external: 0 },
        mobileFriendly: false,
      },
    };
  }
}

