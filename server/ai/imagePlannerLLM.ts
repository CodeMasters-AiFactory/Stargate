/**
 * Merlin v6.5 - AI Image Planner
 * Uses LLM to plan intelligent, context-aware images for each website section
 */

import OpenAI from 'openai';
import type { DesignContext } from '../generator/designThinking';
import type { StyleSystem } from '../generator/styleSystem';
import type { LayoutPlan } from './layoutPlannerLLM';
import { logError } from '../utils/errorHandler';

export interface PlannedImage {
  sectionKey: string;        // e.g. "hero-1", "about-1"
  purpose: "hero" | "supporting" | "icon" | "background";
  prompt: string;
  styleHint?: string;
  alt?: string;
}

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
 * Extract style hints from style system for prompt enhancement
 */
function extractStyleHints(styleSystem: StyleSystem): string {
  const hints: string[] = [];
  
  // Color palette analysis
  const primary = styleSystem.colors.primary?.toLowerCase() || '';
  const accent = styleSystem.colors.accent?.toLowerCase() || '';
  
  // Detect color themes
  if (primary.includes('blue') || primary.includes('cyan') || primary.includes('teal')) {
    if (primary.includes('ocean') || primary.includes('marine') || primary.includes('aqua')) {
      hints.push('cool teal/cyan lighting', 'marine atmosphere', 'oceanic aesthetic');
    } else {
      hints.push('cool blue tones', 'professional blue palette');
    }
  }
  
  if (primary.includes('green') || primary.includes('emerald') || primary.includes('forest')) {
    hints.push('natural green tones', 'organic aesthetic');
  }
  
  if (primary.includes('red') || primary.includes('crimson') || primary.includes('burgundy')) {
    hints.push('warm red tones', 'bold energy');
  }
  
  if (primary.includes('purple') || primary.includes('violet')) {
    hints.push('sophisticated purple tones', 'creative aesthetic');
  }
  
  if (primary.includes('orange') || primary.includes('amber')) {
    hints.push('warm orange tones', 'vibrant energy');
  }
  
  // Neutral/grayscale analysis
  if (primary.includes('gray') || primary.includes('grey') || primary.includes('slate')) {
    hints.push('clean, serious, polished', 'minimalist grayscale');
  }
  
  // Typography hints
  const headingFont = styleSystem.typography.heading.font?.toLowerCase() || '';
  if (headingFont.includes('serif')) {
    hints.push('classic, elegant typography');
  } else if (headingFont.includes('sans')) {
    hints.push('modern, clean typography');
  }
  
  return hints.join(', ');
}

/**
 * Build image planning prompt for GPT-4o
 */
function buildImagePlanningPrompt(
  designContext: DesignContext,
  sectionPlan: LayoutPlan,
  styleSystem: StyleSystem
): string {
  const styleHints = extractStyleHints(styleSystem);
  const industry = designContext.industry || 'general business';
  const tone = designContext.emotionalTone || 'professional';
  const primaryGoals = designContext.primaryGoals?.join(', ') || 'engagement';
  
  return `You are an expert visual designer planning images for a ${industry} website.

PROJECT CONTEXT:
- Industry: ${industry}
- Emotional Tone: ${tone}
- Primary Goals: ${primaryGoals}
- Style System: ${styleHints || 'modern, professional'}
- Primary Color: ${styleSystem.colors.primary}
- Accent Color: ${styleSystem.colors.accent}

SECTION PLAN:
${sectionPlan.sections.map(s => `- ${s.key} (${s.type}): ${s.notes || 'no notes'}`).join('\n')}

TASK:
Generate a JSON array of image plans. Each plan must include:
- sectionKey: exact match from section plan (e.g., "hero-1", "about-1")
- purpose: "hero" | "supporting" | "icon" | "background"
- prompt: detailed DALL-E 3 prompt (50-100 words) that:
  * Matches the industry and tone
  * Incorporates style hints (${styleHints})
  * Is specific and visual
  * Avoids generic stock photo descriptions
- styleHint: brief style note (optional)
- alt: descriptive alt text for accessibility

RULES:
1. Hero sections MUST have 1 "hero" purpose image with a compelling, industry-specific prompt
2. About sections should have "supporting" images (team, office, process)
3. Features/services can have "icon" or "supporting" images
4. Testimonials may have "icon" images (avatars) or none
5. Background images should be subtle and non-distracting
6. Prompts MUST reflect the actual industry (e.g., "marine biology research lab" not "generic office")
7. Prompts MUST incorporate color/style hints when provided

Return ONLY valid JSON in this exact format:
[
  {
    "sectionKey": "hero-1",
    "purpose": "hero",
    "prompt": "Detailed DALL-E prompt here...",
    "styleHint": "oceanic, cool tones",
    "alt": "Descriptive alt text"
  },
  ...
]

Return ONLY the JSON array, no markdown, no explanation.`;
}

/**
 * Plan images for all sections using AI
 */
export async function planImagesForSite(
  designContext: DesignContext,
  sectionPlan: LayoutPlan,
  finalStyleSystem: StyleSystem
): Promise<PlannedImage[]> {
  const openai = createOpenAIClient();

  if (!openai) {
    console.warn('[Image Planner LLM] No OpenAI API key found, using fallback image plan');
    return generateFallbackImagePlan(sectionPlan, designContext);
  }

  try {
    const prompt = buildImagePlanningPrompt(designContext, sectionPlan, finalStyleSystem);
    console.log('[Image Planner LLM] Generating AI image plan...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert visual designer. Generate image plans for website sections.
Return ONLY valid JSON array of PlannedImage objects. No markdown, no explanation, just JSON.`
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
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (_parseError) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\[.*?\])\s*```/s);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        // Try direct array parse
        parsed = JSON.parse(content);
      }
    }

    // Handle both { images: [...] } and direct array
    const images = Array.isArray(parsed) ? parsed : ((parsed as Record<string, unknown>).images || (parsed as Record<string, unknown>).plannedImages || []);

    // Validate structure
    const validatedImages: PlannedImage[] = (images as Array<Record<string, unknown>>)
      .filter((img: Record<string, unknown>) => img && img.sectionKey && img.prompt && img.purpose)
      .map((img: Record<string, unknown>) => ({
        sectionKey: img.sectionKey as string,
        purpose: img.purpose as "hero" | "supporting" | "icon" | "background",
        prompt: img.prompt as string,
        styleHint: img.styleHint as string | undefined,
        alt: (img.alt as string | undefined) || generateAltFromPrompt(img.prompt as string)
      }));

    console.log(`[Merlin 6.5] Generated image plan with ${validatedImages.length} items.`);
    return validatedImages;
  } catch (error: unknown) {
    logError(error, 'Image Planner LLM v6.5');
    console.warn('[Image Planner LLM v6.5] Falling back to rule-based image plan - generation will continue');
    return generateFallbackImagePlan(sectionPlan, designContext);
  }
}

/**
 * Generate alt text from prompt
 */
function generateAltFromPrompt(prompt: string): string {
  // Extract key visual elements from prompt
  const words = prompt.toLowerCase().split(/\s+/);
  const importantWords = words.filter((w: string) =>
    w.length > 4 &&
    !['the', 'and', 'with', 'from', 'that', 'this', 'image', 'photo', 'picture'].includes(w)
  ).slice(0, 5);

  return importantWords.join(' ') || 'Website image';
}

/**
 * Fallback image plan when AI is unavailable
 */
function generateFallbackImagePlan(
  sectionPlan: LayoutPlan,
  designContext: DesignContext
): PlannedImage[] {
  const industry = designContext.industry?.toLowerCase() || 'business';
  const plans: PlannedImage[] = [];

  for (const section of sectionPlan.sections) {
    if (section.type === 'hero') {
      let prompt = `Professional ${industry} hero image`;
      if (industry.includes('legal') || industry.includes('law')) {
        prompt = 'Professional law office interior with modern furniture, legal books, and serious atmosphere, clean lighting';
      } else if (industry.includes('saas') || industry.includes('software') || industry.includes('tech')) {
        prompt = 'Modern cloud dashboard UI with data visualizations, abstract tech elements, clean minimal design';
      } else if (industry.includes('marine') || industry.includes('ocean')) {
        prompt = 'Underwater marine biology research scene with coral reefs, marine life, scientific equipment, cool teal lighting';
      }
      
      plans.push({
        sectionKey: section.key,
        purpose: 'hero',
        prompt,
        alt: `${industry} hero image`
      });
    } else if (section.type === 'about') {
      plans.push({
        sectionKey: section.key,
        purpose: 'supporting',
        prompt: `Professional ${industry} team or office environment`,
        alt: `${industry} about image`
      });
    } else if (section.type === 'features' || section.type === 'services') {
      plans.push({
        sectionKey: section.key,
        purpose: 'icon',
        prompt: `Simple icon-style illustration representing ${industry} features`,
        alt: `${industry} feature icon`
      });
    }
  }

  return plans;
}

