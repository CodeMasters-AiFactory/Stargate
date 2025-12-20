/**
 * Conversion Copywriter - CRITICAL FEATURE
 * Write copy that CONVERTS, not just fills space
 * 
 * Based on proven copywriting frameworks:
 * - AIDA (Attention, Interest, Desire, Action)
 * - PAS (Problem, Agitate, Solution)
 * - 4Ps (Promise, Picture, Proof, Push)
 */

import { generate } from './multiModelAIOrchestrator';

export interface CopywritingBrief {
  businessName: string;
  industry: string;
  targetAudience: string;
  uniqueValue: string;
  tone: 'professional' | 'friendly' | 'bold' | 'luxury' | 'casual' | 'authoritative';
  painPoints: string[];
  benefits: string[];
  competitors: string[];
  socialProof?: {
    yearsInBusiness?: number;
    clientCount?: number;
    projectCount?: number;
    rating?: number;
    awards?: string[];
  };
}

export interface HeadlineCopy {
  primary: string;
  alternatives: string[];
  subheadline: string;
}

export interface CTACopy {
  primary: string;
  secondary: string;
  urgency?: string;
}

export interface SectionCopy {
  headline: string;
  body: string;
  bulletPoints?: string[];
  cta?: string;
}

export interface FullPageCopy {
  hero: {
    eyebrow: string;
    headline: HeadlineCopy;
    subheadline: string;
    cta: CTACopy;
  };
  features: SectionCopy;
  benefits: SectionCopy;
  howItWorks: SectionCopy;
  socialProof: SectionCopy;
  about: SectionCopy;
  faq: Array<{ question: string; answer: string }>;
  cta: SectionCopy;
  footer: {
    tagline: string;
    copyright: string;
  };
}

// Power words that increase conversion
const POWER_WORDS = {
  urgency: ['Now', 'Today', 'Instantly', 'Immediate', 'Fast', 'Quick', 'Limited'],
  exclusivity: ['Exclusive', 'Premium', 'Elite', 'VIP', 'First', 'Only', 'Secret'],
  trust: ['Proven', 'Guaranteed', 'Trusted', 'Certified', 'Verified', 'Authentic', 'Reliable'],
  emotion: ['Transform', 'Discover', 'Unlock', 'Imagine', 'Experience', 'Achieve', 'Master'],
  value: ['Free', 'Save', 'Bonus', 'Complete', 'Ultimate', 'Essential', 'Revolutionary'],
};

// Headline formulas that work
const HEADLINE_FORMULAS = [
  "{Verb} Your {Noun} With {Solution}",
  "The {Adjective} Way to {Benefit}",
  "How {Target Audience} {Achieve Benefit} Without {Pain Point}",
  "Finally, {Solution} That Actually {Benefit}",
  "{Number} {Adjective} {Noun} That {Benefit}",
  "Stop {Pain Point}. Start {Benefit}.",
  "The Only {Solution} You'll Ever Need for {Benefit}",
  "{Benefit} in {Time Frame}. Guaranteed.",
];

// Tone-specific vocabulary
const TONE_VOCABULARY = {
  professional: {
    verbs: ['achieve', 'deliver', 'implement', 'optimize', 'streamline'],
    adjectives: ['effective', 'reliable', 'proven', 'strategic', 'comprehensive'],
    phrases: ['industry-leading', 'best-in-class', 'enterprise-grade'],
  },
  friendly: {
    verbs: ['help', 'guide', 'support', 'grow', 'build'],
    adjectives: ['easy', 'simple', 'fun', 'quick', 'helpful'],
    phrases: ['we\'ve got you covered', 'you\'re in good hands', 'let\'s do this together'],
  },
  bold: {
    verbs: ['dominate', 'crush', 'transform', 'revolutionize', 'disrupt'],
    adjectives: ['powerful', 'unstoppable', 'game-changing', 'fearless', 'bold'],
    phrases: ['no excuses', 'get results or get out', 'built for winners'],
  },
  luxury: {
    verbs: ['indulge', 'experience', 'savor', 'discover', 'elevate'],
    adjectives: ['exquisite', 'refined', 'prestigious', 'exclusive', 'bespoke'],
    phrases: ['unparalleled excellence', 'curated for the discerning', 'timeless elegance'],
  },
  casual: {
    verbs: ['check out', 'grab', 'get', 'try', 'see'],
    adjectives: ['awesome', 'cool', 'super', 'great', 'amazing'],
    phrases: ['no biggie', 'you got this', 'let\'s roll'],
  },
  authoritative: {
    verbs: ['establish', 'demonstrate', 'prove', 'validate', 'ensure'],
    adjectives: ['definitive', 'authoritative', 'unquestionable', 'trusted', 'expert'],
    phrases: ['backed by research', 'industry standard', 'proven methodology'],
  },
};

/**
 * Generate compelling headline copy
 */
export async function generateHeadlines(brief: CopywritingBrief): Promise<HeadlineCopy> {
  const toneVocab = TONE_VOCABULARY[brief.tone];
  
  const prompt = `You are a world-class conversion copywriter. Create a headline that STOPS people in their tracks.

Business: ${brief.businessName}
Industry: ${brief.industry}
Target: ${brief.targetAudience}
Unique Value: ${brief.uniqueValue}
Tone: ${brief.tone}
Pain Points: ${brief.painPoints.join(', ')}
Benefits: ${brief.benefits.join(', ')}

RULES:
1. Be SPECIFIC, not generic
2. Include a MEASURABLE benefit if possible
3. Address a PAIN POINT directly
4. Use POWER WORDS: ${POWER_WORDS.emotion.slice(0, 3).join(', ')}
5. Keep it under 10 words
6. NO clichés like "Welcome to" or "Your trusted partner"

${brief.tone === 'bold' ? 'Be BOLD and provocative.' : ''}
${brief.tone === 'luxury' ? 'Be sophisticated and exclusive.' : ''}

Respond with ONLY valid JSON:
{
  "primary": "The main headline (punchy, memorable)",
  "alternatives": ["3 alternative headlines"],
  "subheadline": "Supporting line that expands on the headline (15-25 words)"
}`;

  try {
    const result = await generate({
      task: 'creative',
      prompt,
      temperature: 0.85,
    });

    const cleanJson = result.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanJson);
  } catch {
    // Generate with formulas
    const formula = HEADLINE_FORMULAS[Math.floor(Math.random() * HEADLINE_FORMULAS.length)];
    return {
      primary: `${toneVocab.verbs[0].charAt(0).toUpperCase() + toneVocab.verbs[0].slice(1)} Your ${brief.industry} Results`,
      alternatives: [
        `The ${toneVocab.adjectives[0]} Way to ${brief.benefits[0]}`,
        `${brief.benefits[0]} Without ${brief.painPoints[0]}`,
        `Finally, ${brief.uniqueValue}`,
      ],
      subheadline: `We help ${brief.targetAudience} ${brief.benefits[0].toLowerCase()} with our ${toneVocab.adjectives[1]} approach.`,
    };
  }
}

/**
 * Generate compelling CTA copy
 */
export async function generateCTAs(brief: CopywritingBrief): Promise<CTACopy> {
  const prompt = `Create compelling call-to-action buttons.

Business: ${brief.businessName}
Industry: ${brief.industry}
Target: ${brief.targetAudience}
Tone: ${brief.tone}

RULES:
1. Primary CTA: Action-oriented, specific (NOT generic "Get Started")
2. Secondary CTA: Lower commitment option
3. Include urgency if appropriate

Examples of GOOD CTAs:
- "Get My Free Strategy" (not "Learn More")
- "See It In Action" (not "Watch Demo")
- "Claim Your Spot" (not "Sign Up")

Respond with ONLY valid JSON:
{
  "primary": "Action CTA (2-4 words)",
  "secondary": "Lower commitment CTA (2-4 words)",
  "urgency": "Optional urgency text"
}`;

  try {
    const result = await generate({
      task: 'creative',
      prompt,
      temperature: 0.8,
    });

    const cleanJson = result.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanJson);
  } catch {
    const ctaOptions = {
      professional: { primary: 'Schedule a Consultation', secondary: 'Learn Our Process' },
      friendly: { primary: 'Let\'s Chat', secondary: 'See How It Works' },
      bold: { primary: 'Start Dominating', secondary: 'See Results' },
      luxury: { primary: 'Request Invitation', secondary: 'Explore Collection' },
      casual: { primary: 'Try It Free', secondary: 'Take a Look' },
      authoritative: { primary: 'Get Expert Analysis', secondary: 'Review Case Studies' },
    };
    
    return ctaOptions[brief.tone] || ctaOptions.professional;
  }
}

/**
 * Generate full page copy
 */
export async function generateFullPageCopy(brief: CopywritingBrief): Promise<FullPageCopy> {
  const headlines = await generateHeadlines(brief);
  const ctas = await generateCTAs(brief);
  
  // Generate section copy
  const sectionPrompt = `Create website copy for all sections.

Business: ${brief.businessName}
Industry: ${brief.industry}
Target: ${brief.targetAudience}
Unique Value: ${brief.uniqueValue}
Tone: ${brief.tone}
Pain Points: ${brief.painPoints.join(', ')}
Benefits: ${brief.benefits.join(', ')}
${brief.socialProof ? `Social Proof: ${brief.socialProof.clientCount}+ clients, ${brief.socialProof.yearsInBusiness} years, ${brief.socialProof.rating} rating` : ''}

Generate copy for each section. Be SPECIFIC and COMPELLING.

Respond with ONLY valid JSON:
{
  "features": {
    "headline": "Features section headline",
    "body": "Intro paragraph",
    "bulletPoints": ["3-4 specific feature benefits"]
  },
  "benefits": {
    "headline": "Benefits headline (what they GET)",
    "body": "Benefits intro",
    "bulletPoints": ["3-4 outcome-focused benefits"]
  },
  "howItWorks": {
    "headline": "Process headline",
    "body": "Process intro",
    "bulletPoints": ["Step 1: ...", "Step 2: ...", "Step 3: ..."]
  },
  "about": {
    "headline": "About headline (not 'About Us')",
    "body": "Compelling about section (150 words, story-driven)"
  },
  "socialProof": {
    "headline": "Social proof headline",
    "body": "Trust-building text"
  },
  "faq": [
    {"question": "Question 1", "answer": "Answer 1"},
    {"question": "Question 2", "answer": "Answer 2"},
    {"question": "Question 3", "answer": "Answer 3"}
  ],
  "cta": {
    "headline": "Final CTA headline (urgent, compelling)",
    "body": "Final push paragraph"
  },
  "footer": {
    "tagline": "Memorable tagline"
  }
}`;

  try {
    const result = await generate({
      task: 'content',
      prompt: sectionPrompt,
      temperature: 0.75,
    });

    const cleanJson = result.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const sections = JSON.parse(cleanJson);
    
    return {
      hero: {
        eyebrow: `${brief.industry.toUpperCase()} EXPERTS`,
        headline: headlines,
        subheadline: headlines.subheadline,
        cta: ctas,
      },
      features: sections.features,
      benefits: sections.benefits,
      howItWorks: sections.howItWorks,
      socialProof: sections.socialProof,
      about: sections.about,
      faq: sections.faq,
      cta: sections.cta,
      footer: {
        tagline: sections.footer.tagline,
        copyright: `© ${new Date().getFullYear()} ${brief.businessName}. All rights reserved.`,
      },
    };
  } catch {
    // Return structured defaults
    return {
      hero: {
        eyebrow: `TRUSTED ${brief.industry.toUpperCase()} PARTNER`,
        headline: headlines,
        subheadline: `We help ${brief.targetAudience} achieve their goals with our proven approach.`,
        cta: ctas,
      },
      features: {
        headline: 'What Makes Us Different',
        body: `${brief.businessName} offers a unique approach to ${brief.industry} that delivers real results.`,
        bulletPoints: brief.benefits.slice(0, 4),
      },
      benefits: {
        headline: 'What You\'ll Achieve',
        body: 'Our clients consistently see transformative results.',
        bulletPoints: brief.benefits,
      },
      howItWorks: {
        headline: 'How We Work Together',
        body: 'Our proven process ensures success at every step.',
        bulletPoints: [
          'Step 1: Discovery - We understand your unique needs',
          'Step 2: Strategy - We create a customized plan',
          'Step 3: Execution - We deliver exceptional results',
        ],
      },
      socialProof: {
        headline: 'Trusted by Industry Leaders',
        body: `Join ${brief.socialProof?.clientCount || 'hundreds'} of satisfied clients who have achieved remarkable results.`,
      },
      about: {
        headline: 'Built on Experience, Driven by Results',
        body: `${brief.businessName} was founded with a simple mission: to help ${brief.targetAudience} succeed. With ${brief.socialProof?.yearsInBusiness || 'years'} of experience, we've developed an approach that consistently delivers results.`,
      },
      faq: brief.painPoints.slice(0, 3).map(pain => ({
        question: `How do you address ${pain.toLowerCase()}?`,
        answer: `We tackle ${pain.toLowerCase()} head-on with our proven methodology and dedicated support.`,
      })),
      cta: {
        headline: 'Ready to Get Started?',
        body: `Don't wait to achieve the results you deserve. Contact us today and let's discuss how we can help.`,
      },
      footer: {
        tagline: brief.uniqueValue,
        copyright: `© ${new Date().getFullYear()} ${brief.businessName}. All rights reserved.`,
      },
    };
  }
}

/**
 * Improve existing copy
 */
export async function improveCopy(
  existingCopy: string,
  context: {
    type: 'headline' | 'body' | 'cta' | 'description';
    tone: CopywritingBrief['tone'];
    targetAudience: string;
  }
): Promise<string> {
  const prompt = `Improve this ${context.type} copy. Make it more compelling.

Current copy: "${existingCopy}"
Tone: ${context.tone}
Target audience: ${context.targetAudience}

RULES:
1. Keep the core message
2. Make it more specific
3. Add emotional appeal
4. Remove generic phrases
5. ${context.type === 'headline' ? 'Keep under 10 words' : ''}
6. ${context.type === 'cta' ? 'Make it action-oriented' : ''}

Return ONLY the improved copy, nothing else.`;

  try {
    const result = await generate({
      task: 'creative',
      prompt,
      temperature: 0.8,
    });

    return result.content.replace(/^["']|["']$/g, '').trim();
  } catch {
    return existingCopy;
  }
}

console.log('[Conversion Copywriter] ✍️ Compelling copy engine ready');

