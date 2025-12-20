/**
 * Version Control API Routes
 * Git-like version control for website designs
 */

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
router.post('/snapshot', (req, res) => {
  try {
    const { projectId, data, message, author, branch, tags, isAutoSave } = req.body;
    
    if (!projectId || !data || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId, data, message' 
      });
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
  } catch (error) {
    console.error('[Version Control API] Snapshot error:', error);
    res.status(500).json({ error: 'Failed to create snapshot' });
  }
});

/**
 * Get project snapshots
 */
router.get('/project/:projectId', (req, res) => {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to get snapshots' });
  }
});

/**
 * Get specific snapshot
 */
router.get('/snapshot/:snapshotId', (req, res) => {
  try {
    const { snapshotId } = req.params;
    const snapshot = getSnapshot(snapshotId);

    if (!snapshot) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }

    res.json({
      success: true,
      snapshot,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get snapshot' });
  }
});

/**
 * Compare two snapshots
 */
router.get('/diff/:snapshotA/:snapshotB', (req, res) => {
  try {
    const { snapshotA, snapshotB } = req.params;
    const diff = compareSnapshots(snapshotA, snapshotB);

    if (!diff) {
      return res.status(404).json({ error: 'One or both snapshots not found' });
    }

    res.json({
      success: true,
      diff,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compare snapshots' });
  }
});

/**
 * Rollback to a snapshot
 */
router.post('/rollback', (req, res) => {
  try {
    const { projectId, snapshotId, author, message } = req.body;
    
    if (!projectId || !snapshotId) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId, snapshotId' 
      });
    }

    const snapshot = rollback(projectId, snapshotId, author || 'anonymous', message);

    if (!snapshot) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }

    res.json({
      success: true,
      snapshot,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rollback' });
  }
});

/**
 * Get version timeline
 */
router.get('/project/:projectId/timeline', (req, res) => {
  try {
    const { projectId } = req.params;
    const timeline = getVersionTimeline(projectId);

    res.json({
      success: true,
      timeline,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get timeline' });
  }
});

/**
 * Get project branches
 */
router.get('/project/:projectId/branches', (req, res) => {
  try {
    const { projectId } = req.params;
    const branches = getProjectBranches(projectId);

    res.json({
      success: true,
      branches,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get branches' });
  }
});

/**
 * Create a new branch
 */
router.post('/branch', (req, res) => {
  try {
    const { projectId, name, author, fromSnapshotId } = req.body;
    
    if (!projectId || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId, name' 
      });
    }

    const branch = createBranch(projectId, name, author || 'anonymous', false, fromSnapshotId);

    res.json({
      success: true,
      branch,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create branch' });
  }
});

/**
 * Merge branches
 */
router.post('/merge', (req, res) => {
  try {
    const { projectId, sourceBranch, targetBranch, author, message } = req.body;
    
    if (!projectId || !sourceBranch || !targetBranch) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId, sourceBranch, targetBranch' 
      });
    }

    const snapshot = mergeBranches(projectId, sourceBranch, targetBranch, author || 'anonymous', message);

    if (!snapshot) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    res.json({
      success: true,
      snapshot,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to merge branches' });
  }
});

/**
 * Configure auto-save
 */
router.post('/autosave/config', (req, res) => {
  try {
    const { projectId, enabled, intervalMs, maxAutoSaves } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Missing projectId' });
    }

    const config = configureAutoSave(projectId, { enabled, intervalMs, maxAutoSaves });

    res.json({
      success: true,
      config,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to configure auto-save' });
  }
});

/**
 * Get auto-save config
 */
router.get('/autosave/config/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const config = getAutoSaveConfig(projectId);

    res.json({
      success: true,
      config,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get auto-save config' });
  }
});

/**
 * Cleanup old auto-saves
 */
router.post('/autosave/cleanup', (req, res) => {
  try {
    const { projectId } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Missing projectId' });
    }

    const deletedCount = cleanupAutoSaves(projectId);

    res.json({
      success: true,
      deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cleanup auto-saves' });
  }
});

export default router;
