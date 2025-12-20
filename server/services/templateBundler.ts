/**
 * Template Bundler Service
 * Creates self-contained HTML files with ALL assets embedded
 * Templates work 100% offline with zero external dependencies (HTTrack style)
 */

import * as cheerio from 'cheerio';
import { downloadAllAssets } from './assetDownloader';
import { embedFontsInCSS } from './fontExtractor';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface BundledTemplate {
  html: string;
  size: number;
  assetsCount: {
    css: number;
    js: number;
    fonts: number;
    images: number;
  };
  errors: string[];
}

/**
 * Inline external CSS files into HTML
 */
function inlineCSSFiles(html: string, cssFiles: Array<{ originalUrl: string; content: string }>): string {
  const $ = cheerio.load(html);

  // Replace external CSS links with inline styles
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      const cssFile = cssFiles.find(f => f.originalUrl === href || f.originalUrl.endsWith(href));
      if (cssFile) {
        // Replace link tag with style tag
        $(el).replaceWith(`<style data-source="${cssFile.originalUrl}">\n${cssFile.content}\n</style>`);
      }
    }
  });

  return $.html();
}

/**
 * Inline external JS files into HTML
 */
function inlineJSFiles(html: string, jsFiles: Array<{ originalUrl: string; content: string }>): string {
  const $ = cheerio.load(html);

  // Replace external script tags with inline scripts
  $('script[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src) {
      const jsFile = jsFiles.find(f => f.originalUrl === src || f.originalUrl.endsWith(src));
      if (jsFile) {
        // Replace script src with inline content
        $(el).removeAttr('src');
        $(el).html(`\n${jsFile.content}\n`);
        $(el).attr('data-source', jsFile.originalUrl);
      }
    }
  });

  return $.html();
}

/**
 * Replace image URLs with embedded data URIs
 */
function inlineImages(html: string, images: Array<{ url: string; dataUri: string }>): string {
  const $ = cheerio.load(html);

  // Replace img src with data URIs
  $('img[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src && !src.startsWith('data:')) {
      const image = images.find(img => img.url === src || img.url.endsWith(src));
      if (image) {
        $(el).attr('src', image.dataUri);
      }
    }
  });

  // Replace background-image URLs in inline styles
  $('[style*="background-image"]').each((_, el) => {
    const style = $(el).attr('style') || '';
    const urlMatch = style.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/i);
    if (urlMatch) {
      const imageUrl = urlMatch[1];
      const image = images.find(img => img.url === imageUrl || img.url.endsWith(imageUrl));
      if (image) {
        const newStyle = style.replace(
          /background-image:\s*url\(['"]?[^'")]+['"]?\)/i,
          `background-image: url('${image.dataUri}')`
        );
        $(el).attr('style', newStyle);
      }
    }
  });

  return $.html();
}

/**
 * Create self-contained HTML bundle with all assets embedded
 */
export async function createBundledTemplate(
  html: string,
  css: string,
  baseUrl: string,
  images: Array<{ url: string; dataUri: string }> = [],
  onProgress?: (phase: string, current: number, total: number) => void
): Promise<BundledTemplate> {
  const errors: string[] = [];
  let bundledHTML = html;
  let bundledCSS = css;

  console.log(`[TemplateBundler] 🚀 Creating self-contained bundle for: ${baseUrl}`);

  try {
    // Step 1: Download all external assets
    onProgress?.('downloading', 0, 1);
    const assets = await downloadAllAssets(html, css, baseUrl, (phase, current, total) => {
      onProgress?.(`downloading-${phase}`, current, total);
    });
    errors.push(...assets.errors);

    // Step 2: Embed fonts in CSS
    onProgress?.('fonts', 0, 1);
    const fontResult = await embedFontsInCSS(bundledCSS, baseUrl, (current, total, url) => {
      onProgress?.('fonts', current, total);
    });
    bundledCSS = fontResult.css;
    errors.push(...fontResult.errors);

    // Step 3: Inline CSS files into HTML
    onProgress?.('inline-css', 0, 1);
    bundledHTML = inlineCSSFiles(bundledHTML, assets.cssFiles);

    // Step 4: Inline JS files into HTML
    onProgress?.('inline-js', 0, 1);
    bundledHTML = inlineJSFiles(bundledHTML, assets.jsFiles);

    // Step 5: Inline images
    onProgress?.('inline-images', 0, 1);
    bundledHTML = inlineImages(bundledHTML, images);

    // Step 6: Inject bundled CSS into HTML
    const $ = cheerio.load(bundledHTML);
    const head = $('head');
    if (head.length === 0) {
      // No head tag, create one
      $('html').prepend('<head></head>');
    }
    $('head').prepend(`<style id="bundled-template-css">\n${bundledCSS}\n</style>`);

    bundledHTML = $.html();

    // Step 7: Remove external resource references that weren't downloaded
    // (fallback for any missed resources)
    bundledHTML = bundledHTML.replace(
      /<link[^>]*rel=["']stylesheet["'][^>]*>/gi,
      '<!-- External CSS removed (should be inlined) -->'
    );
    bundledHTML = bundledHTML.replace(
      /<script[^>]*src=["'][^"]+["'][^>]*><\/script>/gi,
      '<!-- External JS removed (should be inlined) -->'
    );

    const size = Buffer.byteLength(bundledHTML, 'utf8');

    console.log(`[TemplateBundler] ✅ Bundle created: ${(size / 1024 / 1024).toFixed(2)} MB`);

    return {
      html: bundledHTML,
      size,
      assetsCount: {
        css: assets.cssFiles.length,
        js: assets.jsFiles.length,
        fonts: assets.fonts.length,
        images: images.length,
      },
      errors,
    };
  } catch (error) {
    logError(error, 'TemplateBundler - createBundledTemplate');
    errors.push(getErrorMessage(error));
    throw error;
  }
}

/**
 * Verify bundled template is self-contained (no external dependencies)
 */
export function verifyBundledTemplate(html: string): {
  isSelfContained: boolean;
  externalDependencies: string[];
} {
  const $ = cheerio.load(html);
  const externalDeps: string[] = [];

  // Check for external CSS links
  $('link[rel="stylesheet"][href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && !href.startsWith('data:') && !href.startsWith('#') && !href.startsWith('javascript:')) {
      externalDeps.push(`CSS: ${href}`);
    }
  });

  // Check for external JS scripts
  $('script[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src && !src.startsWith('data:') && !src.startsWith('#') && !src.startsWith('javascript:')) {
      externalDeps.push(`JS: ${src}`);
    }
  });

  // Check for external images
  $('img[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src && !src.startsWith('data:') && !src.startsWith('#') && !src.startsWith('javascript:')) {
      try {
        new URL(src); // If it's a valid URL (not relative), it's external
        externalDeps.push(`Image: ${src}`);
      } catch (e) {
        // Relative URL, might be okay if base tag is set
      }
    }
  });

  return {
    isSelfContained: externalDeps.length === 0,
    externalDependencies: externalDeps,
  };
}

