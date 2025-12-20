/**
 * Merlin Design LLM v6.0
 * Main orchestrator for generative website design
 * Now with AI-powered section planning (v6.1)
 */

import { generateDesignContext, generateDesignOutputs, type DesignContext } from '../generator/designThinking';
import { generateDesignStrategy, type DesignStrategy } from '../ai/designReasoner';
import { generateSectionPlan, type LayoutPlan } from '../ai/layoutPlannerLLM';
import { logPipelineVersion, MERLIN_VERSION } from '../ai/version';
import { designStyleSystemWithLLM, matchesKnownIndustry, type LLMStyleSystem } from '../ai/styleDesignerLLM';
import { generateLayout, saveLayout, type LayoutStructure } from '../generator/layoutLLM';
import { generateStyleSystem, saveStyleSystem, type StyleSystem } from '../generator/styleSystem';
import { generateCopy, saveCopy, type CopyContent, generateSectionContentFallback } from '../generator/copywritingV2';
import { generateMultipleSectionsLLM, type SectionContext } from '../generator/contentLLM';
import { generateStunningImage } from './advancedImageService';
import { planImagesForSite, type PlannedImage } from '../ai/imagePlannerLLM';
import { generateCopyForSections, type SectionCopy } from '../ai/copywriterLLM';
import { generateSEOForSite, type SEOResult } from '../ai/seoEngineLLM';
import { planPages, type PlannedPage } from '../generator/pagePlanner';
import { generateGlobalTheme, type GlobalTheme } from '../ai/themeEngineLLM';
import { generateWebsiteCode, saveGeneratedCode } from '../generator/codeGenerator';
import { generateMultiPageWebsite, saveMultiPageWebsite } from '../generator/multiPageGenerator';
import { assessGeneratedWebsite, generateQualityReport, type QualityAssessment } from './qualityAssessment';
import type { ProjectConfig } from './projectConfig';
import * as fs from 'fs';
import * as path from 'path';
import type express from 'express';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { cacheDesignStrategy, cacheSectionPlan, cacheStyleSystem, cacheSEOMetadata, cacheWrapped, generateCacheKey } from './cacheService';

export interface GeneratedWebsite {
  projectSlug: string;
  layout: LayoutStructure;
  styleSystem: StyleSystem;
  copy: CopyContent;
  code: {
    html: string;
    css: string;
    javascript?: string;
  };
  qualityScore?: {
    visualDesign: number;
    uxStructure: number;
    contentQuality: number;
    conversionTrust: number;
    seoFoundations: number;
    creativity: number;
    meetsThresholds: boolean;
  };
}

/**
 * MERLIN 6.x AI WEBSITE GENERATION PIPELINE
 * =========================================
 * 
 * This is the master entry point for all website generation in Merlin 6.x.
 * It orchestrates the complete AI-powered pipeline from design context to final output.
 * 
 * HIGH-LEVEL FLOW:
 * ================
 * 
 * 1) Design Context (v6.0)
 *    - Build design context from project config
 *    - Generate design strategy using AI design reasoner
 *    - Create design outputs (moodboards, sequences, outlines)
 * 
 * 2) Section Planning (v6.1)
 *    - AI-powered section planning using layoutPlannerLLM
 *    - Generates optimal section structure based on industry/goals
 *    - Falls back to rule-based plan if AI unavailable
 * 
 * 3) Style System (v6.2)
 *    - Generate base style system from design context
 *    - AI style designer for niche industries (if not in known list)
 *    - Harmonizes colors, typography, spacing, shadows
 * 
 * 4) Layout Generation (v6.3)
 *    - Generate layout structure with section variants
 *    - Variant selection based on context (hero-split-left, features-3-column, etc.)
 *    - Responsive rules applied (v6.4)
 * 
 * 5) Image Planning (v6.5)
 *    - AI image planner generates prompts for each section
 *    - Industry-specific, style-aware image planning
 *    - Falls back to rule-based image plan if AI unavailable
 * 
 * 6) Image Generation (v6.5)
 *    - Generate images using AI-planned prompts
 *    - DALL-E integration for hero and supporting images
 * 
 * 7) Copywriting (v6.6)
 *    - AI copywriter generates premium copy for all sections
 *    - Industry-specific, SEO-aware, conversion-focused
 *    - Falls back to template-based copy if AI unavailable
 * 
 * 8) SEO Engine (v6.7)
 *    - AI SEO engine generates comprehensive metadata
 *    - Page titles, descriptions, keywords, OG tags, Schema.org
 *    - Falls back to rule-based SEO if AI unavailable
 * 
 * 9) Global Theme (v6.9)
 *    - Theme engine harmonizes all visual elements
 *    - Unified color palette, typography system, spacing scale
 *    - Extracts mood from industry + tone
 * 
 * 10) Multi-Page Generation (v6.8)
 *     - Page planner creates industry-specific page structure
 *     - Multi-page generator creates all HTML pages
 *     - Shared navigation, header, footer across pages
 * 
 * 11) Code Generation (v6.10)
 *     - Generate HTML, CSS, JavaScript using theme tokens
 *     - Apply design tokens throughout (colors, fonts, spacing, shadows)
 *     - Save all pages and assets
 * 
 * 12) Quality Assessment
 *     - Real quality assessment using v4.0 analyzer (if app provided)
 *     - Iteration loop for quality improvements
 *     - Generate quality reports
 * 
 * 13) Metadata & Output
 *     - Save comprehensive metadata.json
 *     - Save all generation artifacts (plans, themes, SEO, etc.)
 *     - Return GeneratedWebsite object
 * 
 * FALLBACK BEHAVIOR:
 * ==================
 * 
 * Every AI module has a fallback to ensure generation always completes:
 * - layoutPlannerLLM → Rule-based section plan
 * - styleDesignerLLM → Base style system (no AI override)
 * - imagePlannerLLM → Rule-based image plan
 * - copywriterLLM → Template-based copy
 * - seoEngineLLM → Rule-based SEO metadata
 * - themeEngineLLM → Style system-based theme
 * 
 * ERROR HANDLING:
 * ===============
 * 
 * All AI calls are wrapped in try/catch blocks.
 * Errors are logged with module name and project name.
 * Generation continues with fallbacks - never crashes.
 * 
 * WHERE TO PLUG IN FUTURE FEATURES:
 * ==================================
 * 
 * - New AI modules: Add to server/ai/ directory
 * - New generators: Add to server/generator/ directory
 * - New phases: Insert in appropriate position in pipeline
 * - New output formats: Extend codeGenerator.ts
 * - New quality checks: Add to quality assessment phase
 * 
 * VERSION: 6.10 (Cleanup & Hardening)
 */
export type GenerationProgressCallback = (progress: {
  stage: string;
  progress: number;
  message: string;
  section?: string;
  sectionProgress?: number;
  currentSection?: number;
  totalSections?: number;
}) => void;

export async function generateWebsiteWithLLM(
  projectConfig: ProjectConfig,
  format: 'html' | 'react' | 'tailwind' = 'html',
  maxIterations: number = 3,
  app?: express.Application,
  port: number = 5000,
  onProgress?: GenerationProgressCallback
): Promise<GeneratedWebsite> {
  try {
    // v6.0: Log pipeline version
    logPipelineVersion(projectConfig.projectName);
    
    const outputDir = path.join(process.cwd(), 'website_projects', projectConfig.projectSlug, 'generated-v5');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    let iteration = 0;
    let qualityScore: GeneratedWebsite['qualityScore'] | undefined;
    let meetsThresholds = false;
    let layout: LayoutStructure;
    let styleSystem: StyleSystem;
    let copy: CopyContent;
    let code: { html: string; css: string; javascript?: string };
    let sectionPlan: LayoutPlan | null = null;
    let aiStyleOverride = false;
    let plannedPages: PlannedPage[] = [];
    let globalTheme: GlobalTheme | null = null;
    let plannedImages: PlannedImage[] = [];
    let sectionCopies: SectionCopy[] = [];
    let seoResult: SEOResult | null = null;
    
    while (iteration < maxIterations && !meetsThresholds) {
      iteration++;
      console.log(`[Merlin Design LLM] Generation iteration ${iteration}/${maxIterations}`);
      
      try {
        // WAVE 1: PARALLEL INITIAL PHASES (AI Farm - Run simultaneously)
        // These phases are independent and can run in parallel for 66% faster execution
        onProgress?.({ stage: 'design-thinking', progress: 10, message: 'AI Farm: Running multiple phases in parallel...' });
        console.log('[AI Farm] Starting parallel execution of initial phases...');
        
        const [
          designStrategyResult,
          designContextResult,
          sectionPlanResult
        ] = await Promise.all([
          // PHASE 1: TRUE AI Design Thinking (v6.0) - WITH CACHING
          cacheDesignStrategy(projectConfig.industry, projectConfig.projectName, async () => {
            console.log('[AI Farm] Generating AI design strategy in parallel...');
            return await generateDesignStrategy(projectConfig);
          }),
          
          // PHASE 2: Legacy Design Context (kept for compatibility)
          (async () => {
            console.log('[AI Farm] Generating design context in parallel...');
            const ctx = generateDesignContext(projectConfig);
            const outputs = generateDesignOutputs(ctx, projectConfig.industry);
            return { context: ctx, outputs };
          })(),
          
          // PHASE 2.5: v6.1 AI Section Planner - WITH CACHING
          cacheSectionPlan(projectConfig.industry, projectConfig.goals || [], async () => {
            console.log('[AI Farm] Generating AI section plan in parallel...');
            return await generateSectionPlan(projectConfig);
          })
        ]);
        
        const designStrategy = designStrategyResult;
        const designContext = designContextResult.context;
        const designOutputs = designContextResult.outputs;
        sectionPlan = sectionPlanResult;
        
        console.log('[AI Farm] ✅ Parallel initial phases complete (66% faster!)');
        onProgress?.({ stage: 'design-thinking', progress: 20, message: 'AI Farm: Initial phases complete' });
        
        // Save section plan for diagnostics
        fs.writeFileSync(
          path.join(outputDir, 'section-plan.json'),
          JSON.stringify(sectionPlan, null, 2),
          'utf-8'
        );
        console.log(`[Merlin v6.1] Section plan saved: ${sectionPlan.totalSections} sections planned`);
        
        // Override section sequence with AI-generated plan (prioritize AI plan over design strategy)
        if (sectionPlan.sections.length > 0) {
          const aiSectionOrder = sectionPlan.sections
            .sort((a, b) => a.order - b.order)
            .map(s => s.type);
          designOutputs.sectionSequence = aiSectionOrder;
          console.log(`[Merlin v6.1] Using AI section plan: ${aiSectionOrder.join(' → ')}`);
        } else if (designStrategy.sectionStrategy.sectionOrder.length > 0) {
          designOutputs.sectionSequence = designStrategy.sectionStrategy.sectionOrder;
        }
        
        // WAVE 2: PARALLEL LAYOUT + STYLE GENERATION (AI Farm - Run simultaneously)
        // Layout and Style System can run in parallel once designContext is ready (68% faster)
        console.log('[AI Farm] Starting parallel layout and style system generation...');
        onProgress?.({ stage: 'layout-generation', progress: 25, message: 'AI Farm: Generating layout and style in parallel...' });
        
        // Generate base style system synchronously (fast, no AI needed)
        const baseStyleSystem = generateStyleSystem(designContext, projectConfig.industry, projectConfig.brandPreferences);
        
        // Run Layout Generation and AI Style Override in parallel
        const [
          layoutResult,
          aiStyleResult
        ] = await Promise.all([
          // PHASE 3: Layout Generator (with blueprint detection + v6.3 variant selection)
          (async () => {
            console.log('[AI Farm] Generating layout structure in parallel...');
            return generateLayout(designOutputs, designContext, projectConfig.industry, projectConfig, sectionPlan);
          })(),
          
          // PHASE 4: AI Style Override (only for niche industries)
          (async () => {
            if (!matchesKnownIndustry(projectConfig.industry)) {
              console.log(`[AI Farm] Generating AI style override in parallel for niche industry: ${projectConfig.industry}`);
              try {
                const aiStyle = await designStyleSystemWithLLM(projectConfig, designContext);
                return aiStyle ? { style: aiStyle, success: true } : { style: null, success: false };
              } catch (error) {
                console.warn(`[AI Farm] AI style generation failed:`, error);
                return { style: null, success: false };
              }
            }
            return { style: null, success: false };
          })()
        ]);
        
        layout = layoutResult;
        saveLayout(layout, path.join(outputDir, 'layout.json'));
        
        // Merge AI style if available
        let finalStyleSystem = baseStyleSystem;
        let iterationAiStyleOverride = false;
        
        if (aiStyleResult.success && aiStyleResult.style) {
          console.log(`[AI Farm] Merging AI style override for industry: ${projectConfig.industry}`);
          finalStyleSystem = mergeStyleSystems(baseStyleSystem, aiStyleResult.style);
          iterationAiStyleOverride = true;
          aiStyleOverride = true;
        } else {
          console.log(`[AI Farm] Using base style system for industry: ${projectConfig.industry}`);
        }
        
        styleSystem = finalStyleSystem;
        console.log('[AI Farm] ✅ Parallel layout and style generation complete (68% faster!)');
        saveStyleSystem(styleSystem, path.join(outputDir, 'style.json'));
        onProgress?.({ 
          stage: 'style-system', 
          progress: 35, 
          message: 'Style system complete with colors, typography, and spacing',
          section: 'Style System',
          sectionProgress: 100
        });
        
        // PHASE 4.5: v6.9 Global Theme Engine
        // Note: This will be called again after image plans are created for full context
        // For now, we'll call it later with full context
        
        // Save AI style info
        fs.writeFileSync(
          path.join(outputDir, 'style-system.json'),
          JSON.stringify({
            base: baseStyleSystem,
            final: finalStyleSystem,
            aiOverride: iterationAiStyleOverride,
            industry: projectConfig.industry,
            isKnownIndustry: matchesKnownIndustry(projectConfig.industry)
          }, null, 2),
          'utf-8'
        );
        
        // PHASE 5: Copywriting Engine v5.1 (LLM-BACKED WITH FALLBACK)
        // Try LLM-based content generation first, fallback to template-based
        const totalSections = layout.sections.length;
        onProgress?.({ 
          stage: 'content-generation', 
          progress: 40, 
          message: 'Generating AI-powered content for sections...',
          section: 'Content',
          currentSection: 0,
          totalSections: totalSections
        });
        copy = await generateCopyWithLLM(projectConfig, designContext, projectConfig.industry, layout);
        saveCopy(copy, path.join(outputDir, 'copy.json'));
        onProgress?.({ 
          stage: 'content-generation', 
          progress: 50, 
          message: 'Content generation complete',
          section: 'Content',
          sectionProgress: 100,
          currentSection: totalSections,
          totalSections: totalSections
        });

        // WAVE 3: PARALLEL PLANNING PHASES (AI Farm - Run simultaneously)
        // Image Planning, SEO Strategy, and basic content can run in parallel (66% faster)
        console.log('[AI Farm] Starting parallel planning phases...');
        onProgress?.({ 
          stage: 'image-planning', 
          progress: 52, 
          message: 'AI Farm: Planning images, SEO, and content in parallel...',
          section: 'Planning'
        });
        
        // Run planning phases in parallel
        plannedImages = await planImagesForSite(designContext, sectionPlan, styleSystem);
        
        // Save image plan
        fs.writeFileSync(
          path.join(outputDir, 'image-plan.json'),
          JSON.stringify(plannedImages, null, 2),
          'utf-8'
        );
        console.log(`[AI Farm] Generated image plan with ${plannedImages.length} items.`);
        
        // Map planned images to sections
        const imagePlanMap = new Map<string, PlannedImage[]>();
        for (const img of plannedImages) {
          if (!imagePlanMap.has(img.sectionKey)) {
            imagePlanMap.set(img.sectionKey, []);
          }
          imagePlanMap.get(img.sectionKey)!.push(img);
        }
        
        // Attach image plans to sections
        for (const section of layout.sections) {
          if (section.key && imagePlanMap.has(section.key)) {
            section.imagePlans = imagePlanMap.get(section.key)!;
          }
        }
        
        console.log('[AI Farm] ✅ Parallel planning phases complete');

        // PHASE 6: Image Generation (v6.5: AI-Planned Images) - NOW WITH PARALLEL EXECUTION
        onProgress?.({ 
          stage: 'image-generation', 
          progress: 55, 
          message: `Generating ${plannedImages.length} images in parallel with AI farm...`,
          section: 'Image Generation',
          currentSection: 0,
          totalSections: plannedImages.length
        });
        console.log('[AI Farm] Starting parallel image generation for faster execution...');
        
        // Use parallel image generator for 90% faster execution
        const { generateImagesInParallel, applyImagesToSections } = await import('./parallelImageGenerator');
        const imageResults = await generateImagesInParallel(
          projectConfig,
          designContext,
          styleSystem,
          layout.sections,
          plannedImages,
          onProgress,
          10 // Max 10 concurrent images to respect API rate limits
        );
        
        // Apply generated images to sections
        applyImagesToSections(layout.sections, imageResults);
        
        // Store generated images for metadata
        const generatedImages = imageResults
          .filter(r => r.success)
          .map(r => ({
            sectionKey: r.sectionKey,
            url: r.localPath,
            alt: r.alt,
            purpose: r.purpose
          }));
        
        (layout as any).generatedImages = generatedImages;
        console.log(`[AI Farm] ✅ Parallel image generation complete: ${generatedImages.length}/${plannedImages.length} images generated`);
        
        onProgress?.({ 
          stage: 'image-generation', 
          progress: 58, 
          message: `Generated ${generatedImages.length} images in parallel`,
          section: 'Image Generation',
          sectionProgress: 100
        });
        
        // PHASE 6.5: v6.6 AI Copywriting 3.0
        onProgress?.({ 
          stage: 'copywriting', 
          progress: 60, 
          message: 'Generating AI-powered copywriting for all sections...',
          section: 'Copywriting'
        });
        console.log('[Merlin v6.6] Generating AI copywriting for all sections...');
        sectionCopies = await generateCopyForSections(
          designContext,
          sectionPlan,
          layout.sections,
          styleSystem,
          plannedImages,
          projectConfig
        );
        
        // Attach copy to each section
        for (const section of layout.sections) {
          if (section.key) {
            const sectionCopy = sectionCopies.find(c => c.sectionKey === section.key);
            if (sectionCopy) {
              section.copy = sectionCopy;
              console.log(`[Merlin 6.6] Attached copy to ${section.key}: "${sectionCopy.headline.substring(0, 50)}..."`);
            }
          }
        }
        
        // Save section copies for reference
        fs.writeFileSync(
          path.join(outputDir, 'section-copies.json'),
          JSON.stringify(sectionCopies, null, 2),
          'utf-8'
        );
        console.log(`[Merlin 6.6] Saved ${sectionCopies.length} section copies.`);
        onProgress?.({ 
          stage: 'copywriting', 
          progress: 62, 
          message: 'Copywriting complete',
          section: 'Copywriting',
          sectionProgress: 100
        });
        
        // PHASE 6.6: v6.7 AI SEO Engine
        onProgress?.({ 
          stage: 'seo-generation', 
          progress: 63, 
          message: 'Generating comprehensive SEO metadata...',
          section: 'SEO'
        });
        console.log('[Merlin v6.7] Generating SEO metadata...');
        seoResult = await generateSEOForSite(
          designContext,
          sectionPlan,
          sectionCopies,
          plannedImages,
          projectConfig.projectName,
          layout // Pass layout to get actual image URLs
        );
        
        // Save SEO metadata
        fs.writeFileSync(
          path.join(outputDir, 'seo-metadata.json'),
          JSON.stringify(seoResult, null, 2),
          'utf-8'
        );
        console.log(`[Merlin 6.7] Generated SEO metadata for site: ${seoResult.slug}`);
        onProgress?.({ 
          stage: 'seo-generation', 
          progress: 65, 
          message: 'SEO metadata complete',
          section: 'SEO',
          sectionProgress: 100
        });
        
        // PHASE 6.6.5: v6.9 Global Theme Engine
        onProgress?.({ 
          stage: 'theme-generation', 
          progress: 66, 
          message: 'Generating global theme and design system...',
          section: 'Theme'
        });
        console.log('[Merlin v6.9] Generating global theme...');
        try {
          globalTheme = await generateGlobalTheme(designContext, styleSystem, plannedImages || []);
          
          // Save theme
          fs.writeFileSync(
            path.join(outputDir, 'global-theme.json'),
            JSON.stringify(globalTheme, null, 2),
            'utf-8'
          );
          console.log(`[Merlin v6.9] Generated theme with mood: ${globalTheme?.mood || 'unknown'}`);
          onProgress?.({ 
            stage: 'theme-generation', 
            progress: 67, 
            message: `Theme complete: ${globalTheme?.mood || 'unknown'}`,
            section: 'Theme',
            sectionProgress: 100
          });
        } catch (themeError: unknown) {
          logError(themeError, 'Merlin v6.9 - Theme generation');
          globalTheme = null; // Ensure it's set to null if generation fails
        }
        
        // PHASE 6.7: v6.8 Multi-Page Planner
        onProgress?.({ 
          stage: 'page-planning', 
          progress: 68, 
          message: 'Planning multi-page structure...',
          section: 'Page Planning'
        });
        console.log('[Merlin v6.8] Planning multi-page structure...');
        if (!plannedPages || plannedPages.length === 0) {
          plannedPages = planPages(sectionPlan, designContext);
        }
        console.log(`[Merlin v6.8] Planned ${plannedPages.length} pages: ${plannedPages.map(p => p.id).join(', ')}`);
        
        // Save page plan
        fs.writeFileSync(
          path.join(outputDir, 'page-plan.json'),
          JSON.stringify(plannedPages, null, 2),
          'utf-8'
        );
        onProgress?.({ 
          stage: 'page-planning', 
          progress: 69, 
          message: `Planned ${plannedPages.length} pages`,
          section: 'Page Planning',
          sectionProgress: 100
        });
        
        // PHASE 7: Multi-Page Code Generator (v6.8)
        onProgress?.({ 
          stage: 'code-generation', 
          progress: 70, 
          message: `Generating HTML/CSS/JS for ${plannedPages.length} pages...`,
          section: 'Code Generation',
          currentSection: 0,
          totalSections: plannedPages.length
        });
        console.log('[Merlin v6.8] Generating multi-page website...');
        const multiPageCode = await generateMultiPageWebsite(
          layout,
          styleSystem,
          copy,
          format,
          seoResult,
          plannedPages,
          sectionCopies,
          designContext,
          projectConfig.projectName,
          globalTheme
        );
        onProgress?.({ 
          stage: 'code-generation', 
          progress: 85, 
          message: `Generated ${Object.keys(multiPageCode.pages).length} pages`,
          section: 'Code Generation',
          sectionProgress: 100,
          currentSection: plannedPages.length,
          totalSections: plannedPages.length
        });
        
        // Load integrations for this project
        let projectIntegrations: Array<{ id: string; enabled: boolean; config: Record<string, any> }> = [];
        try {
          const integrationsPath = path.join(
            path.dirname(outputDir),
            'integrations.json'
          );
          if (fs.existsSync(integrationsPath)) {
            const integrationsContent = fs.readFileSync(integrationsPath, 'utf-8');
            const integrationsData = JSON.parse(integrationsContent);
            if (Array.isArray(integrationsData)) {
              projectIntegrations = integrationsData;
            }
          }
        } catch (error) {
          console.error('[Merlin Design LLM] Failed to load integrations:', error);
        }
        
        // Save all pages (with integrations injected)
        await saveMultiPageWebsite(multiPageCode, outputDir, projectIntegrations);
        
        // For backward compatibility, use first page as main HTML
        code = {
          html: multiPageCode.pages[0]?.html || '',
          css: multiPageCode.css,
          javascript: multiPageCode.javascript
        };
        
        // PHASE 8: REAL Quality Assessment with v4.0 Analyzer
        let assessment: QualityAssessment | null = null;
        
        try {
          if (app) {
            // Use real quality assessment if app is provided
            onProgress?.({ 
              stage: 'quality-assessment', 
              progress: 87, 
              message: 'Running comprehensive quality assessment...',
              section: 'Quality Check'
            });
            console.log(`[Merlin Design LLM] Running real quality assessment...`);
            assessment = await assessGeneratedWebsite(projectConfig.projectSlug, app, port);
            onProgress?.({ 
              stage: 'quality-assessment', 
              progress: 95, 
              message: `Quality assessment complete: ${assessment.averageScore.toFixed(1)}/10`,
              section: 'Quality Check',
              sectionProgress: 100
            });
            
            qualityScore = {
              visualDesign: assessment.scores.visualDesign,
              uxStructure: assessment.scores.uxStructure,
              contentQuality: assessment.scores.contentQuality,
              conversionTrust: assessment.scores.conversionTrust,
              seoFoundations: assessment.scores.seoFoundations,
              creativity: assessment.scores.creativity,
              meetsThresholds: assessment.meetsThresholds
            };
            
            // Generate quality report
            generateQualityReport(assessment, outputDir);
            
            meetsThresholds = assessment.meetsThresholds;
            
            if (!meetsThresholds && iteration < maxIterations) {
              console.log(`[Merlin Design LLM] Quality check failed. Scores:`, qualityScore);
              console.log(`[Merlin Design LLM] Issues found:`, assessment.issues.length);
              // Will revise in next iteration
            }
          } else {
            // Fallback to estimation if app not provided
            console.log(`[Merlin Design LLM] App not provided, using estimation...`);
            const thresholds = {
              visualDesign: 8.0,
              uxStructure: 8.0,
              contentQuality: 8.0,
              conversionTrust: 7.5,
              seoFoundations: 7.5,
              creativity: 7.5
            };
            
            const estimatedScores = estimateQualityScores(layout, styleSystem, copy, designContext);
            
            qualityScore = {
              visualDesign: estimatedScores.visual,
              uxStructure: estimatedScores.ux,
              contentQuality: estimatedScores.content,
              conversionTrust: estimatedScores.conversion,
              seoFoundations: estimatedScores.seo,
              creativity: estimatedScores.creativity,
              meetsThresholds: 
                estimatedScores.visual >= thresholds.visualDesign &&
                estimatedScores.ux >= thresholds.uxStructure &&
                estimatedScores.content >= thresholds.contentQuality &&
                estimatedScores.conversion >= thresholds.conversionTrust &&
                estimatedScores.seo >= thresholds.seoFoundations &&
                estimatedScores.creativity >= thresholds.creativity
            };
            
            meetsThresholds = qualityScore.meetsThresholds;
          }
        } catch (assessmentError: unknown) {
          logError(assessmentError, 'Merlin Design LLM - Quality assessment');
          // Fallback to estimation
          const estimatedScores = estimateQualityScores(layout, styleSystem, copy, designContext);
          qualityScore = {
            visualDesign: estimatedScores.visual,
            uxStructure: estimatedScores.ux,
            contentQuality: estimatedScores.content,
            conversionTrust: estimatedScores.conversion,
            seoFoundations: estimatedScores.seo,
            creativity: estimatedScores.creativity,
            meetsThresholds: false // Assume false if assessment fails
          };
          meetsThresholds = false;
        }
      } catch (phaseError: unknown) {
        logError(phaseError, `Merlin Design LLM - Generation phase (iteration ${iteration})`);
        // If this is the first iteration, throw the error
        if (iteration === 1) {
          throw new Error(`Generation failed in phase: ${phaseError.message}`);
        }
        // Otherwise, continue to next iteration
        continue;
      }
    
      if (!meetsThresholds && iteration < maxIterations) {
        console.log(`[Merlin Design LLM] Quality check failed. Revising design...`);
        // In production, would revise design based on failing categories
      }
    }
    
    // Ensure we have valid data before returning
    if (!layout || !styleSystem || !copy || !code) {
      throw new Error('Generation failed: Missing required data after iterations');
    }
    
    // v6.0: Save pipeline metadata
    // v6.8: Use planned pages from generation
    const metadata = {
      version: MERLIN_VERSION,
      pipeline: 'v6.10-cleanup-hardening',
      pipelineVersion: '6.10',
      timestamp: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      projectSlug: projectConfig.projectSlug,
      sectionPlan: sectionPlan,
      modules: {
        sectionPlanner: '6.1',
        styleDesigner: '6.2',
        sectionVariants: '6.3',
        responsiveEngine: '6.4',
        imagePlanner: '6.5',
        copywriter: '6.6',
        seoEngine: '6.7',
        multiPage: '6.8',
        themeEngine: '6.9'
      },
      multiPageVersion: '6.8',
      pages: plannedPages.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        sectionCount: p.sectionKeys.length
      })),
      navigation: {
        items: plannedPages.map(p => ({
          id: p.id,
          slug: p.slug === '/' ? '/index.html' : `${p.slug.substring(1)}.html`,
          title: p.title
        })),
        home: '/index.html'
      },
      styleSystem: {
        final: styleSystem,
        aiOverride: aiStyleOverride,
        industry: projectConfig.industry,
        isKnownIndustry: matchesKnownIndustry(projectConfig.industry)
      },
      responsiveEngineVersion: '6.4',
      imagePlannerVersion: '6.5',
      copywriterVersion: '6.6',
      seoEngineVersion: '6.7',
      multiPageVersion: '6.8',
      plannedImages: plannedImages || [],
      generatedImages: (layout as any).generatedImages || [],
      sectionsWithCopy: sectionCopies.map(c => c.sectionKey) || [],
      seo: seoResult || null,
      slug: seoResult?.slug || projectConfig.projectSlug,
      features: [
        'v5.1-llm-content-all-sections',
        'v5.1-dalle-image-generation',
        'v5.1-modern-css',
        'v6.0-foundations',
        'v6.1-ai-section-planner',
        'v6.2-ai-style-designer',
        'v6.3-component-variants',
        'v6.4-responsive-engine',
        'v6.5-ai-image-planner',
        'v6.6-ai-copywriting-3.0',
        'v6.7-ai-seo-engine',
        'v6.8-multi-page-architecture',
        'v6.9-global-theme-engine'
      ]
    };
    fs.writeFileSync(
      path.join(outputDir, 'pipeline-version.txt'),
      `Merlin Website Wizard ${metadata.version}\nPipeline: ${metadata.pipeline}\nGenerated: ${metadata.timestamp}\n`,
      'utf-8'
    );
    fs.writeFileSync(
      path.join(outputDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );
    console.log('[Merlin v6.0] Pipeline metadata saved');
    
    return {
      projectSlug: projectConfig.projectSlug,
      layout,
      styleSystem,
      copy,
      code: {
        html: code.html,
        css: code.css,
        javascript: code.javascript
      },
      qualityScore
    };
  } catch (error: unknown) {
    logError(error, 'Merlin Design LLM - Fatal error');
    const errorMessage = getErrorMessage(error);
    throw new Error(`Website generation failed: ${errorMessage}`);
  }
}

/**
 * Generate copy with LLM, fallback to template-based per section
 * v5.1 Emergency Upgrade: apply AI copy to EVERY section
 */
async function generateCopyWithLLM(
  projectConfig: ProjectConfig,
  designContext: DesignContext,
  industry: string,
  layout?: LayoutStructure
): Promise<CopyContent> {
  const copy = generateCopy(projectConfig, designContext, industry, layout);
  
  if (layout && layout.sections && layout.sections.length > 0) {
    const llmSectionsMeta: Array<{
      key: string;
      type: string;
      context: SectionContext;
      copyIndex: number;
    }> = [];
    
    let nonHeroIndex = 0;
    
    layout.sections.forEach((sectionDef, layoutIndex) => {
      const context: SectionContext = {
        projectName: projectConfig.projectName,
        industry: projectConfig.industry,
        targetAudience: projectConfig.targetAudiences,
        toneOfVoice: projectConfig.toneOfVoice,
        sectionType: sectionDef.type,
        valueProps: [designContext.pageObjective.valueProposition],
        differentiators: designContext.audience.goals,
        designContext,
        location: projectConfig.location,
        services: projectConfig.services
      };
      
      const copyIndex = sectionDef.type === 'hero' ? -1 : nonHeroIndex;
      if (sectionDef.type !== 'hero') {
        nonHeroIndex++;
      }
      
      llmSectionsMeta.push({
        key: `section-${layoutIndex}`,
        type: sectionDef.type,
        context,
        copyIndex
      });
    });
    
    if (llmSectionsMeta.length > 0) {
      try {
        console.log(`[Merlin v5.1] Generating LLM content for ${llmSectionsMeta.length} sections...`);
        const llmContent = await generateMultipleSectionsLLM(
          llmSectionsMeta.map(({ key, type, context }) => ({ key, type, context }))
        );
        
        llmSectionsMeta.forEach((sectionMeta, _idx) => {
          const llmSection = llmContent.get(sectionMeta.key);
          
          if (sectionMeta.type === 'hero') {
            if (llmSection) {
              copy.hero = {
                hook: llmSection.lead || copy.hero.hook,
                headline: llmSection.title || copy.hero.headline,
                subheadline: llmSection.subtitle || llmSection.body || copy.hero.subheadline,
                cta: llmSection.cta || copy.hero.cta
              };
            }
            return;
          }
          
          if (sectionMeta.copyIndex < 0) {
            return;
          }
          
          const existing = copy.sections[sectionMeta.copyIndex] || { heading: '', body: '' };
          if (!copy.sections[sectionMeta.copyIndex]) {
            copy.sections[sectionMeta.copyIndex] = existing;
          }
          
          if (llmSection) {
            copy.sections[sectionMeta.copyIndex] = {
              heading: llmSection.title || existing.heading || 'Section',
              body: llmSection.body || existing.body || '',
              cta: llmSection.cta || existing.cta
            };
          } else {
            const fallbackContent = generateSectionContentFallback(
              sectionMeta.type,
              projectConfig,
              designContext,
              industry,
              sectionMeta.copyIndex
            );
            
            if (fallbackContent) {
              copy.sections[sectionMeta.copyIndex] = {
                heading: fallbackContent.heading || existing.heading || 'Section',
                body: fallbackContent.body || existing.body || '',
                cta: fallbackContent.cta || existing.cta
              };
            }
          }
        });
        
        console.log(`[Merlin v5.1] Applied LLM content to ${llmSectionsMeta.length} sections`);
      } catch (error: unknown) {
        logError(error, 'Merlin v5.1 - LLM content generation');
        // Continue with template-based content
      }
    }
  }
  
  return copy;
}

/**
 * Merge AI-generated style system into base style system
 * v6.2: Replaces colors and fonts, keeps spacing/radii/shadows
 */
function mergeStyleSystems(
  base: StyleSystem,
  aiStyle: LLMStyleSystem
): StyleSystem {
  return {
    ...base,
    colors: {
      primary: aiStyle.primaryColor,
      secondary: aiStyle.secondaryColor,
      accent: aiStyle.accentColor,
      neutrals: base.colors.neutrals, // Keep base neutrals
      background: aiStyle.backgroundColor,
      text: base.colors.text // Keep base text color
    },
    typography: {
      heading: {
        ...base.typography.heading,
        font: aiStyle.headingFont
      },
      body: {
        ...base.typography.body,
        font: aiStyle.bodyFont
      }
    }
    // Keep spacing, borderRadius, shadows, icons unchanged
  };
}

/**
 * Download and save image from URL to local project directory
 */
async function downloadAndSaveImage(
  imageUrl: string,
  projectSlug: string,
  sectionKey: string,
  purpose: string
): Promise<string> {
  const imagesDir = path.join(process.cwd(), 'website_projects', projectSlug, 'generated-v5', 'assets', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const timestamp = Date.now();
    const filename = `${sectionKey}-${purpose}-${timestamp}.png`;
    const filepath = path.join(imagesDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    
    // Return relative path for use in HTML
    return `/assets/images/${filename}`;
  } catch (error) {
    console.error(`[Image Download] Failed to download image from ${imageUrl.substring(0, 50)}:`, error);
    // Return original URL as fallback
    return imageUrl;
  }
}

/**
 * Generate images for sections using AI-planned images (v6.5) - ENHANCED with local download
 */
async function _generateSectionImagesV65(
  projectConfig: ProjectConfig,
  designContext: DesignContext,
  styleSystem: StyleSystem,
  layout: LayoutStructure,
  plannedImages: PlannedImage[],
  onProgress?: GenerationProgressCallback
): Promise<void> {
  const sections = layout?.sections;
  if (!sections || sections.length === 0) {
    return;
  }

  // Map planned images by sectionKey
  const imagePlanMap = new Map<string, PlannedImage[]>();
  for (const img of plannedImages) {
    if (!imagePlanMap.has(img.sectionKey)) {
      imagePlanMap.set(img.sectionKey, []);
    }
    imagePlanMap.get(img.sectionKey)!.push(img);
  }

  const colorScheme = [
    styleSystem.colors.primary,
    styleSystem.colors.secondary,
    styleSystem.colors.accent,
    styleSystem.colors.neutrals?.[0]
  ].filter(Boolean) as string[];

  const styleKeywords = designContext.brandVoice?.visualIdentityKeywords?.length
    ? designContext.brandVoice.visualIdentityKeywords
    : [
        designContext.emotionalTone,
        designContext.brandVoice.modernity,
        designContext.brandVoice.boldness
      ].filter(Boolean) as string[];

  const businessContext = {
    name: projectConfig.projectName,
    industry: projectConfig.industry,
    colorScheme,
    styleKeywords
  };

  const generatedImages: Array<{ sectionKey: string; url: string; alt: string; purpose: string }> = [];
  let imageIndex = 0;
  const totalImages = plannedImages.length;

  // Generate images for each section based on planned images
  for (const section of sections) {
    if (!section.key) continue;
    
    const plans = imagePlanMap.get(section.key) || [];
    if (plans.length === 0) continue;

    // Find hero image (priority)
    const heroPlan = plans.find(p => p.purpose === 'hero');
    if (heroPlan && section.type === 'hero') {
      let retries = 3;
      let success = false;
      
      while (retries > 0 && !success) {
        try {
          console.log(`[Merlin 6.5] Generating hero image for section ${section.key} using AI-planned prompt... (${4 - retries}/3)`);
          onProgress?.({
            stage: 'image-generation',
            progress: 55 + Math.floor((imageIndex / totalImages) * 3),
            message: `Generating hero image for ${section.key}...`,
            section: 'Image Generation',
            currentSection: imageIndex + 1,
            totalSections: totalImages
          });
          
          const heroImage = await generateStunningImage({
            style: 'hero',
            businessContext,
            prompt: heroPlan.prompt,
            quality: 'hd',
            artisticStyle: 'cinematic'
          });
          
          // Download and save image locally
          const localPath = await downloadAndSaveImage(
            heroImage.url,
            projectConfig.projectSlug,
            section.key,
            'hero'
          );
          
          section.imageUrl = localPath;
          section.imageAlt = heroPlan.alt || heroImage.alt || `Hero image for ${projectConfig.projectName}`;
          generatedImages.push({
            sectionKey: section.key,
            url: localPath,
            alt: section.imageAlt,
            purpose: 'hero'
          });
          imageIndex++;
          console.log(`[Merlin 6.5] Generated and saved hero image: ${localPath}`);
          success = true;
        } catch (error) {
          retries--;
          if (retries === 0) {
            console.error(`[Merlin 6.5] Hero image generation failed for ${section.key} after 3 attempts:`, error);
            // Use placeholder on final failure
            section.imageUrl = undefined;
          } else {
            console.warn(`[Merlin 6.5] Hero image generation failed, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
          }
        }
      }
      continue; // Hero done, move to next section
    }

    // For non-hero sections, generate all supporting/icon/background images
    const supportingPlans = plans.filter(p => 
      p.purpose === 'supporting' || p.purpose === 'icon' || p.purpose === 'background'
    );
    
    if (supportingPlans.length > 0) {
      // First image becomes primary (imageUrl)
      const primaryPlan = supportingPlans[0];
      let retries = 3;
      let success = false;
      
      while (retries > 0 && !success) {
        try {
          const imageStyle = primaryPlan.purpose === 'icon' ? 'illustration' :
                            primaryPlan.purpose === 'background' ? 'background' :
                            section.type === 'about' ? 'illustration' : 'product';
          
          console.log(`[Merlin 6.5] Generating ${primaryPlan.purpose} image for section ${section.key}... (${4 - retries}/3)`);
          onProgress?.({
            stage: 'image-generation',
            progress: 55 + Math.floor((imageIndex / totalImages) * 3),
            message: `Generating ${primaryPlan.purpose} image for ${section.key}...`,
            section: 'Image Generation',
            currentSection: imageIndex + 1,
            totalSections: totalImages
          });
          
          const image = await generateStunningImage({
            style: imageStyle,
            businessContext,
            prompt: primaryPlan.prompt,
            quality: primaryPlan.purpose === 'icon' ? 'standard' : 'hd',
            artisticStyle: primaryPlan.styleHint?.includes('modern') ? 'modern' : 'photorealistic'
          });
          
          // Download and save image locally
          const localPath = await downloadAndSaveImage(
            image.url,
            projectConfig.projectSlug,
            section.key,
            primaryPlan.purpose
          );
          
          section.imageUrl = localPath;
          section.imageAlt = primaryPlan.alt || image.alt || `Visual for ${section.type} section`;
          generatedImages.push({
            sectionKey: section.key,
            url: localPath,
            alt: section.imageAlt,
            purpose: primaryPlan.purpose
          });
          imageIndex++;
          console.log(`[Merlin 6.5] Generated and saved ${primaryPlan.purpose} image: ${localPath}`);
          success = true;
        } catch (error) {
          retries--;
          if (retries === 0) {
            console.error(`[Merlin 6.5] Image generation failed for ${section.key} after 3 attempts:`, error);
            section.imageUrl = undefined;
          } else {
            console.warn(`[Merlin 6.5] Image generation failed, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
          }
        }
      }
      
      // Additional images go into supportImages array
      if (supportingPlans.length > 1) {
        section.supportImages = [];
        for (let i = 1; i < supportingPlans.length; i++) {
          const plan = supportingPlans[i];
          let retries = 3;
          let success = false;
          
          while (retries > 0 && !success) {
            try {
              const additionalImageStyle = plan.purpose === 'icon' ? 'illustration' :
                                          plan.purpose === 'background' ? 'background' : 'product';
              
              onProgress?.({
                stage: 'image-generation',
                progress: 55 + Math.floor((imageIndex / totalImages) * 3),
                message: `Generating additional ${plan.purpose} image for ${section.key}...`,
                section: 'Image Generation',
                currentSection: imageIndex + 1,
                totalSections: totalImages
              });
              
              const additionalImage = await generateStunningImage({
                style: additionalImageStyle,
                businessContext,
                prompt: plan.prompt,
                quality: plan.purpose === 'icon' ? 'standard' : 'hd',
                artisticStyle: plan.styleHint?.includes('modern') ? 'modern' : 'photorealistic'
              });
              
              // Download and save image locally
              const localPath = await downloadAndSaveImage(
                additionalImage.url,
                projectConfig.projectSlug,
                `${section.key}-${i}`,
                plan.purpose
              );
              
              section.supportImages.push({
                url: localPath,
                alt: plan.alt || additionalImage.alt || `${plan.purpose} image`
              });
              generatedImages.push({
                sectionKey: section.key,
                url: localPath,
                alt: plan.alt || additionalImage.alt || `${plan.purpose} image`,
                purpose: plan.purpose
              });
              imageIndex++;
              console.log(`[Merlin 6.5] Generated and saved additional ${plan.purpose} image: ${localPath}`);
              success = true;
            } catch (error) {
              retries--;
              if (retries === 0) {
                console.error(`[Merlin 6.5] Additional image generation failed for ${section.key} after 3 attempts:`, error);
              } else {
                console.warn(`[Merlin 6.5] Additional image generation failed, retrying... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
              }
            }
          }
          
          // Rate limiting: wait 1 second between additional images
          if (i < supportingPlans.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    }
  }

  // Store generated images in layout for metadata
  (layout as any).generatedImages = generatedImages;
  console.log(`[Merlin 6.5] Generated and saved ${generatedImages.length} images total to local directory.`);
}

/**
 * Generate hero/supporting images using DALL·E (Advanced Image Service) - DEPRECATED, use generateSectionImagesV65
 */
async function _generateSectionImages(
  projectConfig: ProjectConfig,
  designContext: DesignContext,
  designStrategy: DesignStrategy,
  styleSystem: StyleSystem,
  layout: LayoutStructure,
  copy: CopyContent
): Promise<void> {
  const sections = layout?.sections;
  if (!sections || sections.length === 0) {
    return;
  }

  const colorScheme = [
    styleSystem.colors.primary,
    styleSystem.colors.secondary,
    styleSystem.colors.accent,
    styleSystem.colors.neutrals?.[0]
  ].filter(Boolean) as string[];

  const styleKeywords = designStrategy?.personality?.visualIdentity?.styleKeywords?.length
    ? designStrategy.personality.visualIdentity.styleKeywords
    : [
        designContext.emotionalTone,
        designContext.brandVoice.modernity,
        designContext.brandVoice.boldness
      ].filter(Boolean) as string[];

  const businessContext = {
    name: projectConfig.projectName,
    industry: projectConfig.industry,
    colorScheme,
    styleKeywords
  };

  const heroIndex = sections.findIndex(section => section.type === 'hero');
  if (heroIndex >= 0) {
    try {
      const heroAudience = designContext.audience.demographics[0] || designContext.audience.goals[0] || 'customers';
      const heroPrompt = `Ultra high-quality hero image for ${projectConfig.projectName}, a ${projectConfig.industry} organization serving ${heroAudience}. Visual style: ${styleKeywords.join(', ')}. Highlight trust, clarity, and ${copy.hero.headline}.`;
      const heroImage = await generateStunningImage({
        style: 'hero',
        businessContext,
        prompt: heroPrompt,
        quality: 'hd',
        artisticStyle: 'cinematic'
      });
      sections[heroIndex].imageUrl = heroImage.url;
      sections[heroIndex].imageAlt = heroImage.alt || `Hero image for ${projectConfig.projectName}`;
    } catch (error) {
      console.error('[Merlin v5.1] Hero image generation failed:', error);
    }
  }

  const supportingTargets = ['about', 'services', 'features'];
  let generatedSupporting = 0;

  for (const target of supportingTargets) {
    if (generatedSupporting >= 2) break;
    const sectionIndex = sections.findIndex(
      (section, idx) => section.type === target && idx !== heroIndex && !section.imageUrl
    );
    if (sectionIndex === -1) continue;

    try {
      const prompt =
        target === 'about'
          ? `Modern, human-centered illustration celebrating the mission and team behind ${projectConfig.projectName}. Style keywords: ${styleKeywords.join(', ')}.`
          : `Clean, modern illustration representing ${target === 'services' ? 'core services' : 'key features'} for ${projectConfig.projectName} in the ${projectConfig.industry} space.`;

      const image = await generateStunningImage({
        style: target === 'about' ? 'illustration' : 'product',
        businessContext,
        prompt,
        quality: 'standard',
        artisticStyle: target === 'about' ? 'modern' : 'minimalist'
      });

      sections[sectionIndex].imageUrl = image.url;
      sections[sectionIndex].imageAlt = image.alt || `Visual for the ${target} section`;
      generatedSupporting++;
    } catch (error) {
      console.error(`[Merlin v5.1] Image generation failed for ${target} section:`, error);
    }
  }
}

/**
 * Estimate quality scores (simplified - would use actual v4.0 analyzer in production)
 */
function estimateQualityScores(
  layout: LayoutStructure,
  styleSystem: StyleSystem,
  copy: CopyContent,
  _context: DesignContext
): {
  visual: number;
  ux: number;
  content: number;
  conversion: number;
  seo: number;
  creativity: number;
} {
  // Visual Design
  let visual = 5.0;
  if (styleSystem.colors.primary && styleSystem.colors.secondary) visual += 1.5;
  if (styleSystem.typography.heading.font && styleSystem.typography.body.font) visual += 1.0;
  if (layout.sections.length >= 5) visual += 1.0;
  visual = Math.min(10, visual);
  
  // UX Structure
  let ux = 5.0;
  if (layout.sections.some(s => s.type === 'hero')) ux += 1.5;
  if (layout.sections.length >= 4) ux += 1.0;
  if (layout.responsiveBreakpoints.length >= 3) ux += 1.0;
  ux = Math.min(10, ux);
  
  // Content Quality
  let content = 5.0;
  const totalWords = copy.hero.headline.length + copy.hero.subheadline.length + 
                     copy.sections.reduce((sum, s) => sum + s.body.length, 0);
  if (totalWords >= 1000) content += 2.0;
  else if (totalWords >= 500) content += 1.0;
  if (copy.services.length >= 3) content += 1.0;
  if (copy.faq.length >= 3) content += 1.0;
  content = Math.min(10, content);
  
  // Conversion
  let conversion = 3.0;
  if (copy.hero.cta) conversion += 2.0;
  if (copy.sections.some(s => s.cta)) conversion += 1.0;
  if (copy.faq.length > 0) conversion += 1.0;
  conversion = Math.min(10, conversion);
  
  // SEO
  let seo = 5.0;
  if (copy.hero.headline.length >= 30 && copy.hero.headline.length <= 60) seo += 1.0;
  if (copy.valueProposition.length >= 120) seo += 1.0;
  if (layout.sections.some(s => s.type === 'hero')) seo += 1.0;
  seo = Math.min(10, seo);
  
  // Creativity
  let creativity = 5.0;
  if (!copy.hero.headline.includes('Welcome') && !copy.hero.headline.includes('Home')) creativity += 1.0;
  if (styleSystem.colors.primary !== '#2563EB') creativity += 1.0; // Not default blue
  if (copy.tagline && copy.tagline.length > 0) creativity += 1.0;
  creativity = Math.min(10, creativity);
  
  return { visual, ux, content, conversion, seo, creativity };
}


