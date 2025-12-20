/**
 * Security Middleware
 * Comprehensive security headers, CORS, input validation, SQL injection prevention
 */

import type { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { getErrorMessage, logError } from '../utils/errorHandler';

// Try to import cors, but handle if not installed
let cors: any = null;
try {
  cors = require('cors');
} catch {
  // CORS not installed, will use manual CORS headers
}

/**
 * Security headers middleware
 */
export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Note: unsafe-eval needed for some features
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'", 'https://api.openai.com', 'https://api.anthropic.com'],
        frameSrc: ["'self'", 'https://www.youtube.com'],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow iframes for website previews
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });
}

/**
 * CORS configuration
 */
export function corsConfig() {
  if (cors) {
    // Use cors package if available
    return cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
          return callback(null, true);
        }

        const allowedOrigins = [
          'http://localhost:5000',
          'http://localhost:5173',
          'http://127.0.0.1:5000',
          'http://127.0.0.1:5173',
          ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
        ];

        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      maxAge: 86400, // 24 hours
    });
  } else {
    // Manual CORS headers if cors package not available
    return (req: Request, res: Response, next: NextFunction): void => {
      const origin = req.headers.origin;
      const allowedOrigins = [
        'http://localhost:5000',
        'http://localhost:5173',
        'http://127.0.0.1:5000',
        'http://127.0.0.1:5173',
        ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
      ];

      if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, X-Page-Count');
      res.setHeader('Access-Control-Max-Age', '86400');

      if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
      }

      next();
    };
  }
}

/**
 * SQL injection prevention - sanitize input
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove SQL injection patterns
      return obj
        .replace(/['";\\]/g, '')
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '')
        .replace(/xp_/gi, '')
        .replace(/sp_/gi, '')
        .trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
}

/**
 * XSS prevention - escape HTML in responses
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate request size
 */
export function validateRequestSize(maxSize: number = 10 * 1024 * 1024) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    
    if (contentLength > maxSize) {
      res.status(413).json({
        success: false,
        error: `Request too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
      });
      return;
    }

    next();
  };
}

/**
 * Rate limiting per IP (complement to rateLimiter.ts)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function ipRateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = requestCounts.get(ip);
    
    if (!record || now > record.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
      return;
    }

    record.count++;
    next();
  };
}

/**
 * Security logging middleware
 * FIXED: Removed incorrectly nested function that was blocking all requests
 */
export function securityLogger(req: Request, res: Response, next: NextFunction): void {
  // Log suspicious requests
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /exec\(/i, // Command injection
  ];

  const url = req.url || '';
  const body = JSON.stringify(req.body || {});

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(body)) {
      logError(
        new Error(`Suspicious request detected: ${url}`),
        'Security - Suspicious Request',
        {
          ip: req.ip,
          url,
          userAgent: req.headers['user-agent'],
        }
      );
    }
  }

  next();
}

console.log('[Security] 🔒 Middleware loaded - Security headers, CORS, input validation enabled');

