/**
 * Webhook Automation Service
 * 
 * Trigger via incoming webhook, send results anywhere, Zapier/Make integration,
 * Slack/email alerts, custom payloads.
 */

import { getErrorMessage, logError } from '../utils/errorHandler';
import fetch from 'node-fetch';

export interface WebhookConfig {
  id: string;
  name: string;
  trigger: 'incoming' | 'scheduled' | 'event';
  url: string;
  method: 'GET' | 'POST' | 'PUT';
  headers?: Record<string, string>;
  payload?: Record<string, any>;
  enabled: boolean;
}

export interface WebhookEvent {
  type: 'scrape-complete' | 'change-detected' | 'error' | 'custom';
  data: Record<string, any>;
  timestamp: Date;
}

// In-memory store (in production, use database)
const webhookStore = new Map<string, WebhookConfig>();

/**
 * Register a webhook
 */
export function registerWebhook(config: WebhookConfig): void {
  webhookStore.set(config.id, config);
}

/**
 * Trigger webhook
 */
export async function triggerWebhook(
  webhookId: string,
  event: WebhookEvent
): Promise<{
  success: boolean;
  response?: any;
  error?: string;
}> {
  const config = webhookStore.get(webhookId);
  if (!config || !config.enabled) {
    return {
      success: false,
      error: `Webhook ${webhookId} not found or disabled`,
    };
  }

  try {
    const payload = {
      ...config.payload,
      event: {
        type: event.type,
        data: event.data,
        timestamp: event.timestamp,
      },
    };

    const response = await fetch(config.url, {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const responseData = await response.json().catch(() => ({}));
      return {
        success: true,
        response: responseData,
      };
    }

    return {
      success: false,
      error: `Webhook returned ${response.status}: ${response.statusText}`,
    };
  } catch (error) {
    logError(error, 'Webhook Automation');
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Trigger all webhooks for an event type
 */
export async function triggerWebhooksForEvent(
  eventType: WebhookEvent['type'],
  data: Record<string, any>
): Promise<Array<{ webhookId: string; success: boolean; error?: string }>> {
  const results: Array<{ webhookId: string; success: boolean; error?: string }> = [];

  for (const [id, config] of webhookStore.entries()) {
    if (config.enabled && config.trigger === 'event') {
      const result = await triggerWebhook(id, {
        type: eventType,
        data,
        timestamp: new Date(),
      });
      results.push({
        webhookId: id,
        success: result.success,
        error: result.error,
      });
    }
  }

  return results;
}

/**
 * Handle incoming webhook (for triggering scrapes)
 */
export function handleIncomingWebhook(
  webhookId: string,
  payload: Record<string, any>
): {
  success: boolean;
  action?: string;
  data?: Record<string, any>;
} {
  const config = webhookStore.get(webhookId);
  if (!config || config.trigger !== 'incoming') {
    return {
      success: false,
    };
  }

  // Extract action from payload
  const action = payload.action || 'scrape';
  const url = payload.url || payload.targetUrl;

  return {
    success: true,
    action,
    data: {
      url,
      ...payload,
    },
  };
}

