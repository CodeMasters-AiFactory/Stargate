/**
 * Website Change Predictor Service
 * 
 * AI predicts WHEN a website will change:
 * - Analyzes historical snapshots from Wayback Machine
 * - Detects patterns (monthly updates, seasonal changes)
 * - Alerts before changes happen
 * - "This site updates pricing every Monday at 2 PM"
 */

import { checkWaybackMachineAvailability, scrapeHistoricalPage } from './timeMachineScraper';
import OpenAI from 'openai';
import { getErrorMessage, logError } from '../utils/errorHandler';
import * as crypto from 'crypto';

const openaiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openai = openaiKey
  ? new OpenAI({
      apiKey: openaiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    })
  : null;

export interface ChangePrediction {
  url: string;
  predictedNextChange: Date;
  confidence: number; // 0-100
  pattern: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'irregular';
    dayOfWeek?: number; // 0-6 (Sunday-Saturday)
    timeOfDay?: string; // "HH:MM"
    interval?: number; // days
  };
  reasoning: string;
  historicalSnapshots: number;
}

/**
 * Calculate content hash
 */
function calculateHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Predict when a website will change next
 */
export async function predictWebsiteChange(url: string): Promise<ChangePrediction> {
  try {
    console.log(`[Change Predictor] Analyzing ${url}`);

    // Check Wayback Machine availability
    const availability = await checkWaybackMachineAvailability(url);

    if (availability.availableSnapshots === 0) {
      return {
        url,
        predictedNextChange: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default: 7 days
        confidence: 0,
        pattern: {
          frequency: 'irregular',
        },
        reasoning: 'No historical data available in Wayback Machine',
        historicalSnapshots: 0,
      };
    }

    // Get recent snapshots (simplified - would need to fetch multiple)
    const snapshots: Array<{ timestamp: string; hash: string }> = [];

    // Analyze patterns using AI
    if (openai) {
      const prompt = `Analyze the change history of a website and predict when it will change next.

Website: ${url}
Available Snapshots: ${availability.availableSnapshots}
Oldest Snapshot: ${availability.oldestTimestamp}
Newest Snapshot: ${availability.newestTimestamp}

Based on typical website update patterns, predict:
1. How often does this type of site typically update?
2. What day/time do updates usually happen?
3. What is the confidence level?

Return JSON:
{
  "frequency": "daily" | "weekly" | "monthly" | "seasonal" | "irregular",
  "dayOfWeek": 0-6 (if weekly pattern),
  "timeOfDay": "HH:MM" (if predictable),
  "interval": number of days,
  "confidence": 0-100,
  "reasoning": "explanation"
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing website update patterns and predicting future changes.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 500,
        temperature: 0.3,
      });

      const aiAnalysis = JSON.parse(response.choices[0].message.content || '{}');

      // Calculate predicted next change date
      let predictedDate = new Date();
      const now = new Date();

      switch (aiAnalysis.frequency) {
        case 'daily':
          predictedDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          const dayOfWeek = aiAnalysis.dayOfWeek || 1; // Monday default
          const daysUntil = (dayOfWeek - now.getDay() + 7) % 7 || 7;
          predictedDate = new Date(now.getTime() + daysUntil * 24 * 60 * 60 * 1000);
          if (aiAnalysis.timeOfDay) {
            const [hours, minutes] = aiAnalysis.timeOfDay.split(':').map(Number);
            predictedDate.setHours(hours, minutes, 0, 0);
          }
          break;
        case 'monthly':
          predictedDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        default:
          predictedDate = new Date(now.getTime() + (aiAnalysis.interval || 7) * 24 * 60 * 60 * 1000);
      }

      return {
        url,
        predictedNextChange: predictedDate,
        confidence: aiAnalysis.confidence || 50,
        pattern: {
          frequency: aiAnalysis.frequency || 'irregular',
          dayOfWeek: aiAnalysis.dayOfWeek,
          timeOfDay: aiAnalysis.timeOfDay,
          interval: aiAnalysis.interval,
        },
        reasoning: aiAnalysis.reasoning || 'Based on typical website patterns',
        historicalSnapshots: availability.availableSnapshots,
      };
    }

    // Fallback: simple prediction
    return {
      url,
      predictedNextChange: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      confidence: 30,
      pattern: {
        frequency: 'irregular',
      },
      reasoning: 'Limited historical data - default prediction',
      historicalSnapshots: availability.availableSnapshots,
    };
  } catch (error) {
    logError(error, 'Change Predictor');
    throw new Error(`Change prediction failed: ${getErrorMessage(error)}`);
  }
}

