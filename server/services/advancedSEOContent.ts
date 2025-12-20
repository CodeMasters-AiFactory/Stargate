/**
 * Advanced SEO Content Service
 * Generates world-class, SEO-optimized content using advanced AI techniques
 * Includes keyword research, content depth, semantic SEO, and conversion optimization
 */

import OpenAI from 'openai';

export interface SEOContentOptions {
  type: 'page-content' | 'blog-post' | 'product-description' | 'service-page' | 'landing-page' | 'about-page';
  topic: string;
  businessContext: {
    name: string;
    industry: string;
    businessType: string;
    targetAudience?: string;
    location?: string;
    services?: string[];
    competitors?: string[];
  };
  keywords: {
    primary: string[];
    secondary: string[];
    longTail?: string[];
    semantic?: string[];
  };
  depth: 'comprehensive' | 'detailed' | 'standard';
  wordCount?: number;
  tone?: 'professional' | 'friendly' | 'authoritative' | 'conversational';
  includeFAQ?: boolean;
  includeSchema?: boolean;
}

export interface SEOContentResult {
  headline: string;
  subheadline: string;
  body: string;
  keyPoints: string[];
  faq?: Array<{ question: string; answer: string }>;
  seoMeta: {
    title: string;
    description: string;
    keywords: string[];
    h1: string;
    h2s: string[];
  };
  schema?: {
    type: string;
    markup: string;
  };
  internalLinks?: Array<{ text: string; url: string; anchor: string }>;
}

/**
 * Create OpenAI client
 */
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

/**
 * Build comprehensive SEO content prompt
 */
function buildSEOContentPrompt(options: SEOContentOptions): string {
  const { type, topic, businessContext, keywords, depth, wordCount, tone, includeFAQ } = options;

  const depthInstructions = {
    'standard': 'Write comprehensive, well-researched content (800-1200 words). Include key points, examples, and actionable insights.',
    'detailed': 'Write in-depth, authoritative content (1500-2000 words). Include detailed explanations, case studies, statistics, and expert insights.',
    'comprehensive': 'Write exhaustive, world-class content (2500-3500 words). Include deep analysis, multiple examples, data-driven insights, expert quotes, and comprehensive coverage of the topic.',
  };

  const keywordSection = `
PRIMARY KEYWORDS (use naturally throughout, especially in headings):
${keywords.primary.join(', ')}

SECONDARY KEYWORDS (integrate naturally):
${keywords.secondary.join(', ')}

${keywords.longTail ? `LONG-TAIL KEYWORDS (use where relevant):\n${keywords.longTail.join(', ')}` : ''}

${keywords.semantic ? `SEMANTIC KEYWORDS (related terms to include):\n${keywords.semantic.join(', ')}` : ''}
  `.trim();

  return `
You are a world-class SEO content writer and digital marketing expert. Create ${depth} ${type} content about "${topic}" for ${businessContext.name}, a ${businessContext.industry} business.

BUSINESS CONTEXT:
- Name: ${businessContext.name}
- Industry: ${businessContext.industry}
- Business Type: ${businessContext.businessType}
${businessContext.targetAudience ? `- Target Audience: ${businessContext.targetAudience}` : ''}
${businessContext.location ? `- Location: ${businessContext.location}` : ''}
${businessContext.services ? `- Services: ${businessContext.services.join(', ')}` : ''}
${businessContext.competitors ? `- Competitors: ${businessContext.competitors.join(', ')}` : ''}

${keywordSection}

${depthInstructions[depth]}

${wordCount ? `Target word count: Approximately ${wordCount} words.` : ''}

TONE: ${tone || 'professional'} - ${tone === 'professional' ? 'Expert, trustworthy, authoritative' : tone === 'friendly' ? 'Approachable, warm, helpful' : tone === 'authoritative' ? 'Expert, commanding, credible' : 'Conversational, engaging, relatable'}

SEO REQUIREMENTS:
1. Use primary keywords in H1 and first paragraph naturally
2. Include secondary keywords in H2s and throughout content
3. Use semantic keywords to show topic depth
4. Create compelling, click-worthy meta title (60 chars max)
5. Write engaging meta description (160 chars max) with primary keyword
6. Structure content with proper H1, H2, H3 hierarchy
7. Include internal linking opportunities
8. Add relevant keywords to image alt text suggestions
9. Create natural keyword density (2-3% for primary, 1-2% for secondary)
10. Write for featured snippets (answer questions directly)

CONTENT REQUIREMENTS:
- Engaging, valuable, and conversion-focused
- Well-structured with clear sections
- Include statistics, examples, and proof points
- Address user intent and search queries
- Provide actionable insights
- Build trust and authority
${includeFAQ ? '- Include 8-12 comprehensive FAQ questions and answers' : ''}

OUTPUT FORMAT: JSON with this structure:
{
  "headline": "Compelling H1 headline with primary keyword",
  "subheadline": "Supporting subheadline",
  "body": "Full content body with proper HTML structure (use <h2>, <h3>, <p>, <ul>, <ol> tags)",
  "keyPoints": ["Key point 1", "Key point 2", ...],
  ${includeFAQ ? `"faq": [{"question": "Q", "answer": "A"}, ...],` : ''}
  "seoMeta": {
    "title": "SEO-optimized title (60 chars max)",
    "description": "Meta description (160 chars max)",
    "keywords": ["keyword1", "keyword2", ...],
    "h1": "Main heading",
    "h2s": ["H2 heading 1", "H2 heading 2", ...]
  },
  "internalLinks": [
    {"text": "Link text", "url": "/page-url", "anchor": "anchor-text"}
  ]
}
  `.trim();
}

/**
 * Generate world-class SEO content
 */
export async function generateAdvancedSEOContent(
  options: SEOContentOptions
): Promise<SEOContentResult> {
  const openai = createOpenAIClient();
  
  if (!openai) {
    console.log('[Advanced SEO Content] Mock mode - returning template content');
    return generateMockSEOContent(options);
  }

  try {
    const prompt = buildSEOContentPrompt(options);

    console.log(`[Advanced SEO Content] Generating ${options.depth} ${options.type} content for "${options.topic}"`);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a world-class SEO content writer specializing in creating high-ranking, conversion-focused content. Always respond with valid JSON only, no markdown formatting. Use proper HTML tags in the body content.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: options.depth === 'comprehensive' ? 8000 : 
                  options.depth === 'detailed' ? 4000 : 
                  2000,
    });

    const contentText = response.choices[0]?.message?.content || '{}';
    const content = JSON.parse(contentText) as SEOContentResult;

    // Enhance content with schema if requested
    if (options.includeSchema) {
      content.schema = generateSchemaForContent(content, options);
    }

    return validateAndEnhanceSEOContent(content, options);
  } catch (error) {
    console.error('[Advanced SEO Content] Error generating content:', error);
    return generateMockSEOContent(options);
  }
}

/**
 * Generate schema markup for content
 */
function generateSchemaForContent(content: SEOContentResult, options: SEOContentOptions): { type: string; markup: string } {
  if (options.type === 'blog-post') {
    return {
      type: 'Article',
      markup: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': content.headline,
        'description': content.seoMeta.description,
        'author': {
          '@type': 'Organization',
          'name': options.businessContext.name,
        },
        'publisher': {
          '@type': 'Organization',
          'name': options.businessContext.name,
        },
      }),
    };
  }
  
  return {
    type: 'WebPage',
    markup: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': content.headline,
      'description': content.seoMeta.description,
    }),
  };
}

/**
 * Validate and enhance SEO content
 */
function validateAndEnhanceSEOContent(
  content: SEOContentResult,
  options: SEOContentOptions
): SEOContentResult {
  // Ensure required fields
  if (!content.headline) {
    content.headline = options.topic;
  }
  if (!content.body) {
    content.body = `Content about ${options.topic} for ${options.businessContext.name}.`;
  }

  // Enhance SEO meta if missing
  if (!content.seoMeta) {
    content.seoMeta = {
      title: content.headline.substring(0, 60),
      description: content.body.substring(0, 160),
      keywords: options.keywords.primary,
      h1: content.headline,
      h2s: content.keyPoints || [],
    };
  }

  // Ensure keywords are included
  if (!content.seoMeta.keywords || content.seoMeta.keywords.length === 0) {
    content.seoMeta.keywords = options.keywords.primary;
  }

  return content;
}

/**
 * Generate mock SEO content
 */
function generateMockSEOContent(options: SEOContentOptions): SEOContentResult {
  return {
    headline: `${options.topic} - ${options.businessContext.name}`,
    subheadline: `Discover how ${options.businessContext.name} excels in ${options.topic}`,
    body: `<h2>Introduction</h2><p>Welcome to ${options.businessContext.name}, your trusted partner in ${options.businessContext.industry}. We specialize in ${options.topic} and are committed to delivering exceptional results.</p><h2>Why Choose Us</h2><p>Our expertise in ${options.topic} sets us apart. We combine industry knowledge with innovative solutions to deliver outstanding value.</p>`,
    keyPoints: [
      `Expert ${options.businessContext.industry} services`,
      'Professional and reliable',
      'Customer-focused approach',
    ],
    seoMeta: {
      title: `${options.topic} - ${options.businessContext.name}`,
      description: `Professional ${options.topic} services from ${options.businessContext.name}. Expert ${options.businessContext.industry} solutions.`,
      keywords: options.keywords.primary,
      h1: `${options.topic} - ${options.businessContext.name}`,
      h2s: ['Introduction', 'Why Choose Us'],
    },
  };
}

