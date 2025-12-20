/**
 * Webhook Service
 * Handles webhook delivery and event triggers
 * Part of Focus 2: Integrations Expansion
 */

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  enabled: boolean;
  headers?: Record<string, string>;
  retries?: number;
  lastTriggered?: string;
  lastSuccess?: boolean;
}

export interface WebhookEvent {
  type: string;
  projectSlug: string;
  timestamp: string;
  data: Record<string, any>;
}

/**
 * Deliver webhook event
 */
export async function deliverWebhook(webhook: Webhook, event: WebhookEvent): Promise<boolean> {
  if (!webhook.enabled) {
    return false;
  }

  // Check if webhook subscribes to this event type
  if (!webhook.events.includes(event.type) && !webhook.events.includes('*')) {
    return false;
  }

  try {
    const payload = {
      event: event.type,
      timestamp: event.timestamp,
      project: event.projectSlug,
      data: event.data,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Stargate-Webhooks/1.0',
      ...webhook.headers,
    };

    // Add signature if secret provided
    if (webhook.secret) {
      const crypto = require('crypto');
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      headers['X-Webhook-Signature'] = signature;
    }

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const success = response.ok;

    // Update webhook status
    webhook.lastTriggered = new Date().toISOString();
    webhook.lastSuccess = success;

    return success;
  } catch (error) {
    console.error(`[WebhookService] Failed to deliver webhook ${webhook.id}:`, error);
    webhook.lastTriggered = new Date().toISOString();
    webhook.lastSuccess = false;
    return false;
  }
}

/**
 * Deliver webhook with retry logic
 */
export async function deliverWebhookWithRetry(
  webhook: Webhook,
  event: WebhookEvent,
  maxRetries: number = 3
): Promise<boolean> {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    const success = await deliverWebhook(webhook, event);
    
    if (success) {
      return true;
    }
    
    attempts++;
    
    if (attempts < maxRetries) {
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempts - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return false;
}

/**
 * Trigger webhook event for all matching webhooks
 */
export async function triggerWebhookEvent(
  webhooks: Webhook[],
  event: WebhookEvent
): Promise<{ delivered: number; failed: number }> {
  const results = await Promise.allSettled(
    webhooks.map(webhook => deliverWebhookWithRetry(webhook, event))
  );

  const delivered = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
  const failed = results.length - delivered;

  return { delivered, failed };
}

/**
 * Webhook event types
 */
export const WEBHOOK_EVENTS = {
  WEBSITE_GENERATED: 'website.generated',
  WEBSITE_UPDATED: 'website.updated',
  WEBSITE_PUBLISHED: 'website.published',
  FORM_SUBMITTED: 'form.submitted',
  CONTACT_SUBMITTED: 'contact.submitted',
  ORDER_CREATED: 'order.created',
  PAYMENT_RECEIVED: 'payment.received',
  USER_SIGNED_UP: 'user.signed_up',
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
} as const;

