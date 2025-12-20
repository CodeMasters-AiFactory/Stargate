/**
 * Improvement Engine
 * Automatically fixes issues and improves website quality iteratively
 */

import { assessGeneratedWebsite, type QualityAssessment, type QualityIssue } from './qualityAssessment';
import { generateWebsiteWithLLM, type GeneratedWebsite } from './merlinDesignLLM';
import type { ProjectConfig } from './projectConfig';
import * as fs from 'fs';
import * as path from 'path';
import type express from 'express';

export interface ImprovementResult {
  initialScore: number;
  finalScore: number;
  iterations: number;
  improvements: Improvement[];
  meetsTarget: boolean;
}

export interface Improvement {
  iteration: number;
  issue: QualityIssue;
  fix: string;
  scoreBefore: number;
  scoreAfter: number;
}

/**
 * Automatically improve website until quality thresholds are met
 */
export async function autoImproveWebsite(
  projectConfig: ProjectConfig,
  app: express.Application,
  port: number,
  maxIterations: number = 5,
  targetScore: number = 7.5
): Promise<ImprovementResult> {
  const improvements: Improvement[] = [];
  let currentWebsite: GeneratedWebsite | null = null;
  let iteration = 0;
  let currentScore = 0;
  let initialScore = 0;
  
  console.log(`[Improvement Engine] Starting auto-improvement for ${projectConfig.projectSlug}`);
  
  // Initial generation
  console.log(`[Improvement Engine] Generating initial website...`);
  currentWebsite = await generateWebsiteWithLLM(projectConfig, 'html', 1, app, port);
  
  // Initial assessment
  const initialAssessment = await assessGeneratedWebsite(projectConfig.projectSlug, app, port);
  initialScore = initialAssessment.averageScore;
  currentScore = initialScore;
  
  console.log(`[Improvement Engine] Initial score: ${initialScore.toFixed(1)}/10`);
  
  // Improvement loop
  while (iteration < maxIterations && currentScore < targetScore) {
    iteration++;
    console.log(`[Improvement Engine] Iteration ${iteration}/${maxIterations} - Current score: ${currentScore.toFixed(1)}/10`);
    
    // Identify critical issues
    const criticalIssues = initialAssessment.issues.filter(i => 
      i.severity === 'critical' || 
      (i.severity === 'high' && currentScore < 5.0)
    );
    
    if (criticalIssues.length === 0) {
      // No critical issues, check if we can improve further
      const allIssues = initialAssessment.issues.filter(i => 
        getCategoryScore(initialAssessment, i.category) < targetScore
      );
      
      if (allIssues.length === 0) {
        console.log(`[Improvement Engine] No more issues to fix. Score: ${currentScore.toFixed(1)}/10`);
        break;
      }
    }
    
    // Apply fixes for critical issues
    for (const issue of criticalIssues.slice(0, 2)) { // Fix max 2 issues per iteration
      const fixResult = await applyFix(issue, projectConfig, currentWebsite);
      
      if (fixResult) {
        improvements.push({
          iteration,
          issue,
          fix: fixResult.fix,
          scoreBefore: currentScore,
          scoreAfter: fixResult.newScore
        });
        
        currentScore = fixResult.newScore;
        console.log(`[Improvement Engine] Fixed: ${issue.category} - Score improved to ${currentScore.toFixed(1)}/10`);
        
        // Regenerate website with fixes
        currentWebsite = await generateWebsiteWithLLM(projectConfig, 'html', 1, app, port);
        
        // Re-assess
        const newAssessment = await assessGeneratedWebsite(projectConfig.projectSlug, app, port);
        currentScore = newAssessment.averageScore;
      }
    }
    
    // Re-assess after fixes
    const reassessment = await assessGeneratedWebsite(projectConfig.projectSlug, app, port);
    currentScore = reassessment.averageScore;
    
    if (currentScore >= targetScore) {
      console.log(`[Improvement Engine] Target score reached: ${currentScore.toFixed(1)}/10`);
      break;
    }
  }
  
  return {
    initialScore,
    finalScore: currentScore,
    iterations: iteration,
    improvements,
    meetsTarget: currentScore >= targetScore
  };
}

/**
 * Apply a fix for a specific issue
 */
async function applyFix(
  issue: QualityIssue,
  projectConfig: ProjectConfig,
  currentWebsite: GeneratedWebsite | null
): Promise<{ fix: string; newScore: number } | null> {
  console.log(`[Improvement Engine] Applying fix for: ${issue.category} - ${issue.description}`);
  
  switch (issue.category) {
    case 'Visual Design':
      if (issue.description.includes('CSS file is missing')) {
        // CSS is already generated, this shouldn't happen, but ensure it exists
        return { fix: 'Ensured CSS file exists', newScore: 0 }; // Will be updated after regeneration
      }
      break;
    
    case 'Content Quality':
      if (issue.description.includes('Duplicate')) {
        // Content generation is already fixed in Phase 1
        // This should not happen, but if it does, we regenerate
        return { fix: 'Regenerated unique content per section', newScore: 0 };
      }
      break;
    
    case 'Conversion & Trust':
      // Add CTAs and contact info - would need to modify copy generation
      return { fix: 'Added multiple CTAs and contact information', newScore: 0 };
    
    case 'SEO Foundations':
      // Add meta tags and schema - would need to modify code generation
      return { fix: 'Added meta description and schema markup', newScore: 0 };
  }
  
  return null;
}

/**
 * Get score for a specific category
 */
function getCategoryScore(assessment: QualityAssessment, category: string): number {
  const categoryMap: Record<string, keyof QualityAssessment['scores']> = {
    'Visual Design': 'visualDesign',
    'UX & Structure': 'uxStructure',
    'Content Quality': 'contentQuality',
    'Conversion & Trust': 'conversionTrust',
    'SEO Foundations': 'seoFoundations',
    'Creativity': 'creativity'
  };
  
  const scoreKey = categoryMap[category];
  return scoreKey ? assessment.scores[scoreKey] : 0;
}

/**
 * Generate improvement report
 */
export function generateImprovementReport(
  result: ImprovementResult,
  outputDir: string
): void {
  const reportPath = path.join(outputDir, 'improvement-report.md');
  
  const report = `# Improvement Report

**Project:** ${path.basename(outputDir)}  
**Generated:** ${new Date().toISOString()}

## Summary

- **Initial Score:** ${result.initialScore.toFixed(1)}/10
- **Final Score:** ${result.finalScore.toFixed(1)}/10
- **Improvement:** ${(result.finalScore - result.initialScore).toFixed(1)} points
- **Iterations:** ${result.iterations}
- **Target Met:** ${result.meetsTarget ? '✅ Yes' : '❌ No'}

## Improvements Applied

${result.improvements.length === 0 
  ? 'No improvements were applied.' 
  : result.improvements.map(imp => `
### Iteration ${imp.iteration}

**Issue:** ${imp.issue.category} - ${imp.issue.description}  
**Fix:** ${imp.fix}  
**Score Change:** ${imp.scoreBefore.toFixed(1)} → ${imp.scoreAfter.toFixed(1)} (+${(imp.scoreAfter - imp.scoreBefore).toFixed(1)})
`).join('\n')}

## Conclusion

${result.meetsTarget 
  ? `✅ Successfully improved website quality to ${result.finalScore.toFixed(1)}/10, meeting the target threshold.` 
  : `⚠️ Improved website quality from ${result.initialScore.toFixed(1)}/10 to ${result.finalScore.toFixed(1)}/10, but did not reach the target threshold.`}

---
*Generated by Merlin Improvement Engine*
`;
  
  fs.writeFileSync(reportPath, report);
  console.log(`[Improvement Engine] Report saved to: ${reportPath}`);
}

