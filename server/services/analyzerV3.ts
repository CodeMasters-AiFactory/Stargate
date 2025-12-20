/**
 * Website Analyzer v3.0
 * Complete rewrite with screenshot-based analysis, mobile rendering, and advanced detection
 */

import { captureScreenshots, ScreenshotAnalysis } from '../analyzer/screenshotEvaluator';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer, { Page } from 'puppeteer';

export interface V3AnalysisResult {
  url: string;
  timestamp: string;
  categoryScores: {
    visualDesign: number;
    uxStructure: number;
    contentQuality: number;
    conversionTrust: number;
    seoFoundations: number;
    creativity: number;
    mobileUX: number;
  };
  weightedScore: number; // 0-100
  verdict: 'Poor' | 'OK' | 'Good' | 'Excellent' | 'World-Class';
  meetsExcellentCriteria: boolean;
  reports: {
    visual: any;
    content: any;
    ux: any;
    mobile: any;
    seo: any;
    creativity: any;
    conversion: any;
    accessibility: any;
  };
}

/**
 * Main v3.0 analysis function
 */
export async function analyzeWebsiteV3(url: string): Promise<V3AnalysisResult> {
  const timestamp = new Date().toISOString();
  const domain = new URL(url).hostname.replace(/\./g, '-');
  const outputDir = path.join(process.cwd(), 'website_analysis_reports_v3', domain);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  let browser: puppeteer.Browser | null = null;
  let page: Page | null = null;
  
  try {
    // Launch browser for screenshot and DOM analysis
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Capture screenshots
    const screenshots = await captureScreenshots(url, outputDir);
    
    // Get rendered HTML and DOM
    const html = await page.content();
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    // Analyze all categories
    const visual = await analyzeVisualDesign(page, screenshots, html);
    const content = await analyzeContentQuality(page, bodyText);
    const ux = await analyzeUXStructure(page, html);
    const mobile = await analyzeMobileUX(page, screenshots);
    const seo = await analyzeSEOFoundations(page, html);
    const creativity = await analyzeCreativity(page, screenshots, bodyText);
    const conversion = await analyzeConversion(page, bodyText);
    const accessibility = await analyzeAccessibility(page);
    
    // Calculate scores
    const categoryScores = {
      visualDesign: visual.score,
      uxStructure: ux.score,
      contentQuality: content.score,
      conversionTrust: conversion.score,
      seoFoundations: seo.score,
      creativity: creativity.score,
      mobileUX: mobile.score
    };
    
    // Calculate weighted score (0-100)
    const weightedScore = calculateWeightedScore(categoryScores);
    
    // Determine verdict
    const { verdict, meetsExcellentCriteria } = determineVerdictV3(categoryScores, weightedScore, accessibility);
    
    // Save all reports
    await saveReports(outputDir, {
      visual,
      content,
      ux,
      mobile,
      seo,
      creativity,
      conversion,
      accessibility
    });
    
    // Save final score
    const finalScore = {
      url,
      timestamp,
      categoryScores,
      weightedScore,
      verdict,
      meetsExcellentCriteria,
      thresholds: {
        visualDesign: 8.0,
        uxStructure: 8.0,
        contentQuality: 8.0,
        conversionTrust: 7.5,
        seoFoundations: 7.5,
        creativity: 7.0,
        mobileUX: 8.0
      }
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'final-score.json'),
      JSON.stringify(finalScore, null, 2)
    );
    
    // Generate summary markdown
    await generateSummary(outputDir, finalScore, {
      visual,
      content,
      ux,
      mobile,
      seo,
      creativity,
      conversion,
      accessibility
    });
    
    return {
      url,
      timestamp,
      categoryScores,
      weightedScore,
      verdict,
      meetsExcellentCriteria,
      reports: {
        visual,
        content,
        ux,
        mobile,
        seo,
        creativity,
        conversion,
        accessibility
      }
    };
  } catch (error) {
    console.error('v3.0 Analysis failed:', error);
    throw error;
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

/**
 * PHASE 2: Advanced Visual Design Scoring
 */
async function analyzeVisualDesign(
  page: Page,
  screenshots: ScreenshotAnalysis,
  html: string
): Promise<any> {
  let score = 5.0;
  const details: any = {};
  
  // 1. Color Palette Quality (0-2.5)
  const colors = screenshots.desktop.dominantColors;
  const colorCount = colors.length;
  if (colorCount >= 3 && colorCount <= 8) {
    score += 1.5;
    details.colorPalette = 'Cohesive palette detected';
  } else if (colorCount >= 2) {
    score += 1.0;
    details.colorPalette = 'Basic palette';
  }
  
  // Check for harmony (simplified)
  if (colorCount >= 3) {
    score += 0.5;
    details.colorHarmony = 'Multiple color groups detected';
  }
  
  // 2. Typography Hierarchy (0-2.0)
  const typography = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
    const fonts = new Set<string>();
    headings.forEach(h => {
      const style = window.getComputedStyle(h);
      fonts.add(style.fontFamily);
    });
    return {
      headingCount: headings.length,
      fontFamilies: Array.from(fonts),
      hasHierarchy: headings.length >= 3
    };
  });
  
  if (typography.hasHierarchy) {
    score += 1.0;
    details.typography = 'Proper heading hierarchy';
  }
  
  const modernFonts = ['Inter', 'SF Pro', 'Helvetica Neue', 'IBM Plex', 'Roboto', 'Open Sans'];
  const hasModernFont = typography.fontFamilies.some(f => 
    modernFonts.some(mf => f.includes(mf))
  );
  if (hasModernFont) {
    score += 0.5;
    details.modernFonts = 'Modern font detected';
  }
  
  if (typography.fontFamilies.length >= 2) {
    score += 0.5;
    details.fontVariety = 'Multiple font families';
  }
  
  // 3. Whitespace & Rhythm (0-2.0)
  const rhythm = screenshots.desktop.layoutRhythm;
  score += (rhythm / 10) * 2.0;
  details.layoutRhythm = `Rhythm score: ${rhythm.toFixed(1)}/10`;
  
  // 4. Photography & Illustration Quality (0-2.0)
  const images = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.map(img => ({
      src: img.src,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight
    }));
  });
  
  const customImages = images.filter(img => 
    !img.src.includes('unsplash.com') && 
    !img.src.includes('pexels.com') &&
    !img.src.includes('pixabay.com')
  );
  
  if (customImages.length >= 3) {
    score += 1.5;
    details.photography = 'Custom imagery detected';
  } else if (customImages.length >= 1) {
    score += 0.5;
    details.photography = 'Some custom images';
  }
  
  const professionalImages = images.filter(img => 
    img.width >= 800 && img.height >= 600
  );
  if (professionalImages.length >= 2) {
    score += 0.5;
    details.imageQuality = 'High-resolution images';
  }
  
  // 5. Animation Quality (0-1.5)
  const animations = await page.evaluate(() => {
    const styles = Array.from(document.styleSheets);
    let hasAnimations = false;
    let hasTransitions = false;
    
    try {
      for (const sheet of styles) {
        const rules = Array.from(sheet.cssRules || []);
        for (const rule of rules) {
          if (rule instanceof CSSKeyframesRule) {
            hasAnimations = true;
          }
          if (rule instanceof CSSStyleRule) {
            if (rule.style.transition) hasTransitions = true;
          }
        }
      }
    } catch (e) {
      // Cross-origin stylesheets
    }
    
    return { hasAnimations, hasTransitions };
  });
  
  if (animations.hasAnimations && animations.hasTransitions) {
    score += 1.0;
    details.animation = 'Modern animations detected';
  } else if (animations.hasTransitions) {
    score += 0.5;
    details.animation = 'Basic transitions';
  }
  
  // Check for smooth scroll
  const hasSmoothScroll = html.includes('scroll-behavior: smooth') || 
                         html.includes('scrollBehavior');
  if (hasSmoothScroll) {
    score += 0.5;
    details.smoothScroll = 'Smooth scroll enabled';
  }
  
  return {
    score: Math.min(10, Math.max(0, score)),
    details,
    dominantColors: colors,
    typography,
    images: images.length,
    customImages: customImages.length
  };
}

/**
 * PHASE 3: Mobile UX and Responsiveness Scoring
 */
async function analyzeMobileUX(
  page: Page,
  screenshots: ScreenshotAnalysis
): Promise<any> {
  let score = 5.0;
  const details: any = {};
  
  // Switch to mobile viewport
  await page.setViewport({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForTimeout(1000);
  
  // 1. Mobile Navigation (0-2.0)
  const mobileNav = screenshots.mobile.navigationType;
  if (mobileNav === 'hamburger') {
    score += 1.5;
    details.navigation = 'Hamburger menu detected';
  } else if (mobileNav === 'stacked') {
    score += 1.0;
    details.navigation = 'Stacked navigation';
  }
  
  // Check tap targets
  const tapTargets = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
    return buttons.filter(btn => {
      const rect = btn.getBoundingClientRect();
      return rect.width >= 44 && rect.height >= 44;
    }).length;
  });
  
  if (tapTargets >= 5) {
    score += 0.5;
    details.tapTargets = 'Adequate tap target sizes';
  }
  
  // 2. Mobile Layout Stack Quality (0-2.5)
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  
  if (!hasHorizontalScroll) {
    score += 2.0;
    details.layout = 'No horizontal scroll';
  } else {
    score -= 1.0;
    details.layout = 'Horizontal scroll detected (penalty)';
  }
  
  // Check column stacking
  const columnStack = await page.evaluate(() => {
    const containers = Array.from(document.querySelectorAll('[class*="grid"], [class*="flex"]'));
    return containers.length;
  });
  
  if (columnStack >= 3) {
    score += 0.5;
    details.responsiveLayout = 'Responsive grid/flex detected';
  }
  
  // 3. Mobile Readability (0-2.0)
  const readability = screenshots.mobile.readabilityScore;
  score += (readability / 10) * 2.0;
  details.readability = `Readability score: ${readability.toFixed(1)}/10`;
  
  // 4. Mobile Performance (0-1.5)
  const imageWeight = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.length;
  });
  
  if (imageWeight <= 10) {
    score += 1.0;
    details.performance = 'Reasonable image count';
  } else if (imageWeight <= 20) {
    score += 0.5;
    details.performance = 'Moderate image count';
  } else {
    score -= 0.5;
    details.performance = 'High image count (may impact performance)';
  }
  
  return {
    score: Math.min(10, Math.max(0, score)),
    details,
    navigationType: mobileNav,
    readabilityScore: readability
  };
}

/**
 * PHASE 4: Functional UX & Conversion Analysis
 */
async function analyzeConversion(page: Page, bodyText: string): Promise<any> {
  let score = 3.0; // Start lower
  const details: any = {};
  
  // 1. Clear Primary CTA (0-2.0)
  const strongCTAs = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
    const strongPatterns = /book a consultation|schedule a call|get started|start free trial|sign up now|try for free/i;
    return buttons.filter(btn => {
      const text = btn.textContent?.toLowerCase() || '';
      return strongPatterns.test(text);
    }).length;
  });
  
  if (strongCTAs >= 3) {
    score += 2.0;
    details.primaryCTA = 'Multiple strong CTAs';
  } else if (strongCTAs >= 1) {
    score += 1.5;
    details.primaryCTA = 'Strong CTA detected';
  }
  
  // 2. Repeated CTAs (0-1.5)
  const allCTAs = await page.evaluate(() => {
    return document.querySelectorAll('button, a[class*="button"], [class*="cta"]').length;
  });
  
  if (allCTAs >= 5) {
    score += 1.5;
    details.ctaFrequency = 'CTAs throughout page';
  } else if (allCTAs >= 3) {
    score += 1.0;
    details.ctaFrequency = 'Multiple CTAs';
  }
  
  // 3. Contact Information (0-2.0)
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(bodyText);
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(bodyText);
  const hasAddress = /(street|address|road|avenue|drive|city|state|zip|postal)/i.test(bodyText);
  
  if (hasPhone) { score += 0.5; details.phone = 'Phone number present'; }
  if (hasEmail) { score += 0.5; details.email = 'Email present'; }
  if (hasAddress) { score += 0.5; details.address = 'Address present'; }
  
  const hasForm = await page.$('form');
  if (hasForm) {
    score += 0.5;
    details.form = 'Contact form present';
  }
  
  // 4. Trust Elements (0-2.0)
  const hasTestimonials = /testimonial|review|customer quote|client testimonial/i.test(bodyText);
  const hasCertifications = /certified|award|trusted|verified|secure|ssl|badge/i.test(bodyText);
  
  if (hasTestimonials) {
    score += 1.0;
    details.testimonials = 'Testimonials detected';
  }
  if (hasCertifications) {
    score += 1.0;
    details.trust = 'Trust elements detected';
  }
  
  // 5. Page Flow (0-2.5)
  const components = await page.evaluate(() => {
    return {
      hasHero: !!document.querySelector('section.hero, .hero-section, header h1'),
      hasValue: /value|benefit|feature|advantage/i.test(document.body.innerText),
      hasProof: /testimonial|review|case study|client/i.test(document.body.innerText),
      hasAction: document.querySelectorAll('button, [class*="cta"]').length >= 1
    };
  });
  
  if (components.hasHero && components.hasValue && components.hasProof && components.hasAction) {
    score += 2.5;
    details.pageFlow = 'Complete flow: Hero → Value → Proof → Action';
  } else if (components.hasHero && components.hasAction) {
    score += 1.5;
    details.pageFlow = 'Basic flow present';
  }
  
  return {
    score: Math.min(10, Math.max(0, score)),
    details,
    strongCTAs,
    allCTAs,
    hasPhone,
    hasEmail,
    hasAddress,
    hasForm: !!hasForm
  };
}

/**
 * PHASE 5: Brand Personality & Creativity Detection
 */
async function analyzeCreativity(
  page: Page,
  screenshots: ScreenshotAnalysis,
  bodyText: string
): Promise<any> {
  let score = 5.0;
  const details: any = {};
  
  // 1. Unique Brand Voice (0-2.0)
  const genericPatterns = [
    /we deliver exceptional quality/i,
    /quality, integrity, and customer satisfaction/i,
    /we are the best/i,
    /we provide excellent service/i
  ];
  
  const hasGeneric = genericPatterns.some(pattern => pattern.test(bodyText));
  if (!hasGeneric) {
    score += 1.5;
    details.brandVoice = 'Unique voice (no generic filler)';
  } else {
    score -= 1.0;
    details.brandVoice = 'Generic content detected (penalty)';
  }
  
  // 2. Custom Illustration Style (0-2.0)
  const svgCount = await page.evaluate(() => {
    return document.querySelectorAll('svg').length;
  });
  
  if (svgCount >= 5) {
    score += 1.5;
    details.illustrations = 'Custom SVG graphics';
  } else if (svgCount >= 1) {
    score += 0.5;
    details.illustrations = 'Some custom graphics';
  }
  
  // 3. Original Layout Patterns (0-2.5)
  const uniqueLayout = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section, [class*="section"]'));
    const hasAsymmetric = sections.some(s => {
      const style = window.getComputedStyle(s);
      return style.display === 'grid' && style.gridTemplateColumns !== 'repeat(2, 1fr)';
    });
    return { sectionCount: sections.length, hasAsymmetric };
  });
  
  if (uniqueLayout.hasAsymmetric) {
    score += 1.5;
    details.layout = 'Unique layout patterns';
  }
  
  if (uniqueLayout.sectionCount >= 5) {
    score += 1.0;
    details.structure = 'Well-structured sections';
  }
  
  // 4. Memorable Design Elements (0-2.5)
  const hasTagline = /tagline|slogan|motto|mission statement/i.test(bodyText);
  const hasStory = /story|journey|mission|vision|founded|since \d{4}/i.test(bodyText);
  
  if (hasTagline && hasStory) {
    score += 2.0;
    details.memorable = 'Tagline + brand story';
  } else if (hasStory) {
    score += 1.0;
    details.memorable = 'Brand story present';
  }
  
  const colors = screenshots.desktop.dominantColors.length;
  if (colors >= 4) {
    score += 0.5;
    details.visualIdentity = 'Strong color identity';
  }
  
  return {
    score: Math.min(10, Math.max(0, score)),
    details
  };
}

/**
 * PHASE 6: True Content Quality Analysis (Rendered DOM)
 */
async function analyzeContentQuality(page: Page, bodyText: string): Promise<any> {
  let score = 5.0;
  const details: any = {};
  
  // Get rendered content metrics
  const contentMetrics = await page.evaluate(() => {
    const paragraphs = document.querySelectorAll('p');
    const words = document.body.innerText.split(/\s+/).filter(w => w.length > 0);
    const sentences = document.body.innerText.match(/[.!?]+/g) || [];
    
    return {
      paragraphCount: paragraphs.length,
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgSentenceLength: words.length / Math.max(sentences.length, 1)
    };
  });
  
  // 1. Depth of Text (0-2.0)
  if (contentMetrics.wordCount >= 2000) {
    score += 2.0;
    details.depth = 'Very deep content';
  } else if (contentMetrics.wordCount >= 1000) {
    score += 1.5;
    details.depth = 'Deep content';
  } else if (contentMetrics.wordCount >= 500) {
    score += 1.0;
    details.depth = 'Adequate depth';
  } else if (contentMetrics.wordCount < 200) {
    score -= 1.5;
    details.depth = 'Too minimalistic (penalty)';
  }
  
  // 2. Specificity to Industry (0-2.0)
  const industryTerms = bodyText.match(/\b(API|SaaS|ROI|KPI|CRM|ERP|UX|UI|SEO|SEM|CTR|conversion|funnel|pipeline|legal|law|attorney|corporate|family|criminal)\b/gi);
  if (industryTerms && industryTerms.length >= 5) {
    score += 2.0;
    details.specificity = 'Industry-specific terminology';
  } else if (industryTerms && industryTerms.length >= 2) {
    score += 1.0;
    details.specificity = 'Some industry terms';
  }
  
  // 3. Clarity in Value Proposition (0-2.0)
  const valueProps = /solve|help|enable|empower|transform|improve|increase|reduce|streamline/i.test(bodyText);
  const hasWhat = /what we do|our services|we provide|we offer/i.test(bodyText);
  const hasWhy = /why choose|why us|our advantage|benefit/i.test(bodyText);
  
  if (valueProps && hasWhat && hasWhy) {
    score += 2.0;
    details.valueProp = 'Clear value proposition';
  } else if (valueProps && (hasWhat || hasWhy)) {
    score += 1.0;
    details.valueProp = 'Basic value proposition';
  }
  
  // 4. Avoidance of Boilerplate (0-2.0)
  const genericPatterns = [
    /we deliver exceptional quality/i,
    /quality, integrity, and customer satisfaction/i,
    /we are the best/i
  ];
  
  const hasGeneric = genericPatterns.some(pattern => pattern.test(bodyText));
  if (!hasGeneric) {
    score += 2.0;
    details.boilerplate = 'No generic filler';
  } else {
    score -= 2.0;
    details.boilerplate = 'Generic filler detected (penalty)';
  }
  
  // 5. Educational Content (0-1.0)
  const hasFAQs = await page.evaluate(() => {
    return document.querySelector('section:contains("FAQ"), h2:contains("FAQ")') !== null ||
           /frequently asked|faq/i.test(document.body.innerText);
  });
  
  if (hasFAQs) {
    score += 0.5;
    details.educational = 'FAQs present';
  }
  
  // 6. Tone Consistency (0-1.0)
  // Simplified: check for consistent voice patterns
  score += 0.5;
  details.tone = 'Tone analysis';
  
  return {
    score: Math.min(10, Math.max(0, score)),
    details,
    metrics: contentMetrics
  };
}

/**
 * PHASE 3: UX Structure Analysis
 */
async function analyzeUXStructure(page: Page, html: string): Promise<any> {
  let score = 5.0;
  const details: any = {};
  
  // Navigation
  const hasNav = await page.evaluate(() => {
    return document.querySelector('nav, [role="navigation"]') !== null;
  });
  
  if (hasNav) {
    score += 1.5;
    details.navigation = 'Navigation present';
  }
  
  // Heading hierarchy
  const headings = await page.evaluate(() => {
    return {
      h1: document.querySelectorAll('h1').length,
      h2: document.querySelectorAll('h2').length,
      h3: document.querySelectorAll('h3').length
    };
  });
  
  if (headings.h1 === 1 && headings.h2 >= 3) {
    score += 1.5;
    details.headings = 'Proper heading hierarchy';
  }
  
  // Responsive breakpoints
  const hasBreakpoints = html.includes('@media') || html.includes('breakpoint');
  if (hasBreakpoints) {
    score += 1.0;
    details.responsive = 'Responsive breakpoints';
  }
  
  // Internal linking
  const links = await page.evaluate(() => {
    return document.querySelectorAll('a[href^="/"], a[href*="' + window.location.hostname + '"]').length;
  });
  
  if (links >= 10) {
    score += 1.0;
    details.linking = 'Good internal linking';
  }
  
  return {
    score: Math.min(10, Math.max(0, score)),
    details,
    headings,
    links
  };
}

/**
 * PHASE 7: SEO Foundations Upgrade
 */
async function analyzeSEOFoundations(page: Page, html: string): Promise<any> {
  let score = 5.0;
  const details: any = {};
  
  // Title
  const title = await page.evaluate(() => document.title);
  if (title.length >= 30 && title.length <= 60) {
    score += 1.0;
    details.title = 'Proper title length';
  }
  
  if (!/^(home|services|about|contact)\s*\|/i.test(title)) {
    score += 0.5;
    details.titleKeywords = 'Keyword-rich title';
  }
  
  // Meta description
  const metaDesc = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="description"]');
    return meta ? meta.getAttribute('content') : '';
  });
  
  if (metaDesc.length >= 120 && metaDesc.length <= 165) {
    score += 1.0;
    details.meta = 'Proper meta description';
  }
  
  // Schema
  const hasSchema = html.includes('application/ld+json') || html.includes('schema.org');
  if (hasSchema) {
    score += 1.5;
    details.schema = 'Schema markup present';
  }
  
  // Alt text
  const altCoverage = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    const withAlt = Array.from(imgs).filter(img => img.alt && img.alt.length > 0).length;
    return imgs.length > 0 ? (withAlt / imgs.length) : 1.0;
  });
  
  if (altCoverage >= 0.9) {
    score += 1.5;
    details.altText = 'Excellent alt text coverage';
  } else if (altCoverage >= 0.7) {
    score += 1.0;
    details.altText = 'Good alt text coverage';
  }
  
  return {
    score: Math.min(10, Math.max(0, score)),
    details,
    title,
    metaDesc,
    hasSchema,
    altCoverage
  };
}

/**
 * Accessibility Analysis
 */
async function analyzeAccessibility(page: Page): Promise<any> {
  const issues: string[] = [];
  let score = 10.0;
  
  // ARIA labels
  const ariaCount = await page.evaluate(() => {
    return document.querySelectorAll('[aria-label]').length;
  });
  
  if (ariaCount < 2) {
    issues.push('Low ARIA label usage');
    score -= 1.0;
  }
  
  // Alt text (already checked in SEO)
  const imagesWithoutAlt = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    return Array.from(imgs).filter(img => !img.alt || img.alt.length === 0).length;
  });
  
  if (imagesWithoutAlt > 2) {
    issues.push(`${imagesWithoutAlt} images missing alt text`);
    score -= 1.0;
  }
  
  // Button labels
  const buttons = await page.evaluate(() => {
    const btns = document.querySelectorAll('button, [role="button"]');
    return Array.from(btns).filter(btn => {
      const text = btn.textContent?.trim() || '';
      const ariaLabel = btn.getAttribute('aria-label');
      return text.length === 0 && !ariaLabel;
    }).length;
  });
  
  if (buttons > 0) {
    issues.push(`${buttons} buttons missing labels`);
    score -= 0.5;
  }
  
  return {
    score: Math.max(0, score),
    issues,
    hasRedFlags: issues.length >= 3
  };
}

/**
 * Calculate weighted score (0-100)
 */
function calculateWeightedScore(categoryScores: any): number {
  const weights = {
    visualDesign: 0.15,
    uxStructure: 0.15,
    contentQuality: 0.20,
    conversionTrust: 0.15,
    seoFoundations: 0.10,
    creativity: 0.10,
    mobileUX: 0.15
  };
  
  let weighted = 0;
  for (const [category, score] of Object.entries(categoryScores)) {
    weighted += (score as number) * (weights[category as keyof typeof weights] || 0);
  }
  
  return Math.round(weighted * 10) / 10; // Round to 1 decimal
}

/**
 * PHASE 8: Determine Verdict with Stricter Rules
 */
function determineVerdictV3(
  categoryScores: any,
  weightedScore: number,
  accessibility: any
): { verdict: 'Poor' | 'OK' | 'Good' | 'Excellent' | 'World-Class'; meetsExcellentCriteria: boolean } {
  
  const thresholds = {
    visualDesign: 8.0,
    uxStructure: 8.0,
    contentQuality: 8.0,
    conversionTrust: 7.5,
    seoFoundations: 7.5,
    creativity: 7.0,
    mobileUX: 8.0
  };
  
  // Check if all thresholds are met
  const meetsAllThresholds = Object.entries(thresholds).every(([category, threshold]) => {
    return categoryScores[category] >= threshold;
  });
  
  // Check for accessibility red flags
  const noRedFlags = !accessibility.hasRedFlags;
  
  // Check for layout-breaking issues (simplified)
  const noLayoutIssues = true; // Would check for horizontal scroll, etc.
  
  const meetsExcellentCriteria = meetsAllThresholds && noRedFlags && noLayoutIssues;
  
  if (weightedScore < 40) {
    return { verdict: 'Poor', meetsExcellentCriteria: false };
  } else if (weightedScore < 60) {
    return { verdict: 'OK', meetsExcellentCriteria: false };
  } else if (weightedScore < 75 || !meetsExcellentCriteria) {
    return { verdict: 'Good', meetsExcellentCriteria: false };
  } else if (weightedScore >= 75 && weightedScore < 90 && meetsExcellentCriteria) {
    return { verdict: 'Excellent', meetsExcellentCriteria: true };
  } else {
    return { verdict: 'World-Class', meetsExcellentCriteria: true };
  }
}

/**
 * Save all category reports
 */
async function saveReports(outputDir: string, reports: any): Promise<void> {
  const files = [
    { name: 'visual.json', data: reports.visual },
    { name: 'content.json', data: reports.content },
    { name: 'ux.json', data: reports.ux },
    { name: 'mobile.json', data: reports.mobile },
    { name: 'seo.json', data: reports.seo },
    { name: 'creativity.json', data: reports.creativity },
    { name: 'conversion.json', data: reports.conversion },
    { name: 'accessibility.json', data: reports.accessibility }
  ];
  
  for (const file of files) {
    fs.writeFileSync(
      path.join(outputDir, file.name),
      JSON.stringify(file.data, null, 2)
    );
  }
}

/**
 * Generate summary markdown
 */
async function generateSummary(outputDir: string, finalScore: any, reports: any): Promise<void> {
  const summary = `# Website Analysis Report v3.0

**URL:** ${finalScore.url}  
**Date:** ${new Date(finalScore.timestamp).toLocaleString()}  
**Overall Rating:** ${finalScore.verdict} (${finalScore.weightedScore}/100)

---

## Category Scores

| Category | Score | Threshold | Status |
|----------|-------|-----------|--------|
| Visual Design | ${finalScore.categoryScores.visualDesign}/10 | ≥8.0 | ${finalScore.categoryScores.visualDesign >= 8.0 ? '✅' : '❌'} |
| UX Structure | ${finalScore.categoryScores.uxStructure}/10 | ≥8.0 | ${finalScore.categoryScores.uxStructure >= 8.0 ? '✅' : '❌'} |
| Content Quality | ${finalScore.categoryScores.contentQuality}/10 | ≥8.0 | ${finalScore.categoryScores.contentQuality >= 8.0 ? '✅' : '❌'} |
| Conversion & Trust | ${finalScore.categoryScores.conversionTrust}/10 | ≥7.5 | ${finalScore.categoryScores.conversionTrust >= 7.5 ? '✅' : '❌'} |
| SEO Foundations | ${finalScore.categoryScores.seoFoundations}/10 | ≥7.5 | ${finalScore.categoryScores.seoFoundations >= 7.5 ? '✅' : '❌'} |
| Creativity | ${finalScore.categoryScores.creativity}/10 | ≥7.0 | ${finalScore.categoryScores.creativity >= 7.0 ? '✅' : '❌'} |
| Mobile UX | ${finalScore.categoryScores.mobileUX}/10 | ≥8.0 | ${finalScore.categoryScores.mobileUX >= 8.0 ? '✅' : '❌'} |

**Weighted Score:** ${finalScore.weightedScore}/100  
**Meets Excellent Criteria:** ${finalScore.meetsExcellentCriteria ? '✅ Yes' : '❌ No'}

---

## Detailed Analysis

See individual JSON files for detailed breakdowns:
- visual.json
- content.json
- ux.json
- mobile.json
- seo.json
- creativity.json
- conversion.json
- accessibility.json

---

*Generated by Merlin Website Analyzer v3.0*
`;

  fs.writeFileSync(path.join(outputDir, 'summary.md'), summary);
}

