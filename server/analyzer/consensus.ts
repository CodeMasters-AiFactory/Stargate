/**
 * Consensus Engine v4.0
 * Combines 5 expert evaluations into final verdict
 */

import type { ExpertEvaluation } from './expertAgents';

export interface ConsensusResult {
  industry: string;
  weights: Record<string, number>;
  normalizedScores: Record<string, number>;
  weightedScore: number;
  anomalies: string[];
  finalVerdict: 'Poor' | 'OK' | 'Good' | 'Excellent' | 'World-Class';
  expertAgreement: number; // 0-100
}

/**
 * Industry-specific weight profiles
 */
const INDUSTRY_WEIGHTS: Record<string, Record<string, number>> = {
  'saas': {
    ux: 0.30,
    conversion: 0.30,
    branding: 0.20,
    visual: 0.20
  },
  'law': {
    content: 0.40,
    trust: 0.25,
    ux: 0.20,
    visual: 0.10,
    brand: 0.05
  },
  'creative-agency': {
    visual: 0.40,
    creativity: 0.30,
    brand: 0.20,
    ux: 0.10
  },
  'ecommerce': {
    conversion: 0.35,
    ux: 0.25,
    visual: 0.20,
    seo: 0.20
  },
  'medical': {
    trust: 0.40,
    content: 0.30,
    ux: 0.20,
    visual: 0.10
  },
  'real-estate': {
    visual: 0.35,
    trust: 0.25,
    ux: 0.20,
    seo: 0.20
  },
  'automotive': {
    visual: 0.30,
    conversion: 0.25,
    ux: 0.20,
    seo: 0.15,
    brand: 0.10
  },
  'default': {
    ux: 0.25,
    visual: 0.20,
    content: 0.20,
    conversion: 0.20,
    seo: 0.10,
    brand: 0.05
  }
};

/**
 * Detect industry from URL and content
 */
function detectIndustry(url: string, bodyText: string): string {
  const urlLower = url.toLowerCase();
  const textLower = bodyText.toLowerCase();
  
  // Law firm
  if (urlLower.includes('law') || urlLower.includes('legal') || 
      textLower.includes('attorney') || textLower.includes('lawyer') ||
      textLower.includes('legal services')) {
    return 'law';
  }
  
  // SaaS
  if (urlLower.includes('saas') || textLower.includes('software as a service') ||
      textLower.includes('api') || textLower.includes('dashboard') ||
      textLower.includes('subscription')) {
    return 'saas';
  }
  
  // Creative Agency
  if (urlLower.includes('agency') || urlLower.includes('creative') ||
      textLower.includes('portfolio') || textLower.includes('design agency')) {
    return 'creative-agency';
  }
  
  // Ecommerce
  if (urlLower.includes('shop') || urlLower.includes('store') ||
      textLower.includes('add to cart') || textLower.includes('buy now') ||
      textLower.includes('products')) {
    return 'ecommerce';
  }
  
  // Medical
  if (urlLower.includes('medical') || urlLower.includes('health') ||
      urlLower.includes('clinic') || urlLower.includes('doctor') ||
      textLower.includes('appointment') || textLower.includes('patient')) {
    return 'medical';
  }
  
  // Real Estate
  if (urlLower.includes('real estate') || urlLower.includes('property') ||
      textLower.includes('listing') || textLower.includes('agent')) {
    return 'real-estate';
  }
  
  // Automotive
  if (urlLower.includes('car') || urlLower.includes('auto') ||
      textLower.includes('vehicle') || textLower.includes('dealership')) {
    return 'automotive';
  }
  
  return 'default';
}

/**
 * Map expert evaluations to category names
 */
function mapExpertToCategory(expert: ExpertEvaluation): string {
  const agent = expert.agent.toLowerCase();
  if (agent.includes('ux designer')) return 'ux';
  if (agent.includes('product designer')) return 'visual';
  if (agent.includes('conversion strategist')) return 'conversion';
  if (agent.includes('seo specialist')) return 'seo';
  if (agent.includes('brand identity')) return 'brand';
  return 'content';
}

/**
 * Generate consensus from expert panel
 */
export function generateConsensus(
  experts: ExpertEvaluation[],
  url: string,
  bodyText: string
): ConsensusResult {
  // Detect industry
  const industry = detectIndustry(url, bodyText);
  const weights = INDUSTRY_WEIGHTS[industry] || INDUSTRY_WEIGHTS.default;
  
  // Map expert scores to categories
  const categoryScores: Record<string, number> = {};
  experts.forEach(expert => {
    const category = mapExpertToCategory(expert);
    categoryScores[category] = expert.score;
  });
  
  // Normalize scores (already 0-10, but ensure consistency)
  const normalizedScores: Record<string, number> = {};
  Object.entries(categoryScores).forEach(([category, score]) => {
    normalizedScores[category] = Math.min(10, Math.max(0, score));
  });
  
  // Calculate weighted score (0-100)
  let weightedScore = 0;
  Object.entries(weights).forEach(([category, weight]) => {
    const score = normalizedScores[category] || 0;
    weightedScore += score * weight * 10; // Scale to 0-100
  });
  
  // Detect anomalies (scores that differ significantly)
  const anomalies: string[] = [];
  const scores = Object.values(normalizedScores);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  Object.entries(normalizedScores).forEach(([category, score]) => {
    if (Math.abs(score - avgScore) > 2.5) {
      anomalies.push(`${category} score (${score.toFixed(1)}) differs significantly from average (${avgScore.toFixed(1)})`);
    }
  });
  
  // Calculate expert agreement (how close are the scores?)
  const scoreVariance = scores.reduce((sum, score) => {
    return sum + Math.pow(score - avgScore, 2);
  }, 0) / scores.length;
  
  const expertAgreement = Math.max(0, 100 - (scoreVariance * 10)); // Lower variance = higher agreement
  
  // Determine final verdict
  const finalVerdict = determineConsensusVerdict(weightedScore, normalizedScores);
  
  return {
    industry,
    weights,
    normalizedScores,
    weightedScore: Math.round(weightedScore * 10) / 10,
    anomalies,
    finalVerdict,
    expertAgreement: Math.round(expertAgreement * 10) / 10
  };
}

/**
 * Determine verdict based on weighted score and thresholds
 */
function determineConsensusVerdict(
  weightedScore: number,
  normalizedScores: Record<string, number>
): 'Poor' | 'OK' | 'Good' | 'Excellent' | 'World-Class' {
  
  // v4.0 thresholds (stricter)
  const thresholds = {
    ux: 8.0,
    visual: 8.0,
    content: 8.0,
    conversion: 7.5,
    seo: 7.5,
    brand: 7.0
  };
  
  // Check if all thresholds are met
  const meetsAllThresholds = Object.entries(thresholds).every(([category, threshold]) => {
    const score = normalizedScores[category] || 0;
    return score >= threshold;
  });
  
  if (weightedScore < 40) {
    return 'Poor';
  } else if (weightedScore < 60) {
    return 'OK';
  } else if (weightedScore < 75 || !meetsAllThresholds) {
    return 'Good';
  } else if (weightedScore >= 75 && weightedScore < 90 && meetsAllThresholds) {
    return 'Excellent';
  } else {
    return 'World-Class';
  }
}

