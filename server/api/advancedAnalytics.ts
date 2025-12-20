/**
 * Advanced Analytics API Routes
 * Heatmaps, session recordings, funnel analysis, user segmentation
 */

import type { Express } from 'express';
import { advancedAnalyticsService } from '../services/advancedAnalytics';

export function registerAdvancedAnalyticsRoutes(app: Express) {
  // ============================================
  // HEATMAPS
  // ============================================

  // Generate heatmap
  app.get('/api/analytics/heatmap/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const { pagePath, type, startDate, endDate } = req.query;

      if (!pagePath) {
        return res.status(400).json({
          success: false,
          error: 'pagePath is required',
        });
      }

      const dateRange = startDate && endDate
        ? { start: new Date(startDate as string), end: new Date(endDate as string) }
        : undefined;

      const heatmap = await advancedAnalyticsService.generateHeatmap(
        websiteId,
        pagePath as string,
        (type as any) || 'click',
        dateRange
      );

      res.json({
        success: true,
        heatmap,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate heatmap',
      });
    }
  });

  // ============================================
  // SESSION RECORDINGS
  // ============================================

  // Record session
  app.post('/api/analytics/sessions/record', async (req, res) => {
    try {
      const { websiteId, sessionId, events } = req.body;

      if (!websiteId || !sessionId || !events) {
        return res.status(400).json({
          success: false,
          error: 'websiteId, sessionId, and events are required',
        });
      }

      const recordingId = await advancedAnalyticsService.recordSession(
        websiteId,
        sessionId,
        events
      );

      res.json({
        success: true,
        recordingId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record session',
      });
    }
  });

  // Get session recording
  app.get('/api/analytics/sessions/:recordingId', async (req, res) => {
    try {
      const { recordingId } = req.params;
      const recording = await advancedAnalyticsService.getSessionRecording(recordingId);

      if (!recording) {
        return res.status(404).json({
          success: false,
          error: 'Recording not found',
        });
      }

      res.json({
        success: true,
        recording,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session recording',
      });
    }
  });

  // ============================================
  // FUNNEL ANALYSIS
  // ============================================

  // Analyze funnel
  app.post('/api/analytics/funnels/analyze', async (req, res) => {
    try {
      const { websiteId, steps } = req.body;

      if (!websiteId || !steps || !Array.isArray(steps)) {
        return res.status(400).json({
          success: false,
          error: 'websiteId and steps array are required',
        });
      }

      const analysis = await advancedAnalyticsService.analyzeFunnel(websiteId, steps);

      res.json({
        success: true,
        analysis,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze funnel',
      });
    }
  });

  // ============================================
  // USER SEGMENTATION
  // ============================================

  // Create user segment
  app.post('/api/analytics/segments', async (req, res) => {
    try {
      const { websiteId, name, criteria } = req.body;

      if (!websiteId || !name || !criteria) {
        return res.status(400).json({
          success: false,
          error: 'websiteId, name, and criteria are required',
        });
      }

      const segmentId = await advancedAnalyticsService.createUserSegment(
        websiteId,
        name,
        criteria
      );

      res.json({
        success: true,
        segmentId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user segment',
      });
    }
  });

  // Get user segments
  app.get('/api/analytics/segments/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const segments = await advancedAnalyticsService.getUserSegments(websiteId);

      res.json({
        success: true,
        segments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user segments',
      });
    }
  });

  // Analyze user segment
  app.get('/api/analytics/segments/:websiteId/:segmentId', async (req, res) => {
    try {
      const { segmentId } = req.params;
      const segment = await advancedAnalyticsService.analyzeUserSegment('', segmentId);

      if (!segment) {
        return res.status(404).json({
          success: false,
          error: 'Segment not found',
        });
      }

      res.json({
        success: true,
        segment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze user segment',
      });
    }
  });
}

