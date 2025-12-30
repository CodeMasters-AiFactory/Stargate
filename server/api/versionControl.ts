/**
 * Version Control API Routes
 * Git-like version control for website designs
 */

import type { Express, Request, Response } from 'express';
import { Router } from 'express';
import {
  createSnapshot,
  getProjectSnapshots,
  getSnapshot,
  compareSnapshots,
  rollback,
  getVersionTimeline,
  getProjectBranches,
  createBranch,
  mergeBranches,
  configureAutoSave,
  getAutoSaveConfig,
  cleanupAutoSaves,
  type DesignSnapshot,
} from '../services/designVersionControl';

const router = Router();

/**
 * Create a new snapshot
 */
router.post('/snapshot', (req: Request, res: Response): void => {
  try {
    const { projectId, data, message, author, branch, tags, isAutoSave } = req.body;

    if (!projectId || !data || !message) {
      res.status(400).json({
        error: 'Missing required fields: projectId, data, message'
      });
      return;
    }

    const snapshot = createSnapshot(projectId, data, {
      message,
      author: author || 'anonymous',
      branch,
      tags,
      isAutoSave,
    });

    res.json({
      success: true,
      snapshot,
    });
  } catch (_error) {
    console.error('[Version Control API] Snapshot error:', _error);
    res.status(500).json({ error: 'Failed to create snapshot' });
  }
});

/**
 * Get project snapshots
 */
router.get('/project/:projectId', (req: Request, res: Response): void => {
  try {
    const { projectId } = req.params;
    const { branch, limit, includeAutoSaves } = req.query;

    const snapshots = getProjectSnapshots(projectId, {
      branch: branch as string,
      limit: limit ? parseInt(limit as string) : undefined,
      includeAutoSaves: includeAutoSaves === 'true',
    });

    res.json({
      success: true,
      snapshots,
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to get snapshots' });
  }
});

/**
 * Get specific snapshot
 */
router.get('/snapshot/:snapshotId', (req: Request, res: Response): void => {
  try {
    const { snapshotId } = req.params;
    const snapshot = getSnapshot(snapshotId);

    if (!snapshot) {
      res.status(404).json({ error: 'Snapshot not found' });
      return;
    }

    res.json({
      success: true,
      snapshot,
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to get snapshot' });
  }
});

/**
 * Compare two snapshots
 */
router.get('/diff/:snapshotA/:snapshotB', (req: Request, res: Response): void => {
  try {
    const { snapshotA, snapshotB } = req.params;
    const diff = compareSnapshots(snapshotA, snapshotB);

    if (!diff) {
      res.status(404).json({ error: 'One or both snapshots not found' });
      return;
    }

    res.json({
      success: true,
      diff,
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to compare snapshots' });
  }
});

/**
 * Rollback to a snapshot
 */
router.post('/rollback', (req: Request, res: Response): void => {
  try {
    const { projectId, snapshotId, author, message } = req.body;

    if (!projectId || !snapshotId) {
      res.status(400).json({
        error: 'Missing required fields: projectId, snapshotId'
      });
      return;
    }

    const snapshot = rollback(projectId, snapshotId, author || 'anonymous', message);

    if (!snapshot) {
      res.status(404).json({ error: 'Snapshot not found' });
      return;
    }

    res.json({
      success: true,
      snapshot,
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to rollback' });
  }
});

/**
 * Get version timeline
 */
router.get('/project/:projectId/timeline', (req: Request, res: Response): void => {
  try {
    const { projectId } = req.params;
    const timeline = getVersionTimeline(projectId);

    res.json({
      success: true,
      timeline,
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to get timeline' });
  }
});

/**
 * Get project branches
 */
router.get('/project/:projectId/branches', (req: Request, res: Response): void => {
  try {
    const { projectId } = req.params;
    const branches = getProjectBranches(projectId);

    res.json({
      success: true,
      branches,
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to get branches' });
  }
});

/**
 * Create a new branch
 */
router.post('/branch', (req: Request, res: Response): void => {
  try {
    const { projectId, name, author, fromSnapshotId } = req.body;

    if (!projectId || !name) {
      res.status(400).json({
        error: 'Missing required fields: projectId, name'
      });
      return;
    }

    const branch = createBranch(projectId, name, author || 'anonymous', false, fromSnapshotId);

    res.json({
      success: true,
      branch,
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to create branch' });
  }
});

/**
 * Merge branches
 */
router.post('/merge', (req: Request, res: Response): void => {
  try {
    const { projectId, sourceBranch, targetBranch, author, message } = req.body;

    if (!projectId || !sourceBranch || !targetBranch) {
      res.status(400).json({
        error: 'Missing required fields: projectId, sourceBranch, targetBranch'
      });
      return;
    }

    const snapshot = mergeBranches(projectId, sourceBranch, targetBranch, author || 'anonymous', message);

    if (!snapshot) {
      res.status(404).json({ error: 'Branch not found' });
      return;
    }

    res.json({
      success: true,
      snapshot,
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to merge branches' });
  }
});

/**
 * Configure auto-save
 */
router.post('/autosave/config', (req: Request, res: Response): void => {
  try {
    const { projectId, enabled, intervalMs, maxAutoSaves } = req.body;

    if (!projectId) {
      res.status(400).json({ error: 'Missing projectId' });
      return;
    }

    const config = configureAutoSave(projectId, { enabled, intervalMs, maxAutoSaves });

    res.json({
      success: true,
      config,
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to configure auto-save' });
  }
});

/**
 * Get auto-save config
 */
router.get('/autosave/config/:projectId', (req: Request, res: Response): void => {
  try {
    const { projectId } = req.params;
    const config = getAutoSaveConfig(projectId);

    res.json({
      success: true,
      config,
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to get auto-save config' });
  }
});

/**
 * Cleanup old auto-saves
 */
router.post('/autosave/cleanup', (req: Request, res: Response): void => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      res.status(400).json({ error: 'Missing projectId' });
      return;
    }

    const deletedCount = cleanupAutoSaves(projectId);

    res.json({
      success: true,
      deletedCount,
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to cleanup auto-saves' });
  }
});

export default router;
