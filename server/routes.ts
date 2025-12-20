import {
    insertWebsiteBuilderSessionSchema,
    insertWebsiteDraftSchema,
} from "@shared/schema";
import archiver from "archiver";
import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { registerExecutionRoutes } from "./api/execution";
import { registerPerformanceRoutes } from "./api/performance";
import { generateBrandKit, saveBrandKit } from "./services/brandGenerator";
import { createProjectConfig, listProjects, loadProjectConfig, saveProjectConfig, type ProjectConfig } from "./services/projectConfig";
// ⚠️ DEPRECATED: These generators are kept only for backward compatibility
// Primary generator is merlinDesignLLM.ts (v6.x) used in /api/website-builder/generate
import { generateSterlingWebsite } from "./services/sterlingWebsiteGenerator";
import { generateUnifiedWebsite } from "./services/unifiedWebsiteGenerator";
import { analyzeWebsite, saveAnalysisReport } from "./services/websiteAnalyzer";
import { investigateWebsiteRequirements, type InvestigationRequest } from "./services/websiteInvestigation";
import { storage } from "./storage";

import { registerAllAgents } from './agents';
import { registerAdminTemplateRoutes } from './api/adminTemplates';
import { registerAdvancedScraperRoutes } from './api/advancedScraper';
import agentRoutes from './api/agentApprovals';
import { registerAIGenerationRoutes } from './api/aiGeneration';
import { registerAnalyticsRoutes } from './api/analytics';
import { registerAutomationCursorRoutes } from './api/automationCursor';
import { registerBlueprintRoutes } from './api/blueprints';
import { registerCollaborationRoutes } from './api/collaboration';
import { registerContentMiningRoutes } from './api/contentMining';
import { registerConversionAIRoutes } from './api/conversionAI';
import { registerDeploymentRoutes } from './api/deployment';
import designAssistantRoutes from './api/designAssistant';
import { registerDeveloperRoutes } from './api/developer';
import { registerEcommerceRoutes } from './api/ecommerce';
import { registerEnhancedEcommerceRoutes } from './api/ecommerceEnhanced';
import { registerEmailMarketingRoutes } from './api/emailMarketing';
import { registerEmailSequenceRoutes } from './api/emailSequences';
import { registerErrorLoggingRoutes } from './api/errorLogging';
import { registerFunnelRoutes } from './api/funnels';
import { registerIntegrationRoutes } from './api/integrations';
import { registerInventoryRoutes } from './api/inventory';
import { registerLeadCaptureRoutes } from './api/leadCapture';
import { registerLeadScoringRoutes } from './api/leadScoring';
import { registerLeonardoUsageRoutes } from './api/leonardoUsage';
import { registerMarketingRoutes } from './api/marketing';
import { registerMergeRoutes } from './api/merge';
import { registerPaymentGatewayRoutes } from './api/paymentGateways';
import { registerPlaceholderRoutes } from './api/placeholder';
import { registerProjectRoutes } from './api/projects';
import { registerPublicApiRoutes } from './api/publicApi';
import { registerQuickStartRoutes } from './api/quickStart';
import { registerSEORoutes } from './api/seo';
import { registerTemplateDependencyCheckerRoutes } from './api/templateDependencyChecker';
import { registerTemplateManagerRoutes } from './api/templateManager';
import { registerTemplatePreviewRoutes } from './api/templatePreview';
import { registerTemplateRoutes } from './api/templates';
import { registerTemplateVerifierRoutes } from './api/templateVerifier';
import versionControlRoutes from './api/versionControl';
import { registerVoiceInterfaceRoutes } from './api/voiceInterface';
import { registerWebhookRoutes } from './api/webhooks';
import { registerWebsitePreviewRoutes } from './api/websitePreview';
import { registerWebsiteScraperRoutes } from './api/websiteScraper';
import { registerWebsiteEditorRoutes } from './api/websiteEditor';
import { registerVisualEditorRoutes } from './api/visualEditor';
import { registerBackupRoutes } from './api/backup';
import { registerBlogRoutes } from './api/blog';
import { registerCMSRoutes } from './api/cms';
import { registerAIOptimizationRoutes } from './api/aiOptimization';
import { registerMobileAppRoutes } from './api/mobileApp';
import { registerAdvancedAnalyticsRoutes } from './api/advancedAnalytics';
import { registerAISuggestionsRoutes } from './api/aiSuggestions';
import { registerTemplateDownloaderRoutes } from './api/templateDownloader';
import { registerTemplateQARoutes } from './api/templateQA';
import { registerAwardScreenshotRoutes } from './api/awardScreenshots';
import { registerAwardWebsiteBatchProcessorRoutes } from './api/awardWebsiteBatchProcessor';
import { registerWizardFeaturesRoutes } from './api/wizardFeatures';
import { registerDocsRoutes } from './api/docs';
import websiteBuilderRoutes from './api/websiteBuilder';
import { standardRateLimit } from './middleware/rateLimiter';
import { registerAdminRoutes } from './routes/admin';
import aiRoutes from './routes/ai';
import { registerAuthRoutes } from './routes/auth';
import { registerDebugRoutes } from './routes/debug';
import { registerDebugGeneratorRoute } from './routes/debugGenerator';
import { registerHealthRoutes } from './routes/health';
import { registerMerlin7Routes } from './routes/merlin7';
import { getErrorMessage, getErrorStack, logError } from './utils/errorHandler';
import { validateRequestBody, validateRequestParams } from './utils/inputValidator';
import { withTimeout } from './utils/timeout';
import { generationSchemas, projectConfigSchemas } from './utils/validationSchemas';
import { realtimeService } from './services/collaboration/realtimeService';

export async function registerRoutes(app: Express): Promise<Server> {
  // Register health routes first (for startup validation)
  registerHealthRoutes(app);

  // Register API documentation routes
  registerDocsRoutes(app);

  // Register authentication routes
  registerAuthRoutes(app);

  // Register admin routes
  registerAdminRoutes(app);
  registerAdminTemplateRoutes(app);
  registerWebsiteScraperRoutes(app);
  registerTemplateDownloaderRoutes(app); // Download templates from external sources (TemplateMo, Tooplate, etc.)
  registerTemplateQARoutes(app); // Template Quality Assurance - pre-process templates to perfection
  registerAwardScreenshotRoutes(app); // Award-winning website screenshots for carousel
  registerAwardWebsiteBatchProcessorRoutes(app); // Batch process award-winning websites through QA pipeline
  registerWebsitePreviewRoutes(app); // Preview generated websites
  registerWebsiteEditorRoutes(app); // AI-powered website editing via chat
  registerVisualEditorRoutes(app); // Visual drag-and-drop editor
  registerBlogRoutes(app); // Complete blog system
  registerCMSRoutes(app); // Content management system
  registerAIOptimizationRoutes(app); // AI-powered optimization and predictive analytics
  registerMobileAppRoutes(app); // Mobile app builder and PWA generator
  registerAdvancedAnalyticsRoutes(app); // Advanced analytics (heatmaps, recordings, funnels)
  registerAISuggestionsRoutes(app); // AI content and design suggestions
  registerBackupRoutes(app); // Website backup and restore
  registerTemplatePreviewRoutes(app); // Preview templates with dependencies
  registerTemplateDependencyCheckerRoutes(app); // Check template dependencies
  registerTemplateVerifierRoutes(app); // Verify templates - APPROVED/FAILED
  registerTemplateManagerRoutes(app); // Template Manager - auto-process and update templates
  registerAdvancedScraperRoutes(app); // Advanced scraper features - AI Vision, Natural Language, Self-Healing, Tech Stack
  registerPublicApiRoutes(app); // Public REST API with API key management
  registerAutomationCursorRoutes(app); // Visual automation cursor for AI interactions
  registerAIGenerationRoutes(app); // Leonardo AI + OpenAI for real-time website transform

  // Register error logging routes (for automated error detection)
  registerErrorLoggingRoutes(app);

  // Register debug routes (for log viewing)
  registerDebugRoutes(app);

  // Register debug generator route (for step-by-step visualization)
  registerDebugGeneratorRoute(app);

  // Register Merlin 7.0 routes (The Replit Destroyer)
  registerMerlin7Routes(app);

  // Register Multi-Model AI Orchestrator routes
  app.use('/api/ai', aiRoutes);

  // Register AI Agent System routes (The Council)
  app.use('/api/agents', agentRoutes);

  // Register Website Builder API routes (new 9-phase wizard)
  app.use('/api/website-builder', websiteBuilderRoutes);

  // Initialize The Council (AI Specialist Agents)
  try {
    registerAllAgents();
    console.log('[Routes] 🏛️ The Council agents registered');
  } catch (err) {
    console.error('[Routes] Failed to register agents:', err);
  }

  // Register 120% Feature Routes
  app.use('/api/design-assistant', designAssistantRoutes);
  app.use('/api/version-control', versionControlRoutes);

  // ✅ PRIMARY WEBSITE GENERATION ROUTE - Uses Merlin Design LLM v6.x
  // This is the main, actively maintained generator. All other generators are deprecated.
  // Uses: merlinDesignLLM.ts → generateWebsiteWithLLM()
  app.post("/api/website-builder/generate", async (req, res) => {
    const startTime = Date.now();
    const GENERATION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes timeout
    let timeoutId: NodeJS.Timeout | null = null;
    let hasCompleted = false;
    let hasError = false;

    // Helper function to safely send SSE messages
    const safeSSEWrite = (data: any) => {
      try {
        if (!hasCompleted && !res.closed && !hasError) {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          res.write(message);

          // Flush to ensure message is sent immediately
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }

          console.log(`[Routes] SSE progress sent: ${data.stage || data.type || 'unknown'} (${data.progress || 0}%)`);
        }
      } catch (err: unknown) {
        logError(err, 'Routes - SSE write');
        // Don't throw - continue execution
      }
    };

    // Helper function to safely end response
    const safeEnd = () => {
      if (!hasCompleted) {
        hasCompleted = true;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        try {
          if (!res.closed) {
            res.end();
            console.log('[Routes] Response ended successfully');
          }
        } catch (err: unknown) {
          logError(err, 'Routes - Response end');
        }
      }
    };

    // Set timeout for entire generation process
    timeoutId = setTimeout(() => {
      if (!hasCompleted) {
        hasError = true;
        const duration = Date.now() - startTime;
        console.error(`[Routes] Generation timed out after ${duration}ms (${GENERATION_TIMEOUT_MS}ms limit)`);
        safeSSEWrite({
          stage: 'error',
          progress: 0,
          error: 'Generation timed out after 5 minutes. Please try again or contact support if this persists.',
          message: 'Generation timed out. The process took longer than expected.',
        });
        safeEnd();
      }
    }, GENERATION_TIMEOUT_MS);

    console.log('[Routes] Generation request received');
    console.log('[Routes] Timeout set to', GENERATION_TIMEOUT_MS / 1000, 'seconds');

    try {
      const { requirements, investigation, enableLivePreview, selectedDesignTemplates, selectedContentTemplates } = req.body;

      if (!requirements) {
        hasError = true;
        safeSSEWrite({
          stage: 'error',
          progress: 0,
          error: 'Missing requirements in request body',
          message: 'Please provide all required information to generate your website.',
        });
        safeEnd();
        return;
      }

      console.log('[Routes] Requirements received:', {
        businessName: requirements.businessName,
        businessType: requirements.businessType,
        hasServices: !!requirements.services,
        hasInvestigation: !!investigation,
        hasDesignTemplates: !!(selectedDesignTemplates && selectedDesignTemplates.length > 0),
        hasContentTemplates: !!(selectedContentTemplates && selectedContentTemplates.length > 0),
      });

      // ═══════════════════════════════════════════════════════════════
      // CRITICAL: If templates are selected, use EXACT scraped templates
      // ═══════════════════════════════════════════════════════════════
      if (selectedDesignTemplates && selectedDesignTemplates.length > 0) {
        console.log('[Routes] 🎯 TEMPLATE-BASED GENERATION: Using EXACT scraped template');
        safeSSEWrite({ stage: 'template-loading', progress: 10, message: 'Loading scraped template...' });

        try {
          const { generateFromTemplate } = await import('./services/templateBasedGenerator');
          const designTemplate = selectedDesignTemplates[0]; // Use first selected design template

          // Extract template ID (check multiple possible field names)
          const templateId = designTemplate.id || designTemplate.templateId || (designTemplate as any).template?.id;
          if (!templateId) {
            throw new Error(`Template ID not found in design template. Available fields: ${Object.keys(designTemplate).join(', ')}`);
          }

          console.log('[Routes] 🎯 Using template ID:', templateId);
          console.log('[Routes] Template object:', {
            id: designTemplate.id,
            templateId: (designTemplate as any).templateId,
            name: designTemplate.name,
            brand: designTemplate.brand,
          });

          // Build client info from requirements
          const clientInfo = {
            businessName: requirements.businessName || 'Your Business',
            industry: requirements.businessType || requirements.industry || 'Professional Services',
            location: {
              city: requirements.city || 'Your City',
              state: requirements.region || requirements.state || 'Your State',
              country: requirements.country || 'USA',
            },
            services: (requirements.services || []).map((s: any) => ({
              name: s.name || s,
              description: s.description || s.shortDescription || `${s.name || s} services`,
            })),
            phone: requirements.businessPhone || '',
            email: requirements.businessEmail || '',
            address: requirements.businessAddress || '',
            logo: requirements.logoUrl,
            tagline: requirements.projectOverview,
          };

          safeSSEWrite({ stage: 'template-transforming', progress: 30, message: 'Transforming template with your information...' });

          // Generate from EXACT template - only transform client info
          const result = await generateFromTemplate(
            templateId,
            clientInfo,
            {
              skipImages: false,
              skipContent: false,
              skipCleanup: false,
              onProgress: (phase, current, total) => {
                const progressPercent = 30 + (current / total) * 60; // 30-90%
                safeSSEWrite({
                  stage: phase,
                  progress: Math.floor(progressPercent),
                  message: `Processing ${phase}... (${current}/${total})`,
                });
              },
            }
          );

          if (!result.success) {
            throw new Error(result.errors?.join(', ') || 'Template generation failed');
          }

          safeSSEWrite({ stage: 'finalizing', progress: 95, message: 'Finalizing website...' });

          // Convert to MultiPageWebsite format
          const multiPageWebsite = {
            projectSlug: requirements.projectSlug || 'generated-website',
            pages: [{
              slug: 'home',
              title: `${clientInfo.businessName} | ${clientInfo.industry}`,
              html: result.html,
              css: result.css,
            }],
            sharedAssets: {
              css: result.css,
            },
          };

          safeSSEWrite({
            stage: 'complete',
            progress: 100,
            message: 'Website generated successfully from template!',
            website: multiPageWebsite,
          });

          safeEnd();
          return;
        } catch (templateError: unknown) {
          logError(templateError, 'Routes - Template Generation');
          console.error('[Routes] ❌ Template generation failed, falling back to standard generation:', getErrorMessage(templateError));
          // Fall through to standard generation
        }
      }

      // Generate unique generation ID for live preview
      const generationId = enableLivePreview
        ? `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        : undefined;

      // Set up SSE for progress updates
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

      // Send generation ID if live preview is enabled
      if (generationId) {
        safeSSEWrite({ type: 'generation-id', generationId });
      }

      // Send initial progress
      safeSSEWrite({ stage: 'starting', progress: 0, message: 'Initializing website generation...' });

      // CRITICAL: Convert requirements to v5.0 projectConfig format
      console.log('[Routes] Step 1: Converting requirements to projectConfig...');
      safeSSEWrite({ stage: 'converting', progress: 5, message: 'Preparing project configuration...' });

      let projectConfig;
      try {
        const { convertRequirementsToProjectConfig } = await import('./services/formatConverter');
        // FORCE 1 PAGE ONLY: Override pages to only generate Home page
        const requirementsForSinglePage = {
          ...requirements,
          pages: ['Home'] // Force only Home page
        };
        projectConfig = convertRequirementsToProjectConfig(requirementsForSinglePage, investigation || null);
        console.log('[Routes] ✅ ProjectConfig created (1 PAGE ONLY):', {
          projectName: projectConfig.projectName,
          projectSlug: projectConfig.projectSlug,
          industry: projectConfig.industry,
          pagesToGenerate: projectConfig.pagesToGenerate
        });
        safeSSEWrite({ stage: 'converted', progress: 10, message: 'Project configuration ready' });
      } catch (convError: unknown) {
        logError(convError, 'Routes - Config conversion');
        const error = convError instanceof Error ? convError : new Error(String(convError));
        console.error('[Routes] ❌ Error converting requirements:', error);
        console.error('[Routes] Conversion error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        hasError = true;
        safeSSEWrite({
          stage: 'error',
          progress: 0,
          error: `Failed to convert requirements: ${error.message || 'Unknown conversion error'}`,
          message: 'There was an error processing your requirements. Please check your input and try again.',
        });
        safeEnd();
        return;
      }

      // Send progress updates
      safeSSEWrite({ stage: 'planning', progress: 15, message: 'Using Merlin v6.x Design LLM...' });
      safeSSEWrite({ stage: 'design-thinking', progress: 20, message: 'Analyzing design context...' });

      // Generate website using Merlin v6.x Design LLM with phase tracking
      console.log('[Routes] Step 2: Starting website generation with Merlin v6.x...');
      safeSSEWrite({ stage: 'generating', progress: 25, message: 'Starting website generation...' });

      const { generateWebsiteWithLLM } = await import('./services/merlinDesignLLM');
      const { generateWebsiteWithPhaseTracking } = await import('./services/phaseTrackingIntegration');

      let v5Website;
      let phaseTracker;

      try {
        console.log('[Routes] Step 3: Calling generateWebsiteWithLLM with phase tracking...');
        const port = parseInt(process.env.PORT || '5000', 10);

        // Send progress updates during generation
        safeSSEWrite({ stage: 'generating', progress: 30, message: 'Generating layout with world-class blueprints...' });

        // Wrap generation with phase tracking and progress callbacks
        const generateFn = async () => {
          console.log('[Routes] Generation function called');
          safeSSEWrite({ stage: 'generating', progress: 35, message: 'Creating website structure...' });

          // Create progress callback that forwards to SSE
          const progressCallback = (progress: {
            stage: string;
            progress: number;
            message: string;
            section?: string;
            sectionProgress?: number;
            currentSection?: number;
            totalSections?: number;
          }) => {
            // Map internal progress (0-100) to overall progress range (35-70)
            const mappedProgress = 35 + (progress.progress * 0.35); // 35-70 range
            safeSSEWrite({
              stage: progress.stage || 'generating',
              progress: Math.floor(mappedProgress),
              message: progress.message,
              section: progress.section,
              sectionProgress: progress.sectionProgress,
              currentSection: progress.currentSection,
              totalSections: progress.totalSections
            });
          };

          // Add timeout to website generation (10 minutes)
          return await withTimeout(
            generateWebsiteWithLLM(projectConfig, 'html', 3, app, port, progressCallback),
            10 * 60 * 1000,
            'Website generation timed out after 10 minutes'
          );
        };

        // Generate with phase tracking (quality assessment will be extracted from generated website)
        safeSSEWrite({ stage: 'generating', progress: 40, message: 'Building website components...' });
        const result = await generateWebsiteWithPhaseTracking(
          projectConfig,
          generateFn
        );

        v5Website = result.website;
        phaseTracker = result.phaseTracker;

        console.log('[Routes] ✅ Generation completed successfully:', {
          hasLayout: !!v5Website.layout,
          hasStyleSystem: !!v5Website.styleSystem,
          hasCopy: !!v5Website.copy,
          hasCode: !!v5Website.code,
          hasPhaseTracker: !!phaseTracker
        });
        safeSSEWrite({ stage: 'generated', progress: 70, message: 'Website generation complete!' });

      } catch (genError: unknown) {
        logError(genError, 'Routes - Website generation');
        const error = genError instanceof Error ? genError : new Error(String(genError));
        console.error('[Routes] Generation error stack:', error.stack);
        console.error('[Routes] Generation error details:', {
          message: error.message,
          name: error.name,
          code: (error as any).code,
        });
        hasError = true;
        safeSSEWrite({
          stage: 'error',
          progress: 0,
          error: `Website generation failed: ${error.message || 'Unknown error occurred during generation'}`,
          message: 'There was an error generating your website. Please try again or contact support if the issue persists.',
        });
        safeEnd();
        return;
      }

      safeSSEWrite({ stage: 'converting', progress: 75, message: 'Converting website format...' });

      // Convert v5.0 output to MultiPageWebsite format for frontend compatibility
      console.log('[Routes] Step 4: Converting v5.0 output to MultiPageWebsite format...');
      let website;
      try {
        const { convertV5ToMultiPageWebsite } = await import('./services/v5ToMultiPageConverter');
        website = convertV5ToMultiPageWebsite(v5Website, projectConfig.projectName);
        console.log('[Routes] ✅ Conversion completed:', {
          hasManifest: !!website.manifest,
          fileCount: Object.keys(website.files).length,
          hasAssets: !!website.assets
        });
        safeSSEWrite({ stage: 'converted', progress: 80, message: 'Format conversion complete' });
      } catch (convError: unknown) {
        logError(convError, 'Routes - Config conversion');
        const error = convError instanceof Error ? convError : new Error(String(convError));
        console.error('[Routes] ❌ Error converting v5.0 output:', error);
        console.error('[Routes] Conversion error stack:', error.stack);
        hasError = true;
        safeSSEWrite({
          stage: 'error',
          progress: 0,
          error: `Failed to convert website format: ${error.message || 'Unknown conversion error'}`,
          message: 'There was an error finalizing your website. Please try again.',
        });
        safeEnd();
        return;
      }

      // Convert files and assets to safe format for SSE transmission (prevent JSON chunking)
      console.log('[Routes] Step 5: Encoding files and assets for transmission...');
      safeSSEWrite({ stage: 'encoding', progress: 85, message: 'Preparing website files...' });

      try {
        const safeFiles: Record<string, any> = {};
        let fileIndex = 0;
        const totalFiles = Object.keys(website.files).length;

        for (const [path, file] of Object.entries(website.files)) {
          fileIndex++;
          safeFiles[path] = {
            ...file,
            content: Buffer.from(file.content).toString('base64'),
          };

          // Send progress for large file sets
          if (totalFiles > 5 && fileIndex % Math.ceil(totalFiles / 5) === 0) {
            const encodingProgress = 85 + Math.floor((fileIndex / totalFiles) * 10);
            safeSSEWrite({ stage: 'encoding', progress: encodingProgress, message: `Encoding file ${fileIndex}/${totalFiles}...` });
          }
        }

        // CRITICAL: Base64-encode assets to prevent "Unterminated string in JSON" errors
        const safeAssets = {
          css: Buffer.from(website.assets.css || '').toString('base64'),
          js: Buffer.from(website.assets.js || '').toString('base64'),
        };

        const safeWebsite = {
          manifest: website.manifest,
          files: safeFiles,
          assets: safeAssets, // Now Base64-encoded
          encoded: true
        };

        console.log('[Routes] Step 6: Sending final result...');
        safeSSEWrite({ stage: 'finalizing', progress: 95, message: 'Finalizing website...' });

        // Send final result with encoded content
        safeSSEWrite({ stage: 'complete', progress: 100, data: safeWebsite, message: 'Website generation complete!' });

        const duration = Date.now() - startTime;
        console.log(`[Routes] ✅ Generation completed successfully in ${(duration / 1000).toFixed(2)}s`);

        safeEnd();

      } catch (encodingError: unknown) {
        logError(encodingError, 'Routes - Encoding');
        const error = encodingError instanceof Error ? encodingError : new Error(String(encodingError));
        console.error('[Routes] ❌ Error encoding files:', error);
        console.error('[Routes] Encoding error stack:', error.stack);
        hasError = true;
        safeSSEWrite({
          stage: 'error',
          progress: 0,
          error: `Failed to encode website files: ${error.message || 'Unknown encoding error'}`,
          message: 'There was an error preparing your website files. Please try again.',
        });
        safeEnd();
        return;
      }

    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      hasError = true;
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const errorMessage = getErrorMessage(errorObj);
      const errorStack = getErrorStack(errorObj);
      console.error(`[Routes] ❌ CRITICAL: Unhandled error after ${(duration / 1000).toFixed(2)}s:`, errorMessage);
      if (errorStack) {
        console.error('[Routes] Stack trace:', errorStack);
      }
      console.error('[Routes] Error stack:', errorObj.stack);
      console.error('[Routes] Error details:', {
        message: errorObj.message,
        name: errorObj.name,
        code: (errorObj as any).code,
        type: errorObj.constructor.name,
      });

      // Ensure headers are set before sending error
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
      }

      // errorMessage already declared above at line 407
      const userFriendlyMessage = 'An unexpected error occurred. Please try again or contact support if this issue persists.';

      safeSSEWrite({
        error: errorMessage,
        stage: 'error',
        progress: 0,
        message: userFriendlyMessage,
      });

      safeEnd();
    }
  });

  // Phase Report Download Routes
  app.get("/api/website-builder/phase-report/:projectSlug", standardRateLimit(), async (req, res) => {
    try {
      // Validate params
      const paramsValidation = validateRequestParams(
        projectConfigSchemas.projectSlug,
        req.params
      );
      if (!paramsValidation.success) {
        return res.status(400).json({ error: paramsValidation.error });
      }

      const { projectSlug } = paramsValidation.data;
      const { format } = req.query; // 'markdown' or 'json', defaults to 'markdown'

      const { loadPhaseReport } = await import('./services/phaseTrackingIntegration');
      const reports = loadPhaseReport(projectSlug);

      if (!reports.markdown && !reports.json) {
        return res.status(404).json({ error: 'Phase report not found for this project' });
      }

      if (format === 'json' && reports.json) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${projectSlug}-phase-report.json"`);
        return res.send(reports.json);
      } else if (reports.markdown) {
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="${projectSlug}-phase-report.md"`);
        return res.send(reports.markdown);
      } else {
        return res.status(404).json({ error: 'Requested format not available' });
      }
    } catch (error: unknown) {
      logError(error, 'Routes - Phase report load');
      const errorMessage = getErrorMessage(error);
      return res.status(500).json({ error: errorMessage || 'Failed to load phase report' });
    }
  });

  // Get phase report data as JSON (for frontend display)
  app.get("/api/website-builder/phase-report/:projectSlug/data", async (req, res) => {
    try {
      const { projectSlug } = req.params;

      const { loadPhaseReport } = await import('./services/phaseTrackingIntegration');
      const reports = loadPhaseReport(projectSlug);

      if (!reports.json) {
        return res.status(404).json({ error: 'Phase report not found for this project' });
      }

      const reportData = JSON.parse(reports.json);
      return res.json(reportData);
    } catch (error: unknown) {
      logError(error, 'Routes - Phase report data load');
      const errorMessage = getErrorMessage(error);
      return res.status(500).json({ error: errorMessage || 'Failed to load phase report data' });
    }
  });

  // Website Download Route (ZIP)
  app.post("/api/website-builder/download", async (req, res) => {
    try {
      const { manifest, files, assets } = req.body;

      if (!manifest || !files) {
        return res.status(400).json({ error: 'Missing manifest or files' });
      }

      // Create safe filename from site name
      const siteName = manifest.siteName || 'website';
      const safeFilename = siteName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Set up ZIP headers
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.zip"`);

      // Create ZIP archive
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      // Pipe archive to response
      archive.pipe(res);

      // Add all files to ZIP
      for (const [path, file] of Object.entries(files)) {
        const fileData = file as any; // Type assertion for file object

        // ALWAYS decode Base64 content (generation endpoint always Base64-encodes)
        // Content is Base64-encoded by /api/website-builder/generate to prevent SSE chunking bugs
        const content = typeof fileData.content === 'string' && fileData.content.length > 0
          ? Buffer.from(fileData.content, 'base64').toString('utf-8')
          : fileData.content;

        archive.append(content, { name: path });
      }

      // Add assets if provided (sharedAssets)
      // Assets are ALWAYS Base64-encoded by generation endpoint
      if (assets) {
        if (assets.css) {
          const cssContent = Buffer.from(assets.css, 'base64').toString('utf-8');
          archive.append(cssContent, { name: 'assets/styles/main.css' });
        }

        if (assets.js) {
          const jsContent = Buffer.from(assets.js, 'base64').toString('utf-8');
          archive.append(jsContent, { name: 'assets/scripts/app.js' });
        }
      }

      // Finalize the archive
      await archive.finalize();

    } catch (error: unknown) {
      logError(error, 'Routes - Download');
      if (!res.headersSent) {
        const errorMessage = getErrorMessage(error);
        res.status(500).json({ error: errorMessage });
      }
    }
  });

  // ⚠️ DEPRECATED: Sterling Legal Partners Website Generation
  // This route is deprecated. Use /api/website-builder/generate with Merlin v6.x instead.
  // Kept for backward compatibility only.
  app.post("/api/website-builder/generate-sterling", async (req, res) => {
    try {
      const { city = '[CITY]', region = '[REGION]', phone = '[PHONE NUMBER]', enableLivePreview } = req.body;

      const generationId = enableLivePreview
        ? `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        : undefined;

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      if (generationId) {
        res.write(`data: ${JSON.stringify({ type: 'generation-id', generationId })}\n\n`);
      }

      const website = await generateSterlingWebsite(
        city,
        region,
        phone,
        (progress) => {
          res.write(`data: ${JSON.stringify(progress)}\n\n`);
        }
      );

      const safeFiles: Record<string, any> = {};
      for (const [path, file] of Object.entries(website.files)) {
        safeFiles[path] = {
          ...file,
          content: Buffer.from(file.content).toString('base64'),
        };
      }

      const safeAssets = {
        css: Buffer.from(website.assets.css).toString('base64'),
        js: Buffer.from(website.assets.js).toString('base64'),
      };

      const safeWebsite = {
        manifest: website.manifest,
        files: safeFiles,
        assets: safeAssets,
        encoded: true
      };

      res.write(`data: ${JSON.stringify({ stage: 'complete', progress: 100, data: safeWebsite })}\n\n`);
      res.end();
    } catch (error: unknown) {
      logError(error, 'Routes - Sterling generation');
      const errorMessage = getErrorMessage(error);
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  });

  // Project Configuration Routes
  app.post("/api/website-builder/projects", async (req, res) => {
    try {
      const {
        projectName,
        industry,
        location,
        targetAudiences,
        toneOfVoice,
        services,
        pagesToGenerate,
        brandPreferences,
        specialNotes
      } = req.body;

      if (!projectName || !industry || !location || !targetAudiences || !services || !pagesToGenerate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const config = createProjectConfig(
        projectName,
        industry,
        location,
        targetAudiences,
        toneOfVoice,
        services,
        pagesToGenerate,
        brandPreferences,
        specialNotes
      );

      // Generate brand kit
      const brandKit = await generateBrandKit(config);
      saveBrandKit(config.projectSlug, brandKit);

      res.json({ config, brandKit });
    } catch (error: unknown) {
      logError(error, 'Routes - Project creation');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage || 'Failed to create project' });
    }
  });

  app.get("/api/website-builder/projects", async (req, res) => {
    try {
      const projects = listProjects();
      res.json({ projects });
    } catch (error: unknown) {
      logError(error, 'Routes - List projects');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage || 'Failed to list projects' });
    }
  });

  app.get("/api/website-builder/projects/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const config = loadProjectConfig(slug);

      if (!config) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const { loadBrandKit } = await import('./services/brandGenerator');
      const brandKit = loadBrandKit(slug);

      res.json({ config, brandKit });
    } catch (error: unknown) {
      logError(error, 'Routes - Load project');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage || 'Failed to load project' });
    }
  });

  app.patch("/api/website-builder/projects/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const existingConfig = loadProjectConfig(slug);

      if (!existingConfig) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const updatedConfig: ProjectConfig = {
        ...existingConfig,
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      saveProjectConfig(updatedConfig);

      // Regenerate brand kit if needed
      if (req.body.brandPreferences || req.body.industry || req.body.toneOfVoice) {
        const brandKit = await generateBrandKit(updatedConfig);
        saveBrandKit(slug, brandKit);
        res.json({ config: updatedConfig, brandKit });
      } else {
        res.json({ config: updatedConfig });
      }
    } catch (error: unknown) {
      logError(error, 'Routes - Update project');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage || 'Failed to update project' });
    }
  });

  // ⚠️ DEPRECATED: Unified Website Generation Route (using projectSlug)
  // This route is deprecated. Use /api/website-builder/generate with Merlin v6.x instead.
  // Kept for backward compatibility only.
  app.post("/api/website-builder/generate-from-slug", async (req, res) => {
    try {
      const { projectSlug, enableLivePreview } = req.body;

      if (!projectSlug) {
        return res.status(400).json({ error: 'Project slug is required' });
      }

      const generationId = enableLivePreview
        ? `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        : undefined;

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      if (generationId) {
        res.write(`data: ${JSON.stringify({ type: 'generation-id', generationId })}\n\n`);
      }

      const website = await generateUnifiedWebsite(
        projectSlug,
        (progress) => {
          res.write(`data: ${JSON.stringify(progress)}\n\n`);
        }
      );

      // Convert to safe format for SSE
      const safeWebsite = {
        projectSlug: website.projectSlug,
        pages: website.pages.map(p => ({
          type: p.type,
          html: Buffer.from(p.html).toString('base64'),
          seo: p.seo
        })),
        assets: {
          css: Buffer.from(website.assets.css).toString('base64'),
          js: Buffer.from(website.assets.js).toString('base64')
        },
        images: website.images,
        encoded: true
      };

      res.write(`data: ${JSON.stringify({ stage: 'complete', progress: 100, data: safeWebsite })}\n\n`);
      res.end();
    } catch (error: unknown) {
      logError(error, 'Routes - Unified generation');
      const errorMessage = getErrorMessage(error);
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  });

  // Merlin Design LLM v5.0 Route
  app.post("/api/website-builder/generate-v5", standardRateLimit(), async (req, res) => {
    try {
      // Validate input
      const validation = validateRequestBody(generationSchemas.generateV5, req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const { projectConfig: partialConfig, format } = validation.data;

      // Ensure ProjectConfig has all required fields
      const projectConfig: ProjectConfig = {
        projectName: partialConfig.projectName,
        industry: partialConfig.industry,
        projectSlug: (partialConfig as any).projectSlug || `project-${Date.now()}`,
        targetAudiences: (partialConfig as any).targetAudiences || [],
        createdAt: (partialConfig as any).createdAt || new Date().toISOString(),
        updatedAt: (partialConfig as any).updatedAt || new Date().toISOString(),
        toneOfVoice: partialConfig.toneOfVoice || 'professional',
        location: {
          city: partialConfig.location?.city || '',
          region: partialConfig.location?.region || '',
          country: partialConfig.location?.country || '',
        },
        services: Array.isArray(partialConfig.services)
          ? partialConfig.services.map((s: string | { name: string; shortDescription: string }) =>
              typeof s === 'string' ? { name: s, shortDescription: '' } : s
            )
          : [],
        pagesToGenerate: partialConfig.pagesToGenerate || ['Home'],
        brandPreferences: partialConfig.brandPreferences ? {
          colorPalette: (partialConfig.brandPreferences as any).colorPalette,
          fontPreferences: (partialConfig.brandPreferences as any).fontPreferences,
        } : undefined,
        specialNotes: partialConfig.specialNotes,
      };

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      res.write(`data: ${JSON.stringify({ type: 'progress', message: 'Starting v5.0 Design LLM generation...' })}\n\n`);

      const { generateWebsiteWithLLM } = await import('./services/merlinDesignLLM');
      const port = parseInt(process.env.PORT || '5000', 10);
      // Add timeout to website generation (10 minutes)
      const website = await withTimeout(
        generateWebsiteWithLLM(projectConfig, format, 3, app, port),
        10 * 60 * 1000,
        'Website generation timed out after 10 minutes'
      );

      res.write(`data: ${JSON.stringify({ type: 'complete', website })}\n\n`);
      res.end();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('v5.0 generation error:', errorMessage);
      if (errorStack) {
        console.error('Stack trace:', errorStack);
      }
      res.write(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`);
      res.end();
    }
  });

  // Website Analysis Route
  app.post("/api/website-builder/analyze", async (req, res) => {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      // Validate URL
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      res.setHeader('Content-Type', 'application/json');

      const analysis = await analyzeWebsite(url);

      // Save report to file
      const reportPath = saveAnalysisReport(analysis);

      res.json({
        ...analysis,
        reportPath
      });
    } catch (error: unknown) {
      logError(error, 'Routes - Website analysis');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage || 'Failed to analyze website' });
    }
  });

  // Minimal Test Endpoint - Verifies SSE works without complex logic
  app.post("/api/website-builder/investigate-minimal", async (req, res) => {
    console.log('[MINIMAL TEST] Starting minimal SSE test...');

    try {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      res.write(': connected\n\n');
      console.log('[MINIMAL TEST] ✅ SSE connection established');

      // Send 3 messages with 1-second delays
      for (let i = 1; i <= 3; i++) {
        console.log(`[MINIMAL TEST] [STEP ${i}] About to wait 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`[MINIMAL TEST] [STEP ${i}] Wait complete, checking response state...`);
        console.log(`[MINIMAL TEST] [STEP ${i}] res.closed: ${res.closed}, res.writable: ${res.writable}`);

        if (res.closed) {
          console.log(`[MINIMAL TEST] [STEP ${i}] ❌ Response closed, stopping`);
          break;
        }

        if (!res.writable) {
          console.log(`[MINIMAL TEST] [STEP ${i}] ❌ Response not writable, stopping`);
          break;
        }

        const message = {
          stage: `test_step_${i}`,
          progress: i * 33,
          message: `Test message ${i} of 3`,
        };

        console.log(`[MINIMAL TEST] [STEP ${i}] Writing message: ${JSON.stringify(message)}`);
        res.write(`data: ${JSON.stringify(message)}\n\n`);

        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
        console.log(`[MINIMAL TEST] [STEP ${i}] ✅ Message written successfully`);
      }

      // Send complete message
      console.log('[MINIMAL TEST] [STEP 4] Sending complete message...');
      if (!res.closed && res.writable) {
        const completeMessage = { stage: 'complete', progress: 100, message: 'Minimal test complete' };
        res.write(`data: ${JSON.stringify(completeMessage)}\n\n`);
        console.log('[MINIMAL TEST] [STEP 4] ✅ Complete message sent');
      } else {
        console.log('[MINIMAL TEST] [STEP 4] ❌ Cannot send complete - response closed or not writable');
      }

      if (!res.closed) {
        res.end();
        console.log('[MINIMAL TEST] ✅ Test completed, stream closed');
      }
    } catch (error: unknown) {
      logError(error, 'MINIMAL TEST');
      const errorObj = error instanceof Error ? error : new Error(String(error));
      if (!res.closed) {
        try {
          res.write(`data: ${JSON.stringify({ stage: 'error', progress: 0, error: errorObj.message })}\n\n`);
          res.end();
        } catch (e) {
          console.error('[MINIMAL TEST] Failed to send error:', e);
        }
      }
    }
  });

  // Website Investigation Route
  app.post("/api/website-builder/investigate", standardRateLimit(), async (req, res) => {
    let hasSentComplete = false;
    let keepAliveInterval: NodeJS.Timeout | null = null;

    try {
      const request: InvestigationRequest = req.body;

      console.log('[Investigation Route] Starting investigation for:', request.businessName);
      console.log('[Investigation Route] Logs will be saved to: logs/investigations/');

      // Set up SSE for progress updates
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

      // Send initial connection message
      res.write(': connected\n\n');
      console.log('[Investigation Route] ✅ SSE connection established');

      // Handle client disconnect - but DON'T stop investigation, just log it
      req.on('close', () => {
        console.log('[Investigation Route] ⚠️ Client disconnected - but continuing investigation');
        // Don't set hasSentComplete - let investigation complete
        // The client may reconnect or we may want to log the full investigation
      });

      req.on('error', (err) => {
        console.error('[Investigation Route] ❌ Request error:', err.message);
        // Don't set hasSentComplete - let investigation continue
      });

      res.on('close', () => {
        console.log('[Investigation Route] ⚠️ Response closed by client - but continuing investigation');
        // Don't set hasSentComplete - let investigation complete
        // This allows us to see full execution in logs even if client disconnects
      });

      res.on('error', (err) => {
        console.error('[Investigation Route] ❌ Response error:', err.message);
        // Don't set hasSentComplete - let investigation continue
        // Errors writing to closed stream shouldn't stop the investigation
      });

      // Keep-alive mechanism for SSE
      keepAliveInterval = setInterval(() => {
        if (!hasSentComplete && !res.closed) {
          try {
            res.write(': keepalive\n\n');
          } catch (e) {
            console.error('[Investigation Route] Keep-alive failed:', e);
            if (keepAliveInterval) clearInterval(keepAliveInterval);
          }
        } else {
          if (keepAliveInterval) clearInterval(keepAliveInterval);
        }
      }, 15000); // Every 15 seconds

      console.log('[Investigation Route] Starting investigation function...');

      let investigationError: Error | null = null;
      let results: any = null;

      // Wrap in try-catch to ensure we always handle the result
      try {
        results = await investigateWebsiteRequirements(request, async (progress) => {
          try {
            console.log(`[ROUTE] Progress callback called: ${progress.stage} (${progress.progress}%)`);
            console.log(`[ROUTE] Response state - closed: ${res.closed}, writable: ${res.writable}, destroyed: ${res.destroyed}`);

            if (hasSentComplete) {
              console.log('[ROUTE] ⚠️ Skipping progress - already sent complete');
              return;
            }
            // CRITICAL: Don't stop investigation if response is closed
            // Just skip writing but let investigation continue
            if (res.closed) {
              console.log('[ROUTE] ⚠️ Skipping progress write - response closed (but continuing investigation)');
              return; // Don't set hasSentComplete - let investigation continue
            }
            if (!res.writable) {
              console.log('[ROUTE] ⚠️ Skipping progress write - response not writable (but continuing investigation)');
              return; // Don't set hasSentComplete - let investigation continue
            }
            if (res.destroyed) {
              console.log('[ROUTE] ⚠️ Skipping progress write - response destroyed (but continuing investigation)');
              return; // Don't set hasSentComplete - let investigation continue
            }

            console.log(`[ROUTE] 📤 Writing progress: ${progress.stage} (${progress.progress}%)`);
            const progressJson = JSON.stringify(progress);
            console.log(`[ROUTE] Progress JSON length: ${progressJson.length} bytes`);

            // CRITICAL: Use res.write with error handling that doesn't stop investigation
            try {
              const written = res.write(`data: ${progressJson}\n\n`);
              console.log(`[ROUTE] ✅ Write call completed (drained: ${written})`);

              // If write buffer is full, wait for drain event (non-blocking)
              if (!written) {
                console.log(`[ROUTE] ⚠️ Write buffer full, waiting for drain...`);
                await new Promise<void>((resolve) => {
                  const timeout = setTimeout(() => {
                    console.log(`[ROUTE] ⚠️ Drain timeout, continuing anyway`);
                    resolve();
                  }, 5000);
                  res.once('drain', () => {
                    clearTimeout(timeout);
                    console.log(`[ROUTE] ✅ Buffer drained, continuing`);
                    resolve();
                  });
                });
              }

              // Flush the response to ensure data is sent immediately
              if (typeof (res as any).flush === 'function') {
                (res as any).flush();
                console.log(`[ROUTE] ✅ Flush completed`);
              } else {
                console.log(`[ROUTE] ⚠️ Flush function not available`);
              }

              console.log(`[ROUTE] ✅ Progress written successfully`);
            } catch (writeErr: unknown) {
              // If write fails, log but don't stop investigation
              logError(writeErr, 'ROUTE - Write failed (continuing)');
              // Don't throw - let investigation continue
            }
          } catch (writeError: unknown) {
            logError(writeError, 'ROUTE - Progress write');
            investigationError = writeError instanceof Error ? writeError : new Error(String(writeError));
            // Don't set hasSentComplete here - let investigation continue
            // Don't throw - let investigation continue even if one progress write fails
          }
        });

        console.log('[Investigation Route] ✅ Investigation function completed successfully');
        console.log('[Investigation Route] Results keys:', Object.keys(results || {}));
      } catch (error: unknown) {
        logError(error, 'Investigation Route - Function error');
        investigationError = error instanceof Error ? error : new Error(String(error));

        // Send error to client
        if (!hasSentComplete && !res.closed && res.writable) {
          try {
            const errorMessageText = getErrorMessage(error);
            const errorMessage = {
              stage: 'error',
              progress: 0,
              message: `Investigation failed: ${errorMessageText}`,
              error: errorMessageText,
            };
            console.log('[Investigation Route] 📤 Sending error message to client');
            res.write(`data: ${JSON.stringify(errorMessage)}\n\n`);
            if (typeof (res as any).flush === 'function') {
              (res as any).flush();
            }
            hasSentComplete = true;
          } catch (sendError: unknown) {
            logError(sendError, 'Investigation Route - Send error message');
          }
        }

        // Don't re-throw - handle gracefully and continue
        console.log('[Investigation Route] ⚠️ Investigation failed but continuing to send response');
      }

      if (investigationError) {
        console.log('[Investigation Route] ⚠️ Investigation completed with errors');
      } else {
        console.log('[Investigation Route] ✅ Investigation completed without errors');
      }

      // Clear keep-alive interval
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }

      // Send final result - ensure we always send complete message
      console.log('[ROUTE] Preparing to send final result...');
      console.log(`[ROUTE] hasSentComplete: ${hasSentComplete}, res.closed: ${res.closed}, res.writable: ${res.writable}, results: ${!!results}`);

      if (!hasSentComplete && !res.closed && res.writable && !res.destroyed) {
        try {
          console.log('[ROUTE] Sending complete message with results');
          const completeMessage = { stage: 'complete', progress: 100, data: results || {} };
          res.write(`data: ${JSON.stringify(completeMessage)}\n\n`);
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }
          hasSentComplete = true;
          console.log('[ROUTE] ✅ Complete message sent successfully');
        } catch (completeError: unknown) {
          logError(completeError, 'ROUTE - Send complete message');
        }
      } else {
        console.log('[ROUTE] ⚠️ Cannot send complete - conditions not met');
      }

      // Always try to end the response gracefully
      if (!res.closed && res.writable && !res.destroyed) {
        try {
          res.end();
          console.log('[ROUTE] ✅ Investigation completed successfully - stream closed');
        } catch (endError: unknown) {
          logError(endError, 'ROUTE - End response');
        }
      } else {
        console.log('[ROUTE] ⚠️ Cannot end response - already closed or not writable');
      }
    } catch (error: unknown) {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }
      logError(error, 'Investigation Route - CRITICAL ERROR');

      if (!hasSentComplete && !res.closed) {
        try {
          const errorObj = error instanceof Error ? error : new Error(String(error));
          // Send error message in correct format for frontend
          const errorMessage = {
            stage: 'error',
            progress: 0,
            error: errorObj.message || 'Investigation failed due to an unexpected error',
            message: `Investigation failed: ${errorObj.message || 'Unknown error'}`,
          };
          console.log('[Investigation Route] 📤 Sending error message to client (outer catch)');
          console.log('[Investigation Route] Error message content:', JSON.stringify(errorMessage));
          res.write(`data: ${JSON.stringify(errorMessage)}\n\n`);

          // Flush to ensure error is sent
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }

          res.end();
          console.log('[Investigation Route] ✅ Error message sent, stream closed');
        } catch (writeError: unknown) {
          logError(writeError, 'Investigation Route - Write error message');
          try {
            if (!res.closed) res.end();
          } catch (e) {
            console.error('[Investigation Route] Failed to end response:', e);
          }
        }
      } else {
        console.log('[Investigation Route] ⚠️ Cannot send error - response already closed or complete sent');
        console.log('[Investigation Route] hasSentComplete:', hasSentComplete, 'res.closed:', res.closed);
      }
    }
  });

  // Website Refinement Chat Route
  app.post("/api/website-builder/chat", async (req, res) => {
    try {
      const { message, currentCode } = req.body;

      if (!message || !currentCode) {
        return res.status(400).json({
          error: 'Missing required parameters: message, currentCode'
        });
      }

      // Provide intelligent, conversational responses without requiring external API keys
      const userMessage = message.toLowerCase().trim();

      // Generate a helpful, natural response
      let response = "";
      const suggestedChanges: any = null;

      // Handle greetings
      if (userMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
        response = "Hello! I'm here to help you refine your website. What would you like to change? I can help with colors, layout, content, styling, and more. Just tell me what you'd like to modify!";
      }
      // Handle color/style changes
      else if (userMessage.match(/(darker|lighter|brighter|color|background|theme|palette)/)) {
        response = "I can help you adjust the colors and styling! To make specific changes, please tell me:\n- Which element (header, background, buttons, text, etc.)\n- What color or style you prefer\n\nFor example: 'Make the header background darker' or 'Change button colors to blue'";
      }
      // Handle layout changes
      else if (userMessage.match(/(layout|spacing|padding|margin|arrange|reorganize|move|position)/)) {
        response = "I can help you adjust the layout and spacing! Tell me what you'd like to change:\n- Which section or element\n- How you want it arranged\n\nFor example: 'Add more space between sections' or 'Move the navigation to the top'";
      }
      // Handle content changes
      else if (userMessage.match(/(text|content|heading|title|paragraph|add|remove|change|update)/)) {
        response = "I can help you modify the content! Please specify:\n- What text or content to change\n- What you want it to say instead\n\nFor example: 'Change the heading to Welcome' or 'Add a testimonials section'";
      }
      // Handle font changes
      else if (userMessage.match(/(font|typography|text size|font size|font family|sans-serif|serif)/)) {
        response = "I can help you change the fonts! Tell me:\n- Which elements (headings, body text, buttons, etc.)\n- What font style you prefer\n\nFor example: 'Change all text to sans-serif' or 'Make headings larger'";
      }
      // Handle general requests
      else {
        response = `I understand you want to: "${message}". I'm here to help you refine your website!

To make the best changes, please be specific about:
- What element or section you want to modify
- What change you'd like to see
- Any preferences you have

For example:
- "Make the header darker"
- "Add more spacing between sections"
- "Change the button colors to blue"
- "Update the heading text"

What specific changes would you like me to make?`;
      }

      // Return response without requiring API keys
      return res.json({
        success: true,
        message: response,
        explanation: response,
        suggestedChanges: suggestedChanges || {
          html: currentCode.html || (currentCode.files ? undefined : ''),
          css: currentCode.css || (currentCode.assets ? undefined : ''),
          js: currentCode.js || (currentCode.assets ? undefined : '')
        }
      });
    } catch (error: unknown) {
      logError(error, 'Routes - Chat refinement');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({
        error: 'Failed to process chat message',
        details: errorMessage
      });
    }
  });

  // Website Builder Session Routes
  app.post("/api/website-builder/sessions", async (req, res) => {
    try {
      const userId = req.body.userId || 'default-user';
      const sessionData = insertWebsiteBuilderSessionSchema.parse({
        userId,
        mode: req.body.mode || 'create',
      });
      const session = await storage.createSession(sessionData);
      res.json(session);
    } catch (error: unknown) {
      logError(error, 'Routes - Create session');
      const errorMessage = getErrorMessage(error);
      res.status(400).json({ error: errorMessage });
    }
  });

  app.get("/api/website-builder/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error: unknown) {
      logError(error, 'Routes - Get session');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage });
    }
  });

  app.patch("/api/website-builder/sessions/:id", async (req, res) => {
    try {
      const updates = req.body;
      const session = await storage.updateSession(req.params.id, updates);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error: unknown) {
      logError(error, 'Routes - Update session');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage });
    }
  });

  app.get("/api/website-builder/sessions/user/:userId", async (req, res) => {
    try {
      const sessions = await storage.getSessionsByUserId(req.params.userId);
      res.json(sessions);
    } catch (error: unknown) {
      logError(error, 'Routes - Get sessions by user');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage });
    }
  });

  // Website Draft Routes
  app.post("/api/website-builder/drafts", async (req, res) => {
    try {
      const userId = req.body.userId || 'default-user';
      const draftData = insertWebsiteDraftSchema.parse({
        sessionId: req.body.sessionId,
        userId,
        name: req.body.name,
        description: req.body.description,
        template: req.body.template,
        requirements: req.body.requirements || {},
        code: req.body.code || {},
      });
      const draft = await storage.createDraft(draftData);
      res.json(draft);
    } catch (error: unknown) {
      logError(error, 'Routes - Create draft');
      const errorMessage = getErrorMessage(error);
      res.status(400).json({ error: errorMessage });
    }
  });

  app.get("/api/website-builder/drafts/:id", async (req, res) => {
    try {
      const draft = await storage.getDraft(req.params.id);
      if (!draft) {
        return res.status(404).json({ error: "Draft not found" });
      }
      res.json(draft);
    } catch (error: unknown) {
      logError(error, 'Routes - Get draft');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage });
    }
  });

  app.patch("/api/website-builder/drafts/:id", async (req, res) => {
    try {
      const updates = req.body;
      const draft = await storage.updateDraft(req.params.id, updates);
      if (!draft) {
        return res.status(404).json({ error: "Draft not found" });
      }
      res.json(draft);
    } catch (error: unknown) {
      logError(error, 'Routes - Update draft');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage });
    }
  });

  app.get("/api/website-builder/drafts/session/:sessionId", async (req, res) => {
    try {
      const drafts = await storage.getDraftsBySessionId(req.params.sessionId);
      res.json(drafts);
    } catch (error: unknown) {
      logError(error, 'Routes - Get drafts by session');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage });
    }
  });

  app.get("/api/website-builder/drafts/user/:userId", async (req, res) => {
    try {
      const drafts = await storage.getDraftsByUserId(req.params.userId);
      res.json(drafts);
    } catch (error: unknown) {
      logError(error, 'Routes - Get drafts by user');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage });
    }
  });

  // Register execution routes
  registerExecutionRoutes(app);

  // Register performance routes
  try {
    registerPerformanceRoutes(app);
  } catch (perfError: unknown) {
    console.error('Failed to register performance routes:', perfError);
  }

  // Register e-commerce routes
  registerEcommerceRoutes(app);
  registerEnhancedEcommerceRoutes(app);
  registerInventoryRoutes(app);

  // Register analytics routes
  registerAnalyticsRoutes(app);

  // Register template routes
  registerTemplateRoutes(app);
  registerMergeRoutes(app); // Merge-based website builder routes
  registerWizardFeaturesRoutes(app);

  // Register 120% Innovation features
  registerVoiceInterfaceRoutes(app); // Voice-to-website
  
  // Register new 120% features (Quick Wins)
  const { registerPredictiveContentRoutes } = await import('./api/predictiveContent');
  const { registerSmartABTestingRoutes } = await import('./api/smartABTesting');
  const { registerMultiLanguageRoutes } = await import('./api/multiLanguage');
  const { registerSelfHealingRoutes } = await import('./api/selfHealing');
  registerPredictiveContentRoutes(app); // Predictive Content Generator
  registerSmartABTestingRoutes(app); // Smart A/B Testing Engine
  registerSelfHealingRoutes(app); // Self-Healing Websites
  
  // Register breakthrough features (120%)
  const { registerNeuralDesignerRoutes } = await import('./api/neuralDesigner');
  const { registerAIMarketplaceRoutes } = await import('./api/aiMarketplace');
  registerNeuralDesignerRoutes(app); // Neural Website Designer
  registerAIMarketplaceRoutes(app); // AI Marketplace
  registerContentMiningRoutes(app); // Competitor analysis
  registerConversionAIRoutes(app); // Conversion optimization
  registerCollaborationRoutes(app); // Real-time collaboration
  // Register 120% Innovation feature routes (dynamic imports for optional features)
  try {
    const { registerMultiModalAIRoutes } = await import('./api/multimodalAI');
    registerMultiModalAIRoutes(app); // Screenshot/sketch-to-website
  } catch (e) {
    console.warn('⚠️ Multi-modal AI routes not available');
  }
  try {
    const { registerPerformanceOptimizerRoutes } = await import('./api/performanceOptimizer');
    registerPerformanceOptimizerRoutes(app); // Auto-performance optimization
  } catch (e) {
    console.warn('⚠️ Performance Optimizer routes not available');
  }
  try {
    const { registerSEOAutomationRoutes } = await import('./api/seoAutomation');
    registerSEOAutomationRoutes(app); // Comprehensive SEO automation
  } catch (e) {
    console.warn('⚠️ SEO Automation routes not available');
  }
  try {
    const { registerEnterpriseRoutes } = await import('./api/enterprise');
    registerEnterpriseRoutes(app); // Enterprise features: SSO, white-labeling, custom domains
  } catch (e) {
    console.warn('⚠️ Enterprise routes not available');
  }
  try {
    const { registerIndustryIntelligenceRoutes } = await import('./api/industryIntelligence');
    registerIndustryIntelligenceRoutes(app); // Industry widgets & compliance
  } catch (e) {
    console.warn('⚠️ Industry Intelligence routes not available');
  }

  // Register marketing routes
  registerMarketingRoutes(app);
  registerEmailMarketingRoutes(app);
  registerLeadCaptureRoutes(app);
  registerLeadScoringRoutes(app);
  registerEmailSequenceRoutes(app);
  registerFunnelRoutes(app);
  registerAdvancedAnalyticsRoutes(app);
  registerDeveloperRoutes(app);
  // Note: registerCollaborationRoutes already called above (line 1624)

  // Register SEO routes
  registerSEORoutes(app);

  // Register placeholder image routes
  registerPlaceholderRoutes(app);

  // Register Leonardo AI usage routes
  registerLeonardoUsageRoutes(app);

  // Register project routes
  registerProjectRoutes(app);

  // Register Quick Start routes
  registerQuickStartRoutes(app);

  // Register Blueprint routes
  registerBlueprintRoutes(app);

  // Register Integration routes
  registerIntegrationRoutes(app);

  // Register Webhook routes
  registerWebhookRoutes(app);

  // Register Payment Gateway routes (Phase 1.3)
  registerPaymentGatewayRoutes(app);

  // Register Deployment routes (120% Feature - Vercel & Netlify)
  registerDeploymentRoutes(app);

  // Phase 4.1: Performance Optimization - Performance routes already registered above via registerPerformanceRoutes

  // Chatbot API endpoint
  app.post("/api/chatbot/message", async (req, res) => {
    try {
      const { message, context, enableLeadQualification, enableAppointmentScheduling } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Create OpenAI client
      const aiIntegrationsKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
      const openaiKey = process.env.OPENAI_API_KEY;
      const apiKey = aiIntegrationsKey || openaiKey;

      if (!apiKey) {
        // Mock response if no API key
        return res.json({
          response: `Thank you for your message! ${context?.businessName ? `This is a demo response for ${context.businessName}.` : ''} In production, this would be handled by our AI assistant. Please contact us directly for assistance.`,
        });
      }

      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      // Build system prompt
      const systemPrompt = `You are a helpful customer service chatbot for ${context?.businessName || 'the business'}, a ${context?.industry || 'business'} company.

Your role:
- Answer questions about ${context?.businessName || 'the business'} and their services
- Be friendly, professional, and helpful
- Keep responses concise (2-3 sentences max)
- If you don't know something, offer to connect them with a human representative
${context?.services ? `- Services offered: ${context.services.join(', ')}` : ''}
${context?.contactEmail ? `- Contact email: ${context.contactEmail}` : ''}
${context?.contactPhone ? `- Contact phone: ${context.contactPhone}` : ''}
${enableLeadQualification ? '- Qualify leads by asking about their needs and budget when appropriate' : ''}
${enableAppointmentScheduling ? '- Help schedule appointments or consultations when requested' : ''}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const aiResponse = response.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';

      res.json({ response: aiResponse });
    } catch (error: unknown) {
      logError(error, 'Routes - Chatbot');
      res.status(500).json({
        response: 'I apologize, but I encountered an error. Please try again or contact us directly.'
      });
    }
  });

  // Wizard Chatbot - Contextual help for the website builder wizard
  app.post("/api/wizard-chatbot/message", async (req, res) => {
    try {
      const { message, context } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const { processChatbotMessage } = await import('./services/chatbotService.js');

      const response = await processChatbotMessage(message, context || {});

      res.json({
        message: response.message,
        suggestions: response.suggestions || [],
        relatedQuestions: response.relatedQuestions || [],
        error: response.error,
      });
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logError(errorObj, 'Routes - Wizard chatbot');
      res.status(500).json({
        message: 'I apologize, but I encountered an error. Please try again.',
        error: errorObj.message,
      });
    }
  });

  // Get contextual suggestions for wizard
  app.get("/api/wizard-chatbot/suggestions", async (req, res) => {
    try {
      const context = req.query.context ? JSON.parse(req.query.context as string) : {};

      const { generateContextualSuggestions } = await import('./services/chatbotService.js');
      const suggestions = generateContextualSuggestions(context);

      res.json({ suggestions });
    } catch (error: unknown) {
      logError(error, 'Routes - Wizard chatbot suggestions');
      res.status(500).json({
        suggestions: [
          'How do I get started?',
          'What package should I choose?',
          'What features are available?',
        ],
      });
    }
  });

  // ============================================
  // MERLIN QUICK GENERATE ENDPOINT
  // ============================================
  // Used by the new streamlined 3-phase flow (Requirements → Generate → Review)
  // Skips the 17-phase wizard and generates directly from requirements
  app.post("/api/website/generate", async (req, res) => {
    console.log('[Quick Generate] Starting website generation...');
    const startTime = Date.now();

    try {
      const requirements = req.body;

      // Set up SSE headers for streaming progress
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      // Send initial progress
      res.write(`data: ${JSON.stringify({ stage: 'design-thinking', message: 'Analyzing your requirements...' })}\n\n`);

      // Convert requirements to ProjectConfig format
      const projectConfig = {
        projectName: requirements.businessName || 'My Website',
        projectSlug: (requirements.businessName || 'my-website').toLowerCase().replace(/\s+/g, '-'),
        businessName: requirements.businessName || 'My Business',
        businessType: requirements.siteType || requirements.businessType || 'business',
        industry: requirements.industry || 'professional services',
        targetAudience: requirements.targetAudience || 'Business professionals',
        location: {
          city: requirements.region || 'Your City',
          region: requirements.country || 'Your Country',
        },
        contactInfo: {
          phone: requirements.contactPhone || requirements.businessPhone || '',
          email: requirements.contactEmail || requirements.businessEmail || '',
          address: requirements.address || requirements.businessAddress || '',
        },
        services: requirements.services || [],
        desiredPages: requirements.desiredPages || ['Home', 'About', 'Services', 'Contact'],
        designPreferences: {
          colorScheme: requirements.colorScheme || 'professional',
          designStyle: requirements.designStyle || 'modern',
          fontStyle: requirements.fontStyle || 'sans-serif',
        },
        features: requirements.features || {
          contactForm: true,
          seo: true,
        },
        socialMedia: requirements.socialMedia || {},
        seoKeywords: requirements.targetKeywords ? requirements.targetKeywords.split(',').map((k: string) => k.trim()) : [],
      };

      // Send layout progress
      res.write(`data: ${JSON.stringify({ stage: 'layout', message: 'Planning page structure...' })}\n\n`);

      // Import the generator
      const { generateWebsiteWithLLM } = await import('./services/merlinDesignLLM');
      const port = parseInt(process.env.PORT || '5000', 10);

      // Progress callback for streaming updates
      const progressCallback = (stage: string, message: string) => {
        const stageMap: Record<string, string> = {
          'design': 'design-thinking',
          'layout': 'layout',
          'copy': 'copywriting',
          'images': 'images',
          'code': 'code-generation',
          'seo': 'optimization',
        };
        const mappedStage = stageMap[stage] || stage;
        res.write(`data: ${JSON.stringify({ stage: mappedStage, message })}\n\n`);
      };

      // Send copywriting progress
      setTimeout(() => {
        res.write(`data: ${JSON.stringify({ stage: 'copywriting', message: 'Writing compelling content...' })}\n\n`);
      }, 2000);

      // Send images progress
      setTimeout(() => {
        res.write(`data: ${JSON.stringify({ stage: 'images', message: 'Generating visuals...' })}\n\n`);
      }, 5000);

      // Send code generation progress
      setTimeout(() => {
        res.write(`data: ${JSON.stringify({ stage: 'code-generation', message: 'Building your website...' })}\n\n`);
      }, 8000);

      // Generate the website
      const website = await generateWebsiteWithLLM(
        projectConfig,
        'html',
        3,
        app,
        port,
        progressCallback
      );

      // Send optimization progress
      res.write(`data: ${JSON.stringify({ stage: 'optimization', message: 'Optimizing for performance...' })}\n\n`);

      const duration = Date.now() - startTime;
      console.log(`[Quick Generate] Website generated in ${duration}ms`);

      // Send completion with website data
      res.write(`data: ${JSON.stringify({
        complete: true,
        website: {
          html: website.code?.html || '',
          css: website.code?.css || '',
          js: website.code?.javascript || '',
          layout: website.layout,
          qualityScore: website.qualityScore,
        },
        duration,
      })}\n\n`);

      res.end();

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logError(error, 'Quick Generate');
      console.error('[Quick Generate] Error:', errorMessage);

      // Send error via SSE
      res.write(`data: ${JSON.stringify({
        error: true,
        message: errorMessage || 'Website generation failed',
      })}\n\n`);
      res.end();
    }
  });

  const httpServer = createServer(app);

  // Initialize real-time collaboration service
  realtimeService.initialize(httpServer, app);

  return httpServer;
}
