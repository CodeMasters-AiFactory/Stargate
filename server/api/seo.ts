/**
 * SEO API Routes
 * Handles SEO scoring, schema markup generation, and optimization
 */

import type { Express } from 'express';
import {
  calculateSEOScore,
  generateSchemaMarkup,
  generateSEOMetaTags,
  type SEOScore,
  type SchemaMarkup,
} from '../services/seoOptimization';

export function registerSEORoutes(app: Express) {
  // Calculate SEO score for a website
  app.post('/api/seo/score', async (req, res) => {
    try {
      const website = req.body;

      const score = calculateSEOScore(website);

      res.json({
        success: true,
        score,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate SEO score',
      });
    }
  });

  // Generate schema markup
  app.post('/api/seo/schema', async (req, res) => {
    try {
      const { type, data } = req.body;

      if (!type || !data) {
        return res.status(400).json({
          success: false,
          error: 'type and data are required',
        });
      }

      const schema = generateSchemaMarkup(type, data);

      res.json({
        success: true,
        schema,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate schema markup',
      });
    }
  });

  // Generate SEO meta tags
  app.post('/api/seo/meta-tags', async (req, res) => {
    try {
      const config = req.body;

      if (!config.title || !config.description) {
        return res.status(400).json({
          success: false,
          error: 'title and description are required',
        });
      }

      const metaTags = generateSEOMetaTags(config);

      res.json({
        success: true,
        metaTags,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate meta tags',
      });
    }
  });
}

