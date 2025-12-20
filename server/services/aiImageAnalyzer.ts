/**
 * AI Image Analyzer Service
 * 
 * Extract intelligence from website images:
 * - Describe what's in images
 * - Extract text from images (OCR)
 * - Identify products/brands in photos
 * - Generate alt text automatically
 */

import OpenAI from 'openai';
import { getErrorMessage, logError } from '../utils/errorHandler';
import fetch from 'node-fetch';

const openaiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openai = openaiKey
  ? new OpenAI({
      apiKey: openaiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    })
  : null;

export interface ImageAnalysis {
  url: string;
  description: string;
  extractedText: string[];
  detectedObjects: Array<{
    object: string;
    confidence: number;
  }>;
  brands: string[];
  altTextSuggestion: string;
  tags: string[];
}

/**
 * Analyze an image
 */
export async function analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
  try {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`[AI Image Analyzer] Analyzing ${imageUrl}`);

    // Download image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Analyze with GPT-4 Vision
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing images. Describe what you see, extract text (OCR), identify objects and brands, and suggest alt text.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image and provide:
1. A detailed description
2. Any text visible in the image (OCR)
3. Objects/products detected
4. Brands/logos identified
5. Suggested alt text for accessibility
6. Relevant tags

Return JSON:
{
  "description": "detailed description",
  "extractedText": ["text1", "text2"],
  "detectedObjects": [{"object": "name", "confidence": 0.9}],
  "brands": ["brand1", "brand2"],
  "altTextSuggestion": "alt text",
  "tags": ["tag1", "tag2"]
}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const analysis: ImageAnalysis = JSON.parse(response.choices[0].message.content || '{}');
    analysis.url = imageUrl;

    return analysis;
  } catch (error) {
    logError(error, 'AI Image Analyzer');
    throw new Error(`Image analysis failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Batch analyze multiple images
 */
export async function analyzeImages(imageUrls: string[]): Promise<ImageAnalysis[]> {
  const analyses: ImageAnalysis[] = [];

  // Process in parallel (limit to 5 at a time to avoid rate limits)
  const batchSize = 5;
  for (let i = 0; i < imageUrls.length; i += batchSize) {
    const batch = imageUrls.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(url => analyzeImage(url))
    );

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        analyses.push(result.value);
      } else {
        console.warn(`Failed to analyze image ${batch[index]}: ${result.reason}`);
      }
    });

    // Rate limiting delay
    if (i + batchSize < imageUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return analyses;
}

