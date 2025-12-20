/**
 * AI Routes
 * 
 * Endpoints for multi-model AI orchestration:
 * - GET /api/ai/status - Get available AI providers
 * - POST /api/ai/generate - Generate content with smart routing
 * - POST /api/ai/generate/parallel - Parallel generation (fastest)
 * - POST /api/ai/generate/consensus - Consensus generation (most reliable)
 * - POST /api/ai/design - Generate design system
 * - POST /api/ai/content - Generate content
 * - POST /api/ai/seo - Generate SEO metadata
 */

import { Router, Request, Response } from 'express';
import {
  getAvailableProviders,
  getProviderStatus,
  generate,
  generateParallel,
  generateConsensus,
  smartGenerate,
  generateDesign,
  generateContent,
  generateSEO,
  type GenerationRequest,
} from '../services/multiModelAIOrchestrator';

const router = Router();

/**
 * GET /api/ai/status
 * Get available AI providers and their status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = getProviderStatus();
    const available = getAvailableProviders();
    
    res.json({
      success: true,
      providers: status,
      available: available.map(p => p.name),
      totalAvailable: available.length,
    });
  } catch (error) {
    console.error('[AI Routes] Status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI status',
    });
  }
});

/**
 * POST /api/ai/generate
 * Smart generation with automatic provider selection
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const request: GenerationRequest = req.body;
    
    if (!request.prompt || !request.task) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: prompt, task',
      });
    }

    const result = await smartGenerate(request);
    
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('[AI Routes] Generate error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    });
  }
});

/**
 * POST /api/ai/generate/parallel
 * Parallel generation using multiple providers (returns fastest)
 */
router.post('/generate/parallel', async (req: Request, res: Response) => {
  try {
    const request: GenerationRequest = req.body;
    
    if (!request.prompt || !request.task) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: prompt, task',
      });
    }

    const result = await generateParallel(request);
    
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('[AI Routes] Parallel generate error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Parallel generation failed',
    });
  }
});

/**
 * POST /api/ai/generate/consensus
 * Consensus generation using all available providers
 */
router.post('/generate/consensus', async (req: Request, res: Response) => {
  try {
    const request: GenerationRequest = req.body;
    
    if (!request.prompt || !request.task) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: prompt, task',
      });
    }

    const result = await generateConsensus(request);
    
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('[AI Routes] Consensus generate error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Consensus generation failed',
    });
  }
});

/**
 * POST /api/ai/design
 * Generate design system (colors, fonts, layout)
 */
router.post('/design', async (req: Request, res: Response) => {
  try {
    const { businessName, industry, style, targetAudience } = req.body;
    
    if (!businessName || !industry) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: businessName, industry',
      });
    }

    const design = await generateDesign({
      businessName,
      industry,
      style,
      targetAudience,
    });
    
    res.json({
      success: true,
      design,
    });
  } catch (error) {
    console.error('[AI Routes] Design generate error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Design generation failed',
    });
  }
});

/**
 * POST /api/ai/content
 * Generate SEO-optimized content
 */
router.post('/content', async (req: Request, res: Response) => {
  try {
    const { businessName, industry, sectionType, topic, keywords } = req.body;
    
    if (!businessName || !industry || !sectionType || !topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: businessName, industry, sectionType, topic',
      });
    }

    const content = await generateContent({
      businessName,
      industry,
      sectionType,
      topic,
      keywords,
    });
    
    res.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error('[AI Routes] Content generate error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Content generation failed',
    });
  }
});

/**
 * POST /api/ai/seo
 * Generate SEO metadata
 */
router.post('/seo', async (req: Request, res: Response) => {
  try {
    const { businessName, industry, pageType, keywords } = req.body;
    
    if (!businessName || !industry || !pageType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: businessName, industry, pageType',
      });
    }

    const seo = await generateSEO({
      businessName,
      industry,
      pageType,
      keywords,
    });
    
    res.json({
      success: true,
      seo,
    });
  } catch (error) {
    console.error('[AI Routes] SEO generate error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'SEO generation failed',
    });
  }
});

export default router;

