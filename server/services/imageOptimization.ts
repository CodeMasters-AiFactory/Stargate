/**
 * Image Optimization Service
 * Handles WebP conversion, compression, responsive images, and lazy loading
 */

// Note: sharp is imported but not used directly in this file
// It would be used for actual image processing in production
// import sharp from 'sharp';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  generateSrcset?: boolean;
  srcsetWidths?: number[];
  loading?: 'lazy' | 'eager';
}

export interface OptimizedImage {
  url: string;
  webpUrl?: string;
  srcset?: string;
  width?: number;
  height?: number;
  alt?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Generate responsive srcset for an image
 */
export function generateSrcset(baseUrl: string, widths: number[] = [320, 640, 1024, 1920]): string {
  return widths.map(width => `${baseUrl}?w=${width} ${width}w`).join(', ');
}

/**
 * Generate optimized image HTML with WebP fallback and lazy loading
 */
export function generateOptimizedImageHTML(
  imageUrl: string,
  alt: string = '',
  options: ImageOptimizationOptions = {}
): string {
  const {
    width,
    height,
    generateSrcset: shouldGenerateSrcset = true,
    srcsetWidths = [320, 640, 1024, 1920],
    loading = 'lazy'
  } = options;

  // Generate srcset if requested (using the function from this module)
  const srcsetValue = shouldGenerateSrcset ? generateSrcset(imageUrl, srcsetWidths) : '';
  const srcsetAttr = srcsetValue ? `srcset="${srcsetValue}"` : '';
  const sizesAttr = shouldGenerateSrcset ? 'sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"' : '';
  
  // Width and height attributes for CLS prevention
  const widthAttr = width ? `width="${width}"` : '';
  const heightAttr = height ? `height="${height}"` : '';
  
  // Loading attribute for lazy loading
  const loadingAttr = `loading="${loading}"`;
  
  // Decoding attribute for performance
  const decodingAttr = 'decoding="async"';

  // Generate WebP version URL (assuming service supports format parameter)
  const webpUrl = imageUrl.includes('?') 
    ? `${imageUrl}&format=webp` 
    : `${imageUrl}?format=webp`;

  // Return optimized image with WebP fallback
  const webpSrcset = shouldGenerateSrcset ? generateSrcset(webpUrl, srcsetWidths) : '';
  return `
    <picture>
      <source srcset="${webpSrcset}" type="image/webp" ${sizesAttr}>
      <img 
        src="${imageUrl}" 
        ${srcsetAttr}
        ${sizesAttr}
        ${widthAttr}
        ${heightAttr}
        ${loadingAttr}
        ${decodingAttr}
        alt="${alt.replace(/"/g, '&quot;')}"
        style="max-width: 100%; height: auto;"
      >
    </picture>
  `.trim();
}

/**
 * Add lazy loading attribute to all images in HTML
 */
export function addLazyLoadingToImages(html: string): string {
  // Match all img tags that don't already have loading attribute
  return html.replace(
    /<img([^>]*?)(?<!loading=)(?<!loading\s*=\s*["'][^"']*["'])([^>]*?)>/gi,
    (match, before, after) => {
      // Skip if already has loading attribute
      if (match.includes('loading=')) {
        return match;
      }
      // Add loading="lazy" to images that are not in the first viewport
      // For now, add to all images except those with class="hero" or in hero sections
      if (match.includes('hero') || match.includes('above-fold')) {
        return `<img${before}loading="eager"${after}>`;
      }
      return `<img${before}loading="lazy"${after}>`;
    }
  );
}

/**
 * Add explicit width/height to images to prevent CLS
 * This is a best-effort function that tries to extract dimensions from URLs or uses defaults
 */
export function addImageDimensions(html: string): string {
  // Match img tags without width/height
  return html.replace(
    /<img([^>]*?)(?<!width=)(?<!width\s*=\s*["'][^"']*["'])(?<!height=)(?<!height\s*=\s*["'][^"']*["'])([^>]*?)>/gi,
    (match, before, after) => {
      // Skip if already has dimensions
      if (match.includes('width=') && match.includes('height=')) {
        return match;
      }
      
      // Try to extract dimensions from URL (e.g., ?w=1200&h=600)
      const widthMatch = match.match(/[?&]w=(\d+)/i);
      const heightMatch = match.match(/[?&]h=(\d+)/i);
      
      const width = widthMatch ? widthMatch[1] : '1200';
      const height = heightMatch ? heightMatch[1] : '600';
      
      // Calculate aspect ratio for responsive images
      const aspectRatio = (parseInt(height) / parseInt(width) * 100).toFixed(2);
      
      return `<img${before}width="${width}" height="${height}" style="aspect-ratio: ${width}/${height};"${after}>`;
    }
  );
}

/**
 * Generate descriptive alt text for an image based on context
 * This is a placeholder - in production, you might use AI to generate alt text
 */
export function generateAltText(imageUrl: string, context?: string): string {
  // Extract keywords from URL
  const urlParts = imageUrl.split('/');
  const filename = urlParts[urlParts.length - 1] || '';
  
  // Try to infer from URL patterns
  if (filename.includes('hero') || imageUrl.includes('hero')) {
    return context || 'Hero image';
  }
  if (filename.includes('feature') || imageUrl.includes('feature')) {
    return context || 'Feature illustration';
  }
  if (filename.includes('service') || imageUrl.includes('service')) {
    return context || 'Service illustration';
  }
  
  return context || 'Image';
}

/**
 * Process all images in HTML and optimize them
 */
export function optimizeImagesInHTML(html: string, options: {
  addLazyLoading?: boolean;
  addDimensions?: boolean;
  generateSrcset?: boolean;
} = {}): string {
  let optimized = html;
  
  const {
    addLazyLoading = true,
    addDimensions = true,
    generateSrcset = true
  } = options;
  
  if (addLazyLoading) {
    optimized = addLazyLoadingToImages(optimized);
  }
  
  if (addDimensions) {
    optimized = addImageDimensions(optimized);
  }
  
  // Note: Full srcset generation would require processing each image URL
  // This is handled at the image generation level, not HTML processing level
  
  return optimized;
}

/**
 * Phase 4.1 Enhancement: Convert image URL to WebP format
 */
export function convertToWebP(imageUrl: string): string {
  // If URL already has query params, append format; otherwise add it
  if (imageUrl.includes('?')) {
    return imageUrl.includes('format=') 
      ? imageUrl.replace(/format=[^&]+/, 'format=webp')
      : `${imageUrl}&format=webp`;
  }
  return `${imageUrl}?format=webp`;
}

/**
 * Phase 4.1 Enhancement: Generate multiple image sizes for responsive images
 */
export function generateResponsiveImageSources(
  baseUrl: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920]
): Array<{ width: number; url: string; descriptor: string }> {
  return widths.map(width => ({
    width,
    url: baseUrl.includes('?') 
      ? `${baseUrl}&w=${width}`
      : `${baseUrl}?w=${width}`,
    descriptor: `${width}w`,
  }));
}

