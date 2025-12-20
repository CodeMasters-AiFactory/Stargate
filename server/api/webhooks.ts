/**
 * Webhooks API Routes
 * Handles webhook registration, management, and delivery
 * Part of Focus 2: Integrations Expansion
 */

import type { Express } from 'express';
import fs from 'fs';
import path from 'path';
import type { Webhook, WebhookEvent } from '../services/webhookService';
import { triggerWebhookEvent, WEBHOOK_EVENTS } from '../services/webhookService';

/**
 * Load webhooks for a project
 */
function loadProjectWebhooks(projectSlug: string): Webhook[] {
  try {
    const webhooksPath = path.join(
      process.cwd(),
      'website_projects',
      projectSlug,
      'webhooks.json'
    );
    
    if (!fs.existsSync(webhooksPath)) {
      return [];
    }
    
    const content = fs.readFileSync(webhooksPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`[Webhooks] Failed to load webhooks for ${projectSlug}:`, error);
    return [];
  }
}

/**
 * Save webhooks for a project
 */
function saveProjectWebhooks(projectSlug: string, webhooks: Webhook[]): void {
  try {
    const projectDir = path.join(process.cwd(), 'website_projects', projectSlug);
    
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    
    const webhooksPath = path.join(projectDir, 'webhooks.json');
    fs.writeFileSync(webhooksPath, JSON.stringify(webhooks, null, 2), 'utf-8');
  } catch (error) {
    console.error(`[Webhooks] Failed to save webhooks for ${projectSlug}:`, error);
    throw error;
  }
}

export function registerWebhookRoutes(app: Express) {
  // Get webhooks for a project
  app.get('/api/webhooks/project/:projectSlug', async (req, res) => {
    try {
      const { projectSlug } = req.params;
      const webhooks = loadProjectWebhooks(projectSlug);
      
      res.json({
        success: true,
        webhooks,
        count: webhooks.length,
        projectSlug,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch webhooks',
      });
    }
  });

  // Create or update webhook
  app.post('/api/webhooks/project/:projectSlug', async (req, res) => {
    try {
      const { projectSlug } = req.params;
      const webhookData: Partial<Webhook> = req.body;
      
      const webhooks = loadProjectWebhooks(projectSlug);
      
      // Generate ID if new webhook
      if (!webhookData.id) {
        webhookData.id = `webhook_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      }
      
      // Update or add webhook
      const existingIndex = webhooks.findIndex(w => w.id === webhookData.id);
      const webhook: Webhook = {
        id: webhookData.id!,
        url: webhookData.url || '',
        events: webhookData.events || [],
        secret: webhookData.secret,
        enabled: webhookData.enabled !== undefined ? webhookData.enabled : true,
        headers: webhookData.headers || {},
        retries: webhookData.retries || 3,
      };
      
      if (existingIndex >= 0) {
        webhooks[existingIndex] = webhook;
      } else {
        webhooks.push(webhook);
      }
      
      saveProjectWebhooks(projectSlug, webhooks);
      
      res.json({
        success: true,
        webhook,
        message: existingIndex >= 0 ? 'Webhook updated' : 'Webhook created',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save webhook',
      });
    }
  });

  // Delete webhook
  app.delete('/api/webhooks/project/:projectSlug/:webhookId', async (req, res) => {
    try {
      const { projectSlug, webhookId } = req.params;
      const webhooks = loadProjectWebhooks(projectSlug);
      
      const filteredWebhooks = webhooks.filter(w => w.id !== webhookId);
      saveProjectWebhooks(projectSlug, filteredWebhooks);
      
      res.json({
        success: true,
        message: 'Webhook deleted',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete webhook',
      });
    }
  });

  // Trigger test webhook
  app.post('/api/webhooks/project/:projectSlug/:webhookId/test', async (req, res) => {
    try {
      const { projectSlug, webhookId } = req.params;
      const webhooks = loadProjectWebhooks(projectSlug);
      const webhook = webhooks.find(w => w.id === webhookId);
      
      if (!webhook) {
        return res.status(404).json({
          success: false,
          error: 'Webhook not found',
        });
      }
      
      const testEvent: WebhookEvent = {
        type: 'test.event',
        projectSlug,
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook event',
          test: true,
        },
      };
      
      const result = await triggerWebhookEvent([webhook], testEvent);
      
      res.json({
        success: result.delivered > 0,
        message: result.delivered > 0 ? 'Webhook test successful' : 'Webhook test failed',
        result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Webhook test failed',
      });
    }
  });

  // Get available webhook event types
  app.get('/api/webhooks/events', async (req, res) => {
    try {
      res.json({
        success: true,
        events: Object.values(WEBHOOK_EVENTS),
        eventDescriptions: {
          [WEBHOOK_EVENTS.WEBSITE_GENERATED]: 'Triggered when a website is generated',
          [WEBHOOK_EVENTS.WEBSITE_UPDATED]: 'Triggered when a website is updated',
          [WEBHOOK_EVENTS.WEBSITE_PUBLISHED]: 'Triggered when a website is published',
          [WEBHOOK_EVENTS.FORM_SUBMITTED]: 'Triggered when a form is submitted',
          [WEBHOOK_EVENTS.CONTACT_SUBMITTED]: 'Triggered when a contact form is submitted',
          [WEBHOOK_EVENTS.ORDER_CREATED]: 'Triggered when an order is created',
          [WEBHOOK_EVENTS.PAYMENT_RECEIVED]: 'Triggered when a payment is received',
          [WEBHOOK_EVENTS.USER_SIGNED_UP]: 'Triggered when a user signs up',
          [WEBHOOK_EVENTS.PROJECT_CREATED]: 'Triggered when a project is created',
          [WEBHOOK_EVENTS.PROJECT_UPDATED]: 'Triggered when a project is updated',
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch webhook events',
      });
    }
  });
}

