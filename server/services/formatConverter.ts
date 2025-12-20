/**
 * Format Converter
 * Converts wizard requirements format to v5.0 projectConfig format
 */

import type { ProjectConfig } from './projectConfig';
import { generateProjectSlug as createProjectSlug } from './projectConfig';
import type { InvestigationResults } from './websiteInvestigation';

export interface WebsiteRequirements {
  businessName?: string;
  businessType?: string;
  targetAudience?: string;
  primaryColor?: string;
  secondaryColor?: string;
  style?: string;
  pages?: string[];
  country?: string;
  region?: string;
  city?: string;
  services?: Array<{
    name: string;
    description?: string;
    shortDescription?: string;
  }>;
  toneOfVoice?: string;
  brandPreferences?: {
    colorPalette?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    fontPreferences?: {
      heading?: string;
      body?: string;
    };
  };
  specialNotes?: string;
  [key: string]: any; // Allow other fields
}

/**
 * Convert wizard requirements to v5.0 projectConfig
 */
export function convertRequirementsToProjectConfig(
  requirements: WebsiteRequirements,
  investigation: InvestigationResults | null = null
): ProjectConfig {
  const projectName = requirements.businessName || 'My Website';
  const projectSlug = createProjectSlug(projectName);
  
  // Extract location
  const location = {
    city: requirements.city || requirements.region || 'Unknown',
    region: requirements.region || requirements.country || 'Unknown',
    country: requirements.country || 'Unknown'
  };
  
  // Extract target audiences
  const targetAudiences = requirements.targetAudience
    ? [requirements.targetAudience]
    : ['General Audience'];
  
  // Extract services
  const services = (requirements.services || []).map(service => ({
    name: service.name,
    shortDescription: service.shortDescription || service.description || `${service.name} services`
  }));
  
  // Extract pages to generate
  const pagesToGenerate = requirements.pages || ['Home', 'Services', 'About', 'Contact'];
  
  // Extract tone of voice
  const toneOfVoice = requirements.toneOfVoice || requirements.style || 'Professional, trustworthy';
  
  // Extract brand preferences (use investigation results if available)
  const brandPreferences = requirements.brandPreferences || {};
  if (requirements.primaryColor || requirements.secondaryColor || investigation?.designRecommendations) {
    brandPreferences.colorPalette = {
      primary: requirements.primaryColor || investigation?.designRecommendations?.colorScheme?.primary || requirements.brandPreferences?.colorPalette?.primary,
      secondary: requirements.secondaryColor || requirements.brandPreferences?.colorPalette?.secondary,
      accent: investigation?.designRecommendations?.colorScheme?.accent || requirements.brandPreferences?.colorPalette?.accent
    };
    
    // Use investigation typography recommendations if available
    if (investigation?.designRecommendations?.typography) {
      brandPreferences.fontPreferences = {
        heading: investigation.designRecommendations.typography.heading || requirements.brandPreferences?.fontPreferences?.heading,
        body: investigation.designRecommendations.typography.body || requirements.brandPreferences?.fontPreferences?.body
      };
    }
  }
  
  return {
    projectName,
    projectSlug,
    industry: requirements.businessType || 'Professional Services',
    location,
    targetAudiences,
    toneOfVoice,
    brandPreferences: Object.keys(brandPreferences).length > 0 ? brandPreferences : undefined,
    services,
    pagesToGenerate,
    specialNotes: requirements.specialNotes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

