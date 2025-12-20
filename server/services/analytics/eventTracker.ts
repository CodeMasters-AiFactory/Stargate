/**
 * Advanced Event Tracker Service
 * Phase 3.5: Advanced Analytics - Enhanced event tracking and collection
 */

import * as fs from 'fs';
import * as path from 'path';

export interface AdvancedAnalyticsEvent {
  id: string;
  websiteId: string;
  sessionId: string;
  visitorId: string;
  eventType: string;
  eventCategory: 'page' | 'user' | 'ecommerce' | 'custom' | 'performance' | 'error';
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  path?: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  device?: {
    type: 'desktop' | 'mobile' | 'tablet';
    os?: string;
    browser?: string;
    screen?: { width: number; height: number };
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface EventBatch {
  websiteId: string;
  events: AdvancedAnalyticsEvent[];
  receivedAt: Date;
}

/**
 * Get analytics directory
 */
function getAnalyticsDir(websiteId: string): string {
  const projectDir = path.join(process.cwd(), 'website_projects', websiteId);
  const analyticsDir = path.join(projectDir, 'analytics');
  
  if (!fs.existsSync(analyticsDir)) {
    fs.mkdirSync(analyticsDir, { recursive: true });
  }
  
  return analyticsDir;
}

/**
 * Track a single event
 */
export async function trackEvent(event: Omit<AdvancedAnalyticsEvent, 'id' | 'timestamp'>): Promise<AdvancedAnalyticsEvent> {
  const analyticsEvent: AdvancedAnalyticsEvent = {
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...event,
    timestamp: new Date(),
  };
  
  await saveEvent(analyticsEvent);
  
  return analyticsEvent;
}

/**
 * Track multiple events in batch
 */
export async function trackEventBatch(batch: EventBatch): Promise<{ saved: number; errors: number }> {
  let saved = 0;
  let errors = 0;
  
  for (const event of batch.events) {
    try {
      await trackEvent(event);
      saved++;
    } catch (error) {
      console.error(`[Event Tracker] Failed to track event:`, error);
      errors++;
    }
  }
  
  return { saved, errors };
}

/**
 * Save event to storage
 */
async function saveEvent(event: AdvancedAnalyticsEvent): Promise<void> {
  const analyticsDir = getAnalyticsDir(event.websiteId);
  const eventsDir = path.join(analyticsDir, 'events');
  
  if (!fs.existsSync(eventsDir)) {
    fs.mkdirSync(eventsDir, { recursive: true });
  }
  
  // Store events by date (YYYY-MM-DD format)
  const dateStr = event.timestamp.toISOString().split('T')[0];
  const eventsPath = path.join(eventsDir, `${dateStr}.json`);
  
  let events: AdvancedAnalyticsEvent[] = [];
  if (fs.existsSync(eventsPath)) {
    try {
      const content = fs.readFileSync(eventsPath, 'utf-8');
      events = JSON.parse(content);
    } catch (error) {
      console.error(`[Event Tracker] Failed to load events for ${dateStr}:`, error);
    }
  }
  
  events.push(event);
  
  // Keep only last 100,000 events per day (for performance)
  if (events.length > 100000) {
    events = events.slice(-100000);
  }
  
  fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf-8');
}

/**
 * Get events for a date range
 */
export async function getEvents(
  websiteId: string,
  startDate: Date,
  endDate: Date,
  filters?: {
    eventType?: string;
    eventCategory?: string;
    sessionId?: string;
    visitorId?: string;
  }
): Promise<AdvancedAnalyticsEvent[]> {
  const analyticsDir = getAnalyticsDir(websiteId);
  const eventsDir = path.join(analyticsDir, 'events');
  
  if (!fs.existsSync(eventsDir)) {
    return [];
  }
  
  const events: AdvancedAnalyticsEvent[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const eventsPath = path.join(eventsDir, `${dateStr}.json`);
    
    if (fs.existsSync(eventsPath)) {
      try {
        const content = fs.readFileSync(eventsPath, 'utf-8');
        const dayEvents: AdvancedAnalyticsEvent[] = JSON.parse(content);
        
        // Apply filters
        let filteredEvents = dayEvents;
        if (filters) {
          if (filters.eventType) {
            filteredEvents = filteredEvents.filter(e => e.eventType === filters.eventType);
          }
          if (filters.eventCategory) {
            filteredEvents = filteredEvents.filter(e => e.eventCategory === filters.eventCategory);
          }
          if (filters.sessionId) {
            filteredEvents = filteredEvents.filter(e => e.sessionId === filters.sessionId);
          }
          if (filters.visitorId) {
            filteredEvents = filteredEvents.filter(e => e.visitorId === filters.visitorId);
          }
        }
        
        // Filter by timestamp range
        filteredEvents = filteredEvents.filter(e => {
          const eventTime = new Date(e.timestamp);
          return eventTime >= startDate && eventTime <= endDate;
        });
        
        events.push(...filteredEvents);
      } catch (error) {
        console.error(`[Event Tracker] Failed to load events for ${dateStr}:`, error);
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Sort by timestamp
  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  return events;
}

/**
 * Detect device type from user agent
 */
export function detectDevice(userAgent?: string): AdvancedAnalyticsEvent['device'] {
  if (!userAgent) {
    return { type: 'desktop' };
  }
  
  const ua = userAgent.toLowerCase();
  
  // Detect device type
  let type: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (ua.includes('mobile') || ua.includes('android')) {
    type = 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    type = 'tablet';
  }
  
  // Detect OS
  let os: string | undefined;
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  // Detect browser
  let browser: string | undefined;
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';
  
  return { type, os, browser };
}

/**
 * Generate unique visitor ID (stored in localStorage)
 */
export function generateVisitorId(): string {
  return `visitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

