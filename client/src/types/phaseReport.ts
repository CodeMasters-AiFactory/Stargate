// Phase-by-Phase Reporting System
// Each phase gets a detailed report with rating (0-100) and analysis

export interface PhaseReport {
  phaseNumber: number;
  phaseName: string;
  stage: string;
  status: 'pending' | 'in-progress' | 'complete' | 'error' | 'skipped';
  startTime: string | null;
  endTime: string | null;
  duration: number | null; // milliseconds
  rating: number | null; // 0-100
  ratingBreakdown?: {
    criteria: string;
    score: number;
    maxScore: number;
    notes: string;
  }[];
  analysis: string; // Detailed analysis for ChatGPT
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  data?: any; // Phase-specific data
  errors?: string[];
  warnings?: string[];
}

export interface WebsiteReport {
  projectName: string;
  projectSlug: string;
  packageType: string;
  startTime: string;
  endTime: string | null;
  totalDuration: number | null; // milliseconds
  overallScore: number; // 0-100, calculated from all phases
  phaseReports: PhaseReport[];
  summary: {
    totalPhases: number;
    completedPhases: number;
    averagePhaseScore: number;
    highestRatedPhase: { phase: string; score: number };
    lowestRatedPhase: { phase: string; score: number };
  };
  recommendations: string[];
  metadata: {
    requirements: any;
    investigationResults: any;
    generatedWebsite: any;
  };
}

export const PHASE_NAMES: Record<string, string> = {
  'package-select': 'Phase 1: Package Selection',
  requirements: 'Phase 2: Client Specification',
  'content-quality': 'Phase 3: Content Quality & Relevance',
  'keywords-semantic-seo': 'Phase 4: Keywords & Semantic SEO',
  'technical-seo': 'Phase 5: Technical SEO',
  'core-web-vitals': 'Phase 6: Core Web Vitals',
  'structure-navigation': 'Phase 7: Structure & Navigation',
  'mobile-optimization': 'Phase 8: Mobile Optimization',
  'visual-quality': 'Phase 9: Visual Quality & Engagement',
  'image-media-quality': 'Phase 10: Image & Media Quality',
  'local-seo': 'Phase 11: Local SEO',
  'trust-signals': 'Phase 12: Trust Signals',
  'schema-structured-data': 'Phase 13: Schema & Structured Data',
  'on-page-seo-structure': 'Phase 14: On-Page SEO Structure',
  security: 'Phase 15: Security',
  build: 'Phase 16: Website Builder',
  review: 'Phase 17: Review & Final Output',
};

export const PHASE_NUMBERS: Record<string, number> = {
  'package-select': 1,
  requirements: 2,
  'content-quality': 3,
  'keywords-semantic-seo': 4,
  'technical-seo': 5,
  'core-web-vitals': 6,
  'structure-navigation': 7,
  'mobile-optimization': 8,
  'visual-quality': 9,
  'image-media-quality': 10,
  'local-seo': 11,
  'trust-signals': 12,
  'schema-structured-data': 13,
  'on-page-seo-structure': 14,
  security: 15,
  build: 16,
  review: 17,
};
