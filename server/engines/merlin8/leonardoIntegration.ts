/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MERLIN 8.0 - LEONARDO AI INTEGRATION 🎨
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Generates REAL images for websites using Leonardo AI.
 * No more placeholders!
 */

import { IndustryDNA } from './industryDNA';

export interface GeneratedImage {
  section: string;
  url: string;
  prompt: string;
  width: number;
  height: number;
}

export interface ImageGenerationResult {
  success: boolean;
  images: GeneratedImage[];
  usage: {
    generated: number;
    remaining: number;
  };
  errors: string[];
}

const LEONARDO_BASE_URL = 'https://cloud.leonardo.ai/api/rest/v1';

/**
 * Generate all images needed for a website
 */
export async function generateWebsiteImages(
  businessName: string,
  industry: IndustryDNA,
  onProgress?: (message: string, progress: number) => void
): Promise<ImageGenerationResult> {
  const apiKey = process.env.LEONARDO_AI_API_KEY;
  
  if (!apiKey) {
    console.error('[Merlin8] Leonardo API key not configured');
    return {
      success: false,
      images: [],
      usage: { generated: 0, remaining: 0 },
      errors: ['Leonardo API key not configured'],
    };
  }

  const images: GeneratedImage[] = [];
  const errors: string[] = [];
  
  // Define what images we need
  const imageRequests = [
    { section: 'hero', prompt: industry.images.hero, width: 1200, height: 800 },
    { section: 'services', prompt: industry.images.services, width: 800, height: 600 },
    { section: 'about', prompt: industry.images.about, width: 800, height: 600 },
    { section: 'team', prompt: industry.images.team, width: 800, height: 800 },
  ];

  // Add background if defined (max width 1536 for Leonardo)
  if (industry.images.background) {
    imageRequests.push({ 
      section: 'background', 
      prompt: industry.images.background, 
      width: 1536, 
      height: 864 
    });
  }

  let generated = 0;
  const total = imageRequests.length;

  for (const request of imageRequests) {
    try {
      onProgress?.(`Generating ${request.section} image...`, (generated / total) * 100);
      
      // Enhance prompt with business name and style guidance
      const enhancedPrompt = `${request.prompt}, for ${businessName}, ${industry.images.style}, high quality, professional`;
      
      const result = await generateSingleImage(
        apiKey,
        enhancedPrompt,
        request.width,
        request.height
      );

      if (result.success && result.url) {
        images.push({
          section: request.section,
          url: result.url,
          prompt: enhancedPrompt,
          width: request.width,
          height: request.height,
        });
        generated++;
      } else {
        errors.push(`Failed to generate ${request.section}: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Error generating ${request.section}: ${errorMessage}`);
    }
  }

  onProgress?.('Image generation complete!', 100);

  return {
    success: errors.length === 0,
    images,
    usage: {
      generated,
      remaining: 150 - generated, // Approximate
    },
    errors,
  };
}

/**
 * Generate a single image with Leonardo AI
 */
async function generateSingleImage(
  apiKey: string,
  prompt: string,
  width: number,
  height: number
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Step 1: Create generation request
    const generateResponse = await fetch(`${LEONARDO_BASE_URL}/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        modelId: '6b645e3a-d64f-4341-a6d8-7a3690fbf042', // Leonardo Phoenix
        width,
        height,
        num_images: 1,
        num_inference_steps: 30,
        guidance_scale: 7,
        presetStyle: 'PHOTOGRAPHY',
      }),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      return { success: false, error: `API error: ${generateResponse.status} - ${errorText}` };
    }

    const generateData = await generateResponse.json();
    const generationId = generateData.sdGenerationJob?.generationId;

    if (!generationId) {
      return { success: false, error: 'No generation ID returned' };
    }

    // Step 2: Poll for completion (max 60 seconds)
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      await sleep(1000);

      const statusResponse = await fetch(
        `${LEONARDO_BASE_URL}/generations/${generationId}`,
        {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        }
      );

      if (!statusResponse.ok) {
        return { success: false, error: `Status check failed: ${statusResponse.status}` };
      }

      const statusData = await statusResponse.json();
      const generations = statusData.generations_by_pk?.generated_images;

      if (generations && generations.length > 0 && generations[0].url) {
        return { success: true, url: generations[0].url };
      }

      attempts++;
    }

    return { success: false, error: 'Generation timed out' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Download image and save locally (for deployment)
 */
export async function downloadImage(url: string, savePath: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) return false;
    
    const fs = await import('fs');
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(savePath, buffer);
    return true;
  } catch {
    return false;
  }
}

export default {
  generateWebsiteImages,
  downloadImage,
};
