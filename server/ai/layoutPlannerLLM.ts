/**
 * Merlin v6.1 - AI Section & Content Planner
 * Uses LLM to plan optimal website section structure
 * Priority: Gemini (FREE) → OpenAI → Fallback
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ProjectConfig } from '../services/projectConfig';
import { getErrorMessage, logError } from '../utils/errorHandler';

// Gemini client
let geminiModel: any = null;
function getGeminiModel() {
  if (!geminiModel) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
  }
  return geminiModel;
}

export interface SectionPlan {
  key: string;
  type: string;
  importance: 'high' | 'medium' | 'low';
  notes: string;
  order: number;
}

export interface LayoutPlan {
  sections: SectionPlan[];
  rationale: string;
  totalSections: number;
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
 * Generate AI-powered section plan for website
 * Priority: Gemini (FREE) → OpenAI → Fallback
 */
export async function generateSectionPlan(
  projectConfig: ProjectConfig
): Promise<LayoutPlan> {
  
  // Try Gemini first (FREE!)
  const gemini = getGeminiModel();
  if (gemini) {
    try {
      console.log('[Layout Planner LLM] 🚀 Using Google Gemini (FREE) for section planning...');
      const prompt = buildSectionPlanPrompt(projectConfig);
      
      const result = await gemini.generateContent(
        `You are an expert website architect. Plan optimal sections for a homepage.

${prompt}

Return ONLY valid JSON (no markdown):
{
  "sections": [
    {"key": "hero-1", "type": "hero", "importance": "high", "notes": "first impression", "order": 1}
  ],
  "rationale": "Why these sections",
  "totalSections": 5
}

Section types: hero, value-proposition, features, services, about, testimonials, team, pricing, faq, contact, cta, portfolio`
      );
      
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('[Layout Planner LLM] ✅ Gemini section plan generated!');
        return parsed as LayoutPlan;
      }
    } catch (error) {
      console.warn('[Layout Planner LLM] Gemini error, trying OpenAI...', error);
    }
  }
  
  // Try OpenAI as fallback
  const openai = createOpenAIClient();
  if (!openai) {
    console.warn('[Layout Planner LLM] No AI available, using fallback section plan');
    console.warn('[Layout Planner LLM] 💡 TIP: Add GOOGLE_GEMINI_API_KEY to .env for FREE AI!');
    return generateFallbackSectionPlan(projectConfig);
  }

  try {
    const prompt = buildSectionPlanPrompt(projectConfig);
    console.log('[Layout Planner LLM] Generating AI section plan with OpenAI...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert website architect. Your task is to analyze a business and generate an optimal section plan for their homepage. 
Return ONLY valid JSON in this exact format:
{
  "sections": [
    {"key": "hero-1", "type": "hero", "importance": "high", "notes": "trust + clarity", "order": 1},
    {"key": "value-1", "type": "value-proposition", "importance": "high", "notes": "unique selling points", "order": 2},
    ...
  ],
  "rationale": "Brief explanation of why these sections were chosen",
  "totalSections": 5
}

Section types you can use: hero, value-proposition, features, services, about, testimonials, case-studies, team, process, pricing, faq, contact, cta, social-proof, benefits, how-it-works, portfolio, blog-preview, newsletter-signup.

Importance levels: "high" (critical), "medium" (important), "low" (nice-to-have).

Return ONLY the JSON object, no markdown, no explanation.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('LLM returned no content for section plan');
    }

    const plan: LayoutPlan = JSON.parse(content);
    
    // Validate structure
    if (!plan.sections || !Array.isArray(plan.sections)) {
      throw new Error('Invalid section plan structure');
    }

    // Ensure all sections have required fields
    plan.sections = plan.sections.map((section, index) => ({
      key: section.key || `section-${index + 1}`,
      type: section.type || 'features',
      importance: section.importance || 'medium',
      notes: section.notes || '',
      order: section.order || index + 1
    }));

    plan.totalSections = plan.sections.length;
    plan.rationale = plan.rationale || 'AI-generated section plan based on business requirements';

    console.log(`[Layout Planner LLM] Successfully generated plan with ${plan.totalSections} sections`);
    return plan;

  } catch (error: unknown) {
    logError(error, 'Layout Planner LLM v6.1');
    const errorMessage = getErrorMessage(error);
    console.warn('[Layout Planner LLM v6.1] Falling back to rule-based section plan - generation will continue');
    return generateFallbackSectionPlan(projectConfig);
  }
}

function buildSectionPlanPrompt(projectConfig: ProjectConfig): string {
  return JSON.stringify({
    task: 'Generate an optimal homepage section plan for this business',
    business: {
      name: projectConfig.projectName,
      industry: projectConfig.industry,
      toneOfVoice: projectConfig.toneOfVoice,
      targetAudiences: projectConfig.targetAudiences,
      services: projectConfig.services?.map(s => s.name) || [],
      location: projectConfig.location,
      specialNotes: projectConfig.specialNotes
    },
    requirements: {
      primaryGoals: 'Convert visitors to customers/clients',
      mustInclude: ['hero', 'contact'],
      recommendedSections: ['value-proposition', 'services', 'testimonials'],
      optionalSections: ['about', 'faq', 'pricing', 'case-studies', 'team', 'process']
    }
  }, null, 2);
}

/**
 * Fallback section plan when LLM is unavailable
 */
function generateFallbackSectionPlan(projectConfig: ProjectConfig): LayoutPlan {
  const industry = projectConfig.industry?.toLowerCase() || '';
  const services = projectConfig.services || [];
  
  const sections: SectionPlan[] = [
    {
      key: 'hero-1',
      type: 'hero',
      importance: 'high',
      notes: 'Primary value proposition and call-to-action',
      order: 1
    },
    {
      key: 'value-1',
      type: 'value-proposition',
      importance: 'high',
      notes: 'Unique selling points and differentiators',
      order: 2
    }
  ];

  // Add services section if services exist
  if (services.length > 0) {
    sections.push({
      key: 'services-1',
      type: 'services',
      importance: 'high',
      notes: 'Core services offered',
      order: 3
    });
  }

  // Add testimonials for trust
  sections.push({
    key: 'testimonials-1',
    type: 'testimonials',
    importance: 'medium',
    notes: 'Social proof and client testimonials',
    order: sections.length + 1
  });

  // Add about section
  sections.push({
    key: 'about-1',
    type: 'about',
    importance: 'medium',
    notes: 'Company background and mission',
    order: sections.length + 1
  });

  // Add FAQ if appropriate
  if (industry.includes('service') || industry.includes('consulting')) {
    sections.push({
      key: 'faq-1',
      type: 'faq',
      importance: 'medium',
      notes: 'Common questions and answers',
      order: sections.length + 1
    });
  }

  // Always end with contact
  sections.push({
    key: 'contact-1',
    type: 'contact',
    importance: 'high',
    notes: 'Contact information and form',
    order: sections.length + 1
  });

  // Set order numbers
  sections.forEach((section, index) => {
    section.order = index + 1;
  });

  return {
    sections,
    rationale: 'Rule-based fallback section plan based on industry and services',
    totalSections: sections.length
  };
}

