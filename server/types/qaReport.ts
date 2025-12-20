/**
 * Quality Assurance Report Types
 * Merlin 7.0 - QA Engine 3.0
 */

export interface QAReport {
  overallScore: number; // 0-10
  verdict: QAVerdict;
  categories: QACategory[];
  issues: QAIssue[];
  recommendations: QARecommendation[];
  performance: PerformanceMetrics;
  accessibility: AccessibilityMetrics;
  seo: SEOMetrics;
  visual: VisualMetrics;
  navigation: NavigationMetrics;
  generatedAt: string;
  iteration: number;
  meetsThresholds: boolean;
}

export type QAVerdict = 'Poor' | 'OK' | 'Good' | 'Excellent' | 'World-Class';

export interface QACategory {
  name: string;
  score: number; // 0-10
  weight: number; // 0-1
  issues: QAIssue[];
  passed: boolean;
}

export interface QAIssue {
  id: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: IssueType;
  description: string;
  location: string; // Page/section
  suggestion: string;
  autoFixable: boolean;
  fixed?: boolean;
}

export type IssueType =
  | 'layout'
  | 'responsive'
  | 'accessibility'
  | 'seo'
  | 'performance'
  | 'content'
  | 'visual'
  | 'link'
  | 'navigation'
  | 'image'
  | 'code';

export interface QARecommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  action: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

export interface PerformanceMetrics {
  score: number; // 0-100
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint (ms)
    fid: number; // First Input Delay (ms)
    cls: number; // Cumulative Layout Shift
  };
  loadTime: number; // ms
  pageSize: number; // bytes
  requests: number;
  images: {
    total: number;
    optimized: number;
    unoptimized: number;
  };
}

export interface AccessibilityMetrics {
  score: number; // 0-100
  wcag: {
    level: 'A' | 'AA' | 'AAA' | 'none';
    passed: number;
    failed: number;
    total: number;
  };
  issues: {
    contrast: number;
    altText: number;
    headings: number;
    labels: number;
    keyboard: number;
    aria: number;
  };
  colorContrast: {
    passed: boolean;
    ratios: {
      [element: string]: number;
    };
  };
}

export interface SEOMetrics {
  score: number; // 0-100
  metaTags: {
    title: boolean;
    description: boolean;
    keywords: boolean;
    og: boolean;
    twitter: boolean;
  };
  structure: {
    h1: boolean;
    headings: boolean;
    schema: boolean;
    sitemap: boolean;
    robots: boolean;
  };
  content: {
    keywordDensity: number;
    contentLength: number;
    internalLinks: number;
    externalLinks: number;
  };
}

export interface VisualMetrics {
  score: number; // 0-10
  layout: {
    balance: number;
    hierarchy: number;
    spacing: number;
    alignment: number;
  };
  design: {
    consistency: number;
    branding: number;
    typography: number;
    colors: number;
  };
  responsiveness: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export interface NavigationMetrics {
  score: number; // 0-10
  integrityScore: number; // 0-10 (navigation integrity)
  status: 'pass' | 'fail' | 'warning';
  totalLinks: number;
  workingLinks: number;
  brokenLinks: number;
  issues: NavigationIssue[];
}

export interface NavigationIssue {
  page: string;
  link: string;
  href: string;
  reason: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

