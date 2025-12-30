/**
 * Version History Service
 * Saves snapshots at each stage and allows restoration
 */

import { logError } from '../utils/errorHandler';
import { saveVersionSnapshot as hybridSaveVersion, restoreVersion as hybridRestoreVersion, listVersions as hybridListVersions } from './hybridStorage';

export type GenerationStage = 'design' | 'content' | 'images' | 'final';

export interface WebsiteSnapshot {
  html: string;
  css: string;
  js?: string;
  pages?: Array<{ slug: string; html: string }>;
  metadata?: Record<string, unknown>;
}

/**
 * Save version snapshot
 */
export async function saveVersionSnapshot(
  websiteId: string,
  stage: GenerationStage,
  snapshot: WebsiteSnapshot,
  metadata?: Record<string, unknown>
): Promise<string> {
  try {
    // Use hybrid storage (PostgreSQL → SQLite → Memory)
    const versionId = await hybridSaveVersion(websiteId, stage, snapshot, metadata);
    console.log(`[VersionHistory] ✅ Saved version for website ${websiteId} at stage ${stage}`);
    return versionId;
  } catch (_error: unknown) {
    logError(_error, 'VersionHistory - SaveSnapshot');
    throw _error;
  }
}

/**
 * Restore version
 */
export async function restoreVersion(
  websiteId: string,
  versionId: string
): Promise<WebsiteSnapshot> {
  try {
    // Use hybrid storage (PostgreSQL → SQLite → Memory)
    const snapshot = await hybridRestoreVersion(websiteId, versionId);
    console.log(`[VersionHistory] ✅ Restored version ${versionId} for website ${websiteId}`);
    return snapshot as WebsiteSnapshot;
  } catch (_error: unknown) {
    logError(_error, 'VersionHistory - RestoreVersion');
    throw _error;
  }
}

/**
 * List all versions for a website
 */
export async function listVersions(websiteId: string): Promise<Array<{
  id: string;
  version: string;
  stage: string;
  createdAt: Date;
}>> {
  try {
    // Use hybrid storage (PostgreSQL → SQLite → Memory)
    return await hybridListVersions(websiteId);
  } catch (_error: unknown) {
    logError(_error, 'VersionHistory - ListVersions');
    return [];
  }
}

