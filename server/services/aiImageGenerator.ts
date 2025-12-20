/**
 * AI Image Generation Service
 * Generates professional images using DALL-E 3 for websites
 * Integrates with OpenAI DALL-E API for style-consistent visual content
 */

import OpenAI from 'openai';

export interface ImageGenerationOptions {
  style: 'hero' | 'product' | 'icon' | 'illustration' | 'background' | 'testimonial';
  businessContext: {
    name: string;
    industry: string;
    colorScheme: string[];
    styleKeywords?: string[];
  };
  prompt?: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
}

export interface GeneratedImage {
  url: string;
  alt: string;
  style: string;
  dimensions: { width: number; height: number };
}

/**
 * Create OpenAI client for image generation
 */
function createOpenAIClient(): OpenAI | null {
  // Try Replit AI Integration keys first (preferred)
  if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  
  // Fallback to direct OpenAI key
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  
  // No keys available - will use mock mode
  return null;
}

/**
 * Generate enhanced prompt based on style and business context
 */
function buildImagePrompt(
  basePrompt: string | undefined,
  style: ImageGenerationOptions['style'],
  businessContext: ImageGenerationOptions['businessContext']
): string {
  const stylePrompts: Record<string, string> = {
    hero: `A stunning, professional hero image for ${businessContext.name}, a ${businessContext.industry} business. 
      Modern, clean, sophisticated design. High-quality, professional photography style. 
      Colors: ${businessContext.colorScheme.join(', ')}. 
      ${businessContext.styleKeywords ? `Style: ${businessContext.styleKeywords.join(', ')}.` : ''}
      ${basePrompt || 'Professional business hero image with elegant composition.'}`,
    
    product: `Professional product photography for ${businessContext.name}. 
      Clean white or gradient background. Modern, minimalist style. 
      Colors: ${businessContext.colorScheme.join(', ')}. 
      ${basePrompt || 'High-quality product image with professional lighting.'}`,
    
    icon: `Modern, minimalist icon design for ${businessContext.name}, a ${businessContext.industry} business. 
      Simple, clean, professional. Vector-style illustration. 
      Colors: ${businessContext.colorScheme.join(', ')}. 
      ${basePrompt || 'Professional icon design.'}`,
    
    illustration: `Professional illustration for ${businessContext.name}, a ${businessContext.industry} business. 
      Modern, clean, engaging. Suitable for website use. 
      Colors: ${businessContext.colorScheme.join(', ')}. 
      ${basePrompt || 'Professional business illustration.'}`,
    
    background: `Subtle, professional background pattern or texture for ${businessContext.name}. 
      Modern, clean, non-distracting. Suitable for website background. 
      Colors: ${businessContext.colorScheme.join(', ')}. 
      ${basePrompt || 'Elegant background design.'}`,
    
    testimonial: `Professional portrait-style image for customer testimonial. 
      Friendly, approachable, professional. Modern photography style. 
      Colors: ${businessContext.colorScheme.join(', ')}. 
      ${basePrompt || 'Professional testimonial portrait.'}`,
  };

  return stylePrompts[style] || basePrompt || 'Professional business image.';
}

/**
 * Generate alt text for accessibility
 */
function generateAltText(
  prompt: string,
  style: ImageGenerationOptions['style'],
  businessContext: ImageGenerationOptions['businessContext']
): string {
  const styleDescriptions: Record<string, string> = {
    hero: `Hero image for ${businessContext.name}`,
    product: `Product image for ${businessContext.name}`,
    icon: `${businessContext.name} icon`,
    illustration: `Illustration for ${businessContext.name}`,
    background: `Background image for ${businessContext.name}`,
    testimonial: `Customer testimonial image for ${businessContext.name}`,
  };

  return styleDescriptions[style] || `Image for ${businessContext.name}`;
}

/**
 * Get optimal image size based on style
 */
function getOptimalSize(style: ImageGenerationOptions['style']): '1024x1024' | '1792x1024' | '1024x1792' {
  const sizeMap: Record<string, '1024x1024' | '1792x1024' | '1024x1792'> = {
    hero: '1792x1024',      // Wide format for hero sections
    background: '1792x1024', // Wide format for backgrounds
    product: '1024x1024',   // Square for products
    icon: '1024x1024',      // Square for icons
    illustration: '1024x1024', // Square for illustrations
    testimonial: '1024x1024',  // Square for testimonials
  };

  return sizeMap[style] || '1024x1024';
}

/**
 * Generate AI image using DALL-E 3
 */
export async function generateAIImage(
  options: ImageGenerationOptions
): Promise<GeneratedImage> {
  const openai = createOpenAIClient();
  
  // Mock mode if no API key
  if (!openai) {
    console.log('[AI Image Generator] Mock mode - returning placeholder');
    return generateMockImage(options);
  }

  try {
    const prompt = buildImagePrompt(options.prompt, options.style, options.businessContext);
    const size = options.size || getOptimalSize(options.style);
    const quality = options.quality || (options.style === 'hero' ? 'hd' : 'standard');

    console.log(`[AI Image Generator] Generating ${options.style} image for ${options.businessContext.name}`);

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      size: size,
      quality: quality,
      style: 'natural',
      n: 1,
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }

    const dimensions = parseDimensions(size);

    return {
      url: imageUrl,
      alt: generateAltText(options.prompt || '', options.style, options.businessContext),
      style: options.style,
      dimensions,
    };
  } catch (error) {
    console.error('[AI Image Generator] Error generating image:', error);
    // Fallback to mock image on error
    return generateMockImage(options);
  }
}

/**
 * Generate multiple images for a website
 */
export async function generateWebsiteImages(
  businessContext: ImageGenerationOptions['businessContext'],
  imageRequirements: Array<{
    style: ImageGenerationOptions['style'];
    prompt?: string;
    count?: number;
  }>
): Promise<GeneratedImage[]> {
  const images: GeneratedImage[] = [];

  for (const requirement of imageRequirements) {
    const count = requirement.count || 1;
    
    for (let i = 0; i < count; i++) {
      try {
        const image = await generateAIImage({
          style: requirement.style,
          businessContext,
          prompt: requirement.prompt,
        });
        images.push(image);
        
        // Rate limiting: wait 1 second between requests
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`[AI Image Generator] Error generating ${requirement.style} image ${i + 1}:`, error);
        // Continue with other images even if one fails
      }
    }
  }

  return images;
}

/**
 * Generate mock image (placeholder) when API is not available
 */
function generateMockImage(options: ImageGenerationOptions): GeneratedImage {
  const size = options.size || getOptimalSize(options.style);
  const dimensions = parseDimensions(size);
  
  // Generate a placeholder SVG with business colors
  const primaryColor = options.businessContext.colorScheme[0] || '#3B82F6';
  const secondaryColor = options.businessContext.colorScheme[1] || '#10B981';
  
  const svg = `
    <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" opacity="0.1"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="${primaryColor}" 
            text-anchor="middle" dominant-baseline="middle" opacity="0.3">
        ${options.businessContext.name}
      </text>
    </svg>
  `.trim();

  // Convert SVG to data URL
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

  return {
    url: dataUrl,
    alt: generateAltText(options.prompt || '', options.style, options.businessContext),
    style: options.style,
    dimensions,
  };
}

/**
 * Parse dimensions from size string
 */
function parseDimensions(size: string): { width: number; height: number } {
  const [width, height] = size.split('x').map(Number);
  return { width, height };
}

/**
 * Generate hero image for homepage
 */
export async function generateHeroImage(
  businessContext: ImageGenerationOptions['businessContext'],
  customPrompt?: string
): Promise<GeneratedImage> {
  return generateAIImage({
    style: 'hero',
    businessContext,
    prompt: customPrompt || `Professional hero image showcasing ${businessContext.name}'s ${businessContext.industry} services`,
    size: '1792x1024',
    quality: 'hd',
  });
}

/**
 * Generate product/service images
 */
export async function generateProductImages(
  businessContext: ImageGenerationOptions['businessContext'],
  productNames: string[]
): Promise<GeneratedImage[]> {
  const images: GeneratedImage[] = [];

  for (const productName of productNames) {
    const image = await generateAIImage({
      style: 'product',
      businessContext,
      prompt: `Professional product image for ${productName} from ${businessContext.name}`,
      size: '1024x1024',
      quality: 'standard',
    });
    images.push(image);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return images;
}

/**
 * Generate icon set for website
 */
export async function generateIconSet(
  businessContext: ImageGenerationOptions['businessContext'],
  iconCount: number = 5
): Promise<GeneratedImage[]> {
  const icons: GeneratedImage[] = [];
  const iconTypes = ['service', 'feature', 'benefit', 'value', 'advantage'];

  for (let i = 0; i < iconCount; i++) {
    const iconType = iconTypes[i % iconTypes.length];
    const icon = await generateAIImage({
      style: 'icon',
      businessContext,
      prompt: `Modern ${iconType} icon for ${businessContext.name}`,
      size: '1024x1024',
      quality: 'standard',
    });
    icons.push(icon);
    
    // Rate limiting
    if (i < iconCount - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return icons;
}

