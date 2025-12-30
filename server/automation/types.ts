/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTONOMOUS TESTER - TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface TestSession {
  id: string;
  websiteCount: number;
  targetCount: number;
  startedAt: Date;
  completedAt?: Date;
  learnings: Learning[];
  qualityScores: QualityScore[];
  failureLog: FailureEntry[];
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentWebsite: number;
  improvementDelta?: number;
}

export interface Learning {
  id: string;
  type: 'success_pattern' | 'failure_pattern' | 'improvement' | 'command_optimization';
  context: string;
  insight: string;
  appliedCount: number;
  effectivenessScore: number;
  createdAt: Date;
  relatedWebsiteIds: string[];
}

export interface QualityScore {
  websiteId: string;
  templateId: string;
  industryId: string;
  businessName: string;
  overallScore: number;
  categories: {
    visualDesign: number;
    uxStructure: number;
    contentQuality: number;
    conversionTrust: number;
    seo: number;
    creativity: number;
  };
  verdict: 'Poor' | 'OK' | 'Good' | 'Excellent' | 'World-Class';
  meetsThreshold: boolean;
  issues: QualityIssue[];
  evaluatedAt: Date;
}

export interface QualityIssue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  suggestion?: string;
}

export interface FailureEntry {
  id: string;
  websiteId: string;
  step: string;
  errorType: string;
  errorMessage: string;
  context: Record<string, unknown>;
  recoveryAttempts: number;
  resolved: boolean;
  resolution?: string;
  occurredAt: Date;
}

export interface TestCommand {
  id: string;
  category: 'navigation' | 'form_fill' | 'verification' | 'interaction' | 'quality_check';
  action: string;
  target?: string;
  value?: string;
  timeout?: number;
  retries?: number;
  expectedResult?: string;
}

export interface WebsiteGenerationResult {
  success: boolean;
  websiteId: string;
  templateId: string;
  industryId: string;
  businessName: string;
  html?: string;
  outputPath?: string;
  generationTimeMs: number;
  commandsExecuted: number;
  commandsFailed: number;
  errors: string[];
}

export interface SessionConfig {
  websiteCount: number;
  useRealImages: boolean;
  randomIndustries: boolean;
  maxRetries: number;
  timeoutPerWebsite: number;
  headless: boolean;
  saveScreenshots: boolean;
  qualityThreshold: number;
}

export interface IndustrySelection {
  id: string;
  name: string;
  selected: boolean;
  previousScore?: number;
  timesUsed: number;
}

export interface TemplateSelection {
  id: string;
  name: string;
  industry: string;
  successRate: number;
  averageScore: number;
  timesUsed: number;
}

export interface ExecutionLog {
  sessionId: string;
  websiteId: string;
  timestamp: Date;
  commandId: string;
  action: string;
  status: 'success' | 'failed' | 'skipped';
  durationMs: number;
  error?: string;
  screenshot?: string;
}

export interface SessionReport {
  sessionId: string;
  startedAt: Date;
  completedAt: Date;
  totalWebsites: number;
  successfulWebsites: number;
  failedWebsites: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  totalCommands: number;
  commandSuccessRate: number;
  topLearnings: Learning[];
  recommendations: string[];
  improvementFromPrevious: number;
}
