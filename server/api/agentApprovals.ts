/**
 * Agent Approvals API
 * API routes for managing agent upgrade approvals
 */

import { Router, type Request, type Response } from 'express';
import {
  getPendingProposals,
  getProposal,
  approveProposal,
  rejectProposal,
  getApprovalHistory,
  getRejectionHistory,
  getApprovalStats,
  getApprovalSummary,
  configureAutoApproval,
} from '../agents/approval/ApprovalWorkflow';
import { MerlinCoordinator } from '../agents/MerlinCoordinator';
import { AgentRegistry } from '../agents/AgentRegistry';

const router = Router();

/**
 * GET /api/agents/approvals
 * Get all pending proposals
 */
router.get('/approvals', (_req: Request, res: Response) => {
  try {
    const proposals = getPendingProposals();
    res.json({
      success: true,
      count: proposals.length,
      proposals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/agents/approvals/stats
 * Get approval statistics
 */
router.get('/approvals/stats', (_req: Request, res: Response) => {
  try {
    const stats = getApprovalStats();
    const summary = getApprovalSummary();
    res.json({
      success: true,
      stats,
      summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/agents/approvals/history
 * Get approval/rejection history
 */
router.get('/approvals/history', (_req: Request, res: Response) => {
  try {
    const approved = getApprovalHistory();
    const rejected = getRejectionHistory();
    res.json({
      success: true,
      approved,
      rejected,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/agents/approvals/:id
 * Get a specific proposal
 */
router.get('/approvals/:id', (req: Request, res: Response) => {
  try {
    const proposal = getProposal(req.params.id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found',
      });
    }
    res.json({
      success: true,
      proposal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/agents/approvals/:id/approve
 * Approve a proposal
 */
router.post('/approvals/:id/approve', async (req: Request, res: Response) => {
  try {
    const { notes } = req.body;
    const result = await approveProposal(req.params.id, notes);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        newVersion: result.newVersion,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/agents/approvals/:id/reject
 * Reject a proposal
 */
router.post('/approvals/:id/reject', (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const result = rejectProposal(req.params.id, reason);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/agents/approvals/settings
 * Configure auto-approval settings
 */
router.post('/approvals/settings', (req: Request, res: Response) => {
  try {
    const { enabled, maxRiskLevel, requireNotification } = req.body;
    configureAutoApproval({
      enabled,
      maxRiskLevel,
      requireNotification,
    });
    res.json({
      success: true,
      message: 'Auto-approval settings updated',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/agents
 * Get all registered agents
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    const agents = AgentRegistry.getAllAgentInfo();
    res.json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/agents/status
 * Get Merlin coordinator status
 */
router.get('/status', (_req: Request, res: Response) => {
  try {
    const status = MerlinCoordinator.getStatus();
    const summary = MerlinCoordinator.getSummary();
    res.json({
      success: true,
      status,
      summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/agents/initialize
 * Initialize all agents
 */
router.post('/initialize', async (_req: Request, res: Response) => {
  try {
    const result = await MerlinCoordinator.initialize();
    res.json({
      success: result.success,
      agentCount: result.agentCount,
      pendingUpgrades: result.pendingUpgrades.length,
      startupReports: result.startupReports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/agents/research
 * Run startup research for all agents
 */
router.post('/research', async (_req: Request, res: Response) => {
  try {
    const result = await MerlinCoordinator.runStartupResearch();
    res.json({
      success: true,
      trendReports: result.trendReports.length,
      newProposals: result.newProposals.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/agents/call
 * Call a specific agent
 */
router.post('/call', async (req: Request, res: Response) => {
  try {
    const { agentName, context } = req.body;
    
    if (!agentName || !context) {
      return res.status(400).json({
        success: false,
        error: 'agentName and context are required',
      });
    }

    const result = await MerlinCoordinator.callAgent(agentName, context);
    res.json({
      success: result.success,
      messages: result.messages,
      report: result.report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/agents/coordinate
 * Coordinate agents for a phase
 */
router.post('/coordinate', async (req: Request, res: Response) => {
  try {
    const { phase, context } = req.body;
    
    if (!phase || !context) {
      return res.status(400).json({
        success: false,
        error: 'phase and context are required',
      });
    }

    const result = await MerlinCoordinator.coordinatePhase(phase, context);
    res.json({
      success: result.success,
      messages: result.messages,
      reports: result.reports,
      overallScore: result.overallScore,
      recommendations: result.recommendations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

