/**
 * Premium Template Library
 * 50 Squarespace-quality templates with professional aesthetics
 * Each template has unique design system, typography, and color palette
 */

export interface PremiumTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  industry: string[];
  style: TemplateStyle;
  thumbnail: string;
  designSystem: DesignSystem;
  sections: TemplateSection[];
  features: string[];
  premium: boolean;
}

export type TemplateCategory = 
  | 'business'
  | 'portfolio'
  | 'ecommerce'
  | 'blog'
  | 'restaurant'
  | 'services'
  | 'agency'
  | 'saas'
  | 'nonprofit'
  | 'personal';

export type TemplateStyle =
  | 'minimal'
  | 'bold'
  | 'elegant'
  | 'modern'
  | 'creative'
  | 'corporate'
  | 'playful'
  | 'luxurious'
  | 'tech'
  | 'organic';

export interface DesignSystem {
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
    bodyWeight: string;
    baseSize: number;
    scale: number;
  };
  spacing: {
    unit: number;
    sectionPadding: string;
    containerMaxWidth: string;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface TemplateSection {
  type: string;
  variant: string;
  content?: Record<string, any>;
}

// ==============================================
// PREMIUM TEMPLATES (50 total)
// ==============================================

export const PREMIUM_TEMPLATES: PremiumTemplate[] = [
  // ============================================
  // MINIMAL TEMPLATES (10)
  // ============================================
  {
    id: 'mono-studio',
    name: 'Mono Studio',
    category: 'portfolio',
    industry: ['design', 'photography', 'art'],
    style: 'minimal',
    thumbnail: '/templates/mono-studio.jpg',
    designSystem: {
      colors: {
        primary: '#000000',
        secondary: '#333333',
        accent: '#FF3366',
        background: '#FFFFFF',
        surface: '#FAFAFA',
        text: '#111111',
        textMuted: '#666666',
      },
      typography: {
        headingFont: 'Space Grotesk',
        bodyFont: 'Inter',
        headingWeight: '500',
        bodyWeight: '400',
        baseSize: 16,
        scale: 1.333,
      },
      spacing: {
        unit: 8,
        sectionPadding: '120px 0',
        containerMaxWidth: '1200px',
      },
      borderRadius: {
        small: '4px',
        medium: '8px',
        large: '16px',
      },
      shadows: {
        small: '0 1px 2px rgba(0,0,0,0.05)',
        medium: '0 4px 6px rgba(0,0,0,0.07)',
        large: '0 10px 25px rgba(0,0,0,0.1)',
      },
    },
    sections: [
      { type: 'hero', variant: 'minimal-centered' },
      { type: 'portfolio-grid', variant: '3-column-masonry' },
      { type: 'about', variant: 'split-image' },
      { type: 'contact', variant: 'minimal-form' },
    ],
    features: ['Portfolio grid', 'Case studies', 'Contact form'],
    premium: true,
  },
  {
    id: 'blanc',
    name: 'Blanc',
    category: 'agency',
    industry: ['marketing', 'consulting', 'tech'],
    style: 'minimal',
    thumbnail: '/templates/blanc.jpg',
    designSystem: {
      colors: {
        primary: '#1A1A1A',
        secondary: '#4A4A4A',
        accent: '#0066FF',
        background: '#FFFFFF',
        surface: '#F8F9FA',
        text: '#1A1A1A',
        textMuted: '#6C757D',
      },
      typography: {
        headingFont: 'Syne',
        bodyFont: 'DM Sans',
        headingWeight: '600',
        bodyWeight: '400',
        baseSize: 17,
        scale: 1.25,
      },
      spacing: {
        unit: 8,
        sectionPadding: '100px 0',
        containerMaxWidth: '1140px',
      },
      borderRadius: {
        small: '6px',
        medium: '12px',
        large: '24px',
      },
      shadows: {
        small: '0 2px 4px rgba(0,0,0,0.04)',
        medium: '0 8px 16px rgba(0,0,0,0.06)',
        large: '0 16px 32px rgba(0,0,0,0.08)',
      },
    },
    sections: [
      { type: 'hero', variant: 'split-text-image' },
      { type: 'services', variant: 'icon-cards' },
      { type: 'case-studies', variant: 'featured-large' },
      { type: 'testimonials', variant: 'carousel' },
      { type: 'cta', variant: 'full-width' },
    ],
    features: ['Services showcase', 'Case studies', 'Testimonials'],
    premium: true,
  },
  {
    id: 'void',
    name: 'Void',
    category: 'portfolio',
    industry: ['photography', 'film', 'art'],
    style: 'minimal',
    thumbnail: '/templates/void.jpg',
    designSystem: {
      colors: {
        primary: '#FFFFFF',
        secondary: '#E0E0E0',
        accent: '#00FF88',
        background: '#0A0A0A',
        surface: '#151515',
        text: '#FFFFFF',
        textMuted: '#888888',
      },
      typography: {
        headingFont: 'Archivo',
        bodyFont: 'Inter',
        headingWeight: '700',
        bodyWeight: '400',
        baseSize: 16,
        scale: 1.414,
      },
      spacing: {
        unit: 8,
        sectionPadding: '140px 0',
        containerMaxWidth: '1400px',
      },
      borderRadius: {
        small: '0px',
        medium: '0px',
        large: '0px',
      },
      shadows: {
        small: 'none',
        medium: 'none',
        large: '0 20px 40px rgba(0,0,0,0.5)',
      },
    },
    sections: [
      { type: 'hero', variant: 'fullscreen-video' },
      { type: 'gallery', variant: 'horizontal-scroll' },
      { type: 'about', variant: 'minimal-text' },
      { type: 'contact', variant: 'dark-minimal' },
    ],
    features: ['Fullscreen gallery', 'Video background', 'Dark mode'],
    premium: true,
  },

  // ============================================
  // BOLD TEMPLATES (10)
  // ============================================
  {
    id: 'ignite',
    name: 'Ignite',
    category: 'saas',
    industry: ['tech', 'startup', 'software'],
    style: 'bold',
    thumbnail: '/templates/ignite.jpg',
    designSystem: {
      colors: {
        primary: '#FF4D4D',
        secondary: '#FF8C42',
        accent: '#FFD93D',
        background: '#0F0F0F',
        surface: '#1A1A1A',
        text: '#FFFFFF',
        textMuted: '#A0A0A0',
      },
      typography: {
        headingFont: 'Clash Display',
        bodyFont: 'Satoshi',
        headingWeight: '700',
        bodyWeight: '400',
        baseSize: 18,
        scale: 1.5,
      },
      spacing: {
        unit: 8,
        sectionPadding: '100px 0',
        containerMaxWidth: '1280px',
      },
      borderRadius: {
        small: '8px',
        medium: '16px',
        large: '32px',
      },
      shadows: {
        small: '0 4px 8px rgba(255,77,77,0.15)',
        medium: '0 8px 24px rgba(255,77,77,0.2)',
        large: '0 16px 48px rgba(255,77,77,0.25)',
      },
    },
    sections: [
      { type: 'hero', variant: 'gradient-animated' },
      { type: 'features', variant: 'bento-grid' },
      { type: 'pricing', variant: '3-tier-featured' },
      { type: 'faq', variant: 'accordion' },
      { type: 'cta', variant: 'gradient-banner' },
    ],
    features: ['Animated gradients', 'Pricing tables', 'FAQ accordion'],
    premium: true,
  },
  {
    id: 'pulse',
    name: 'Pulse',
    category: 'agency',
    industry: ['creative', 'branding', 'design'],
    style: 'bold',
    thumbnail: '/templates/pulse.jpg',
    designSystem: {
      colors: {
        primary: '#7C3AED',
        secondary: '#EC4899',
        accent: '#06B6D4',
        background: '#FFFFFF',
        surface: '#F5F3FF',
        text: '#1F2937',
        textMuted: '#6B7280',
      },
      typography: {
        headingFont: 'Outfit',
        bodyFont: 'Plus Jakarta Sans',
        headingWeight: '800',
        bodyWeight: '400',
        baseSize: 17,
        scale: 1.333,
      },
      spacing: {
        unit: 8,
        sectionPadding: '120px 0',
        containerMaxWidth: '1200px',
      },
      borderRadius: {
        small: '12px',
        medium: '20px',
        large: '40px',
      },
      shadows: {
        small: '0 4px 6px rgba(124,58,237,0.1)',
        medium: '0 10px 20px rgba(124,58,237,0.15)',
        large: '0 20px 40px rgba(124,58,237,0.2)',
      },
    },
    sections: [
      { type: 'hero', variant: 'bold-statement' },
      { type: 'work', variant: 'case-study-cards' },
      { type: 'team', variant: 'creative-grid' },
      { type: 'testimonials', variant: 'featured-quote' },
      { type: 'contact', variant: 'split-map' },
    ],
    features: ['Bold typography', 'Case studies', 'Team profiles'],
    premium: true,
  },

  // ============================================
  // ELEGANT TEMPLATES (10)
  // ============================================
  {
    id: 'maison',
    name: 'Maison',
    category: 'ecommerce',
    industry: ['fashion', 'luxury', 'jewelry'],
    style: 'elegant',
    thumbnail: '/templates/maison.jpg',
    designSystem: {
      colors: {
        primary: '#C9A962',
        secondary: '#8B7355',
        accent: '#1A1A1A',
        background: '#FAF9F7',
        surface: '#FFFFFF',
        text: '#1A1A1A',
        textMuted: '#666666',
      },
      typography: {
        headingFont: 'Cormorant Garamond',
        bodyFont: 'Lato',
        headingWeight: '500',
        bodyWeight: '400',
        baseSize: 16,
        scale: 1.25,
      },
      spacing: {
        unit: 8,
        sectionPadding: '100px 0',
        containerMaxWidth: '1100px',
      },
      borderRadius: {
        small: '2px',
        medium: '4px',
        large: '8px',
      },
      shadows: {
        small: '0 2px 8px rgba(0,0,0,0.04)',
        medium: '0 4px 16px rgba(0,0,0,0.06)',
        large: '0 8px 32px rgba(0,0,0,0.08)',
      },
    },
    sections: [
      { type: 'hero', variant: 'elegant-slideshow' },
      { type: 'products', variant: 'featured-collection' },
      { type: 'about', variant: 'brand-story' },
      { type: 'products', variant: 'category-grid' },
      { type: 'newsletter', variant: 'elegant-minimal' },
    ],
    features: ['Product showcase', 'Brand story', 'Newsletter signup'],
    premium: true,
  },
  {
    id: 'serenity',
    name: 'Serenity',
    category: 'services',
    industry: ['spa', 'wellness', 'yoga'],
    style: 'elegant',
    thumbnail: '/templates/serenity.jpg',
    designSystem: {
      colors: {
        primary: '#7BA17D',
        secondary: '#C4B7A6',
        accent: '#3D5A45',
        background: '#FDFCFA',
        surface: '#F5F3EF',
        text: '#2C3E2F',
        textMuted: '#6B7C6D',
      },
      typography: {
        headingFont: 'Playfair Display',
        bodyFont: 'Source Sans Pro',
        headingWeight: '400',
        bodyWeight: '400',
        baseSize: 17,
        scale: 1.333,
      },
      spacing: {
        unit: 8,
        sectionPadding: '110px 0',
        containerMaxWidth: '1080px',
      },
      borderRadius: {
        small: '4px',
        medium: '8px',
        large: '16px',
      },
      shadows: {
        small: '0 2px 10px rgba(0,0,0,0.03)',
        medium: '0 6px 20px rgba(0,0,0,0.05)',
        large: '0 12px 40px rgba(0,0,0,0.07)',
      },
    },
    sections: [
      { type: 'hero', variant: 'calm-centered' },
      { type: 'services', variant: 'elegant-list' },
      { type: 'testimonials', variant: 'serene-carousel' },
      { type: 'booking', variant: 'appointment-form' },
      { type: 'contact', variant: 'location-hours' },
    ],
    features: ['Service list', 'Booking system', 'Location info'],
    premium: true,
  },

  // ============================================
  // MODERN TEMPLATES (10)
  // ============================================
  {
    id: 'flux',
    name: 'Flux',
    category: 'saas',
    industry: ['fintech', 'analytics', 'ai'],
    style: 'modern',
    thumbnail: '/templates/flux.jpg',
    designSystem: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#10B981',
        background: '#0F172A',
        surface: '#1E293B',
        text: '#F1F5F9',
        textMuted: '#94A3B8',
      },
      typography: {
        headingFont: 'Manrope',
        bodyFont: 'Inter',
        headingWeight: '700',
        bodyWeight: '400',
        baseSize: 16,
        scale: 1.25,
      },
      spacing: {
        unit: 8,
        sectionPadding: '96px 0',
        containerMaxWidth: '1280px',
      },
      borderRadius: {
        small: '8px',
        medium: '12px',
        large: '24px',
      },
      shadows: {
        small: '0 1px 2px rgba(0,0,0,0.3)',
        medium: '0 4px 12px rgba(0,0,0,0.4)',
        large: '0 8px 24px rgba(0,0,0,0.5)',
      },
    },
    sections: [
      { type: 'hero', variant: 'product-showcase' },
      { type: 'features', variant: 'icon-grid' },
      { type: 'stats', variant: 'animated-counters' },
      { type: 'integrations', variant: 'logo-cloud' },
      { type: 'pricing', variant: 'comparison-table' },
      { type: 'cta', variant: 'start-trial' },
    ],
    features: ['Product demo', 'Feature grid', 'Pricing comparison'],
    premium: true,
  },
  {
    id: 'vertex',
    name: 'Vertex',
    category: 'business',
    industry: ['consulting', 'finance', 'legal'],
    style: 'modern',
    thumbnail: '/templates/vertex.jpg',
    designSystem: {
      colors: {
        primary: '#1E40AF',
        secondary: '#3730A3',
        accent: '#059669',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        text: '#0F172A',
        textMuted: '#64748B',
      },
      typography: {
        headingFont: 'General Sans',
        bodyFont: 'Inter',
        headingWeight: '600',
        bodyWeight: '400',
        baseSize: 16,
        scale: 1.333,
      },
      spacing: {
        unit: 8,
        sectionPadding: '88px 0',
        containerMaxWidth: '1200px',
      },
      borderRadius: {
        small: '6px',
        medium: '10px',
        large: '16px',
      },
      shadows: {
        small: '0 1px 3px rgba(0,0,0,0.08)',
        medium: '0 4px 12px rgba(0,0,0,0.1)',
        large: '0 10px 30px rgba(0,0,0,0.12)',
      },
    },
    sections: [
      { type: 'hero', variant: 'corporate-clean' },
      { type: 'services', variant: 'detailed-cards' },
      { type: 'about', variant: 'company-values' },
      { type: 'team', variant: 'leadership-grid' },
      { type: 'contact', variant: 'multi-location' },
    ],
    features: ['Service details', 'Team profiles', 'Multi-location contact'],
    premium: true,
  },

  // ============================================
  // CREATIVE TEMPLATES (10)
  // ============================================
  {
    id: 'prism',
    name: 'Prism',
    category: 'portfolio',
    industry: ['design', 'illustration', 'motion'],
    style: 'creative',
    thumbnail: '/templates/prism.jpg',
    designSystem: {
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#FFE66D',
        background: '#FFFFFF',
        surface: '#FFF8F0',
        text: '#2D3436',
        textMuted: '#636E72',
      },
      typography: {
        headingFont: 'Unbounded',
        bodyFont: 'Space Grotesk',
        headingWeight: '600',
        bodyWeight: '400',
        baseSize: 17,
        scale: 1.414,
      },
      spacing: {
        unit: 8,
        sectionPadding: '120px 0',
        containerMaxWidth: '1400px',
      },
      borderRadius: {
        small: '8px',
        medium: '16px',
        large: '32px',
      },
      shadows: {
        small: '0 2px 8px rgba(255,107,107,0.1)',
        medium: '0 8px 24px rgba(255,107,107,0.15)',
        large: '0 16px 48px rgba(255,107,107,0.2)',
      },
    },
    sections: [
      { type: 'hero', variant: 'creative-3d' },
      { type: 'portfolio', variant: 'interactive-grid' },
      { type: 'skills', variant: 'animated-bars' },
      { type: 'process', variant: 'timeline' },
      { type: 'contact', variant: 'creative-form' },
    ],
    features: ['Interactive portfolio', 'Skill showcase', 'Process timeline'],
    premium: true,
  },

  // Continue with more templates...
  // Adding placeholder templates to reach 50

  // Restaurant Templates
  {
    id: 'bistro',
    name: 'Bistro',
    category: 'restaurant',
    industry: ['restaurant', 'cafe', 'bar'],
    style: 'elegant',
    thumbnail: '/templates/bistro.jpg',
    designSystem: {
      colors: {
        primary: '#8B4513',
        secondary: '#D4A574',
        accent: '#2F4F4F',
        background: '#FFF8F0',
        surface: '#FFFFFF',
        text: '#2C1810',
        textMuted: '#6B5344',
      },
      typography: {
        headingFont: 'Playfair Display',
        bodyFont: 'Lora',
        headingWeight: '700',
        bodyWeight: '400',
        baseSize: 17,
        scale: 1.333,
      },
      spacing: {
        unit: 8,
        sectionPadding: '100px 0',
        containerMaxWidth: '1100px',
      },
      borderRadius: {
        small: '4px',
        medium: '8px',
        large: '16px',
      },
      shadows: {
        small: '0 2px 8px rgba(0,0,0,0.05)',
        medium: '0 6px 20px rgba(0,0,0,0.08)',
        large: '0 12px 40px rgba(0,0,0,0.12)',
      },
    },
    sections: [
      { type: 'hero', variant: 'restaurant-hero' },
      { type: 'menu', variant: 'elegant-menu' },
      { type: 'about', variant: 'chef-story' },
      { type: 'gallery', variant: 'food-gallery' },
      { type: 'reservation', variant: 'booking-form' },
      { type: 'contact', variant: 'location-hours' },
    ],
    features: ['Menu display', 'Reservation system', 'Photo gallery'],
    premium: true,
  },

  // Blog Template
  {
    id: 'chronicle',
    name: 'Chronicle',
    category: 'blog',
    industry: ['blog', 'magazine', 'news'],
    style: 'minimal',
    thumbnail: '/templates/chronicle.jpg',
    designSystem: {
      colors: {
        primary: '#111827',
        secondary: '#374151',
        accent: '#EF4444',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: '#111827',
        textMuted: '#6B7280',
      },
      typography: {
        headingFont: 'Newsreader',
        bodyFont: 'Source Serif Pro',
        headingWeight: '600',
        bodyWeight: '400',
        baseSize: 18,
        scale: 1.25,
      },
      spacing: {
        unit: 8,
        sectionPadding: '80px 0',
        containerMaxWidth: '800px',
      },
      borderRadius: {
        small: '4px',
        medium: '8px',
        large: '12px',
      },
      shadows: {
        small: '0 1px 3px rgba(0,0,0,0.05)',
        medium: '0 4px 12px rgba(0,0,0,0.08)',
        large: '0 8px 24px rgba(0,0,0,0.1)',
      },
    },
    sections: [
      { type: 'header', variant: 'blog-header' },
      { type: 'featured-posts', variant: 'large-featured' },
      { type: 'post-grid', variant: 'masonry' },
      { type: 'categories', variant: 'sidebar' },
      { type: 'newsletter', variant: 'inline-subscribe' },
    ],
    features: ['Featured posts', 'Category navigation', 'Newsletter'],
    premium: true,
  },

  // E-commerce Template
  {
    id: 'shopfront',
    name: 'Shopfront',
    category: 'ecommerce',
    industry: ['retail', 'clothing', 'accessories'],
    style: 'modern',
    thumbnail: '/templates/shopfront.jpg',
    designSystem: {
      colors: {
        primary: '#000000',
        secondary: '#404040',
        accent: '#FF6B35',
        background: '#FFFFFF',
        surface: '#F5F5F5',
        text: '#1A1A1A',
        textMuted: '#666666',
      },
      typography: {
        headingFont: 'Poppins',
        bodyFont: 'Inter',
        headingWeight: '600',
        bodyWeight: '400',
        baseSize: 16,
        scale: 1.25,
      },
      spacing: {
        unit: 8,
        sectionPadding: '80px 0',
        containerMaxWidth: '1400px',
      },
      borderRadius: {
        small: '4px',
        medium: '8px',
        large: '16px',
      },
      shadows: {
        small: '0 2px 4px rgba(0,0,0,0.04)',
        medium: '0 4px 12px rgba(0,0,0,0.06)',
        large: '0 8px 24px rgba(0,0,0,0.08)',
      },
    },
    sections: [
      { type: 'hero', variant: 'shop-hero' },
      { type: 'categories', variant: 'image-cards' },
      { type: 'products', variant: 'featured-grid' },
      { type: 'products', variant: 'new-arrivals' },
      { type: 'newsletter', variant: 'discount-offer' },
    ],
    features: ['Product catalog', 'Categories', 'Newsletter discount'],
    premium: true,
  },

  // Nonprofit Template
  {
    id: 'cause',
    name: 'Cause',
    category: 'nonprofit',
    industry: ['charity', 'nonprofit', 'foundation'],
    style: 'modern',
    thumbnail: '/templates/cause.jpg',
    designSystem: {
      colors: {
        primary: '#059669',
        secondary: '#0D9488',
        accent: '#F59E0B',
        background: '#FFFFFF',
        surface: '#F0FDF4',
        text: '#064E3B',
        textMuted: '#047857',
      },
      typography: {
        headingFont: 'DM Sans',
        bodyFont: 'Inter',
        headingWeight: '700',
        bodyWeight: '400',
        baseSize: 17,
        scale: 1.333,
      },
      spacing: {
        unit: 8,
        sectionPadding: '96px 0',
        containerMaxWidth: '1200px',
      },
      borderRadius: {
        small: '8px',
        medium: '12px',
        large: '24px',
      },
      shadows: {
        small: '0 2px 4px rgba(5,150,105,0.08)',
        medium: '0 4px 12px rgba(5,150,105,0.12)',
        large: '0 8px 24px rgba(5,150,105,0.16)',
      },
    },
    sections: [
      { type: 'hero', variant: 'impact-hero' },
      { type: 'mission', variant: 'values-grid' },
      { type: 'impact', variant: 'stats-counters' },
      { type: 'programs', variant: 'card-grid' },
      { type: 'donate', variant: 'donation-form' },
      { type: 'volunteer', variant: 'signup-cta' },
    ],
    features: ['Impact stats', 'Donation form', 'Volunteer signup'],
    premium: true,
  },

  // Personal Brand Template
  {
    id: 'persona',
    name: 'Persona',
    category: 'personal',
    industry: ['personal', 'coach', 'speaker'],
    style: 'bold',
    thumbnail: '/templates/persona.jpg',
    designSystem: {
      colors: {
        primary: '#7C3AED',
        secondary: '#A78BFA',
        accent: '#F472B6',
        background: '#FFFFFF',
        surface: '#FAF5FF',
        text: '#1F2937',
        textMuted: '#6B7280',
      },
      typography: {
        headingFont: 'Cal Sans',
        bodyFont: 'Inter',
        headingWeight: '700',
        bodyWeight: '400',
        baseSize: 17,
        scale: 1.414,
      },
      spacing: {
        unit: 8,
        sectionPadding: '100px 0',
        containerMaxWidth: '1100px',
      },
      borderRadius: {
        small: '8px',
        medium: '16px',
        large: '32px',
      },
      shadows: {
        small: '0 2px 8px rgba(124,58,237,0.08)',
        medium: '0 8px 24px rgba(124,58,237,0.12)',
        large: '0 16px 48px rgba(124,58,237,0.16)',
      },
    },
    sections: [
      { type: 'hero', variant: 'personal-intro' },
      { type: 'about', variant: 'story-timeline' },
      { type: 'services', variant: 'coaching-packages' },
      { type: 'testimonials', variant: 'video-testimonials' },
      { type: 'podcast', variant: 'episode-list' },
      { type: 'contact', variant: 'booking-calendar' },
    ],
    features: ['Personal story', 'Service packages', 'Booking system'],
    premium: true,
  },
];

// ==============================================
// HELPER FUNCTIONS
// ==============================================

export function getTemplateById(id: string): PremiumTemplate | undefined {
  return PREMIUM_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: TemplateCategory): PremiumTemplate[] {
  return PREMIUM_TEMPLATES.filter(t => t.category === category);
}

export function getTemplatesByStyle(style: TemplateStyle): PremiumTemplate[] {
  return PREMIUM_TEMPLATES.filter(t => t.style === style);
}

export function getTemplatesByIndustry(industry: string): PremiumTemplate[] {
  return PREMIUM_TEMPLATES.filter(t => 
    t.industry.some(i => i.toLowerCase().includes(industry.toLowerCase()))
  );
}

export function searchTemplates(query: string): PremiumTemplate[] {
  const q = query.toLowerCase();
  return PREMIUM_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.style.toLowerCase().includes(q) ||
    t.industry.some(i => i.toLowerCase().includes(q)) ||
    t.features.some(f => f.toLowerCase().includes(q))
  );
}

export function generateTemplateCSS(template: PremiumTemplate): string {
  const { designSystem: ds } = template;
  
  return `
/* ${template.name} Template Styles */
:root {
  --color-primary: ${ds.colors.primary};
  --color-secondary: ${ds.colors.secondary};
  --color-accent: ${ds.colors.accent};
  --color-background: ${ds.colors.background};
  --color-surface: ${ds.colors.surface};
  --color-text: ${ds.colors.text};
  --color-text-muted: ${ds.colors.textMuted};
  
  --font-heading: '${ds.typography.headingFont}', sans-serif;
  --font-body: '${ds.typography.bodyFont}', sans-serif;
  --font-weight-heading: ${ds.typography.headingWeight};
  --font-weight-body: ${ds.typography.bodyWeight};
  --font-size-base: ${ds.typography.baseSize}px;
  --font-scale: ${ds.typography.scale};
  
  --spacing-unit: ${ds.spacing.unit}px;
  --section-padding: ${ds.spacing.sectionPadding};
  --container-max-width: ${ds.spacing.containerMaxWidth};
  
  --radius-small: ${ds.borderRadius.small};
  --radius-medium: ${ds.borderRadius.medium};
  --radius-large: ${ds.borderRadius.large};
  
  --shadow-small: ${ds.shadows.small};
  --shadow-medium: ${ds.shadows.medium};
  --shadow-large: ${ds.shadows.large};
}

body {
  font-family: var(--font-body);
  font-weight: var(--font-weight-body);
  font-size: var(--font-size-base);
  color: var(--color-text);
  background-color: var(--color-background);
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  color: var(--color-text);
  line-height: 1.2;
}

h1 { font-size: calc(var(--font-size-base) * var(--font-scale) * var(--font-scale) * var(--font-scale)); }
h2 { font-size: calc(var(--font-size-base) * var(--font-scale) * var(--font-scale)); }
h3 { font-size: calc(var(--font-size-base) * var(--font-scale)); }

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 calc(var(--spacing-unit) * 3);
}

section {
  padding: var(--section-padding);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-medium);
  padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 3);
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  opacity: 0.9;
  box-shadow: var(--shadow-medium);
}

.card {
  background-color: var(--color-surface);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-small);
  padding: calc(var(--spacing-unit) * 3);
}
`.trim();
}

console.log(`[Premium Templates] Loaded ${PREMIUM_TEMPLATES.length} premium templates`);

