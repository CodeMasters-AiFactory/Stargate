/**
 * HTML/CSS Generator for Merlin 7.0
 * Generates complete multi-page website from Merlin 7.0 engine outputs
 */

import * as fs from 'fs';
import * as path from 'path';
import type { PlannedPage } from '../types/plannedPage';
import type { GeneratedLayout } from './layoutEngine';
import type { DesignTokens } from '../types/designTokens';
import type { GeneratedImage } from './imageEngine';
import type { SectionCopy } from './copyEngine';
import type { PageSEOData } from './seoEngine';
import type { ResponsiveRules } from './responsiveEngine';
import { generateResponsiveCSS } from './responsiveEngine';

export interface GeneratedWebsite {
  pages: Map<string, PageHTML>;
  sharedCSS: string;
  sharedJS: string;
  assets: {
    images: GeneratedImage[];
  };
}

export interface PageHTML {
  slug: string;
  filename: string;
  html: string;
  seo: PageSEOData;
}

/**
 * Generate complete website HTML/CSS
 */
export async function generateWebsiteHTML(
  pages: PlannedPage[],
  layouts: Map<string, GeneratedLayout>,
  designTokens: DesignTokens,
  images: GeneratedImage[],
  copies: Map<string, SectionCopy>,
  seo: Map<string, PageSEOData>,
  responsiveRules: Map<string, ResponsiveRules>,
  projectConfig: { projectName: string; projectSlug: string }
): GeneratedWebsite {
  // Generate default responsive rules if map is empty
  if (responsiveRules.size === 0) {
    for (const [pageId, layout] of layouts.entries()) {
      const { generateResponsiveRules } = await import('./responsiveEngine');
      const rules = generateResponsiveRules(layout, designTokens);
      responsiveRules.set(pageId, rules);
    }
  }
  
  const pageHTMLs = new Map<string, PageHTML>();
  
  // Generate HTML for each page
  for (const page of pages) {
    const layout = layouts.get(page.id);
    if (!layout) {
      console.warn(`[HTML Generator] No layout found for page ${page.id}, skipping`);
      continue;
    }
    
    const pageSEO = seo.get(page.id);
    if (!pageSEO) {
      console.warn(`[HTML Generator] No SEO data found for page ${page.id}, skipping`);
      continue;
    }
    
    const html = generatePageHTML(
      page,
      pages, // Pass all pages for navigation
      layout,
      designTokens,
      images,
      copies,
      pageSEO,
      responsiveRules.get(page.id),
      projectConfig
    );
    
    const filename = page.slug === 'home' ? 'index.html' : `${page.slug}.html`;
    
    pageHTMLs.set(page.id, {
      slug: page.slug,
      filename,
      html,
      seo: pageSEO,
    });
  }
  
  // Generate shared CSS
  const sharedCSS = generateSharedCSS(designTokens, responsiveRules);
  
  // Generate shared JS
  const sharedJS = generateSharedJS();
  
  return {
    pages: pageHTMLs,
    sharedCSS,
    sharedJS,
    assets: {
      images,
    },
  };
}

/**
 * Generate HTML for a single page
 */
function generatePageHTML(
  page: PlannedPage,
  allPages: PlannedPage[],
  layout: GeneratedLayout,
  designTokens: DesignTokens,
  images: GeneratedImage[],
  copies: Map<string, SectionCopy>,
  seo: PageSEOData,
  _responsiveRules: ResponsiveRules | undefined,
  projectConfig: { projectName: string; projectSlug: string }
): string {
  // Build head section
  const head = generateHead(seo, designTokens);
  
  // Build navigation with all pages for proper links
  const navigation = generateNavigation(page, allPages, projectConfig);
  
  // Build main content - use page plan sections if available, otherwise use layout sections
  let mainContent = '<main class="main-content">\n';
  
  // Use page.sections if defined (from page plan), otherwise fall back to layout.sections
  const sectionsToRender = page.sections && page.sections.length > 0 
    ? page.sections.map(s => ({
        id: s.id,
        type: s.type,
        order: s.order,
        required: s.required,
      }))
    : layout.sections;
  
  // Sort sections by order
  const sortedSections = [...sectionsToRender].sort((a, b) => (a.order || 0) - (b.order || 0));
  
  for (const section of sortedSections) {
    const sectionCopy = copies.get(`${page.id}-${section.id}`);
    const sectionImages = images.filter(img => img.plan.section === section.id);
    
    mainContent += generateSectionHTML(
      section,
      sectionCopy,
      sectionImages,
      designTokens,
      layout.selectedVariant
    );
  }
  
  mainContent += '</main>\n';
  
  // Build footer
  const footer = generateFooter(projectConfig);
  
  // Combine everything
  return `<!DOCTYPE html>
<html lang="en">
${head}
<body>
${navigation}
${mainContent}
${footer}
<script src="assets/scripts/main.js"></script>
</body>
</html>`;
}

/**
 * Generate head section with SEO
 */
function generateHead(seo: PageSEOData, designTokens: DesignTokens): string {
  const schemaJSON = seo.schema ? JSON.stringify(seo.schema, null, 2) : '';
  
  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seo.title}</title>
  <meta name="description" content="${seo.metaDescription}">
  ${seo.keywords.length > 0 ? `<meta name="keywords" content="${seo.keywords.join(', ')}">` : ''}
  <link rel="canonical" href="${seo.canonical}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${seo.og.title}">
  <meta property="og:description" content="${seo.og.description}">
  <meta property="og:image" content="${seo.og.image}">
  <meta property="og:url" content="${seo.og.url}">
  <meta property="og:type" content="${seo.og.type}">
  ${seo.og.siteName ? `<meta property="og:site_name" content="${seo.og.siteName}">` : ''}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="${seo.twitter.card}">
  <meta name="twitter:title" content="${seo.twitter.title}">
  <meta name="twitter:description" content="${seo.twitter.description}">
  <meta name="twitter:image" content="${seo.twitter.image}">
  
  <!-- Schema.org -->
  ${schemaJSON ? `<script type="application/ld+json">
${schemaJSON}
</script>` : ''}
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${designTokens.typography.fontFamilies.heading.replace(/\s+/g, '+')}:wght@400;600;700&family=${designTokens.typography.fontFamilies.body.replace(/\s+/g, '+')}:wght@400;500;600&display=swap" rel="stylesheet">
  
  <!-- Styles -->
  <link rel="stylesheet" href="assets/styles/main.css">
</head>`;
}

/**
 * Generate navigation with relative file paths for static sites
 */
function generateNavigation(
  currentPage: PlannedPage,
  allPages: PlannedPage[],
  projectConfig: { projectName: string }
): string {
  // Get primary navigation pages (required pages, sorted by order)
  const navPages = allPages
    .filter(p => p.required)
    .sort((a, b) => a.order - b.order);
  
  // Convert slug to filename for static sites
  const slugToFilename = (slug: string): string => {
    if (slug === 'home') return 'index.html';
    return `${slug}.html`;
  };
  
  // Get current page filename (reserved for future use)
  slugToFilename(currentPage.slug);
  
  let navItems = '';
  for (const page of navPages) {
    const filename = slugToFilename(page.slug);
    const isActive = currentPage.id === page.id;
    navItems += `      <li><a href="${filename}" class="${isActive ? 'active' : ''}">${page.title}</a></li>\n`;
  }
  
  // Home page logo link
  const homeLink = currentPage.slug === 'home' ? 'index.html' : 'index.html';
  
  return `<nav class="navigation">
  <div class="nav-container">
    <a href="${homeLink}" class="nav-logo">${projectConfig.projectName}</a>
    <ul class="nav-menu">
${navItems}    </ul>
  </div>
</nav>`;
}

/**
 * Generate section HTML
 */
function generateSectionHTML(
  section: any,
  copy: SectionCopy | undefined,
  images: GeneratedImage[],
  designTokens: DesignTokens,
  _variant: any
): string {
  if (!copy) {
    copy = {
      headline: section.type,
      description: '',
    };
  }
  
  const heroImage = images.find(img => img.plan.type === 'hero');
  const sectionImages = images.filter(img => img.plan.section === section.id);
  
  let html = `<section class="section section-${section.id} section-${section.type}">\n`;
  html += `  <div class="section-container">\n`;
  
  // Hero section
  if (section.type === 'hero') {
    html += generateHeroHTML(copy, heroImage, designTokens);
  }
  // Features section
  else if (section.type === 'features' || section.type === 'services') {
    html += generateFeaturesHTML(copy, sectionImages, designTokens);
  }
  // About section
  else if (section.type === 'about') {
    html += generateAboutHTML(copy, sectionImages, designTokens);
  }
  // Contact section
  else if (section.type === 'contact') {
    html += generateContactHTML(copy, designTokens);
  }
  // Default section
  else {
    html += generateDefaultSectionHTML(copy, designTokens);
  }
  
  html += `  </div>\n`;
  html += `</section>\n`;
  
  return html;
}

/**
 * Generate hero HTML
 */
function generateHeroHTML(
  copy: SectionCopy,
  image: GeneratedImage | undefined,
  _designTokens: DesignTokens
): string {
  const imageUrl = image?.url || '';
  const imageAlt = image?.plan.alt || copy.headline;
  
  return `    <div class="hero">
      ${imageUrl ? `<div class="hero-image"><img src="${imageUrl}" alt="${imageAlt}"></div>` : ''}
      <div class="hero-content">
        <h1 class="hero-headline">${copy.headline}</h1>
        ${copy.subheadline ? `<p class="hero-subheadline">${copy.subheadline}</p>` : ''}
        ${copy.description ? `<p class="hero-description">${copy.description}</p>` : ''}
        ${copy.cta ? `<a href="${convertLinkToRelative(copy.cta.link)}" class="btn btn-${copy.cta.style}">${copy.cta.text}</a>` : ''}
      </div>
    </div>`;
}

/**
 * Generate features HTML
 */
function generateFeaturesHTML(
  copy: SectionCopy,
  images: GeneratedImage[],
  _designTokens: DesignTokens
): string {
  let html = `    <div class="features">
      <h2 class="section-headline">${copy.headline}</h2>
      ${copy.description ? `<p class="section-description">${copy.description}</p>` : ''}
      <div class="features-grid">\n`;
  
  if (copy.bullets && copy.bullets.length > 0) {
    copy.bullets.forEach((bullet, index) => {
      const image = images[index];
      html += `        <div class="feature-item">
          ${image ? `<img src="${image.url}" alt="${image.plan.alt}" class="feature-image">` : ''}
          <h3 class="feature-title">${bullet}</h3>
        </div>\n`;
    });
  }
  
  html += `      </div>
    </div>`;
  
  return html;
}

/**
 * Generate about HTML
 */
function generateAboutHTML(
  copy: SectionCopy,
  images: GeneratedImage[],
  _designTokens: DesignTokens
): string {
  const image = images[0];
  
  return `    <div class="about">
      ${image ? `<div class="about-image"><img src="${image.url}" alt="${image.plan.alt}"></div>` : ''}
      <div class="about-content">
        <h2 class="section-headline">${copy.headline}</h2>
        ${copy.description ? `<p class="section-description">${copy.description}</p>` : ''}
        ${copy.bullets ? `<ul class="about-list">${copy.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
      </div>
    </div>`;
}

/**
 * Generate contact HTML
 */
function generateContactHTML(
  copy: SectionCopy,
  _designTokens: DesignTokens
): string {
  return `    <div class="contact">
      <h2 class="section-headline">${copy.headline}</h2>
      ${copy.description ? `<p class="section-description">${copy.description}</p>` : ''}
      <form class="contact-form">
        <input type="text" placeholder="Name" required>
        <input type="email" placeholder="Email" required>
        <textarea placeholder="Message" required></textarea>
        <button type="submit" class="btn btn-primary">${copy.cta?.text || 'Send Message'}</button>
      </form>
    </div>`;
}

/**
 * Generate default section HTML
 */
function generateDefaultSectionHTML(
  copy: SectionCopy,
  _designTokens: DesignTokens
): string {
  return `    <div class="section-content">
      <h2 class="section-headline">${copy.headline}</h2>
      ${copy.description ? `<p class="section-description">${copy.description}</p>` : ''}
      ${copy.cta ? `<a href="${copy.cta.link}" class="btn btn-${copy.cta.style}">${copy.cta.text}</a>` : ''}
    </div>`;
}

/**
 * Convert absolute links to relative file paths for static sites
 */
function convertLinkToRelative(link: string): string {
  // If already relative, return as-is
  if (!link.startsWith('/')) {
    return link;
  }
  
  // Convert absolute paths to relative file paths
  if (link === '/') {
    return 'index.html';
  }
  
  // Remove leading slash and add .html if not present
  const path = link.replace(/^\//, '');
  if (path.endsWith('.html')) {
    return path;
  }
  
  return `${path}.html`;
}

/**
 * Generate footer
 */
function generateFooter(projectConfig: { projectName: string }): string {
  return `<footer class="footer">
  <div class="footer-container">
    <p>&copy; ${new Date().getFullYear()} ${projectConfig.projectName}. All rights reserved.</p>
  </div>
</footer>`;
}

/**
 * Generate shared CSS
 */
function generateSharedCSS(
  designTokens: DesignTokens,
  responsiveRules: Map<string, ResponsiveRules>
): string {
  const css = `/* Merlin 7.0 Generated CSS */
:root {
  /* Colors */
  --color-primary: ${designTokens.colors.primary[500]};
  --color-secondary: ${designTokens.colors.secondary[500]};
  --color-accent: ${designTokens.colors.accent[500]};
  
  /* Typography */
  --font-heading: ${designTokens.typography.fontFamilies.heading};
  --font-body: ${designTokens.typography.fontFamilies.body};
  --font-size-base: ${designTokens.typography.fontSizes.base};
  
  /* Spacing */
  --spacing-4: ${designTokens.spacing[4]};
  --spacing-8: ${designTokens.spacing[8]};
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  line-height: ${designTokens.typography.lineHeights.normal};
  color: ${designTokens.colors.neutral[900]};
  background-color: ${designTokens.colors.neutral[50]};
}

/* Navigation */
.navigation {
  background: white;
  box-shadow: ${designTokens.shadows.sm};
  padding: ${designTokens.spacing[4]} 0;
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${designTokens.spacing[4]};
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-family: var(--font-heading);
  font-size: ${designTokens.typography.fontSizes.xl};
  font-weight: ${designTokens.typography.fontWeights.bold};
  color: var(--color-primary);
  text-decoration: none;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: ${designTokens.spacing[6]};
}

.nav-menu a {
  color: ${designTokens.colors.neutral[700]};
  text-decoration: none;
  font-weight: ${designTokens.typography.fontWeights.medium};
}

.nav-menu a.active,
.nav-menu a:hover {
  color: var(--color-primary);
}

/* Main Content */
.main-content {
  min-height: calc(100vh - 200px);
}

/* Sections */
.section {
  padding: ${designTokens.spacing[16]} 0;
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${designTokens.spacing[4]};
}

.section-headline {
  font-family: var(--font-heading);
  font-size: ${designTokens.typography.fontSizes['4xl']};
  font-weight: ${designTokens.typography.fontWeights.bold};
  color: ${designTokens.colors.neutral[900]};
  margin-bottom: ${designTokens.spacing[6]};
}

.section-description {
  font-size: ${designTokens.typography.fontSizes.lg};
  color: ${designTokens.colors.neutral[600]};
  margin-bottom: ${designTokens.spacing[8]};
}

/* Hero */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${designTokens.spacing[8]};
  align-items: center;
}

.hero-headline {
  font-family: var(--font-heading);
  font-size: ${designTokens.typography.fontSizes['5xl']};
  font-weight: ${designTokens.typography.fontWeights.extrabold};
  color: ${designTokens.colors.neutral[900]};
  margin-bottom: ${designTokens.spacing[4]};
}

.hero-subheadline {
  font-size: ${designTokens.typography.fontSizes.xl};
  color: ${designTokens.colors.neutral[600]};
  margin-bottom: ${designTokens.spacing[6]};
}

.hero-image img {
  width: 100%;
  height: auto;
  border-radius: ${designTokens.theme.borderRadius.lg};
}

/* Buttons */
.btn {
  display: inline-block;
  padding: ${designTokens.components.button.primary.padding};
  font-size: ${designTokens.components.button.primary.fontSize};
  font-weight: ${designTokens.components.button.primary.fontWeight};
  border-radius: ${designTokens.components.button.primary.borderRadius};
  text-decoration: none;
  transition: ${designTokens.theme.transitions.normal};
}

.btn-primary {
  background-color: ${designTokens.components.button.primary.backgroundColor};
  color: ${designTokens.components.button.primary.textColor};
  box-shadow: ${designTokens.shadows.md};
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: ${designTokens.shadows.lg};
}

/* Features */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${designTokens.spacing[8]};
}

.feature-item {
  padding: ${designTokens.spacing[6]};
  background: white;
  border-radius: ${designTokens.theme.borderRadius.lg};
  box-shadow: ${designTokens.shadows.md};
}

/* Footer */
.footer {
  background: ${designTokens.colors.neutral[900]};
  color: ${designTokens.colors.neutral[100]};
  padding: ${designTokens.spacing[8]} 0;
  text-align: center;
}

/* Responsive CSS */
${Array.from(responsiveRules.values())
  .map(rules => generateResponsiveCSS(rules, designTokens))
  .join('\n')}
`;

  return css;
}

/**
 * Generate shared JavaScript
 */
function generateSharedJS(): string {
  return `// Merlin 7.0 Generated JavaScript
console.log('Website loaded');

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Form handling
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    // Form submission logic here
    console.log('Form submitted');
  });
});
`;
}

/**
 * Save generated website to filesystem
 */
export function saveGeneratedWebsite(
  website: GeneratedWebsite,
  projectSlug: string
): void {
  const outputDir = path.join(process.cwd(), 'website_projects', projectSlug, 'generated-v5');
  
  // Create directories
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const assetsDir = path.join(outputDir, 'assets');
  const stylesDir = path.join(assetsDir, 'styles');
  const scriptsDir = path.join(assetsDir, 'scripts');
  const imagesDir = path.join(assetsDir, 'images');
  
  [assetsDir, stylesDir, scriptsDir, imagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Save HTML pages
  for (const [_pageId, pageHTML] of website.pages.entries()) {
    const filePath = path.join(outputDir, pageHTML.filename);
    fs.writeFileSync(filePath, pageHTML.html, 'utf-8');
  }
  
  // Save CSS
  fs.writeFileSync(path.join(stylesDir, 'main.css'), website.sharedCSS, 'utf-8');
  
  // Save JS
  fs.writeFileSync(path.join(scriptsDir, 'main.js'), website.sharedJS, 'utf-8');
  
  // Copy images (they should already be in the images directory)
  // Images are handled by the Image Engine
}

