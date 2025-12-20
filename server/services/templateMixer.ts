/**
 * Template Mixer Service
 * Mixes elements from multiple templates
 */

import * as cheerio from 'cheerio';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface TemplateElement {
  templateId: string;
  templateName: string;
  html: string;
  css: string;
  sections: Array<{ type: string; selector: string; html: string }>;
}

export interface MixedTemplate {
  html: string;
  css: string;
  sources: Array<{ templateId: string; sections: string[] }>;
}

/**
 * Extract sections from template HTML
 */
function extractSections(html: string): Array<{ type: string; selector: string; html: string }> {
  const $ = cheerio.load(html);
  const sections: Array<{ type: string; selector: string; html: string }> = [];

  // Detect section types
  $('section, [class*="section"], main > div, article, header, footer').each((_, el) => {
    const $el = $(el);
    const classes = $el.attr('class') || '';
    const id = $el.attr('id') || '';
    const combined = `${classes} ${id}`.toLowerCase();

    let type = 'content';
    if (combined.includes('hero') || combined.includes('banner')) type = 'hero';
    else if (combined.includes('header') || combined.includes('nav')) type = 'header';
    else if (combined.includes('footer')) type = 'footer';
    else if (combined.includes('service') || combined.includes('feature')) type = 'services';
    else if (combined.includes('about')) type = 'about';
    else if (combined.includes('testimonial') || combined.includes('review')) type = 'testimonials';
    else if (combined.includes('pricing') || combined.includes('plan')) type = 'pricing';
    else if (combined.includes('contact') || combined.includes('form')) type = 'contact';

    const selector = id ? `#${id}` : classes.split(' ')[0] ? `.${classes.split(' ')[0]}` : el.tagName;

    sections.push({
      type,
      selector,
      html: $el.html() || '',
    });
  });

  return sections;
}

/**
 * Mix template elements
 */
export async function mixTemplateElements(
  templates: TemplateElement[]
): Promise<MixedTemplate> {
  try {
    if (templates.length === 0) {
      throw new Error('No templates provided');
    }

    // Use first template as base
    const baseTemplate = templates[0];
    const $ = cheerio.load(baseTemplate.html);
    const sources: Array<{ templateId: string; sections: string[] }> = [
      { templateId: baseTemplate.templateId, sections: ['base'] },
    ];

    // Extract sections from all templates
    const allSections: Record<string, Array<{ templateId: string; html: string; selector: string }>> = {};

    templates.forEach(template => {
      const sections = extractSections(template.html);
      sections.forEach(section => {
        if (!allSections[section.type]) {
          allSections[section.type] = [];
        }
        allSections[section.type].push({
          templateId: template.templateId,
          html: section.html,
          selector: section.selector,
        });
      });
    });

    // Mix sections: use best section from each template
    Object.keys(allSections).forEach(sectionType => {
      const sections = allSections[sectionType];
      if (sections.length > 1) {
        // Use section from last template (user's choice)
        const selectedSection = sections[sections.length - 1];
        
        // Find and replace section in base template
        const $section = $(selectedSection.selector).first();
        if ($section.length > 0) {
          $section.html(selectedSection.html);
          
          // Track source
          const source = sources.find(s => s.templateId === selectedSection.templateId);
          if (source) {
            if (!source.sections.includes(sectionType)) {
              source.sections.push(sectionType);
            }
          } else {
            sources.push({
              templateId: selectedSection.templateId,
              sections: [sectionType],
            });
          }
        }
      }
    });

    // Combine CSS from all templates
    const combinedCSS = templates.map(t => t.css).join('\n\n/* --- Template: ' + templates.map(t => t.templateName).join(', ') + ' --- */\n\n');

    console.log(`[TemplateMixer] ✅ Mixed ${templates.length} templates`);

    return {
      html: $.html(),
      css: combinedCSS,
      sources,
    };
  } catch (error) {
    logError(error, 'TemplateMixer');
    throw error;
  }
}

