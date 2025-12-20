/**
 * AI Quick-Start Generator Service
 * Converts 5-question quick start data into full project configuration
 * Then triggers website generation
 */

import type { ProjectConfig } from '@/types/projectConfig';

export interface QuickStartData {
  businessName: string;
  industry: string;
  location: string;
  primaryGoal: string;
  style: string;
}

/**
 * Convert quick start data to full project configuration
 */
export function convertQuickStartToProjectConfig(data: QuickStartData): ProjectConfig {
  // Parse location
  const locationParts = data.location.split(',').map(s => s.trim());
  const city = locationParts[0] || '';
  const region = locationParts[1] || '';
  const country = locationParts[2] || region || '';

  // Map style to tone
  const styleToTone: Record<string, string> = {
    modern: 'Modern and Clean',
    professional: 'Professional and Trustworthy',
    creative: 'Creative and Bold',
    elegant: 'Elegant and Sophisticated',
    friendly: 'Friendly and Approachable',
    tech: 'Innovative and Cutting-Edge',
  };

  // Map goal to pages and features
  const goalToPages: Record<string, string[]> = {
    'Get More Customers': ['home', 'about', 'services', 'testimonials', 'contact'],
    'Sell Products Online': ['home', 'products', 'about', 'contact'],
    'Showcase Portfolio': ['home', 'portfolio', 'about', 'contact'],
    'Book Appointments': ['home', 'services', 'book', 'about', 'contact'],
    'Share Information': ['home', 'about', 'blog', 'contact'],
    'Build Brand Awareness': ['home', 'about', 'story', 'contact'],
  };

  // Determine if e-commerce is needed
  const needsEcommerce = data.primaryGoal === 'Sell Products Online';

  // Generate color palette based on style
  const styleToColors: Record<string, { primary: string; secondary: string; accent: string }> = {
    modern: { primary: '#3b82f6', secondary: '#1e40af', accent: '#60a5fa' },
    professional: { primary: '#1f2937', secondary: '#111827', accent: '#4b5563' },
    creative: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' },
    elegant: { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' },
    friendly: { primary: '#10b981', secondary: '#059669', accent: '#34d399' },
    tech: { primary: '#06b6d4', secondary: '#0891b2', accent: '#22d3ee' },
  };

  const colors = styleToColors[data.style] || styleToColors.modern;

  return {
    projectName: data.businessName,
    projectSlug: data.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    industry: data.industry,
    location: {
      city,
      region,
      country,
    },
    targetAudiences: inferTargetAudience(data.industry, data.primaryGoal),
    toneOfVoice: styleToTone[data.style] || 'Professional',
    brandPreferences: {
      colorPalette: {
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
      },
      fontPreferences: inferFontPreferences(data.style),
    },
    services: inferServices(data.industry, data.primaryGoal),
    pagesToGenerate: goalToPages[data.primaryGoal] || ['home', 'about', 'contact'],
    needsEcommerce,
    specialNotes: `Quick-start generated. Primary goal: ${data.primaryGoal}. Style: ${data.style}.`,
  };
}

/**
 * Infer target audience based on industry and goal
 */
function inferTargetAudience(industry: string, _goal: string): string[] {
  const audiences: Record<string, string[]> = {
    'Restaurant & Food': ['Local residents', 'Food enthusiasts', 'Tourists'],
    'Retail & E-commerce': ['Online shoppers', 'Price-conscious consumers'],
    'Professional Services': ['Business owners', 'Decision makers', 'Professionals'],
    'Healthcare & Medical': ['Patients', 'Health-conscious individuals'],
    'Real Estate': ['Home buyers', 'Property investors', 'Renters'],
    'Fitness & Wellness': ['Fitness enthusiasts', 'Health-conscious individuals'],
    'Education & Training': ['Students', 'Lifelong learners', 'Parents'],
    'Technology & Software': ['Tech-savvy users', 'Businesses', 'Developers'],
    'Creative & Design': ['Art lovers', 'Creative professionals', 'Brands'],
    'Home Services': ['Homeowners', 'Property managers'],
    'Beauty & Personal Care': ['Beauty enthusiasts', 'Self-care focused individuals'],
    'Automotive': ['Car enthusiasts', 'Vehicle owners'],
  };

  return audiences[industry] || ['General audience'];
}

/**
 * Infer services based on industry
 */
function inferServices(industry: string, goal: string): Array<{ name: string; shortDescription: string }> {
  const serviceMap: Record<string, Array<{ name: string; shortDescription: string }>> = {
    'Restaurant & Food': [
      { name: 'Dining', shortDescription: 'Delicious meals in a welcoming atmosphere' },
      { name: 'Catering', shortDescription: 'Event catering services' },
    ],
    'Retail & E-commerce': [
      { name: 'Product Sales', shortDescription: 'Quality products at great prices' },
      { name: 'Fast Shipping', shortDescription: 'Quick and reliable delivery' },
    ],
    'Professional Services': [
      { name: 'Consultation', shortDescription: 'Expert advice and guidance' },
      { name: 'Solutions', shortDescription: 'Tailored solutions for your needs' },
    ],
  };

  return serviceMap[industry] || [
    { name: 'Our Services', shortDescription: 'Quality services tailored to your needs' },
  ];
}

/**
 * Infer font preferences based on style
 */
function inferFontPreferences(style: string): string[] {
  const fontMap: Record<string, string[]> = {
    modern: ['Sans-serif', 'Clean', 'Minimal'],
    professional: ['Serif', 'Traditional', 'Readable'],
    creative: ['Display', 'Unique', 'Bold'],
    elegant: ['Serif', 'Elegant', 'Sophisticated'],
    friendly: ['Sans-serif', 'Rounded', 'Approachable'],
    tech: ['Sans-serif', 'Geometric', 'Modern'],
  };

  return fontMap[style] || ['Sans-serif', 'Clean'];
}

/**
 * Generate website from quick start data
 */
export async function generateWebsiteFromQuickStart(
  data: QuickStartData,
  generateWebsiteFn: (config: ProjectConfig) => Promise<any>
): Promise<any> {
  const projectConfig = convertQuickStartToProjectConfig(data);
  return await generateWebsiteFn(projectConfig);
}

