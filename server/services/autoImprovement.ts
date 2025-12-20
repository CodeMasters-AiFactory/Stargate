/**
 * Auto-Improvement Orchestrator
 * Main system for automatically improving websites to 95% quality target
 */

import { generateWebsiteWithLLM, type GeneratedWebsite } from './merlinDesignLLM';
import { assessGeneratedWebsite, generateQualityReport, type QualityAssessment } from './qualityAssessment';
import { autoImproveWebsite, generateImprovementReport, type ImprovementResult } from './improvementEngine';
import { resolveIssue } from './issueResolver';
import type { ProjectConfig } from './projectConfig';
import * as fs from 'fs';
import * as path from 'path';
import type express from 'express';

export interface AutoImprovementConfig {
  targetScore: number; // Default 9.5 (95%)
  maxIterations: number; // Default 10
  minCategoryScore: number; // Default 7.5 (no category below this)
}

const DEFAULT_CONFIG: AutoImprovementConfig = {
  targetScore: 9.5,
  maxIterations: 10,
  minCategoryScore: 7.5
};

export interface AutoImprovementResult {
  success: boolean;
  initialAssessment: QualityAssessment;
  finalAssessment: QualityAssessment;
  improvementResult: ImprovementResult;
  iterations: number;
  finalScore: number;
  meetsTarget: boolean;
  reportPath: string;
}

/**
 * Automatically improve website to 95% quality target
 */
export async function autoImproveToTarget(
  projectConfig: ProjectConfig,
  app: express.Application,
  port: number,
  config: Partial<AutoImprovementConfig> = {}
): Promise<AutoImprovementResult> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const outputDir = path.join(process.cwd(), 'website_projects', projectConfig.projectSlug, 'generated-v5');
  
  console.log(`[Auto-Improvement] Starting auto-improvement to ${fullConfig.targetScore}/10 target`);
  console.log(`[Auto-Improvement] Config:`, fullConfig);
  
  // Step 1: Generate initial website
  console.log(`[Auto-Improvement] Step 1: Generating initial website...`);
  const website = await generateWebsiteWithLLM(projectConfig, 'html', 1, app, port);
  
  // Step 2: Initial assessment
  console.log(`[Auto-Improvement] Step 2: Assessing initial quality...`);
  const initialAssessment = await assessGeneratedWebsite(projectConfig.projectSlug, app, port);
  generateQualityReport(initialAssessment, outputDir);
  
  console.log(`[Auto-Improvement] Initial score: ${initialAssessment.averageScore.toFixed(1)}/10`);
  console.log(`[Auto-Improvement] Category scores:`, initialAssessment.scores);
  
  // Step 3: Check if already meets target
  if (initialAssessment.averageScore >= fullConfig.targetScore && 
      allCategoriesAboveThreshold(initialAssessment, fullConfig.minCategoryScore)) {
    console.log(`[Auto-Improvement] ✅ Already meets target! No improvements needed.`);
    return {
      success: true,
      initialAssessment,
      finalAssessment: initialAssessment,
      improvementResult: {
        initialScore: initialAssessment.averageScore,
        finalScore: initialAssessment.averageScore,
        iterations: 0,
        improvements: [],
        meetsTarget: true
      },
      iterations: 0,
      finalScore: initialAssessment.averageScore,
      meetsTarget: true,
      reportPath: path.join(outputDir, 'quality-report.md')
    };
  }
  
  // Step 4: Run improvement loop
  console.log(`[Auto-Improvement] Step 3: Running improvement loop...`);
  const improvementResult = await autoImproveWebsite(
    projectConfig,
    app,
    port,
    fullConfig.maxIterations,
    fullConfig.targetScore
  );
  
  // Step 5: Final assessment
  console.log(`[Auto-Improvement] Step 4: Final assessment...`);
  const finalAssessment = await assessGeneratedWebsite(projectConfig.projectSlug, app, port);
  generateQualityReport(finalAssessment, outputDir);
  generateImprovementReport(improvementResult, outputDir);
  
  const meetsTarget = finalAssessment.averageScore >= fullConfig.targetScore &&
                      allCategoriesAboveThreshold(finalAssessment, fullConfig.minCategoryScore);
  
  // Step 6: Generate comprehensive report
  const reportPath = generateComprehensiveReport(
    initialAssessment,
    finalAssessment,
    improvementResult,
    outputDir,
    fullConfig
  );
  
  console.log(`[Auto-Improvement] Final score: ${finalAssessment.averageScore.toFixed(1)}/10`);
  console.log(`[Auto-Improvement] Target met: ${meetsTarget ? '✅ Yes' : '❌ No'}`);
  
  return {
    success: meetsTarget,
    initialAssessment,
    finalAssessment,
    improvementResult,
    iterations: improvementResult.iterations,
    finalScore: finalAssessment.averageScore,
    meetsTarget,
    reportPath
  };
}

/**
 * Check if all categories are above threshold
 */
function allCategoriesAboveThreshold(
  assessment: QualityAssessment,
  threshold: number
): boolean {
  return Object.values(assessment.scores).every(score => score >= threshold);
}

/**
 * Generate comprehensive improvement report
 */
function generateComprehensiveReport(
  initial: QualityAssessment,
  final: QualityAssessment,
  improvement: ImprovementResult,
  outputDir: string,
  config: AutoImprovementConfig
): string {
  const reportPath = path.join(outputDir, 'auto-improvement-report.md');
  
  const scoreImprovements = Object.entries(final.scores).map(([category, finalScore]) => {
    const initialScore = initial.scores[category as keyof typeof initial.scores];
    const improvement = finalScore - initialScore;
    return { category, initialScore, finalScore, improvement };
  });
  
  const report = `# Auto-Improvement Report
## Journey to ${config.targetScore}/10 Quality Target

**Generated:** ${new Date().toISOString()}  
**Project:** ${path.basename(outputDir)}

---

## Executive Summary

- **Target Score:** ${config.targetScore}/10 (95%)
- **Initial Score:** ${initial.averageScore.toFixed(1)}/10
- **Final Score:** ${final.averageScore.toFixed(1)}/10
- **Improvement:** ${(final.averageScore - initial.averageScore).toFixed(1)} points
- **Iterations:** ${improvement.iterations}
- **Target Met:** ${improvement.meetsTarget ? '✅ **YES**' : '❌ **NO**'}

---

## Score Breakdown

| Category | Initial | Final | Improvement | Status |
|----------|---------|-------|-------------|--------|
${scoreImprovements.map(s => `| ${s.category} | ${s.initialScore.toFixed(1)}/10 | ${s.finalScore.toFixed(1)}/10 | ${s.improvement >= 0 ? '+' : ''}${s.improvement.toFixed(1)} | ${s.finalScore >= config.minCategoryScore ? '✅' : '❌'} |`).join('\n')}

---

## Issues Fixed

${improvement.improvements.length === 0 
  ? 'No specific improvements were applied during this run.' 
  : improvement.improvements.map(imp => `
### Iteration ${imp.iteration}

**Issue:** ${imp.issue.category} - ${imp.issue.description}  
**Severity:** ${imp.issue.severity}  
**Fix Applied:** ${imp.fix}  
**Score Impact:** ${imp.scoreBefore.toFixed(1)} → ${imp.scoreAfter.toFixed(1)} (+${(imp.scoreAfter - imp.scoreBefore).toFixed(1)})
`).join('\n')}

---

## Initial Assessment

**Verdict:** ${initial.verdict}  
**Meets Thresholds:** ${initial.meetsThresholds ? '✅ Yes' : '❌ No'}

### Issues Found Initially:
${initial.issues.length === 0 
  ? '✅ No issues found' 
  : initial.issues.map(i => `- **${i.category}** (${i.severity}): ${i.description}`).join('\n')}

---

## Final Assessment

**Verdict:** ${final.verdict}  
**Meets Thresholds:** ${final.meetsThresholds ? '✅ Yes' : '❌ No'}

### Remaining Issues:
${final.issues.length === 0 
  ? '✅ All issues resolved!' 
  : final.issues.map(i => `- **${i.category}** (${i.severity}): ${i.description}`).join('\n')}

---

## Recommendations

${improvement.meetsTarget 
  ? `✅ **SUCCESS!** Website quality has reached ${final.averageScore.toFixed(1)}/10, meeting the ${config.targetScore}/10 target. All categories are above the ${config.minCategoryScore}/10 minimum threshold.` 
  : `⚠️ **PARTIAL SUCCESS** Website quality improved from ${initial.averageScore.toFixed(1)}/10 to ${final.averageScore.toFixed(1)}/10, but did not reach the ${config.targetScore}/10 target.

**Next Steps:**
${final.issues.map(i => `1. ${i.suggestion}`).join('\n')}
`}

---

## Technical Details

- **Max Iterations:** ${config.maxIterations}
- **Min Category Score:** ${config.minCategoryScore}/10
- **Improvement Strategy:** Automatic issue detection and targeted fixes
- **Quality Assessment:** Real v4.0 analyzer with multi-expert panel

---
*Generated by Merlin Auto-Improvement System*
`;
  
  fs.writeFileSync(reportPath, report);
  console.log(`[Auto-Improvement] Comprehensive report saved to: ${reportPath}`);
  
  return reportPath;
}

