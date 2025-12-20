/**
 * Placeholder Image API
 * Generates placeholder images for development and testing
 */

import type { Express } from 'express';

export function registerPlaceholderRoutes(app: Express) {
  // Generate placeholder images
  app.get('/api/placeholder/:width/:height', (req, res) => {
    try {
      const width = parseInt(req.params.width, 10) || 32;
      const height = parseInt(req.params.height, 10) || 32;
      
      // Generate a simple SVG placeholder
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#e5e7eb"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">${width}x${height}</text>
</svg>`;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(svg);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate placeholder' });
    }
  });
}

