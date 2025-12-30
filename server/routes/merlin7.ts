/**
 * Merlin 7.0 Routes
 * New endpoint for "The Replit Destroyer" system
 */

import type { Express, Request, Response } from 'express';
import { generateMerlin7Website } from '../engines/merlin7Orchestrator';
import { generateWebsiteHTML, saveGeneratedWebsite } from '../engines/htmlGenerator';
import type { IntakeFormData } from '../engines/intakeEngine';
import type { DeploymentConfig } from '../engines/deployEngine';
import { getErrorMessage, logError } from '../utils/errorHandler';

export function registerMerlin7Routes(app: Express): void {
  /**
   * Merlin 7.0 Website Generation Endpoint
   * POST /api/merlin7/generate
   */
  app.post('/api/merlin7/generate', async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    console.log('[Merlin 7.0] Generation request received');

    try {
      const { intakeData, deploymentConfig, enableLivePreview } = req.body as Record<string, unknown>;

      if (!intakeData) {
        res.status(400).json({ error: 'Missing intakeData in request body' });
        return;
      }
      
      // Set up SSE for progress updates
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Generate unique generation ID if live preview is enabled
      const generationId = enableLivePreview
        ? `merlin7-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        : undefined;
      
      if (generationId) {
        res.write(`data: ${JSON.stringify({ type: 'generation-id', generationId })}\n\n`);
      }
      
      // Generate website using Merlin 7.0 orchestrator
      console.log('[Merlin 7.0] Starting 30-phase generation...');
      const result = await generateMerlin7Website(
        intakeData as IntakeFormData,
        (progress) => {
          // Send progress updates via SSE
          res.write(`data: ${JSON.stringify({
            type: 'progress',
            phase: progress.phase,
            phaseName: progress.phaseName,
            currentStep: progress.currentStep,
            progress: progress.progress,
            message: progress.message,
          })}\n\n`);
        },
        deploymentConfig as DeploymentConfig | undefined
      );
      
      // Generate HTML/CSS from engine outputs
      console.log('[Merlin 7.0] Generating HTML/CSS...');
      res.write(`data: ${JSON.stringify({ type: 'progress', phase: 22, phaseName: 'HTML/CSS Generator', progress: 95, message: 'Generating final HTML/CSS...' })}\n\n`);
      
      const website = await generateWebsiteHTML(
        result.pages,
        result.layouts,
        result.designTokens,
        result.images,
        result.copies,
        result.seo,
        result.responsiveRules || new Map(), // Use responsive rules from result
        {
          projectName: intakeData.businessName,
          projectSlug: result.projectSlug,
        }
      );
      
      // Save to filesystem
      saveGeneratedWebsite(website, result.projectSlug);
      
      // Send completion
      const duration = Date.now() - startTime;
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        success: result.success,
        projectSlug: result.projectSlug,
        duration,
        qaReport: result.qaReport,
        deployment: result.deployment,
        errors: result.errors,
      })}\n\n`);
      
      res.end();
    } catch (_error: unknown) {
      logError(_error, 'Merlin 7.0 - Generation');
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: getErrorMessage(_error),
      })}\n\n`);
      res.end();
    }
  });
  
  /**
   * Get Merlin 7.0 status
   * GET /api/merlin7/status
   */
  app.get('/api/merlin7/status', (_req: Request, res: Response): void => {
    res.json({
      version: '7.0',
      name: 'Merlin 7.0 - The Replit Destroyer',
      engines: 11,
      phases: 30,
      status: 'ready',
      features: [
        'Multi-model AI (GPT-4o + Claude)',
        'Quality-scored generation',
        'Industry-aware intelligence',
        'SEO-optimized',
        'Performance-tested',
        'Accessibility-compliant',
        'Instant deployment',
      ],
    });
  });
}

