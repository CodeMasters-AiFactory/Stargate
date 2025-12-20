/**
 * Smart Content Mining Service
 * Analyzes competitor websites to extract content, keywords, services, pricing
 */

import * as cheerio from 'cheerio';
import { scrapeWebsiteFull } from './websiteScraper';
import { generate } from './multiModelAIOrchestrator';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { CONTENT_MINING_CONSTANTS } from '../utils/constants';

export interface CompetitorAnalysis {
  url: string;
  companyName: string;
  industry: string;
  content: {
    headlines: string[];
    services: Array<{ name: string; description: string }>;
    pricing?: Array<{ plan: string; price: string; features: string[] }>;
    keywords: string[];
    valuePropositions: string[];
    testimonials: Array<{ name: string; quote: string }>;
  };
  gaps: string[]; // Opportunities not addressed by competitor
  recommendations: string[];
}

/**
 * Analyze competitor website
 */
export async function analyzeCompetitor(
  url: string,
  industry: string
): Promise<CompetitorAnalysis> {
  try {
    console.log(`[ContentMining] 🔍 Analyzing competitor: ${url}`);

    // Scrape website
    const scraped = await scrapeWebsiteFull(url);
    
    if (!scraped || !scraped.htmlContent) {
      throw new Error('Failed to scrape competitor website');
    }

    const $ = cheerio.load(scraped.htmlContent);

    // Extract basic content
    const headlines: string[] = [];
    $('h1, h2, h3').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 10 && text.length < 200) {
        headlines.push(text);
      }
    });

    // Extract services (common patterns)
    const services: Array<{ name: string; description: string }> = [];
    $('.service, .service-item, [class*="service"], [class*="offering"]').each((_, el) => {
      const title = $(el).find('h3, h4, .title, [class*="title"]').first().text().trim();
      const desc = $(el).find('p, .description, [class*="desc"]').first().text().trim();
      if (title && title.length > 3) {
        services.push({
          name: title,
          description: desc || '',
        });
      }
    });

    // Extract pricing (common patterns)
    const pricing: Array<{ plan: string; price: string; features: string[] }> = [];
    $('.pricing, .price, [class*="pricing"], [class*="plan"]').each((_, el) => {
      const plan = $(el).find('h3, h4, .plan-name, [class*="plan"]').first().text().trim();
      const price = $(el).find('.price, [class*="price"]').first().text().trim();
      const features: string[] = [];
      $(el).find('li, .feature, [class*="feature"]').each((_, featureEl) => {
        const feature = $(featureEl).text().trim();
        if (feature) features.push(feature);
      });
      if (plan && price) {
        pricing.push({ plan, price, features });
      }
    });

    // Extract testimonials
    const testimonials: Array<{ name: string; quote: string }> = [];
    $('.testimonial, .review, [class*="testimonial"], [class*="review"]').each((_, el) => {
      const name = $(el).find('.name, .author, [class*="name"]').first().text().trim();
      const quote = $(el).find('p, .quote, [class*="quote"]').first().text().trim();
      if (name && quote) {
        testimonials.push({ name, quote });
      }
    });

    // Use AI to extract keywords and analyze content
    const contentText = $('body').text().substring(0, 5000); // First 5000 chars
    const analysisPrompt = `Analyze this competitor website content and extract:
1. Top 10 keywords/phrases
2. Value propositions (what makes them unique)
3. Content gaps (what they're missing)
4. Recommendations for a competitor

Website: ${url}
Industry: ${industry}
Content sample: ${contentText.substring(0, 2000)}

Return JSON:
{
  "keywords": ["keyword1", "keyword2", ...],
  "valuePropositions": ["prop1", "prop2", ...],
  "gaps": ["gap1", "gap2", ...],
  "recommendations": ["rec1", "rec2", ...]
}`;

    const aiAnalysis = await generate({
      task: 'content',
      prompt: analysisPrompt,
      depth: 'advanced',
    });

    let keywords: string[] = [];
    let valuePropositions: string[] = [];
    let gaps: string[] = [];
    let recommendations: string[] = [];

    try {
      const parsed = JSON.parse(aiAnalysis);
      keywords = parsed.keywords || [];
      valuePropositions = parsed.valuePropositions || [];
      gaps = parsed.gaps || [];
      recommendations = parsed.recommendations || [];
    } catch (e) {
      // Fallback: extract keywords from text
      const words = contentText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
      const wordFreq: Record<string, number> = {};
      words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
      keywords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
    }

    console.log(`[ContentMining] ✅ Analyzed ${scraped.companyName}: ${services.length} services, ${keywords.length} keywords`);

    return {
      url,
      companyName: scraped.companyName,
      industry,
      content: {
        headlines: headlines.slice(0, 20),
        services: services.slice(0, 10),
        pricing: pricing.slice(0, 5),
        keywords,
        valuePropositions,
        testimonials: testimonials.slice(0, 5),
      },
      gaps,
      recommendations,
    };
  } catch (error) {
    logError(error, 'ContentMining - AnalyzeCompetitor');
    throw error;
  }
}

/**
 * Analyze multiple competitors and generate insights
 */
export async function analyzeCompetitors(
  urls: string[],
  industry: string
): Promise<{
  competitors: CompetitorAnalysis[];
  industryInsights: {
    commonKeywords: string[];
    commonServices: string[];
    averagePricing: Record<string, number>;
    gaps: string[];
    opportunities: string[];
  };
}> {
  const competitors: CompetitorAnalysis[] = [];

  for (const url of urls) {
    try {
      const analysis = await analyzeCompetitor(url, industry);
      competitors.push(analysis);
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, CONTENT_MINING_CONSTANTS.RATE_LIMIT_DELAY_MS));
    } catch (error) {
      console.warn(`[ContentMining] ⚠️ Failed to analyze ${url}:`, getErrorMessage(error));
    }
  }

  // Generate industry insights
  const allKeywords = competitors.flatMap(c => c.content.keywords);
  const keywordFreq: Record<string, number> = {};
  allKeywords.forEach(kw => {
    keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
  });
  const commonKeywords = Object.entries(keywordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([kw]) => kw);

  const allServices = competitors.flatMap(c => c.content.services.map(s => s.name));
  const serviceFreq: Record<string, number> = {};
  allServices.forEach(svc => {
    serviceFreq[svc] = (serviceFreq[svc] || 0) + 1;
  });
  const commonServices = Object.entries(serviceFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([svc]) => svc);

  const allGaps = competitors.flatMap(c => c.gaps);
  const gapFreq: Record<string, number> = {};
  allGaps.forEach(gap => {
    gapFreq[gap] = (gapFreq[gap] || 0) + 1;
  });
  const opportunities = Object.entries(gapFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([gap]) => gap);

  return {
    competitors,
    industryInsights: {
      commonKeywords,
      commonServices,
      averagePricing: {}, // TODO: Calculate from pricing data
      gaps: opportunities,
      opportunities,
    },
  };
}

