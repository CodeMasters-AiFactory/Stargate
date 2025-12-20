/**
 * JSON Validation Utility
 * Provides safe JSON parsing with validation
 */

import { getErrorMessage, logError } from './errorHandler';

/**
 * Safely parse JSON with validation
 */
export function safeJsonParse<T>(
  jsonString: string,
  validator?: (obj: unknown) => obj is T,
  errorContext?: string
): T {
  try {
    const parsed = JSON.parse(jsonString);
    
    if (validator && !validator(parsed)) {
      throw new Error(`JSON validation failed${errorContext ? `: ${errorContext}` : ''}`);
    }
    
    return parsed as T;
  } catch (error) {
    const context = errorContext ? ` (${errorContext})` : '';
    logError(error, `JSONParse${context}`);
    throw new Error(`Invalid JSON${context}: ${getErrorMessage(error)}`);
  }
}

/**
 * Extract JSON from text (handles markdown code blocks, etc.)
 */
export function extractJsonFromText(text: string): string | null {
  // Try to find JSON in code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1];
  }
  
  // Try to find JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  
  return null;
}

/**
 * Validate ScreenshotAnalysis structure
 */
export function isScreenshotAnalysis(obj: unknown): obj is {
  layout: {
    sections: Array<{ type: string; description: string; position: { top: number; left: number; width: number; height: number } }>;
    colors: string[];
    fonts: string[];
    spacing: string;
  };
  content: {
    headlines: string[];
    paragraphs: string[];
    ctas: string[];
  };
  recommendations: string[];
} {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.layout === 'object' &&
    typeof o.content === 'object' &&
    Array.isArray(o.recommendations)
  );
}

/**
 * Validate VoiceIntent structure
 */
export function isVoiceIntent(obj: unknown): obj is {
  industry: string;
  location?: { city?: string; state?: string; country?: string };
  stylePreferences?: string[];
  targetAudience?: string;
  services?: string[];
  businessName?: string;
  phone?: string;
  email?: string;
  address?: string;
} {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return typeof o.industry === 'string';
}

