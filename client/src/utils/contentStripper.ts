/**
 * Content Stripper Utility
 * 
 * Strips ALL content from a template, keeping only the design/layout structure.
 * This creates an "empty" template that can be filled with content from a 
 * different content template by the AI.
 * 
 * What gets stripped:
 * - All text content in headings, paragraphs, buttons, links
 * - Image sources replaced with placeholders
 * - Background images removed or replaced
 * 
 * What gets kept:
 * - HTML structure
 * - CSS styling
 * - Layout (flexbox, grid, etc.)
 * - Component structure
 */

// Placeholder text for different element types
const PLACEHOLDERS = {
  h1: '[Main Headline]',
  h2: '[Section Title]',
  h3: '[Subsection Title]',
  h4: '[Feature Title]',
  h5: '[Small Heading]',
  h6: '[Minor Heading]',
  p: '[Paragraph content will be added by AI...]',
  span: '[Text]',
  li: '[List item]',
  button: '[Call to Action]',
  'a-button': '[Click Here]',
  label: '[Label]',
  td: '[Cell]',
  th: '[Header]',
  figcaption: '[Caption]',
  blockquote: '[Quote text will go here...]',
  cite: '[Source]',
  address: '[Address]',
  // Form placeholders
  placeholder: 'Enter text...',
};

// Image placeholder (clean, professional)
const IMAGE_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%23e2e8f0" width="800" height="600"/%3E%3Ctext fill="%2394a3b8" font-family="Arial,sans-serif" font-size="24" text-anchor="middle" x="400" y="300"%3E%5BImage Placeholder%5D%3C/text%3E%3C/svg%3E';

/**
 * Strip content from HTML template, keeping only structure
 */
export function stripContent(html: string): string {
  if (!html) return html;
  
  try {
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Strip text content from elements
    stripTextContent(doc.body);
    
    // Replace images with placeholders
    replaceImages(doc);
    
    // Strip background images from inline styles
    stripBackgroundImages(doc);
    
    // Clear placeholder attributes on inputs
    clearInputPlaceholders(doc);
    
    // Strip icon-only content (keep icons visible)
    // Don't strip - icons should remain for design
    
    // Return the modified HTML
    return doc.body.innerHTML;
  } catch (error) {
    console.error('[ContentStripper] Error stripping content:', error);
    return html; // Return original if parsing fails
  }
}

/**
 * Strip text content from elements recursively
 */
function stripTextContent(element: Element): void {
  const childNodes = Array.from(element.childNodes);
  
  for (const node of childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      // This is a text node
      const textContent = node.textContent?.trim();
      if (textContent && textContent.length > 0) {
        // Check parent element to determine placeholder type
        const parent = node.parentElement;
        if (parent) {
          const tagName = parent.tagName.toLowerCase();
          const placeholder = getPlaceholder(parent);
          
          // Replace text with placeholder
          node.textContent = placeholder;
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      
      // Skip script and style tags
      if (['script', 'style', 'noscript', 'svg', 'path', 'circle', 'rect', 'polygon', 'polyline', 'line', 'ellipse', 'g', 'defs', 'use', 'symbol', 'clippath', 'mask'].includes(el.tagName.toLowerCase())) {
        continue;
      }
      
      // Skip elements that have no visible text (icons, images)
      if (['i', 'img', 'br', 'hr', 'input', 'textarea', 'select', 'option', 'video', 'audio', 'source', 'track', 'embed', 'object', 'iframe', 'canvas', 'map', 'area'].includes(el.tagName.toLowerCase())) {
        continue;
      }
      
      // Recurse into child elements
      stripTextContent(el);
    }
  }
}

/**
 * Get appropriate placeholder text for an element
 */
function getPlaceholder(element: Element): string {
  const tagName = element.tagName.toLowerCase();
  
  // Check for specific placeholders
  if (PLACEHOLDERS[tagName as keyof typeof PLACEHOLDERS]) {
    return PLACEHOLDERS[tagName as keyof typeof PLACEHOLDERS];
  }
  
  // Check if it's a button-like link
  if (tagName === 'a') {
    const classes = element.className.toLowerCase();
    if (classes.includes('btn') || classes.includes('button') || classes.includes('cta')) {
      return PLACEHOLDERS['a-button'];
    }
    return '[Link]';
  }
  
  // Check for navigation links
  if (element.closest('nav')) {
    return '[Nav]';
  }
  
  // Default placeholder
  return '[...]';
}

/**
 * Replace all images with placeholder
 */
function replaceImages(doc: Document): void {
  // Replace img src
  const images = doc.querySelectorAll('img');
  images.forEach((img) => {
    img.setAttribute('src', IMAGE_PLACEHOLDER);
    img.removeAttribute('srcset');
    img.setAttribute('alt', '[Image will be replaced]');
    // Add a placeholder class for styling
    img.classList.add('content-stripped-image');
  });
  
  // Replace picture sources
  const sources = doc.querySelectorAll('picture source');
  sources.forEach((source) => {
    source.setAttribute('srcset', IMAGE_PLACEHOLDER);
  });
  
  // Replace video posters
  const videos = doc.querySelectorAll('video');
  videos.forEach((video) => {
    if (video.hasAttribute('poster')) {
      video.setAttribute('poster', IMAGE_PLACEHOLDER);
    }
  });
}

/**
 * Strip background images from inline styles
 */
function stripBackgroundImages(doc: Document): void {
  // Find all elements with inline styles
  const elementsWithStyle = doc.querySelectorAll('[style]');
  
  elementsWithStyle.forEach((el) => {
    const style = el.getAttribute('style') || '';
    
    // Remove background-image
    if (style.includes('background-image') || style.includes('background:')) {
      const newStyle = style
        .replace(/background-image\s*:\s*url\([^)]+\)\s*;?/gi, '')
        .replace(/background\s*:\s*url\([^)]+\)[^;]*;?/gi, '')
        .replace(/background\s*:[^;]*url\([^)]+\)[^;]*;?/gi, 'background: #e2e8f0;')
        .trim();
      
      if (newStyle) {
        el.setAttribute('style', newStyle);
      } else {
        el.removeAttribute('style');
      }
    }
  });
  
  // Also find style tags and remove background-image URLs
  const styleTags = doc.querySelectorAll('style');
  styleTags.forEach((styleTag) => {
    const css = styleTag.textContent || '';
    const cleanedCss = css
      .replace(/background-image\s*:\s*url\([^)]+\)/gi, 'background-image: none')
      .replace(/background\s*:[^;]*url\([^)]+\)/gi, 'background: #e2e8f0');
    styleTag.textContent = cleanedCss;
  });
}

/**
 * Clear placeholder attributes on form inputs
 */
function clearInputPlaceholders(doc: Document): void {
  const inputs = doc.querySelectorAll('input[placeholder], textarea[placeholder]');
  inputs.forEach((input) => {
    input.setAttribute('placeholder', PLACEHOLDERS.placeholder);
  });
}

/**
 * Create a complete stripped HTML document with styling
 */
export function createStrippedDocument(html: string, originalCss?: string): string {
  const strippedHtml = stripContent(html);
  
  // Add placeholder styling
  const placeholderStyles = `
    <style id="content-stripper-styles">
      /* Placeholder styling */
      .content-stripped-image {
        background: #e2e8f0 !important;
        object-fit: contain !important;
      }
      
      /* Visual indicator for placeholder text */
      h1, h2, h3, h4, h5, h6, p, span, li, button, a, label, td, th, figcaption, blockquote, cite, address {
        /* Keep original styling but slightly muted */
      }
      
      /* Placeholder image container */
      [style*="background"] {
        background-size: cover !important;
      }
    </style>
  `;
  
  // Combine everything
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Stripped Template Preview</title>
      ${originalCss ? `<style>${originalCss}</style>` : ''}
      ${placeholderStyles}
    </head>
    <body>
      ${strippedHtml}
    </body>
    </html>
  `;
}

export default { stripContent, createStrippedDocument };

