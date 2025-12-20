/**
 * AI Design Assistant API Routes
 * Real-time design suggestions and recommendations
 */

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
router.post('/analyze', async (req, res) => {
  try {
    const context: DesignContext = req.body;
    
    if (!context.industry || !context.businessName) {
      return res.status(400).json({ 
        error: 'Missing required fields: industry, businessName' 
      });
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
router.post('/recommendations', async (req, res) => {
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
router.get('/colors/harmonies', (req, res) => {
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
router.get('/typography/pairings', (req, res) => {
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
router.post('/accessibility/fix', (req, res) => {
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
router.post('/accessibility/report', (req, res) => {
  try {
    const { html, css, colorPairs } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
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
router.post('/accessibility/autofix', (req, res) => {
  try {
    const { html, css } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
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
router.get('/accessibility/guidelines', (req, res) => {
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
router.post('/versions/snapshot', (req, res) => {
  try {
    const { projectId, data, message, author, branch, tags } = req.body;
    
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
router.get('/versions/:projectId', (req, res) => {
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
router.get('/versions/snapshot/:snapshotId', (req, res) => {
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
router.get('/versions/diff/:snapshotA/:snapshotB', (req, res) => {
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
router.post('/versions/rollback', (req, res) => {
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
router.get('/versions/:projectId/timeline', (req, res) => {
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
router.get('/versions/:projectId/branches', (req, res) => {
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
