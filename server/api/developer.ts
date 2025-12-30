/**
 * Developer API Routes
 * Phase 3.2: Integration Expansion - Developer API for custom integrations
 */

import type { Express, Request, Response } from 'express';
import { validateIntegration, testIntegration, generateIntegrationSDK } from '../services/developer/integrationSDK';
import type { Integration } from '../services/integrations/integrationService';

// Store developer integrations (in production, use database)
const developerIntegrations = new Map<string, Integration>();

export function registerDeveloperRoutes(app: Express) {
  // Get SDK
  app.get('/api/developer/sdk', (_req: Request, res: Response): void => {
    const sdk = generateIntegrationSDK();
    res.setHeader('Content-Type', 'application/javascript');
    res.send(sdk);
  });

  // Register a new integration
  app.post('/api/developer/integrations', async (req: Request, res: Response): Promise<void> => {
    try {
      const integration: Integration = req.body;
      const validation = validateIntegration(integration);

      if (!validation.valid) {
        res.status(400).json({
          success: false,
          errors: validation.errors,
        });
        return;
      }

      developerIntegrations.set(integration.id, integration);

      res.json({
        success: true,
        integration,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register integration',
      });
    }
  });

  // Get all developer integrations
  app.get('/api/developer/integrations', (_req: Request, res: Response): void => {
    const integrations = Array.from(developerIntegrations.values());

    res.json({
      success: true,
      integrations,
      count: integrations.length,
    });
  });

  // Get a specific integration
  app.get('/api/developer/integrations/:integrationId', (req: Request, res: Response): void => {
    const { integrationId } = req.params;
    const integration = developerIntegrations.get(integrationId);

    if (!integration) {
      res.status(404).json({
        success: false,
        error: 'Integration not found',
      });
      return;
    }

    res.json({
      success: true,
      integration,
    });
  });

  // Update an integration
  app.put('/api/developer/integrations/:integrationId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { integrationId } = req.params;
      const updates: Partial<Integration> = req.body;

      const existing = developerIntegrations.get(integrationId);
      if (!existing) {
        res.status(404).json({
          success: false,
          error: 'Integration not found',
        });
        return;
      }

      const updated = { ...existing, ...updates, id: integrationId };
      const validation = validateIntegration(updated);

      if (!validation.valid) {
        res.status(400).json({
          success: false,
          errors: validation.errors,
        });
        return;
      }

      developerIntegrations.set(integrationId, updated);

      res.json({
        success: true,
        integration: updated,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update integration',
      });
    }
  });

  // Delete an integration
  app.delete('/api/developer/integrations/:integrationId', (req: Request, res: Response): void => {
    const { integrationId } = req.params;
    const deleted = developerIntegrations.delete(integrationId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Integration not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Integration deleted successfully',
    });
  });

  // Test an integration
  app.post('/api/developer/integrations/:integrationId/test', async (req: Request, res: Response): Promise<void> => {
    try {
      const { integrationId } = req.params;
      const integration = developerIntegrations.get(integrationId);

      if (!integration) {
        res.status(404).json({
          success: false,
          error: 'Integration not found',
        });
        return;
      }

      const result = await testIntegration(integration);

      res.json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test integration',
      });
    }
  });

  // Generate integration script
  app.get('/api/developer/integrations/:integrationId/script', (req: Request, res: Response): void => {
    const { integrationId } = req.params;
    const integration = developerIntegrations.get(integrationId);

    if (!integration) {
      res.status(404).json({
        success: false,
        error: 'Integration not found',
      });
      return;
    }

    const script = generateIntegrationScript(integration);

    res.setHeader('Content-Type', 'application/javascript');
    res.send(script);
  });
}

function generateIntegrationScript(integration: Integration): string {
  const config = integration.config || {};
  const configJson = JSON.stringify(config);

  return `
<!-- ${integration.name} Integration -->
<script>
  (function() {
    const config = ${configJson};
    const integrationId = '${integration.id}';
    
    // Integration-specific script
    ${integration.script || '// Custom integration script'}
    
    // Track integration load
    if (window.trackConversion) {
      window.trackConversion('integration_load', {
        integrationId: integrationId,
        integrationName: '${integration.name}',
      });
    }
  })();
</script>
<!-- End ${integration.name} Integration -->
  `.trim();
}

