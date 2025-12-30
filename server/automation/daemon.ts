/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTONOMOUS TESTER DAEMON - Background Service
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Runs continuously in the background to:
 * 1. Execute scheduled test sessions
 * 2. Handle MCP tool calls via the Playwright MCP server
 * 3. Store learnings in the Knowledge Graph MCP
 * 4. Self-heal on errors
 * 5. Generate reports
 *
 * Start with: node server/automation/daemon.js
 * Or via Windows Task Scheduler for auto-start
 */

import * as fs from 'fs';
import * as path from 'path';
import { AutonomousTester } from './AutonomousTester';
import { QualityReporter } from './QualityReporter';
import { SessionConfig, SessionReport } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const DAEMON_CONFIG = {
  pidFile: '.cursor/autonomous-daemon.pid',
  logFile: '.cursor/autonomous-daemon.log',
  stateFile: '.cursor/autonomous-state.json',
  checkpointDir: '.cursor/autonomous-checkpoints',
  maxSessionTimeMs: 4 * 60 * 60 * 1000, // 4 hours max per session
  maxMemoryMB: 4096, // 4GB memory limit
  healthCheckIntervalMs: 60000, // 1 minute
  retryDelayMs: 5000,
  maxConsecutiveErrors: 5,
};

// Default session configuration
const DEFAULT_SESSION_CONFIG: SessionConfig = {
  websiteCount: 10,
  useRealImages: false, // Placeholders only to save Leonardo AI costs
  randomIndustries: true,
  maxRetries: 3,
  timeoutPerWebsite: 5 * 60 * 1000, // 5 minutes per website
  headless: true,
  saveScreenshots: true,
  qualityThreshold: 7.5,
};

// ═══════════════════════════════════════════════════════════════════════════════
// DAEMON STATE
// ═══════════════════════════════════════════════════════════════════════════════

interface DaemonState {
  status: 'idle' | 'running' | 'paused' | 'error';
  currentSessionId: string | null;
  lastSessionId: string | null;
  lastSessionScore: number;
  totalSessions: number;
  totalWebsites: number;
  startedAt: Date | null;
  lastActivityAt: Date;
  consecutiveErrors: number;
  history: Array<{
    sessionId: string;
    score: number;
    timestamp: Date;
  }>;
}

let daemonState: DaemonState = {
  status: 'idle',
  currentSessionId: null,
  lastSessionId: null,
  lastSessionScore: 0,
  totalSessions: 0,
  totalWebsites: 0,
  startedAt: null,
  lastActivityAt: new Date(),
  consecutiveErrors: 0,
  history: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

function log(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string): void {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level}] ${message}`;

  console.log(logLine);

  // Also append to log file
  try {
    fs.appendFileSync(DAEMON_CONFIG.logFile, logLine + '\n');
  } catch {
    // Ignore log file errors
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

function saveState(): void {
  try {
    fs.writeFileSync(
      DAEMON_CONFIG.stateFile,
      JSON.stringify(daemonState, null, 2)
    );
  } catch (err) {
    log('ERROR', `Failed to save state: ${err}`);
  }
}

function loadState(): void {
  try {
    if (fs.existsSync(DAEMON_CONFIG.stateFile)) {
      const data = fs.readFileSync(DAEMON_CONFIG.stateFile, 'utf-8');
      const loaded = JSON.parse(data);
      daemonState = {
        ...daemonState,
        ...loaded,
        lastActivityAt: new Date(loaded.lastActivityAt),
        startedAt: loaded.startedAt ? new Date(loaded.startedAt) : null,
        history: loaded.history.map((h: DaemonState['history'][0]) => ({
          ...h,
          timestamp: new Date(h.timestamp),
        })),
      };
      log('INFO', 'Loaded previous state');
    }
  } catch (err) {
    log('WARN', `Failed to load state, starting fresh: ${err}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PID FILE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

function writePidFile(): void {
  fs.writeFileSync(DAEMON_CONFIG.pidFile, process.pid.toString());
  log('INFO', `PID file written: ${process.pid}`);
}

function removePidFile(): void {
  try {
    if (fs.existsSync(DAEMON_CONFIG.pidFile)) {
      fs.unlinkSync(DAEMON_CONFIG.pidFile);
    }
  } catch {
    // Ignore
  }
}

function checkExistingDaemon(): boolean {
  if (fs.existsSync(DAEMON_CONFIG.pidFile)) {
    const pid = parseInt(fs.readFileSync(DAEMON_CONFIG.pidFile, 'utf-8'));

    // Check if process is still running (Windows compatible)
    try {
      process.kill(pid, 0);
      log('ERROR', `Daemon already running with PID ${pid}`);
      return true;
    } catch {
      // Process not running, safe to start
      log('INFO', `Stale PID file found, removing`);
      removePidFile();
    }
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH MONITORING
// ═══════════════════════════════════════════════════════════════════════════════

function checkHealth(): void {
  // Check memory usage
  const memUsage = process.memoryUsage();
  const memMB = memUsage.heapUsed / 1024 / 1024;

  if (memMB > DAEMON_CONFIG.maxMemoryMB) {
    log('WARN', `Memory usage high: ${memMB.toFixed(0)}MB. Triggering garbage collection.`);
    if (global.gc) {
      global.gc();
    }
  }

  // Update activity timestamp
  daemonState.lastActivityAt = new Date();
  saveState();

  log('DEBUG', `Health check OK. Memory: ${memMB.toFixed(0)}MB, Status: ${daemonState.status}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SESSION RUNNER
// ═══════════════════════════════════════════════════════════════════════════════

async function runSession(config: SessionConfig = DEFAULT_SESSION_CONFIG): Promise<SessionReport | null> {
  if (daemonState.status === 'running') {
    log('WARN', 'Session already running, skipping');
    return null;
  }

  const sessionId = `session_${Date.now()}`;
  daemonState.status = 'running';
  daemonState.currentSessionId = sessionId;
  daemonState.startedAt = new Date();
  saveState();

  log('INFO', `Starting session ${sessionId} with ${config.websiteCount} websites`);

  try {
    // Create tester instance
    const tester = new AutonomousTester(config);

    // Run the session
    const report = await tester.runSession();

    // Update state
    daemonState.status = 'idle';
    daemonState.currentSessionId = null;
    daemonState.lastSessionId = sessionId;
    daemonState.lastSessionScore = report.averageScore;
    daemonState.totalSessions++;
    daemonState.totalWebsites += report.totalWebsites;
    daemonState.consecutiveErrors = 0;
    daemonState.history.push({
      sessionId,
      score: report.averageScore,
      timestamp: new Date(),
    });

    // Keep only last 50 sessions in history
    if (daemonState.history.length > 50) {
      daemonState.history = daemonState.history.slice(-50);
    }

    saveState();

    log('INFO', `Session ${sessionId} completed. Average score: ${report.averageScore.toFixed(2)}`);

    return report;
  } catch (err) {
    daemonState.status = 'error';
    daemonState.consecutiveErrors++;
    saveState();

    log('ERROR', `Session ${sessionId} failed: ${err}`);

    if (daemonState.consecutiveErrors >= DAEMON_CONFIG.maxConsecutiveErrors) {
      log('ERROR', `Max consecutive errors reached (${DAEMON_CONFIG.maxConsecutiveErrors}). Stopping daemon.`);
      await shutdown();
    }

    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMAND LINE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

async function handleCommand(command: string, args: string[]): Promise<void> {
  switch (command) {
    case 'start':
      await startDaemon();
      break;

    case 'stop':
      await shutdown();
      break;

    case 'status':
      printStatus();
      break;

    case 'run':
      const count = parseInt(args[0]) || 10;
      await runSession({ ...DEFAULT_SESSION_CONFIG, websiteCount: count });
      break;

    case 'history':
      printHistory();
      break;

    case 'trends':
      printTrends();
      break;

    case 'cleanup':
      QualityReporter.cleanupOldLogs();
      log('INFO', 'Cleanup completed');
      break;

    case 'help':
    default:
      printHelp();
      break;
  }
}

function printStatus(): void {
  loadState();

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║           AUTONOMOUS MERLIN TESTER - STATUS                      ║
╠══════════════════════════════════════════════════════════════════╣
║ Status:              ${daemonState.status.padEnd(42)}║
║ Current Session:     ${(daemonState.currentSessionId || 'None').padEnd(42)}║
║ Last Session:        ${(daemonState.lastSessionId || 'None').padEnd(42)}║
║ Last Score:          ${daemonState.lastSessionScore.toFixed(2).padEnd(42)}║
║ Total Sessions:      ${daemonState.totalSessions.toString().padEnd(42)}║
║ Total Websites:      ${daemonState.totalWebsites.toString().padEnd(42)}║
║ Consecutive Errors:  ${daemonState.consecutiveErrors.toString().padEnd(42)}║
║ Last Activity:       ${daemonState.lastActivityAt.toISOString().padEnd(42)}║
╚══════════════════════════════════════════════════════════════════╝
  `);
}

function printHistory(): void {
  loadState();

  console.log('\n📊 SESSION HISTORY (Last 10)\n');
  console.log('Session ID                    | Score  | Timestamp');
  console.log('------------------------------|--------|------------------------');

  daemonState.history.slice(-10).forEach(h => {
    console.log(`${h.sessionId.padEnd(30)}| ${h.score.toFixed(2).padEnd(7)}| ${h.timestamp.toISOString()}`);
  });

  console.log('');
}

function printTrends(): void {
  const trends = QualityReporter.analyzeTrends();

  console.log('\n📈 TREND ANALYSIS\n');
  console.log(`Trend: ${trends.trend.toUpperCase()}`);
  console.log(`Average Improvement: ${(trends.averageImprovement * 100).toFixed(1)}% per session`);
  console.log(`\nScores: ${trends.scores.map(s => s.toFixed(1)).join(' → ')}`);
  console.log(`\nPredictions:`);
  trends.predictions.forEach(p => console.log(`  - ${p}`));
  console.log('');
}

function printHelp(): void {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║           AUTONOMOUS MERLIN TESTER - HELP                        ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  COMMANDS:                                                       ║
║                                                                  ║
║    start        Start the daemon in background                   ║
║    stop         Stop the running daemon                          ║
║    status       Show current daemon status                       ║
║    run [n]      Run a session with n websites (default: 10)      ║
║    history      Show session history                             ║
║    trends       Show performance trends                          ║
║    cleanup      Clean up old log files                           ║
║    help         Show this help message                           ║
║                                                                  ║
║  USAGE:                                                          ║
║                                                                  ║
║    node daemon.js start     - Start continuous operation         ║
║    node daemon.js run 5     - Run single session with 5 sites    ║
║    node daemon.js status    - Check if daemon is running         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DAEMON LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════════

async function startDaemon(): Promise<void> {
  // Check for existing daemon
  if (checkExistingDaemon()) {
    process.exit(1);
  }

  // Ensure directories exist
  const dirs = [
    path.dirname(DAEMON_CONFIG.pidFile),
    DAEMON_CONFIG.checkpointDir,
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Write PID file
  writePidFile();

  // Load previous state
  loadState();

  log('INFO', '═══════════════════════════════════════════════════════════════');
  log('INFO', '  AUTONOMOUS MERLIN TESTER - DAEMON STARTED');
  log('INFO', '═══════════════════════════════════════════════════════════════');
  log('INFO', `PID: ${process.pid}`);
  log('INFO', `Log file: ${DAEMON_CONFIG.logFile}`);
  log('INFO', `State file: ${DAEMON_CONFIG.stateFile}`);

  // Set up signal handlers
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('uncaughtException', (err) => {
    log('ERROR', `Uncaught exception: ${err.message}`);
    log('ERROR', err.stack || '');
  });
  process.on('unhandledRejection', (reason) => {
    log('ERROR', `Unhandled rejection: ${reason}`);
  });

  // Start health check interval
  setInterval(checkHealth, DAEMON_CONFIG.healthCheckIntervalMs);

  log('INFO', 'Daemon ready. Waiting for commands...');
  log('INFO', 'Run "node daemon.js run" to start a test session');
}

async function shutdown(): Promise<void> {
  log('INFO', 'Shutting down daemon...');

  daemonState.status = 'idle';
  saveState();

  removePidFile();

  log('INFO', 'Daemon stopped');
  process.exit(0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const commandArgs = args.slice(1);

  await handleCommand(command, commandArgs);
}

// Run if executed directly
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

export {
  runSession,
  startDaemon,
  shutdown,
  daemonState,
  DEFAULT_SESSION_CONFIG,
};
