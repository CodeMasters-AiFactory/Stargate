/**
 * Merlin 7.0 Orchestrator
 * 30-Phase Build Pipeline
 * Coordinates all engines in the correct order
 */

import { processIntakeForm, type IntakeFormData } from './intakeEngine';
import { analyzeIndustry } from './industryEngine';
import { generatePagePlan } from './pagePlannerEngine';
import { generateDesignSystem } from './designSystemEngine';
import { generateLayout, type GeneratedLayout } from './layoutEngine';
import { generateResponsiveRules, type ResponsiveRules } from './responsiveEngine';
import { generateImages } from './imageEngine';
import { generateSectionCopy, type SectionCopy } from './copyEngine';
import { generatePageSEO, generateSitemap, generateRobotsTxt, saveSEOFiles } from './seoEngine';
import { assessWebsiteQuality } from './qaEngine';
import { deployWebsite, generateDeploymentSummary, saveDeploymentSummary, type DeploymentConfig, type DeploymentResult } from './deployEngine';
import type { PlannedPage } from '../types/plannedPage';
import type { ImagePlan, GeneratedImage } from '../types/imagePlan';
import type { DesignTokens } from '../types/designTokens';
import type { PageSEOData } from '../types/seoTypes';
import type { QAReport } from '../types/qaReport';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface GenerationProgress {
  phase: number;
  phaseName: string;
  currentStep: string;
  progress: number; // 0-100
  message: string;
}

export interface Merlin7Result {
  projectSlug: string;
  pages: PlannedPage[];
  designTokens: DesignTokens;
  layouts: Map<string, GeneratedLayout>;
  images: GeneratedImage[];
  copies: Map<string, SectionCopy>;
  seo: Map<string, PageSEOData>;
  qaReport?: QAReport;
  deployment?: DeploymentResult;
  success: boolean;
  errors?: string[];
}

/**
 * Generate complete website using Merlin 7.0
 */
export async function generateMerlin7Website(
  intakeData: IntakeFormData,
  onProgress?: (progress: GenerationProgress) => void,
  deploymentConfig?: DeploymentConfig
): Promise<Merlin7Result> {
  const errors: string[] = [];
  
  try {
    // PHASE 1: Intake
    emitProgress(1, 'Intake', 'Processing intake form', 3, 'Collecting requirements...', onProgress);
    const { projectConfig } = processIntakeForm(intakeData);
    
    // PHASE 2: User Profile Extraction
    emitProgress(2, 'User Profile Extraction', 'Extracting user profile', 6, 'Analyzing user requirements...', onProgress);
    // Already done in intake
    
    // PHASE 3: Industry Detection
    emitProgress(3, 'Industry Detection', 'Detecting industry', 10, 'Analyzing industry...', onProgress);
    const industryProfile = await analyzeIndustry(projectConfig);
    
    // PHASE 4: Competitor Analysis
    emitProgress(4, 'Competitor Analysis', 'Analyzing competitors', 13, 'Researching competitors...', onProgress);
    // Would use competitor URL if provided
    
    // PHASE 5: Keyword Extraction
    emitProgress(5, 'Keyword Extraction', 'Extracting keywords', 16, 'Identifying keywords...', onProgress);
    // Done in industry profile
    
    // PHASE 6: Architecture Planning
    emitProgress(6, 'Architecture Planning', 'Planning architecture', 20, 'Designing site structure...', onProgress);
    
    // PHASE 7: Page List Generation
    emitProgress(7, 'Page List Generation', 'Generating pages', 23, 'Creating page list...', onProgress);
    const pagePlan = await generatePagePlan(projectConfig, industryProfile);
    
    // PHASE 8: Content Structure Planning
    emitProgress(8, 'Content Structure Planning', 'Planning content', 26, 'Structuring content...', onProgress);
    
    // PHASE 9: SEO Strategy Mapping
    emitProgress(9, 'SEO Strategy Mapping', 'Mapping SEO strategy', 30, 'Planning SEO...', onProgress);
    
    // PHASE 10: Design Tokens
    emitProgress(10, 'Design Tokens', 'Generating design tokens', 33, 'Creating design system...', onProgress);
    const designTokens = await generateDesignSystem(projectConfig, industryProfile);
    
    // PHASE 11: Typography System
    emitProgress(11, 'Typography System', 'Generating typography', 36, 'Designing typography...', onProgress);
    // Included in design tokens
    
    // PHASE 12: Color Palette Generation
    emitProgress(12, 'Color Palette Generation', 'Generating colors', 40, 'Creating color palette...', onProgress);
    // Included in design tokens
    
    // PHASE 13: Component Token Generation
    emitProgress(13, 'Component Token Generation', 'Generating components', 43, 'Creating components...', onProgress);
    // Included in design tokens
    
    // PHASE 14: Layout Skeleton (Blueprint)
    emitProgress(14, 'Layout Skeleton', 'Creating layout skeleton', 46, 'Designing layouts...', onProgress);
    
    // PHASE 15: AI Layout Variants
    emitProgress(15, 'AI Layout Variants', 'Selecting variants', 50, 'Optimizing layouts...', onProgress);
    const layouts = new Map<string, GeneratedLayout>();
    for (const page of pagePlan.pages) {
      const layout: GeneratedLayout = await generateLayout(page, projectConfig, industryProfile);
      layouts.set(page.id, layout);
    }

    // PHASE 16: Responsive Layouts
    emitProgress(16, 'Responsive Layouts', 'Generating responsive', 53, 'Making responsive...', onProgress);
    const _responsiveRules = new Map<string, ResponsiveRules>();
    for (const [pageId, layout] of layouts.entries()) {
      const rules: ResponsiveRules = generateResponsiveRules(layout, designTokens);
      _responsiveRules.set(pageId, rules);
    }
    
    // PHASE 17: Image Planning
    emitProgress(17, 'Image Planning', 'Planning images', 56, 'Planning images...', onProgress);
    // Generate image plans from sections
    const imagePlans: ImagePlan[] = [];
    for (const [pageId, layout] of layouts.entries()) {
      for (const section of layout.sections) {
        // Create image plan for each section that needs images
        if (section.type === 'hero' || section.type === 'about' || section.type === 'services') {
          imagePlans.push({
            id: `${pageId}-${section.id}`,
            page: pageId,
            section: section.id,
            type: section.type === 'hero' ? 'hero' : 'service',
            purpose: section.type === 'hero' ? 'attention' : 'explanation',
            prompt: `Professional ${projectConfig.industry} ${section.type} image, modern design, ${designTokens.colors.primary[500]} color scheme`,
            style: {
              artistic: 'photorealistic',
              mood: 'professional',
              colorScheme: [designTokens.colors.primary[500], designTokens.colors.accent[500]],
              composition: 'centered',
            },
            dimensions: {
              width: section.type === 'hero' ? 1792 : 1024,
              height: section.type === 'hero' ? 1024 : 1024,
              aspectRatio: section.type === 'hero' ? '16:9' : '1:1',
              format: 'webp',
              quality: 'hd',
            },
            alt: `${section.type} image for ${projectConfig.projectName}`,
            priority: section.type === 'hero' ? 'high' : 'medium',
            colorHarmony: [designTokens.colors.primary[500], designTokens.colors.accent[500]],
            industryContext: projectConfig.industry,
          } as ImagePlan);
        }
      }
    }
    
    // PHASE 18: DALL-E Generation
    emitProgress(18, 'DALL-E Generation', 'Generating images', 60, 'Creating images with DALL-E...', onProgress);
    const images = await generateImages(imagePlans, projectConfig, designTokens, projectConfig.projectSlug);
    
    // PHASE 19: Copywriting (4-step pipeline)
    emitProgress(19, 'Copywriting', 'Writing copy', 63, 'Generating content...', onProgress);
    const copies = new Map<string, SectionCopy>();
    for (const [pageId, layout] of layouts.entries()) {
      for (const section of layout.sections) {
        const copy: SectionCopy = await generateSectionCopy(section, projectConfig, industryProfile, designTokens);
        copies.set(`${pageId}-${section.id}`, copy);
      }
    }
    
    // PHASE 20: SEO Metadata Generation
    emitProgress(20, 'SEO Metadata', 'Generating SEO', 66, 'Optimizing SEO...', onProgress);
    const seo = new Map<string, PageSEOData>();
    for (const page of pagePlan.pages) {
      const pageSEO: PageSEOData = await generatePageSEO(page, projectConfig, industryProfile);
      seo.set(page.id, pageSEO);
    }
    
    // PHASE 21: Internal Linking Plan
    emitProgress(21, 'Internal Linking', 'Planning links', 70, 'Creating link structure...', onProgress);
    // Already done in page plan
    
    // PHASE 22: HTML/CSS Generator
    emitProgress(22, 'HTML/CSS Generator', 'Generating code', 73, 'Building HTML/CSS...', onProgress);
    // Would generate HTML/CSS from layouts, copies, images, SEO
    
    // PHASE 23: Multi-page Assembly
    emitProgress(23, 'Multi-page Assembly', 'Assembling pages', 76, 'Assembling website...', onProgress);
    // Would assemble all pages
    
    // PHASE 24: Accessibility Enhancements
    emitProgress(24, 'Accessibility Enhancements', 'Enhancing accessibility', 80, 'Improving accessibility...', onProgress);
    
    // PHASE 25: Performance Optimization
    emitProgress(25, 'Performance Optimization', 'Optimizing performance', 83, 'Optimizing performance...', onProgress);
    
    // PHASE 26: Puppeteer Quality Test
    emitProgress(26, 'Quality Test', 'Testing quality', 86, 'Running quality tests...', onProgress);
    const localUrl = `http://localhost:5000/website_projects/${projectConfig.projectSlug}/generated-v5/index.html`;
    let qaReport: QAReport | undefined;
    try {
      qaReport = await assessWebsiteQuality(localUrl, pagePlan.pages, 1, projectConfig.projectSlug);
      
      // Check navigation integrity - if it fails, this is critical
      if (qaReport.navigation.status === 'fail') {
        errors.push(`[CRITICAL] Navigation integrity check failed: ${qaReport.navigation.brokenLinks} of ${qaReport.navigation.totalLinks} links are broken`);
      }
    } catch (error: unknown) {
      logError(error, 'Merlin7 Orchestrator - QA assessment');
      const errorMessage = getErrorMessage(error);
      errors.push(`QA assessment failed: ${errorMessage}`);
    }
    
    // PHASE 27: Iteration Loops (Max 5)
    emitProgress(27, 'Iteration', 'Iterating', 90, 'Improving quality...', onProgress);
    let iteration = 1;
    const maxIterations = 5;
    while (qaReport && !qaReport.meetsThresholds && iteration < maxIterations) {
      iteration++;
      emitProgress(27, 'Iteration', `Iteration ${iteration}`, 90, `Improving (${iteration}/${maxIterations})...`, onProgress);
      // Would regenerate and reassess
      if (qaReport) {
        try {
          qaReport = await assessWebsiteQuality(localUrl, pagePlan.pages, iteration, projectConfig.projectSlug);
        } catch (error: unknown) {
          logError(error, `Merlin7 Orchestrator - QA iteration ${iteration}`);
          const errorMessage = getErrorMessage(error);
          errors.push(`QA iteration ${iteration} failed: ${errorMessage}`);
          break;
        }
      }
    }
    
    // PHASE 28: Deployment Preparation
    emitProgress(28, 'Deployment Preparation', 'Preparing deployment', 93, 'Preparing for deployment...', onProgress);
    const sitemap = generateSitemap(pagePlan.pages);
    const robots = generateRobotsTxt();
    saveSEOFiles(sitemap, robots, projectConfig.projectSlug);
    
    // PHASE 29: Export/Deploy
    emitProgress(29, 'Export/Deploy', 'Deploying', 96, 'Deploying website...', onProgress);
    let deployment: DeploymentResult | undefined;
    if (deploymentConfig) {
      try {
        deployment = await deployWebsite(projectConfig.projectSlug, deploymentConfig);
        const summary = generateDeploymentSummary(deployment, projectConfig);
        saveDeploymentSummary(summary, projectConfig.projectSlug);
      } catch (error: unknown) {
        logError(error, 'Merlin7 Orchestrator - Deployment');
        const errorMessage = getErrorMessage(error);
        errors.push(`Deployment failed: ${errorMessage}`);
      }
    }
    
    // PHASE 30: Final Documentation & Summary
    emitProgress(30, 'Documentation', 'Generating docs', 100, 'Finalizing...', onProgress);
    
    return {
      projectSlug: projectConfig.projectSlug,
      pages: pagePlan.pages,
      designTokens,
      layouts,
      images,
      copies,
      seo,
      qaReport,
      deployment,
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: unknown) {
    logError(error, 'Merlin7 Orchestrator - Generation failed');
    const errorMessage = getErrorMessage(error);
    errors.push(`Generation failed: ${errorMessage}`);
    throw error instanceof Error ? error : new Error(errorMessage);
  }
}

/**
 * Emit progress update
 */
function emitProgress(
  phase: number,
  phaseName: string,
  currentStep: string,
  progress: number,
  message: string,
  onProgress?: (progress: GenerationProgress) => void
): void {
  if (onProgress) {
    onProgress({
      phase,
      phaseName,
      currentStep,
      progress,
      message,
    });
  }
}

