/**
 * Agent UI Types
 * Client-side type definitions for agent visualization
 */

export interface AgentPersonality {
  trait: string;
  communicationStyle: 'formal' | 'casual' | 'technical' | 'creative';
  emoji: string;
  color: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  type: string;
  version: string;
  status: 'idle' | 'working' | 'researching' | 'reporting' | 'upgrading' | 'error';
  personality: AgentPersonality;
  expertise: string[];
  totalTasksCompleted: number;
  averageScore: number;
}

export interface AgentMessage {
  id: string;
  agentId: string;
  agentName: string;
  role: 'merlin' | 'specialist';
  content: string;
  timestamp: string;
  messageType: 'greeting' | 'analysis' | 'question' | 'answer' | 'report' | 'action' | 'completion';
  metadata?: Record<string, unknown>;
}

export interface AgentConversation {
  id: string;
  projectId: string;
  phase: string;
  participants: string[];
  messages: AgentMessage[];
  startedAt: string;
  endedAt?: string;
  summary?: string;
}

export interface UpgradeProposal {
  id: string;
  agentId: string;
  agentName: string;
  currentVersion: string;
  proposedVersion: string;
  title: string;
  description: string;
  reason: string;
  expectedBenefits: string[];
  riskAssessment: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  proposedAt: string;
}

export interface AnalysisReport {
  agentId: string;
  agentName: string;
  overallScore: number;
  metrics: {
    name: string;
    score: number;
    maxScore: number;
    status: 'excellent' | 'good' | 'needs-work' | 'poor';
    details?: string;
  }[];
  recommendations: {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    expectedImprovement: number;
    automated: boolean;
  }[];
}

// Agent visual configurations
export const AGENT_CONFIGS: Record<string, {
  name: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
}> = {
  merlin: {
    name: 'MERLIN',
    emoji: '🧙',
    color: '#8B5CF6',
    gradient: 'from-purple-600 to-violet-700',
    description: 'Product Manager & Orchestrator',
  },
  nova: {
    name: 'NOVA',
    emoji: '✨',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Design Expert',
  },
  atlas: {
    name: 'ATLAS',
    emoji: '🗺️',
    color: '#3B82F6',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Layout Expert',
  },
  sage: {
    name: 'SAGE',
    emoji: '📚',
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Content Expert',
  },
  oracle: {
    name: 'ORACLE',
    emoji: '🔮',
    color: '#6366F1',
    gradient: 'from-indigo-500 to-purple-600',
    description: 'SEO Expert',
  },
  scout: {
    name: 'SCOUT',
    emoji: '🔍',
    color: '#EC4899',
    gradient: 'from-pink-500 to-rose-600',
    description: 'Research Expert',
  },
  cipher: {
    name: 'CIPHER',
    emoji: '💻',
    color: '#06B6D4',
    gradient: 'from-cyan-500 to-blue-600',
    description: 'Code Expert',
  },
  phoenix: {
    name: 'PHOENIX',
    emoji: '🔥',
    color: '#EF4444',
    gradient: 'from-red-500 to-orange-600',
    description: 'Image Expert',
  },
  aegis: {
    name: 'AEGIS',
    emoji: '🛡️',
    color: '#14B8A6',
    gradient: 'from-teal-500 to-cyan-600',
    description: 'Security Expert',
  },
  tempo: {
    name: 'TEMPO',
    emoji: '⚡',
    color: '#FBBF24',
    gradient: 'from-yellow-500 to-amber-600',
    description: 'Performance Expert',
  },
};

export function getAgentConfig(agentName: string) {
  const key = agentName.toLowerCase();
  return AGENT_CONFIGS[key] || {
    name: agentName,
    emoji: '🤖',
    color: '#6B7280',
    gradient: 'from-gray-500 to-gray-600',
    description: 'AI Agent',
  };
}

