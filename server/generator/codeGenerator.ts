/**
 * Code Generator v5.0
 * Generates actual HTML/React/Tailwind code from design specifications
 */

import * as fs from 'fs';
import * as path from 'path';
import type { LayoutStructure, SectionDefinition } from './layoutLLM';
import type { StyleSystem } from './styleSystem';
import type { CopyContent } from './copywritingV2';
import { getResponsiveRulesForVariant } from './responsiveRules';

export interface GeneratedCode {
  html: string;
  css: string;
  javascript?: string;
  react?: string;
  tailwind?: string;
}

/**
 * Generate complete website code
 */
export function generateWebsiteCode(
  layout: LayoutStructure,
  styleSystem: StyleSystem,
  copy: CopyContent,
  _format: 'html' | 'react' | 'tailwind' = 'html',
  seoResult?: any // v6.7: SEO metadata
): GeneratedCode {
  // Always generate HTML for now (format parameter reserved for future use)
  return generateHTML(layout, styleSystem, copy, seoResult);
}

/**
 * Generate HTML + CSS + JS
 */
function generateHTML(
  layout: LayoutStructure,
  styleSystem: StyleSystem,
  copy: CopyContent,
  seoResult?: any // v6.7: SEO metadata
): GeneratedCode {
  // v6.7: Build SEO meta tags
  const seoTitle = seoResult?.title || copy.hero.headline || 'Website';
  const seoDescription = seoResult?.description || copy.valueProposition || '';
  const seoKeywords = seoResult?.keywords?.join(', ') || '';
  const ogTitle = seoResult?.ogTitle || seoTitle;
  const ogDescription = seoResult?.ogDescription || seoDescription;
  const ogImage = seoResult?.ogImage || '';
  const canonicalUrl = seoResult?.slug ? `https://example.com/${seoResult.slug}.html` : '';
  const schemaLD = seoResult?.schemaLD;
  
  let html = `<!DOCTYPE html>
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
  <link href="https://fonts.googleapis.com/css2?family=${styleSystem.typography.heading.font.replace(' ', '+')}:wght@${styleSystem.typography.heading.weights.join(';')}&family=${styleSystem.typography.body.font.replace(' ', '+')}:wght@${styleSystem.typography.body.weights.join(';')}&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
`;

  // Generate navigation
  html += generateNavigationHTML(copy);
  
  // v6.4: Wrap main content in responsive container
  html += `  <main class="cm-main">`;
  
  // Generate sections (pass index for proper mapping)
  layout.sections.forEach((section, index) => {
    html += generateSectionHTML(section, copy, styleSystem, index);
  });
  
  // Generate footer
  html += generateFooterHTML();
  
  html += `  </main>
  <!-- GSAP Animation Library - 120% Feature -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="script.js"></script>
</body>
</html>`;

  // Generate CSS
  const css = generateCSS(styleSystem, layout);
  
  // Generate JavaScript
  const javascript = generateJavaScript(layout);
  
  return { html, css, javascript };
}

/**
 * Generate React components (reserved for future use)
 */
function _generateReact(
  layout: LayoutStructure,
  styleSystem: StyleSystem,
  copy: CopyContent
): GeneratedCode {
  // Generate main App component
  let react = `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
`;

  layout.sections.forEach((section: { type: string }) => {
    react += generateSectionReact(section, copy, styleSystem);
  });

  react += `    </div>
  );
}

export default App;`;

  // Generate CSS
  const css = generateCSS(styleSystem, layout);

  return { html: '', css, javascript: '', react };
}
void _generateReact; // Reserved for future use

/**
 * Generate Tailwind CSS (reserved for future use)
 */
function _generateTailwind(
  layout: LayoutStructure,
  styleSystem: StyleSystem,
  copy: CopyContent
): GeneratedCode {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${copy.hero.headline}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '${styleSystem.colors.primary}',
            secondary: '${styleSystem.colors.secondary}',
            accent: '${styleSystem.colors.accent}',
          },
          fontFamily: {
            heading: ['${styleSystem.typography.heading.font}', 'sans-serif'],
            body: ['${styleSystem.typography.body.font}', 'sans-serif'],
          },
        }
      }
    }
  </script>
</head>
<body class="bg-white font-body">
`;

  layout.sections.forEach((section: { type: string }) => {
    html += generateSectionTailwind(section, copy);
  });

  html += `</body>
</html>`;

  return { html, css: '', javascript: '' };
}
void _generateTailwind; // Reserved for future use

/**
 * Helper functions for HTML generation
 */
function generateNavigationHTML(copy: CopyContent): string {
  return `  <nav class="navigation">
    <div class="container">
      <div class="nav-brand">${copy.tagline}</div>
      <ul class="nav-links">
        <li><a href="#services">Services</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>
  </nav>
`;
}

export function generateSectionHTML(
  section: SectionDefinition,
  copy: CopyContent,
  styleSystem: StyleSystem,
  sectionIndex: number = 0
): string {
  // v6.3: Branch by section type, then by variant
  switch (section.type) {
    case 'hero':
      return renderHeroSection(section, copy, styleSystem);
    case 'features':
    case 'services':
      return renderFeaturesSection(section, copy, styleSystem, sectionIndex);
    case 'about':
      return renderAboutSection(section, copy, styleSystem, sectionIndex);
    case 'testimonials':
      return renderTestimonialsSection(section, copy, styleSystem, sectionIndex);
    case 'pricing':
      return renderPricingSection(section, copy, styleSystem, sectionIndex);
    case 'cta':
      return renderCTASection(section, copy, styleSystem, sectionIndex);
    case 'contact':
      return renderContactSection(section, copy, styleSystem, sectionIndex);
    case 'faq':
      return renderFAQSection(section, copy, styleSystem, sectionIndex);
    default:
      return renderGenericSection(section, copy, styleSystem, sectionIndex);
  }
}

/**
 * v6.3: Render hero section with variant support
 */
function renderHeroSection(section: SectionDefinition, copy: CopyContent, styleSystem: StyleSystem): string {
  const variantId = section.variantId || 'hero-split-left';
  
  switch (variantId) {
    case 'hero-split-left':
      return renderHeroSplitLeft(section, copy, styleSystem);
    case 'hero-split-right':
      return renderHeroSplitRight(section, copy, styleSystem);
    case 'hero-centered':
      return renderHeroCentered(section, copy, styleSystem);
    case 'hero-image-background':
      return renderHeroImageBackground(section, copy, styleSystem);
    case 'hero-minimal':
      return renderHeroMinimal(section, copy, styleSystem);
    default:
      return renderHeroSplitLeft(section, copy, styleSystem); // Safe fallback
  }
}

function renderHeroSplitLeft(section: SectionDefinition, copy: CopyContent, _styleSystem: StyleSystem): string {
  // v6.6: Use LLM-generated copy if available, fallback to legacy copy
  const sectionCopy = section.copy;
  const headline = sectionCopy?.headline || copy.hero.headline;
  const subheadline = sectionCopy?.subheadline || copy.hero.subheadline;
  const paragraph = sectionCopy?.paragraph || '';
  const ctaLabel = sectionCopy?.ctaLabel || copy.hero.cta || 'Get Started';
  const ctaDescription = sectionCopy?.ctaDescription || '';
  
  // Determine text alignment based on variant
  const textAlign = section.variantId?.includes('centered') ? 'center' : 
                    section.variantId?.includes('right') ? 'right' : 'left';
  
  const heroImageMarkup = section.imageUrl
    ? `<div class="hero-media"><img src="${section.imageUrl}" alt="${section.imageAlt || headline}" loading="lazy" /></div>`
    : '';
  return `  <section class="hero hero-split-left" style="padding: var(--cm-space-xl) 0;">
    <div class="container">
      <div class="hero-content" style="text-align: ${textAlign};">
        <h1 class="hero-headline">${headline}</h1>
        ${subheadline ? `<p class="subheadline">${subheadline}</p>` : ''}
        ${paragraph ? `<p class="hero-paragraph">${paragraph}</p>` : ''}
        <div class="hero-cta">
          <a href="#contact" class="cta-primary">${ctaLabel}</a>
          ${ctaDescription ? `<p class="cta-description">${ctaDescription}</p>` : ''}
        </div>
      </div>
      ${heroImageMarkup}
    </div>
  </section>
`;
}

function renderHeroSplitRight(section: SectionDefinition, copy: CopyContent, styleSystem: StyleSystem): string {
  // v6.6: Use LLM-generated copy if available
  const sectionCopy = section.copy;
  const headline = sectionCopy?.headline || copy.hero.headline;
  const subheadline = sectionCopy?.subheadline || copy.hero.subheadline;
  const paragraph = sectionCopy?.paragraph || '';
  const ctaLabel = sectionCopy?.ctaLabel || copy.hero.cta || 'Get Started';
  const ctaDescription = sectionCopy?.ctaDescription || '';
  
  const textAlign = section.variantId?.includes('centered') ? 'center' : 
                    section.variantId?.includes('left') ? 'left' : 'right';
  
  const heroImageMarkup = section.imageUrl
    ? `<div class="hero-media"><img src="${section.imageUrl}" alt="${section.imageAlt || headline}" loading="lazy" /></div>`
    : '';
  return `  <section class="hero hero-split-right" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      ${heroImageMarkup}
      <div class="hero-content" style="text-align: ${textAlign};">
        <h1 style="font-family: '${styleSystem.typography.heading.font}'; color: ${styleSystem.colors.primary};">${headline}</h1>
        ${subheadline ? `<p class="subheadline" style="font-family: '${styleSystem.typography.body.font}';">${subheadline}</p>` : ''}
        ${paragraph ? `<p class="hero-paragraph" style="font-family: '${styleSystem.typography.body.font}';">${paragraph}</p>` : ''}
        <div class="hero-cta">
          <a href="#contact" class="cta-primary" style="background-color: ${styleSystem.colors.primary}; color: white;">${ctaLabel}</a>
          ${ctaDescription ? `<p class="cta-description">${ctaDescription}</p>` : ''}
        </div>
      </div>
    </div>
  </section>
`;
}

function renderHeroCentered(section: SectionDefinition, copy: CopyContent, styleSystem: StyleSystem): string {
  // v6.6: Use LLM-generated copy if available
  const sectionCopy = section.copy;
  const headline = sectionCopy?.headline || copy.hero.headline;
  const subheadline = sectionCopy?.subheadline || copy.hero.subheadline;
  const paragraph = sectionCopy?.paragraph || '';
  const ctaLabel = sectionCopy?.ctaLabel || copy.hero.cta || 'Get Started';
  const ctaDescription = sectionCopy?.ctaDescription || '';
  
  const heroImageMarkup = section.imageUrl
    ? `<div class="hero-media"><img src="${section.imageUrl}" alt="${section.imageAlt || headline}" loading="lazy" /></div>`
    : '';
  return `  <section class="hero hero-centered" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <div class="hero-content" style="text-align: center;">
        <h1 style="font-family: '${styleSystem.typography.heading.font}'; color: ${styleSystem.colors.primary};">${headline}</h1>
        ${subheadline ? `<p class="subheadline" style="font-family: '${styleSystem.typography.body.font}';">${subheadline}</p>` : ''}
        ${paragraph ? `<p class="hero-paragraph" style="font-family: '${styleSystem.typography.body.font}';">${paragraph}</p>` : ''}
        <div class="hero-cta">
          <a href="#contact" class="cta-primary" style="background-color: ${styleSystem.colors.primary}; color: white;">${ctaLabel}</a>
          ${ctaDescription ? `<p class="cta-description">${ctaDescription}</p>` : ''}
        </div>
      </div>
      ${heroImageMarkup}
    </div>
  </section>
`;
}

function renderHeroImageBackground(section: SectionDefinition, copy: CopyContent, styleSystem: StyleSystem): string {
  // v6.6: Use LLM-generated copy if available
  const sectionCopy = section.copy;
  const headline = sectionCopy?.headline || copy.hero.headline;
  const subheadline = sectionCopy?.subheadline || copy.hero.subheadline;
  const paragraph = sectionCopy?.paragraph || '';
  const ctaLabel = sectionCopy?.ctaLabel || copy.hero.cta || 'Get Started';
  const ctaDescription = sectionCopy?.ctaDescription || '';
  
  const bgImageStyle = section.imageUrl ? `background-image: url('${section.imageUrl}');` : '';
  return `  <section class="hero hero-image-background" style="padding: ${getSpacing(section.spacing, styleSystem)}; ${bgImageStyle}">
    <div class="hero-overlay"></div>
    <div class="container">
      <div class="hero-content" style="text-align: center;">
        <h1 style="font-family: '${styleSystem.typography.heading.font}'; color: white;">${headline}</h1>
        ${subheadline ? `<p class="subheadline" style="font-family: '${styleSystem.typography.body.font}'; color: white;">${subheadline}</p>` : ''}
        ${paragraph ? `<p class="hero-paragraph" style="font-family: '${styleSystem.typography.body.font}'; color: white;">${paragraph}</p>` : ''}
        <div class="hero-cta">
          <a href="#contact" class="cta-primary" style="background-color: ${styleSystem.colors.primary}; color: white;">${ctaLabel}</a>
          ${ctaDescription ? `<p class="cta-description" style="color: white;">${ctaDescription}</p>` : ''}
        </div>
      </div>
    </div>
  </section>
`;
}

function renderHeroMinimal(_section: SectionDefinition, copy: CopyContent, _styleSystem: StyleSystem): string {
  return `  <section class="hero hero-minimal" style="padding: var(--cm-space-xl) 0;">
    <div class="container">
      <div class="hero-content">
        <h1 class="hero-headline">${copy.hero.headline}</h1>
        <p class="subheadline">${copy.hero.subheadline}</p>
        <div class="hero-cta">
          <a href="#contact" class="cta-primary">${copy.hero.cta}</a>
        </div>
      </div>
    </div>
  </section>
`;
}

/**
 * v6.3: Render features/services section with variant support
 */
function renderFeaturesSection(section: SectionDefinition, copy: CopyContent, styleSystem: StyleSystem, _sectionIndex: number): string {
  const variantId = section.variantId || 'features-3-column-cards';
  const servicesSection = copy.sections.find(s => s.heading?.toLowerCase().includes('service')) || copy.sections[0] || { heading: 'Our Services', body: '' };
  
  switch (variantId) {
    case 'features-3-column-cards':
      return renderFeatures3Column(section, servicesSection, copy, styleSystem);
    case 'features-2-column-icons':
      return renderFeatures2Column(section, servicesSection, copy, styleSystem);
    case 'features-4-column-compact':
      return renderFeatures4Column(section, servicesSection, copy, styleSystem);
    case 'features-alternating':
      return renderFeaturesAlternating(section, servicesSection, copy, styleSystem);
    default:
      return renderFeatures3Column(section, servicesSection, copy, styleSystem);
  }
}

function renderFeatures3Column(section: SectionDefinition, servicesSection: any, copy: CopyContent, styleSystem: StyleSystem): string {
  // v6.6: Use LLM-generated copy if available
  const sectionCopy = section.copy;
  const headline = sectionCopy?.headline || servicesSection.heading || 'Our Services';
  const paragraph = sectionCopy?.paragraph || servicesSection.body || '';
  const bullets = sectionCopy?.bullets || copy.services.map(s => s.name);
  
  // v6.4: Get responsive rules
  const rules = getResponsiveRulesForVariant(section.variantId || 'features-3-column-cards');
  
  const textAlign = section.variantId?.includes('centered') ? 'center' : 'left';
  
  return `  <section class="features features-3-column" style="padding: var(--cm-space-xl) 0;">
    <div class="container">
      <h2 style="font-family: '${styleSystem.typography.heading.font}'; color: ${styleSystem.colors.primary}; text-align: ${textAlign};">${headline}</h2>
      ${paragraph ? `<p style="margin-bottom: 24px; font-family: '${styleSystem.typography.body.font}'; text-align: ${textAlign};">${paragraph}</p>` : ''}
      <div class="features-grid features-grid-3" style="display: grid; grid-template-columns: repeat(${rules.mobile.columns || 1}, minmax(0, 1fr)); gap: var(--cm-spacing-gap-mobile);">
${bullets.map((bullet, idx) => `        <div class="feature-card">
          <h3 style="color: ${styleSystem.colors.primary};">${bullet}</h3>
          ${copy.services[idx]?.description ? `<p style="font-family: '${styleSystem.typography.body.font}';">${copy.services[idx].description}</p>` : ''}
        </div>`).join('\n')}
      </div>
    </div>
  </section>
`;
}

function renderFeatures2Column(section: SectionDefinition, servicesSection: any, copy: CopyContent, styleSystem: StyleSystem): string {
  // v6.5: Use supportImages for icons if available
  const iconImages = section.supportImages?.filter((_img, idx) => 
    section.imagePlans?.[idx]?.purpose === 'icon' || idx < copy.services.length
  ) || [];
  
  return `  <section class="features features-2-column" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <h2 style="font-family: '${styleSystem.typography.heading.font}';">${servicesSection.heading}</h2>
      ${servicesSection.body ? `<p style="margin-bottom: 24px;">${servicesSection.body}</p>` : ''}
      <div class="features-grid features-grid-2">
${copy.services.map((service, idx) => {
  const iconImage = iconImages[idx];
  const iconMarkup = iconImage ? 
    `<div class="feature-icon"><img src="${iconImage.url}" alt="${iconImage.alt || service.name}" loading="lazy" /></div>` :
    `<div class="feature-icon">📋</div>`;
  return `        <div class="feature-card feature-with-icon">
          ${iconMarkup}
          <h3>${service.name}</h3>
          <p>${service.description}</p>
        </div>`;
}).join('\n')}
      </div>
    </div>
  </section>
`;
}

function renderFeatures4Column(section: SectionDefinition, servicesSection: any, copy: CopyContent, styleSystem: StyleSystem): string {
  return `  <section class="features features-4-column" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <h2 style="font-family: '${styleSystem.typography.heading.font}';">${servicesSection.heading}</h2>
      ${servicesSection.body ? `<p style="margin-bottom: 24px;">${servicesSection.body}</p>` : ''}
      <div class="features-grid features-grid-4">
${copy.services.map(service => `        <div class="feature-card feature-compact">
          <h3>${service.name}</h3>
          <p>${service.description}</p>
        </div>`).join('\n')}
      </div>
    </div>
  </section>
`;
}

function renderFeaturesAlternating(section: SectionDefinition, servicesSection: any, copy: CopyContent, styleSystem: StyleSystem): string {
  const items = copy.services.map((service, idx) => {
    const isEven = idx % 2 === 0;
    const imageMarkup = section.imageUrl && idx === 0 ? `<div class="feature-media"><img src="${section.imageUrl}" alt="${service.name}" loading="lazy" /></div>` : '';
    return `        <div class="feature-alternating ${isEven ? 'feature-left' : 'feature-right'}">
          ${isEven && imageMarkup ? imageMarkup : ''}
          <div class="feature-content">
            <h3>${service.name}</h3>
            <p>${service.description}</p>
          </div>
          ${!isEven && imageMarkup ? imageMarkup : ''}
        </div>`;
  }).join('\n');
  
  return `  <section class="features features-alternating" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <h2 style="font-family: '${styleSystem.typography.heading.font}';">${servicesSection.heading}</h2>
      ${servicesSection.body ? `<p style="margin-bottom: 24px;">${servicesSection.body}</p>` : ''}
      <div class="features-alternating-list">
${items}
      </div>
    </div>
  </section>
`;
}

/**
 * v6.3: Render about section with variant support
 */
function renderAboutSection(section: SectionDefinition, copy: CopyContent, styleSystem: StyleSystem, sectionIndex: number): string {
  const variantId = section.variantId || 'about-image-left';
  const copyIndex = sectionIndex > 0 ? sectionIndex - 1 : 0;
  const sectionContent = copy.sections[copyIndex] || copy.sections[0] || { heading: 'About Us', body: 'Content' };
  
  switch (variantId) {
    case 'about-image-left':
      return renderAboutImageLeft(section, sectionContent, styleSystem);
    case 'about-image-right':
      return renderAboutImageRight(section, sectionContent, styleSystem);
    case 'about-centered':
      return renderAboutCentered(section, sectionContent, styleSystem);
    case 'about-split-image':
      return renderAboutSplitImage(section, sectionContent, styleSystem);
    default:
      return renderAboutImageLeft(section, sectionContent, styleSystem);
  }
}

function renderAboutImageLeft(section: SectionDefinition, sectionContent: any, styleSystem: StyleSystem): string {
  const imageMarkup = section.imageUrl
    ? `<div class="section-media"><img src="${section.imageUrl}" alt="${section.imageAlt || sectionContent.heading}" loading="lazy" /></div>`
    : '';
  return `  <section class="about about-image-left" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      ${imageMarkup}
      <div class="section-content">
        <h2 style="font-family: '${styleSystem.typography.heading.font}';">${sectionContent.heading}</h2>
        <p>${sectionContent.body}</p>
        ${sectionContent.cta ? `<a href="#contact" class="cta-primary">${sectionContent.cta}</a>` : ''}
      </div>
    </div>
  </section>
`;
}

function renderAboutImageRight(section: SectionDefinition, sectionContent: any, styleSystem: StyleSystem): string {
  // v6.6: Use LLM-generated copy if available
  const sectionCopy = section.copy;
  const headline = sectionCopy?.headline || sectionContent.heading || 'About Us';
  const paragraph = sectionCopy?.paragraph || sectionContent.body || '';
  const bullets = sectionCopy?.bullets || [];
  const ctaLabel = sectionCopy?.ctaLabel || sectionContent.cta;
  
  const textAlign = section.variantId?.includes('centered') ? 'center' : 'right';
  
  const imageMarkup = section.imageUrl
    ? `<div class="section-media"><img src="${section.imageUrl}" alt="${section.imageAlt || headline}" loading="lazy" /></div>`
    : '';
  return `  <section class="about about-image-right" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <div class="section-content" style="text-align: ${textAlign};">
        <h2 style="font-family: '${styleSystem.typography.heading.font}'; color: ${styleSystem.colors.primary};">${headline}</h2>
        ${paragraph ? `<p style="font-family: '${styleSystem.typography.body.font}';">${paragraph}</p>` : ''}
        ${bullets.length > 0 ? `<ul class="section-bullets">${bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
        ${ctaLabel ? `<a href="#contact" class="cta-primary" style="background-color: ${styleSystem.colors.primary}; color: white;">${ctaLabel}</a>` : ''}
      </div>
      ${imageMarkup}
    </div>
  </section>
`;
}

function renderAboutCentered(section: SectionDefinition, sectionContent: any, styleSystem: StyleSystem): string {
  const imageMarkup = section.imageUrl
    ? `<div class="section-media"><img src="${section.imageUrl}" alt="${section.imageAlt || sectionContent.heading}" loading="lazy" /></div>`
    : '';
  return `  <section class="about about-centered" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      ${imageMarkup}
      <div class="section-content">
        <h2 style="font-family: '${styleSystem.typography.heading.font}';">${sectionContent.heading}</h2>
        <p>${sectionContent.body}</p>
        ${sectionContent.cta ? `<a href="#contact" class="cta-primary">${sectionContent.cta}</a>` : ''}
      </div>
    </div>
  </section>
`;
}

function renderAboutSplitImage(section: SectionDefinition, sectionContent: any, styleSystem: StyleSystem): string {
  const bgImageStyle = section.imageUrl ? `background-image: url('${section.imageUrl}');` : '';
  return `  <section class="about about-split-image" style="padding: ${getSpacing(section.spacing, styleSystem)}; ${bgImageStyle}">
    <div class="section-overlay"></div>
    <div class="container">
      <div class="section-content">
        <h2 style="font-family: '${styleSystem.typography.heading.font}';">${sectionContent.heading}</h2>
        <p>${sectionContent.body}</p>
        ${sectionContent.cta ? `<a href="#contact" class="cta-primary">${sectionContent.cta}</a>` : ''}
      </div>
    </div>
  </section>
`;
}

/**
 * v6.3: Render testimonials section with variant support
 */
function renderTestimonialsSection(section: SectionDefinition, copy: CopyContent, styleSystem: StyleSystem, sectionIndex: number): string {
  const variantId = section.variantId || 'testimonials-grid';
  const copyIndex = sectionIndex > 0 ? sectionIndex - 1 : 0;
  const sectionContent = copy.sections[copyIndex] || copy.sections[0] || { heading: 'Testimonials', body: '' };
  
  // Mock testimonials data (in real implementation, this would come from copy)
  const testimonials = [
    { quote: 'Excellent service!', author: 'John Doe', role: 'CEO', company: 'Company Inc.' },
    { quote: 'Highly recommended!', author: 'Jane Smith', role: 'Director', company: 'Business Corp.' },
    { quote: 'Outstanding results!', author: 'Bob Johnson', role: 'Manager', company: 'Enterprise Ltd.' }
  ];
  
  switch (variantId) {
    case 'testimonials-grid':
      return renderTestimonialsGrid(section, sectionContent, testimonials, styleSystem);
    case 'testimonials-spotlight':
      return renderTestimonialsSpotlight(section, sectionContent, testimonials, styleSystem);
    case 'testimonials-carousel':
      return renderTestimonialsCarousel(section, sectionContent, testimonials, styleSystem);
    default:
      return renderTestimonialsGrid(section, sectionContent, testimonials, styleSystem);
  }
}

function renderTestimonialsGrid(section: SectionDefinition, sectionContent: any, testimonials: any[], styleSystem: StyleSystem): string {
  const items = testimonials.map(t => `        <div class="testimonial-card">
          <p class="testimonial-quote">"${t.quote}"</p>
          <div class="testimonial-author">
            <strong>${t.author}</strong>
            <span>${t.role}, ${t.company}</span>
          </div>
        </div>`).join('\n');
  
  return `  <section class="testimonials testimonials-grid" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <h2 style="font-family: '${styleSystem.typography.heading.font}';">${sectionContent.heading}</h2>
      <div class="testimonials-grid testimonials-grid-3">
${items}
      </div>
    </div>
  </section>
`;
}

function renderTestimonialsSpotlight(section: SectionDefinition, sectionContent: any, testimonials: any[], styleSystem: StyleSystem): string {
  const spotlight = testimonials[0];
  const others = testimonials.slice(1);
  
  return `  <section class="testimonials testimonials-spotlight" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <h2 style="font-family: '${styleSystem.typography.heading.font}';">${sectionContent.heading}</h2>
      <div class="testimonial-spotlight">
        <div class="testimonial-featured">
          <p class="testimonial-quote">"${spotlight.quote}"</p>
          <div class="testimonial-author">
            <strong>${spotlight.author}</strong>
            <span>${spotlight.role}, ${spotlight.company}</span>
          </div>
        </div>
        <div class="testimonials-others">
${others.map(t => `          <div class="testimonial-small">
            <p>"${t.quote}"</p>
            <span>— ${t.author}</span>
          </div>`).join('\n')}
        </div>
      </div>
    </div>
  </section>
`;
}

function renderTestimonialsCarousel(section: SectionDefinition, sectionContent: any, testimonials: any[], styleSystem: StyleSystem): string {
  const items = testimonials.map(t => `        <div class="testimonial-card">
          <p class="testimonial-quote">"${t.quote}"</p>
          <div class="testimonial-author">
            <strong>${t.author}</strong>
            <span>${t.role}, ${t.company}</span>
          </div>
        </div>`).join('\n');
  
  return `  <section class="testimonials testimonials-carousel" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <h2 style="font-family: '${styleSystem.typography.heading.font}';">${sectionContent.heading}</h2>
      <div class="testimonials-carousel-wrapper">
        <div class="testimonials-carousel-track">
${items}
        </div>
      </div>
    </div>
  </section>
`;
}

/**
 * v6.3: Render pricing section with variant support
 */
function renderPricingSection(section: SectionDefinition, copy: CopyContent, styleSystem: StyleSystem, sectionIndex: number): string {
  const variantId = section.variantId || 'pricing-3-tier';
  const copyIndex = sectionIndex > 0 ? sectionIndex - 1 : 0;
  const sectionContent = copy.sections[copyIndex] || copy.sections[0] || { heading: 'Pricing', body: '' };
  
  // Mock pricing data
  const plans = [
    { name: 'Basic', price: '$29', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
    { name: 'Pro', price: '$99', features: ['All Basic', 'Feature 4', 'Feature 5'], highlighted: true },
    { name: 'Enterprise', price: '$299', features: ['All Pro', 'Feature 6', 'Feature 7'] }
  ];
  
  switch (variantId) {
    case 'pricing-3-tier':
      return renderPricing3Tier(section, sectionContent, plans, styleSystem);
    case 'pricing-2-tier':
      return renderPricing2Tier(section, sectionContent, plans.slice(0, 2), styleSystem);
    case 'pricing-single':
      return renderPricingSingle(section, sectionContent, plans[1], styleSystem);
    default:
      return renderPricing3Tier(section, sectionContent, plans, styleSystem);
  }
}

function renderPricing3Tier(section: SectionDefinition, sectionContent: any, plans: any[], styleSystem: StyleSystem): string {
  const items = plans.map((plan, _idx) => {
    const highlightClass = plan.highlighted ? ' pricing-card-highlighted' : '';
    return `        <div class="pricing-card${highlightClass}">
          <h3>${plan.name}</h3>
          <div class="pricing-price">${plan.price}<span>/mo</span></div>
          <ul class="pricing-features">
${plan.features.map((f: string) => `            <li>${f}</li>`).join('\n')}
          </ul>
          <a href="#contact" class="cta-primary">Get Started</a>
        </div>`;
  }).join('\n');
  
  return `  <section class="pricing pricing-3-tier" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <h2 style="font-family: '${styleSystem.typography.heading.font}';">${sectionContent.heading}</h2>
      <div class="pricing-grid pricing-grid-3">
${items}
      </div>
    </div>
  </section>
`;
}

function renderPricing2Tier(section: SectionDefinition, sectionContent: any, plans: any[], styleSystem: StyleSystem): string {
  const items = plans.map(plan => `        <div class="pricing-card">
          <h3>${plan.name}</h3>
          <div class="pricing-price">${plan.price}<span>/mo</span></div>
          <ul class="pricing-features">
${plan.features.map((f: string) => `            <li>${f}</li>`).join('\n')}
          </ul>
          <a href="#contact" class="cta-primary">Get Started</a>
        </div>`).join('\n');
  
  return `  <section class="pricing pricing-2-tier" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <h2 style="font-family: '${styleSystem.typography.heading.font}';">${sectionContent.heading}</h2>
      <div class="pricing-grid pricing-grid-2">
${items}
      </div>
    </div>
  </section>
`;
}

function renderPricingSingle(section: SectionDefinition, sectionContent: any, plan: any, styleSystem: StyleSystem): string {
  return `  <section class="pricing pricing-single" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <h2 style="font-family: '${styleSystem.typography.heading.font}';">${sectionContent.heading}</h2>
      <div class="pricing-single-card">
        <h3>${plan.name}</h3>
        <div class="pricing-price">${plan.price}<span>/mo</span></div>
        <ul class="pricing-features">
${plan.features.map((f: string) => `          <li>${f}</li>`).join('\n')}
        </ul>
        <a href="#contact" class="cta-primary">Get Started</a>
      </div>
    </div>
  </section>
`;
}

/**
 * v6.3: Render CTA section with variant support
 */
function renderCTASection(section: SectionDefinition, copy: CopyContent, styleSystem: StyleSystem, sectionIndex: number): string {
  const variantId = section.variantId || 'cta-centered';
  const copyIndex = sectionIndex > 0 ? sectionIndex - 1 : 0;
  const sectionContent = copy.sections[copyIndex] || copy.sections[0] || { heading: 'Ready to Get Started?', body: 'Take the next step.', cta: 'Get Started' };
  
  switch (variantId) {
    case 'cta-centered':
      return renderCTACentered(section, sectionContent, styleSystem);
    case 'cta-split':
      return renderCTASplit(section, sectionContent, styleSystem);
    case 'cta-with-image':
      return renderCTAWithImage(section, sectionContent, styleSystem);
    default:
      return renderCTACentered(section, sectionContent, styleSystem);
  }
}

function renderCTACentered(section: SectionDefinition, sectionContent: any, styleSystem: StyleSystem): string {
  return `  <section class="cta cta-centered" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <div class="cta-content">
        <h2 style="font-family: '${styleSystem.typography.heading.font}';">${sectionContent.heading}</h2>
        ${sectionContent.body ? `<p>${sectionContent.body}</p>` : ''}
        <a href="#contact" class="cta-primary">${sectionContent.cta || 'Get Started'}</a>
      </div>
    </div>
  </section>
`;
}

function renderCTASplit(section: SectionDefinition, sectionContent: any, styleSystem: StyleSystem): string {
  return `  <section class="cta cta-split" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <div class="cta-content">
        <h2 style="font-family: '${styleSystem.typography.heading.font}';">${sectionContent.heading}</h2>
        ${sectionContent.body ? `<p>${sectionContent.body}</p>` : ''}
      </div>
      <div class="cta-action">
        <a href="#contact" class="cta-primary">${sectionContent.cta || 'Get Started'}</a>
      </div>
    </div>
  </section>
`;
}

function renderCTAWithImage(section: SectionDefinition, sectionContent: any, styleSystem: StyleSystem): string {
  const bgImageStyle = section.imageUrl ? `background-image: url('${section.imageUrl}');` : '';
  return `  <section class="cta cta-with-image" style="padding: ${getSpacing(section.spacing, styleSystem)}; ${bgImageStyle}">
    <div class="cta-overlay"></div>
    <div class="container">
      <div class="cta-content">
        <h2 style="font-family: '${styleSystem.typography.heading.font}';">${sectionContent.heading}</h2>
        ${sectionContent.body ? `<p>${sectionContent.body}</p>` : ''}
        <a href="#contact" class="cta-primary">${sectionContent.cta || 'Get Started'}</a>
      </div>
    </div>
  </section>
`;
}

/**
 * v6.3: Render contact section with variant support
 */
function renderContactSection(section: SectionDefinition, copy: CopyContent, styleSystem: StyleSystem, sectionIndex: number): string {
  const variantId = section.variantId || 'contact-split-form';
  const copyIndex = sectionIndex > 0 ? sectionIndex - 1 : 0;
  const sectionContent = copy.sections[copyIndex] || copy.sections[0] || { heading: 'Contact Us', body: 'Get in touch.' };
  
  switch (variantId) {
    case 'contact-split-form':
      return renderContactSplitForm(section, sectionContent, styleSystem);
    case 'contact-centered':
      return renderContactCentered(section, sectionContent, styleSystem);
    default:
      return renderContactSplitForm(section, sectionContent, styleSystem);
  }
}

function renderContactSplitForm(section: SectionDefinition, sectionContent: any, styleSystem: StyleSystem): string {
  return `  <section class="contact contact-split-form" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <h2 style="font-family: '${styleSystem.typography.heading.font}';">${sectionContent.heading}</h2>
      <div class="contact-wrapper">
        <div class="contact-form">
          <form>
            <input type="text" placeholder="Name" required />
            <input type="email" placeholder="Email" required />
            <textarea placeholder="Message" rows="5" required></textarea>
            <button type="submit" class="cta-primary">Send Message</button>
          </form>
        </div>
        <div class="contact-info">
          <p>${sectionContent.body}</p>
          <div class="contact-details">
            <p><strong>Email:</strong> info@example.com</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
          </div>
        </div>
      </div>
    </div>
  </section>
`;
}

function renderContactCentered(section: SectionDefinition, sectionContent: any, styleSystem: StyleSystem): string {
  return `  <section class="contact contact-centered" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <h2 style="font-family: '${styleSystem.typography.heading.font}';">${sectionContent.heading}</h2>
      <p>${sectionContent.body}</p>
      <div class="contact-form-narrow">
        <form>
          <input type="text" placeholder="Name" required />
          <input type="email" placeholder="Email" required />
          <textarea placeholder="Message" rows="5" required></textarea>
          <button type="submit" class="cta-primary">Send Message</button>
        </form>
      </div>
    </div>
  </section>
`;
}

/**
 * v6.3: Render FAQ section with variant support
 */
function renderFAQSection(section: SectionDefinition, copy: CopyContent, styleSystem: StyleSystem, _sectionIndex: number): string {
  const variantId = section.variantId || 'faq-accordion';
  const faqs = copy.faq || [];
  
  switch (variantId) {
    case 'faq-accordion':
      return renderFAQAccordion(section, faqs, styleSystem);
    case 'faq-2-column':
      return renderFAQ2Column(section, faqs, styleSystem);
    default:
      return renderFAQAccordion(section, faqs, styleSystem);
  }
}

function renderFAQAccordion(section: SectionDefinition, faqs: any[], styleSystem: StyleSystem): string {
  const items = faqs.map((faq, idx) => `        <div class="faq-item">
          <button class="faq-question" onclick="toggleFAQ(${idx})">
            <span>${faq.question}</span>
            <span class="faq-icon">+</span>
          </button>
          <div class="faq-answer" id="faq-answer-${idx}">
            <p>${faq.answer}</p>
          </div>
        </div>`).join('\n');
  
  return `  <section class="faq faq-accordion" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <h2 style="font-family: '${styleSystem.typography.heading.font}';">Frequently Asked Questions</h2>
      <div class="faq-list">
${items}
      </div>
    </div>
  </section>
`;
}

function renderFAQ2Column(section: SectionDefinition, faqs: any[], styleSystem: StyleSystem): string {
  const items = faqs.map(faq => `        <div class="faq-item">
          <h3>${faq.question}</h3>
          <p>${faq.answer}</p>
        </div>`).join('\n');
  
  return `  <section class="faq faq-2-column" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      <h2 style="font-family: '${styleSystem.typography.heading.font}';">Frequently Asked Questions</h2>
      <div class="faq-grid faq-grid-2">
${items}
      </div>
    </div>
  </section>
`;
}

/**
 * v6.3: Render generic section (fallback)
 */
function renderGenericSection(section: SectionDefinition, copy: CopyContent, styleSystem: StyleSystem, sectionIndex: number): string {
  const copyIndex = sectionIndex > 0 ? sectionIndex - 1 : 0;
  const sectionContent = copy.sections[copyIndex] || copy.sections[0] || { heading: 'Section', body: 'Content' };
  const sectionClasses = ['section-block', section.type];
  if (section.imageUrl) {
    sectionClasses.push('has-media');
  }
  
  let sectionHTML = `  <section class="${sectionClasses.join(' ')}" id="${section.type}" style="padding: ${getSpacing(section.spacing, styleSystem)};">
    <div class="container">
      ${section.imageUrl ? `<div class="section-media">
        <img src="${section.imageUrl}" alt="${section.imageAlt || sectionContent.heading || section.type}" loading="lazy" decoding="async" />
      </div>` : ''}
      <div class="section-content">
        <h2 style="font-family: '${styleSystem.typography.heading.font}';">${sectionContent.heading || 'Section'}</h2>
        <p>${sectionContent.body || 'Content'}</p>`;
  
  if (sectionContent.cta) {
    sectionHTML += `
        <a href="#contact" class="cta-primary">${sectionContent.cta}</a>`;
  }
  
  sectionHTML += `
      </div>
    </div>
  </section>
`;
  
  return sectionHTML;
}

function generateFooterHTML(): string {
  return `  <footer class="footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} All rights reserved.</p>
    </div>
  </footer>
`;
}

export function generateCSS(styleSystem: StyleSystem, _layout: LayoutStructure, globalTheme?: any): string {
  // v6.4: Load layout rules for responsive breakpoints
  let layoutRules: any = {};
  try {
    const layoutRulesPath = path.join(process.cwd(), 'config', 'layout-rules.json');
    if (fs.existsSync(layoutRulesPath)) {
      layoutRules = JSON.parse(fs.readFileSync(layoutRulesPath, 'utf-8'));
    }
  } catch (error) {
    console.warn('[Code Generator] Could not load layout-rules.json, using defaults');
  }

  const breakpoints = layoutRules.breakpoints || { mobile: 0, tablet: 768, laptop: 1024, desktop: 1440 };
  const containers = layoutRules.containers || { maxWidth: '1200px', paddingX: { mobile: '1.5rem', tablet: '2rem', desktop: '3rem' } };
  const spacing = layoutRules.spacing || { mobile: { sectionPadding: '3rem 0', elementGap: '1.5rem' }, tablet: { sectionPadding: '4rem 0', elementGap: '2rem' }, desktop: { sectionPadding: '6rem 0', elementGap: '2.5rem' } };
  const typography = layoutRules.typography || { mobile: { heroHeading: '2rem', sectionHeading: '1.75rem', body: '1rem' }, tablet: { heroHeading: '3rem', sectionHeading: '2.25rem', body: '1.125rem' }, desktop: { heroHeading: '4rem', sectionHeading: '3rem', body: '1.125rem' } };

  const neutrals = styleSystem.colors.neutrals || [];
  // Reserved for future use: backgroundColor, surfaceColor, mutedColor
  const backgroundColor = neutrals[0] || styleSystem.colors.background || '#f8fafc';
  const surfaceColor = neutrals[1] || '#ffffff';
  const mutedColor = neutrals[2] || '#94a3b8';
  void backgroundColor; void surfaceColor; void mutedColor; // Reserved for future use
  const heroGradientStart = styleSystem.colors.primary || '#2563EB';
  const heroGradientMid = styleSystem.colors.secondary || heroGradientStart;
  const heroGradientEnd = styleSystem.colors.accent || heroGradientMid;

  // v6.9: Use global theme if available, otherwise fallback to style system
  const useTheme = globalTheme && globalTheme.palette && globalTheme.typography;
  
  return `/* Generated by Merlin Design LLM v6.9 - Global Theme Engine */

:root {
  /* v6.9: Global Theme Palette */
  --cm-color-primary: ${useTheme ? globalTheme.palette.primary : styleSystem.colors.primary};
  --cm-color-secondary: ${useTheme ? globalTheme.palette.secondary : styleSystem.colors.secondary};
  --cm-color-accent: ${useTheme ? globalTheme.palette.accent : styleSystem.colors.accent};
  --cm-color-bg: ${useTheme ? globalTheme.palette.background : styleSystem.colors.background};
  --cm-color-text: ${useTheme ? globalTheme.palette.text : styleSystem.colors.text};
  --cm-color-neutral100: ${useTheme ? globalTheme.palette.neutral100 : (styleSystem.colors.neutrals?.[0] || '#f8fafc')};
  --cm-color-neutral200: ${useTheme ? globalTheme.palette.neutral200 : (styleSystem.colors.neutrals?.[1] || '#e2e8f0')};
  --cm-color-neutral300: ${useTheme ? globalTheme.palette.neutral300 : (styleSystem.colors.neutrals?.[2] || '#cbd5e1')};
  
  /* v6.9: Global Theme Typography */
  --cm-font-display: '${useTheme ? globalTheme.typography.fontDisplay : styleSystem.typography.heading.font}', sans-serif;
  --cm-font-heading: '${useTheme ? globalTheme.typography.fontHeading : styleSystem.typography.heading.font}', sans-serif;
  --cm-font-body: '${useTheme ? globalTheme.typography.fontBody : styleSystem.typography.body.font}', sans-serif;
  
  /* v6.9: Global Theme Typography Scale */
  --cm-font-heroH1: ${useTheme ? globalTheme.typography.scale.heroH1 : '3.5rem'};
  --cm-font-h1: ${useTheme ? globalTheme.typography.scale.h1 : '2.5rem'};
  --cm-font-h2: ${useTheme ? globalTheme.typography.scale.h2 : '2rem'};
  --cm-font-h3: ${useTheme ? globalTheme.typography.scale.h3 : '1.5rem'};
  --cm-font-body-size: ${useTheme ? globalTheme.typography.scale.body : '1rem'};
  --cm-font-small: ${useTheme ? globalTheme.typography.scale.small : '0.875rem'};
  
  /* v6.9: Global Theme Spacing */
  --cm-space-xs: ${useTheme ? globalTheme.spacing.xs : `${styleSystem.spacing.scale[0]}px`};
  --cm-space-sm: ${useTheme ? globalTheme.spacing.sm : `${styleSystem.spacing.scale[1]}px`};
  --cm-space-md: ${useTheme ? globalTheme.spacing.md : `${styleSystem.spacing.scale[2]}px`};
  --cm-space-lg: ${useTheme ? globalTheme.spacing.lg : `${styleSystem.spacing.scale[3]}px`};
  --cm-space-xl: ${useTheme ? globalTheme.spacing.xl : `${styleSystem.spacing.scale[4]}px`};
  
  /* v6.9: Global Theme Shadows */
  --cm-shadow-level1: ${useTheme ? globalTheme.shadows.level1 : styleSystem.shadows.small};
  --cm-shadow-level2: ${useTheme ? globalTheme.shadows.level2 : styleSystem.shadows.medium};
  --cm-shadow-level3: ${useTheme ? globalTheme.shadows.level3 : styleSystem.shadows.large};
  
  /* Legacy variables for backward compatibility */
  --color-primary: ${useTheme ? globalTheme.palette.primary : styleSystem.colors.primary};
  --color-secondary: ${useTheme ? globalTheme.palette.secondary : styleSystem.colors.secondary};
  --color-accent: ${useTheme ? globalTheme.palette.accent : styleSystem.colors.accent};
  --color-background: ${useTheme ? globalTheme.palette.background : styleSystem.colors.background};
  --color-text: ${useTheme ? globalTheme.palette.text : styleSystem.colors.text};
  --font-heading: '${useTheme ? globalTheme.typography.fontHeading : styleSystem.typography.heading.font}', sans-serif;
  --font-body: '${useTheme ? globalTheme.typography.fontBody : styleSystem.typography.body.font}', sans-serif;
  --spacing-xs: ${useTheme ? globalTheme.spacing.xs : `${styleSystem.spacing.scale[0]}px`};
  --spacing-sm: ${useTheme ? globalTheme.spacing.sm : `${styleSystem.spacing.scale[1]}px`};
  --spacing-md: ${useTheme ? globalTheme.spacing.md : `${styleSystem.spacing.scale[2]}px`};
  --spacing-lg: ${useTheme ? globalTheme.spacing.lg : `${styleSystem.spacing.scale[3]}px`};
  --spacing-xl: ${useTheme ? globalTheme.spacing.xl : `${styleSystem.spacing.scale[4]}px`};
  --shadow-sm: ${useTheme ? globalTheme.shadows.level1 : styleSystem.shadows.small};
  --shadow-md: ${useTheme ? globalTheme.shadows.level2 : styleSystem.shadows.medium};
  --shadow-lg: ${useTheme ? globalTheme.shadows.level3 : styleSystem.shadows.large};
  
  /* Additional theme variables */
  --cm-color-surface: ${useTheme ? globalTheme.palette.neutral200 : (styleSystem.colors.neutrals?.[1] || styleSystem.colors.background)};
  --cm-color-muted: ${useTheme ? globalTheme.palette.neutral300 : (styleSystem.colors.neutrals?.[2] || '#94a3b8')};
  --cm-radius-sm: ${styleSystem.borderRadius.small};
  --cm-radius-md: ${styleSystem.borderRadius.medium};
  --cm-radius-lg: ${styleSystem.borderRadius.large};
  --cm-shadow-soft: 0 25px 65px rgba(15, 23, 42, 0.18);
  
  /* v6.4: Responsive Layout Engine CSS variables */
  --cm-container-max-width: ${containers.maxWidth};
  --cm-container-padding-x-mobile: ${containers.paddingX.mobile};
  --cm-container-padding-x-tablet: ${containers.paddingX.tablet || containers.paddingX.mobile};
  --cm-container-padding-x-desktop: ${containers.paddingX.desktop || containers.paddingX.tablet || containers.paddingX.mobile};
  
  --cm-spacing-section-mobile: ${spacing.mobile.sectionPadding};
  --cm-spacing-section-tablet: ${spacing.tablet.sectionPadding};
  --cm-spacing-section-desktop: ${spacing.desktop.sectionPadding};
  
  --cm-spacing-gap-mobile: ${spacing.mobile.elementGap};
  --cm-spacing-gap-tablet: ${spacing.tablet.elementGap};
  --cm-spacing-gap-desktop: ${spacing.desktop.elementGap};
  
  --cm-text-hero-mobile: ${typography.mobile.heroHeading};
  --cm-text-hero-tablet: ${typography.tablet.heroHeading};
  --cm-text-hero-desktop: ${typography.desktop.heroHeading};
  
  --cm-text-section-mobile: ${typography.mobile.sectionHeading};
  --cm-text-section-tablet: ${typography.tablet.sectionHeading};
  --cm-text-section-desktop: ${typography.desktop.sectionHeading};
  
  --cm-text-body-mobile: ${typography.mobile.body};
  --cm-text-body-tablet: ${typography.tablet.body};
  --cm-text-body-desktop: ${typography.desktop.body};
  
  --cm-line-height-normal: 1.6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--cm-font-body);
  font-size: var(--cm-text-body-mobile);
  line-height: var(--cm-line-height-normal);
  color: var(--cm-color-text);
  background-color: var(--cm-color-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden; /* Prevent horizontal scroll */
}

/* v6.4: Responsive Container */
.cm-main {
  max-width: var(--cm-container-max-width);
  margin: 0 auto;
  padding-left: var(--cm-container-padding-x-mobile);
  padding-right: var(--cm-container-padding-x-mobile);
  width: 100%;
}

.container {
  max-width: var(--cm-container-max-width);
  margin: 0 auto;
  padding: 0 var(--cm-container-padding-x-mobile);
  width: 100%;
}

/* v6.4: Responsive Images - Always scale properly */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* v6.4: Tablet breakpoint */
@media (min-width: ${breakpoints.tablet}px) {
  body {
    font-size: var(--cm-text-body-tablet);
  }
  
  .cm-main,
  .container {
    padding-left: var(--cm-container-padding-x-tablet);
    padding-right: var(--cm-container-padding-x-tablet);
  }
}

/* v6.4: Laptop/Desktop breakpoint */
@media (min-width: ${breakpoints.laptop}px) {
  body {
    font-size: var(--cm-text-body-desktop);
  }
  
  .cm-main,
  .container {
    padding-left: var(--cm-container-padding-x-desktop);
    padding-right: var(--cm-container-padding-x-desktop);
  }
}

section {
  padding: var(--spacing-2xl) 0;
}

section:not(.hero) .container {
  background: var(--cm-color-surface);
  border-radius: var(--cm-radius-lg);
  box-shadow: var(--cm-shadow-soft);
  padding: var(--spacing-xl);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--cm-font-heading);
  font-weight: ${styleSystem.typography.heading.weights[0]};
  line-height: 1.2;
}

h1 {
  font-size: var(--cm-font-h1);
}

h2 {
  font-size: var(--cm-font-h2);
}

h3 {
  font-size: var(--cm-font-h3);
}

.hero .container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: center;
  gap: var(--spacing-2xl);
  background: linear-gradient(135deg, ${heroGradientStart} 0%, ${heroGradientMid} 50%, ${heroGradientEnd} 100%);
  color: #ffffff;
  border-radius: calc(var(--cm-radius-lg) * 1.1);
  box-shadow: var(--cm-shadow-soft);
  padding: var(--spacing-2xl);
}

.hero .hero-content h1,
.hero-headline {
  font-family: var(--cm-font-display);
  font-size: var(--cm-font-heroH1);
  margin-bottom: var(--cm-space-lg);
  line-height: 1.1;
  color: var(--cm-color-primary);
}

.hero-headline-white {
  color: white;
}

.subheadline,
.hero-paragraph {
  font-family: var(--cm-font-body);
  font-size: var(--cm-font-body-size);
  color: var(--cm-color-text);
}

.subheadline-white,
.hero-paragraph-white {
  color: white;
}

.hero .hero-content p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: var(--spacing-lg);
}

.hero .hero-media img {
  width: 100%;
  height: 100%;
  border-radius: var(--cm-radius-lg);
  object-fit: cover;
  box-shadow: var(--shadow-lg);
}

.hero .hero-kicker {
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
}

.section-block.has-media .container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--spacing-xl);
  align-items: center;
}

.section-media img {
  width: 100%;
  border-radius: var(--cm-radius-lg);
  object-fit: cover;
  box-shadow: var(--shadow-md);
}

.section-content h2 {
  font-size: var(--cm-font-h2);
  margin-bottom: var(--cm-space-md);
  color: var(--cm-color-text);
}

.section-content p {
  color: var(--cm-color-text);
  font-size: var(--cm-font-body-size);
  line-height: 1.6;
}

.features.section-block .container {
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.cta-primary {
  display: inline-block;
  padding: var(--cm-space-sm) var(--cm-space-md);
  border-radius: var(--cm-radius-md);
  text-decoration: none;
  font-family: var(--cm-font-body);
  font-size: var(--cm-font-body-size);
  font-weight: 600;
  transition: all 0.3s ease;
  background: var(--cm-color-primary);
  color: #ffffff;
  box-shadow: var(--cm-shadow-level1);
}

.cta-primary:hover {
  background: var(--cm-color-accent);
  transform: translateY(-2px);
  box-shadow: var(--cm-shadow-level2);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--cm-space-lg);
  margin-top: var(--cm-space-xl);
}

.feature-card {
  padding: var(--cm-space-lg);
  border-radius: var(--cm-radius-lg);
  background: var(--cm-color-surface);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

  /* v6.4: Responsive Layout Engine - Mobile-First Media Queries */
  
  /* Tablet and up (768px+) */
  @media (min-width: ${breakpoints.tablet}px) {
    /* Hero variants - tablet responsive */
    .hero-split-left .container,
    .hero-split-right .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--cm-spacing-gap-tablet);
      align-items: center;
    }
    
    .hero-split-left .hero-content {
      text-align: left;
    }
    
    .hero-split-right .hero-content {
      text-align: right;
    }
    
    /* About variants - tablet responsive */
    .about-image-left .container,
    .about-image-right .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--cm-spacing-gap-tablet);
      align-items: center;
    }
    
    /* Features variants - tablet responsive */
    .features-grid-3 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    
    .features-grid-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    
    .features-grid-4 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    
    /* Testimonials variants - tablet responsive */
    .testimonials-grid-3 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    
    /* Pricing variants - tablet responsive */
    .pricing-grid-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    
    /* CTA variants - tablet responsive */
    .cta-split .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--cm-spacing-gap-tablet);
      align-items: center;
    }
    
    /* Contact variants - tablet responsive */
    .contact-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--cm-spacing-gap-tablet);
    }
    
    /* FAQ variants - tablet responsive */
    .faq-grid-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    
    /* Typography - tablet responsive */
    .hero h1 {
      font-size: var(--cm-text-hero-tablet);
    }
    
    h2 {
      font-size: var(--cm-text-section-tablet);
    }
  }
  
  /* Laptop and up (1024px+) */
  @media (min-width: ${breakpoints.laptop}px) {
    /* Features variants - laptop responsive */
    .features-grid-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    
    .features-grid-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    
    /* Testimonials variants - laptop responsive */
    .testimonials-grid-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    
    .testimonial-spotlight {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--cm-spacing-gap-desktop);
    }
    
    /* Pricing variants - laptop responsive */
    .pricing-grid-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    
    /* Typography - laptop responsive */
    .hero h1 {
      font-size: var(--cm-text-hero-desktop);
    }
    
    h2 {
      font-size: var(--cm-text-section-desktop);
    }
  }
  
  /* Desktop and up (1440px+) */
  @media (min-width: ${breakpoints.desktop}px) {
    /* Additional desktop-only enhancements */
    .hero {
      min-height: 80vh;
    }
    
    .section-block {
      padding: var(--cm-spacing-section-desktop);
    }
  }
  
  /* Mobile-specific overrides (max-width) */
  @media (max-width: ${breakpoints.tablet - 1}px) {
    /* Force single column on mobile */
    .hero-split-left .container,
    .hero-split-right .container,
    .about-image-left .container,
    .about-image-right .container,
    .cta-split .container,
    .contact-wrapper {
      display: block;
    }
    
    .hero-split-left .hero-media,
    .hero-split-right .hero-media,
    .about-image-left .section-media,
    .about-image-right .section-media {
      margin-bottom: var(--cm-spacing-gap-mobile);
    }
    
    .features-grid-2,
    .features-grid-3,
    .features-grid-4,
    .pricing-grid-2,
    .pricing-grid-3,
    .testimonials-grid-3,
    .faq-grid-2 {
      grid-template-columns: 1fr;
    }
    
    .feature-alternating {
      display: block;
    }
    
    .feature-alternating.feature-right {
      direction: ltr;
    }
    
    .testimonial-spotlight {
      display: block;
    }
    
    .testimonial-featured {
      margin-bottom: var(--cm-spacing-gap-mobile);
    }
    
    /* Mobile typography */
    .hero h1 {
      font-size: var(--cm-text-hero-mobile);
      line-height: 1.2;
    }
    
    h2 {
      font-size: var(--cm-text-section-mobile);
    }
    
    /* Mobile spacing */
    .section-block {
      padding: var(--cm-spacing-section-mobile);
    }
    
    .features-grid,
    .pricing-grid,
    .testimonials-grid {
      gap: var(--cm-spacing-gap-mobile);
    }
  }

  /* v6.8: Multi-Page Navigation System */
  /* v6.9: Updated to use theme tokens */
  .cm-header {
    background: var(--cm-color-bg);
    border-bottom: 1px solid var(--cm-color-neutral300);
    position: sticky;
    top: 0;
    z-index: 1000;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: var(--cm-shadow-level2);
  }

  .cm-nav {
    width: 100%;
  }

  .cm-nav-container {
    max-width: var(--cm-container-max-width);
    margin: 0 auto;
    padding: 1rem var(--cm-container-padding-x-mobile);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cm-nav-brand {
    flex: 0 0 auto;
  }

  .cm-nav-logo {
    font-family: var(--cm-font-heading);
    font-size: var(--cm-font-h3);
    font-weight: 700;
    color: var(--cm-color-primary);
    text-decoration: none;
    transition: opacity 0.2s;
  }

  .cm-nav-logo:hover {
    opacity: 0.8;
  }

  .cm-nav-toggle {
    display: none;
    flex-direction: column;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    gap: 4px;
  }

  .cm-nav-toggle span {
    width: 24px;
    height: 2px;
    background: var(--cm-color-text);
    transition: all 0.3s;
    border-radius: 2px;
  }

  .cm-nav-toggle-active span:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
  }

  .cm-nav-toggle-active span:nth-child(2) {
    opacity: 0;
  }

  .cm-nav-toggle-active span:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
  }

  .cm-nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
    align-items: center;
    margin: 0;
    padding: 0;
  }

  .cm-nav-item {
    margin: 0;
  }

  .cm-nav-link {
    font-family: var(--cm-font-body);
    font-size: var(--cm-font-body-size);
    color: var(--cm-color-text);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
    position: relative;
    padding: var(--cm-space-xs) 0;
  }

  .cm-nav-link:hover {
    color: var(--cm-color-accent);
  }

  .cm-nav-link.active {
    color: var(--cm-color-accent);
  }

  .cm-nav-link.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--cm-color-accent);
  }

  /* v6.8: Mobile Navigation */
  @media (max-width: 768px) {
    .cm-nav-toggle {
      display: flex;
    }

    .cm-nav-menu {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--cm-color-bg);
      flex-direction: column;
      align-items: stretch;
      padding: 1rem;
      gap: 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-out;
    }

    .cm-nav-menu.cm-nav-menu-open {
      max-height: 500px;
    }

    .cm-nav-item {
      width: 100%;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .cm-nav-item:last-child {
      border-bottom: none;
    }

    .cm-nav-link {
      display: block;
      padding: var(--cm-space-sm);
      width: 100%;
    }

    .cm-nav-link.active::after {
      display: none;
    }

    .cm-nav-link.active {
      background: var(--cm-color-neutral100);
      border-left: 3px solid var(--cm-color-accent);
    }
  }

  /* v6.8: Footer Styles */
  /* v6.9: Updated to use theme tokens */
  .cm-footer {
    background: var(--cm-color-neutral300);
    border-top: 1px solid var(--cm-color-neutral200);
    margin-top: var(--cm-space-xl);
    padding: var(--cm-space-xl) 0 var(--cm-space-md);
  }

  .cm-footer-container {
    max-width: var(--cm-container-max-width);
    margin: 0 auto;
    padding: 0 var(--cm-container-padding-x-mobile);
  }

  .cm-footer-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .cm-footer-brand h3 {
    font-family: var(--cm-font-heading);
    font-size: var(--cm-font-h3);
    color: var(--cm-color-primary);
    margin-bottom: var(--cm-space-xs);
  }

  .cm-footer-brand p {
    color: var(--cm-color-text);
    opacity: 0.7;
    font-size: var(--cm-font-small);
  }

  .cm-footer-links h4 {
    font-family: var(--cm-font-heading);
    font-size: var(--cm-font-h3);
    margin-bottom: var(--cm-space-sm);
    color: var(--cm-color-text);
  }

  .cm-footer-links ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .cm-footer-links li {
    margin-bottom: 0.5rem;
  }

  .cm-footer-links a {
    color: var(--cm-color-text);
    text-decoration: none;
    opacity: 0.7;
    transition: opacity 0.2s;
    font-size: var(--cm-font-small);
  }

  .cm-footer-links a:hover {
    opacity: 1;
  }

  .cm-footer-bottom {
    text-align: center;
    padding-top: var(--cm-space-md);
    border-top: 1px solid var(--cm-color-neutral200);
    color: var(--cm-color-text);
    opacity: 0.6;
    font-size: var(--cm-font-small);
  }

  @media (min-width: 768px) {
    .cm-footer-content {
      grid-template-columns: 2fr 1fr 1fr;
    }
  }
`;
}

export function generateJavaScript(_layout: LayoutStructure): string {
  return `// Generated by Merlin Design LLM v6.x with GSAP Animations - 120% Feature

// Initialize GSAP
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// GSAP Animations - Professional scroll-triggered animations
document.addEventListener('DOMContentLoaded', () => {
  // Hero section fade-in
  gsap.fromTo('.hero-section, .hero, section:first-of-type',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      delay: 0.2,
      ease: 'power3.out'
    }
  );

  // Sections animate on scroll
  gsap.utils.toArray('.section, section').forEach((section: Element, index: number) => {
    gsap.fromTo(section,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );
  });

  // Cards and feature cards fade in
  gsap.utils.toArray('.card, .feature-card, .service-card').forEach((card: Element, index: number) => {
    gsap.fromTo(card,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        delay: index * 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );
  });

  // Smooth scroll for anchor links (GSAP-powered)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href') || '');
      if (target && typeof gsap !== 'undefined') {
        gsap.to(window, {
          duration: 1,
          scrollTo: { y: target, offsetY: 80 },
          ease: 'power2.inOut'
        });
      } else if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});

// Smooth scroll fallback (if GSAP not loaded)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href') || '');
    if (target && typeof gsap === 'undefined') {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Mobile menu toggle (if needed)
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}

// v6.3: FAQ Accordion Toggle
function toggleFAQ(index) {
  const answer = document.getElementById('faq-answer-' + index);
  if (answer) {
    answer.classList.toggle('active');
    const icon = answer.previousElementSibling?.querySelector('.faq-icon');
    if (icon) {
      icon.textContent = answer.classList.contains('active') ? '−' : '+';
    }
  }
}

// v6.3: Testimonials Carousel (basic auto-scroll)
const carouselTrack = document.querySelector('.testimonials-carousel-track');
if (carouselTrack) {
  let scrollPosition = 0;
  const scrollAmount = 320; // card width + gap
  
  setInterval(() => {
    scrollPosition += scrollAmount;
    if (scrollPosition >= carouselTrack.scrollWidth - carouselTrack.clientWidth) {
      scrollPosition = 0;
    }
    carouselTrack.scrollTo({ left: scrollPosition, behavior: 'smooth' });
  }, 3000);
}
`;
}

function generateSectionReact(section: any, _copy: CopyContent, _styleSystem: StyleSystem): string {
  // Simplified React generation
  return `      <${section.type.charAt(0).toUpperCase() + section.type.slice(1)}Section />\n`;
}

function generateSectionTailwind(section: any, copy: CopyContent): string {
  if (section.type === 'hero') {
    return `  <section class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-white">
    <div class="container mx-auto px-6 text-center">
      <h1 class="text-5xl font-heading font-bold mb-6">${copy.hero.headline}</h1>
      <p class="text-xl mb-8">${copy.hero.subheadline}</p>
      <a href="#contact" class="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition">${copy.hero.cta}</a>
    </div>
  </section>
`;
  }
  
  return `  <section class="py-16">
    <div class="container mx-auto px-6">
      <h2 class="text-3xl font-heading font-bold mb-6">${copy.sections[0]?.heading || 'Section'}</h2>
      <p class="text-lg">${copy.sections[0]?.body || 'Content'}</p>
    </div>
  </section>
`;
}

function getSpacing(spacing: string, styleSystem: StyleSystem): string {
  const spacingMap: Record<string, number> = {
    'small': styleSystem.spacing.scale[2],
    'medium': styleSystem.spacing.scale[4],
    'large': styleSystem.spacing.scale[6],
    'extra-large': styleSystem.spacing.scale[8]
  };
  
  return `${spacingMap[spacing] || styleSystem.spacing.scale[4]}px`;
}

/**
 * Save generated code to files
 * FIXED: Ensures CSS file is always created and saved correctly
 */
export function saveGeneratedCode(
  code: GeneratedCode,
  outputDir: string,
  format: 'html' | 'react' | 'tailwind'
): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  if (format === 'html') {
    // Ensure HTML is saved
    if (!code.html) {
      throw new Error('HTML content is missing');
    }
    fs.writeFileSync(path.join(outputDir, 'index.html'), code.html);
    
    // CRITICAL FIX: Ensure CSS is always saved
    if (!code.css) {
      console.warn('[Code Generator] CSS is missing, generating minimal CSS');
      code.css = generateMinimalCSS();
    }
    fs.writeFileSync(path.join(outputDir, 'styles.css'), code.css);
    
    // Verify CSS file was created
    const cssPath = path.join(outputDir, 'styles.css');
    if (!fs.existsSync(cssPath)) {
      throw new Error(`Failed to create CSS file at ${cssPath}`);
    }
    
    if (code.javascript) {
      fs.writeFileSync(path.join(outputDir, 'script.js'), code.javascript);
    }
    
    console.log(`[Code Generator] Files saved: index.html, styles.css${code.javascript ? ', script.js' : ''}`);
  } else if (format === 'react') {
    const componentsDir = path.join(outputDir, 'components');
    if (!fs.existsSync(componentsDir)) {
      fs.mkdirSync(componentsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(outputDir, 'App.tsx'), code.react || '');
    if (code.css) {
      fs.writeFileSync(path.join(outputDir, 'App.css'), code.css);
    }
  } else {
    fs.writeFileSync(path.join(outputDir, 'index.html'), code.tailwind || '');
  }
  
  // Create README
  const readme = `# Generated Website v5.0

Generated by Merlin Design LLM v5.0

## Files

${format === 'html' ? '- index.html\n- styles.css\n- script.js' : format === 'react' ? '- App.tsx\n- App.css\n- components/' : '- index.html (Tailwind CSS)'}

## Usage

${format === 'html' ? 'Open index.html in a browser' : format === 'react' ? 'Run: npm install && npm start' : 'Open index.html in a browser (Tailwind via CDN)'}

---
Generated: ${new Date().toISOString()}
`;
  
  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
}

/**
 * Generate minimal CSS if CSS generation fails
 */
function generateMinimalCSS(): string {
  return `/* Minimal CSS - Generated as fallback */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #fff;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

h1, h2, h3, h4, h5, h6 {
  margin-bottom: 1rem;
  line-height: 1.2;
}

.cta-primary {
  display: inline-block;
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.cta-primary:hover {
  background-color: #0056b3;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.feature-card {
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}
`;
}

