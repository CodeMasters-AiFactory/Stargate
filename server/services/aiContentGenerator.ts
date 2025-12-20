/**
 * Enhanced AI Content Generation Service
 * Generates deep, SEO-optimized content using advanced LLM capabilities
 * Creates FAQ sections, blog outlines, product descriptions, and more
 */

import OpenAI from 'openai';

export interface BusinessContext {
  name: string;
  industry: string;
  businessType: string;
  targetAudience?: string;
  services?: string[];
  location?: string;
  tone?: 'professional' | 'friendly' | 'casual' | 'formal';
}

export interface ContentGenerationOptions {
  type: 'page-content' | 'faq' | 'blog-outline' | 'product-description' | 'service-explanation' | 'testimonial';
  topic: string;
  businessContext: BusinessContext;
  depth: 'basic' | 'intermediate' | 'advanced';
  keywords?: string[];
  wordCount?: number;
}

export interface GeneratedContent {
  headline: string;
  subheadline?: string;
  body: string;
  keyPoints?: string[];
  faq?: Array<{ question: string; answer: string }>;
  cta?: string;
  seoMeta?: {
    title: string;
    description: string;
    keywords: string[];
  };
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
  
  // No keys available - will use mock mode
  return null;
}

/**
 * Build enhanced prompt for content generation
 */
function buildContentPrompt(options: ContentGenerationOptions): string {
  const { type, topic, businessContext, depth, keywords, wordCount } = options;

  const depthInstructions = {
    basic: 'Write concise, clear content (200-300 words).',
    intermediate: 'Write detailed, informative content (400-600 words) with key points and examples.',
    advanced: 'Write comprehensive, in-depth content (800-1200 words) with detailed explanations, examples, and actionable insights.',
  };

  const typeInstructions: Record<string, string> = {
    'page-content': `Create compelling page content for "${topic}" page. Include a strong headline, engaging subheadline, detailed body content, and a clear call-to-action.`,
    'faq': `Generate a comprehensive FAQ section about "${topic}" for ${businessContext.name}. Include 8-12 common questions with detailed, helpful answers.`,
    'blog-outline': `Create a detailed blog post outline about "${topic}" for ${businessContext.name}. Include title, introduction, 5-7 main sections with sub-points, and conclusion.`,
    'product-description': `Write a compelling product description for "${topic}" from ${businessContext.name}. Include features, benefits, use cases, and why customers should choose it.`,
    'service-explanation': `Explain the service "${topic}" offered by ${businessContext.name}. Include what it is, how it works, benefits, and who it's for.`,
    'testimonial': `Generate a realistic customer testimonial for ${businessContext.name} about "${topic}". Make it authentic and specific.`,
  };

  const keywordSection = keywords && keywords.length > 0
    ? `\n\nSEO Keywords to naturally incorporate: ${keywords.join(', ')}`
    : '';

  const wordCountSection = wordCount
    ? `\n\nTarget word count: Approximately ${wordCount} words.`
    : '';

  return `
You are an expert content writer creating ${depth} content for ${businessContext.name}, a ${businessContext.industry} business.

${typeInstructions[type]}

Business Context:
- Name: ${businessContext.name}
- Industry: ${businessContext.industry}
- Business Type: ${businessContext.businessType}
${businessContext.targetAudience ? `- Target Audience: ${businessContext.targetAudience}` : ''}
${businessContext.services ? `- Services: ${businessContext.services.join(', ')}` : ''}
${businessContext.location ? `- Location: ${businessContext.location}` : ''}
- Tone: ${businessContext.tone || 'professional'}

${depthInstructions[depth]}${keywordSection}${wordCountSection}

Requirements:
- SEO-optimized and keyword-rich
- Engaging and conversion-focused
- Professional yet approachable
- Clear value proposition
- Actionable and informative

Output format: JSON with the following structure:
{
  "headline": "Main headline",
  "subheadline": "Supporting subheadline (optional)",
  "body": "Main content body",
  "keyPoints": ["Key point 1", "Key point 2", ...],
  "faq": [{"question": "Q", "answer": "A"}, ...],
  "cta": "Call to action text",
  "seoMeta": {
    "title": "SEO title (60 chars max)",
    "description": "Meta description (160 chars max)",
    "keywords": ["keyword1", "keyword2", ...]
  }
}
  `.trim();
}

/**
 * Generate deep content using GPT-4o
 */
export async function generateDeepContent(
  options: ContentGenerationOptions
): Promise<GeneratedContent> {
  const openai = createOpenAIClient();
  
  // Mock mode if no API key
  if (!openai) {
    console.log('[AI Content Generator] Mock mode - returning template content');
    return generateMockContent(options);
  }

  try {
    const prompt = buildContentPrompt(options);

    console.log(`[AI Content Generator] Generating ${options.depth} ${options.type} content for "${options.topic}"`);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content writer specializing in SEO-optimized, conversion-focused website content. Always respond with valid JSON only, no markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: options.depth === 'advanced' ? 4000 : options.depth === 'intermediate' ? 2000 : 1000,
    });

    const contentText = response.choices[0]?.message?.content || '{}';
    const content = JSON.parse(contentText) as GeneratedContent;

    // Validate and enhance content
    return validateAndEnhanceContent(content, options);
  } catch (error) {
    console.error('[AI Content Generator] Error generating content:', error);
    // Fallback to mock content on error
    return generateMockContent(options);
  }
}

/**
 * Generate FAQ section
 */
export async function generateFAQSection(
  topic: string,
  businessContext: BusinessContext,
  questionCount: number = 10
): Promise<Array<{ question: string; answer: string }>> {
  const content = await generateDeepContent({
    type: 'faq',
    topic,
    businessContext,
    depth: 'intermediate',
  });

  // If FAQ was generated, return it; otherwise generate additional questions
  if (content.faq && content.faq.length >= questionCount) {
    return content.faq.slice(0, questionCount);
  }

  // Generate additional questions if needed
  const additionalQuestions = questionCount - (content.faq?.length || 0);
  if (additionalQuestions > 0) {
    const additionalContent = await generateDeepContent({
      type: 'faq',
      topic: `${topic} - additional questions`,
      businessContext,
      depth: 'basic',
    });

    const allFAQ = [
      ...(content.faq || []),
      ...(additionalContent.faq || []),
    ];

    return allFAQ.slice(0, questionCount);
  }

  return content.faq || [];
}

/**
 * Generate blog post outline
 */
export async function generateBlogOutline(
  topic: string,
  businessContext: BusinessContext
): Promise<{
  title: string;
  introduction: string;
  sections: Array<{
    heading: string;
    subPoints: string[];
  }>;
  conclusion: string;
}> {
  const content = await generateDeepContent({
    type: 'blog-outline',
    topic,
    businessContext,
    depth: 'advanced',
  });

  // Parse key points as sections
  const sections = (content.keyPoints || []).map((point, index) => ({
    heading: point,
    subPoints: [],
  }));

  return {
    title: content.headline,
    introduction: content.subheadline || content.body.split('\n')[0] || '',
    sections,
    conclusion: content.cta || 'Contact us to learn more',
  };
}

/**
 * Generate product descriptions
 */
export async function generateProductDescriptions(
  products: Array<{ name: string; category?: string }>,
  businessContext: BusinessContext
): Promise<Array<{ name: string; description: string; features: string[] }>> {
  const descriptions = [];

  for (const product of products) {
    const content = await generateDeepContent({
      type: 'product-description',
      topic: product.name,
      businessContext,
      depth: 'intermediate',
    });

    descriptions.push({
      name: product.name,
      description: content.body,
      features: content.keyPoints || [],
    });

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return descriptions;
}

/**
 * Generate service explanations
 */
export async function generateServiceExplanations(
  services: string[],
  businessContext: BusinessContext
): Promise<Array<{ name: string; explanation: string; benefits: string[] }>> {
  const explanations = [];

  for (const service of services) {
    const content = await generateDeepContent({
      type: 'service-explanation',
      topic: service,
      businessContext,
      depth: 'intermediate',
    });

    explanations.push({
      name: service,
      explanation: content.body,
      benefits: content.keyPoints || [],
    });

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return explanations;
}

/**
 * Validate and enhance generated content
 */
function validateAndEnhanceContent(
  content: GeneratedContent,
  options: ContentGenerationOptions
): GeneratedContent {
  // Ensure required fields exist
  if (!content.headline) {
    content.headline = options.topic;
  }
  if (!content.body) {
    content.body = `Content about ${options.topic} for ${options.businessContext.name}.`;
  }

  // Generate SEO meta if missing
  if (!content.seoMeta) {
    content.seoMeta = {
      title: content.headline.substring(0, 60),
      description: content.body.substring(0, 160),
      keywords: options.keywords || [],
    };
  }

  return content;
}

/**
 * Generate mock content when API is not available
 */
function generateMockContent(options: ContentGenerationOptions): GeneratedContent {
  const { topic, businessContext, type } = options;

  const mockContent: Record<string, GeneratedContent> = {
    'page-content': {
      headline: `${topic} - ${businessContext.name}`,
      subheadline: `Discover how ${businessContext.name} can help you`,
      body: `Welcome to ${businessContext.name}, your trusted partner in ${businessContext.industry}. We specialize in ${topic} and are committed to delivering exceptional results.`,
      keyPoints: [
        `Expert ${businessContext.industry} services`,
        'Professional and reliable',
        'Customer-focused approach',
      ],
      cta: 'Get Started Today',
      seoMeta: {
        title: `${topic} - ${businessContext.name}`,
        description: `Professional ${topic} services from ${businessContext.name}`,
        keywords: [topic, businessContext.industry, businessContext.name],
      },
    },
    'faq': {
      headline: 'Frequently Asked Questions',
      body: 'Common questions about our services',
      faq: [
        {
          question: `What services does ${businessContext.name} offer?`,
          answer: `${businessContext.name} provides comprehensive ${businessContext.industry} services.`,
        },
        {
          question: 'How can I get started?',
          answer: 'Contact us today to discuss your needs and get a free consultation.',
        },
      ],
    },
  };

  return mockContent[type] || mockContent['page-content'];
}

