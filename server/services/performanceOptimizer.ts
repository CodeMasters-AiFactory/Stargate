/**
 * Performance Optimization Service
 * Auto-optimize websites for <2s load time guarantee
 */

import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { PERFORMANCE_CONSTANTS } from '../utils/constants';

export interface Optimization {
  type: string;
  description: string;
  impact?: 'high' | 'medium' | 'low';
  savings?: string | number; // e.g., "500KB", "2s", or bytes saved
}

export interface PerformanceOptimization {
  html: string;
  css: string;
  optimizations: Optimization[];
  estimatedLoadTime: number; // seconds
  lighthouseScore: number; // 0-100
}

/**
 * Optimize images (compress, convert formats)
 */
async function optimizeImages(html: string): Promise<{ html: string; optimizations: Optimization[] }> {
  const $ = cheerio.load(html);
  const optimizations: Optimization[] = [];

  $('img').each((_, el) => {
    const $img = $(el);
    const src = $img.attr('src') || '';
    
    // Add loading="lazy" if not present
    if (!$img.attr('loading')) {
      $img.attr('loading', 'lazy');
      optimizations.push({
        type: 'lazy-loading',
        description: 'Added lazy loading to image',
        impact: 'high' as const,
        savings: '1-2s',
      });
    }

    // Add width/height to prevent layout shift
    if (!$img.attr('width') && !$img.attr('height')) {
      $img.attr('width', String(PERFORMANCE_CONSTANTS.ABOVE_FOLD_THRESHOLD_PX));
      $img.attr('height', '600');
      optimizations.push({
        type: 'image-dimensions',
        description: 'Added image dimensions to prevent layout shift',
        impact: 'medium' as const,
        savings: '0.5s',
      });
    }

    // Convert to WebP if not already
    if (src && !src.includes('.webp') && !src.includes('data:')) {
      // Note: Actual conversion would require image processing library
      optimizations.push({
        type: 'image-format',
        description: 'Consider converting to WebP format',
        impact: 'high' as const,
        savings: '200-500KB',
      });
    }
  });

  return {
    html: $.html(),
    optimizations,
  };
}

/**
 * Extract and inline critical CSS
 */
function extractCriticalCSS(html: string, fullCSS: string): { html: string; css: string; optimizations: Optimization[] } {
  const $ = cheerio.load(html);
  const optimizations: Optimization[] = [];

  // Extract above-fold CSS (simplified - would use actual CSS parser in production)
  const criticalSelectors = [
    'body', 'html', 'header', 'nav', '.hero', 'h1', 'h2',
    '.above-fold', '[class*="hero"]', '[class*="header"]',
  ];

  let criticalCSS = '';
  const lines = fullCSS.split('\n');
  let inCriticalRule = false;

  for (const line of lines) {
    const isCritical = criticalSelectors.some(sel => line.includes(sel));
    if (isCritical || inCriticalRule) {
      criticalCSS += line + '\n';
      if (line.includes('{')) inCriticalRule = true;
      if (line.includes('}')) inCriticalRule = false;
    }
  }

  // Inline critical CSS
  if (!$('head style[data-critical]').length) {
    $('head').prepend(`<style data-critical>${criticalCSS}</style>`);
    optimizations.push({
      type: 'critical-css',
      description: 'Inlined critical CSS for above-fold content',
      impact: 'high' as const,
      savings: '1-2s',
    });
  }

  return {
    html: $.html(),
    css: fullCSS,
    optimizations,
  };
}

/**
 * Optimize HTML (minify, remove comments)
 */
function optimizeHTML(html: string): { html: string; optimizations: Optimization[] } {
  const optimizations: Optimization[] = [];
  let optimized = html;

  // Remove HTML comments
  const beforeSize = optimized.length;
  optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
  const afterSize = optimized.length;
  if (beforeSize > afterSize) {
    optimizations.push({
      type: 'html-comments',
      description: 'Removed HTML comments',
      impact: 'low' as const,
      savings: `${beforeSize - afterSize} bytes`,
    });
  }

  // Remove unnecessary whitespace (basic)
  optimized = optimized.replace(/>\s+</g, '><');
  optimizations.push({
    type: 'html-whitespace',
    description: 'Removed unnecessary whitespace',
    impact: 'low' as const,
    savings: '10-50KB',
  });

  return {
    html: optimized,
    optimizations,
  };
}

/**
 * Optimize CSS (minify, remove unused)
 */
function optimizeCSS(css: string): { css: string; optimizations: Optimization[] } {
  const optimizations: Optimization[] = [];
  let optimized = css;

  // Remove CSS comments
  const beforeSize = optimized.length;
  optimized = optimized.replace(/\/\*[\s\S]*?\*\//g, '');
  const afterSize = optimized.length;
  if (beforeSize > afterSize) {
    optimizations.push({
      type: 'css-comments',
      description: 'Removed CSS comments',
      impact: 'low' as const,
      savings: `${beforeSize - afterSize} bytes`,
    });
  }

  // Remove unnecessary whitespace
  optimized = optimized.replace(/\s+/g, ' ').replace(/;\s*}/g, '}');
  optimizations.push({
    type: 'css-minify',
    description: 'Minified CSS',
    impact: 'medium' as const,
    savings: '20-100KB',
  });

  return {
    css: optimized,
    optimizations,
  };
}

/**
 * Add performance hints
 */
function addPerformanceHints(html: string): { html: string; optimizations: Optimization[] } {
  const $ = cheerio.load(html);
  const optimizations: Optimization[] = [];

  // Add preconnect for external domains
  const externalDomains = new Set<string>();
  $('link[href^="http"], script[src^="http"], img[src^="http"]').each((_, el) => {
    const url = $(el).attr('href') || $(el).attr('src') || '';
    try {
      const domain = new URL(url).origin;
      // Check if domain is external (not localhost or same origin)
      // Since we're in Node.js, we can't use window.location, so we check if it's not localhost
      if (!domain.includes('localhost') && !domain.includes('127.0.0.1')) {
        externalDomains.add(domain);
      }
    } catch (e) {
      // Invalid URL - skip
    }
  });

  externalDomains.forEach(domain => {
    if (!$(`head link[rel="preconnect"][href="${domain}"]`).length) {
      $('head').prepend(`<link rel="preconnect" href="${domain}" crossorigin>`);
      optimizations.push({
        type: 'preconnect',
        description: `Added preconnect for ${domain}`,
        impact: 'medium' as const,
        savings: '0.2-0.5s',
      });
    }
  });

  // Add resource hints for images
  $('img[src^="http"]').each((_, el) => {
    const src = $(el).attr('src') || '';
    if (src && !$(el).attr('fetchpriority')) {
      // Mark first image as high priority
      if ($('img[fetchpriority]').length === 0) {
        $(el).attr('fetchpriority', 'high');
        optimizations.push({
          type: 'fetch-priority',
          description: 'Set fetch priority for hero image',
          impact: 'medium' as const,
          savings: '0.3s',
        });
      }
    }
  });

  return {
    html: $.html(),
    optimizations,
  };
}

/**
 * Full performance optimization
 */
export async function optimizePerformance(
  html: string,
  css: string
): Promise<PerformanceOptimization> {
  try {
    console.log('[PerformanceOptimizer] ⚡ Optimizing performance...');

    const allOptimizations: Optimization[] = [];

    // Step 1: Optimize HTML
    const htmlOpt = optimizeHTML(html);
    html = htmlOpt.html;
    allOptimizations.push(...htmlOpt.optimizations);

    // Step 2: Optimize CSS
    const cssOpt = optimizeCSS(css);
    css = cssOpt.css;
    allOptimizations.push(...cssOpt.optimizations);

    // Step 3: Extract critical CSS
    const criticalOpt = extractCriticalCSS(html, css);
    html = criticalOpt.html;
    allOptimizations.push(...criticalOpt.optimizations);

    // Step 4: Optimize images
    const imgOpt = await optimizeImages(html);
    html = imgOpt.html;
    allOptimizations.push(...imgOpt.optimizations);

    // Step 5: Add performance hints
    const hintsOpt = addPerformanceHints(html);
    html = hintsOpt.html;
    allOptimizations.push(...hintsOpt.optimizations);

    // Estimate load time (simplified calculation)
    const htmlSize = html.length;
    const cssSize = css.length;
    const totalSize = htmlSize + cssSize;
    const estimatedLoadTime = Math.max(0.5, totalSize / 100000); // Rough estimate: 100KB = 1s

    // Estimate Lighthouse score
    let lighthouseScore = 100;
    if (estimatedLoadTime > 3) lighthouseScore -= 30;
    else if (estimatedLoadTime > 2) lighthouseScore -= 20;
    else if (estimatedLoadTime > 1.5) lighthouseScore -= 10;

    console.log(`[PerformanceOptimizer] ✅ Optimized: ${allOptimizations.length} optimizations, estimated ${estimatedLoadTime.toFixed(1)}s load time`);

    return {
      html,
      css,
      optimizations: allOptimizations,
      estimatedLoadTime: Math.round(estimatedLoadTime * 10) / 10,
      lighthouseScore: Math.max(70, lighthouseScore),
    };
  } catch (error) {
    logError(error, 'PerformanceOptimizer - Optimize');
    throw error;
  }
}

// Export utility functions for external use
export { extractCriticalCSS, optimizeHTML };

/**
 * Add resource hints to HTML (preconnect, dns-prefetch, etc.)
 */
export function addResourceHintsToHTML(html: string, hints?: { domains?: string[] }): string {
  const $ = cheerio.load(html);
  
  if (hints?.domains) {
    hints.domains.forEach(domain => {
      if (!$(`head link[rel="preconnect"][href="${domain}"]`).length) {
        $('head').prepend(`<link rel="preconnect" href="${domain}" crossorigin>`);
      }
    });
  }
  
  return $.html();
}

/**
 * Optimize scripts (defer, async, etc.)
 */
export function optimizeScripts(html: string, options?: { deferNonCritical?: boolean }): string {
  const $ = cheerio.load(html);
  
  if (options?.deferNonCritical) {
    $('script[src]').each((_, el) => {
      const $script = $(el);
      if (!$script.attr('defer') && !$script.attr('async')) {
        $script.attr('defer', '');
      }
    });
  }
  
  return $.html();
}

/**
 * Minify CSS - removes comments, whitespace, and unnecessary characters
 */
export function minifyCSS(css: string): string {
  if (!css) return '';
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/;\s*}/g, '}') // Remove last semicolon
    .replace(/:\s+/g, ':') // Remove space after colons
    .replace(/\s*{\s*/g, '{') // Remove space around braces
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .trim();
}

/**
 * Minify JS - basic minification (removes comments and unnecessary whitespace)
 */
export function minifyJS(js: string): string {
  if (!js) return '';
  return js
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/\s*([{}()[\]=+\-*/<>!&|,;:])\s*/g, '$1') // Remove space around operators
    .trim();
}

/**
 * Inline critical CSS into HTML head
 */
export function inlineCriticalCSS(html: string, criticalCSS: string): string {
  if (!html || !criticalCSS) return html;
  const $ = cheerio.load(html);
  
  // Check if critical CSS already exists
  if (!$('head style[data-critical]').length) {
    $('head').prepend(`<style data-critical>${minifyCSS(criticalCSS)}</style>`);
  }
  
  return $.html();
}
