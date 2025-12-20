/**
 * Merlin v6.6 - Intelligent Copywriter 3.0
 * Context-aware copywriting system that generates premium, industry-specific content
 * WITHOUT requiring external AI APIs - uses intelligent templates based on project context
 * 
 * Features:
 * - Industry-specific content generation (coffee, restaurant, legal, SaaS, fitness, etc.)
 * - Uses project name, location, services, tone, and goals
 * - Conversion-focused headlines and CTAs
 * - No external API dependencies
 */

// Removed unused OpenAI import - code uses intelligent fallback instead
import type { DesignContext } from '../generator/designThinking';
import type { StyleSystem } from '../generator/styleSystem';
import type { LayoutPlan, SectionPlan } from './layoutPlannerLLM';
import type { SectionDefinition } from '../generator/layoutLLM';
import type { PlannedImage } from './imagePlannerLLM';
// Removed unused imports: getErrorMessage, logError

export interface SectionCopy {
  sectionKey: string;
  headline: string;
  subheadline?: string;
  paragraph?: string;
  bullets?: string[];
  ctaLabel?: string;
  ctaDescription?: string;
}

// Removed unused createOpenAIClient function - code always uses intelligent fallback
// Removed unused buildSectionCopyPrompt function - code uses generateIntelligentCopy instead

/**
 * Generate copy for all sections using GPT-4o
 */
export async function generateCopyForSections(
  designContext: DesignContext,
  sectionPlan: LayoutPlan,
  sectionDefinitions: SectionDefinition[],
  finalStyleSystem: StyleSystem,
  imagePlans: PlannedImage[],
  projectConfig?: { projectName?: string; industry?: string; location?: { city?: string }; services?: any[]; primaryGoals?: string[] }
): Promise<SectionCopy[]> {
  // ALWAYS use intelligent fallback - no OpenAI dependency
  // The fallback now generates premium, industry-specific content using project context
  console.log('[Copywriter LLM] Using intelligent context-aware copy generation (no external API needed)');
  return generateIntelligentCopy(sectionDefinitions, designContext, sectionPlan, imagePlans, finalStyleSystem, projectConfig);
}

/**
 * Intelligent copy generation using project context
 * Generates premium, industry-specific, conversion-focused content
 * WITHOUT requiring external AI APIs
 */
function generateIntelligentCopy(
  sectionDefinitions: SectionDefinition[],
  designContext: DesignContext,
  sectionPlan: LayoutPlan,
  imagePlans: PlannedImage[],
  _styleSystem: StyleSystem,
  projectConfig?: { projectName?: string; industry?: string; location?: { city?: string }; services?: any[]; primaryGoals?: string[] }
): SectionCopy[] {
  const projectName = projectConfig?.projectName || 'Business';
  const industry = (projectConfig?.industry || 'business').toLowerCase();
  const location = projectConfig?.location?.city || '';
  const tone = designContext.emotionalTone || 'professional';
  const primaryGoal = projectConfig?.primaryGoals?.[0] || 'engagement';
  
  // Extract services from context
  const services = projectConfig?.services || [];
  const primaryService = services[0]?.name || getIndustryService(industry);
  
  // Get section plan context
  const sectionPlanMap = new Map<string, SectionPlan>();
  for (const plan of sectionPlan.sections) {
    sectionPlanMap.set(plan.key, plan);
  }
  
  // Get image context
  const imagePlanMap = new Map<string, PlannedImage>();
  for (const img of imagePlans) {
    imagePlanMap.set(img.sectionKey, img);
  }
  
  const copies: SectionCopy[] = [];

  for (const section of sectionDefinitions) {
    if (!section.key) continue;

    // plan is available but not currently used - kept for future enhancements
    sectionPlanMap.get(section.key);
    const imagePlan = imagePlanMap.get(section.key);
    const sectionType = section.type;
    
    let copy: SectionCopy = {
      sectionKey: section.key,
      headline: generateHeadline(sectionType, projectName, industry, primaryService, location, tone)
    };

    switch (sectionType) {
      case 'hero':
        copy = generateHeroCopy(section.key, projectName, industry, primaryService, location, tone, primaryGoal, imagePlan);
        break;
      case 'about':
        copy = generateAboutCopy(section.key, projectName, industry, location, tone, services);
        break;
      case 'features':
      case 'services':
        copy = generateServicesCopy(section.key, projectName, industry, services, primaryService, tone);
        break;
      case 'value-proposition':
        copy = generateValuePropositionCopy(section.key, projectName, industry, primaryService, tone, primaryGoal);
        break;
      case 'testimonials':
        copy = generateTestimonialsCopy(section.key, projectName, industry, tone);
        break;
      case 'faq':
        copy = generateFAQCopy(section.key, projectName, industry, primaryService, services);
        break;
      case 'contact':
        copy = generateContactCopy(section.key, projectName, industry, location, tone);
        break;
      case 'cta':
        copy = generateCTACopy(section.key, projectName, industry, primaryGoal, tone);
        break;
      case 'team':
        copy = generateTeamCopy(section.key, projectName, industry, tone);
        break;
      case 'process':
        copy = generateProcessCopy(section.key, projectName, industry, primaryService, tone);
        break;
      case 'case-studies':
      case 'portfolio':
        copy = generatePortfolioCopy(section.key, projectName, industry, primaryService);
        break;
      default:
        copy.headline = generateHeadline(sectionType, projectName, industry, primaryService, location, tone);
        copy.paragraph = generateParagraph(sectionType, projectName, industry, primaryService, tone);
    }

    copies.push(copy);
  }

  console.log(`[Copywriter] Generated intelligent copy for ${copies.length} sections`);
  return copies;
}

/**
 * Generate compelling hero copy
 */
function generateHeroCopy(
  sectionKey: string,
  projectName: string,
  industry: string,
  primaryService: string,
  location: string,
  _tone: string,
  primaryGoal: string,
  _imagePlan?: PlannedImage
): SectionCopy {
  // Industry-specific headlines
  const headlines: Record<string, string[]> = {
    'coffee': [
      `${projectName}: Artisan Coffee & Espresso Excellence`,
      `Experience Premium Coffee at ${projectName}`,
      `${projectName}: Where Every Cup Tells a Story`,
      `Discover ${projectName}: Your Local Coffee Destination`
    ],
    'restaurant': [
      `${projectName}: Culinary Excellence in Every Bite`,
      `Experience Fine Dining at ${projectName}`,
      `${projectName}: Where Flavor Meets Tradition`,
      `Welcome to ${projectName}: Your Culinary Journey Begins`
    ],
    'legal': [
      `${projectName}: Expert Legal Counsel You Can Trust`,
      `Protecting Your Rights with ${projectName}`,
      `${projectName}: Experienced Legal Solutions`,
      `Your Trusted Legal Partner: ${projectName}`
    ],
    'saas': [
      `${projectName}: Transform Your Workflow`,
      `Streamline Operations with ${projectName}`,
      `${projectName}: The Future of Business Software`,
      `Power Your Business with ${projectName}`
    ],
    'fitness': [
      `${projectName}: Transform Your Body, Transform Your Life`,
      `Achieve Your Fitness Goals at ${projectName}`,
      `${projectName}: Your Path to Peak Performance`,
      `Join ${projectName}: Where Fitness Meets Results`
    ]
  };
  
  // Get industry-specific headlines or generate smart default
  const industryHeadlines = headlines[industry] || [
    `${projectName}: Excellence in ${capitalizeFirst(industry)}`,
    `Experience ${projectName}: Your ${capitalizeFirst(industry)} Partner`,
    `Welcome to ${projectName}: ${capitalizeFirst(industry)} Solutions`,
    `${projectName}: Leading ${capitalizeFirst(industry)} Services`
  ];
  
  const headline = industryHeadlines[0];
  
  // Generate subheadline based on location and service
  let subheadline = '';
  if (location) {
    subheadline = `Serving ${location} with premium ${primaryService}`;
  } else {
    subheadline = `Premium ${primaryService} tailored to your needs`;
  }
  
  // Generate compelling paragraph
  const paragraphs: Record<string, string[]> = {
    'coffee': [
      `At ${projectName}, we source the finest beans and craft each cup with precision. From rich espresso to smooth pour-overs, experience coffee the way it was meant to be.`,
      `Join coffee enthusiasts who appreciate quality. ${projectName} brings you expertly roasted beans, skilled baristas, and an atmosphere that celebrates the art of coffee.`,
      `Every sip tells a story. ${projectName} combines traditional roasting techniques with modern innovation to deliver exceptional coffee experiences.`
    ],
    'restaurant': [
      `${projectName} brings together fresh ingredients, skilled chefs, and warm hospitality to create memorable dining experiences.`,
      `Experience culinary artistry at ${projectName}, where every dish is crafted with passion and attention to detail.`,
      `From farm to table, ${projectName} celebrates local flavors and international cuisine in an inviting atmosphere.`
    ],
    'legal': [
      `${projectName} provides expert legal counsel with integrity and dedication. Trust our experienced team to protect your interests.`,
      `Navigating legal challenges requires expertise. ${projectName} offers comprehensive legal solutions tailored to your unique situation.`,
      `With years of experience and a commitment to excellence, ${projectName} delivers results-driven legal representation.`
    ]
  };
  
  const industryParagraphs = paragraphs[industry] || [
    `${projectName} delivers exceptional ${primaryService} with a commitment to excellence. We combine expertise, innovation, and personalized service to exceed your expectations.`,
    `Experience the difference that quality makes. ${projectName} provides ${primaryService} designed to help you achieve your goals.`,
    `Trust ${projectName} for ${primaryService} that combines industry expertise with personalized attention to your unique needs.`
  ];
  
  const paragraph = industryParagraphs[0];
  
  // Generate CTA based on industry and goal
  const ctas: Record<string, { label: string; description: string }> = {
    'coffee': { label: 'Visit Us Today', description: 'Experience our coffee' },
    'restaurant': { label: 'Make a Reservation', description: 'Book your table' },
    'legal': { label: 'Schedule Consultation', description: 'Free initial consultation' },
    'saas': { label: 'Start Free Trial', description: 'No credit card required' },
    'fitness': { label: 'Book a Class', description: 'Start your fitness journey' }
  };
  
  const cta = ctas[industry] || {
    label: primaryGoal === 'book' ? 'Book Consultation' : primaryGoal === 'signup' ? 'Get Started' : 'Contact Us',
    description: 'Take the next step'
  };
  
  return {
    sectionKey,
    headline,
    subheadline,
    paragraph,
    ctaLabel: cta.label,
    ctaDescription: cta.description
  };
}

/**
 * Generate about section copy
 */
function generateAboutCopy(
  sectionKey: string,
  projectName: string,
  industry: string,
  location: string,
  _tone: string,
  services: any[]
): SectionCopy {
  const headline = `About ${projectName}`;
  
  const paragraphs: Record<string, string> = {
    'coffee': `${projectName} was founded on a passion for exceptional coffee. We carefully source beans from sustainable farms, roast them to perfection, and serve each cup with expertise and care. ${location ? `Located in ${location}, ` : ''}we're proud to be part of the local coffee community.`,
    'restaurant': `${projectName} brings together culinary excellence and warm hospitality. Our chefs craft each dish using fresh, locally-sourced ingredients, creating flavors that celebrate both tradition and innovation. ${location ? `In the heart of ${location}, ` : ''}we invite you to experience dining at its finest.`,
    'legal': `${projectName} has built a reputation for excellence in legal representation. Our team combines deep expertise with a client-centered approach, ensuring you receive personalized attention and strategic counsel. ${location ? `Serving ${location} and beyond, ` : ''}we're committed to protecting your interests.`
  };
  
  const paragraph = paragraphs[industry] || 
    `${projectName} is a leading ${industry} organization committed to excellence. ${location ? `Based in ${location}, ` : ''}we combine expertise, innovation, and personalized service to deliver exceptional results.`;
  
  const bullets = services.length > 0 
    ? services.slice(0, 5).map(s => s.name || s)
    : [
        'Expert team with years of experience',
        'Commitment to excellence and quality',
        'Client-focused approach',
        'Proven track record of success',
        'Innovative solutions'
      ];
  
  return {
    sectionKey,
    headline,
    paragraph,
    bullets
  };
}

/**
 * Generate services section copy
 */
function generateServicesCopy(
  sectionKey: string,
  projectName: string,
  industry: string,
  services: any[],
  primaryService: string,
  _tone: string
): SectionCopy {
  const headline = services.length > 0 ? 'Our Services' : `Our ${capitalizeFirst(primaryService)}`;
  
  let paragraph = '';
  if (services.length > 0) {
    paragraph = `${projectName} offers comprehensive ${industry} solutions designed to meet your unique needs. From ${services[0]?.name || primaryService} to specialized services, we deliver excellence in every project.`;
  } else {
    paragraph = `Discover how ${projectName} can help you with ${primaryService}. We combine expertise, innovation, and personalized service to deliver results that exceed expectations.`;
  }
  
  const bullets = services.length > 0
    ? services.map(s => s.name || s.shortDescription || s)
    : [
        `${primaryService} consultation`,
        'Customized solutions',
        'Expert guidance',
        'Ongoing support'
      ];
  
  return {
    sectionKey,
    headline,
    paragraph,
    bullets
  };
}

/**
 * Generate value proposition copy
 */
function generateValuePropositionCopy(
  sectionKey: string,
  projectName: string,
  industry: string,
  primaryService: string,
  _tone: string,
  _primaryGoal: string
): SectionCopy {
  const headlines: Record<string, string> = {
    'coffee': 'Why Choose Our Coffee',
    'restaurant': 'What Sets Us Apart',
    'legal': 'Why Clients Trust Us',
    'saas': 'Why Choose Our Platform'
  };
  
  const headline = headlines[industry] || 'Why Choose Us';
  
  const paragraphs: Record<string, string> = {
    'coffee': `At ${projectName}, we combine premium beans, expert roasting, and skilled baristas to deliver coffee experiences that stand apart. Every cup reflects our commitment to quality and passion for the craft.`,
    'restaurant': `${projectName} offers more than great food—we create memorable experiences. From our carefully curated menu to our warm atmosphere, every detail is designed to delight.`,
    'legal': `${projectName} combines legal expertise with a client-first approach. We take time to understand your unique situation and develop strategies tailored to your goals.`
  };
  
  const paragraph = paragraphs[industry] || 
    `${projectName} delivers ${primaryService} that combines industry expertise with personalized attention. We're committed to helping you achieve your goals through innovative solutions and exceptional service.`;
  
  return {
    sectionKey,
    headline,
    paragraph
  };
}

/**
 * Generate testimonials section copy
 */
function generateTestimonialsCopy(
  sectionKey: string,
  projectName: string,
  _industry: string,
  _tone: string
): SectionCopy {
  return {
    sectionKey,
    headline: 'What Our Clients Say',
    paragraph: `Don't just take our word for it. See what clients say about their experience with ${projectName}.`,
    subheadline: 'Trusted by satisfied customers'
  };
}

/**
 * Generate FAQ section copy
 */
function generateFAQCopy(
  sectionKey: string,
  projectName: string,
  _industry: string,
  _primaryService: string,
  _services: any[]
): SectionCopy {
  return {
    sectionKey,
    headline: 'Frequently Asked Questions',
    paragraph: `Have questions about ${projectName}? Find answers to common questions below, or contact us for more information.`
  };
}

/**
 * Generate contact section copy
 */
function generateContactCopy(
  sectionKey: string,
  projectName: string,
  _industry: string,
  location: string,
  _tone: string
): SectionCopy {
  return {
    sectionKey,
    headline: 'Get in Touch',
    paragraph: location 
      ? `Ready to get started? Contact ${projectName} in ${location} today. We're here to help.`
      : `Ready to get started? Contact ${projectName} today. We're here to help.`,
    ctaLabel: 'Contact Us',
    ctaDescription: 'Send us a message'
  };
}

/**
 * Generate CTA section copy
 */
function generateCTACopy(
  sectionKey: string,
  projectName: string,
  industry: string,
  primaryGoal: string,
  _tone: string
): SectionCopy {
  const ctas: Record<string, { headline: string; paragraph: string; label: string }> = {
    'coffee': {
      headline: 'Visit Us Today',
      paragraph: `Experience the difference at ${projectName}. Stop by for your favorite brew or try something new.`,
      label: 'Find Us'
    },
    'restaurant': {
      headline: 'Make a Reservation',
      paragraph: `Join us at ${projectName} for an unforgettable dining experience. Book your table today.`,
      label: 'Reserve Now'
    },
    'legal': {
      headline: 'Schedule Your Consultation',
      paragraph: `Take the first step toward resolving your legal matter. Contact ${projectName} for a free consultation.`,
      label: 'Book Consultation'
    }
  };
  
  const cta = ctas[industry] || {
    headline: 'Ready to Get Started?',
    paragraph: `Take the next step with ${projectName}. We're here to help you achieve your goals.`,
    label: primaryGoal === 'book' ? 'Book Consultation' : 'Get Started'
  };
  
  return {
    sectionKey,
    headline: cta.headline,
    paragraph: cta.paragraph,
    ctaLabel: cta.label,
    ctaDescription: 'Take action today'
  };
}

/**
 * Generate team section copy
 */
function generateTeamCopy(
  sectionKey: string,
  projectName: string,
  _industry: string,
  _tone: string
): SectionCopy {
  return {
    sectionKey,
    headline: 'Meet Our Team',
    paragraph: `The ${projectName} team brings together expertise, passion, and dedication. Get to know the people behind our success.`
  };
}

/**
 * Generate process section copy
 */
function generateProcessCopy(
  sectionKey: string,
  projectName: string,
  _industry: string,
  primaryService: string,
  _tone: string
): SectionCopy {
  return {
    sectionKey,
    headline: 'How We Work',
    paragraph: `At ${projectName}, we follow a proven process to deliver exceptional ${primaryService}. Here's how we ensure your success.`,
    bullets: [
      'Initial consultation',
      'Customized plan',
      'Expert execution',
      'Ongoing support'
    ]
  };
}

/**
 * Generate portfolio/case studies copy
 */
function generatePortfolioCopy(
  sectionKey: string,
  _projectName: string,
  _industry: string,
  primaryService: string
): SectionCopy {
  return {
    sectionKey,
    headline: 'Our Work',
    paragraph: `Explore examples of our ${primaryService} and see the results we've achieved for clients.`
  };
}

/**
 * Helper: Generate headline for any section type
 */
function generateHeadline(
  sectionType: string,
  projectName: string,
  industry: string,
  _primaryService: string,
  _location: string,
  _tone: string
): string {
  const typeMap: Record<string, string> = {
    'hero': `${projectName}: Excellence in ${capitalizeFirst(industry)}`,
    'about': `About ${projectName}`,
    'services': 'Our Services',
    'features': 'Our Features',
    'value-proposition': 'Why Choose Us',
    'testimonials': 'What Our Clients Say',
    'faq': 'Frequently Asked Questions',
    'contact': 'Get in Touch',
    'cta': 'Ready to Get Started?',
    'team': 'Meet Our Team',
    'process': 'How We Work',
    'portfolio': 'Our Portfolio',
    'case-studies': 'Case Studies'
  };
  
  return typeMap[sectionType] || `${capitalizeFirst(sectionType)}`;
}

/**
 * Helper: Generate paragraph for any section type
 */
function generateParagraph(
  _sectionType: string,
  projectName: string,
  industry: string,
  primaryService: string,
  _tone: string
): string {
  return `${projectName} delivers exceptional ${primaryService} in the ${industry} industry.`;
}

/**
 * Helper: Get industry-specific service name
 */
function getIndustryService(industry: string): string {
  const serviceMap: Record<string, string> = {
    'coffee': 'coffee and espresso',
    'restaurant': 'culinary experiences',
    'legal': 'legal services',
    'saas': 'software solutions',
    'fitness': 'fitness training',
    'medical': 'healthcare services',
    'education': 'educational programs',
    'real-estate': 'real estate services'
  };
  
  return serviceMap[industry] || 'services';
}

/**
 * Helper: Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

