/**
 * Merlin Coordinator
 * 
 * The orchestrator that manages all specialist agents
 * Acts as the "Product Manager" of The Council
 * 
 * Responsibilities:
 * - Coordinate agent tasks during website building
 * - Manage agent conversations
 * - Review and approve/reject upgrade proposals
 * - Report overall progress to the UI
 */

import { v4 as uuidv4 } from 'uuid';
import { AgentRegistry } from './AgentRegistry';
import { BaseAgent } from './BaseAgent';
import type {
  TaskContext,
  TaskType,
  AgentMessage,
  UpgradeProposal,
  ApprovedUpgrade,
  AnalysisReport,
  TrendReport,
} from './types';
import {
  createConversation,
  addMessage,
  createMerlinMessage,
  endConversation,
  runAgentConversation,
  runMultiAgentConversation,
} from './AgentConversation';

// Merlin's personality
const MERLIN_PERSONALITY = {
  name: 'MERLIN',
  emoji: '🧙',
  color: '#8B5CF6', // Purple
  traits: ['wise', 'strategic', 'patient', 'thorough'],
};

// Phase to agent type mapping
const PHASE_AGENT_MAPPING: Record<string, TaskType[]> = {
  'intake': ['research'],
  'industry-detection': ['research', 'seo'],
  'competitor-analysis': ['research', 'design'],
  'design-system': ['design', 'layout'],
  'typography': ['design'],
  'color-palette': ['design'],
  'layout-generation': ['layout', 'design'],
  'responsive': ['layout', 'code'],
  'image-planning': ['image', 'design'],
  'image-generation': ['image'],
  'copywriting': ['content'],
  'seo-metadata': ['seo', 'content'],
  'html-generation': ['code'],
  'accessibility': ['code', 'security'],
  'performance': ['performance', 'code'],
  'qa-testing': ['code', 'performance', 'security'],
  'deployment': ['code', 'security'],
};

interface CoordinationResult {
  phase: string;
  conversationId: string;
  messages: AgentMessage[];
  reports: AnalysisReport[];
  overallScore: number;
  recommendations: string[];
  success: boolean;
}

interface MerlinStatus {
  isActive: boolean;
  currentPhase: string | null;
  activeAgents: string[];
  pendingUpgrades: number;
  lastActivity: Date;
}

class MerlinCoordinatorClass {
  private isActive: boolean = false;
  private currentPhase: string | null = null;
  private activeAgents: Set<string> = new Set();
  private lastActivity: Date = new Date();
  private pendingUpgradeQueue: UpgradeProposal[] = [];

  /**
   * Get Merlin's status
   */
  getStatus(): MerlinStatus {
    return {
      isActive: this.isActive,
      currentPhase: this.currentPhase,
      activeAgents: Array.from(this.activeAgents),
      pendingUpgrades: this.pendingUpgradeQueue.length,
      lastActivity: this.lastActivity,
    };
  }

  /**
   * Initialize Merlin and all agents
   */
  async initialize(): Promise<{
    success: boolean;
    agentCount: number;
    startupReports: Array<{
      agentName: string;
      version: string;
      status: string;
      proposedUpgrades: UpgradeProposal[];
    }>;
    pendingUpgrades: UpgradeProposal[];
  }> {
    console.log('\n' + '═'.repeat(60));
    console.log(`${MERLIN_PERSONALITY.emoji} MERLIN: Awakening The Council...`);
    console.log('═'.repeat(60) + '\n');

    // Initialize all registered agents
    const startupReports = await AgentRegistry.initializeAll();

    // Collect all pending upgrades
    this.pendingUpgradeQueue = AgentRegistry.getAllPendingUpgrades();

    console.log(`\n${MERLIN_PERSONALITY.emoji} MERLIN: ${AgentRegistry.getAgentCount()} agents ready`);
    
    if (this.pendingUpgradeQueue.length > 0) {
      console.log(`${MERLIN_PERSONALITY.emoji} MERLIN: ${this.pendingUpgradeQueue.length} upgrade proposal(s) pending review`);
    }

    this.isActive = true;
    this.lastActivity = new Date();

    return {
      success: true,
      agentCount: AgentRegistry.getAgentCount(),
      startupReports,
      pendingUpgrades: this.pendingUpgradeQueue,
    };
  }

  /**
   * Coordinate agents for a specific phase
   */
  async coordinatePhase(
    phase: string,
    context: TaskContext,
    onMessage?: (message: AgentMessage) => void
  ): Promise<CoordinationResult> {
    console.log(`\n${MERLIN_PERSONALITY.emoji} MERLIN: Beginning ${phase} phase coordination`);
    
    this.currentPhase = phase;
    this.lastActivity = new Date();

    // Get agent types needed for this phase
    const agentTypes = PHASE_AGENT_MAPPING[phase] || ['design', 'content'];
    
    // Get best available agents for each type
    const agents: BaseAgent[] = [];
    for (const type of agentTypes) {
      const agent = AgentRegistry.getBestAgentForType(type);
      if (agent && !agents.find(a => a.id === agent.id)) {
        agents.push(agent);
        this.activeAgents.add(agent.id);
      }
    }

    if (agents.length === 0) {
      console.warn(`${MERLIN_PERSONALITY.emoji} MERLIN: No agents available for ${phase}`);
      return {
        phase,
        conversationId: '',
        messages: [],
        reports: [],
        overallScore: 0,
        recommendations: ['No agents available for this phase'],
        success: false,
      };
    }

    // Run multi-agent conversation
    const { conversationId, messages, summary } = await runMultiAgentConversation(
      agents,
      context,
      context.projectId,
      phase,
      onMessage
    );

    // Collect reports from messages
    const reports: AnalysisReport[] = [];
    for (const agent of agents) {
      // In a real implementation, we'd get the actual reports
      // For now, generate a placeholder
      const report = await agent.analyze(context);
      reports.push(report);
    }

    // Calculate overall score
    const overallScore = reports.length > 0
      ? reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length
      : 0;

    // Gather recommendations
    const recommendations = reports
      .flatMap(r => r.recommendations)
      .filter(r => r.priority === 'high')
      .map(r => r.title);

    // Clear active agents
    for (const agent of agents) {
      this.activeAgents.delete(agent.id);
    }

    this.currentPhase = null;
    this.lastActivity = new Date();

    return {
      phase,
      conversationId,
      messages,
      reports,
      overallScore,
      recommendations,
      success: true,
    };
  }

  /**
   * Call a specific agent by name
   */
  async callAgent(
    agentName: string,
    context: TaskContext,
    onMessage?: (message: AgentMessage) => void
  ): Promise<{
    success: boolean;
    messages: AgentMessage[];
    report?: AnalysisReport;
  }> {
    const agent = AgentRegistry.getAgentByName(agentName);
    if (!agent) {
      console.error(`${MERLIN_PERSONALITY.emoji} MERLIN: Agent not found: ${agentName}`);
      return { success: false, messages: [] };
    }

    console.log(`${MERLIN_PERSONALITY.emoji} MERLIN: Calling ${agent.name}...`);
    this.activeAgents.add(agent.id);

    const conversation = createConversation(
      context.projectId,
      `call-${agentName.toLowerCase()}`,
      ['MERLIN', agent.name]
    );

    const messages = await runAgentConversation(
      agent,
      context,
      conversation.id,
      onMessage
    );

    const report = await agent.analyze(context);

    this.activeAgents.delete(agent.id);
    endConversation(conversation.id);

    return {
      success: true,
      messages,
      report,
    };
  }

  /**
   * Review an upgrade proposal
   */
  async reviewUpgrade(
    proposalId: string,
    decision: 'approve' | 'reject',
    notes?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const proposal = this.pendingUpgradeQueue.find(p => p.id === proposalId);
    if (!proposal) {
      return { success: false, message: 'Proposal not found' };
    }

    const agent = AgentRegistry.getAgent(proposal.agentId);
    if (!agent) {
      return { success: false, message: 'Agent not found' };
    }

    if (decision === 'approve') {
      console.log(`${MERLIN_PERSONALITY.emoji} MERLIN: Approving upgrade for ${proposal.agentName}`);
      
      const approved: ApprovedUpgrade = {
        ...proposal,
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: 'MERLIN',
        approvalNotes: notes,
      };

      await agent.applyUpgrade(approved);
      
      // Remove from queue
      this.pendingUpgradeQueue = this.pendingUpgradeQueue.filter(p => p.id !== proposalId);
      
      return {
        success: true,
        message: `Approved: ${proposal.agentName} upgraded to v${proposal.proposedVersion}`,
      };
    } else {
      console.log(`${MERLIN_PERSONALITY.emoji} MERLIN: Rejecting upgrade for ${proposal.agentName}`);
      proposal.status = 'rejected';
      
      // Remove from queue
      this.pendingUpgradeQueue = this.pendingUpgradeQueue.filter(p => p.id !== proposalId);
      
      return {
        success: true,
        message: `Rejected: ${proposal.title}`,
      };
    }
  }

  /**
   * Get all pending upgrades
   */
  getPendingUpgrades(): UpgradeProposal[] {
    // Refresh from all agents
    this.pendingUpgradeQueue = AgentRegistry.getAllPendingUpgrades();
    return [...this.pendingUpgradeQueue];
  }

  /**
   * Run startup research for all agents
   */
  async runStartupResearch(): Promise<{
    trendReports: TrendReport[];
    newProposals: UpgradeProposal[];
  }> {
    console.log(`\n${MERLIN_PERSONALITY.emoji} MERLIN: Running startup research scan...`);

    const trendReports: TrendReport[] = [];
    const newProposals: UpgradeProposal[] = [];

    const agents = AgentRegistry.getAllAgents();
    
    for (const agent of agents) {
      try {
        console.log(`${MERLIN_PERSONALITY.emoji} MERLIN: ${agent.name}, research your domain...`);
        const trends = await agent.researchTrends();
        trendReports.push(trends);
        
        // Check for new upgrade proposals
        const upgrades = agent.getPendingUpgrades();
        newProposals.push(...upgrades);
      } catch (error) {
        console.error(`${MERLIN_PERSONALITY.emoji} MERLIN: ${agent.name} research failed:`, error);
      }
    }

    // Update pending queue
    this.pendingUpgradeQueue = AgentRegistry.getAllPendingUpgrades();

    console.log(`${MERLIN_PERSONALITY.emoji} MERLIN: Research complete. ${trendReports.length} reports, ${newProposals.length} proposals.`);

    return { trendReports, newProposals };
  }

  /**
   * Get a summary message from Merlin
   */
  getSummary(): string {
    const agents = AgentRegistry.getAllAgents();
    const working = agents.filter(a => a.getStatus() !== 'idle');
    
    let summary = `\n${MERLIN_PERSONALITY.emoji} **MERLIN STATUS REPORT**\n`;
    summary += '━'.repeat(40) + '\n';
    summary += `Agents Online: ${agents.length}\n`;
    summary += `Currently Working: ${working.length}\n`;
    summary += `Pending Upgrades: ${this.pendingUpgradeQueue.length}\n`;
    
    if (this.currentPhase) {
      summary += `Active Phase: ${this.currentPhase}\n`;
    }
    
    summary += '━'.repeat(40) + '\n';
    
    // List agents
    for (const agent of agents) {
      const info = agent.getInfo();
      summary += `${info.personality.emoji} ${info.name} v${info.version}\n`;
    }
    
    return summary;
  }

  /**
   * Send a direct message (for UI display)
   */
  createMessage(content: string, type: AgentMessage['messageType'] = 'action'): AgentMessage {
    return createMerlinMessage(content, type);
  }
}

// Singleton instance
export const MerlinCoordinator = new MerlinCoordinatorClass();

// Export class for testing
export { MerlinCoordinatorClass };

