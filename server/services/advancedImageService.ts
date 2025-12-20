/**
 * Advanced Image Service
 * Generates stunning, professional images using multiple AI services
 * Supports DALL-E 3, Midjourney-style prompts, and advanced image optimization
 */

import OpenAI from 'openai';
import { generateMultiProviderImage } from './multiProviderImageService';

export interface AdvancedImageOptions {
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
}

/**
 * Create OpenAI client for image generation
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
 * Build stunning, professional image prompts with advanced techniques
 */
function buildStunningImagePrompt(options: AdvancedImageOptions): string {
  const { style, businessContext, prompt, artisticStyle } = options;
  
  const styleEnhancements: Record<string, string> = {
    'photorealistic': 'Ultra-high quality professional photography, 8K resolution, studio lighting, perfect composition',
    'illustration': 'Modern digital illustration, clean lines, professional vector art, vibrant colors',
    '3d-render': '3D rendered, photorealistic, professional 3D graphics, perfect lighting and shadows',
    'watercolor': 'Elegant watercolor painting style, soft edges, artistic brush strokes, premium aesthetic',
    'minimalist': 'Minimalist design, clean composition, negative space, modern simplicity',
    'gradient': 'Beautiful gradient backgrounds, smooth color transitions, modern aesthetic',
  };

  const moodEnhancements: Record<string, string> = {
    'professional': 'Professional, corporate, trustworthy, sophisticated',
    'modern': 'Modern, contemporary, cutting-edge, innovative',
    'elegant': 'Elegant, refined, luxurious, premium quality',
    'bold': 'Bold, vibrant, energetic, attention-grabbing',
    'minimalist': 'Minimalist, clean, simple, focused',
    'luxury': 'Luxury, premium, high-end, exclusive',
  };

  const stylePrompts: Record<string, string> = {
    hero: `STUNNING hero image for ${businessContext.name}, a ${businessContext.industry} business.
      ${moodEnhancements[businessContext.mood || 'professional']} aesthetic.
      ${artisticStyle ? styleEnhancements[artisticStyle] : 'Ultra-high quality professional photography, 8K resolution, cinematic composition, perfect lighting, depth of field, bokeh effects'}
      Colors: ${businessContext.colorScheme.join(', ')}.
      ${businessContext.styleKeywords ? `Style: ${businessContext.styleKeywords.join(', ')}.` : ''}
      ${prompt || 'Professional business hero image with stunning visual impact, perfect composition, and exceptional quality.'}
      Award-winning photography quality, magazine-worthy, editorial style.`,
    
    product: `STUNNING product photography for ${businessContext.name}.
      ${artisticStyle ? styleEnhancements[artisticStyle] : 'Professional product photography, studio lighting, clean white or gradient background, perfect shadows, high-end commercial photography'}
      Colors: ${businessContext.colorScheme.join(', ')}.
      ${prompt || 'Premium product image with exceptional quality and visual appeal.'}
      E-commerce quality, professional commercial photography.`,
    
    feature: `STUNNING feature illustration for ${businessContext.name}.
      ${artisticStyle ? styleEnhancements[artisticStyle] : 'Modern illustration, clean design, professional graphics, vibrant colors'}
      Colors: ${businessContext.colorScheme.join(', ')}.
      ${prompt || 'Eye-catching feature illustration that communicates value and quality.'}
      Professional design, visually striking.`,
    
    gallery: `STUNNING gallery image for ${businessContext.name}.
      ${artisticStyle ? styleEnhancements[artisticStyle] : 'Professional photography, artistic composition, visual storytelling'}
      Colors: ${businessContext.colorScheme.join(', ')}.
      ${prompt || 'Beautiful, engaging image that tells a story.'}
      High-quality, visually appealing.`,
  };

  return stylePrompts[style] || prompt || 'Stunning professional image.';
}

/**
 * Generate stunning AI image with advanced techniques
 */
export async function generateStunningImage(
  options: AdvancedImageOptions
): Promise<{ url: string; alt: string; style: string; dimensions: { width: number; height: number } }> {
  const openai = createOpenAIClient();
  
  if (!openai) {
    console.log('[Advanced Image Service] Mock mode - returning enhanced placeholder');
    return generateEnhancedMockImage(options);
  }

  try {
    const prompt = buildStunningImagePrompt(options);
    const size = options.quality === 'ultra-hd' ? '1792x1024' : 
                 options.quality === 'hd' ? '1792x1024' : '1024x1024';
    const quality = options.quality === 'ultra-hd' || options.quality === 'hd' ? 'hd' : 'standard';

    console.log(`[Advanced Image Service] Generating ${options.quality} ${options.style} image for ${options.businessContext.name}`);
    console.log(`[Advanced Image Service] ✅ Using multi-provider service (OpenAI → Replicate → Leonardo fallback)`);

    // Use multi-provider service which includes Leonardo as fallback
    const result = await generateMultiProviderImage({
      prompt: prompt,
      style: options.style,
      quality: quality,
      businessContext: options.businessContext,
      preferredProvider: 'auto', // Will try OpenAI first, then Replicate, then Leonardo
    });

    const dimensions = parseDimensions(size);

    console.log(`[Advanced Image Service] ✅ Image generated using provider: ${result.provider}`);

    return {
      url: result.url,
      alt: `Stunning ${options.style} image for ${options.businessContext.name}`,
      style: options.style,
      dimensions,
    };
  } catch (error) {
    console.error('[Advanced Image Service] Error generating image:', error);
    console.warn('[Advanced Image Service] Falling back to mock image');
    return generateEnhancedMockImage(options);
  }
}

/**
 * Generate multiple stunning images for a website
 */
export async function generateStunningWebsiteImages(
  businessContext: AdvancedImageOptions['businessContext'],
  imageRequirements: Array<{
    style: AdvancedImageOptions['style'];
    prompt?: string;
    artisticStyle?: AdvancedImageOptions['artisticStyle'];
    quality?: AdvancedImageOptions['quality'];
    count?: number;
  }>
): Promise<Array<{ url: string; alt: string; style: string }>> {
  const images: Array<{ url: string; alt: string; style: string }> = [];

  for (const requirement of imageRequirements) {
    const count = requirement.count || 1;
    
    for (let i = 0; i < count; i++) {
      try {
        const image = await generateStunningImage({
          style: requirement.style,
          businessContext,
          prompt: requirement.prompt,
          quality: requirement.quality || 'hd',
          artisticStyle: requirement.artisticStyle,
        });
        images.push(image);
        
        // Rate limiting: wait 1 second between requests
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`[Advanced Image Service] Error generating ${requirement.style} image ${i + 1}:`, error);
      }
    }
  }

  return images;
}

/**
 * Generate enhanced mock image with better visuals
 */
function generateEnhancedMockImage(options: AdvancedImageOptions): { url: string; alt: string; style: string; dimensions: { width: number; height: number } } {
  const size = options.quality === 'ultra-hd' ? '1792x1024' : 
               options.quality === 'hd' ? '1792x1024' : '1024x1024';
  const dimensions = parseDimensions(size);
  
  const primaryColor = options.businessContext.colorScheme[0] || '#3B82F6';
  const secondaryColor = options.businessContext.colorScheme[1] || '#10B981';
  const tertiaryColor = options.businessContext.colorScheme[2] || '#8B5CF6';
  
  // Create a more sophisticated SVG with gradients and effects
  const svg = `
    <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${secondaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${tertiaryColor};stop-opacity:1" />
        </linearGradient>
        <radialGradient id="radialGrad" cx="50%" cy="50%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:0.1" />
        </radialGradient>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)" opacity="0.15"/>
      <circle cx="20%" cy="30%" r="100" fill="url(#radialGrad)" filter="url(#blur)"/>
      <circle cx="80%" cy="70%" r="150" fill="url(#radialGrad)" filter="url(#blur)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="32" font-weight="600" fill="${primaryColor}" 
            text-anchor="middle" dominant-baseline="middle" opacity="0.2">
        ${options.businessContext.name}
      </text>
    </svg>
  `.trim();

  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

  return {
    url: dataUrl,
    alt: `Stunning ${options.style} image for ${options.businessContext.name}`,
    style: options.style,
    dimensions,
  };
}

function parseDimensions(size: string): { width: number; height: number } {
  const [width, height] = size.split('x').map(Number);
  return { width, height };
}

