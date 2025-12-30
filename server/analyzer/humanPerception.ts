/**
 * Human Experience Model v4.0
 * Subjective "human perception score" based on emotional and visual assessment
 */

import type { ScreenshotAnalysis } from './screenshotEvaluator';
import { Page } from 'puppeteer';

export interface PerceptionScore {
  firstImpression: number; // 0-25
  emotionalResonance: number; // 0-25
  cohesion: number; // 0-25
  identityRecognition: number; // 0-25
  totalScore: number; // 0-100
  breakdown: {
    trust: 'high' | 'medium' | 'low';
    premium: 'high' | 'medium' | 'low';
    memorable: 'high' | 'medium' | 'low';
  };
}

/**
 * Calculate human perception score
 */
export async function calculatePerceptionScore(
  page: Page,
  _html: string,
  bodyText: string,
  screenshots: ScreenshotAnalysis
): Promise<PerceptionScore> {

  // 1. First 5-Second Impression (0-25)
  const firstImpression = await assessFirstImpression(page, screenshots);

  // 2. Emotional Resonance (0-25)
  const emotionalResonance = await assessEmotionalResonance(page, bodyText, screenshots);

  // 3. Cohesion (0-25)
  const cohesion = await assessCohesion(page, screenshots);

  // 4. Identity Recognition (0-25)
  const identityRecognition = await assessIdentityRecognition(page, bodyText, screenshots);

  const totalScore = firstImpression + emotionalResonance + cohesion + identityRecognition;

  // Generate breakdown
  const breakdown: { trust: 'high' | 'medium' | 'low'; premium: 'high' | 'medium' | 'low'; memorable: 'high' | 'medium' | 'low' } = {
    trust: (totalScore >= 80 ? 'high' : totalScore >= 60 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
    premium: (emotionalResonance >= 20 ? 'high' : emotionalResonance >= 15 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
    memorable: (identityRecognition >= 20 ? 'high' : identityRecognition >= 15 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
  };

  return {
    firstImpression,
    emotionalResonance,
    cohesion,
    identityRecognition,
    totalScore,
    breakdown
  };
}

/**
 * 1. First 5-Second Impression
 * "Would a human trust this site immediately?"
 */
async function assessFirstImpression(
  page: Page,
  _screenshots: ScreenshotAnalysis
): Promise<number> {
  let score = 12.5; // Start at medium
  
  // Visual polish
  const visualPolish = await page.evaluate(() => {
    const hasGradients = document.querySelectorAll('[style*="gradient"]').length > 0;
    const hasShadows = document.querySelectorAll('[style*="shadow"], [class*="shadow"]').length > 0;
    const hasRounded = document.querySelectorAll('[style*="border-radius"], [class*="rounded"]').length > 0;
    const imageQuality = Array.from(document.querySelectorAll('img'))
      .filter(img => img.naturalWidth >= 800).length;
    
    return {
      hasGradients,
      hasShadows,
      hasRounded,
      highQualityImages: imageQuality >= 3,
      polishScore: (hasGradients ? 1 : 0) + (hasShadows ? 1 : 0) + (hasRounded ? 1 : 0) + (imageQuality >= 3 ? 2 : 0)
    };
  });
  
  if (visualPolish.polishScore >= 4) {
    score += 5.0; // High polish
  } else if (visualPolish.polishScore >= 2) {
    score += 2.5; // Medium polish
  }
  
  // Professional appearance
  const professional = await page.evaluate(() => {
    const hasLogo = document.querySelector('img[alt*="logo"], [class*="logo"], svg[class*="logo"]') !== null;
    const hasNavigation = document.querySelector('nav, [role="navigation"]') !== null;
    const hasFooter = document.querySelector('footer') !== null;
    const hasContact = /phone|email|contact|address/i.test(document.body.innerText);
    
    return {
      hasLogo,
      hasNavigation,
      hasFooter,
      hasContact,
      professionalScore: (hasLogo ? 1 : 0) + (hasNavigation ? 1 : 0) + (hasFooter ? 1 : 0) + (hasContact ? 1 : 0)
    };
  });
  
  if (professional.professionalScore >= 3) {
    score += 5.0; // Very professional
  } else if (professional.professionalScore >= 2) {
    score += 2.5; // Somewhat professional
  }
  
  // Initial credibility
  const credibility = await page.evaluate(() => {
    const hasTestimonials = /testimonial|review|customer/i.test(document.body.innerText);
    const hasCertifications = /certified|award|trusted|verified/i.test(document.body.innerText);
    const hasSchema = document.querySelector('script[type="application/ld+json"]') !== null;
    
    return {
      hasTestimonials,
      hasCertifications,
      hasSchema,
      credibilityScore: (hasTestimonials ? 1 : 0) + (hasCertifications ? 1 : 0) + (hasSchema ? 1 : 0)
    };
  });
  
  if (credibility.credibilityScore >= 2) {
    score += 2.5; // Good credibility
  }
  
  return Math.min(25, Math.max(0, score));
}

/**
 * 2. Emotional Resonance
 * "Does it feel premium, trustworthy, exciting?"
 */
async function assessEmotionalResonance(
  page: Page,
  bodyText: string,
  _screenshots: ScreenshotAnalysis
): Promise<number> {
  let score = 12.5; // Start at medium
  
  // Premium feel
  const premium = await page.evaluate(() => {
    const hasAnimations = document.querySelectorAll('[style*="animation"], [class*="animate"]').length > 0;
    const hasTransitions = document.querySelectorAll('[style*="transition"]').length > 0;
    const hasCustomGraphics = document.querySelectorAll('svg').length >= 5;
    const colorCount = new Set(
      Array.from(document.querySelectorAll('[style*="color"], [style*="background"]'))
        .map(el => window.getComputedStyle(el).color)
    ).size;
    
    return {
      hasAnimations,
      hasTransitions,
      hasCustomGraphics,
      colorCount,
      premiumScore: (hasAnimations ? 1 : 0) + (hasTransitions ? 1 : 0) + (hasCustomGraphics ? 1 : 0) + (colorCount >= 3 ? 1 : 0)
    };
  });
  
  if (premium.premiumScore >= 3) {
    score += 5.0; // High premium feel
  } else if (premium.premiumScore >= 2) {
    score += 2.5; // Some premium elements
  }
  
  // Trustworthiness
  const trust = {
    hasTestimonials: /testimonial|review|customer quote/i.test(bodyText),
    hasCertifications: /certified|award|trusted|verified/i.test(bodyText),
    hasContact: /phone|email|address/i.test(bodyText),
    hasSecurity: /secure|ssl|https|privacy/i.test(bodyText)
  };
  
  const trustScore = Object.values(trust).filter(Boolean).length;
  if (trustScore >= 3) {
    score += 5.0; // Very trustworthy
  } else if (trustScore >= 2) {
    score += 2.5; // Somewhat trustworthy
  }
  
  // Excitement/Engagement
  const engagement = await page.evaluate(() => {
    const hasVideo = document.querySelector('video, iframe[src*="youtube"], iframe[src*="vimeo"]') !== null;
    const hasInteractivity = document.querySelectorAll('[onclick], [class*="interactive"], [class*="hover"]').length > 0;
    const hasStrongCTAs = Array.from(document.querySelectorAll('button, a'))
      .filter(btn => /get started|start free|try now|book now/i.test(btn.textContent || '')).length >= 1;
    
    return {
      hasVideo,
      hasInteractivity,
      hasStrongCTAs,
      engagementScore: (hasVideo ? 1 : 0) + (hasInteractivity ? 1 : 0) + (hasStrongCTAs ? 1 : 0)
    };
  });
  
  if (engagement.engagementScore >= 2) {
    score += 2.5; // Engaging
  }
  
  return Math.min(25, Math.max(0, score));
}

/**
 * 3. Cohesion
 * "Does everything look like it belongs together?"
 */
async function assessCohesion(
  page: Page,
  screenshots: ScreenshotAnalysis
): Promise<number> {
  let score = 12.5; // Start at medium
  
  // Visual consistency
  const consistency = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const colors = new Set(buttons.map(b => window.getComputedStyle(b).backgroundColor));
    const fonts = new Set(buttons.map(b => window.getComputedStyle(b).fontFamily));
    
    const sections = Array.from(document.querySelectorAll('section, [class*="section"]'));
    const paddings = new Set(sections.map(s => window.getComputedStyle(s).paddingTop));
    
    return {
      buttonColorConsistency: colors.size <= 2 && buttons.length >= 2,
      buttonFontConsistency: fonts.size <= 2 && buttons.length >= 2,
      spacingConsistency: paddings.size <= 3 && sections.length >= 3,
      consistencyScore: (colors.size <= 2 ? 1 : 0) + (fonts.size <= 2 ? 1 : 0) + (paddings.size <= 3 ? 1 : 0)
    };
  });
  
  if (consistency.consistencyScore >= 2) {
    score += 5.0; // High consistency
  } else if (consistency.consistencyScore >= 1) {
    score += 2.5; // Some consistency
  }
  
  // Brand consistency
  const brandConsistency = await page.evaluate(() => {
    const logos = document.querySelectorAll('img[alt*="logo"], [class*="logo"]').length;
    const hasIconSystem = document.querySelectorAll('svg').length >= 3;
    const colorScheme = new Set(
      Array.from(document.querySelectorAll('[style*="color"]'))
        .map(el => window.getComputedStyle(el).color)
    ).size;
    
    return {
      hasLogo: logos >= 1,
      hasIconSystem,
      colorScheme,
      brandScore: (logos >= 1 ? 1 : 0) + (hasIconSystem ? 1 : 0) + (colorScheme >= 2 && colorScheme <= 6 ? 1 : 0)
    };
  });
  
  if (brandConsistency.brandScore >= 2) {
    score += 5.0; // Strong brand consistency
  } else if (brandConsistency.brandScore >= 1) {
    score += 2.5; // Some brand consistency
  }
  
  // Layout rhythm
  const rhythm = screenshots.desktop.layoutRhythm;
  score += (rhythm / 10) * 2.5; // Up to 2.5 points
  
  return Math.min(25, Math.max(0, score));
}

/**
 * 4. Identity Recognition
 * "Does the site have a unique personality?"
 */
async function assessIdentityRecognition(
  page: Page,
  bodyText: string,
  _screenshots: ScreenshotAnalysis
): Promise<number> {
  let score = 12.5; // Start at medium
  
  // Distinctive design
  const distinctive = await page.evaluate(() => {
    const hasCustomHero = document.querySelector('section.hero, .hero-section') !== null;
    const hasCustomLayout = document.querySelectorAll('[class*="custom"], [class*="unique"]').length > 0;
    const hasBrandColors = new Set(
      Array.from(document.querySelectorAll('[style*="color"], [style*="background"]'))
        .map(el => window.getComputedStyle(el).color)
    ).size >= 3;
    
    return {
      hasCustomHero,
      hasCustomLayout,
      hasBrandColors,
      distinctiveScore: (hasCustomHero ? 1 : 0) + (hasCustomLayout ? 1 : 0) + (hasBrandColors ? 1 : 0)
    };
  });
  
  if (distinctive.distinctiveScore >= 2) {
    score += 5.0; // Very distinctive
  } else if (distinctive.distinctiveScore >= 1) {
    score += 2.5; // Somewhat distinctive
  }
  
  // Memorable elements
  const memorable = {
    hasStory: /story|journey|mission|vision|founded/i.test(bodyText),
    hasTagline: /tagline|slogan|motto/i.test(bodyText),
    hasCustomGraphics: (await page.$$('svg')).length >= 5,
    hasAnimations: (await page.$$('[style*="animation"], [class*="animate"]')).length > 0
  };
  
  const memorableScore = Object.values(memorable).filter(Boolean).length;
  if (memorableScore >= 3) {
    score += 5.0; // Very memorable
  } else if (memorableScore >= 2) {
    score += 2.5; // Somewhat memorable
  }
  
  // Brand differentiation
  const isGeneric = /confetti|dots|playful|template|demo|lorem ipsum/i.test(await page.content());
  if (!isGeneric && bodyText.length >= 500) {
    score += 2.5; // Not generic
  } else if (isGeneric) {
    score -= 2.5; // Generic template
  }
  
  return Math.min(25, Math.max(0, score));
}

