/**
 * Template Types
 * Shared types for template selection and management
 */

export interface BrandTemplate {
  id: string;
  name: string;
  brand: string;
  category: string;
  industry?: string;
  thumbnail: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: string;
  };
  layout: {
    heroStyle: 'fullscreen' | 'split-left' | 'split-right' | 'centered' | 'video' | 'animated';
    maxWidth: string;
    borderRadius: string;
    sections: string[];
  };
  css: string;
  darkMode: boolean;
  tags: string[];
  ranking?: number; // Google ranking score
  lastUpdated?: string; // ISO date string
  contentData?: {
    html?: string;
    css?: string;
  };
}

