/**
 * Intake Engine
 * Merlin 7.0 - Module 1
 * Upgraded from v6.10: 15-field fast mode + 40-field enterprise mode
 */

import type { ProjectConfig } from '../services/projectConfig';
import { generateProjectSlug } from '../services/projectConfig';

export interface IntakeFormData {
  // Fast Mode (15 fields)
  businessName: string;
  businessType: string;
  location: {
    city: string;
    region: string;
    country: string;
  };
  services: Array<{
    name: string;
    description: string;
  }>;
  targetAudience: string;
  primaryGoal: string;
  tone: string;
  
  // Enterprise Mode (25 additional fields)
  competitorUrl?: string;
  brandColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  brandFonts?: {
    heading?: string;
    body?: string;
  };
  existingWebsite?: string;
  specificRequirements?: string;
  budget?: string;
  timeline?: string;
  integrations?: string[];
  cms?: string;
  analytics?: string[];
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  legalPages?: string[];
  customPages?: string[];
  stylePreferences?: {
    modern?: boolean;
    minimalist?: boolean;
    bold?: boolean;
    elegant?: boolean;
  };
  colorPreferences?: string[];
  exampleSites?: string[];
  contentTone?: 'professional' | 'friendly' | 'casual' | 'luxury' | 'tech';
  seoFocus?: string[];
  targetKeywords?: string[];
}

export interface ExtractedBrand {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  tone: string;
  style: string;
  logo?: string;
}

export interface CompetitorAnalysis {
  url: string;
  designPatterns: string[];
  colorSchemes: string[];
  layoutStructure: string[];
  contentStrategy: string[];
  seoKeywords: string[];
  strengths: string[];
  weaknesses: string[];
}

/**
 * Process intake form data
 */
export function processIntakeForm(data: IntakeFormData): {
  projectConfig: ProjectConfig;
  brandExtraction?: ExtractedBrand;
  competitorAnalysis?: CompetitorAnalysis;
} {
  // Generate project slug
  const projectSlug = generateProjectSlug(data.businessName);
  
  // Determine pages to generate
  const pagesToGenerate = determinePages(data);
  
  // Create project config
  const projectConfig: ProjectConfig = {
    projectName: data.businessName,
    projectSlug,
    industry: data.businessType,
    location: data.location,
    targetAudiences: [data.targetAudience],
    toneOfVoice: data.tone,
    brandPreferences: {
      colorPalette: data.brandColors,
      fontPreferences: data.brandFonts,
    },
    services: data.services.map(s => ({
      name: s.name,
      shortDescription: s.description,
    })),
    pagesToGenerate,
    specialNotes: data.specificRequirements,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Extract brand if colors/fonts provided
  let brandExtraction: ExtractedBrand | undefined;
  if (data.brandColors || data.brandFonts) {
    brandExtraction = extractBrand(data);
  }
  
  return {
    projectConfig,
    brandExtraction,
  };
}

/**
 * Determine which pages to generate based on business type and requirements
 */
function determinePages(data: IntakeFormData): string[] {
  const pages: string[] = ['Home'];
  
  // Always include these
  if (data.services && data.services.length > 0) {
    pages.push('Services');
  }
  pages.push('About', 'Contact');
  
  // Legal pages if specified
  if (data.legalPages && data.legalPages.length > 0) {
    pages.push(...data.legalPages);
  }
  
  // Custom pages
  if (data.customPages && data.customPages.length > 0) {
    pages.push(...data.customPages);
  }
  
  // Industry-specific pages
  const industry = data.businessType.toLowerCase();
  if (industry.includes('portfolio') || industry.includes('creative')) {
    pages.push('Portfolio');
  }
  if (industry.includes('blog') || industry.includes('content')) {
    pages.push('Blog');
  }
  if (industry.includes('booking') || industry.includes('appointment')) {
    pages.push('Bookings');
  }
  if (industry.includes('pricing') || industry.includes('saas')) {
    pages.push('Pricing');
  }
  
  // FAQ if enterprise mode
  if (data.specificRequirements) {
    pages.push('FAQ');
  }
  
  return [...new Set(pages)]; // Remove duplicates
}

/**
 * Extract brand information from form data
 */
function extractBrand(data: IntakeFormData): ExtractedBrand {
  return {
    colors: {
      primary: data.brandColors?.primary || '#3B82F6',
      secondary: data.brandColors?.secondary || '#10B981',
      accent: data.brandColors?.accent || '#F59E0B',
      background: '#FFFFFF',
      text: '#1F2937',
    },
    fonts: {
      heading: data.brandFonts?.heading || 'Inter',
      body: data.brandFonts?.body || 'Inter',
    },
    tone: data.contentTone || data.tone || 'professional',
    style: determineStyle(data),
  };
}

/**
 * Determine style from preferences
 */
function determineStyle(data: IntakeFormData): string {
  if (data.stylePreferences?.modern) return 'modern';
  if (data.stylePreferences?.minimalist) return 'minimalist';
  if (data.stylePreferences?.bold) return 'bold';
  if (data.stylePreferences?.elegant) return 'elegant';
  return 'modern'; // Default
}

/**
 * Validate intake form data
 */
export function validateIntakeForm(data: IntakeFormData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!data.businessName || data.businessName.trim().length === 0) {
    errors.push('Business name is required');
  }
  
  if (!data.businessType || data.businessType.trim().length === 0) {
    errors.push('Business type is required');
  }
  
  if (!data.location?.city || data.location.city.trim().length === 0) {
    errors.push('City is required');
  }
  
  if (!data.services || data.services.length === 0) {
    errors.push('At least one service is required');
  }
  
  if (!data.targetAudience || data.targetAudience.trim().length === 0) {
    errors.push('Target audience is required');
  }
  
  if (!data.primaryGoal || data.primaryGoal.trim().length === 0) {
    errors.push('Primary goal is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

