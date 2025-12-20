/**
 * Structured Design Thinking Engine v5.0
 * Answers 5 key questions to guide design generation
 * Uses industry templates for accurate industry-specific design
 */

import * as fs from 'fs';
import * as path from 'path';

export interface DesignContext {
  audience: {
    demographics: string[];
    psychographics: string[];
    technicalProficiency: 'low' | 'medium' | 'high';
    goals: string[];
    painPoints: string[];
  };
  emotionalTone: 'professional' | 'friendly' | 'premium' | 'innovative' | 'trustworthy' | 'exciting';
  brandVoice: {
    formality: 'formal' | 'casual' | 'balanced';
    technicality: 'technical' | 'simple' | 'balanced';
    boldness: 'bold' | 'subtle' | 'balanced';
    modernity: 'modern' | 'traditional' | 'balanced';
  };
  userGoal: 'learn' | 'book' | 'purchase' | 'signup' | 'contact' | 'explore';
  pageObjective: {
    valueProposition: string;
    trustBuilding: boolean;
    frictionRemoval: boolean;
    actionGuidance: boolean;
  };
}

export interface DesignOutputs {
  moodboard: {
    colors: string[];
    typography: string;
    imageryStyle: string;
    overallFeel: string;
  };
  sectionSequence: string[];
  contentOutline: {
    headlines: string[];
    subheadings: string[];
    bodyCopy: string[];
  };
  layoutDiagram: string; // ASCII or JSON
  componentRecommendations: string[];
}

/**
 * Load industry template
 */
function loadIndustryTemplate(industry: string): any {
  try {
    const templatesPath = path.join(process.cwd(), 'website_quality_standards/design-llm-knowledge/industry-templates.json');
    const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));
    
    // Find matching industry (case-insensitive, partial match)
    const industryLower = industry.toLowerCase();
    const template = templates.industries.find((t: any) => 
      t.id.toLowerCase().includes(industryLower) ||
      t.name.toLowerCase().includes(industryLower) ||
      industryLower.includes(t.id.toLowerCase()) ||
      industryLower.includes(t.name.toLowerCase())
    );
    
    return template || templates.industries[0]; // Default to first if not found
  } catch (error) {
    console.warn('[Design Thinking] Could not load industry templates, using defaults');
    return null;
  }
}

/**
 * Analyze project config and generate design context
 * Uses industry templates for accurate industry-specific design
 */
export function generateDesignContext(projectConfig: any): DesignContext {
  // Load industry template
  const industryTemplate = loadIndustryTemplate(projectConfig.industry);
  
  // Infer audience from config or template
  const demographics = projectConfig.targetAudiences || [];
  const technicalProficiency = inferTechnicalProficiency(projectConfig.industry);
  
  // Use template tone of voice if available, otherwise infer
  const emotionalTone = industryTemplate?.toneOfVoice 
    ? parseToneOfVoice(industryTemplate.toneOfVoice)
    : inferEmotionalTone(projectConfig.industry, projectConfig.toneOfVoice);
  
  // Infer brand voice from tone of voice
  const brandVoice = inferBrandVoice(projectConfig.toneOfVoice || industryTemplate?.toneOfVoice);
  
  // Use template conversion goal if available
  const userGoal = industryTemplate?.conversionGoal 
    ? mapConversionGoalToUserGoal(industryTemplate.conversionGoal)
    : inferUserGoal(projectConfig.industry);
  
  // Generate page objectives
  const pageObjective = {
    valueProposition: `Help ${projectConfig.targetAudiences?.[0] || 'users'} understand ${projectConfig.services?.[0]?.name || 'our services'}`,
    trustBuilding: industryTemplate?.trustRequirements?.length > 0 || true,
    frictionRemoval: true,
    actionGuidance: true
  };
  
  return {
    audience: {
      demographics,
      psychographics: inferPsychographics(projectConfig.industry),
      technicalProficiency,
      goals: inferGoals(projectConfig.industry),
      painPoints: inferPainPoints(projectConfig.industry)
    },
    emotionalTone,
    brandVoice,
    userGoal,
    pageObjective
  };
}

/**
 * Parse tone of voice string to emotional tone
 */
function parseToneOfVoice(toneString: string): DesignContext['emotionalTone'] {
  const tone = toneString.toLowerCase();
  if (tone.includes('authoritative') || tone.includes('trustworthy')) return 'trustworthy';
  if (tone.includes('friendly')) return 'friendly';
  if (tone.includes('premium') || tone.includes('luxurious')) return 'premium';
  if (tone.includes('innovative') || tone.includes('modern')) return 'innovative';
  if (tone.includes('professional')) return 'professional';
  if (tone.includes('exciting') || tone.includes('energetic')) return 'exciting';
  return 'professional';
}

/**
 * Map conversion goal to user goal
 */
function mapConversionGoalToUserGoal(conversionGoal: string): DesignContext['userGoal'] {
  const goal = conversionGoal.toLowerCase();
  if (goal.includes('book') || goal.includes('appointment') || goal.includes('consultation')) return 'book';
  if (goal.includes('sign') || goal.includes('enroll') || goal.includes('register')) return 'signup';
  if (goal.includes('purchase') || goal.includes('buy') || goal.includes('cart')) return 'purchase';
  if (goal.includes('contact') || goal.includes('quote') || goal.includes('request')) return 'contact';
  return 'learn';
}

/**
 * Generate design outputs from context
 */
export function generateDesignOutputs(context: DesignContext, industry: string): DesignOutputs {
  // Generate moodboard
  const moodboard = generateMoodboard(context, industry);
  
  // Generate section sequence
  const sectionSequence = generateSectionSequence(context.userGoal, industry);
  
  // Generate content outline
  const contentOutline = generateContentOutline(context, industry);
  
  // Generate layout diagram (simplified JSON)
  const layoutDiagram = generateLayoutDiagram(sectionSequence);
  
  // Generate component recommendations
  const componentRecommendations = generateComponentRecommendations(context, industry);
  
  return {
    moodboard,
    sectionSequence,
    contentOutline,
    layoutDiagram,
    componentRecommendations
  };
}

/**
 * Helper functions
 */
function inferTechnicalProficiency(industry: string): 'low' | 'medium' | 'high' {
  const highTech = ['SaaS', 'Tech', 'Software', 'IT'];
  const mediumTech = ['Finance', 'Real Estate', 'Ecommerce'];
  if (highTech.some(i => industry.toLowerCase().includes(i.toLowerCase()))) return 'high';
  if (mediumTech.some(i => industry.toLowerCase().includes(i.toLowerCase()))) return 'medium';
  return 'low';
}

function inferEmotionalTone(industry: string, toneOfVoice: string): DesignContext['emotionalTone'] {
  if (toneOfVoice) {
    const tone = toneOfVoice.toLowerCase();
    if (tone.includes('professional')) return 'professional';
    if (tone.includes('friendly')) return 'friendly';
    if (tone.includes('premium')) return 'premium';
    if (tone.includes('innovative')) return 'innovative';
    if (tone.includes('trustworthy')) return 'trustworthy';
    if (tone.includes('exciting')) return 'exciting';
  }
  
  const industryTones: Record<string, DesignContext['emotionalTone']> = {
    'law': 'trustworthy',
    'medical': 'trustworthy',
    'saas': 'innovative',
    'creative': 'exciting',
    'finance': 'professional',
    'ecommerce': 'friendly'
  };
  
  return industryTones[industry.toLowerCase()] || 'professional';
}

function inferBrandVoice(toneOfVoice: string): DesignContext['brandVoice'] {
  const tone = (toneOfVoice || '').toLowerCase();
  
  return {
    formality: tone.includes('formal') ? 'formal' : tone.includes('casual') ? 'casual' : 'balanced',
    technicality: tone.includes('technical') ? 'technical' : tone.includes('simple') ? 'simple' : 'balanced',
    boldness: tone.includes('bold') ? 'bold' : tone.includes('subtle') ? 'subtle' : 'balanced',
    modernity: tone.includes('modern') ? 'modern' : tone.includes('traditional') ? 'traditional' : 'balanced'
  };
}

function inferUserGoal(industry: string): DesignContext['userGoal'] {
  const goals: Record<string, DesignContext['userGoal']> = {
    'law': 'book',
    'medical': 'book',
    'saas': 'signup',
    'ecommerce': 'purchase',
    'creative': 'contact',
    'real estate': 'contact'
  };
  
  return goals[industry.toLowerCase()] || 'learn';
}

function inferPsychographics(industry: string): string[] {
  const psychographics: Record<string, string[]> = {
    'law': ['seeking expertise', 'needs reassurance', 'values trust'],
    'medical': ['health-conscious', 'seeking care', 'needs trust'],
    'saas': ['tech-savvy', 'efficiency-focused', 'innovation-seeking'],
    'creative': ['aesthetic-focused', 'trend-aware', 'uniqueness-seeking']
  };
  
  return psychographics[industry.toLowerCase()] || ['value-focused', 'quality-seeking'];
}

function inferGoals(industry: string): string[] {
  const goals: Record<string, string[]> = {
    'law': ['Get legal advice', 'Find representation', 'Understand services'],
    'medical': ['Book appointment', 'Learn about treatments', 'Find doctor'],
    'saas': ['Solve problem', 'Increase efficiency', 'Try product'],
    'ecommerce': ['Find products', 'Compare options', 'Make purchase']
  };
  
  return goals[industry.toLowerCase()] || ['Learn more', 'Get information'];
}

function inferPainPoints(industry: string): string[] {
  const painPoints: Record<string, string[]> = {
    'law': ['Legal complexity', 'Uncertainty', 'Cost concerns'],
    'medical': ['Health concerns', 'Appointment availability', 'Insurance'],
    'saas': ['Complexity', 'Integration', 'Cost'],
    'ecommerce': ['Product quality', 'Shipping', 'Returns']
  };
  
  return painPoints[industry.toLowerCase()] || ['Finding right solution', 'Trust'];
}

function generateMoodboard(context: DesignContext, industry: string): DesignOutputs['moodboard'] {
  // Load color palette knowledge with error handling
  let palette: any = { primary: '#3b82f6', secondary: '#10b981', accent: '#f59e0b', neutrals: ['#f3f4f6', '#e5e7eb', '#9ca3af'] };
  try {
    const colorPalettesPath = path.join(process.cwd(), 'website_quality_standards/design-llm-knowledge/color-palettes.json');
    if (fs.existsSync(colorPalettesPath)) {
      const colorPalettes = JSON.parse(fs.readFileSync(colorPalettesPath, 'utf-8'));
      const foundPalette = colorPalettes.palettes?.find((p: any) => 
        p.industry?.includes(industry) || p.industry?.includes('default')
      );
      if (foundPalette) palette = foundPalette;
      else if (colorPalettes.palettes?.[0]) palette = colorPalettes.palettes[0];
    }
  } catch (error) {
    console.warn('[DesignThinking] Could not load color palettes, using defaults:', error);
  }
  
  // Load typography knowledge with error handling
  let typography: any = { heading: { font: 'Inter' }, body: { font: 'Inter' } };
  try {
    const typographyPath = path.join(process.cwd(), 'website_quality_standards/design-llm-knowledge/typography-pairings.json');
    if (fs.existsSync(typographyPath)) {
      const typographyPairings = JSON.parse(fs.readFileSync(typographyPath, 'utf-8'));
      if (typographyPairings.pairings?.[0]) {
        typography = typographyPairings.pairings[0];
      }
    }
  } catch (error) {
    console.warn('[DesignThinking] Could not load typography pairings, using defaults:', error);
  }
  
  return {
    colors: [palette.primary, palette.secondary, palette.accent, ...palette.neutrals],
    typography: `${typography.heading.font} + ${typography.body.font}`,
    imageryStyle: context.emotionalTone === 'premium' ? 'High-quality, professional photography' : 
                  context.emotionalTone === 'friendly' ? 'Warm, approachable imagery' :
                  'Professional, clean imagery',
    overallFeel: `${context.emotionalTone}, ${context.brandVoice.modernity}, ${context.brandVoice.boldness}`
  };
}

function generateSectionSequence(userGoal: string, industry: string): string[] {
  // Try to load industry template for required sections
  try {
    const templatesPath = path.join(process.cwd(), 'website_quality_standards/design-llm-knowledge/industry-templates.json');
    const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));
    const industryLower = industry.toLowerCase();
    const template = templates.industries.find((t: any) => 
      t.id.toLowerCase().includes(industryLower) ||
      t.name.toLowerCase().includes(industryLower) ||
      industryLower.includes(t.id.toLowerCase()) ||
      industryLower.includes(t.name.toLowerCase())
    );
    
    if (template && template.requiredSections) {
      // Map template sections to our section types
      return template.requiredSections.map((s: string) => {
        // Map common section names
        if (s.includes('hero')) return 'hero';
        if (s.includes('services') || s.includes('practice-areas')) return 'services';
        if (s.includes('testimonials') || s.includes('reviews')) return 'testimonials';
        if (s.includes('faq')) return 'faq';
        if (s.includes('cta')) return 'cta';
        if (s.includes('contact')) return 'contact';
        if (s.includes('pricing')) return 'pricing';
        if (s.includes('portfolio')) return 'portfolio';
        if (s.includes('team') || s.includes('profiles')) return 'team';
        return s;
      });
    }
  } catch (error) {
    // Fall through to default sequences
  }
  
  // Default sequences
  const sequences: Record<string, string[]> = {
    'book': ['hero', 'value-proposition', 'services', 'testimonials', 'cta', 'contact'],
    'signup': ['hero', 'features', 'pricing', 'testimonials', 'cta', 'faq'],
    'purchase': ['hero', 'products', 'benefits', 'testimonials', 'cta', 'trust'],
    'contact': ['hero', 'about', 'services', 'testimonials', 'cta', 'contact'],
    'learn': ['hero', 'value-proposition', 'content', 'features', 'cta', 'faq']
  };
  
  return sequences[userGoal] || sequences['learn'];
}

function generateContentOutline(context: DesignContext, industry: string): DesignOutputs['contentOutline'] {
  return {
    headlines: [
      `Main value proposition for ${context.audience.demographics[0] || 'users'}`,
      `Key benefit or feature`,
      `Secondary benefit or feature`
    ],
    subheadings: [
      `Supporting statement`,
      `Additional detail`,
      `Call to action context`
    ],
    bodyCopy: [
      `Detailed explanation of value`,
      `Specific benefits and features`,
      `Trust-building content`
    ]
  };
}

function generateLayoutDiagram(sectionSequence: string[]): string {
  return JSON.stringify({
    sections: sectionSequence.map((type, index) => ({
      order: index + 1,
      type,
      layout: 'to-be-determined',
      components: []
    }))
  }, null, 2);
}

function generateComponentRecommendations(context: DesignContext, industry: string): string[] {
  const baseComponents = ['navigation', 'hero', 'footer'];
  const industryComponents: Record<string, string[]> = {
    'law': ['testimonials', 'certifications', 'attorney-bios', 'contact-form'],
    'medical': ['appointment-booking', 'doctor-profiles', 'services-grid', 'testimonials'],
    'saas': ['features-grid', 'pricing-table', 'testimonials', 'cta-band'],
    'ecommerce': ['product-grid', 'testimonials', 'trust-badges', 'cta-band']
  };
  
  return [...baseComponents, ...(industryComponents[industry.toLowerCase()] || ['features', 'testimonials', 'cta'])];
}

