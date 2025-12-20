import type { PackageId, PackageConstraints, ChecklistState } from './websiteBuilder';

export interface ChatbotContext {
  currentStage?: string;
  selectedPackage?: PackageId;
  packageConstraints?: PackageConstraints;
  checklistState?: ChecklistState;
  requirements?: Record<string, unknown>;
  conversationHistory?: ChatbotMessage[];
}

export interface ChatbotMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

