/**
 * Template Dependency Checker
 * 
 * Analyzes templates to find:
 * - CSS frameworks (Bootstrap, Tailwind, etc.)
 * - JavaScript libraries (jQuery, React, Vue, etc.)
 * - Fonts (Google Fonts, Adobe Fonts, etc.)
 * - Icons (Font Awesome, Material Icons, etc.)
 * - Other dependencies
 * 
 * Stores results for immediate use in template preview/generation
 */

import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { db } from '../db';
import { brandTemplates } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface DependencyAnalysis {
  templateId: string;
  templateName: string;
  cssFrameworks: string[];
  jsLibraries: string[];
  fonts: string[];
  icons: string[];
  cdnUrls: string[];
  missingDependencies: string[];
  hasInlineCSS: boolean;
  hasInlineJS: boolean;
  hasExternalCSS: boolean;
  hasExternalJS: boolean;
  totalDependencies: number;
  checkedAt: Date;
}

export interface DependencyInventory {
  totalTemplates: number;
  checkedTemplates: number;
  cssFrameworks: Record<string, number>; // Framework name -> count
  jsLibraries: Record<string, number>;
  fonts: Record<string, number>;
  icons: Record<string, number>;
  missingDependencies: Record<string, number>;
  topDependencies: Array<{ name: string; type: string; count: number }>;
}

/**
 * Analyze a single template for dependencies
 */
export async function analyzeTemplateDependencies(templateId: string): Promise<DependencyAnalysis | null> {
  try {
    // Load template from database
    let template: any = null;
    if (db) {
      const [dbTemplate] = await db
        .select()
        .from(brandTemplates)
        .where(eq(brandTemplates.id, templateId))
        .limit(1);

      if (dbTemplate) {
        template = dbTemplate;
      }
    }

    if (!template) {
      console.error(`[DependencyChecker] Template not found: ${templateId}`);
      return null;
    }

    const html = (template.contentData as any)?.html || '';
    const css = template.css || (template.contentData as any)?.css || '';
    const js = (template.contentData as any)?.js || '';

    // Parse HTML
    const $ = cheerio.load(html);

    // Detect CSS Frameworks
    const cssFrameworks: string[] = [];
    const cssText = (html + css).toLowerCase();
    
    if (cssText.includes('bootstrap') || cssText.includes('bs-') || cssText.includes('.container-fluid')) {
      cssFrameworks.push('Bootstrap');
    }
    if (cssText.includes('tailwind') || cssText.includes('tw-') || cssText.includes('@tailwind')) {
      cssFrameworks.push('Tailwind CSS');
    }
    if (cssText.includes('foundation')) {
      cssFrameworks.push('Foundation');
    }
    if (cssText.includes('bulma')) {
      cssFrameworks.push('Bulma');
    }
    if (cssText.includes('materialize')) {
      cssFrameworks.push('Materialize');
    }
    if (cssText.includes('semantic-ui') || cssText.includes('semantic ui')) {
      cssFrameworks.push('Semantic UI');
    }
    if (cssText.includes('uikit')) {
      cssFrameworks.push('UIKit');
    }

    // Detect JavaScript Libraries
    const jsLibraries: string[] = [];
    const jsText = (html + js).toLowerCase();
    
    // Check script tags
    $('script[src]').each((_, el) => {
      const src = $(el).attr('src') || '';
      const srcLower = src.toLowerCase();
      
      if (srcLower.includes('jquery') || srcLower.includes('jq-')) {
        jsLibraries.push('jQuery');
      }
      if (srcLower.includes('react') || srcLower.includes('react-dom')) {
        jsLibraries.push('React');
      }
      if (srcLower.includes('vue')) {
        jsLibraries.push('Vue.js');
      }
      if (srcLower.includes('angular')) {
        jsLibraries.push('Angular');
      }
      if (srcLower.includes('svelte')) {
        jsLibraries.push('Svelte');
      }
      if (srcLower.includes('alpine')) {
        jsLibraries.push('Alpine.js');
      }
      if (srcLower.includes('swiper')) {
        jsLibraries.push('Swiper');
      }
      if (srcLower.includes('aos') || srcLower.includes('aos.js')) {
        jsLibraries.push('AOS (Animate On Scroll)');
      }
      if (srcLower.includes('gsap') || srcLower.includes('greensock')) {
        jsLibraries.push('GSAP');
      }
      if (srcLower.includes('three.js') || srcLower.includes('threejs')) {
        jsLibraries.push('Three.js');
      }
      if (srcLower.includes('lodash')) {
        jsLibraries.push('Lodash');
      }
      if (srcLower.includes('moment')) {
        jsLibraries.push('Moment.js');
      }
      if (srcLower.includes('chart.js') || srcLower.includes('chartjs')) {
        jsLibraries.push('Chart.js');
      }
    });

    // Check inline JS
    if (jsText.includes('jquery') || jsText.includes('$(') || jsText.includes('jQuery')) {
      if (!jsLibraries.includes('jQuery')) jsLibraries.push('jQuery');
    }
    if (jsText.includes('react') || jsText.includes('ReactDOM')) {
      if (!jsLibraries.includes('React')) jsLibraries.push('React');
    }
    if (jsText.includes('vue') || jsText.includes('Vue.')) {
      if (!jsLibraries.includes('Vue.js')) jsLibraries.push('Vue.js');
    }

    // Detect Fonts
    const fonts: string[] = [];
    $('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const match = href.match(/family=([^&]+)/);
      if (match) {
        const fontFamily = decodeURIComponent(match[1]).split(':')[0];
        if (!fonts.includes(fontFamily)) {
          fonts.push(fontFamily);
        }
      }
    });
    
    // Check for Adobe Fonts
    if (html.includes('use.typekit.net') || html.includes('adobe-fonts')) {
      fonts.push('Adobe Fonts');
    }
    
    // Check CSS for font-family declarations
    const fontMatches = css.match(/font-family:\s*['"]?([^'";}]+)/gi);
    if (fontMatches) {
      fontMatches.forEach(match => {
        const fontName = match.replace(/font-family:\s*/i, '').replace(/['"]/g, '').split(',')[0].trim();
        if (fontName && !fontName.includes('sans-serif') && !fontName.includes('serif') && !fontName.includes('monospace')) {
          if (!fonts.includes(fontName)) {
            fonts.push(fontName);
          }
        }
      });
    }

    // Detect Icons
    const icons: string[] = [];
    if (html.includes('font-awesome') || html.includes('fontawesome') || html.includes('fa-')) {
      icons.push('Font Awesome');
    }
    if (html.includes('material-icons') || html.includes('material-icons-outlined')) {
      icons.push('Material Icons');
    }
    if (html.includes('ionicons')) {
      icons.push('Ionicons');
    }
    if (html.includes('feather') || html.includes('feather-icons')) {
      icons.push('Feather Icons');
    }
    if (html.includes('heroicons')) {
      icons.push('Heroicons');
    }

    // Collect CDN URLs
    const cdnUrls: string[] = [];
    $('link[href], script[src]').each((_, el) => {
      const href = $(el).attr('href') || $(el).attr('src') || '';
      if (href.startsWith('http') && !cdnUrls.includes(href)) {
        cdnUrls.push(href);
      }
    });

    // Check what we have vs what's needed
    const missingDependencies: string[] = [];
    const allDeps = [...cssFrameworks, ...jsLibraries, ...fonts, ...icons];
    
    // TODO: Check against our dependency inventory
    // For now, just list what we found

    return {
      templateId,
      templateName: template.name,
      cssFrameworks: [...new Set(cssFrameworks)],
      jsLibraries: [...new Set(jsLibraries)],
      fonts: [...new Set(fonts)],
      icons: [...new Set(icons)],
      cdnUrls,
      missingDependencies,
      hasInlineCSS: css.length > 0,
      hasInlineJS: js.length > 0,
      hasExternalCSS: $('link[rel="stylesheet"]').length > 0,
      hasExternalJS: $('script[src]').length > 0,
      totalDependencies: allDeps.length,
      checkedAt: new Date(),
    };
  } catch (error) {
    logError(error, 'DependencyChecker - Analyze Template');
    return null;
  }
}

/**
 * Get current dependency inventory (what we have available)
 */
export async function getCurrentDependencyInventory(): Promise<{
  availableCSS: string[];
  availableJS: string[];
  availableFonts: string[];
  availableIcons: string[];
  totalAvailable: number;
}> {
  // Check what's in templateDependencyInjector
  const { COMMON_DEPENDENCIES } = await import('./templateDependencyInjector');
  
  const availableCSS: string[] = [];
  const availableJS: string[] = [];
  const availableFonts: string[] = ['Google Fonts (all)', 'System Fonts'];
  const availableIcons: string[] = ['Font Awesome', 'Material Icons', 'Heroicons'];

  COMMON_DEPENDENCIES.forEach(dep => {
    if (dep.type === 'css') {
      if (dep.name.includes('bootstrap')) {
        if (!availableCSS.includes('Bootstrap')) availableCSS.push('Bootstrap');
      } else if (dep.name.includes('jquery-ui')) {
        if (!availableCSS.includes('jQuery UI')) availableCSS.push('jQuery UI');
      } else {
        availableCSS.push(dep.name);
      }
    } else if (dep.type === 'js') {
      if (dep.name.includes('jquery')) {
        if (!availableJS.includes('jQuery')) availableJS.push('jQuery');
      } else if (dep.name.includes('bootstrap')) {
        if (!availableJS.includes('Bootstrap JS')) availableJS.push('Bootstrap JS');
      } else {
        availableJS.push(dep.name);
      }
    }
  });

  return {
    availableCSS,
    availableJS,
    availableFonts,
    availableIcons,
    totalAvailable: availableCSS.length + availableJS.length + availableFonts.length + availableIcons.length,
  };
}

/**
 * Check all templates and build inventory
 */
export async function checkAllTemplates(): Promise<DependencyInventory> {
  try {
    if (!db) {
      throw new Error('Database not available');
    }

    const allTemplates = await db.select().from(brandTemplates);
    const totalTemplates = allTemplates.length;

    const cssFrameworks: Record<string, number> = {};
    const jsLibraries: Record<string, number> = {};
    const fonts: Record<string, number> = {};
    const icons: Record<string, number> = {};
    const missingDependencies: Record<string, number> = {};

    let checkedTemplates = 0;

    console.log(`[DependencyChecker] Checking ${totalTemplates} templates...`);

    for (const template of allTemplates) {
      try {
        const analysis = await analyzeTemplateDependencies(template.id);
        if (analysis) {
          checkedTemplates++;

          // Count CSS frameworks
          analysis.cssFrameworks.forEach(fw => {
            cssFrameworks[fw] = (cssFrameworks[fw] || 0) + 1;
          });

          // Count JS libraries
          analysis.jsLibraries.forEach(lib => {
            jsLibraries[lib] = (jsLibraries[lib] || 0) + 1;
          });

          // Count fonts
          analysis.fonts.forEach(font => {
            fonts[font] = (fonts[font] || 0) + 1;
          });

          // Count icons
          analysis.icons.forEach(icon => {
            icons[icon] = (icons[icon] || 0) + 1;
          });

          // Count missing dependencies
          analysis.missingDependencies.forEach(dep => {
            missingDependencies[dep] = (missingDependencies[dep] || 0) + 1;
          });
        }
      } catch (error) {
        console.error(`[DependencyChecker] Error checking template ${template.id}:`, getErrorMessage(error));
      }
    }

    // Build top dependencies list
    const topDependencies: Array<{ name: string; type: string; count: number }> = [];
    
    Object.entries(cssFrameworks).forEach(([name, count]) => {
      topDependencies.push({ name, type: 'CSS Framework', count });
    });
    Object.entries(jsLibraries).forEach(([name, count]) => {
      topDependencies.push({ name, type: 'JS Library', count });
    });
    Object.entries(fonts).forEach(([name, count]) => {
      topDependencies.push({ name, type: 'Font', count });
    });
    Object.entries(icons).forEach(([name, count]) => {
      topDependencies.push({ name, type: 'Icon Set', count });
    });

    topDependencies.sort((a, b) => b.count - a.count);

    console.log(`[DependencyChecker] ✅ Checked ${checkedTemplates}/${totalTemplates} templates`);

    return {
      totalTemplates,
      checkedTemplates,
      cssFrameworks,
      jsLibraries,
      fonts,
      icons,
      missingDependencies,
      topDependencies: topDependencies.slice(0, 50), // Top 50
    };
  } catch (error) {
    logError(error, 'DependencyChecker - Check All Templates');
    throw error;
  }
}

/**
 * Check specific templates by IDs
 */
export async function checkTemplates(templateIds: string[]): Promise<DependencyAnalysis[]> {
  const results: DependencyAnalysis[] = [];

  for (const templateId of templateIds) {
    const analysis = await analyzeTemplateDependencies(templateId);
    if (analysis) {
      results.push(analysis);
    }
  }

  return results;
}

