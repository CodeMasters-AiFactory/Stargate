/**
 * CDN Cache Headers Middleware
 * Configures optimal cache headers for static assets in production
 * Phase 4.1.1 - Advanced CDN Setup
 */

import type { Request, Response, NextFunction } from 'express';

// Cache durations in seconds
const CACHE_DURATIONS = {
  // Immutable assets with hash in filename (JS, CSS bundles)
  immutable: 31536000, // 1 year
  // Images and fonts
  static: 2592000, // 30 days
  // HTML and dynamic content
  dynamic: 0, // No cache
  // API responses
  api: 60, // 1 minute for API caching
  // Templates and previews
  templates: 3600, // 1 hour
};

/**
 * Determines the appropriate cache duration based on the request path
 */
function getCacheDuration(path: string): { maxAge: number; immutable: boolean; private: boolean } {
  // Immutable hashed assets (Vite adds hash to filenames)
  if (path.match(/\.(js|css)$/) && path.includes('-')) {
    return { maxAge: CACHE_DURATIONS.immutable, immutable: true, private: false };
  }
  
  // Images
  if (path.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
    return { maxAge: CACHE_DURATIONS.static, immutable: false, private: false };
  }
  
  // Fonts
  if (path.match(/\.(woff|woff2|ttf|eot|otf)$/i)) {
    return { maxAge: CACHE_DURATIONS.static, immutable: true, private: false };
  }
  
  // Template assets
  if (path.startsWith('/api/templates/') && path.includes('/assets/')) {
    return { maxAge: CACHE_DURATIONS.templates, immutable: false, private: false };
  }
  
  // API endpoints (short cache)
  if (path.startsWith('/api/')) {
    return { maxAge: CACHE_DURATIONS.api, immutable: false, private: true };
  }
  
  // HTML and everything else - no cache
  return { maxAge: CACHE_DURATIONS.dynamic, immutable: false, private: true };
}

/**
 * Middleware to set CDN-friendly cache headers in production
 */
export function cdnCacheMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only apply in production
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }
  
  const { maxAge, immutable, private: isPrivate } = getCacheDuration(req.path);
  
  if (maxAge > 0) {
    const cacheControl = [
      isPrivate ? 'private' : 'public',
      `max-age=${maxAge}`,
    ];
    
    if (immutable) {
      cacheControl.push('immutable');
    }
    
    // Add stale-while-revalidate for better UX
    if (maxAge > 60) {
      cacheControl.push('stale-while-revalidate=60');
    }
    
    res.setHeader('Cache-Control', cacheControl.join(', '));
    
    // Add Vary header for proper CDN caching
    res.setHeader('Vary', 'Accept-Encoding');
    
    // ETag support for conditional requests
    res.setHeader('X-Content-Type-Options', 'nosniff');
  } else {
    // No cache for dynamic content
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
}

/**
 * Compression hints for CDN
 */
export function compressionHintsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Signal to CDN that we support Brotli and Gzip
  res.setHeader('Accept-Encoding', 'br, gzip, deflate');
  next();
}

export { CACHE_DURATIONS };
