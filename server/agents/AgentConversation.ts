/**
 * Agent Conversation Protocol
 * 
 * Manages conversations between Merlin and specialist agents
 * Provides real-time conversation streaming for the UI
 */

import { v4 as uuidv4 } from 'uuid';
import type { 
  AgentMessage, 
  AgentConversation as ConversationType,
  TaskContext 
} from './types';
import { BaseAgent } from './BaseAgent';

// Active conversations
const activeConversations: Map<string, ConversationType> = new Map();

// Event listeners for real-time updates
type ConversationListener = (conversation: ConversationType, message: AgentMessage) => void;
const listeners: Map<string, ConversationListener[]> = new Map();

/**
 * Create a new conversation
 */
export function createConversation(
  projectId: string,
  phase: string,
  participants: string[]
): ConversationType {
  const conversation: ConversationType = {
    id: uuidv4(),
    projectId,
    phase,
    participants,
    messages: [],
    startedAt: new Date(),
  };
  
  activeConversations.set(conversation.id, conversation);
  console.log(`[Conversation] 💬 Created conversation ${conversation.id} for phase: ${phase}`);
  
  return conversation;
}

/**
 * Add a message to a conversation
 */
export function addMessage(
  conversationId: string,
  message: AgentMessage
): void {
  const conversation = activeConversations.get(conversationId);
  if (!conversation) {
    console.error(`[Conversation] ❌ Conversation not found: ${conversationId}`);
    return;
  }
  
  conversation.messages.push(message);
  
  // Notify listeners
  const conversationListeners = listeners.get(conversationId) || [];
  for (const listener of conversationListeners) {
    listener(conversation, message);
  }
  
  // Also notify global listeners
  const globalListeners = listeners.get('*') || [];
  for (const listener of globalListeners) {
    listener(conversation, message);
  }
}

/**
 * Create a Merlin message
 */
export function createMerlinMessage(
  content: string,
  messageType: AgentMessage['messageType'] = 'action'
): AgentMessage {
  return {
    id: uuidv4(),
    agentId: 'merlin',
    agentName: 'MERLIN',
    role: 'merlin',
    content,
    timestamp: new Date(),
    messageType,
  };
}

/**
 * Subscribe to conversation updates
 */
export function subscribeToConversation(
  conversationId: string,
  listener: ConversationListener
): () => void {
  const existing = listeners.get(conversationId) || [];
  existing.push(listener);
  listeners.set(conversationId, existing);
  
  // Return unsubscribe function
  return () => {
    const current = listeners.get(conversationId) || [];
    listeners.set(
      conversationId,
      current.filter(l => l !== listener)
    );
  };
}

/**
 * Subscribe to all conversations
 */
export function subscribeToAllConversations(
  listener: ConversationListener
): () => void {
  return subscribeToConversation('*', listener);
}

/**
 * End a conversation
 */
export function endConversation(
  conversationId: string,
  summary?: string
): void {
  const conversation = activeConversations.get(conversationId);
  if (!conversation) return;
  
  conversation.endedAt = new Date();
  conversation.summary = summary;
  
  console.log(`[Conversation] ✅ Ended conversation ${conversationId}`);
}

/**
 * Get a conversation
 */
export function getConversation(conversationId: string): ConversationType | undefined {
  return activeConversations.get(conversationId);
}

/**
 * Get all active conversations
 */
export function getActiveConversations(): ConversationType[] {
  return Array.from(activeConversations.values())
    .filter(c => !c.endedAt);
}

/**
 * Get conversation history for a project
 */
export function getProjectConversations(projectId: string): ConversationType[] {
  return Array.from(activeConversations.values())
    .filter(c => c.projectId === projectId);
}

/**
 * Run a conversation between Merlin and an agent
 * Returns all messages generated
 */
export async function runAgentConversation(
  agent: BaseAgent,
  context: TaskContext,
  conversationId: string,
  onMessage?: (message: AgentMessage) => void
): Promise<AgentMessage[]> {
  const allMessages: AgentMessage[] = [];
  
  const addAndEmit = (message: AgentMessage) => {
    allMessages.push(message);
    addMessage(conversationId, message);
    if (onMessage) onMessage(message);
  };
  
  // Merlin introduces the agent
  const info = agent.getInfo();
  addAndEmit(createMerlinMessage(
    `I'm calling in ${info.personality.emoji} **${agent.name}**, our ${info.type.charAt(0).toUpperCase() + info.type.slice(1)} Expert (v${info.version}).`,
    'greeting'
  ));
  
  // Add a small delay for realism
  await delay(500);
  
  // Agent reports to Merlin
  const agentMessages = await agent.reportToMerlin(context);
  for (const message of agentMessages) {
    addAndEmit(message);
    await delay(300); // Small delay between messages
  }
  
  return allMessages;
}

/**
 * Run a multi-agent conversation
 * Merlin coordinates multiple agents
 */
export async function runMultiAgentConversation(
  agents: BaseAgent[],
  context: TaskContext,
  projectId: string,
  phase: string,
  onMessage?: (message: AgentMessage) => void
): Promise<{
  conversationId: string;
  messages: AgentMessage[];
  summary: string;
}> {
  // Create conversation
  const participants = ['MERLIN', ...agents.map(a => a.name)];
  const conversation = createConversation(projectId, phase, participants);
  
  const allMessages: AgentMessage[] = [];
  
  const addAndEmit = (message: AgentMessage) => {
    allMessages.push(message);
    addMessage(conversation.id, message);
    if (onMessage) onMessage(message);
  };
  
  // Merlin opens the conversation
  addAndEmit(createMerlinMessage(
    `🧙 Beginning ${phase} phase. I'll be consulting with ${agents.length} specialist${agents.length > 1 ? 's' : ''}.`,
    'greeting'
  ));
  
  await delay(500);
  
  // Each agent reports
  for (const agent of agents) {
    const info = agent.getInfo();
    
    // Merlin calls the agent
    addAndEmit(createMerlinMessage(
      `Let me bring in ${info.personality.emoji} **${agent.name}** (v${info.version}) for ${info.type} analysis.`,
      'action'
    ));
    
    await delay(300);
    
    // Agent reports
    const agentMessages = await agent.reportToMerlin(context);
    for (const message of agentMessages) {
      addAndEmit(message);
      await delay(200);
    }
    
    // Merlin acknowledges
    const lastReport = agentMessages.find(m => m.messageType === 'report');
    if (lastReport) {
      addAndEmit(createMerlinMessage(
        `Thank you, ${agent.name}. Noted.`,
        'action'
      ));
    }
    
    await delay(300);
  }
  
  // Merlin summarizes
  const summary = `Completed ${phase} phase with ${agents.length} agent${agents.length > 1 ? 's' : ''}. All reports received.`;
  addAndEmit(createMerlinMessage(
    `✅ ${summary}`,
    'completion'
  ));
  
  // End conversation
  endConversation(conversation.id, summary);
  
  return {
    conversationId: conversation.id,
    messages: allMessages,
    summary,
  };
}

/**
 * Format a message for display
 */
export function formatMessageForDisplay(message: AgentMessage): string {
  const roleIcon = message.role === 'merlin' ? '🧙' : '✨';
  const time = message.timestamp.toLocaleTimeString();
  
  return `[${time}] ${roleIcon} ${message.agentName}: ${message.content}`;
}

/**
 * Clear all conversations (for cleanup/testing)
 */
export function clearAllConversations(): void {
  activeConversations.clear();
  listeners.clear();
  console.log('[Conversation] 🗑️ Cleared all conversations');
}

// Helper function
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export conversation type
export type { ConversationType as AgentConversation };

