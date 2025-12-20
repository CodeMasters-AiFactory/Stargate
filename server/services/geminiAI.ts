/**
 * Gemini AI Service for Merlin Website Builder
 * 
 * Uses Google's FREE Gemini API for:
 * - Design strategy and reasoning
 * - Copywriting and content generation
 * - Section planning
 * - SEO optimization
 * - Style recommendations
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

function getGeminiModel() {
  if (!model) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[Gemini AI] No API key found. Set GOOGLE_GEMINI_API_KEY in .env');
      return null;
    }
    genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.0-flash (fast, free, latest)
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('[Gemini AI] ✅ Initialized with gemini-2.0-flash');
  }
  return model;
}

/**
 * Generate design strategy for a website
 */
export async function generateDesignStrategy(config: {
  businessName: string;
  industry: string;
  targetAudience?: string;
  goals?: string[];
  style?: string;
}): Promise<{
  colorScheme: { primary: string; secondary: string; accent: string; background: string; text: string };
  typography: { headingFont: string; bodyFont: string };
  tone: string;
  layoutStyle: string;
  designPrinciples: string[];
} | null> {
  const gemini = getGeminiModel();
  if (!gemini) return null;

  const prompt = `You are an expert web designer. Create a design strategy for:

Business: ${config.businessName}
Industry: ${config.industry}
Target Audience: ${config.targetAudience || 'General'}
Goals: ${config.goals?.join(', ') || 'Professional online presence'}
Preferred Style: ${config.style || 'Modern and professional'}

Respond in JSON format only (no markdown):
{
  "colorScheme": {
    "primary": "#hex",
    "secondary": "#hex", 
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "typography": {
    "headingFont": "Font Name",
    "bodyFont": "Font Name"
  },
  "tone": "professional/friendly/bold/elegant/playful",
  "layoutStyle": "minimal/corporate/creative/bold",
  "designPrinciples": ["principle1", "principle2", "principle3"]
}`;

  try {
    const result = await gemini.generateContent(prompt);
    const text = result.response.text();
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('[Gemini AI] Design strategy error:', error);
    return null;
  }
}

/**
 * Generate website copy/content
 */
export async function generateCopy(config: {
  businessName: string;
  industry: string;
  sectionType: string;
  tone?: string;
  keywords?: string[];
}): Promise<{
  headline: string;
  subheadline?: string;
  body: string;
  cta?: string;
} | null> {
  const gemini = getGeminiModel();
  if (!gemini) return null;

  const prompt = `Write compelling website copy for:

Business: ${config.businessName}
Industry: ${config.industry}
Section: ${config.sectionType}
Tone: ${config.tone || 'professional'}
Keywords to include: ${config.keywords?.join(', ') || 'none specified'}

Respond in JSON format only (no markdown):
{
  "headline": "Compelling headline (max 10 words)",
  "subheadline": "Supporting text (max 20 words)",
  "body": "Main content paragraph (50-100 words)",
  "cta": "Call to action button text (2-4 words)"
}`;

  try {
    const result = await gemini.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('[Gemini AI] Copy generation error:', error);
    return null;
  }
}

/**
 * Generate section plan for a website
 */
export async function generateSectionPlan(config: {
  businessName: string;
  industry: string;
  pages: string[];
  goals?: string[];
}): Promise<{
  sections: Array<{
    type: string;
    purpose: string;
    priority: number;
  }>;
} | null> {
  const gemini = getGeminiModel();
  if (!gemini) return null;

  const prompt = `Plan the sections for a ${config.industry} website:

Business: ${config.businessName}
Pages needed: ${config.pages.join(', ')}
Goals: ${config.goals?.join(', ') || 'Professional presence'}

Respond in JSON format only (no markdown):
{
  "sections": [
    {"type": "hero", "purpose": "First impression", "priority": 1},
    {"type": "section-type", "purpose": "why this section", "priority": 2}
  ]
}

Use these section types: hero, about, services, features, testimonials, team, portfolio, gallery, pricing, faq, contact, cta, stats, clients, blog-preview`;

  try {
    const result = await gemini.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('[Gemini AI] Section plan error:', error);
    return null;
  }
}

/**
 * Generate SEO metadata
 */
export async function generateSEO(config: {
  businessName: string;
  industry: string;
  pageType: string;
  keywords?: string[];
}): Promise<{
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
} | null> {
  const gemini = getGeminiModel();
  if (!gemini) return null;

  const prompt = `Generate SEO metadata for:

Business: ${config.businessName}
Industry: ${config.industry}
Page: ${config.pageType}
Target keywords: ${config.keywords?.join(', ') || 'auto-generate'}

Respond in JSON format only (no markdown):
{
  "title": "Page title (50-60 chars)",
  "description": "Meta description (150-160 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "ogTitle": "Social share title",
  "ogDescription": "Social share description"
}`;

  try {
    const result = await gemini.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('[Gemini AI] SEO generation error:', error);
    return null;
  }
}

/**
 * Check if Gemini is available
 */
export function isGeminiAvailable(): boolean {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  return !!apiKey;
}

/**
 * Test Gemini connection
 */
export async function testGeminiConnection(): Promise<boolean> {
  const gemini = getGeminiModel();
  if (!gemini) return false;

  try {
    const result = await gemini.generateContent('Say "Gemini is working!" in exactly those words.');
    const text = result.response.text();
    console.log('[Gemini AI] Test response:', text);
    return text.toLowerCase().includes('working');
  } catch (error) {
    console.error('[Gemini AI] Connection test failed:', error);
    return false;
  }
}

