/**
 * Conversion Optimization AI Service
 * Heatmap prediction, A/B testing automation, behavioral triggers
 */

import * as cheerio from 'cheerio';
import { generate } from './multiModelAIOrchestrator';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { PERFORMANCE_CONSTANTS } from '../utils/constants';

export interface HeatmapPrediction {
  element: string; // CSS selector
  attentionScore: number; // 0-100
  clickProbability: number; // 0-1
  recommendation: string;
}

export interface ABTestVariation {
  id: string;
  name: string;
  html: string;
  css?: string;
  changes: Array<{ element: string; change: string }>;
  predictedConversionRate: number;
}

export interface ConversionAnalysis {
  heatmap: HeatmapPrediction[];
  ctaPlacements: Array<{ selector: string; score: number; reason: string }>;
  scrollDepthOptimization: {
    optimalDepth: number; // pixels
    recommendations: string[];
  };
  behavioralTriggers: Array<{
    type: 'exit-intent' | 'scroll' | 'time' | 'click';
    config: Record<string, any>;
    recommendation: string;
  }>;
  benchmarkComparison: {
    industryAverage: number;
    predictedRate: number;
    improvement: number;
  };
}

/**
 * Predict heatmap (where users will look)
 */
export async function predictHeatmap(html: string, pageType: string = 'landing'): Promise<HeatmapPrediction[]> {
  try {
    const $ = cheerio.load(html);
    const predictions: HeatmapPrediction[] = [];

    // Analyze key elements
    const elements = [
      { selector: 'h1', weight: 0.3 },
      { selector: 'h2', weight: 0.2 },
      { selector: 'button, .btn, [class*="button"]', weight: 0.25 },
      { selector: 'a[href*="contact"], a[href*="signup"], a[href*="buy"]', weight: 0.3 },
      { selector: 'img', weight: 0.15 },
      { selector: 'form', weight: 0.2 },
    ];

    for (const { selector, weight } of elements) {
      $(selector).each((index, el) => {
        if (index >= 5) return false; // Limit to first 5 of each type

        const $el = $(el);
        const text = $el.text().trim();
        const isVisible = $el.is(':visible');
        const isAboveFold = $el.offset() && ($el.offset()?.top || 0) < PERFORMANCE_CONSTANTS.ABOVE_FOLD_THRESHOLD_PX;

        if (!isVisible || !text) return;

        // Calculate attention score
        let attentionScore = 50;
        if (isAboveFold) attentionScore += 30;
        if (text.length > 10 && text.length < 100) attentionScore += 10;
        if ($el.is('button, .btn')) attentionScore += 20;
        attentionScore = Math.min(100, attentionScore * weight);

        // Calculate click probability
        let clickProbability = 0.1;
        if ($el.is('button, .btn')) clickProbability = 0.4;
        if ($el.is('a[href*="contact"], a[href*="signup"]')) clickProbability = 0.3;
        if (text.toLowerCase().includes('free') || text.toLowerCase().includes('now')) {
          clickProbability += 0.2;
        }
        clickProbability = Math.min(1, clickProbability);

        // Generate recommendation
        let recommendation = '';
        if (attentionScore < 50) {
          recommendation = 'Move above fold or increase visual prominence';
        } else if (clickProbability < 0.3) {
          recommendation = 'Improve CTA copy or add urgency';
        } else {
          recommendation = 'Good placement - maintain current position';
        }

        predictions.push({
          element: selector,
          attentionScore: Math.round(attentionScore),
          clickProbability: Math.round(clickProbability * 100) / 100,
          recommendation,
        });
      });
    }

    // Use AI to enhance predictions
    const aiPrompt = `Analyze this ${pageType} page HTML and predict where users will focus attention and click.

HTML sample: ${$('body').html()?.substring(0, 2000) || ''}

Return JSON with enhanced heatmap predictions focusing on:
1. Above-fold elements
2. Call-to-action buttons
3. Form fields
4. Navigation elements

Format: [{"element": "selector", "attentionScore": 0-100, "clickProbability": 0-1, "recommendation": "string"}]`;

    try {
      const aiResponse = await generate({
        task: 'content',
        prompt: aiPrompt,
      });

      const aiPredictions = JSON.parse(aiResponse.content);
      if (Array.isArray(aiPredictions)) {
        predictions.push(...aiPredictions.slice(0, 10));
      }
    } catch (e) {
      // Continue with rule-based predictions if AI fails
      console.warn('[ConversionAI] AI enhancement failed, using rule-based predictions');
    }

    // Sort by attention score
    predictions.sort((a, b) => b.attentionScore - a.attentionScore);

    return predictions.slice(0, 20);
  } catch (error) {
    logError(error, 'ConversionAI - PredictHeatmap');
    throw error;
  }
}

/**
 * Generate A/B test variations
 */
export async function generateABTestVariations(
  html: string,
  elementSelector: string,
  count: number = 5
): Promise<ABTestVariation[]> {
  try {
    const $ = cheerio.load(html);
    const variations: ABTestVariation[] = [];

    const $element = $(elementSelector).first();
    if ($element.length === 0) {
      throw new Error(`Element not found: ${elementSelector}`);
    }

    const originalText = $element.text().trim();
    const originalHtml = $element.html() || '';

    // Generate variations using AI
    const variationPrompt = `Generate ${count} variations of this element for A/B testing:

Original: "${originalText}"
Element type: ${$element.prop('tagName')?.toLowerCase() || 'div'}

Create variations that:
1. Test different value propositions
2. Use urgency/scarcity
3. Vary call-to-action language
4. Test emotional vs. rational appeals
5. Test length (short vs. detailed)

Return JSON array:
[{
  "name": "Variation name",
  "text": "New text content",
  "changes": [{"element": "selector", "change": "description"}],
  "predictedConversionRate": 0-100
}]`;

    const aiResponse = await generate({
      task: 'content',
      prompt: variationPrompt,
    });

    const aiVariations = JSON.parse(aiResponse.content);
    if (!Array.isArray(aiVariations)) {
      throw new Error('Invalid AI response format');
    }

    for (let i = 0; i < Math.min(count, aiVariations.length); i++) {
      const variation = aiVariations[i];
      const $variation = $element.clone();
      $variation.html(variation.text || variation.html || originalHtml);

      const variationHtml = $.html();
      variations.push({
        id: `variation_${i + 1}`,
        name: variation.name || `Variation ${i + 1}`,
        html: variationHtml,
        changes: variation.changes || [{ element: elementSelector, change: 'Text updated' }],
        predictedConversionRate: variation.predictedConversionRate || 50,
      });
    }

    // Add original as control
    variations.unshift({
      id: 'control',
      name: 'Original (Control)',
      html: $.html(),
      changes: [],
      predictedConversionRate: 50,
    });

    console.log(`[ConversionAI] ✅ Generated ${variations.length} A/B test variations`);

    return variations;
  } catch (error) {
    logError(error, 'ConversionAI - GenerateABTestVariations');
    throw error;
  }
}

/**
 * Analyze conversion optimization opportunities
 */
export async function analyzeConversion(html: string, industry: string): Promise<ConversionAnalysis> {
  try {
    const $ = cheerio.load(html);

    // Predict heatmap
    const heatmap = await predictHeatmap(html, 'landing');

    // Analyze CTA placements
    const ctaPlacements: Array<{ selector: string; score: number; reason: string }> = [];
    $('button, .btn, a[class*="button"], a[class*="cta"]').each((index, el) => {
      if (index >= 10) return false;
      const $el = $(el);
      const top = $el.offset()?.top || 0;
      const isAboveFold = top < 800;
      const isVisible = $el.is(':visible');
      
      let score = 50;
      if (isAboveFold) score += 30;
      if (isVisible) score += 20;
      if ($el.text().toLowerCase().includes('free') || $el.text().toLowerCase().includes('now')) {
        score += 10;
      }

      ctaPlacements.push({
        selector: $el.attr('class') || $el.prop('tagName') || 'unknown',
        score,
        reason: isAboveFold ? 'Above fold - good visibility' : 'Below fold - consider moving up',
      });
    });

    // Scroll depth optimization
    const scrollDepthOptimization = {
      optimalDepth: 1200, // pixels
      recommendations: [
        'Place primary CTA at 800px scroll depth',
        'Add secondary CTA at 1600px scroll depth',
        'Use sticky header for navigation',
      ],
    };

    // Behavioral triggers
    const behavioralTriggers = [
      {
        type: 'exit-intent' as const,
        config: {
          enabled: true,
          message: 'Wait! Get 20% off your first order',
          cta: 'Claim Discount',
        },
        recommendation: 'Implement exit-intent popup to capture leaving visitors',
      },
      {
        type: 'scroll' as const,
        config: {
          enabled: true,
          triggerDepth: 75, // percentage
          action: 'show-cta',
        },
        recommendation: 'Show CTA when user scrolls 75% down the page',
      },
      {
        type: 'time' as const,
        config: {
          enabled: true,
          triggerSeconds: 30,
          action: 'show-offer',
        },
        recommendation: 'Show special offer after 30 seconds on page',
      },
    ];

    // Benchmark comparison
    const industryAverages: Record<string, number> = {
      'E-commerce': 2.5,
      'SaaS': 3.0,
      'Healthcare': 1.5,
      'Legal': 2.0,
      'Restaurant': 1.8,
      'default': 2.0,
    };

    const industryAverage = industryAverages[industry] || industryAverages.default;
    const predictedRate = industryAverage * 1.2; // Optimistic prediction
    const improvement = ((predictedRate - industryAverage) / industryAverage) * 100;

    return {
      heatmap,
      ctaPlacements: ctaPlacements.sort((a, b) => b.score - a.score),
      scrollDepthOptimization,
      behavioralTriggers,
      benchmarkComparison: {
        industryAverage,
        predictedRate,
        improvement: Math.round(improvement * 10) / 10,
      },
    };
  } catch (error) {
    logError(error, 'ConversionAI - AnalyzeConversion');
    throw error;
  }
}

