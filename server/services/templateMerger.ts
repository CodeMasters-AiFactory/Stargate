/**
 * Template Merger Service
 * Merges content template text INTO design template structure
 * Preserves design layout, styling, and images
 * Replaces only text content (headlines, paragraphs, CTAs, lists)
 */

import * as cheerio from 'cheerio';
import type { BrandTemplate } from './brandTemplateLibrary';

export interface MergedTemplate {
  html: string;
  css: string;
  images: Array<{
    src: string;
    alt: string;
    section: string;
  }>;
  sections: Array<{
    type: string;
    designHtml: string;
    contentText: string;
  }>;
}

/**
 * Extract text content from HTML template
 */
function extractTextContent(html: string): {
  headlines: Array<{ level: number; text: string; selector: string }>;
  paragraphs: Array<{ text: string; selector: string }>;
  buttons: Array<{ text: string; selector: string }>;
  lists: Array<{ items: string[]; selector: string }>;
  testimonials: Array<{ text: string; author?: string; selector: string }>;
} {
  const $ = cheerio.load(html);

  const headlines: Array<{ level: number; text: string; selector: string }> = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const level = parseInt(el.tagName.charAt(1));
    const text = $(el).text().trim();
    if (text) {
      headlines.push({
        level,
        text,
        selector: getSelector($, el),
      });
    }
  });

  const paragraphs: Array<{ text: string; selector: string }> = [];
  $('p').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 20) {
      // Only include substantial paragraphs
      paragraphs.push({
        text,
        selector: getSelector($, el),
      });
    }
  });

  const buttons: Array<{ text: string; selector: string }> = [];
  $('button, .btn, a[class*="button"], a[class*="cta"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text) {
      buttons.push({
        text,
        selector: getSelector($, el),
      });
    }
  });

  const lists: Array<{ items: string[]; selector: string }> = [];
  $('ul, ol').each((_, el) => {
    const items: string[] = [];
    $(el)
      .find('li')
      .each((_, li) => {
        const text = $(li).text().trim();
        if (text) items.push(text);
      });
    if (items.length > 0) {
      lists.push({
        items,
        selector: getSelector($, el),
      });
    }
  });

  const testimonials: Array<{ text: string; author?: string; selector: string }> = [];
  $('[class*="testimonial"], [class*="review"], blockquote').each((_, el) => {
    const text = $(el).text().trim();
    const author = $(el).find('[class*="author"], cite').text().trim();
    if (text) {
      testimonials.push({
        text,
        author: author || undefined,
        selector: getSelector($, el),
      });
    }
  });

  return { headlines, paragraphs, buttons, lists, testimonials };
}

/**
 * Get CSS selector for element (simplified)
 */
function getSelector($: cheerio.CheerioAPI, element: cheerio.Element): string {
  const id = $(element).attr('id');
  if (id) return `#${id}`;

  const classes = $(element).attr('class');
  if (classes) {
    const firstClass = classes.split(' ')[0];
    return `.${firstClass}`;
  }

  return element.tagName;
}

/**
 * Detect section type from HTML structure
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

/**
 * Map content sections to design sections
 */
function mapSections(
  designHtml: string,
  contentExtracted: ReturnType<typeof extractTextContent>
): Array<{ designSelector: string; contentType: string; content: any }> {
  const $design = cheerio.load(designHtml);
  const mappings: Array<{ designSelector: string; contentType: string; content: any }> = [];

  // Map by section type
  $design('section, [class*="section"], main > div, article').each((_, el) => {
    const sectionType = detectSectionType($design, el);
    const selector = getSelector($design, el);

    // Find matching content
    let content: any = null;

    if (sectionType === 'hero') {
      content = {
        headline: contentExtracted.headlines[0]?.text || '',
        subheadline: contentExtracted.headlines[1]?.text || '',
        cta: contentExtracted.buttons[0]?.text || '',
      };
    } else if (sectionType === 'features') {
      content = {
        headline: contentExtracted.headlines.find((h) => h.text.toLowerCase().includes('feature'))?.text || '',
        items: contentExtracted.lists[0]?.items || [],
      };
    } else if (sectionType === 'about') {
      content = {
        headline: contentExtracted.headlines.find((h) => h.text.toLowerCase().includes('about'))?.text || '',
        paragraphs: contentExtracted.paragraphs.slice(0, 2).map((p) => p.text),
      };
    } else if (sectionType === 'testimonials') {
      content = {
        headline: contentExtracted.headlines.find((h) => h.text.toLowerCase().includes('testimonial'))?.text || '',
        testimonials: contentExtracted.testimonials,
      };
    } else {
      // Generic content section
      content = {
        headline: contentExtracted.headlines[0]?.text || '',
        paragraphs: contentExtracted.paragraphs.slice(0, 3).map((p) => p.text),
      };
    }

    if (content) {
      mappings.push({
        designSelector: selector,
        contentType: sectionType,
        content,
      });
    }
  });

  return mappings;
}

/**
 * Inject content into design structure
 */
function injectContent(designHtml: string, mappings: ReturnType<typeof mapSections>): string {
  const $ = cheerio.load(designHtml);

  mappings.forEach(({ designSelector, content }) => {
    const $section = $(designSelector).first();

    if (!content.headline) return;

    // Replace headlines
    $section.find('h1, h2, h3, h4, h5, h6').first().text(content.headline || '');

    // Replace subheadlines
    if (content.subheadline) {
      $section.find('h2, h3, h4').eq(1).text(content.subheadline);
    }

    // Replace paragraphs
    if (content.paragraphs && Array.isArray(content.paragraphs)) {
      $section
        .find('p')
        .each((index, el) => {
          if (content.paragraphs[index]) {
            $(el).text(content.paragraphs[index]);
          }
        });
    }

    // Replace list items
    if (content.items && Array.isArray(content.items)) {
      $section
        .find('li')
        .each((index, el) => {
          if (content.items[index]) {
            $(el).text(content.items[index]);
          }
        });
    }

    // Replace buttons/CTAs
    if (content.cta) {
      $section.find('button, .btn, a[class*="button"], a[class*="cta"]').first().text(content.cta);
    }

    // Replace testimonials
    if (content.testimonials && Array.isArray(content.testimonials)) {
      $section
        .find('[class*="testimonial"], blockquote')
        .each((index, el) => {
          if (content.testimonials[index]) {
            $(el).text(content.testimonials[index].text);
            if (content.testimonials[index].author) {
              $(el).find('[class*="author"], cite').text(content.testimonials[index].author);
            }
          }
        });
    }
  });

  return $.html();
}

/**
 * Extract all images from HTML
 */
function extractImages(html: string): Array<{ src: string; alt: string; section: string }> {
  const $ = cheerio.load(html);
  const images: Array<{ src: string; alt: string; section: string }> = [];

  $('img').each((_, el) => {
    const src = $(el).attr('src') || '';
    const alt = $(el).attr('alt') || '';
    const $parent = $(el).closest('section, [class*="section"]');
    const section = detectSectionType($, $parent.get(0) || el);

    if (src && !src.startsWith('data:')) {
      images.push({ src, alt, section });
    }
  });

  return images;
}

/**
 * Main merge function
 * Merges content template INTO design template
 */
export async function mergeTemplates(
  designTemplate: BrandTemplate,
  contentTemplate: BrandTemplate
): Promise<MergedTemplate> {
  // Get HTML content from templates
  const designHtml = designTemplate.contentData?.html || '';
  const contentHtml = contentTemplate.contentData?.html || '';

  if (!designHtml) {
    throw new Error('Design template has no HTML content');
  }

  if (!contentHtml) {
    throw new Error('Content template has no HTML content');
  }

  // Extract text content from content template
  const contentExtracted = extractTextContent(contentHtml);

  // Map content sections to design sections
  const mappings = mapSections(designHtml, contentExtracted);

  // Inject content into design structure
  const mergedHtml = injectContent(designHtml, mappings);

  // Extract images from merged HTML
  const images = extractImages(mergedHtml);

  // Get CSS (use design template's CSS)
  const css = designTemplate.css || '';

  return {
    html: mergedHtml,
    css,
    images,
    sections: mappings.map((m) => ({
      type: m.contentType,
      designHtml: '',
      contentText: JSON.stringify(m.content),
    })),
  };
}

