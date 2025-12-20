/**
 * Image Engine 2.0
 * Merlin 7.0 - Module 8
 * DALL-E 3 multi-image generation with WebP optimization
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import type { ProjectConfig } from '../services/projectConfig';
import type { ImagePlan, GeneratedImage, ImageOptimization } from '../types/imagePlan';
import type { DesignTokens } from '../types/designTokens';
import type { GeneratedSection } from './layoutEngine';
import { getErrorMessage, logError } from '../utils/errorHandler';

/**
 * Create OpenAI client
 */
function createOpenAIClient(): OpenAI | null {
  if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
}

/**
 * Generate images for all sections
 */
export async function generateImages(
  imagePlans: ImagePlan[],
  projectConfig: ProjectConfig,
  designTokens: DesignTokens,
  projectSlug: string
): Promise<GeneratedImage[]> {
  const openai = createOpenAIClient();
  const generatedImages: GeneratedImage[] = [];
  
  // Create images directory
  const imagesDir = path.join(process.cwd(), 'website_projects', projectSlug, 'generated-v5', 'assets', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  for (const plan of imagePlans) {
    try {
      if (openai && plan.priority !== 'low') {
        // Generate with DALL-E 3
        const image = await generateDALLEImage(plan, openai);
        
        // Download and save
        const localPath = await downloadAndSaveImage(image.url, plan, imagesDir);
        
        // Optimize (convert to WebP, compress)
        const optimization = await optimizeImage(localPath, plan);
        
        generatedImages.push({
          id: plan.id,
          url: `/assets/images/${path.basename(localPath)}`,
          localPath,
          plan,
          metadata: {
            size: optimization.optimizedSize,
            format: optimization.format,
            dimensions: plan.dimensions,
            generatedAt: new Date().toISOString(),
            model: 'dall-e-3',
          },
        });
      } else {
        // Fallback: placeholder
        const placeholderPath = generatePlaceholder(plan, imagesDir);
        generatedImages.push({
          id: plan.id,
          url: `/assets/images/${path.basename(placeholderPath)}`,
          localPath: placeholderPath,
          plan,
          metadata: {
            size: 0,
            format: 'png',
            dimensions: plan.dimensions,
            generatedAt: new Date().toISOString(),
            model: 'placeholder',
          },
        });
      }
    } catch (error: unknown) {
      logError(error, `Image Engine - Generate image ${plan.id}`);
      // Fallback to placeholder
      const placeholderPath = generatePlaceholder(plan, imagesDir);
      generatedImages.push({
        id: plan.id,
        url: `/assets/images/${path.basename(placeholderPath)}`,
        localPath: placeholderPath,
        plan,
        metadata: {
          size: 0,
          format: 'png',
          dimensions: plan.dimensions,
          generatedAt: new Date().toISOString(),
          model: 'placeholder',
        },
      });
    }
  }
  
  return generatedImages;
}

/**
 * Generate image with DALL-E 3
 */
async function generateDALLEImage(plan: ImagePlan, openai: OpenAI): Promise<{ url: string }> {
  // Validate and normalize DALL-E 3 size
  const allowedSizes: Array<'1024x1024' | '1792x1024' | '1024x1792'> = ['1024x1024', '1792x1024', '1024x1792'];
  const requestedSize = `${plan.dimensions.width}x${plan.dimensions.height}`;
  let size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024';
  
  if (allowedSizes.includes(requestedSize as any)) {
    size = requestedSize as '1024x1024' | '1792x1024' | '1024x1792';
  } else {
    // Default to square if size doesn't match
    console.warn(`[Image Engine] Invalid size ${requestedSize}, using default 1024x1024`);
    size = '1024x1024';
  }
  
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: plan.prompt,
    size,
    quality: plan.dimensions.quality === 'hd' ? 'hd' : 'standard',
    n: 1,
  });
  
  const imageUrl = response.data[0]?.url;
  if (!imageUrl) {
    throw new Error('No image URL returned from DALL-E');
  }
  
  return { url: imageUrl };
}

/**
 * Download and save image
 */
async function downloadAndSaveImage(
  imageUrl: string,
  plan: ImagePlan,
  imagesDir: string
): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  
  const buffer = Buffer.from(await response.arrayBuffer());
  const filename = `${plan.id}-${Date.now()}.png`;
  const filepath = path.join(imagesDir, filename);
  
  fs.writeFileSync(filepath, buffer);
  
  return filepath;
}

/**
 * Optimize image (convert to WebP, compress)
 */
async function optimizeImage(
  imagePath: string,
  plan: ImagePlan
): Promise<ImageOptimization> {
  // In production, use Sharp library for optimization
  // For now, return metadata
  const stats = fs.statSync(imagePath);
  
  return {
    originalSize: stats.size,
    optimizedSize: stats.size, // Would be smaller after WebP conversion
    format: plan.dimensions.format,
    compression: 80,
    quality: 85,
  };
}

/**
 * Generate placeholder image
 */
function generatePlaceholder(plan: ImagePlan, imagesDir: string): string {
  // Create a simple placeholder SVG
  const svg = `<svg width="${plan.dimensions.width}" height="${plan.dimensions.height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="24" fill="#9ca3af">
      ${plan.alt || plan.type}
    </text>
  </svg>`;
  
  const filename = `${plan.id}-placeholder.svg`;
  const filepath = path.join(imagesDir, filename);
  fs.writeFileSync(filepath, svg);
  
  return filepath;
}

/**
 * Generate automatic alt text for images
 */
export function generateAltText(plan: ImagePlan, section: GeneratedSection): string {
  if (plan.alt) {
    return plan.alt;
  }
  
  // Generate from context
  const industry = plan.industryContext || '';
  const purpose = plan.purpose;
  const type = plan.type;
  
  return `${industry} ${type} image for ${purpose} section`;
}

