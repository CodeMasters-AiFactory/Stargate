/**
 * Content LLM Generator v5.1
 * Generates unique, industry-specific content using OpenAI GPT-4o
 * Replaces template-based content with AI-generated copy
 */

import OpenAI from 'openai';
import type { DesignContext } from './designThinking';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface SectionContent {
  title: string;
  subtitle?: string;
  lead?: string;
  bullets?: string[];
  body: string;
  cta?: string;
}

export interface SectionContext {
  projectName: string;
  industry: string;
  targetAudience?: string[];
  toneOfVoice?: string;
  sectionType: string;
  valueProps?: string[];
  differentiators?: string[];
  designContext?: DesignContext;
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
  services?: Array<{
    name: string;
    shortDescription?: string;
  }>;
}

/**
 * Create OpenAI client for content generation
 */
function createOpenAIClient(): OpenAI | null {
  // Try Replit AI Integration keys first (preferred)
  if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  
  // Fallback to direct OpenAI key
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  
  // No keys available - will return null for fallback
  return null;
}

/**
 * Generate section-specific content using LLM
 */
export async function generateSectionCopyLLM(
  sectionContext: SectionContext
): Promise<SectionContent | null> {
  const openai = createOpenAIClient();
  
  if (!openai) {
    console.warn('[Content LLM] No OpenAI API key found, falling back to template-based content');
    return null;
  }

  try {
    const prompt = buildSectionPrompt(sectionContext);
    
    console.log(`[Content LLM] Generating content for ${sectionContext.sectionType} section...`);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert copywriter specializing in ${sectionContext.industry} websites. 
You write concise, benefit-driven, industry-specific content that is natural and engaging. 
Never use placeholder text, lorem ipsum, or generic filler. 
Always write specific, actionable content that demonstrates expertise and builds trust.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      console.warn('[Content LLM] No content returned from LLM');
      return null;
    }

    // Parse the LLM response into structured content
    const parsed = parseLLMResponse(content, sectionContext.sectionType);
    
    console.log(`[Content LLM] Successfully generated content for ${sectionContext.sectionType}`);
    return parsed;
    
  } catch (error: unknown) {
    logError(error, `Content LLM - ${sectionContext.sectionType}`);
    return null; // Fallback to template-based content
  }
}

/**
 * Build prompt for section-specific content generation
 */
function buildSectionPrompt(context: SectionContext): string {
  const location = context.location?.city 
    ? ` in ${context.location.city}${context.location.region ? `, ${context.location.region}` : ''}`
    : '';
  
  const audience = context.targetAudience?.join(', ') || context.designContext?.audience.demographics[0] || 'clients';
  const tone = context.toneOfVoice || context.designContext?.emotionalTone || 'professional';
  const valueProps = context.valueProps?.join(', ') || context.designContext?.pageObjective.valueProposition || 'excellence';
  
  // Handle multiple section type aliases
  const sectionTypeMap: Record<string, string> = {
    'features': 'services',
    'services': 'services',
    'testimonials': 'testimonials',
    'reviews': 'testimonials',
    'about': 'about',
    'team': 'about',
    'process': 'process',
    'how-it-works': 'process',
    'value-proposition': 'value-proposition',
    'why-choose-us': 'value-proposition',
    'case-studies': 'case-studies',
    'portfolio': 'case-studies',
    'faq': 'faq',
    'contact': 'contact',
    'cta': 'cta',
    'pricing': 'pricing'
  };
  
  const normalizedType = sectionTypeMap[context.sectionType] || context.sectionType;
  
  const sectionPrompts: Record<string, string> = {
    hero: `Write a compelling hero section for ${context.projectName}, a ${context.industry} business${location}.

REQUIREMENTS:
- Headline: 40-60 characters, includes primary value proposition, SEO-friendly
- Subheadline: 100-140 characters, explains how you help ${audience}
- CTA text: Action-oriented (e.g., "Book Consultation", "Get Started", "Learn More")

TONE: ${tone}
VALUE PROPS: ${valueProps}
${context.differentiators ? `DIFFERENTIATORS: ${context.differentiators.join(', ')}` : ''}

OUTPUT FORMAT:
Title: [compelling headline]
Subtitle: [supporting subheadline]
CTA: [action-oriented button text]

Make it specific to ${context.industry}, not generic.`,

    services: `Write a services section for ${context.projectName}, a ${context.industry} business${location}.

REQUIREMENTS:
- Heading: "Our Services" or industry-appropriate alternative
- Body: 2-3 sentences explaining what services you offer and how they help ${audience}
- Include specific service names: ${context.services?.map(s => s.name).join(', ') || 'services'}

TONE: ${tone}
${context.services?.length ? `SERVICES: ${context.services.map(s => `${s.name}${s.shortDescription ? ` - ${s.shortDescription}` : ''}`).join(', ')}` : ''}

OUTPUT FORMAT:
Title: [section heading]
Body: [2-3 sentences describing services and benefits]

Be specific about what you offer, not generic "we provide solutions".`,

    testimonials: `Write a testimonials section for ${context.projectName}, a ${context.industry} business${location}.

REQUIREMENTS:
- Heading: "What Our Clients Say" or similar
- Body: 2-3 sentences explaining your track record and client satisfaction
- Focus on trust and social proof

TONE: ${tone}
AUDIENCE: ${audience}

OUTPUT FORMAT:
Title: [section heading]
Body: [2-3 sentences about client satisfaction and trust]

Emphasize real results and trust, not generic praise.`,

    about: `Write an about/team section for ${context.projectName}, a ${context.industry} business${location}.

REQUIREMENTS:
- Heading: "About Our Team" or "Who We Are"
- Body: 2-3 sentences about your team's expertise and approach
- Emphasize experience and dedication

TONE: ${tone}
VALUE PROPS: ${valueProps}

OUTPUT FORMAT:
Title: [section heading]
Body: [2-3 sentences about team expertise and approach]

Show expertise and human connection, not generic "we are professionals".`,

    process: `Write a process section for ${context.projectName}, a ${context.industry} business${location}.

REQUIREMENTS:
- Heading: "How We Work" or "Our Process"
- Body: 2-3 sentences explaining your proven process
- Bullets: 3-5 steps in your process (optional)

TONE: ${tone}

OUTPUT FORMAT:
Title: [section heading]
Body: [2-3 sentences about your process]
Bullets:
- [Step 1]
- [Step 2]
- [Step 3]

Make the process clear and structured.`,

    'value-proposition': `Write a value proposition section for ${context.projectName}, a ${context.industry} business${location}.

REQUIREMENTS:
- Heading: "Why Choose Us" or "What Sets Us Apart"
- Body: 2-3 sentences explaining your unique advantages
- Focus on differentiators: ${context.differentiators?.join(', ') || valueProps}

TONE: ${tone}
${context.differentiators ? `DIFFERENTIATORS: ${context.differentiators.join(', ')}` : ''}

OUTPUT FORMAT:
Title: [section heading]
Body: [2-3 sentences about unique advantages]

Be specific about what makes you different, not generic "we are the best".`,

    'case-studies': `Write a case studies/portfolio section for ${context.projectName}, a ${context.industry} business${location}.

REQUIREMENTS:
- Heading: "Our Work" or "Case Studies"
- Body: 2-3 sentences about your track record and results
- Emphasize real outcomes

TONE: ${tone}
VALUE PROPS: ${valueProps}

OUTPUT FORMAT:
Title: [section heading]
Body: [2-3 sentences about work and results]

Show real value delivered, not generic "we do great work".`,

    faq: `Write an FAQ section introduction for ${context.projectName}, a ${context.industry} business${location}.

REQUIREMENTS:
- Heading: "Frequently Asked Questions"
- Body: 2-3 sentences explaining that you answer common questions
- Make it welcoming and helpful

TONE: ${tone}
AUDIENCE: ${audience}

OUTPUT FORMAT:
Title: [section heading]
Body: [2-3 sentences about answering questions]

Be helpful and approachable, not generic "we answer questions".`,

    contact: `Write a contact section for ${context.projectName}, a ${context.industry} business${location}.

REQUIREMENTS:
- Heading: "Get In Touch" or "Contact Us"
- Body: 2-3 sentences inviting contact and explaining how to reach you
- CTA: "Contact Us" or "Get Started"

TONE: ${tone}
LOCATION: ${location || 'your area'}

OUTPUT FORMAT:
Title: [section heading]
Body: [2-3 sentences inviting contact]
CTA: [action-oriented button text]

Make it easy and welcoming to contact you.`,

    cta: `Write a call-to-action section for ${context.projectName}, a ${context.industry} business${location}.

REQUIREMENTS:
- Heading: "Ready to Get Started?" or similar
- Body: 2-3 sentences creating urgency and inviting action
- CTA: Strong action verb (e.g., "Get Started", "Book Now", "Sign Up")

TONE: ${tone}
VALUE PROPS: ${valueProps}

OUTPUT FORMAT:
Title: [section heading]
Body: [2-3 sentences creating urgency]
CTA: [strong action verb]

Create momentum and urgency, not generic "contact us".`,

    pricing: `Write a pricing section for ${context.projectName}, a ${context.industry} business${location}.

REQUIREMENTS:
- Heading: "Pricing & Packages" or similar
- Body: 2-3 sentences about flexible pricing options
- Emphasize value and flexibility

TONE: ${tone}
AUDIENCE: ${audience}

OUTPUT FORMAT:
Title: [section heading]
Body: [2-3 sentences about pricing options]

Be transparent and value-focused, not generic "we offer pricing".`
  };

  const prompt = sectionPrompts[normalizedType] || sectionPrompts['value-proposition'];
  
  return prompt;
}

/**
 * Parse LLM response into structured content
 */
function parseLLMResponse(content: string, sectionType: string): SectionContent {
  // Try to extract structured fields from LLM response
  const titleMatch = content.match(/Title:\s*(.+?)(?:\n|$)/i) || content.match(/^(.+?)(?:\n|$)/);
  const subtitleMatch = content.match(/Subtitle:\s*(.+?)(?:\n|$)/i);
  const leadMatch = content.match(/Lead:\s*(.+?)(?:\n|$)/i);
  const bodyMatch = content.match(/Body:\s*([\s\S]+?)(?:\n(?:Bullets|CTA|$))/i) || 
                    content.match(/Body:\s*([\s\S]+)/i);
  const ctaMatch = content.match(/CTA:\s*(.+?)(?:\n|$)/i);
  
  // Extract bullets if present
  const bullets: string[] = [];
  const bulletMatches = content.match(/Bullets?:[\s\S]*?(-|\*)\s*(.+?)(?:\n|$)/gi);
  if (bulletMatches) {
    bulletMatches.forEach(match => {
      const bullet = match.replace(/Bullets?:[\s\S]*?(-|\*)\s*/, '').trim();
      if (bullet) bullets.push(bullet);
    });
  }
  
  // Fallback: if no structured format, try to extract from plain text
  const lines = content.split('\n').filter(l => l.trim());
  const title = titleMatch?.[1]?.trim() || lines[0]?.replace(/^#+\s*/, '').trim() || 'Section';
  const subtitle = subtitleMatch?.[1]?.trim() || subtitleMatch?.[1]?.trim();
  const lead = leadMatch?.[1]?.trim();
  const body = bodyMatch?.[1]?.trim() || 
               lines.slice(1).filter(l => !l.match(/^(Title|Subtitle|Body|CTA|Bullets?):/i)).join(' ').trim() ||
               'Content for this section.';
  const cta = ctaMatch?.[1]?.trim();

  return {
    title: title.substring(0, 100), // Limit title length
    subtitle: subtitle?.substring(0, 200),
    lead: lead?.substring(0, 300),
    bullets: bullets.length > 0 ? bullets : undefined,
    body: body.substring(0, 500), // Limit body length
    cta: cta?.substring(0, 50)
  };
}

/**
 * Generate multiple sections in parallel (with rate limiting)
 */
export async function generateMultipleSectionsLLM(
  sections: Array<{ key: string; type: string; context: SectionContext }>
): Promise<Map<string, SectionContent | null>> {
  const results = new Map<string, SectionContent | null>();
  
  for (const section of sections) {
    const content = await generateSectionCopyLLM(section.context);
    results.set(section.key, content);
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return results;
}

