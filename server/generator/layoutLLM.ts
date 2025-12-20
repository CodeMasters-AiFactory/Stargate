/**
 * Layout Generator v5.0
 * Generates wireframe structures, section patterns, and responsive layouts
 * Uses world-class homepage blueprints for structure
 */

import * as fs from 'fs';
import * as path from 'path';
import type { DesignContext, DesignOutputs } from './designThinking';
import { chooseVariantForSection } from './sectionVariantResolver';
import type { SectionPlan } from '../ai/layoutPlannerLLM';

/**
 * Load homepage blueprints
 */
function loadHomepageBlueprints(): any {
  try {
    const blueprintsPath = path.join(process.cwd(), 'website_quality_standards/design-llm-knowledge/homepage-blueprints.json');
    return JSON.parse(fs.readFileSync(blueprintsPath, 'utf-8'));
  } catch (error) {
    console.warn('[Layout Generator] Could not load homepage blueprints, using defaults');
    return null;
  }
}

/**
 * Auto-detect best blueprint for project
 */
function detectBestBlueprint(industry: string, _projectConfig: any, context: DesignContext): any {
  const blueprints = loadHomepageBlueprints();
  if (!blueprints) return null;
  
  const industryLower = industry.toLowerCase();
  
  // Score each blueprint based on industry match
  const scoredBlueprints = blueprints.blueprints.map((blueprint: any) => {
    let score = 0;
    
    // Check industry match
    if (blueprint.industryMatch) {
      blueprint.industryMatch.forEach((match: string) => {
        if (industryLower.includes(match.toLowerCase()) || match.toLowerCase().includes(industryLower)) {
          score += 10;
        }
      });
    }
    
    // Check bestFor categories
    if (blueprint.bestFor) {
      blueprint.bestFor.forEach((category: string) => {
        const categoryLower = category.toLowerCase();
        if (industryLower.includes(categoryLower) || categoryLower.includes(industryLower)) {
          score += 5;
        }
      });
    }
    
    // Check emotional tone match
    const toneMatch = blueprint.tone.toLowerCase();
    const contextTone = context.emotionalTone;
    if (toneMatch.includes(contextTone) || contextTone.includes(toneMatch.split(' ')[0])) {
      score += 3;
    }
    
    return { blueprint, score };
  });
  
  // Sort by score and return best match
  scoredBlueprints.sort((a: any, b: any) => b.score - a.score);
  
  // Return best match if score > 0, otherwise return first blueprint
  return scoredBlueprints[0].score > 0 ? scoredBlueprints[0].blueprint : blueprints.blueprints[0];
}

export interface LayoutStructure {
  sections: SectionDefinition[];
  wireframe: string;
  responsiveBreakpoints: number[];
  blueprint?: string;
}

export interface SectionDefinition {
  type: string;
  layout: string;
  components: string[];
  imageUrl?: string;
  imageAlt?: string;
  supportImages?: Array<{ url: string; alt: string }>;  // v6.5: Additional images
  imagePlans?: Array<{ sectionKey: string; purpose: string; prompt: string; styleHint?: string; alt?: string }>;  // v6.5: Planned images
  copy?: { sectionKey: string; headline: string; subheadline?: string; paragraph?: string; bullets?: string[]; ctaLabel?: string; ctaDescription?: string };  // v6.6: LLM-generated copy
  grid?: string;
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  spacing: 'small' | 'medium' | 'large' | 'extra-large';
  variantId?: string;    // v6.3: Variant identifier (e.g., "hero-split-left")
  variantMeta?: any;     // v6.3: Variant metadata from catalog
  key?: string;          // v6.5: Section key for image mapping
}

/**
 * Generate complete layout structure
 * Uses world-class homepage blueprints when available
 */
export function generateLayout(
  designOutputs: DesignOutputs,
  context: DesignContext,
  industry: string,
  projectConfig?: any,
  sectionPlan?: { sections: SectionPlan[] } | null
): LayoutStructure {
  // Try to detect and use best blueprint
  const blueprint = detectBestBlueprint(industry, projectConfig, context);
  
  if (blueprint && blueprint.structure) {
    // Use blueprint structure
    const sections: SectionDefinition[] = blueprint.structure.map((blueprintSection: any, index: number) => {
      return generateSectionFromBlueprint(blueprintSection, context, industry, sectionPlan, index);
    });
    
    const wireframe = generateWireframe(sections);
    
    return {
      sections,
      wireframe,
      responsiveBreakpoints: [390, 768, 1024, 1440],
      blueprint: blueprint.id
    };
  }
  
  // Fallback to original method
  const layoutPatterns = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'website_quality_standards/design-llm-knowledge/layout-patterns.json'),
      'utf-8'
    )
  );
  
  const heroDesigns = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'website_quality_standards/design-llm-knowledge/hero-designs.json'),
      'utf-8'
    )
  );
  
  const sections: SectionDefinition[] = designOutputs.sectionSequence.map((sectionType, index) => {
    const section = generateSection(sectionType, index, layoutPatterns, heroDesigns, context, industry);
    // v6.3: Add variant selection
    const plannedSection = sectionPlan?.sections?.find(s => s.type === sectionType);
    const variant = chooseVariantForSection(sectionType, context, plannedSection || null, industry);
    section.variantId = variant.variantId;
    section.variantMeta = variant.variantMeta;
    // v6.5: Assign section key for image mapping
    if (plannedSection) {
      section.key = plannedSection.key;
    } else {
      // Generate key if not in plan
      section.key = `${sectionType}-${index + 1}`;
    }
    return section;
  });
  
  const wireframe = generateWireframe(sections);
  
  return {
    sections,
    wireframe,
    responsiveBreakpoints: [390, 768, 1024, 1440]
  };
}

/**
 * Generate section from blueprint definition
 */
function generateSectionFromBlueprint(
  blueprintSection: any,
  _context: DesignContext,
  _industry: string,
  sectionPlan?: { sections: SectionPlan[] } | null,
  index?: number
): SectionDefinition {
  const sectionType = blueprintSection.type;
  const plannedSection = sectionPlan?.sections?.find(s => s.type === sectionType);
  
  return {
    type: sectionType,
    layout: blueprintSection.layout,
    components: blueprintSection.components || [],
    breakpoints: {
      mobile: getMobileLayout(blueprintSection.layout),
      tablet: getTabletLayout(blueprintSection.layout),
      desktop: blueprintSection.layout
    },
    spacing: blueprintSection.spacing as any || 'medium',
    // v6.5: Assign section key for image mapping
    key: plannedSection?.key || `${sectionType}-${(index || 0) + 1}`
  };
}

/**
 * Get mobile layout variant
 */
function getMobileLayout(layout: string): string {
  if (layout.includes('grid-3-column')) return '1-column';
  if (layout.includes('grid-2-column')) return '1-column';
  if (layout.includes('grid-4-column')) return '1-column';
  if (layout.includes('split')) return 'stacked';
  if (layout.includes('horizontal')) return 'vertical';
  return 'stacked';
}

/**
 * Get tablet layout variant
 */
function getTabletLayout(layout: string): string {
  if (layout.includes('grid-3-column')) return '2-column';
  if (layout.includes('grid-4-column')) return '2-column';
  if (layout.includes('split')) return 'split';
  return layout;
}

/**
 * Generate individual section definition
 */
function generateSection(
  sectionType: string,
  _index: number,
  _layoutPatterns: any,
  heroDesigns: any,
  context: DesignContext,
  industry: string
): SectionDefinition {
  
  // Hero section
  if (sectionType === 'hero') {
    const heroDesign = selectHeroDesign(heroDesigns, context, industry);
    return {
      type: 'hero',
      layout: heroDesign.id,
      components: heroDesign.components,
      breakpoints: {
        mobile: 'stacked',
        tablet: heroDesign.alignment === 'center' ? 'centered' : 'split',
        desktop: heroDesign.alignment === 'center' ? 'centered' : 'split-50-50'
      },
      spacing: heroDesign.spacing as any
    };
  }
  
  // Features section
  if (sectionType === 'features' || sectionType === 'services') {
    return {
      type: 'features',
      layout: 'grid-3-column',
      components: ['card', 'icon', 'heading', 'description'],
      grid: '3-column',
      breakpoints: {
        mobile: '1-column',
        tablet: '2-column',
        desktop: '3-column'
      },
      spacing: 'medium'
    };
  }
  
  // Testimonials section
  if (sectionType === 'testimonials') {
    return {
      type: 'testimonials',
      layout: 'carousel',
      components: ['quote', 'avatar', 'name', 'title', 'company'],
      breakpoints: {
        mobile: '1-column',
        tablet: '2-column',
        desktop: '3-column'
      },
      spacing: 'medium'
    };
  }
  
  // CTA section
  if (sectionType === 'cta') {
    return {
      type: 'cta',
      layout: 'centered-single',
      components: ['heading', 'subheading', 'cta-primary'],
      breakpoints: {
        mobile: 'centered',
        tablet: 'centered',
        desktop: 'centered'
      },
      spacing: 'large'
    };
  }
  
  // Contact section
  if (sectionType === 'contact') {
    return {
      type: 'contact',
      layout: 'split-form',
      components: ['heading', 'form', 'info', 'map'],
      breakpoints: {
        mobile: 'stacked',
        tablet: 'split',
        desktop: 'split-50-50'
      },
      spacing: 'large'
    };
  }
  
  // Default section
  return {
    type: sectionType,
    layout: 'centered',
    components: ['heading', 'content'],
    breakpoints: {
      mobile: 'stacked',
      tablet: 'centered',
      desktop: 'centered'
    },
    spacing: 'medium'
  };
}

/**
 * Select appropriate hero design
 */
function selectHeroDesign(heroDesigns: any, context: DesignContext, industry: string): any {
  // Match hero to emotional tone and industry
  if (context.emotionalTone === 'premium') {
    return heroDesigns.heroes.find((h: any) => h.id === 'full-screen') || heroDesigns.heroes[0];
  }
  
  if (industry.toLowerCase().includes('saas') || industry.toLowerCase().includes('tech')) {
    return heroDesigns.heroes.find((h: any) => h.id === 'split-content-left') || heroDesigns.heroes[0];
  }
  
  if (context.emotionalTone === 'friendly') {
    return heroDesigns.heroes.find((h: any) => h.id === 'centered-with-image') || heroDesigns.heroes[0];
  }
  
  return heroDesigns.heroes[0]; // Default: centered minimal
}

/**
 * Generate ASCII wireframe
 */
function generateWireframe(sections: SectionDefinition[]): string {
  let wireframe = 'WEBSITE WIREFRAME\n';
  wireframe += '==================\n\n';
  
  sections.forEach((section, index) => {
    wireframe += `Section ${index + 1}: ${section.type.toUpperCase()}\n`;
    wireframe += `${'='.repeat(40)}\n`;
    wireframe += `Layout: ${section.layout}\n`;
    wireframe += `Components: ${section.components.join(', ')}\n`;
    wireframe += `Breakpoints:\n`;
    wireframe += `  Mobile: ${section.breakpoints.mobile}\n`;
    wireframe += `  Tablet: ${section.breakpoints.tablet}\n`;
    wireframe += `  Desktop: ${section.breakpoints.desktop}\n`;
    wireframe += `Spacing: ${section.spacing}\n\n`;
  });
  
  return wireframe;
}

/**
 * Save layout to JSON
 */
export function saveLayout(layout: LayoutStructure, outputPath: string): void {
  const layoutDir = path.dirname(outputPath);
  if (!fs.existsSync(layoutDir)) {
    fs.mkdirSync(layoutDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(layout, null, 2));
}

