/**
 * Layout Blueprint Types
 * Merlin 7.0 - Layout Engine 3.0
 */

export interface LayoutBlueprint {
  id: string;
  name: string;
  description: string;
  industry: string[];
  sections: BlueprintSection[];
  responsive: ResponsiveRules;
  variants: LayoutVariant[];
}

export interface BlueprintSection {
  id: string;
  type: SectionType;
  order: number;
  required: boolean;
  variants: SectionVariant[];
  responsive: SectionResponsive;
}

export type SectionType =
  | 'hero'
  | 'features'
  | 'services'
  | 'testimonials'
  | 'about'
  | 'contact'
  | 'pricing'
  | 'portfolio'
  | 'faq'
  | 'cta'
  | 'stats'
  | 'navigation'
  | 'footer';

export interface SectionVariant {
  id: string;
  name: string;
  layout: 'split' | 'centered' | 'grid' | 'list' | 'card' | 'bento';
  alignment: 'left' | 'center' | 'right';
  columns: number;
  description: string;
  bestFor: string[];
}

export interface ResponsiveRules {
  mobile: {
    breakpoint: string; // e.g., "768px"
    layout: 'stack' | 'single-column' | 'condensed';
    typography: 'reduced' | 'normal';
    spacing: 'compact' | 'normal';
  };
  tablet: {
    breakpoint: string; // e.g., "1024px"
    layout: 'two-column' | 'grid' | 'adaptive';
    typography: 'normal' | 'enhanced';
    spacing: 'normal' | 'comfortable';
  };
  desktop: {
    breakpoint: string; // e.g., "1280px"
    layout: 'full' | 'max-width' | 'wide';
    typography: 'enhanced' | 'large';
    spacing: 'comfortable' | 'spacious';
  };
}

export interface SectionResponsive {
  mobile: {
    visible: boolean;
    order: number;
    layout: 'stack' | 'single' | 'hidden';
  };
  tablet: {
    visible: boolean;
    order: number;
    layout: 'two-column' | 'grid' | 'full';
  };
  desktop: {
    visible: boolean;
    order: number;
    layout: 'full' | 'split' | 'grid';
  };
}

export interface LayoutVariant {
  id: string;
  name: string;
  description: string;
  industry: string[];
  sectionOrder: string[];
  style: 'minimal' | 'modern' | 'classic' | 'bold' | 'elegant';
  complexity: 'simple' | 'moderate' | 'complex';
}

