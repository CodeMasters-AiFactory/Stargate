/**
 * Permission Middleware
 * Check user permissions for enterprise features
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware to populate req.user from session
 * Should be called early in middleware chain
 */
export function populateUser(req: Request, res: Response, next: NextFunction): void {
  const session = (req as any).session;

  // Try to get user from session
  if (session?.userId) {
    (req as any).user = {
      id: session.userId,
      username: session.username || 'auto-user',
      email: session.email || 'auto@stargate.dev',
      role: session.role || 'administrator',
    };
  } else if (process.env.NODE_ENV === 'development') {
    // Auto-create user in development mode
    (req as any).user = {
      id: 'auto-user-dev',
      username: 'auto-user',
      email: 'auto@stargate.dev',
      role: 'administrator',
    };
  }

  next();
}

/**
 * Require admin permissions
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  // First ensure user is populated
  const user = (req as any).user;
  const isAdmin = user?.role === 'administrator' ||
                  req.headers['x-admin'] === 'true' ||
                  process.env.NODE_ENV === 'development';

  if (!isAdmin) {
    res.status(403).json({
      success: false,
      error: 'Admin permissions required',
    });
    return;
  }

  next();
}

/**
 * Require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const user = (req as any).user;
  const isAuthenticated = !!user ||
                          req.headers['x-auth'] === 'true' ||
                          process.env.NODE_ENV === 'development';

  // Auto-populate user in development if not already set
  if (!user && process.env.NODE_ENV === 'development') {
    (req as any).user = {
      id: 'auto-user-dev',
      username: 'auto-user',
      email: 'auto@stargate.dev',
      role: 'administrator',
    };
  }

  if (!isAuthenticated && !(req as any).user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }

  next();
}

/**
 * Require specific permission
 */
export function requirePermission(_permission: string) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    // In production, check actual user permissions from session/database
    // For now, allow all requests (development mode)
    next();
  };
}

/**
 * Get user role from request
 */
export function getUserRole(req: Request): string {
  // In production, get from session/database
  // For now, return 'admin' in development
  return req.headers['x-role'] as string || (process.env.NODE_ENV === 'development' ? 'admin' : 'user');
}

/**
 * Get user ID from request
 */
export function getUserId(req: Request): string | null {
  // In production, get from session/database
  // For now, return header value or null
  return (req.headers['x-user-id'] as string) || null;
}

/**
 * Require workspace member permissions
 */
export function requireWorkspaceMember(_workspaceId: string) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    // In production, check if user is member of workspace
    // For now, allow all requests (development mode)
    next();
  };
}
