/**
 * Image Context Analyzer
 * Analyzes images to understand their purpose and generate Leonardo AI prompts
 * Uses multiple methods: alt text, AI vision, surrounding context
 */

import * as cheerio from 'cheerio';
import type { MergedTemplate } from './templateMerger';

export interface ImageAnalysis {
  src: string;
  alt: string;
  section: string;
  purpose: string;
  description: string;
  prompt: string;
  context: {
    surroundingText: string;
    sectionType: string;
    businessContext?: {
      industry?: string;
      businessName?: string;
      location?: string;
    };
  };
}

/**
 * Analyze image using alt text
 */
function analyzeFromAltText(alt: string, section: string): string {
  if (alt && alt.length > 5) {
    return alt;
  }

  // Fallback based on section type
  const sectionDefaults: Record<string, string> = {
    hero: 'Professional hero image showcasing the business',
    features: 'Feature illustration or icon',
    about: 'Team photo or business location',
    testimonials: 'Customer testimonial photo',
    pricing: 'Product or service image',
    contact: 'Contact form or location image',
    footer: 'Logo or brand image',
  };

  return sectionDefaults[section] || 'Professional business image';
}

/**
 * Extract surrounding text context
 */
function extractSurroundingContext(html: string, imageSrc: string): string {
  const $ = cheerio.load(html);
  let context = '';

  $('img').each((_, el) => {
    if ($(el).attr('src') === imageSrc) {
      // Get parent section
      const $parent = $(el).closest('section, div, article');
      
      // Extract text from parent
      const parentText = $parent.text().trim();
      const words = parentText.split(/\s+/).slice(0, 50).join(' '); // First 50 words
      
      // Get nearby headings
      const heading = $parent.find('h1, h2, h3').first().text().trim();
      
      context = `${heading} ${words}`.trim();
    }
  });

  return context;
}

/**
 * Generate Leonardo AI prompt from analysis
 */
function generatePrompt(analysis: Omit<ImageAnalysis, 'prompt'>): string {
  const { description, section, context } = analysis;
  
  // Build prompt components
  const components: string[] = [];

  // Section-specific style
  const sectionStyles: Record<string, string> = {
    hero: 'high-quality, professional, eye-catching, modern',
    features: 'clean, minimalist, professional illustration',
    about: 'warm, authentic, professional photography',
    testimonials: 'friendly, authentic, professional portrait',
    pricing: 'professional product photography, clean background',
    contact: 'professional, welcoming, modern',
  };

  components.push(sectionStyles[section] || 'professional, high-quality');

  // Add description
  if (description) {
    components.push(description);
  }

  // Add business context if available
  if (context.businessContext) {
    const { industry, businessName, location } = context.businessContext;
    
    if (industry) {
      components.push(`for ${industry} industry`);
    }
    
    if (businessName) {
      components.push(`representing ${businessName}`);
    }
    
    if (location) {
      components.push(`in ${location}`);
    }
  }

  // Add surrounding context keywords
  if (context.surroundingText) {
    const keywords = context.surroundingText
      .split(/\s+/)
      .filter((word) => word.length > 4)
      .slice(0, 5)
      .join(', ');
    
    if (keywords) {
      components.push(`related to: ${keywords}`);
    }
  }

  // Quality and style modifiers
  components.push('4K resolution, professional photography, well-lit, sharp focus');

  return components.join(', ');
}

/**
 * Analyze all images in merged template
 */
export async function analyzeImages(
  mergedTemplate: MergedTemplate,
  businessContext?: {
    industry?: string;
    businessName?: string;
    location?: string;
  }
): Promise<ImageAnalysis[]> {
  const analyses: ImageAnalysis[] = [];

  for (const image of mergedTemplate.images) {
    // Method 1: Alt text analysis
    const altDescription = analyzeFromAltText(image.alt, image.section);

    // Method 2: Surrounding context
    const surroundingText = extractSurroundingContext(mergedTemplate.html, image.src);

    // Method 3: Section type inference
    const sectionType = image.section;

    // Combine all methods
    const description = altDescription || `Professional ${sectionType} image`;

    // Build analysis
    const analysis: Omit<ImageAnalysis, 'prompt'> = {
      src: image.src,
      alt: image.alt,
      section: image.section,
      purpose: sectionType,
      description,
      context: {
        surroundingText,
        sectionType,
        businessContext,
      },
    };

    // Generate prompt
    const prompt = generatePrompt(analysis);

    analyses.push({
      ...analysis,
      prompt,
    });
  }

  return analyses;
}

/**
 * Analyze single image (for one-by-one replacement)
 */
export async function analyzeSingleImage(
  html: string,
  imageSrc: string,
  businessContext?: {
    industry?: string;
    businessName?: string;
    location?: string;
  }
): Promise<ImageAnalysis> {
  const $ = cheerio.load(html);
  const $img = $(`img[src="${imageSrc}"]`).first();

  if ($img.length === 0) {
    throw new Error(`Image not found: ${imageSrc}`);
  }

  const alt = $img.attr('alt') || '';
  const $parent = $img.closest('section, [class*="section"], div, article');
  const section = detectSectionType($, $parent.get(0) || $img.get(0));
  const surroundingText = extractSurroundingContext(html, imageSrc);

  const description = analyzeFromAltText(alt, section);

  const analysis: Omit<ImageAnalysis, 'prompt'> = {
    src: imageSrc,
    alt,
    section,
    purpose: section,
    description,
    context: {
      surroundingText,
      sectionType: section,
      businessContext,
    },
  };

  const prompt = generatePrompt(analysis);

  return {
    ...analysis,
    prompt,
  };
}

/**
 * Detect section type from element
 */
function detectSectionType($: cheerio.CheerioAPI, element: cheerio.Element): string {
  const html = $(element).html() || '';
  const classes = $(element).attr('class') || '';
  const id = $(element).attr('id') || '';

  const combined = `${classes} ${id} ${html}`.toLowerCase();

  if (combined.includes('hero') || combined.includes('banner')) return 'hero';
  if (combined.includes('feature') || combined.includes('service')) return 'features';
  if (combined.includes('about') || combined.includes('story')) return 'about';
  if (combined.includes('testimonial') || combined.includes('review')) return 'testimonials';
  if (combined.includes('pricing') || combined.includes('plan')) return 'pricing';
  if (combined.includes('contact') || combined.includes('form')) return 'contact';
  if (combined.includes('footer')) return 'footer';
  if (combined.includes('header') || combined.includes('nav')) return 'header';

  return 'content';
}

