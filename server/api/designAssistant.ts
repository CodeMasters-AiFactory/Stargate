/**
 * AI Design Assistant API Routes
 * Real-time design suggestions and recommendations
 */

import type { Request, Response } from 'express';
import { Router } from 'express';
import {
  analyzeDesign,
  getAIDesignRecommendations,
  autoFixAccessibility,
  generateColorHarmonies,
  getTypographyPairings,
  calculateDesignScore,
  type DesignContext
} from '../services/aiDesignAssistant';
import {
  generateAccessibilityReport,
  autoFixAccessibilityIssues,
  getWCAGGuidelines,
  type AccessibilityReport
} from '../services/accessibilityChecker';
import {
  createSnapshot,
  getProjectSnapshots,
  getSnapshot,
  compareSnapshots,
  rollback,
  getVersionTimeline,
  getProjectBranches,
  type DesignSnapshot
} from '../services/designVersionControl';

const router = Router();

/**
 * Analyze current design and get suggestions
 */
router.post('/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const context: DesignContext = req.body;

    if (!context.industry || !context.businessName) {
      res.status(400).json({
        error: 'Missing required fields: industry, businessName'
      });
      return;
    }

    const suggestions = await analyzeDesign(context);
    const score = calculateDesignScore(context);

    res.json({
      success: true,
      suggestions,
      score,
    });
  } catch (error) {
    console.error('[Design Assistant API] Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze design',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get AI-powered design recommendations
 */
router.post('/recommendations', async (req: Request, res: Response): Promise<void> => {
  try {
    const context: DesignContext = req.body;
    
    const recommendations = await getAIDesignRecommendations(context);

    res.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error('[Design Assistant API] Recommendations error:', error);
    res.status(500).json({ 
      error: 'Failed to get recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get color harmonies
 */
router.get('/colors/harmonies', (req: Request, res: Response): void => {
  try {
    const baseColor = req.query.baseColor as string || '#3B82F6';
    const harmonies = generateColorHarmonies(baseColor);

    res.json({
      success: true,
      harmonies,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate color harmonies' });
  }
});

/**
 * Get typography pairings
 */
router.get('/typography/pairings', (req: Request, res: Response): void => {
  try {
    const category = req.query.category as string | undefined;
    const pairings = getTypographyPairings(category as any);

    res.json({
      success: true,
      pairings,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get typography pairings' });
  }
});

/**
 * Auto-fix accessibility issues
 */
router.post('/accessibility/fix', (req: Request, res: Response): void => {
  try {
    const { colors } = req.body;
    const fixed = autoFixAccessibility(colors);

    res.json({
      success: true,
      fixed,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fix accessibility issues' });
  }
});

// ===== ACCESSIBILITY CHECKER ROUTES =====

/**
 * Generate accessibility report
 */
router.post('/accessibility/report', (req: Request, res: Response): void => {
  try {
    const { html, css, colorPairs } = req.body;

    if (!html) {
      res.status(400).json({ error: 'HTML content is required' });
      return;
    }

    const report = generateAccessibilityReport(
      html,
      css || '',
      colorPairs || []
    );

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('[Accessibility API] Report error:', error);
    res.status(500).json({ error: 'Failed to generate accessibility report' });
  }
});

/**
 * Auto-fix accessibility issues in code
 */
router.post('/accessibility/autofix', (req: Request, res: Response): void => {
  try {
    const { html, css } = req.body;

    if (!html) {
      res.status(400).json({ error: 'HTML content is required' });
      return;
    }

    const result = autoFixAccessibilityIssues(html, css || '');

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to auto-fix accessibility issues' });
  }
});

/**
 * Get WCAG guidelines reference
 */
router.get('/accessibility/guidelines', (_req: Request, res: Response): void => {
  try {
    const guidelines = getWCAGGuidelines();
    res.json({
      success: true,
      guidelines,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get WCAG guidelines' });
  }
});

// ===== VERSION CONTROL ROUTES =====

/**
 * Create a new snapshot
 */
router.post('/versions/snapshot', (req: Request, res: Response): void => {
  try {
    const { projectId, data, message, author, branch, tags } = req.body;

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
router.get('/versions/:projectId', (req: Request, res: Response): void => {
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
router.get('/versions/snapshot/:snapshotId', (req: Request, res: Response): void => {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to get snapshot' });
  }
});

/**
 * Compare two snapshots
 */
router.get('/versions/diff/:snapshotA/:snapshotB', (req: Request, res: Response): void => {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to compare snapshots' });
  }
});

/**
 * Rollback to a snapshot
 */
router.post('/versions/rollback', (req: Request, res: Response): void => {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to rollback' });
  }
});

/**
 * Get version timeline
 */
router.get('/versions/:projectId/timeline', (req: Request, res: Response): void => {
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
router.get('/versions/:projectId/branches', (req: Request, res: Response): void => {
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

export default router;
