/**
 * Data Quality Scorer Service
 * 
 * AI rates extracted data: completeness (0-100), accuracy assessment,
 * freshness indicator, missing data alerts, quality trends.
 */

import OpenAI from 'openai';
import { getErrorMessage, logError } from '../utils/errorHandler';

// Initialize OpenAI client
const openaiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openai = openaiKey
  ? new OpenAI({
      apiKey: openaiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    })
  : null;

export interface DataQualityScore {
  completeness: number; // 0-100
  accuracy: number; // 0-100
  freshness: 'fresh' | 'stale' | 'outdated';
  missingFields: string[];
  qualityTrend: 'improving' | 'stable' | 'declining';
  overallScore: number; // 0-100
  recommendations: string[];
}

/**
 * Score data quality
 */
export async function scoreDataQuality(
  extractedData: Record<string, any>,
  expectedFields?: string[]
): Promise<DataQualityScore> {
  try {
    // Calculate completeness
    const fields = expectedFields || Object.keys(extractedData);
    const presentFields = fields.filter(field => {
      const value = extractedData[field];
      return value !== null && value !== undefined && value !== '';
    });
    const completeness = fields.length > 0 ? 
      Math.round((presentFields.length / fields.length) * 100) : 100;

    // Identify missing fields
    const missingFields = fields.filter(field => {
      const value = extractedData[field];
      return value === null || value === undefined || value === '';
    });

    // Assess accuracy (simplified - check for reasonable values)
    let accuracy = 100;
    for (const [field, value] of Object.entries(extractedData)) {
      if (value === null || value === undefined) continue;
      
      // Check for common data quality issues
      if (typeof value === 'string') {
        if (value.length === 0) accuracy -= 5;
        if (value.includes('undefined') || value.includes('null')) accuracy -= 10;
        if (value.trim() !== value) accuracy -= 2; // Leading/trailing whitespace
      }
      
      if (Array.isArray(value) && value.length === 0) {
        accuracy -= 5; // Empty arrays might indicate incomplete extraction
      }
    }
    accuracy = Math.max(0, accuracy);

    // Assess freshness (simplified - would need timestamps)
    const freshness: 'fresh' | 'stale' | 'outdated' = 'fresh'; // Placeholder

    // Use AI to assess quality if available
    let aiAssessment: Partial<DataQualityScore> = {};
    if (openai) {
      try {
        const prompt = `Analyze the quality of this extracted data:

${JSON.stringify(extractedData, null, 2)}

Assess:
1. Completeness (0-100)
2. Accuracy (0-100)
3. Missing fields
4. Quality recommendations

Return JSON:
{
  "completeness": 85,
  "accuracy": 90,
  "missingFields": ["field1", "field2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a data quality expert. Analyze extracted web data for completeness and accuracy.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.1,
        });

        const content = response.choices[0]?.message?.content || '{}';
        try {
          const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
          const jsonString = jsonMatch ? jsonMatch[1] : content;
          aiAssessment = JSON.parse(jsonString);
        } catch (e) {
          // Use calculated values
        }
      } catch (e) {
        // Fall back to calculated values
      }
    }

    // Combine calculated and AI assessments
    const finalCompleteness = aiAssessment.completeness ?? completeness;
    const finalAccuracy = aiAssessment.accuracy ?? accuracy;
    const overallScore = Math.round((finalCompleteness + finalAccuracy) / 2);

    // Generate recommendations
    const recommendations: string[] = [];
    if (finalCompleteness < 80) {
      recommendations.push(`Improve completeness: ${finalCompleteness}% (target: 90%+)`);
    }
    if (finalAccuracy < 80) {
      recommendations.push(`Improve accuracy: ${finalAccuracy}% (target: 90%+)`);
    }
    if (missingFields.length > 0) {
      recommendations.push(`Add missing fields: ${missingFields.join(', ')}`);
    }
    if (aiAssessment.recommendations) {
      recommendations.push(...aiAssessment.recommendations);
    }

    return {
      completeness: finalCompleteness,
      accuracy: finalAccuracy,
      freshness,
      missingFields: aiAssessment.missingFields || missingFields,
      qualityTrend: 'stable', // Would need historical data
      overallScore,
      recommendations,
    };
  } catch (error) {
    logError(error, 'Data Quality Scorer');
    throw new Error(`Data quality scoring failed: ${getErrorMessage(error)}`);
  }
}

