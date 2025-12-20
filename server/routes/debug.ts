import type { Express, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { clearDebugLog, type DebugLogEntry } from '../utils/debugLogger';

const LOG_FILE_PATH = path.resolve(process.cwd(), '.cursor', 'debug.log');

/**
 * Register debug log routes
 */
export function registerDebugRoutes(app: Express) {
  /**
   * GET /api/debug/logs
   * Get debug logs with optional filtering
   */
  app.get('/api/debug/logs', (req: Request, res: Response) => {
    try {
      if (!fs.existsSync(LOG_FILE_PATH)) {
        return res.json({ logs: [], total: 0, message: 'No debug log file found' });
      }

      // Read log file
      const logContent = fs.readFileSync(LOG_FILE_PATH, 'utf8');
      const lines = logContent.trim().split('\n').filter(line => line.trim());

      // Parse NDJSON entries
      const logs: DebugLogEntry[] = [];
      for (const line of lines) {
        try {
          const entry = JSON.parse(line) as DebugLogEntry;
          logs.push(entry);
        } catch (parseError) {
          // Skip invalid JSON lines
          console.error('[Debug Routes] Failed to parse log line:', parseError);
        }
      }

      // Apply filters
      let filteredLogs = logs;
      const { hypothesisId, sessionId, location, limit, since } = req.query;

      if (hypothesisId) {
        filteredLogs = filteredLogs.filter(log => log.hypothesisId === hypothesisId);
      }

      if (sessionId) {
        filteredLogs = filteredLogs.filter(log => log.sessionId === sessionId);
      }

      if (location) {
        filteredLogs = filteredLogs.filter(log => 
          log.location.toLowerCase().includes(String(location).toLowerCase())
        );
      }

      if (since) {
        const sinceTimestamp = parseInt(String(since), 10);
        filteredLogs = filteredLogs.filter(log => log.timestamp >= sinceTimestamp);
      }

      // Sort by timestamp (newest first)
      filteredLogs.sort((a, b) => b.timestamp - a.timestamp);

      // Apply limit
      if (limit) {
        const limitNum = parseInt(String(limit), 10);
        filteredLogs = filteredLogs.slice(0, limitNum);
      }

      res.json({
        logs: filteredLogs,
        total: filteredLogs.length,
        totalInFile: logs.length,
      });
    } catch (error: unknown) {
      console.error('[Debug Routes] Error reading logs:', error);
      res.status(500).json({ 
        error: 'Failed to read debug logs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /api/debug/logs/stream
   * Stream debug logs via Server-Sent Events
   */
  app.get('/api/debug/logs/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let lastReadPosition = 0;
    const checkInterval = 1000; // Check every second

    const sendLogs = () => {
      try {
        if (!fs.existsSync(LOG_FILE_PATH)) {
          return;
        }

        const stats = fs.statSync(LOG_FILE_PATH);
        if (stats.size <= lastReadPosition) {
          return; // No new content
        }

        // Read new content
        const fileHandle = fs.openSync(LOG_FILE_PATH, 'r');
        const buffer = Buffer.alloc(stats.size - lastReadPosition);
        fs.readSync(fileHandle, buffer, 0, buffer.length, lastReadPosition);
        fs.closeSync(fileHandle);

        const newContent = buffer.toString('utf8');
        const lines = newContent.trim().split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const entry = JSON.parse(line) as DebugLogEntry;
            res.write(`data: ${JSON.stringify(entry)}\n\n`);
          } catch (parseError) {
            // Skip invalid JSON lines
          }
        }

        lastReadPosition = stats.size;
      } catch (error) {
        console.error('[Debug Routes] Error streaming logs:', error);
      }
    };

    // Send initial logs
    sendLogs();

    // Poll for new logs
    const intervalId = setInterval(() => {
      if (res.closed) {
        clearInterval(intervalId);
        return;
      }
      sendLogs();
    }, checkInterval);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(intervalId);
      res.end();
    });
  });

  /**
   * DELETE /api/debug/logs
   * Clear debug log file
   */
  app.delete('/api/debug/logs', (req: Request, res: Response) => {
    try {
      clearDebugLog();
      res.json({ success: true, message: 'Debug log cleared' });
    } catch (error: unknown) {
      console.error('[Debug Routes] Error clearing logs:', error);
      res.status(500).json({ 
        error: 'Failed to clear debug logs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /api/debug/stats
   * Get debug log statistics
   */
  app.get('/api/debug/stats', (req: Request, res: Response) => {
    try {
      if (!fs.existsSync(LOG_FILE_PATH)) {
        return res.json({
          exists: false,
          totalEntries: 0,
          hypotheses: {},
          sessions: {},
          locations: {},
        });
      }

      const logContent = fs.readFileSync(LOG_FILE_PATH, 'utf8');
      const lines = logContent.trim().split('\n').filter(line => line.trim());

      const stats = {
        exists: true,
        totalEntries: 0,
        hypotheses: {} as Record<string, number>,
        sessions: {} as Record<string, number>,
        locations: {} as Record<string, number>,
        oldestTimestamp: Infinity,
        newestTimestamp: 0,
      };

      for (const line of lines) {
        try {
          const entry = JSON.parse(line) as DebugLogEntry;
          stats.totalEntries++;

          if (entry.hypothesisId) {
            stats.hypotheses[entry.hypothesisId] = (stats.hypotheses[entry.hypothesisId] || 0) + 1;
          }

          if (entry.sessionId) {
            stats.sessions[entry.sessionId] = (stats.sessions[entry.sessionId] || 0) + 1;
          }

          const locationKey = entry.location.split(':')[0]; // Just the file path
          stats.locations[locationKey] = (stats.locations[locationKey] || 0) + 1;

          if (entry.timestamp < stats.oldestTimestamp) {
            stats.oldestTimestamp = entry.timestamp;
          }
          if (entry.timestamp > stats.newestTimestamp) {
            stats.newestTimestamp = entry.timestamp;
          }
        } catch (parseError) {
          // Skip invalid JSON lines
        }
      }

      res.json(stats);
    } catch (error: unknown) {
      console.error('[Debug Routes] Error getting stats:', error);
      res.status(500).json({ 
        error: 'Failed to get debug stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}


