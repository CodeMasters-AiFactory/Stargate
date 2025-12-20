/**
 * Self-Improvement Engine
 * 
 * Enables agents to learn, adapt, and propose upgrades based on:
 * - Performance feedback
 * - Internet research findings
 * - Pattern recognition
 * - Industry trends
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  UpgradeProposal,
  Feedback,
  TrendReport,
  Trend,
  RiskLevel,
} from '../types';
import { submitForApproval } from '../approval/ApprovalWorkflow';

// Learning storage (in production, use database)
const learningStore: Map<string, AgentLearning> = new Map();
const feedbackStore: Map<string, Feedback[]> = new Map();
const trendStore: Map<string, TrendReport[]> = new Map();

interface AgentLearning {
  agentId: string;
  agentName: string;
  patterns: LearnedPattern[];
  skills: LearnedSkill[];
  preferences: Record<string, unknown>;
  lastUpdated: Date;
}

interface LearnedPattern {
  id: string;
  category: string;
  pattern: string;
  confidence: number; // 0-1
  successRate: number; // 0-1
  usageCount: number;
  learnedAt: Date;
}

interface LearnedSkill {
  id: string;
  name: string;
  level: number; // 1-10
  description: string;
  acquiredAt: Date;
  lastUsed: Date;
}

/**
 * Record feedback for an agent
 */
export function recordFeedback(
  agentId: string,
  feedback: Feedback
): void {
  const existing = feedbackStore.get(agentId) || [];
  existing.push(feedback);
  feedbackStore.set(agentId, existing);
  
  console.log(`[SelfImprovement] 📝 Recorded feedback for ${agentId}: ${feedback.rating}/5`);
  
  // Analyze feedback for improvement opportunities
  analyzeFeedbackForImprovements(agentId, existing);
}

/**
 * Analyze feedback to identify improvement opportunities
 */
function analyzeFeedbackForImprovements(
  agentId: string,
  feedbackHistory: Feedback[]
): void {
  // Need at least 5 feedback entries to analyze
  if (feedbackHistory.length < 5) return;
  
  // Calculate average rating
  const avgRating = feedbackHistory.reduce((sum, f) => sum + f.rating, 0) / feedbackHistory.length;
  
  // If average is below 3.5, suggest improvement
  if (avgRating < 3.5) {
    console.log(`[SelfImprovement] ⚠️ Agent ${agentId} has low average rating (${avgRating.toFixed(1)})`);
    
    // Collect common improvement suggestions
    const improvements: string[] = [];
    for (const feedback of feedbackHistory) {
      if (feedback.specificImprovements) {
        improvements.push(...feedback.specificImprovements);
      }
    }
    
    if (improvements.length > 0) {
      // Find most common improvement suggestion
      const counts = new Map<string, number>();
      for (const imp of improvements) {
        counts.set(imp, (counts.get(imp) || 0) + 1);
      }
      
      const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
      const topImprovement = sorted[0];
      
      if (topImprovement && topImprovement[1] >= 2) {
        console.log(`[SelfImprovement] 💡 Common improvement request: ${topImprovement[0]}`);
      }
    }
  }
}

/**
 * Record trends discovered by an agent
 */
export function recordTrends(
  agentId: string,
  trendReport: TrendReport
): void {
  const existing = trendStore.get(agentId) || [];
  existing.push(trendReport);
  
  // Keep only last 10 reports
  if (existing.length > 10) {
    existing.shift();
  }
  
  trendStore.set(agentId, existing);
  
  console.log(`[SelfImprovement] 📊 Recorded ${trendReport.trends.length} trends for ${agentId}`);
  
  // Analyze trends for upgrade opportunities
  analyzeTrendsForUpgrades(agentId, trendReport);
}

/**
 * Analyze trends to suggest upgrades
 */
function analyzeTrendsForUpgrades(
  agentId: string,
  trendReport: TrendReport
): UpgradeProposal | null {
  // Find high-relevance emerging/growing trends
  const significantTrends = trendReport.trends.filter(
    t => t.relevance >= 80 && (t.popularity === 'emerging' || t.popularity === 'growing')
  );
  
  if (significantTrends.length === 0) return null;
  
  // Create upgrade proposal for the most relevant trend
  const topTrend = significantTrends[0];
  
  const proposal: UpgradeProposal = {
    id: uuidv4(),
    agentId,
    agentName: trendReport.agentId.split('-')[1] || 'Agent', // Extract name from ID
    currentVersion: '1.0.0', // Would be retrieved from agent
    proposedVersion: '1.1.0',
    title: `Incorporate "${topTrend.name}" Trend`,
    description: topTrend.description,
    reason: `This ${topTrend.popularity} trend has ${topTrend.relevance}% relevance to our domain.`,
    evidence: [{
      source: 'Trend Analysis',
      finding: topTrend.recommendation,
      relevance: 'high',
      dateFound: new Date(),
    }],
    expectedBenefits: [
      `Stay current with ${topTrend.name}`,
      'Improve output quality',
      'Better meet industry standards',
    ],
    riskAssessment: 'low',
    implementationPlan: [
      'Analyze current implementation',
      `Incorporate ${topTrend.name} patterns`,
      'Test new capabilities',
      'Update version',
    ],
    rollbackPlan: 'Revert to previous version if quality decreases',
    proposedAt: new Date(),
    status: 'pending',
  };
  
  // Submit for approval
  submitForApproval(proposal);
  
  return proposal;
}

/**
 * Learn a new pattern
 */
export function learnPattern(
  agentId: string,
  agentName: string,
  category: string,
  pattern: string,
  initialConfidence: number = 0.5
): LearnedPattern {
  const learning = getOrCreateLearning(agentId, agentName);
  
  // Check if pattern already exists
  const existing = learning.patterns.find(
    p => p.category === category && p.pattern === pattern
  );
  
  if (existing) {
    // Reinforce existing pattern
    existing.confidence = Math.min(1, existing.confidence + 0.1);
    existing.usageCount++;
    learning.lastUpdated = new Date();
    learningStore.set(agentId, learning);
    return existing;
  }
  
  // Add new pattern
  const newPattern: LearnedPattern = {
    id: uuidv4(),
    category,
    pattern,
    confidence: initialConfidence,
    successRate: 0.5,
    usageCount: 1,
    learnedAt: new Date(),
  };
  
  learning.patterns.push(newPattern);
  learning.lastUpdated = new Date();
  learningStore.set(agentId, learning);
  
  console.log(`[SelfImprovement] 🧠 ${agentName} learned new pattern: ${pattern}`);
  
  return newPattern;
}

/**
 * Update pattern success rate
 */
export function updatePatternSuccess(
  agentId: string,
  patternId: string,
  wasSuccessful: boolean
): void {
  const learning = learningStore.get(agentId);
  if (!learning) return;
  
  const pattern = learning.patterns.find(p => p.id === patternId);
  if (!pattern) return;
  
  // Update success rate with exponential moving average
  const alpha = 0.2;
  pattern.successRate = alpha * (wasSuccessful ? 1 : 0) + (1 - alpha) * pattern.successRate;
  pattern.usageCount++;
  
  // Update confidence based on success rate
  if (pattern.usageCount >= 5) {
    pattern.confidence = pattern.successRate;
  }
  
  learning.lastUpdated = new Date();
  learningStore.set(agentId, learning);
}

/**
 * Acquire a new skill
 */
export function acquireSkill(
  agentId: string,
  agentName: string,
  skillName: string,
  description: string,
  initialLevel: number = 1
): LearnedSkill {
  const learning = getOrCreateLearning(agentId, agentName);
  
  // Check if skill exists
  const existing = learning.skills.find(s => s.name === skillName);
  if (existing) {
    // Level up existing skill
    existing.level = Math.min(10, existing.level + 1);
    existing.lastUsed = new Date();
    learning.lastUpdated = new Date();
    learningStore.set(agentId, learning);
    
    console.log(`[SelfImprovement] 📈 ${agentName} leveled up skill: ${skillName} (Level ${existing.level})`);
    return existing;
  }
  
  // Add new skill
  const newSkill: LearnedSkill = {
    id: uuidv4(),
    name: skillName,
    level: initialLevel,
    description,
    acquiredAt: new Date(),
    lastUsed: new Date(),
  };
  
  learning.skills.push(newSkill);
  learning.lastUpdated = new Date();
  learningStore.set(agentId, learning);
  
  console.log(`[SelfImprovement] ⭐ ${agentName} acquired new skill: ${skillName}`);
  
  return newSkill;
}

/**
 * Get agent's learning data
 */
export function getAgentLearning(agentId: string): AgentLearning | undefined {
  return learningStore.get(agentId);
}

/**
 * Get agent's feedback history
 */
export function getAgentFeedback(agentId: string): Feedback[] {
  return feedbackStore.get(agentId) || [];
}

/**
 * Get agent's trend history
 */
export function getAgentTrends(agentId: string): TrendReport[] {
  return trendStore.get(agentId) || [];
}

/**
 * Generate improvement proposal from learning data
 */
export function generateImprovementProposal(
  agentId: string,
  agentName: string,
  currentVersion: string
): UpgradeProposal | null {
  const learning = learningStore.get(agentId);
  const feedback = feedbackStore.get(agentId) || [];
  const trends = trendStore.get(agentId) || [];
  
  // Calculate improvement areas
  const improvements: { area: string; evidence: string; impact: number }[] = [];
  
  // Check feedback for improvement areas
  if (feedback.length >= 5) {
    const avgRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
    if (avgRating < 4) {
      improvements.push({
        area: 'Quality',
        evidence: `Average feedback rating: ${avgRating.toFixed(1)}/5`,
        impact: (4 - avgRating) * 10,
      });
    }
  }
  
  // Check for high-relevance unimplemented trends
  if (trends.length > 0) {
    const latestTrends = trends[trends.length - 1];
    const emergingTrends = latestTrends.trends.filter(
      t => t.relevance >= 85 && t.popularity === 'emerging'
    );
    if (emergingTrends.length > 0) {
      improvements.push({
        area: 'Trends',
        evidence: `${emergingTrends.length} high-relevance emerging trends identified`,
        impact: emergingTrends.length * 5,
      });
    }
  }
  
  // Check for low-confidence patterns
  if (learning) {
    const lowConfidence = learning.patterns.filter(p => p.confidence < 0.5);
    if (lowConfidence.length >= 3) {
      improvements.push({
        area: 'Pattern Recognition',
        evidence: `${lowConfidence.length} patterns with low confidence`,
        impact: lowConfidence.length * 3,
      });
    }
  }
  
  // If no significant improvements needed, return null
  if (improvements.length === 0) {
    return null;
  }
  
  // Sort by impact and create proposal
  improvements.sort((a, b) => b.impact - a.impact);
  const topImprovement = improvements[0];
  
  // Determine risk level based on impact
  const risk: RiskLevel = topImprovement.impact > 20 ? 'medium' : 'low';
  
  // Determine version increment
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  const proposedVersion = risk === 'medium' 
    ? `${major}.${minor + 1}.0`
    : `${major}.${minor}.${patch + 1}`;
  
  const proposal: UpgradeProposal = {
    id: uuidv4(),
    agentId,
    agentName,
    currentVersion,
    proposedVersion,
    title: `${topImprovement.area} Improvement`,
    description: `Improve ${agentName}'s ${topImprovement.area.toLowerCase()} based on learned data`,
    reason: topImprovement.evidence,
    evidence: improvements.map(imp => ({
      source: 'Self-Analysis',
      finding: imp.evidence,
      relevance: imp.impact > 10 ? 'high' : 'medium',
      dateFound: new Date(),
    })),
    expectedBenefits: [
      `Improved ${topImprovement.area.toLowerCase()}`,
      'Better task completion rate',
      'Higher quality outputs',
    ],
    riskAssessment: risk,
    implementationPlan: [
      'Analyze current weaknesses',
      'Implement improvements',
      'Validate changes',
      'Update version',
    ],
    rollbackPlan: `Revert to v${currentVersion}`,
    proposedAt: new Date(),
    status: 'pending',
  };
  
  // Submit for approval
  submitForApproval(proposal);
  
  return proposal;
}

/**
 * Get or create learning data for an agent
 */
function getOrCreateLearning(agentId: string, agentName: string): AgentLearning {
  let learning = learningStore.get(agentId);
  
  if (!learning) {
    learning = {
      agentId,
      agentName,
      patterns: [],
      skills: [],
      preferences: {},
      lastUpdated: new Date(),
    };
    learningStore.set(agentId, learning);
  }
  
  return learning;
}

/**
 * Get summary of all agent learning
 */
export function getLearningsSummary(): {
  totalAgents: number;
  totalPatterns: number;
  totalSkills: number;
  totalFeedback: number;
} {
  let totalPatterns = 0;
  let totalSkills = 0;
  let totalFeedback = 0;
  
  for (const learning of learningStore.values()) {
    totalPatterns += learning.patterns.length;
    totalSkills += learning.skills.length;
  }
  
  for (const feedback of feedbackStore.values()) {
    totalFeedback += feedback.length;
  }
  
  return {
    totalAgents: learningStore.size,
    totalPatterns,
    totalSkills,
    totalFeedback,
  };
}

