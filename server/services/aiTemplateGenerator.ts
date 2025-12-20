/**
 * AI Template Generator
 * 
 * Generates website templates automatically using AI:
 * - Industry-specific templates
 * - Style variations (modern, classic, bold, minimal)
 * - Color scheme variations
 * - Layout variations
 * - Component configurations
 * 
 * Goal: Generate 5,000+ unique templates programmatically
 */

import { generate, generateDesign, generateContent } from './multiModelAIOrchestrator';

// Industry categories for template generation
export const INDUSTRIES = [
  'restaurant', 'cafe', 'bakery', 'food-truck', 'catering', 'bar', 'brewery', 'winery',
  'law-firm', 'accounting', 'consulting', 'real-estate', 'insurance', 'financial-advisor',
  'dentist', 'doctor', 'veterinarian', 'therapist', 'chiropractor', 'spa', 'salon', 'barber',
  'gym', 'yoga-studio', 'martial-arts', 'personal-trainer', 'nutritionist',
  'plumber', 'electrician', 'hvac', 'landscaping', 'cleaning', 'pest-control', 'roofing', 'painting',
  'auto-repair', 'auto-detailing', 'car-dealership', 'motorcycle', 'towing',
  'photography', 'videography', 'wedding-planner', 'event-planning', 'dj', 'musician',
  'web-design', 'software', 'it-services', 'cybersecurity', 'saas', 'startup', 'agency',
  'clothing-boutique', 'jewelry', 'furniture', 'home-decor', 'electronics', 'pet-store',
  'school', 'tutoring', 'music-lessons', 'art-classes', 'driving-school', 'daycare',
  'church', 'nonprofit', 'charity', 'foundation', 'community-center',
  'hotel', 'bed-breakfast', 'vacation-rental', 'tour-operator', 'travel-agency',
  'construction', 'architect', 'interior-design', 'engineering', 'manufacturing',
  'farm', 'nursery', 'garden-center', 'florist', 'organic-market',
  'podcast', 'blog', 'influencer', 'portfolio', 'resume', 'personal-brand',
] as const;

export type Industry = typeof INDUSTRIES[number];

// Style variations
export const STYLES = [
  'modern', 'classic', 'bold', 'minimal', 'elegant', 'playful', 'corporate', 'creative',
  'dark', 'light', 'colorful', 'monochrome', 'gradient', 'flat', 'glassmorphism', 'neumorphism',
] as const;

export type Style = typeof STYLES[number];

// Layout types
export const LAYOUTS = [
  'hero-centered', 'hero-left', 'hero-right', 'hero-split', 'hero-video',
  'grid', 'masonry', 'cards', 'timeline', 'sidebar',
] as const;

export type Layout = typeof LAYOUTS[number];

// Template structure
export interface GeneratedTemplate {
  id: string;
  name: string;
  industry: Industry;
  style: Style;
  layout: Layout;
  description: string;
  thumbnail?: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  sections: TemplateSection[];
  metadata: {
    createdAt: Date;
    tags: string[];
    popularity: number;
    aiGenerated: boolean;
  };
}

export interface TemplateSection {
  type: 'hero' | 'features' | 'about' | 'services' | 'testimonials' | 'cta' | 'contact' | 'gallery' | 'pricing' | 'team' | 'faq' | 'stats' | 'blog' | 'footer';
  layout: string;
  content: {
    headline?: string;
    subheadline?: string;
    body?: string;
    cta?: string;
    items?: any[];
  };
  style: Record<string, string>;
}

// Font pairings for different styles
const FONT_PAIRINGS: Record<Style, Array<{ heading: string; body: string }>> = {
  modern: [
    { heading: 'Inter', body: 'Inter' },
    { heading: 'Poppins', body: 'Open Sans' },
    { heading: 'Outfit', body: 'Source Sans Pro' },
  ],
  classic: [
    { heading: 'Playfair Display', body: 'Lora' },
    { heading: 'Merriweather', body: 'Georgia' },
    { heading: 'Libre Baskerville', body: 'Source Serif Pro' },
  ],
  bold: [
    { heading: 'Oswald', body: 'Roboto' },
    { heading: 'Bebas Neue', body: 'Montserrat' },
    { heading: 'Anton', body: 'Nunito' },
  ],
  minimal: [
    { heading: 'Space Grotesk', body: 'Space Grotesk' },
    { heading: 'Work Sans', body: 'Work Sans' },
    { heading: 'Manrope', body: 'Manrope' },
  ],
  elegant: [
    { heading: 'Cormorant Garamond', body: 'Montserrat' },
    { heading: 'DM Serif Display', body: 'DM Sans' },
    { heading: 'Cinzel', body: 'Raleway' },
  ],
  playful: [
    { heading: 'Fredoka One', body: 'Quicksand' },
    { heading: 'Pacifico', body: 'Nunito' },
    { heading: 'Bangers', body: 'Comic Neue' },
  ],
  corporate: [
    { heading: 'IBM Plex Sans', body: 'IBM Plex Sans' },
    { heading: 'Roboto', body: 'Roboto' },
    { heading: 'Noto Sans', body: 'Noto Sans' },
  ],
  creative: [
    { heading: 'Righteous', body: 'Poppins' },
    { heading: 'Titan One', body: 'Lato' },
    { heading: 'Rubik', body: 'Rubik' },
  ],
  dark: [
    { heading: 'Inter', body: 'Inter' },
    { heading: 'JetBrains Mono', body: 'Inter' },
    { heading: 'Space Grotesk', body: 'Space Grotesk' },
  ],
  light: [
    { heading: 'Nunito', body: 'Nunito' },
    { heading: 'Lato', body: 'Lato' },
    { heading: 'Open Sans', body: 'Open Sans' },
  ],
  colorful: [
    { heading: 'Comfortaa', body: 'Quicksand' },
    { heading: 'Fredoka', body: 'Nunito' },
    { heading: 'Baloo 2', body: 'Open Sans' },
  ],
  monochrome: [
    { heading: 'Archivo Black', body: 'Archivo' },
    { heading: 'Oswald', body: 'Open Sans' },
    { heading: 'Anton', body: 'Roboto' },
  ],
  gradient: [
    { heading: 'Plus Jakarta Sans', body: 'Plus Jakarta Sans' },
    { heading: 'Outfit', body: 'Outfit' },
    { heading: 'Sora', body: 'Sora' },
  ],
  flat: [
    { heading: 'Rubik', body: 'Rubik' },
    { heading: 'Overpass', body: 'Overpass' },
    { heading: 'Maven Pro', body: 'Maven Pro' },
  ],
  glassmorphism: [
    { heading: 'Plus Jakarta Sans', body: 'Inter' },
    { heading: 'DM Sans', body: 'DM Sans' },
    { heading: 'Outfit', body: 'Outfit' },
  ],
  neumorphism: [
    { heading: 'Quicksand', body: 'Quicksand' },
    { heading: 'Nunito', body: 'Nunito' },
    { heading: 'Comfortaa', body: 'Comfortaa' },
  ],
};

// Color palettes by style
const STYLE_COLOR_PALETTES: Record<Style, Array<GeneratedTemplate['colorScheme']>> = {
  modern: [
    { primary: '#3B82F6', secondary: '#1E40AF', accent: '#F59E0B', background: '#FFFFFF', text: '#1F2937' },
    { primary: '#8B5CF6', secondary: '#6D28D9', accent: '#EC4899', background: '#FFFFFF', text: '#1F2937' },
    { primary: '#10B981', secondary: '#047857', accent: '#6366F1', background: '#FFFFFF', text: '#1F2937' },
  ],
  classic: [
    { primary: '#1E3A5F', secondary: '#0A1929', accent: '#C9A227', background: '#FFFEF7', text: '#2C3E50' },
    { primary: '#8B4513', secondary: '#654321', accent: '#DAA520', background: '#FFF8F0', text: '#3E2723' },
    { primary: '#2F4F4F', secondary: '#1C3434', accent: '#B8860B', background: '#F5F5F5', text: '#2F4F4F' },
  ],
  bold: [
    { primary: '#FF0000', secondary: '#CC0000', accent: '#FFD700', background: '#000000', text: '#FFFFFF' },
    { primary: '#FF6B00', secondary: '#CC5500', accent: '#00FF00', background: '#1A1A1A', text: '#FFFFFF' },
    { primary: '#E91E63', secondary: '#C2185B', accent: '#00BCD4', background: '#121212', text: '#FFFFFF' },
  ],
  minimal: [
    { primary: '#000000', secondary: '#333333', accent: '#666666', background: '#FFFFFF', text: '#000000' },
    { primary: '#1A1A1A', secondary: '#404040', accent: '#808080', background: '#FAFAFA', text: '#1A1A1A' },
    { primary: '#2C3E50', secondary: '#34495E', accent: '#7F8C8D', background: '#FFFFFF', text: '#2C3E50' },
  ],
  elegant: [
    { primary: '#D4AF37', secondary: '#B8860B', accent: '#8B7355', background: '#0A0A0A', text: '#F5F5F5' },
    { primary: '#C9A227', secondary: '#A78B00', accent: '#8B4513', background: '#1C1C1C', text: '#ECECEC' },
    { primary: '#E6C200', secondary: '#CC9900', accent: '#8B6914', background: '#121212', text: '#F0F0F0' },
  ],
  playful: [
    { primary: '#FF6B6B', secondary: '#EE5A5A', accent: '#4ECDC4', background: '#FFFFFF', text: '#2D3436' },
    { primary: '#A855F7', secondary: '#9333EA', accent: '#FACC15', background: '#FFF5F5', text: '#1F2937' },
    { primary: '#06B6D4', secondary: '#0891B2', accent: '#F97316', background: '#FEFCE8', text: '#1E293B' },
  ],
  corporate: [
    { primary: '#0066CC', secondary: '#004C99', accent: '#00A651', background: '#F8FAFC', text: '#1E293B' },
    { primary: '#1E40AF', secondary: '#1E3A8A', accent: '#059669', background: '#FFFFFF', text: '#111827' },
    { primary: '#0F172A', secondary: '#1E293B', accent: '#3B82F6', background: '#F1F5F9', text: '#0F172A' },
  ],
  creative: [
    { primary: '#FF00FF', secondary: '#CC00CC', accent: '#00FFFF', background: '#1A0A2E', text: '#FFFFFF' },
    { primary: '#FF4081', secondary: '#F50057', accent: '#7C4DFF', background: '#0D0221', text: '#FFFFFF' },
    { primary: '#00E5FF', secondary: '#00B8D4', accent: '#FF4081', background: '#12002E', text: '#FFFFFF' },
  ],
  dark: [
    { primary: '#3B82F6', secondary: '#2563EB', accent: '#F59E0B', background: '#0F172A', text: '#F8FAFC' },
    { primary: '#8B5CF6', secondary: '#7C3AED', accent: '#EC4899', background: '#1E1B4B', text: '#F5F3FF' },
    { primary: '#10B981', secondary: '#059669', accent: '#6366F1', background: '#0C1716', text: '#ECFDF5' },
  ],
  light: [
    { primary: '#3B82F6', secondary: '#60A5FA', accent: '#F59E0B', background: '#FFFFFF', text: '#1F2937' },
    { primary: '#8B5CF6', secondary: '#A78BFA', accent: '#F472B6', background: '#FEFEFE', text: '#1F2937' },
    { primary: '#10B981', secondary: '#34D399', accent: '#818CF8', background: '#FAFAFA', text: '#1F2937' },
  ],
  colorful: [
    { primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#FFE66D', background: '#FFFFFF', text: '#2D3436' },
    { primary: '#FF9FF3', secondary: '#54A0FF', accent: '#5F27CD', background: '#FEFEFE', text: '#2D3436' },
    { primary: '#00D2D3', secondary: '#FF6B6B', accent: '#FFEAA7', background: '#FFFFFF', text: '#2D3436' },
  ],
  monochrome: [
    { primary: '#1A1A1A', secondary: '#333333', accent: '#4A4A4A', background: '#FFFFFF', text: '#1A1A1A' },
    { primary: '#FFFFFF', secondary: '#E0E0E0', accent: '#C0C0C0', background: '#0A0A0A', text: '#FFFFFF' },
    { primary: '#2C2C2C', secondary: '#404040', accent: '#5A5A5A', background: '#F5F5F5', text: '#2C2C2C' },
  ],
  gradient: [
    { primary: '#667EEA', secondary: '#764BA2', accent: '#F093FB', background: '#FFFFFF', text: '#1F2937' },
    { primary: '#11998E', secondary: '#38EF7D', accent: '#FDC830', background: '#FFFFFF', text: '#1F2937' },
    { primary: '#FC466B', secondary: '#3F5EFB', accent: '#FDEB71', background: '#FFFFFF', text: '#1F2937' },
  ],
  flat: [
    { primary: '#3498DB', secondary: '#2980B9', accent: '#E74C3C', background: '#ECF0F1', text: '#2C3E50' },
    { primary: '#1ABC9C', secondary: '#16A085', accent: '#E67E22', background: '#FFFFFF', text: '#34495E' },
    { primary: '#9B59B6', secondary: '#8E44AD', accent: '#F1C40F', background: '#FAFAFA', text: '#2C3E50' },
  ],
  glassmorphism: [
    { primary: '#6366F1', secondary: '#4F46E5', accent: '#F472B6', background: '#0F172A', text: '#F8FAFC' },
    { primary: '#06B6D4', secondary: '#0891B2', accent: '#A855F7', background: '#18181B', text: '#FAFAFA' },
    { primary: '#8B5CF6', secondary: '#7C3AED', accent: '#22D3EE', background: '#1E1B4B', text: '#F5F3FF' },
  ],
  neumorphism: [
    { primary: '#6C5CE7', secondary: '#5B4CC7', accent: '#FD79A8', background: '#E0E5EC', text: '#2D3436' },
    { primary: '#00CEC9', secondary: '#00B5B0', accent: '#FDCB6E', background: '#DFE6E9', text: '#2D3436' },
    { primary: '#A29BFE', secondary: '#9087E5', accent: '#FF7675', background: '#E4E9F0', text: '#2D3436' },
  ],
};

// Section configurations by industry
const INDUSTRY_SECTIONS: Record<string, TemplateSection['type'][]> = {
  restaurant: ['hero', 'about', 'gallery', 'pricing', 'testimonials', 'contact', 'footer'],
  'law-firm': ['hero', 'services', 'about', 'team', 'testimonials', 'faq', 'contact', 'footer'],
  dentist: ['hero', 'services', 'about', 'team', 'testimonials', 'faq', 'contact', 'footer'],
  gym: ['hero', 'features', 'pricing', 'testimonials', 'gallery', 'cta', 'contact', 'footer'],
  photography: ['hero', 'gallery', 'about', 'services', 'testimonials', 'pricing', 'contact', 'footer'],
  saas: ['hero', 'features', 'pricing', 'testimonials', 'faq', 'stats', 'cta', 'footer'],
  default: ['hero', 'about', 'services', 'testimonials', 'cta', 'contact', 'footer'],
};

/**
 * Generate a unique template ID
 */
function generateTemplateId(industry: Industry, style: Style, variant: number): string {
  return `tmpl_${industry}_${style}_v${variant}_${Date.now().toString(36)}`;
}

/**
 * Get random item from array
 */
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a single template
 */
export async function generateTemplate(
  industry: Industry,
  style: Style,
  variant: number = 0
): Promise<GeneratedTemplate> {
  // Select fonts and colors
  const fonts = randomItem(FONT_PAIRINGS[style]);
  const colors = randomItem(STYLE_COLOR_PALETTES[style]);
  const layout = randomItem([...LAYOUTS]);
  
  // Get sections for this industry
  const sectionTypes = INDUSTRY_SECTIONS[industry] || INDUSTRY_SECTIONS.default;
  
  // Generate template name
  const styleName = style.charAt(0).toUpperCase() + style.slice(1);
  const industryName = industry.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const name = `${styleName} ${industryName} Template ${variant + 1}`;
  
  // Generate sections (basic structure)
  const sections: TemplateSection[] = sectionTypes.map(type => ({
    type,
    layout: 'default',
    content: {
      headline: `${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      subheadline: `Professional ${industryName} content`,
    },
    style: {
      backgroundColor: type === 'hero' ? colors.primary : colors.background,
      color: type === 'hero' ? colors.text : colors.text,
    },
  }));
  
  return {
    id: generateTemplateId(industry, style, variant),
    name,
    industry,
    style,
    layout,
    description: `A ${styleName.toLowerCase()} template designed for ${industryName.toLowerCase()} businesses. Features a clean, professional design with optimized layout for conversions.`,
    colorScheme: colors,
    typography: {
      headingFont: fonts.heading,
      bodyFont: fonts.body,
    },
    sections,
    metadata: {
      createdAt: new Date(),
      tags: [industry, style, layout, 'ai-generated'],
      popularity: 0,
      aiGenerated: true,
    },
  };
}

/**
 * Generate AI-enhanced template with real content
 */
export async function generateEnhancedTemplate(
  industry: Industry,
  style: Style,
  businessName: string = 'Your Business'
): Promise<GeneratedTemplate> {
  const baseTemplate = await generateTemplate(industry, style);
  
  try {
    // Use multi-model AI to generate design and content
    const [design, content] = await Promise.all([
      generateDesign({
        businessName,
        industry,
        style,
      }),
      generateContent({
        businessName,
        industry,
        sectionType: 'hero',
        topic: 'main landing page',
      }),
    ]);
    
    // Apply AI-generated design
    baseTemplate.colorScheme = design.colorScheme;
    baseTemplate.typography = design.typography;
    
    // Apply AI-generated content to hero section
    const heroSection = baseTemplate.sections.find(s => s.type === 'hero');
    if (heroSection && content) {
      heroSection.content = {
        headline: content.headline,
        subheadline: content.subheadline,
        body: content.body,
        cta: content.cta,
      };
    }
    
    return baseTemplate;
  } catch (error) {
    console.warn('[TemplateGenerator] AI enhancement failed, using base template:', error);
    return baseTemplate;
  }
}

/**
 * Generate batch of templates for an industry
 */
export async function generateIndustryTemplates(
  industry: Industry,
  count: number = 10
): Promise<GeneratedTemplate[]> {
  const templates: GeneratedTemplate[] = [];
  const stylesPerIndustry = Math.ceil(count / STYLES.length);
  
  for (const style of STYLES) {
    for (let v = 0; v < stylesPerIndustry && templates.length < count; v++) {
      templates.push(await generateTemplate(industry, style, v));
    }
  }
  
  return templates;
}

/**
 * Generate full template library
 * Target: 5,000+ templates (70+ industries × 16 styles × ~5 variants each)
 */
export async function generateFullLibrary(): Promise<{
  totalGenerated: number;
  byIndustry: Record<string, number>;
  byStyle: Record<string, number>;
}> {
  const templates: GeneratedTemplate[] = [];
  const byIndustry: Record<string, number> = {};
  const byStyle: Record<string, number> = {};
  
  console.log(`[TemplateGenerator] Starting full library generation...`);
  console.log(`[TemplateGenerator] Industries: ${INDUSTRIES.length}, Styles: ${STYLES.length}`);
  
  for (const industry of INDUSTRIES) {
    byIndustry[industry] = 0;
    
    for (const style of STYLES) {
      // Generate 5 variants per industry/style combination
      for (let v = 0; v < 5; v++) {
        const template = await generateTemplate(industry, style, v);
        templates.push(template);
        byIndustry[industry]++;
        byStyle[style] = (byStyle[style] || 0) + 1;
      }
    }
    
    console.log(`[TemplateGenerator] Completed ${industry}: ${byIndustry[industry]} templates`);
  }
  
  console.log(`[TemplateGenerator] ✅ Library complete: ${templates.length} templates`);
  
  return {
    totalGenerated: templates.length,
    byIndustry,
    byStyle,
  };
}

/**
 * Get template statistics
 */
export function getTemplateStats(): {
  industries: number;
  styles: number;
  potentialTemplates: number;
  formula: string;
} {
  const potentialTemplates = INDUSTRIES.length * STYLES.length * 5; // 5 variants each
  
  return {
    industries: INDUSTRIES.length,
    styles: STYLES.length,
    potentialTemplates,
    formula: `${INDUSTRIES.length} industries × ${STYLES.length} styles × 5 variants = ${potentialTemplates} templates`,
  };
}

// Log stats on load
const stats = getTemplateStats();
console.log(`[AI Template Generator] 🎨 Loaded`);
console.log(`[AI Template Generator] ${stats.formula}`);

