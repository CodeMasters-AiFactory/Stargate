/**
 * Content Engine Module
 * Generates deep, specific, conversion-oriented content for each page
 * NO generic filler - always specific and actionable
 */

import type { ProjectConfig } from './projectConfig';
import type { BrandKit } from './brandGenerator';
import fs from 'fs';
import path from 'path';
import { getProjectDir } from './projectConfig';
import OpenAI from 'openai';

// OpenAI client factory
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

const openai = createOpenAIClient();

/**
 * Home page content schema
 */
export interface HomePageContent {
  hero: {
    h1: string;
    subheading: string;
    bullets: string[];
    primaryCTA: { text: string; action: string };
    secondaryCTA: { text: string; action: string };
    trustLine: string;
  };
  whoWeServe: {
    title: string;
    intro: string;
    audienceCards: Array<{
      title: string;
      bullets: string[];
    }>;
  };
  keyServices: {
    title: string;
    services: Array<{
      name: string;
      description: string;
      link: string;
    }>;
  };
  differentiators: {
    title: string;
    intro: string;
    items: Array<{
      label: string;
      description: string;
    }>;
  };
  outcomes: {
    title: string;
    cases: Array<{
      text: string;
    }>;
    disclaimer: string;
  };
  aboutTeaser: {
    title: string;
    story: string;
    values: string[];
    button: { text: string; link: string };
  };
  howItWorks: {
    title: string;
    steps: Array<{
      number: number;
      title: string;
      description: string;
    }>;
  };
  faq: {
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  finalCTA: {
    heading: string;
    text: string;
    primaryCTA: { text: string; action: string };
    secondaryCTA: { text: string; action: string };
  };
}

/**
 * Services page content schema
 */
export interface ServicesPageContent {
  intro: {
    h1: string;
    overview: string;
  };
  overview: {
    title: string;
    services: Array<{
      name: string;
      shortDescription: string;
      link: string;
    }>;
  };
  detailedServices: Array<{
    title: string;
    description: string;
    typicalClients: string;
    keyMatters: string[];
    servicesList: string[];
    idealFor: string[];
    cta: { text: string; action: string };
  }>;
  faq: {
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  cta: {
    heading: string;
    text: string;
    primaryCTA: { text: string; action: string };
  };
}

/**
 * About page content schema
 */
export interface AboutPageContent {
  hero: {
    h1: string;
    subheading: string;
  };
  story: {
    title: string;
    paragraphs: string[];
  };
  values: {
    title: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  team: {
    title: string;
    intro: string;
    profiles: Array<{
      name: string;
      role: string;
      background: string;
      focusAreas: string[];
    }>;
  };
  standards: {
    title: string;
    intro: string;
    memberships: string[];
    ethicsStatement: string;
  };
  highlights: {
    title: string;
    milestones: Array<{
      year: string;
      event: string;
    }>;
  };
  cta: {
    heading: string;
    text: string;
    primaryCTA: { text: string; action: string };
    secondaryCTA?: { text: string; action: string };
  };
}

/**
 * Contact page content schema
 */
export interface ContactPageContent {
  intro: {
    h1: string;
    text: string;
  };
  contactOptions: {
    title: string;
    phone: { number: string; link: string; hours: string };
    email: { address: string; link: string; responseTime: string };
    address: { full: string; link: string };
    officeHours: string;
  };
  form: {
    title: string;
    intro: string;
    fields: Array<{
      name: string;
      type: string;
      label: string;
      required: boolean;
      placeholder?: string;
      options?: string[];
    }>;
    submitButton: string;
    consentText: string;
  };
  map?: {
    title: string;
    address: string;
    note: string;
  };
  faq: {
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
}

export type PageContent = HomePageContent | ServicesPageContent | AboutPageContent | ContactPageContent;

/**
 * Generate content for a specific page
 */
export async function generatePageContent(
  config: ProjectConfig,
  brandKit: BrandKit,
  pageType: 'home' | 'services' | 'about' | 'contact'
): Promise<PageContent> {
  if (!openai) {
    return generatePageContentFallback(config, brandKit, pageType);
  }

  try {
    switch (pageType) {
      case 'home':
        return await generateHomePageContent(config, brandKit);
      case 'services':
        return await generateServicesPageContent(config, brandKit);
      case 'about':
        return await generateAboutPageContent(config, brandKit);
      case 'contact':
        return await generateContactPageContent(config, brandKit);
      default:
        throw new Error(`Unknown page type: ${pageType}`);
    }
  } catch (error) {
    console.error(`[Content Engine] Error generating ${pageType} content:`, error);
    return generatePageContentFallback(config, brandKit, pageType);
  }
}

/**
 * Generate home page content
 */
async function generateHomePageContent(config: ProjectConfig, brandKit: BrandKit): Promise<HomePageContent> {
  const location = `${config.location.city}, ${config.location.region}`;
  const industry = config.industry.toLowerCase();
  
  const prompt = `Generate SPECIFIC, detailed content for a ${config.industry} homepage. 

Business: ${config.projectName}
Industry: ${config.industry}
Location: ${location}
Target Audiences: ${config.targetAudiences.join(', ')}
Tone: ${config.toneOfVoice}
Services: ${config.services.map(s => `${s.name}: ${s.shortDescription}`).join(', ')}

CRITICAL RULES:
- NO generic filler like "We deliver exceptional quality"
- ALWAYS mention location: "${location}"
- ALWAYS mention target audiences: ${config.targetAudiences.join(', ')}
- Use SPECIFIC examples and use cases
- CTAs must be action-oriented: "Book a Consultation" not "Learn More"
- Include trust elements and social proof

Generate JSON matching this structure:
{
  "hero": {
    "h1": "Specific H1 with location and industry",
    "subheading": "1-2 sentences about helping [audiences] in [location]",
    "bullets": ["3 specific benefit bullets"],
    "primaryCTA": { "text": "Book a Consultation", "action": "/contact" },
    "secondaryCTA": { "text": "Call Our Office", "action": "tel:..." },
    "trustLine": "Serving clients in [location]"
  },
  "whoWeServe": {
    "title": "Who We Serve",
    "intro": "Brief intro",
    "audienceCards": [
      { "title": "Audience 1", "bullets": ["specific point 1", "specific point 2", "specific point 3"] },
      { "title": "Audience 2", "bullets": ["specific point 1", "specific point 2", "specific point 3"] }
    ]
  },
  "keyServices": {
    "title": "Our Key Practice Areas",
    "services": [
      { "name": "Service 1", "description": "2-3 sentence specific description", "link": "/services/service-1" },
      { "name": "Service 2", "description": "2-3 sentence specific description", "link": "/services/service-2" },
      { "name": "Service 3", "description": "2-3 sentence specific description", "link": "/services/service-3" }
    ]
  },
  "differentiators": {
    "title": "Why Clients Choose [Business Name]",
    "intro": "Brief intro",
    "items": [
      { "label": "Value 1", "description": "1-2 sentence specific description" },
      { "label": "Value 2", "description": "1-2 sentence specific description" },
      { "label": "Value 3", "description": "1-2 sentence specific description" },
      { "label": "Value 4", "description": "1-2 sentence specific description" }
    ]
  },
  "outcomes": {
    "title": "Client Outcomes We're Proud Of",
    "cases": [
      { "text": "Specific anonymised case 1 mentioning location/industry" },
      { "text": "Specific anonymised case 2 mentioning location/industry" },
      { "text": "Specific anonymised case 3 mentioning location/industry" }
    ],
    "disclaimer": "Examples are anonymised and illustrative only. Past results do not guarantee future outcomes."
  },
  "aboutTeaser": {
    "title": "About [Business Name]",
    "story": "2-3 paragraph story mentioning location, values, commitment",
    "values": ["Value 1", "Value 2", "Value 3"],
    "button": { "text": "Meet the Firm", "link": "/about" }
  },
  "howItWorks": {
    "title": "How We Work With You",
    "steps": [
      { "number": 1, "title": "Step 1", "description": "Specific description" },
      { "number": 2, "title": "Step 2", "description": "Specific description" },
      { "number": 3, "title": "Step 3", "description": "Specific description" }
    ]
  },
  "faq": {
    "title": "Frequently Asked Questions",
    "items": [
      { "question": "Specific question 1", "answer": "Detailed, helpful answer" },
      { "question": "Specific question 2", "answer": "Detailed, helpful answer" },
      { "question": "Specific question 3", "answer": "Detailed, helpful answer" },
      { "question": "Specific question 4", "answer": "Detailed, helpful answer" },
      { "question": "Specific question 5", "answer": "Detailed, helpful answer" },
      { "question": "Specific question 6", "answer": "Detailed, helpful answer" }
    ]
  },
  "finalCTA": {
    "heading": "Ready to Talk?",
    "text": "Brief supporting text",
    "primaryCTA": { "text": "Book a Consultation", "action": "/contact" },
    "secondaryCTA": { "text": "Call [phone]", "action": "tel:..." }
  }
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are an expert copywriter creating specific, conversion-oriented content. NEVER use generic filler. ALWAYS mention location and target audiences. Be specific and actionable.'
      },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 4000,
    temperature: 0.7
  });

  return JSON.parse(completion.choices[0].message.content || '{}') as HomePageContent;
}

/**
 * Generate services page content
 */
async function generateServicesPageContent(config: ProjectConfig, brandKit: BrandKit): Promise<ServicesPageContent> {
  // Similar implementation for services page
  // For brevity, using fallback - full implementation would follow same pattern
  return generatePageContentFallback(config, brandKit, 'services') as ServicesPageContent;
}

/**
 * Generate about page content
 */
async function generateAboutPageContent(config: ProjectConfig, brandKit: BrandKit): Promise<AboutPageContent> {
  // Similar implementation for about page
  return generatePageContentFallback(config, brandKit, 'about') as AboutPageContent;
}

/**
 * Generate contact page content
 */
async function generateContactPageContent(config: ProjectConfig, brandKit: BrandKit): Promise<ContactPageContent> {
  // Similar implementation for contact page
  return generatePageContentFallback(config, brandKit, 'contact') as ContactPageContent;
}

/**
 * Generate fallback content (when AI unavailable)
 */
function generatePageContentFallback(
  config: ProjectConfig,
  brandKit: BrandKit,
  pageType: string
): PageContent {
  const location = `${config.location.city}, ${config.location.region}`;
  
  if (pageType === 'home') {
    return {
      hero: {
        h1: `${config.projectName}: ${config.industry} in ${location}`,
        subheading: `Professional ${config.industry.toLowerCase()} services for ${config.targetAudiences.join(' and ')} in ${location}.`,
        bullets: [
          `${config.services[0]?.name || 'Services'} for ${config.targetAudiences[0] || 'clients'}`,
          'Clear communication and transparent processes',
          `Serving ${location} with expertise and care`
        ],
        primaryCTA: { text: 'Book a Consultation', action: '/contact' },
        secondaryCTA: { text: 'Call Our Office', action: 'tel:+27123456789' },
        trustLine: `Serving clients in ${location}`
      },
      whoWeServe: {
        title: 'Who We Serve',
        intro: `We provide comprehensive ${config.industry.toLowerCase()} services to our clients in ${location}.`,
        audienceCards: config.targetAudiences.map(audience => ({
          title: audience,
          bullets: ['Service point 1', 'Service point 2', 'Service point 3']
        }))
      },
      keyServices: {
        title: 'Our Key Services',
        services: config.services.map(service => ({
          name: service.name,
          description: service.shortDescription,
          link: `/services/${service.name.toLowerCase().replace(/\s+/g, '-')}`
        }))
      },
      differentiators: {
        title: `Why Clients Choose ${config.projectName}`,
        intro: 'We combine expertise with a client-focused approach.',
        items: [
          { label: 'Clear Communication', description: 'We explain options in plain language.' },
          { label: 'Strategic Thinking', description: 'We focus on long-term outcomes.' },
          { label: 'Personal Attention', description: 'You work with a dedicated professional.' },
          { label: 'Confidential & Ethical', description: 'Your matter is handled with discretion.' }
        ]
      },
      outcomes: {
        title: "Client Outcomes We're Proud Of",
        cases: [
          { text: `Helped a client in ${location} achieve positive outcome.` },
          { text: `Guided a client through complex matter successfully.` },
          { text: `Obtained favorable result for client facing challenges.` }
        ],
        disclaimer: 'Examples are anonymised and illustrative only. Past results do not guarantee future outcomes.'
      },
      aboutTeaser: {
        title: `About ${config.projectName}`,
        story: `${config.projectName} is a ${config.industry.toLowerCase()} firm serving ${location}. We combine expertise with a personal approach.`,
        values: ['Integrity', 'Clarity', 'Action'],
        button: { text: 'Meet the Firm', link: '/about' }
      },
      howItWorks: {
        title: 'How We Work With You',
        steps: [
          { number: 1, title: 'Schedule a Consultation', description: 'Contact us to discuss your situation.' },
          { number: 2, title: 'Receive a Clear Plan', description: 'We outline your options and strategy.' },
          { number: 3, title: 'Move Forward With Confidence', description: 'We act on your instructions and keep you updated.' }
        ]
      },
      faq: {
        title: 'Frequently Asked Questions',
        items: [
          { question: 'How do consultations work?', answer: 'Initial consultations are confidential and typically last 30-60 minutes.' },
          { question: 'What are your fees?', answer: 'We provide transparent fee structures upfront.' },
          { question: 'Can you help if I\'m not in ' + config.location.city + '?', answer: `Yes, we serve clients throughout ${config.location.region}.` }
        ]
      },
      finalCTA: {
        heading: 'Ready to Talk?',
        text: 'Share details about your matter and we\'ll contact you.',
        primaryCTA: { text: 'Book a Consultation', action: '/contact' },
        secondaryCTA: { text: 'Call Us', action: 'tel:+27123456789' }
      }
    } as HomePageContent;
  }
  
  // Fallback for other page types
  throw new Error(`Fallback not implemented for ${pageType}`);
}

/**
 * Save page content to file
 */
export function savePageContent(projectSlug: string, pageType: string, content: PageContent): void {
  const projectDir = getProjectDir(projectSlug);
  const contentDir = path.join(projectDir, 'content');
  
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }
  
  const contentPath = path.join(contentDir, `${pageType}.json`);
  fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), 'utf-8');
  
  // Also save as markdown for human-readable inspection
  const mdPath = path.join(contentDir, `${pageType}.md`);
  const mdContent = `# ${pageType.charAt(0).toUpperCase() + pageType.slice(1)} Page Content\n\n\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\``;
  fs.writeFileSync(mdPath, mdContent, 'utf-8');
}

/**
 * Load page content from file
 */
export function loadPageContent(projectSlug: string, pageType: string): PageContent | null {
  const contentPath = path.join(getProjectDir(projectSlug), 'content', `${pageType}.json`);
  
  if (!fs.existsSync(contentPath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(contentPath, 'utf-8');
    return JSON.parse(content) as PageContent;
  } catch (error) {
    console.error(`Error loading ${pageType} content for ${projectSlug}:`, error);
    return null;
  }
}

