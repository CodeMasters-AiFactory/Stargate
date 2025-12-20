/**
 * AI Content Transformer Service
 * 
 * Transform scraped content automatically:
 * - Rewrite in different tones (professional, casual, technical)
 * - Translate to any language
 * - Summarize long content
 * - Generate variations
 */

import OpenAI from 'openai';
import { getErrorMessage, logError } from '../utils/errorHandler';

const openaiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openai = openaiKey
  ? new OpenAI({
      apiKey: openaiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    })
  : null;

export interface TransformOptions {
  tone?: 'professional' | 'casual' | 'technical' | 'friendly' | 'formal';
  language?: string; // ISO language code
  summarize?: boolean;
  maxLength?: number;
  variations?: number;
}

export interface TransformResult {
  original: string;
  transformed: string;
  tone?: string;
  language?: string;
  wordCount: {
    original: number;
    transformed: number;
  };
}

/**
 * Transform content
 */
export async function transformContent(
  content: string,
  options: TransformOptions = {}
): Promise<TransformResult> {
  try {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    const wordCount = content.split(/\s+/).length;

    let prompt = 'Transform the following content';

    if (options.tone) {
      prompt += ` in a ${options.tone} tone`;
    }

    if (options.language) {
      prompt += ` and translate to ${options.language}`;
    }

    if (options.summarize) {
      prompt += '. Summarize it';
      if (options.maxLength) {
        prompt += ` to approximately ${options.maxLength} words`;
      }
    } else {
      prompt += '. Rewrite it';
    }

    prompt += ':\n\n' + content;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content writer and translator. Transform content according to user instructions while preserving meaning.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: options.maxLength ? options.maxLength * 2 : 2000,
      temperature: options.tone === 'casual' ? 0.7 : 0.3,
    });

    const transformed = response.choices[0].message.content || '';
    const transformedWordCount = transformed.split(/\s+/).length;

    return {
      original: content,
      transformed,
      tone: options.tone,
      language: options.language,
      wordCount: {
        original: wordCount,
        transformed: transformedWordCount,
      },
    };
  } catch (error) {
    logError(error, 'Content Transformer');
    throw new Error(`Content transformation failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Generate content variations
 */
export async function generateVariations(
  content: string,
  count: number = 3
): Promise<string[]> {
  try {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Generate ${count} different variations of the following content. Each variation should convey the same meaning but use different wording and structure:\n\n${content}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content writer. Generate creative variations of content while maintaining the core message.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: count * 500,
      temperature: 0.8,
    });

    const variations = response.choices[0].message.content || '';
    
    // Split variations (assuming they're numbered or separated)
    const lines = variations.split('\n').filter(line => line.trim().length > 0);
    
    // If variations are numbered, extract them
    if (lines[0]?.match(/^\d+[\.\)]/)) {
      return lines.map(line => line.replace(/^\d+[\.\)]\s*/, ''));
    }

    // Otherwise, split by paragraphs
    return variations.split('\n\n').filter(v => v.trim().length > 0).slice(0, count);
  } catch (error) {
    logError(error, 'Content Transformer - Variations');
    throw new Error(`Variation generation failed: ${getErrorMessage(error)}`);
  }
}

