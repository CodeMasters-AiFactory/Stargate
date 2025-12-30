/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MERLIN 8.0 - API ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { Express, Request, Response } from 'express';
import { z } from 'zod';
import { generateWithMerlin8, getAllIndustries, getIndustryDNA } from '../engines/merlin8/orchestrator';
import { standardRateLimit, generousRateLimit } from '../middleware/rateLimiter';
import { validateRequestBody, validateRequestParams } from '../utils/inputValidator';
import { logError, getErrorMessage } from '../utils/errorHandler';

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

const industryIdSchema = z.object({
  id: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Invalid industry ID format'),
});

const merlin8GenerateSchema = z.object({
  businessName: z.string().min(1).max(200).trim(),
  description: z.string().min(1).max(5000).trim(),
  industryId: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  tagline: z.string().max(500).trim().optional(),
  services: z.array(z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000),
  })).max(20).optional(),
  location: z.string().max(500).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional().or(z.literal('')),
  generateImages: z.boolean().optional(),
  // New expanded intake fields
  businessType: z.enum(['startup', 'small', 'medium', 'enterprise', 'personal', 'freelancer', 'nonprofit']).optional(),
  goals: z.array(z.string().max(100)).max(10).optional(),
  targetAudience: z.object({
    ageGroups: z.array(z.string()).optional(),
    audienceType: z.enum(['b2b', 'b2c', 'both']).optional(),
    incomeLevel: z.enum(['budget', 'mid', 'midrange', 'premium', 'na']).optional(),
  }).optional(),
  designPreferences: z.object({
    colorMood: z.string().max(100).optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    designElements: z.array(z.string().max(50)).max(20).optional(),
  }).optional(),
  features: z.array(z.string().max(50)).max(20).optional(),
  pages: z.array(z.string().max(50)).max(20).optional(),
  contactInfo: z.object({
    phone: z.string().max(50).optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().max(500).optional(),
    hours: z.string().max(200).optional(),
    socialPlatforms: z.array(z.string().max(50)).max(10).optional(),
  }).optional(),
  tone: z.object({
    brandVoice: z.string().max(100).optional(),
    ctaStyle: z.string().max(100).optional(),
    keyMessage: z.string().max(500).optional(),
  }).optional(),
  templateId: z.string().max(100).optional(),
});

export function registerMerlin8Routes(app: Express): void {
  console.log('[Merlin 8.0] Registering routes...');

  /**
   * GET /api/merlin8/industries
   * Get list of all supported industries
   */
  app.get('/api/merlin8/industries', generousRateLimit(), (_req: Request, res: Response): void => {
    try {
      const industries = getAllIndustries();
      res.json({
        success: true,
        industries,
        count: industries.length,
      });
    } catch (error: unknown) {
      logError(error, 'Merlin8 - Get industries');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * GET /api/merlin8/industry/:id
   * Get full industry DNA profile
   */
  app.get('/api/merlin8/industry/:id', generousRateLimit(), (req: Request, res: Response): void => {
    try {
      // Validate params
      const paramsValidation = validateRequestParams(industryIdSchema, req.params);
      if (!paramsValidation.success) {
        res.status(400).json({
          success: false,
          error: 'error' in paramsValidation ? paramsValidation.error : 'Validation failed',
        });
        return;
      }

      const { id } = paramsValidation.data;

      // Check if industry exists first
      const allIndustries = getAllIndustries();
      const industryExists = allIndustries.some(ind => ind.id === id);

      if (!industryExists) {
        res.status(404).json({
          success: false,
          error: `Industry '${id}' not found. Use GET /api/merlin8/industries for available options.`,
        });
        return;
      }

      const industry = getIndustryDNA(id);
      res.json({
        success: true,
        industry,
      });
    } catch (error: unknown) {
      logError(error, 'Merlin8 - Get industry');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
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
   *
   *   // NEW EXPANDED INTAKE FIELDS
   *   businessType?: string
   *   goals?: string[]
   *   targetAudience?: { ageGroups: string[], audienceType: string, incomeLevel: string }
   *   designPreferences?: { colorMood: string, primaryColor: string, secondaryColor: string, designElements: string[] }
   *   features?: string[]
   *   pages?: string[]
   *   contactInfo?: { phone: string, email: string, address: string, hours: string, socialPlatforms: string[] }
   *   tone?: { brandVoice: string, ctaStyle: string, keyMessage: string }
   *   templateId?: string
   * }
   */
  app.post('/api/merlin8/generate', standardRateLimit(), async (req: Request, res: Response): Promise<void> => {
    let sseInitialized = false;
    let connectionClosed = false;
    let keepAliveInterval: NodeJS.Timeout | null = null;

    // Helper function to safely write SSE messages
    const safeSSEWrite = (data: Record<string, unknown>): boolean => {
      if (connectionClosed || res.closed || !res.writable) {
        return false;
      }
      try {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        // Flush to ensure message is sent immediately
        const resWithFlush = res as unknown as { flush?: () => void };
        if (typeof resWithFlush.flush === 'function') {
          resWithFlush.flush();
        }
        return true;
      } catch (err: unknown) {
        logError(err, 'Merlin8 - SSE write');
        connectionClosed = true;
        return false;
      }
    };

    // Helper function to safely end the response
    const safeEnd = (): void => {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }
      if (!connectionClosed && !res.closed) {
        try {
          res.end();
        } catch (err: unknown) {
          logError(err, 'Merlin8 - Response end');
        }
      }
      connectionClosed = true;
    };

    // Validate request body BEFORE setting up SSE
    const validation = validateRequestBody(merlin8GenerateSchema, req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'error' in validation ? validation.error : 'Validation failed',
      });
      return;
    }

    const {
      businessName,
      description,
      industryId,
      tagline,
      services,
      location,
      phone,
      email,
      generateImages,
      businessType,
      goals,
      targetAudience,
      designPreferences,
      features,
      pages,
      contactInfo,
      tone,
      templateId
    } = validation.data;

    try {
      // Set up SSE for progress updates
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
      res.setHeader('Transfer-Encoding', 'chunked');

      // Flush headers immediately to establish SSE connection
      res.flushHeaders();
      sseInitialized = true;

      // Send initial "started" event to confirm SSE is working
      res.write(`data: ${JSON.stringify({ type: 'started', message: 'Generation started' })}\n\n`);

      // Handle client disconnect
      req.on('close', () => {
        console.log('[Merlin 8.0] Client disconnected');
        connectionClosed = true;
        if (keepAliveInterval) {
          clearInterval(keepAliveInterval);
          keepAliveInterval = null;
        }
      });

      res.on('error', (err) => {
        logError(err, 'Merlin8 - Response error');
        connectionClosed = true;
      });

      // Keep-alive heartbeat every 15 seconds
      keepAliveInterval = setInterval(() => {
        if (!connectionClosed && !res.closed) {
          try {
            res.write(': keepalive\n\n');
          } catch (_e) {
            if (keepAliveInterval) clearInterval(keepAliveInterval);
          }
        } else {
          if (keepAliveInterval) clearInterval(keepAliveInterval);
        }
      }, 15000);

      // Log incoming user preferences for debugging
      console.log('[Merlin 8.0] User Preferences Received:');
      console.log(`  Business: ${businessName} (${businessType || 'not specified'})`);
      console.log(`  Industry: ${industryId || 'auto-detect'}`);
      console.log(`  Goals: ${goals?.join(', ') || 'none'}`);
      console.log(`  Pages: ${pages?.join(', ') || 'default'}`);
      console.log(`  Features: ${features?.join(', ') || 'default'}`);
      console.log(`  Design: ${designPreferences?.colorMood || 'default'}, Colors: ${designPreferences?.primaryColor || 'auto'}`);
      console.log(`  Tone: ${tone?.brandVoice || 'professional'}, CTA: ${tone?.ctaStyle || 'direct'}`);

      // Generate website with ALL user preferences
      const result = await generateWithMerlin8(
        {
          businessName,
          description,
          industryId,
          tagline: tagline || tone?.keyMessage,
          services: services as Array<{ name: string; description: string }> | undefined,
          location: contactInfo?.address || location,
          phone: contactInfo?.phone || phone,
          email: contactInfo?.email || email,
          generateImages: generateImages !== false,
          // Pass all new expanded intake fields
          businessType: businessType as 'startup' | 'small' | 'medium' | 'enterprise' | 'personal' | 'nonprofit' | undefined,
          goals,
          targetAudience: targetAudience ? {
            ageGroups: targetAudience.ageGroups,
            audienceType: targetAudience.audienceType,
            incomeLevel: targetAudience.incomeLevel as 'budget' | 'mid' | 'premium' | 'na' | undefined,
          } : undefined,
          designPreferences,
          features,
          pages,
          contactInfo,
          tone,
          templateId,
        },
        (progress) => {
          // Send progress update via SSE (safely)
          safeSSEWrite({
            type: 'progress',
            ...progress,
          });
        }
      );

      // Send completion
      safeSSEWrite({
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
      });

      // Small delay to ensure client receives the completion message
      await new Promise(resolve => setTimeout(resolve, 100));
      safeEnd();
    } catch (error: unknown) {
      logError(error, 'Merlin8 - Generation error');

      // If SSE was initialized, send error through SSE
      if (sseInitialized) {
        safeSSEWrite({
          type: 'error',
          success: false,
          error: getErrorMessage(error),
        });
        safeEnd();
      } else {
        // SSE not yet set up, return JSON error
        res.status(500).json({
          success: false,
          error: getErrorMessage(error),
        });
      }
    }
  });

  /**
   * POST /api/merlin8/generate-sync
   * Generate a website synchronously (no SSE, returns JSON)
   */
  app.post('/api/merlin8/generate-sync', standardRateLimit(), async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const validation = validateRequestBody(merlin8GenerateSchema, req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'error' in validation ? validation.error : 'Validation failed',
      });
      return;
    }

    const {
      businessName,
      description,
      industryId,
      tagline,
      services,
      location,
      phone,
      email,
      generateImages,
      businessType,
      goals,
      targetAudience,
      designPreferences,
      features,
      pages,
      contactInfo,
      tone,
      templateId
    } = validation.data;

    try {
      const result = await generateWithMerlin8({
        businessName,
        description,
        industryId,
        tagline: tagline || tone?.keyMessage,
        services: services as Array<{ name: string; description: string }> | undefined,
        location: contactInfo?.address || location,
        phone: contactInfo?.phone || phone,
        email: contactInfo?.email || email,
        generateImages: generateImages !== false,
        // Pass all new expanded intake fields
        businessType: businessType as 'startup' | 'small' | 'medium' | 'enterprise' | 'personal' | 'nonprofit' | undefined,
        goals,
        targetAudience: targetAudience ? {
          ageGroups: targetAudience.ageGroups,
          audienceType: targetAudience.audienceType,
          incomeLevel: targetAudience.incomeLevel as 'budget' | 'mid' | 'premium' | 'na' | undefined,
        } : undefined,
        designPreferences,
        features,
        pages,
        contactInfo,
        tone,
        templateId,
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
    } catch (error: unknown) {
      logError(error, 'Merlin8 - Sync generation error');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
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
