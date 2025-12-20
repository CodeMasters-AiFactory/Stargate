/**
 * Advanced Analytics API Routes
 * Phase 3.5: Advanced Analytics - Enhanced analytics endpoints
 */

import type { Express } from 'express';
import { trackEvent, trackEventBatch, getEvents } from '../services/analytics/eventTracker';
import { aggregateDailyData, getAggregatedData, batchAggregateData } from '../services/analytics/dataCollection';
import { getDashboardMetrics } from '../services/analytics/dashboardService';
import { getReports, getReport, saveReport, deleteReport, generateReportData } from '../services/analytics/reportBuilderService';
import { getScheduledReports, saveScheduledReport, processScheduledReports } from '../services/analytics/reportScheduler';

export function registerAdvancedAnalyticsRoutes(app: Express) {
  // ===== EVENT TRACKING =====

  // Track a single event
  app.post('/api/analytics/advanced/events/track', async (req, res) => {
    try {
      const eventData = req.body;
      const event = await trackEvent({
        websiteId: eventData.websiteId,
        sessionId: eventData.sessionId,
        visitorId: eventData.visitorId,
        eventType: eventData.eventType,
        eventCategory: eventData.eventCategory || 'custom',
        eventAction: eventData.eventAction,
        eventLabel: eventData.eventLabel,
        eventValue: eventData.eventValue,
        path: eventData.path,
        referrer: eventData.referrer,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        metadata: eventData.metadata,
      });

      res.json({
        success: true,
        event,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track event',
      });
    }
  });

  // Track batch of events
  app.post('/api/analytics/advanced/events/batch', async (req, res) => {
    try {
      const { websiteId, events } = req.body;
      const result = await trackEventBatch({
        websiteId,
        events,
        receivedAt: new Date(),
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track events',
      });
    }
  });

  // Get events
  app.get('/api/analytics/advanced/:websiteId/events', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const { startDate, endDate, eventType, eventCategory, sessionId, visitorId } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const events = await getEvents(websiteId, start, end, {
        eventType: eventType as string,
        eventCategory: eventCategory as string,
        sessionId: sessionId as string,
        visitorId: visitorId as string,
      });

      res.json({
        success: true,
        events,
        count: events.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch events',
      });
    }
  });

  // ===== DATA AGGREGATION =====

  // Aggregate daily data
  app.post('/api/analytics/advanced/:websiteId/aggregate', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const { date } = req.body;

      const targetDate = date ? new Date(date) : new Date();
      const aggregated = await aggregateDailyData(websiteId, targetDate);

      res.json({
        success: true,
        data: aggregated,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to aggregate data',
      });
    }
  });

  // Batch aggregate data
  app.post('/api/analytics/advanced/:websiteId/aggregate/batch', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const { startDate, endDate } = req.body;

      const start = new Date(startDate);
      const end = new Date(endDate);

      const result = await batchAggregateData(websiteId, start, end);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to batch aggregate data',
      });
    }
  });

  // Get aggregated data
  app.get('/api/analytics/advanced/:websiteId/aggregated', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const data = await getAggregatedData(websiteId, start, end);

      res.json({
        success: true,
        data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch aggregated data',
      });
    }
  });

  // ===== DASHBOARD =====

  // Get dashboard metrics
  app.get('/api/analytics/advanced/:websiteId/dashboard', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const { range = '7d', startDate, endDate } = req.query;

      const metrics = await getDashboardMetrics(
        websiteId,
        range as '24h' | '7d' | '30d' | '90d' | 'custom',
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        metrics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard metrics',
      });
    }
  });

  // ===== CUSTOM REPORTS =====

  // Get all reports
  app.get('/api/analytics/advanced/:websiteId/reports', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const reports = await getReports(websiteId);

      res.json({
        success: true,
        reports,
        count: reports.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reports',
      });
    }
  });

  // Get a specific report
  app.get('/api/analytics/advanced/:websiteId/reports/:reportId', async (req, res) => {
    try {
      const { websiteId, reportId } = req.params;
      const report = await getReport(websiteId, reportId);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Report not found',
        });
      }

      res.json({
        success: true,
        report,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch report',
      });
    }
  });

  // Create or update report
  app.post('/api/analytics/advanced/:websiteId/reports', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const reportData = req.body;

      if (!reportData.id) {
        reportData.id = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      reportData.websiteId = websiteId;

      await saveReport(websiteId, reportData);

      res.json({
        success: true,
        report: reportData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save report',
      });
    }
  });

  // Delete report
  app.delete('/api/analytics/advanced/:websiteId/reports/:reportId', async (req, res) => {
    try {
      const { websiteId, reportId } = req.params;
      await deleteReport(websiteId, reportId);

      res.json({
        success: true,
        message: 'Report deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete report',
      });
    }
  });

  // Generate report data
  app.post('/api/analytics/advanced/:websiteId/reports/:reportId/generate', async (req, res) => {
    try {
      const { websiteId, reportId } = req.params;
      const report = await getReport(websiteId, reportId);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Report not found',
        });
      }

      const data = await generateReportData(report);

      // Update last generated timestamp
      report.lastGenerated = new Date();
      await saveReport(websiteId, report);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate report',
      });
    }
  });

  // ===== SCHEDULED REPORTS =====

  // Get scheduled reports
  app.get('/api/analytics/advanced/:websiteId/scheduled-reports', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const scheduled = await getScheduledReports(websiteId);

      res.json({
        success: true,
        scheduled,
        count: scheduled.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch scheduled reports',
      });
    }
  });

  // Create or update scheduled report
  app.post('/api/analytics/advanced/:websiteId/scheduled-reports', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const scheduledData = req.body;

      if (!scheduledData.id) {
        scheduledData.id = `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      scheduledData.websiteId = websiteId;

      await saveScheduledReport(websiteId, scheduledData);

      res.json({
        success: true,
        scheduled: scheduledData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save scheduled report',
      });
    }
  });

  // Process scheduled reports (cron job endpoint)
  app.post('/api/analytics/advanced/:websiteId/scheduled-reports/process', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const result = await processScheduledReports(websiteId);

      res.json({
        success: true,
        ...result,
        message: `Processed ${result.sent} scheduled reports`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process scheduled reports',
      });
    }
  });
}

