/**
 * Multi-Provider Image Service - 120% Quality
 * Supports multiple AI image providers for best results:
 * - OpenAI DALL-E 3: Creative, unique images
 * - Replicate (SDXL, Flux, Midjourney-style): Fast, high-quality variety
 * 
 * Automatically selects best provider based on requirements
 */

import OpenAI from 'openai';
import Replicate from 'replicate';
import { generateWithLeonardo, getRemainingToday, logUsageStatus, type LeonardoImageOptions } from './leonardoImageService';

export interface MultiProviderImageOptions {
  style: 'hero' | 'product' | 'icon' | 'illustration' | 'background' | 'testimonial' | 'feature' | 'gallery';
  businessContext: {
    name: string;
    industry: string;
    colorScheme: string[];
    styleKeywords?: string[];
    mood?: 'professional' | 'modern' | 'elegant' | 'bold' | 'minimalist' | 'luxury';
  };
  prompt?: string;
  quality: 'standard' | 'hd' | 'ultra-hd';
  artisticStyle?: 'photorealistic' | 'illustration' | '3d-render' | 'watercolor' | 'minimalist' | 'gradient';
  preferredProvider?: 'openai' | 'replicate' | 'leonardo' | 'auto';
}

export interface GeneratedImageResult {
  url: string;
  provider: 'openai' | 'replicate' | 'leonardo';
  model: string;
  prompt: string;
  cost?: number;
  dailyUsage?: number; // For Leonardo tracking
  remainingToday?: number; // For Leonardo tracking
}

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
 * Create Replicate client
 */
function createReplicateClient(): Replicate | null {
  if (process.env.REPLICATE_API_TOKEN) {
    return new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }
  
  return null;
}

/**
 * Industry-specific prompt templates for best results
 */
const INDUSTRY_PROMPTS: Record<string, Record<string, string>> = {
  hero: {
    restaurant: 'Elegant restaurant interior with ambient lighting, fine dining atmosphere, beautifully plated dishes, warm inviting ambiance',
    technology: 'Modern tech workspace with clean lines, futuristic elements, abstract digital patterns, innovation and progress',
    healthcare: 'Bright, clean medical facility, caring professionals, advanced equipment, trust and wellness',
    finance: 'Professional business environment, modern skyscrapers, success and growth imagery, trustworthy atmosphere',
    education: 'Inspiring learning environment, diverse students engaged, knowledge and discovery, bright future',
    ecommerce: 'Lifestyle product photography, aspirational setting, premium quality showcase, desirable and accessible',
    fitness: 'Dynamic athletic imagery, energy and movement, healthy lifestyle, motivation and achievement',
    beauty: 'Luxurious beauty setting, elegant products, soft lighting, premium self-care atmosphere',
    realestate: 'Stunning property exterior, dream home imagery, aspirational living, welcoming and impressive',
    travel: 'Breathtaking destination landscape, adventure and relaxation, wanderlust inspiration, unforgettable experiences',
    legal: 'Distinguished law firm atmosphere, professional excellence, trust and authority, client confidence',
    nonprofit: 'Impactful community imagery, positive change, human connection, hope and progress',
  },
  product: {
    default: 'Studio product photography, perfect lighting, clean white background, professional commercial shot',
    lifestyle: 'Lifestyle product shot in natural setting, contextual use, aspirational environment',
    minimal: 'Minimalist product photography, single item focus, elegant simplicity, premium feel',
  },
  background: {
    gradient: 'Smooth gradient background, modern color transition, subtle depth, professional backdrop',
    abstract: 'Abstract geometric patterns, modern design elements, subtle texture, sophisticated aesthetic',
    nature: 'Soft natural background, blurred outdoor scene, organic elements, calming atmosphere',
    texture: 'Subtle textured background, premium material appearance, depth and interest, sophisticated',
  },
};

/**
 * Build optimized prompt for image generation - ENHANCED
 */
function buildImagePrompt(options: MultiProviderImageOptions): string {
  const { style, businessContext, prompt, artisticStyle } = options;
  
  const styleEnhancements: Record<string, string> = {
    'photorealistic': 'Ultra-high quality professional photography, 8K resolution, studio lighting, perfect composition, shot on Hasselblad medium format camera, award-winning photo',
    'illustration': 'Modern digital illustration, clean vector lines, professional graphic design, vibrant harmonious colors, trending on Behance and Dribbble',
    '3d-render': '3D rendered scene, Octane render, photorealistic materials, perfect global illumination, cinema quality, trending on ArtStation',
    'watercolor': 'Elegant watercolor painting, soft edges, artistic brush strokes, premium fine art aesthetic, museum quality',
    'minimalist': 'Minimalist design, clean composition, intentional negative space, modern Japanese-inspired simplicity, less is more',
    'gradient': 'Beautiful mesh gradient background, smooth color transitions, modern glassmorphism aesthetic, Apple-style design',
  };

  const moodEnhancements: Record<string, string> = {
    'professional': 'Corporate professional, trustworthy, sophisticated, polished business aesthetic',
    'modern': 'Contemporary cutting-edge design, innovative, forward-thinking, Silicon Valley aesthetic',
    'elegant': 'Refined elegance, luxurious, premium quality, timeless sophistication',
    'bold': 'Bold and vibrant, energetic, attention-grabbing, confident statement',
    'minimalist': 'Clean minimalism, focused, intentional, Scandinavian-inspired simplicity',
    'luxury': 'Ultra-luxury, exclusive, high-end prestige, aspirational wealth aesthetic',
  };

  // Get industry-specific prompt enhancement
  const industryKey = businessContext.industry.toLowerCase();
  const industryPrompt = INDUSTRY_PROMPTS[style]?.[industryKey] || INDUSTRY_PROMPTS[style]?.default || '';

  // Build comprehensive prompt
  const parts: string[] = [];

  // Custom prompt or auto-generated base
  if (prompt) {
    parts.push(prompt);
  } else {
    parts.push(`Professional ${style} image for ${businessContext.name}, a ${businessContext.industry} business`);
  }

  // Add industry-specific context
  if (industryPrompt) {
    parts.push(industryPrompt);
  }

  // Add mood enhancement
  if (businessContext.mood && moodEnhancements[businessContext.mood]) {
    parts.push(moodEnhancements[businessContext.mood]);
  }

  // Add artistic style enhancement
  if (artisticStyle && styleEnhancements[artisticStyle]) {
    parts.push(styleEnhancements[artisticStyle]);
  }

  // Add color palette
  if (businessContext.colorScheme.length > 0) {
    parts.push(`Color palette: ${businessContext.colorScheme.join(', ')}`);
  }

  // Add style keywords
  if (businessContext.styleKeywords && businessContext.styleKeywords.length > 0) {
    parts.push(`Style keywords: ${businessContext.styleKeywords.join(', ')}`);
  }

  // Add quality markers
  parts.push('Highest quality, professional execution, award-winning, perfect composition, stunning visual impact');

  // Add negative prompt elements (what to avoid)
  const negativeElements = 'No text, no watermarks, no logos, no distortions, no artifacts, no blurry elements';
  
  return `${parts.join('. ')}. ${negativeElements}.`;
}

/**
 * Generate multiple image variations for A/B testing
 */
export async function generateImageVariations(
  options: MultiProviderImageOptions,
  count: number = 3
): Promise<GeneratedImageResult[]> {
  const variations: GeneratedImageResult[] = [];
  const styles: MultiProviderImageOptions['artisticStyle'][] = ['photorealistic', 'illustration', '3d-render'];
  
  for (let i = 0; i < Math.min(count, styles.length); i++) {
    try {
      const result = await generateMultiProviderImage({
        ...options,
        artisticStyle: styles[i] || 'photorealistic',
      });
      variations.push(result);
    } catch (error) {
      console.error(`Failed to generate variation ${i + 1}:`, error);
    }
  }
  
  return variations;
}

/**
 * Generate image using OpenAI DALL-E 3
 */
async function generateWithOpenAI(
  prompt: string,
  quality: 'standard' | 'hd' | 'ultra-hd'
): Promise<GeneratedImageResult> {
  const openai = createOpenAIClient();
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: quality === 'ultra-hd' ? '1024x1024' : '1024x1024',
    quality: quality === 'hd' || quality === 'ultra-hd' ? 'hd' : 'standard',
  });

  const imageUrl = response.data[0]?.url;
  if (!imageUrl) {
    throw new Error('Failed to generate image with OpenAI');
  }

  return {
    url: imageUrl,
    provider: 'openai',
    model: 'dall-e-3',
    prompt: prompt,
    cost: 0.04, // DALL-E 3 standard pricing
  };
}

/**
 * Generate image using Replicate (SDXL, Flux, or other models)
 */
async function generateWithReplicate(
  prompt: string,
  quality: 'standard' | 'hd' | 'ultra-hd'
): Promise<GeneratedImageResult> {
  const replicate = createReplicateClient();
  if (!replicate) {
    throw new Error('Replicate API token not configured');
  }

  // Select best model based on quality requirement
  // SDXL for standard, Flux for HD/ultra-hd
  const model = quality === 'ultra-hd' || quality === 'hd'
    ? 'black-forest-labs/flux-pro' // Best quality
    : 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'; // Fast and good quality

  const output = await replicate.run(model as any, {
    input: {
      prompt: prompt,
      num_outputs: 1,
      ...(quality === 'ultra-hd' && { num_inference_steps: 50 }), // Higher quality
    },
  });

  const imageUrl = Array.isArray(output) ? output[0] : output;
  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('Failed to generate image with Replicate');
  }

  return {
    url: imageUrl,
    provider: 'replicate',
    model: model.split('/')[1] || model,
    prompt: prompt,
  };
}

/**
 * Generate image using Leonardo AI (backup/free tier)
 */
async function generateWithLeonardoBackup(
  prompt: string,
  quality: 'standard' | 'hd' | 'ultra-hd'
): Promise<GeneratedImageResult> {
  // Check remaining quota before attempting
  logUsageStatus();
  
  const width = quality === 'ultra-hd' ? 1024 : 1024;
  const height = quality === 'ultra-hd' ? 1024 : 1024;
  
  const leonardoOptions: LeonardoImageOptions = {
    prompt: prompt,
    width: width,
    height: height,
    numImages: 1,
  };
  
  const result = await generateWithLeonardo(leonardoOptions);
  
  return {
    url: result.url,
    provider: 'leonardo',
    model: result.model,
    prompt: result.prompt,
    cost: result.cost,
    dailyUsage: result.dailyUsage,
    remainingToday: result.remainingToday,
  };
}

/**
 * Generate image using best available provider
 * 
 * Strategy:
 * - For creative/unique images: Prefer DALL-E 3
 * - For fast generation/variety: Prefer Replicate
 * - Fallback to Leonardo AI (free tier backup)
 * - Auto-select based on availability and requirements
 */
export async function generateMultiProviderImage(
  options: MultiProviderImageOptions
): Promise<GeneratedImageResult> {
  const prompt = buildImagePrompt(options);
  const { preferredProvider = 'auto' } = options;

  // Auto-select provider based on availability and requirements
  if (preferredProvider === 'auto') {
    const openai = createOpenAIClient();
    const replicate = createReplicateClient();

    // Prefer DALL-E 3 for creative/unique images (hero, product)
    if ((options.style === 'hero' || options.style === 'product') && openai) {
      try {
        return await generateWithOpenAI(prompt, options.quality);
      } catch (error) {
        console.warn('OpenAI generation failed, falling back to Replicate:', error);
        if (replicate) {
          try {
            return await generateWithReplicate(prompt, options.quality);
          } catch (error2) {
            console.warn('Replicate failed, falling back to Leonardo:', error2);
            return await generateWithLeonardoBackup(prompt, options.quality);
          }
        }
        // Try Leonardo as last resort
        return await generateWithLeonardoBackup(prompt, options.quality);
      }
    }

    // Prefer Replicate for fast generation (icons, illustrations, backgrounds)
    if ((options.style === 'icon' || options.style === 'illustration' || options.style === 'background') && replicate) {
      try {
        return await generateWithReplicate(prompt, options.quality);
      } catch (error) {
        console.warn('Replicate generation failed, falling back to OpenAI:', error);
        if (openai) {
          try {
            return await generateWithOpenAI(prompt, options.quality);
          } catch (error2) {
            console.warn('OpenAI failed, falling back to Leonardo:', error2);
            return await generateWithLeonardoBackup(prompt, options.quality);
          }
        }
        return await generateWithLeonardoBackup(prompt, options.quality);
      }
    }

    // Default: Try OpenAI first, then Replicate, then Leonardo
    if (openai) {
      try {
        return await generateWithOpenAI(prompt, options.quality);
      } catch (error) {
        console.warn('OpenAI failed, trying Replicate:', error);
        if (replicate) {
          try {
            return await generateWithReplicate(prompt, options.quality);
          } catch (error2) {
            console.warn('Replicate failed, falling back to Leonardo:', error2);
            return await generateWithLeonardoBackup(prompt, options.quality);
          }
        }
        return await generateWithLeonardoBackup(prompt, options.quality);
      }
    }

    if (replicate) {
      try {
        return await generateWithReplicate(prompt, options.quality);
      } catch (error) {
        console.warn('Replicate failed, falling back to Leonardo:', error);
        return await generateWithLeonardoBackup(prompt, options.quality);
      }
    }

    // Last resort: Leonardo (free tier)
    try {
      return await generateWithLeonardoBackup(prompt, options.quality);
    } catch (error) {
      throw new Error(
        'No image generation providers available. ' +
        'Configure OPENAI_API_KEY, REPLICATE_API_TOKEN, or LEONARDO_AI_API_KEY'
      );
    }
  }

  // Use preferred provider
  if (preferredProvider === 'openai') {
    return await generateWithOpenAI(prompt, options.quality);
  }

  if (preferredProvider === 'replicate') {
    return await generateWithReplicate(prompt, options.quality);
  }

  if (preferredProvider === 'leonardo') {
    return await generateWithLeonardoBackup(prompt, options.quality);
  }

  throw new Error(`Invalid provider: ${preferredProvider}`);
}

/**
 * Check which providers are available
 */
export function getAvailableImageProviders(): {
  openai: boolean;
  replicate: boolean;
  leonardo: boolean;
  leonardoRemaining: number;
} {
  const leonardoAvailable = !!process.env.LEONARDO_AI_API_KEY;
  
  if (leonardoAvailable) {
    console.log(`[Image Service] ✅ Leonardo AI API configured and available`);
  } else {
    console.warn(`[Image Service] ⚠️ Leonardo AI API not configured - LEONARDO_AI_API_KEY missing`);
  }
  return {
    openai: !!createOpenAIClient(),
    replicate: !!createReplicateClient(),
    leonardo: leonardoAvailable,
    leonardoRemaining: leonardoAvailable ? getRemainingToday() : 0,
  };
}

