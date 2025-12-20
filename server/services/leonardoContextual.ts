/**
 * Context-Aware Leonardo AI Image Generation
 * Generates images that match content, colors, and context
 */

import * as cheerio from 'cheerio';
import { generateWithLeonardo } from './leonardoImageService';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface PageContext {
  content: string;
  keywords: string[];
  industry: string;
}

export interface ImageContext {
  url: string;
  alt?: string;
  section: string; // hero, service, testimonial, etc.
  surroundingText?: string;
}

export interface GeneratedImageResult {
  originalUrl: string;
  newUrl: string;
  context: string;
  prompt: string;
}

export interface ContextualImageResult {
  html: string;
  images: Array<{ url: string; alt: string; context: string }>;
}

/**
 * Extract colors from CSS
 */
function extractColorsFromCSS(css: string): { primary: string; secondary: string; accent: string } {
  const primaryMatch = css.match(/--primary[:\s]+([^;]+)/i) || css.match(/primary[:\s]+([#a-f0-9]{3,6})/i);
  const secondaryMatch = css.match(/--secondary[:\s]+([^;]+)/i) || css.match(/secondary[:\s]+([#a-f0-9]{3,6})/i);
  const accentMatch = css.match(/--accent[:\s]+([^;]+)/i) || css.match(/accent[:\s]+([#a-f0-9]{3,6})/i);

  return {
    primary: primaryMatch?.[1]?.trim() || '#000000',
    secondary: secondaryMatch?.[1]?.trim() || '#666666',
    accent: accentMatch?.[1]?.trim() || '#0066cc',
  };
}

/**
 * Analyze image context from surrounding content
 */
function analyzeImageContext(
  html: string,
  imageUrl: string,
  pageContext: PageContext
): { context: string; prompt: string } {
  const $ = cheerio.load(html);
  const $img = $(`img[src="${imageUrl}"]`).first();
  
  if ($img.length === 0) {
    return {
      context: 'general',
      prompt: `Professional ${pageContext.industry} business image, modern and clean`,
    };
  }

  // Get surrounding text
  const $parent = $img.closest('section, div[class*="section"], article');
  const sectionText = $parent.text().substring(0, 200).toLowerCase();
  const alt = $img.attr('alt') || '';
  const classes = $parent.attr('class') || '';

  // Detect section type
  let context = 'general';
  if (sectionText.includes('hero') || classes.includes('hero') || alt.toLowerCase().includes('hero')) {
    context = 'hero';
  } else if (sectionText.includes('service') || classes.includes('service')) {
    context = 'service';
  } else if (sectionText.includes('testimonial') || classes.includes('testimonial')) {
    context = 'testimonial';
  } else if (sectionText.includes('team') || classes.includes('team')) {
    context = 'team';
  } else if (sectionText.includes('about') || classes.includes('about')) {
    context = 'about';
  }

  // Build prompt based on context
  let prompt = '';
  const keywords = pageContext.keywords.slice(0, 3).join(', ');

  switch (context) {
    case 'hero':
      prompt = `Stunning hero image for ${pageContext.industry} business, featuring ${keywords}, modern professional photography, high quality, ${sectionText.substring(0, 100)}`;
      break;
    case 'service':
      prompt = `Professional ${pageContext.industry} service image, ${keywords}, clean modern style, commercial photography`;
      break;
    case 'testimonial':
      prompt = `Professional headshot, friendly smile, neutral background, commercial portrait photography`;
      break;
    case 'team':
      prompt = `Professional team of ${pageContext.industry} workers, diverse team, modern workplace, commercial photography`;
      break;
    case 'about':
      prompt = `Professional ${pageContext.industry} business environment, modern office, clean and organized, commercial photography`;
      break;
    default:
      prompt = `Professional ${pageContext.industry} business image, ${keywords}, modern and clean, high quality commercial photography`;
  }

  return { context, prompt };
}

/**
 * Generate contextual images for a page
 */
export async function generateContextualImages(
  html: string,
  pageContext: PageContext,
  css: string,
  clientInfo: {
    businessName: string;
    industry: string;
    location: { city: string; state: string; country: string };
  }
): Promise<ContextualImageResult> {
  const $ = cheerio.load(html);
  const images: Array<{ url: string; alt: string; context: string }> = [];
  const colors = extractColorsFromCSS(css);

  // Find all images
  const $images = $('img');
  const imageCount = $images.length;

  console.log(`[LeonardoContextual] 🎨 Generating ${imageCount} contextual images...`);

  for (let i = 0; i < imageCount; i++) {
    const $img = $images.eq(i);
    const originalSrc = $img.attr('src') || '';
    const alt = $img.attr('alt') || '';

    if (!originalSrc || originalSrc.startsWith('data:') || originalSrc.includes('placeholder')) {
      continue;
    }

    try {
      // Analyze context
      const { context, prompt: basePrompt } = analyzeImageContext(html, originalSrc, pageContext);

      // Enhance prompt with color scheme
      const enhancedPrompt = `${basePrompt}, color scheme: ${colors.primary} and ${colors.secondary}, location: ${clientInfo.location.city} ${clientInfo.location.state}`;

      // Determine dimensions based on context
      const width = context === 'hero' ? 1920 : 1024;
      const height = context === 'hero' ? 1080 : 768;

      // Generate with Leonardo
      const result = await generateWithLeonardo({
        prompt: enhancedPrompt,
        width,
        height,
        numImages: 1,
      });

      if (!result || !result.url) {
        throw new Error('Leonardo image generation failed');
      }

      // Replace image source
      $img.attr('src', result.url);
      $img.attr('alt', alt || `${context} image for ${clientInfo.businessName}`);

      images.push({
        url: result.url,
        alt: alt || `${context} image`,
        context,
      });

      console.log(`[LeonardoContextual] ✅ Generated ${context} image ${i + 1}/${imageCount}`);
    } catch (error) {
      logError(error, `LeonardoContextual - Image ${i + 1}`);
      console.warn(`[LeonardoContextual] ⚠️ Failed to generate image ${i + 1}, keeping original`);
    }
  }

  return {
    html: $.html(),
    images,
  };
}

