/**
 * Leonardo AI Usage API Routes
 * 
 * Endpoints for checking Leonardo AI usage and limits:
 * - GET /api/leonardo/usage - Get current usage statistics
 * - GET /api/leonardo/status - Get provider status
 */

import { Router, Request, Response } from 'express';
import { 
  getUsageStats, 
  getRemainingToday, 
  logUsageStatus,
  getTodayUsage 
} from '../services/leonardoImageService';
import { getAvailableImageProviders } from '../services/multiProviderImageService';

const router = Router();

/**
 * GET /api/leonardo/usage
 * Get current usage statistics for Leonardo AI
 */
router.get('/usage', async (req: Request, res: Response) => {
  try {
    const stats = getUsageStats();
    const remaining = getRemainingToday();
    
    res.json({
      success: true,
      today: {
        used: stats.today.used,
        remaining: stats.today.remaining,
        limit: stats.today.limit,
        percentage: stats.today.percentage,
        canGenerate: remaining > 0,
      },
      recent: stats.recent,
      status: remaining > 0 
        ? (stats.today.percentage >= 90 ? 'warning' : 'ok')
        : 'limit_reached',
      message: remaining === 0
        ? `Daily limit reached (${stats.today.limit} images). Upgrade subscription or wait until tomorrow.`
        : stats.today.percentage >= 90
        ? `Warning: Only ${remaining} images remaining today (${stats.today.percentage}% used)`
        : `Usage: ${stats.today.used}/${stats.today.limit} images (${stats.today.remaining} remaining)`,
    });
  } catch (error) {
    console.error('[Leonardo Usage API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get usage statistics',
    });
  }
});

/**
 * GET /api/leonardo/status
 * Get Leonardo AI provider status and availability
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const providers = getAvailableImageProviders();
    const remaining = getRemainingToday();
    const apiKeyConfigured = !!process.env.LEONARDO_AI_API_KEY;
    
    // Log usage status to console
    if (apiKeyConfigured) {
      logUsageStatus();
    }
    
    res.json({
      success: true,
      leonardo: {
        available: providers.leonardo && apiKeyConfigured,
        apiKeyConfigured,
        remainingToday: providers.leonardoRemaining,
        limit: 150, // Free tier
        canUse: providers.leonardo && remaining > 0,
      },
      allProviders: {
        openai: providers.openai,
        replicate: providers.replicate,
        leonardo: providers.leonardo,
      },
      recommendation: !apiKeyConfigured
        ? 'Add LEONARDO_AI_API_KEY to .env file to enable Leonardo AI'
        : remaining === 0
        ? 'Leonardo free tier limit reached. Consider upgrading subscription.'
        : remaining <= 10
        ? 'Leonardo free tier nearly exhausted. Consider upgrading soon.'
        : 'Leonardo AI is ready to use as backup provider.',
    });
  } catch (error) {
    console.error('[Leonardo Status API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Leonardo status',
    });
  }
});

/**
 * Register Leonardo usage routes
 */
export function registerLeonardoUsageRoutes(app: any): void {
  app.use('/api/leonardo', router);
  console.log('[Leonardo Usage API] ✅ Routes registered at /api/leonardo/*');
}

export default router;

