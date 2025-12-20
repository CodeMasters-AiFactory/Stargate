/**
 * Fetch with Retry and AbortController Utilities
 *
 * Provides robust fetch operations with:
 * - Automatic retry with exponential backoff
 * - AbortController support for cancellation
 * - Timeout handling
 * - Proper error messages
 */

import {
  WIZARD_API_TIMEOUT_MS,
  WIZARD_RETRY_CONFIG,
  WIZARD_ERROR_MESSAGES,
  calculateRetryDelay,
  isRetryableError,
} from '@/config/wizard';

// ============================================================================
// TYPES
// ============================================================================

export interface FetchWithRetryOptions extends RequestInit {
  /**
   * Timeout in milliseconds (default: WIZARD_API_TIMEOUT_MS)
   */
  timeout?: number;

  /**
   * Maximum retry attempts (default: WIZARD_MAX_RETRY_ATTEMPTS)
   */
  maxRetries?: number;

  /**
   * External AbortController signal for cancellation
   */
  signal?: AbortSignal;

  /**
   * Callback for retry attempts
   */
  onRetry?: (attempt: number, error: Error) => void;

  /**
   * Whether to retry on network errors (default: true)
   */
  retryOnNetworkError?: boolean;
}

export interface FetchResult<T> {
  data: T | null;
  error: string | null;
  status: number;
  ok: boolean;
  aborted: boolean;
}

export class FetchError extends Error {
  status: number;
  retryable: boolean;

  constructor(message: string, status: number, retryable: boolean = false) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    this.retryable = retryable;
  }
}

// ============================================================================
// ABORT CONTROLLER UTILITIES
// ============================================================================

/**
 * Create an AbortController with timeout
 * @param timeoutMs - Timeout in milliseconds
 * @returns Object with controller and cleanup function
 */
export function createAbortControllerWithTimeout(timeoutMs: number = WIZARD_API_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error('Request timeout'));
  }, timeoutMs);

  return {
    controller,
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
    },
    abort: (reason?: string) => {
      clearTimeout(timeoutId);
      controller.abort(new Error(reason || 'Request aborted'));
    },
  };
}

/**
 * Combine multiple AbortSignals into one
 * If any signal aborts, the combined signal will abort
 */
export function combineAbortSignals(...signals: (AbortSignal | undefined)[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (!signal) continue;

    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }

    signal.addEventListener('abort', () => {
      controller.abort(signal.reason);
    }, { once: true });
  }

  return controller.signal;
}

// ============================================================================
// FETCH WITH RETRY
// ============================================================================

/**
 * Fetch with automatic retry and timeout support
 *
 * @param url - URL to fetch
 * @param options - Fetch options with retry configuration
 * @returns Promise resolving to FetchResult
 *
 * @example
 * ```ts
 * const { data, error, aborted } = await fetchWithRetry<MyType>('/api/data', {
 *   method: 'POST',
 *   body: JSON.stringify({ key: 'value' }),
 *   maxRetries: 3,
 *   timeout: 5000,
 * });
 *
 * if (aborted) {
 *   console.log('Request was cancelled');
 * } else if (error) {
 *   console.error('Error:', error);
 * } else {
 *   console.log('Data:', data);
 * }
 * ```
 */
export async function fetchWithRetry<T = unknown>(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<FetchResult<T>> {
  const {
    timeout = WIZARD_API_TIMEOUT_MS,
    maxRetries = WIZARD_RETRY_CONFIG.maxAttempts,
    signal: externalSignal,
    onRetry,
    retryOnNetworkError = true,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;
  let lastStatus = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Create timeout controller for this attempt
    const { controller, signal: timeoutSignal, cleanup } = createAbortControllerWithTimeout(timeout);

    // Combine external signal with timeout signal
    const combinedSignal = externalSignal
      ? combineAbortSignals(externalSignal, timeoutSignal)
      : timeoutSignal;

    try {
      // Check if already aborted before making request
      if (externalSignal?.aborted) {
        cleanup();
        return {
          data: null,
          error: null,
          status: 0,
          ok: false,
          aborted: true,
        };
      }

      const response = await fetch(url, {
        ...fetchOptions,
        signal: combinedSignal,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      cleanup();
      lastStatus = response.status;

      // Check if response is ok
      if (!response.ok) {
        // Check if retryable
        if (isRetryableError(response.status) && attempt < maxRetries) {
          const delay = calculateRetryDelay(attempt);
          lastError = new FetchError(
            `HTTP ${response.status}`,
            response.status,
            true
          );

          onRetry?.(attempt + 1, lastError);

          await sleep(delay);
          continue;
        }

        // Not retryable, return error
        const errorBody = await response.text().catch(() => '');
        return {
          data: null,
          error: getErrorMessage(response.status, errorBody),
          status: response.status,
          ok: false,
          aborted: false,
        };
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      let data: T;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as unknown as T;
      }

      return {
        data,
        error: null,
        status: response.status,
        ok: true,
        aborted: false,
      };
    } catch (error) {
      cleanup();

      // Check if aborted
      if (error instanceof Error) {
        if (error.name === 'AbortError' || externalSignal?.aborted) {
          return {
            data: null,
            error: null,
            status: 0,
            ok: false,
            aborted: true,
          };
        }

        lastError = error;

        // Retry on network errors if enabled
        if (retryOnNetworkError && attempt < maxRetries) {
          const delay = calculateRetryDelay(attempt);
          onRetry?.(attempt + 1, error);
          await sleep(delay);
          continue;
        }
      }

      // Return network error
      return {
        data: null,
        error: WIZARD_ERROR_MESSAGES.networkError,
        status: 0,
        ok: false,
        aborted: false,
      };
    }
  }

  // All retries exhausted
  return {
    data: null,
    error: lastError?.message || WIZARD_ERROR_MESSAGES.serverError,
    status: lastStatus,
    ok: false,
    aborted: false,
  };
}

// ============================================================================
// SSE WITH ABORT SUPPORT
// ============================================================================

export interface SSEOptions {
  /**
   * Timeout for the SSE connection
   */
  timeout?: number;

  /**
   * External AbortController signal
   */
  signal?: AbortSignal;

  /**
   * Callback for each message
   */
  onMessage: (data: unknown) => void;

  /**
   * Callback for errors
   */
  onError?: (error: Error) => void;

  /**
   * Callback when connection is established
   */
  onOpen?: () => void;

  /**
   * Callback when connection is closed
   */
  onClose?: () => void;
}

/**
 * Create an SSE connection with abort support
 *
 * @param url - SSE endpoint URL
 * @param options - SSE options
 * @returns Cleanup function to close the connection
 *
 * @example
 * ```ts
 * const controller = new AbortController();
 *
 * const cleanup = createSSEConnection('/api/stream', {
 *   signal: controller.signal,
 *   onMessage: (data) => console.log('Message:', data),
 *   onError: (error) => console.error('Error:', error),
 * });
 *
 * // Later, to cancel:
 * controller.abort();
 * cleanup();
 * ```
 */
export function createSSEConnection(url: string, options: SSEOptions): () => void {
  const { timeout, signal, onMessage, onError, onOpen, onClose } = options;

  let eventSource: EventSource | null = null;
  let timeoutId: NodeJS.Timeout | null = null;
  let closed = false;

  const cleanup = () => {
    if (closed) return;
    closed = true;

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }

    onClose?.();
  };

  // Check if already aborted
  if (signal?.aborted) {
    onError?.(new Error('Connection aborted before starting'));
    return cleanup;
  }

  // Listen for abort signal
  signal?.addEventListener('abort', () => {
    cleanup();
    onError?.(new Error('Connection aborted'));
  }, { once: true });

  // Set timeout if specified
  if (timeout) {
    timeoutId = setTimeout(() => {
      cleanup();
      onError?.(new Error('Connection timeout'));
    }, timeout);
  }

  try {
    eventSource = new EventSource(url);

    eventSource.onopen = () => {
      onOpen?.();
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {
        // If not JSON, pass raw data
        onMessage(event.data);
      }
    };

    eventSource.onerror = (event) => {
      // EventSource errors don't provide much detail
      const error = new Error('SSE connection error');
      onError?.(error);

      // EventSource auto-reconnects, but we might want to stop
      if (eventSource?.readyState === EventSource.CLOSED) {
        cleanup();
      }
    };
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error('Failed to create SSE connection'));
    cleanup();
  }

  return cleanup;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get user-friendly error message from status code
 */
function getErrorMessage(status: number, body?: string): string {
  // Try to extract message from body
  if (body) {
    try {
      const parsed = JSON.parse(body);
      if (parsed.error) return parsed.error;
      if (parsed.message) return parsed.message;
    } catch {
      // Body is not JSON
    }
  }

  // Return appropriate message based on status
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Please log in to continue.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 408:
      return WIZARD_ERROR_MESSAGES.timeout;
    case 413:
      return WIZARD_ERROR_MESSAGES.fileTooLarge;
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return WIZARD_ERROR_MESSAGES.serverError;
    default:
      return `Request failed with status ${status}`;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * GET request with retry
 */
export async function getWithRetry<T = unknown>(
  url: string,
  options?: Omit<FetchWithRetryOptions, 'method' | 'body'>
): Promise<FetchResult<T>> {
  return fetchWithRetry<T>(url, { ...options, method: 'GET' });
}

/**
 * POST request with retry
 */
export async function postWithRetry<T = unknown>(
  url: string,
  body: unknown,
  options?: Omit<FetchWithRetryOptions, 'method' | 'body'>
): Promise<FetchResult<T>> {
  return fetchWithRetry<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * PUT request with retry
 */
export async function putWithRetry<T = unknown>(
  url: string,
  body: unknown,
  options?: Omit<FetchWithRetryOptions, 'method' | 'body'>
): Promise<FetchResult<T>> {
  return fetchWithRetry<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request with retry
 */
export async function deleteWithRetry<T = unknown>(
  url: string,
  options?: Omit<FetchWithRetryOptions, 'method'>
): Promise<FetchResult<T>> {
  return fetchWithRetry<T>(url, { ...options, method: 'DELETE' });
}
