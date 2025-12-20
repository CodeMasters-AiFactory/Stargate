/**
 * Merlin v6.7 - AI SEO Engine
 * Generates comprehensive SEO metadata using GPT-4o
 * Includes page title, meta description, keywords, OG tags, Schema.org JSON-LD, and URL slugs
 */

import OpenAI from 'openai';
import type { DesignContext } from '../generator/designThinking';
import type { LayoutPlan } from './layoutPlannerLLM';
import type { SectionCopy } from './copywriterLLM';
import type { PlannedImage } from './imagePlannerLLM';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface SEOResult {
  title: string;              // 60-65 characters
  description: string;        // 150-160 characters
  keywords: string[];         // Industry + section topics
  ogTitle: string;           // Open Graph title
  ogDescription: string;     // Open Graph description
  ogImage?: string;          // Hero image URL from v6.5
  schemaLD?: any;            // Schema.org JSON-LD
  slug: string;              // Clean, lowercase, hyphen-separated
  seoScore?: number;         // Estimated SEO score (0-100)
  readabilityHints?: string[]; // Readability optimization hints
}

function createOpenAIClient(): OpenAI | null {
  if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
}

/**
 * Determine Schema.org type based on industry
 */
function determineSchemaType(industry: string, primaryGoal?: string): string {
  const industryLower = industry.toLowerCase();
  
  if (industryLower.includes('saas') || industryLower.includes('software') || industryLower.includes('app') || industryLower.includes('platform')) {
    return 'SoftwareApplication';
  }
  if (industryLower.includes('nonprofit') || industryLower.includes('ngo') || industryLower.includes('foundation') || industryLower.includes('institute') || industryLower.includes('research')) {
    return 'Organization';
  }
  if (industryLower.includes('law') || industryLower.includes('legal') || industryLower.includes('attorney') || industryLower.includes('lawyer')) {
    return 'LegalService';
  }
  if (industryLower.includes('restaurant') || industryLower.includes('cafe') || industryLower.includes('food')) {
    return 'Restaurant';
  }
  if (industryLower.includes('medical') || industryLower.includes('health') || industryLower.includes('clinic') || industryLower.includes('doctor')) {
    return 'MedicalBusiness';
  }
  if (industryLower.includes('real estate') || industryLower.includes('realtor') || industryLower.includes('property')) {
    return 'RealEstateAgent';
  }
  if (industryLower.includes('education') || industryLower.includes('school') || industryLower.includes('university')) {
    return 'EducationalOrganization';
  }
  
  // Default to LocalBusiness for most businesses
  return 'LocalBusiness';
}

/**
 * Build SEO generation prompt
 */
function buildSEOPrompt(
  designContext: DesignContext,
  sectionPlan: LayoutPlan,
  sectionCopies: SectionCopy[],
  imagePlans: PlannedImage[],
  projectName: string
): string {
  const industry = designContext.industry || 'business';
  const tone = designContext.emotionalTone || 'professional';
  const primaryGoal = designContext.primaryGoals?.[0] || 'engagement';
  
  // Extract hero copy
  const heroCopy = sectionCopies.find(c => c.sectionKey?.includes('hero')) || sectionCopies[0];
  const heroHeadline = heroCopy?.headline || `${projectName} - ${industry}`;
  const heroParagraph = heroCopy?.paragraph || '';
  
  // Extract features/services copy
  const featuresCopy = sectionCopies.find(c => c.sectionKey?.includes('feature') || c.sectionKey?.includes('service'));
  const featuresBullets = featuresCopy?.bullets || [];
  
  // Extract hero image
  const heroImage = imagePlans.find(img => img.purpose === 'hero');
  const heroImageUrl = heroImage ? 'Hero image available' : '';
  
  // Determine schema type
  const schemaType = determineSchemaType(industry, primaryGoal);
  
  return `You are an expert SEO specialist. Generate comprehensive SEO metadata for a ${industry} website.

PROJECT CONTEXT:
- Project Name: ${projectName}
- Industry: ${industry}
- Emotional Tone: ${tone}
- Primary Goal: ${primaryGoal}
- Target Audience: ${designContext.audience?.demographics?.join(', ') || 'general audience'}

CONTENT CONTEXT:
- Hero Headline: ${heroHeadline}
- Hero Description: ${heroParagraph}
- Main Features/Services: ${featuresBullets.join(', ')}
- Hero Image: ${heroImageUrl}

SCHEMA TYPE: ${schemaType}

REQUIREMENTS:

1. TITLE (60-65 characters):
   - Must include primary keyword (${industry})
   - Must include project name or brand
   - Must be compelling and click-worthy
   - Format: "Primary Keyword | Brand Name" or "Brand Name - Primary Keyword"

2. META DESCRIPTION (150-160 characters):
   - Must summarize value proposition
   - Must include primary keyword naturally
   - Must include call-to-action or benefit
   - Must be compelling for search results

3. KEYWORDS (5-10 keywords):
   - Primary: ${industry} related
   - Secondary: Features/services related
   - Long-tail: Industry + location/service type
   - Must match terminology from content

4. OG TITLE (shorter, brand-focused):
   - Brand name + tagline or value prop
   - 50-60 characters

5. OG DESCRIPTION (social media optimized):
   - Engaging, shareable description
   - 100-120 characters
   - Include benefit or value proposition

6. SCHEMA.ORG JSON-LD:
   - Type: ${schemaType}
   - Must include:
     * @context: "https://schema.org"
     * @type: "${schemaType}"
     * name: "${projectName}"
     * description: (from meta description)
     * url: (use slug)
   - For LocalBusiness: Add address, telephone (if available)
   - For SoftwareApplication: Add applicationCategory, operatingSystem
   - For Organization: Add foundingDate, mission
   - Must be valid JSON-LD

7. SLUG (URL-friendly):
   - Lowercase
   - Hyphen-separated
   - No special characters
   - Based on project name
   - Example: "smith-and-associates-law"

8. SEO SCORE (0-100):
   - Estimate based on:
     * Title length (optimal: 60-65)
     * Description length (optimal: 150-160)
     * Keyword relevance
     * Schema completeness
     * Content quality

9. READABILITY HINTS (optional):
   - Suggestions for improving readability
   - Format: Array of strings

Return ONLY valid JSON in this exact format:
{
  "title": "Premium Legal Services | Smith & Associates Law",
  "description": "Smith & Associates offers expert legal guidance with 30+ years of experience. Trusted attorneys specializing in complex litigation, business law, and personal injury. Book your consultation today.",
  "keywords": ["legal services", "law firm", "attorneys", "litigation", "business law", "personal injury", "legal consultation"],
  "ogTitle": "Smith & Associates Law - Trusted Legal Excellence",
  "ogDescription": "Expert legal guidance with proven results. Book your consultation today.",
  "ogImage": "${heroImageUrl || ''}",
  "schemaLD": {
    "@context": "https://schema.org",
    "@type": "${schemaType}",
    "name": "${projectName}",
    "description": "...",
    "url": "..."
  },
  "slug": "smith-and-associates-law",
  "seoScore": 85,
  "readabilityHints": ["Use shorter sentences", "Add more bullet points"]
}

Return ONLY the JSON object, no markdown, no explanation.`;
}

/**
 * Generate SEO metadata for a website
 */
export async function generateSEOForSite(
  designContext: DesignContext,
  sectionPlan: LayoutPlan,
  sectionCopies: SectionCopy[],
  imagePlans: PlannedImage[],
  projectName: string,
  layout?: any // v6.7: Layout structure to get actual image URLs
): Promise<SEOResult> {
  const openai = createOpenAIClient();

  if (!openai) {
    console.warn('[SEO Engine LLM] No OpenAI API key found, using fallback SEO');
    return generateFallbackSEO(designContext, projectName, imagePlans, layout);
  }

  try {
    console.log('[Merlin 6.7] Generating SEO metadata using GPT-4o...');
    
    const prompt = buildSEOPrompt(designContext, sectionPlan, sectionCopies, imagePlans, projectName);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert SEO specialist. Generate comprehensive SEO metadata for websites.
Return ONLY valid JSON matching the SEOResult interface. No markdown, no explanation, just JSON.
Ensure all character limits are respected (title: 60-65, description: 150-160).
Ensure Schema.org JSON-LD is valid and complete.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{.*?\})\s*```/s);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw parseError;
      }
    }

    // Validate and normalize
    const seoResult: SEOResult = {
      title: parsed.title || `${projectName} - ${designContext.industry || 'Business'}`,
      description: parsed.description || `Professional ${designContext.industry || 'business'} services.`,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [designContext.industry || 'business'],
      ogTitle: parsed.ogTitle || parsed.title || projectName,
      ogDescription: parsed.ogDescription || parsed.description || '',
      ogImage: parsed.ogImage || (layout?.sections?.find((s: any) => s.type === 'hero')?.imageUrl) || imagePlans.find(img => img.purpose === 'hero')?.alt || '',
      schemaLD: parsed.schemaLD || null,
      slug: parsed.slug || generateSlug(projectName),
      seoScore: parsed.seoScore || 75,
      readabilityHints: Array.isArray(parsed.readabilityHints) ? parsed.readabilityHints : []
    };

    // Validate title length
    if (seoResult.title.length > 65) {
      seoResult.title = seoResult.title.substring(0, 62) + '...';
    }
    if (seoResult.title.length < 30) {
      seoResult.title = `${seoResult.title} | ${projectName}`;
    }

    // Validate description length
    if (seoResult.description.length > 160) {
      seoResult.description = seoResult.description.substring(0, 157) + '...';
    }
    if (seoResult.description.length < 120) {
      seoResult.description = `${seoResult.description} Contact us today for more information.`;
    }

    // Ensure schema has required fields
    if (seoResult.schemaLD) {
      seoResult.schemaLD['@context'] = seoResult.schemaLD['@context'] || 'https://schema.org';
      seoResult.schemaLD['@type'] = seoResult.schemaLD['@type'] || determineSchemaType(designContext.industry || 'business');
      seoResult.schemaLD.name = seoResult.schemaLD.name || projectName;
      seoResult.schemaLD.description = seoResult.schemaLD.description || seoResult.description;
      seoResult.schemaLD.url = seoResult.schemaLD.url || `https://example.com/${seoResult.slug}`;
    }

    console.log(`[Merlin 6.7] Generated SEO metadata: "${seoResult.title}" (${seoResult.title.length} chars)`);
    return seoResult;
  } catch (error: unknown) {
    logError(error, 'SEO Engine LLM v6.7');
    const errorMessage = getErrorMessage(error);
    console.warn('[SEO Engine LLM v6.7] Falling back to rule-based SEO - generation will continue');
    return generateFallbackSEO(designContext, projectName, imagePlans, layout);
  }
}

/**
 * Generate fallback SEO when AI is unavailable
 */
function generateFallbackSEO(
  designContext: DesignContext,
  projectName: string,
  imagePlans: PlannedImage[],
  layout?: any
): SEOResult {
  const industry = designContext.industry || 'business';
  const schemaType = determineSchemaType(industry);
  
  // Get hero image URL from layout if available
  let heroImageUrl = '';
  if (layout?.sections) {
    const heroSection = layout.sections.find((s: any) => s.type === 'hero');
    if (heroSection?.imageUrl) {
      heroImageUrl = heroSection.imageUrl;
    }
  }
  // Fallback to image plan
  if (!heroImageUrl) {
    const heroImage = imagePlans.find(img => img.purpose === 'hero');
    heroImageUrl = heroImage?.alt || '';
  }
  
  const title = `${projectName} - ${industry.charAt(0).toUpperCase() + industry.slice(1)} Services`;
  const description = `Professional ${industry} services from ${projectName}. Contact us today for expert solutions.`;
  
  return {
    title: title.length > 65 ? title.substring(0, 62) + '...' : title,
    description: description.length > 160 ? description.substring(0, 157) + '...' : description,
    keywords: [industry, `${industry} services`, projectName.toLowerCase()],
    ogTitle: projectName,
    ogDescription: description.substring(0, 120),
    ogImage: heroImageUrl,
    schemaLD: {
      '@context': 'https://schema.org',
      '@type': schemaType,
      name: projectName,
      description: description,
      url: `https://example.com/${generateSlug(projectName)}`
    },
    slug: generateSlug(projectName),
    seoScore: 70,
    readabilityHints: []
  };
}

/**
 * Generate clean URL slug from project name
 */
function generateSlug(projectName: string): string {
  return projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

