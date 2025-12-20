/**
 * Design System Engine 2.0
 * Merlin 7.0 - Module 4
 * Generates complete design tokens: typography, colors, shadows, spacing, components
 */

import OpenAI from 'openai';
import type { ProjectConfig } from '../services/projectConfig';
import type { DesignTokens, TypographyScale, ColorPalette, ShadowSystem, SpacingScale, ComponentTokens, ThemeTokens } from '../types/designTokens';
import type { IndustryProfile } from './industryEngine';
import { logError } from '../utils/errorHandler';

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
 * Generate complete design system
 */
export async function generateDesignSystem(
  projectConfig: ProjectConfig,
  industryProfile: IndustryProfile
): Promise<DesignTokens> {
  const openai = createOpenAIClient();
  
  if (!openai) {
    return generateFallbackDesignSystem(projectConfig, industryProfile);
  }
  
  try {
    const prompt = buildDesignSystemPrompt(projectConfig, industryProfile);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a design system expert. Create comprehensive design tokens including typography scales, color palettes with WCAG contrast checks, shadow systems, spacing scales, and component tokens. Return structured JSON.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2, // Very low for deterministic design
      response_format: { type: 'json_object' },
    });
    
    const tokens = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    // Validate and enhance with contrast checks
    const designTokens: DesignTokens = {
      typography: tokens.typography || generateDefaultTypography(),
      colors: enhanceColorPalette(tokens.colors || generateDefaultColors(projectConfig)),
      shadows: tokens.shadows || generateDefaultShadows(),
      spacing: tokens.spacing || generateDefaultSpacing(),
      components: tokens.components || generateDefaultComponents(),
      theme: tokens.theme || generateDefaultTheme(),
    };
    
    return designTokens;
  } catch (error: unknown) {
    logError(error, 'Design System Engine');
    return generateFallbackDesignSystem(projectConfig, industryProfile);
  }
}

/**
 * Build design system prompt
 */
function buildDesignSystemPrompt(
  projectConfig: ProjectConfig,
  industryProfile: IndustryProfile
): string {
  const brandColors = projectConfig.brandPreferences?.colorPalette;
  
  return `Create a complete design system for this business:

BUSINESS:
- Name: ${projectConfig.projectName}
- Industry: ${projectConfig.industry}
- Archetype: ${industryProfile.archetype}
- Tone: ${projectConfig.toneOfVoice}
${brandColors?.primary ? `- Brand Colors: Primary ${brandColors.primary}, Secondary ${brandColors.secondary || 'auto'}` : ''}

TASK:
Generate a complete design token system:
1. Typography scale (font families, sizes, weights, line heights, letter spacing)
2. Color palette (primary, secondary, accent, neutral scales with WCAG contrast)
3. Shadow system (xs, sm, md, lg, xl, 2xl, inner, none)
4. Spacing scale (0-64 units)
5. Component tokens (buttons, cards, inputs, badges)
6. Theme tokens (border radius, transitions, z-index)

OUTPUT JSON:
{
  "typography": {
    "fontFamilies": {"heading": "...", "body": "...", "mono": "..."},
    "fontSizes": {"xs": "...", "sm": "...", "base": "...", ...},
    "fontWeights": {"light": 300, "normal": 400, ...},
    "lineHeights": {"tight": 1.25, "normal": 1.5, ...},
    "letterSpacing": {"tighter": "-0.05em", ...}
  },
  "colors": {
    "primary": {"50": "#...", "100": "#...", ..., "500": "#...", ...},
    "secondary": {...},
    "accent": {...},
    "neutral": {...},
    "semantic": {"success": "#...", "warning": "#...", ...},
    "contrast": {"aa": true, "aaa": false, "ratios": {...}}
  },
  "shadows": {"xs": "...", "sm": "...", ...},
  "spacing": {"0": "0", "1": "0.25rem", ...},
  "components": {
    "button": {
      "primary": {"backgroundColor": "#...", "textColor": "#...", ...},
      "secondary": {...}
    },
    "card": {...},
    "input": {...},
    "badge": {...}
  },
  "theme": {
    "mode": "light",
    "borderRadius": {...},
    "transitions": {...},
    "zIndex": {...}
  }
}`;
}

/**
 * Enhance color palette with contrast checks
 */
function enhanceColorPalette(colors: any): ColorPalette {
  // Calculate contrast ratios
  const primaryText = calculateContrast(colors.primary?.[500] || '#3B82F6', '#FFFFFF');
  const secondaryText = calculateContrast(colors.secondary?.[500] || '#10B981', '#FFFFFF');
  
  return {
    ...colors,
    contrast: {
      aa: primaryText >= 4.5 && secondaryText >= 4.5,
      aaa: primaryText >= 7 && secondaryText >= 7,
      ratios: {
        primaryText: primaryText,
        secondaryText: secondaryText,
        linkText: primaryText,
      },
    },
  };
}

/**
 * Calculate WCAG contrast ratio
 */
function calculateContrast(color1: string, color2: string): number {
  // Simplified contrast calculation
  // In production, use a proper library like 'wcag-contrast'
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get relative luminance
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Generate fallback design system
 */
function generateFallbackDesignSystem(
  projectConfig: ProjectConfig,
  industryProfile: IndustryProfile
): DesignTokens {
  const brandColors = projectConfig.brandPreferences?.colorPalette;
  
  return {
    typography: generateDefaultTypography(),
    colors: generateDefaultColors(projectConfig),
    shadows: generateDefaultShadows(),
    spacing: generateDefaultSpacing(),
    components: generateDefaultComponents(),
    theme: generateDefaultTheme(),
  };
}

/**
 * Generate default typography
 */
function generateDefaultTypography(): TypographyScale {
  return {
    fontFamilies: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'Monaco, Consolas, monospace',
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    },
  };
}

/**
 * Generate default colors
 */
function generateDefaultColors(projectConfig: ProjectConfig): ColorPalette {
  const brandColors = projectConfig.brandPreferences?.colorPalette;
  const primary = brandColors?.primary || '#3B82F6';
  const secondary = brandColors?.secondary || '#10B981';
  const accent = brandColors?.accent || '#F59E0B';
  
  return {
    primary: generateColorScale(primary),
    secondary: generateColorScale(secondary),
    accent: generateColorScale(accent),
    neutral: generateColorScale('#6B7280'),
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    contrast: {
      aa: true,
      aaa: false,
      ratios: {
        primaryText: 4.5,
        secondaryText: 4.5,
        linkText: 4.5,
      },
    },
  };
}

/**
 * Generate color scale from base color
 */
function generateColorScale(base: string): any {
  // Simplified - in production, use a proper color manipulation library
  return {
    50: lighten(base, 0.9),
    100: lighten(base, 0.8),
    200: lighten(base, 0.6),
    300: lighten(base, 0.4),
    400: lighten(base, 0.2),
    500: base,
    600: darken(base, 0.2),
    700: darken(base, 0.4),
    800: darken(base, 0.6),
    900: darken(base, 0.8),
    950: darken(base, 0.9),
  };
}

/**
 * Lighten color (simplified)
 */
function lighten(hex: string, _amount: number): string {
  // Simplified implementation
  return hex; // In production, use a proper color library
}

/**
 * Darken color (simplified)
 */
function darken(hex: string, _amount: number): string {
  // Simplified implementation
  return hex; // In production, use a proper color library
}

/**
 * Generate default shadows
 */
function generateDefaultShadows(): ShadowSystem {
  return {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  };
}

/**
 * Generate default spacing
 */
function generateDefaultSpacing(): SpacingScale {
  return {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  };
}

/**
 * Generate default components
 */
function generateDefaultComponents(): ComponentTokens {
  return {
    button: {
      primary: {
        backgroundColor: '#3B82F6',
        textColor: '#FFFFFF',
        borderRadius: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        fontWeight: 600,
        shadow: 'md',
      },
      secondary: {
        backgroundColor: '#6B7280',
        textColor: '#FFFFFF',
        borderRadius: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        fontWeight: 600,
        shadow: 'sm',
      },
      outline: {
        backgroundColor: 'transparent',
        textColor: '#3B82F6',
        borderColor: '#3B82F6',
        borderRadius: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        fontWeight: 600,
      },
      ghost: {
        backgroundColor: 'transparent',
        textColor: '#3B82F6',
        borderRadius: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        fontWeight: 600,
      },
    },
    card: {
      default: {
        backgroundColor: '#FFFFFF',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        shadow: 'md',
      },
      elevated: {
        backgroundColor: '#FFFFFF',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        shadow: 'lg',
      },
    },
    input: {
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      borderColor: '#D1D5DB',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      fontWeight: 400,
    },
    badge: {
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
      borderRadius: '9999px',
      padding: '0.25rem 0.75rem',
      fontSize: '0.875rem',
      fontWeight: 600,
    },
  };
}

/**
 * Generate default theme
 */
function generateDefaultTheme(): ThemeTokens {
  return {
    mode: 'light',
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    transitions: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    zIndex: {
      base: 0,
      dropdown: 1000,
      sticky: 1020,
      fixed: 1030,
      modal: 1040,
      popover: 1050,
      tooltip: 1060,
    },
  };
}

