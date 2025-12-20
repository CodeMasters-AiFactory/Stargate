/**
 * Local Website Analyzer
 * Analyzes websites using local AI/rules-based analysis
 * No external API calls required
 */

import * as cheerio from 'cheerio';
import type { WebsiteAnalysis } from './websiteAnalyzer';

/**
 * Analyze website using local rules and heuristics
 * Based on quality standards manifesto
 */
export function analyzeWebsiteLocally(
  url: string,
  html: string,
  websiteInfo: {
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
  }
): WebsiteAnalysis {
  const $ = cheerio.load(html);
  
  // Extract content for analysis
  const bodyText = $('body').text() || '';
  const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(bodyText);
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(bodyText);
  const hasAddress = /(street|address|road|avenue|drive|city|state|zip|postal)/i.test(bodyText);
  
  // Score Visual Design (0-10)
  const visualDesignScore = scoreVisualDesign(websiteInfo, $, html);
  
  // Score UX & Structure (0-10)
  const uxStructureScore = scoreUXStructure(websiteInfo, $, html);
  
  // Score Content & Positioning (0-10)
  const contentScore = scoreContent(websiteInfo, bodyText, wordCount);
  
  // Score Conversion & Trust (0-10)
  const conversionScore = scoreConversion(websiteInfo, hasPhone, hasEmail, hasAddress, bodyText);
  
  // Score SEO Foundations (0-10)
  const seoScore = scoreSEO(websiteInfo, $, html);
  
  // Score Creativity & Differentiation (0-10)
  const creativityScore = scoreCreativity(websiteInfo, $, html, bodyText);
  
  const scores = {
    visualDesign: visualDesignScore,
    uxStructure: uxStructureScore,
    contentPositioning: contentScore,
    conversionTrust: conversionScore,
    seoFoundations: seoScore,
    creativityDifferentiation: creativityScore
  };
  
  const averageScore = Object.values(scores).reduce((a, b) => a + b, 0) / 6;
  
  // Generate detailed feedback
  const categoryDetails = generateCategoryDetails(scores, websiteInfo, bodyText, wordCount);
  
  // Determine verdict
  const finalVerdict = determineVerdict(averageScore, scores);
  
  return {
    url,
    timestamp: new Date().toISOString(),
    overallSummary: generateOverallSummary(scores, averageScore, finalVerdict),
    categoryScores: scores,
    categoryDetails,
    finalVerdict,
    averageScore
  };
}

function scoreVisualDesign(info: any, _$: cheerio.CheerioAPI, html: string): number {
  let score = 5; // Start at OK
  
  // Check for cohesive color scheme
  if (info.colorScheme.length >= 2) {
    score += 1;
  }
  
  // Check for custom images (not just stock)
  const images = _$('img');
  const hasCustomImages = images.length > 0 && !html.includes('unsplash.com') && !html.includes('pexels.com');
  if (hasCustomImages) {
    score += 0.5;
  }
  
  // Check for professional layout (no confetti, no playful elements)
  const hasConfetti = /confetti|dots|playful|fun|party/i.test(html);
  if (!hasConfetti) {
    score += 0.5;
  }
  
  // Check for consistent spacing (CSS grid/flexbox)
  if (html.includes('grid') || html.includes('flex') || html.includes('display:')) {
    score += 0.5;
  }
  
  // World-class sites have strong visual identity
  if (info.colorScheme.length >= 3 && hasCustomImages && !hasConfetti) {
    score += 1;
  }
  
  return Math.min(10, Math.max(0, score));
}

function scoreUXStructure(info: any, _$: cheerio.CheerioAPI, _html: string): number {
  let score = 5; // Start at OK
  
  // Navigation present
  if (info.hasNavigation) {
    score += 1;
  }
  
  // Proper heading hierarchy
  if (info.h1Count === 1 && info.h2Count >= 3) {
    score += 1;
  }
  
  // Mobile responsive
  if (html.includes('viewport') || html.includes('responsive') || html.includes('mobile')) {
    score += 0.5;
  }
  
  // Clear user journeys (multiple CTAs)
  if (info.ctaCount >= 3) {
    score += 0.5;
  }
  
  // Internal linking
  if (info.linkCount >= 10) {
    score += 0.5;
  }
  
  // World-class: excellent navigation + structure
  if (info.hasNavigation && info.h1Count === 1 && info.h2Count >= 5 && info.ctaCount >= 5) {
    score += 1;
  }
  
  return Math.min(10, Math.max(0, score));
}

function scoreContent(_info: any, bodyText: string, wordCount: number): number {
  let score = 5; // Start at OK
  
  // Check for generic filler
  const genericPatterns = [
    /we deliver exceptional quality/i,
    /quality, integrity, and customer satisfaction/i,
    /we are the best/i,
    /we provide excellent service/i,
    /we deliver outstanding results/i
  ];
  
  const hasGenericFiller = genericPatterns.some(pattern => pattern.test(bodyText));
  if (hasGenericFiller) {
    score -= 2; // Heavy penalty for generic filler
  }
  
  // Content depth
  if (wordCount >= 500) {
    score += 1;
  }
  if (wordCount >= 1000) {
    score += 1;
  }
  
  // Location references
  if (bodyText.match(/\[CITY\]|\[REGION\]|in [A-Z][a-z]+|serving [A-Z][a-z]+/i)) {
    score += 1;
  }
  
  // Specific examples (not just generic statements)
  if (bodyText.match(/\d+ years|since \d{4}|helped [a-z]+|case study|testimonial/i)) {
    score += 1;
  }
  
  // World-class: deep, specific content
  if (wordCount >= 1500 && !hasGenericFiller && bodyText.match(/\[CITY\]|in [A-Z][a-z]+/i)) {
    score += 1;
  }
  
  return Math.min(10, Math.max(0, score));
}

function scoreConversion(info: any, hasPhone: boolean, hasEmail: boolean, hasAddress: boolean, bodyText: string): number {
  let score = 3; // Start low
  
  // Strong CTAs
  const strongCTAs = /book a consultation|schedule a call|get started|start free trial|sign up now/i.test(bodyText);
  const weakCTAs = /contact us|learn more|read more/i.test(bodyText);
  
  if (strongCTAs) {
    score += 2;
  } else if (weakCTAs) {
    score += 0.5;
  }
  
  // Multiple contact methods
  if (hasPhone) score += 1;
  if (hasEmail) score += 1;
  if (hasAddress) score += 0.5;
  if (info.formCount > 0) score += 1;
  
  // Trust elements
  if (bodyText.match(/testimonial|review|rating|certified|award|years of experience/i)) {
    score += 1;
  }
  
  // World-class: multiple strong CTAs + all contact methods
  if (strongCTAs && hasPhone && hasEmail && info.formCount > 0) {
    score += 1;
  }
  
  return Math.min(10, Math.max(0, score));
}

function scoreSEO(info: any, $: cheerio.CheerioAPI, html: string): number {
  let score = 5; // Start at OK
  
  // Title quality
  if (info.title && info.title.length >= 30 && info.title.length <= 60) {
    score += 1;
  }
  // Check for keywords in title
  if (info.title && !/^(home|services|about|contact)\s*\|/i.test(info.title)) {
    score += 0.5;
  }
  
  // Meta description
  if (info.metaDescription && info.metaDescription.length >= 120 && info.metaDescription.length <= 165) {
    score += 1;
  }
  
  // Proper H1
  if (info.h1Count === 1 && info.h1Text.length > 0) {
    score += 1;
  }
  
  // Schema markup
  if (info.hasSchema) {
    score += 1;
  }
  
  // Descriptive headings (not generic)
  const genericHeadings = /^(our services|what we offer|our story|our values|about us)$/i;
  if (!genericHeadings.test(info.h1Text)) {
    score += 0.5;
  }
  
  // World-class: keyword-rich, proper structure
  if (info.title && info.title.length >= 40 && info.hasSchema && info.h1Count === 1) {
    score += 0.5;
  }
  
  return Math.min(10, Math.max(0, score));
}

function scoreCreativity(info: any, $: cheerio.CheerioAPI, html: string, bodyText: string): number {
  let score = 5; // Start at OK
  
  // Unique visual elements
  if (info.colorScheme.length >= 3) {
    score += 0.5;
  }
  
  // Custom images
  const hasCustomImages = !html.includes('unsplash.com') && !html.includes('pexels.com');
  if (hasCustomImages) {
    score += 0.5;
  }
  
  // Brand story or narrative
  if (bodyText.match(/story|mission|vision|journey|founded|since/i)) {
    score += 0.5;
  }
  
  // Memorable tagline
  if (bodyText.match(/tagline|slogan|motto/i) || $('meta[property="og:description"]').length > 0) {
    score += 0.5;
  }
  
  // Not generic template
  const isGeneric = /confetti|dots|playful|template|demo/i.test(html);
  if (!isGeneric) {
    score += 0.5;
  }
  
  // World-class: unique identity + memorable elements
  if (info.colorScheme.length >= 3 && hasCustomImages && bodyText.match(/story|mission/i) && !isGeneric) {
    score += 1;
  }
  
  return Math.min(10, Math.max(0, score));
}

function generateCategoryDetails(scores: any, info: any, bodyText: string, wordCount: number): any {
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
      strengths: generateContentStrengths(scores.contentPositioning, bodyText, wordCount),
      improvements: generateContentImprovements(scores.contentPositioning, bodyText, wordCount)
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

function generateVisualStrengths(score: number, info: any): string[] {
  const strengths: string[] = [];
  if (score >= 7) {
    if (info.colorScheme.length >= 2) strengths.push('Cohesive color palette');
    if (info.imageCount > 0) strengths.push('Good use of imagery');
  }
  if (score >= 8) {
    strengths.push('Professional visual design');
    strengths.push('Strong brand identity');
  }
  return strengths.length > 0 ? strengths : ['Basic styling present'];
}

function generateVisualImprovements(score: number, info: any): string[] {
  const improvements: string[] = [];
  if (score < 7.5) {
    if (info.colorScheme.length < 2) improvements.push('Develop cohesive color palette');
    if (info.imageCount === 0) improvements.push('Add custom, relevant images');
    improvements.push('Strengthen visual brand identity');
  }
  return improvements;
}

function generateUXStrengths(score: number, info: any): string[] {
  const strengths: string[] = [];
  if (info.hasNavigation) strengths.push('Clear navigation structure');
  if (info.h1Count === 1) strengths.push('Proper heading hierarchy');
  if (score >= 7) {
    strengths.push('Good user journey structure');
  }
  return strengths.length > 0 ? strengths : ['Basic structure present'];
}

function generateUXImprovements(score: number, info: any): string[] {
  const improvements: string[] = [];
  if (score < 7.5) {
    if (info.h1Count !== 1) improvements.push('Ensure exactly one H1 per page');
    if (info.ctaCount < 3) improvements.push('Add more prominent CTAs throughout');
    improvements.push('Enhance user journeys for different audience types');
  }
  return improvements;
}

function generateContentStrengths(score: number, bodyText: string, wordCount: number): string[] {
  const strengths: string[] = [];
  if (wordCount >= 500) strengths.push('Adequate content depth');
  if (bodyText.match(/\[CITY\]|in [A-Z][a-z]+/i)) strengths.push('Location-specific content');
  if (score >= 7) {
    strengths.push('Specific, detailed content');
  }
  return strengths.length > 0 ? strengths : ['Content present'];
}

function generateContentImprovements(score: number, bodyText: string, wordCount: number): string[] {
  const improvements: string[] = [];
  if (score < 7.5) {
    if (wordCount < 500) improvements.push('Expand content depth (aim for 1000+ words)');
    if (!bodyText.match(/\[CITY\]|in [A-Z][a-z]+/i)) improvements.push('Add location references');
    if (/we deliver exceptional quality/i.test(bodyText)) improvements.push('Replace generic filler with specific details');
    improvements.push('Add concrete examples and use cases');
  }
  return improvements;
}

function generateConversionStrengths(score: number, info: any, bodyText: string): string[] {
  const strengths: string[] = [];
  if (/book a consultation|schedule a call/i.test(bodyText)) strengths.push('Strong, action-oriented CTAs');
  if (info.formCount > 0) strengths.push('Contact form present');
  if (score >= 7) {
    strengths.push('Multiple conversion points');
  }
  return strengths.length > 0 ? strengths : ['Basic contact options'];
}

function generateConversionImprovements(score: number, info: any, bodyText: string): string[] {
  const improvements: string[] = [];
  if (score < 7.5) {
    if (!/book a consultation|schedule a call/i.test(bodyText)) improvements.push('Use strong CTAs like "Book a Consultation" instead of "Contact Us"');
    if (info.formCount === 0) improvements.push('Add contact form');
    improvements.push('Add phone number, email, and address');
    improvements.push('Include trust elements (testimonials, certifications)');
  }
  return improvements;
}

function generateSEOStrengths(score: number, info: any): string[] {
  const strengths: string[] = [];
  if (info.title && info.title.length >= 30) strengths.push('Proper title length');
  if (info.h1Count === 1) strengths.push('One H1 per page');
  if (info.hasSchema) strengths.push('Schema markup present');
  if (score >= 7) {
    strengths.push('Good SEO foundation');
  }
  return strengths.length > 0 ? strengths : ['Basic SEO elements'];
}

function generateSEOImprovements(score: number, info: any): string[] {
  const improvements: string[] = [];
  if (score < 7.5) {
    if (/^(home|services|about|contact)\s*\|/i.test(info.title)) improvements.push('Use keyword-rich titles (include location/service keywords)');
    if (info.h1Count !== 1) improvements.push('Ensure exactly one H1 with primary keyword');
    if (!info.hasSchema) improvements.push('Add schema markup (Organization, LocalBusiness)');
    improvements.push('Use descriptive headings with keywords (not "Our Services")');
  }
  return improvements;
}

function generateCreativityStrengths(score: number, info: any, bodyText: string): string[] {
  const strengths: string[] = [];
  if (info.colorScheme.length >= 2) strengths.push('Defined color scheme');
  if (bodyText.match(/story|mission/i)) strengths.push('Brand narrative present');
  if (score >= 7) {
    strengths.push('Unique brand identity');
  }
  return strengths.length > 0 ? strengths : ['Basic branding'];
}

function generateCreativityImprovements(_score: number, _info: any, bodyText: string): string[] {
  const improvements: string[] = [];
  if (score < 7.5) {
    improvements.push('Develop unique visual identity');
    if (!bodyText.match(/story|mission/i)) improvements.push('Add brand story or narrative');
    improvements.push('Create memorable tagline or value proposition');
    improvements.push('Differentiate from generic templates');
  }
  return improvements;
}

function determineVerdict(averageScore: number, scores: any): 'Poor' | 'OK' | 'Good' | 'Excellent' | 'World-Class' {
  if (averageScore < 4.0) return 'Poor';
  if (averageScore < 6.0) return 'OK';
  if (averageScore < 7.5) return 'Good';
  
  // Excellent requires average 7.5-8.4 AND no category below 7.5
  if (averageScore >= 7.5 && averageScore < 8.5) {
    const minScore = Math.min(...Object.values(scores) as number[]);
    if (minScore >= 7.5) {
      return 'Excellent';
    }
    return 'Good'; // Not excellent if any category < 7.5
  }
  
  // World-Class requires average > 8.5 AND all categories ≥ 8.5
  if (averageScore >= 8.5) {
    const minScore = Math.min(...Object.values(scores) as number[]);
    if (minScore >= 8.5) {
      return 'World-Class';
    }
    return 'Excellent';
  }
  
  return 'Good';
}

function generateOverallSummary(scores: any, averageScore: number, verdict: string): string {
  const highCategories = Object.entries(scores)
    .filter(([_, score]) => (score as number) >= 8)
    .map(([cat]) => cat.replace(/([A-Z])/g, ' $1').trim());
  
  const lowCategories = Object.entries(scores)
    .filter(([_, score]) => (score as number) < 6)
    .map(([cat]) => cat.replace(/([A-Z])/g, ' $1').trim());
  
  let summary = `This website scores ${averageScore.toFixed(1)}/10 overall, rated as "${verdict}". `;
  
  if (highCategories.length > 0) {
    summary += `Strong areas include: ${highCategories.join(', ')}. `;
  }
  
  if (lowCategories.length > 0) {
    summary += `Areas needing improvement: ${lowCategories.join(', ')}. `;
  }
  
  if (verdict !== 'Excellent' && verdict !== 'World-Class') {
    summary += `To reach "Excellent" status, all categories must score ≥ 7.5/10. `;
  }
  
  return summary;
}

