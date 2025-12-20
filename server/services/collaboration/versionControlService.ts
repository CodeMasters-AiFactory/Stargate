/**
 * Version Control Service
 * Phase 3.4: Collaboration Features - Project version history
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ProjectVersion {
  id: string;
  projectId: string;
  version: number;
  name?: string;
  description?: string;
  changes: {
    files: string[];
    added: string[];
    modified: string[];
    deleted: string[];
  };
  createdBy: string;
  createdAt: Date;
  snapshot?: Record<string, any>; // Project files snapshot
}

/**
 * Get version control directory
 */
function getVersionControlDir(projectId: string): string {
  const projectDir = path.join(process.cwd(), 'website_projects', projectId);
  const versionDir = path.join(projectDir, 'versions');
  
  if (!fs.existsSync(versionDir)) {
    fs.mkdirSync(versionDir, { recursive: true });
  }
  
  return versionDir;
}

/**
 * Create a new version
 */
export async function createVersion(
  projectId: string,
  changes: ProjectVersion['changes'],
  createdBy: string,
  name?: string,
  description?: string,
  snapshot?: Record<string, any>
): Promise<ProjectVersion> {
  const versionDir = getVersionControlDir(projectId);
  const versionsPath = path.join(versionDir, 'versions.json');
  
  // Load existing versions
  let versions: ProjectVersion[] = [];
  if (fs.existsSync(versionsPath)) {
    try {
      const content = fs.readFileSync(versionsPath, 'utf-8');
      versions = JSON.parse(content);
    } catch (error) {
      console.error(`[Version Control] Failed to load versions:`, error);
    }
  }
  
  // Get next version number
  const versionNumber = versions.length > 0 
    ? Math.max(...versions.map(v => v.version)) + 1 
    : 1;
  
  const version: ProjectVersion = {
    id: `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    version: versionNumber,
    name,
    description,
    changes,
    createdBy,
    createdAt: new Date(),
    snapshot,
  };
  
  versions.push(version);
  fs.writeFileSync(versionsPath, JSON.stringify(versions, null, 2), 'utf-8');
  
  return version;
}

/**
 * Get all versions for a project
 */
export async function getVersions(projectId: string): Promise<ProjectVersion[]> {
  const versionDir = getVersionControlDir(projectId);
  const versionsPath = path.join(versionDir, 'versions.json');
  
  if (!fs.existsSync(versionsPath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(versionsPath, 'utf-8');
    const versions: ProjectVersion[] = JSON.parse(content);
    return versions.map(v => ({
      ...v,
      createdAt: new Date(v.createdAt),
    })).sort((a, b) => b.version - a.version);
  } catch (error) {
    console.error(`[Version Control] Failed to load versions:`, error);
    return [];
  }
}

/**
 * Get a specific version
 */
export async function getVersion(projectId: string, versionId: string): Promise<ProjectVersion | null> {
  const versions = await getVersions(projectId);
  return versions.find(v => v.id === versionId) || null;
}

/**
 * Compare two versions
 */
export async function compareVersions(
  projectId: string,
  versionId1: string,
  versionId2: string
): Promise<{
  added: string[];
  modified: string[];
  deleted: string[];
  totalChanges: number;
}> {
  const version1 = await getVersion(projectId, versionId1);
  const version2 = await getVersion(projectId, versionId2);
  
  if (!version1 || !version2) {
    throw new Error('One or both versions not found');
  }
  
  const files1 = new Set(version1.changes.files);
  const files2 = new Set(version2.changes.files);
  
  const added = Array.from(files2).filter(f => !files1.has(f));
  const deleted = Array.from(files1).filter(f => !files2.has(f));
  const modified = Array.from(files1)
    .filter(f => files2.has(f))
    .filter(f => {
      // Compare file contents if snapshots exist
      if (version1.snapshot && version2.snapshot) {
        const content1 = version1.snapshot[f];
        const content2 = version2.snapshot[f];
        return JSON.stringify(content1) !== JSON.stringify(content2);
      }
      return version1.changes.modified.includes(f) || version2.changes.modified.includes(f);
    });
  
  return {
    added,
    modified,
    deleted,
    totalChanges: added.length + modified.length + deleted.length,
  };
}

/**
 * Rollback to a version
 */
export async function rollbackToVersion(
  projectId: string,
  versionId: string,
  rolledBackBy: string
): Promise<ProjectVersion> {
  const version = await getVersion(projectId, versionId);
  if (!version) {
    throw new Error('Version not found');
  }
  
  // Create a new version representing the rollback
  const rollbackVersion = await createVersion(
    projectId,
    {
      files: Object.keys(version.snapshot || {}),
      added: [],
      modified: version.changes.files,
      deleted: [],
    },
    rolledBackBy,
    `Rollback to version ${version.version}`,
    `Rolled back from version ${version.version}: ${version.description || ''}`,
    version.snapshot
  );
  
  return rollbackVersion;
}

