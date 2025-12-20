/**
 * Quality Assessment Service
 * Real quality analysis for generated websites using v4.0 analyzer
 */

import { analyzeWebsiteV4, type V4AnalysisResult } from './analyzerV4';
import { validatePerformance, type PerformanceValidationResult } from './performanceValidator';
import { validateSEO, type SEOValidationResult } from './seoValidator';
import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import { logError } from '../utils/errorHandler';

export interface QualityAssessment {
  scores: {
    visualDesign: number;
    uxStructure: number;
    contentQuality: number;
    conversionTrust: number;
    seoFoundations: number;
    creativity: number;
  };
  averageScore: number;
  verdict: 'Poor' | 'OK' | 'Good' | 'Excellent' | 'World-Class';
  issues: QualityIssue[];
  meetsThresholds: boolean;
  analysisResult?: V4AnalysisResult;
  performanceValidation?: PerformanceValidationResult;
  seoValidation?: SEOValidationResult;
}

export interface QualityIssue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location?: string;
  suggestion: string;
}

/**
 * Assess a generated website by serving it locally and running v4.0 analysis
 */
export async function assessGeneratedWebsite(
  projectSlug: string,
  _app: express.Application,
  port: number = 5000
): Promise<QualityAssessment> {
  const outputDir = path.join(process.cwd(), 'website_projects', projectSlug, 'generated-v5');
  
  // Verify files exist
  const htmlPath = path.join(outputDir, 'index.html');
  // Reserved for future use: cssPath
  path.join(outputDir, 'styles.css');
  
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`Generated website not found at ${htmlPath}`);
  }
  
  // Ensure static serving is set up (should already be done in server/index.ts)
  // The website should be accessible at /website_projects/{projectSlug}/generated-v5/index.html
  
  // Construct local URL
  const localUrl = `http://localhost:${port}/website_projects/${projectSlug}/generated-v5/index.html`;
  
  console.log(`[Quality Assessment] Analyzing generated website at: ${localUrl}`);
  
  try {
    // Run v4.0 analyzer
    const analysisResult = await analyzeWebsiteV4(localUrl);
    
    // Run Performance and SEO Validation (parallel for speed)
    console.log('[Quality Assessment] Running performance and SEO validation...');
    let performanceValidation: PerformanceValidationResult | undefined;
    let seoValidation: SEOValidationResult | undefined;
    
    try {
      [performanceValidation, seoValidation] = await Promise.all([
        validatePerformance(localUrl).catch(err => {
          console.warn('[Quality Assessment] Performance validation failed:', err.message);
          return undefined;
        }),
        validateSEO(localUrl).catch(err => {
          console.warn('[Quality Assessment] SEO validation failed:', err.message);
          return undefined;
        }),
      ]);
    } catch (validationError) {
      console.warn('[Quality Assessment] Validation failed, continuing with basic assessment:', validationError);
    }
    
    // Extract scores from analysis
    const scores = extractScoresFromAnalysis(analysisResult);
    
    // Enhance scores with validation results
    if (performanceValidation) {
      // Adjust UX/Visual scores based on Core Web Vitals
      if (performanceValidation.coreWebVitals.lcp && performanceValidation.coreWebVitals.lcp > 4000) {
        scores.uxStructure = Math.min(scores.uxStructure, 7.0); // Penalize slow LCP
      }
      if (performanceValidation.coreWebVitals.cls && performanceValidation.coreWebVitals.cls > 0.25) {
        scores.visualDesign = Math.min(scores.visualDesign, 7.0); // Penalize high CLS
      }
      // Enhance if performance is excellent
      if (performanceValidation.score >= 90) {
        scores.uxStructure = Math.min(10, scores.uxStructure + 0.5);
      }
    }
    
    if (seoValidation) {
      // Enhance SEO score based on validation
      if (seoValidation.score >= 90) {
        scores.seoFoundations = Math.min(10, scores.seoFoundations + 0.5);
      } else if (seoValidation.score < 70) {
        scores.seoFoundations = Math.max(0, scores.seoFoundations - 1.0);
      }
    }
    
    // Calculate average
    const averageScore = (
      scores.visualDesign +
      scores.uxStructure +
      scores.contentQuality +
      scores.conversionTrust +
      scores.seoFoundations +
      scores.creativity
    ) / 6;
    
    // Determine verdict
    const verdict = determineVerdict(averageScore, scores);
    
    // Identify issues (including validation issues)
    const issues = identifyIssues(analysisResult, scores, outputDir, performanceValidation, seoValidation);
    
    // Check if meets thresholds (all categories >= 7.5/10)
    const meetsThresholds = 
      scores.visualDesign >= 7.5 &&
      scores.uxStructure >= 7.5 &&
      scores.contentQuality >= 7.5 &&
      scores.conversionTrust >= 7.5 &&
      scores.seoFoundations >= 7.5 &&
      scores.creativity >= 7.5;
    
    return {
      scores,
      averageScore,
      verdict,
      issues,
      meetsThresholds,
      analysisResult,
      performanceValidation,
      seoValidation
    };
  } catch (error: unknown) {
    logError(error, 'Quality Assessment');
    
    // Fallback: Basic file-based assessment
    return assessFromFiles(outputDir, projectSlug);
  }
}

/**
 * Extract scores from v4.0 analysis result
 */
function extractScoresFromAnalysis(analysis: V4AnalysisResult): QualityAssessment['scores'] {
  // The v4.0 analyzer returns consensus with normalizedScores
  const consensus = analysis.consensus;
  const normalized = consensus.normalizedScores || {};
  
  // Map consensus scores to our quality categories
  return {
    visualDesign: normalized.visual || 0,
    uxStructure: normalized.ux || 0,
    contentQuality: normalized.content || 0,
    conversionTrust: normalized.conversion || 0,
    seoFoundations: normalized.seo || 0,
    creativity: normalized.brand || 0 // Brand/creativity are similar
  };
}

/**
 * Determine verdict based on scores
 */
function determineVerdict(
  averageScore: number,
  scores: QualityAssessment['scores']
): QualityAssessment['verdict'] {
  if (averageScore < 4.0) return 'Poor';
  if (averageScore < 6.0) return 'OK';
  if (averageScore < 7.5) return 'Good';
  
  // For Excellent/World-Class, check individual categories
  const allAbove75 = Object.values(scores).every(s => s >= 7.5);
  if (!allAbove75) return 'Good';
  
  if (averageScore >= 8.5 && Object.values(scores).every(s => s >= 8.5)) {
    return 'World-Class';
  }
  
  return 'Excellent';
}

/**
 * Identify specific issues from analysis
 */
function identifyIssues(
  _analysis: V4AnalysisResult,
  scores: QualityAssessment['scores'],
  outputDir: string,
  performanceValidation?: PerformanceValidationResult,
  seoValidation?: SEOValidationResult
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  
  // Check for missing CSS
  const cssPath = path.join(outputDir, 'styles.css');
  if (!fs.existsSync(cssPath)) {
    issues.push({
      category: 'Visual Design',
      severity: 'critical',
      description: 'CSS file is missing',
      location: 'styles.css',
      suggestion: 'Generate and save CSS file'
    });
  }
  
  // Check for duplicate content (read HTML and check)
  const htmlPath = path.join(outputDir, 'index.html');
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const headings = html.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
    const uniqueHeadings = new Set(headings);
    
    if (headings.length > uniqueHeadings.size) {
      issues.push({
        category: 'Content Quality',
        severity: 'critical',
        description: 'Duplicate section headings detected',
        location: 'index.html',
        suggestion: 'Generate unique content for each section'
      });
    }
  }
  
  // Check scores and add issues for low categories
  if (scores.visualDesign < 7.5) {
    issues.push({
      category: 'Visual Design',
      severity: scores.visualDesign < 4.0 ? 'critical' : 'high',
      description: `Visual design score is ${scores.visualDesign.toFixed(1)}/10 (below 7.5 threshold)`,
      suggestion: 'Improve color palette, typography, spacing, and visual hierarchy'
    });
  }
  
  if (scores.contentQuality < 7.5) {
    issues.push({
      category: 'Content Quality',
      severity: scores.contentQuality < 4.0 ? 'critical' : 'high',
      description: `Content quality score is ${scores.contentQuality.toFixed(1)}/10 (below 7.5 threshold)`,
      suggestion: 'Add specific, industry-relevant content. Remove generic filler text.'
    });
  }
  
  if (scores.conversionTrust < 7.5) {
    issues.push({
      category: 'Conversion & Trust',
      severity: scores.conversionTrust < 4.0 ? 'critical' : 'high',
      description: `Conversion score is ${scores.conversionTrust.toFixed(1)}/10 (below 7.5 threshold)`,
      suggestion: 'Add multiple CTAs, contact information, testimonials, and trust signals'
    });
  }
  
  if (scores.seoFoundations < 7.5) {
    issues.push({
      category: 'SEO Foundations',
      severity: scores.seoFoundations < 4.0 ? 'critical' : 'high',
      description: `SEO score is ${scores.seoFoundations.toFixed(1)}/10 (below 7.5 threshold)`,
      suggestion: 'Add meta description, schema markup, proper heading hierarchy, and location keywords'
    });
  }
  
  // Add performance validation issues
  if (performanceValidation) {
    if (!performanceValidation.passed) {
      performanceValidation.issues.forEach(issue => {
        issues.push({
          category: 'Performance',
          severity: issue.severity === 'error' ? 'critical' : issue.severity === 'warning' ? 'high' : 'medium',
          description: issue.message,
          suggestion: issue.suggestion
        });
      });
    }
    
    // Add Core Web Vitals issues
    if (performanceValidation.coreWebVitals.lcp && performanceValidation.coreWebVitals.lcp > 2500) {
      issues.push({
        category: 'Performance',
        severity: performanceValidation.coreWebVitals.lcp > 4000 ? 'critical' : 'high',
        description: `LCP is ${performanceValidation.coreWebVitals.lcp.toFixed(0)}ms (target: <2500ms)`,
        suggestion: 'Optimize hero image loading, preload critical resources, reduce server response time'
      });
    }
    
    if (performanceValidation.coreWebVitals.cls && performanceValidation.coreWebVitals.cls > 0.1) {
      issues.push({
        category: 'Performance',
        severity: performanceValidation.coreWebVitals.cls > 0.25 ? 'critical' : 'high',
        description: `CLS is ${performanceValidation.coreWebVitals.cls.toFixed(3)} (target: <0.1)`,
        suggestion: 'Set width/height on images, reserve space for dynamic content, use aspect-ratio CSS'
      });
    }
  }
  
  // Add SEO validation issues
  if (seoValidation) {
    if (!seoValidation.passed) {
      seoValidation.issues.forEach(issue => {
        issues.push({
          category: 'SEO',
          severity: issue.severity === 'error' ? 'critical' : issue.severity === 'warning' ? 'high' : 'medium',
          description: issue.message,
          suggestion: issue.suggestion
        });
      });
    }
    
    // Add specific SEO issues
    if (!seoValidation.metaTags.title.present) {
      issues.push({
        category: 'SEO',
        severity: 'critical',
        description: 'Missing title tag',
        suggestion: 'Add a descriptive title tag (50-60 characters)'
      });
    }
    
    if (!seoValidation.metaTags.description.present) {
      issues.push({
        category: 'SEO',
        severity: 'critical',
        description: 'Missing meta description',
        suggestion: 'Add a compelling meta description (150-165 characters)'
      });
    }
    
    if (seoValidation.headings.h1.count === 0) {
      issues.push({
        category: 'SEO',
        severity: 'critical',
        description: 'Missing H1 heading',
        suggestion: 'Add exactly one H1 heading per page'
      });
    }
    
    if (!seoValidation.structuredData.present) {
      issues.push({
        category: 'SEO',
        severity: 'high',
        description: 'No structured data (JSON-LD) found',
        suggestion: 'Add JSON-LD structured data for better search engine understanding'
      });
    }
  }
  
  return issues;
}

/**
 * Fallback assessment from files (when analyzer fails)
 */
function assessFromFiles(outputDir: string, _projectSlug: string): QualityAssessment {
  const htmlPath = path.join(outputDir, 'index.html');
  const cssPath = path.join(outputDir, 'styles.css');
  
  const issues: QualityIssue[] = [];
  let visualDesign = 5.0;
  let contentQuality = 5.0;
  
  // Check for CSS
  if (!fs.existsSync(cssPath)) {
    issues.push({
      category: 'Visual Design',
      severity: 'critical',
      description: 'CSS file is missing',
      location: 'styles.css',
      suggestion: 'Generate and save CSS file'
    });
    visualDesign = 2.0;
  } else {
    visualDesign = 6.0;
  }
  
  // Check HTML content
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    
    // Check for duplicate headings
    const headings = html.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
    const uniqueHeadings = new Set(headings.map(h => h.toLowerCase()));
    
    if (headings.length > uniqueHeadings.size) {
      issues.push({
        category: 'Content Quality',
        severity: 'critical',
        description: 'Duplicate section headings detected',
        location: 'index.html',
        suggestion: 'Generate unique content for each section'
      });
      contentQuality = 2.0;
    } else {
      contentQuality = 6.0;
    }
  }
  
  const scores = {
    visualDesign,
    uxStructure: 5.0,
    contentQuality,
    conversionTrust: 4.0,
    seoFoundations: 4.0,
    creativity: 5.0
  };
  
  const averageScore = Object.values(scores).reduce((a, b) => a + b, 0) / 6;
  
  return {
    scores,
    averageScore,
    verdict: averageScore < 4.0 ? 'Poor' : averageScore < 6.0 ? 'OK' : 'Good',
    issues,
    meetsThresholds: false
  };
}

/**
 * Generate quality report
 */
export function generateQualityReport(assessment: QualityAssessment, outputDir: string): void {
  const reportPath = path.join(outputDir, 'quality-report.md');
  
  const report = `# Quality Assessment Report

**Generated:** ${new Date().toISOString()}

## Overall Score

**Average:** ${assessment.averageScore.toFixed(1)}/10  
**Verdict:** ${assessment.verdict}  
**Meets Thresholds:** ${assessment.meetsThresholds ? '✅ Yes' : '❌ No'}

## Category Scores

| Category | Score | Status |
|----------|-------|--------|
| Visual Design & Layout | ${assessment.scores.visualDesign.toFixed(1)}/10 | ${assessment.scores.visualDesign >= 7.5 ? '✅' : '❌'} |
| UX & Structure | ${assessment.scores.uxStructure.toFixed(1)}/10 | ${assessment.scores.uxStructure >= 7.5 ? '✅' : '❌'} |
| Content & Positioning | ${assessment.scores.contentQuality.toFixed(1)}/10 | ${assessment.scores.contentQuality >= 7.5 ? '✅' : '❌'} |
| Conversion & Trust | ${assessment.scores.conversionTrust.toFixed(1)}/10 | ${assessment.scores.conversionTrust >= 7.5 ? '✅' : '❌'} |
| SEO Foundations | ${assessment.scores.seoFoundations.toFixed(1)}/10 | ${assessment.scores.seoFoundations >= 7.5 ? '✅' : '❌'} |
| Creativity & Differentiation | ${assessment.scores.creativity.toFixed(1)}/10 | ${assessment.scores.creativity >= 7.5 ? '✅' : '❌'} |

## Issues Found

${assessment.issues.length === 0 ? '✅ No issues found!' : assessment.issues.map(issue => `
### ${issue.category} - ${issue.severity.toUpperCase()}

**Description:** ${issue.description}  
${issue.location ? `**Location:** ${issue.location}` : ''}  
**Suggestion:** ${issue.suggestion}
`).join('\n')}

## Recommendations

${assessment.meetsThresholds 
  ? '✅ All quality thresholds met. Website is production-ready.' 
  : '⚠️ Quality thresholds not met. Review issues above and apply fixes.'}

---
*Generated by Merlin Quality Assessment Service*
`;
  
  fs.writeFileSync(reportPath, report);
  console.log(`[Quality Assessment] Report saved to: ${reportPath}`);
}

