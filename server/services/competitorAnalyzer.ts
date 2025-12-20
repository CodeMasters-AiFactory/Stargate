/**
 * Competitor Analyzer - CRITICAL FEATURE
 * Analyze competitor websites before generating
 * 
 * This is what separates "generic AI" from "strategic AI"
 */

import { generate } from './multiModelAIOrchestrator';

export interface CompetitorData {
  url: string;
  businessName: string;
  industry: string;
  
  // Design Analysis
  design: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontHeading: string;
    fontBody: string;
    darkMode: boolean;
    style: 'minimal' | 'corporate' | 'creative' | 'bold' | 'elegant';
  };
  
  // Content Analysis
  content: {
    heroHeadline: string;
    valueProposition: string;
    callToAction: string;
    keyMessages: string[];
    sections: string[];
    wordCount: number;
  };
  
  // SEO Analysis
  seo: {
    title: string;
    metaDescription: string;
    h1: string;
    h2s: string[];
    keywords: string[];
    estimatedKeywordDensity: Record<string, number>;
    hasSchema: boolean;
    hasOpenGraph: boolean;
  };
  
  // Performance
  performance: {
    estimatedLoadTime: 'fast' | 'medium' | 'slow';
    hasLazyLoading: boolean;
    hasOptimizedImages: boolean;
  };
  
  // Trust Signals
  trustSignals: {
    hasTestimonials: boolean;
    hasClientLogos: boolean;
    hasCertifications: boolean;
    hasStats: boolean;
    hasSocialProof: boolean;
  };
}

export interface CompetitorComparison {
  competitors: CompetitorData[];
  insights: {
    commonPatterns: string[];
    gaps: string[];
    opportunities: string[];
    recommendations: string[];
  };
  bestPractices: {
    design: string[];
    content: string[];
    seo: string[];
  };
}

/**
 * Analyze a competitor website
 * In production, this would use web scraping
 * For now, we use AI to simulate the analysis based on URL patterns
 */
export async function analyzeCompetitor(url: string): Promise<CompetitorData> {
  // Extract domain info
  let domain = '';
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    domain = urlObj.hostname.replace('www.', '');
  } catch {
    domain = url.replace('www.', '').split('/')[0];
  }
  
  const prompt = `You are an expert website analyst. Analyze what a typical website at ${domain} would look like.

Based on the domain name and common patterns in this industry, provide a detailed analysis.

Respond with ONLY valid JSON:
{
  "businessName": "Likely business name",
  "industry": "Industry category",
  "design": {
    "primaryColor": "#hexcolor (typical for this industry)",
    "secondaryColor": "#hexcolor",
    "accentColor": "#hexcolor",
    "fontHeading": "Likely heading font",
    "fontBody": "Likely body font",
    "darkMode": false,
    "style": "minimal|corporate|creative|bold|elegant"
  },
  "content": {
    "heroHeadline": "Typical headline for this type of business",
    "valueProposition": "Typical value proposition",
    "callToAction": "Typical CTA",
    "keyMessages": ["message1", "message2", "message3"],
    "sections": ["Hero", "Features", "About", etc.],
    "wordCount": 1500
  },
  "seo": {
    "title": "Typical page title",
    "metaDescription": "Typical meta description",
    "h1": "Typical H1",
    "h2s": ["H2 1", "H2 2", "H2 3"],
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "hasSchema": true,
    "hasOpenGraph": true
  },
  "performance": {
    "estimatedLoadTime": "fast|medium|slow",
    "hasLazyLoading": true,
    "hasOptimizedImages": true
  },
  "trustSignals": {
    "hasTestimonials": true,
    "hasClientLogos": true,
    "hasCertifications": false,
    "hasStats": true,
    "hasSocialProof": true
  }
}`;

  try {
    const result = await generate({
      task: 'analysis',
      prompt,
      temperature: 0.7,
    });

    const cleanJson = result.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const parsed = JSON.parse(cleanJson);
    return {
      url,
      ...parsed,
    };
  } catch (error) {
    console.error('[Competitor Analyzer] Error:', error);
    // Return defaults
    return {
      url,
      businessName: domain,
      industry: 'Business',
      design: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        accentColor: '#F59E0B',
        fontHeading: 'Inter',
        fontBody: 'Inter',
        darkMode: false,
        style: 'corporate',
      },
      content: {
        heroHeadline: 'Welcome to Our Business',
        valueProposition: 'Quality services for your needs',
        callToAction: 'Get Started',
        keyMessages: ['Quality', 'Experience', 'Trust'],
        sections: ['Hero', 'Features', 'About', 'Contact'],
        wordCount: 1500,
      },
      seo: {
        title: `${domain} - Home`,
        metaDescription: `Welcome to ${domain}`,
        h1: 'Welcome',
        h2s: ['Our Services', 'About Us', 'Contact'],
        keywords: [domain.split('.')[0], 'services', 'business'],
        estimatedKeywordDensity: {},
        hasSchema: true,
        hasOpenGraph: true,
      },
      performance: {
        estimatedLoadTime: 'medium',
        hasLazyLoading: true,
        hasOptimizedImages: true,
      },
      trustSignals: {
        hasTestimonials: true,
        hasClientLogos: false,
        hasCertifications: false,
        hasStats: true,
        hasSocialProof: true,
      },
    };
  }
}

/**
 * Analyze multiple competitors and compare
 */
export async function analyzeCompetitors(urls: string[]): Promise<CompetitorComparison> {
  const competitors: CompetitorData[] = [];
  
  // Analyze each competitor
  for (const url of urls) {
    try {
      const data = await analyzeCompetitor(url);
      competitors.push(data);
    } catch (error) {
      console.error(`[Competitor Analyzer] Failed to analyze ${url}:`, error);
    }
  }
  
  if (competitors.length === 0) {
    throw new Error('No competitors could be analyzed');
  }
  
  // Generate insights from comparison
  const insights = await generateInsights(competitors);
  
  return {
    competitors,
    ...insights,
  };
}

/**
 * Generate insights from competitor analysis
 */
async function generateInsights(competitors: CompetitorData[]): Promise<{
  insights: CompetitorComparison['insights'];
  bestPractices: CompetitorComparison['bestPractices'];
}> {
  const prompt = `Analyze these competitor websites and provide strategic insights:

Competitors:
${competitors.map(c => `
- ${c.businessName} (${c.url})
  Industry: ${c.industry}
  Style: ${c.design.style}
  Hero: "${c.content.heroHeadline}"
  CTA: "${c.content.callToAction}"
  Keywords: ${c.seo.keywords.join(', ')}
  Sections: ${c.content.sections.join(' → ')}
`).join('\n')}

Provide strategic insights in JSON:
{
  "insights": {
    "commonPatterns": ["What all competitors do similarly"],
    "gaps": ["What competitors are missing that we can exploit"],
    "opportunities": ["Unique opportunities to differentiate"],
    "recommendations": ["Specific recommendations to be BETTER"]
  },
  "bestPractices": {
    "design": ["Design patterns that work in this industry"],
    "content": ["Content approaches that convert"],
    "seo": ["SEO strategies to implement"]
  }
}`;

  try {
    const result = await generate({
      task: 'analysis',
      prompt,
      temperature: 0.7,
    });

    const cleanJson = result.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanJson);
  } catch {
    // Return default insights
    return {
      insights: {
        commonPatterns: [
          'Most use hero sections with strong headlines',
          'All have clear call-to-action buttons',
          'Social proof is standard',
        ],
        gaps: [
          'Limited unique value propositions',
          'Generic messaging',
          'Slow page load times',
        ],
        opportunities: [
          'More specific targeting',
          'Better mobile experience',
          'More authentic testimonials',
        ],
        recommendations: [
          'Create a unique hook in the hero',
          'Add more social proof',
          'Optimize for speed',
          'Use industry-specific keywords',
        ],
      },
      bestPractices: {
        design: [
          'Clean, modern design',
          'Strong visual hierarchy',
          'Consistent branding',
        ],
        content: [
          'Clear value proposition above the fold',
          'Feature-benefit structure',
          'Trust signals throughout',
        ],
        seo: [
          'Keyword-optimized headings',
          'Meta descriptions with CTAs',
          'Schema markup for rich results',
        ],
      },
    };
  }
}

/**
 * Generate recommendations for beating competitors
 */
export async function generateCompetitiveStrategy(
  competitors: CompetitorData[],
  businessInfo: {
    name: string;
    industry: string;
    uniqueValue: string;
  }
): Promise<{
  positioning: string;
  keyDifferentiators: string[];
  contentStrategy: string[];
  seoStrategy: string[];
  designDirection: {
    colors: { primary: string; secondary: string; accent: string };
    style: string;
    typography: string;
  };
}> {
  const prompt = `Create a competitive strategy for ${businessInfo.name} (${businessInfo.industry}).

Their unique value: "${businessInfo.uniqueValue}"

Competitors analysis:
${competitors.map(c => `- ${c.businessName}: ${c.content.heroHeadline}`).join('\n')}

Create a strategy to BEAT them. Respond in JSON:
{
  "positioning": "How to position against competitors",
  "keyDifferentiators": ["3 things that make us stand out"],
  "contentStrategy": ["5 content recommendations"],
  "seoStrategy": ["5 SEO recommendations"],
  "designDirection": {
    "colors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex" },
    "style": "Direction that differentiates",
    "typography": "Font recommendation"
  }
}`;

  try {
    const result = await generate({
      task: 'analysis',
      prompt,
      temperature: 0.8,
    });

    const cleanJson = result.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanJson);
  } catch {
    return {
      positioning: 'Position as the innovative alternative',
      keyDifferentiators: [
        'Modern, fresh approach',
        'Better customer focus',
        'Superior quality',
      ],
      contentStrategy: [
        'Lead with unique value proposition',
        'Use specific, measurable claims',
        'Include customer success stories',
        'Create comprehensive resources',
        'Address competitor weaknesses',
      ],
      seoStrategy: [
        'Target long-tail keywords competitors miss',
        'Create better content on key topics',
        'Build quality backlinks',
        'Optimize for local search',
        'Use schema markup extensively',
      ],
      designDirection: {
        colors: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#F59E0B' },
        style: 'Modern and distinctive',
        typography: 'Space Grotesk + Inter',
      },
    };
  }
}

console.log('[Competitor Analyzer] 🔍 Competitive intelligence ready');

