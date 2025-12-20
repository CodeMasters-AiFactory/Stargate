/**
 * Timeout Utility
 * Provides timeout wrappers for async operations
 */

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
export function createTimeoutPromise(timeoutMs: number, message = 'Operation timed out'): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${message} after ${timeoutMs}ms`));
    }, timeoutMs);
  });
}

/**
 * Race an async operation against a timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    createTimeoutPromise(timeoutMs, errorMessage),
  ]);
}

/**
 * Create a timeout middleware for Express routes
 */
export function timeoutMiddleware(timeoutMs: number = 30000) {
  return (req: any, res: any, next: any) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({ error: 'Request timeout' });
        res.end();
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  };
}

