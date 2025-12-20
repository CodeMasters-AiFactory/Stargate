/**
 * Debug Logger
 * Phase 4 Debug Mode: Direct file logging for runtime debugging
 */

import fs from 'fs';
import path from 'path';

const LOG_FILE_PATH = path.resolve(process.cwd(), '.cursor', 'debug.log');
const LOG_DIR = path.dirname(LOG_FILE_PATH);

export interface DebugLogEntry {
  id?: string;
  timestamp: number;
  location: string;
  message: string;
  data?: any;
  sessionId?: string;
  runId?: string;
  hypothesisId?: string;
}

/**
 * Write debug log entry to file (NDJSON format)
 */
export function debugLog(entry: DebugLogEntry): void {
  try {
    // Ensure log directory exists
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }

    // Create NDJSON entry
    const logEntry = {
      id: entry.id || `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: entry.timestamp || Date.now(),
      location: entry.location,
      message: entry.message,
      data: entry.data || {},
      sessionId: entry.sessionId || 'debug-session',
      runId: entry.runId || 'run1',
      hypothesisId: entry.hypothesisId,
    };

    // Append to log file (NDJSON format - one JSON object per line)
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(LOG_FILE_PATH, logLine, 'utf8');
  } catch (error) {
    // Silently fail if logging fails - don't break the application
    console.error('[Debug Logger] Failed to write log:', error);
  }
}

/**
 * Clear debug log file
 */
export function clearDebugLog(): void {
  try {
    if (fs.existsSync(LOG_FILE_PATH)) {
      fs.unlinkSync(LOG_FILE_PATH);
    }
  } catch (error) {
    // Ignore errors when clearing
  }
}

