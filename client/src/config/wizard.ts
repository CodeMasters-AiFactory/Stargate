/**
 * Wizard Configuration Constants
 * Centralized configuration for the website builder wizard
 *
 * All timeout values, delays, and configurable settings should be defined here
 * to make the wizard behavior easily adjustable without hunting through code.
 */

// ============================================================================
// TIMING CONFIGURATION
// ============================================================================

/**
 * Autosave debounce delay in milliseconds
 * How long to wait after the last change before saving to localStorage
 */
export const WIZARD_AUTOSAVE_DEBOUNCE_MS = 1000;

/**
 * Auto-advance delay in milliseconds
 * How long to wait before automatically advancing to the next step
 */
export const WIZARD_AUTO_ADVANCE_DELAY_MS = 5000;

/**
 * Animation transition delay in milliseconds
 * Standard delay for UI transitions and animations
 */
export const WIZARD_TRANSITION_DELAY_MS = 300;

/**
 * Regeneration check delay in milliseconds
 * How long to wait before checking regeneration status
 */
export const WIZARD_REGENERATION_CHECK_DELAY_MS = 2000;

/**
 * Generation timeout in milliseconds
 * Maximum time to wait for website generation to complete
 * Default: 5 minutes
 */
export const WIZARD_GENERATION_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * API request timeout in milliseconds
 * Default timeout for API requests
 */
export const WIZARD_API_TIMEOUT_MS = 30000;

/**
 * SSE connection timeout in milliseconds
 * Timeout for Server-Sent Events connections
 */
export const WIZARD_SSE_TIMEOUT_MS = 60000;

/**
 * Retry delay base in milliseconds
 * Base delay for exponential backoff retry logic
 */
export const WIZARD_RETRY_BASE_DELAY_MS = 1000;

/**
 * Maximum retry attempts
 * Maximum number of times to retry failed operations
 */
export const WIZARD_MAX_RETRY_ATTEMPTS = 3;

// ============================================================================
// STORAGE KEYS
// ============================================================================

/**
 * LocalStorage key for wizard state
 */
export const WIZARD_STORAGE_KEY = 'stargate-wizard-state';

/**
 * LocalStorage key for wizard checklist
 */
export const WIZARD_CHECKLIST_STORAGE_KEY = 'stargate-wizard-checklist';

/**
 * LocalStorage key for language preference
 */
export const WIZARD_LANGUAGE_STORAGE_KEY = 'stargate-wizard-language';

/**
 * LocalStorage key for generated website
 */
export const WIZARD_GENERATED_WEBSITE_KEY = 'merlin_generated_website';

// ============================================================================
// UI CONFIGURATION
// ============================================================================

/**
 * Default screen sizes for preview
 */
export const WIZARD_SCREEN_SIZES = {
  desktop: { width: 1920, height: 1080, label: 'Desktop' },
  laptop: { width: 1366, height: 768, label: 'Laptop' },
  tablet: { width: 768, height: 1024, label: 'Tablet' },
  mobile: { width: 375, height: 812, label: 'Mobile' },
} as const;

export type ScreenSizeKey = keyof typeof WIZARD_SCREEN_SIZES;

/**
 * Debug mode - enables verbose logging
 * Automatically enabled in development
 */
export const WIZARD_DEBUG_MODE = process.env.NODE_ENV === 'development';

// ============================================================================
// GENERATION CONFIGURATION
// ============================================================================

/**
 * Default building progress blocks
 * These are the stages shown during website generation
 */
export const WIZARD_GENERATION_BLOCKS = [
  { name: 'Layout Structure', status: 'pending' as const },
  { name: 'Design System', status: 'pending' as const },
  { name: 'Content Generation', status: 'pending' as const },
  { name: 'Image Selection', status: 'pending' as const },
  { name: 'SEO Optimization', status: 'pending' as const },
  { name: 'Final Assembly', status: 'pending' as const },
] as const;

export type GenerationBlockStatus = 'pending' | 'in_progress' | 'complete' | 'error';

export interface GenerationBlock {
  name: string;
  status: GenerationBlockStatus;
}

// ============================================================================
// VALIDATION CONFIGURATION
// ============================================================================

/**
 * Maximum file size for imports in bytes
 * Default: 5MB
 */
export const WIZARD_MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed file types for import
 */
export const WIZARD_ALLOWED_IMPORT_TYPES = ['.json', 'application/json'];

/**
 * URL validation pattern
 */
export const WIZARD_URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

/**
 * Email validation pattern
 */
export const WIZARD_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation pattern (flexible international format)
 */
export const WIZARD_PHONE_PATTERN = /^[+]?[\d\s\-().]{7,20}$/;

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * API base URL - uses relative paths by default
 */
export const WIZARD_API_BASE = '/api';

/**
 * Website builder API endpoints
 */
export const WIZARD_API_ENDPOINTS = {
  sessions: `${WIZARD_API_BASE}/website-builder/sessions`,
  drafts: `${WIZARD_API_BASE}/website-builder/drafts`,
  generate: `${WIZARD_API_BASE}/website-builder/generate`,
  generateV5: `${WIZARD_API_BASE}/website-builder/generate-v5`,
  investigate: `${WIZARD_API_BASE}/website-builder/investigate`,
  investigateMinimal: `${WIZARD_API_BASE}/website-builder/investigate-minimal`,
  analyze: `${WIZARD_API_BASE}/website-builder/analyze`,
  download: `${WIZARD_API_BASE}/website-builder/download`,
  projects: `${WIZARD_API_BASE}/website-builder/projects`,
  phaseReport: `${WIZARD_API_BASE}/website-builder/phase-report`,
  chatbot: `${WIZARD_API_BASE}/wizard-chatbot/message`,
  chatbotSuggestions: `${WIZARD_API_BASE}/wizard-chatbot/suggestions`,
  templates: `${WIZARD_API_BASE}/templates`,
  leonardoUsage: `${WIZARD_API_BASE}/leonardo/usage`,
  leonardoGenerate: `${WIZARD_API_BASE}/leonardo/generate`,
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/**
 * User-friendly error messages
 */
export const WIZARD_ERROR_MESSAGES = {
  // Network errors
  networkError: 'Unable to connect to the server. Please check your internet connection and try again.',
  timeout: 'The request took too long to complete. Please try again.',
  serverError: 'Something went wrong on our end. Please try again in a moment.',

  // Validation errors
  invalidEmail: 'Please enter a valid email address.',
  invalidUrl: 'Please enter a valid URL (e.g., https://example.com).',
  invalidPhone: 'Please enter a valid phone number.',
  requiredField: 'This field is required.',
  fileTooLarge: `File size exceeds the maximum allowed size of ${WIZARD_MAX_IMPORT_FILE_SIZE / 1024 / 1024}MB.`,
  invalidFileType: 'Please select a valid JSON file.',

  // Generation errors
  generationFailed: 'Website generation failed. Please try again.',
  generationTimeout: 'Website generation is taking longer than expected. Please wait or try again.',

  // Import/Export errors
  importFailed: 'Failed to import configuration. Please check the file format.',
  exportFailed: 'Failed to export configuration. Please try again.',

  // State errors
  loadStateFailed: 'Failed to load your previous progress. Starting fresh.',
  saveStateFailed: 'Failed to save your progress. Your work may not be preserved.',
} as const;

// ============================================================================
// RETRY CONFIGURATION
// ============================================================================

/**
 * Configuration for retry logic with exponential backoff
 */
export const WIZARD_RETRY_CONFIG = {
  maxAttempts: WIZARD_MAX_RETRY_ATTEMPTS,
  baseDelay: WIZARD_RETRY_BASE_DELAY_MS,
  maxDelay: 10000, // Maximum delay between retries
  backoffMultiplier: 2, // Exponential backoff multiplier
  retryableStatusCodes: [408, 429, 500, 502, 503, 504], // HTTP status codes that should trigger retry
} as const;

/**
 * Calculate delay for retry attempt using exponential backoff
 * @param attempt - Current attempt number (0-indexed)
 * @returns Delay in milliseconds
 */
export function calculateRetryDelay(attempt: number): number {
  const delay = WIZARD_RETRY_CONFIG.baseDelay * Math.pow(WIZARD_RETRY_CONFIG.backoffMultiplier, attempt);
  return Math.min(delay, WIZARD_RETRY_CONFIG.maxDelay);
}

/**
 * Check if an error is retryable
 * @param status - HTTP status code
 * @returns Whether the request should be retried
 */
export function isRetryableError(status: number): boolean {
  return WIZARD_RETRY_CONFIG.retryableStatusCodes.includes(status);
}
