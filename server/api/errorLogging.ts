/**
 * Error Logging API Routes
 * Receives error logs from frontend and stores them for analysis
 */

import { Express, Request, Response } from 'express';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const ERROR_LOG_DIR = join(process.cwd(), 'error_logs');

// Ensure error log directory exists
async function ensureErrorLogDir() {
  if (!existsSync(ERROR_LOG_DIR)) {
    await mkdir(ERROR_LOG_DIR, { recursive: true });
  }
}

export function registerErrorLoggingRoutes(app: Express) {
  // Initialize error log directory
  ensureErrorLogDir().catch(console.error);

  /**
   * POST /api/errors/log
   * Log an error from the frontend
   */
  app.post('/api/errors/log', async (req: Request, res: Response) => {
    try {
      const errorLog = req.body;

      // Validate error log structure
      if (!errorLog || !errorLog.message) {
        return res.status(400).json({ success: false, error: 'Invalid error log format' });
      }

      // Add server timestamp
      const logEntry = {
        ...errorLog,
        serverTimestamp: new Date().toISOString(),
        serverTime: Date.now(),
      };

      // Write to file (one file per day)
      const today = new Date().toISOString().split('T')[0];
      const logFile = join(ERROR_LOG_DIR, `errors-${today}.jsonl`);

      await writeFile(
        logFile,
        JSON.stringify(logEntry) + '\n',
        { flag: 'a' }
      );

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`[ErrorLogger] ${logEntry.severity?.toUpperCase() || 'ERROR'}: ${logEntry.message}`);
        if (logEntry.stack) {
          console.error('[ErrorLogger] Stack:', logEntry.stack);
        }
      }

      // Check if this is a critical error that needs immediate attention
      if (logEntry.severity === 'critical') {
        console.error(`[ErrorLogger] 🚨 CRITICAL ERROR DETECTED: ${logEntry.message}`);
        console.error('[ErrorLogger] Component:', logEntry.context?.component);
        console.error('[ErrorLogger] Route:', logEntry.context?.route);
      }

      res.json({ success: true, logged: true });
    } catch (error) {
      console.error('[ErrorLogger] Failed to log error:', error);
      res.status(500).json({ success: false, error: 'Failed to log error' });
    }
  });

  /**
   * GET /api/errors/recent
   * Get recent error logs (for debugging/admin)
   */
  app.get('/api/errors/recent', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const severity = req.query.severity as string;

      // Read today's error log file
      const today = new Date().toISOString().split('T')[0];
      const logFile = join(ERROR_LOG_DIR, `errors-${today}.jsonl`);

      if (!existsSync(logFile)) {
        return res.json({ success: true, errors: [] });
      }

      const fs = require('fs');
      const content = fs.readFileSync(logFile, 'utf-8');
      const lines = content.trim().split('\n').filter((line: string) => line.trim());

      let errors = lines
        .map((line: string) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter((error: any) => error !== null);

      // Filter by severity if specified
      if (severity) {
        errors = errors.filter((error: any) => error.severity === severity);
      }

      // Sort by timestamp (newest first) and limit
      errors.sort((a: any, b: any) => b.timestamp - a.timestamp);
      errors = errors.slice(0, limit);

      res.json({ success: true, errors, count: errors.length });
    } catch (error) {
      console.error('[ErrorLogger] Failed to get recent errors:', error);
      res.status(500).json({ success: false, error: 'Failed to get errors' });
    }
  });

  /**
   * GET /api/errors/stats
   * Get error statistics
   */
  app.get('/api/errors/stats', async (req: Request, res: Response) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const logFile = join(ERROR_LOG_DIR, `errors-${today}.jsonl`);

      if (!existsSync(logFile)) {
        return res.json({
          success: true,
          stats: {
            total: 0,
            bySeverity: {},
            byType: {},
            critical: 0,
            canAutoFix: 0,
          },
        });
      }

      const fs = require('fs');
      const content = fs.readFileSync(logFile, 'utf-8');
      const lines = content.trim().split('\n').filter((line: string) => line.trim());

      const errors = lines
        .map((line: string) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter((error: any) => error !== null);

      const stats = {
        total: errors.length,
        bySeverity: {} as Record<string, number>,
        byType: {} as Record<string, number>,
        critical: errors.filter((e: any) => e.severity === 'critical').length,
        canAutoFix: errors.filter((e: any) => e.canAutoFix).length,
      };

      errors.forEach((error: any) => {
        stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
        stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      });

      res.json({ success: true, stats });
    } catch (error) {
      console.error('[ErrorLogger] Failed to get error stats:', error);
      res.status(500).json({ success: false, error: 'Failed to get stats' });
    }
  });
}

