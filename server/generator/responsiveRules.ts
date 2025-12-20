/**
 * Merlin v6.4 - Responsive Layout Rules
 * Defines responsive behavior for each section variant
 */

export interface ResponsiveLayoutRule {
  mobile: {
    columns?: number;
    imagePosition?: 'top' | 'bottom' | 'left' | 'right' | 'none';
    layout?: 'stacked' | 'grid' | 'centered';
    spacing?: 'compact' | 'normal' | 'spacious';
  };
  tablet: {
    columns?: number;
    imagePosition?: 'top' | 'bottom' | 'left' | 'right' | 'none';
    layout?: 'stacked' | 'grid' | 'split' | 'centered';
    spacing?: 'compact' | 'normal' | 'spacious';
  };
  desktop: {
    columns?: number;
    imagePosition?: 'top' | 'bottom' | 'left' | 'right' | 'none';
    layout?: 'stacked' | 'grid' | 'split' | 'centered';
    spacing?: 'compact' | 'normal' | 'spacious';
  };
}

/**
 * Responsive rules for all section variants
 */
export const RESPONSIVE_RULES_BY_VARIANT: Record<string, ResponsiveLayoutRule> = {
  // Hero Variants
  'hero-split-left': {
    mobile: { columns: 1, imagePosition: 'top', layout: 'stacked', spacing: 'normal' },
    tablet: { columns: 2, imagePosition: 'right', layout: 'split', spacing: 'normal' },
    desktop: { columns: 2, imagePosition: 'right', layout: 'split', spacing: 'spacious' }
  },
  'hero-split-right': {
    mobile: { columns: 1, imagePosition: 'top', layout: 'stacked', spacing: 'normal' },
    tablet: { columns: 2, imagePosition: 'left', layout: 'split', spacing: 'normal' },
    desktop: { columns: 2, imagePosition: 'left', layout: 'split', spacing: 'spacious' }
  },
  'hero-centered': {
    mobile: { columns: 1, imagePosition: 'bottom', layout: 'centered', spacing: 'normal' },
    tablet: { columns: 1, imagePosition: 'bottom', layout: 'centered', spacing: 'normal' },
    desktop: { columns: 1, imagePosition: 'bottom', layout: 'centered', spacing: 'spacious' }
  },
  'hero-image-background': {
    mobile: { columns: 1, imagePosition: 'none', layout: 'centered', spacing: 'compact' },
    tablet: { columns: 1, imagePosition: 'none', layout: 'centered', spacing: 'normal' },
    desktop: { columns: 1, imagePosition: 'none', layout: 'centered', spacing: 'spacious' }
  },
  'hero-minimal': {
    mobile: { columns: 1, imagePosition: 'none', layout: 'centered', spacing: 'normal' },
    tablet: { columns: 1, imagePosition: 'none', layout: 'centered', spacing: 'normal' },
    desktop: { columns: 1, imagePosition: 'none', layout: 'centered', spacing: 'spacious' }
  },

  // Features Variants
  'features-3-column-cards': {
    mobile: { columns: 1, layout: 'grid', spacing: 'normal' },
    tablet: { columns: 2, layout: 'grid', spacing: 'normal' },
    desktop: { columns: 3, layout: 'grid', spacing: 'normal' }
  },
  'features-2-column-icons': {
    mobile: { columns: 1, layout: 'grid', spacing: 'normal' },
    tablet: { columns: 2, layout: 'grid', spacing: 'normal' },
    desktop: { columns: 2, layout: 'grid', spacing: 'normal' }
  },
  'features-4-column-compact': {
    mobile: { columns: 1, layout: 'grid', spacing: 'compact' },
    tablet: { columns: 2, layout: 'grid', spacing: 'normal' },
    desktop: { columns: 4, layout: 'grid', spacing: 'normal' }
  },
  'features-alternating': {
    mobile: { columns: 1, imagePosition: 'top', layout: 'stacked', spacing: 'normal' },
    tablet: { columns: 1, imagePosition: 'alternating', layout: 'stacked', spacing: 'normal' },
    desktop: { columns: 1, imagePosition: 'alternating', layout: 'stacked', spacing: 'spacious' }
  },

  // Services Variants
  'services-grid': {
    mobile: { columns: 1, layout: 'grid', spacing: 'normal' },
    tablet: { columns: 2, layout: 'grid', spacing: 'normal' },
    desktop: { columns: 3, layout: 'grid', spacing: 'normal' }
  },
  'services-list': {
    mobile: { columns: 1, layout: 'stacked', spacing: 'normal' },
    tablet: { columns: 1, layout: 'stacked', spacing: 'normal' },
    desktop: { columns: 1, layout: 'stacked', spacing: 'normal' }
  },
  'services-accordion': {
    mobile: { columns: 1, layout: 'stacked', spacing: 'compact' },
    tablet: { columns: 1, layout: 'stacked', spacing: 'normal' },
    desktop: { columns: 1, layout: 'stacked', spacing: 'normal' }
  },

  // About Variants
  'about-image-left': {
    mobile: { columns: 1, imagePosition: 'top', layout: 'stacked', spacing: 'normal' },
    tablet: { columns: 2, imagePosition: 'left', layout: 'split', spacing: 'normal' },
    desktop: { columns: 2, imagePosition: 'left', layout: 'split', spacing: 'spacious' }
  },
  'about-image-right': {
    mobile: { columns: 1, imagePosition: 'top', layout: 'stacked', spacing: 'normal' },
    tablet: { columns: 2, imagePosition: 'right', layout: 'split', spacing: 'normal' },
    desktop: { columns: 2, imagePosition: 'right', layout: 'split', spacing: 'spacious' }
  },
  'about-centered': {
    mobile: { columns: 1, imagePosition: 'top', layout: 'centered', spacing: 'normal' },
    tablet: { columns: 1, imagePosition: 'top', layout: 'centered', spacing: 'normal' },
    desktop: { columns: 1, imagePosition: 'top', layout: 'centered', spacing: 'spacious' }
  },
  'about-split-image': {
    mobile: { columns: 1, imagePosition: 'none', layout: 'centered', spacing: 'normal' },
    tablet: { columns: 1, imagePosition: 'none', layout: 'centered', spacing: 'normal' },
    desktop: { columns: 1, imagePosition: 'none', layout: 'centered', spacing: 'spacious' }
  },

  // Testimonials Variants
  'testimonials-grid': {
    mobile: { columns: 1, layout: 'grid', spacing: 'normal' },
    tablet: { columns: 2, layout: 'grid', spacing: 'normal' },
    desktop: { columns: 3, layout: 'grid', spacing: 'normal' }
  },
  'testimonials-spotlight': {
    mobile: { columns: 1, layout: 'stacked', spacing: 'normal' },
    tablet: { columns: 1, layout: 'stacked', spacing: 'normal' },
    desktop: { columns: 2, layout: 'split', spacing: 'spacious' }
  },
  'testimonials-carousel': {
    mobile: { columns: 1, layout: 'stacked', spacing: 'normal' },
    tablet: { columns: 1, layout: 'stacked', spacing: 'normal' },
    desktop: { columns: 1, layout: 'stacked', spacing: 'normal' }
  },

  // Pricing Variants
  'pricing-3-tier': {
    mobile: { columns: 1, layout: 'grid', spacing: 'normal' },
    tablet: { columns: 1, layout: 'grid', spacing: 'normal' },
    desktop: { columns: 3, layout: 'grid', spacing: 'normal' }
  },
  'pricing-2-tier': {
    mobile: { columns: 1, layout: 'grid', spacing: 'normal' },
    tablet: { columns: 2, layout: 'grid', spacing: 'normal' },
    desktop: { columns: 2, layout: 'grid', spacing: 'normal' }
  },
  'pricing-single': {
    mobile: { columns: 1, layout: 'centered', spacing: 'normal' },
    tablet: { columns: 1, layout: 'centered', spacing: 'normal' },
    desktop: { columns: 1, layout: 'centered', spacing: 'spacious' }
  },

  // CTA Variants
  'cta-centered': {
    mobile: { columns: 1, layout: 'centered', spacing: 'normal' },
    tablet: { columns: 1, layout: 'centered', spacing: 'normal' },
    desktop: { columns: 1, layout: 'centered', spacing: 'spacious' }
  },
  'cta-split': {
    mobile: { columns: 1, layout: 'stacked', spacing: 'normal' },
    tablet: { columns: 2, layout: 'split', spacing: 'normal' },
    desktop: { columns: 2, layout: 'split', spacing: 'spacious' }
  },
  'cta-with-image': {
    mobile: { columns: 1, imagePosition: 'none', layout: 'centered', spacing: 'normal' },
    tablet: { columns: 1, imagePosition: 'none', layout: 'centered', spacing: 'normal' },
    desktop: { columns: 1, imagePosition: 'none', layout: 'centered', spacing: 'spacious' }
  },

  // Contact Variants
  'contact-split-form': {
    mobile: { columns: 1, layout: 'stacked', spacing: 'normal' },
    tablet: { columns: 2, layout: 'split', spacing: 'normal' },
    desktop: { columns: 2, layout: 'split', spacing: 'spacious' }
  },
  'contact-centered': {
    mobile: { columns: 1, layout: 'centered', spacing: 'normal' },
    tablet: { columns: 1, layout: 'centered', spacing: 'normal' },
    desktop: { columns: 1, layout: 'centered', spacing: 'spacious' }
  },

  // FAQ Variants
  'faq-accordion': {
    mobile: { columns: 1, layout: 'stacked', spacing: 'compact' },
    tablet: { columns: 1, layout: 'stacked', spacing: 'normal' },
    desktop: { columns: 1, layout: 'stacked', spacing: 'normal' }
  },
  'faq-2-column': {
    mobile: { columns: 1, layout: 'grid', spacing: 'normal' },
    tablet: { columns: 2, layout: 'grid', spacing: 'normal' },
    desktop: { columns: 2, layout: 'grid', spacing: 'normal' }
  },

  // Value Proposition Variants
  'value-prop-centered': {
    mobile: { columns: 1, layout: 'centered', spacing: 'normal' },
    tablet: { columns: 1, layout: 'centered', spacing: 'normal' },
    desktop: { columns: 1, layout: 'centered', spacing: 'spacious' }
  },
  'value-prop-split': {
    mobile: { columns: 1, layout: 'stacked', spacing: 'normal' },
    tablet: { columns: 2, layout: 'split', spacing: 'normal' },
    desktop: { columns: 2, layout: 'split', spacing: 'spacious' }
  }
};

/**
 * Get responsive rules for a variant
 */
export function getResponsiveRulesForVariant(variantId: string): ResponsiveLayoutRule {
  const rules = RESPONSIVE_RULES_BY_VARIANT[variantId];
  
  if (!rules) {
    // Default fallback rules
    console.warn(`[Responsive Rules] No rules found for variant: ${variantId}, using defaults`);
    return {
      mobile: { columns: 1, layout: 'stacked', spacing: 'normal' },
      tablet: { columns: 2, layout: 'grid', spacing: 'normal' },
      desktop: { columns: 3, layout: 'grid', spacing: 'normal' }
    };
  }
  
  return rules;
}

/**
 * Get responsive rules for a section type (fallback if no variant)
 */
export function getResponsiveRulesForSectionType(sectionType: string): ResponsiveLayoutRule {
  // Try to find a default variant for this section type
  const defaultVariants: Record<string, string> = {
    'hero': 'hero-centered',
    'features': 'features-3-column-cards',
    'services': 'services-grid',
    'about': 'about-image-left',
    'testimonials': 'testimonials-grid',
    'pricing': 'pricing-3-tier',
    'cta': 'cta-centered',
    'contact': 'contact-split-form',
    'faq': 'faq-accordion',
    'value-proposition': 'value-prop-centered'
  };
  
  const defaultVariant = defaultVariants[sectionType];
  if (defaultVariant) {
    return getResponsiveRulesForVariant(defaultVariant);
  }
  
  // Ultimate fallback
  return {
    mobile: { columns: 1, layout: 'stacked', spacing: 'normal' },
    tablet: { columns: 2, layout: 'grid', spacing: 'normal' },
    desktop: { columns: 3, layout: 'grid', spacing: 'normal' }
  };
}

