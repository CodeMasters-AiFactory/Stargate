/**
 * Application Constants
 * Centralized constants to avoid magic numbers
 */

// Performance Constants
export const PERFORMANCE_CONSTANTS = {
  ABOVE_FOLD_THRESHOLD_PX: 800, // Pixels considered "above fold"
  TARGET_LOAD_TIME_MS: 2000, // 2 seconds target load time
  CRITICAL_CSS_THRESHOLD_KB: 14, // Critical CSS should be < 14KB
  IMAGE_MAX_WIDTH_PX: 1920, // Maximum image width
  IMAGE_QUALITY: 85, // Image compression quality (0-100)
} as const;

// Rate Limiting Constants
export const RATE_LIMIT_CONSTANTS = {
  STANDARD_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  STANDARD_MAX_REQUESTS: 100,
  STRICT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  STRICT_MAX_REQUESTS: 5, // For expensive operations
  GENEROUS_WINDOW_MS: 60 * 60 * 1000, // 1 hour
  GENEROUS_MAX_REQUESTS: 1000,
} as const;

// Collaboration Constants
export const COLLABORATION_CONSTANTS = {
  LOCK_TIMEOUT_MS: 5000, // 5 seconds lock timeout
  CURSOR_UPDATE_THROTTLE_MS: 100, // Throttle cursor updates
  HEARTBEAT_INTERVAL_MS: 30000, // 30 seconds heartbeat
} as const;

// Content Mining Constants
export const CONTENT_MINING_CONSTANTS = {
  RATE_LIMIT_DELAY_MS: 2000, // 2 seconds between requests
  MAX_COMPETITORS: 10, // Maximum competitors to analyze
  MAX_KEYWORDS: 15, // Maximum keywords to extract
  MAX_SERVICES: 10, // Maximum services to extract
} as const;

// File Size Limits
export const FILE_SIZE_LIMITS = {
  AUDIO_MAX_MB: 10,
  IMAGE_MAX_MB: 10,
  VIDEO_MAX_MB: 50,
  JSON_MAX_MB: 5,
} as const;

