/**
 * Email Marketing API Routes
 * Phase 2.3: Complete email marketing platform APIs
 */

import type { Express, Request, Response } from 'express';
import {
  getSubscribers,
  addSubscriber,
  removeSubscriber,
  unsubscribeSubscriber,
  updateSubscriberTags,
  getSegments,
  createSegment,
  getNewsletterTemplates,
  getCampaignMetrics,
  sendCampaign,
  replaceTemplateVariables,
} from '../services/emailMarketingService';

export function registerEmailMarketingRoutes(app: Express) {
  // ===== SUBSCRIBER MANAGEMENT =====

  // Get all subscribers
  app.get('/api/email-marketing/:websiteId/subscribers', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId } = req.params;
      const subscribers = await getSubscribers(websiteId);

      res.json({
        success: true,
        subscribers,
        count: subscribers.length,
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to fetch subscribers',
      });
    }
  });
  
  // Add subscriber
  app.post('/api/email-marketing/:websiteId/subscribers', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId } = req.params;
      const { email, name, tags, metadata } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Email is required',
        });
        return;
      }
      
      const subscriber = await addSubscriber(websiteId, email, name, tags, metadata);
      
      res.json({
        success: true,
        subscriber,
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to add subscriber',
      });
    }
  });
  
  // Remove subscriber
  app.delete('/api/email-marketing/:websiteId/subscribers/:subscriberId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId, subscriberId } = req.params;
      await removeSubscriber(websiteId, subscriberId);

      res.json({
        success: true,
        message: 'Subscriber removed',
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to remove subscriber',
      });
    }
  });
  
  // Unsubscribe
  app.post('/api/email-marketing/:websiteId/subscribers/unsubscribe', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId } = req.params;
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Email is required',
        });
        return;
      }

      await unsubscribeSubscriber(websiteId, email);

      res.json({
        success: true,
        message: 'Unsubscribed successfully',
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to unsubscribe',
      });
    }
  });
  
  // Update subscriber tags
  app.patch('/api/email-marketing/:websiteId/subscribers/:subscriberId/tags', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId, subscriberId } = req.params;
      const { tags } = req.body;

      if (!Array.isArray(tags)) {
        res.status(400).json({
          success: false,
          error: 'Tags must be an array',
        });
        return;
      }

      await updateSubscriberTags(websiteId, subscriberId, tags);

      res.json({
        success: true,
        message: 'Tags updated',
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to update tags',
      });
    }
  });
  
  // ===== SEGMENT MANAGEMENT =====
  
  // Get all segments
  app.get('/api/email-marketing/:websiteId/segments', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId } = req.params;
      const segments = await getSegments(websiteId);

      res.json({
        success: true,
        segments,
        count: segments.length,
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to fetch segments',
      });
    }
  });
  
  // Create segment
  app.post('/api/email-marketing/:websiteId/segments', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId } = req.params;
      const { name, conditions } = req.body;

      if (!name || !conditions || !Array.isArray(conditions)) {
        res.status(400).json({
          success: false,
          error: 'Name and conditions are required',
        });
        return;
      }

      const segment = await createSegment(websiteId, { name, conditions });

      res.json({
        success: true,
        segment,
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to create segment',
      });
    }
  });
  
  // ===== NEWSLETTER TEMPLATES =====
  
  // Get all templates
  app.get('/api/email-marketing/templates', async (_req: Request, res: Response): Promise<void> => {
    try {
      const templates = await getNewsletterTemplates();

      res.json({
        success: true,
        templates,
        count: templates.length,
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to fetch templates',
      });
    }
  });
  
  // ===== CAMPAIGN METRICS =====
  
  // Get campaign metrics
  app.get('/api/email-marketing/:websiteId/campaigns/:campaignId/metrics', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId, campaignId } = req.params;
      const metrics = await getCampaignMetrics(websiteId, campaignId);

      if (!metrics) {
        res.status(404).json({
          success: false,
          error: 'Campaign metrics not found',
        });
        return;
      }

      res.json({
        success: true,
        metrics,
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to fetch metrics',
      });
    }
  });
  
  // ===== SEND CAMPAIGN =====
  
  // Send email campaign
  app.post('/api/email-marketing/:websiteId/campaigns/send', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId } = req.params;
      const { campaignId, subject, htmlContent, recipientEmails, templateVariables, batchSize } = req.body;

      if (!campaignId || !subject || !htmlContent || !recipientEmails || !Array.isArray(recipientEmails)) {
        res.status(400).json({
          success: false,
          error: 'campaignId, subject, htmlContent, and recipientEmails array are required',
        });
        return;
      }

      // Replace template variables if provided
      let finalHtml = htmlContent;
      if (templateVariables && typeof templateVariables === 'object') {
        finalHtml = replaceTemplateVariables(htmlContent, templateVariables);
      }

      // Send campaign (parallel batches)
      const result = await sendCampaign(
        websiteId,
        campaignId,
        subject,
        finalHtml,
        recipientEmails,
        batchSize || 10
      );

      res.json({
        success: true,
        campaignId,
        ...result,
        message: `Campaign sent: ${result.sent} successful, ${result.failed} failed`,
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to send campaign',
      });
    }
  });
  
  // ===== ANALYTICS =====
  
  // Get all campaigns analytics for a website
  app.get('/api/email-marketing/:websiteId/analytics', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId } = req.params;
      const fs = require('fs');
      const path = require('path');

      const emailDir = path.join(process.cwd(), 'website_projects', websiteId, 'email-marketing', 'campaigns');

      if (!fs.existsSync(emailDir)) {
        res.json({
          success: true,
          campaigns: [],
          summary: {
            totalCampaigns: 0,
            totalSent: 0,
            totalOpened: 0,
            totalClicked: 0,
            averageOpenRate: 0,
            averageClickRate: 0,
          },
        });
        return;
      }
      
      const files = fs.readdirSync(emailDir).filter((f: string) => f.endsWith('-metrics.json'));
      const campaigns: Record<string, unknown>[] = [];

      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(emailDir, file), 'utf-8');
          const metrics = JSON.parse(content);
          campaigns.push(metrics);
        } catch (_error: unknown) {
          console.error(`[Email Marketing] Failed to load metrics from ${file}:`, _error);
        }
      }

      // Calculate summary
      const summary = {
        totalCampaigns: campaigns.length,
        totalSent: campaigns.reduce((sum: number, c: Record<string, unknown>) => sum + ((c.sent as number) || 0), 0),
        totalOpened: campaigns.reduce((sum: number, c: Record<string, unknown>) => sum + ((c.opened as number) || 0), 0),
        totalClicked: campaigns.reduce((sum: number, c: Record<string, unknown>) => sum + ((c.clicked as number) || 0), 0),
        averageOpenRate: campaigns.length > 0
          ? campaigns.reduce((sum: number, c: Record<string, unknown>) => sum + ((c.openRate as number) || 0), 0) / campaigns.length
          : 0,
        averageClickRate: campaigns.length > 0
          ? campaigns.reduce((sum: number, c: Record<string, unknown>) => sum + ((c.clickRate as number) || 0), 0) / campaigns.length
          : 0,
      };
      
      res.json({
        success: true,
        campaigns,
        summary,
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to fetch analytics',
      });
    }
  });
}

