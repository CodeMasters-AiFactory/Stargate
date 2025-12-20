/**
 * useAgents Hook
 * 
 * React hook for interacting with the AI Agent System
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { 
  AgentInfo, 
  AgentMessage, 
  UpgradeProposal, 
  AnalysisReport 
} from '@/components/Agents/types';

interface AgentsState {
  agents: AgentInfo[];
  isLoading: boolean;
  error: string | null;
}

interface ConversationState {
  messages: AgentMessage[];
  isActive: boolean;
  currentAgent: string | null;
}

interface UseAgentsReturn {
  // Agent list
  agents: AgentInfo[];
  isLoading: boolean;
  error: string | null;
  
  // Conversation
  messages: AgentMessage[];
  isConversationActive: boolean;
  currentAgent: string | null;
  
  // Upgrades
  pendingUpgrades: UpgradeProposal[];
  
  // Actions
  fetchAgents: () => Promise<void>;
  initializeAgents: () => Promise<void>;
  callAgent: (agentName: string, context: any) => Promise<AnalysisReport | null>;
  coordinatePhase: (phase: string, context: any) => Promise<any>;
  approveUpgrade: (proposalId: string, notes?: string) => Promise<void>;
  rejectUpgrade: (proposalId: string, reason?: string) => Promise<void>;
  fetchPendingUpgrades: () => Promise<void>;
  clearMessages: () => void;
}

export function useAgents(): UseAgentsReturn {
  const [agentsState, setAgentsState] = useState<AgentsState>({
    agents: [],
    isLoading: false,
    error: null,
  });

  const [conversation, setConversation] = useState<ConversationState>({
    messages: [],
    isActive: false,
    currentAgent: null,
  });

  const [pendingUpgrades, setPendingUpgrades] = useState<UpgradeProposal[]>([]);
  
  // Use ref to track if we should add messages
  const conversationRef = useRef(conversation);
  conversationRef.current = conversation;

  /**
   * Fetch all registered agents
   */
  const fetchAgents = useCallback(async () => {
    setAgentsState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success) {
        setAgentsState({ agents: data.agents, isLoading: false, error: null });
      } else {
        throw new Error(data.error || 'Failed to fetch agents');
      }
    } catch (err) {
      setAgentsState(s => ({ 
        ...s, 
        isLoading: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }));
    }
  }, []);

  /**
   * Initialize all agents
   */
  const initializeAgents = useCallback(async () => {
    setAgentsState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const response = await fetch('/api/agents/initialize', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        await fetchAgents();
        await fetchPendingUpgrades();
      } else {
        throw new Error(data.error || 'Failed to initialize agents');
      }
    } catch (err) {
      setAgentsState(s => ({ 
        ...s, 
        isLoading: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }));
    }
  }, [fetchAgents]);

  /**
   * Call a specific agent
   */
  const callAgent = useCallback(async (
    agentName: string, 
    context: any
  ): Promise<AnalysisReport | null> => {
    setConversation(s => ({ ...s, isActive: true, currentAgent: agentName }));
    
    try {
      const response = await fetch('/api/agents/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName, context }),
      });
      const data = await response.json();
      
      if (data.success) {
        // Add messages to conversation
        setConversation(s => ({
          ...s,
          messages: [...s.messages, ...data.messages],
          isActive: false,
          currentAgent: null,
        }));
        return data.report;
      } else {
        throw new Error(data.error || 'Failed to call agent');
      }
    } catch (err) {
      setConversation(s => ({ ...s, isActive: false, currentAgent: null }));
      console.error('Error calling agent:', err);
      return null;
    }
  }, []);

  /**
   * Coordinate agents for a phase
   */
  const coordinatePhase = useCallback(async (phase: string, context: any) => {
    setConversation(s => ({ ...s, isActive: true }));
    
    try {
      const response = await fetch('/api/agents/coordinate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase, context }),
      });
      const data = await response.json();
      
      if (data.success) {
        setConversation(s => ({
          ...s,
          messages: [...s.messages, ...data.messages],
          isActive: false,
        }));
        return data;
      } else {
        throw new Error(data.error || 'Failed to coordinate phase');
      }
    } catch (err) {
      setConversation(s => ({ ...s, isActive: false }));
      console.error('Error coordinating phase:', err);
      return null;
    }
  }, []);

  /**
   * Fetch pending upgrades
   */
  const fetchPendingUpgrades = useCallback(async () => {
    try {
      const response = await fetch('/api/agents/approvals');
      const data = await response.json();
      if (data.success) {
        setPendingUpgrades(data.proposals);
      }
    } catch (err) {
      console.error('Error fetching upgrades:', err);
    }
  }, []);

  /**
   * Approve an upgrade
   */
  const approveUpgrade = useCallback(async (proposalId: string, notes?: string) => {
    try {
      const response = await fetch(`/api/agents/approvals/${proposalId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchPendingUpgrades();
        await fetchAgents();
      }
    } catch (err) {
      console.error('Error approving upgrade:', err);
    }
  }, [fetchPendingUpgrades, fetchAgents]);

  /**
   * Reject an upgrade
   */
  const rejectUpgrade = useCallback(async (proposalId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/agents/approvals/${proposalId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchPendingUpgrades();
      }
    } catch (err) {
      console.error('Error rejecting upgrade:', err);
    }
  }, [fetchPendingUpgrades]);

  /**
   * Clear conversation messages
   */
  const clearMessages = useCallback(() => {
    setConversation(s => ({ ...s, messages: [] }));
  }, []);

  // Fetch agents on mount
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents: agentsState.agents,
    isLoading: agentsState.isLoading,
    error: agentsState.error,
    messages: conversation.messages,
    isConversationActive: conversation.isActive,
    currentAgent: conversation.currentAgent,
    pendingUpgrades,
    fetchAgents,
    initializeAgents,
    callAgent,
    coordinatePhase,
    approveUpgrade,
    rejectUpgrade,
    fetchPendingUpgrades,
    clearMessages,
  };
}

export default useAgents;

