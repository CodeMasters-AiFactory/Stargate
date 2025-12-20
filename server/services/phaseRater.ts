/**
 * Phase Rating Service
 * Provides rating logic for each phase based on completion quality,
 * adherence to requirements, technical implementation, and best practices
 */

import type { PhaseReport, PhaseRatingCriteria } from './phaseTracker';
import type { ProjectConfig } from './projectConfig';
import type { GeneratedWebsite } from './merlinDesignLLM';
import type { QualityAssessment } from './qualityAssessment';

export interface PhaseRatingContext {
  phaseNumber: number;
  phaseName: string;
  projectConfig?: ProjectConfig;
  generatedWebsite?: GeneratedWebsite;
  qualityAssessment?: QualityAssessment;
  phaseData?: any;
  errors?: string[];
  warnings?: string[];
}

/**
 * Rate a phase based on multiple criteria
 */
export function ratePhase(context: PhaseRatingContext): {
  rating: number;
  ratingBreakdown: PhaseReport['ratingBreakdown'];
  detailedAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
} {
  const { phaseNumber, phaseName, _phaseData, errors, warnings } = context;

  // Base rating logic - can be customized per phase
  let rating = 0;
  const ratingBreakdown: PhaseReport['ratingBreakdown'] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const improvementSuggestions: string[] = [];
  let detailedAnalysis = '';

  // Phase-specific rating logic
  switch (phaseNumber) {
    case 1: // Package Selection
      rating = ratePackageSelection(context);
      break;
    case 2: // Client Specification
      rating = rateClientSpecification(context);
      break;
    case 3: // Page Experience
      rating = ratePageExperience(context);
      break;
    case 4: // Core Web Vitals
      rating = rateCoreWebVitals(context);
      break;
    case 5: // Mobile Usability
      rating = rateMobileUsability(context);
      break;
    case 6: // Security
      rating = rateSecurity(context);
      break;
    case 7: // Structured Data
      rating = rateStructuredData(context);
      break;
    case 8: // Content Quality
      rating = rateContentQuality(context);
      break;
    case 9: // Internal Linking
      rating = rateInternalLinking(context);
      break;
    case 10: // Image Optimization
      rating = rateImageOptimization(context);
      break;
    case 11: // URL Structure
      rating = rateURLStructure(context);
      break;
    case 12: // Meta Tags
      rating = rateMetaTags(context);
      break;
    case 13: // Accessibility
      rating = rateAccessibility(context);
      break;
    case 14: // Site Speed
      rating = rateSiteSpeed(context);
      break;
    case 15: // Mobile-First Design
      rating = rateMobileFirstDesign(context);
      break;
    case 16: // Website Builder
      rating = rateWebsiteBuilder(context);
      break;
    case 17: // Review & Final Output
      rating = rateReviewAndOutput(context);
      break;
    default:
      rating = 50; // Default rating for unknown phases
  }

  // Generate detailed analysis
  detailedAnalysis = generateDetailedAnalysis(phaseNumber, phaseName, rating, context);

  // Extract strengths and weaknesses from rating breakdown
  ratingBreakdown.forEach(criteria => {
    if (criteria.score >= criteria.maxScore * 0.8) {
      strengths.push(`${criteria.criteria}: ${criteria.notes}`);
    } else if (criteria.score < criteria.maxScore * 0.6) {
      weaknesses.push(`${criteria.criteria}: ${criteria.notes}`);
      improvementSuggestions.push(`Improve ${criteria.criteria.toLowerCase()}: ${criteria.notes}`);
    }
  });

  // Add error-based weaknesses
  if (errors && errors.length > 0) {
    errors.forEach(error => {
      weaknesses.push(`Error: ${error}`);
      improvementSuggestions.push(`Fix error: ${error}`);
    });
  }

  // Add warning-based weaknesses
  if (warnings && warnings.length > 0) {
    warnings.forEach(warning => {
      weaknesses.push(`Warning: ${warning}`);
    });
  }

  return {
    rating,
    ratingBreakdown,
    detailedAnalysis,
    strengths,
    weaknesses,
    improvementSuggestions,
  };
}

/**
 * Rate Phase 1: Package Selection
 */
function ratePackageSelection(context: PhaseRatingContext): number {
  const { projectConfig } = context;
  let score = 0;
  const breakdown: PhaseReport['ratingBreakdown'] = [];

  // Check if project config exists
  if (projectConfig) {
    score += 25;
    breakdown.push({
      criteria: 'Project Configuration',
      score: 25,
      maxScore: 25,
      notes: 'Project configuration successfully created',
    });
  } else {
    breakdown.push({
      criteria: 'Project Configuration',
      score: 0,
      maxScore: 25,
      notes: 'Project configuration missing',
    });
  }

  // Check if required fields are present
  if (projectConfig?.projectName && projectConfig?.industry) {
    score += 25;
    breakdown.push({
      criteria: 'Required Fields',
      score: 25,
      maxScore: 25,
      notes: 'All required fields present',
    });
  } else {
    breakdown.push({
      criteria: 'Required Fields',
      score: 0,
      maxScore: 25,
      notes: 'Missing required fields',
    });
  }

  // Check if services are defined
  if (projectConfig?.services && projectConfig.services.length > 0) {
    score += 25;
    breakdown.push({
      criteria: 'Services Definition',
      score: 25,
      maxScore: 25,
      notes: `Services defined (${projectConfig.services.length} services)`,
    });
  } else {
    breakdown.push({
      criteria: 'Services Definition',
      score: 10,
      maxScore: 25,
      notes: 'No services defined',
    });
  }

  // Check if pages are defined
  if (projectConfig?.pagesToGenerate && projectConfig.pagesToGenerate.length > 0) {
    score += 25;
    breakdown.push({
      criteria: 'Pages Definition',
      score: 25,
      maxScore: 25,
      notes: `Pages defined (${projectConfig.pagesToGenerate.length} pages)`,
    });
  } else {
    breakdown.push({
      criteria: 'Pages Definition',
      score: 10,
      maxScore: 25,
      notes: 'No pages defined',
    });
  }

  context.phaseData = { breakdown };
  return score;
}

/**
 * Rate Phase 2: Client Specification
 */
function rateClientSpecification(context: PhaseRatingContext): number {
  const { projectConfig } = context;
  let score = 0;
  const breakdown: PhaseReport['ratingBreakdown'] = [];

  if (!projectConfig) {
    return 0;
  }

  // Check business information completeness
  const hasBusinessInfo = !!(projectConfig.projectName && projectConfig.industry);
  if (hasBusinessInfo) {
    score += 20;
    breakdown.push({
      criteria: 'Business Information',
      score: 20,
      maxScore: 20,
      notes: 'Business information complete',
    });
  } else {
    breakdown.push({
      criteria: 'Business Information',
      score: 0,
      maxScore: 20,
      notes: 'Business information incomplete',
    });
  }

  // Check location information
  const hasLocation = !!(projectConfig.location?.city && projectConfig.location?.country);
  if (hasLocation) {
    score += 20;
    breakdown.push({
      criteria: 'Location Information',
      score: 20,
      maxScore: 20,
      notes: 'Location information complete',
    });
  } else {
    breakdown.push({
      criteria: 'Location Information',
      score: 10,
      maxScore: 20,
      notes: 'Location information partial',
    });
  }

  // Check target audience
  if (projectConfig.targetAudiences && projectConfig.targetAudiences.length > 0) {
    score += 20;
    breakdown.push({
      criteria: 'Target Audience',
      score: 20,
      maxScore: 20,
      notes: `Target audience defined (${projectConfig.targetAudiences.length} audiences)`,
    });
  } else {
    breakdown.push({
      criteria: 'Target Audience',
      score: 5,
      maxScore: 20,
      notes: 'Target audience not defined',
    });
  }

  // Check tone of voice
  if (projectConfig.toneOfVoice) {
    score += 20;
    breakdown.push({
      criteria: 'Tone of Voice',
      score: 20,
      maxScore: 20,
      notes: `Tone of voice: ${projectConfig.toneOfVoice}`,
    });
  } else {
    breakdown.push({
      criteria: 'Tone of Voice',
      score: 10,
      maxScore: 20,
      notes: 'Tone of voice not specified',
    });
  }

  // Check brand preferences
  if (projectConfig.brandPreferences) {
    score += 20;
    breakdown.push({
      criteria: 'Brand Preferences',
      score: 20,
      maxScore: 20,
      notes: 'Brand preferences defined',
    });
  } else {
    breakdown.push({
      criteria: 'Brand Preferences',
      score: 10,
      maxScore: 20,
      notes: 'Brand preferences not specified',
    });
  }

  context.phaseData = { breakdown };
  return score;
}

/**
 * Rate Phase 3: Page Experience
 */
function ratePageExperience(context: PhaseRatingContext): number {
  const { qualityAssessment, generatedWebsite } = context;
  let score = 50; // Base score
  const breakdown: PhaseReport['ratingBreakdown'] = [];

  if (qualityAssessment) {
    const avgScore = qualityAssessment.averageScore;
    score = Math.round(avgScore * 10); // Convert 0-10 to 0-100
    breakdown.push({
      criteria: 'Overall Quality',
      score: score,
      maxScore: 100,
      notes: `Average quality score: ${avgScore.toFixed(1)}/10`,
    });
  } else if (generatedWebsite) {
    score = 60;
    breakdown.push({
      criteria: 'Website Generated',
      score: 60,
      maxScore: 100,
      notes: 'Website generated but not assessed',
    });
  } else {
    breakdown.push({
      criteria: 'Page Experience',
      score: 0,
      maxScore: 100,
      notes: 'No quality assessment available',
    });
  }

  context.phaseData = { breakdown };
  return score;
}

/**
 * Rate Phase 4: Core Web Vitals
 */
function rateCoreWebVitals(_context: PhaseRatingContext): number {
  // Placeholder - would need actual Core Web Vitals data
  return 70;
}

/**
 * Rate Phase 5: Mobile Usability
 */
function rateMobileUsability(context: PhaseRatingContext): number {
  const { generatedWebsite } = context;
  let score = 70; // Base score
  const breakdown: PhaseReport['ratingBreakdown'] = [];

  if (generatedWebsite?.code?.css) {
    // Check for responsive CSS
    const hasResponsive = generatedWebsite.code.css.includes('@media') || 
                         generatedWebsite.code.css.includes('responsive');
    if (hasResponsive) {
      score = 85;
      breakdown.push({
        criteria: 'Responsive Design',
        score: 85,
        maxScore: 100,
        notes: 'Responsive CSS detected',
      });
    } else {
      score = 50;
      breakdown.push({
        criteria: 'Responsive Design',
        score: 50,
        maxScore: 100,
        notes: 'No responsive CSS detected',
      });
    }
  }

  context.phaseData = { breakdown };
  return score;
}

/**
 * Rate Phase 6: Security
 */
function rateSecurity(_context: PhaseRatingContext): number {
  // Placeholder - would check for HTTPS, security headers, etc.
  return 80;
}

/**
 * Rate Phase 7: Structured Data
 */
function rateStructuredData(context: PhaseRatingContext): number {
  const { generatedWebsite } = context;
  let score = 50;
  const breakdown: PhaseReport['ratingBreakdown'] = [];

  if (generatedWebsite?.code?.html) {
    const hasSchema = generatedWebsite.code.html.includes('schema.org') ||
                     generatedWebsite.code.html.includes('application/ld+json');
    if (hasSchema) {
      score = 90;
      breakdown.push({
        criteria: 'Schema Markup',
        score: 90,
        maxScore: 100,
        notes: 'Schema.org structured data detected',
      });
    } else {
      score = 40;
      breakdown.push({
        criteria: 'Schema Markup',
        score: 40,
        maxScore: 100,
        notes: 'No structured data detected',
      });
    }
  }

  context.phaseData = { breakdown };
  return score;
}

/**
 * Rate Phase 8: Content Quality
 */
function rateContentQuality(context: PhaseRatingContext): number {
  const { qualityAssessment } = context;
  if (qualityAssessment) {
    return Math.round(qualityAssessment.scores.contentQuality * 10);
  }
  return 70;
}

/**
 * Rate Phase 9: Internal Linking
 */
function rateInternalLinking(context: PhaseRatingContext): number {
  const { generatedWebsite } = context;
  if (generatedWebsite?.code?.html) {
    const linkCount = (generatedWebsite.code.html.match(/<a\s+href=/g) || []).length;
    return Math.min(100, 50 + linkCount * 5); // Base 50 + 5 per link, max 100
  }
  return 50;
}

/**
 * Rate Phase 10: Image Optimization
 */
function rateImageOptimization(context: PhaseRatingContext): number {
  const { generatedWebsite } = context;
  if (generatedWebsite?.code?.html) {
    const imgCount = (generatedWebsite.code.html.match(/<img/g) || []).length;
    const hasAlt = (generatedWebsite.code.html.match(/alt=/g) || []).length;
    if (imgCount > 0) {
      const altRatio = hasAlt / imgCount;
      return Math.round(50 + altRatio * 50); // 50 base + up to 50 for alt tags
    }
  }
  return 60;
}

/**
 * Rate Phase 11: URL Structure
 */
function rateURLStructure(_context: PhaseRatingContext): number {
  // Placeholder - would check URL patterns
  return 75;
}

/**
 * Rate Phase 12: Meta Tags
 */
function rateMetaTags(context: PhaseRatingContext): number {
  const { generatedWebsite } = context;
  if (generatedWebsite?.code?.html) {
    const hasTitle = generatedWebsite.code.html.includes('<title>');
    const hasDescription = generatedWebsite.code.html.includes('meta name="description"');
    const hasOG = generatedWebsite.code.html.includes('og:');
    let score = 0;
    if (hasTitle) score += 30;
    if (hasDescription) score += 30;
    if (hasOG) score += 40;
    return score;
  }
  return 50;
}

/**
 * Rate Phase 13: Accessibility
 */
function rateAccessibility(context: PhaseRatingContext): number {
  const { generatedWebsite } = context;
  if (generatedWebsite?.code?.html) {
    const hasAlt = generatedWebsite.code.html.includes('alt=');
    const hasAria = generatedWebsite.code.html.includes('aria-');
    const hasSemantic = generatedWebsite.code.html.includes('<header>') ||
                        generatedWebsite.code.html.includes('<nav>') ||
                        generatedWebsite.code.html.includes('<main>');
    let score = 0;
    if (hasAlt) score += 30;
    if (hasAria) score += 30;
    if (hasSemantic) score += 40;
    return score;
  }
  return 60;
}

/**
 * Rate Phase 14: Site Speed
 */
function rateSiteSpeed(_context: PhaseRatingContext): number {
  // Placeholder - would need actual performance metrics
  return 70;
}

/**
 * Rate Phase 15: Mobile-First Design
 */
function rateMobileFirstDesign(context: PhaseRatingContext): number {
  // Similar to mobile usability
  return rateMobileUsability(context);
}

/**
 * Rate Phase 16: Website Builder
 */
function rateWebsiteBuilder(context: PhaseRatingContext): number {
  const { generatedWebsite } = context;
  let score = 0;
  const breakdown: PhaseReport['ratingBreakdown'] = [];

  if (generatedWebsite) {
    score += 25;
    breakdown.push({
      criteria: 'Website Generated',
      score: 25,
      maxScore: 25,
      notes: 'Website successfully generated',
    });

    if (generatedWebsite.layout) {
      score += 25;
      breakdown.push({
        criteria: 'Layout Created',
        score: 25,
        maxScore: 25,
        notes: 'Layout structure created',
      });
    }

    if (generatedWebsite.styleSystem) {
      score += 25;
      breakdown.push({
        criteria: 'Style System',
        score: 25,
        maxScore: 25,
        notes: 'Style system generated',
      });
    }

    if (generatedWebsite.code?.html && generatedWebsite.code?.css) {
      score += 25;
      breakdown.push({
        criteria: 'Code Generated',
        score: 25,
        maxScore: 25,
        notes: 'HTML and CSS generated',
      });
    }
  }

  context.phaseData = { breakdown };
  return score;
}

/**
 * Rate Phase 17: Review & Final Output
 */
function rateReviewAndOutput(context: PhaseRatingContext): number {
  const { qualityAssessment, generatedWebsite } = context;
  let score = 50;
  const breakdown: PhaseReport['ratingBreakdown'] = [];

  if (qualityAssessment) {
    score = Math.round(qualityAssessment.averageScore * 10);
    breakdown.push({
      criteria: 'Quality Assessment',
      score: score,
      maxScore: 100,
      notes: `Overall quality: ${qualityAssessment.averageScore.toFixed(1)}/10`,
    });

    if (qualityAssessment.meetsThresholds) {
      score = Math.min(100, score + 10);
      breakdown.push({
        criteria: 'Thresholds Met',
        score: 10,
        maxScore: 10,
        notes: 'All quality thresholds met',
      });
    }
  }

  if (generatedWebsite) {
    breakdown.push({
      criteria: 'Output Generated',
      score: 20,
      maxScore: 20,
      notes: 'Final website output generated',
    });
    score = Math.min(100, score + 20);
  }

  context.phaseData = { breakdown };
  return score;
}

/**
 * Generate detailed analysis for a phase
 */
function generateDetailedAnalysis(
  phaseNumber: number,
  phaseName: string,
  rating: number,
  context: PhaseRatingContext
): string {
  let analysis = `Phase ${phaseNumber}: ${phaseName}\n\n`;
  analysis += `Rating: ${rating}/100\n\n`;

  if (context.qualityAssessment) {
    analysis += `Quality Assessment Results:\n`;
    analysis += `- Visual Design: ${context.qualityAssessment.scores.visualDesign}/10\n`;
    analysis += `- UX Structure: ${context.qualityAssessment.scores.uxStructure}/10\n`;
    analysis += `- Content Quality: ${context.qualityAssessment.scores.contentQuality}/10\n`;
    analysis += `- Conversion Trust: ${context.qualityAssessment.scores.conversionTrust}/10\n`;
    analysis += `- SEO Foundations: ${context.qualityAssessment.scores.seoFoundations}/10\n`;
    analysis += `- Creativity: ${context.qualityAssessment.scores.creativity}/10\n`;
    analysis += `- Average Score: ${context.qualityAssessment.averageScore.toFixed(1)}/10\n`;
    analysis += `- Verdict: ${context.qualityAssessment.verdict}\n`;
    analysis += `- Meets Thresholds: ${context.qualityAssessment.meetsThresholds ? 'Yes' : 'No'}\n\n`;
  }

  if (context.generatedWebsite) {
    analysis += `Generated Website Status:\n`;
    analysis += `- Layout: ${context.generatedWebsite.layout ? 'Generated' : 'Missing'}\n`;
    analysis += `- Style System: ${context.generatedWebsite.styleSystem ? 'Generated' : 'Missing'}\n`;
    analysis += `- Copy: ${context.generatedWebsite.copy ? 'Generated' : 'Missing'}\n`;
    analysis += `- Code: ${context.generatedWebsite.code ? 'Generated' : 'Missing'}\n\n`;
  }

  if (context.errors && context.errors.length > 0) {
    analysis += `Errors Found:\n`;
    context.errors.forEach(error => {
      analysis += `- ${error}\n`;
    });
    analysis += `\n`;
  }

  if (context.warnings && context.warnings.length > 0) {
    analysis += `Warnings:\n`;
    context.warnings.forEach(warning => {
      analysis += `- ${warning}\n`;
    });
    analysis += `\n`;
  }

  return analysis;
}


