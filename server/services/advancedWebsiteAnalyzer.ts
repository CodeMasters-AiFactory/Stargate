/**
 * Advanced Website Analyzer v2.0
 * Upgraded with sophisticated detection for modern design signals
 * Analyzes CSS, rendered DOM, accessibility, and more
 */

import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import type { WebsiteAnalysis } from './websiteAnalyzer';

interface AdvancedWebsiteInfo {
  // Basic info
  title: string;
  description: string;
  h1Count: number;
  h1Text: string;
  h2Count: number;
  metaDescription: string;
  hasSchema: boolean;
  imageCount: number;
  formCount: number;
  ctaCount: number;
  linkCount: number;
  hasNavigation: boolean;
  colorScheme: string[];
  
  // Advanced visual design
  cssColors: string[];
  fontFamilies: string[];
  hasGrid: boolean;
  hasFlexbox: boolean;
  hasAnimations: boolean;
  hasTransitions: boolean;
  customImages: boolean;
  professionalImages: boolean;
  
  // Content analysis
  paragraphCount: number;
  sentenceCount: number;
  wordCount: number;
  hasCaseStudies: boolean;
  hasTestimonials: boolean;
  hasFAQs: boolean;
  hasStats: boolean;
  hasExamples: boolean;
  
  // Accessibility
  hasViewport: boolean;
  ariaLabelsCount: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  buttonLabelsCount: number;
  
  // Responsiveness
  hasBreakpoints: boolean;
  hasMobileNav: boolean;
  
  // Conversion
  strongCTAs: string[];
  weakCTAs: string[];
  hasPhone: boolean;
  hasEmail: boolean;
  hasAddress: boolean;
  hasChatWidget: boolean;
  hasTrustSeals: boolean;
  hasSocialProof: boolean;
}

/**
 * Extract CSS from linked stylesheets and inline styles
 */
async function extractCSS(html: string, baseUrl: string): Promise<string> {
  const $ = cheerio.load(html);
  let allCSS = '';
  
  // Extract inline styles
  $('style').each((_, el) => {
    allCSS += $(el).html() || '';
  });
  
  // Extract inline style attributes
  $('[style]').each((_, el) => {
    allCSS += $(el).attr('style') || '';
  });
  
  // Fetch linked stylesheets
  const cssLinks: string[] = [];
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      try {
        const url = new URL(href, baseUrl).href;
        cssLinks.push(url);
      } catch {
        // Invalid URL, skip
      }
    }
  });
  
  // Fetch CSS files (limit to first 5 for performance)
  for (const cssUrl of cssLinks.slice(0, 5)) {
    try {
      const response = await fetch(cssUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 5000
      });
      if (response.ok) {
        allCSS += await response.text();
      }
    } catch {
      // Skip failed CSS fetches
    }
  }
  
  return allCSS;
}

/**
 * Extract colors from CSS
 */
function extractColorsFromCSS(css: string): string[] {
  const colors: Set<string> = new Set();
  
  // Hex colors
  const hexPattern = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g;
  let match;
  while ((match = hexPattern.exec(css)) !== null) {
    colors.add(match[0].toUpperCase());
  }
  
  // RGB/RGBA colors
  const rgbPattern = /rgba?\([^)]+\)/gi;
  while ((match = rgbPattern.exec(css)) !== null) {
    colors.add(match[0]);
  }
  
  // Named colors (common ones)
  const namedColors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'grey', 'brown', 'navy', 'teal', 'cyan', 'magenta'];
  const namedPattern = new RegExp(`\\b(${namedColors.join('|')})\\b`, 'gi');
  while ((match = namedPattern.exec(css)) !== null) {
    colors.add(match[0].toLowerCase());
  }
  
  return Array.from(colors);
}

/**
 * Extract font families from CSS
 */
function extractFontFamilies(css: string, html: string): string[] {
  const fonts: Set<string> = new Set();
  
  // From CSS font-family declarations
  const fontFamilyPattern = /font-family:\s*([^;]+)/gi;
  let match;
  while ((match = fontFamilyPattern.exec(css)) !== null) {
    const fontList = match[1].split(',').map(f => f.trim().replace(/['"]/g, ''));
    fontList.forEach(font => {
      if (font && !font.includes('serif') && !font.includes('sans-serif') && !font.includes('monospace')) {
        fonts.add(font);
      }
    });
  }
  
  // Check for Google Fonts
  if (html.includes('fonts.googleapis.com')) {
    fonts.add('Google Fonts');
  }
  
  // Check for custom fonts
  if (html.includes('@font-face') || html.includes('font-display')) {
    fonts.add('Custom Fonts');
  }
  
  return Array.from(fonts);
}

/**
 * Analyze advanced website information
 */
async function analyzeAdvancedInfo(url: string, html: string): Promise<AdvancedWebsiteInfo> {
  const $ = cheerio.load(html);
  const bodyText = $('body').text() || '';
  const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;
  
  // Extract CSS
  const css = await extractCSS(html, url);
  
  // Basic info (from existing extractWebsiteInfo)
  const title = $('title').text() || '';
  const description = $('meta[name="description"]').attr('content') || '';
  const h1s = $('h1');
  const h1Count = h1s.length;
  const h1Text = h1s.first().text() || '';
  const h2Count = $('h2').length;
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const hasSchema = $('script[type="application/ld+json"]').length > 0;
  const imageCount = $('img').length;
  const formCount = $('form').length;
  const linkCount = $('a').length;
  const hasNavigation = $('nav').length > 0 || $('[role="navigation"]').length > 0;
  
  // Extract colors from HTML attributes (basic)
  const basicColors: string[] = [];
  $('[style*="color"], [style*="background"]').each((_, el) => {
    const style = $(el).attr('style') || '';
    const colorMatch = style.match(/#[0-9A-Fa-f]{3,6}|rgb\([^)]+\)/gi);
    if (colorMatch) {
      basicColors.push(...colorMatch);
    }
  });
  
  // Advanced visual design
  const cssColors = extractColorsFromCSS(css);
  const allColors = [...new Set([...basicColors, ...cssColors])];
  const fontFamilies = extractFontFamilies(css, html);
  const hasGrid = css.includes('display: grid') || css.includes('display:grid') || html.includes('grid');
  const hasFlexbox = css.includes('display: flex') || css.includes('display:flex') || html.includes('flex');
  const hasAnimations = css.includes('@keyframes') || css.includes('animation:') || html.includes('animation');
  const hasTransitions = css.includes('transition:') || html.includes('transition');
  
  // Image analysis
  const images = $('img');
  let customImages = false;
  let professionalImages = false;
  images.each((_, img) => {
    const src = $(img).attr('src') || '';
    const alt = $(img).attr('alt') || '';
    // Check if NOT from stock photo sites
    if (src && !src.includes('unsplash.com') && !src.includes('pexels.com') && !src.includes('pixabay.com')) {
      customImages = true;
    }
    // Check for professional indicators
    if (alt.length > 10 || src.includes('brand') || src.includes('product') || src.includes('team')) {
      professionalImages = true;
    }
  });
  
  // Content analysis
  const paragraphs = $('p');
  const paragraphCount = paragraphs.length;
  const sentences = bodyText.match(/[.!?]+/g) || [];
  const sentenceCount = sentences.length;
  const hasCaseStudies = /case study|case studies|success story|client story/i.test(bodyText);
  const hasTestimonials = /testimonial|review|customer quote|client testimonial/i.test(bodyText);
  const hasFAQs = $('section:contains("FAQ")').length > 0 || $('h2:contains("FAQ")').length > 0 || /frequently asked|faq/i.test(bodyText);
  const hasStats = /\d+%|\d+\s+(million|billion|thousand|users|customers|clients)/i.test(bodyText);
  const hasExamples = /example|for instance|such as|including/i.test(bodyText) && bodyText.split(/example|for instance/i).length > 2;
  
  // Accessibility
  const hasViewport = $('meta[name="viewport"]').length > 0;
  const ariaLabels = $('[aria-label]');
  const ariaLabelsCount = ariaLabels.length;
  const imagesWithAlt = $('img[alt]').length;
  const imagesWithoutAlt = imageCount - imagesWithAlt;
  const buttonLabels = $('button, [role="button"]');
  const buttonLabelsCount = buttonLabels.filter((_, el) => {
    const text = $(el).text().trim();
    const ariaLabel = $(el).attr('aria-label');
    return text.length > 0 || ariaLabel;
  }).length;
  
  // Responsiveness
  const hasBreakpoints = css.includes('@media') || css.includes('breakpoint') || css.includes('min-width') || css.includes('max-width');
  const hasMobileNav = $('[class*="mobile"], [class*="nav"], [id*="mobile"]').length > 0;
  
  // Conversion analysis
  const strongCTAPatterns = /(book a consultation|schedule a call|get started|start free trial|sign up now|try for free|get started today|request a demo)/gi;
  const weakCTAPatterns = /(contact us|learn more|read more|click here|view more)/gi;
  const strongCTAs: string[] = [];
  const weakCTAs: string[] = [];
  
  $('button, a, [role="button"]').each((_, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (strongCTAPatterns.test(text)) {
      strongCTAs.push(text);
    } else if (weakCTAPatterns.test(text)) {
      weakCTAs.push(text);
    }
  });
  
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(bodyText);
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(bodyText);
  const hasAddress = /(street|address|road|avenue|drive|city|state|zip|postal|location)/i.test(bodyText);
  const hasChatWidget = html.includes('chat') || html.includes('intercom') || html.includes('zendesk') || html.includes('drift');
  const hasTrustSeals = /certified|award|trusted|verified|secure|ssl|badge/i.test(bodyText) || $('img[alt*="badge"], img[alt*="certified"]').length > 0;
  const hasSocialProof = hasTestimonials || hasStats || $('[class*="testimonial"], [class*="review"]').length > 0;
  
  return {
    title,
    description,
    h1Count,
    h1Text,
    h2Count,
    metaDescription,
    hasSchema,
    imageCount,
    formCount,
    ctaCount: strongCTAs.length + weakCTAs.length,
    linkCount,
    hasNavigation,
    colorScheme: allColors.slice(0, 10), // Limit to first 10
    
    cssColors: allColors,
    fontFamilies,
    hasGrid,
    hasFlexbox,
    hasAnimations,
    hasTransitions,
    customImages,
    professionalImages,
    
    paragraphCount,
    sentenceCount,
    wordCount,
    hasCaseStudies,
    hasTestimonials,
    hasFAQs,
    hasStats,
    hasExamples,
    
    hasViewport,
    ariaLabelsCount,
    imagesWithAlt,
    imagesWithoutAlt,
    buttonLabelsCount,
    
    hasBreakpoints,
    hasMobileNav,
    
    strongCTAs: Array.from(new Set(strongCTAs)),
    weakCTAs: Array.from(new Set(weakCTAs)),
    hasPhone,
    hasEmail,
    hasAddress,
    hasChatWidget,
    hasTrustSeals,
    hasSocialProof
  };
}

/**
 * PHASE 1: Advanced Visual Design Scoring
 */
function scoreAdvancedVisualDesign(info: AdvancedWebsiteInfo, css: string): number {
  let score = 5.0; // Base score
  
  // 1. Color Palette (0-2 points)
  const uniqueColors = new Set(info.cssColors.map(c => c.toLowerCase()));
  const colorCount = uniqueColors.size;
  
  if (colorCount >= 3 && colorCount <= 8) {
    score += 1.5; // Cohesive palette (3-8 colors is ideal)
  } else if (colorCount >= 2) {
    score += 1.0; // Basic palette
  } else if (colorCount >= 9) {
    score += 0.5; // Too many colors (less cohesive)
  }
  
  // Check for brand-aligned colors (primary/secondary/neutral groups)
  if (colorCount >= 3) {
    score += 0.5; // Bonus for having multiple color groups
  }
  
  // 2. Typography (0-1.5 points)
  if (info.fontFamilies.length >= 2) {
    score += 0.5; // Multiple font families (heading/body hierarchy)
  }
  if (info.fontFamilies.some(f => f.includes('Google') || f.includes('Custom'))) {
    score += 0.5; // Modern font usage
  }
  if (info.fontFamilies.length >= 3) {
    score += 0.5; // Strong typography system
  }
  
  // 3. Whitespace & Rhythm (0-1 point)
  if (css.includes('padding:') || css.includes('margin:')) {
    score += 0.3; // Spacing defined
  }
  if (css.match(/padding:\s*\d+px|\d+rem|\d+em/gi)?.length >= 5) {
    score += 0.4; // Consistent spacing patterns
  }
  if (info.hasGrid || info.hasFlexbox) {
    score += 0.3; // Grid rhythm
  }
  
  // 4. Layout System (0-1.5 points)
  if (info.hasGrid && info.hasFlexbox) {
    score += 1.0; // Advanced layout usage
  } else if (info.hasGrid || info.hasFlexbox) {
    score += 0.5; // Modern layout
  }
  if (info.hasBreakpoints) {
    score += 0.5; // Responsive breakpoints
  }
  
  // 5. Imagery Quality (0-1.5 points)
  if (info.professionalImages) {
    score += 1.0; // Professional imagery
  } else if (info.customImages) {
    score += 0.5; // Custom images (not stock)
  }
  if (info.imageCount >= 5 && info.professionalImages) {
    score += 0.5; // Consistent professional imagery
  }
  
  // 6. Animation / Micro-interaction (0-1 point)
  if (info.hasAnimations && info.hasTransitions) {
    score += 0.8; // Modern animations
  } else if (info.hasTransitions) {
    score += 0.4; // Basic transitions
  }
  if (css.includes('transform:') || css.includes('hover:')) {
    score += 0.2; // Interactive elements
  }
  
  return Math.min(10, Math.max(0, score));
}

/**
 * PHASE 2: Deep Content Analysis
 */
function scoreAdvancedContent(info: AdvancedWebsiteInfo, bodyText: string): number {
  let score = 5.0; // Base score
  
  // Check for generic filler (penalty)
  const genericPatterns = [
    /we deliver exceptional quality/i,
    /quality, integrity, and customer satisfaction/i,
    /we are the best/i,
    /we provide excellent service/i,
    /we deliver outstanding results/i
  ];
  
  const hasGenericFiller = genericPatterns.some(pattern => pattern.test(bodyText));
  if (hasGenericFiller) {
    score -= 2.0; // Heavy penalty
  }
  
  // Paragraph count (depth indicator)
  if (info.paragraphCount >= 10) {
    score += 1.0;
  } else if (info.paragraphCount >= 5) {
    score += 0.5;
  }
  
  // Word count (depth)
  if (info.wordCount >= 2000) {
    score += 1.5; // Very deep content
  } else if (info.wordCount >= 1000) {
    score += 1.0; // Deep content
  } else if (info.wordCount >= 500) {
    score += 0.5; // Adequate content
  } else if (info.wordCount < 200) {
    score -= 1.0; // Too minimalistic (like Apple/Tesla)
  }
  
  // Sentence complexity (average sentence length)
  const avgSentenceLength = info.wordCount / Math.max(info.sentenceCount, 1);
  if (avgSentenceLength >= 15 && avgSentenceLength <= 25) {
    score += 0.5; // Good complexity (not too simple, not too complex)
  }
  
  // Detailed explanations
  if (info.paragraphCount >= 8 && info.wordCount >= 800) {
    score += 0.5; // Detailed explanations present
  }
  
  // Real examples, case studies, stats
  if (info.hasCaseStudies) {
    score += 1.0; // Case studies
  }
  if (info.hasExamples && info.hasStats) {
    score += 1.0; // Examples + stats
  } else if (info.hasExamples || info.hasStats) {
    score += 0.5;
  }
  
  // Industry-specific terminology
  const industryTerms = bodyText.match(/\b(API|SaaS|ROI|KPI|CRM|ERP|UX|UI|SEO|SEM|CTR|conversion|funnel|pipeline)\b/gi);
  if (industryTerms && industryTerms.length >= 3) {
    score += 0.5; // Industry-specific content
  }
  
  // FAQs
  if (info.hasFAQs) {
    score += 0.5; // Helpful FAQs
  }
  
  // Clarity of value proposition
  const valueProps = /solve|help|enable|empower|transform|improve|increase|reduce|streamline/i.test(bodyText);
  if (valueProps && info.wordCount >= 500) {
    score += 0.5; // Clear value proposition
  }
  
  // Location references
  if (bodyText.match(/\[CITY\]|\[REGION\]|in [A-Z][a-z]+|serving [A-Z][a-z]+/i)) {
    score += 0.5;
  }
  
  return Math.min(10, Math.max(0, score));
}

/**
 * PHASE 3: Responsiveness & Accessibility Scoring
 */
function scoreResponsivenessAccessibility(info: AdvancedWebsiteInfo): number {
  let score = 5.0; // Base score
  
  // Responsiveness
  if (info.hasViewport) {
    score += 0.5;
  }
  if (info.hasBreakpoints) {
    score += 1.0; // Responsive breakpoints
  }
  if (info.hasMobileNav) {
    score += 0.5; // Mobile navigation
  }
  
  // Accessibility
  if (info.ariaLabelsCount >= 5) {
    score += 1.0; // Good ARIA usage
  } else if (info.ariaLabelsCount >= 2) {
    score += 0.5;
  }
  
  const altTextCoverage = info.imageCount > 0 
    ? info.imagesWithAlt / info.imageCount 
    : 1.0;
  
  if (altTextCoverage >= 0.9) {
    score += 1.0; // Excellent alt text coverage
  } else if (altTextCoverage >= 0.7) {
    score += 0.5; // Good alt text coverage
  } else if (altTextCoverage < 0.5) {
    score -= 1.0; // Penalty for poor alt text
  }
  
  if (info.buttonLabelsCount >= 5) {
    score += 0.5; // Good button labeling
  }
  
  // Penalties
  if (!info.hasViewport) {
    score -= 0.5; // Missing viewport
  }
  if (!info.hasBreakpoints && info.imageCount > 0) {
    score -= 0.5; // No responsive breakpoints
  }
  if (info.imagesWithoutAlt > info.imagesWithAlt && info.imageCount > 3) {
    score -= 1.0; // Poor alt text coverage
  }
  
  return Math.min(10, Math.max(0, score));
}

/**
 * PHASE 4: Enhanced Conversion Scoring
 */
function scoreAdvancedConversion(info: AdvancedWebsiteInfo, _bodyText: string): number {
  let score = 3.0; // Start lower
  
  // Strong CTAs
  if (info.strongCTAs.length >= 3) {
    score += 2.5; // Multiple strong CTAs
  } else if (info.strongCTAs.length >= 1) {
    score += 2.0; // At least one strong CTA
  } else if (info.weakCTAs.length >= 3) {
    score += 1.0; // Multiple weak CTAs
  } else if (info.weakCTAs.length >= 1) {
    score += 0.5; // At least weak CTAs
  }
  
  // Contact methods
  if (info.hasPhone) score += 1.0;
  if (info.hasEmail) score += 1.0;
  if (info.hasAddress) score += 0.5;
  if (info.formCount > 0) score += 1.0;
  if (info.hasChatWidget) score += 0.5;
  
  // Trust elements
  if (info.hasTrustSeals) {
    score += 1.0;
  }
  if (info.hasTestimonials) {
    score += 1.0;
  }
  if (info.hasSocialProof) {
    score += 0.5;
  }
  
  // World-class: all elements present
  if (info.strongCTAs.length >= 2 && info.hasPhone && info.hasEmail && info.formCount > 0 && info.hasTrustSeals) {
    score += 1.0;
  }
  
  return Math.min(10, Math.max(0, score));
}

/**
 * PHASE 5: New Creativity Scoring
 */
function scoreAdvancedCreativity(info: AdvancedWebsiteInfo, html: string, bodyText: string): number {
  let score = 5.0; // Base score
  
  // Unique visual identity
  const uniqueColors = new Set(info.cssColors.map(c => c.toLowerCase()));
  if (uniqueColors.size >= 4) {
    score += 1.0; // Strong color identity
  } else if (uniqueColors.size >= 2) {
    score += 0.5;
  }
  
  // Original iconography/illustrations
  const $ = cheerio.load(html);
  if (html.includes('svg') || html.includes('icon') || $('svg').length > 0) {
    score += 0.5; // Custom icons/graphics
  }
  if ($('svg').length >= 5) {
    score += 0.5; // Extensive iconography
  }
  
  // Branded photography
  if (info.professionalImages && info.customImages) {
    score += 1.0; // Professional branded imagery
  } else if (info.customImages) {
    score += 0.5;
  }
  
  // Memorable taglines
  const taglinePatterns = /tagline|slogan|motto|mission statement/i;
  const $meta = cheerio.load(html);
  if (taglinePatterns.test(bodyText) || $meta('meta[property="og:description"]').length > 0) {
    score += 0.5;
  }
  
  // Strong storytelling
  if (info.hasCaseStudies || bodyText.match(/story|journey|mission|vision|founded|since \d{4}/i)) {
    score += 1.0; // Brand narrative
  }
  
  // Industry differentiation
  const isGeneric = /confetti|dots|playful|template|demo|lorem ipsum/i.test(html);
  if (!isGeneric && info.wordCount >= 500) {
    score += 0.5; // Not generic template
  }
  
  // Unique layout architecture
  if (info.hasGrid && info.hasFlexbox && info.hasAnimations) {
    score += 0.5; // Advanced, unique layout
  }
  
  return Math.min(10, Math.max(0, score));
}

/**
 * Main advanced analysis function
 */
export async function analyzeWebsiteAdvanced(url: string, html: string): Promise<WebsiteAnalysis> {
  const $ = cheerio.load(html);
  const bodyText = $('body').text() || '';
  
  // Get advanced info
  const info = await analyzeAdvancedInfo(url, html);
  const css = await extractCSS(html, url);
  
  // Score each category with upgraded logic
  const visualDesign = scoreAdvancedVisualDesign(info, css);
  const content = scoreAdvancedContent(info, bodyText);
  const responsiveness = scoreResponsivenessAccessibility(info);
  const conversion = scoreAdvancedConversion(info, bodyText);
  const creativity = scoreAdvancedCreativity(info, html, bodyText);
  
  // UX & Structure (enhanced)
  let uxScore = 5.0;
  if (info.hasNavigation) uxScore += 1.0;
  if (info.h1Count === 1 && info.h2Count >= 3) uxScore += 1.0;
  if (info.hasBreakpoints) uxScore += 0.5;
  if (info.strongCTAs.length >= 3) uxScore += 0.5;
  if (info.linkCount >= 10) uxScore += 0.5;
  if (info.hasNavigation && info.h1Count === 1 && info.h2Count >= 5 && info.strongCTAs.length >= 5) {
    uxScore += 1.0;
  }
  uxScore = Math.min(10, Math.max(0, uxScore));
  
  // SEO (enhanced)
  let seoScore = 5.0;
  if (info.title && info.title.length >= 30 && info.title.length <= 60) seoScore += 1.0;
  if (info.title && !/^(home|services|about|contact)\s*\|/i.test(info.title)) seoScore += 0.5;
  if (info.metaDescription && info.metaDescription.length >= 120 && info.metaDescription.length <= 165) seoScore += 1.0;
  if (info.h1Count === 1 && info.h1Text.length > 0) seoScore += 1.0;
  if (info.hasSchema) seoScore += 1.0;
  const genericHeadings = /^(our services|what we offer|our story|our values|about us)$/i;
  if (!genericHeadings.test(info.h1Text)) seoScore += 0.5;
  if (info.title && info.title.length >= 40 && info.hasSchema && info.h1Count === 1) seoScore += 0.5;
  seoScore = Math.min(10, Math.max(0, seoScore));
  
  const scores = {
    visualDesign,
    uxStructure: uxScore,
    contentPositioning: content,
    conversionTrust: conversion,
    seoFoundations: seoScore,
    creativityDifferentiation: creativity
  };
  
  const averageScore = Object.values(scores).reduce((a, b) => a + b, 0) / 6;
  
  // PHASE 6: Stricter Excellent Rules
  const finalVerdict = determineStrictVerdict(averageScore, scores, responsiveness);
  
  // Generate details
  const categoryDetails = generateAdvancedCategoryDetails(scores, info, bodyText, responsiveness);
  
  return {
    url,
    timestamp: new Date().toISOString(),
    overallSummary: generateAdvancedSummary(scores, averageScore, finalVerdict, info),
    categoryScores: scores,
    categoryDetails,
    finalVerdict,
    averageScore
  };
}

/**
 * PHASE 6: Stricter Excellent Rules
 */
function determineStrictVerdict(
  averageScore: number,
  scores: any,
  responsiveness: number
): 'Poor' | 'OK' | 'Good' | 'Excellent' | 'World-Class' {
  if (averageScore < 4.0) return 'Poor';
  if (averageScore < 6.0) return 'OK';
  if (averageScore < 7.5) return 'Good';
  
  // Excellent requires:
  // - Average 7.5-8.4
  // - ALL categories ≥ 7.5
  // - Visual Design AND Content AND UX ≥ 8.0
  // - Creativity ≥ 7.0
  // - Responsiveness ≥ 7.0 (no critical failures)
  if (averageScore >= 7.5 && averageScore < 8.5) {
    const minScore = Math.min(...Object.values(scores) as number[]);
    const visualContentUX = Math.min(scores.visualDesign, scores.contentPositioning, scores.uxStructure);
    
    if (
      minScore >= 7.5 &&
      visualContentUX >= 8.0 &&
      scores.creativityDifferentiation >= 7.0 &&
      responsiveness >= 7.0
    ) {
      return 'Excellent';
    }
  }
  
  // World-Class requires:
  // - Average > 8.5
  // - ALL categories ≥ 8.5
  // - Responsiveness ≥ 8.5
  if (averageScore >= 8.5) {
    const minScore = Math.min(...Object.values(scores) as number[]);
    if (minScore >= 8.5 && responsiveness >= 8.5) {
      return 'World-Class';
    }
    return 'Excellent';
  }
  
  return 'Good';
}

function generateAdvancedCategoryDetails(scores: any, info: any, bodyText: string, _responsiveness: number): any {
  return {
    visualDesign: {
      strengths: generateVisualStrengths(scores.visualDesign, info),
      improvements: generateVisualImprovements(scores.visualDesign, info)
    },
    uxStructure: {
      strengths: generateUXStrengths(scores.uxStructure, info),
      improvements: generateUXImprovements(scores.uxStructure, info)
    },
    contentPositioning: {
      strengths: generateContentStrengths(scores.contentPositioning, bodyText, info.wordCount),
      improvements: generateContentImprovements(scores.contentPositioning, bodyText, info.wordCount)
    },
    conversionTrust: {
      strengths: generateConversionStrengths(scores.conversionTrust, info, bodyText),
      improvements: generateConversionImprovements(scores.conversionTrust, info, bodyText)
    },
    seoFoundations: {
      strengths: generateSEOStrengths(scores.seoFoundations, info),
      improvements: generateSEOImprovements(scores.seoFoundations, info)
    },
    creativityDifferentiation: {
      strengths: generateCreativityStrengths(scores.creativityDifferentiation, info, bodyText),
      improvements: generateCreativityImprovements(scores.creativityDifferentiation, info, bodyText)
    }
  };
}

// Helper functions (simplified versions)
function generateVisualStrengths(_score: number, info: any): string[] {
  const strengths: string[] = [];
  if (info.cssColors.length >= 3) strengths.push('Cohesive color palette detected');
  if (info.fontFamilies.length >= 2) strengths.push('Typography hierarchy present');
  if (info.hasGrid || info.hasFlexbox) strengths.push('Modern layout system');
  if (info.professionalImages) strengths.push('Professional imagery');
  if (info.hasAnimations) strengths.push('Modern animations');
  return strengths.length > 0 ? strengths : ['Basic styling'];
}

function generateVisualImprovements(score: number, info: any): string[] {
  const improvements: string[] = [];
  if (score < 7.5) {
    if (info.cssColors.length < 3) improvements.push('Develop cohesive color palette (3-8 colors)');
    if (info.fontFamilies.length < 2) improvements.push('Add typography hierarchy');
    if (!info.hasGrid && !info.hasFlexbox) improvements.push('Implement modern layout system');
    if (!info.professionalImages) improvements.push('Use professional, branded imagery');
  }
  return improvements;
}

function generateUXStrengths(_score: number, info: any): string[] {
  const strengths: string[] = [];
  if (info.hasNavigation) strengths.push('Clear navigation');
  if (info.h1Count === 1) strengths.push('Proper heading hierarchy');
  if (info.hasBreakpoints) strengths.push('Responsive design');
  return strengths;
}

function generateUXImprovements(score: number, info: any): string[] {
  const improvements: string[] = [];
  if (score < 7.5) {
    if (info.h1Count !== 1) improvements.push('Ensure exactly one H1');
    if (!info.hasBreakpoints) improvements.push('Add responsive breakpoints');
  }
  return improvements;
}

function generateContentStrengths(_score: number, _bodyText: string, wordCount: number): string[] {
  const strengths: string[] = [];
  if (wordCount >= 1000) strengths.push('Deep content');
  if (wordCount >= 500) strengths.push('Adequate depth');
  return strengths;
}

function generateContentImprovements(score: number, bodyText: string, wordCount: number): string[] {
  const improvements: string[] = [];
  if (score < 7.5) {
    if (wordCount < 500) improvements.push('Expand content depth (aim for 1000+ words)');
    if (/we deliver exceptional quality/i.test(bodyText)) improvements.push('Remove generic filler');
  }
  return improvements;
}

function generateConversionStrengths(_score: number, info: any, _bodyText: string): string[] {
  const strengths: string[] = [];
  if (info.strongCTAs.length >= 2) strengths.push('Strong CTAs present');
  if (info.hasPhone && info.hasEmail) strengths.push('Multiple contact methods');
  if (info.hasTrustSeals) strengths.push('Trust elements');
  return strengths;
}

function generateConversionImprovements(score: number, info: any, _bodyText: string): string[] {
  const improvements: string[] = [];
  if (score < 7.5) {
    if (info.strongCTAs.length === 0) improvements.push('Add strong CTAs');
    if (!info.hasPhone) improvements.push('Add phone number');
    if (!info.hasEmail) improvements.push('Add email address');
  }
  return improvements;
}

function generateSEOStrengths(_score: number, info: any): string[] {
  const strengths: string[] = [];
  if (info.title && info.title.length >= 30) strengths.push('Proper title length');
  if (info.hasSchema) strengths.push('Schema markup');
  return strengths;
}

function generateSEOImprovements(score: number, info: any): string[] {
  const improvements: string[] = [];
  if (score < 7.5) {
    if (!info.hasSchema) improvements.push('Add schema markup');
  }
  return improvements;
}

function generateCreativityStrengths(_score: number, info: any, bodyText: string): string[] {
  const strengths: string[] = [];
  if (info.cssColors.length >= 4) strengths.push('Unique color identity');
  if (info.professionalImages) strengths.push('Branded imagery');
  if (bodyText.match(/story|mission/i)) strengths.push('Brand narrative');
  return strengths;
}

function generateCreativityImprovements(score: number, info: any, bodyText: string): string[] {
  const improvements: string[] = [];
  if (score < 7.5) {
    improvements.push('Develop unique visual identity');
    if (!bodyText.match(/story|mission/i)) improvements.push('Add brand story');
  }
  return improvements;
}

function generateAdvancedSummary(scores: any, averageScore: number, verdict: string, _info: any): string {
  let summary = `This website scores ${averageScore.toFixed(1)}/10 overall, rated as "${verdict}". `;
  
  const highCategories = Object.entries(scores)
    .filter(([_, score]) => (score as number) >= 8)
    .map(([cat]) => cat.replace(/([A-Z])/g, ' $1').trim());
  
  const lowCategories = Object.entries(scores)
    .filter(([_, score]) => (score as number) < 7.5)
    .map(([cat]) => cat.replace(/([A-Z])/g, ' $1').trim());
  
  if (highCategories.length > 0) {
    summary += `Strong areas: ${highCategories.join(', ')}. `;
  }
  
  if (lowCategories.length > 0) {
    summary += `Areas needing improvement: ${lowCategories.join(', ')}. `;
  }
  
  if (verdict !== 'Excellent' && verdict !== 'World-Class') {
    summary += `To reach "Excellent" status, all categories must score ≥ 7.5/10, with Visual Design, Content, and UX ≥ 8.0, and Creativity ≥ 7.0.`;
  }
  
  return summary;
}

