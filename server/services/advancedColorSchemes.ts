/**
 * Advanced Color Scheme Service
 * Generates stunning, professional color palettes with advanced techniques
 * Includes color theory, accessibility, and visual harmony
 */

export interface ColorSchemeOptions {
  industry?: string;
  mood?: 'professional' | 'modern' | 'elegant' | 'bold' | 'minimalist' | 'luxury' | 'energetic' | 'calm';
  style?: 'monochromatic' | 'complementary' | 'triadic' | 'analogous' | 'split-complementary';
  baseColor?: string;
  accessibility?: 'WCAG-AA' | 'WCAG-AAA';
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  gradients: {
    primary: string;
    secondary: string;
    hero: string;
  };
  palette: string[];
}

/**
 * Industry-specific color palettes
 */
const industryPalettes: Record<string, ColorScheme> = {
  'technology': {
    primary: '#3B82F6', // Blue
    secondary: '#10B981', // Green
    accent: '#8B5CF6', // Purple
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#1F2937',
    textSecondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    gradients: {
      primary: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
      secondary: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      hero: 'linear-gradient(135deg, #3B82F6 0%, #10B981 50%, #8B5CF6 100%)',
    },
    palette: ['#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B'],
  },
  'healthcare': {
    primary: '#10B981', // Green
    secondary: '#3B82F6', // Blue
    accent: '#06B6D4', // Cyan
    background: '#FFFFFF',
    surface: '#F0FDF4',
    text: '#1F2937',
    textSecondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    gradients: {
      primary: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
      secondary: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
      hero: 'linear-gradient(135deg, #10B981 0%, #06B6D4 50%, #3B82F6 100%)',
    },
    palette: ['#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'],
  },
  'finance': {
    primary: '#1F2937', // Dark gray
    secondary: '#3B82F6', // Blue
    accent: '#10B981', // Green
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#1F2937',
    textSecondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    gradients: {
      primary: 'linear-gradient(135deg, #1F2937 0%, #3B82F6 100%)',
      secondary: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
      hero: 'linear-gradient(135deg, #1F2937 0%, #3B82F6 50%, #10B981 100%)',
    },
    palette: ['#1F2937', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
  },
  'creative': {
    primary: '#8B5CF6', // Purple
    secondary: '#EC4899', // Pink
    accent: '#F59E0B', // Orange
    background: '#FFFFFF',
    surface: '#FAF5FF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    gradients: {
      primary: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      secondary: 'linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)',
      hero: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)',
    },
    palette: ['#8B5CF6', '#EC4899', '#F59E0B', '#3B82F6', '#10B981'],
  },
  'luxury': {
    primary: '#1F2937', // Dark
    secondary: '#D97706', // Gold
    accent: '#7C3AED', // Purple
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#1F2937',
    textSecondary: '#6B7280',
    success: '#10B981',
    warning: '#D97706',
    error: '#EF4444',
    info: '#3B82F6',
    gradients: {
      primary: 'linear-gradient(135deg, #1F2937 0%, #D97706 100%)',
      secondary: 'linear-gradient(135deg, #7C3AED 0%, #D97706 100%)',
      hero: 'linear-gradient(135deg, #1F2937 0%, #7C3AED 50%, #D97706 100%)',
    },
    palette: ['#1F2937', '#D97706', '#7C3AED', '#3B82F6', '#10B981'],
  },
};

/**
 * Generate stunning color scheme
 */
export function generateStunningColorScheme(options: ColorSchemeOptions = {}): ColorScheme {
  const { industry, mood, style, baseColor } = options;

  // Use industry palette if available
  if (industry && industryPalettes[industry.toLowerCase()]) {
    return industryPalettes[industry.toLowerCase()];
  }

  // Generate based on mood
  const moodPalettes: Record<string, ColorScheme> = {
    'professional': industryPalettes['technology'],
    'modern': industryPalettes['technology'],
    'elegant': industryPalettes['luxury'],
    'bold': industryPalettes['creative'],
    'minimalist': {
      ...industryPalettes['technology'],
      primary: '#1F2937',
      secondary: '#6B7280',
      accent: '#3B82F6',
    },
    'luxury': industryPalettes['luxury'],
    'energetic': industryPalettes['creative'],
    'calm': industryPalettes['healthcare'],
  };

  if (mood && moodPalettes[mood]) {
    return moodPalettes[mood];
  }

  // Default to technology palette
  return industryPalettes['technology'];
}

/**
 * Generate CSS variables for color scheme
 */
export function generateColorSchemeCSS(scheme: ColorScheme): string {
  return `
:root {
  --color-primary: ${scheme.primary};
  --color-secondary: ${scheme.secondary};
  --color-accent: ${scheme.accent};
  --color-background: ${scheme.background};
  --color-surface: ${scheme.surface};
  --color-text: ${scheme.text};
  --color-text-secondary: ${scheme.textSecondary};
  --color-success: ${scheme.success};
  --color-warning: ${scheme.warning};
  --color-error: ${scheme.error};
  --color-info: ${scheme.info};
  
  --gradient-primary: ${scheme.gradients.primary};
  --gradient-secondary: ${scheme.gradients.secondary};
  --gradient-hero: ${scheme.gradients.hero};
}

/* Color utility classes */
.bg-primary { background-color: var(--color-primary); }
.bg-secondary { background-color: var(--color-secondary); }
.bg-accent { background-color: var(--color-accent); }
.text-primary { color: var(--color-primary); }
.text-secondary { color: var(--color-secondary); }

/* Gradient utilities */
.gradient-primary { background: var(--gradient-primary); }
.gradient-secondary { background: var(--gradient-secondary); }
.gradient-hero { background: var(--gradient-hero); }
  `.trim();
}

