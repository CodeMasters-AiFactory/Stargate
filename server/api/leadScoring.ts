/**
 * Lead Scoring API Routes
 * Phase 3.3: Marketing Automation - Lead scoring APIs
 */

import type { Express } from 'express';
import {
  getScoringCriteria,
  getScoringCriterion,
  saveScoringCriteria,
  deleteScoringCriteria,
  getLeads,
  getLead,
  saveLead,
  calculateLeadScore,
  updateLeadBehavior,
  batchScoreLeads,
  type ScoringCriteria,
  type Lead,
} from '../services/leadScoringService';

export function registerLeadScoringRoutes(app: Express) {
  // ===== SCORING CRITERIA MANAGEMENT =====
  
  // Get all scoring criteria for a website
  app.get('/api/lead-scoring/:websiteId/criteria', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const criteria = await getScoringCriteria(websiteId);
      
      res.json({
        success: true,
        criteria,
        count: criteria.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch scoring criteria',
      });
    }
  });
  
  // Get a specific scoring criterion
  app.get('/api/lead-scoring/:websiteId/criteria/:criteriaId', async (req, res) => {
    try {
      const { websiteId, criteriaId } = req.params;
      const criterion = await getScoringCriterion(websiteId, criteriaId);
      
      if (!criterion) {
        return res.status(404).json({
          success: false,
          error: 'Scoring criterion not found',
        });
      }
      
      res.json({
        success: true,
        criterion,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch scoring criterion',
      });
    }
  });
  
  // Create or update scoring criteria
  app.post('/api/lead-scoring/:websiteId/criteria', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const criterionData: ScoringCriteria = req.body;
      
      if (!criterionData.id) {
        criterionData.id = `criteria-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      criterionData.websiteId = websiteId;
      
      await saveScoringCriteria(websiteId, criterionData);
      
      // Recalculate all leads with new criteria
      await batchScoreLeads(websiteId);
      
      res.json({
        success: true,
        criterion: criterionData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save scoring criteria',
      });
    }
  });
  
  // Update scoring criteria
  app.put('/api/lead-scoring/:websiteId/criteria/:criteriaId', async (req, res) => {
    try {
      const { websiteId, criteriaId } = req.params;
      const criterionData: Partial<ScoringCriteria> = req.body;
      
      const existing = await getScoringCriterion(websiteId, criteriaId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Scoring criterion not found',
        });
      }
      
      const updated: ScoringCriteria = {
        ...existing,
        ...criterionData,
        id: criteriaId,
        websiteId,
        updatedAt: new Date(),
      };
      
      await saveScoringCriteria(websiteId, updated);
      
      // Recalculate all leads with updated criteria
      await batchScoreLeads(websiteId);
      
      res.json({
        success: true,
        criterion: updated,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update scoring criteria',
      });
    }
  });
  
  // Delete scoring criteria
  app.delete('/api/lead-scoring/:websiteId/criteria/:criteriaId', async (req, res) => {
    try {
      const { websiteId, criteriaId } = req.params;
      await deleteScoringCriteria(websiteId, criteriaId);
      
      res.json({
        success: true,
        message: 'Scoring criterion deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete scoring criterion',
      });
    }
  });
  
  // ===== LEAD MANAGEMENT =====
  
  // Get all leads for a website
  app.get('/api/lead-scoring/:websiteId/leads', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const { qualification, minScore, maxScore, sortBy = 'total', order = 'desc' } = req.query;
      
      let leads = await getLeads(websiteId);
      
      // Filter by qualification
      if (qualification) {
        leads = leads.filter(l => l.qualification === qualification);
      }
      
      // Filter by score range
      if (minScore) {
        leads = leads.filter(l => l.scores.total >= Number(minScore));
      }
      if (maxScore) {
        leads = leads.filter(l => l.scores.total <= Number(maxScore));
      }
      
      // Sort
      leads.sort((a, b) => {
        const aValue = (a.scores as any)[sortBy as string] || 0;
        const bValue = (b.scores as any)[sortBy as string] || 0;
        return order === 'desc' ? bValue - aValue : aValue - bValue;
      });
      
      res.json({
        success: true,
        leads,
        count: leads.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch leads',
      });
    }
  });
  
  // Get a specific lead
  app.get('/api/lead-scoring/:websiteId/leads/:leadId', async (req, res) => {
    try {
      const { websiteId, leadId } = req.params;
      const lead = await getLead(websiteId, leadId);
      
      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found',
        });
      }
      
      res.json({
        success: true,
        lead,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch lead',
      });
    }
  });
  
  // Create or update a lead
  app.post('/api/lead-scoring/:websiteId/leads', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const leadData: Partial<Lead> = req.body;
      
      if (!leadData.email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required',
        });
      }
      
      // Check if lead exists
      const existingLeads = await getLeads(websiteId);
      let lead = existingLeads.find(l => l.email === leadData.email);
      
      if (lead) {
        // Update existing lead
        lead = {
          ...lead,
          ...leadData,
          email: leadData.email,
          websiteId,
          updatedAt: new Date(),
        };
      } else {
        // Create new lead
        lead = {
          id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          websiteId,
          email: leadData.email,
          name: leadData.name,
          metadata: leadData.metadata || {},
          behavior: leadData.behavior || {
            pageViews: 0,
            downloads: 0,
            formSubmissions: 0,
            emailClicks: 0,
            emailOpens: 0,
            timeOnSite: 0,
            lastActivity: new Date(),
          },
          demographics: leadData.demographics || {},
          scores: {
            behavioral: 0,
            demographic: 0,
            engagement: 0,
            custom: 0,
            total: 0,
          },
          qualification: 'unqualified',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      
      // Calculate scores
      const scoredLead = await calculateLeadScore(websiteId, lead);
      await saveLead(websiteId, scoredLead);
      
      res.json({
        success: true,
        lead: scoredLead,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save lead',
      });
    }
  });
  
  // Update lead behavior
  app.post('/api/lead-scoring/:websiteId/leads/:leadId/behavior', async (req, res) => {
    try {
      const { websiteId, leadId } = req.params;
      const behaviorUpdate = req.body;
      
      const updatedLead = await updateLeadBehavior(websiteId, leadId, behaviorUpdate);
      
      if (!updatedLead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found',
        });
      }
      
      res.json({
        success: true,
        lead: updatedLead,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update lead behavior',
      });
    }
  });
  
  // Recalculate all leads
  app.post('/api/lead-scoring/:websiteId/leads/recalculate', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const result = await batchScoreLeads(websiteId);
      
      res.json({
        success: true,
        ...result,
        message: `Recalculated scores for ${result.scored} leads`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to recalculate leads',
      });
    }
  });
  
  // Get lead analytics/statistics
  app.get('/api/lead-scoring/:websiteId/analytics', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const leads = await getLeads(websiteId);
      
      const analytics = {
        total: leads.length,
        byQualification: {
          hot: leads.filter(l => l.qualification === 'hot').length,
          warm: leads.filter(l => l.qualification === 'warm').length,
          cold: leads.filter(l => l.qualification === 'cold').length,
          unqualified: leads.filter(l => l.qualification === 'unqualified').length,
        },
        averageScore: leads.length > 0
          ? leads.reduce((sum, l) => sum + l.scores.total, 0) / leads.length
          : 0,
        scoreDistribution: {
          '0-25': leads.filter(l => l.scores.total >= 0 && l.scores.total < 25).length,
          '25-50': leads.filter(l => l.scores.total >= 25 && l.scores.total < 50).length,
          '50-75': leads.filter(l => l.scores.total >= 50 && l.scores.total < 75).length,
          '75+': leads.filter(l => l.scores.total >= 75).length,
        },
      };
      
      res.json({
        success: true,
        analytics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
      });
    }
  });
}

