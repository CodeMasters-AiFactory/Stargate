/**
 * Multi-Expert Virtual Panel v4.0
 * 5 parallel evaluators with specialized expertise
 */

import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import type { ScreenshotAnalysis } from './screenshotEvaluator';

export interface ExpertEvaluation {
  agent: string;
  focus: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  verdict: 'Poor' | 'OK' | 'Good' | 'Excellent' | 'World-Class';
  details: any;
}

/**
 * 1. UX Designer Agent
 * Focus: Layout, flow, spacing, navigation logic
 */
export async function evaluateAsUXDesigner(
  page: Page,
  html: string,
  screenshots: ScreenshotAnalysis
): Promise<ExpertEvaluation> {
  let score = 5.0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Jakob Nielsen's 10 Heuristics
  const heuristics = await evaluateNielsenHeuristics(page);
  score += heuristics.score * 0.3;
  
  // Navigation clarity
  const navigation = await page.evaluate(() => {
    const nav = document.querySelector('nav, [role="navigation"]');
    if (!nav) return { exists: false, linkCount: 0 };
    
    const links = nav.querySelectorAll('a');
    return {
      exists: true,
      linkCount: links.length,
      hasLogo: !!nav.querySelector('img, svg, [class*="logo"]'),
      isSticky: window.getComputedStyle(nav).position === 'sticky' || 
                window.getComputedStyle(nav).position === 'fixed'
    };
  });
  
  if (navigation.exists && navigation.linkCount >= 3) {
    score += 1.0;
    strengths.push('Clear navigation structure');
  } else {
    weaknesses.push('Navigation unclear or missing');
  }
  
  // Information architecture
  const headingStructure = await page.evaluate(() => {
    return {
      h1: document.querySelectorAll('h1').length,
      h2: document.querySelectorAll('h2').length,
      h3: document.querySelectorAll('h3').length
    };
  });
  
  if (headingStructure.h1 === 1 && headingStructure.h2 >= 3) {
    score += 1.0;
    strengths.push('Proper heading hierarchy');
  } else {
    weaknesses.push('Heading structure needs improvement');
  }
  
  // User journey mapping
  const hasHero = await page.$('section.hero, .hero-section, header h1');
  const hasCTAs = (await page.$$('button, [class*="cta"], a[class*="button"]')).length >= 3;
  const hasFooter = await page.$('footer');
  
  if (hasHero && hasCTAs && hasFooter) {
    score += 0.5;
    strengths.push('Clear user journey');
  }
  
  // Fitts's Law (tap targets)
  const tapTargets = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
    const adequate = buttons.filter(btn => {
      const rect = btn.getBoundingClientRect();
      return rect.width >= 44 && rect.height >= 44;
    }).length;
    return { total: buttons.length, adequate };
  });
  
  if (tapTargets.adequate / Math.max(tapTargets.total, 1) >= 0.8) {
    score += 0.5;
    strengths.push('Adequate tap target sizes');
  } else {
    weaknesses.push('Some tap targets too small');
  }
  
  // Hick's Law (choice complexity)
  const navComplexity = navigation.linkCount;
  if (navComplexity >= 3 && navComplexity <= 7) {
    score += 0.5;
    strengths.push('Optimal navigation complexity');
  } else if (navComplexity > 10) {
    score -= 0.5;
    weaknesses.push('Too many navigation choices');
  }
  
  // Gestalt principles (proximity, similarity)
  const layoutRhythm = screenshots.desktop.layoutRhythm;
  score += (layoutRhythm / 10) * 0.5;
  
  if (layoutRhythm >= 7) {
    strengths.push('Consistent spacing and grouping');
  }
  
  const finalScore = Math.min(10, Math.max(0, score));
  
  return {
    agent: 'UX Designer',
    focus: 'Layout, flow, spacing, navigation logic',
    score: finalScore,
    strengths,
    weaknesses,
    verdict: determineVerdict(finalScore),
    details: {
      heuristics,
      navigation,
      headingStructure,
      tapTargets,
      layoutRhythm
    }
  };
}

/**
 * 2. Senior Product Designer Agent
 * Focus: Visual design, typography, brand identity, spacing rhythm
 */
export async function evaluateAsProductDesigner(
  page: Page,
  html: string,
  screenshots: ScreenshotAnalysis
): Promise<ExpertEvaluation> {
  let score = 5.0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Color palette quality
  const colors = screenshots.desktop.dominantColors;
  if (colors.length >= 3 && colors.length <= 8) {
    score += 1.5;
    strengths.push('Cohesive color palette');
  } else if (colors.length < 2) {
    weaknesses.push('Limited color palette');
  }
  
  // Typography hierarchy
  const typography = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
    const fonts = new Set<string>();
    const sizes: number[] = [];
    
    headings.forEach(h => {
      const style = window.getComputedStyle(h);
      fonts.add(style.fontFamily);
      sizes.push(parseFloat(style.fontSize));
    });
    
    const modernFonts = ['Inter', 'SF Pro', 'Helvetica Neue', 'IBM Plex', 'Roboto', 'Open Sans'];
    const hasModern = Array.from(fonts).some(f => 
      modernFonts.some(mf => f.includes(mf))
    );
    
    return {
      fontFamilies: Array.from(fonts),
      hasModern,
      sizeVariety: new Set(sizes).size,
      hasHierarchy: sizes.length >= 3 && Math.max(...sizes) / Math.min(...sizes) >= 1.5
    };
  });
  
  if (typography.hasHierarchy) {
    score += 1.0;
    strengths.push('Clear typography hierarchy');
  }
  
  if (typography.hasModern) {
    score += 0.5;
    strengths.push('Modern font selection');
  }
  
  if (typography.fontFamilies.length >= 2) {
    score += 0.5;
    strengths.push('Typography system');
  }
  
  // Premium feel assessment
  const premiumIndicators = await page.evaluate(() => {
    const hasGradients = document.querySelectorAll('[style*="gradient"], [class*="gradient"]').length > 0;
    const hasShadows = document.querySelectorAll('[style*="shadow"], [class*="shadow"]').length > 0;
    const hasRounded = document.querySelectorAll('[style*="border-radius"], [class*="rounded"]').length > 0;
    const imageQuality = Array.from(document.querySelectorAll('img'))
      .filter(img => img.naturalWidth >= 800).length;
    
    return {
      hasGradients,
      hasShadows,
      hasRounded,
      highQualityImages: imageQuality >= 3
    };
  });
  
  if (premiumIndicators.highQualityImages) {
    score += 1.0;
    strengths.push('High-quality imagery');
  }
  
  if (premiumIndicators.hasShadows || premiumIndicators.hasRounded) {
    score += 0.5;
    strengths.push('Modern design details');
  }
  
  // Spacing rhythm
  const rhythm = screenshots.desktop.layoutRhythm;
  score += (rhythm / 10) * 1.0;
  
  if (rhythm >= 8) {
    strengths.push('Excellent spacing rhythm');
  } else if (rhythm < 5) {
    weaknesses.push('Inconsistent spacing');
  }
  
  // Visual consistency
  const consistency = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section, [class*="section"]'));
    const paddingValues = new Set<string>();
    
    sections.forEach(s => {
      const style = window.getComputedStyle(s);
      paddingValues.add(style.paddingTop);
    });
    
    return {
      sectionCount: sections.length,
      paddingVariety: paddingValues.size,
      isConsistent: paddingValues.size <= 3 && sections.length >= 3
    };
  });
  
  if (consistency.isConsistent) {
    score += 0.5;
    strengths.push('Consistent visual system');
  }
  
  const finalScore = Math.min(10, Math.max(0, score));
  
  return {
    agent: 'Senior Product Designer',
    focus: 'Visual design, typography, brand identity, spacing rhythm',
    score: finalScore,
    strengths,
    weaknesses,
    verdict: determineVerdict(finalScore),
    details: {
      colors: colors.length,
      typography,
      premiumIndicators,
      rhythm,
      consistency
    }
  };
}

/**
 * 3. Conversion Strategist Agent
 * Focus: CTAs, trust, funnels, messaging clarity
 */
export async function evaluateAsConversionStrategist(
  page: Page,
  bodyText: string
): Promise<ExpertEvaluation> {
  let score = 3.0; // Start lower
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Strong CTAs
  const strongCTAs = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
    const strongPatterns = /book a consultation|schedule a call|get started|start free trial|sign up now|try for free|buy now|add to cart/i;
    
    return buttons.filter(btn => {
      const text = btn.textContent?.toLowerCase() || '';
      return strongPatterns.test(text);
    }).length;
  });
  
  if (strongCTAs >= 3) {
    score += 2.5;
    strengths.push('Multiple strong, action-oriented CTAs');
  } else if (strongCTAs >= 1) {
    score += 1.5;
    strengths.push('Strong CTA present');
  } else {
    weaknesses.push('Weak or missing CTAs');
  }
  
  // Above-fold CTA
  const aboveFoldCTA = await page.evaluate(() => {
    const viewportHeight = window.innerHeight;
    const buttons = Array.from(document.querySelectorAll('button, a[class*="button"], [class*="cta"]'));
    
    return buttons.some(btn => {
      const rect = btn.getBoundingClientRect();
      return rect.top < viewportHeight * 0.8; // Within 80% of viewport
    });
  });
  
  if (aboveFoldCTA) {
    score += 1.0;
    strengths.push('CTA visible above fold');
  } else {
    weaknesses.push('No CTA above fold');
  }
  
  // Trust elements
  const trustElements = {
    testimonials: /testimonial|review|customer quote|client testimonial/i.test(bodyText),
    certifications: /certified|award|trusted|verified|secure|ssl|badge/i.test(bodyText),
    socialProof: /clients|customers|users|followers/i.test(bodyText),
    guarantees: /guarantee|money back|satisfaction|warranty/i.test(bodyText)
  };
  
  const trustCount = Object.values(trustElements).filter(Boolean).length;
  if (trustCount >= 3) {
    score += 2.0;
    strengths.push('Strong trust elements');
  } else if (trustCount >= 2) {
    score += 1.0;
    strengths.push('Some trust elements');
  } else {
    weaknesses.push('Limited trust elements');
  }
  
  // Contact information
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(bodyText);
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(bodyText);
  const hasForm = await page.$('form');
  
  if (hasPhone && hasEmail && hasForm) {
    score += 1.5;
    strengths.push('Multiple contact methods');
  } else if ((hasPhone || hasEmail) && hasForm) {
    score += 1.0;
    strengths.push('Contact options available');
  } else {
    weaknesses.push('Limited contact options');
  }
  
  // Funnel flow
  const funnelFlow = await page.evaluate(() => {
    return {
      hasHero: !!document.querySelector('section.hero, .hero-section, header h1'),
      hasValue: /value|benefit|feature|advantage/i.test(document.body.innerText),
      hasProof: /testimonial|review|case study|client/i.test(document.body.innerText),
      hasAction: document.querySelectorAll('button, [class*="cta"]').length >= 1
    };
  });
  
  if (funnelFlow.hasHero && funnelFlow.hasValue && funnelFlow.hasProof && funnelFlow.hasAction) {
    score += 1.5;
    strengths.push('Complete conversion funnel');
  } else if (funnelFlow.hasHero && funnelFlow.hasAction) {
    score += 0.5;
    strengths.push('Basic funnel present');
  } else {
    weaknesses.push('Incomplete conversion funnel');
  }
  
  // Friction points
  const frictionPoints = await page.evaluate(() => {
    const popups = document.querySelectorAll('[class*="popup"], [class*="modal"], [id*="popup"]').length;
    const requiredFields = document.querySelectorAll('input[required], select[required]').length;
    return { popups, requiredFields };
  });
  
  if (frictionPoints.popups > 2) {
    score -= 0.5;
    weaknesses.push('Too many popups (friction)');
  }
  
  const finalScore = Math.min(10, Math.max(0, score));
  
  return {
    agent: 'Conversion Strategist',
    focus: 'CTAs, trust, funnels, messaging clarity',
    score: finalScore,
    strengths,
    weaknesses,
    verdict: determineVerdict(finalScore),
    details: {
      strongCTAs,
      aboveFoldCTA,
      trustElements,
      contactMethods: { hasPhone, hasEmail, hasForm: !!hasForm },
      funnelFlow,
      frictionPoints
    }
  };
}

/**
 * 4. SEO Specialist Agent
 * Focus: Structure, metadata, keyword strategy, helpful content
 */
export async function evaluateAsSEOSpecialist(
  page: Page,
  html: string,
  bodyText: string
): Promise<ExpertEvaluation> {
  let score = 5.0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Title optimization
  const title = await page.evaluate(() => document.title);
  if (title.length >= 30 && title.length <= 60) {
    score += 1.0;
    strengths.push('Optimal title length');
  } else {
    weaknesses.push('Title length not optimal (30-60 chars)');
  }
  
  if (!/^(home|services|about|contact)\s*\|/i.test(title)) {
    score += 0.5;
    strengths.push('Keyword-rich title');
  } else {
    weaknesses.push('Generic title');
  }
  
  // Meta description
  const metaDesc = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="description"]');
    return meta ? meta.getAttribute('content') || '' : '';
  });
  
  if (metaDesc.length >= 120 && metaDesc.length <= 165) {
    score += 1.0;
    strengths.push('Optimal meta description');
  } else if (metaDesc.length > 0) {
    weaknesses.push('Meta description length not optimal');
  } else {
    weaknesses.push('Missing meta description');
  }
  
  // Heading structure
  const headings = await page.evaluate(() => {
    return {
      h1: document.querySelectorAll('h1').length,
      h2: document.querySelectorAll('h2').length,
      h3: document.querySelectorAll('h3').length
    };
  });
  
  if (headings.h1 === 1) {
    score += 1.0;
    strengths.push('One H1 per page');
  } else {
    weaknesses.push(`Multiple H1s (${headings.h1})`);
  }
  
  if (headings.h2 >= 3) {
    score += 0.5;
    strengths.push('Good H2 structure');
  }
  
  // Schema markup
  const hasSchema = html.includes('application/ld+json') || html.includes('schema.org');
  if (hasSchema) {
    score += 1.5;
    strengths.push('Schema markup present');
  } else {
    weaknesses.push('Missing schema markup');
  }
  
  // Alt text coverage
  const altCoverage = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    const withAlt = Array.from(imgs).filter(img => img.alt && img.alt.length > 0).length;
    return imgs.length > 0 ? (withAlt / imgs.length) : 1.0;
  });
  
  if (altCoverage >= 0.9) {
    score += 1.0;
    strengths.push('Excellent alt text coverage');
  } else if (altCoverage >= 0.7) {
    score += 0.5;
    strengths.push('Good alt text coverage');
  } else {
    weaknesses.push('Poor alt text coverage');
  }
  
  // Content depth and helpfulness
  const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 2000) {
    score += 1.0;
    strengths.push('Deep, helpful content');
  } else if (wordCount >= 1000) {
    score += 0.5;
    strengths.push('Adequate content depth');
  } else if (wordCount < 300) {
    score -= 1.0;
    weaknesses.push('Content too thin');
  }
  
  // Internal linking
  const internalLinks = await page.evaluate(() => {
    const links = document.querySelectorAll('a[href^="/"], a[href*="' + window.location.hostname + '"]');
    return links.length;
  });
  
  if (internalLinks >= 10) {
    score += 0.5;
    strengths.push('Good internal linking');
  }
  
  // Keyword presence
  const hasKeywords = title.length >= 40 && metaDesc.length >= 50;
  if (hasKeywords) {
    score += 0.5;
    strengths.push('Keyword optimization');
  }
  
  const finalScore = Math.min(10, Math.max(0, score));
  
  return {
    agent: 'SEO Specialist',
    focus: 'Structure, metadata, keyword strategy, helpful content',
    score: finalScore,
    strengths,
    weaknesses,
    verdict: determineVerdict(finalScore),
    details: {
      title,
      metaDesc,
      headings,
      hasSchema,
      altCoverage,
      wordCount,
      internalLinks
    }
  };
}

/**
 * 5. Brand Identity Analyst
 * Focus: Uniqueness, consistency, narrative voice, memorable impression
 */
export async function evaluateAsBrandAnalyst(
  page: Page,
  html: string,
  bodyText: string,
  screenshots: ScreenshotAnalysis
): Promise<ExpertEvaluation> {
  let score = 5.0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Unique brand voice
  const genericPatterns = [
    /we deliver exceptional quality/i,
    /quality, integrity, and customer satisfaction/i,
    /we are the best/i,
    /we provide excellent service/i
  ];
  
  const hasGeneric = genericPatterns.some(pattern => pattern.test(bodyText));
  if (!hasGeneric) {
    score += 1.5;
    strengths.push('Unique brand voice');
  } else {
    score -= 1.0;
    weaknesses.push('Generic, template-sounding content');
  }
  
  // Logo and icon system
  const brandElements = await page.evaluate(() => {
    const logo = document.querySelector('img[alt*="logo"], [class*="logo"], svg[class*="logo"]');
    const svgs = document.querySelectorAll('svg').length;
    const icons = document.querySelectorAll('[class*="icon"], svg').length;
    
    return {
      hasLogo: !!logo,
      svgCount: svgs,
      iconCount: icons,
      hasIconSystem: icons >= 5
    };
  });
  
  if (brandElements.hasLogo) {
    score += 0.5;
    strengths.push('Logo present');
  }
  
  if (brandElements.hasIconSystem) {
    score += 1.0;
    strengths.push('Consistent icon system');
  }
  
  // Photography style
  const images = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return {
      total: imgs.length,
      custom: imgs.filter(img => 
        !img.src.includes('unsplash.com') && 
        !img.src.includes('pexels.com') &&
        !img.src.includes('pixabay.com')
      ).length,
      highQuality: imgs.filter(img => img.naturalWidth >= 800).length
    };
  });
  
  if (images.custom >= 3 && images.highQuality >= 2) {
    score += 1.5;
    strengths.push('Branded, high-quality photography');
  } else if (images.custom >= 1) {
    score += 0.5;
    strengths.push('Some custom imagery');
  } else {
    weaknesses.push('Generic stock imagery');
  }
  
  // Brand story and narrative
  const hasStory = /story|journey|mission|vision|founded|since \d{4}/i.test(bodyText);
  const hasTagline = /tagline|slogan|motto/i.test(bodyText) || 
                     await page.$('meta[property="og:description"]');
  
  if (hasStory && hasTagline) {
    score += 1.5;
    strengths.push('Strong brand narrative');
  } else if (hasStory || hasTagline) {
    score += 0.5;
    strengths.push('Some brand narrative');
  } else {
    weaknesses.push('Missing brand story');
  }
  
  // Visual consistency
  const colors = screenshots.desktop.dominantColors.length;
  if (colors >= 4) {
    score += 0.5;
    strengths.push('Strong color identity');
  }
  
  // Memorable elements
  const memorableElements = await page.evaluate(() => {
    const hasCustomHero = document.querySelector('section.hero, .hero-section') !== null;
    const hasAnimations = document.querySelectorAll('[style*="animation"], [class*="animate"]').length > 0;
    const hasUniqueLayout = document.querySelectorAll('[class*="custom"], [class*="unique"]').length > 0;
    
    return { hasCustomHero, hasAnimations, hasUniqueLayout };
  });
  
  if (memorableElements.hasCustomHero && memorableElements.hasAnimations) {
    score += 1.0;
    strengths.push('Memorable design elements');
  }
  
  // Differentiation
  const isGeneric = /confetti|dots|playful|template|demo|lorem ipsum/i.test(html);
  if (!isGeneric && bodyText.length >= 500) {
    score += 0.5;
    strengths.push('Not generic template');
  } else if (isGeneric) {
    score -= 1.0;
    weaknesses.push('Generic template appearance');
  }
  
  const finalScore = Math.min(10, Math.max(0, score));
  
  return {
    agent: 'Brand Identity Analyst',
    focus: 'Uniqueness, consistency, narrative voice, memorable impression',
    score: finalScore,
    strengths,
    weaknesses,
    verdict: determineVerdict(finalScore),
    details: {
      hasGeneric,
      brandElements,
      images,
      hasStory,
      hasTagline: !!hasTagline,
      colors,
      memorableElements,
      isGeneric
    }
  };
}

/**
 * Evaluate Jakob Nielsen's 10 Heuristics
 */
async function evaluateNielsenHeuristics(page: Page): Promise<{ score: number; violations: string[] }> {
  let score = 5.0;
  const violations: string[] = [];
  
  // 1. Visibility of system status
  const hasLoading = await page.evaluate(() => {
    return document.querySelector('[class*="loading"], [class*="spinner"]') !== null ||
           document.body.innerText.includes('Loading');
  });
  if (!hasLoading) score += 0.2;
  
  // 2. Match between system and real world
  // (Simplified: check for clear language)
  const hasClearLanguage = await page.evaluate(() => {
    const text = document.body.innerText.toLowerCase();
    return !text.includes('lorem ipsum') && text.length > 100;
  });
  if (hasClearLanguage) score += 0.5;
  else violations.push('Unclear language or placeholder text');
  
  // 3. User control and freedom
  const hasBackButton = await page.evaluate(() => {
    return window.history.length > 1 || 
           document.querySelector('[aria-label*="back"], [class*="back"]') !== null;
  });
  if (hasBackButton) score += 0.3;
  
  // 4. Consistency and standards
  const consistency = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const styles = new Set(buttons.map(b => window.getComputedStyle(b).backgroundColor));
    return styles.size <= 3 && buttons.length >= 2;
  });
  if (consistency) score += 0.5;
  else violations.push('Inconsistent button styles');
  
  // 5. Error prevention
  const hasFormValidation = await page.evaluate(() => {
    return document.querySelectorAll('input[required], input[type="email"], input[pattern]').length > 0;
  });
  if (hasFormValidation) score += 0.3;
  
  // 6. Recognition rather than recall
  const hasLabels = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, select, textarea');
    return Array.from(inputs).filter(inp => {
      const label = inp.getAttribute('aria-label') || 
                   document.querySelector(`label[for="${inp.id}"]`);
      return !!label;
    }).length / Math.max(inputs.length, 1);
  });
  if (hasLabels >= 0.8) score += 0.5;
  else violations.push('Some form fields lack labels');
  
  // 7. Flexibility and efficiency
  const hasShortcuts = await page.evaluate(() => {
    return document.querySelectorAll('[accesskey], [title]').length > 0;
  });
  if (hasShortcuts) score += 0.2;
  
  // 8. Aesthetic and minimalist design
  const isMinimal = await page.evaluate(() => {
    const sections = document.querySelectorAll('section, [class*="section"]').length;
    return sections >= 3 && sections <= 10;
  });
  if (isMinimal) score += 0.5;
  else violations.push('Design may be cluttered');
  
  // 9. Help users recognize, diagnose, recover from errors
  const hasErrorMessages = await page.evaluate(() => {
    return document.querySelectorAll('[class*="error"], [role="alert"]').length > 0 ||
           document.body.innerText.includes('error') || 
           document.body.innerText.includes('invalid');
  });
  if (hasErrorMessages) score += 0.3;
  
  // 10. Help and documentation
  const hasHelp = await page.evaluate(() => {
    return /faq|help|support|documentation|guide/i.test(document.body.innerText) ||
           document.querySelector('[class*="help"], [class*="faq"]') !== null;
  });
  if (hasHelp) score += 0.2;
  
  return {
    score: Math.min(10, Math.max(0, score)),
    violations
  };
}

/**
 * Determine verdict from score
 */
function determineVerdict(score: number): 'Poor' | 'OK' | 'Good' | 'Excellent' | 'World-Class' {
  if (score < 4.0) return 'Poor';
  if (score < 6.0) return 'OK';
  if (score < 7.5) return 'Good';
  if (score < 8.5) return 'Excellent';
  return 'World-Class';
}

