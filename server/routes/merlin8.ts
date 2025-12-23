/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MERLIN 8.0 - API ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { Express, Request, Response } from 'express';
import { generateWithMerlin8, getAllIndustries, getIndustryDNA } from '../engines/merlin8/orchestrator';

export function registerMerlin8Routes(app: Express): void {
  console.log('[Merlin 8.0] 🚀 Registering routes...');

  /**
   * GET /api/merlin8/industries
   * Get list of all supported industries
   */
  app.get('/api/merlin8/industries', (_req: Request, res: Response) => {
    try {
      const industries = getAllIndustries();
      res.json({
        success: true,
        industries,
        count: industries.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/merlin8/industry/:id
   * Get full industry DNA profile
   */
  app.get('/api/merlin8/industry/:id', (req: Request, res: Response) => {
    try {
      const industry = getIndustryDNA(req.params.id);
      res.json({
        success: true,
        industry,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/merlin8/generate
   * Generate a website with Merlin 8.0
   * 
   * Body:
   * {
   *   businessName: string (required)
   *   description: string (required)
   *   industryId?: string (optional - auto-detected if not provided)
   *   tagline?: string
   *   services?: Array<{ name: string; description: string }>
   *   location?: string
   *   phone?: string
   *   email?: string
   *   generateImages?: boolean (default true)
   * }
   */
  app.post('/api/merlin8/generate', async (req: Request, res: Response) => {
    const { businessName, description, industryId, tagline, services, location, phone, email, generateImages } = req.body;

    // Validation
    if (!businessName || !description) {
      return res.status(400).json({
        success: false,
        error: 'businessName and description are required',
      });
    }

    try {
      // Set up SSE for progress updates
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Generate website
      const result = await generateWithMerlin8(
        {
          businessName,
          description,
          industryId,
          tagline,
          services,
          location,
          phone,
          email,
          generateImages: generateImages !== false,
        },
        (progress) => {
          // Send progress update via SSE
          res.write(`data: ${JSON.stringify({
            type: 'progress',
            ...progress,
          })}\n\n`);
        }
      );

      // Send completion
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        success: result.success,
        projectSlug: result.projectSlug,
        previewUrl: result.previewUrl,
        outputPath: result.outputPath,
        industry: {
          id: result.industry.id,
          name: result.industry.name,
        },
        imagesGenerated: result.images.length,
        duration: result.duration,
        errors: result.errors,
      })}\n\n`);

      res.end();
    } catch (error) {
      console.error('[Merlin 8.0] Generation error:', error);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })}\n\n`);
      res.end();
    }
  });

  /**
   * POST /api/merlin8/generate-sync
   * Generate a website synchronously (no SSE, returns JSON)
   */
  app.post('/api/merlin8/generate-sync', async (req: Request, res: Response) => {
    const { businessName, description, industryId, tagline, services, location, phone, email, generateImages } = req.body;

    // Validation
    if (!businessName || !description) {
      return res.status(400).json({
        success: false,
        error: 'businessName and description are required',
      });
    }

    try {
      const result = await generateWithMerlin8({
        businessName,
        description,
        industryId,
        tagline,
        services,
        location,
        phone,
        email,
        generateImages: generateImages !== false,
      });

      res.json({
        success: result.success,
        projectSlug: result.projectSlug,
        previewUrl: result.previewUrl,
        outputPath: result.outputPath,
        industry: {
          id: result.industry.id,
          name: result.industry.name,
        },
        imagesGenerated: result.images.length,
        images: result.images.map(img => ({
          section: img.section,
          url: img.url,
        })),
        duration: result.duration,
        errors: result.errors,
      });
    } catch (error) {
      console.error('[Merlin 8.0] Generation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  console.log('[Merlin 8.0] ✅ Routes registered:');
  console.log('  GET  /api/merlin8/industries');
  console.log('  GET  /api/merlin8/industry/:id');
  console.log('  POST /api/merlin8/generate (SSE)');
  console.log('  POST /api/merlin8/generate-sync (JSON)');
}

export default { registerMerlin8Routes };
