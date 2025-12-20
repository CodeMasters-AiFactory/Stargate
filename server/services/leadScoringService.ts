/**
 * Lead Scoring Service
 * Phase 3.3: Marketing Automation - Lead scoring and qualification
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ScoringRule {
  id: string;
  name: string;
  type: 'behavioral' | 'demographic' | 'engagement' | 'custom';
  condition: {
    field: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists' | 'notExists';
    value: any;
  };
  score: number;
  enabled: boolean;
}

export interface ScoringCriteria {
  id: string;
  websiteId: string;
  name: string;
  rules: ScoringRule[];
  thresholds: {
    hot: number;
    warm: number;
    cold: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  websiteId: string;
  email: string;
  name?: string;
  metadata: Record<string, any>;
  behavior: {
    pageViews: number;
    downloads: number;
    formSubmissions: number;
    emailClicks: number;
    emailOpens: number;
    timeOnSite: number; // in seconds
    lastActivity: Date;
  };
  demographics: {
    company?: string;
    industry?: string;
    companySize?: string;
    location?: string;
    jobTitle?: string;
  };
  scores: {
    behavioral: number;
    demographic: number;
    engagement: number;
    custom: number;
    total: number;
  };
  qualification: 'hot' | 'warm' | 'cold' | 'unqualified';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get lead scoring directory
 */
function getLeadScoringDir(websiteId: string): string {
  const projectDir = path.join(process.cwd(), 'website_projects', websiteId);
  const scoringDir = path.join(projectDir, 'lead-scoring');
  
  if (!fs.existsSync(scoringDir)) {
    fs.mkdirSync(scoringDir, { recursive: true });
  }
  
  return scoringDir;
}

/**
 * Scoring Criteria Management
 */

export async function getScoringCriteria(websiteId: string): Promise<ScoringCriteria[]> {
  const scoringDir = getLeadScoringDir(websiteId);
  const criteriaPath = path.join(scoringDir, 'criteria.json');
  
  if (!fs.existsSync(criteriaPath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(criteriaPath, 'utf-8');
    const criteria: ScoringCriteria[] = JSON.parse(content);
    return criteria.map(c => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    }));
  } catch (error) {
    console.error(`[Lead Scoring] Failed to load criteria for ${websiteId}:`, error);
    return [];
  }
}

export async function getScoringCriterion(websiteId: string, criteriaId: string): Promise<ScoringCriteria | null> {
  const criteria = await getScoringCriteria(websiteId);
  return criteria.find(c => c.id === criteriaId) || null;
}

export async function saveScoringCriteria(websiteId: string, criterion: ScoringCriteria): Promise<void> {
  const scoringDir = getLeadScoringDir(websiteId);
  const criteriaPath = path.join(scoringDir, 'criteria.json');
  
  const criteria = await getScoringCriteria(websiteId);
  const existingIndex = criteria.findIndex(c => c.id === criterion.id);
  
  if (existingIndex >= 0) {
    criteria[existingIndex] = { ...criterion, updatedAt: new Date() };
  } else {
    criteria.push({ ...criterion, createdAt: new Date(), updatedAt: new Date() });
  }
  
  fs.writeFileSync(criteriaPath, JSON.stringify(criteria, null, 2), 'utf-8');
  console.log(`[Lead Scoring] Saved criteria: ${criterion.name} (${criterion.id}) for ${websiteId}`);
}

export async function deleteScoringCriteria(websiteId: string, criteriaId: string): Promise<void> {
  const scoringDir = getLeadScoringDir(websiteId);
  const criteriaPath = path.join(scoringDir, 'criteria.json');
  
  const criteria = await getScoringCriteria(websiteId);
  const filtered = criteria.filter(c => c.id !== criteriaId);
  
  fs.writeFileSync(criteriaPath, JSON.stringify(filtered, null, 2), 'utf-8');
  console.log(`[Lead Scoring] Deleted criteria: ${criteriaId} for ${websiteId}`);
}

/**
 * Lead Management
 */

export async function getLeads(websiteId: string): Promise<Lead[]> {
  const scoringDir = getLeadScoringDir(websiteId);
  const leadsPath = path.join(scoringDir, 'leads.json');
  
  if (!fs.existsSync(leadsPath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(leadsPath, 'utf-8');
    const leads: Lead[] = JSON.parse(content);
    return leads.map(lead => ({
      ...lead,
      behavior: {
        ...lead.behavior,
        lastActivity: new Date(lead.behavior.lastActivity),
      },
      createdAt: new Date(lead.createdAt),
      updatedAt: new Date(lead.updatedAt),
    }));
  } catch (error) {
    console.error(`[Lead Scoring] Failed to load leads for ${websiteId}:`, error);
    return [];
  }
}

export async function getLead(websiteId: string, leadId: string): Promise<Lead | null> {
  const leads = await getLeads(websiteId);
  return leads.find(l => l.id === leadId) || null;
}

export async function saveLead(websiteId: string, lead: Lead): Promise<void> {
  const scoringDir = getLeadScoringDir(websiteId);
  const leadsPath = path.join(scoringDir, 'leads.json');
  
  const leads = await getLeads(websiteId);
  const existingIndex = leads.findIndex(l => l.id === lead.id);
  
  if (existingIndex >= 0) {
    leads[existingIndex] = { ...lead, updatedAt: new Date() };
  } else {
    leads.push({ ...lead, createdAt: new Date(), updatedAt: new Date() });
  }
  
  fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2), 'utf-8');
  console.log(`[Lead Scoring] Saved lead: ${lead.email} (${lead.id}) for ${websiteId}`);
}

/**
 * Calculate lead scores
 */
export async function calculateLeadScore(
  websiteId: string,
  lead: Lead,
  criteria?: ScoringCriteria
): Promise<Lead> {
  const criteriaList = criteria ? [criteria] : await getScoringCriteria(websiteId);
  
  if (criteriaList.length === 0) {
    // Default scoring if no criteria defined
    return calculateDefaultScore(lead);
  }
  
  // Use the first active criteria (or most recent)
  const activeCriteria = criteriaList.find(c => c.rules.some(r => r.enabled)) || criteriaList[0];
  
  let behavioralScore = 0;
  let demographicScore = 0;
  let engagementScore = 0;
  let customScore = 0;
  
  // Apply enabled rules
  activeCriteria.rules
    .filter(rule => rule.enabled)
    .forEach(rule => {
      const matches = evaluateRule(lead, rule);
      if (matches) {
        switch (rule.type) {
          case 'behavioral':
            behavioralScore += rule.score;
            break;
          case 'demographic':
            demographicScore += rule.score;
            break;
          case 'engagement':
            engagementScore += rule.score;
            break;
          case 'custom':
            customScore += rule.score;
            break;
        }
      }
    });
  
  // Calculate total score
  const totalScore = behavioralScore + demographicScore + engagementScore + customScore;
  
  // Determine qualification level
  let qualification: Lead['qualification'] = 'unqualified';
  if (totalScore >= activeCriteria.thresholds.hot) {
    qualification = 'hot';
  } else if (totalScore >= activeCriteria.thresholds.warm) {
    qualification = 'warm';
  } else if (totalScore >= activeCriteria.thresholds.cold) {
    qualification = 'cold';
  }
  
  // Update lead scores
  lead.scores = {
    behavioral: behavioralScore,
    demographic: demographicScore,
    engagement: engagementScore,
    custom: customScore,
    total: totalScore,
  };
  lead.qualification = qualification;
  lead.updatedAt = new Date();
  
  return lead;
}

/**
 * Evaluate if a rule matches a lead
 */
function evaluateRule(lead: Lead, rule: ScoringRule): boolean {
  const { condition } = rule;
  const { field, operator, value } = condition;
  
  let fieldValue: any;
  
  // Get value from appropriate source
  if (field.startsWith('behavior.')) {
    const behaviorField = field.replace('behavior.', '');
    fieldValue = lead.behavior[behaviorField as keyof typeof lead.behavior];
  } else if (field.startsWith('demographics.')) {
    const demoField = field.replace('demographics.', '');
    fieldValue = lead.demographics[demoField as keyof typeof lead.demographics];
  } else if (field.startsWith('metadata.')) {
    const metaField = field.replace('metadata.', '');
    fieldValue = lead.metadata[metaField];
  } else {
    fieldValue = (lead as any)[field];
  }
  
  // Evaluate operator
  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'contains':
      return String(fieldValue || '').toLowerCase().includes(String(value).toLowerCase());
    case 'greaterThan':
      return Number(fieldValue || 0) > Number(value);
    case 'lessThan':
      return Number(fieldValue || 0) < Number(value);
    case 'exists':
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
    case 'notExists':
      return fieldValue === undefined || fieldValue === null || fieldValue === '';
    default:
      return false;
  }
}

/**
 * Default scoring algorithm
 */
function calculateDefaultScore(lead: Lead): Lead {
  let behavioralScore = 0;
  let engagementScore = 0;
  
  // Behavioral scoring (default weights)
  behavioralScore += lead.behavior.pageViews * 2;
  behavioralScore += lead.behavior.downloads * 10;
  behavioralScore += lead.behavior.formSubmissions * 15;
  
  // Engagement scoring
  engagementScore += lead.behavior.emailOpens * 5;
  engagementScore += lead.behavior.emailClicks * 10;
  engagementScore += Math.min(lead.behavior.timeOnSite / 60, 10); // Max 10 points for time
  
  const totalScore = behavioralScore + engagementScore;
  
  // Default thresholds
  let qualification: Lead['qualification'] = 'unqualified';
  if (totalScore >= 50) {
    qualification = 'hot';
  } else if (totalScore >= 25) {
    qualification = 'warm';
  } else if (totalScore >= 10) {
    qualification = 'cold';
  }
  
  lead.scores = {
    behavioral: behavioralScore,
    demographic: 0,
    engagement: engagementScore,
    custom: 0,
    total: totalScore,
  };
  lead.qualification = qualification;
  
  return lead;
}

/**
 * Update lead behavior
 */
export async function updateLeadBehavior(
  websiteId: string,
  leadId: string,
  behaviorUpdate: Partial<Lead['behavior']>
): Promise<Lead | null> {
  const lead = await getLead(websiteId, leadId);
  if (!lead) return null;
  
  lead.behavior = {
    ...lead.behavior,
    ...behaviorUpdate,
    lastActivity: new Date(),
  };
  
  // Recalculate scores
  const updatedLead = await calculateLeadScore(websiteId, lead);
  await saveLead(websiteId, updatedLead);
  
  return updatedLead;
}

/**
 * Batch score leads
 */
export async function batchScoreLeads(websiteId: string): Promise<{ scored: number; errors: number }> {
  const leads = await getLeads(websiteId);
  let scored = 0;
  let errors = 0;
  
  for (const lead of leads) {
    try {
      const scoredLead = await calculateLeadScore(websiteId, lead);
      await saveLead(websiteId, scoredLead);
      scored++;
    } catch (error) {
      console.error(`[Lead Scoring] Failed to score lead ${lead.id}:`, error);
      errors++;
    }
  }
  
  return { scored, errors };
}

