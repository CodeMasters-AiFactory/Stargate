/**
 * Integrations API Routes
 * Handles integration management and configuration
 * Part of Focus 2: Integrations Expansion
 */

import type { Express } from 'express';
import { DEFAULT_INTEGRATIONS, type Integration } from '../services/integrations/integrationService';

export function registerIntegrationRoutes(app: Express) {
  // Get all available integrations
  app.get('/api/integrations', async (req, res) => {
    try {
      res.json({
        success: true,
        integrations: DEFAULT_INTEGRATIONS,
        count: DEFAULT_INTEGRATIONS.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch integrations',
      });
    }
  });

  // Get integrations for a project/website
  app.get('/api/integrations/project/:projectSlug', async (req, res) => {
    try {
      const { projectSlug } = req.params;
      
      // Load integrations from project directory
      const fs = require('fs');
      const path = require('path');
      const integrationsPath = path.join(
        process.cwd(),
        'website_projects',
        projectSlug,
        'integrations.json'
      );
      
      let projectIntegrations: Integration[] = [];
      if (fs.existsSync(integrationsPath)) {
        try {
          const content = fs.readFileSync(integrationsPath, 'utf-8');
          projectIntegrations = JSON.parse(content);
        } catch (error) {
          console.error('[Integrations] Failed to load integrations:', error);
        }
      }
      
      // Merge with defaults if no project integrations
      if (projectIntegrations.length === 0) {
        projectIntegrations = DEFAULT_INTEGRATIONS.map(int => ({ ...int }));
      }
      
      res.json({
        success: true,
        integrations: projectIntegrations,
        projectSlug,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch project integrations',
      });
    }
  });

  // Save integration configuration for a project
  app.post('/api/integrations/project/:projectSlug', async (req, res) => {
    try {
      const { projectSlug } = req.params;
      const { integrations } = req.body;

      if (!Array.isArray(integrations)) {
        return res.status(400).json({
          success: false,
          error: 'Integrations must be an array',
        });
      }

      // Save to project directory
      const fs = require('fs');
      const path = require('path');
      const projectDir = path.join(process.cwd(), 'website_projects', projectSlug);
      
      // Ensure project directory exists
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
      }
      
      const integrationsPath = path.join(projectDir, 'integrations.json');
      fs.writeFileSync(
        integrationsPath,
        JSON.stringify(integrations, null, 2),
        'utf-8'
      );
      
      res.json({
        success: true,
        message: 'Integrations saved',
        projectSlug,
        integrations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save integrations',
      });
    }
  });

  // Test integration connection
  app.post('/api/integrations/:integrationId/test', async (req, res) => {
    try {
      const { integrationId } = req.params;
      const { config } = req.body;

      // TODO: Implement actual connection testing
      // For now, return mock success
      res.json({
        success: true,
        integrationId,
        connected: true,
        message: 'Connection test successful (mock)',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      });
    }
  });
}

