/**
 * API route to preview generated websites
 * GET /api/website-preview/:projectName
 */

import type { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';

export function registerWebsitePreviewRoutes(app: Express) {
  // Preview generated website
  app.get('/api/website-preview/:projectName', async (req, res) => {
    try {
      const { projectName } = req.params;
      const projectDir = path.join(process.cwd(), 'website_projects', projectName);
      
      // Try standalone version first, then regular index
      const standaloneFile = path.join(projectDir, 'index-standalone.html');
      const indexFile = path.join(projectDir, 'index.html');
      
      let htmlFile = standaloneFile;
      if (!fs.existsSync(standaloneFile) && fs.existsSync(indexFile)) {
        htmlFile = indexFile;
      }
      
      if (!fs.existsSync(htmlFile)) {
        return res.status(404).json({
          success: false,
          error: `Website project "${projectName}" not found`,
        });
      }
      
      const html = fs.readFileSync(htmlFile, 'utf-8');
      
      res.set('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      res.status(500).json({
        success: false,
        error: `Failed to load website: ${errorMsg}`,
      });
    }
  });
}

