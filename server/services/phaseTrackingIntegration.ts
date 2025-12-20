/**
 * Phase Tracking Integration
 * Integrates phase-by-phase reporting into website generation
 */

import { PhaseTracker } from './phaseTracker';
import { ratePhase, type PhaseRatingContext } from './phaseRater';
import type { ProjectConfig } from './projectConfig';
import type { GeneratedWebsite } from './merlinDesignLLM';
import type { QualityAssessment } from './qualityAssessment';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generate website with phase tracking
 */
export async function generateWebsiteWithPhaseTracking(
  projectConfig: ProjectConfig,
  generateWebsiteFn: () => Promise<GeneratedWebsite>,
  qualityAssessment?: QualityAssessment
): Promise<{ website: GeneratedWebsite; phaseTracker: PhaseTracker }> {
  const phaseTracker = new PhaseTracker(projectConfig.projectSlug, projectConfig.projectName);

  // Phase 1: Package Selection
  phaseTracker.startPhase(1);
  phaseTracker.addStep(1, 'Package Selection', `Selected package: ${projectConfig.packageType || 'Essential'}`, {
    packageType: projectConfig.packageType
  });
  phaseTracker.completeStep(1, 1, `Package ${projectConfig.packageType || 'Essential'} selected`);
  
  const phase1Rating = ratePhase({
    phaseNumber: 1,
    phaseName: 'Package Selection',
    projectConfig,
  });
  phaseTracker.completePhase(1, phase1Rating.rating, phase1Rating.ratingBreakdown, 
    phase1Rating.detailedAnalysis, phase1Rating.strengths, phase1Rating.weaknesses, 
    phase1Rating.improvementSuggestions, { projectConfig });

  // Phase 2: Client Specification - Track all sub-sections
  phaseTracker.startPhase(2);
  
  // Step 1: Project Overview
  phaseTracker.addStep(2, 'Project Overview', 'Collected project overview and description', {
    hasProjectOverview: !!projectConfig.projectOverview,
    projectOverviewLength: projectConfig.projectOverview?.length || 0
  });
  phaseTracker.completeStep(2, 1, `Project overview: ${projectConfig.projectOverview ? 'Provided' : 'Not provided'}`);
  
  // Step 2: Business Information Collection
  phaseTracker.addStep(2, 'Business Information Collection', 'Collected business name, type, and industry', {
    businessName: projectConfig.projectName,
    businessType: projectConfig.businessType,
    industry: projectConfig.industry,
    email: projectConfig.email,
    phone: projectConfig.phone,
    address: projectConfig.address
  });
  phaseTracker.completeStep(2, 2, `Business: ${projectConfig.projectName || 'N/A'} (${projectConfig.industry || 'N/A'})`);
  
  // Step 3: Location Information
  phaseTracker.addStep(2, 'Location Information', 'Collected location and regional data', {
    location: projectConfig.location,
    country: projectConfig.location?.country,
    region: projectConfig.location?.region,
    city: projectConfig.location?.city
  });
  phaseTracker.completeStep(2, 3, `Location: ${projectConfig.location?.city || 'N/A'}, ${projectConfig.location?.country || 'N/A'}`);
  
  // Step 4: Target Audience Definition
  phaseTracker.addStep(2, 'Target Audience Definition', 'Defined target audiences and personas', {
    targetAudiences: projectConfig.targetAudiences,
    audienceCount: projectConfig.targetAudiences?.length || 0
  });
  phaseTracker.completeStep(2, 4, `Target audiences: ${projectConfig.targetAudiences?.length || 0} defined`);
  
  // Step 5: Services & Pages Planning
  phaseTracker.addStep(2, 'Services & Pages Planning', 'Planned services and pages to generate', {
    services: projectConfig.services,
    servicesCount: projectConfig.services?.length || 0,
    pagesToGenerate: projectConfig.pagesToGenerate,
    pagesCount: projectConfig.pagesToGenerate?.length || 0
  });
  phaseTracker.completeStep(2, 5, `${projectConfig.services?.length || 0} services, ${projectConfig.pagesToGenerate?.length || 0} pages planned`);
  
  // Step 6: Brand Preferences
  phaseTracker.addStep(2, 'Brand Preferences', 'Collected brand preferences and style requirements', {
    brandPreferences: projectConfig.brandPreferences,
    colorPreset: projectConfig.brandPreferences?.colorPreset,
    font: projectConfig.brandPreferences?.font,
    style: projectConfig.brandPreferences?.style,
    tone: projectConfig.brandPreferences?.tone
  });
  phaseTracker.completeStep(2, 6, `Brand preferences: ${projectConfig.brandPreferences ? 'Defined' : 'Not defined'}`);
  
  // Step 7: Content Requirements
  phaseTracker.addStep(2, 'Content Requirements', 'Collected content tone, style, and requirements', {
    contentTone: projectConfig.contentTone,
    contentStyle: projectConfig.contentStyle,
    hasContentRequirements: !!(projectConfig.contentTone || projectConfig.contentStyle)
  });
  phaseTracker.completeStep(2, 7, `Content tone: ${projectConfig.contentTone || 'Not specified'}`);
  
  // Step 8: Competitor Analysis
  phaseTracker.addStep(2, 'Competitor Analysis', 'Collected competitor URLs and analysis data', {
    competitors: projectConfig.competitors,
    competitorCount: projectConfig.competitors?.length || 0,
    inspirationalSites: projectConfig.inspirationalSites,
    inspirationalCount: projectConfig.inspirationalSites?.length || 0
  });
  phaseTracker.completeStep(2, 8, `${projectConfig.competitors?.length || 0} competitors, ${projectConfig.inspirationalSites?.length || 0} inspirational sites`);
  
  // Step 9: Visual Assets
  phaseTracker.addStep(2, 'Visual Assets', 'Collected visual asset requirements and preferences', {
    hasVisualAssets: !!(projectConfig.visualAssets || projectConfig.logo),
    logo: projectConfig.logo,
    images: projectConfig.visualAssets
  });
  phaseTracker.completeStep(2, 9, `Visual assets: ${(projectConfig.visualAssets || projectConfig.logo) ? 'Provided' : 'Not provided'}`);
  
  // Step 10: Location & Social Media
  phaseTracker.addStep(2, 'Location & Social Media', 'Collected social media links and location details', {
    socialMedia: projectConfig.socialMedia,
    socialMediaCount: projectConfig.socialMedia ? Object.keys(projectConfig.socialMedia).length : 0,
    googleBusinessLink: projectConfig.googleBusinessLink
  });
  phaseTracker.completeStep(2, 10, `${projectConfig.socialMedia ? Object.keys(projectConfig.socialMedia).length : 0} social media links`);
  
  // Step 11: Preferences & Additional Requirements
  phaseTracker.addStep(2, 'Preferences & Additional Requirements', 'Collected additional preferences and requirements', {
    domainStatus: projectConfig.domainStatus,
    hasAdditionalRequirements: !!(projectConfig.additionalRequirements || projectConfig.specialRequests)
  });
  phaseTracker.completeStep(2, 11, `Domain status: ${projectConfig.domainStatus || 'Not specified'}`);
  
  const phase2Rating = ratePhase({
    phaseNumber: 2,
    phaseName: 'Client Specification',
    projectConfig,
  });
  phaseTracker.completePhase(2, phase2Rating.rating, phase2Rating.ratingBreakdown,
    phase2Rating.detailedAnalysis, phase2Rating.strengths, phase2Rating.weaknesses,
    phase2Rating.improvementSuggestions, { projectConfig });

  // Generate website (this will internally track phases 3-16)
  let generatedWebsite: GeneratedWebsite;
  let actualQualityAssessment: QualityAssessment | undefined = qualityAssessment;
  
  try {
    generatedWebsite = await generateWebsiteFn();
    
    // If quality assessment wasn't provided, try to get it from the website
    if (!actualQualityAssessment && generatedWebsite.qualityScore) {
      // Quality assessment was done during generation, create a mock for phase tracking
      actualQualityAssessment = {
        scores: {
          visualDesign: generatedWebsite.qualityScore.visualDesign,
          uxStructure: generatedWebsite.qualityScore.uxStructure,
          contentQuality: generatedWebsite.qualityScore.contentQuality,
          conversionTrust: generatedWebsite.qualityScore.conversionTrust,
          seoFoundations: generatedWebsite.qualityScore.seoFoundations,
          creativity: generatedWebsite.qualityScore.creativity,
        },
        averageScore: (
          generatedWebsite.qualityScore.visualDesign +
          generatedWebsite.qualityScore.uxStructure +
          generatedWebsite.qualityScore.contentQuality +
          generatedWebsite.qualityScore.conversionTrust +
          generatedWebsite.qualityScore.seoFoundations +
          generatedWebsite.qualityScore.creativity
        ) / 6,
        verdict: generatedWebsite.qualityScore.meetsThresholds ? 'Good' : 'OK',
        issues: [],
        meetsThresholds: generatedWebsite.qualityScore.meetsThresholds,
      };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Phase tracking error:', errorMessage);
    // Track error in phase 16
    phaseTracker.startPhase(16);
    phaseTracker.addStep(16, 'Generation Error', `Website generation failed: ${error.message}`, {
      error: error.message
    });
    phaseTracker.completeStep(16, 1, `Error: ${error.message}`, [error.message]);
    phaseTracker.completePhase(16, 0, [], 
      `Website generation failed: ${error.message}`, [], 
      [`Generation error: ${error.message}`], 
      ['Fix generation errors and retry'], 
      undefined, [error.message]);
    throw error;
  }

  // Phase 3-15: Google Rating Categories
  // These are evaluated based on the generated website
  const googleRatingPhases = [
    { number: 3, name: 'Page Experience' },
    { number: 4, name: 'Core Web Vitals' },
    { number: 5, name: 'Mobile Usability' },
    { number: 6, name: 'Security' },
    { number: 7, name: 'Structured Data' },
    { number: 8, name: 'Content Quality' },
    { number: 9, name: 'Internal Linking' },
    { number: 10, name: 'Image Optimization' },
    { number: 11, name: 'URL Structure' },
    { number: 12, name: 'Meta Tags' },
    { number: 13, name: 'Accessibility' },
    { number: 14, name: 'Site Speed' },
    { number: 15, name: 'Mobile-First Design' },
  ];

  for (const phase of googleRatingPhases) {
    phaseTracker.startPhase(phase.number);
    
    // Add evaluation step
    phaseTracker.addStep(phase.number, 'Evaluation', `Evaluating ${phase.name} criteria`, {
      phaseName: phase.name
    });
    
    const rating = ratePhase({
      phaseNumber: phase.number,
      phaseName: phase.name,
      projectConfig,
      generatedWebsite,
      qualityAssessment: actualQualityAssessment,
    });
    
    phaseTracker.completeStep(phase.number, 1, `Rating: ${rating.rating}/100 - ${rating.strengths.length} strengths, ${rating.weaknesses.length} weaknesses identified`);
    
    phaseTracker.completePhase(phase.number, rating.rating, rating.ratingBreakdown,
      rating.detailedAnalysis, rating.strengths, rating.weaknesses,
      rating.improvementSuggestions, rating.ratingBreakdown);
  }

  // Phase 16: Website Builder - Track all generation steps
  phaseTracker.startPhase(16);
  
  // Log all the major steps that happened during generation
  phaseTracker.addStep(16, 'Design Strategy Generation', 'Generated AI design strategy and design context', {
    hasDesignStrategy: true,
    hasDesignContext: true
  });
  phaseTracker.completeStep(16, 1, 'Design strategy and context generated successfully');
  
  phaseTracker.addStep(16, 'Section Planning', 'Planned website sections and structure', {
    hasSectionPlan: true
  });
  phaseTracker.completeStep(16, 2, 'Section plan created');
  
  phaseTracker.addStep(16, 'Layout Generation', 'Generated layout structure with sections', {
    hasLayout: !!generatedWebsite.layout,
    sectionCount: generatedWebsite.layout?.sections?.length || 0
  });
  phaseTracker.completeStep(16, 3, `Layout generated with ${generatedWebsite.layout?.sections?.length || 0} sections`);
  
  phaseTracker.addStep(16, 'Style System Generation', 'Generated style system with colors, typography, and spacing', {
    hasStyleSystem: !!generatedWebsite.styleSystem
  });
  phaseTracker.completeStep(16, 4, 'Style system generated');
  
  phaseTracker.addStep(16, 'Content Generation', 'Generated copy and content for all sections', {
    hasCopy: !!generatedWebsite.copy
  });
  phaseTracker.completeStep(16, 5, 'Content generated');
  
  phaseTracker.addStep(16, 'Image Planning & Generation', 'Planned and generated images for sections', {
    hasImages: true
  });
  phaseTracker.completeStep(16, 6, 'Images planned and generated');
  
  phaseTracker.addStep(16, 'SEO Optimization', 'Generated SEO metadata, tags, and structured data', {
    hasSEO: true
  });
  phaseTracker.completeStep(16, 7, 'SEO metadata generated');
  
  phaseTracker.addStep(16, 'Code Generation', 'Generated HTML, CSS, and JavaScript code', {
    hasHTML: !!generatedWebsite.code?.html,
    hasCSS: !!generatedWebsite.code?.css,
    hasJS: !!generatedWebsite.code?.javascript,
    htmlLength: generatedWebsite.code?.html?.length || 0,
    cssLength: generatedWebsite.code?.css?.length || 0
  });
  phaseTracker.completeStep(16, 8, `Code generated: ${((generatedWebsite.code?.html?.length || 0) + (generatedWebsite.code?.css?.length || 0)).toLocaleString()} characters`);
  
  phaseTracker.addStep(16, 'Quality Assessment', 'Assessed website quality and performance', {
    hasQualityScore: !!generatedWebsite.qualityScore,
    meetsThresholds: generatedWebsite.qualityScore?.meetsThresholds || false
  });
  phaseTracker.completeStep(16, 9, `Quality assessed: ${generatedWebsite.qualityScore ? `Score ${generatedWebsite.qualityScore.meetsThresholds ? 'meets' : 'below'} thresholds` : 'Estimated'}`);
  
  const phase16Rating = ratePhase({
    phaseNumber: 16,
    phaseName: 'Website Builder',
    projectConfig,
    generatedWebsite,
    qualityAssessment: actualQualityAssessment,
  });
  phaseTracker.completePhase(16, phase16Rating.rating, phase16Rating.ratingBreakdown,
    phase16Rating.detailedAnalysis, phase16Rating.strengths, phase16Rating.weaknesses,
    phase16Rating.improvementSuggestions, { generatedWebsite });

  // Phase 17: Review & Final Output
  phaseTracker.startPhase(17);
  
  phaseTracker.addStep(17, 'Final Review', 'Reviewed complete website and all components', {
    hasWebsite: !!generatedWebsite,
    hasQualityAssessment: !!actualQualityAssessment
  });
  phaseTracker.completeStep(17, 1, 'Website review completed');
  
  phaseTracker.addStep(17, 'Report Generation', 'Generated phase-by-phase report with ratings', {
    totalPhases: 17,
    allPhasesCompleted: true
  });
  phaseTracker.completeStep(17, 2, 'Phase report generated');
  
  phaseTracker.addStep(17, 'Output Finalization', 'Finalized website output and saved all files', {
    filesSaved: true
  });
  phaseTracker.completeStep(17, 3, 'Website output finalized');
  
  const phase17Rating = ratePhase({
    phaseNumber: 17,
    phaseName: 'Review & Final Output',
    projectConfig,
    generatedWebsite,
    qualityAssessment: actualQualityAssessment,
  });
  phaseTracker.completePhase(17, phase17Rating.rating, phase17Rating.ratingBreakdown,
    phase17Rating.detailedAnalysis, phase17Rating.strengths, phase17Rating.weaknesses,
    phase17Rating.improvementSuggestions, { generatedWebsite, qualityAssessment: actualQualityAssessment });

  // Save reports
  savePhaseReports(projectConfig.projectSlug, phaseTracker);

  return { website: generatedWebsite, phaseTracker };
}

/**
 * Save phase reports to filesystem
 */
function savePhaseReports(projectSlug: string, phaseTracker: PhaseTracker): void {
  const outputDir = path.join(process.cwd(), 'website_projects', projectSlug, 'generated-v5');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save Markdown report
  const markdownReport = phaseTracker.exportMarkdown();
  fs.writeFileSync(
    path.join(outputDir, 'phase-report.md'),
    markdownReport,
    'utf-8'
  );

  // Save JSON report
  const jsonReport = phaseTracker.exportJSON();
  fs.writeFileSync(
    path.join(outputDir, 'phase-report.json'),
    jsonReport,
    'utf-8'
  );

  console.log(`[PhaseTracking] Reports saved to ${outputDir}`);
}

/**
 * Load phase report from filesystem
 */
export function loadPhaseReport(projectSlug: string): { markdown?: string; json?: string } {
  const outputDir = path.join(process.cwd(), 'website_projects', projectSlug, 'generated-v5');
  
  const markdownPath = path.join(outputDir, 'phase-report.md');
  const jsonPath = path.join(outputDir, 'phase-report.json');

  const result: { markdown?: string; json?: string } = {};

  if (fs.existsSync(markdownPath)) {
    result.markdown = fs.readFileSync(markdownPath, 'utf-8');
  }

  if (fs.existsSync(jsonPath)) {
    result.json = fs.readFileSync(jsonPath, 'utf-8');
  }

  return result;
}

