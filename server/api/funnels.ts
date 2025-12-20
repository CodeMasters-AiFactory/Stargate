/**
 * Marketing Funnel API Routes
 * Phase 3.3: Marketing Automation - Funnel APIs
 */

import type { Express } from 'express';
import {
  getFunnels,
  getFunnel,
  saveFunnel,
  deleteFunnel,
  trackFunnelEvent,
  getFunnelAnalytics,
  type Funnel,
  type FunnelEvent,
} from '../services/funnelService';

export function registerFunnelRoutes(app: Express) {
  // ===== FUNNEL MANAGEMENT =====
  
  // Get all funnels for a website
  app.get('/api/funnels/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const funnels = await getFunnels(websiteId);
      
      res.json({
        success: true,
        funnels,
        count: funnels.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch funnels',
      });
    }
  });
  
  // Get a specific funnel
  app.get('/api/funnels/:websiteId/:funnelId', async (req, res) => {
    try {
      const { websiteId, funnelId } = req.params;
      const funnel = await getFunnel(websiteId, funnelId);
      
      if (!funnel) {
        return res.status(404).json({
          success: false,
          error: 'Funnel not found',
        });
      }
      
      res.json({
        success: true,
        funnel,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch funnel',
      });
    }
  });
  
  // Create or update a funnel
  app.post('/api/funnels/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const funnelData: Funnel = req.body;
      
      if (!funnelData.id) {
        funnelData.id = `funnel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      funnelData.websiteId = websiteId;
      
      if (!funnelData.stats) {
        funnelData.stats = {
          totalVisitors: 0,
          stageConversions: {},
          stageDropoffs: {},
          conversionRates: {},
          totalConversions: 0,
          overallConversionRate: 0,
          averageTimeToConvert: 0,
        };
      }
      
      await saveFunnel(websiteId, funnelData);
      
      res.json({
        success: true,
        funnel: funnelData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save funnel',
      });
    }
  });
  
  // Update a funnel
  app.put('/api/funnels/:websiteId/:funnelId', async (req, res) => {
    try {
      const { websiteId, funnelId } = req.params;
      const funnelData: Partial<Funnel> = req.body;
      
      const existing = await getFunnel(websiteId, funnelId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Funnel not found',
        });
      }
      
      const updated: Funnel = {
        ...existing,
        ...funnelData,
        id: funnelId,
        websiteId,
        updatedAt: new Date(),
      };
      
      await saveFunnel(websiteId, updated);
      
      res.json({
        success: true,
        funnel: updated,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update funnel',
      });
    }
  });
  
  // Delete a funnel
  app.delete('/api/funnels/:websiteId/:funnelId', async (req, res) => {
    try {
      const { websiteId, funnelId } = req.params;
      await deleteFunnel(websiteId, funnelId);
      
      res.json({
        success: true,
        message: 'Funnel deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete funnel',
      });
    }
  });
  
  // ===== FUNNEL TRACKING =====
  
  // Track a funnel event
  app.post('/api/funnels/:websiteId/:funnelId/track', async (req, res) => {
    try {
      const { websiteId, funnelId } = req.params;
      const { visitorId, stageId, eventType, eventData, revenue } = req.body;
      
      if (!visitorId || !stageId || !eventType) {
        return res.status(400).json({
          success: false,
          error: 'visitorId, stageId, and eventType are required',
        });
      }
      
      const event = await trackFunnelEvent(websiteId, funnelId, visitorId, {
        funnelId,
        websiteId,
        visitorId,
        stageId,
        eventType,
        eventData,
        revenue,
      });
      
      res.json({
        success: true,
        event,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track funnel event',
      });
    }
  });
  
  // Get funnel analytics
  app.get('/api/funnels/:websiteId/:funnelId/analytics', async (req, res) => {
    try {
      const { websiteId, funnelId } = req.params;
      const analytics = await getFunnelAnalytics(websiteId, funnelId);
      
      if (!analytics) {
        return res.status(404).json({
          success: false,
          error: 'Funnel not found',
        });
      }
      
      res.json({
        success: true,
        analytics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch funnel analytics',
      });
    }
  });
}

