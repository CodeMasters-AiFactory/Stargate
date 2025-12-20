/**
 * Copy Engine 2.0
 * Merlin 7.0 - Module 8
 * Multi-model pipeline: GPT-4o structure + Claude clarity + Template fallback
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { ProjectConfig } from '../services/projectConfig';
import type { GeneratedSection } from './layoutEngine';
import type { IndustryProfile } from './industryEngine';
import type { DesignTokens } from '../types/designTokens';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface SectionCopy {
  headline: string;
  subheadline?: string;
  description: string;
  bullets?: string[];
  cta?: {
    text: string;
    link: string;
    style: 'primary' | 'secondary' | 'outline';
  };
  seoKeywords?: string[];
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
 * Create Anthropic client
 */
function createAnthropicClient(): Anthropic | null {
  if (process.env.ANTHROPIC_API_KEY) {
    return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return null;
}

/**
 * Generate copy for a section
 */
export async function generateSectionCopy(
  section: GeneratedSection,
  projectConfig: ProjectConfig,
  industryProfile: IndustryProfile,
  designTokens: DesignTokens
): Promise<SectionCopy> {
  const openai = createOpenAIClient();
  const anthropic = createAnthropicClient();
  
  if (!openai) {
    return generateFallbackCopy(section, projectConfig, industryProfile);
  }
  
  try {
    // Step 1: GPT-4o creates structure
    const structure = await generateStructureWithGPT4o(
      section,
      projectConfig,
      industryProfile,
      openai
    );
    
    // Step 2: Claude adds clarity & tone (if available)
    let copy: SectionCopy = structure;
    if (anthropic) {
      copy = await enhanceWithClaude(structure, section, projectConfig, anthropic);
    }
    
    // Step 3: Insert SEO keywords
    copy.seoKeywords = extractKeywords(projectConfig, industryProfile);
    
    return copy;
  } catch (error: unknown) {
    logError(error, 'Copy Engine');
    return generateFallbackCopy(section, projectConfig, industryProfile);
  }
}

/**
 * Generate structure with GPT-4o
 */
async function generateStructureWithGPT4o(
  section: GeneratedSection,
  projectConfig: ProjectConfig,
  industryProfile: IndustryProfile,
  openai: OpenAI
): Promise<SectionCopy> {
  const prompt = `Generate compelling copy for a ${section.type} section:

BUSINESS:
- Name: ${projectConfig.projectName}
- Industry: ${projectConfig.industry}
- Services: ${projectConfig.services.map(s => s.name).join(', ')}
- Tone: ${projectConfig.toneOfVoice}
- Target Audience: ${projectConfig.targetAudiences.join(', ')}

SECTION:
- Type: ${section.type}
- Variant: ${section.variant.name}
- Layout: ${section.variant.layout}

TASK:
Generate:
1. Headline (compelling, conversion-focused)
2. Subheadline (supporting value proposition)
3. Description (clear, benefit-focused)
4. Bullets (3-5 key points, if applicable)
5. CTA (text, link, style)

Return JSON:
{
  "headline": "...",
  "subheadline": "...",
  "description": "...",
  "bullets": ["...", "..."],
  "cta": {"text": "...", "link": "...", "style": "primary"}
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an expert copywriter. Generate conversion-focused, industry-specific copy.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });
  
  const copy = JSON.parse(response.choices[0]?.message?.content || '{}');
  
  return {
    headline: copy.headline || `${section.type} Section`,
    subheadline: copy.subheadline,
    description: copy.description || '',
    bullets: copy.bullets || [],
    cta: copy.cta || {
      text: 'Learn More',
      link: '/contact',
      style: 'primary' as const,
    },
  };
}

/**
 * Enhance with Claude for clarity
 */
async function enhanceWithClaude(
  structure: SectionCopy,
  section: GeneratedSection,
  projectConfig: ProjectConfig,
  anthropic: Anthropic
): Promise<SectionCopy> {
  const prompt = `Improve this copy for clarity and tone:

ORIGINAL:
${JSON.stringify(structure, null, 2)}

CONTEXT:
- Industry: ${projectConfig.industry}
- Tone: ${projectConfig.toneOfVoice}
- Section Type: ${section.type}

TASK:
Enhance the copy for:
1. Clarity (remove jargon, simplify)
2. Tone consistency (match ${projectConfig.toneOfVoice})
3. Flow and readability

Return improved JSON (same structure).`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });
  
  // Validate response content exists
  if (response.content && response.content.length > 0) {
    const content = response.content[0];
    if (content.type === 'text') {
      try {
        const enhanced = JSON.parse(content.text);
        return { ...structure, ...enhanced };
      } catch {
        return structure; // Return original if parsing fails
      }
    }
  }
  
  return structure;
}

/**
 * Extract SEO keywords
 */
function extractKeywords(
  projectConfig: ProjectConfig,
  industryProfile: IndustryProfile
): string[] {
  const keywords: string[] = [];
  
  // Industry keywords
  keywords.push(projectConfig.industry);
  
  // Service keywords
  projectConfig.services.forEach(service => {
    keywords.push(service.name);
  });
  
  // Location keywords
  keywords.push(projectConfig.location.city);
  keywords.push(projectConfig.location.region);
  
  // SEO strategy keywords
  if (industryProfile.seoStrategy.primaryKeywords.length > 0) {
    keywords.push(...industryProfile.seoStrategy.primaryKeywords.slice(0, 5));
  }
  
  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Generate fallback copy
 */
function generateFallbackCopy(
  section: GeneratedSection,
  projectConfig: ProjectConfig,
  industryProfile: IndustryProfile
): SectionCopy {
  return {
    headline: `${projectConfig.projectName} - ${section.type}`,
    subheadline: `Professional ${projectConfig.industry} services`,
    description: `We provide exceptional ${projectConfig.industry} services in ${projectConfig.location.city}.`,
    bullets: projectConfig.services.slice(0, 3).map(s => s.name),
    cta: {
      text: 'Get Started',
      link: '/contact',
      style: 'primary',
    },
  };
}

