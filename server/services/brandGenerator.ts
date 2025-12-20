/**
 * Brand Generator Module
 * Generates cohesive brand toolkit based on project configuration
 */

import type { ProjectConfig } from './projectConfig';
import fs from 'fs';
import path from 'path';
import { getProjectDir } from './projectConfig';
import OpenAI from 'openai';

// OpenAI client factory
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

const openai = createOpenAIClient();

export interface BrandKit {
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    neutrals: {
      background: string;
      text: string;
      border: string;
    };
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    sizes: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
    };
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  };
  borderRadius: string;
  taglines: string[];
}

/**
 * Industry-specific color palettes (fallback if AI unavailable)
 */
const industryColorPalettes: Record<string, { primary: string; secondary: string; accent: string }> = {
  'Law Firm': { primary: '#1e3a8a', secondary: '#1e40af', accent: '#d97706' },
  'IT Services': { primary: '#2563eb', secondary: '#3b82f6', accent: '#10b981' },
  'Medical': { primary: '#059669', secondary: '#10b981', accent: '#3b82f6' },
  'Real Estate': { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#f59e0b' },
  'Fitness': { primary: '#dc2626', secondary: '#ef4444', accent: '#f97316' },
  'Restaurant': { primary: '#b91c1c', secondary: '#dc2626', accent: '#f59e0b' },
  'Default': { primary: '#3b82f6', secondary: '#60a5fa', accent: '#10b981' }
};

/**
 * Industry-specific typography (fallback)
 */
const industryTypography: Record<string, { heading: string; body: string }> = {
  'Law Firm': { heading: 'Inter, Roboto, sans-serif', body: 'Inter, Roboto, sans-serif' },
  'IT Services': { heading: 'Inter, system-ui, sans-serif', body: 'Inter, system-ui, sans-serif' },
  'Medical': { heading: 'Inter, system-ui, sans-serif', body: 'Inter, system-ui, sans-serif' },
  'Default': { heading: 'Inter, system-ui, sans-serif', body: 'Inter, system-ui, sans-serif' }
};

/**
 * Generate brand kit using AI or fallback
 */
export async function generateBrandKit(config: ProjectConfig): Promise<BrandKit> {
  // If user provided brand preferences, use them as base
  if (config.brandPreferences?.colorPalette) {
    return generateBrandKitFromPreferences(config);
  }
  
  // Try AI generation first
  if (openai) {
    try {
      return await generateBrandKitWithAI(config);
    } catch (error) {
      console.error('[Brand Generator] AI generation failed, using fallback:', error);
    }
  }
  
  // Fallback to industry-specific defaults
  return generateBrandKitFallback(config);
}

/**
 * Generate brand kit from user preferences
 */
function generateBrandKitFromPreferences(config: ProjectConfig): BrandKit {
  const colors = config.brandPreferences!.colorPalette!;
  const fonts = config.brandPreferences!.fontPreferences;
  
  return {
    colorPalette: {
      primary: colors.primary || '#3b82f6',
      secondary: colors.secondary || colors.primary || '#60a5fa',
      accent: colors.accent || '#10b981',
      neutrals: {
        background: '#FFFFFF',
        text: '#1F2937',
        border: '#E5E7EB'
      }
    },
    typography: {
      headingFont: fonts?.heading || 'Inter, system-ui, sans-serif',
      bodyFont: fonts?.body || 'Inter, system-ui, sans-serif',
      sizes: {
        h1: '3.5rem',
        h2: '2.5rem',
        h3: '1.75rem',
        body: '1.125rem'
      }
    },
    spacing: {
      small: '0.5rem',
      medium: '1rem',
      large: '2rem',
      xlarge: '4rem'
    },
    borderRadius: '0.5rem',
    taglines: generateTaglinesFallback(config)
  };
}

/**
 * Generate brand kit using AI
 */
async function generateBrandKitWithAI(config: ProjectConfig): Promise<BrandKit> {
  const prompt = `Generate a professional brand kit for a ${config.industry} business called "${config.projectName}".

Business Context:
- Industry: ${config.industry}
- Location: ${config.location.city}, ${config.location.region}, ${config.location.country}
- Target Audiences: ${config.targetAudiences.join(', ')}
- Tone of Voice: ${config.toneOfVoice}
- Services: ${config.services.map(s => s.name).join(', ')}

Requirements:
- Professional, industry-appropriate color palette
- Colors must have sufficient contrast for accessibility
- Typography system with clear hierarchy
- Spacing system (small, medium, large, xlarge)
- 3-5 tagline options that are SPECIFIC to this business (NOT generic like "We deliver quality")

Output JSON:
{
  "colorPalette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "neutrals": {
      "background": "#hex",
      "text": "#hex",
      "border": "#hex"
    }
  },
  "typography": {
    "headingFont": "font-family",
    "bodyFont": "font-family",
    "sizes": {
      "h1": "3.5rem",
      "h2": "2.5rem",
      "h3": "1.75rem",
      "body": "1.125rem"
    }
  },
  "spacing": {
    "small": "0.5rem",
    "medium": "1rem",
    "large": "2rem",
    "xlarge": "4rem"
  },
  "borderRadius": "0.5rem",
  "taglines": ["specific tagline 1", "specific tagline 2", "specific tagline 3"]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a professional brand designer. Generate brand kits that are specific, professional, and industry-appropriate. NEVER use generic taglines.'
      },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1000,
    temperature: 0.7
  });

  const brandKit = JSON.parse(completion.choices[0].message.content || '{}') as BrandKit;
  
  // Validate and ensure required fields
  return {
    colorPalette: brandKit.colorPalette || {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      accent: '#10b981',
      neutrals: { background: '#FFFFFF', text: '#1F2937', border: '#E5E7EB' }
    },
    typography: brandKit.typography || {
      headingFont: 'Inter, system-ui, sans-serif',
      bodyFont: 'Inter, system-ui, sans-serif',
      sizes: { h1: '3.5rem', h2: '2.5rem', h3: '1.75rem', body: '1.125rem' }
    },
    spacing: brandKit.spacing || {
      small: '0.5rem',
      medium: '1rem',
      large: '2rem',
      xlarge: '4rem'
    },
    borderRadius: brandKit.borderRadius || '0.5rem',
    taglines: brandKit.taglines || generateTaglinesFallback(config)
  };
}

/**
 * Generate brand kit using fallback (industry defaults)
 */
function generateBrandKitFallback(config: ProjectConfig): BrandKit {
  const industryColors = industryColorPalettes[config.industry] || industryColorPalettes['Default'];
  const industryFonts = industryTypography[config.industry] || industryTypography['Default'];
  
  return {
    colorPalette: {
      ...industryColors,
      neutrals: {
        background: '#FFFFFF',
        text: '#1F2937',
        border: '#E5E7EB'
      }
    },
    typography: {
      headingFont: industryFonts.heading,
      bodyFont: industryFonts.body,
      sizes: {
        h1: '3.5rem',
        h2: '2.5rem',
        h3: '1.75rem',
        body: '1.125rem'
      }
    },
    spacing: {
      small: '0.5rem',
      medium: '1rem',
      large: '2rem',
      xlarge: '4rem'
    },
    borderRadius: '0.5rem',
    taglines: generateTaglinesFallback(config)
  };
}

/**
 * Generate taglines (fallback)
 */
function generateTaglinesFallback(config: ProjectConfig): string[] {
  const location = `${config.location.city}, ${config.location.region}`;
  const industry = config.industry.toLowerCase();
  
  return [
    `${config.projectName}: ${config.industry} services in ${location}`,
    `Trusted ${industry} solutions for ${config.targetAudiences.join(' and ')}`,
    `Professional ${industry} services in ${location}`
  ];
}

/**
 * Save brand kit to project directory
 */
export function saveBrandKit(projectSlug: string, brandKit: BrandKit): void {
  const projectDir = getProjectDir(projectSlug);
  const brandPath = path.join(projectDir, 'brand.json');
  
  fs.writeFileSync(brandPath, JSON.stringify(brandKit, null, 2), 'utf-8');
}

/**
 * Load brand kit from project directory
 */
export function loadBrandKit(projectSlug: string): BrandKit | null {
  const brandPath = path.join(getProjectDir(projectSlug), 'brand.json');
  
  if (!fs.existsSync(brandPath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(brandPath, 'utf-8');
    return JSON.parse(content) as BrandKit;
  } catch (error) {
    console.error(`Error loading brand kit for ${projectSlug}:`, error);
    return null;
  }
}

