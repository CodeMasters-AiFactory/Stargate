/**
 * Merlin v6.9 - Global Theme Engine
 * Generates unified design theme with color harmonization, typography system, and design tokens
 */

import OpenAI from 'openai';
import type { DesignContext } from '../generator/designThinking';
import type { StyleSystem } from '../generator/styleSystem';
import type { PlannedImage } from './imagePlannerLLM';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface GlobalTheme {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral100: string;
    neutral200: string;
    neutral300: string;
    background: string;
    text: string;
  };
  typography: {
    fontDisplay: string;
    fontHeading: string;
    fontBody: string;
    scale: {
      heroH1: string;
      h1: string;
      h2: string;
      h3: string;
      body: string;
      small: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    level1: string;
    level2: string;
    level3: string;
  };
  mood: string;
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
 * Build comprehensive theme generation prompt
 */
function buildThemePrompt(
  designContext: DesignContext,
  styleSystem: StyleSystem,
  imagePlans: PlannedImage[]
): string {
  const industry = designContext.industry || 'business';
  const tone = designContext.emotionalTone || 'professional';
  const primaryGoal = designContext.primaryGoals?.[0] || 'engagement';
  const brandVoice = designContext.brandVoice || 'professional';
  
  // Extract color hints from style system
  const primaryColor = styleSystem.colors.primary;
  const secondaryColor = styleSystem.colors.secondary;
  const accentColor = styleSystem.colors.accent;
  const backgroundColor = styleSystem.colors.background;
  
  // Extract typography hints
  const headingFont = styleSystem.typography.heading.font;
  const bodyFont = styleSystem.typography.body.font;
  
  // Extract image style hints
  const imageStyles = imagePlans.map(img => img.styleHint || '').filter(Boolean);
  const imageStyleHint = imageStyles.length > 0 
    ? `Image style hints: ${imageStyles.join(', ')}`
    : '';
  
  return `You are a world-class design system architect. Generate a unified, harmonious design theme for a website.

INDUSTRY: ${industry}
EMOTIONAL TONE: ${tone}
PRIMARY GOAL: ${primaryGoal}
BRAND VOICE: ${brandVoice}

EXISTING STYLE SYSTEM:
- Primary Color: ${primaryColor}
- Secondary Color: ${secondaryColor}
- Accent Color: ${accentColor}
- Background: ${backgroundColor}
- Heading Font: ${headingFont}
- Body Font: ${bodyFont}

${imageStyleHint}

TASK: Create a unified GlobalTheme that harmonizes all visual elements into a cohesive design system.

REQUIREMENTS:

1. COLOR PALETTE:
   - Harmonize primary, secondary, accent colors to work together
   - Create neutral scale (neutral100 = lightest, neutral300 = darkest)
   - Ensure background and text have proper contrast (WCAG AA minimum)
   - Colors must match the mood and industry
   - Use hex codes (e.g., "#1a1a1a")

2. TYPOGRAPHY:
   - fontDisplay: For hero headlines (e.g., "Playfair Display", "Bebas Neue", "Oswald")
   - fontHeading: For section headings (e.g., "Inter", "Poppins", "Montserrat", "Roboto")
   - fontBody: For body text (e.g., "Inter", "Open Sans", "Lato", "Roboto")
   - All fonts must be available on Google Fonts
   - Typography scale:
     - heroH1: Large hero headline (e.g., "3.5rem" or "56px")
     - h1: Main heading (e.g., "2.5rem" or "40px")
     - h2: Section heading (e.g., "2rem" or "32px")
     - h3: Subsection heading (e.g., "1.5rem" or "24px")
     - body: Body text (e.g., "1rem" or "16px")
     - small: Small text (e.g., "0.875rem" or "14px")

3. SPACING SCALE:
   - xs: Extra small (e.g., "0.5rem" or "8px")
   - sm: Small (e.g., "1rem" or "16px")
   - md: Medium (e.g., "1.5rem" or "24px")
   - lg: Large (e.g., "2rem" or "32px")
   - xl: Extra large (e.g., "3rem" or "48px")
   - Use consistent rem or px values

4. SHADOW SYSTEM:
   - level1: Subtle shadow for cards (e.g., "0 2px 4px rgba(0,0,0,0.1)")
   - level2: Medium shadow for navigation/header (e.g., "0 4px 12px rgba(0,0,0,0.15)")
   - level3: Strong shadow for modals/elevated elements (e.g., "0 8px 24px rgba(0,0,0,0.2)")

5. MOOD:
   - Single descriptor word that captures the overall visual mood
   - Examples: "modern", "luxury", "clean", "nature", "tech", "trustworthy", "bold", "minimal", "warm", "cool"
   - Must align with industry and emotional tone

OUTPUT FORMAT (STRICT JSON):
{
  "palette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "neutral100": "#hex",
    "neutral200": "#hex",
    "neutral300": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "typography": {
    "fontDisplay": "Font Name",
    "fontHeading": "Font Name",
    "fontBody": "Font Name",
    "scale": {
      "heroH1": "3.5rem",
      "h1": "2.5rem",
      "h2": "2rem",
      "h3": "1.5rem",
      "body": "1rem",
      "small": "0.875rem"
    }
  },
  "spacing": {
    "xs": "0.5rem",
    "sm": "1rem",
    "md": "1.5rem",
    "lg": "2rem",
    "xl": "3rem"
  },
  "shadows": {
    "level1": "0 2px 4px rgba(0,0,0,0.1)",
    "level2": "0 4px 12px rgba(0,0,0,0.15)",
    "level3": "0 8px 24px rgba(0,0,0,0.2)"
  },
  "mood": "modern"
}

CRITICAL: Output ONLY valid JSON, no markdown, no explanations, no code blocks.`;
}

/**
 * Generate global theme using LLM
 */
export async function generateGlobalTheme(
  designContext: DesignContext,
  finalStyleSystem: StyleSystem,
  imagePlans: PlannedImage[]
): Promise<GlobalTheme> {
  const openai = createOpenAIClient();

  if (!openai) {
    console.warn('[Theme Engine] No OpenAI API key found, using fallback theme');
    return generateFallbackTheme(finalStyleSystem);
  }

  try {
    const prompt = buildThemePrompt(designContext, finalStyleSystem, imagePlans);
    console.log('[Theme Engine v6.9] Generating global theme...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a design system expert. Generate unified design themes in strict JSON format only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].split('```')[0].trim();
    }

    const theme = JSON.parse(jsonContent) as GlobalTheme;
    
    // Validate theme structure
    if (!theme.palette || !theme.typography || !theme.spacing || !theme.shadows || !theme.mood) {
      throw new Error('Invalid theme structure from LLM');
    }

    console.log(`[Theme Engine v6.9] Generated theme with mood: ${theme.mood}`);
    return theme;

  } catch (error: unknown) {
    logError(error, 'Theme Engine LLM v6.9');
    const errorMessage = getErrorMessage(error);
    const projectName = designContext.projectName || 'Unknown project';
    console.warn('[Theme Engine LLM v6.9] Falling back to style system-based theme - generation will continue');
    return generateFallbackTheme(finalStyleSystem);
  }
}

/**
 * Generate fallback theme from style system
 */
function generateFallbackTheme(styleSystem: StyleSystem): GlobalTheme {
  // Extract colors
  const primary = styleSystem.colors.primary;
  const secondary = styleSystem.colors.secondary;
  const accent = styleSystem.colors.accent;
  const background = styleSystem.colors.background;
  const text = styleSystem.colors.text;
  
  // Generate neutral scale from background
  const neutral100 = lightenColor(background, 0.1);
  const neutral200 = darkenColor(background, 0.1);
  const neutral300 = darkenColor(background, 0.2);
  
  // Extract fonts
  const fontHeading = styleSystem.typography.heading.font;
  const fontBody = styleSystem.typography.body.font;
  
  // Determine display font (use heading font or a complementary one)
  const fontDisplay = fontHeading.includes('Display') || fontHeading.includes('Serif')
    ? fontHeading
    : fontHeading; // Use heading font as display
  
  return {
    palette: {
      primary,
      secondary,
      accent,
      neutral100,
      neutral200,
      neutral300,
      background,
      text
    },
    typography: {
      fontDisplay,
      fontHeading,
      fontBody,
      scale: {
        heroH1: '3.5rem',
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.5rem',
        body: '1rem',
        small: '0.875rem'
      }
    },
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem'
    },
    shadows: {
      level1: '0 2px 4px rgba(0,0,0,0.1)',
      level2: '0 4px 12px rgba(0,0,0,0.15)',
      level3: '0 8px 24px rgba(0,0,0,0.2)'
    },
    mood: 'professional'
  };
}

/**
 * Lighten a hex color
 */
function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.floor(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.floor(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.floor(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Darken a hex color
 */
function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.floor(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.floor(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.floor(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

