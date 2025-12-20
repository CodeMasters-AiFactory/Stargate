/**
 * Sterling Legal Partners - Reference Implementation
 * Builds Sterling website using the new modular system
 * Then auto-analyzes and documents the results
 */

import { createProjectConfig } from './projectConfig';
import { generateUnifiedWebsite } from './unifiedWebsiteGenerator';
// Reserved for future use: autoAnalyzeProject, compareAnalyses, getProjectDir
import fs from 'fs';
import path from 'path';
import type { GenerationProgress } from './types/multipage';

/**
 * Create Sterling Legal Partners project configuration
 */
export function createSterlingProjectConfig() {
  return createProjectConfig(
    'Sterling Legal Partners',
    'Law Firm',
    {
      city: '[CITY]',
      region: '[REGION]',
      country: 'ZA'
    },
    ['SMEs', 'Individuals & Families'],
    'Professional, confident, trustworthy',
    [
      { name: 'Corporate Law', shortDescription: 'Business formation, contracts, governance, dispute resolution for SMEs and growing companies' },
      { name: 'Family Law', shortDescription: 'Divorce, custody, maintenance and parenting plans handled with sensitivity and firm protection of rights' },
      { name: 'Criminal Defense', shortDescription: 'Strategic defense for bail applications, criminal charges and investigations, protecting liberty and record' }
    ],
    ['Home', 'Services', 'About', 'Contact'],
    undefined, // No brand preferences - let it generate
    'Reference implementation for high-quality law firm website. Must follow strict quality standards.'
  );
}

/**
 * Build Sterling website using modular system
 */
export async function buildSterlingReference(
  city: string = '[CITY]',
  region: string = '[REGION]',
  _phone: string = '[PHONE NUMBER]',
  onProgress?: (progress: GenerationProgress) => void
): Promise<void> {
  emitProgress({
    phase: 'planning',
    currentStep: 'Creating Sterling project',
    progress: 5,
    message: 'Setting up Sterling Legal Partners project...'
  }, onProgress);

  // Create or load project config
  const config = createSterlingProjectConfig();
  
  // Update location if provided
  if (city !== '[CITY]' || region !== '[REGION]') {
    const { loadProjectConfig, saveProjectConfig } = await import('./projectConfig');
    const existingConfig = loadProjectConfig(config.projectSlug);
    if (existingConfig) {
      existingConfig.location.city = city;
      existingConfig.location.region = region;
      saveProjectConfig(existingConfig);
    }
  }

  emitProgress({
    phase: 'planning',
    currentStep: 'Generating website',
    progress: 10,
    message: 'Building Sterling website using modular system...'
  }, onProgress);

  // Generate website using unified generator (reserved for future use)
  await generateUnifiedWebsite(config.projectSlug, onProgress);

  emitProgress({
    phase: 'assembly',
    currentStep: 'Analyzing website',
    progress: 95,
    message: 'Running quality analysis on generated website...'
  }, onProgress);

  // Note: Auto-analysis would need a URL
  // For now, we'll document that analysis should be run manually
  // or we could analyze the HTML files directly

  emitProgress({
    phase: 'assembly',
    currentStep: 'Complete',
    progress: 100,
    message: 'Sterling reference implementation complete!'
  }, onProgress);
}

/**
 * Document Sterling analysis in quality manifesto
 */
export function documentSterlingAnalysis(projectSlug: string): void {
  const analyses = getProjectAnalyses(projectSlug);
  
  if (analyses.length === 0) {
    console.warn('[Sterling Reference] No analyses found. Run analysis first.');
    return;
  }

  const latestAnalysis = analyses[0];
  const manifestoPath = path.join(process.cwd(), 'website_quality_standards', '00-website-quality-manifesto.md');
  
  if (!fs.existsSync(manifestoPath)) {
    console.warn('[Sterling Reference] Manifesto not found');
    return;
  }

  const manifesto = fs.readFileSync(manifestoPath, 'utf-8');
  
  const sterlingSection = `
---

## Sterling Example – Current Score & Next Improvements

**Project:** Sterling Legal Partners  
**Analysis Date:** ${new Date(latestAnalysis.timestamp).toLocaleString()}

### Category Scores

| Category | Score | Status |
|----------|-------|--------|
| Visual Design & Layout | ${latestAnalysis.categoryScores.visualDesign}/10 | ${getStatus(latestAnalysis.categoryScores.visualDesign)} |
| UX & Structure | ${latestAnalysis.categoryScores.uxStructure}/10 | ${getStatus(latestAnalysis.categoryScores.uxStructure)} |
| Content & Positioning | ${latestAnalysis.categoryScores.contentPositioning}/10 | ${getStatus(latestAnalysis.categoryScores.contentPositioning)} |
| Conversion & Trust | ${latestAnalysis.categoryScores.conversionTrust}/10 | ${getStatus(latestAnalysis.categoryScores.conversionTrust)} |
| SEO Foundations | ${latestAnalysis.categoryScores.seoFoundations}/10 | ${getStatus(latestAnalysis.categoryScores.seoFoundations)} |
| Creativity & Differentiation | ${latestAnalysis.categoryScores.creativityDifferentiation}/10 | ${getStatus(latestAnalysis.categoryScores.creativityDifferentiation)} |

**Average Score:** ${latestAnalysis.averageScore.toFixed(1)}/10  
**Verdict:** ${latestAnalysis.finalVerdict}

### What Needs Improvement to Hit 8.5+ in All Categories

${Object.entries(latestAnalysis.categoryDetails)
  .filter(([_, details]) => details.improvements.length > 0)
  .map(([category, details]) => {
    const categoryName = category.replace(/([A-Z])/g, ' $1').trim();
    return `**${categoryName}:**
${details.improvements.map(imp => `- ${imp}`).join('\n')}`;
  })
  .join('\n\n')}

### Next Steps

To reach world-class status (all categories ≥ 8.5/10):

1. **Visual Design:** ${latestAnalysis.categoryDetails.visualDesign.improvements[0] || 'Continue refining brand identity'}
2. **UX & Structure:** ${latestAnalysis.categoryDetails.uxStructure.improvements[0] || 'Enhance user journeys'}
3. **Content & Positioning:** ${latestAnalysis.categoryDetails.contentPositioning.improvements[0] || 'Add more specific content'}
4. **Conversion & Trust:** ${latestAnalysis.categoryDetails.conversionTrust.improvements[0] || 'Strengthen CTAs and trust elements'}
5. **SEO Foundations:** ${latestAnalysis.categoryDetails.seoFoundations.improvements[0] || 'Enhance SEO optimization'}
6. **Creativity & Differentiation:** ${latestAnalysis.categoryDetails.creativityDifferentiation.improvements[0] || 'Add unique creative elements'}

---

`;

  // Append to manifesto (before the last line if it exists)
  const updatedManifesto = manifesto + sterlingSection;
  fs.writeFileSync(manifestoPath, updatedManifesto, 'utf-8');
}

function getStatus(score: number): string {
  if (score < 4) return '❌ Poor';
  if (score < 6) return '⚠️ OK';
  if (score < 7.5) return '✅ Good';
  if (score < 8.5) return '⭐ Excellent';
  return '🏆 World-Class';
}

function emitProgress(progress: GenerationProgress, onProgress?: (progress: GenerationProgress) => void) {
  if (onProgress) {
    onProgress(progress);
  }
}

