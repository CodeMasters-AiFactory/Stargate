/**
 * Image Plan Types
 * Merlin 7.0 - Image Engine 2.0
 */

export interface ImagePlan {
  id: string;
  page: string;
  section: string;
  type: ImageType;
  purpose: ImagePurpose;
  prompt: string;
  style: ImageStyle;
  dimensions: ImageDimensions;
  alt: string;
  priority: 'high' | 'medium' | 'low';
  colorHarmony: string[]; // Colors to match with theme
  industryContext: string;
}

export type ImageType =
  | 'hero'
  | 'product'
  | 'service'
  | 'testimonial'
  | 'feature'
  | 'gallery'
  | 'icon'
  | 'illustration'
  | 'background'
  | 'logo';

export type ImagePurpose =
  | 'attention'
  | 'explanation'
  | 'social-proof'
  | 'decoration'
  | 'branding';

export interface ImageStyle {
  artistic: 'photorealistic' | 'illustration' | '3d-render' | 'watercolor' | 'minimalist' | 'gradient';
  mood: 'professional' | 'modern' | 'elegant' | 'bold' | 'minimalist' | 'luxury';
  colorScheme: string[];
  composition: 'centered' | 'rule-of-thirds' | 'symmetrical' | 'asymmetrical';
}

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: string;
  format: 'webp' | 'jpg' | 'png';
  quality: 'standard' | 'hd' | 'ultra-hd';
}

export interface GeneratedImage {
  id: string;
  url: string;
  localPath: string;
  plan: ImagePlan;
  metadata: {
    size: number;
    format: string;
    dimensions: ImageDimensions;
    generatedAt: string;
    model: string;
  };
}

export interface ImageOptimization {
  originalSize: number;
  optimizedSize: number;
  format: string;
  compression: number; // 0-100
  quality: number; // 0-100
}

