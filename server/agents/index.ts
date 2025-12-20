/**
 * Agent System - "The Council"
 * 
 * Central export for the AI Specialist Agent system
 */

// Types
export * from './types';

// Core classes
export { BaseAgent } from './BaseAgent';
export { AgentRegistry, AgentRegistryClass } from './AgentRegistry';
export { MerlinCoordinator, MerlinCoordinatorClass } from './MerlinCoordinator';

// Conversation protocol
export {
  createConversation,
  addMessage,
  createMerlinMessage,
  endConversation,
  subscribeToConversation,
  subscribeToAllConversations,
  getConversation,
  getActiveConversations,
  getProjectConversations,
  runAgentConversation,
  runMultiAgentConversation,
  formatMessageForDisplay,
  clearAllConversations,
} from './AgentConversation';

// Re-export type
export type { AgentConversation } from './AgentConversation';

// Specialists
export * from './specialists';

// Initialization
export {
  registerAllAgents,
  initializeAgentSystem,
  isAgentSystemInitialized,
  resetAgentSystem,
} from './initializeAgents';

// Learning & Research
export * from './learning/SelfImprovementEngine';
export * from './research/InternetResearchEngine';

// Approval workflow
export * from './approval/ApprovalWorkflow';

