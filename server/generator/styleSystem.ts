/**
 * Style System Generator v5.0
 * Generates color palettes, typography, spacing, shadows, etc.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { DesignContext } from './designThinking';

export interface StyleSystem {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    neutrals: string[];
    background: string;
    text: string;
  };
  gradients?: {
    primary: string;
    secondary: string;
    hero: string;
    accent: string;
    mesh?: string;
  };
  typography: {
    heading: {
      font: string;
      sizes: number[];
      weights: number[];
      lineHeight?: number;
    };
    body: {
      font: string;
      sizes: number[];
      weights: number[];
      lineHeight: number;
    };
  };
  spacing: {
    scale: number[];
    system: string;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
    full: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  icons: {
    style: 'outline' | 'solid' | 'duotone';
    library: string;
  };
}

/**
 * Generate complete style system
 */
export function generateStyleSystem(
  context: DesignContext,
  industry: string,
  brandPreferences?: any
): StyleSystem {
  // Load color palettes
  const colorPalettes = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'website_quality_standards/design-llm-knowledge/color-palettes.json'),
      'utf-8'
    )
  );
  
  // Load typography pairings
  const typographyPairings = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'website_quality_standards/design-llm-knowledge/typography-pairings.json'),
      'utf-8'
    )
  );
  
  // Select color palette
  const palette = selectColorPalette(colorPalettes, industry, brandPreferences);
  
  // Select typography
  const typography = selectTypography(typographyPairings, context);
  
  // Generate spacing scale (8px base system)
  const spacingScale = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128];
  
  // Generate border radius
  const borderRadius = {
    small: '4px',
    medium: '8px',
    large: '16px',
    full: '9999px'
  };
  
  // Generate shadows
  const shadows = {
    small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  };
  
  // Select icon style
  const iconStyle = context.emotionalTone === 'premium' ? 'outline' : 
                   context.emotionalTone === 'friendly' ? 'solid' : 'outline';
  
  // Generate gradients based on color palette
  const gradients = generateGradients(palette, context.emotionalTone);
  
  return {
    colors: {
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      neutrals: palette.neutrals,
      background: palette.neutrals[0] || '#FFFFFF',
      text: palette.neutrals[palette.neutrals.length - 1] || '#1F2937'
    },
    gradients,
    typography,
    spacing: {
      scale: spacingScale,
      system: '8px base'
    },
    borderRadius,
    shadows,
    icons: {
      style: iconStyle,
      library: 'heroicons'
    }
  };
}

/**
 * Generate gradient definitions based on color palette and tone
 */
function generateGradients(palette: any, tone: string): StyleSystem['gradients'] {
  const primary = palette.primary || '#3B82F6';
  const secondary = palette.secondary || '#10B981';
  const accent = palette.accent || '#8B5CF6';
  
  // Generate gradient variations based on emotional tone
  let primaryGradient = '';
  let secondaryGradient = '';
  let heroGradient = '';
  let accentGradient = '';
  let meshGradient = '';
  
  switch (tone) {
    case 'premium':
      // Sophisticated, subtle gradients
      primaryGradient = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
      secondaryGradient = `linear-gradient(135deg, ${secondary} 0%, ${accent} 100%)`;
      heroGradient = `linear-gradient(135deg, ${primary} 0%, ${secondary} 50%, ${accent} 100%)`;
      accentGradient = `linear-gradient(135deg, ${accent} 0%, ${primary} 100%)`;
      meshGradient = `radial-gradient(circle at 20% 30%, ${primary}40 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, ${secondary}40 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, ${accent}30 0%, transparent 70%)`;
      break;
    case 'energetic':
      // Bold, vibrant gradients
      primaryGradient = `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`;
      secondaryGradient = `linear-gradient(135deg, ${secondary} 0%, ${primary} 100%)`;
      heroGradient = `linear-gradient(135deg, ${primary} 0%, ${secondary} 33%, ${accent} 66%, ${primary} 100%)`;
      accentGradient = `linear-gradient(135deg, ${accent} 0%, ${primary} 100%)`;
      meshGradient = `radial-gradient(circle at 30% 40%, ${primary}60 0%, transparent 40%),
        radial-gradient(circle at 70% 60%, ${secondary}60 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, ${accent}50 0%, transparent 60%)`;
      break;
    case 'professional':
    default:
      // Clean, professional gradients
      primaryGradient = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
      secondaryGradient = `linear-gradient(135deg, ${secondary} 0%, ${accent} 100%)`;
      heroGradient = `linear-gradient(135deg, ${primary} 0%, ${secondary} 50%, ${accent} 100%)`;
      accentGradient = `linear-gradient(135deg, ${accent} 0%, ${primary} 100%)`;
      meshGradient = `radial-gradient(circle at 20% 30%, ${primary}30 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, ${secondary}30 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, ${accent}20 0%, transparent 70%)`;
      break;
  }
  
  return {
    primary: primaryGradient,
    secondary: secondaryGradient,
    hero: heroGradient,
    accent: accentGradient,
    mesh: meshGradient
  };
}

/**
 * Select color palette based on industry and preferences
 */
function selectColorPalette(colorPalettes: any, industry: string, brandPreferences?: any): any {
  // Use brand preferences if provided
  if (brandPreferences?.colorPalette) {
    return {
      primary: brandPreferences.colorPalette.primary,
      secondary: brandPreferences.colorPalette.secondary,
      accent: brandPreferences.colorPalette.accent,
      neutrals: brandPreferences.colorPalette.neutrals || ['#F8FAFC', '#E2E8F0', '#64748B', '#1E293B']
    };
  }
  
  // Match to industry
  const industryPalette = colorPalettes.palettes.find((p: any) => 
    p.industry.some((i: string) => industry.toLowerCase().includes(i.toLowerCase()))
  );
  
  return industryPalette || colorPalettes.palettes[0];
}

/**
 * Select typography based on context
 */
function selectTypography(typographyPairings: any, context: DesignContext): StyleSystem['typography'] {
  // Match to brand voice
  if (context.brandVoice.modernity === 'modern') {
    return typographyPairings.pairings.find((p: any) => p.id === 'inter-system') || typographyPairings.pairings[0];
  }
  
  if (context.brandVoice.modernity === 'traditional') {
    return typographyPairings.pairings.find((p: any) => p.id === 'playfair-merriweather') || typographyPairings.pairings[1];
  }
  
  return typographyPairings.pairings[0]; // Default
}

/**
 * Save style system to JSON
 */
export function saveStyleSystem(styleSystem: StyleSystem, outputPath: string): void {
  const styleDir = path.dirname(outputPath);
  if (!fs.existsSync(styleDir)) {
    fs.mkdirSync(styleDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(styleSystem, null, 2));
}

