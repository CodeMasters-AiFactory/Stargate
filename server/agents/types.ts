/**
 * Agent System Types
 * Core type definitions for the AI Agent Specialist System
 */

// Agent personality traits
export interface AgentPersonality {
  trait: string;
  communicationStyle: 'formal' | 'casual' | 'technical' | 'creative';
  emoji: string;
  color: string;
}

// Agent version tracking
export interface AgentVersion {
  major: number;
  minor: number;
  patch: number;
  changelog: VersionChange[];
}

export interface VersionChange {
  version: string;
  date: string;
  changes: string[];
  approvedBy: string;
}

// Agent status
export type AgentStatus = 'idle' | 'working' | 'researching' | 'reporting' | 'upgrading' | 'error';

// Task types
export type TaskType = 
  | 'design' 
  | 'layout' 
  | 'content' 
  | 'seo' 
  | 'research' 
  | 'code' 
  | 'image' 
  | 'security' 
  | 'performance'
  | 'analysis';

// Task context passed to agents
export interface TaskContext {
  projectId: string;
  projectSlug: string;
  industry: string;
  businessName: string;
  targetAudience?: string;
  competitorUrls?: string[];
  existingContent?: Record<string, unknown>;
  designTokens?: Record<string, unknown>;
  currentPhase: string;
  previousResults?: Record<string, unknown>;
}

// Agent task
export interface AgentTask {
  id: string;
  type: TaskType;
  description: string;
  context: TaskContext;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: Date;
  dependencies?: string[];
}

// Analysis report from agents
export interface AnalysisReport {
  agentId: string;
  agentName: string;
  timestamp: Date;
  overallScore: number; // 0-100
  metrics: ReportMetric[];
  findings: Finding[];
  recommendations: Recommendation[];
  canImprove: boolean;
  estimatedImprovementScore?: number;
}

export interface ReportMetric {
  name: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'needs-work' | 'poor';
  details?: string;
}

export interface Finding {
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  category: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  evidence?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  effort: 'quick-win' | 'medium' | 'major';
  expectedImprovement: number; // percentage points
  automated: boolean;
}

// Task result
export interface TaskResult {
  taskId: string;
  agentId: string;
  success: boolean;
  report: AnalysisReport;
  artifacts?: Record<string, unknown>;
  executionTimeMs: number;
  tokensUsed?: number;
  errors?: string[];
}

// Upgrade proposal
export interface UpgradeProposal {
  id: string;
  agentId: string;
  agentName: string;
  currentVersion: string;
  proposedVersion: string;
  title: string;
  description: string;
  reason: string;
  evidence: UpgradeEvidence[];
  expectedBenefits: string[];
  riskAssessment: RiskLevel;
  implementationPlan: string[];
  rollbackPlan: string;
  proposedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
}

export interface UpgradeEvidence {
  source: string;
  url?: string;
  finding: string;
  relevance: 'high' | 'medium' | 'low';
  dateFound: Date;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Approved upgrade
export interface ApprovedUpgrade extends UpgradeProposal {
  approvedAt: Date;
  approvedBy: string;
  approvalNotes?: string;
}

// Feedback for learning
export interface Feedback {
  taskId: string;
  agentId: string;
  rating: number; // 1-5
  comments?: string;
  specificImprovements?: string[];
  timestamp: Date;
}

// Trend report from research
export interface TrendReport {
  agentId: string;
  category: string;
  trends: Trend[];
  researchedAt: Date;
  sources: string[];
}

export interface Trend {
  name: string;
  description: string;
  popularity: 'emerging' | 'growing' | 'mainstream' | 'declining';
  relevance: number; // 0-100
  examples: string[];
  recommendation: string;
}

// Inspiration result
export interface InspirationResult {
  source: string;
  url: string;
  title: string;
  description: string;
  relevanceScore: number;
  features: string[];
  screenshotUrl?: string;
  scrapedAt: Date;
}

// Conversation message
export interface AgentMessage {
  id: string;
  agentId: string;
  agentName: string;
  role: 'merlin' | 'specialist';
  content: string;
  timestamp: Date;
  messageType: 'greeting' | 'analysis' | 'question' | 'answer' | 'report' | 'action' | 'completion';
  metadata?: Record<string, unknown>;
}

// Agent conversation
export interface AgentConversation {
  id: string;
  projectId: string;
  phase: string;
  participants: string[];
  messages: AgentMessage[];
  startedAt: Date;
  endedAt?: Date;
  summary?: string;
}

// Agent registry entry
export interface AgentRegistryEntry {
  id: string;
  name: string;
  type: TaskType;
  version: AgentVersion;
  status: AgentStatus;
  personality: AgentPersonality;
  expertise: string[];
  lastActive: Date;
  totalTasksCompleted: number;
  averageScore: number;
  upgradeHistory: VersionChange[];
}

