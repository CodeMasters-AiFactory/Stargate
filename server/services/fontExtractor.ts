/**
 * Font Extractor Service
 * Extracts fonts from CSS, downloads them, and converts to base64 data URIs
 * Ensures fonts work offline and avoid CORS issues
 */

import fetch from 'node-fetch';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface ExtractedFont {
  originalUrl: string;
  dataUri: string;
  mimeType: string;
  format: 'woff' | 'woff2' | 'ttf' | 'otf' | 'eot';
  family?: string;
  weight?: string;
  style?: string;
  size: number;
}

/**
 * Download font file and convert to base64 data URI
 */
async function downloadFontAsDataUri(url: string): Promise<{ dataUri: string; mimeType: string; size: number } | null> {
  try {
    const response = await fetch(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'font/woff2,font/woff,font/ttf,font/otf,application/font-woff2,application/font-woff,application/font-ttf,application/font-otf,*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    const mimeType = response.headers.get('content-type') || getMimeTypeFromUrl(url);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64}`;

    return {
      dataUri,
      mimeType,
      size: buffer.length,
    };
  } catch (error) {
    logError(error, `FontExtractor - downloadFontAsDataUri(${url})`);
    return null;
  }
}

/**
 * Get MIME type from file extension
 */
function getMimeTypeFromUrl(url: string): string {
  const ext = url.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'otf': 'font/otf',
    'eot': 'application/vnd.ms-fontobject',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

/**
 * Extract font format from URL
 */
function getFontFormat(url: string): 'woff' | 'woff2' | 'ttf' | 'otf' | 'eot' {
  const ext = url.split('.').pop()?.toLowerCase();
  if (ext === 'woff2') return 'woff2';
  if (ext === 'woff') return 'woff';
  if (ext === 'ttf') return 'ttf';
  if (ext === 'otf') return 'otf';
  if (ext === 'eot') return 'eot';
  return 'woff2'; // Default
}

/**
 * Parse @font-face declarations from CSS
 */
export function parseFontFaces(css: string): Array<{
  family?: string;
  weight?: string;
  style?: string;
  src: string[];
}> {
  const fontFaces: Array<{
    family?: string;
    weight?: string;
    style?: string;
    src: string[];
  }> = [];

  // Match @font-face blocks
  const fontFaceRegex = /@font-face\s*\{([^}]+)\}/gi;
  let match;

  while ((match = fontFaceRegex.exec(css)) !== null) {
    const block = match[1];
    const fontFace: {
      family?: string;
      weight?: string;
      style?: string;
      src: string[];
    } = {
      src: [],
    };

    // Extract font-family
    const familyMatch = block.match(/font-family\s*:\s*['"]?([^'";]+)['"]?/i);
    if (familyMatch) {
      fontFace.family = familyMatch[1].trim();
    }

    // Extract font-weight
    const weightMatch = block.match(/font-weight\s*:\s*([^;]+)/i);
    if (weightMatch) {
      fontFace.weight = weightMatch[1].trim();
    }

    // Extract font-style
    const styleMatch = block.match(/font-style\s*:\s*([^;]+)/i);
    if (styleMatch) {
      fontFace.style = styleMatch[1].trim();
    }

    // Extract src URLs
    const srcMatch = block.match(/src\s*:\s*([^;]+)/i);
    if (srcMatch) {
      const srcValue = srcMatch[1];
      // Match url(...) in src
      const urlRegex = /url\(['"]?([^'")]+)['"]?\)/gi;
      let urlMatch;
      while ((urlMatch = urlRegex.exec(srcValue)) !== null) {
        fontFace.src.push(urlMatch[1]);
      }
    }

    if (fontFace.src.length > 0) {
      fontFaces.push(fontFace);
    }
  }

  return fontFaces;
}

/**
 * Replace font URLs in CSS with base64 data URIs
 */
export async function embedFontsInCSS(
  css: string,
  baseUrl: string,
  onProgress?: (current: number, total: number, url: string) => void
): Promise<{
  css: string;
  fonts: ExtractedFont[];
  errors: string[];
}> {
  const fonts: ExtractedFont[] = [];
  const errors: string[] = [];
  let modifiedCSS = css;

  // Parse all @font-face declarations
  const fontFaces = parseFontFaces(css);
  const fontUrls = new Set<string>();

  // Collect all font URLs
  fontFaces.forEach(face => {
    face.src.forEach(url => {
      if (!url.startsWith('data:') && !url.startsWith('#') && !url.startsWith('javascript:')) {
        try {
          const absoluteUrl = new URL(url, baseUrl).href;
          fontUrls.add(absoluteUrl);
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });
  });

  // Also find font URLs in regular url() declarations
  const urlRegex = /url\(['"]?([^'")]+\.(woff|woff2|ttf|otf|eot))['"]?\)/gi;
  let match;
  while ((match = urlRegex.exec(css)) !== null) {
    const fontUrl = match[1];
    if (!fontUrl.startsWith('data:') && !fontUrl.startsWith('#') && !fontUrl.startsWith('javascript:')) {
      try {
        const absoluteUrl = new URL(fontUrl, baseUrl).href;
        fontUrls.add(absoluteUrl);
      } catch (e) {
        // Invalid URL, skip
      }
    }
  }

  const fontUrlArray = Array.from(fontUrls);
  console.log(`[FontExtractor] Found ${fontUrlArray.length} fonts to download`);

  // Download each font
  for (let i = 0; i < fontUrlArray.length; i++) {
    const url = fontUrlArray[i];
    onProgress?.(i + 1, fontUrlArray.length, url);

    const result = await downloadFontAsDataUri(url);
    if (result) {
      const font: ExtractedFont = {
        originalUrl: url,
        dataUri: result.dataUri,
        mimeType: result.mimeType,
        format: getFontFormat(url),
        size: result.size,
      };

      fonts.push(font);

      // Replace URL in CSS with data URI
      // Replace in @font-face src
      modifiedCSS = modifiedCSS.replace(
        new RegExp(`url\\(['"]?${escapeRegex(url)}['"]?\\)`, 'gi'),
        `url('${result.dataUri}')`
      );

      // Also replace relative URLs that resolve to this font
      const relativeUrl = url.replace(new URL(baseUrl).origin, '');
      if (relativeUrl !== url) {
        modifiedCSS = modifiedCSS.replace(
          new RegExp(`url\\(['"]?${escapeRegex(relativeUrl)}['"]?\\)`, 'gi'),
          `url('${result.dataUri}')`
        );
      }

      console.log(`[FontExtractor] ✅ Embedded font: ${url.substring(0, 60)}...`);
    } else {
      errors.push(`Failed to download font: ${url}`);
      console.warn(`[FontExtractor] ⚠️ Failed to download font: ${url}`);
    }
  }

  return {
    css: modifiedCSS,
    fonts,
    errors,
  };
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

