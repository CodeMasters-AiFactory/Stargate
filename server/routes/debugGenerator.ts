/**
 * Debug Website Generator Route
 * Provides step-by-step visualization with pause/resume functionality
 */

import type { Express, Request, Response } from 'express';
import { convertRequirementsToProjectConfig } from '../services/formatConverter';
import { convertV5ToMultiPageWebsite } from '../services/v5ToMultiPageConverter';
import { logError } from '../utils/errorHandler';

interface DebugEventEmitter {
  emit: (event: string, data: Record<string, unknown>) => void;
  isPaused: () => boolean;
  waitForResume: () => Promise<void>;
}

// Global pause state (shared across all requests)
const globalPauseState: Map<string, { isPaused: boolean; resumeResolve?: () => void }> = new Map();

export function registerDebugGeneratorRoute(app: Express) {

  const createDebugEmitter = (res: Response, sessionId: string): DebugEventEmitter => {
    return {
      emit: (event: string, data: Record<string, unknown>) => {
        try {
          res.write(`data: ${JSON.stringify({ type: event, ...data })}\n\n`);
        } catch (_error) {
          console.error('[Debug] Failed to emit event:', _error);
        }
      },
      isPaused: () => {
        const state = globalPauseState.get(sessionId);
        return state?.isPaused || false;
      },
      waitForResume: async () => {
        const state = globalPauseState.get(sessionId);
        if (state?.isPaused) {
          return new Promise<void>((resolve) => {
            if (state) {
              state.resumeResolve = resolve;
            }
          });
        }
      },
    };
  };

  app.post('/api/website-builder/generate-debug', async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    const { requirements, _debugMode, pauseBetweenSteps } = req.body;
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize pause state for this session
    globalPauseState.set(sessionId, { isPaused: false });

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    const debug = createDebugEmitter(res, sessionId);
    let stepCounter = 0;
    
    // Send session ID to frontend
    debug.emit('session-id', { sessionId });

    try {
      if (!requirements) {
        throw new Error('Missing requirements in request body');
      }

      // Convert requirements to projectConfig
      debug.emit('step-start', {
        phaseId: 'setup',
        phaseName: 'Setup & Initialization',
        phaseNumber: 1,
        stepId: 'convert-requirements',
        stepNumber: ++stepCounter,
        stepName: 'Convert Requirements to ProjectConfig',
        description: 'Converting frontend requirements to internal project configuration format',
      });

      if (pauseBetweenSteps) await debug.waitForResume();

      const projectConfig = convertRequirementsToProjectConfig(requirements, null);
      
      debug.emit('step-complete', {
        phaseId: 'setup',
        stepId: 'convert-requirements',
        duration: Date.now() - startTime,
        data: {
          projectName: projectConfig.projectName,
          projectSlug: projectConfig.projectSlug,
          industry: projectConfig.industry,
        },
      });

      // Create output directory
      debug.emit('step-start', {
        phaseId: 'setup',
        phaseName: 'Setup & Initialization',
        phaseNumber: 1,
        stepId: 'create-directory',
        stepNumber: ++stepCounter,
        stepName: 'Create Output Directory',
        description: 'Creating directory structure for generated website files',
      });

      if (pauseBetweenSteps) await debug.waitForResume();

      const fs = await import('fs');
      const path = await import('path');
      const outputDir = path.join(process.cwd(), 'website_projects', projectConfig.projectSlug, 'generated-v5');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      debug.emit('step-complete', {
        phaseId: 'setup',
        stepId: 'create-directory',
        duration: Date.now() - startTime,
        data: { outputDir },
      });

      debug.emit('phase-complete', {
        phaseId: 'setup',
        duration: Date.now() - startTime,
      });

      // PHASE 2: Design Strategy
      debug.emit('phase-start', {
        phaseId: 'design-strategy',
        phaseName: 'Design Strategy',
        phaseNumber: 2,
      });

      debug.emit('step-start', {
        phaseId: 'design-strategy',
        phaseName: 'Design Strategy',
        phaseNumber: 2,
        stepId: 'generate-design-strategy',
        stepNumber: ++stepCounter,
        stepName: 'Generate AI Design Strategy',
        description: 'Creating design strategy using AI design reasoner',
      });

      if (pauseBetweenSteps) await debug.waitForResume();

      const { generateDesignStrategy } = await import('../ai/designReasoner');
      const designStrategy = await generateDesignStrategy(projectConfig);

      debug.emit('step-complete', {
        phaseId: 'design-strategy',
        stepId: 'generate-design-strategy',
        duration: Date.now() - startTime,
        data: {
          emotionalTone: designStrategy.personality?.emotionalTone,
          sectionOrder: designStrategy.sectionStrategy?.sectionOrder,
        },
      });

      debug.emit('step-start', {
        phaseId: 'design-strategy',
        phaseName: 'Design Strategy',
        phaseNumber: 2,
        stepId: 'generate-design-context',
        stepNumber: ++stepCounter,
        stepName: 'Generate Design Context',
        description: 'Creating design context from project configuration',
      });

      if (pauseBetweenSteps) await debug.waitForResume();

      const { generateDesignContext } = await import('../generator/designThinking');
      const designContext = generateDesignContext(projectConfig);

      debug.emit('step-complete', {
        phaseId: 'design-strategy',
        stepId: 'generate-design-context',
        duration: Date.now() - startTime,
        data: {
          industry: designContext.industry,
          emotionalTone: designContext.emotionalTone,
        },
      });

      debug.emit('phase-complete', {
        phaseId: 'design-strategy',
        duration: Date.now() - startTime,
      });

      // PHASE 3: Layout Generation
      debug.emit('phase-start', {
        phaseId: 'layout',
        phaseName: 'Layout Generation',
        phaseNumber: 3,
      });

      debug.emit('step-start', {
        phaseId: 'layout',
        phaseName: 'Layout Generation',
        phaseNumber: 3,
        stepId: 'generate-section-plan',
        stepNumber: ++stepCounter,
        stepName: 'Generate Section Plan',
        description: 'Planning which sections to include and their order',
      });

      if (pauseBetweenSteps) await debug.waitForResume();

      const { generateSectionPlan } = await import('../ai/layoutPlannerLLM');
      const sectionPlan = await generateSectionPlan(projectConfig);

      debug.emit('step-complete', {
        phaseId: 'layout',
        stepId: 'generate-section-plan',
        duration: Date.now() - startTime,
        data: {
          totalSections: sectionPlan.totalSections,
          sections: sectionPlan.sections.map((s: Record<string, unknown>) => ({ type: s.type, order: s.order })),
        },
      });

      debug.emit('step-start', {
        phaseId: 'layout',
        phaseName: 'Layout Generation',
        phaseNumber: 3,
        stepId: 'generate-layout-structure',
        stepNumber: ++stepCounter,
        stepName: 'Generate Layout Structure',
        description: 'Creating layout structure with section variants',
      });

      if (pauseBetweenSteps) await debug.waitForResume();

      const { generateDesignOutputs } = await import('../generator/designThinking');
      const designOutputs = generateDesignOutputs(designContext, projectConfig.industry);
      const { generateLayout } = await import('../generator/layoutLLM');
      const layout = generateLayout(designOutputs, designContext, projectConfig.industry, projectConfig, sectionPlan);

      debug.emit('step-complete', {
        phaseId: 'layout',
        stepId: 'generate-layout-structure',
        duration: Date.now() - startTime,
        data: {
          sectionCount: layout.sections.length,
          sections: layout.sections.map((s: Record<string, unknown>) => ({ type: s.type, key: s.key })),
        },
      });

      debug.emit('phase-complete', {
        phaseId: 'layout',
        duration: Date.now() - startTime,
      });

      // PHASE 4: Style System
      debug.emit('phase-start', {
        phaseId: 'style',
        phaseName: 'Style System',
        phaseNumber: 4,
      });

      debug.emit('step-start', {
        phaseId: 'style',
        phaseName: 'Style System',
        phaseNumber: 4,
        stepId: 'generate-style-system',
        stepNumber: ++stepCounter,
        stepName: 'Generate Style System',
        description: 'Creating color palette, typography, and spacing system',
      });

      if (pauseBetweenSteps) await debug.waitForResume();

      const { generateStyleSystem } = await import('../generator/styleSystem');
      const styleSystem = generateStyleSystem(designContext, projectConfig.industry, projectConfig.brandPreferences);

      debug.emit('step-complete', {
        phaseId: 'style',
        stepId: 'generate-style-system',
        duration: Date.now() - startTime,
        data: {
          primaryColor: styleSystem.colors.primary,
          headingFont: styleSystem.typography.heading.font,
        },
      });

      debug.emit('phase-complete', {
        phaseId: 'style',
        duration: Date.now() - startTime,
      });

      // PHASE 5: Content Generation
      debug.emit('phase-start', {
        phaseId: 'content',
        phaseName: 'Content Generation',
        phaseNumber: 5,
      });

      debug.emit('step-start', {
        phaseId: 'content',
        phaseName: 'Content Generation',
        phaseNumber: 5,
        stepId: 'generate-copy',
        stepNumber: ++stepCounter,
        stepName: 'Generate Intelligent Copy',
        description: 'Generating industry-specific, compelling copy for all sections',
      });

      if (pauseBetweenSteps) await debug.waitForResume();

      const { generateCopyForSections } = await import('../ai/copywriterLLM');
      const sectionCopies = await generateCopyForSections(
        designContext,
        sectionPlan,
        layout.sections,
        styleSystem,
        []
      );

      debug.emit('step-complete', {
        phaseId: 'content',
        stepId: 'generate-copy',
        duration: Date.now() - startTime,
        data: {
          copyCount: sectionCopies.length,
          samples: sectionCopies.slice(0, 3).map((c: Record<string, unknown>) => ({
            sectionKey: c.sectionKey,
            headline: typeof c.headline === 'string' ? c.headline.substring(0, 50) : undefined,
          })),
        },
      });

      debug.emit('phase-complete', {
        phaseId: 'content',
        duration: Date.now() - startTime,
      });

      // PHASE 6: Image Planning (skip for 1-page website)
      debug.emit('phase-start', {
        phaseId: 'images',
        phaseName: 'Image Planning & Generation',
        phaseNumber: 6,
      });

      debug.emit('step-start', {
        phaseId: 'images',
        phaseName: 'Image Planning & Generation',
        phaseNumber: 6,
        stepId: 'plan-images',
        stepNumber: ++stepCounter,
        stepName: 'Plan Images',
        description: 'Planning images for sections (skipped for 1-page website)',
      });

      debug.emit('step-complete', {
        phaseId: 'images',
        stepId: 'plan-images',
        duration: Date.now() - startTime,
        data: { skipped: true, reason: '1-page website' },
      });

      debug.emit('phase-complete', {
        phaseId: 'images',
        duration: Date.now() - startTime,
      });

      // PHASE 7: SEO
      debug.emit('phase-start', {
        phaseId: 'seo',
        phaseName: 'SEO & Optimization',
        phaseNumber: 7,
      });

      debug.emit('step-start', {
        phaseId: 'seo',
        phaseName: 'SEO & Optimization',
        phaseNumber: 7,
        stepId: 'generate-seo',
        stepNumber: ++stepCounter,
        stepName: 'Generate SEO Metadata',
        description: 'Creating SEO metadata, meta tags, and structured data',
      });

      if (pauseBetweenSteps) await debug.waitForResume();

      const { generateSEOForSite } = await import('../ai/seoEngineLLM');
      const seoResult = await generateSEOForSite(
        designContext,
        sectionPlan,
        sectionCopies,
        [],
        projectConfig.projectName,
        layout
      );

      debug.emit('step-complete', {
        phaseId: 'seo',
        stepId: 'generate-seo',
        duration: Date.now() - startTime,
        data: {
          title: seoResult.title,
          description: seoResult.description?.substring(0, 50),
          keywords: seoResult.keywords?.slice(0, 5),
        },
      });

      debug.emit('phase-complete', {
        phaseId: 'seo',
        duration: Date.now() - startTime,
      });

      // PHASE 8: Code Generation
      debug.emit('phase-start', {
        phaseId: 'code',
        phaseName: 'Code Generation',
        phaseNumber: 8,
      });

      debug.emit('step-start', {
        phaseId: 'code',
        phaseName: 'Code Generation',
        phaseNumber: 8,
        stepId: 'generate-html',
        stepNumber: ++stepCounter,
        stepName: 'Generate HTML',
        description: 'Generating HTML structure for the website',
      });

      if (pauseBetweenSteps) await debug.waitForResume();

      const { generateCopy } = await import('../generator/copywritingV2');
      const copy = generateCopy(projectConfig, designContext, projectConfig.industry, layout);
      const { generateMultiPageWebsite } = await import('../generator/multiPageGenerator');
      const { planPages } = await import('../generator/pagePlanner');
      const plannedPages = planPages(sectionPlan, designContext);
      const multiPageCode = await generateMultiPageWebsite(
        layout,
        styleSystem,
        copy,
        'html',
        seoResult,
        plannedPages,
        sectionCopies,
        designContext,
        projectConfig.projectName,
        null
      );

      debug.emit('step-complete', {
        phaseId: 'code',
        stepId: 'generate-html',
        duration: Date.now() - startTime,
        data: {
          pageCount: multiPageCode.pages.length,
          htmlSize: multiPageCode.pages[0]?.html?.length || 0,
        },
      });

      debug.emit('step-start', {
        phaseId: 'code',
        phaseName: 'Code Generation',
        phaseNumber: 8,
        stepId: 'generate-css',
        stepNumber: ++stepCounter,
        stepName: 'Generate CSS',
        description: 'Generating stylesheet with responsive design',
      });

      debug.emit('step-complete', {
        phaseId: 'code',
        stepId: 'generate-css',
        duration: Date.now() - startTime,
        data: {
          cssSize: multiPageCode.css.length,
        },
      });

      debug.emit('step-start', {
        phaseId: 'code',
        phaseName: 'Code Generation',
        phaseNumber: 8,
        stepId: 'generate-js',
        stepNumber: ++stepCounter,
        stepName: 'Generate JavaScript',
        description: 'Generating JavaScript for interactivity',
      });

      debug.emit('step-complete', {
        phaseId: 'code',
        stepId: 'generate-js',
        duration: Date.now() - startTime,
        data: {
          jsSize: multiPageCode.javascript?.length || 0,
        },
      });

      debug.emit('phase-complete', {
        phaseId: 'code',
        duration: Date.now() - startTime,
      });

      // PHASE 9: Quality Assessment (skip for debug mode)
      debug.emit('phase-start', {
        phaseId: 'quality',
        phaseName: 'Quality Assessment',
        phaseNumber: 9,
      });

      debug.emit('step-start', {
        phaseId: 'quality',
        phaseName: 'Quality Assessment',
        phaseNumber: 9,
        stepId: 'assess-quality',
        stepNumber: ++stepCounter,
        stepName: 'Assess Website Quality',
        description: 'Analyzing generated website quality (skipped in debug mode)',
      });

      debug.emit('step-complete', {
        phaseId: 'quality',
        stepId: 'assess-quality',
        duration: Date.now() - startTime,
        data: { skipped: true, reason: 'Debug mode' },
      });

      debug.emit('phase-complete', {
        phaseId: 'quality',
        duration: Date.now() - startTime,
      });

      // PHASE 10: Finalization
      debug.emit('phase-start', {
        phaseId: 'finalization',
        phaseName: 'Finalization',
        phaseNumber: 10,
      });

      debug.emit('step-start', {
        phaseId: 'finalization',
        phaseName: 'Finalization',
        phaseNumber: 10,
        stepId: 'convert-format',
        stepNumber: ++stepCounter,
        stepName: 'Convert to MultiPage Format',
        description: 'Converting internal format to frontend-compatible format',
      });

      if (pauseBetweenSteps) await debug.waitForResume();

      const v5Website = {
        projectSlug: projectConfig.projectSlug,
        layout,
        styleSystem,
        copy,
        code: {
          html: multiPageCode.pages[0]?.html || '',
          css: multiPageCode.css,
          javascript: multiPageCode.javascript,
        },
      };

      const website = convertV5ToMultiPageWebsite(v5Website, projectConfig.projectName);

      debug.emit('step-complete', {
        phaseId: 'finalization',
        stepId: 'convert-format',
        duration: Date.now() - startTime,
        data: {
          fileCount: Object.keys(website.files).length,
          hasManifest: !!website.manifest,
        },
      });

      debug.emit('step-start', {
        phaseId: 'finalization',
        phaseName: 'Finalization',
        phaseNumber: 10,
        stepId: 'save-files',
        stepNumber: ++stepCounter,
        stepName: 'Save Files',
        description: 'Saving all generated files to disk',
      });

      if (pauseBetweenSteps) await debug.waitForResume();

      // Save files
      const { saveMultiPageWebsite } = await import('../generator/multiPageGenerator');
      saveMultiPageWebsite(multiPageCode, outputDir);

      debug.emit('step-complete', {
        phaseId: 'finalization',
        stepId: 'save-files',
        duration: Date.now() - startTime,
        data: { saved: true },
      });

      debug.emit('phase-complete', {
        phaseId: 'finalization',
        duration: Date.now() - startTime,
      });

      // Encode and send result
      const safeFiles: Record<string, Record<string, unknown>> = {};
      for (const [filePath, file] of Object.entries(website.files)) {
        safeFiles[filePath] = {
          ...file,
          content: Buffer.from(file.content).toString('base64'),
        };
      }

      const safeAssets = {
        css: Buffer.from(website.assets.css || '').toString('base64'),
        js: Buffer.from(website.assets.js || '').toString('base64'),
      };

      const safeWebsite = {
        manifest: website.manifest,
        files: safeFiles,
        assets: safeAssets,
        encoded: true,
      };

      debug.emit('complete', {
        result: safeWebsite,
        duration: Date.now() - startTime,
        totalSteps: stepCounter,
      });

      debug.emit('progress', {
        progress: 100,
      });

      // Clean up session
      globalPauseState.delete(sessionId);
      res.end();
    } catch (_error: unknown) {
      logError(_error, 'Debug Generator');

      debug.emit('error', {
        phase: 'Unknown',
        step: 'Unknown',
        message: _error instanceof Error ? _error.message : String(_error),
        stack: _error instanceof Error ? _error.stack : undefined,
      });

      // Clean up session
      globalPauseState.delete(sessionId);
      res.end();
    }
  });

  // Pause/Resume control endpoint
  app.post('/api/website-builder/debug-pause', (req: Request, res: Response): void => {
    const { sessionId } = req.body;
    if (sessionId && globalPauseState.has(sessionId)) {
      const state = globalPauseState.get(sessionId)!;
      state.isPaused = true;
      res.json({ status: 'paused', sessionId });
      return;
    } else {
      // Pause all sessions if no sessionId provided
      for (const [_id, state] of globalPauseState.entries()) {
        state.isPaused = true;
      }
      res.json({ status: 'paused', all: true });
      return;
    }
  });

  app.post('/api/website-builder/debug-resume', (req: Request, res: Response): void => {
    const { sessionId } = req.body;
    if (sessionId && globalPauseState.has(sessionId)) {
      const state = globalPauseState.get(sessionId)!;
      state.isPaused = false;
      if (state.resumeResolve) {
        state.resumeResolve();
        state.resumeResolve = undefined;
      }
      res.json({ status: 'resumed', sessionId });
      return;
    } else {
      // Resume all sessions if no sessionId provided
      for (const [_id, state] of globalPauseState.entries()) {
        state.isPaused = false;
        if (state.resumeResolve) {
          state.resumeResolve();
          state.resumeResolve = undefined;
        }
      }
      res.json({ status: 'resumed', all: true });
      return;
    }
  });
}

