/**
 * Error Handler Utility
 * Provides type-safe error handling helpers
 */

/**
 * Extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Unknown error';
}

/**
 * Extract error stack from unknown error type
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

/**
 * Extract error code from unknown error type
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object') {
    if ('code' in error) {
      return String(error.code);
    }
    if ('status' in error) {
      return String(error.status);
    }
    if ('statusCode' in error) {
      return String(error.statusCode);
    }
  }
  return undefined;
}

/**
 * Type guard to check if error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if error has a code property
 */
export function hasErrorCode(error: unknown): error is { code: string | number } {
  return error !== null && typeof error === 'object' && 'code' in error;
}

/**
 * Safely log error with full context
 */
export function logError(error: unknown, context?: string, additionalData?: Record<string, unknown>): void {
  const message = getErrorMessage(error);
  const stack = getErrorStack(error);
  const code = getErrorCode(error);
  
  const prefix = context ? `[${context}]` : '[Error]';
  const dataStr = additionalData ? ` | Data: ${JSON.stringify(additionalData)}` : '';
  
  console.error(`${prefix} ${message}${dataStr}`);
  
  if (code) {
    console.error(`${prefix} Code: ${code}`);
  }
  
  if (stack) {
    console.error(`${prefix} Stack:`, stack);
  }
}

