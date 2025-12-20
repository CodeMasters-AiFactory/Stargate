/**
 * Mobile App Builder API Routes
 * PWA generation, iOS/Android app building
 */

import type { Express } from 'express';
import { generatePWA, generateInstallPromptHTML } from '../services/pwaGenerator';
import { generateiOSApp, generateAndroidApp, generateAppStoreListing } from '../services/mobileAppBuilder';
import { readFileContent } from '../services/azureStorage';

export function registerMobileAppRoutes(app: Express) {
  // ============================================
  // PWA GENERATION
  // ============================================

  // Generate PWA
  app.post('/api/mobile-app/pwa/generate', async (req, res) => {
    try {
      const { projectSlug, config } = req.body;

      if (!projectSlug || !config) {
        return res.status(400).json({
          success: false,
          error: 'projectSlug and config are required',
        });
      }

      const result = await generatePWA(projectSlug, config);

      res.json({
        success: true,
        manifestPath: result.manifestPath,
        serviceWorkerPath: result.serviceWorkerPath,
        installPromptHTML: generateInstallPromptHTML(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate PWA',
      });
    }
  });

  // ============================================
  // iOS APP GENERATION
  // ============================================

  // Generate iOS app
  app.post('/api/mobile-app/ios/generate', async (req, res) => {
    try {
      const { projectSlug, config, websiteHTML } = req.body;

      if (!projectSlug || !config) {
        return res.status(400).json({
          success: false,
          error: 'projectSlug and config are required',
        });
      }

      // Get website HTML if not provided
      let html = websiteHTML;
      if (!html) {
        try {
          html = await readFileContent(projectSlug, 'index.html');
        } catch (e) {
          html = '<html><body>Website content</body></html>';
        }
      }

      const result = await generateiOSApp(projectSlug, html, config);

      res.json({
        success: true,
        appPath: result.appPath,
        instructions: result.instructions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate iOS app',
      });
    }
  });

  // ============================================
  // ANDROID APP GENERATION
  // ============================================

  // Generate Android app
  app.post('/api/mobile-app/android/generate', async (req, res) => {
    try {
      const { projectSlug, config, websiteHTML } = req.body;

      if (!projectSlug || !config) {
        return res.status(400).json({
          success: false,
          error: 'projectSlug and config are required',
        });
      }

      // Get website HTML if not provided
      let html = websiteHTML;
      if (!html) {
        try {
          html = await readFileContent(projectSlug, 'index.html');
        } catch (e) {
          html = '<html><body>Website content</body></html>';
        }
      }

      const result = await generateAndroidApp(projectSlug, html, config);

      res.json({
        success: true,
        appPath: result.appPath,
        instructions: result.instructions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate Android app',
      });
    }
  });

  // ============================================
  // APP STORE LISTINGS
  // ============================================

  // Generate app store listing
  app.post('/api/mobile-app/listing', async (req, res) => {
    try {
      const { config } = req.body;

      if (!config) {
        return res.status(400).json({
          success: false,
          error: 'config is required',
        });
      }

      const listing = generateAppStoreListing(config);

      res.json({
        success: true,
        listing,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate app store listing',
      });
    }
  });
}

