/**
 * Version History Service
 * Saves snapshots at each stage and allows restoration
 */

import { db } from '../db';
import { websiteVersions } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { saveVersionSnapshot as hybridSaveVersion, restoreVersion as hybridRestoreVersion, listVersions as hybridListVersions } from './hybridStorage';

export type GenerationStage = 'design' | 'content' | 'images' | 'final';

export interface WebsiteSnapshot {
  html: string;
  css: string;
  js?: string;
  pages?: Array<{ slug: string; html: string }>;
  metadata?: Record<string, any>;
}

/**
 * Save version snapshot
 */
export async function saveVersionSnapshot(
  websiteId: string,
  stage: GenerationStage,
  snapshot: WebsiteSnapshot,
  metadata?: Record<string, any>
): Promise<string> {
  try {
    // Use hybrid storage (PostgreSQL → SQLite → Memory)
    const versionId = await hybridSaveVersion(websiteId, stage, snapshot, metadata);
    console.log(`[VersionHistory] ✅ Saved version for website ${websiteId} at stage ${stage}`);
    return versionId;
  } catch (error) {
    logError(error, 'VersionHistory - SaveSnapshot');
    throw error;
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
  } catch (error) {
    logError(error, 'VersionHistory - RestoreVersion');
    throw error;
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
  } catch (error) {
    logError(error, 'VersionHistory - ListVersions');
    return [];
  }
}

