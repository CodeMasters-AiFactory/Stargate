/**
 * Design Reasoner v6.0
 * TRUE AI Design Thinking - Uses LLM to reason about design decisions
 * Replaces template-based design context with real AI reasoning
 * 
 * Now supports: OpenAI, Gemini (FREE), or Anthropic Claude
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
      console.log('[Design Reasoner] ✅ Using Google Gemini (FREE)');
    }
  }
  return geminiModel;
}

export interface DesignPersonality {
  emotionalTone: 'professional' | 'friendly' | 'premium' | 'innovative' | 'trustworthy' | 'exciting' | 'playful' | 'authoritative';
  brandVoice: {
    formality: 'formal' | 'casual' | 'balanced';
    technicality: 'technical' | 'simple' | 'balanced';
    boldness: 'bold' | 'subtle' | 'balanced';
    modernity: 'modern' | 'traditional' | 'balanced';
    warmth: 'warm' | 'cool' | 'neutral';
  };
  visualIdentity: {
    styleKeywords: string[];
    aestheticDirection: string;
    visualMetaphors: string[];
  };
}

export interface DesignStrategy {
  personality: DesignPersonality;
  colorDirection: {
    primaryMood: string;
    colorKeywords: string[];
    contrastLevel: 'high' | 'medium' | 'low';
    saturationPreference: 'vibrant' | 'muted' | 'neutral';
  };
  layoutDirection: {
    structureType: 'minimal' | 'content-rich' | 'visual-first' | 'balanced';
    sectionPriority: string[];
    visualFlow: string;
  };
  sectionStrategy: {
    requiredSections: string[];
    recommendedSections: string[];
    sectionOrder: string[];
    conversionFlow: string[];
  };
  targetConversionFlow: {
    primaryGoal: 'learn' | 'book' | 'purchase' | 'signup' | 'contact' | 'explore';
    conversionSteps: string[];
    frictionPoints: string[];
    trustBuilders: string[];
  };
}

/**
 * Create OpenAI client for design reasoning
 */
function createOpenAIClient(): OpenAI | null {
  // Try Replit AI Integration keys first (preferred)
  if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  
  // Fallback to direct OpenAI key
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  
  return null;
}

/**
 * Generate complete design strategy using LLM
 * This is the TRUE AI design thinking - replaces all template-based inference
 * Priority: Gemini (FREE) → OpenAI → Fallback templates
 */
export async function generateDesignStrategy(
  projectConfig: ProjectConfig
): Promise<DesignStrategy> {
  
  // Try Gemini first (FREE!)
  const gemini = getGeminiModel();
  if (gemini) {
    try {
      console.log('[Design Reasoner] 🚀 Using Google Gemini (FREE) for AI design...');
      const prompt = buildDesignStrategyPrompt(projectConfig);
      
      const result = await gemini.generateContent(
        `You are an expert website design strategist. Analyze this business and create a comprehensive design strategy.

${prompt}

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks.`
      );
      
      const text = result.response.text();
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const strategy = parseDesignStrategy(parsed, projectConfig);
        console.log('[Design Reasoner] ✅ Gemini design strategy generated successfully!');
        return strategy;
      }
    } catch (error) {
      console.warn('[Design Reasoner] Gemini error, trying OpenAI...', error);
    }
  }
  
  // Try OpenAI as fallback
  const openai = createOpenAIClient();
  if (openai) {
    try {
      console.log('[Design Reasoner] Using OpenAI for AI design...');
      
      const prompt = buildDesignStrategyPrompt(projectConfig);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert website design strategist. You analyze businesses and create comprehensive design strategies that consider brand personality, visual identity, user psychology, and conversion optimization. You think deeply about how design choices affect user perception and behavior.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      
      if (content) {
        const strategy = parseDesignStrategy(JSON.parse(content), projectConfig);
        console.log('[Design Reasoner] ✅ OpenAI design strategy generated successfully');
        return strategy;
      }
    } catch (error: unknown) {
      logError(error, 'Design Reasoner OpenAI');
    }
  }
  
  // Final fallback to templates
  console.warn('[Design Reasoner] No AI available, using template-based design');
  console.warn('[Design Reasoner] 💡 TIP: Add GOOGLE_GEMINI_API_KEY to .env for FREE AI design!');
  return generateFallbackStrategy(projectConfig);
}

/**
 * Build comprehensive prompt for design strategy generation
 */
function buildDesignStrategyPrompt(projectConfig: ProjectConfig): string {
  const location = projectConfig.location?.city 
    ? `${projectConfig.location.city}${projectConfig.location.region ? `, ${projectConfig.location.region}` : ''}${projectConfig.location.country ? `, ${projectConfig.location.country}` : ''}`
    : '';
  
  const services = projectConfig.services?.map(s => `${s.name}${s.shortDescription ? ` - ${s.shortDescription}` : ''}`).join(', ') || 'services';
  const audience = projectConfig.targetAudiences?.join(', ') || 'clients';
  const tone = projectConfig.toneOfVoice || 'professional';
  
  return `Analyze this business and create a comprehensive website design strategy.

BUSINESS CONTEXT:
- Name: ${projectConfig.projectName}
- Industry: ${projectConfig.industry}
- Location: ${location || 'Not specified'}
- Services: ${services}
- Target Audience: ${audience}
- Tone of Voice: ${tone}
${projectConfig.specialNotes ? `- Special Notes: ${projectConfig.specialNotes}` : ''}

YOUR TASK:
Create a complete design strategy that answers:
1. What should this website FEEL like? (personality, tone, brand voice)
2. What visual identity should it have? (style keywords, aesthetic direction, visual metaphors)
3. What color direction fits this brand? (mood, keywords, contrast, saturation)
4. What layout structure best serves the business goals? (structure type, section priority, visual flow)
5. What sections are needed and in what order? (required, recommended, order, conversion flow)
6. What is the target conversion flow? (primary goal, steps, friction points, trust builders)

OUTPUT FORMAT (JSON):
{
  "personality": {
    "emotionalTone": "professional|friendly|premium|innovative|trustworthy|exciting|playful|authoritative",
    "brandVoice": {
      "formality": "formal|casual|balanced",
      "technicality": "technical|simple|balanced",
      "boldness": "bold|subtle|balanced",
      "modernity": "modern|traditional|balanced",
      "warmth": "warm|cool|neutral"
    },
    "visualIdentity": {
      "styleKeywords": ["keyword1", "keyword2", "keyword3"],
      "aestheticDirection": "A detailed description of the visual aesthetic",
      "visualMetaphors": ["metaphor1", "metaphor2"]
    }
  },
  "colorDirection": {
    "primaryMood": "Description of the color mood (e.g., 'calm and trustworthy', 'energetic and modern')",
    "colorKeywords": ["color1", "color2", "color3"],
    "contrastLevel": "high|medium|low",
    "saturationPreference": "vibrant|muted|neutral"
  },
  "layoutDirection": {
    "structureType": "minimal|content-rich|visual-first|balanced",
    "sectionPriority": ["section1", "section2", "section3"],
    "visualFlow": "Description of how the page should flow visually"
  },
  "sectionStrategy": {
    "requiredSections": ["hero", "section2", "section3"],
    "recommendedSections": ["section4", "section5"],
    "sectionOrder": ["hero", "section2", "section3", "section4", "section5"],
    "conversionFlow": ["step1", "step2", "step3"]
  },
  "targetConversionFlow": {
    "primaryGoal": "learn|book|purchase|signup|contact|explore",
    "conversionSteps": ["step1", "step2", "step3"],
    "frictionPoints": ["friction1", "friction2"],
    "trustBuilders": ["trust1", "trust2", "trust3"]
  }
}

Be specific and thoughtful. Consider:
- Industry best practices
- Target audience psychology
- Brand differentiation
- Conversion optimization
- Visual hierarchy
- User journey`;
}

/**
 * Parse LLM response into DesignStrategy object
 */
function parseDesignStrategy(llmResponse: any, projectConfig: ProjectConfig): DesignStrategy {
  // Validate and extract personality
  const personality: DesignPersonality = {
    emotionalTone: llmResponse.personality?.emotionalTone || 'professional',
    brandVoice: {
      formality: llmResponse.personality?.brandVoice?.formality || 'balanced',
      technicality: llmResponse.personality?.brandVoice?.technicality || 'balanced',
      boldness: llmResponse.personality?.brandVoice?.boldness || 'balanced',
      modernity: llmResponse.personality?.brandVoice?.modernity || 'balanced',
      warmth: llmResponse.personality?.brandVoice?.warmth || 'neutral'
    },
    visualIdentity: {
      styleKeywords: llmResponse.personality?.visualIdentity?.styleKeywords || ['professional', 'clean'],
      aestheticDirection: llmResponse.personality?.visualIdentity?.aestheticDirection || 'Modern and professional',
      visualMetaphors: llmResponse.personality?.visualIdentity?.visualMetaphors || []
    }
  };

  // Validate and extract color direction
  const colorDirection = {
    primaryMood: llmResponse.colorDirection?.primaryMood || 'Professional and trustworthy',
    colorKeywords: llmResponse.colorDirection?.colorKeywords || ['blue', 'gray', 'white'],
    contrastLevel: llmResponse.colorDirection?.contrastLevel || 'medium',
    saturationPreference: llmResponse.colorDirection?.saturationPreference || 'neutral'
  };

  // Validate and extract layout direction
  const layoutDirection = {
    structureType: llmResponse.layoutDirection?.structureType || 'balanced',
    sectionPriority: llmResponse.layoutDirection?.sectionPriority || ['hero', 'services', 'about'],
    visualFlow: llmResponse.layoutDirection?.visualFlow || 'Top to bottom with clear hierarchy'
  };

  // Validate and extract section strategy
  const sectionStrategy = {
    requiredSections: llmResponse.sectionStrategy?.requiredSections || ['hero', 'services', 'contact'],
    recommendedSections: llmResponse.sectionStrategy?.recommendedSections || ['testimonials', 'about'],
    sectionOrder: llmResponse.sectionStrategy?.sectionOrder || ['hero', 'services', 'testimonials', 'about', 'contact'],
    conversionFlow: llmResponse.sectionStrategy?.conversionFlow || ['awareness', 'interest', 'action']
  };

  // Validate and extract conversion flow
  const targetConversionFlow = {
    primaryGoal: llmResponse.targetConversionFlow?.primaryGoal || 'contact',
    conversionSteps: llmResponse.targetConversionFlow?.conversionSteps || ['visit', 'learn', 'contact'],
    frictionPoints: llmResponse.targetConversionFlow?.frictionPoints || ['uncertainty', 'trust'],
    trustBuilders: llmResponse.targetConversionFlow?.trustBuilders || ['testimonials', 'credentials', 'experience']
  };

  return {
    personality,
    colorDirection,
    layoutDirection,
    sectionStrategy,
    targetConversionFlow
  };
}

/**
 * Fallback strategy when LLM is unavailable
 * Uses simplified template-based approach
 */
function generateFallbackStrategy(projectConfig: ProjectConfig): DesignStrategy {
  console.warn('[Design Reasoner] Using fallback template-based strategy');
  
  return {
    personality: {
      emotionalTone: projectConfig.toneOfVoice?.toLowerCase().includes('premium') ? 'premium' :
                     projectConfig.toneOfVoice?.toLowerCase().includes('friendly') ? 'friendly' :
                     projectConfig.toneOfVoice?.toLowerCase().includes('innovative') ? 'innovative' : 'professional',
      brandVoice: {
        formality: projectConfig.toneOfVoice?.toLowerCase().includes('formal') ? 'formal' :
                   projectConfig.toneOfVoice?.toLowerCase().includes('casual') ? 'casual' : 'balanced',
        technicality: 'balanced',
        boldness: 'balanced',
        modernity: 'modern',
        warmth: 'neutral'
      },
      visualIdentity: {
        styleKeywords: ['professional', 'clean', 'modern'],
        aestheticDirection: 'Modern and professional',
        visualMetaphors: []
      }
    },
    colorDirection: {
      primaryMood: 'Professional and trustworthy',
      colorKeywords: ['blue', 'gray', 'white'],
      contrastLevel: 'medium',
      saturationPreference: 'neutral'
    },
    layoutDirection: {
      structureType: 'balanced',
      sectionPriority: ['hero', 'services', 'about'],
      visualFlow: 'Top to bottom with clear hierarchy'
    },
    sectionStrategy: {
      requiredSections: ['hero', 'services', 'contact'],
      recommendedSections: ['testimonials', 'about'],
      sectionOrder: ['hero', 'services', 'testimonials', 'about', 'contact'],
      conversionFlow: ['awareness', 'interest', 'action']
    },
    targetConversionFlow: {
      primaryGoal: 'contact',
      conversionSteps: ['visit', 'learn', 'contact'],
      frictionPoints: ['uncertainty', 'trust'],
      trustBuilders: ['testimonials', 'credentials', 'experience']
    }
  };
}

