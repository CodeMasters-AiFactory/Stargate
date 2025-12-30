/**
 * Blueprint API Routes
 * Handles blueprint template previews, screenshots, and categorization
 * Part of Focus 1: Template System Enhancement
 */

import type { Express, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import {
  generateBlueprintScreenshot,
} from '../services/blueprintScreenshotService';

// Load blueprints from JSON file
function loadBlueprints(): any[] {
  try {
    const blueprintsPath = path.join(
      process.cwd(),
      'website_quality_standards/design-llm-knowledge/homepage-blueprints.json'
    );
    const data = JSON.parse(fs.readFileSync(blueprintsPath, 'utf-8'));
    return data.blueprints || [];
  } catch (error) {
    console.error('[Blueprints API] Failed to load blueprints:', error);
    return [];
  }
}

export function registerBlueprintRoutes(app: Express) {
  // Get all blueprints
  app.get('/api/blueprints', async (_req: Request, res: Response): Promise<void> => {
    try {
      const blueprints = loadBlueprints();

      // Add preview URLs
      const blueprintsWithPreviews = blueprints.map((bp: any) => ({
        ...bp,
        previewImage: `/api/blueprints/${bp.id}/preview`,
        thumbnail: `/api/blueprints/${bp.id}/preview?size=thumb`,
      }));

      res.json({
        success: true,
        blueprints: blueprintsWithPreviews,
        count: blueprints.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blueprints',
      });
    }
  });

  // Get blueprint by ID
  app.get('/api/blueprints/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const blueprints = loadBlueprints();
      const blueprint = blueprints.find((bp: any) => bp.id === id);

      if (!blueprint) {
        res.status(404).json({
          success: false,
          error: 'Blueprint not found',
        });
        return;
      }

      res.json({
        success: true,
        blueprint: {
          ...blueprint,
          previewImage: `/api/blueprints/${blueprint.id}/preview`,
          thumbnail: `/api/blueprints/${blueprint.id}/preview?size=thumb`,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blueprint',
      });
    }
  });

  // Get blueprint preview screenshot
  app.get('/api/blueprints/:id/preview', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { size } = req.query;
      const blueprints = loadBlueprints();
      const blueprint = blueprints.find((bp: any) => bp.id === id);

      if (!blueprint) {
        res.status(404).json({
          success: false,
          error: 'Blueprint not found',
        });
        return;
      }

      // Default color scheme
      const colorScheme = {
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#60a5fa',
        background: '#ffffff',
        text: '#1f2937',
      };

      // Determine layout based on blueprint ID
      const layoutMap: Record<string, 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant'> = {
        'premium-corporate': 'modern',
        'brand-storytelling': 'elegant',
        'trust-first-service': 'classic',
        'local-service-business': 'minimal',
        'creative-agency': 'elegant',
        'saas-product': 'modern',
        'content-education': 'classic',
        'real-estate-property': 'modern',
        'personal-brand': 'minimal',
        'hyper-minimalist': 'minimal',
        'restaurant-food-service': 'bold',
        'healthcare-medical': 'classic',
        'fitness-wellness': 'bold',
        'event-wedding': 'elegant',
        'nonprofit-charity': 'modern',
        'blog-content-news': 'classic',
        'technology-startup': 'modern',
        'music-entertainment': 'bold',
        'fashion-apparel': 'elegant',
        'consulting-professional': 'classic',
      };

      const layout = layoutMap[blueprint.id] || 'modern';

      // Generate screenshot
      const svg = generateBlueprintScreenshot({
        blueprintId: blueprint.id,
        blueprintName: blueprint.name,
        colorScheme,
        layout,
        sections: blueprint.structure || [],
      });

      // Adjust size for thumbnail
      const width = size === 'thumb' ? 400 : 800;
      const height = size === 'thumb' ? 300 : 600;
      const sizedSvg = svg
        .replace(/width="\d+"/, `width="${width}"`)
        .replace(/height="\d+"/, `height="${height}"`);

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.send(sizedSvg);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate preview',
      });
    }
  });

  // Get blueprints by industry
  app.get('/api/blueprints/industry/:industry', async (req: Request, res: Response): Promise<void> => {
    try {
      const { industry } = req.params;
      const blueprints = loadBlueprints();

      const filtered = blueprints.filter((bp: any) => {
        const industryMatch = bp.industryMatch || [];
        const bestFor = bp.bestFor || [];
        const industries = bp.industry || [];

        const searchTerm = industry.toLowerCase();
        return (
          industryMatch.some((i: string) => i.toLowerCase().includes(searchTerm)) ||
          bestFor.some((i: string) => i.toLowerCase().includes(searchTerm)) ||
          industries.some((i: string) => i.toLowerCase().includes(searchTerm))
        );
      });

      res.json({
        success: true,
        blueprints: filtered,
        count: filtered.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blueprints by industry',
      });
    }
  });

  // Search blueprints
  app.get('/api/blueprints/search', async (req: Request, res: Response): Promise<void> => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
        return;
      }

      const blueprints = loadBlueprints();
      const searchTerm = q.toLowerCase();

      const filtered = blueprints.filter((bp: any) => {
        return (
          bp.name.toLowerCase().includes(searchTerm) ||
          bp.description?.toLowerCase().includes(searchTerm) ||
          bp.tone?.toLowerCase().includes(searchTerm) ||
          (bp.bestFor || []).some((item: string) => item.toLowerCase().includes(searchTerm)) ||
          (bp.industryMatch || []).some((item: string) => item.toLowerCase().includes(searchTerm))
        );
      });

      res.json({
        success: true,
        blueprints: filtered,
        count: filtered.length,
        query: q,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search blueprints',
      });
    }
  });

  // Get blueprint categories
  app.get('/api/blueprints/categories', async (_req: Request, res: Response): Promise<void> => {
    try {
      const blueprints = loadBlueprints();

      // Extract unique industries
      const industries = new Set<string>();
      blueprints.forEach((bp: any) => {
        if (bp.industryMatch) {
          bp.industryMatch.forEach((i: string) => industries.add(i));
        }
        if (bp.bestFor) {
          bp.bestFor.forEach((i: string) => industries.add(i));
        }
      });

      // Extract unique tones
      const tones = new Set<string>();
      blueprints.forEach((bp: any) => {
        if (bp.tone) {
          tones.add(bp.tone);
        }
      });

      res.json({
        success: true,
        industries: Array.from(industries).sort(),
        tones: Array.from(tones).sort(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
      });
    }
  });
}

