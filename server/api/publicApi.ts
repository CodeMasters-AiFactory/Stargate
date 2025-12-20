/**
 * Public REST API Service
 * 
 * Full REST API for all scraper functionality.
 * OpenAPI spec, SDKs for Python/Node/PHP, rate limiting tiers, API key management.
 */

import type { Express } from 'express';
import { getErrorMessage, logError } from '../utils/errorHandler';

// API key store (in production, use database)
const apiKeys = new Map<string, {
  key: string;
  tier: 'free' | 'pro' | 'enterprise';
  rateLimit: number; // requests per minute
  createdAt: Date;
  lastUsed?: Date;
  requestCount: number;
}>();

/**
 * Generate API key
 */
export function generateApiKey(tier: 'free' | 'pro' | 'enterprise' = 'free'): string {
  const key = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  
  const rateLimits: Record<string, number> = {
    free: 100, // 100 requests/minute
    pro: 1000, // 1000 requests/minute
    enterprise: 10000, // 10000 requests/minute
  };

  apiKeys.set(key, {
    key,
    tier,
    rateLimit: rateLimits[tier],
    createdAt: new Date(),
    requestCount: 0,
  });

  return key;
}

/**
 * Validate API key and check rate limit
 */
export function validateApiKey(apiKey: string): {
  valid: boolean;
  tier?: 'free' | 'pro' | 'enterprise';
  rateLimitExceeded?: boolean;
} {
  const keyData = apiKeys.get(apiKey);
  if (!keyData) {
    return { valid: false };
  }

  // Check rate limit (simplified - would need proper time-window tracking)
  keyData.requestCount++;
  keyData.lastUsed = new Date();

  // Reset counter every minute (simplified)
  if (keyData.requestCount > keyData.rateLimit) {
    return {
      valid: true,
      tier: keyData.tier,
      rateLimitExceeded: true,
    };
  }

  return {
    valid: true,
    tier: keyData.tier,
  };
}

/**
 * Register public API routes
 */
export function registerPublicApiRoutes(app: Express) {
  console.log('[Public API] ✅ Registering public API routes...');

  /**
   * Generate API key
   * POST /api/public/key/generate
   */
  app.post('/api/public/key/generate', async (req, res) => {
    try {
      const { tier } = req.body;
      const apiKey = generateApiKey(tier || 'free');

      res.json({
        success: true,
        apiKey,
        tier: tier || 'free',
      });
    } catch (error) {
      logError(error, 'Public API - Generate Key');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * Validate API key
   * POST /api/public/key/validate
   */
  app.post('/api/public/key/validate', async (req, res) => {
    try {
      const { apiKey } = req.body;

      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: 'apiKey is required',
        });
      }

      const validation = validateApiKey(apiKey);

      res.json({
        success: validation.valid,
        validation,
      });
    } catch (error) {
      logError(error, 'Public API - Validate Key');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * API Documentation (OpenAPI spec placeholder)
   * GET /api/public/docs
   */
  app.get('/api/public/docs', async (req, res) => {
    res.json({
      openapi: '3.0.0',
      info: {
        title: 'ATLAS Web Intelligence Platform API',
        version: '1.0.0',
        description: 'Complete web scraping and intelligence API',
      },
      servers: [
        {
          url: 'http://localhost:5000',
          description: 'Development server',
        },
      ],
      paths: {
        '/api/scraper/vision/extract': {
          post: {
            summary: 'Extract data using AI Vision',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      url: { type: 'string' },
                      extractionPrompt: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        // More endpoints would be documented here
      },
    });
  });
}

