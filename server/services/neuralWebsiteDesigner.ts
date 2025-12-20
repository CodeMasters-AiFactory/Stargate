/**
 * Neural Website Designer Service
 * AI that learns from user preferences and predicts design choices
 */

import { generate } from './multiModelAIOrchestrator';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { db } from '../db';
import { brandTemplates } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface UserPreference {
  userId: string;
  preferenceType: 'color' | 'layout' | 'typography' | 'spacing' | 'imagery' | 'style';
  preferenceValue: string;
  confidence: number; // 0-1
  context: string; // Industry, business type, etc.
  timestamp: Date;
}

export interface DesignPattern {
  id: string;
  name: string;
  category: 'hero' | 'navigation' | 'footer' | 'content' | 'cta' | 'gallery';
  html: string;
  css: string;
  performanceScore: number; // 0-100
  conversionScore: number; // 0-100
  usageCount: number;
  successRate: number; // 0-1
}

export interface DesignPrediction {
  element: string; // Selector or element type
  predictedDesign: {
    colors: string[];
    layout: string;
    typography: string;
    spacing: string;
    imagery: string;
  };
  confidence: number; // 0-1
  reasoning: string;
  alternatives: Array<{
    design: any;
    confidence: number;
    reasoning: string;
  }>;
}

export interface LearningInsight {
  insight: string;
  confidence: number;
  evidence: string[];
  recommendation: string;
}

// In-memory stores (use database in production)
const userPreferences = new Map<string, UserPreference[]>();
const designPatterns = new Map<string, DesignPattern>();
const userBehavior = new Map<string, Array<{ action: string; timestamp: Date; context: any }>>();

/**
 * Learn from user design choices
 */
export async function learnFromUserChoice(
  userId: string,
  choice: {
    element: string;
    selectedDesign: any;
    rejectedDesigns?: any[];
    context: {
      industry?: string;
      businessType?: string;
      targetAudience?: string;
    };
  }
): Promise<void> {
  try {
    console.log(`[NeuralDesigner] 🧠 Learning from user ${userId} choice...`);

    // Extract preferences from choice
    const preferences = extractPreferences(choice.selectedDesign, choice.context);
    
    // Store preferences
    const existingPreferences = userPreferences.get(userId) || [];
    existingPreferences.push(...preferences);
    userPreferences.set(userId, existingPreferences);

    // Update design pattern success rates
    if (choice.selectedDesign.patternId) {
      updatePatternSuccess(choice.selectedDesign.patternId, true);
    }

    // Record behavior
    const behaviors = userBehavior.get(userId) || [];
    behaviors.push({
      action: 'design_selected',
      timestamp: new Date(),
      context: choice,
    });
    userBehavior.set(userId, behaviors);

    console.log(`[NeuralDesigner] ✅ Learned ${preferences.length} preferences from user choice`);
  } catch (error) {
    logError(error, 'NeuralDesigner - LearnFromChoice', { userId });
    throw new Error(`Failed to learn from user choice: ${getErrorMessage(error)}`);
  }
}

/**
 * Predict design choices for user
 */
export async function predictDesignChoices(
  userId: string,
  element: string,
  context: {
    industry?: string;
    businessType?: string;
    targetAudience?: string;
    currentDesign?: any;
  }
): Promise<DesignPrediction> {
  try {
    console.log(`[NeuralDesigner] 🔮 Predicting design for user ${userId}...`);

    // Get user preferences
    const preferences = userPreferences.get(userId) || [];
    
    // Get similar users' preferences
    const similarUsers = findSimilarUsers(userId, context);
    
    // Get successful design patterns
    const successfulPatterns = getSuccessfulPatterns(context);

    // Generate prediction using AI
    const prompt = `Based on the following information, predict the best design choices for this element:

Element: ${element}
Industry: ${context.industry || 'Unknown'}
Business Type: ${context.businessType || 'Unknown'}
Target Audience: ${context.targetAudience || 'Unknown'}

User Preferences:
${preferences.map(p => `- ${p.preferenceType}: ${p.preferenceValue} (confidence: ${p.confidence})`).join('\n')}

Similar Users' Preferences:
${similarUsers.map(u => `- User ${u.userId}: ${u.preferences.join(', ')}`).join('\n')}

Successful Patterns:
${successfulPatterns.map(p => `- ${p.name}: ${p.successRate}% success rate`).join('\n')}

Predict:
1. Colors (array of hex codes)
2. Layout (description)
3. Typography (font family, sizes)
4. Spacing (margins, padding)
5. Imagery (style description)

Also provide:
- Confidence level (0-1)
- Reasoning (why these choices)
- 2-3 alternative designs with reasoning

Return as JSON.`;

    const response = await generate({
      task: 'design',
      prompt,
    });

    const prediction: DesignPrediction = JSON.parse(response.content);
    
    console.log(`[NeuralDesigner] ✅ Predicted design with ${(prediction.confidence * 100).toFixed(1)}% confidence`);
    return prediction;
  } catch (error) {
    logError(error, 'NeuralDesigner - PredictDesign', { userId });
    throw new Error(`Failed to predict design choices: ${getErrorMessage(error)}`);
  }
}

/**
 * Generate personalized design variations
 */
export async function generatePersonalizedDesigns(
  userId: string,
  baseDesign: any,
  count: number = 3
): Promise<Array<{ design: any; confidence: number; reasoning: string }>> {
  try {
    console.log(`[NeuralDesigner] ✨ Generating ${count} personalized designs for user ${userId}...`);

    const preferences = userPreferences.get(userId) || [];
    const behaviors = userBehavior.get(userId) || [];

    const prompt = `Generate ${count} personalized design variations based on:

Base Design: ${JSON.stringify(baseDesign)}
User Preferences: ${JSON.stringify(preferences)}
User Behavior: ${JSON.stringify(behaviors.slice(-10))} // Last 10 actions

For each variation:
- Apply user preferences
- Consider user behavior patterns
- Maintain design consistency
- Optimize for user's industry/audience

Return as JSON array with design, confidence, and reasoning.`;

    const response = await generate({
      task: 'design',
      prompt,
    });

    const variations: Array<{ design: any; confidence: number; reasoning: string }> = JSON.parse(response.content);
    
    console.log(`[NeuralDesigner] ✅ Generated ${variations.length} personalized designs`);
    return variations;
  } catch (error) {
    logError(error, 'NeuralDesigner - GeneratePersonalized');
    throw new Error(`Failed to generate personalized designs: ${getErrorMessage(error)}`);
  }
}

/**
 * Get learning insights
 */
export async function getLearningInsights(userId: string): Promise<LearningInsight[]> {
  try {
    console.log(`[NeuralDesigner] 📊 Generating learning insights for user ${userId}...`);

    const preferences = userPreferences.get(userId) || [];
    const behaviors = userBehavior.get(userId) || [];

    if (preferences.length === 0 && behaviors.length === 0) {
      return [];
    }

    const prompt = `Analyze user preferences and behavior to generate insights:

Preferences: ${JSON.stringify(preferences)}
Behavior: ${JSON.stringify(behaviors)}

Generate insights about:
1. Design patterns the user prefers
2. Trends in their choices
3. Recommendations for future designs
4. Areas where preferences are unclear

For each insight, provide:
- Insight (description)
- Confidence (0-1)
- Evidence (array of examples)
- Recommendation (actionable advice)

Return as JSON array.`;

    const response = await generate({
      task: 'analysis',
      prompt,
    });

    const insights: LearningInsight[] = JSON.parse(response.content);
    
    console.log(`[NeuralDesigner] ✅ Generated ${insights.length} insights`);
    return insights;
  } catch (error) {
    logError(error, 'NeuralDesigner - GetInsights');
    throw new Error(`Failed to get learning insights: ${getErrorMessage(error)}`);
  }
}

/**
 * Register a design pattern
 */
export async function registerDesignPattern(pattern: Omit<DesignPattern, 'id' | 'usageCount' | 'successRate'>): Promise<DesignPattern> {
  try {
    const newPattern: DesignPattern = {
      id: `pattern-${Date.now()}`,
      ...pattern,
      usageCount: 0,
      successRate: 0,
    };

    designPatterns.set(newPattern.id, newPattern);
    
    console.log(`[NeuralDesigner] ✅ Registered design pattern: ${newPattern.name}`);
    return newPattern;
  } catch (error) {
    logError(error, 'NeuralDesigner - RegisterPattern');
    throw new Error(`Failed to register design pattern: ${getErrorMessage(error)}`);
  }
}

// Helper functions

function extractPreferences(design: any, context: any): UserPreference[] {
  const preferences: UserPreference[] = [];
  const userId = 'current-user'; // Would come from context

  if (design.colors) {
    design.colors.forEach((color: string) => {
      preferences.push({
        userId,
        preferenceType: 'color',
        preferenceValue: color,
        confidence: 0.8,
        context: JSON.stringify(context),
        timestamp: new Date(),
      });
    });
  }

  if (design.layout) {
    preferences.push({
      userId,
      preferenceType: 'layout',
      preferenceValue: design.layout,
      confidence: 0.7,
      context: JSON.stringify(context),
      timestamp: new Date(),
    });
  }

  if (design.typography) {
    preferences.push({
      userId,
      preferenceType: 'typography',
      preferenceValue: design.typography,
      confidence: 0.7,
      context: JSON.stringify(context),
      timestamp: new Date(),
    });
  }

  return preferences;
}

function findSimilarUsers(userId: string, context: any): Array<{ userId: string; preferences: string[] }> {
  // Simplified - would use ML clustering in production
  const similar: Array<{ userId: string; preferences: string[] }> = [];
  
  // Find users with similar industry/context
  userPreferences.forEach((prefs, uid) => {
    if (uid !== userId && prefs.length > 0) {
      const contextMatch = prefs.some(p => 
        p.context.includes(context.industry || '') ||
        p.context.includes(context.businessType || '')
      );
      
      if (contextMatch) {
        similar.push({
          userId: uid,
          preferences: prefs.map(p => `${p.preferenceType}: ${p.preferenceValue}`),
        });
      }
    }
  });

  return similar.slice(0, 5); // Top 5 similar users
}

function getSuccessfulPatterns(context: any): DesignPattern[] {
  const patterns = Array.from(designPatterns.values());
  
  // Filter by success rate and relevance
  return patterns
    .filter(p => p.successRate > 0.7)
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 10);
}

function updatePatternSuccess(patternId: string, success: boolean): void {
  const pattern = designPatterns.get(patternId);
  if (!pattern) return;

  pattern.usageCount++;
  
  // Update success rate (simplified moving average)
  const successWeight = success ? 1 : 0;
  pattern.successRate = (pattern.successRate * (pattern.usageCount - 1) + successWeight) / pattern.usageCount;
  
  designPatterns.set(patternId, pattern);
}

