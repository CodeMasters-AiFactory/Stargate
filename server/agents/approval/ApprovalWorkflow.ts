/**
 * Upgrade Approval Workflow
 * 
 * Manages the approval process for agent upgrade proposals.
 * Merlin reviews and approves/rejects upgrades.
 */

import { v4 as uuidv4 } from 'uuid';
import { AgentRegistry } from '../AgentRegistry';
import type { UpgradeProposal, ApprovedUpgrade, RiskLevel } from '../types';

// Approval queue storage (in production, use database)
const approvalQueue: Map<string, UpgradeProposal> = new Map();
const approvalHistory: ApprovedUpgrade[] = [];
const rejectionHistory: Array<UpgradeProposal & { rejectedAt: Date; reason?: string }> = [];

// Auto-approval settings
const AUTO_APPROVE_SETTINGS = {
  enabled: false, // Set to true to auto-approve low-risk upgrades
  maxRiskLevel: 'low' as RiskLevel,
  requireNotification: true,
};

export interface ApprovalResult {
  success: boolean;
  message: string;
  proposal?: UpgradeProposal;
  newVersion?: string;
}

/**
 * Submit a proposal for approval
 */
export function submitForApproval(proposal: UpgradeProposal): string {
  // Ensure unique ID
  if (!proposal.id) {
    proposal.id = uuidv4();
  }
  
  proposal.status = 'pending';
  approvalQueue.set(proposal.id, proposal);
  
  console.log(`[ApprovalWorkflow] 📝 New proposal submitted: ${proposal.title}`);
  console.log(`[ApprovalWorkflow]    Agent: ${proposal.agentName}`);
  console.log(`[ApprovalWorkflow]    Version: ${proposal.currentVersion} → ${proposal.proposedVersion}`);
  console.log(`[ApprovalWorkflow]    Risk: ${proposal.riskAssessment}`);

  // Check for auto-approval
  if (AUTO_APPROVE_SETTINGS.enabled && 
      isAutoApprovable(proposal.riskAssessment)) {
    console.log(`[ApprovalWorkflow] ✅ Auto-approving low-risk upgrade`);
    approveProposal(proposal.id, 'Auto-approved by system', 'MERLIN (Auto)');
  }

  return proposal.id;
}

/**
 * Check if a risk level qualifies for auto-approval
 */
function isAutoApprovable(risk: RiskLevel): boolean {
  const riskHierarchy: RiskLevel[] = ['low', 'medium', 'high', 'critical'];
  const maxIndex = riskHierarchy.indexOf(AUTO_APPROVE_SETTINGS.maxRiskLevel);
  const proposalIndex = riskHierarchy.indexOf(risk);
  return proposalIndex <= maxIndex;
}

/**
 * Get all pending proposals
 */
export function getPendingProposals(): UpgradeProposal[] {
  return Array.from(approvalQueue.values())
    .filter(p => p.status === 'pending')
    .sort((a, b) => {
      // Sort by risk (higher first), then by date (older first)
      const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const riskDiff = riskOrder[a.riskAssessment] - riskOrder[b.riskAssessment];
      if (riskDiff !== 0) return riskDiff;
      return new Date(a.proposedAt).getTime() - new Date(b.proposedAt).getTime();
    });
}

/**
 * Get a specific proposal
 */
export function getProposal(proposalId: string): UpgradeProposal | undefined {
  return approvalQueue.get(proposalId);
}

/**
 * Approve a proposal
 */
export async function approveProposal(
  proposalId: string,
  notes?: string,
  approver: string = 'MERLIN'
): Promise<ApprovalResult> {
  const proposal = approvalQueue.get(proposalId);
  
  if (!proposal) {
    return {
      success: false,
      message: `Proposal not found: ${proposalId}`,
    };
  }

  if (proposal.status !== 'pending') {
    return {
      success: false,
      message: `Proposal is not pending: ${proposal.status}`,
      proposal,
    };
  }

  // Get the agent
  const agent = AgentRegistry.getAgent(proposal.agentId);
  if (!agent) {
    return {
      success: false,
      message: `Agent not found: ${proposal.agentId}`,
      proposal,
    };
  }

  // Create approved upgrade
  const approved: ApprovedUpgrade = {
    ...proposal,
    status: 'approved',
    approvedAt: new Date(),
    approvedBy: approver,
    approvalNotes: notes,
  };

  try {
    // Apply the upgrade to the agent
    await agent.applyUpgrade(approved);
    
    // Update proposal status
    proposal.status = 'implemented';
    
    // Move to history
    approvalHistory.push(approved);
    approvalQueue.delete(proposalId);

    console.log(`[ApprovalWorkflow] ✅ Approved: ${proposal.title}`);
    console.log(`[ApprovalWorkflow]    ${proposal.agentName} upgraded to v${proposal.proposedVersion}`);

    return {
      success: true,
      message: `Approved and applied: ${proposal.agentName} v${proposal.proposedVersion}`,
      proposal: approved,
      newVersion: proposal.proposedVersion,
    };
  } catch (error) {
    console.error(`[ApprovalWorkflow] ❌ Failed to apply upgrade:`, error);
    return {
      success: false,
      message: `Failed to apply upgrade: ${error instanceof Error ? error.message : 'Unknown error'}`,
      proposal,
    };
  }
}

/**
 * Reject a proposal
 */
export function rejectProposal(
  proposalId: string,
  reason?: string,
  rejector: string = 'MERLIN'
): ApprovalResult {
  const proposal = approvalQueue.get(proposalId);
  
  if (!proposal) {
    return {
      success: false,
      message: `Proposal not found: ${proposalId}`,
    };
  }

  if (proposal.status !== 'pending') {
    return {
      success: false,
      message: `Proposal is not pending: ${proposal.status}`,
      proposal,
    };
  }

  // Update status
  proposal.status = 'rejected';
  
  // Move to rejection history
  rejectionHistory.push({
    ...proposal,
    rejectedAt: new Date(),
    reason,
  });
  approvalQueue.delete(proposalId);

  console.log(`[ApprovalWorkflow] ❌ Rejected: ${proposal.title}`);
  if (reason) {
    console.log(`[ApprovalWorkflow]    Reason: ${reason}`);
  }

  return {
    success: true,
    message: `Rejected: ${proposal.title}`,
    proposal,
  };
}

/**
 * Get approval history
 */
export function getApprovalHistory(): ApprovedUpgrade[] {
  return [...approvalHistory];
}

/**
 * Get rejection history
 */
export function getRejectionHistory(): Array<UpgradeProposal & { rejectedAt: Date; reason?: string }> {
  return [...rejectionHistory];
}

/**
 * Get statistics
 */
export function getApprovalStats(): {
  pending: number;
  approved: number;
  rejected: number;
  byRisk: Record<RiskLevel, number>;
  byAgent: Record<string, number>;
} {
  const pending = getPendingProposals();
  
  const byRisk: Record<RiskLevel, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  
  const byAgent: Record<string, number> = {};
  
  for (const proposal of pending) {
    byRisk[proposal.riskAssessment]++;
    byAgent[proposal.agentName] = (byAgent[proposal.agentName] || 0) + 1;
  }

  return {
    pending: pending.length,
    approved: approvalHistory.length,
    rejected: rejectionHistory.length,
    byRisk,
    byAgent,
  };
}

/**
 * Configure auto-approval settings
 */
export function configureAutoApproval(settings: Partial<typeof AUTO_APPROVE_SETTINGS>): void {
  Object.assign(AUTO_APPROVE_SETTINGS, settings);
  console.log(`[ApprovalWorkflow] ⚙️ Auto-approval settings updated:`, AUTO_APPROVE_SETTINGS);
}

/**
 * Clear all pending proposals (use with caution)
 */
export function clearPendingProposals(): number {
  const count = approvalQueue.size;
  approvalQueue.clear();
  console.log(`[ApprovalWorkflow] 🗑️ Cleared ${count} pending proposals`);
  return count;
}

/**
 * Get summary message for Merlin
 */
export function getApprovalSummary(): string {
  const stats = getApprovalStats();
  
  if (stats.pending === 0) {
    return '✅ No pending upgrade proposals.';
  }

  let summary = `📋 **Pending Upgrade Proposals: ${stats.pending}**\n`;
  
  if (stats.byRisk.critical > 0 || stats.byRisk.high > 0) {
    summary += `⚠️ ${stats.byRisk.critical + stats.byRisk.high} high-priority proposals require review\n`;
  }
  
  summary += '\nBy Agent:\n';
  for (const [agent, count] of Object.entries(stats.byAgent)) {
    summary += `  • ${agent}: ${count} proposal(s)\n`;
  }
  
  return summary;
}

