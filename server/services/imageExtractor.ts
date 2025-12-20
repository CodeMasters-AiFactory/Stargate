/**
 * Image Extractor Service
 * Comprehensive image extraction from websites including:
 * - <img> tag images
 * - CSS background-image URLs
 * - Lazy-loaded images
 * - Inline data URIs
 * - SVG images
 */

import { Page } from 'puppeteer';
import fetch from 'node-fetch';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { fetchWithAntiBlock } from './proxyManager';

export interface ExtractedImage {
  url: string;
  alt?: string;
  type?: string;
  data?: string; // Base64 encoded image data
  width?: number;
  height?: number;
  size?: number; // Size in bytes
  source: 'img' | 'background' | 'inline' | 'svg'; // Where image was found
  context?: string; // CSS selector or element info
  failed?: boolean;
  error?: string;
}

export interface ImageExtractionOptions {
  maxImageSize?: number; // Max size in bytes to download (default: 5MB)
  downloadImages?: boolean; // Whether to download image data (default: true)
  extractBackgrounds?: boolean; // Extract CSS background images (default: true)
  waitForLazyImages?: boolean; // Wait for lazy-loaded images (default: true)
  onProgress?: (current: number, total: number, message: string) => void;
}

/**
 * Extract all images from a page
 */
export async function extractAllImages(
  page: Page,
  baseUrl: string,
  options: ImageExtractionOptions = {}
): Promise<ExtractedImage[]> {
  const {
    maxImageSize = 5 * 1024 * 1024, // 5MB default
    downloadImages = true,
    extractBackgrounds = true,
    waitForLazyImages = true,
    onProgress,
  } = options;

  const allImages: ExtractedImage[] = [];
  const seenUrls = new Set<string>();

  try {
    // Step 1: Wait for lazy-loaded images
    if (waitForLazyImages) {
      onProgress?.(0, 100, 'Waiting for lazy-loaded images...');
      await waitForLazyImagesToLoad(page);
    }

    // Step 2: Extract <img> tag images
    onProgress?.(0, 100, 'Extracting <img> tag images...');
    const imgTagImages = await extractImgTagImages(page, baseUrl);
    
    for (const img of imgTagImages) {
      if (!seenUrls.has(img.url)) {
        seenUrls.add(img.url);
        allImages.push(img);
      }
    }

    // Step 3: Extract CSS background images
    if (extractBackgrounds) {
      onProgress?.(imgTagImages.length, 100, 'Extracting CSS background images...');
      const cssContent = await page.evaluate(() => {
        const styles: string[] = [];
        
        // Get inline styles
        const inlineStyles = Array.from(document.querySelectorAll('style'));
        inlineStyles.forEach(style => {
          if (style.textContent) {
            styles.push(style.textContent);
          }
        });

        // Get external stylesheets
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        links.forEach(link => {
          const href = (link as HTMLLinkElement).href;
          if (href) {
            styles.push(`/* External: ${href} */`);
          }
        });

        return styles.join('\n\n');
      });

      const backgroundImages = extractBackgroundImagesFromCSS(cssContent, baseUrl);
      
      for (const img of backgroundImages) {
        if (!seenUrls.has(img.url)) {
          seenUrls.add(img.url);
          allImages.push(img);
        }
      }
    }

    // Step 4: Extract <picture> element images
    onProgress?.(allImages.length, 100, 'Extracting <picture> element images...');
    const pictureImages = await extractPictureElementImages(page, baseUrl);
    
    for (const img of pictureImages) {
      if (!seenUrls.has(img.url)) {
        seenUrls.add(img.url);
        allImages.push(img);
      }
    }

    // Step 5: Extract SVG images
    onProgress?.(allImages.length, 100, 'Extracting SVG images...');
    const svgImages = await extractSVGImages(page, baseUrl);
    
    for (const img of svgImages) {
      if (!seenUrls.has(img.url)) {
        seenUrls.add(img.url);
        allImages.push(img);
      }
    }

    // Step 6: Extract favicon and touch icons
    onProgress?.(allImages.length, 100, 'Extracting favicons and touch icons...');
    const faviconImages = await extractFavicons(page, baseUrl);
    
    for (const img of faviconImages) {
      if (!seenUrls.has(img.url)) {
        seenUrls.add(img.url);
        allImages.push(img);
      }
    }

    // Step 7: Download image data if requested
    if (downloadImages) {
      const totalImages = allImages.length;
      for (let i = 0; i < allImages.length; i++) {
        const img = allImages[i];
        onProgress?.(i + 1, totalImages, `Downloading: ${img.url.substring(0, 50)}...`);
        
        try {
          // Skip if already has data (data URI)
          if (img.url.startsWith('data:')) {
            img.data = img.url;
            img.source = 'inline';
            continue;
          }

          // Skip if too large
          if (maxImageSize > 0) {
            try {
              const headResponse = await fetchWithAntiBlock(img.url, { retries: 1 }).catch(() => null);
              if (headResponse) {
                const contentLength = headResponse.headers.get('content-length');
                if (contentLength && parseInt(contentLength) > maxImageSize) {
                  img.failed = true;
                  img.error = `Image too large: ${contentLength} bytes`;
                  continue;
                }
              }
            } catch {
              // Continue to download if HEAD fails
            }
          }

          // Download image with anti-block measures
          const response = await fetchWithAntiBlock(img.url, { retries: 2 });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const buffer = await response.buffer();
          const base64 = buffer.toString('base64');
          const mimeType = response.headers.get('content-type') || 'image/jpeg';
          
          img.data = `data:${mimeType};base64,${base64}`;
          img.size = buffer.length;
          
          // Try to get dimensions from image
          try {
            const dimensions = await getImageDimensions(buffer);
            img.width = dimensions.width;
            img.height = dimensions.height;
          } catch {
            // Dimensions extraction failed, continue without them
          }
        } catch (error) {
          img.failed = true;
          img.error = getErrorMessage(error);
          console.warn(`[ImageExtractor] Failed to download image: ${img.url} - ${img.error}`);
        }
      }
    }

    const successful = allImages.filter(img => !img.failed).length;
    const failed = allImages.filter(img => img.failed).length;
    
    console.log(`[ImageExtractor] ✅ Extracted ${allImages.length} images (${successful} successful, ${failed} failed)`);
    
    return allImages;
  } catch (error) {
    logError(error, 'Image Extractor');
    return allImages; // Return what we have so far
  }
}

/**
 * Wait for lazy-loaded images to load
 */
async function waitForLazyImagesToLoad(page: Page): Promise<void> {
  try {
    // Scroll page to trigger lazy loading
    await page.evaluate(async () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollSteps = Math.ceil(scrollHeight / viewportHeight);
      
      for (let i = 0; i < scrollSteps; i++) {
        window.scrollTo(0, i * viewportHeight);
        await new Promise(resolve => setTimeout(resolve, 300)); // Wait for images to load
      }
      
      // Scroll back to top
      window.scrollTo(0, 0);
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    // Wait for all images to finish loading
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = () => resolve(undefined);
            img.onerror = () => resolve(undefined); // Don't fail on error
            setTimeout(() => resolve(undefined), 5000); // Timeout after 5s
          });
        })
      );
    });
  } catch (error) {
    console.warn('[ImageExtractor] Error waiting for lazy images:', getErrorMessage(error));
    // Continue anyway
  }
}

/**
 * Extract images from <img> tags
 */
async function extractImgTagImages(page: Page, baseUrl: string): Promise<ExtractedImage[]> {
  try {
    const images = await page.evaluate((url) => {
      const imageList: ExtractedImage[] = [];
      const imgElements = Array.from(document.querySelectorAll('img'));

      imgElements.forEach((img, index) => {
        const src = (img as HTMLImageElement).src;
        const srcset = (img as HTMLImageElement).srcset;
        const alt = (img as HTMLImageElement).alt;
        const width = (img as HTMLImageElement).naturalWidth || (img as HTMLImageElement).width;
        const height = (img as HTMLImageElement).naturalHeight || (img as HTMLImageElement).height;
        
        // Convert relative URLs to absolute
        let absoluteUrl = src;
        if (src && !src.startsWith('data:') && !src.startsWith('http')) {
          try {
            const base = new URL(url);
            if (src.startsWith('/')) {
              absoluteUrl = `${base.origin}${src}`;
            } else {
              absoluteUrl = new URL(src, base.origin).href;
            }
          } catch {
            absoluteUrl = src;
          }
        }

        if (absoluteUrl && absoluteUrl.startsWith('http')) {
          imageList.push({
            url: absoluteUrl,
            alt: alt || undefined,
            type: src.split('.').pop()?.toLowerCase() || undefined,
            width: width || undefined,
            height: height || undefined,
            source: 'img',
            context: `img[${index}]`,
          });
        }

        // Handle srcset (responsive images)
        if (srcset) {
          const srcsetUrls = srcset.split(',').map(s => {
            const parts = s.trim().split(/\s+/);
            return parts[0];
          });

          srcsetUrls.forEach(srcsetUrl => {
            if (srcsetUrl && !srcsetUrl.startsWith('data:')) {
              let absoluteSrcsetUrl = srcsetUrl;
              try {
                const base = new URL(url);
                if (srcsetUrl.startsWith('/')) {
                  absoluteSrcsetUrl = `${base.origin}${srcsetUrl}`;
                } else {
                  absoluteSrcsetUrl = new URL(srcsetUrl, base.origin).href;
                }
              } catch {
                absoluteSrcsetUrl = srcsetUrl;
              }

              if (absoluteSrcsetUrl.startsWith('http') && !imageList.some(img => img.url === absoluteSrcsetUrl)) {
                imageList.push({
                  url: absoluteSrcsetUrl,
                  alt: alt || undefined,
                  type: srcsetUrl.split('.').pop()?.toLowerCase() || undefined,
                  source: 'img',
                  context: `img[${index}] srcset`,
                });
              }
            }
          });
        }
      });

      return imageList;
    }, baseUrl);

    return images;
  } catch (error) {
    console.error('[ImageExtractor] Error extracting <img> tag images:', error);
    return [];
  }
}

/**
 * Extract background images from CSS
 */
function extractBackgroundImagesFromCSS(css: string, baseUrl: string): ExtractedImage[] {
  const images: ExtractedImage[] = [];
  const seenUrls = new Set<string>();

  try {
    // Match background-image: url(...) patterns
    const backgroundImageRegex = /background-image\s*:\s*url\(['"]?([^'")]+)['"]?\)/gi;
    let match;

    while ((match = backgroundImageRegex.exec(css)) !== null) {
      const url = match[1].trim();
      
      // Skip data URIs (already handled)
      if (url.startsWith('data:')) {
        continue;
      }

      // Convert relative URLs to absolute
      let absoluteUrl = url;
      if (!url.startsWith('http')) {
        try {
          const base = new URL(baseUrl);
          if (url.startsWith('/')) {
            absoluteUrl = `${base.origin}${url}`;
          } else {
            absoluteUrl = new URL(url, base.origin).href;
          }
        } catch {
          absoluteUrl = url;
        }
      }

      if (absoluteUrl.startsWith('http') && !seenUrls.has(absoluteUrl)) {
        seenUrls.add(absoluteUrl);
        images.push({
          url: absoluteUrl,
          type: url.split('.').pop()?.toLowerCase() || undefined,
          source: 'background',
          context: 'CSS background-image',
        });
      }
    }

    // Also match background: url(...) shorthand
    const backgroundRegex = /background\s*:\s*[^;]*url\(['"]?([^'")]+)['"]?\)/gi;
    while ((match = backgroundRegex.exec(css)) !== null) {
      const url = match[1].trim();
      
      if (url.startsWith('data:')) {
        continue;
      }

      let absoluteUrl = url;
      if (!url.startsWith('http')) {
        try {
          const base = new URL(baseUrl);
          if (url.startsWith('/')) {
            absoluteUrl = `${base.origin}${url}`;
          } else {
            absoluteUrl = new URL(url, base.origin).href;
          }
        } catch {
          absoluteUrl = url;
        }
      }

      if (absoluteUrl.startsWith('http') && !seenUrls.has(absoluteUrl)) {
        seenUrls.add(absoluteUrl);
        images.push({
          url: absoluteUrl,
          type: url.split('.').pop()?.toLowerCase() || undefined,
          source: 'background',
          context: 'CSS background',
        });
      }
    }
  } catch (error) {
    console.error('[ImageExtractor] Error extracting background images:', error);
  }

  return images;
}

/**
 * Extract SVG images
 */
async function extractSVGImages(page: Page, baseUrl: string): Promise<ExtractedImage[]> {
  try {
    const svgImages = await page.evaluate((url) => {
      const images: ExtractedImage[] = [];
      
      // Find inline SVGs
      const svgElements = Array.from(document.querySelectorAll('svg'));
      svgElements.forEach((svg, index) => {
        const svgContent = svg.outerHTML;
        // Return SVG content as-is, will be base64 encoded in Node.js context
        images.push({
          url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`,
          data: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`,
          type: 'svg',
          source: 'svg',
          context: `svg[${index}]`,
        });
      });

      // Find SVG files referenced in <img> or <object>
      const svgReferences = Array.from(document.querySelectorAll('img[src$=".svg"], object[data$=".svg"]'));
      svgReferences.forEach((el) => {
        const src = (el as HTMLImageElement).src || (el as HTMLObjectElement).data;
        if (src && !src.startsWith('data:')) {
          let absoluteUrl = src;
          try {
            const base = new URL(url);
            if (src.startsWith('/')) {
              absoluteUrl = `${base.origin}${src}`;
            } else {
              absoluteUrl = new URL(src, base.origin).href;
            }
          } catch {
            absoluteUrl = src;
          }

          if (absoluteUrl.startsWith('http')) {
            images.push({
              url: absoluteUrl,
              type: 'svg',
              source: 'svg',
              context: 'SVG file reference',
            });
          }
        }
      });

      return images;
    }, baseUrl);

    return svgImages;
  } catch (error) {
    console.error('[ImageExtractor] Error extracting SVG images:', error);
    return [];
  }
}

/**
 * Extract images from <picture> elements
 */
async function extractPictureElementImages(page: Page, baseUrl: string): Promise<ExtractedImage[]> {
  try {
    const images = await page.evaluate((url) => {
      const imageList: ExtractedImage[] = [];
      const pictureElements = Array.from(document.querySelectorAll('picture'));

      pictureElements.forEach((picture, picIndex) => {
        // Extract all <source> elements
        const sources = Array.from(picture.querySelectorAll('source'));
        sources.forEach((source) => {
          const srcset = (source as HTMLSourceElement).srcset;
          if (srcset) {
            const srcsetUrls = srcset.split(',').map(s => {
              const parts = s.trim().split(/\s+/);
              return parts[0];
            });

            srcsetUrls.forEach(srcsetUrl => {
              if (srcsetUrl && !srcsetUrl.startsWith('data:')) {
                let absoluteUrl = srcsetUrl;
                try {
                  const base = new URL(url);
                  if (srcsetUrl.startsWith('/')) {
                    absoluteUrl = `${base.origin}${srcsetUrl}`;
                  } else {
                    absoluteUrl = new URL(srcsetUrl, base.origin).href;
                  }
                } catch {
                  absoluteUrl = srcsetUrl;
                }

                if (absoluteUrl.startsWith('http')) {
                  imageList.push({
                    url: absoluteUrl,
                    type: srcsetUrl.split('.').pop()?.toLowerCase() || undefined,
                    source: 'img',
                    context: `picture[${picIndex}] source`,
                  });
                }
              }
            });
          }
        });

        // Extract <img> fallback
        const img = picture.querySelector('img');
        if (img) {
          const src = (img as HTMLImageElement).src;
          if (src && !src.startsWith('data:')) {
            let absoluteUrl = src;
            try {
              const base = new URL(url);
              if (src.startsWith('/')) {
                absoluteUrl = `${base.origin}${src}`;
              } else {
                absoluteUrl = new URL(src, base.origin).href;
              }
            } catch {
              absoluteUrl = src;
            }

            if (absoluteUrl.startsWith('http')) {
              imageList.push({
                url: absoluteUrl,
                alt: (img as HTMLImageElement).alt || undefined,
                type: src.split('.').pop()?.toLowerCase() || undefined,
                source: 'img',
                context: `picture[${picIndex}] img fallback`,
              });
            }
          }
        }
      });

      return imageList;
    }, baseUrl);

    return images;
  } catch (error) {
    console.error('[ImageExtractor] Error extracting <picture> element images:', error);
    return [];
  }
}

/**
 * Extract favicons and touch icons
 */
async function extractFavicons(page: Page, baseUrl: string): Promise<ExtractedImage[]> {
  try {
    const images = await page.evaluate((url) => {
      const imageList: ExtractedImage[] = [];
      const base = new URL(url);

      // Extract favicon from <link rel="icon"> or <link rel="shortcut icon">
      const faviconLinks = Array.from(document.querySelectorAll('link[rel*="icon"], link[rel*="apple-touch-icon"]'));
      faviconLinks.forEach((link) => {
        const href = (link as HTMLLinkElement).href;
        if (href && !href.startsWith('data:')) {
          let absoluteUrl = href;
          try {
            if (href.startsWith('/')) {
              absoluteUrl = `${base.origin}${href}`;
            } else {
              absoluteUrl = new URL(href, base.origin).href;
            }
          } catch {
            absoluteUrl = href;
          }

          if (absoluteUrl.startsWith('http')) {
            imageList.push({
              url: absoluteUrl,
              type: href.split('.').pop()?.toLowerCase() || 'ico',
              source: 'inline',
              context: 'favicon/touch-icon',
            });
          }
        }
      });

      // Also check for default favicon.ico
      const defaultFavicon = `${base.origin}/favicon.ico`;
      imageList.push({
        url: defaultFavicon,
        type: 'ico',
        source: 'inline',
        context: 'default favicon',
      });

      return imageList;
    }, baseUrl);

    return images;
  } catch (error) {
    console.error('[ImageExtractor] Error extracting favicons:', error);
    return [];
  }
}

/**
 * Get image dimensions from buffer
 */
async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  // Simple check for common image formats
  // For production, use a library like 'image-size'
  try {
    // PNG signature: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
      };
    }
    
    // JPEG: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      // JPEG dimensions are in SOF markers, need to parse
      // For now, return 0,0 (can be enhanced later)
      return { width: 0, height: 0 };
    }
    
    // GIF: 47 49 46 38
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
      return {
        width: buffer.readUInt16LE(6),
        height: buffer.readUInt16LE(8),
      };
    }
  } catch {
    // Parsing failed
  }
  
  return { width: 0, height: 0 };
}

