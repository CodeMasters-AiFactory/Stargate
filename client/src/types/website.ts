/**
 * Website Types for Merlin Website Builder
 * Used by CraftVisualEditor and other frontend components
 */

export interface WebsiteFile {
  content: string;
  type?: 'html' | 'css' | 'javascript' | 'image' | 'other';
  encoding?: 'utf-8' | 'base64';
}

export interface GeneratedWebsitePackage {
  projectSlug: string;
  files: Record<string, WebsiteFile>;
  metadata?: {
    generatedAt?: string;
    generator?: string;
    version?: string;
    industry?: string;
    businessName?: string;
  };
  layout?: {
    sections: Array<{
      id: string;
      type: string;
      content?: Record<string, unknown>;
    }>;
  };
  styleSystem?: {
    colors?: {
      primary: string;
      secondary?: string;
      accent?: string;
      background?: string;
      text?: string;
    };
    typography?: {
      heading?: string;
      body?: string;
    };
  };
  qualityScore?: {
    visualDesign: number;
    uxStructure: number;
    contentQuality: number;
    conversionTrust: number;
    seoFoundations: number;
    creativity: number;
    meetsThresholds: boolean;
  };
}

export interface WebsiteGenerationConfig {
  packageType: 'starter' | 'professional' | 'enterprise';
  businessInfo: {
    name: string;
    industry: string;
    description?: string;
    location?: string;
    services?: string[];
  };
  preferences?: {
    colorScheme?: 'light' | 'dark' | 'auto';
    style?: 'modern' | 'classic' | 'minimal' | 'bold';
  };
}

