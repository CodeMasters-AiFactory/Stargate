/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse
 */

import type { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production)
const rateLimitStore: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const key in rateLimitStore) {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  max?: number; // Maximum requests per window
  message?: string; // Error message
  keyGenerator?: (req: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

const defaultOptions: Required<RateLimitOptions> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.',
  keyGenerator: (req: Request) => {
    // Use IP address as key
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded 
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim())
      : req.socket.remoteAddress || 'unknown';
    return `rate-limit:${ip}`;
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

/**
 * Rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  
  return (req: Request, res: Response, next: NextFunction) => {
    const key = opts.keyGenerator(req);
    const now = Date.now();
    
    // Get or create rate limit entry
    if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
      rateLimitStore[key] = {
        count: 0,
        resetTime: now + opts.windowMs,
      };
    }
    
    const entry = rateLimitStore[key];
    
    // Check if limit exceeded
    if (entry.count >= opts.max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      res.setHeader('Retry-After', retryAfter.toString());
      res.setHeader('X-RateLimit-Limit', opts.max.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
      
      return res.status(429).json({
        error: opts.message,
        retryAfter,
      });
    }
    
    // Increment counter
    entry.count++;
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', opts.max.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, opts.max - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
    
    // Track response status if needed
    if (opts.skipSuccessfulRequests || opts.skipFailedRequests) {
      const originalJson = res.json;
      res.json = function(body: any) {
        const statusCode = res.statusCode;
        const isSuccess = statusCode >= 200 && statusCode < 300;
        const isFailure = statusCode >= 400;
        
        if ((opts.skipSuccessfulRequests && isSuccess) || 
            (opts.skipFailedRequests && isFailure)) {
          entry.count = Math.max(0, entry.count - 1);
        }
        
        return originalJson.call(this, body);
      };
    }
    
    next();
  };
}

/**
 * Strict rate limiter for authentication endpoints
 */
export function strictRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
  });
}

/**
 * Standard rate limiter for general API endpoints
 */
export function standardRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
  });
}

/**
 * Generous rate limiter for public endpoints
 */
export function generousRateLimit() {
  return rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // 1000 requests per hour
  });
}

