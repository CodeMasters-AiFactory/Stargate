import {
  type User,
  type InsertUser,
  type WebsiteBuilderSession,
  type InsertWebsiteBuilderSession,
  type WebsiteDraft,
  type InsertWebsiteDraft,
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createSession(session: InsertWebsiteBuilderSession): Promise<WebsiteBuilderSession>;
  getSession(id: string): Promise<WebsiteBuilderSession | undefined>;
  updateSession(id: string, updates: Partial<WebsiteBuilderSession>): Promise<WebsiteBuilderSession | undefined>;
  getSessionsByUserId(userId: string): Promise<WebsiteBuilderSession[]>;

  createDraft(draft: InsertWebsiteDraft): Promise<WebsiteDraft>;
  getDraft(id: string): Promise<WebsiteDraft | undefined>;
  updateDraft(id: string, updates: Partial<WebsiteDraft>): Promise<WebsiteDraft | undefined>;
  getDraftsBySessionId(sessionId: string): Promise<WebsiteDraft[]>;
  getDraftsByUserId(userId: string): Promise<WebsiteDraft[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sessions: Map<string, WebsiteBuilderSession>;
  private drafts: Map<string, WebsiteDraft>;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.drafts = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSession(insertSession: InsertWebsiteBuilderSession): Promise<WebsiteBuilderSession> {
    const id = randomUUID();
    const now = new Date();
    const session: WebsiteBuilderSession = {
      stage: 'discover',
      requirements: {},
      messages: [],
      currentDraftId: null,
      ...insertSession,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<WebsiteBuilderSession | undefined> {
    return this.sessions.get(id);
  }

  async updateSession(id: string, updates: Partial<WebsiteBuilderSession>): Promise<WebsiteBuilderSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    const updated: WebsiteBuilderSession = {
      ...session,
      ...updates,
      updatedAt: new Date(),
    };
    this.sessions.set(id, updated);
    return updated;
  }

  async getSessionsByUserId(userId: string): Promise<WebsiteBuilderSession[]> {
    return Array.from(this.sessions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.updatedAt!.getTime() - a.updatedAt!.getTime());
  }

  async createDraft(insertDraft: InsertWebsiteDraft): Promise<WebsiteDraft> {
    const id = randomUUID();
    const now = new Date();
    const draft: WebsiteDraft = {
      description: null,
      template: null,
      requirements: {},
      code: {},
      status: 'draft',
      version: '1',
      parentDraftId: null,
      metadata: {},
      ...insertDraft,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.drafts.set(id, draft);
    return draft;
  }

  async getDraft(id: string): Promise<WebsiteDraft | undefined> {
    return this.drafts.get(id);
  }

  async updateDraft(id: string, updates: Partial<WebsiteDraft>): Promise<WebsiteDraft | undefined> {
    const draft = this.drafts.get(id);
    if (!draft) return undefined;
    const updated: WebsiteDraft = {
      ...draft,
      ...updates,
      updatedAt: new Date(),
    };
    this.drafts.set(id, updated);
    return updated;
  }

  async getDraftsBySessionId(sessionId: string): Promise<WebsiteDraft[]> {
    return Array.from(this.drafts.values())
      .filter(d => d.sessionId === sessionId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getDraftsByUserId(userId: string): Promise<WebsiteDraft[]> {
    return Array.from(this.drafts.values())
      .filter(d => d.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }
}

export const storage = new MemStorage();
