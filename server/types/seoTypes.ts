/**
 * SEO Types
 * Merlin 7.0 - SEO Engine 2.0
 */

export interface SEOStrategy {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  longTailKeywords: string[];
  competitorKeywords: string[];
  localKeywords: string[];
  contentGaps: ContentGap[];
  keywordMapping: KeywordMapping;
}

export interface ContentGap {
  keyword: string;
  opportunity: 'high' | 'medium' | 'low';
  currentRanking?: number;
  targetPage: string;
  suggestedContent: string;
}

export interface KeywordMapping {
  [keyword: string]: {
    pages: string[];
    density: number;
    priority: 'high' | 'medium' | 'low';
  };
}

export interface PageSEOData {
  title: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  headings: SEOHeading[];
  canonical: string;
  og: OpenGraphData;
  twitter: TwitterCardData;
  schema: SchemaMarkup;
  localSEO?: LocalSEOData;
}

export interface SEOHeading {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  id?: string;
}

export interface OpenGraphData {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  siteName?: string;
  locale?: string;
}

export interface TwitterCardData {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  title: string;
  description: string;
  image: string;
  site?: string;
  creator?: string;
}

export interface SchemaMarkup {
  '@context': string;
  '@type': string | string[];
  [key: string]: any;
}

export interface LocalSEOData {
  businessName: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email?: string;
  hours?: BusinessHours;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface BusinessHours {
  [day: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
}

export interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number; // 0.0 to 1.0
}

export interface RobotsTxt {
  userAgents: UserAgentRule[];
  sitemap: string;
  crawlDelay?: number;
}

export interface UserAgentRule {
  agent: string;
  allow: string[];
  disallow: string[];
}

