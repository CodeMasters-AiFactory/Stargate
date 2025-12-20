/**
 * Merlin v6.8 - Multi-Page Generator
 * Generates multiple HTML pages with shared navigation, header, footer
 */

import type { LayoutStructure, SectionDefinition } from './layoutLLM';
import type { StyleSystem } from './styleSystem';
import type { CopyContent } from './copywritingV2';
import type { PlannedPage } from './pagePlanner';
import type { SectionCopy } from '../ai/copywriterLLM';
import type { DesignContext } from './designThinking';
import type { GlobalTheme } from '../ai/themeEngineLLM';
import { generateCSS, generateJavaScript, generateSectionHTML } from './codeGenerator';
import { generateSEOForSite } from '../ai/seoEngineLLM';
import * as fs from 'fs';
import * as path from 'path';

export interface MultiPageCode {
  pages: Array<{
    id: string;
    slug: string;
    html: string;
    seo?: any;
  }>;
  css: string;
  javascript?: string;
}

/**
 * Generate navigation HTML
 */
function generateNavigationHTML(
  plannedPages: PlannedPage[],
  currentPageId: string,
  projectName: string
): string {
  const navItems = plannedPages.map(page => ({
    id: page.id,
    slug: page.slug === '/' ? '/index' : page.slug,
    title: page.title,
    active: page.id === currentPageId
  }));
  
  const navLinks = navItems.map(item => {
    const activeClass = item.active ? ' active' : '';
    const href = item.slug === '/index' ? 'index.html' : `${item.slug.substring(1)}.html`;
    return `        <li class="cm-nav-item"><a href="${href}" class="cm-nav-link${activeClass}">${item.title}</a></li>`;
  }).join('\n');
  
  return `  <nav class="cm-nav" role="navigation">
    <div class="cm-nav-container">
      <div class="cm-nav-brand">
        <a href="index.html" class="cm-nav-logo">${projectName}</a>
      </div>
      <button class="cm-nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul class="cm-nav-menu">
${navLinks}
      </ul>
    </div>
  </nav>
`;
}

/**
 * Generate footer HTML
 */
function generateFooterHTML(projectName: string, tagline?: string): string {
  const year = new Date().getFullYear();
  return `  <footer class="cm-footer">
    <div class="cm-footer-container">
      <div class="cm-footer-content">
        <div class="cm-footer-brand">
          <h3>${projectName}</h3>
          ${tagline ? `<p>${tagline}</p>` : ''}
        </div>
        <div class="cm-footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div class="cm-footer-bottom">
          <p>&copy; ${year} ${projectName}. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
`;
}

/**
 * Generate page-specific SEO
 */
async function generatePageSEO(
  page: PlannedPage,
  designContext: DesignContext,
  sectionCopies: SectionCopy[],
  projectName: string,
  baseSEO: any,
  layout: LayoutStructure
): Promise<any> {
  // Get page-specific sections
  const pageSections = layout.sections.filter(s => 
    page.sectionKeys.includes(s.key || '')
  );
  
  // Find relevant copy for this page
  const pageCopy = sectionCopies.find(c => 
    pageSections.some(s => s.key === c.sectionKey)
  ) || sectionCopies[0];
  
  // Customize title based on page
  let pageTitle = baseSEO.title;
  if (page.id !== 'home') {
    pageTitle = `${page.title} | ${baseSEO.title.split('|')[0]?.trim() || projectName}`;
  }
  
  // Customize description based on page content
  let pageDescription = baseSEO.description;
  if (pageCopy?.paragraph) {
    pageDescription = pageCopy.paragraph.substring(0, 160);
  }
  
  // Customize schema based on page type
  let schemaLD = baseSEO.schemaLD;
  if (page.id === 'services' || page.id === 'features') {
    // Service page schema
    schemaLD = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': page.title,
      'description': pageDescription,
      'provider': {
        '@type': 'Organization',
        'name': projectName
      }
    };
  } else if (page.id === 'about') {
    // About page schema
    schemaLD = {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      'name': `${page.title} - ${projectName}`,
      'description': pageDescription
    };
  } else if (page.id === 'contact') {
    // Contact page schema
    schemaLD = {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      'name': `${page.title} - ${projectName}`,
      'description': pageDescription
    };
  }
  
  return {
    ...baseSEO,
    title: pageTitle.length > 65 ? pageTitle.substring(0, 62) + '...' : pageTitle,
    description: pageDescription,
    slug: page.slug === '/' ? 'index' : page.slug.substring(1),
    schemaLD: schemaLD || baseSEO.schemaLD
  };
}

/**
 * Generate HTML for a single page
 */
function generatePageHTML(
  pageLayout: LayoutStructure,
  styleSystem: StyleSystem,
  copy: CopyContent,
  pageSEO: any,
  currentPage: PlannedPage,
  allPages: PlannedPage[],
  projectName: string,
  globalTheme?: GlobalTheme | null
): string {
  // Build SEO meta tags
  const seoTitle = pageSEO?.title || copy.hero.headline || 'Website';
  const seoDescription = pageSEO?.description || copy.valueProposition || '';
  const seoKeywords = pageSEO?.keywords?.join(', ') || '';
  const ogTitle = pageSEO?.ogTitle || seoTitle;
  const ogDescription = pageSEO?.ogDescription || seoDescription;
  const ogImage = pageSEO?.ogImage || '';
  const canonicalUrl = pageSEO?.slug ? `https://example.com/${pageSEO.slug}.html` : '';
  const schemaLD = pageSEO?.schemaLD;
  
  // Generate navigation
  const navigation = generateNavigationHTML(allPages, currentPage.id, projectName);
  
  // Generate header
  const header = `  <header class="cm-header">
${navigation}
  </header>
`;
  
  // Generate sections HTML using exported function
  let sectionsHTML = '';
  pageLayout.sections.forEach((section, index) => {
    sectionsHTML += generateSectionHTML(section, copy, styleSystem, index);
  });
  
  // Generate footer
  const footer = generateFooterHTML(projectName, copy.tagline);
  
  // Assemble page HTML
  // Generate Google Fonts link with theme fonts
  const fonts = globalTheme ? {
    display: globalTheme.typography.fontDisplay.replace(' ', '+'),
    heading: globalTheme.typography.fontHeading.replace(' ', '+'),
    body: globalTheme.typography.fontBody.replace(' ', '+')
  } : {
    display: styleSystem.typography.heading.font.replace(' ', '+'),
    heading: styleSystem.typography.heading.font.replace(' ', '+'),
    body: styleSystem.typography.body.font.replace(' ', '+')
  };
  
  const fontsLink = globalTheme
    ? `https://fonts.googleapis.com/css2?family=${fonts.display}:wght@400;600&family=${fonts.heading}:wght@400;700&family=${fonts.body}:wght@300;400;600&display=swap`
    : `https://fonts.googleapis.com/css2?family=${styleSystem.typography.heading.font.replace(' ', '+')}:wght@${styleSystem.typography.heading.weights.join(';')}&family=${styleSystem.typography.body.font.replace(' ', '+')}:wght@${styleSystem.typography.body.weights.join(';')}&display=swap`;
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seoTitle}</title>
  <meta name="description" content="${seoDescription}">
  ${seoKeywords ? `<meta name="keywords" content="${seoKeywords}">` : ''}
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${ogDescription}">
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${ogTitle}">
  <meta name="twitter:description" content="${ogDescription}">
  ${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}
  
  ${canonicalUrl ? `<link rel="canonical" href="${canonicalUrl}">` : ''}
  
  ${schemaLD ? `<script type="application/ld+json">
${JSON.stringify(schemaLD, null, 2)}
</script>` : ''}
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontsLink}" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
${header}
  <main class="cm-main">
${sectionsHTML}
  </main>
${footer}
  <script src="script.js"></script>
</body>
</html>`;
  
  return html;
}

/**
 * Generate multi-page website
 */
export async function generateMultiPageWebsite(
  layout: LayoutStructure,
  styleSystem: StyleSystem,
  copy: CopyContent,
  format: 'html' | 'react' | 'tailwind',
  baseSEO: any,
  plannedPages: PlannedPage[],
  sectionCopies: SectionCopy[],
  designContext: DesignContext,
  projectName: string,
  globalTheme?: GlobalTheme | null
): Promise<MultiPageCode> {
  // Generate shared CSS and JS once (using full layout for CSS)
  const css = generateCSS(styleSystem, layout, globalTheme || undefined);
  const javascript = generateJavaScript(layout);
  
  // Generate each page
  const pages: Array<{ id: string; slug: string; html: string; seo?: any }> = [];
  
  for (const page of plannedPages) {
    // Get sections for this page
    const pageSections = layout.sections.filter(section => 
      page.sectionKeys.includes(section.key || '')
    );
    
    // Create a temporary layout with only this page's sections
    const pageLayout: LayoutStructure = {
      ...layout,
      sections: pageSections
    };
    
    // Generate page-specific SEO
    const pageSEO = await generatePageSEO(page, designContext, sectionCopies, projectName, baseSEO, layout);
    
    // Generate HTML for this page
    const pageHTML = generatePageHTML(
      pageLayout,
      styleSystem,
      copy,
      pageSEO,
      page,
      plannedPages,
      projectName,
      globalTheme
    );
    
    pages.push({
      id: page.id,
      slug: page.slug,
      html: pageHTML,
      seo: pageSEO
    });
  }
  
  return {
    pages,
    css,
    javascript
  };
}

/**
 * Save multi-page website files
 */
export async function saveMultiPageWebsite(
  multiPageCode: MultiPageCode,
  outputDir: string,
  integrations?: Array<{ id: string; enabled: boolean; config: Record<string, any> }>
): Promise<void> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save shared CSS
  fs.writeFileSync(path.join(outputDir, 'styles.css'), multiPageCode.css);
  
  // Save shared JavaScript (with navigation toggle)
  const jsWithNav = addNavigationJavaScript(multiPageCode.javascript || '');
  fs.writeFileSync(path.join(outputDir, 'script.js'), jsWithNav);
  
  // Inject integration scripts into HTML if integrations provided
  const integrationsToInject = integrations?.filter(i => i.enabled) || [];
  const injectIntegrations = integrationsToInject.length > 0;
  
  // Load payment gateway configs for injection
  let paymentGatewayConfigs: any[] = [];
  try {
    const { loadPaymentGatewayConfigs } = require('../../services/paymentGatewayInjection');
    const projectSlug = path.basename(outputDir);
    paymentGatewayConfigs = await loadPaymentGatewayConfigs(projectSlug);
  } catch (error) {
    console.warn('[MultiPageGenerator] Could not load payment gateway configs:', error);
  }
  
  // Save each page HTML (with integrations and payment gateways injected)
  for (const page of multiPageCode.pages) {
    let pageHTML = page.html;
    
    // Inject integration scripts if enabled
    if (injectIntegrations) {
      try {
        const { injectIntegrationScripts } = require('../../services/integrations/integrationService');
        const integrationObjects = integrationsToInject.map(i => ({
          id: i.id,
          enabled: true,
          config: i.config,
          name: '',
          description: '',
          category: 'other' as const,
          requiresAuth: false,
        }));
        pageHTML = injectIntegrationScripts(pageHTML, integrationObjects);
      } catch (error) {
        console.error('[MultiPageGenerator] Failed to inject integrations:', error);
        // Continue without integrations if injection fails
      }
    }
    
    // Inject payment gateway scripts if enabled (Phase 1.3)
    if (paymentGatewayConfigs.length > 0) {
      try {
        const { injectPaymentGatewayScripts } = require('../../services/paymentGatewayInjection');
        pageHTML = injectPaymentGatewayScripts(pageHTML, paymentGatewayConfigs);
      } catch (error) {
        console.error('[MultiPageGenerator] Failed to inject payment gateway scripts:', error);
        // Continue without payment gateways if injection fails
      }
    }
    
    const filename = page.slug === '/' ? 'index.html' : `${page.slug.substring(1)}.html`;
    fs.writeFileSync(path.join(outputDir, filename), pageHTML);
    console.log(`[Merlin v6.8] Saved page: ${filename}${injectIntegrations ? ' (with integrations)' : ''}`);
  }
  
  console.log(`[Merlin v6.8] Multi-page website saved: ${multiPageCode.pages.length} pages`);
}

/**
 * Add navigation JavaScript for mobile menu toggle
 */
function addNavigationJavaScript(existingJS: string): string {
  const navJS = `
// v6.8: Mobile Navigation Toggle
(function() {
  const navToggle = document.querySelector('.cm-nav-toggle');
  const navMenu = document.querySelector('.cm-nav-menu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('cm-nav-menu-open');
      navToggle.classList.toggle('cm-nav-toggle-active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInside = navToggle.contains(event.target) || navMenu.contains(event.target);
      if (!isClickInside && navMenu.classList.contains('cm-nav-menu-open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('cm-nav-menu-open');
        navToggle.classList.remove('cm-nav-toggle-active');
      }
    });
  }
})();
`;
  
  return existingJS + navJS;
}


