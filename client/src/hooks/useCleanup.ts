/**
 * Cleanup and Memory Leak Prevention Hooks
 *
 * Provides utilities for:
 * - Safe setTimeout/setInterval with automatic cleanup
 * - AbortController management
 * - Mounted state tracking
 * - Debounce with cleanup
 */

import { useRef, useEffect, useCallback, useState } from 'react';

// ============================================================================
// MOUNTED STATE HOOK
// ============================================================================

/**
 * Track whether component is mounted
 * Useful for preventing state updates after unmount
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isMounted = useIsMounted();
 *
 *   useEffect(() => {
 *     fetchData().then(data => {
 *       if (isMounted()) {
 *         setData(data);
 *       }
 *     });
 *   }, []);
 * }
 * ```
 */
export function useIsMounted(): () => boolean {
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
}

// ============================================================================
// SAFE TIMEOUT HOOK
// ============================================================================

interface UseSafeTimeoutReturn {
  /**
   * Set a timeout that will be automatically cleared on unmount
   */
  setSafeTimeout: (callback: () => void, delay: number) => number;
  /**
   * Clear a specific timeout
   */
  clearSafeTimeout: (id: number) => void;
  /**
   * Clear all active timeouts
   */
  clearAllTimeouts: () => void;
}

/**
 * Safe setTimeout that automatically clears on unmount
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { setSafeTimeout } = useSafeTimeout();
 *
 *   const handleClick = () => {
 *     setSafeTimeout(() => {
 *       // This won't run if component unmounts
 *       doSomething();
 *     }, 1000);
 *   };
 * }
 * ```
 */
export function useSafeTimeout(): UseSafeTimeoutReturn {
  const timeoutIds = useRef<Set<number>>(new Set());
  const isMounted = useIsMounted();

  // Clear all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutIds.current.forEach((id) => {
        clearTimeout(id);
      });
      timeoutIds.current.clear();
    };
  }, []);

  const setSafeTimeout = useCallback(
    (callback: () => void, delay: number): number => {
      const id = window.setTimeout(() => {
        timeoutIds.current.delete(id);
        if (isMounted()) {
          callback();
        }
      }, delay);

      timeoutIds.current.add(id);
      return id;
    },
    [isMounted]
  );

  const clearSafeTimeout = useCallback((id: number) => {
    clearTimeout(id);
    timeoutIds.current.delete(id);
  }, []);

  const clearAllTimeouts = useCallback(() => {
    timeoutIds.current.forEach((id) => {
      clearTimeout(id);
    });
    timeoutIds.current.clear();
  }, []);

  return { setSafeTimeout, clearSafeTimeout, clearAllTimeouts };
}

// ============================================================================
// SAFE INTERVAL HOOK
// ============================================================================

interface UseSafeIntervalReturn {
  /**
   * Set an interval that will be automatically cleared on unmount
   */
  setSafeInterval: (callback: () => void, delay: number) => number;
  /**
   * Clear a specific interval
   */
  clearSafeInterval: (id: number) => void;
  /**
   * Clear all active intervals
   */
  clearAllIntervals: () => void;
}

/**
 * Safe setInterval that automatically clears on unmount
 */
export function useSafeInterval(): UseSafeIntervalReturn {
  const intervalIds = useRef<Set<number>>(new Set());
  const isMounted = useIsMounted();

  useEffect(() => {
    return () => {
      intervalIds.current.forEach((id) => {
        clearInterval(id);
      });
      intervalIds.current.clear();
    };
  }, []);

  const setSafeInterval = useCallback(
    (callback: () => void, delay: number): number => {
      const id = window.setInterval(() => {
        if (isMounted()) {
          callback();
        } else {
          clearInterval(id);
          intervalIds.current.delete(id);
        }
      }, delay);

      intervalIds.current.add(id);
      return id;
    },
    [isMounted]
  );

  const clearSafeInterval = useCallback((id: number) => {
    clearInterval(id);
    intervalIds.current.delete(id);
  }, []);

  const clearAllIntervals = useCallback(() => {
    intervalIds.current.forEach((id) => {
      clearInterval(id);
    });
    intervalIds.current.clear();
  }, []);

  return { setSafeInterval, clearSafeInterval, clearAllIntervals };
}

// ============================================================================
// ABORT CONTROLLER HOOK
// ============================================================================

interface UseAbortControllerReturn {
  /**
   * Get current AbortSignal
   */
  signal: AbortSignal;
  /**
   * Abort current operations and create new controller
   */
  abort: (reason?: string) => void;
  /**
   * Create a new controller (aborts previous)
   */
  reset: () => AbortController;
  /**
   * Check if currently aborted
   */
  isAborted: boolean;
}

/**
 * Manage AbortController with automatic cleanup
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { signal, abort } = useAbortController();
 *
 *   useEffect(() => {
 *     fetch('/api/data', { signal })
 *       .then(res => res.json())
 *       .then(setData)
 *       .catch(err => {
 *         if (err.name !== 'AbortError') {
 *           setError(err);
 *         }
 *       });
 *   }, [signal]);
 *
 *   // Abort is called automatically on unmount
 *   // Or call abort() manually to cancel
 * }
 * ```
 */
export function useAbortController(): UseAbortControllerReturn {
  const controllerRef = useRef<AbortController>(new AbortController());
  const [isAborted, setIsAborted] = useState(false);

  // Abort on unmount
  useEffect(() => {
    return () => {
      controllerRef.current.abort();
    };
  }, []);

  const abort = useCallback((reason?: string) => {
    controllerRef.current.abort(reason);
    setIsAborted(true);
  }, []);

  const reset = useCallback(() => {
    controllerRef.current.abort();
    controllerRef.current = new AbortController();
    setIsAborted(false);
    return controllerRef.current;
  }, []);

  return {
    signal: controllerRef.current.signal,
    abort,
    reset,
    isAborted,
  };
}

// ============================================================================
// DEBOUNCE WITH CLEANUP HOOK
// ============================================================================

/**
 * Debounce a value with automatic cleanup
 *
 * @param value - Value to debounce
 * @param delay - Debounce delay in ms
 * @returns Debounced value
 *
 * @example
 * ```tsx
 * function SearchComponent() {
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebounce(query, 300);
 *
 *   useEffect(() => {
 *     if (debouncedQuery) {
 *       search(debouncedQuery);
 *     }
 *   }, [debouncedQuery]);
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const { setSafeTimeout, clearAllTimeouts } = useSafeTimeout();

  useEffect(() => {
    clearAllTimeouts();
    setSafeTimeout(() => {
      setDebouncedValue(value);
    }, delay);
  }, [value, delay, setSafeTimeout, clearAllTimeouts]);

  return debouncedValue;
}

/**
 * Debounce a callback function with cleanup
 *
 * @param callback - Function to debounce
 * @param delay - Debounce delay in ms
 * @returns Debounced function
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const { setSafeTimeout, clearAllTimeouts } = useSafeTimeout();
  const callbackRef = useRef(callback);

  // Update callback ref on change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      clearAllTimeouts();
      setSafeTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay, setSafeTimeout, clearAllTimeouts]
  );
}

// ============================================================================
// THROTTLE WITH CLEANUP HOOK
// ============================================================================

/**
 * Throttle a callback function with cleanup
 *
 * @param callback - Function to throttle
 * @param delay - Throttle delay in ms
 * @returns Throttled function
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef<number>(0);
  const { setSafeTimeout, clearAllTimeouts } = useSafeTimeout();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        callbackRef.current(...args);
      } else {
        clearAllTimeouts();
        setSafeTimeout(() => {
          lastRun.current = Date.now();
          callbackRef.current(...args);
        }, delay - (now - lastRun.current));
      }
    },
    [delay, setSafeTimeout, clearAllTimeouts]
  );
}

// ============================================================================
// PREVIOUS VALUE HOOK
// ============================================================================

/**
 * Get the previous value of a state/prop
 * Useful for detecting changes and preventing unnecessary updates
 *
 * @param value - Current value
 * @returns Previous value (undefined on first render)
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// ============================================================================
// STABLE CALLBACK HOOK
// ============================================================================

/**
 * Create a stable callback that always has access to latest closure
 * Prevents infinite loops from callback dependencies
 *
 * @param callback - Callback function
 * @returns Stable callback reference
 *
 * @example
 * ```tsx
 * function MyComponent({ onUpdate }) {
 *   // Without useStableCallback, this would cause infinite loops
 *   // if onUpdate changes on every render
 *   const stableOnUpdate = useStableCallback(onUpdate);
 *
 *   useEffect(() => {
 *     stableOnUpdate(data);
 *   }, [data, stableOnUpdate]); // stableOnUpdate never changes
 * }
 * ```
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  );
}

// ============================================================================
// UPDATE GUARD HOOK
// ============================================================================

interface UseUpdateGuardOptions {
  /**
   * Maximum updates allowed in the time window
   */
  maxUpdates?: number;
  /**
   * Time window in ms
   */
  timeWindow?: number;
  /**
   * Callback when limit is exceeded
   */
  onLimitExceeded?: () => void;
}

/**
 * Prevent infinite update loops by limiting update frequency
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { shouldUpdate, recordUpdate } = useUpdateGuard({
 *     maxUpdates: 10,
 *     timeWindow: 1000,
 *     onLimitExceeded: () => console.warn('Too many updates!'),
 *   });
 *
 *   useEffect(() => {
 *     if (shouldUpdate()) {
 *       recordUpdate();
 *       // ... do update
 *     }
 *   }, [dependency]);
 * }
 * ```
 */
export function useUpdateGuard(options: UseUpdateGuardOptions = {}) {
  const { maxUpdates = 50, timeWindow = 1000, onLimitExceeded } = options;

  const updatesRef = useRef<number[]>([]);
  const limitExceededRef = useRef(false);

  const shouldUpdate = useCallback((): boolean => {
    const now = Date.now();
    const recentUpdates = updatesRef.current.filter(
      (time) => now - time < timeWindow
    );
    updatesRef.current = recentUpdates;

    if (recentUpdates.length >= maxUpdates) {
      if (!limitExceededRef.current) {
        limitExceededRef.current = true;
        onLimitExceeded?.();
        console.error(
          `[useUpdateGuard] Update limit exceeded: ${maxUpdates} updates in ${timeWindow}ms. ` +
          'This may indicate an infinite loop.'
        );
      }
      return false;
    }

    limitExceededRef.current = false;
    return true;
  }, [maxUpdates, timeWindow, onLimitExceeded]);

  const recordUpdate = useCallback(() => {
    updatesRef.current.push(Date.now());
  }, []);

  const reset = useCallback(() => {
    updatesRef.current = [];
    limitExceededRef.current = false;
  }, []);

  return { shouldUpdate, recordUpdate, reset };
}

// ============================================================================
// FILE READER WITH CLEANUP
// ============================================================================

interface UseFileReaderReturn {
  /**
   * Read file as text
   */
  readAsText: (file: File) => Promise<string>;
  /**
   * Read file as data URL
   */
  readAsDataURL: (file: File) => Promise<string>;
  /**
   * Abort current read operation
   */
  abort: () => void;
  /**
   * Whether currently reading
   */
  isReading: boolean;
  /**
   * Current read error
   */
  error: Error | null;
}

/**
 * FileReader with automatic cleanup and abort support
 *
 * @example
 * ```tsx
 * function FileUpload() {
 *   const { readAsText, abort, isReading, error } = useFileReader();
 *
 *   const handleFile = async (file: File) => {
 *     try {
 *       const content = await readAsText(file);
 *       setData(JSON.parse(content));
 *     } catch (err) {
 *       // Handle error
 *     }
 *   };
 *
 *   // abort() is called automatically on unmount
 * }
 * ```
 */
export function useFileReader(): UseFileReaderReturn {
  const readerRef = useRef<FileReader | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useIsMounted();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.abort();
      }
    };
  }, []);

  const createReader = useCallback(
    (
      file: File,
      readMethod: 'readAsText' | 'readAsDataURL'
    ): Promise<string> => {
      return new Promise((resolve, reject) => {
        // Abort previous read if any
        if (readerRef.current) {
          readerRef.current.abort();
        }

        const reader = new FileReader();
        readerRef.current = reader;
        setIsReading(true);
        setError(null);

        reader.onload = (event) => {
          if (isMounted()) {
            setIsReading(false);
            readerRef.current = null;
            resolve(event.target?.result as string);
          }
        };

        reader.onerror = () => {
          if (isMounted()) {
            setIsReading(false);
            const err = new Error('Failed to read file');
            setError(err);
            readerRef.current = null;
            reject(err);
          }
        };

        reader.onabort = () => {
          if (isMounted()) {
            setIsReading(false);
            readerRef.current = null;
            reject(new Error('File read aborted'));
          }
        };

        reader[readMethod](file);
      });
    },
    [isMounted]
  );

  const readAsText = useCallback(
    (file: File) => createReader(file, 'readAsText'),
    [createReader]
  );

  const readAsDataURL = useCallback(
    (file: File) => createReader(file, 'readAsDataURL'),
    [createReader]
  );

  const abort = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.abort();
      readerRef.current = null;
      setIsReading(false);
    }
  }, []);

  return { readAsText, readAsDataURL, abort, isReading, error };
}
