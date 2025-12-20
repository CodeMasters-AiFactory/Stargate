/**
 * Cache Busting Middleware
 * Prevents browser caching in development mode
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware to add aggressive no-cache headers in development
 * This ensures browsers never cache JavaScript, CSS, HTML, or JSON files
 */
export function cacheBusterMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only apply in development mode
  if (process.env.NODE_ENV === 'development') {
    // Set aggressive no-cache headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Additional headers for extra cache prevention
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // CRITICAL: Allow iframes for template preview routes (used in wizard and full-page preview)
    // Template previews need to be displayed in iframes for selection
    const isTemplatePreview = req.path.startsWith('/api/template-preview/') || 
                              req.path.startsWith('/api/scraper/preview/') ||
                              (req.path.startsWith('/api/templates/') && req.path.includes('/preview-html')) ||
                              (req.path.startsWith('/api/templates/') && req.path.includes('/assets/'));
    
    if (isTemplatePreview) {
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    } else {
      res.setHeader('X-Frame-Options', 'DENY');
    }
    
    // Logging disabled to reduce console spam
    // Cache-busting headers are still applied to all requests
  }
  
  next();
}

