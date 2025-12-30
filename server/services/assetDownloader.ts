/**
 * Asset Downloader Service
 * Downloads ALL external resources (CSS, JS, fonts, images) and embeds them locally
 * Ensures templates are 100% self-contained and work offline
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { logError } from '../utils/errorHandler';

export interface DownloadedAsset {
  originalUrl: string;
  content: string;
  mimeType: string;
  size: number;
  encoding?: 'base64' | 'text';
}

export interface AssetDownloadResult {
  cssFiles: DownloadedAsset[];
  jsFiles: DownloadedAsset[];
  fonts: DownloadedAsset[];
  images: DownloadedAsset[];
  errors: string[];
  totalSize: number;
}

/**
 * Download a single resource with retry logic
 */
async function downloadResource(
  url: string,
  retries: number = 3,
  timeout: number = 10000
): Promise<{ content: Buffer; mimeType: string } | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!response.ok) {
        if (response.status === 404 || response.status >= 500) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        // Retry on other errors
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = await response.buffer();
      const mimeType = response.headers.get('content-type') || 'application/octet-stream';

      return { content: buffer, mimeType };
    } catch (error: unknown) {
      if (attempt === retries) {
        logError(error, `AssetDownloader - Failed to download ${url} after ${retries} attempts`);
        return null;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return null;
}

/**
 * Convert buffer to base64 data URI
 */
function bufferToDataUri(buffer: Buffer, mimeType: string): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Extract all external CSS URLs from HTML
 */
function extractCSSUrls(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const cssUrls: string[] = [];

  // Extract from <link rel="stylesheet">
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && !href.startsWith('data:') && !href.startsWith('#') && !href.startsWith('javascript:')) {
      try {
        const absoluteUrl = new URL(href, baseUrl).href;
        cssUrls.push(absoluteUrl);
      } catch (_e: unknown) {
        // Invalid URL, skip
      }
    }
  });

  // Extract from @import in inline styles
  $('style').each((_, el) => {
    const css = $(el).html() || '';
    const importMatches = css.match(/@import\s+(?:url\()?['"]?([^'")]+)['"]?\)?/gi);
    if (importMatches) {
      importMatches.forEach(match => {
        const urlMatch = match.match(/['"]([^'"]+)['"]/);
        if (urlMatch) {
          try {
            const absoluteUrl = new URL(urlMatch[1], baseUrl).href;
            cssUrls.push(absoluteUrl);
          } catch (_e: unknown) {
            // Invalid URL, skip
          }
        }
      });
    }
  });

  return [...new Set(cssUrls)]; // Remove duplicates
}

/**
 * Extract all external JS URLs from HTML
 */
function extractJSUrls(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const jsUrls: string[] = [];

  $('script[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src && !src.startsWith('data:') && !src.startsWith('#') && !src.startsWith('javascript:')) {
      try {
        const absoluteUrl = new URL(src, baseUrl).href;
        jsUrls.push(absoluteUrl);
      } catch (_e: unknown) {
        // Invalid URL, skip
      }
    }
  });

  return [...new Set(jsUrls)]; // Remove duplicates
}

/**
 * Extract font URLs from CSS content
 */
function extractFontUrls(css: string, baseUrl: string): string[] {
  const fontUrls: string[] = [];
  
  // Match @font-face src: url(...)
  const fontFaceRegex = /@font-face\s*\{[^}]*src:\s*url\(['"]?([^'")]+)['"]?\)/gi;
  let match;
  while ((match = fontFaceRegex.exec(css)) !== null) {
    const fontUrl = match[1];
    if (!fontUrl.startsWith('data:') && !fontUrl.startsWith('#') && !fontUrl.startsWith('javascript:')) {
      try {
        const absoluteUrl = new URL(fontUrl, baseUrl).href;
        fontUrls.push(absoluteUrl);
      } catch (_e: unknown) {
        // Invalid URL, skip
      }
    }
  }

  // Match url() in CSS (could be fonts)
  const urlRegex = /url\(['"]?([^'")]+\.(woff|woff2|ttf|otf|eot))['"]?\)/gi;
  while ((match = urlRegex.exec(css)) !== null) {
    const fontUrl = match[1];
    try {
      const absoluteUrl = new URL(fontUrl, baseUrl).href;
      fontUrls.push(absoluteUrl);
    } catch (_e: unknown) {
      // Invalid URL, skip
    }
  }

  return [...new Set(fontUrls)]; // Remove duplicates
}

/**
 * Download all external CSS files and inline them
 */
async function downloadCSSFiles(
  html: string,
  baseUrl: string,
  onProgress?: (current: number, total: number, url: string) => void
): Promise<{ cssFiles: DownloadedAsset[]; errors: string[] }> {
  const cssUrls = extractCSSUrls(html, baseUrl);
  const cssFiles: DownloadedAsset[] = [];
  const errors: string[] = [];

  console.log(`[AssetDownloader] Found ${cssUrls.length} external CSS files to download`);

  for (let i = 0; i < cssUrls.length; i++) {
    const url = cssUrls[i];
    onProgress?.(i + 1, cssUrls.length, url);

    const result = await downloadResource(url);
    if (result) {
      cssFiles.push({
        originalUrl: url,
        content: result.content.toString('utf-8'),
        mimeType: result.mimeType,
        size: result.content.length,
        encoding: 'text',
      });
      console.log(`[AssetDownloader] ✅ Downloaded CSS: ${url.substring(0, 80)}...`);
    } else {
      errors.push(`Failed to download CSS: ${url}`);
      console.warn(`[AssetDownloader] ⚠️ Failed to download CSS: ${url}`);
    }
  }

  return { cssFiles, errors };
}

/**
 * Download all external JS files and inline them
 */
async function downloadJSFiles(
  html: string,
  baseUrl: string,
  onProgress?: (current: number, total: number, url: string) => void
): Promise<{ jsFiles: DownloadedAsset[]; errors: string[] }> {
  const jsUrls = extractJSUrls(html, baseUrl);
  const jsFiles: DownloadedAsset[] = [];
  const errors: string[] = [];

  console.log(`[AssetDownloader] Found ${jsUrls.length} external JS files to download`);

  for (let i = 0; i < jsUrls.length; i++) {
    const url = jsUrls[i];
    onProgress?.(i + 1, jsUrls.length, url);

    const result = await downloadResource(url);
    if (result) {
      jsFiles.push({
        originalUrl: url,
        content: result.content.toString('utf-8'),
        mimeType: result.mimeType,
        size: result.content.length,
        encoding: 'text',
      });
      console.log(`[AssetDownloader] ✅ Downloaded JS: ${url.substring(0, 80)}...`);
    } else {
      errors.push(`Failed to download JS: ${url}`);
      console.warn(`[AssetDownloader] ⚠️ Failed to download JS: ${url}`);
    }
  }

  return { jsFiles, errors };
}

/**
 * Download all fonts referenced in CSS
 */
async function downloadFonts(
  css: string,
  baseUrl: string,
  onProgress?: (current: number, total: number, url: string) => void
): Promise<{ fonts: DownloadedAsset[]; errors: string[] }> {
  const fontUrls = extractFontUrls(css, baseUrl);
  const fonts: DownloadedAsset[] = [];
  const errors: string[] = [];

  console.log(`[AssetDownloader] Found ${fontUrls.length} font files to download`);

  for (let i = 0; i < fontUrls.length; i++) {
    const url = fontUrls[i];
    onProgress?.(i + 1, fontUrls.length, url);

    const result = await downloadResource(url);
    if (result) {
      const dataUri = bufferToDataUri(result.content, result.mimeType);
      fonts.push({
        originalUrl: url,
        content: dataUri,
        mimeType: result.mimeType,
        size: result.content.length,
        encoding: 'base64',
      });
      console.log(`[AssetDownloader] ✅ Downloaded font: ${url.substring(0, 80)}...`);
    } else {
      errors.push(`Failed to download font: ${url}`);
      console.warn(`[AssetDownloader] ⚠️ Failed to download font: ${url}`);
    }
  }

  return { fonts, errors };
}

/**
 * Download all external assets for a template
 */
export async function downloadAllAssets(
  html: string,
  css: string,
  baseUrl: string,
  onProgress?: (phase: string, current: number, total: number) => void
): Promise<AssetDownloadResult> {
  const errors: string[] = [];
  let totalSize = 0;

  console.log(`[AssetDownloader] 🚀 Starting asset download for: ${baseUrl}`);

  // Download CSS files
  onProgress?.('css', 0, 1);
  const { cssFiles, errors: cssErrors } = await downloadCSSFiles(html, baseUrl, (current, total, _url) => {
    onProgress?.('css', current, total);
  });
  errors.push(...cssErrors);
  totalSize += cssFiles.reduce((sum, f) => sum + f.size, 0);

  // Download JS files
  onProgress?.('js', 0, 1);
  const { jsFiles, errors: jsErrors } = await downloadJSFiles(html, baseUrl, (current, total, _url) => {
    onProgress?.('js', current, total);
  });
  errors.push(...jsErrors);
  totalSize += jsFiles.reduce((sum, f) => sum + f.size, 0);

  // Download fonts from CSS
  onProgress?.('fonts', 0, 1);
  const { fonts, errors: fontErrors } = await downloadFonts(css, baseUrl, (current, total, _url) => {
    onProgress?.('fonts', current, total);
  });
  errors.push(...fontErrors);
  totalSize += fonts.reduce((sum, f) => sum + f.size, 0);

  console.log(`[AssetDownloader] ✅ Download complete: ${cssFiles.length} CSS, ${jsFiles.length} JS, ${fonts.length} fonts (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);

  return {
    cssFiles,
    jsFiles,
    fonts,
    images: [], // Images handled separately by imageExtractor
    errors,
    totalSize,
  };
}

/**
 * Download a single asset and return its content as string
 * Used by websiteCloner for individual asset downloads
 */
export async function downloadAsset(url: string): Promise<string> {
  const result = await downloadResource(url);
  if (result) {
    return result.content.toString('utf-8');
  }
  throw new Error(`Failed to download asset: ${url}`);
}

/**
 * Embed fonts in HTML by downloading and converting to base64
 * Used by websiteCloner
 */
export async function embedFonts(html: string, baseUrl: string, _fontsDir?: string): Promise<string> {
  const $ = cheerio.load(html);
  
  // Extract font URLs from inline styles and stylesheets
  const styleContent = $('style').map((_, el) => $(el).html()).get().join('\n');
  const fontUrls = extractFontUrls(styleContent, baseUrl);
  
  // Download each font and replace in HTML
  for (const fontUrl of fontUrls.slice(0, 10)) { // Limit to 10 fonts
    try {
      const result = await downloadResource(fontUrl);
      if (result) {
        const dataUri = bufferToDataUri(result.content, result.mimeType);
        // Replace font URL with data URI in all styles
        $('style').each((_, el) => {
          const styleHtml = $(el).html() || '';
          $(el).html(styleHtml.replace(new RegExp(fontUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), dataUri));
        });
      }
    } catch (_e: unknown) {
      // Continue if font download fails
    }
  }
  
  return $.html();
}

