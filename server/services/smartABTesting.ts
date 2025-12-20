/**
 * Smart A/B Testing Engine
 * AI-powered A/B testing that runs automatically
 */

import { generate } from './multiModelAIOrchestrator';
import { getErrorMessage, logError } from '../utils/errorHandler';
import * as cheerio from 'cheerio';

export interface ABTestVariation {
  id: string;
  name: string;
  html: string;
  css?: string;
  description: string;
  hypothesis: string;
}

export interface ABTestResult {
  variationId: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  confidence: number; // Statistical confidence (0-1)
  isWinner: boolean;
  improvement: number; // % improvement over control
}

export interface ABTest {
  id: string;
  name: string;
  elementSelector: string;
  variations: ABTestVariation[];
  status: 'running' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  results?: ABTestResult[];
  winner?: string;
}

// In-memory test store (use database in production)
const activeTests = new Map<string, ABTest>();
const testResults = new Map<string, ABTestResult[]>();

/**
 * Auto-generate A/B test variations
 */
export async function generateABTestVariations(
  originalHtml: string,
  elementSelector: string,
  clientInfo: any,
  variationCount: number = 3
): Promise<ABTestVariation[]> {
  try {
    console.log(`[SmartABTesting] 🧪 Generating ${variationCount} variations for ${elementSelector}...`);

    const $ = cheerio.load(originalHtml);
    const element = $(elementSelector).first();
    
    if (element.length === 0) {
      throw new Error(`Element not found: ${elementSelector}`);
    }

    const originalHtmlSnippet = $.html(element);
    const elementType = element.prop('tagName')?.toLowerCase() || 'div';
    const elementText = element.text().trim();
    const elementClasses = element.attr('class') || '';

    const prompt = `Generate ${variationCount} A/B test variations for this ${elementType} element:

Original HTML: ${originalHtmlSnippet}
Original Text: "${elementText}"
Element Classes: ${elementClasses}
Business: ${clientInfo.businessName || 'Unknown'}
Industry: ${clientInfo.industry || 'Unknown'}

For each variation, provide:
1. Name (descriptive name)
2. HTML (modified HTML)
3. Description (what changed and why)
4. Hypothesis (what we're testing)

Focus on:
- Headlines: Test different value propositions
- CTAs: Test different action words, colors, sizes
- Images: Test different visuals
- Layout: Test different arrangements
- Copy: Test different messaging

Return as JSON array of variations.`;

    const response = await generate({
      task: 'code',
      prompt,
      depth: 'advanced',
    });

    const variations: ABTestVariation[] = JSON.parse(response);
    
    // Add IDs
    variations.forEach((v, i) => {
      v.id = `variation-${Date.now()}-${i}`;
    });

    console.log(`[SmartABTesting] ✅ Generated ${variations.length} variations`);
    return variations;
  } catch (error) {
    logError(error, 'SmartABTesting - GenerateVariations', {
      elementSelector,
      variationCount,
    });
    throw new Error(`Failed to generate A/B test variations: ${getErrorMessage(error)}`);
  }
}

/**
 * Start an A/B test
 */
export async function startABTest(
  name: string,
  elementSelector: string,
  originalHtml: string,
  variations: ABTestVariation[],
  clientInfo: any
): Promise<ABTest> {
  try {
    console.log(`[SmartABTesting] 🚀 Starting A/B test: ${name}`);

    const test: ABTest = {
      id: `test-${Date.now()}`,
      name,
      elementSelector,
      variations: [
        {
          id: 'control',
          name: 'Control (Original)',
          html: originalHtml,
          description: 'Original version',
          hypothesis: 'Baseline performance',
        },
        ...variations,
      ],
      status: 'running',
      startDate: new Date(),
    };

    activeTests.set(test.id, test);
    testResults.set(test.id, []);

    console.log(`[SmartABTesting] ✅ Test started: ${test.id}`);
    return test;
  } catch (error) {
    logError(error, 'SmartABTesting - StartTest');
    throw new Error(`Failed to start A/B test: ${getErrorMessage(error)}`);
  }
}

/**
 * Record a test result (visitor/conversion)
 */
export function recordTestResult(
  testId: string,
  variationId: string,
  converted: boolean
): void {
  try {
    const results = testResults.get(testId) || [];
    let result = results.find(r => r.variationId === variationId);

    if (!result) {
      result = {
        variationId,
        visitors: 0,
        conversions: 0,
        conversionRate: 0,
        confidence: 0,
        isWinner: false,
        improvement: 0,
      };
      results.push(result);
    }

    result.visitors++;
    if (converted) {
      result.conversions++;
    }
    result.conversionRate = (result.conversions / result.visitors) * 100;

    testResults.set(testId, results);
  } catch (error) {
    logError(error, 'SmartABTesting - RecordResult');
  }
}

/**
 * Analyze test results and determine winner
 */
export async function analyzeTestResults(testId: string): Promise<ABTestResult[]> {
  try {
    const test = activeTests.get(testId);
    if (!test) {
      throw new Error(`Test not found: ${testId}`);
    }

    const results = testResults.get(testId) || [];
    
    if (results.length === 0) {
      return [];
    }

    // Calculate statistical confidence
    const controlResult = results.find(r => r.variationId === 'control');
    if (!controlResult) {
      return results;
    }

    const controlRate = controlResult.conversionRate;

    // Calculate improvement and confidence for each variation
    results.forEach(result => {
      if (result.variationId !== 'control') {
        result.improvement = ((result.conversionRate - controlRate) / controlRate) * 100;
        
        // Simplified confidence calculation (would use proper statistical test in production)
        const sampleSize = result.visitors;
        result.confidence = Math.min(0.95, sampleSize / 1000); // More visitors = higher confidence
      }
    });

    // Determine winner (highest conversion rate with sufficient confidence)
    const winner = results
      .filter(r => r.confidence > 0.8 && r.variationId !== 'control')
      .sort((a, b) => b.conversionRate - a.conversionRate)[0];

    if (winner) {
      winner.isWinner = true;
      const test = activeTests.get(testId);
      if (test) {
        test.winner = winner.variationId;
      }
    }

    return results;
  } catch (error) {
    logError(error, 'SmartABTesting - AnalyzeResults');
    throw new Error(`Failed to analyze test results: ${getErrorMessage(error)}`);
  }
}

/**
 * Auto-implement winning variation
 */
export async function implementWinner(
  testId: string,
  originalHtml: string
): Promise<string> {
  try {
    const test = activeTests.get(testId);
    if (!test) {
      throw new Error(`Test not found: ${testId}`);
    }

    if (!test.winner) {
      throw new Error('No winner determined yet');
    }

    const winnerVariation = test.variations.find(v => v.id === test.winner);
    if (!winnerVariation) {
      throw new Error('Winner variation not found');
    }

    // Replace element in HTML
    const $ = cheerio.load(originalHtml);
    $(test.elementSelector).first().replaceWith(winnerVariation.html);

    const updatedHtml = $.html();

    // Mark test as completed
    test.status = 'completed';
    test.endDate = new Date();
    activeTests.set(testId, test);

    console.log(`[SmartABTesting] ✅ Implemented winner: ${test.winner}`);
    return updatedHtml;
  } catch (error) {
    logError(error, 'SmartABTesting - ImplementWinner');
    throw new Error(`Failed to implement winner: ${getErrorMessage(error)}`);
  }
}

/**
 * Get active tests
 */
export function getActiveTests(): ABTest[] {
  return Array.from(activeTests.values()).filter(t => t.status === 'running');
}

/**
 * Get test by ID
 */
export function getTest(testId: string): ABTest | undefined {
  return activeTests.get(testId);
}

