import fs from 'fs';
import path from 'path';
import { getErrorMessage, logError } from '../utils/errorHandler';

interface LogEntry {
  timestamp: string;
  stage: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  data?: any;
  error?: {
    message: string;
    stack?: string;
    details?: any;
  };
}

class InvestigationLogger {
  private logDir: string;
  private sessionId: string;
  private stageLogs: Map<string, LogEntry[]> = new Map();
  private logStreams: Map<string, fs.WriteStream> = new Map();

  constructor(sessionId?: string) {
    this.sessionId = sessionId || `investigation-${Date.now()}`;
    this.logDir = path.join(process.cwd(), 'logs', 'investigations', this.sessionId);
    
    // Create log directory if it doesn't exist
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
        console.log(`[InvestigationLogger] Created log directory: ${this.logDir}`);
      } else {
        console.log(`[InvestigationLogger] Using existing log directory: ${this.logDir}`);
      }
    } catch (error: unknown) {
      logError(error, 'InvestigationLogger - Create log directory');
      const errorMessage = getErrorMessage(error);
      console.error(`[InvestigationLogger] Attempted path: ${this.logDir}`);
      // Fall back to a safe location
      this.logDir = path.join(process.cwd(), 'logs', this.sessionId);
      try {
        fs.mkdirSync(this.logDir, { recursive: true });
        console.log(`[InvestigationLogger] Using fallback log directory: ${this.logDir}`);
      } catch (fallbackError: unknown) {
        logError(fallbackError, 'InvestigationLogger - Fallback directory');
      }
    }
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = entry.level.toUpperCase().padEnd(5);
    const stage = entry.stage.padEnd(20);
    let logLine = `[${timestamp}] [${level}] [${stage}] ${entry.message}`;
    
    if (entry.data) {
      logLine += `\n  Data: ${JSON.stringify(entry.data, null, 2)}`;
    }
    
    if (entry.error) {
      logLine += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack) {
        logLine += `\n  Stack: ${entry.error.stack}`;
      }
      if (entry.error.details) {
        logLine += `\n  Details: ${JSON.stringify(entry.error.details, null, 2)}`;
      }
    }
    
    return logLine + '\n';
  }

  private writeToFile(stage: string, entry: LogEntry) {
    try {
      const stageFile = path.join(this.logDir, `${stage}.log`);
      
      // Get or create stream for this stage
      if (!this.logStreams.has(stage)) {
        try {
          const stream = fs.createWriteStream(stageFile, { flags: 'a' });
          this.logStreams.set(stage, stream);
        } catch (streamError: unknown) {
          logError(streamError, `InvestigationLogger - Create stream ${stage}`);
          // Continue without file logging
          return;
        }
      }
      
      const stream = this.logStreams.get(stage);
      if (!stream) {
        // Stream creation failed, skip file write
        return;
      }
      
      try {
        const logLine = this.formatLogEntry(entry);
        stream.write(logLine);
      } catch (writeError: unknown) {
        logError(writeError, `InvestigationLogger - Write ${stage}.log`);
        // Continue - don't throw
      }
    } catch (error: unknown) {
      logError(error, `InvestigationLogger - writeToFile ${stage}`);
      // Don't throw - continue execution
    }
    
    // Always write to console (even if file write fails)
    try {
      const consolePrefix = `[${entry.timestamp}] [${stage.toUpperCase()}]`;
      switch (entry.level) {
        case 'error':
          console.error(`${consolePrefix} ❌ ${entry.message}`, entry.error || entry.data || '');
          break;
        case 'warn':
          console.warn(`${consolePrefix} ⚠️ ${entry.message}`, entry.data || '');
          break;
        case 'success':
          console.log(`${consolePrefix} ✅ ${entry.message}`, entry.data || '');
          break;
        default:
          console.log(`${consolePrefix} ℹ️ ${entry.message}`, entry.data || '');
      }
    } catch (consoleError: unknown) {
      // Even console logging failed, but we can't do anything about it
      // Just continue silently - don't log to avoid infinite loops
    }
  }

  log(stage: string, level: LogEntry['level'], message: string, data?: any) {
    try {
      const entry: LogEntry = {
        timestamp: this.getTimestamp(),
        stage,
        level,
        message,
        data,
      };
      
      // Store in memory
      try {
        if (!this.stageLogs.has(stage)) {
          this.stageLogs.set(stage, []);
        }
        this.stageLogs.get(stage)!.push(entry);
      } catch (memoryError: unknown) {
        logError(memoryError, 'InvestigationLogger - Store in memory');
        // Continue - don't throw
      }
      
      // Write to file (non-blocking)
      this.writeToFile(stage, entry);
    } catch (error: unknown) {
      // Logger should never throw - just log to console and continue
      logError(error, 'InvestigationLogger - log()');
    }
  }

  info(stage: string, message: string, data?: any) {
    try {
      this.log(stage, 'info', message, data);
    } catch (e) {
      // Silently fail - don't break investigation
    }
  }

  success(stage: string, message: string, data?: any) {
    try {
      this.log(stage, 'success', message, data);
    } catch (e) {
      // Silently fail - don't break investigation
    }
  }

  warn(stage: string, message: string, data?: any) {
    try {
      this.log(stage, 'warn', message, data);
    } catch (e) {
      // Silently fail - don't break investigation
    }
  }

  error(stage: string, message: string, error?: Error | any, details?: any) {
    try {
      const entry: LogEntry = {
        timestamp: this.getTimestamp(),
        stage,
        level: 'error',
        message,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          details,
        } : {
          message: String(error || 'Unknown error'),
          details,
        },
      };
      
      // Store in memory
      if (!this.stageLogs.has(stage)) {
        this.stageLogs.set(stage, []);
      }
      this.stageLogs.get(stage)!.push(entry);
      
      // Write to file
      this.writeToFile(stage, entry);
    } catch (e) {
      // Silently fail - don't break investigation
    }
  }

  // Log progress callback attempts
  logProgress(stage: string, progress: number, message: string, success: boolean, error?: Error) {
    if (success) {
      this.success(stage, `Progress update sent: ${progress}% - ${message}`);
    } else {
      this.error(stage, `Progress update FAILED: ${progress}% - ${message}`, error);
    }
  }

  // Get all logs for a stage
  getStageLogs(stage: string): LogEntry[] {
    return this.stageLogs.get(stage) || [];
  }

  // Get summary of all stages
  getSummary(): { stage: string; entries: number; errors: number; lastEntry?: LogEntry }[] {
    const summary: { stage: string; entries: number; errors: number; lastEntry?: LogEntry }[] = [];
    
    for (const [stage, entries] of this.stageLogs.entries()) {
      const errors = entries.filter(e => e.level === 'error').length;
      summary.push({
        stage,
        entries: entries.length,
        errors,
        lastEntry: entries[entries.length - 1],
      });
    }
    
    return summary;
  }

  // Close all log streams
  close() {
    try {
      for (const stream of this.logStreams.values()) {
        try {
          stream.end();
        } catch (streamError: unknown) {
          logError(streamError, 'InvestigationLogger - Close stream');
        }
      }
      this.logStreams.clear();
      
      // Write summary file
      try {
        const summaryFile = path.join(this.logDir, 'summary.json');
        const summary = {
          sessionId: this.sessionId,
          startTime: this.stageLogs.size > 0 ? this.stageLogs.values().next().value[0]?.timestamp : null,
          endTime: this.getTimestamp(),
          summary: this.getSummary(),
          logDirectory: this.logDir,
        };
        
        fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
        console.log(`[InvestigationLogger] 📝 Logs saved to: ${this.logDir}`);
      } catch (summaryError: unknown) {
        logError(summaryError, 'InvestigationLogger - Write summary');
      }
    } catch (error: unknown) {
      logError(error, 'InvestigationLogger - close()');
      // Don't throw - logger should never break execution
    }
  }

  // Get log directory path
  getLogDirectory(): string {
    return this.logDir;
  }
}

// Create a singleton instance per investigation
const loggers = new Map<string, InvestigationLogger>();

export function getInvestigationLogger(sessionId?: string): InvestigationLogger {
  const id = sessionId || `investigation-${Date.now()}`;
  
  if (!loggers.has(id)) {
    loggers.set(id, new InvestigationLogger(id));
  }
  
  return loggers.get(id)!;
}

export function closeInvestigationLogger(sessionId: string) {
  const logger = loggers.get(sessionId);
  if (logger) {
    logger.close();
    loggers.delete(sessionId);
  }
}

export { InvestigationLogger };

