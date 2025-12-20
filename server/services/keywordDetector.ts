/**
 * Keyword Detector Service
 * Detects SEO keywords from content template per page
 * Uses AI-powered extraction + industry-specific database
 */

import * as cheerio from 'cheerio';
import { generate } from './multiModelAIOrchestrator';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface DetectedKeywords {
  primary: string[];      // Main keywords (3-5)
  secondary: string[];   // Supporting keywords (10-20)
  topics: string[];      // Detected topics/themes
  frequency: Record<string, number>; // Keyword frequency
}

/**
 * Industry-specific keyword database
 */
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  accounting: [
    'tax preparation', 'bookkeeping', 'financial planning', 'accounting services',
    'CPA', 'tax filing', 'payroll', 'audit', 'financial consulting', 'tax advice',
    'small business accounting', 'corporate accounting', 'tax planning', 'IRS',
  ],
  legal: [
    'lawyer', 'attorney', 'legal services', 'law firm', 'litigation', 'legal advice',
    'personal injury', 'criminal defense', 'family law', 'estate planning', 'contract',
    'legal consultation', 'court representation', 'legal document',
  ],
  healthcare: [
    'medical', 'healthcare', 'doctor', 'physician', 'medical services', 'health',
    'treatment', 'clinic', 'hospital', 'patient care', 'medical consultation',
    'healthcare provider', 'medical practice', 'wellness',
  ],
  technology: [
    'software', 'technology', 'IT services', 'web development', 'software development',
    'tech solutions', 'digital transformation', 'cloud computing', 'cybersecurity',
    'technology consulting', 'software company', 'IT consulting',
  ],
  restaurant: [
    'restaurant', 'dining', 'food', 'cuisine', 'menu', 'restaurant services',
    'fine dining', 'casual dining', 'restaurant reservations', 'catering',
    'restaurant menu', 'food service', 'culinary',
  ],
  realestate: [
    'real estate', 'property', 'real estate agent', 'home buying', 'home selling',
    'real estate services', 'property management', 'real estate investment',
    'real estate listing', 'property search', 'real estate market',
  ],
  education: [
    'education', 'school', 'learning', 'educational services', 'training',
    'academic', 'education programs', 'educational institution', 'student',
    'education courses', 'learning center', 'educational resources',
  ],
};

/**
 * Extract keywords from HTML content using multiple methods
 */
export async function detectKeywords(
  pageHtml: string,
  pageName: string,
  industry: string
): Promise<DetectedKeywords> {
  try {
    const $ = cheerio.load(pageHtml);
    
    // Extract text content
    const textContent = $('body').text().toLowerCase();
    const headings = $('h1, h2, h3, h4, h5, h6').map((_, el) => $(el).text().trim()).get();
    const paragraphs = $('p').map((_, el) => $(el).text().trim()).get();
    
    // Method 1: Industry-specific keywords
    const industryKeywords = INDUSTRY_KEYWORDS[industry.toLowerCase()] || [];
    const foundIndustryKeywords: string[] = [];
    
    industryKeywords.forEach(keyword => {
      if (textContent.includes(keyword.toLowerCase())) {
        foundIndustryKeywords.push(keyword);
      }
    });

    // Method 2: Extract from headings (high priority)
    const headingKeywords: string[] = [];
    headings.forEach(heading => {
      const words = heading.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      headingKeywords.push(...words);
    });

    // Method 3: Extract from meta tags
    const metaKeywords = $('meta[name="keywords"]').attr('content') || '';
    const metaKeywordList = metaKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);

    // Method 4: AI-powered extraction
    let aiKeywords: string[] = [];
    try {
      const aiPrompt = `Extract the top 10 SEO keywords from this webpage content. Focus on industry-specific terms and main topics.

Page: ${pageName}
Industry: ${industry}
Headings: ${headings.slice(0, 5).join(', ')}
Content sample: ${paragraphs.slice(0, 3).join(' ').substring(0, 500)}

Return only a comma-separated list of keywords, no explanations.`;

      const aiResult = await generate({
        task: 'content',
        prompt: aiPrompt,
        temperature: 0.3,
        maxTokens: 200,
      });

      aiKeywords = aiResult.content
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0 && k.length < 30);
    } catch (error) {
      console.warn('[KeywordDetector] AI extraction failed, using fallback:', getErrorMessage(error));
    }

    // Combine all keywords
    const allKeywords = [
      ...foundIndustryKeywords,
      ...headingKeywords,
      ...metaKeywordList,
      ...aiKeywords,
    ];

    // Calculate frequency
    const frequency: Record<string, number> = {};
    allKeywords.forEach(keyword => {
      const count = (textContent.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      if (count > 0) {
        frequency[keyword] = count;
      }
    });

    // Sort by frequency
    const sortedKeywords = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .map(([keyword]) => keyword);

    // Primary keywords (top 5)
    const primary = sortedKeywords.slice(0, 5);

    // Secondary keywords (next 15)
    const secondary = sortedKeywords.slice(5, 20);

    // Detect topics (common themes)
    const topics: string[] = [];
    if (textContent.includes('service') || textContent.includes('services')) topics.push('services');
    if (textContent.includes('about') || textContent.includes('company')) topics.push('about');
    if (textContent.includes('contact') || textContent.includes('phone')) topics.push('contact');
    if (textContent.includes('testimonial') || textContent.includes('review')) topics.push('testimonials');
    if (textContent.includes('pricing') || textContent.includes('price')) topics.push('pricing');

    console.log(`[KeywordDetector] ✅ Detected ${primary.length} primary, ${secondary.length} secondary keywords`);

    return {
      primary,
      secondary,
      topics,
      frequency,
    };
  } catch (error) {
    logError(error, 'KeywordDetector');
    
    // Fallback: return empty keywords
    return {
      primary: [],
      secondary: [],
      topics: [],
      frequency: {},
    };
  }
}

/**
 * Add custom keywords to detected keywords
 */
export function addCustomKeywords(
  detected: DetectedKeywords,
  customKeywords: string[]
): DetectedKeywords {
  const combinedPrimary = [...new Set([...detected.primary, ...customKeywords.slice(0, 5)])];
  const combinedSecondary = [...new Set([...detected.secondary, ...customKeywords.slice(5)])];

  return {
    ...detected,
    primary: combinedPrimary,
    secondary: combinedSecondary,
  };
}

