/**
 * Industry Intelligence Engine
 * Merlin 7.0 - Module 2
 * Detects industry, matches website archetype, cross-checks layout patterns
 */

import OpenAI from 'openai';
import type { ProjectConfig } from '../services/projectConfig';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface IndustryProfile {
  industry: string;
  detectedIndustry: string;
  confidence: number; // 0-1
  archetype: WebsiteArchetype;
  layoutPatterns: LayoutPattern[];
  contentStrategy: ContentStrategy;
  seoStrategy: SEOStrategy;
  imageStrategy: ImageStrategy;
}

export type WebsiteArchetype =
  | 'service-business'
  | 'e-commerce'
  | 'portfolio'
  | 'saas'
  | 'blog'
  | 'restaurant'
  | 'healthcare'
  | 'legal'
  | 'real-estate'
  | 'education'
  | 'nonprofit'
  | 'corporate';

export interface LayoutPattern {
  name: string;
  description: string;
  sections: string[];
  bestFor: string[];
  examples: string[];
}

export interface ContentStrategy {
  tone: string;
  structure: string;
  ctaStyle: string;
  trustElements: string[];
  conversionFlow: string[];
}

export interface SEOStrategy {
  primaryKeywords: string[];
  contentTypes: string[];
  localSEO: boolean;
  schemaTypes: string[];
}

export interface ImageStrategy {
  heroStyle: string;
  imageTypes: string[];
  colorScheme: string[];
  mood: string;
}

/**
 * Create OpenAI client
 */
function createOpenAIClient(): OpenAI | null {
  if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
}

/**
 * Analyze industry and generate profile
 */
export async function analyzeIndustry(
  projectConfig: ProjectConfig
): Promise<IndustryProfile> {
  const openai = createOpenAIClient();
  
  if (!openai) {
    // Fallback to rule-based
    return generateFallbackIndustryProfile(projectConfig);
  }
  
  try {
    const prompt = buildIndustryAnalysisPrompt(projectConfig);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an industry intelligence expert. Analyze businesses and determine their website archetype, layout patterns, content strategy, SEO needs, and image requirements. Return structured JSON.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more deterministic analysis
      response_format: { type: 'json_object' },
    });
    
    const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      industry: projectConfig.industry,
      detectedIndustry: analysis.detectedIndustry || projectConfig.industry,
      confidence: analysis.confidence || 0.8,
      archetype: analysis.archetype || 'service-business',
      layoutPatterns: analysis.layoutPatterns || [],
      contentStrategy: analysis.contentStrategy || generateDefaultContentStrategy(),
      seoStrategy: analysis.seoStrategy || generateDefaultSEOStrategy(),
      imageStrategy: analysis.imageStrategy || generateDefaultImageStrategy(),
    };
  } catch (error: unknown) {
    logError(error, 'Industry Engine');
    return generateFallbackIndustryProfile(projectConfig);
  }
}

/**
 * Build industry analysis prompt
 */
function buildIndustryAnalysisPrompt(projectConfig: ProjectConfig): string {
  return `Analyze this business and provide a complete industry profile:

BUSINESS:
- Name: ${projectConfig.projectName}
- Industry: ${projectConfig.industry}
- Location: ${projectConfig.location.city}, ${projectConfig.location.region}
- Services: ${projectConfig.services.map(s => s.name).join(', ')}
- Target Audience: ${projectConfig.targetAudiences.join(', ')}
- Tone: ${projectConfig.toneOfVoice}

TASK:
1. Detect the most specific industry category
2. Determine website archetype (service-business, e-commerce, portfolio, saas, blog, restaurant, healthcare, legal, real-estate, education, nonprofit, corporate)
3. Recommend layout patterns (sections, structure, flow)
4. Define content strategy (tone, structure, CTAs, trust elements)
5. Plan SEO strategy (keywords, content types, local SEO needs, schema types)
6. Design image strategy (hero style, image types, color scheme, mood)

OUTPUT JSON:
{
  "detectedIndustry": "specific industry name",
  "confidence": 0.0-1.0,
  "archetype": "website archetype",
  "layoutPatterns": [
    {
      "name": "pattern name",
      "description": "description",
      "sections": ["section1", "section2"],
      "bestFor": ["use case 1", "use case 2"],
      "examples": ["example1", "example2"]
    }
  ],
  "contentStrategy": {
    "tone": "tone description",
    "structure": "structure description",
    "ctaStyle": "CTA style",
    "trustElements": ["element1", "element2"],
    "conversionFlow": ["step1", "step2"]
  },
  "seoStrategy": {
    "primaryKeywords": ["keyword1", "keyword2"],
    "contentTypes": ["type1", "type2"],
    "localSEO": true/false,
    "schemaTypes": ["type1", "type2"]
  },
  "imageStrategy": {
    "heroStyle": "style description",
    "imageTypes": ["type1", "type2"],
    "colorScheme": ["color1", "color2"],
    "mood": "mood description"
  }
}`;
}

/**
 * Generate fallback industry profile
 */
function generateFallbackIndustryProfile(projectConfig: ProjectConfig): IndustryProfile {
  const industry = projectConfig.industry.toLowerCase();
  
  // Determine archetype from industry
  let archetype: WebsiteArchetype = 'service-business';
  if (industry.includes('shop') || industry.includes('store') || industry.includes('ecommerce')) {
    archetype = 'e-commerce';
  } else if (industry.includes('portfolio') || industry.includes('creative')) {
    archetype = 'portfolio';
  } else if (industry.includes('saas') || industry.includes('software')) {
    archetype = 'saas';
  } else if (industry.includes('restaurant') || industry.includes('food')) {
    archetype = 'restaurant';
  } else if (industry.includes('legal') || industry.includes('law')) {
    archetype = 'legal';
  } else if (industry.includes('health') || industry.includes('medical')) {
    archetype = 'healthcare';
  }
  
  return {
    industry: projectConfig.industry,
    detectedIndustry: projectConfig.industry,
    confidence: 0.7,
    archetype,
    layoutPatterns: generateDefaultLayoutPatterns(archetype),
    contentStrategy: generateDefaultContentStrategy(),
    seoStrategy: generateDefaultSEOStrategy(),
    imageStrategy: generateDefaultImageStrategy(),
  };
}

/**
 * Generate default layout patterns
 */
function generateDefaultLayoutPatterns(archetype: WebsiteArchetype): LayoutPattern[] {
  const patterns: Record<WebsiteArchetype, LayoutPattern[]> = {
    'service-business': [
      {
        name: 'Service-First',
        description: 'Hero → Services → About → Testimonials → Contact',
        sections: ['hero', 'services', 'about', 'testimonials', 'contact'],
        bestFor: ['Professional services', 'Consulting'],
        examples: ['Law firms', 'Agencies'],
      },
    ],
    'e-commerce': [
      {
        name: 'Product-Focused',
        description: 'Hero → Featured Products → Categories → Testimonials → Contact',
        sections: ['hero', 'products', 'categories', 'testimonials', 'contact'],
        bestFor: ['Online stores', 'Retail'],
        examples: ['E-commerce sites'],
      },
    ],
    'portfolio': [
      {
        name: 'Visual-Portfolio',
        description: 'Hero → Portfolio → About → Contact',
        sections: ['hero', 'portfolio', 'about', 'contact'],
        bestFor: ['Designers', 'Photographers', 'Artists'],
        examples: ['Creative portfolios'],
      },
    ],
    'saas': [
      {
        name: 'SaaS-Landing',
        description: 'Hero → Features → Benefits → Pricing → Testimonials → CTA',
        sections: ['hero', 'features', 'benefits', 'pricing', 'testimonials', 'cta'],
        bestFor: ['Software products', 'SaaS companies'],
        examples: ['SaaS landing pages'],
      },
    ],
    'blog': [
      {
        name: 'Content-First',
        description: 'Hero → Featured Posts → Categories → About → Contact',
        sections: ['hero', 'posts', 'categories', 'about', 'contact'],
        bestFor: ['Blogs', 'Content creators'],
        examples: ['Blog sites'],
      },
    ],
    'restaurant': [
      {
        name: 'Restaurant-Showcase',
        description: 'Hero → Menu → About → Gallery → Reservations',
        sections: ['hero', 'menu', 'about', 'gallery', 'reservations'],
        bestFor: ['Restaurants', 'Cafes'],
        examples: ['Restaurant websites'],
      },
    ],
    'healthcare': [
      {
        name: 'Healthcare-Trust',
        description: 'Hero → Services → About → Testimonials → Contact',
        sections: ['hero', 'services', 'about', 'testimonials', 'contact'],
        bestFor: ['Medical practices', 'Clinics'],
        examples: ['Healthcare sites'],
      },
    ],
    'legal': [
      {
        name: 'Legal-Professional',
        description: 'Hero → Practice Areas → About → Testimonials → Contact',
        sections: ['hero', 'services', 'about', 'testimonials', 'contact'],
        bestFor: ['Law firms', 'Legal services'],
        examples: ['Legal websites'],
      },
    ],
    'real-estate': [
      {
        name: 'Real-Estate-Listings',
        description: 'Hero → Featured Properties → About → Contact',
        sections: ['hero', 'properties', 'about', 'contact'],
        bestFor: ['Real estate', 'Property management'],
        examples: ['Real estate sites'],
      },
    ],
    'education': [
      {
        name: 'Education-Informative',
        description: 'Hero → Programs → About → Testimonials → Contact',
        sections: ['hero', 'programs', 'about', 'testimonials', 'contact'],
        bestFor: ['Schools', 'Training'],
        examples: ['Education sites'],
      },
    ],
    'nonprofit': [
      {
        name: 'Nonprofit-Mission',
        description: 'Hero → Mission → Programs → Donate → Contact',
        sections: ['hero', 'mission', 'programs', 'donate', 'contact'],
        bestFor: ['Nonprofits', 'Charities'],
        examples: ['Nonprofit sites'],
      },
    ],
    'corporate': [
      {
        name: 'Corporate-Professional',
        description: 'Hero → Services → About → Careers → Contact',
        sections: ['hero', 'services', 'about', 'careers', 'contact'],
        bestFor: ['Corporations', 'Enterprises'],
        examples: ['Corporate sites'],
      },
    ],
  };
  
  return patterns[archetype] || patterns['service-business'];
}

/**
 * Generate default content strategy
 */
function generateDefaultContentStrategy(): ContentStrategy {
  return {
    tone: 'professional',
    structure: 'clear hierarchy',
    ctaStyle: 'prominent buttons',
    trustElements: ['testimonials', 'credentials', 'case studies'],
    conversionFlow: ['awareness', 'interest', 'decision', 'action'],
  };
}

/**
 * Generate default SEO strategy
 */
function generateDefaultSEOStrategy(): SEOStrategy {
  return {
    primaryKeywords: [],
    contentTypes: ['service pages', 'about page'],
    localSEO: true,
    schemaTypes: ['LocalBusiness', 'Organization'],
  };
}

/**
 * Generate default image strategy
 */
function generateDefaultImageStrategy(): ImageStrategy {
  return {
    heroStyle: 'professional',
    imageTypes: ['hero', 'service'],
    colorScheme: [],
    mood: 'professional',
  };
}

