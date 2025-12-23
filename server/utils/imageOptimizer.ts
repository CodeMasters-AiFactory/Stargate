/**
 * Image Optimization Utility
 * Phase 4.1 - Performance Optimization
 * Provides WebP conversion, resizing, and srcset generation
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

// Standard responsive breakpoints
const RESPONSIVE_WIDTHS = [320, 640, 768, 1024, 1280, 1920];

interface OptimizedImage {
  webp: Buffer;
  original: Buffer;
  width: number;
  height: number;
  format: string;
}

interface SrcSetImage {
  width: number;
  buffer: Buffer;
  filename: string;
}

/**
 * Convert image to WebP format with quality optimization
 */
export async function convertToWebP(
  input: Buffer | string,
  quality: number = 80
): Promise<Buffer> {
  return sharp(input)
    .webp({ quality, effort: 4 })
    .toBuffer();
}

/**
 * Optimize image with automatic format detection and resizing
 */
export async function optimizeImage(
  input: Buffer | string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'avif';
  } = {}
): Promise<OptimizedImage> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    format = 'webp'
  } = options;

  const image = sharp(input);
  const metadata = await image.metadata();

  // Resize if needed while maintaining aspect ratio
  const resized = image.resize(maxWidth, maxHeight, {
    fit: 'inside',
    withoutEnlargement: true
  });

  let optimized: Buffer;
  switch (format) {
    case 'webp':
      optimized = await resized.webp({ quality }).toBuffer();
      break;
    case 'avif':
      optimized = await resized.avif({ quality }).toBuffer();
      break;
    case 'jpeg':
      optimized = await resized.jpeg({ quality, mozjpeg: true }).toBuffer();
      break;
    case 'png':
      optimized = await resized.png({ compressionLevel: 9 }).toBuffer();
      break;
    default:
      optimized = await resized.webp({ quality }).toBuffer();
  }

  return {
    webp: optimized,
    original: typeof input === 'string' ? await fs.readFile(input) : input,
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown'
  };
}

/**
 * Generate srcset images for responsive loading
 */
export async function generateSrcSet(
  input: Buffer | string,
  baseName: string,
  options: {
    widths?: number[];
    quality?: number;
    format?: 'webp' | 'jpeg';
  } = {}
): Promise<SrcSetImage[]> {
  const {
    widths = RESPONSIVE_WIDTHS,
    quality = 80,
    format = 'webp'
  } = options;

  const image = sharp(input);
  const metadata = await image.metadata();
  const originalWidth = metadata.width || 1920;

  const results: SrcSetImage[] = [];

  for (const width of widths) {
    // Skip if width is larger than original
    if (width > originalWidth) continue;

    const resized = sharp(input).resize(width, null, {
      fit: 'inside',
      withoutEnlargement: true
    });

    let buffer: Buffer;
    const ext = format === 'webp' ? 'webp' : 'jpg';
    
    if (format === 'webp') {
      buffer = await resized.webp({ quality }).toBuffer();
    } else {
      buffer = await resized.jpeg({ quality, mozjpeg: true }).toBuffer();
    }

    results.push({
      width,
      buffer,
      filename: `${baseName}-${width}w.${ext}`
    });
  }

  return results;
}

/**
 * Generate blur placeholder for lazy loading (LQIP)
 */
export async function generateBlurPlaceholder(
  input: Buffer | string,
  size: number = 20
): Promise<string> {
  const buffer = await sharp(input)
    .resize(size, size, { fit: 'inside' })
    .blur(2)
    .webp({ quality: 20 })
    .toBuffer();

  return `data:image/webp;base64,${buffer.toString('base64')}`;
}

/**
 * Get image dimensions without loading full image
 */
export async function getImageDimensions(
  input: Buffer | string
): Promise<{ width: number; height: number }> {
  const metadata = await sharp(input).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0
  };
}

export { RESPONSIVE_WIDTHS };
