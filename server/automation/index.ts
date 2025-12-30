/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTONOMOUS MERLIN TESTER - MODULE EXPORTS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Central export point for all autonomous testing components.
 */

// Core types
export * from './types';

// Main orchestrator
export { AutonomousTester } from './AutonomousTester';

// Playwright browser automation
export { PlaywrightExecutor } from './PlaywrightExecutor';

// Learning and self-improvement
export { LearningEngine } from './LearningEngine';

// Command generation (50-100 commands per website)
export { CommandGenerator, INDUSTRIES, TEMPLATES } from './CommandGenerator';

// Quality reporting and logging
export { QualityReporter } from './QualityReporter';

// Daemon for background operation
export {
  runSession,
  startDaemon,
  shutdown,
  daemonState,
  DEFAULT_SESSION_CONFIG,
} from './daemon';
