/**
 * Types for Multi-Page Website Generation
 * The best Merlin website wizard on planet Earth 🌍
 */

export interface WebsiteManifest {
  siteName: string;
  description: string;
  pages: PageSpec[];
  navigation: NavigationConfig;
  sharedComponents: SharedComponents;
  seoStrategy: SEOStrategy;
  designSystem: DesignSystem;
  version: string;
}

export interface PageSpec {
  slug: string; // 'home', 'about', 'services', 'contact'
  title: string;
  description: string;
  sections: SectionSpec[];
  seo: PageSEO;
  order: number;
}

export interface SectionSpec {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'contact' | 'cta' | 'gallery' | 'team' | 'stats' | 'faq' | 'services' | 'about' | 'content';
  title: string;
  content: string;
  order: number;
}

export interface NavigationConfig {
  type: 'header' | 'sidebar' | 'both';
  sticky: boolean;
  pages: Array<{
    slug: string;
    label: string;
    order: number;
  }>;
}

export interface SharedComponents {
  header: string;
  footer: string;
  navigation: string;
}

export interface SEOStrategy {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  contentGaps: string[];
}

export interface PageSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export interface DesignSystem {
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    sizes: {
      h1: string;
      h2: string;
      h3?: string;
      body: string;
    };
  };
  spacing: {
    section: string;
    element: string;
  };
  borderRadius: string;
}

export interface WebsiteFile {
  path: string;
  type: 'html' | 'css' | 'js' | 'json';
  content: string;
  checksum: string;
}

export interface MultiPageWebsite {
  manifest: WebsiteManifest;
  files: Record<string, WebsiteFile>;
  assets: {
    css: string;
    js: string;
  };
}

export interface GenerationProgress {
  phase: 'planning' | 'pages' | 'assets' | 'assembly';
  currentStep: string;
  progress: number;
  message: string;
  encoded?: boolean; // Flag: data fields are Base64-encoded to prevent SSE JSON chunking
  data?: {
    slug?: string;
    html?: string; // May be Base64-encoded if encoded=true
    css?: string;  // May be Base64-encoded if encoded=true
    js?: string;   // May be Base64-encoded if encoded=true
  };
}
