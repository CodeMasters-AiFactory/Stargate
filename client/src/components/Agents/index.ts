/**
 * Agent Components Index
 * Export all agent-related UI components
 */

// Types
export * from './types';

// Components
export { AgentAvatar } from './AgentAvatar';
export { AgentMessage, AgentTypingIndicator } from './AgentMessage';
export { 
  AgentConversationPanel, 
  AgentConversationCompact,
  default as AgentConversationPanelDefault 
} from './AgentConversationPanel';
export { 
  MerlinApprovalDialog, 
  UpgradePendingBadge 
} from './MerlinApprovalDialog';

