/**
 * Layout Engine 3.0
 * Merlin 7.0 - Module 5
 * Three-layer system: Blueprint (deterministic) → Variant (AI-driven) → Responsive
 */

import OpenAI from 'openai';
import type { ProjectConfig } from '../services/projectConfig';
import type { LayoutBlueprint, BlueprintSection, SectionVariant, LayoutVariant } from '../types/layoutBlueprint';
import type { IndustryProfile } from './industryEngine';
import type { PlannedPage } from '../types/plannedPage';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface GeneratedLayout {
  blueprint: LayoutBlueprint;
  selectedVariant: LayoutVariant;
  sections: GeneratedSection[];
  responsive: ResponsiveLayout;
}

export interface GeneratedSection {
  id: string;
  type: string;
  variant: SectionVariant;
  order: number;
  content: SectionContent;
  responsive: SectionResponsiveRules;
}

export interface SectionContent {
  headline?: string;
  subheadline?: string;
  description?: string;
  items?: SectionItem[];
  cta?: {
    text: string;
    link: string;
    style: string;
  };
}

export interface SectionItem {
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

export interface ResponsiveLayout {
  mobile: LayoutBreakpoint;
  tablet: LayoutBreakpoint;
  desktop: LayoutBreakpoint;
}

export interface LayoutBreakpoint {
  breakpoint: string;
  layout: string;
  sections: SectionBreakpoint[];
}

export interface SectionBreakpoint {
  sectionId: string;
  visible: boolean;
  order: number;
  layout: string;
}

export interface SectionResponsiveRules {
  mobile: {
    visible: boolean;
    order: number;
    layout: string;
  };
  tablet: {
    visible: boolean;
    order: number;
    layout: string;
  };
  desktop: {
    visible: boolean;
    order: number;
    layout: string;
  };
}

/**
 * Create OpenAI client
 */
function createOpenAIClient(): OpenAI | null {
  if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
}

/**
 * Generate layout for a page
 */
export async function generateLayout(
  page: PlannedPage,
  projectConfig: ProjectConfig,
  industryProfile: IndustryProfile
): Promise<GeneratedLayout> {
  // Layer A: Select blueprint (deterministic)
  const blueprint = selectBlueprint(industryProfile.archetype);
  
  // Layer B: Select variant (AI-driven)
  const variant = await selectVariant(blueprint, projectConfig, industryProfile);
  
  // Layer C: Generate responsive rules
  const responsive = generateResponsiveLayout(blueprint, variant);
  
  // Generate sections
  const sections = await generateSections(page, blueprint, variant, projectConfig);
  
  return {
    blueprint,
    selectedVariant: variant,
    sections,
    responsive,
  };
}

/**
 * Select blueprint based on archetype
 */
function selectBlueprint(archetype: string): LayoutBlueprint {
  const blueprints: Record<string, LayoutBlueprint> = {
    'service-business': createServiceBusinessBlueprint(),
    'e-commerce': createECommerceBlueprint(),
    'portfolio': createPortfolioBlueprint(),
    'saas': createSaaSBlueprint(),
    'restaurant': createRestaurantBlueprint(),
    'healthcare': createHealthcareBlueprint(),
    'legal': createLegalBlueprint(),
  };
  
  return blueprints[archetype] || blueprints['service-business'];
}

/**
 * Create service business blueprint
 */
function createServiceBusinessBlueprint(): LayoutBlueprint {
  return {
    id: 'service-business',
    name: 'Service Business',
    description: 'Professional service business layout',
    industry: ['consulting', 'professional-services'],
    sections: [
      {
        id: 'hero',
        type: 'hero',
        order: 1,
        required: true,
        variants: [
          {
            id: 'hero-split-left',
            name: 'Split Left',
            layout: 'split',
            alignment: 'left',
            columns: 2,
            description: 'Content left, image right',
            bestFor: ['professional', 'trust'],
          },
          {
            id: 'hero-centered',
            name: 'Centered',
            layout: 'centered',
            alignment: 'center',
            columns: 1,
            description: 'Centered hero with CTA',
            bestFor: ['modern', 'minimal'],
          },
        ],
        responsive: {
          mobile: { visible: true, order: 1, layout: 'stack' },
          tablet: { visible: true, order: 1, layout: 'stack' },
          desktop: { visible: true, order: 1, layout: 'split' },
        },
      },
      {
        id: 'services',
        type: 'services',
        order: 2,
        required: true,
        variants: [
          {
            id: 'services-grid-3',
            name: '3-Column Grid',
            layout: 'grid',
            alignment: 'center',
            columns: 3,
            description: 'Service cards in 3-column grid',
            bestFor: ['multiple-services'],
          },
        ],
        responsive: {
          mobile: { visible: true, order: 2, layout: 'single' },
          tablet: { visible: true, order: 2, layout: 'two-column' },
          desktop: { visible: true, order: 2, layout: 'grid' },
        },
      },
    ],
    responsive: {
      mobile: {
        breakpoint: '768px',
        layout: 'stack',
        typography: 'normal',
        spacing: 'compact',
      },
      tablet: {
        breakpoint: '1024px',
        layout: 'two-column',
        typography: 'normal',
        spacing: 'normal',
      },
      desktop: {
        breakpoint: '1280px',
        layout: 'full',
        typography: 'enhanced',
        spacing: 'comfortable',
      },
    },
    variants: [],
  };
}

/**
 * Create other blueprints (simplified for now)
 */
function createECommerceBlueprint(): LayoutBlueprint {
  return createServiceBusinessBlueprint(); // Simplified
}

function createPortfolioBlueprint(): LayoutBlueprint {
  return createServiceBusinessBlueprint(); // Simplified
}

function createSaaSBlueprint(): LayoutBlueprint {
  return createServiceBusinessBlueprint(); // Simplified
}

function createRestaurantBlueprint(): LayoutBlueprint {
  return createServiceBusinessBlueprint(); // Simplified
}

function createHealthcareBlueprint(): LayoutBlueprint {
  return createServiceBusinessBlueprint(); // Simplified
}

function createLegalBlueprint(): LayoutBlueprint {
  return createServiceBusinessBlueprint(); // Simplified
}

/**
 * Select variant using AI
 */
async function selectVariant(
  blueprint: LayoutBlueprint,
  projectConfig: ProjectConfig,
  industryProfile: IndustryProfile
): Promise<LayoutVariant> {
  const openai = createOpenAIClient();
  
  if (!openai) {
    // Fallback: select first variant
    return {
      id: 'default',
      name: 'Default',
      description: 'Default layout variant',
      industry: [industryProfile.archetype],
      sectionOrder: blueprint.sections.map(s => s.id),
      style: 'modern',
      complexity: 'moderate',
    };
  }
  
  try {
    const prompt = `Select the best layout variant for:
- Industry: ${projectConfig.industry}
- Archetype: ${industryProfile.archetype}
- Tone: ${projectConfig.toneOfVoice}
- Available sections: ${blueprint.sections.map(s => s.id).join(', ')}

Return JSON with selected variant details.`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a layout expert. Select optimal layout variants.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    
    const variant = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      id: variant.id || 'default',
      name: variant.name || 'Default',
      description: variant.description || '',
      industry: variant.industry || [industryProfile.archetype],
      sectionOrder: variant.sectionOrder || blueprint.sections.map(s => s.id),
      style: variant.style || 'modern',
      complexity: variant.complexity || 'moderate',
    };
  } catch (error: unknown) {
    logError(error, 'Layout Engine - Select variant');
    return {
      id: 'default',
      name: 'Default',
      description: 'Default layout variant',
      industry: [industryProfile.archetype],
      sectionOrder: blueprint.sections.map(s => s.id),
      style: 'modern',
      complexity: 'moderate',
    };
  }
}

/**
 * Generate responsive layout
 */
function generateResponsiveLayout(
  blueprint: LayoutBlueprint,
  _variant: LayoutVariant
): ResponsiveLayout {
  return {
    mobile: {
      breakpoint: blueprint.responsive.mobile.breakpoint,
      layout: blueprint.responsive.mobile.layout,
      sections: blueprint.sections.map(s => ({
        sectionId: s.id,
        visible: s.responsive.mobile.visible,
        order: s.responsive.mobile.order,
        layout: s.responsive.mobile.layout,
      })),
    },
    tablet: {
      breakpoint: blueprint.responsive.tablet.breakpoint,
      layout: blueprint.responsive.tablet.layout,
      sections: blueprint.sections.map(s => ({
        sectionId: s.id,
        visible: s.responsive.tablet.visible,
        order: s.responsive.tablet.order,
        layout: s.responsive.tablet.layout,
      })),
    },
    desktop: {
      breakpoint: blueprint.responsive.desktop.breakpoint,
      layout: blueprint.responsive.desktop.layout,
      sections: blueprint.sections.map(s => ({
        sectionId: s.id,
        visible: s.responsive.desktop.visible,
        order: s.responsive.desktop.order,
        layout: s.responsive.desktop.layout,
      })),
    },
  };
}

/**
 * Generate sections
 */
async function generateSections(
  _page: PlannedPage,
  blueprint: LayoutBlueprint,
  _variant: LayoutVariant,
  _projectConfig: ProjectConfig
): Promise<GeneratedSection[]> {
  const sections: GeneratedSection[] = [];
  
  for (const blueprintSection of blueprint.sections) {
    // Select variant for this section
    const sectionVariant = blueprintSection.variants[0] || {
      id: 'default',
      name: 'Default',
      layout: 'centered',
      alignment: 'center',
      columns: 1,
      description: '',
      bestFor: [],
    };
    
    sections.push({
      id: blueprintSection.id,
      type: blueprintSection.type,
      variant: sectionVariant,
      order: blueprintSection.order,
      content: {
        headline: `${blueprintSection.type} Section`,
        description: `Content for ${blueprintSection.type} section`,
      },
      responsive: {
        mobile: blueprintSection.responsive.mobile,
        tablet: blueprintSection.responsive.tablet,
        desktop: blueprintSection.responsive.desktop,
      },
    });
  }
  
  return sections;
}

