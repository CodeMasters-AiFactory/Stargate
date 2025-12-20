/**
 * Marketing Funnel Service
 * Phase 3.3: Marketing Automation - Visual funnel builder and conversion tracking
 */

import * as fs from 'fs';
import * as path from 'path';

export interface FunnelStage {
  id: string;
  name: string;
  type: 'awareness' | 'interest' | 'consideration' | 'purchase' | 'loyalty' | 'custom';
  position: number;
  description?: string;
  conversionGoal?: {
    type: 'page_view' | 'form_submit' | 'purchase' | 'download' | 'signup' | 'custom';
    value: string; // URL, form ID, etc.
    metric: 'count' | 'revenue' | 'time';
  };
  requiredEvents?: string[]; // Events that must occur in this stage
}

export interface Funnel {
  id: string;
  websiteId: string;
  name: string;
  description?: string;
  stages: FunnelStage[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    totalVisitors: number;
    stageConversions: Record<string, number>; // stageId -> conversions
    stageDropoffs: Record<string, number>; // stageId -> dropoffs
    conversionRates: Record<string, number>; // stageId -> rate
    totalConversions: number;
    overallConversionRate: number;
    averageTimeToConvert: number; // in hours
    revenue?: number;
    averageOrderValue?: number;
  };
}

export interface FunnelEvent {
  id: string;
  funnelId: string;
  websiteId: string;
  visitorId: string;
  stageId: string;
  eventType: 'enter' | 'view' | 'convert' | 'exit';
  eventData?: Record<string, any>;
  timestamp: Date;
  revenue?: number;
}

export interface FunnelVisitor {
  id: string;
  funnelId: string;
  websiteId: string;
  visitorId: string;
  currentStageId: string;
  enteredAt: Date;
  lastActivity: Date;
  completedAt?: Date;
  converted: boolean;
  metadata: Record<string, any>;
}

/**
 * Get funnel directory
 */
function getFunnelDir(websiteId: string): string {
  const projectDir = path.join(process.cwd(), 'website_projects', websiteId);
  const funnelDir = path.join(projectDir, 'funnels');
  
  if (!fs.existsSync(funnelDir)) {
    fs.mkdirSync(funnelDir, { recursive: true });
  }
  
  return funnelDir;
}

/**
 * Funnel Management
 */

export async function getFunnels(websiteId: string): Promise<Funnel[]> {
  const funnelDir = getFunnelDir(websiteId);
  const funnelsPath = path.join(funnelDir, 'funnels.json');
  
  if (!fs.existsSync(funnelsPath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(funnelsPath, 'utf-8');
    const funnels: Funnel[] = JSON.parse(content);
    return funnels.map(f => ({
      ...f,
      createdAt: new Date(f.createdAt),
      updatedAt: new Date(f.updatedAt),
    }));
  } catch (error) {
    console.error(`[Funnel] Failed to load funnels for ${websiteId}:`, error);
    return [];
  }
}

export async function getFunnel(websiteId: string, funnelId: string): Promise<Funnel | null> {
  const funnels = await getFunnels(websiteId);
  return funnels.find(f => f.id === funnelId) || null;
}

export async function saveFunnel(websiteId: string, funnel: Funnel): Promise<void> {
  const funnelDir = getFunnelDir(websiteId);
  const funnelsPath = path.join(funnelDir, 'funnels.json');
  
  const funnels = await getFunnels(websiteId);
  const existingIndex = funnels.findIndex(f => f.id === funnel.id);
  
  if (existingIndex >= 0) {
    funnels[existingIndex] = { ...funnel, updatedAt: new Date() };
  } else {
    funnels.push({ ...funnel, createdAt: new Date(), updatedAt: new Date() });
  }
  
  fs.writeFileSync(funnelsPath, JSON.stringify(funnels, null, 2), 'utf-8');
  console.log(`[Funnel] Saved funnel: ${funnel.name} (${funnel.id}) for ${websiteId}`);
}

export async function deleteFunnel(websiteId: string, funnelId: string): Promise<void> {
  const funnelDir = getFunnelDir(websiteId);
  const funnelsPath = path.join(funnelDir, 'funnels.json');
  
  const funnels = await getFunnels(websiteId);
  const filtered = funnels.filter(f => f.id !== funnelId);
  
  fs.writeFileSync(funnelsPath, JSON.stringify(filtered, null, 2), 'utf-8');
  console.log(`[Funnel] Deleted funnel: ${funnelId} for ${websiteId}`);
}

/**
 * Track funnel event
 */
export async function trackFunnelEvent(
  websiteId: string,
  funnelId: string,
  visitorId: string,
  event: Omit<FunnelEvent, 'id' | 'timestamp'>
): Promise<FunnelEvent> {
  const funnelEvent: FunnelEvent = {
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...event,
    timestamp: new Date(),
  };
  
  await saveFunnelEvent(websiteId, funnelEvent);
  await updateFunnelVisitor(websiteId, funnelId, visitorId, event);
  await updateFunnelStats(websiteId, funnelId, funnelEvent);
  
  return funnelEvent;
}

async function saveFunnelEvent(websiteId: string, event: FunnelEvent): Promise<void> {
  const funnelDir = getFunnelDir(websiteId);
  const eventsDir = path.join(funnelDir, 'events');
  
  if (!fs.existsSync(eventsDir)) {
    fs.mkdirSync(eventsDir, { recursive: true });
  }
  
  const eventsPath = path.join(eventsDir, `${event.funnelId}.json`);
  
  let events: FunnelEvent[] = [];
  if (fs.existsSync(eventsPath)) {
    try {
      const content = fs.readFileSync(eventsPath, 'utf-8');
      events = JSON.parse(content);
    } catch (error) {
      console.error(`[Funnel] Failed to load events for funnel ${event.funnelId}:`, error);
    }
  }
  
  events.push(event);
  
  // Keep only last 10000 events per funnel
  if (events.length > 10000) {
    events = events.slice(-10000);
  }
  
  fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf-8');
}

async function updateFunnelVisitor(
  websiteId: string,
  funnelId: string,
  visitorId: string,
  event: Omit<FunnelEvent, 'id' | 'timestamp'>
): Promise<void> {
  const funnelDir = getFunnelDir(websiteId);
  const visitorsDir = path.join(funnelDir, 'visitors');
  
  if (!fs.existsSync(visitorsDir)) {
    fs.mkdirSync(visitorsDir, { recursive: true });
  }
  
  const visitorsPath = path.join(visitorsDir, `${funnelId}.json`);
  
  let visitors: FunnelVisitor[] = [];
  if (fs.existsSync(visitorsPath)) {
    try {
      const content = fs.readFileSync(visitorsPath, 'utf-8');
      visitors = JSON.parse(content);
    } catch (error) {
      console.error(`[Funnel] Failed to load visitors for funnel ${funnelId}:`, error);
    }
  }
  
  let visitor = visitors.find(v => v.visitorId === visitorId);
  
  if (!visitor) {
    // New visitor entering funnel
    const funnel = await getFunnel(websiteId, funnelId);
    if (!funnel || !funnel.stages[0]) {
      return; // Funnel not found or has no stages
    }
    
    visitor = {
      id: `visitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      funnelId,
      websiteId,
      visitorId,
      currentStageId: funnel.stages[0].id,
      enteredAt: new Date(),
      lastActivity: new Date(),
      converted: false,
      metadata: {},
    };
    visitors.push(visitor);
  }
  
  // Update visitor based on event
  if (event.eventType === 'convert') {
    visitor.converted = true;
    visitor.completedAt = new Date();
  } else if (event.eventType === 'enter' || event.eventType === 'view') {
    visitor.currentStageId = event.stageId;
  }
  
  visitor.lastActivity = new Date();
  if (event.eventData) {
    visitor.metadata = { ...visitor.metadata, ...event.eventData };
  }
  
  fs.writeFileSync(visitorsPath, JSON.stringify(visitors, null, 2), 'utf-8');
}

async function updateFunnelStats(websiteId: string, funnelId: string, event: FunnelEvent): Promise<void> {
  const funnel = await getFunnel(websiteId, funnelId);
  if (!funnel) return;
  
  // Initialize stats if needed
  if (!funnel.stats) {
    funnel.stats = {
      totalVisitors: 0,
      stageConversions: {},
      stageDropoffs: {},
      conversionRates: {},
      totalConversions: 0,
      overallConversionRate: 0,
      averageTimeToConvert: 0,
    };
  }
  
  // Update stats based on event
  if (event.eventType === 'enter') {
    funnel.stats.totalVisitors++;
    
    // Initialize stage conversion tracking
    if (!funnel.stats.stageConversions[event.stageId]) {
      funnel.stats.stageConversions[event.stageId] = 0;
      funnel.stats.stageDropoffs[event.stageId] = 0;
    }
  } else if (event.eventType === 'convert') {
    funnel.stats.stageConversions[event.stageId] = (funnel.stats.stageConversions[event.stageId] || 0) + 1;
    funnel.stats.totalConversions++;
    
    if (event.revenue) {
      funnel.stats.revenue = (funnel.stats.revenue || 0) + event.revenue;
      funnel.stats.averageOrderValue = funnel.stats.totalConversions > 0
        ? (funnel.stats.revenue || 0) / funnel.stats.totalConversions
        : 0;
    }
  } else if (event.eventType === 'exit') {
    funnel.stats.stageDropoffs[event.stageId] = (funnel.stats.stageDropoffs[event.stageId] || 0) + 1;
  }
  
  // Calculate conversion rates for each stage
  funnel.stages.forEach((stage, index) => {
    const stageId = stage.id;
    const previousStage = index > 0 ? funnel.stages[index - 1] : null;
    
    if (previousStage) {
      const previousConversions = funnel.stats.stageConversions[previousStage.id] || 0;
      const currentConversions = funnel.stats.stageConversions[stageId] || 0;
      
      funnel.stats.conversionRates[stageId] = previousConversions > 0
        ? (currentConversions / previousConversions) * 100
        : 0;
    } else {
      // First stage conversion rate
      const conversions = funnel.stats.stageConversions[stageId] || 0;
      funnel.stats.conversionRates[stageId] = funnel.stats.totalVisitors > 0
        ? (conversions / funnel.stats.totalVisitors) * 100
        : 0;
    }
  });
  
  // Calculate overall conversion rate
  funnel.stats.overallConversionRate = funnel.stats.totalVisitors > 0
    ? (funnel.stats.totalConversions / funnel.stats.totalVisitors) * 100
    : 0;
  
  await saveFunnel(websiteId, funnel);
}

/**
 * Get funnel analytics
 */
export async function getFunnelAnalytics(websiteId: string, funnelId: string): Promise<any> {
  const funnel = await getFunnel(websiteId, funnelId);
  if (!funnel) {
    return null;
  }
  
  const funnelDir = getFunnelDir(websiteId);
  const visitorsPath = path.join(funnelDir, 'visitors', `${funnelId}.json`);
  
  let visitors: FunnelVisitor[] = [];
  if (fs.existsSync(visitorsPath)) {
    try {
      const content = fs.readFileSync(visitorsPath, 'utf-8');
      visitors = JSON.parse(content);
    } catch (error) {
      console.error(`[Funnel] Failed to load visitors:`, error);
    }
  }
  
  // Calculate average time to convert
  const convertedVisitors = visitors.filter(v => v.converted && v.completedAt);
  let averageTimeToConvert = 0;
  
  if (convertedVisitors.length > 0) {
    const totalTime = convertedVisitors.reduce((sum, v) => {
      const timeToConvert = (v.completedAt!.getTime() - v.enteredAt.getTime()) / (1000 * 60 * 60); // hours
      return sum + timeToConvert;
    }, 0);
    averageTimeToConvert = totalTime / convertedVisitors.length;
  }
  
  return {
    ...funnel.stats,
    averageTimeToConvert,
    activeVisitors: visitors.filter(v => !v.converted && !v.completedAt).length,
    stageAnalytics: funnel.stages.map(stage => ({
      stageId: stage.id,
      stageName: stage.name,
      conversions: funnel.stats.stageConversions[stage.id] || 0,
      dropoffs: funnel.stats.stageDropoffs[stage.id] || 0,
      conversionRate: funnel.stats.conversionRates[stage.id] || 0,
      visitorsInStage: visitors.filter(v => v.currentStageId === stage.id).length,
    })),
  };
}

