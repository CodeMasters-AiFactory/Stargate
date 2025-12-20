import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  uuid,
  boolean
} from "drizzle-orm/pg-core";

// Agent Memory Tables for Persistent AI Context

export const agentMemory = pgTable('agent_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  agentId: varchar('agent_id', { length: 255 }).notNull(),
  conversationContext: jsonb('conversation_context').notNull(),
  projectContext: jsonb('project_context'),
  userPreferences: jsonb('user_preferences'),
  workHistory: jsonb('work_history'),
  codebase: jsonb('codebase'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isActive: boolean('is_active').default(true),
}, (table) => [
  index('idx_agent_memory_session').on(table.sessionId),
  index('idx_agent_memory_user').on(table.userId),
  index('idx_agent_memory_agent').on(table.agentId),
  index('idx_agent_memory_active').on(table.isActive),
]);

export const conversationHistory = pgTable('conversation_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  messageId: varchar('message_id', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'user' | 'agent' | 'system'
  content: varchar('content', { length: 10000 }).notNull(),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp').defaultNow(),
}, (table) => [
  index('idx_conversation_session').on(table.sessionId),
  index('idx_conversation_timestamp').on(table.timestamp),
]);

export const projectMemory = pgTable('project_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  projectName: varchar('project_name', { length: 500 }).notNull(),
  architecture: jsonb('architecture'),
  dependencies: jsonb('dependencies'),
  codeStructure: jsonb('code_structure'),
  aiDecisions: jsonb('ai_decisions'),
  userRequirements: jsonb('user_requirements'),
  developmentPhase: varchar('development_phase', { length: 100 }),
  lastWorkedOn: timestamp('last_worked_on').defaultNow(),
  isActive: boolean('is_active').default(true),
}, (table) => [
  index('idx_project_memory_project').on(table.projectId),
  index('idx_project_memory_user').on(table.userId),
  index('idx_project_memory_active').on(table.isActive),
]);

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).unique().notNull(),
  preferences: jsonb('preferences'),
  codingStyle: jsonb('coding_style'),
  communicationStyle: varchar('communication_style', { length: 100 }),
  experienceLevel: varchar('experience_level', { length: 100 }),
  favoriteFrameworks: jsonb('favorite_frameworks'),
  workPatterns: jsonb('work_patterns'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_user_profiles_user').on(table.userId),
]);

// Type exports for TypeScript
export type AgentMemory = typeof agentMemory.$inferSelect;
export type InsertAgentMemory = typeof agentMemory.$inferInsert;

export type ConversationHistory = typeof conversationHistory.$inferSelect;
export type InsertConversationHistory = typeof conversationHistory.$inferInsert;

export type ProjectMemory = typeof projectMemory.$inferSelect;
export type InsertProjectMemory = typeof projectMemory.$inferInsert;

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;