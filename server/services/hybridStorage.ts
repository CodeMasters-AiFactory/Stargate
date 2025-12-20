/**
 * Hybrid Storage Service
 * Provides database-independent storage with PostgreSQL → SQLite → In-Memory fallback
 */

import * as fs from 'fs';
import * as path from 'path';
import { db } from '../db';
import { websiteVersions, approvalRequests, templateHealthLogs } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { getErrorMessage, logError } from '../utils/errorHandler';

const STORAGE_DIR = path.join(process.cwd(), 'data', 'hybrid-storage');
const SQLITE_DB_PATH = path.join(STORAGE_DIR, 'fallback.db');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// In-memory storage fallback
const memoryStore: {
  versions: Map<string, any[]>;
  approvals: Map<string, any[]>;
  healthLogs: Map<string, any[]>;
} = {
  versions: new Map(),
  approvals: new Map(),
  healthLogs: new Map(),
};

/**
 * Initialize SQLite fallback database
 */
let sqliteDb: any = null;

/**
 * Close SQLite database connection (cleanup)
 */
export function closeSQLite(): void {
  if (sqliteDb) {
    try {
      sqliteDb.close();
      sqliteDb = null;
      console.log('[HybridStorage] ✅ SQLite connection closed');
    } catch (error) {
      console.warn('[HybridStorage] ⚠️ Error closing SQLite:', getErrorMessage(error));
    }
  }
}

async function initSQLite() {
  if (sqliteDb) return sqliteDb;

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hybridStorage.ts:36',message:'initSQLite entry',data:{sqliteDbExists:!!sqliteDb,dbPath:SQLITE_DB_PATH},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion agent log
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hybridStorage.ts:40',message:'before better-sqlite3 import',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion agent log
    const sqlite3 = await import('better-sqlite3');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hybridStorage.ts:41',message:'after better-sqlite3 import',data:{hasDefault:!!sqlite3.default,hasDatabase:!!(sqlite3 as any).Database,hasNamedExport:!!sqlite3.Database},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion agent log
    // Handle different export patterns: default export, named export, or CJS-style
    const Database = (sqlite3.default || sqlite3.Database || (sqlite3 as any).Database) as typeof import('better-sqlite3').Database;
    if (!Database || typeof Database !== 'function') {
      throw new Error('Failed to import better-sqlite3 Database class');
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hybridStorage.ts:42',message:'before Database instantiation',data:{databaseType:typeof Database},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion agent log
    sqliteDb = new Database(SQLITE_DB_PATH);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hybridStorage.ts:43',message:'after Database instantiation',data:{sqliteDbExists:!!sqliteDb},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion agent log
    
    // Create tables if they don't exist
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hybridStorage.ts:45',message:'before table creation',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion agent log
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS website_versions (
        id TEXT PRIMARY KEY,
        website_id TEXT NOT NULL,
        version TEXT NOT NULL,
        stage TEXT NOT NULL,
        snapshot TEXT NOT NULL,
        metadata TEXT,
        created_at INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS approval_requests (
        id TEXT PRIMARY KEY,
        website_id TEXT NOT NULL,
        stage TEXT NOT NULL,
        status TEXT NOT NULL,
        requested_by TEXT NOT NULL,
        reviewed_by TEXT,
        comments TEXT,
        change_requests TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS template_health_logs (
        id TEXT PRIMARY KEY,
        template_id TEXT NOT NULL,
        quality_score TEXT NOT NULL,
        checks_passed TEXT NOT NULL,
        issues TEXT NOT NULL,
        status TEXT NOT NULL,
        checked_at INTEGER NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_versions_website ON website_versions(website_id);
      CREATE INDEX IF NOT EXISTS idx_approvals_website ON approval_requests(website_id);
      CREATE INDEX IF NOT EXISTS idx_health_template ON template_health_logs(template_id);
    `);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hybridStorage.ts:81',message:'after table creation',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion agent log
    
    console.log('[HybridStorage] ✅ SQLite fallback initialized');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hybridStorage.ts:83',message:'initSQLite success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion agent log
    return sqliteDb;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hybridStorage.ts:85',message:'initSQLite error',data:{errorMessage:error instanceof Error?error.message:String(error),errorStack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion agent log
    console.warn('[HybridStorage] ⚠️ SQLite not available, using in-memory storage:', getErrorMessage(error));
    return null;
  }
}

/**
 * Sync data from fallback storage to PostgreSQL when database becomes available
 */
export async function syncToPostgreSQL() {
  if (!db) return;

  try {
    const sqlite = await initSQLite();
    if (!sqlite) return;

    // Sync versions
    const versions = sqlite.prepare('SELECT * FROM website_versions').all();
    for (const version of versions) {
      try {
        await db.insert(websiteVersions).values({
          id: version.id,
          websiteId: version.website_id,
          version: version.version,
          stage: version.stage,
          snapshot: JSON.parse(version.snapshot),
          metadata: version.metadata ? JSON.parse(version.metadata) : {},
          createdAt: new Date(version.created_at),
        }).onConflictDoNothing();
      } catch (e) {
        // Skip if already exists
      }
    }

    // Sync approvals
    const approvals = sqlite.prepare('SELECT * FROM approval_requests').all();
    for (const approval of approvals) {
      try {
        await db.insert(approvalRequests).values({
          id: approval.id,
          websiteId: approval.website_id,
          stage: approval.stage,
          status: approval.status,
          requestedBy: approval.requested_by,
          reviewedBy: approval.reviewed_by || null,
          comments: approval.comments || null,
          changeRequests: approval.change_requests ? JSON.parse(approval.change_requests) : [],
          createdAt: new Date(approval.created_at),
          updatedAt: new Date(approval.updated_at),
        }).onConflictDoNothing();
      } catch (e) {
        // Skip if already exists
      }
    }

    console.log('[HybridStorage] ✅ Synced fallback data to PostgreSQL');
  } catch (error) {
    console.warn('[HybridStorage] ⚠️ Failed to sync to PostgreSQL:', getErrorMessage(error));
  }
}

/**
 * Save version snapshot with fallback
 */
export async function saveVersionSnapshot(
  websiteId: string,
  stage: string,
  snapshot: any,
  metadata?: Record<string, any>
): Promise<string> {
  const versionId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const versionNumber = await getNextVersionNumber(websiteId);

  // Try PostgreSQL first
  if (db) {
    try {
      const [version] = await db.insert(websiteVersions).values({
        websiteId,
        stage,
        snapshot,
        version: versionNumber,
        metadata: metadata || {},
      }).returning();
      return version.id;
    } catch (error) {
      console.warn('[HybridStorage] PostgreSQL save failed, using fallback:', getErrorMessage(error));
    }
  }

  // Fallback to SQLite
  const sqlite = await initSQLite();
  if (sqlite) {
    try {
      sqlite.prepare(`
        INSERT INTO website_versions (id, website_id, version, stage, snapshot, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        versionId,
        websiteId,
        versionNumber,
        stage,
        JSON.stringify(snapshot),
        metadata ? JSON.stringify(metadata) : null,
        Date.now()
      );
      return versionId;
    } catch (error) {
      console.warn('[HybridStorage] SQLite save failed, using memory:', getErrorMessage(error));
    }
  }

  // Fallback to memory
  if (!memoryStore.versions.has(websiteId)) {
    memoryStore.versions.set(websiteId, []);
  }
  const versions = memoryStore.versions.get(websiteId)!;
  versions.push({
    id: versionId,
    websiteId,
    version: versionNumber,
    stage,
    snapshot,
    metadata,
    createdAt: new Date(),
  });
  return versionId;
}

/**
 * Get next version number
 */
async function getNextVersionNumber(websiteId: string): Promise<string> {
  const versions = await listVersions(websiteId);
  if (versions.length === 0) return '1';
  const lastVersion = parseInt(versions[0].version) || 0;
  return String(lastVersion + 1);
}

/**
 * List versions with fallback
 */
export async function listVersions(websiteId: string): Promise<Array<{
  id: string;
  version: string;
  stage: string;
  createdAt: Date;
}>> {
  // Try PostgreSQL first
  if (db) {
    try {
      const versions = await db
        .select({
          id: websiteVersions.id,
          version: websiteVersions.version,
          stage: websiteVersions.stage,
          createdAt: websiteVersions.createdAt,
        })
        .from(websiteVersions)
        .where(eq(websiteVersions.websiteId, websiteId))
        .orderBy(desc(websiteVersions.createdAt));
      return versions;
    } catch (error) {
      console.warn('[HybridStorage] PostgreSQL list failed, using fallback:', getErrorMessage(error));
    }
  }

  // Fallback to SQLite
  const sqlite = await initSQLite();
  if (sqlite) {
    try {
      const rows = sqlite.prepare(`
        SELECT id, version, stage, created_at
        FROM website_versions
        WHERE website_id = ?
        ORDER BY created_at DESC
      `).all(websiteId);
      return rows.map((r: any) => ({
        id: r.id,
        version: r.version,
        stage: r.stage,
        createdAt: new Date(r.created_at),
      }));
    } catch (error) {
      console.warn('[HybridStorage] SQLite list failed, using memory:', getErrorMessage(error));
    }
  }

  // Fallback to memory
  const versions = memoryStore.versions.get(websiteId) || [];
  return versions.map(v => ({
    id: v.id,
    version: v.version,
    stage: v.stage,
    createdAt: v.createdAt,
  }));
}

/**
 * Restore version with fallback
 */
export async function restoreVersion(websiteId: string, versionId: string): Promise<any> {
  // Try PostgreSQL first
  if (db) {
    try {
      const [version] = await db
        .select()
        .from(websiteVersions)
        .where(eq(websiteVersions.id, versionId))
        .limit(1);
      if (version && version.websiteId === websiteId) {
        return version.snapshot;
      }
    } catch (error) {
      console.warn('[HybridStorage] PostgreSQL restore failed, using fallback:', getErrorMessage(error));
    }
  }

  // Fallback to SQLite
  const sqlite = await initSQLite();
  if (sqlite) {
    try {
      const row = sqlite.prepare(`
        SELECT snapshot FROM website_versions
        WHERE id = ? AND website_id = ?
      `).get(versionId, websiteId);
      if (row) {
        return JSON.parse((row as any).snapshot);
      }
    } catch (error) {
      console.warn('[HybridStorage] SQLite restore failed, using memory:', getErrorMessage(error));
    }
  }

  // Fallback to memory
  const versions = memoryStore.versions.get(websiteId) || [];
  const version = versions.find(v => v.id === versionId);
  if (version) {
    return version.snapshot;
  }

  throw new Error(`Version not found: ${versionId}`);
}

/**
 * Save approval request with fallback
 */
export async function saveApprovalRequest(
  websiteId: string,
  stage: string,
  requestedBy: string,
  comments?: string
): Promise<string> {
  const approvalId = `a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Try PostgreSQL first
  if (db) {
    try {
      const [approval] = await db.insert(approvalRequests).values({
        websiteId,
        stage,
        status: 'pending',
        requestedBy,
        comments: comments || null,
        changeRequests: [],
      }).returning();
      return approval.id;
    } catch (error) {
      console.warn('[HybridStorage] PostgreSQL approval save failed, using fallback:', getErrorMessage(error));
    }
  }

  // Fallback to SQLite
  const sqlite = await initSQLite();
  if (sqlite) {
    try {
      sqlite.prepare(`
        INSERT INTO approval_requests (id, website_id, stage, status, requested_by, comments, change_requests, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        approvalId,
        websiteId,
        stage,
        'pending',
        requestedBy,
        comments || null,
        JSON.stringify([]),
        Date.now(),
        Date.now()
      );
      return approvalId;
    } catch (error) {
      console.warn('[HybridStorage] SQLite approval save failed, using memory:', getErrorMessage(error));
    }
  }

  // Fallback to memory
  if (!memoryStore.approvals.has(websiteId)) {
    memoryStore.approvals.set(websiteId, []);
  }
  const approvals = memoryStore.approvals.get(websiteId)!;
  approvals.push({
    id: approvalId,
    websiteId,
    stage,
    status: 'pending',
    requestedBy,
    comments,
    changeRequests: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return approvalId;
}

/**
 * Process approval with fallback
 */
export async function processApproval(
  approvalId: string,
  approved: boolean,
  reviewedBy: string,
  comments?: string,
  changeRequests?: any[]
): Promise<any> {
  const status = approved ? 'approved' : (changeRequests && changeRequests.length > 0 ? 'changes_requested' : 'rejected');

  // Try PostgreSQL first
  if (db) {
    try {
      const [approval] = await db
        .update(approvalRequests)
        .set({
          status,
          reviewedBy,
          comments: comments || null,
          changeRequests: changeRequests || [],
          updatedAt: new Date(),
        })
        .where(eq(approvalRequests.id, approvalId))
        .returning();
      return approval;
    } catch (error) {
      console.warn('[HybridStorage] PostgreSQL approval process failed, using fallback:', getErrorMessage(error));
    }
  }

  // Fallback to SQLite
  const sqlite = await initSQLite();
  if (sqlite) {
    try {
      sqlite.prepare(`
        UPDATE approval_requests
        SET status = ?, reviewed_by = ?, comments = ?, change_requests = ?, updated_at = ?
        WHERE id = ?
      `).run(
        status,
        reviewedBy,
        comments || null,
        JSON.stringify(changeRequests || []),
        Date.now(),
        approvalId
      );
      const row = sqlite.prepare('SELECT * FROM approval_requests WHERE id = ?').get(approvalId);
      return row;
    } catch (error) {
      console.warn('[HybridStorage] SQLite approval process failed, using memory:', getErrorMessage(error));
    }
  }

  // Fallback to memory
  for (const [websiteId, approvals] of memoryStore.approvals.entries()) {
    const approval = approvals.find(a => a.id === approvalId);
    if (approval) {
      approval.status = status;
      approval.reviewedBy = reviewedBy;
      approval.comments = comments;
      approval.changeRequests = changeRequests || [];
      approval.updatedAt = new Date();
      return approval;
    }
  }

  throw new Error(`Approval not found: ${approvalId}`);
}

/**
 * Get approval status with fallback
 */
export async function getApprovalStatus(websiteId: string, stage?: string): Promise<any[]> {
  // Try PostgreSQL first
  if (db) {
    try {
      let query = db
        .select()
        .from(approvalRequests)
        .where(eq(approvalRequests.websiteId, websiteId));
      if (stage) {
        query = query.where(eq(approvalRequests.stage, stage));
      }
      return await query.orderBy(approvalRequests.createdAt);
    } catch (error) {
      console.warn('[HybridStorage] PostgreSQL approval status failed, using fallback:', getErrorMessage(error));
    }
  }

  // Fallback to SQLite
  const sqlite = await initSQLite();
  if (sqlite) {
    try {
      let sql = 'SELECT * FROM approval_requests WHERE website_id = ?';
      const params: any[] = [websiteId];
      if (stage) {
        sql += ' AND stage = ?';
        params.push(stage);
      }
      sql += ' ORDER BY created_at';
      const rows = sqlite.prepare(sql).all(...params);
      return rows.map((r: any) => ({
        ...r,
        changeRequests: r.change_requests ? JSON.parse(r.change_requests) : [],
        createdAt: new Date(r.created_at),
        updatedAt: new Date(r.updated_at),
      }));
    } catch (error) {
      console.warn('[HybridStorage] SQLite approval status failed, using memory:', getErrorMessage(error));
    }
  }

  // Fallback to memory
  const approvals = memoryStore.approvals.get(websiteId) || [];
  return stage ? approvals.filter(a => a.stage === stage) : approvals;
}

/**
 * Save template health log with fallback
 */
export async function saveTemplateHealthLog(
  templateId: string,
  qualityScore: string,
  checksPassed: Record<string, boolean>,
  issues: any[],
  status: string
): Promise<void> {
  const logId = `h_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Try PostgreSQL first
  if (db) {
    try {
      await db.insert(templateHealthLogs).values({
        templateId,
        qualityScore,
        checksPassed: checksPassed as any,
        issues: issues as any,
        status,
      });
      return;
    } catch (error) {
      console.warn('[HybridStorage] PostgreSQL health log save failed, using fallback:', getErrorMessage(error));
    }
  }

  // Fallback to SQLite
  const sqlite = await initSQLite();
  if (sqlite) {
    try {
      sqlite.prepare(`
        INSERT INTO template_health_logs (id, template_id, quality_score, checks_passed, issues, status, checked_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        logId,
        templateId,
        qualityScore,
        JSON.stringify(checksPassed),
        JSON.stringify(issues),
        status,
        Date.now()
      );
      return;
    } catch (error) {
      console.warn('[HybridStorage] SQLite health log save failed, using memory:', getErrorMessage(error));
    }
  }

  // Fallback to memory
  if (!memoryStore.healthLogs.has(templateId)) {
    memoryStore.healthLogs.set(templateId, []);
  }
  memoryStore.healthLogs.get(templateId)!.push({
    id: logId,
    templateId,
    qualityScore,
    checksPassed,
    issues,
    status,
    checkedAt: new Date(),
  });
}

/**
 * Get template health logs with fallback
 */
export async function getTemplateHealthLogs(templateId: string, limit: number = 1): Promise<any[]> {
  // Try PostgreSQL first
  if (db) {
    try {
      return await db
        .select()
        .from(templateHealthLogs)
        .where(eq(templateHealthLogs.templateId, templateId))
        .orderBy(desc(templateHealthLogs.checkedAt))
        .limit(limit);
    } catch (error) {
      console.warn('[HybridStorage] PostgreSQL health logs failed, using fallback:', getErrorMessage(error));
    }
  }

  // Fallback to SQLite
  const sqlite = await initSQLite();
  if (sqlite) {
    try {
      const rows = sqlite.prepare(`
        SELECT * FROM template_health_logs
        WHERE template_id = ?
        ORDER BY checked_at DESC
        LIMIT ?
      `).all(templateId, limit);
      return rows.map((r: any) => ({
        ...r,
        checksPassed: JSON.parse(r.checks_passed),
        issues: JSON.parse(r.issues),
        checkedAt: new Date(r.checked_at),
      }));
    } catch (error) {
      console.warn('[HybridStorage] SQLite health logs failed, using memory:', getErrorMessage(error));
    }
  }

  // Fallback to memory
  const logs = memoryStore.healthLogs.get(templateId) || [];
  return logs.slice(0, limit);
}

