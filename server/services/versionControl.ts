/**
 * Design Version Control - 120% Feature
 * 
 * Git-like version control for website designs.
 * Features:
 * - Save design snapshots
 * - Branch designs for experiments
 * - Visual diff between versions
 * - Rollback to any version
 * - Merge design branches
 * - Compare versions side by side
 */

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface DesignVersion {
  id: string;
  projectId: string;
  branchId: string;
  parentId: string | null;
  message: string;
  author: string;
  timestamp: Date;
  hash: string;
  snapshot: DesignSnapshot;
  metadata: {
    fileCount: number;
    totalSize: number;
    changedFiles: string[];
  };
}

export interface DesignSnapshot {
  html: Record<string, string>;
  css: string;
  js?: string;
  assets: Record<string, string>;
  config: Record<string, unknown>;
}

export interface DesignBranch {
  id: string;
  projectId: string;
  name: string;
  headVersionId: string;
  createdAt: Date;
  createdBy: string;
  description?: string;
  isDefault: boolean;
}

export interface VersionDiff {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  path: string;
  oldContent?: string;
  newContent?: string;
  changes?: LineChange[];
}

export interface LineChange {
  type: 'add' | 'remove' | 'context';
  lineNumber: number;
  content: string;
}

export interface MergeResult {
  success: boolean;
  conflicts?: MergeConflict[];
  mergedSnapshot?: DesignSnapshot;
}

export interface MergeConflict {
  path: string;
  ours: string;
  theirs: string;
  ancestor?: string;
}

// In-memory storage (in production, use database)
const versions = new Map<string, DesignVersion>();
const branches = new Map<string, DesignBranch>();
const projectVersions = new Map<string, string[]>(); // projectId -> versionIds

/**
 * Calculate hash for snapshot
 */
function calculateHash(snapshot: DesignSnapshot): string {
  const content = JSON.stringify(snapshot);
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 12);
}

/**
 * Create a new version (commit)
 */
export function createVersion(
  projectId: string,
  branchId: string,
  snapshot: DesignSnapshot,
  message: string,
  author: string
): DesignVersion {
  const branch = branches.get(branchId);
  const parentId = branch?.headVersionId || null;
  const parentVersion = parentId ? versions.get(parentId) : null;
  
  // Calculate changed files
  const changedFiles: string[] = [];
  if (parentVersion) {
    // Compare HTML files
    for (const [path, content] of Object.entries(snapshot.html)) {
      if (parentVersion.snapshot.html[path] !== content) {
        changedFiles.push(path);
      }
    }
    // Check for deleted files
    for (const path of Object.keys(parentVersion.snapshot.html)) {
      if (!snapshot.html[path]) {
        changedFiles.push(path);
      }
    }
    // Check CSS
    if (parentVersion.snapshot.css !== snapshot.css) {
      changedFiles.push('styles.css');
    }
    // Check JS
    if (parentVersion.snapshot.js !== snapshot.js) {
      changedFiles.push('script.js');
    }
  } else {
    changedFiles.push(...Object.keys(snapshot.html), 'styles.css');
    if (snapshot.js) changedFiles.push('script.js');
  }
  
  const version: DesignVersion = {
    id: uuidv4(),
    projectId,
    branchId,
    parentId,
    message,
    author,
    timestamp: new Date(),
    hash: calculateHash(snapshot),
    snapshot,
    metadata: {
      fileCount: Object.keys(snapshot.html).length + 1 + (snapshot.js ? 1 : 0),
      totalSize: JSON.stringify(snapshot).length,
      changedFiles,
    },
  };
  
  versions.set(version.id, version);
  
  // Update project versions
  const projectVers = projectVersions.get(projectId) || [];
  projectVers.push(version.id);
  projectVersions.set(projectId, projectVers);
  
  // Update branch head
  if (branch) {
    branch.headVersionId = version.id;
    branches.set(branchId, branch);
  }
  
  console.log(`[VersionControl] Created version ${version.hash} on branch ${branchId}`);
  
  return version;
}

/**
 * Create a new branch
 */
export function createBranch(
  projectId: string,
  name: string,
  fromVersionId: string | null,
  createdBy: string,
  description?: string
): DesignBranch {
  const branch: DesignBranch = {
    id: uuidv4(),
    projectId,
    name,
    headVersionId: fromVersionId || '',
    createdAt: new Date(),
    createdBy,
    description,
    isDefault: branches.size === 0, // First branch is default
  };
  
  branches.set(branch.id, branch);
  
  console.log(`[VersionControl] Created branch "${name}" for project ${projectId}`);
  
  return branch;
}

/**
 * Get version by ID
 */
export function getVersion(versionId: string): DesignVersion | null {
  return versions.get(versionId) || null;
}

/**
 * Get all versions for a project
 */
export function getProjectVersions(projectId: string): DesignVersion[] {
  const versionIds = projectVersions.get(projectId) || [];
  return versionIds
    .map(id => versions.get(id))
    .filter((v): v is DesignVersion => v !== undefined)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Get all branches for a project
 */
export function getProjectBranches(projectId: string): DesignBranch[] {
  return Array.from(branches.values())
    .filter(b => b.projectId === projectId);
}

/**
 * Get version history (parent chain)
 */
export function getVersionHistory(versionId: string, limit = 50): DesignVersion[] {
  const history: DesignVersion[] = [];
  let currentId: string | null = versionId;
  
  while (currentId && history.length < limit) {
    const version = versions.get(currentId);
    if (!version) break;
    history.push(version);
    currentId = version.parentId;
  }
  
  return history;
}

/**
 * Compare two versions and generate diff
 */
export function diffVersions(versionId1: string, versionId2: string): VersionDiff[] {
  const v1 = versions.get(versionId1);
  const v2 = versions.get(versionId2);
  
  if (!v1 || !v2) {
    throw new Error('Version not found');
  }
  
  const diffs: VersionDiff[] = [];
  
  // Compare HTML files
  const allHtmlPaths = new Set([
    ...Object.keys(v1.snapshot.html),
    ...Object.keys(v2.snapshot.html),
  ]);
  
  for (const path of allHtmlPaths) {
    const content1 = v1.snapshot.html[path];
    const content2 = v2.snapshot.html[path];
    
    if (!content1) {
      diffs.push({
        type: 'added',
        path,
        newContent: content2,
      });
    } else if (!content2) {
      diffs.push({
        type: 'removed',
        path,
        oldContent: content1,
      });
    } else if (content1 !== content2) {
      diffs.push({
        type: 'modified',
        path,
        oldContent: content1,
        newContent: content2,
        changes: generateLineChanges(content1, content2),
      });
    } else {
      diffs.push({
        type: 'unchanged',
        path,
      });
    }
  }
  
  // Compare CSS
  if (v1.snapshot.css !== v2.snapshot.css) {
    diffs.push({
      type: 'modified',
      path: 'styles.css',
      oldContent: v1.snapshot.css,
      newContent: v2.snapshot.css,
      changes: generateLineChanges(v1.snapshot.css, v2.snapshot.css),
    });
  }
  
  // Compare JS
  if (v1.snapshot.js !== v2.snapshot.js) {
    if (!v1.snapshot.js) {
      diffs.push({
        type: 'added',
        path: 'script.js',
        newContent: v2.snapshot.js,
      });
    } else if (!v2.snapshot.js) {
      diffs.push({
        type: 'removed',
        path: 'script.js',
        oldContent: v1.snapshot.js,
      });
    } else {
      diffs.push({
        type: 'modified',
        path: 'script.js',
        oldContent: v1.snapshot.js,
        newContent: v2.snapshot.js,
        changes: generateLineChanges(v1.snapshot.js, v2.snapshot.js),
      });
    }
  }
  
  return diffs;
}

/**
 * Generate line-by-line changes
 */
function generateLineChanges(oldContent: string, newContent: string): LineChange[] {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const changes: LineChange[] = [];
  
  // Simple diff algorithm (in production, use proper diff library)
  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);
  
  let oldIndex = 0;
  let newIndex = 0;
  
  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex];
    const newLine = newLines[newIndex];
    
    if (oldLine === newLine) {
      changes.push({
        type: 'context',
        lineNumber: newIndex + 1,
        content: newLine || '',
      });
      oldIndex++;
      newIndex++;
    } else if (!newSet.has(oldLine)) {
      changes.push({
        type: 'remove',
        lineNumber: oldIndex + 1,
        content: oldLine || '',
      });
      oldIndex++;
    } else if (!oldSet.has(newLine)) {
      changes.push({
        type: 'add',
        lineNumber: newIndex + 1,
        content: newLine || '',
      });
      newIndex++;
    } else {
      // Both lines exist elsewhere, treat as change
      changes.push({
        type: 'remove',
        lineNumber: oldIndex + 1,
        content: oldLine || '',
      });
      changes.push({
        type: 'add',
        lineNumber: newIndex + 1,
        content: newLine || '',
      });
      oldIndex++;
      newIndex++;
    }
  }
  
  return changes;
}

/**
 * Rollback to a specific version
 */
export function rollback(
  projectId: string,
  branchId: string,
  targetVersionId: string,
  author: string
): DesignVersion {
  const targetVersion = versions.get(targetVersionId);
  if (!targetVersion) {
    throw new Error('Target version not found');
  }
  
  // Create a new version with the old snapshot
  return createVersion(
    projectId,
    branchId,
    targetVersion.snapshot,
    `Rollback to ${targetVersion.hash}`,
    author
  );
}

/**
 * Merge two branches
 */
export function mergeBranches(
  sourceBranchId: string,
  targetBranchId: string,
  author: string
): MergeResult {
  const sourceBranch = branches.get(sourceBranchId);
  const targetBranch = branches.get(targetBranchId);
  
  if (!sourceBranch || !targetBranch) {
    throw new Error('Branch not found');
  }
  
  const sourceVersion = versions.get(sourceBranch.headVersionId);
  const targetVersion = versions.get(targetBranch.headVersionId);
  
  if (!sourceVersion || !targetVersion) {
    throw new Error('Head version not found');
  }
  
  const conflicts: MergeConflict[] = [];
  const mergedHtml: Record<string, string> = { ...targetVersion.snapshot.html };
  
  // Check for conflicts in HTML files
  for (const [path, sourceContent] of Object.entries(sourceVersion.snapshot.html)) {
    const targetContent = targetVersion.snapshot.html[path];
    
    if (!targetContent) {
      // File only in source, add it
      mergedHtml[path] = sourceContent;
    } else if (sourceContent !== targetContent) {
      // Conflict!
      conflicts.push({
        path,
        ours: targetContent,
        theirs: sourceContent,
      });
    }
    // If same, keep target version
  }
  
  if (conflicts.length > 0) {
    return {
      success: false,
      conflicts,
    };
  }
  
  // No conflicts, create merged snapshot
  const mergedSnapshot: DesignSnapshot = {
    html: mergedHtml,
    css: sourceVersion.snapshot.css, // Prefer source CSS
    js: sourceVersion.snapshot.js || targetVersion.snapshot.js,
    assets: { ...targetVersion.snapshot.assets, ...sourceVersion.snapshot.assets },
    config: { ...targetVersion.snapshot.config, ...sourceVersion.snapshot.config },
  };
  
  // Create merge commit
  createVersion(
    targetBranch.projectId,
    targetBranchId,
    mergedSnapshot,
    `Merge branch '${sourceBranch.name}' into '${targetBranch.name}'`,
    author
  );
  
  return {
    success: true,
    mergedSnapshot,
  };
}

/**
 * Get visual preview of a version
 */
export function getVersionPreview(versionId: string): string | null {
  const version = versions.get(versionId);
  if (!version) return null;
  
  // Return the main HTML file
  const mainHtml = version.snapshot.html['index.html'] || 
                   Object.values(version.snapshot.html)[0];
  
  if (!mainHtml) return null;
  
  // Inject CSS inline for preview
  const previewHtml = mainHtml.replace(
    '</head>',
    `<style>${version.snapshot.css}</style></head>`
  );
  
  return previewHtml;
}

/**
 * Export version history as JSON
 */
export function exportVersionHistory(projectId: string): string {
  const projectVers = getProjectVersions(projectId);
  const projectBranches = getProjectBranches(projectId);
  
  return JSON.stringify({
    projectId,
    branches: projectBranches,
    versions: projectVers.map(v => ({
      id: v.id,
      hash: v.hash,
      message: v.message,
      author: v.author,
      timestamp: v.timestamp,
      parentId: v.parentId,
      branchId: v.branchId,
      metadata: v.metadata,
    })),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

console.log('[Version Control] 📚 Design version control system loaded');

