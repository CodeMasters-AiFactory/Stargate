/**
 * Merlin v6.2 - AI Style & Color Designer
 * Uses LLM to generate color palettes and typography for niche industries
 */

import OpenAI from 'openai';
import type { DesignContext } from '../generator/designThinking';
import type { ProjectConfig } from '../services/projectConfig';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface LLMStyleSystem {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  headingFont: string;
  bodyFont: string;
  styleNotes?: string;
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
 * Check if industry matches known industries (has predefined palettes)
 * v6.10: Now uses centralized constants
 */
export { matchesKnownIndustry } from '../config/constants';

/**
 * Generate AI-powered style system using LLM
 */
export async function designStyleSystemWithLLM(
  projectConfig: ProjectConfig,
  designContext: DesignContext
): Promise<LLMStyleSystem | null> {
  const openai = createOpenAIClient();

  if (!openai) {
    console.warn('[Style Designer LLM] No OpenAI API key found, cannot generate AI style');
    return null;
  }

  try {
    const prompt = buildStyleSystemPrompt(projectConfig, designContext);
    console.log('[Style Designer LLM] Generating AI style system...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert brand designer specializing in color palettes and typography. Your task is to generate a complete style system for a website based on the business context.

Return ONLY valid JSON in this exact format:
{
  "primaryColor": "#HEXCODE",
  "secondaryColor": "#HEXCODE",
  "accentColor": "#HEXCODE",
  "backgroundColor": "#HEXCODE",
  "surfaceColor": "#HEXCODE",
  "headingFont": "Font Name",
  "bodyFont": "Font Name",
  "styleNotes": "Brief explanation of color choices and typography rationale"
}

Requirements:
- All colors must be valid hex codes (e.g., "#3B82F6", "#10B981")
- Colors should reflect the industry, tone, and target audience
- Typography should be professional and web-safe (use Google Fonts)
- backgroundColor should be light (white or very light gray)
- surfaceColor should be slightly darker than background (for cards/sections)
- primaryColor should be the main brand color
- secondaryColor should complement primary
- accentColor should provide contrast for CTAs and highlights

Return ONLY the JSON object, no markdown, no explanation.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('LLM returned no content for style system');
    }

    const styleSystem: LLMStyleSystem = JSON.parse(content);
    
    // Validate hex colors
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const colors = [
      styleSystem.primaryColor,
      styleSystem.secondaryColor,
      styleSystem.accentColor,
      styleSystem.backgroundColor,
      styleSystem.surfaceColor
    ];

    for (const color of colors) {
      if (!hexPattern.test(color)) {
        throw new Error(`Invalid hex color: ${color}`);
      }
    }

    // Validate fonts (non-empty strings)
    if (!styleSystem.headingFont || !styleSystem.bodyFont) {
      throw new Error('Missing font names');
    }

    console.log('[Style Designer LLM] Successfully generated AI style system');
    return styleSystem;

  } catch (error: unknown) {
    logError(error, 'Style Designer LLM');
    return null;
  }
}

function buildStyleSystemPrompt(
  projectConfig: ProjectConfig,
  designContext: DesignContext
): string {
  return JSON.stringify({
    task: 'Generate a complete style system (colors and typography) for this business website',
    business: {
      name: projectConfig.projectName,
      industry: projectConfig.industry,
      toneOfVoice: projectConfig.toneOfVoice,
      targetAudiences: projectConfig.targetAudiences,
      location: projectConfig.location
    },
    designContext: {
      emotionalTone: designContext.emotionalTone,
      brandVoice: designContext.brandVoice,
      audience: {
        demographics: designContext.audience.demographics,
        goals: designContext.audience.goals,
        painPoints: designContext.audience.painPoints
      }
    },
    requirements: {
      colors: 'Must reflect industry, tone, and target audience. Professional and appropriate.',
      typography: 'Must be web-safe, professional, and readable. Use Google Fonts.',
      style: 'Modern, clean, conversion-focused'
    }
  }, null, 2);
}

