/**
 * Merlin v6.10 - Centralized Constants
 * Consolidates configuration values and constants used across the system
 */

/**
 * Known industries that have predefined style palettes
 * Used by v6.2 AI Style Designer to determine if AI override is needed
 */
export const KNOWN_INDUSTRIES = [
  'legal',
  'law',
  'law firm',
  'attorney',
  'saas',
  'software',
  'tech',
  'ecommerce',
  'retail',
  'restaurant',
  'food',
  'real estate',
  'realtor',
  'finance',
  'banking',
  'healthcare',
  'medical',
  'fitness',
  'gym',
  'education',
  'consulting',
  'marketing',
  'agency',
  'construction',
  'manufacturing',
  'hospitality',
  'tourism',
  'automotive',
  'beauty',
  'salon',
  'dentist',
  'veterinary',
  'pet',
  'nonprofit',
  'ngo',
  'charity',
  'foundation',
  'institute',
  'research'
] as const;

/**
 * Default responsive breakpoints (mobile-first)
 */
export const DEFAULT_BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  laptop: 1024,
  desktop: 1440
} as const;

/**
 * Default container settings
 */
export const DEFAULT_CONTAINERS = {
  maxWidth: '1200px',
  paddingX: {
    mobile: '1.5rem',
    tablet: '2rem',
    desktop: '3rem'
  }
} as const;

/**
 * Default spacing scale
 */
export const DEFAULT_SPACING = {
  mobile: {
    sectionPadding: '3rem 0',
    elementGap: '1.5rem'
  },
  tablet: {
    sectionPadding: '4rem 0',
    elementGap: '2rem'
  },
  desktop: {
    sectionPadding: '6rem 0',
    elementGap: '2.5rem'
  }
} as const;

/**
 * Default typography scale
 */
export const DEFAULT_TYPOGRAPHY = {
  mobile: {
    heroHeading: '2rem',
    sectionHeading: '1.75rem',
    body: '1rem'
  },
  tablet: {
    heroHeading: '3rem',
    sectionHeading: '2.25rem',
    body: '1.125rem'
  },
  desktop: {
    heroHeading: '4rem',
    sectionHeading: '3rem',
    body: '1.125rem'
  }
} as const;

/**
 * Check if industry matches known industries
 */
export function matchesKnownIndustry(industry: string): boolean {
  const industryLower = industry.toLowerCase();
  return KNOWN_INDUSTRIES.some(known => 
    industryLower.includes(known) || known.includes(industryLower)
  );
}

