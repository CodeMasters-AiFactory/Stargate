/**
 * Copywriting Engine 2.0 v5.0
 * FALLBACK: Template-based content generator
 * 
 * NOTE: In v6.x, this is used as a fallback when LLM content generation fails.
 * Primary content generation now uses:
 * - copywriterLLM.ts (v6.6) - AI copywriting for sections
 * - contentLLM.ts (v5.1) - LLM content generation
 * 
 * This module remains for:
 * - Fallback when OpenAI API is unavailable
 * - Quick generation without API calls
 * - Legacy compatibility
 * 
 * STATUS: Active fallback system - DO NOT REMOVE
 */

import * as fs from 'fs';
import * as path from 'path';
import type { DesignContext } from './designThinking';
import type { LayoutStructure, SectionDefinition } from './layoutLLM';

export interface ProjectConfig {
  projectName: string;
  projectSlug: string;
  industry: string;
  location?: {
    city: string;
    region?: string;
    country?: string;
  };
  targetAudiences?: string[];
  toneOfVoice?: string;
  services?: Array<{
    name: string;
    shortDescription?: string;
  }>;
  brandPreferences?: any;
}

export interface CopyContent {
  hero: {
    hook: string;
    headline: string;
    subheadline: string;
    cta: string;
  };
  valueProposition: string;
  tagline: string;
  sections: Array<{
    heading: string;
    body: string;
    cta?: string;
  }>;
  services: Array<{
    name: string;
    description: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

/**
 * Load industry template for copy guidance
 */
function loadIndustryTemplate(industry: string): any {
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
    return template || null;
  } catch (error) {
    return null;
  }
}

/**
 * Generate complete copy content
 * Uses industry templates for accurate industry-specific copy
 */
export function generateCopy(
  projectConfig: ProjectConfig,
  context: DesignContext,
  industry: string,
  layout?: LayoutStructure
): CopyContent {
  // Load industry template
  const industryTemplate = loadIndustryTemplate(industry);
  
  // Generate hero copy (with template guidance)
  const hero = generateHeroCopy(projectConfig, context, industryTemplate);
  
  // Generate value proposition
  const valueProposition = generateValueProposition(projectConfig, context);
  
  // Generate tagline
  const tagline = generateTagline(projectConfig, context);
  
  // Generate section copy (with template guidance) - NOW ACCEPTS LAYOUT
  const sections = generateSectionCopy(projectConfig, context, industry, industryTemplate, layout);
  
  // Generate services copy
  const services = generateServicesCopy(projectConfig);
  
  // Generate FAQ (with template guidance)
  const faq = generateFAQ(projectConfig, industry, industryTemplate);
  
  return {
    hero,
    valueProposition,
    tagline,
    sections,
    services,
    faq
  };
}

/**
 * Generate hero copy
 */
function generateHeroCopy(projectConfig: ProjectConfig, context: DesignContext, industryTemplate?: any): CopyContent['hero'] {
  const projectName = projectConfig.projectName;
  const primaryService = projectConfig.services?.[0]?.name || 'services';
  const location = projectConfig.location?.city || '';
  
  // Hook (attention-grabbing opening)
  const hooks = [
    `Transform your ${context.audience.goals[0] || 'business'}`,
    `Expert ${primaryService} in ${location}`,
    `Leading ${primaryService} solutions`,
    `${projectName}: Your trusted partner`
  ];
  
  // Headline (main value proposition)
  const headlines = [
    `${projectName} delivers ${primaryService} that ${context.audience.goals[0] || 'drive results'}`,
    `Professional ${primaryService} for ${context.audience.demographics[0] || 'your business'}`,
    `${primaryService} that ${context.pageObjective.valueProposition}`,
    `Experience ${primaryService} excellence`
  ];
  
  // Subheadline (supporting detail)
  const subheadlines = [
    `We help ${context.audience.demographics[0] || 'businesses'} ${context.audience.goals[0] || 'succeed'} with proven ${primaryService}`,
    `Trusted by ${context.audience.demographics[0] || 'clients'} in ${location}`,
    `Get started with ${primaryService} that ${context.pageObjective.valueProposition}`
  ];
  
  // CTA (action-oriented) - use template conversion goal if available
  let ctas: string[];
  if (industryTemplate?.conversionGoal) {
    const goal = industryTemplate.conversionGoal.toLowerCase();
    if (goal.includes('book')) {
      ctas = ['Book a Consultation', 'Schedule a Call', 'Book Now'];
    } else if (goal.includes('sign') || goal.includes('enroll')) {
      ctas = ['Start Free Trial', 'Get Started', 'Sign Up Now'];
    } else if (goal.includes('quote') || goal.includes('request')) {
      ctas = ['Request a Quote', 'Get a Quote', 'Request Information'];
    } else if (goal.includes('call')) {
      ctas = ['Call Now', 'Call Today', 'Get in Touch'];
    } else if (goal.includes('donate')) {
      ctas = ['Donate Now', 'Make a Donation', 'Support Us'];
    } else {
      ctas = ['Get Started', 'Learn More', 'Contact Us'];
    }
  } else {
    ctas = context.userGoal === 'book' ? [
      'Book a Consultation',
      'Schedule a Call',
      'Get Started Today'
    ] : context.userGoal === 'signup' ? [
      'Start Free Trial',
      'Get Started',
      'Sign Up Now'
    ] : [
      'Learn More',
      'Get Started',
      'Contact Us'
    ];
  }
  
  return {
    hook: hooks[0],
    headline: headlines[0],
    subheadline: subheadlines[0],
    cta: ctas[0]
  };
}

/**
 * Generate value proposition
 */
function generateValueProposition(projectConfig: ProjectConfig, context: DesignContext): string {
  const primaryService = projectConfig.services?.[0]?.name || 'services';
  const location = projectConfig.location?.city || '';
  
  return `${projectConfig.projectName} provides ${primaryService} that help ${context.audience.demographics[0] || 'clients'} ${context.audience.goals[0] || 'achieve their goals'}. Based in ${location}, we deliver ${context.emotionalTone} solutions tailored to your needs.`;
}

/**
 * Generate tagline
 */
function generateTagline(projectConfig: ProjectConfig, context: DesignContext): string {
  const taglines = [
    `${projectConfig.projectName}: ${context.pageObjective.valueProposition}`,
    `Your partner in ${projectConfig.services?.[0]?.name || 'excellence'}`,
    `Delivering ${context.emotionalTone} ${projectConfig.services?.[0]?.name || 'solutions'}`
  ];
  
  return taglines[0];
}

/**
 * Generate section copy - NOW GENERATES UNIQUE CONTENT PER SECTION TYPE
 */
function generateSectionCopy(
  projectConfig: ProjectConfig,
  context: DesignContext,
  industry: string,
  industryTemplate?: any,
  layout?: LayoutStructure
): CopyContent['sections'] {
  const sections: CopyContent['sections'] = [];
  
  // If layout is provided, generate content for each section in the layout
  if (layout && layout.sections) {
    layout.sections.forEach((sectionDef, index) => {
      // Skip hero section (handled separately)
      if (sectionDef.type === 'hero') {
        return;
      }
      
      // Generate unique content based on section type
      const sectionContent = generateContentForSectionType(
        sectionDef.type,
        projectConfig,
        context,
        industry,
        industryTemplate,
        index
      );
      
      if (sectionContent) {
        sections.push(sectionContent);
      }
    });
  } else {
    // Fallback: Generate default sections if no layout provided
    sections.push({
      heading: 'Why Choose Us',
      body: `We combine ${context.emotionalTone} service with ${context.brandVoice.modernity} expertise to deliver ${projectConfig.services?.[0]?.name || 'results'} that matter. Our team understands ${context.audience.painPoints[0] || 'your challenges'} and provides solutions tailored to your needs.`,
      cta: 'Learn More'
    });
    
    if (projectConfig.services && projectConfig.services.length > 0) {
      sections.push({
        heading: 'Our Services',
        body: `We offer comprehensive ${projectConfig.services.map(s => s.name).join(', ')} designed to help you ${context.audience.goals[0] || 'succeed'}. Each service is tailored to your specific needs and delivered with ${context.emotionalTone} care.`
      });
    }
  }
  
  return sections;
}

/**
 * Generate unique content for a specific section type
 */
export function generateContentForSectionType(
  sectionType: string,
  projectConfig: ProjectConfig,
  context: DesignContext,
  industry: string,
  industryTemplate: any,
  index: number
): CopyContent['sections'][0] | null {
  const location = projectConfig.location?.city || '';
  const primaryService = projectConfig.services?.[0]?.name || 'services';
  const industryLower = industry.toLowerCase();
  
  switch (sectionType) {
    case 'features':
    case 'services':
      return {
        heading: 'Our Services',
        body: `We offer comprehensive ${projectConfig.services?.map(s => s.name).join(', ') || primaryService} designed to help ${context.audience.demographics[0] || 'you'} ${context.audience.goals[0] || 'succeed'}. Each service is tailored to your specific needs and delivered with ${context.emotionalTone} care.`
      };
    
    case 'testimonials':
    case 'reviews':
      return {
        heading: 'What Our Clients Say',
        body: `Our ${context.emotionalTone} approach and commitment to excellence have earned the trust of ${context.audience.demographics[0] || 'clients'} across ${location || 'the region'}. We're proud to be your partner in ${primaryService}.`
      };
    
    case 'about':
    case 'team':
      return {
        heading: 'About Our Team',
        body: `Our experienced team brings ${context.brandVoice.modernity} expertise and ${context.emotionalTone} dedication to every project. We understand ${context.audience.painPoints[0] || 'your unique challenges'} and work closely with you to deliver results that matter.`
      };
    
    case 'process':
    case 'how-it-works':
      return {
        heading: 'How We Work',
        body: `Our proven process ensures that every ${primaryService} engagement is structured for success. We start by understanding your needs, then develop a customized approach that aligns with your goals.`
      };
    
    case 'value-proposition':
    case 'why-choose-us':
      return {
        heading: 'Why Choose Us',
        body: `We combine ${context.emotionalTone} service with ${context.brandVoice.modernity} expertise to deliver ${primaryService} that matter. Our team understands ${context.audience.painPoints[0] || 'your challenges'} and provides solutions tailored to your needs.`,
        cta: 'Learn More'
      };
    
    case 'case-studies':
    case 'portfolio':
      return {
        heading: 'Our Work',
        body: `See how we've helped ${context.audience.demographics[0] || 'clients'} achieve their goals through our ${primaryService}. Each project is a testament to our commitment to excellence and ${context.emotionalTone} service.`
      };
    
    case 'faq':
      return {
        heading: 'Frequently Asked Questions',
        body: `Have questions about our ${primaryService}? We've compiled answers to the most common questions to help you understand how we can help you ${context.audience.goals[0] || 'succeed'}.`
      };
    
    case 'contact':
      return {
        heading: 'Get In Touch',
        body: `Ready to get started? Contact us today to discuss how our ${primaryService} can help you ${context.audience.goals[0] || 'achieve your goals'}. We're here to answer your questions and provide the support you need.`,
        cta: 'Contact Us'
      };
    
    case 'cta':
      return {
        heading: 'Ready to Get Started?',
        body: `Take the next step towards ${context.audience.goals[0] || 'success'} with our ${primaryService}. We're here to help you every step of the way.`,
        cta: 'Get Started'
      };
    
    case 'pricing':
      return {
        heading: 'Pricing & Packages',
        body: `We offer flexible pricing options to suit your needs and budget. Whether you're looking for ${primaryService} on a one-time basis or ongoing support, we have a solution that works for you.`
      };
    
    default:
      // Generate unique content for unknown section types based on index
      const headings = [
        'Why Choose Us',
        'Our Approach',
        'What Sets Us Apart',
        'Our Commitment',
        'Your Success Matters'
      ];
      
      const bodies = [
        `We combine ${context.emotionalTone} service with ${context.brandVoice.modernity} expertise to deliver ${primaryService} that matter.`,
        `Our team understands ${context.audience.painPoints[0] || 'your unique challenges'} and provides solutions tailored to your needs.`,
        `With ${context.emotionalTone} dedication and ${context.brandVoice.modernity} innovation, we help ${context.audience.demographics[0] || 'clients'} ${context.audience.goals[0] || 'succeed'}.`,
        `Located in ${location || 'your area'}, we're committed to delivering ${primaryService} that exceed expectations.`,
        `Every project is an opportunity to demonstrate our ${context.emotionalTone} approach and ${context.brandVoice.modernity} expertise.`
      ];
      
      return {
        heading: headings[index % headings.length],
        body: bodies[index % bodies.length]
      };
  }
}

/**
 * Generate fallback content for a single section on demand
 */
export function generateSectionContentFallback(
  sectionType: string,
  projectConfig: ProjectConfig,
  context: DesignContext,
  industry: string,
  index: number
): CopyContent['sections'][0] | null {
  const industryTemplate = loadIndustryTemplate(industry);
  return generateContentForSectionType(
    sectionType,
    projectConfig,
    context,
    industry,
    industryTemplate,
    index
  );
}

/**
 * Generate services copy
 */
function generateServicesCopy(projectConfig: ProjectConfig): CopyContent['services'] {
  if (!projectConfig.services || projectConfig.services.length === 0) {
    return [{
      name: 'Services',
      description: 'Comprehensive solutions tailored to your needs'
    }];
  }
  
  return projectConfig.services.map(service => ({
    name: service.name,
    description: service.shortDescription || `Expert ${service.name} services designed to help you achieve your goals`
  }));
}

/**
 * Generate FAQ
 */
function generateFAQ(projectConfig: ProjectConfig, industry: string, industryTemplate?: any): CopyContent['faq'] {
  const industryFAQs: Record<string, Array<{ question: string; answer: string }>> = {
    'law': [
      {
        question: 'How do I schedule a consultation?',
        answer: 'You can schedule a consultation by calling our office or using our online booking form. We offer flexible appointment times to accommodate your schedule.'
      },
      {
        question: 'What areas of law do you practice?',
        answer: `We specialize in ${projectConfig.services?.map(s => s.name).join(', ') || 'various areas of law'}. Our experienced attorneys are here to help with your legal needs.`
      }
    ],
    'saas': [
      {
        question: 'Do you offer a free trial?',
        answer: 'Yes, we offer a free trial so you can experience our platform before committing. Sign up today to get started.'
      },
      {
        question: 'What integrations do you support?',
        answer: 'We integrate with popular tools and platforms to streamline your workflow. Contact us to learn more about available integrations.'
      }
    ],
    'medical': [
      {
        question: 'Do you accept insurance?',
        answer: 'We accept most major insurance plans. Please contact our office to verify your insurance coverage.'
      },
      {
        question: 'How do I book an appointment?',
        answer: 'You can book an appointment online through our patient portal or by calling our office directly.'
      }
    ]
  };
  
  const userGoal = projectConfig.industry?.toLowerCase().includes('law') || projectConfig.industry?.toLowerCase().includes('medical') ? 'book' :
                   projectConfig.industry?.toLowerCase().includes('saas') ? 'signup' : 'contact';
  
  return industryFAQs[industry.toLowerCase()] || [
    {
      question: 'How can I get started?',
      answer: `Getting started is easy. Simply ${userGoal === 'book' ? 'book a consultation' : userGoal === 'signup' ? 'sign up for a free trial' : 'contact us'} and we'll guide you through the process.`
    },
    {
      question: 'What makes you different?',
      answer: `We combine professional service with modern expertise to deliver results that matter. Our commitment to excellence sets us apart.`
    }
  ];
}

/**
 * Save copy to JSON
 */
export function saveCopy(copy: CopyContent, outputPath: string): void {
  const copyDir = path.dirname(outputPath);
  if (!fs.existsSync(copyDir)) {
    fs.mkdirSync(copyDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(copy, null, 2));
}

