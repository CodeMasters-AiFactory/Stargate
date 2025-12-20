/**
 * v5.0 to MultiPageWebsite Converter
 * Converts v5.0 generated website to MultiPageWebsite format for frontend compatibility
 */

import type { GeneratedWebsite } from './merlinDesignLLM';
import type { MultiPageWebsite, WebsiteManifest, WebsiteFile, PageSpec, DesignSystem } from './types/multipage';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

/**
 * Convert v5.0 generated website to MultiPageWebsite format
 */
export function convertV5ToMultiPageWebsite(
  v5Website: GeneratedWebsite,
  projectName: string
): MultiPageWebsite {
  // Use code directly from v5Website object (more reliable than reading from disk)
  const htmlContent = v5Website.code.html || '';
  const cssContent = v5Website.code.css || '';
  const jsContent = v5Website.code.javascript || '';
  
  // Validate that we have required content
  if (!htmlContent) {
    throw new Error('Generated website has no HTML content');
  }
  if (!cssContent) {
    throw new Error('Generated website has no CSS content');
  }
  
  // Create manifest from v5.0 data
  const manifest: WebsiteManifest = {
    siteName: projectName,
    description: v5Website.copy.valueProposition || `${projectName} website`,
    pages: createPageSpecs(v5Website),
    navigation: {
      type: 'header',
      sticky: true,
      pages: v5Website.layout.sections
        .filter((s: any) => s.type === 'navigation')
        .map((s: any, i: number) => ({
          slug: s.id || `page-${i}`,
          label: s.title || 'Page',
          order: i
        }))
    },
    sharedComponents: {
      header: extractHeader(htmlContent),
      footer: extractFooter(htmlContent),
      navigation: extractNavigation(htmlContent)
    },
    seoStrategy: {
      primaryKeywords: extractKeywords(v5Website.copy),
      secondaryKeywords: [],
      contentGaps: []
    },
    designSystem: convertDesignSystem(v5Website.styleSystem),
    version: '5.0'
  };
  
  // Create files
  const files: Record<string, WebsiteFile> = {
    'index.html': {
      path: 'index.html',
      type: 'html',
      content: htmlContent,
      checksum: generateChecksum(htmlContent)
    }
  };
  
  // Add CSS file
  if (cssContent) {
    files['styles.css'] = {
      path: 'styles.css',
      type: 'css',
      content: cssContent,
      checksum: generateChecksum(cssContent)
    };
  }
  
  // Add JS file
  if (jsContent) {
    files['script.js'] = {
      path: 'script.js',
      type: 'js',
      content: jsContent,
      checksum: generateChecksum(jsContent)
    };
  }
  
  return {
    manifest,
    files,
    assets: {
      css: cssContent,
      js: jsContent
    }
  };
}

/**
 * Create page specs from v5.0 layout
 */
function createPageSpecs(v5Website: GeneratedWebsite): PageSpec[] {
  const homePage: PageSpec = {
    slug: 'home',
    title: v5Website.copy.hero.headline || 'Home',
    description: v5Website.copy.hero.subheadline || '',
    sections: v5Website.layout.sections
      .filter((section: any) => section.type !== 'navigation') // Exclude navigation sections
      .map((section: any, index: number) => ({
        id: `section-${index}`,
        type: mapSectionType(section.type),
        title: extractSectionTitle(section, v5Website.copy, index),
        content: extractSectionContent(section, v5Website.copy),
        order: index
      })),
    seo: {
      title: v5Website.copy.hero.headline || 'Home',
      description: v5Website.copy.hero.subheadline || '',
      keywords: extractKeywords(v5Website.copy)
    },
    order: 0
  };
  
  return [homePage];
}

/**
 * Map v5.0 section types to MultiPageWebsite section types
 */
function mapSectionType(v5Type: string): PageSpec['sections'][0]['type'] {
  const typeMap: Record<string, PageSpec['sections'][0]['type']> = {
    'hero': 'hero',
    'features': 'features',
    'testimonials': 'testimonials',
    'pricing': 'pricing',
    'contact': 'contact',
    'cta': 'cta',
    'gallery': 'gallery',
    'team': 'team',
    'stats': 'stats',
    'faq': 'faq'
  };
  
  return typeMap[v5Type] || 'features';
}

/**
 * Extract section title from v5.0 layout or copy
 */
function extractSectionTitle(section: any, copy: any, index: number): string {
  // Try to find matching section in copy
  if (copy.sections && Array.isArray(copy.sections) && copy.sections[index]) {
    return copy.sections[index].heading || '';
  }
  
  // Use section layout or type as title
  return section.layout || section.type || `Section ${index + 1}`;
}

/**
 * Extract section content from v5.0 copy
 */
function extractSectionContent(section: any, copy: any): string {
  // Try to find matching section in copy by index or heading
  if (copy.sections && Array.isArray(copy.sections)) {
    // First try by index
    const indexMatch = copy.sections.find((s: any, idx: number) => 
      section.layout?.toLowerCase().includes(s.heading?.toLowerCase() || '') ||
      s.heading?.toLowerCase().includes(section.layout?.toLowerCase() || '')
    );
    
    if (indexMatch) {
      return indexMatch.body || indexMatch.content || indexMatch.description || '';
    }
  }
  
  // Fallback: use section components or layout description
  if (section.components && section.components.length > 0) {
    return section.components.join(', ');
  }
  
  return section.layout || section.type || '';
}

/**
 * Convert v5.0 style system to MultiPageWebsite design system
 */
function convertDesignSystem(styleSystem: any): DesignSystem {
  return {
    colors: {
      primary: styleSystem.colors?.primary || '#2563EB',
      accent: styleSystem.colors?.accent || styleSystem.colors?.secondary || '#10B981',
      background: styleSystem.colors?.background || '#FFFFFF',
      text: styleSystem.colors?.text || '#1F2937'
    },
    typography: {
      headingFont: styleSystem.typography?.heading?.font || 'Inter',
      bodyFont: styleSystem.typography?.body?.font || 'Inter',
      sizes: {
        h1: styleSystem.typography?.heading?.sizes?.h1 || '2.5rem',
        h2: styleSystem.typography?.heading?.sizes?.h2 || '2rem',
        body: styleSystem.typography?.body?.sizes?.body || '1rem'
      }
    },
    spacing: {
      section: styleSystem.spacing?.section || '4rem',
      element: styleSystem.spacing?.element || '1rem'
    },
    borderRadius: styleSystem.borderRadius || '0.5rem'
  };
}

/**
 * Extract keywords from copy
 */
function extractKeywords(copy: any): string[] {
  const keywords: string[] = [];
  
  if (copy.hero?.headline) {
    keywords.push(...copy.hero.headline.split(' ').slice(0, 3));
  }
  
  if (copy.valueProposition) {
    keywords.push(...copy.valueProposition.split(' ').slice(0, 5));
  }
  
  return [...new Set(keywords)].slice(0, 10);
}

/**
 * Extract header from HTML
 */
function extractHeader(html: string): string {
  const headerMatch = html.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
  return headerMatch ? headerMatch[1] : '';
}

/**
 * Extract footer from HTML
 */
function extractFooter(html: string): string {
  const footerMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
  return footerMatch ? footerMatch[1] : '';
}

/**
 * Extract navigation from HTML
 */
function extractNavigation(html: string): string {
  const navMatch = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i);
  return navMatch ? navMatch[1] : '';
}

/**
 * Generate checksum for file
 */
function generateChecksum(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

