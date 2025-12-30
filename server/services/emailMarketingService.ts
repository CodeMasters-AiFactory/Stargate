/**
 * Email Marketing Service
 * Complete email marketing system with campaigns, templates, and subscriber management
 */

import { db } from '../db';
import {
  emailSubscribers,
  emailCampaigns,
  emailTemplates,
  emailTracking,
} from '@shared/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { sendEmail } from './marketing';

/**
 * Subscriber Management
 */

export async function addSubscriber(
  websiteId: string,
  email: string,
  name?: string,
  source: string = 'form',
  tags: string[] = [],
  metadata: Record<string, unknown> = {}
): Promise<string> {
  if (!db) {
    throw new Error('Database not available');
  }

  // Check if subscriber already exists
  const existing = await db
    .select()
    .from(emailSubscribers)
    .where(
      and(
        eq(emailSubscribers.websiteId, websiteId),
        eq(emailSubscribers.email, email)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing subscriber if unsubscribed
    if (existing[0].status === 'unsubscribed') {
      await db
        .update(emailSubscribers)
        .set({
          status: 'subscribed',
          name: name || existing[0].name,
          source,
          tags: tags.length > 0 ? tags : existing[0].tags,
          metadata: { ...existing[0].metadata, ...metadata },
          subscribedAt: new Date(),
          unsubscribedAt: null,
        })
        .where(eq(emailSubscribers.id, existing[0].id));
      return existing[0].id;
    }
    return existing[0].id;
  }

  // Create new subscriber
  const [subscriber] = await db
    .insert(emailSubscribers)
    .values({
      websiteId,
      email,
      name,
      source,
      tags,
      metadata,
      status: 'subscribed',
    })
    .returning();

  return subscriber.id;
}

export async function getSubscribers(
  websiteId: string,
  status?: 'subscribed' | 'unsubscribed' | 'bounced' | 'complained',
  tags?: string[]
): Promise<typeof emailSubscribers.$inferSelect[]> {
  if (!db) {
    return [];
  }

  let query = db
    .select()
    .from(emailSubscribers)
    .where(eq(emailSubscribers.websiteId, websiteId));

  if (status) {
    query = query.where(eq(emailSubscribers.status, status));
  }

  const subscribers = await query.orderBy(desc(emailSubscribers.subscribedAt));

  // Filter by tags if provided
  if (tags && tags.length > 0) {
    return subscribers.filter(sub => 
      tags.some(tag => (sub.tags as string[] || []).includes(tag))
    );
  }

  return subscribers;
}

export async function unsubscribeSubscriber(
  websiteId: string,
  email: string
): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    await db
      .update(emailSubscribers)
      .set({
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
      })
      .where(
        and(
          eq(emailSubscribers.websiteId, websiteId),
          eq(emailSubscribers.email, email)
        )
      );
    return true;
  } catch (_error: unknown) {
    console.error('[EmailMarketing] Unsubscribe error:', _error);
    return false;
  }
}

export async function updateSubscriberTags(
  subscriberId: string,
  tags: string[]
): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    await db
      .update(emailSubscribers)
      .set({ tags })
      .where(eq(emailSubscribers.id, subscriberId));
    return true;
  } catch (_error: unknown) {
    console.error('[EmailMarketing] Update tags error:', _error);
    return false;
  }
}

/**
 * Email Template Management
 */

export async function createEmailTemplate(
  websiteId: string,
  name: string,
  subject: string,
  htmlContent: string,
  textContent?: string,
  category?: string,
  variables: string[] = []
): Promise<string> {
  if (!db) {
    throw new Error('Database not available');
  }

  const [template] = await db
    .insert(emailTemplates)
    .values({
      websiteId,
      name,
      subject,
      htmlContent,
      textContent,
      category,
      variables,
    })
    .returning();

  return template.id;
}

export async function getEmailTemplates(
  websiteId: string,
  category?: string
): Promise<typeof emailTemplates.$inferSelect[]> {
  if (!db) {
    return [];
  }

  let query = db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.websiteId, websiteId));

  if (category) {
    query = query.where(eq(emailTemplates.category, category));
  }

  return await query.orderBy(desc(emailTemplates.createdAt));
}

export async function getEmailTemplate(templateId: string): Promise<typeof emailTemplates.$inferSelect | null> {
  if (!db) {
    return null;
  }

  const [template] = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.id, templateId))
    .limit(1);

  return template || null;
}

export function renderEmailTemplate(
  template: typeof emailTemplates.$inferSelect,
  variables: Record<string, string>
): { subject: string; htmlContent: string; textContent?: string } {
  let subject = template.subject;
  let htmlContent = template.htmlContent;
  let textContent = template.textContent;

  // Replace variables in template
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    subject = subject.replace(new RegExp(placeholder, 'g'), value);
    htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
    if (textContent) {
      textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
    }
  });

  return { subject, htmlContent, textContent };
}

/**
 * Campaign Management
 */

export async function createCampaign(
  websiteId: string,
  name: string,
  subject: string,
  htmlContent: string,
  textContent?: string,
  templateId?: string,
  scheduledAt?: Date,
  segments: string[] = []
): Promise<string> {
  if (!db) {
    throw new Error('Database not available');
  }

  const [campaign] = await db
    .insert(emailCampaigns)
    .values({
      websiteId,
      name,
      subject,
      htmlContent,
      textContent,
      templateId,
      scheduledAt,
      segments,
      status: scheduledAt ? 'scheduled' : 'draft',
    })
    .returning();

  return campaign.id;
}

export async function getCampaigns(
  websiteId: string,
  status?: string
): Promise<typeof emailCampaigns.$inferSelect[]> {
  if (!db) {
    return [];
  }

  let query = db
    .select()
    .from(emailCampaigns)
    .where(eq(emailCampaigns.websiteId, websiteId));

  if (status) {
    query = query.where(eq(emailCampaigns.status, status));
  }

  return await query.orderBy(desc(emailCampaigns.createdAt));
}

export async function getCampaign(campaignId: string): Promise<typeof emailCampaigns.$inferSelect | null> {
  if (!db) {
    return null;
  }

  const [campaign] = await db
    .select()
    .from(emailCampaigns)
    .where(eq(emailCampaigns.id, campaignId))
    .limit(1);

  return campaign || null;
}

/**
 * Send Campaign
 */

export async function sendCampaign(
  campaignId: string,
  recipientIds?: string[]
): Promise<{ success: boolean; sent: number; failed: number; error?: string }> {
  if (!db) {
    return { success: false, sent: 0, failed: 0, error: 'Database not available' };
  }

  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    return { success: false, sent: 0, failed: 0, error: 'Campaign not found' };
  }

  // Get recipients
  let subscribers: typeof emailSubscribers.$inferSelect[] = [];
  
  if (recipientIds && recipientIds.length > 0) {
    subscribers = await db
      .select()
      .from(emailSubscribers)
      .where(
        and(
          eq(emailSubscribers.websiteId, campaign.websiteId),
          eq(emailSubscribers.status, 'subscribed'),
          inArray(emailSubscribers.id, recipientIds)
        )
      );
  } else {
    // Get all subscribed subscribers for this website
    subscribers = await getSubscribers(campaign.websiteId, 'subscribed');
    
    // Apply segment filters if any
    if (campaign.segments && Array.isArray(campaign.segments) && campaign.segments.length > 0) {
      subscribers = subscribers.filter(sub => {
        const subTags = (sub.tags as string[] || []);
        return (campaign.segments as string[]).some((segment: string) => subTags.includes(segment));
      });
    }
  }

  if (subscribers.length === 0) {
    return { success: false, sent: 0, failed: 0, error: 'No recipients found' };
  }

  // Update campaign status
  await db
    .update(emailCampaigns)
    .set({
      status: 'sending',
      recipientCount: subscribers.length,
    })
    .where(eq(emailCampaigns.id, campaignId));

  let sent = 0;
  let failed = 0;

  // Send emails
  for (const subscriber of subscribers) {
    try {
      // Render template with subscriber variables
      const variables = {
        name: subscriber.name || 'there',
        email: subscriber.email,
        ...(subscriber.metadata as Record<string, string> || {}),
      };

      let subject = campaign.subject;
      let htmlContent = campaign.htmlContent;
      let textContent = campaign.textContent;

      // Replace variables
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value));
        if (textContent) {
          textContent = textContent.replace(new RegExp(placeholder, 'g'), String(value));
        }
      });

      // Send email
      const result = await sendEmail(
        subscriber.email,
        subject,
        htmlContent,
        textContent
      );

      if (result.success) {
        sent++;

        // Track email sent
        await db.insert(emailTracking).values({
          campaignId,
          subscriberId: subscriber.id,
          email: subscriber.email,
          eventType: 'sent',
          metadata: { messageId: result.messageId },
        });

        // Update subscriber last email sent
        await db
          .update(emailSubscribers)
          .set({ lastEmailSentAt: new Date() })
          .where(eq(emailSubscribers.id, subscriber.id));
      } else {
        failed++;
        console.error(`[EmailMarketing] Failed to send to ${subscriber.email}:`, result.error);
      }
    } catch (_error: unknown) {
      failed++;
      console.error(`[EmailMarketing] Error sending to ${subscriber.email}:`, _error);
    }
  }

  // Update campaign stats and status
  const stats = {
    sent,
    delivered: sent, // Assume delivered if sent successfully
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
  };

  await db
    .update(emailCampaigns)
    .set({
      status: 'sent',
      sentAt: new Date(),
      stats,
    })
    .where(eq(emailCampaigns.id, campaignId));

  return { success: true, sent, failed };
}

/**
 * Email Tracking
 */

export async function trackEmailEvent(
  campaignId: string | null,
  subscriberId: string | null,
  email: string,
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'complained',
  linkUrl?: string,
  userAgent?: string,
  ip?: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  if (!db) {
    return;
  }

  await db.insert(emailTracking).values({
    campaignId,
    subscriberId,
    email,
    eventType,
    linkUrl,
    userAgent,
    ip,
    metadata,
  });

  // Update campaign stats
  if (campaignId) {
    const campaign = await getCampaign(campaignId);
    if (campaign) {
      const stats = campaign.stats as Record<string, number> || {};
      stats[eventType] = (stats[eventType] || 0) + 1;

      await db
        .update(emailCampaigns)
        .set({ stats })
        .where(eq(emailCampaigns.id, campaignId));
    }
  }

  // Update subscriber tracking
  if (subscriberId) {
    const updates: Partial<typeof emailSubscribers.$inferInsert> = {};
    if (eventType === 'opened') {
      updates.lastEmailOpenedAt = new Date();
    } else if (eventType === 'clicked') {
      updates.lastEmailClickedAt = new Date();
    }

    if (Object.keys(updates).length > 0) {
      await db
        .update(emailSubscribers)
        .set(updates)
        .where(eq(emailSubscribers.id, subscriberId));
    }
  }
}

/**
 * Get Campaign Statistics
 */

export async function getCampaignStats(campaignId: string): Promise<{
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  clickThroughRate: number;
} | null> {
  if (!db) {
    return null;
  }

  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    return null;
  }

  const stats = campaign.stats as Record<string, number> || {};
  const sent = stats.sent || 0;
  const delivered = stats.delivered || 0;
  const opened = stats.opened || 0;
  const clicked = stats.clicked || 0;
  const bounced = stats.bounced || 0;
  const unsubscribed = stats.unsubscribed || 0;

  return {
    sent,
    delivered,
    opened,
    clicked,
    bounced,
    unsubscribed,
    openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
    clickRate: delivered > 0 ? (clicked / delivered) * 100 : 0,
    clickThroughRate: opened > 0 ? (clicked / opened) * 100 : 0,
  };
}

/**
 * Segment Management
 */

export async function getSegments(websiteId: string): Promise<string[]> {
  if (!db) {
    return [];
  }

  const subscribers = await getSubscribers(websiteId);
  const allTags = new Set<string>();
  
  subscribers.forEach(sub => {
    const tags = (sub.tags as string[] || []);
    tags.forEach(tag => allTags.add(tag));
  });

  return Array.from(allTags);
}

export async function createSegment(websiteId: string, name: string, tags: string[]): Promise<string> {
  // Segments are stored as tags on subscribers
  // This is a placeholder - in a full implementation, you'd have a segments table
  return name;
}

/**
 * Newsletter Templates (alias for email templates)
 */

export async function getNewsletterTemplates(websiteId: string): Promise<typeof emailTemplates.$inferSelect[]> {
  return await getEmailTemplates(websiteId, 'newsletter');
}

/**
 * Campaign Metrics
 */

export async function getCampaignMetrics(websiteId: string): Promise<{
  totalCampaigns: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  averageOpenRate: number;
  averageClickRate: number;
}> {
  if (!db) {
    return {
      totalCampaigns: 0,
      totalSent: 0,
      totalOpened: 0,
      totalClicked: 0,
      averageOpenRate: 0,
      averageClickRate: 0,
    };
  }

  const campaigns = await getCampaigns(websiteId);
  let totalSent = 0;
  let totalOpened = 0;
  let totalClicked = 0;

  campaigns.forEach(campaign => {
    const stats = (campaign.stats as Record<string, number>) || {};
    totalSent += stats.sent || 0;
    totalOpened += stats.opened || 0;
    totalClicked += stats.clicked || 0;
  });

  return {
    totalCampaigns: campaigns.length,
    totalSent,
    totalOpened,
    totalClicked,
    averageOpenRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
    averageClickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
  };
}

export async function updateCampaignMetrics(campaignId: string, metrics: Record<string, number>): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    const campaign = await getCampaign(campaignId);
    if (!campaign) {
      return false;
    }

    const stats = { ...(campaign.stats as Record<string, number> || {}), ...metrics };

    await db
      .update(emailCampaigns)
      .set({ stats })
      .where(eq(emailCampaigns.id, campaignId));

    return true;
  } catch (_error: unknown) {
    console.error('[EmailMarketing] Update metrics error:', _error);
    return false;
  }
}

/**
 * Template Variable Replacement
 */

export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  });
  return result;
}

/**
 * Remove Subscriber (alias for unsubscribe)
 */

export async function removeSubscriber(websiteId: string, email: string): Promise<boolean> {
  return await unsubscribeSubscriber(websiteId, email);
}
