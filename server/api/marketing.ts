/**
 * Marketing API Routes
 * Handles email campaigns, lead capture, and CRM integration
 * Now with full database persistence and campaign management
 */

import type { Express } from 'express';
import { sendEmail, addToMailchimpList, generateLeadCaptureForm } from '../services/marketing';
import {
  addSubscriber,
  getSubscribers,
  unsubscribeSubscriber,
  updateSubscriberTags,
  createEmailTemplate,
  getEmailTemplates,
  getEmailTemplate,
  renderEmailTemplate,
  createCampaign,
  getCampaigns,
  getCampaign,
  sendCampaign,
  trackEmailEvent,
  getCampaignStats,
} from '../services/emailMarketingService';

export function registerMarketingRoutes(app: Express) {
  // Capture lead from form submission
  app.post('/api/marketing/leads', async (req, res) => {
    try {
      const { websiteId, email, name, tags, ...metadata } = req.body;

      if (!email || !websiteId) {
        return res.status(400).json({
          success: false,
          error: 'Email and websiteId are required',
        });
      }

      // Save to database
      const subscriberId = await addSubscriber(
        websiteId,
        email,
        name,
        'website_form',
        tags || [],
        metadata
      );

      // Add to Mailchimp if configured
      const mailchimpListId = process.env.MAILCHIMP_LIST_ID;
      if (mailchimpListId) {
        await addToMailchimpList(email, mailchimpListId, { FNAME: name });
      }

      // Send welcome email (if welcome template exists)
      try {
        const templates = await getEmailTemplates(websiteId, 'welcome');
        if (templates.length > 0) {
          const template = templates[0];
          const rendered = renderEmailTemplate(template, {
            name: name || 'there',
            email,
          });
          await sendEmail(email, rendered.subject, rendered.htmlContent, rendered.textContent);
        } else {
          // Fallback to simple welcome email
          await sendEmail(
            email,
            'Welcome!',
            `<h1>Welcome!</h1><p>Thank you for subscribing, ${name || 'there'}!</p>`,
            `Welcome! Thank you for subscribing, ${name || 'there'}!`
          );
        }
      } catch (emailError) {
        console.warn('[Marketing] Failed to send welcome email:', emailError);
        // Don't fail the lead capture if email fails
      }

      res.json({
        success: true,
        subscriberId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to capture lead',
      });
    }
  });

  // Generate lead capture form code
  app.post('/api/marketing/generate-form', async (req, res) => {
    try {
      const { websiteId, formId, fields, submitText, successMessage } = req.body;

      if (!websiteId || !formId || !fields) {
        return res.status(400).json({
          success: false,
          error: 'websiteId, formId, and fields are required',
        });
      }

      const formCode = generateLeadCaptureForm({
        websiteId,
        formId,
        fields,
        submitText,
        successMessage,
      });

      res.json({
        success: true,
        code: formCode,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate form',
      });
    }
  });

  // Get subscribers
  app.get('/api/marketing/subscribers/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const { status, tags } = req.query;

      const subscribers = await getSubscribers(
        websiteId,
        status as any,
        tags ? (tags as string).split(',') : undefined
      );

      res.json({
        success: true,
        subscribers,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get subscribers',
      });
    }
  });

  // Unsubscribe
  app.post('/api/marketing/unsubscribe', async (req, res) => {
    try {
      const { websiteId, email } = req.body;

      if (!websiteId || !email) {
        return res.status(400).json({
          success: false,
          error: 'websiteId and email are required',
        });
      }

      const success = await unsubscribeSubscriber(websiteId, email);
      res.json({ success });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unsubscribe',
      });
    }
  });

  // Email Templates
  app.post('/api/marketing/templates', async (req, res) => {
    try {
      const { websiteId, name, subject, htmlContent, textContent, category, variables } = req.body;

      if (!websiteId || !name || !subject || !htmlContent) {
        return res.status(400).json({
          success: false,
          error: 'websiteId, name, subject, and htmlContent are required',
        });
      }

      const templateId = await createEmailTemplate(
        websiteId,
        name,
        subject,
        htmlContent,
        textContent,
        category,
        variables || []
      );

      res.json({
        success: true,
        templateId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create template',
      });
    }
  });

  app.get('/api/marketing/templates/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const { category } = req.query;

      const templates = await getEmailTemplates(websiteId, category as string | undefined);

      res.json({
        success: true,
        templates,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get templates',
      });
    }
  });

  // Campaigns
  app.post('/api/marketing/campaigns', async (req, res) => {
    try {
      const { websiteId, name, subject, htmlContent, textContent, templateId, scheduledAt, segments } = req.body;

      if (!websiteId || !name || !subject || !htmlContent) {
        return res.status(400).json({
          success: false,
          error: 'websiteId, name, subject, and htmlContent are required',
        });
      }

      const campaignId = await createCampaign(
        websiteId,
        name,
        subject,
        htmlContent,
        textContent,
        templateId,
        scheduledAt ? new Date(scheduledAt) : undefined,
        segments || []
      );

      res.json({
        success: true,
        campaignId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create campaign',
      });
    }
  });

  app.get('/api/marketing/campaigns/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const { status } = req.query;

      const campaigns = await getCampaigns(websiteId, status as string | undefined);

      res.json({
        success: true,
        campaigns,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get campaigns',
      });
    }
  });

  app.get('/api/marketing/campaigns/:campaignId/stats', async (req, res) => {
    try {
      const { campaignId } = req.params;

      const stats = await getCampaignStats(campaignId);

      if (!stats) {
        return res.status(404).json({
          success: false,
          error: 'Campaign not found',
        });
      }

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get campaign stats',
      });
    }
  });

  // Send email campaign
  app.post('/api/marketing/campaigns/:campaignId/send', async (req, res) => {
    try {
      const { campaignId } = req.params;
      const { recipientIds } = req.body;

      const result = await sendCampaign(campaignId, recipientIds);

      res.json({
        success: result.success,
        sent: result.sent,
        failed: result.failed,
        error: result.error,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send campaign',
      });
    }
  });

  // Email tracking endpoints (for tracking pixels and click tracking)
  app.get('/api/marketing/track/open/:campaignId/:subscriberId', async (req, res) => {
    try {
      const { campaignId, subscriberId } = req.params;
      const { email } = req.query;

      await trackEmailEvent(
        campaignId,
        subscriberId,
        email as string,
        'opened',
        undefined,
        req.headers['user-agent'],
        req.ip
      );

      // Return 1x1 transparent pixel
      const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      );
      res.set('Content-Type', 'image/gif');
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(pixel);
    } catch (error) {
      // Still return pixel even on error
      const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      );
      res.set('Content-Type', 'image/gif');
      res.send(pixel);
    }
  });

  app.get('/api/marketing/track/click/:campaignId/:subscriberId', async (req, res) => {
    try {
      const { campaignId, subscriberId } = req.params;
      const { url, email } = req.query;

      await trackEmailEvent(
        campaignId,
        subscriberId,
        email as string,
        'clicked',
        url as string,
        req.headers['user-agent'],
        req.ip
      );

      // Redirect to the actual URL
      if (url) {
        res.redirect(url as string);
      } else {
        res.json({ success: true });
      }
    } catch (error) {
      // Still redirect if URL provided
      if (req.query.url) {
        res.redirect(req.query.url as string);
      } else {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to track click',
        });
      }
    }
  });

  // Legacy: Send email campaign (simple version)
  app.post('/api/marketing/campaigns/send', async (req, res) => {
    try {
      const { to, subject, htmlContent, textContent } = req.body;

      if (!to || !subject || !htmlContent) {
        return res.status(400).json({
          success: false,
          error: 'to, subject, and htmlContent are required',
        });
      }

      const result = await sendEmail(to, subject, htmlContent, textContent);

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      });
    }
  });
}

