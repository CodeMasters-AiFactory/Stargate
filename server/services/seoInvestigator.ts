/**
 * SEO Investigator - CRITICAL FEATURE
 * Deep SEO research before website generation
 * 
 * This is what makes content RANK, not just exist
 */

import { generate } from './multiModelAIOrchestrator';

export interface KeywordResearch {
  primaryKeyword: string;
  secondaryKeywords: string[];
  longTailKeywords: string[];
  questions: string[]; // "People also ask" style
  relatedTopics: string[];
  estimatedDifficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
  estimatedSearchVolume: 'low' | 'medium' | 'high' | 'very-high';
  intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
}

export interface SEOContentPlan {
  pageTitle: string;
  metaDescription: string;
  h1: string;
  h2Structure: Array<{
    heading: string;
    subheadings: string[];
    keywordsToInclude: string[];
    contentLength: number; // words
  }>;
  contentLength: number; // total words recommended
  internalLinkingSuggestions: string[];
  externalLinkingSuggestions: string[];
  schemaMarkup: {
    type: string;
    properties: Record<string, string>;
  };
}

export interface LocalSEOData {
  businessName: string;
  city: string;
  region: string;
  country: string;
  localKeywords: string[];
  nearbyAreas: string[];
  localSchema: object;
  napConsistency: {
    name: string;
    address: string;
    phone: string;
  };
}

export interface SEOAudit {
  score: number; // 0-100
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    category: 'content' | 'technical' | 'structure' | 'links';
    issue: string;
    recommendation: string;
  }>;
  opportunities: string[];
  competitorComparison: {
    ahead: string[];
    behind: string[];
  };
}

/**
 * Research keywords for a business
 */
export async function researchKeywords(
  businessInfo: {
    name: string;
    industry: string;
    services: string[];
    location?: string;
    targetAudience: string;
  }
): Promise<KeywordResearch> {
  const prompt = `You are an expert SEO strategist. Research keywords for this business:

Business: ${businessInfo.name}
Industry: ${businessInfo.industry}
Services: ${businessInfo.services.join(', ')}
Location: ${businessInfo.location || 'National'}
Target Audience: ${businessInfo.targetAudience}

Provide comprehensive keyword research. Think like someone searching for this business.

Respond with ONLY valid JSON:
{
  "primaryKeyword": "Main keyword to target (high intent)",
  "secondaryKeywords": ["5-7 secondary keywords to weave in"],
  "longTailKeywords": ["5-7 specific long-tail phrases"],
  "questions": ["5 questions people ask about this topic"],
  "relatedTopics": ["5 related topics to cover"],
  "estimatedDifficulty": "easy|medium|hard|very-hard",
  "estimatedSearchVolume": "low|medium|high|very-high",
  "intent": "informational|navigational|transactional|commercial"
}`;

  try {
    const result = await generate({
      task: 'seo',
      prompt,
      temperature: 0.6,
    });

    const cleanJson = result.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanJson);
  } catch {
    // Return defaults
    return {
      primaryKeyword: `${businessInfo.services[0]} ${businessInfo.location || ''}`.trim(),
      secondaryKeywords: businessInfo.services.slice(0, 5),
      longTailKeywords: businessInfo.services.map(s => `best ${s} for ${businessInfo.targetAudience}`),
      questions: [
        `What is ${businessInfo.services[0]}?`,
        `How much does ${businessInfo.services[0]} cost?`,
        `Where can I find ${businessInfo.services[0]}?`,
        `Why choose professional ${businessInfo.services[0]}?`,
        `What are the benefits of ${businessInfo.services[0]}?`,
      ],
      relatedTopics: businessInfo.services,
      estimatedDifficulty: 'medium',
      estimatedSearchVolume: 'medium',
      intent: 'commercial',
    };
  }
}

/**
 * Create SEO-optimized content plan
 */
export async function createSEOContentPlan(
  keywords: KeywordResearch,
  businessInfo: {
    name: string;
    industry: string;
    uniqueValue: string;
  }
): Promise<SEOContentPlan> {
  const prompt = `Create an SEO-optimized content structure for a homepage.

Business: ${businessInfo.name}
Industry: ${businessInfo.industry}
Unique Value: ${businessInfo.uniqueValue}

Primary Keyword: ${keywords.primaryKeyword}
Secondary Keywords: ${keywords.secondaryKeywords.join(', ')}
Questions to Answer: ${keywords.questions.join('; ')}

Create a content structure that will RANK. Include keyword density naturally.

Respond with ONLY valid JSON:
{
  "pageTitle": "SEO-optimized title (50-60 chars, keyword near start)",
  "metaDescription": "Compelling description (150-160 chars, includes keyword and CTA)",
  "h1": "Main headline with primary keyword",
  "h2Structure": [
    {
      "heading": "H2 with secondary keyword",
      "subheadings": ["H3s under this section"],
      "keywordsToInclude": ["keywords for this section"],
      "contentLength": 200
    }
  ],
  "contentLength": 2000,
  "internalLinkingSuggestions": ["Pages to link to"],
  "externalLinkingSuggestions": ["Authority sites to reference"],
  "schemaMarkup": {
    "type": "LocalBusiness or Organization",
    "properties": { "name": "", "description": "" }
  }
}`;

  try {
    const result = await generate({
      task: 'seo',
      prompt,
      temperature: 0.5,
    });

    const cleanJson = result.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanJson);
  } catch {
    return {
      pageTitle: `${businessInfo.name} | ${keywords.primaryKeyword}`,
      metaDescription: `${businessInfo.uniqueValue}. Contact us today for professional ${keywords.primaryKeyword} services.`,
      h1: `${keywords.primaryKeyword} - ${businessInfo.name}`,
      h2Structure: [
        {
          heading: `Our ${keywords.primaryKeyword} Services`,
          subheadings: ['What We Offer', 'Our Process', 'Why Choose Us'],
          keywordsToInclude: keywords.secondaryKeywords.slice(0, 3),
          contentLength: 300,
        },
        {
          heading: `Why ${businessInfo.name}?`,
          subheadings: ['Our Experience', 'Our Team', 'Our Results'],
          keywordsToInclude: keywords.secondaryKeywords.slice(3, 5),
          contentLength: 250,
        },
      ],
      contentLength: 2000,
      internalLinkingSuggestions: ['About Us', 'Services', 'Contact'],
      externalLinkingSuggestions: ['Industry associations', 'News sources'],
      schemaMarkup: {
        type: 'Organization',
        properties: {
          name: businessInfo.name,
          description: businessInfo.uniqueValue,
        },
      },
    };
  }
}

/**
 * Generate local SEO data
 */
export async function generateLocalSEO(
  businessInfo: {
    name: string;
    industry: string;
    address?: string;
    city: string;
    region: string;
    country: string;
    phone?: string;
  }
): Promise<LocalSEOData> {
  const prompt = `Generate local SEO optimization for:

Business: ${businessInfo.name}
Industry: ${businessInfo.industry}
Location: ${businessInfo.city}, ${businessInfo.region}, ${businessInfo.country}

Respond with ONLY valid JSON:
{
  "localKeywords": ["5-7 local keywords like 'industry + city'"],
  "nearbyAreas": ["5 nearby areas to target"],
  "napConsistency": {
    "name": "Exact business name to use everywhere",
    "address": "Formatted address",
    "phone": "Formatted phone"
  }
}`;

  try {
    const result = await generate({
      task: 'seo',
      prompt,
      temperature: 0.5,
    });

    const cleanJson = result.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const parsed = JSON.parse(cleanJson);
    
    return {
      businessName: businessInfo.name,
      city: businessInfo.city,
      region: businessInfo.region,
      country: businessInfo.country,
      localKeywords: parsed.localKeywords,
      nearbyAreas: parsed.nearbyAreas,
      napConsistency: parsed.napConsistency,
      localSchema: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: businessInfo.name,
        address: {
          '@type': 'PostalAddress',
          addressLocality: businessInfo.city,
          addressRegion: businessInfo.region,
          addressCountry: businessInfo.country,
        },
        telephone: businessInfo.phone,
      },
    };
  } catch {
    return {
      businessName: businessInfo.name,
      city: businessInfo.city,
      region: businessInfo.region,
      country: businessInfo.country,
      localKeywords: [
        `${businessInfo.industry} ${businessInfo.city}`,
        `${businessInfo.industry} near me`,
        `best ${businessInfo.industry} ${businessInfo.city}`,
        `${businessInfo.industry} ${businessInfo.region}`,
        `local ${businessInfo.industry}`,
      ],
      nearbyAreas: [],
      napConsistency: {
        name: businessInfo.name,
        address: `${businessInfo.city}, ${businessInfo.region}`,
        phone: businessInfo.phone || '',
      },
      localSchema: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: businessInfo.name,
      },
    };
  }
}

/**
 * Audit generated content for SEO
 */
export async function auditSEO(
  content: {
    html: string;
    title: string;
    metaDescription: string;
    targetKeyword: string;
  }
): Promise<SEOAudit> {
  const issues: SEOAudit['issues'] = [];
  let score = 100;
  
  // Check title
  if (!content.title) {
    issues.push({
      severity: 'critical',
      category: 'content',
      issue: 'Missing page title',
      recommendation: 'Add a title tag with primary keyword',
    });
    score -= 15;
  } else if (content.title.length < 30 || content.title.length > 60) {
    issues.push({
      severity: 'warning',
      category: 'content',
      issue: `Title length is ${content.title.length} chars (recommended: 50-60)`,
      recommendation: 'Adjust title to optimal length',
    });
    score -= 5;
  }
  
  if (content.title && !content.title.toLowerCase().includes(content.targetKeyword.toLowerCase())) {
    issues.push({
      severity: 'warning',
      category: 'content',
      issue: 'Target keyword not in title',
      recommendation: 'Include primary keyword near the start of title',
    });
    score -= 10;
  }
  
  // Check meta description
  if (!content.metaDescription) {
    issues.push({
      severity: 'critical',
      category: 'content',
      issue: 'Missing meta description',
      recommendation: 'Add compelling meta description with keyword and CTA',
    });
    score -= 10;
  } else if (content.metaDescription.length < 120 || content.metaDescription.length > 160) {
    issues.push({
      severity: 'warning',
      category: 'content',
      issue: `Meta description length is ${content.metaDescription.length} chars`,
      recommendation: 'Adjust to 150-160 characters',
    });
    score -= 5;
  }
  
  // Check H1
  const h1Match = content.html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (!h1Match) {
    issues.push({
      severity: 'critical',
      category: 'structure',
      issue: 'Missing H1 tag',
      recommendation: 'Add exactly one H1 tag with primary keyword',
    });
    score -= 15;
  }
  
  // Check H2s
  const h2Matches = content.html.match(/<h2[^>]*>([^<]+)<\/h2>/gi);
  if (!h2Matches || h2Matches.length < 2) {
    issues.push({
      severity: 'warning',
      category: 'structure',
      issue: 'Not enough H2 headings',
      recommendation: 'Add more H2 sections with secondary keywords',
    });
    score -= 5;
  }
  
  // Check images for alt text
  const imgMatches = content.html.match(/<img[^>]*>/gi) || [];
  const imgsWithoutAlt = imgMatches.filter(img => !img.includes('alt='));
  if (imgsWithoutAlt.length > 0) {
    issues.push({
      severity: 'warning',
      category: 'content',
      issue: `${imgsWithoutAlt.length} images missing alt text`,
      recommendation: 'Add descriptive alt text with keywords where relevant',
    });
    score -= imgsWithoutAlt.length * 2;
  }
  
  // Check for keyword in content
  const keywordRegex = new RegExp(content.targetKeyword, 'gi');
  const keywordMatches = content.html.match(keywordRegex) || [];
  const wordCount = content.html.replace(/<[^>]+>/g, ' ').split(/\s+/).length;
  const keywordDensity = (keywordMatches.length / wordCount) * 100;
  
  if (keywordDensity < 0.5) {
    issues.push({
      severity: 'warning',
      category: 'content',
      issue: `Keyword density is ${keywordDensity.toFixed(2)}% (recommended: 1-2%)`,
      recommendation: 'Include primary keyword more naturally throughout content',
    });
    score -= 5;
  } else if (keywordDensity > 3) {
    issues.push({
      severity: 'warning',
      category: 'content',
      issue: `Keyword density is ${keywordDensity.toFixed(2)}% (may be over-optimized)`,
      recommendation: 'Reduce keyword usage to avoid appearing spammy',
    });
    score -= 5;
  }
  
  // Check content length
  if (wordCount < 300) {
    issues.push({
      severity: 'critical',
      category: 'content',
      issue: `Content is only ${wordCount} words (thin content)`,
      recommendation: 'Add more valuable content (2000+ words recommended)',
    });
    score -= 15;
  } else if (wordCount < 1000) {
    issues.push({
      severity: 'warning',
      category: 'content',
      issue: `Content is ${wordCount} words (could be longer)`,
      recommendation: 'Consider adding more comprehensive content',
    });
    score -= 5;
  }
  
  // Check for internal links
  const internalLinks = content.html.match(/<a[^>]*href=["'][^"']*["'][^>]*>/gi) || [];
  if (internalLinks.length < 3) {
    issues.push({
      severity: 'info',
      category: 'links',
      issue: 'Few internal links',
      recommendation: 'Add more internal links to relevant pages',
    });
    score -= 3;
  }
  
  // Check for schema
  const hasSchema = content.html.includes('application/ld+json') || 
                    content.html.includes('itemtype=');
  if (!hasSchema) {
    issues.push({
      severity: 'warning',
      category: 'technical',
      issue: 'No structured data (schema) found',
      recommendation: 'Add JSON-LD schema for rich search results',
    });
    score -= 5;
  }
  
  score = Math.max(0, score);
  
  return {
    score,
    issues,
    opportunities: [
      'Add FAQ section to target question keywords',
      'Include video content for engagement',
      'Add breadcrumb navigation',
      'Implement lazy loading for images',
      'Add social sharing buttons',
    ],
    competitorComparison: {
      ahead: [],
      behind: [],
    },
  };
}

/**
 * Generate complete SEO strategy for a business
 */
export async function generateSEOStrategy(
  businessInfo: {
    name: string;
    industry: string;
    services: string[];
    location?: string;
    targetAudience: string;
    uniqueValue: string;
    competitors?: string[];
  }
): Promise<{
  keywords: KeywordResearch;
  contentPlan: SEOContentPlan;
  localSEO?: LocalSEOData;
}> {
  // Research keywords
  const keywords = await researchKeywords(businessInfo);
  
  // Create content plan
  const contentPlan = await createSEOContentPlan(keywords, {
    name: businessInfo.name,
    industry: businessInfo.industry,
    uniqueValue: businessInfo.uniqueValue,
  });
  
  // Generate local SEO if location provided
  let localSEO: LocalSEOData | undefined;
  if (businessInfo.location) {
    const [city, region, country] = businessInfo.location.split(',').map(s => s.trim());
    localSEO = await generateLocalSEO({
      name: businessInfo.name,
      industry: businessInfo.industry,
      city: city || businessInfo.location,
      region: region || '',
      country: country || 'USA',
    });
  }
  
  return {
    keywords,
    contentPlan,
    localSEO,
  };
}

console.log('[SEO Investigator] 🔍 Deep SEO research ready');

