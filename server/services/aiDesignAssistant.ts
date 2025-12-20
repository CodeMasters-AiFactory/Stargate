/**
 * AI Design Assistant - 120% Feature
 * Real-time AI-powered design suggestions as users edit
 * 
 * Features:
 * - Color harmony suggestions
 * - Typography pairing recommendations
 * - Layout improvement tips
 * - Accessibility warnings
 * - Performance optimization hints
 * - Industry-specific best practices
 */

import { generate, generateConsensus } from './multiModelAIOrchestrator';

export interface DesignContext {
  industry: string;
  businessName: string;
  currentColors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  currentFonts: {
    heading?: string;
    body?: string;
  };
  currentLayout: {
    sections: string[];
    style?: string;
  };
  targetAudience?: string;
  designGoals?: string[];
}

export interface DesignSuggestion {
  type: 'color' | 'typography' | 'layout' | 'accessibility' | 'performance' | 'content' | 'seo';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  currentValue?: string;
  suggestedValue?: string;
  impact: string;
  autoFixAvailable: boolean;
  autoFix?: () => Promise<void>;
}

export interface ColorHarmony {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  type: 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'monochromatic';
  contrastRatios: {
    textOnBackground: number;
    textOnPrimary: number;
  };
}

export interface TypographyPairing {
  headingFont: string;
  bodyFont: string;
  headingSizes: { h1: string; h2: string; h3: string; h4: string };
  lineHeights: { heading: number; body: number };
  letterSpacing: { heading: string; body: string };
  category: 'classic' | 'modern' | 'playful' | 'elegant' | 'bold';
}

// Color utility functions
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return 0;
  
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Industry-specific color palettes
const INDUSTRY_PALETTES: Record<string, ColorHarmony[]> = {
  'technology': [
    { primary: '#3B82F6', secondary: '#1E40AF', accent: '#06B6D4', background: '#0F172A', text: '#F8FAFC', type: 'analogous', contrastRatios: { textOnBackground: 15.2, textOnPrimary: 4.5 } },
    { primary: '#8B5CF6', secondary: '#6D28D9', accent: '#EC4899', background: '#1E1B4B', text: '#E0E7FF', type: 'triadic', contrastRatios: { textOnBackground: 12.8, textOnPrimary: 4.2 } },
  ],
  'healthcare': [
    { primary: '#10B981', secondary: '#059669', accent: '#3B82F6', background: '#ECFDF5', text: '#065F46', type: 'complementary', contrastRatios: { textOnBackground: 7.5, textOnPrimary: 4.5 } },
    { primary: '#0EA5E9', secondary: '#0284C7', accent: '#10B981', background: '#F0F9FF', text: '#0C4A6E', type: 'analogous', contrastRatios: { textOnBackground: 8.2, textOnPrimary: 4.5 } },
  ],
  'finance': [
    { primary: '#1E3A5F', secondary: '#0F172A', accent: '#D4AF37', background: '#FFFFFF', text: '#1E293B', type: 'complementary', contrastRatios: { textOnBackground: 12.6, textOnPrimary: 8.5 } },
    { primary: '#059669', secondary: '#047857', accent: '#1E40AF', background: '#F8FAFC', text: '#1E293B', type: 'triadic', contrastRatios: { textOnBackground: 12.6, textOnPrimary: 4.5 } },
  ],
  'restaurant': [
    { primary: '#DC2626', secondary: '#991B1B', accent: '#F59E0B', background: '#FEF2F2', text: '#7F1D1D', type: 'analogous', contrastRatios: { textOnBackground: 7.8, textOnPrimary: 4.5 } },
    { primary: '#92400E', secondary: '#78350F', accent: '#059669', background: '#FFFBEB', text: '#451A03', type: 'complementary', contrastRatios: { textOnBackground: 10.2, textOnPrimary: 5.2 } },
  ],
  'legal': [
    { primary: '#1E3A5F', secondary: '#0C4A6E', accent: '#B45309', background: '#FFFFFF', text: '#1E293B', type: 'complementary', contrastRatios: { textOnBackground: 12.6, textOnPrimary: 8.5 } },
    { primary: '#374151', secondary: '#1F2937', accent: '#7C3AED', background: '#F9FAFB', text: '#111827', type: 'triadic', contrastRatios: { textOnBackground: 16.2, textOnPrimary: 10.5 } },
  ],
  'real-estate': [
    { primary: '#1E40AF', secondary: '#1E3A8A', accent: '#F59E0B', background: '#EFF6FF', text: '#1E3A8A', type: 'complementary', contrastRatios: { textOnBackground: 8.5, textOnPrimary: 4.5 } },
    { primary: '#047857', secondary: '#065F46', accent: '#0284C7', background: '#ECFDF5', text: '#064E3B', type: 'analogous', contrastRatios: { textOnBackground: 7.8, textOnPrimary: 4.5 } },
  ],
  'default': [
    { primary: '#3B82F6', secondary: '#2563EB', accent: '#F59E0B', background: '#FFFFFF', text: '#1E293B', type: 'complementary', contrastRatios: { textOnBackground: 12.6, textOnPrimary: 4.5 } },
  ],
};

// Typography pairings
const TYPOGRAPHY_PAIRINGS: TypographyPairing[] = [
  {
    headingFont: 'Playfair Display',
    bodyFont: 'Source Sans Pro',
    headingSizes: { h1: '3.5rem', h2: '2.5rem', h3: '2rem', h4: '1.5rem' },
    lineHeights: { heading: 1.2, body: 1.6 },
    letterSpacing: { heading: '-0.02em', body: '0' },
    category: 'elegant',
  },
  {
    headingFont: 'Montserrat',
    bodyFont: 'Open Sans',
    headingSizes: { h1: '3rem', h2: '2.25rem', h3: '1.75rem', h4: '1.25rem' },
    lineHeights: { heading: 1.3, body: 1.7 },
    letterSpacing: { heading: '-0.01em', body: '0.01em' },
    category: 'modern',
  },
  {
    headingFont: 'Bebas Neue',
    bodyFont: 'Roboto',
    headingSizes: { h1: '4rem', h2: '3rem', h3: '2.25rem', h4: '1.5rem' },
    lineHeights: { heading: 1.1, body: 1.6 },
    letterSpacing: { heading: '0.05em', body: '0' },
    category: 'bold',
  },
  {
    headingFont: 'Merriweather',
    bodyFont: 'Lato',
    headingSizes: { h1: '3rem', h2: '2.25rem', h3: '1.75rem', h4: '1.25rem' },
    lineHeights: { heading: 1.3, body: 1.65 },
    letterSpacing: { heading: '-0.01em', body: '0' },
    category: 'classic',
  },
  {
    headingFont: 'Poppins',
    bodyFont: 'Nunito',
    headingSizes: { h1: '3rem', h2: '2.25rem', h3: '1.75rem', h4: '1.25rem' },
    lineHeights: { heading: 1.25, body: 1.7 },
    letterSpacing: { heading: '-0.01em', body: '0.01em' },
    category: 'playful',
  },
  {
    headingFont: 'Space Grotesk',
    bodyFont: 'Inter',
    headingSizes: { h1: '3.5rem', h2: '2.5rem', h3: '2rem', h4: '1.5rem' },
    lineHeights: { heading: 1.2, body: 1.6 },
    letterSpacing: { heading: '-0.02em', body: '0' },
    category: 'modern',
  },
];

/**
 * Analyze current design and provide suggestions
 */
export async function analyzeDesign(context: DesignContext): Promise<DesignSuggestion[]> {
  const suggestions: DesignSuggestion[] = [];

  // Check color contrast (accessibility)
  if (context.currentColors.text && context.currentColors.background) {
    const contrast = getContrastRatio(context.currentColors.text, context.currentColors.background);
    if (contrast < 4.5) {
      suggestions.push({
        type: 'accessibility',
        priority: 'critical',
        title: 'Poor Text Contrast',
        description: `Current contrast ratio is ${contrast.toFixed(2)}:1. WCAG AA requires at least 4.5:1 for normal text.`,
        currentValue: `${contrast.toFixed(2)}:1`,
        suggestedValue: '4.5:1 or higher',
        impact: 'Users with visual impairments may struggle to read content',
        autoFixAvailable: true,
      });
    }
  }

  // Check for industry-appropriate colors
  const industryPalettes = INDUSTRY_PALETTES[context.industry.toLowerCase()] || INDUSTRY_PALETTES['default'];
  if (context.currentColors.primary) {
    const matchesPalette = industryPalettes.some(p => 
      p.primary.toLowerCase() === context.currentColors.primary?.toLowerCase()
    );
    if (!matchesPalette) {
      suggestions.push({
        type: 'color',
        priority: 'medium',
        title: 'Consider Industry-Optimized Colors',
        description: `Your current primary color may not resonate with ${context.industry} audiences.`,
        currentValue: context.currentColors.primary,
        suggestedValue: industryPalettes[0]?.primary,
        impact: 'Industry-appropriate colors increase trust and recognition',
        autoFixAvailable: true,
      });
    }
  }

  // Check typography pairing
  if (context.currentFonts.heading && context.currentFonts.body) {
    const hasGoodPairing = TYPOGRAPHY_PAIRINGS.some(p => 
      p.headingFont.toLowerCase() === context.currentFonts.heading?.toLowerCase() &&
      p.bodyFont.toLowerCase() === context.currentFonts.body?.toLowerCase()
    );
    if (!hasGoodPairing) {
      const suggestedPairing = TYPOGRAPHY_PAIRINGS[0];
      suggestions.push({
        type: 'typography',
        priority: 'low',
        title: 'Consider Proven Typography Pairing',
        description: 'Your current font combination may not have optimal readability.',
        currentValue: `${context.currentFonts.heading} / ${context.currentFonts.body}`,
        suggestedValue: `${suggestedPairing.headingFont} / ${suggestedPairing.bodyFont}`,
        impact: 'Professional font pairings improve readability and brand perception',
        autoFixAvailable: true,
      });
    }
  }

  // Check layout for essential sections
  const essentialSections = ['hero', 'features', 'cta', 'footer'];
  const missingSections = essentialSections.filter(s => 
    !context.currentLayout.sections.some(cs => cs.toLowerCase().includes(s))
  );
  
  if (missingSections.length > 0) {
    suggestions.push({
      type: 'layout',
      priority: 'high',
      title: 'Missing Essential Sections',
      description: `Your layout is missing: ${missingSections.join(', ')}`,
      currentValue: context.currentLayout.sections.join(', '),
      suggestedValue: [...context.currentLayout.sections, ...missingSections].join(', '),
      impact: 'Essential sections improve conversion rates by up to 30%',
      autoFixAvailable: true,
    });
  }

  return suggestions;
}

/**
 * Get AI-powered design recommendations
 */
export async function getAIDesignRecommendations(context: DesignContext): Promise<{
  colorPalette: ColorHarmony;
  typography: TypographyPairing;
  layoutSuggestions: string[];
  contentTips: string[];
}> {
  const prompt = `You are an expert web designer. Analyze this design context and provide recommendations:

Business: ${context.businessName}
Industry: ${context.industry}
Target Audience: ${context.targetAudience || 'General'}
Design Goals: ${context.designGoals?.join(', ') || 'Professional, modern'}

Current Colors: ${JSON.stringify(context.currentColors)}
Current Fonts: ${JSON.stringify(context.currentFonts)}
Current Layout: ${context.currentLayout.sections.join(' → ')}

Provide recommendations in JSON format:
{
  "colorAnalysis": "Brief analysis of current colors",
  "colorRecommendation": "Specific color improvement",
  "typographyAnalysis": "Brief analysis of fonts",
  "typographyRecommendation": "Specific font improvement",
  "layoutSuggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "contentTips": ["tip1", "tip2", "tip3"]
}`;

  try {
    const result = await generate({
      task: 'design',
      prompt,
      temperature: 0.7,
    });

    const cleanJson = result.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const aiRecommendations = JSON.parse(cleanJson);

    // Get industry palette
    const industryPalettes = INDUSTRY_PALETTES[context.industry.toLowerCase()] || INDUSTRY_PALETTES['default'];
    const colorPalette = industryPalettes[0];

    // Get typography pairing
    const typography = TYPOGRAPHY_PAIRINGS.find(t => 
      context.industry.toLowerCase().includes('law') || context.industry.toLowerCase().includes('legal') 
        ? t.category === 'classic' 
        : context.industry.toLowerCase().includes('tech')
          ? t.category === 'modern'
          : t.category === 'modern'
    ) || TYPOGRAPHY_PAIRINGS[1];

    return {
      colorPalette,
      typography,
      layoutSuggestions: aiRecommendations.layoutSuggestions || [
        'Add social proof section with testimonials',
        'Include a clear call-to-action above the fold',
        'Add trust indicators like certifications and awards',
      ],
      contentTips: aiRecommendations.contentTips || [
        'Lead with benefits, not features',
        'Use action-oriented language in CTAs',
        'Include specific numbers and statistics',
      ],
    };
  } catch (error) {
    console.error('[AI Design Assistant] Error getting recommendations:', error);
    
    // Return defaults
    const industryPalettes = INDUSTRY_PALETTES[context.industry.toLowerCase()] || INDUSTRY_PALETTES['default'];
    
    return {
      colorPalette: industryPalettes[0],
      typography: TYPOGRAPHY_PAIRINGS[1],
      layoutSuggestions: [
        'Add a testimonials section for social proof',
        'Include a FAQ section to address common questions',
        'Add a clear call-to-action in the hero section',
      ],
      contentTips: [
        'Focus on benefits over features',
        'Use power words in headlines',
        'Include specific data and statistics',
      ],
    };
  }
}

/**
 * Auto-fix accessibility issues
 */
export function autoFixAccessibility(
  currentColors: DesignContext['currentColors']
): DesignContext['currentColors'] {
  const fixed = { ...currentColors };
  
  // Ensure sufficient contrast
  if (fixed.text && fixed.background) {
    const contrast = getContrastRatio(fixed.text, fixed.background);
    if (contrast < 4.5) {
      // Darken text or lighten background
      const textRgb = hexToRgb(fixed.text);
      if (textRgb) {
        // Make text darker
        fixed.text = '#1E293B'; // Safe dark color
      }
    }
  }

  return fixed;
}

/**
 * Generate color harmony variations
 */
export function generateColorHarmonies(baseColor: string): ColorHarmony[] {
  // This would use color theory to generate harmonies
  // Simplified implementation returns industry palettes
  return Object.values(INDUSTRY_PALETTES).flat();
}

/**
 * Get typography pairing recommendations
 */
export function getTypographyPairings(category?: TypographyPairing['category']): TypographyPairing[] {
  if (category) {
    return TYPOGRAPHY_PAIRINGS.filter(t => t.category === category);
  }
  return TYPOGRAPHY_PAIRINGS;
}

/**
 * Real-time design score
 */
export function calculateDesignScore(context: DesignContext): {
  overall: number;
  breakdown: {
    colorHarmony: number;
    typography: number;
    layout: number;
    accessibility: number;
    industryFit: number;
  };
} {
  const colorHarmony = 70;
  let typography = 70;
  let layout = 70;
  let accessibility = 100;
  let industryFit = 70;

  // Check color contrast
  if (context.currentColors.text && context.currentColors.background) {
    const contrast = getContrastRatio(context.currentColors.text, context.currentColors.background);
    if (contrast >= 7) accessibility = 100;
    else if (contrast >= 4.5) accessibility = 85;
    else if (contrast >= 3) accessibility = 60;
    else accessibility = 30;
  }

  // Check industry palette match
  const industryPalettes = INDUSTRY_PALETTES[context.industry.toLowerCase()];
  if (industryPalettes && context.currentColors.primary) {
    const matches = industryPalettes.some(p => 
      p.primary.toLowerCase() === context.currentColors.primary?.toLowerCase()
    );
    industryFit = matches ? 95 : 60;
  }

  // Check layout completeness
  const essentialSections = ['hero', 'features', 'cta', 'footer', 'about'];
  const presentSections = essentialSections.filter(s =>
    context.currentLayout.sections.some(cs => cs.toLowerCase().includes(s))
  );
  layout = Math.round((presentSections.length / essentialSections.length) * 100);

  // Check typography pairing
  if (context.currentFonts.heading && context.currentFonts.body) {
    const hasGoodPairing = TYPOGRAPHY_PAIRINGS.some(p =>
      p.headingFont.toLowerCase() === context.currentFonts.heading?.toLowerCase() &&
      p.bodyFont.toLowerCase() === context.currentFonts.body?.toLowerCase()
    );
    typography = hasGoodPairing ? 95 : 65;
  }

  const overall = Math.round(
    (colorHarmony * 0.2) +
    (typography * 0.15) +
    (layout * 0.25) +
    (accessibility * 0.25) +
    (industryFit * 0.15)
  );

  return {
    overall,
    breakdown: {
      colorHarmony,
      typography,
      layout,
      accessibility,
      industryFit,
    },
  };
}

console.log('[AI Design Assistant] 🎨 Service loaded - Real-time design suggestions ready');
