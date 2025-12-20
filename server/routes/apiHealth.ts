import { Router, Request, Response } from 'express';
import OpenAI from 'openai';

export function registerApiHealthRoutes(app: Router) {
  app.get('/api/health/apis', async (_req: Request, res: Response) => {
    const apiStatus: Record<string, { configured: boolean; tested?: boolean; error?: string }> = {};

    // Google Custom Search API
    const googleKey = process.env.GOOGLE_SEARCH_API_KEY;
    const googleEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    apiStatus.googleSearch = {
      configured: !!(googleKey && googleEngineId),
    };

    // Leonardo AI
    const leonardoKey = process.env.LEONARDO_AI_API_KEY;
    apiStatus.leonardoAI = {
      configured: !!leonardoKey,
    };

    // OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    apiStatus.openai = {
      configured: !!openaiKey,
    };
    if (openaiKey) {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });
        await openai.models.list(); // Simple test
        apiStatus.openai.tested = true;
      } catch (error: any) {
        apiStatus.openai.tested = false;
        apiStatus.openai.error = error.message;
      }
    }

    // Replicate
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    apiStatus.replicate = {
      configured: !!replicateToken,
    };

    res.json({
      timestamp: new Date().toISOString(),
      apis: apiStatus,
    });
  });
}
