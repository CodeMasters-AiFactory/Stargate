/**
 * DEPRECATED IN MERLIN 6.x – DO NOT USE FOR NEW GENERATION
 * 
 * Multi-Page Website Generator
 * Generates true multi-page websites with separate HTML files
 * The best Merlin website wizard on planet Earth 🌍
 * 
 * This legacy generator is kept for:
 * - Optional debug tools
 * - Reference implementation
 * - Backward compatibility (if needed)
 * 
 * ACTIVE PIPELINE: Use merlinDesignLLM.ts (v6.x AI pipeline) instead.
 * For multi-page generation, use generator/multiPageGenerator.ts (v6.8).
 */

import OpenAI from 'openai';
import * as crypto from 'crypto';
import type {
  WebsiteManifest,
  PageSpec,
  MultiPageWebsite,
  GenerationProgress,
  WebsiteFile,
  SectionSpec
} from './types/multipage';
import type { InvestigationResults } from './websiteInvestigation';
import { generateDesignTokens, generateDesignSystemCSS } from './designSystem';
import { generateAnalyticsScript } from './analyticsTracking';
import { generateSchemaMarkup, generateSEOMetaTags } from './seoOptimization';
import { minifyCSS, minifyJS, extractCriticalCSS, addResourceHintsToHTML, optimizeScripts } from './performanceOptimizer';
import { optimizeImagesInHTML } from './imageOptimization';
import { optimizeCoreWebVitals, optimizeFontLoading } from './coreWebVitals';
import { generateBreadcrumbHTML, generateBreadcrumbSchema, generateBreadcrumbsForPage, generateBreadcrumbCSS } from './breadcrumbs';
import { findRelatedContent, generateRelatedContentLinks, generateInternalLinkingCSS } from './internalLinking';
import { generateCTAVariations, generateOptimizedCTA, generateCTACSS, addConversionTracking } from './conversionOptimizer';
import { generateFormCSS } from './formOptimizer';
import { generateDefaultFunnels, generateFunnelTrackingScript } from './funnelMapper';
import { generatePrivacyPolicy, generateTermsOfService, generateCookieConsent, generateTrustElementsCSS } from './trustElements';
import { generateMicroAnimationsCSS, generateMobileOptimizationCSS, applyUXEnhancements } from './uxEnhancements';
import { generateStunningImage } from './advancedImageService';
import { generateAdvancedGridSystem } from './advancedLayoutSystem';
import { generateStunningColorScheme, generateColorSchemeCSS } from './advancedColorSchemes';
import { generateEffectsLibraryCSS, generateGradientMeshEffect, generateParticleEffect } from './advancedEffectsLibrary';
import { generateAIChatbot } from './chatbotGenerator';
import { getLivePreviewService } from './livePreviewService';

/**
 * OpenAI Client Factory with dual key support and mock fallback
 * Tries AI Integrations keys first, then direct key, then returns null for mock mode
 */
function createOpenAIClient(): OpenAI | null {
  // Try Replit AI Integration keys first (preferred)
  if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  
  // Fallback to direct OpenAI key
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  
  // No keys available - will use mock mode
  return null;
}

const openai = createOpenAIClient();
const MOCK_MODE = !openai;

function createChecksum(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Extract a specific section from HTML by ID
 */
function extractSectionHTML(html: string, sectionId: string): string {
  // Try to find section by ID attribute
  const idMatch = html.match(new RegExp(`<section[^>]*id=["']${sectionId}["'][^>]*>([\\s\\S]*?)</section>`, 'i'));
  if (idMatch) {
    return idMatch[0];
  }
  
  // Try to find by class
  const classMatch = html.match(new RegExp(`<section[^>]*class=["'][^"]*section-${sectionId}[^"]*["'][^>]*>([\\s\\S]*?)</section>`, 'i'));
  if (classMatch) {
    return classMatch[0];
  }
  
  // Fallback: return empty (section will be generated)
  return '';
}

/**
 * Emit progress with Base64-encoded content to prevent SSE JSON chunking bugs
 * Automatically encodes HTML/CSS/JS fields to avoid "Unterminated string in JSON" errors
 */
function emitProgress(progress: GenerationProgress, onProgress?: (progress: GenerationProgress) => void) {
  if (!onProgress) return;

  // If progress has data with HTML/CSS/JS, encode it to prevent JSON chunking
  if (progress.data && (progress.data.html || progress.data.css || progress.data.js)) {
    const safeProgress: GenerationProgress = {
      ...progress,
      encoded: true,
      data: {
        ...progress.data,
        html: progress.data.html ? Buffer.from(progress.data.html).toString('base64') : undefined,
        css: progress.data.css ? Buffer.from(progress.data.css).toString('base64') : undefined,
        js: progress.data.js ? Buffer.from(progress.data.js).toString('base64') : undefined,
      }
    };
    onProgress(safeProgress);
  } else {
    // Small text messages don't need encoding
    onProgress(progress);
  }
}

/**
 * Generate mock manifest when OpenAI unavailable
 * Derives values from user requirements to maintain personalization
 */
function generateMockManifest(requirements: Record<string, unknown>, investigation: InvestigationResults | null): WebsiteManifest {
  const businessName = (requirements.businessName as string) || 'Professional Business';
  const businessType = (requirements.businessType as string) || 'Professional services';
  const targetAudience = (requirements.targetAudience as string) || 'clients';
  const services = (requirements.services as Array<{ name: string; description?: string }>) || [];
  const pages = (requirements.desiredPages as string[]) || ['Home', 'Services', 'About', 'Contact'];
  
  // Generate page-specific content based on page type
  const getPageSections = (pageName: string): SectionSpec[] => {
    const pageLower = pageName.toLowerCase();
    
    if (pageLower === 'home') {
      return [
        {
          id: 'hero',
          type: 'hero',
          title: `Welcome to ${businessName}`,
          content: `Your trusted ${businessType} serving ${targetAudience}. We deliver exceptional quality and personalized service.`,
          order: 1
        },
        {
          id: 'features',
          type: 'features',
          title: 'Why Choose Us',
          content: Array.isArray(services) && services.length > 0
            ? `We offer ${services.length} specialized ${services.length === 1 ? 'service' : 'services'} designed for ${targetAudience}.`
            : `Experience the difference with our commitment to excellence and customer satisfaction.`,
          order: 2
        },
        {
          id: 'services',
          type: 'services',
          title: Array.isArray(services) && services.length > 0 ? 'Our Services' : 'What We Offer',
          content: Array.isArray(services) && services.length > 0
            ? services.map((s) => s.name).join(', ')
            : `Comprehensive ${businessType} solutions tailored to your needs.`,
          order: 3
        },
        {
          id: 'cta',
          type: 'cta',
          title: 'Get Started Today',
          content: `Ready to experience the best ${businessType}? Contact us now to learn more.`,
          order: 4
        }
      ];
    } else if (pageLower === 'services' || pageLower === 'menu') {
      return [
        {
          id: 'hero',
          type: 'hero',
          title: `Our ${pageName}`,
          content: `Explore our comprehensive range of ${businessType.toLowerCase()} designed for ${targetAudience}.`,
          order: 1
        },
        {
          id: 'services',
          type: 'services',
          title: 'What We Offer',
          content: Array.isArray(services) && services.length > 0
            ? services.map((s: { name: string; description?: string }, i: number) => `${i + 1}. ${s.name}: ${s.description || 'Professional service'}`).join('\n')
            : `We provide top-quality ${businessType.toLowerCase()} with attention to detail and customer satisfaction.`,
          order: 2
        },
        {
          id: 'cta',
          type: 'cta',
          title: 'Interested?',
          content: `Contact us to learn more about our ${businessType.toLowerCase()} and how we can help you.`,
          order: 3
        }
      ];
    } else if (pageLower === 'about') {
      return [
        {
          id: 'hero',
          type: 'hero',
          title: `About ${businessName}`,
          content: `Learn more about our story, mission, and commitment to serving ${targetAudience}.`,
          order: 1
        },
        {
          id: 'content',
          type: 'content',
          title: 'Our Story',
          content: `${businessName} is a ${businessType} dedicated to providing exceptional service to ${targetAudience}. We combine expertise with passion to deliver outstanding results.`,
          order: 2
        },
        {
          id: 'features',
          type: 'features',
          title: 'Our Values',
          content: `Quality, integrity, and customer satisfaction are at the heart of everything we do.`,
          order: 3
        }
      ];
    } else if (pageLower === 'contact') {
      return [
        {
          id: 'hero',
          type: 'hero',
          title: 'Get In Touch',
          content: `We'd love to hear from you. Reach out to ${businessName} today.`,
          order: 1
        },
        {
          id: 'content',
          type: 'content',
          title: 'Contact Information',
          content: `Ready to get started? Contact us to discuss your ${businessType.toLowerCase()} needs.`,
          order: 2
        },
        {
          id: 'cta',
          type: 'cta',
          title: 'Send Us a Message',
          content: `Fill out the form below and we'll get back to you as soon as possible.`,
          order: 3
        }
      ];
    } else {
      // Generic page
      return [
        {
          id: 'hero',
          type: 'hero',
          title: pageName,
          content: `Welcome to our ${pageName.toLowerCase()} page at ${businessName}.`,
          order: 1
        },
        {
          id: 'content',
          type: 'content',
          title: `About ${pageName}`,
          content: `Learn more about ${pageName.toLowerCase()} and how ${businessName} can help you.`,
          order: 2
        }
      ];
    }
  };
  
  return {
    siteName: businessName,
    description: `${businessName} - ${businessType} for ${targetAudience}`,
    version: '1.0',
    pages: pages.map((pageName: string, index: number) => ({
      slug: pageName.toLowerCase().replace(/\s+/g, '-'),
      title: pageName,
      description: `${businessName} - ${pageName} page for ${targetAudience}`,
      sections: getPageSections(pageName),
      seo: {
        title: `${pageName} | ${businessName}`,
        description: `${businessName} ${pageName.toLowerCase()} - ${(requirements.targetAudience as string) || 'Professional services'}`,
        keywords: investigation?.seoStrategy?.primaryKeywords || []
      },
      order: index + 1
    })),
    navigation: {
      type: 'header',
      sticky: true,
      pages: pages.map((pageName: string, index: number) => ({
        slug: pageName.toLowerCase().replace(/\s+/g, '-'),
        label: pageName,
        order: index + 1
      }))
    },
    sharedComponents: {
      header: `<header class="site-header">${businessName}</header>`,
      footer: `<footer class="site-footer">&copy; 2024 ${businessName}</footer>`,
      navigation: `<nav class="site-nav">Navigation</nav>`
    },
    seoStrategy: investigation?.seoStrategy || {
      primaryKeywords: ['professional', 'services', 'business'],
      secondaryKeywords: ['quality', 'reliable', 'expert'],
      contentGaps: []
    },
    designSystem: {
      colors: {
        primary: (requirements.primaryColor as string) || '#3B82F6',
        accent: (requirements.accentColor as string) || '#10B981',
        background: '#FFFFFF',
        text: '#1F2937'
      },
      typography: {
        headingFont: (requirements.fontFamily as string) || 'Inter, sans-serif',
        bodyFont: (requirements.fontFamily as string) || 'Inter, sans-serif',
        sizes: {
          h1: '3rem',
          h2: '2rem',
          body: '1rem'
        }
      },
      spacing: {
        section: '4rem',
        element: '1.5rem'
      },
      borderRadius: '0.5rem'
    }
  };
}

/**
 * Generate mock HTML page when OpenAI unavailable
 * Uses professional design system classes
 */
function generateMockPageHTML(page: PageSpec, manifest: WebsiteManifest): string {
  const { siteName, navigation } = manifest;
  
  // Generate navigation links
  const navLinks = navigation.pages.map(p => 
    `<a href="./${p.slug}.html" class="${p.slug === page.slug ? 'active' : ''}">${p.label}</a>`
  ).join('\n      ');
  
  // Generate sections with proper design system classes
  const generateSectionHTML = (section: SectionSpec): string => {
    const sectionType = section.type;
    
    if (sectionType === 'hero') {
      // Use placeholder image - AI images will be generated during actual generation
      const heroImage = `https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=600&fit=crop&q=80`;
      return `
    <section id="${section.id}" class="hero-modern building-block">
      <div class="hero-content" style="position: relative; min-height: 90vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, ${manifest.designSystem.colors.primary} 0%, ${manifest.designSystem.colors.accent} 100%); color: white; text-align: center; padding: 4rem 2rem; overflow: hidden;">
        <div style="position: relative; z-index: 2; max-width: 900px;">
          <h1 class="hero-title" style="font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 700; margin-bottom: 1.5rem; line-height: 1.1; text-shadow: 0 2px 20px rgba(0,0,0,0.2);">${section.title}</h1>
          <p class="hero-subtitle" style="font-size: clamp(1.1rem, 2vw, 1.5rem); margin-bottom: 2.5rem; opacity: 0.95; line-height: 1.6; text-shadow: 0 1px 10px rgba(0,0,0,0.1);">${section.content}</p>
          <div class="hero-cta" style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <a href="#features" class="btn-primary-large" style="background: white; color: ${manifest.designSystem.colors.primary}; padding: 1rem 2.5rem; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 1.1rem; transition: transform 0.2s, box-shadow 0.2s; display: inline-block; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">Get Started</a>
            <a href="#about" class="btn-secondary" style="background: rgba(255,255,255,0.1); color: white; padding: 1rem 2.5rem; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 1.1rem; border: 2px solid white; transition: transform 0.2s; display: inline-block; backdrop-filter: blur(10px);">Learn More</a>
          </div>
        </div>
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('${heroImage}'); background-size: cover; background-position: center; opacity: 0.2; z-index: 1;"></div>
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%); z-index: 1;"></div>
      </div>
    </section>`;
    } else if (sectionType === 'features') {
      const featureImages = [
        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop&q=80',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&q=80',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&q=80'
      ];
      return `
    <section id="${section.id}" class="features-section building-block" style="padding: 6rem 2rem; background: #f8f9fa;">
      <div class="container" style="max-width: 1200px; margin: 0 auto;">
        <h2 class="section-title" style="text-align: center; font-size: clamp(2rem, 5vw, 3rem); font-weight: 700; margin-bottom: 1rem; color: ${manifest.designSystem.colors.text};">${section.title}</h2>
        <p class="section-description" style="text-align: center; font-size: 1.2rem; color: #6b7280; margin-bottom: 4rem; max-width: 600px; margin-left: auto; margin-right: auto;">${section.content}</p>
        <div class="features-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
          <div class="feature-card building-block" style="background: white; border-radius: 16px; padding: 2.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); transition: transform 0.3s, box-shadow 0.3s; overflow: hidden;">
            <div style="width: 100%; height: 200px; background-image: url('${featureImages[0]}'); background-size: cover; background-position: center; border-radius: 12px; margin-bottom: 1.5rem;"></div>
            <div class="feature-icon" style="width: 50px; height: 50px; background: linear-gradient(135deg, ${manifest.designSystem.colors.primary} 0%, ${manifest.designSystem.colors.accent} 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">✓</div>
            <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; color: ${manifest.designSystem.colors.text};">Quality Service</h3>
            <p style="color: #6b7280; line-height: 1.6;">We deliver exceptional results with attention to detail and customer satisfaction.</p>
          </div>
          <div class="feature-card building-block" style="background: white; border-radius: 16px; padding: 2.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); transition: transform 0.3s, box-shadow 0.3s; overflow: hidden;">
            <div style="width: 100%; height: 200px; background-image: url('${featureImages[1]}'); background-size: cover; background-position: center; border-radius: 12px; margin-bottom: 1.5rem;"></div>
            <div class="feature-icon" style="width: 50px; height: 50px; background: linear-gradient(135deg, ${manifest.designSystem.colors.primary} 0%, ${manifest.designSystem.colors.accent} 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">✓</div>
            <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; color: ${manifest.designSystem.colors.text};">Expert Team</h3>
            <p style="color: #6b7280; line-height: 1.6;">Experienced professionals dedicated to your success and growth.</p>
          </div>
          <div class="feature-card building-block" style="background: white; border-radius: 16px; padding: 2.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); transition: transform 0.3s, box-shadow 0.3s; overflow: hidden;">
            <div style="width: 100%; height: 200px; background-image: url('${featureImages[2]}'); background-size: cover; background-position: center; border-radius: 12px; margin-bottom: 1.5rem;"></div>
            <div class="feature-icon" style="width: 50px; height: 50px; background: linear-gradient(135deg, ${manifest.designSystem.colors.primary} 0%, ${manifest.designSystem.colors.accent} 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">✓</div>
            <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; color: ${manifest.designSystem.colors.text};">Customer Focus</h3>
            <p style="color: #6b7280; line-height: 1.6;">Your satisfaction is our priority. We're here to help you succeed.</p>
          </div>
        </div>
      </div>
    </section>`;
    } else if (sectionType === 'services') {
      const servicesList = section.content.split('\n').filter((s: string) => s.trim());
      return `
    <section id="${section.id}" class="services-section">
      <div class="container">
        <h2 class="section-title">${section.title}</h2>
        <div class="services-grid">
          ${servicesList.map((service: string, i: number) => `
          <div class="service-card">
            <div class="service-number">${i + 1}</div>
            <h3>${service.split(':')[0]}</h3>
            ${service.includes(':') ? `<p>${service.split(':')[1].trim()}</p>` : ''}
          </div>`).join('\n          ')}
        </div>
      </div>
    </section>`;
    } else if (sectionType === 'cta') {
      return `
    <section id="${section.id}" class="section-cta">
      <div class="container">
        <h2 class="section-title">${section.title}</h2>
        <p class="section-description">${section.content}</p>
        <div style="text-align: center; margin-top: 2rem;">
          <a href="./contact.html" class="btn-primary-large">Contact Us</a>
        </div>
      </div>
    </section>`;
    } else {
      return `
    <section id="${section.id}" class="section-content">
      <div class="container">
        <h2 class="section-title">${section.title}</h2>
        <p class="section-description">${section.content}</p>
      </div>
    </section>`;
    }
  };
  
  // Generate SEO meta tags
  const seoMetaTags = generateSEOMetaTags({
    title: page.seo.title,
    description: page.seo.description,
    keywords: page.seo.keywords,
    url: `https://${manifest.siteName.toLowerCase().replace(/\s+/g, '')}.com/${page.slug}`,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${seoMetaTags}
  <link rel="stylesheet" href="./assets/styles/main.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <h1>${siteName}</h1>
    </div>
  </header>
  <nav class="site-nav">
    <div class="container">
      ${navLinks}
    </div>
  </nav>
  
  <main class="page-${page.slug}">
    ${page.sections.map(generateSectionHTML).join('\n')}
  </main>
  
  <footer class="site-footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
    </div>
  </footer>
  <script src="./assets/scripts/app.js"></script>
</body>
</html>`;
}

/**
 * Generate mock shared CSS when OpenAI unavailable
 */
function generateMockCSS(manifest: WebsiteManifest): string {
  const { colors, typography, spacing } = manifest.designSystem;
  
  return `/* ${manifest.siteName} - Mock Stylesheet */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --color-primary: ${colors.primary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-text: ${colors.text};
  --font-heading: ${typography.headingFont};
  --font-body: ${typography.bodyFont};
}

body {
  font-family: var(--font-body);
  color: var(--color-text);
  background: var(--color-background);
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.site-header {
  background: var(--color-primary);
  color: white;
  padding: 1.5rem;
  text-align: center;
}

.site-nav {
  background: var(--color-background);
  padding: 1rem;
  border-bottom: 2px solid var(--color-accent);
}

section {
  padding: ${spacing.section};
  max-width: 1200px;
  margin: 0 auto;
}

.section-hero {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  color: white;
  text-align: center;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.section-cta {
  background: var(--color-accent);
  color: white;
  text-align: center;
}

.site-footer {
  background: var(--color-text);
  color: white;
  padding: 2rem;
  text-align: center;
  margin-top: 4rem;
}`;
}

/**
 * Generate mock JavaScript when OpenAI unavailable
 */
function generateMockJS(manifest: WebsiteManifest): string {
  return `// ${manifest.siteName} - Mock JavaScript
console.log('${manifest.siteName} - Demo Mode');

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});`;
}

/**
 * Phase 1: Generate Site Planning & Manifest
 */
export async function generateSiteManifest(
  requirements: Record<string, unknown>,
  investigation: InvestigationResults | null,
  onProgress?: (progress: GenerationProgress) => void
): Promise<WebsiteManifest> {
  emitProgress({
    phase: 'planning',
    currentStep: 'Creating site architecture',
    progress: 10,
    message: MOCK_MODE ? 
      'Planning multi-page website structure... (Demo Mode - using template)' : 
      'Planning multi-page website structure...'
  }, onProgress);

  // Use mock mode if OpenAI unavailable
  if (!openai) {
    emitProgress({
      phase: 'planning',
      currentStep: 'Generating demo structure',
      progress: 50,
      message: 'Creating professional demo website...'
    }, onProgress);
    
    const mockManifest = generateMockManifest(requirements, investigation);
    
    emitProgress({
      phase: 'planning',
      currentStep: 'Finalizing structure',
      progress: 100,
      message: 'Demo structure complete!'
    }, onProgress);
    
    return mockManifest;
  }

  const planningPrompt = `You are an elite web architect creating Apple/Stripe/Linear quality websites.

BUSINESS: ${(requirements.businessName as string) || 'Business'} (${(requirements.businessType as string) || 'General'})
TARGET AUDIENCE: ${(requirements.targetAudience as string) || 'General audience'}
PAGES REQUESTED: ${(requirements.desiredPages as string[] | undefined)?.join(', ') || 'Home, About, Services, Contact'}

SEO RESEARCH:
- Primary Keywords: ${investigation?.seoStrategy?.primaryKeywords?.slice(0, 5).join(', ') || 'professional, quality, services'}
- Secondary Keywords: ${investigation?.seoStrategy?.secondaryKeywords?.slice(0, 5).join(', ') || 'reliable, expert, trusted'}
- Content Gaps: ${investigation?.seoStrategy?.contentGaps?.join(', ') || 'none identified'}

DESIGN SPECS:
- Primary Color: ${(requirements.primaryColor as string) || investigation?.designRecommendations?.colorScheme?.primary || '#3B82F6'}
- Accent Color: ${(requirements.accentColor as string) || investigation?.designRecommendations?.colorScheme?.accent || '#10B981'}
- Font: ${(requirements.fontFamily as string) || investigation?.designRecommendations?.typography?.heading || 'Inter, sans-serif'}

PROFESSIONAL TEMPLATE SYSTEM:
Use these section types (we have pre-built professional templates):
- hero: Full-screen hero sections (modern gradient, minimal centered, or visual with media)
- features: Feature showcases (grid with icons, bento box layout)
- services: Service displays (card grid, alternating layout)
- testimonials: Customer testimonials (card grid)
- pricing: Pricing tables
- about: About sections with stats
- contact: Contact forms
- content: General content sections

INSTRUCTIONS:
1. Create a comprehensive site manifest
2. For EACH page, specify 4-8 sections using the template types above
3. Choose appropriate template types for each page's purpose
4. Ensure each section has compelling, specific content
5. Design a sticky header navigation
6. Define shared components (header, footer)
7. Plan SEO strategy per page

Output JSON manifest with:
{
  "siteName": "string",
  "description": "string",
  "pages": [
    {
      "slug": "home",
      "title": "string",
      "description": "string",
      "sections": [
        {"id": "hero", "type": "hero", "title": "...", "content": "...", "order": 1},
        {"id": "features", "type": "features", "title": "...", "content": "...", "order": 2}
      ],
      "seo": {"title": "...", "description": "...", "keywords": [...]},
      "order": 1
    }
  ],
  "navigation": {
    "type": "header",
    "sticky": true,
    "pages": [{"slug": "home", "label": "Home", "order": 1}]
  },
  "sharedComponents": {
    "header": "HTML for header",
    "footer": "HTML for footer",
    "navigation": "HTML for nav"
  },
  "seoStrategy": {
    "primaryKeywords": [],
    "secondaryKeywords": [],
    "contentGaps": []
  },
  "designSystem": {
    "colors": {"primary": "...", "accent": "...", "background": "...", "text": "..."},
    "typography": {
      "headingFont": "...",
      "bodyFont": "...",
      "sizes": {"h1": "...", "h2": "...", "body": "..."}
    },
    "spacing": {"section": "...", "element": "..."},
    "borderRadius": "..."
  },
  "version": "1.0"
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are an elite web architect creating comprehensive multi-page website plans. Output only JSON.'
      },
      { role: 'user', content: planningPrompt }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 8000,
  });

  const manifest = JSON.parse(completion.choices[0].message.content || '{}') as WebsiteManifest;

  emitProgress({
    phase: 'planning',
    currentStep: 'Site manifest created',
    progress: 25,
    message: `Planning complete: ${manifest.pages?.length || 0} pages designed`
  }, onProgress);

  return manifest;
}

/**
 * Phase 2: Generate Individual Page HTML
 */
export async function generatePageHTML(
  pageSpec: PageSpec,
  manifest: WebsiteManifest,
  onProgress?: (progress: GenerationProgress) => void
): Promise<string> {
  emitProgress({
    phase: 'pages',
    currentStep: `Generating ${pageSpec.title}`,
    progress: 30 + (pageSpec.order * 10),
    message: MOCK_MODE ? 
      `Creating ${pageSpec.title} page... (Demo Mode)` : 
      `Creating ${pageSpec.title} page...`
  }, onProgress);

  // Use mock mode if OpenAI unavailable
  if (!openai) {
    // In mock mode, emit section-by-section for progressive building
    const mockHTML = generateMockPageHTML(pageSpec, manifest);
    
    // Emit sections progressively for live building effect
    const sections = pageSpec.sections || [];
    for (let i = 0; i < sections.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1200)); // Slower delay - take time to show building
      emitProgress({
        phase: 'pages',
        currentStep: `Building ${sections[i].type} section`,
        progress: 30 + (pageSpec.order * 10) + (i * 5),
        message: `Adding ${sections[i].title}...`,
        data: {
          slug: pageSpec.slug,
          html: extractSectionHTML(mockHTML, sections[i].id)
        }
      }, onProgress);
    }
    
    return mockHTML;
  }

  const pagePrompt = `Generate a STUNNING, PROFESSIONAL HTML page using our design system. This must look like a $50,000 agency build.

PAGE: ${pageSpec.title} (${pageSpec.slug}.html)
DESCRIPTION: ${pageSpec.description}

SECTIONS TO INCLUDE:
${pageSpec.sections.map(s => `- ${s.type}: ${s.title}\n  ${s.content}`).join('\n')}

CRITICAL: YOU MUST USE ADVANCED EFFECTS CLASSES:
- Hero sections: Add class="glassmorphism-strong gradient-mesh" to hero containers
- Cards: Add class="hover-lift scale-on-hover" to all feature/service cards
- Buttons: Use class="btn-primary hover-glow" or "btn-glass" for glassmorphism
- Sections: Add class="fade-in" to main sections for animations
- Text: Use class="text-gradient" for headings when appropriate
- Backgrounds: Use class="gradient-mesh" or "particle-effect" for hero sections

PROFESSIONAL DESIGN SYSTEM (MANDATORY):
You MUST use these exact CSS classes from our design system:
- Containers: .container, .container-narrow
- Buttons: .btn-primary, .btn-secondary, .btn-primary-large, .btn-glass (with hover-glow)
- Section spacing: <section> elements get automatic 5rem padding
- Typography: .section-title, .section-description
- Hero sections: .hero-modern, .hero-minimal, .hero-visual (ALWAYS add glassmorphism-strong and gradient-mesh)
- Feature layouts: .features-grid, .feature-card (ALWAYS add hover-lift scale-on-hover), .bento-grid
- Service layouts: .services-grid, .service-card (ALWAYS add hover-lift), .services-alternating
- Testimonials: .testimonials-grid, .testimonial-card (ALWAYS add hover-lift)
- Pricing: .pricing-grid, .pricing-card (ALWAYS add hover-lift scale-on-hover)
- Contact: .contact-form, .form-group
- Footer: .site-footer, .footer-grid

ADVANCED EFFECTS (REQUIRED):
- ALL hero sections MUST have: class="glassmorphism-strong gradient-mesh"
- ALL cards MUST have: class="hover-lift scale-on-hover"
- ALL buttons MUST have: class="hover-glow" in addition to btn-primary/secondary
- Main sections SHOULD have: class="fade-in" or "slide-in-left" or "slide-in-right"
- Headings CAN have: class="text-gradient" for visual impact

SITE CONTEXT:
- Site Name: ${manifest.siteName}
- Navigation: ${manifest.navigation.pages.map(p => p.label).join(', ')}
- Primary Color: ${manifest.designSystem.colors.primary}
- Accent Color: ${manifest.designSystem.colors.accent}

SHARED COMPONENTS (inject these exactly):
- Header: ${manifest.sharedComponents.header}
- Navigation: ${manifest.sharedComponents.navigation}
- Footer: ${manifest.sharedComponents.footer}

TECHNICAL REQUIREMENTS:
- Complete <!DOCTYPE html> document
- Semantic HTML5 (<section>, <article>, <nav>, <header>, <footer>)
- SEO: title="${pageSpec.seo.title}", description="${pageSpec.seo.description}", keywords="${pageSpec.seo.keywords.join(', ')}"
- Open Graph tags for social sharing
- Link to ./assets/styles/main.css (design system CSS with ALL advanced effects)
- Link to ./assets/scripts/app.js
- Navigation links: ${manifest.pages.map(p => `./${p.slug}.html`).join(', ')}
- Use ONLY the CSS classes listed above (they're professionally designed with advanced effects)
- NO inline styles, NO custom CSS classes
- Professional, Apple/Stripe/Linear quality with glassmorphism, gradients, and animations

OUTPUT: Complete, production-ready HTML with advanced effects classes. No explanations.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are an elite web developer at a $50,000/website agency. You create STUNNING, PROFESSIONAL HTML pages that look like Apple.com, Stripe.com, or Linear.app. You MUST use advanced CSS classes (glassmorphism-strong, gradient-mesh, hover-lift, scale-on-hover, hover-glow, fade-in, text-gradient) in EVERY page. Output only complete HTML with these professional effects applied.'
      },
      { role: 'user', content: pagePrompt }
    ],
    max_tokens: 8000,
  });

  return completion.choices[0].message.content || '';
}

/**
 * Phase 3: Generate Shared CSS & JS Assets
 * NOW USES PROFESSIONAL DESIGN SYSTEM
 */
export async function generateSharedAssets(
  manifest: WebsiteManifest,
  requirements: Record<string, unknown>,
  onProgress?: (progress: GenerationProgress) => void
): Promise<{ css: string; js: string }> {
  // Generate professional design tokens from user preferences
  const designTokens = generateDesignTokens(
    (requirements.primaryColor as string) || manifest.designSystem.colors.primary,
    (requirements.accentColor as string) || manifest.designSystem.colors.accent,
    (requirements.fontStyle as string) || manifest.designSystem.typography.headingFont
  );
  
  // Use professional CSS from design system
  emitProgress({
    phase: 'assets',
    currentStep: 'Creating professional styles',
    progress: 75,
    message: 'Applying professional design system...'
  }, onProgress);
  
  let professionalCSS = generateDesignSystemCSS(designTokens);
  
  // Optimize font loading (font-display: swap)
  professionalCSS = optimizeFontLoading(professionalCSS);
  
  // Use mock mode for JavaScript if OpenAI unavailable
  if (!openai) {
    emitProgress({
      phase: 'assets',
      currentStep: 'Creating demo scripts',
      progress: 85,
      message: 'Adding interactivity...'
    }, onProgress);
    
    const mockJS = generateMockJS(manifest);
    
    // Minify CSS and JS
    emitProgress({
      phase: 'assets',
      currentStep: 'Optimizing assets',
      progress: 90,
      message: 'Minifying CSS and JavaScript...'
    }, onProgress);
    
    const [minifiedCSS, minifiedJS] = await Promise.all([
      minifyCSS(professionalCSS),
      minifyJS(mockJS)
    ]);
    
    return {
      css: minifiedCSS,
      js: minifiedJS
    };
  }

  // ALWAYS use professional CSS (no GPT-4o for consistency)

  // Generate JS
  emitProgress({
    phase: 'assets',
    currentStep: 'Creating interactive scripts',
    progress: 85,
    message: 'Adding interactivity...'
  }, onProgress);

  const jsPrompt = `Create modern JavaScript for a multi-page website.

FEATURES NEEDED:
- Smooth scroll navigation
- Mobile menu toggle
- Scroll animations (fade-in, slide-up on scroll)
- Active navigation highlighting (current page)
- Form validation
- Page transitions (fade effects)
- Lazy loading for images (use Intersection Observer)
- Performance optimizations (debounce, throttle, event delegation)

NAVIGATION STRUCTURE:
${manifest.pages.map(p => `- ${p.slug}.html: ${p.title}`).join('\n')}

REQUIREMENTS:
- Modern ES6+ JavaScript
- No frameworks (vanilla JS)
- Well-commented code
- Error handling
- Performance optimized
- Accessibility support (keyboard navigation, screen readers)

OUTPUT: Complete, production-ready JavaScript. No explanations.`;

  const jsCompletion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are an elite JavaScript developer creating production-ready scripts. Output only JavaScript.'
      },
      { role: 'user', content: jsPrompt }
    ],
    max_tokens: 3000,
  });

  const generatedJS = jsCompletion.choices[0].message.content || '';
  
  // Minify CSS and JS
  emitProgress({
    phase: 'assets',
    currentStep: 'Optimizing assets',
    progress: 90,
    message: 'Minifying CSS and JavaScript...'
  }, onProgress);
  
  const [minifiedCSS, minifiedJS] = await Promise.all([
    minifyCSS(professionalCSS),
    minifyJS(generatedJS)
  ]);

  return {
    css: minifiedCSS,
    js: minifiedJS
  };
}

/**
 * Phase 4: Assemble Complete Multi-Page Website
 */
export async function generateMultiPageWebsite(
  requirements: Record<string, unknown>,
  investigation: InvestigationResults | null,
  onProgress?: (progress: GenerationProgress) => void,
  generationId?: string
): Promise<MultiPageWebsite> {
  // Phase 1: Generate manifest
  const manifest = await generateSiteManifest(requirements, investigation, onProgress);

  // Phase 2: Generate all pages
  const files: Record<string, WebsiteFile> = {};

  // Generate website ID for analytics
  const websiteId = `website-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Get live preview service if generationId is provided
  const livePreview = generationId ? getLivePreviewService() : null;
  
  // Generate shared assets once (needed for critical CSS extraction)
  const sharedAssets = await generateSharedAssets(manifest, requirements, onProgress);
  
  // Emit CSS update via WebSocket if live preview is enabled
  if (livePreview && livePreview.isInitialized()) {
    livePreview.emitCSSUpdate(generationId!, sharedAssets.css);
  }
  
  // Generate AI images for the website (hero, products, icons)
  const businessContext = {
    name: (requirements.businessName as string) || 'Business',
    industry: (requirements.businessType as string) || 'Professional Services',
    colorScheme: [
      manifest.designSystem.colors.primary || '#3B82F6',
      manifest.designSystem.colors.accent || '#10B981'
    ],
    styleKeywords: (requirements.styleKeywords as string[]) || ['modern', 'professional'],
  };

  // Generate hero images for pages with hero sections
  const heroPages = manifest.pages.filter(p =>
    p.sections.some((s) => s.type === 'hero')
  );
  
  const generatedImages: Map<string, string> = new Map();
  
  for (const pageSpec of heroPages) {
    try {
      // Use advanced image service for STUNNING images
      const styleKeywords = (requirements.styleKeywords as string[]) || [];
      const heroImage = await generateStunningImage({
        style: 'hero',
        businessContext: {
          ...businessContext,
          mood: styleKeywords.includes('elegant') ? 'elegant' :
                styleKeywords.includes('bold') ? 'bold' :
                styleKeywords.includes('luxury') ? 'luxury' : 'modern',
        },
        quality: 'hd',
        artisticStyle: 'photorealistic',
      });
      generatedImages.set(pageSpec.slug, heroImage.url);
      emitProgress({
        phase: 'pages',
        currentStep: `Generated stunning hero image for ${pageSpec.title}`,
        progress: 20 + (pageSpec.order * 5),
        message: `Stunning AI-generated hero image created`,
      }, onProgress);
    } catch (_error) {
      console.log(`[MultipageGenerator] Using placeholder for ${pageSpec.slug} hero image`);
    }
  }
  
  for (const pageSpec of manifest.pages) {
    let html = await generatePageHTML(pageSpec, manifest, onProgress);
    
    // Replace placeholder hero images with AI-generated ones if available
    const aiHeroImage = generatedImages.get(pageSpec.slug);
    if (aiHeroImage) {
      html = html.replace(
        /https:\/\/images\.unsplash\.com\/photo-1556761175-5973dc0f32e7[^"']*/g,
        aiHeroImage
      );
    }
    
    // Emit HTML update via WebSocket if live preview is enabled
    if (livePreview && livePreview.isInitialized()) {
      livePreview.emitHTMLUpdate(generationId!, pageSpec.slug, html);
    }
    
    // Optimize images: add lazy loading and dimensions
    html = optimizeImagesInHTML(html, {
      addLazyLoading: true,
      addDimensions: true,
      generateSrcset: true
    });
    
    // Extract critical CSS and inline it
    const criticalCSSResult = extractCriticalCSS(html, sharedAssets.css);
    html = criticalCSSResult.html;
    
    // Add resource hints (preload fonts, prefetch next pages)
    const nextPage = manifest.pages.find(p => p.order === pageSpec.order + 1);
    const resourceHints = {
      styles: nextPage ? [`./assets/styles/main.css`] : [],
      scripts: [`./assets/scripts/app.js`],
      images: pageSpec.sections
        .filter((s) => s.type === 'hero')
        .map(() => 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=600&fit=crop&q=80'),
      domains: ['images.unsplash.com']
    };
    html = addResourceHintsToHTML(html, resourceHints);
    
    // Optimize scripts (add defer to non-critical)
    html = optimizeScripts(html, { deferNonCritical: true });
    
    // Apply Core Web Vitals optimizations
    const heroImage = pageSpec.sections
      .find((s) => s.type === 'hero')
      ? 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=600&fit=crop&q=80'
      : undefined;
    
    html = optimizeCoreWebVitals(html, {
      websiteId,
      heroImageUrl: heroImage,
      trackMetrics: true
    });
    
    // Inject analytics tracking script before </body>
    const analyticsScript = generateAnalyticsScript({
      websiteId,
      enablePageViews: true,
      enableClicks: true,
      enableConversions: true,
    });
    html = html.replace('</body>', `${analyticsScript}\n</body>`);
    
    // Generate breadcrumbs
    const breadcrumbs = generateBreadcrumbsForPage(
      pageSpec.slug,
      manifest.pages.map(p => ({ slug: p.slug, title: p.title, order: p.order })),
      requirements.domainName ? `https://${requirements.domainName as string}` : ''
    );
    
    const breadcrumbHTML = generateBreadcrumbHTML(breadcrumbs);
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
    
    // Add breadcrumbs after navigation (before main content)
    if (breadcrumbHTML) {
      html = html.replace('<main', `${breadcrumbHTML}\n<main`);
    }
    
    // Add breadcrumb schema to head
    if (breadcrumbSchema) {
      html = html.replace('</head>', `${breadcrumbSchema}\n</head>`);
    }
    
    // Find and add related content links
    const relatedContent = findRelatedContent(
      {
        slug: pageSpec.slug,
        keywords: pageSpec.seo?.keywords || [],
        title: pageSpec.title
      },
      manifest.pages.map(p => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        keywords: p.seo?.keywords || []
      })),
      3
    );
    
    const relatedContentHTML = generateRelatedContentLinks(relatedContent);
    
    // Add related content before closing main tag
    if (relatedContentHTML) {
      html = html.replace('</main>', `${relatedContentHTML}\n</main>`);
    }
    
    // Generate and add conversion-optimized CTAs
    const heroCTAs = generateCTAVariations('Get Started', 'hero');
    if (heroCTAs.length > 0 && pageSpec.sections.some((s) => s.type === 'hero')) {
      const primaryCTA = generateOptimizedCTA(heroCTAs[0], './contact.html');
      const trackedCTA = addConversionTracking(primaryCTA, 'hero_cta_click');
      // Add CTA to hero section if not already present
      if (!html.includes('btn-primary-large') && !html.includes('cta-optimized')) {
        html = html.replace(
          /(<section[^>]*class="[^"]*hero[^"]*"[^>]*>[\s\S]*?)(<\/section>)/i,
          `$1\n      <div class="hero-cta-optimized">${trackedCTA}</div>\n    $2`
        );
      }
    }
    
    // Generate funnel tracking if business type is known
    if (requirements.businessType) {
      const funnels = generateDefaultFunnels(requirements.businessType as string);
      if (funnels.length > 0) {
        const funnelScript = generateFunnelTrackingScript(funnels[0], websiteId);
        html = html.replace('</body>', `${funnelScript}\n</body>`);
      }
    }
    
    // Add advanced effects to hero sections (glassmorphism, particles, etc.)
    if (pageSpec.sections.some((s) => s.type === 'hero')) {
      // Add glassmorphism class to hero section
      html = html.replace(
        /<section[^>]*class="([^"]*hero[^"]*)"[^>]*>/gi,
        (match, classes) => {
          if (!classes.includes('glassmorphism')) {
            return match.replace(`class="${classes}"`, `class="${classes} glassmorphism-strong"`);
          }
          return match;
        }
      );
      
      // Add gradient mesh background
      const gradientMesh = generateGradientMeshEffect([
        manifest.designSystem.colors.primary || '#3B82F6',
        manifest.designSystem.colors.accent || '#10B981',
      ]);
      html = html.replace(
        /<div[^>]*class="[^"]*hero-content[^"]*"[^>]*>/gi,
        (match) => {
          return `<div class="gradient-mesh" style="position: absolute; inset: 0; z-index: 0;"></div>\n      ${match}`;
        }
      );
      
      // Add particle effects
      const particleEffect = generateParticleEffect([
        manifest.designSystem.colors.primary || '#3B82F6',
        manifest.designSystem.colors.accent || '#10B981',
      ]);
      html = html.replace('</section>', `${particleEffect.html}\n</section>`);
    }
    
    // Add cookie consent banner to all pages
    const cookieConsent = generateCookieConsent();
    html = html.replace('</body>', `${cookieConsent}\n</body>`);
    
    // Generate and add AI chatbot to homepage
    if (pageSpec.slug === 'home' && requirements.businessName) {
      try {
        const services = requirements.services as Array<{ name: string }> | string[] | undefined;
        const chatbot = await generateAIChatbot({
          businessInfo: {
            name: requirements.businessName as string,
            industry: (requirements.businessType as string) || 'Professional Services',
            services: services ? (Array.isArray(services) ? services.map((s) => typeof s === 'string' ? s : s.name) : []) : [],
            contactEmail: requirements.businessEmail as string | undefined,
            contactPhone: requirements.businessPhone as string | undefined,
          },
          colorScheme: {
            primary: manifest.designSystem.colors.primary || '#3B82F6',
            secondary: manifest.designSystem.colors.accent || '#10B981',
            background: '#ffffff',
          },
          enableLeadQualification: true,
        });

        // Inject chatbot HTML, CSS, and JS
        html = html.replace('</body>', `${chatbot.html}\n${chatbot.css}\n${chatbot.javascript}\n</body>`);
      } catch (_error) {
        console.log('[MultipageGenerator] Chatbot generation failed, continuing without it');
      }
    }
    
    // Apply UX enhancements (animations, mobile optimizations, accessibility)
    html = applyUXEnhancements(html);
    
    // Inject SEO schema markup if available
    if (requirements.businessName) {
      const schema = generateSchemaMarkup('Organization', {
        name: requirements.businessName as string,
        description: pageSpec.description,
        url: requirements.domainName ? `https://${requirements.domainName as string}` : undefined,
        email: requirements.businessEmail as string | undefined,
        phone: requirements.businessPhone as string | undefined,
        address: requirements.businessAddress ? {
          street: requirements.businessAddress as string,
        } : undefined,
      });
      html = html.replace('</head>', `${schema}\n</head>`);
    }
    
    files[`pages/${pageSpec.slug}.html`] = {
      path: `pages/${pageSpec.slug}.html`,
      type: 'html',
      content: html,
      checksum: createChecksum(html)
    };
  }

  // Generate legal pages if business name is provided
  if (requirements.businessName) {
    const privacyPolicyHTML = generatePrivacyPolicy(
      requirements.businessName as string,
      requirements.businessEmail as string | undefined
    );
    files['pages/privacy-policy.html'] = {
      path: 'pages/privacy-policy.html',
      type: 'html',
      content: privacyPolicyHTML,
      checksum: createChecksum(privacyPolicyHTML)
    };

    const termsOfServiceHTML = generateTermsOfService(requirements.businessName as string);
    files['pages/terms-of-service.html'] = {
      path: 'pages/terms-of-service.html',
      type: 'html',
      content: termsOfServiceHTML,
      checksum: createChecksum(termsOfServiceHTML)
    };
  }

  // Phase 3: Use shared assets (already generated above for critical CSS)
  const assets = sharedAssets;

  // Generate stunning color scheme
  const styleKeywords = (requirements.styleKeywords as string[]) || [];
  const colorScheme = generateStunningColorScheme({
    industry: requirements.businessType as string | undefined,
    mood: styleKeywords.includes('elegant') ? 'elegant' :
          styleKeywords.includes('bold') ? 'bold' :
          styleKeywords.includes('minimalist') ? 'minimalist' : 'modern',
  });
  const colorSchemeCSS = generateColorSchemeCSS(colorScheme);
  
  // Generate advanced effects library (includes particle effects CSS)
  const effectsCSS = generateEffectsLibraryCSS();
  
  // Add all enhancement CSS to main stylesheet
  const breadcrumbCSS = generateBreadcrumbCSS();
  const internalLinkingCSS = generateInternalLinkingCSS();
  const ctaCSS = generateCTACSS();
  const formCSS = generateFormCSS();
  const trustElementsCSS = generateTrustElementsCSS();
  const microAnimationsCSS = generateMicroAnimationsCSS();
  const mobileOptimizationCSS = generateMobileOptimizationCSS();
  const gridSystemCSS = generateAdvancedGridSystem();
  
  const enhancedCSS = `${assets.css}\n\n/* Stunning Color Scheme */\n${colorSchemeCSS}\n\n/* Advanced Grid System */\n${gridSystemCSS}\n\n/* Advanced Effects Library */\n${effectsCSS}\n\n/* Breadcrumb Styles */\n${breadcrumbCSS}\n\n/* Internal Linking Styles */\n${internalLinkingCSS}\n\n/* CTA Optimization Styles */\n${ctaCSS}\n\n/* Form Optimization Styles */\n${formCSS}\n\n/* Trust Elements Styles */\n${trustElementsCSS}\n\n/* Micro-Animations */\n${microAnimationsCSS}\n\n/* Mobile Optimization */\n${mobileOptimizationCSS}`;

  files['assets/styles/main.css'] = {
    path: 'assets/styles/main.css',
    type: 'css',
    content: enhancedCSS,
    checksum: createChecksum(enhancedCSS)
  };

  files['assets/scripts/app.js'] = {
    path: 'assets/scripts/app.js',
    type: 'js',
    content: assets.js,
    checksum: createChecksum(assets.js)
  };
  
  // Emit JS update via WebSocket if live preview is enabled
  if (livePreview && livePreview.isInitialized()) {
    livePreview.emitJSUpdate(generationId!, assets.js);
  }
  
  // Emit completion signal via WebSocket if live preview is enabled
  if (livePreview && livePreview.isInitialized()) {
    livePreview.emitComplete(generationId!, {
      websiteId,
      totalPages: manifest.pages.length,
    });
  }

  // Add manifest file
  const manifestJson = JSON.stringify(manifest, null, 2);
  files['site.json'] = {
    path: 'site.json',
    type: 'json',
    content: manifestJson,
    checksum: createChecksum(manifestJson)
  };

  emitProgress({
    phase: 'assembly',
    currentStep: 'Complete',
    progress: 100,
    message: `Multi-page website complete! ${manifest.pages.length} pages generated.`
  }, onProgress);

  return {
    manifest,
    files,
    assets
  };
}
