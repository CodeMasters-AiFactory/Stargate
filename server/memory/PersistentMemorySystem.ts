import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql, eq, and, desc } from 'drizzle-orm';
import { pgTable, text, json, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';

// Database Tables for Persistent Memory
export const agentMemory = pgTable('agent_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  sessionId: text('session_id').notNull(),
  agentId: text('agent_id').notNull(),
  conversationContext: json('conversation_context').notNull(),
  projectContext: json('project_context'),
  userPreferences: json('user_preferences'),
  workHistory: json('work_history'),
  codebase: json('codebase'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isActive: boolean('is_active').default(true),
});

export const conversationHistory = pgTable('conversation_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: text('session_id').notNull(),
  messageId: text('message_id').notNull(),
  type: text('type').notNull(), // 'user' | 'agent' | 'system'
  content: text('content').notNull(),
  metadata: json('metadata'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const projectMemory = pgTable('project_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: text('project_id').notNull(),
  userId: text('user_id').notNull(),
  projectName: text('project_name').notNull(),
  architecture: json('architecture'),
  dependencies: json('dependencies'),
  codeStructure: json('code_structure'),
  aiDecisions: json('ai_decisions'),
  userRequirements: json('user_requirements'),
  developmentPhase: text('development_phase'),
  lastWorkedOn: timestamp('last_worked_on').defaultNow(),
  isActive: boolean('is_active').default(true),
});

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').unique().notNull(),
  preferences: json('preferences'),
  codingStyle: json('coding_style'),
  communicationStyle: text('communication_style'),
  experienceLevel: text('experience_level'),
  favoriteFrameworks: json('favorite_frameworks'),
  workPatterns: json('work_patterns'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export interface AgentMemoryContext {
  sessionId: string;
  userId: string;
  agentId: string;
  conversationContext: Record<string, unknown>;
  projectContext?: Record<string, unknown>;
  userPreferences?: Record<string, unknown>;
  workHistory?: Record<string, unknown>;
  codebase?: Record<string, unknown>;
}

export interface ConversationMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface ProjectContext {
  projectId: string;
  projectName: string;
  architecture?: Record<string, unknown>;
  dependencies?: Record<string, unknown>;
  codeStructure?: Record<string, unknown>;
  aiDecisions?: Record<string, unknown>;
  userRequirements?: Record<string, unknown>;
  developmentPhase?: string;
}

export class PersistentMemorySystem {
  private db?: ReturnType<typeof drizzle>;
  private memoryCache: Map<string, AgentMemoryContext> = new Map();
  private conversationCache: Map<string, ConversationMessage[]> = new Map();
  private developmentMode: boolean = false;

  constructor() {
    if (!process.env.DATABASE_URL) {
      console.log('🧠 Database not configured, using in-memory storage for development');
      this.developmentMode = true;
      return;
    }
    
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      this.db = drizzle({ client: pool });
      console.log('🧠 Persistent memory system connected to database');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('🧠 Database connection failed, falling back to in-memory storage:', errorMessage);
      this.developmentMode = true;
    }
  }

  // Initialize or recover session memory
  async initializeSession(sessionId: string, userId: string, agentId: string): Promise<AgentMemoryContext> {
    try {
      // Check cache first
      if (this.memoryCache.has(sessionId)) {
        console.log(`🧠 Recovered agent memory from cache: ${sessionId}`);
        return this.memoryCache.get(sessionId)!;
      }

      // In development mode, use in-memory storage
      if (this.developmentMode) {
        const newContext: AgentMemoryContext = {
          sessionId,
          userId,
          agentId,
          conversationContext: {
            phase: 'greeting',
            history: [],
            userQuestions: [],
            projectType: null,
            requirements: [],
          },
        };
        
        this.memoryCache.set(sessionId, newContext);
        console.log(`🧠 Created new in-memory session: ${sessionId}`);
        return newContext;
      }

      // Try database recovery (production mode)
      if (this.db) {
        const existingMemory = await this.db
          .select()
          .from(agentMemory)
          .where(and(
            eq(agentMemory.sessionId, sessionId),
            eq(agentMemory.userId, userId),
            eq(agentMemory.agentId, agentId),
            eq(agentMemory.isActive, true)
          ))
          .limit(1);

        if (existingMemory.length > 0) {
          const memory = existingMemory[0];
          const context: AgentMemoryContext = {
            sessionId: memory.sessionId,
            userId: memory.userId,
            agentId: memory.agentId,
            conversationContext: memory.conversationContext as Record<string, unknown>,
            projectContext: (memory.projectContext as Record<string, unknown> | null) || undefined,
            userPreferences: (memory.userPreferences as Record<string, unknown> | null) || undefined,
            workHistory: (memory.workHistory as Record<string, unknown> | null) || undefined,
            codebase: (memory.codebase as Record<string, unknown> | null) || undefined,
          };

          this.memoryCache.set(sessionId, context);
          console.log(`🧠 Recovered agent memory from database: ${sessionId}`);
          return context;
        }
      }

      // Create new session
      const newContext: AgentMemoryContext = {
        sessionId,
        userId,
        agentId,
        conversationContext: {
          phase: 'greeting',
          history: [],
          userQuestions: [],
          projectType: null,
          requirements: [],
        },
      };

      await this.saveMemory(newContext);
      this.memoryCache.set(sessionId, newContext);
      console.log(`🧠 Created new agent memory for session: ${sessionId}`);
      return newContext;

    } catch (_error: unknown) {
      console.error('Failed to initialize session memory:', _error);

      // Fallback to basic in-memory context
      const fallbackContext: AgentMemoryContext = {
        sessionId,
        userId,
        agentId,
        conversationContext: {
          phase: 'greeting',
          history: [],
          userQuestions: [],
          projectType: null,
          requirements: [],
        },
      };

      this.memoryCache.set(sessionId, fallbackContext);
      console.log(`🧠 Created fallback memory context: ${sessionId}`);
      return fallbackContext;
    }
  }

  // Save current memory state
  async saveMemory(context: AgentMemoryContext): Promise<void> {
    try {
      // Always update cache
      this.memoryCache.set(context.sessionId, context);
      
      // In development mode, only use cache
      if (this.developmentMode) {
        console.log(`💾 Saved memory to cache: ${context.sessionId}`);
        return;
      }

      // Try database save in production
      if (this.db) {
        await this.db
          .insert(agentMemory)
          .values({
            sessionId: context.sessionId,
            userId: context.userId,
            agentId: context.agentId,
            conversationContext: context.conversationContext,
            projectContext: context.projectContext || null,
            userPreferences: context.userPreferences || null,
            workHistory: context.workHistory || null,
            codebase: context.codebase || null,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [agentMemory.sessionId, agentMemory.userId, agentMemory.agentId],
            set: {
              conversationContext: sql`excluded.conversation_context`,
              projectContext: sql`excluded.project_context`,
              userPreferences: sql`excluded.user_preferences`,
              workHistory: sql`excluded.work_history`,
              codebase: sql`excluded.codebase`,
              updatedAt: new Date(),
            },
          });

        console.log(`💾 Saved memory to database: ${context.sessionId}`);
      } else {
        console.log(`💾 Saved memory to cache only: ${context.sessionId}`);
      }
    } catch (_error: unknown) {
      console.error('Failed to save memory to database, keeping in cache:', _error);
      // Don't throw error - cache save still works
    }
  }

  // Add conversation message with persistence
  async addConversationMessage(sessionId: string, message: ConversationMessage): Promise<void> {
    try {
      // Update conversation cache
      if (!this.conversationCache.has(sessionId)) {
        this.conversationCache.set(sessionId, []);
      }
      const sessionMessages = this.conversationCache.get(sessionId)!;
      sessionMessages.push(message);

      // Keep only last 100 messages in cache
      if (sessionMessages.length > 100) {
        this.conversationCache.set(sessionId, sessionMessages.slice(-100));
      }

      // Update memory context cache
      const context = this.memoryCache.get(sessionId);
      if (context && context.conversationContext) {
        const history = context.conversationContext.history as ConversationMessage[] | undefined;
        if (!history) {
          context.conversationContext.history = [message];
        } else {
          history.push(message);
          // Keep only last 50 messages in context (performance)
          if (history.length > 50) {
            context.conversationContext.history = history.slice(-50);
          }
        }

        await this.saveMemory(context);
      }

      // Try database save if available
      if (!this.developmentMode && this.db) {
        await this.db
          .insert(conversationHistory)
          .values({
            sessionId,
            messageId: message.id,
            type: message.type,
            content: message.content,
            metadata: message.metadata || null,
            timestamp: message.timestamp,
          });
      }

      console.log(`💬 Added conversation message to session: ${sessionId}`);
    } catch (_error: unknown) {
      console.error('Failed to add conversation message:', _error);
      // Don't throw - message is still saved in cache
    }
  }

  // Recover full conversation history
  async getConversationHistory(sessionId: string, limit: number = 100): Promise<ConversationMessage[]> {
    try {
      // Check cache first
      if (this.conversationCache.has(sessionId)) {
        const cachedMessages = this.conversationCache.get(sessionId)!;
        return cachedMessages.slice(-limit);
      }

      // Try database if available
      if (!this.developmentMode && this.db) {
        const messages = await this.db
          .select()
          .from(conversationHistory)
          .where(eq(conversationHistory.sessionId, sessionId))
          .orderBy(desc(conversationHistory.timestamp))
          .limit(limit);

        const history = messages.map(msg => ({
          id: msg.messageId,
          type: msg.type as 'user' | 'agent' | 'system',
          content: msg.content,
          metadata: (msg.metadata as Record<string, unknown> | null) || undefined,
          timestamp: msg.timestamp!,
        })).reverse();

        // Cache the retrieved history
        this.conversationCache.set(sessionId, history);
        return history;
      }

      return [];
    } catch (_error: unknown) {
      console.error('Failed to get conversation history:', _error);
      return this.conversationCache.get(sessionId) || [];
    }
  }

  // Save project context for long-term memory
  async saveProjectMemory(projectContext: ProjectContext, userId: string): Promise<void> {
    try {
      if (!this.db) {
        console.warn('Database not available, skipping project memory save');
        return;
      }

      await this.db
        .insert(projectMemory)
        .values({
          projectId: projectContext.projectId,
          userId,
          projectName: projectContext.projectName,
          architecture: projectContext.architecture || null,
          dependencies: projectContext.dependencies || null,
          codeStructure: projectContext.codeStructure || null,
          aiDecisions: projectContext.aiDecisions || null,
          userRequirements: projectContext.userRequirements || null,
          developmentPhase: projectContext.developmentPhase || null,
          lastWorkedOn: new Date(),
        })
        .onConflictDoUpdate({
          target: [projectMemory.projectId],
          set: {
            architecture: sql`excluded.architecture`,
            dependencies: sql`excluded.dependencies`,
            codeStructure: sql`excluded.code_structure`,
            aiDecisions: sql`excluded.ai_decisions`,
            userRequirements: sql`excluded.user_requirements`,
            developmentPhase: sql`excluded.development_phase`,
            lastWorkedOn: new Date(),
          },
        });

      console.log(`📁 Saved project memory for: ${projectContext.projectId}`);
    } catch (_error: unknown) {
      console.error('Failed to save project memory:', _error);
    }
  }

  // Get project memory for context recovery
  async getProjectMemory(projectId: string, userId: string): Promise<ProjectContext | null> {
    try {
      if (!this.db) {
        console.warn('Database not available, cannot get project memory');
        return null;
      }

      const project = await this.db
        .select()
        .from(projectMemory)
        .where(and(
          eq(projectMemory.projectId, projectId),
          eq(projectMemory.userId, userId),
          eq(projectMemory.isActive, true)
        ))
        .limit(1);

      if (project.length === 0) return null;

      const p = project[0];
      return {
        projectId: p.projectId,
        projectName: p.projectName,
        architecture: (p.architecture as Record<string, unknown> | null) || undefined,
        dependencies: (p.dependencies as Record<string, unknown> | null) || undefined,
        codeStructure: (p.codeStructure as Record<string, unknown> | null) || undefined,
        aiDecisions: (p.aiDecisions as Record<string, unknown> | null) || undefined,
        userRequirements: (p.userRequirements as Record<string, unknown> | null) || undefined,
        developmentPhase: p.developmentPhase || undefined,
      };
    } catch (_error: unknown) {
      console.error('Failed to get project memory:', _error);
      return null;
    }
  }

  // Save/update user preferences and patterns
  async saveUserProfile(userId: string, profile: {
    preferences?: Record<string, unknown>;
    codingStyle?: Record<string, unknown>;
    communicationStyle?: string;
    experienceLevel?: string;
    favoriteFrameworks?: Record<string, unknown>;
    workPatterns?: Record<string, unknown>;
  }): Promise<void> {
    try {
      if (!this.db) {
        console.warn('Database not available, skipping user profile save');
        return;
      }

      await this.db
        .insert(userProfiles)
        .values({
          userId,
          ...profile,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [userProfiles.userId],
          set: {
            preferences: sql`excluded.preferences`,
            codingStyle: sql`excluded.coding_style`,
            communicationStyle: sql`excluded.communication_style`,
            experienceLevel: sql`excluded.experience_level`,
            favoriteFrameworks: sql`excluded.favorite_frameworks`,
            workPatterns: sql`excluded.work_patterns`,
            updatedAt: new Date(),
          },
        });

      console.log(`👤 Saved user profile for: ${userId}`);
    } catch (_error: unknown) {
      console.error('Failed to save user profile:', _error);
    }
  }

  // Get user profile for personalized experience
  async getUserProfile(userId: string): Promise<Record<string, unknown> | null> {
    try {
      if (!this.db) {
        console.warn('Database not available, cannot get user profile');
        return null;
      }

      const profile = await this.db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1);

      return profile.length > 0 ? profile[0] : null;
    } catch (_error: unknown) {
      console.error('Failed to get user profile:', _error);
      return null;
    }
  }

  // Update conversation context
  async updateConversationContext(sessionId: string, updates: Record<string, unknown>): Promise<void> {
    const context = this.memoryCache.get(sessionId);
    if (context) {
      context.conversationContext = {
        ...context.conversationContext,
        ...updates,
      };
      await this.saveMemory(context);
    }
  }

  // Get memory context (from cache or database)
  async getMemoryContext(sessionId: string): Promise<AgentMemoryContext | null> {
    // Try cache first
    if (this.memoryCache.has(sessionId)) {
      return this.memoryCache.get(sessionId) || null;
    }

    // Try database
    try {
      if (!this.db) {
        console.warn('Database not available, cannot get memory context');
        return null;
      }

      const memory = await this.db
        .select()
        .from(agentMemory)
        .where(and(
          eq(agentMemory.sessionId, sessionId),
          eq(agentMemory.isActive, true)
        ))
        .limit(1);

      if (memory.length > 0) {
        const m = memory[0];
        const context: AgentMemoryContext = {
          sessionId: m.sessionId,
          userId: m.userId,
          agentId: m.agentId,
          conversationContext: m.conversationContext as Record<string, unknown>,
          projectContext: (m.projectContext as Record<string, unknown> | null) || undefined,
          userPreferences: (m.userPreferences as Record<string, unknown> | null) || undefined,
          workHistory: (m.workHistory as Record<string, unknown> | null) || undefined,
          codebase: (m.codebase as Record<string, unknown> | null) || undefined,
        };

        this.memoryCache.set(sessionId, context);
        return context;
      }
    } catch (_error: unknown) {
      console.error('Failed to get memory context:', _error);
    }

    return null;
  }

  // Generate context summary for new sessions
  async generateContextSummary(userId: string, projectId?: string): Promise<string> {
    try {
      let summary = "## Previous Context Summary\n\n";

      // Get user profile
      const userProfile = await this.getUserProfile(userId);
      if (userProfile) {
        summary += `**User Profile:**\n`;
        summary += `- Experience Level: ${userProfile.experienceLevel || 'Not specified'}\n`;
        summary += `- Preferred Communication: ${userProfile.communicationStyle || 'Standard'}\n`;
        if (userProfile.favoriteFrameworks) {
          summary += `- Favorite Frameworks: ${JSON.stringify(userProfile.favoriteFrameworks)}\n`;
        }
        summary += "\n";
      }

      // Get project context if specified
      if (projectId) {
        const projectContext = await this.getProjectMemory(projectId, userId);
        if (projectContext) {
          summary += `**Current Project: ${projectContext.projectName}**\n`;
          summary += `- Development Phase: ${projectContext.developmentPhase || 'Not specified'}\n`;
          if (projectContext.userRequirements) {
            summary += `- Requirements: ${JSON.stringify(projectContext.userRequirements)}\n`;
          }
          if (projectContext.architecture) {
            summary += `- Architecture: ${JSON.stringify(projectContext.architecture)}\n`;
          }
          summary += "\n";
        }
      }

      // Get recent conversation patterns
      if (this.db) {
        const recentSessions = await this.db
          .select()
          .from(agentMemory)
          .where(and(
            eq(agentMemory.userId, userId),
            eq(agentMemory.isActive, true)
          ))
          .orderBy(desc(agentMemory.updatedAt))
          .limit(3);

        if (recentSessions.length > 0) {
          summary += `**Recent Work Patterns:**\n`;
          recentSessions.forEach((session, _index) => {
            summary += `${_index + 1}. Agent: ${session.agentId}, Last Active: ${session.updatedAt}\n`;
          });
        }
      }

      return summary;
    } catch (_error: unknown) {
      console.error('Failed to generate context summary:', _error);
      return "Previous context unavailable.";
    }
  }
}

// Export singleton instance
export const persistentMemory = new PersistentMemorySystem();