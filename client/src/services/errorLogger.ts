/**
 * Automated Error Detection and Logging Service
 * Detects errors on screen and logs them for automatic fixing
 * Especially useful during smoke tests
 */

export interface ErrorLog {
  id: string;
  timestamp: number;
  type: 'react' | 'javascript' | 'api' | 'render' | 'network';
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: {
    route?: string;
    component?: string;
    props?: Record<string, any>;
    state?: Record<string, any>;
  };
  screenshot?: string; // Base64 encoded screenshot
  canAutoFix: boolean;
  autoFixAttempted?: boolean;
  autoFixSuccess?: boolean;
}

class ErrorLoggerService {
  private errorLogs: ErrorLog[] = [];
  private maxLogs = 1000;
  private logEndpoint = '/api/errors/log';
  private isLoggingEnabled = true;

  constructor() {
    this.setupGlobalErrorHandlers();
    this.setupReactErrorHandler();
    this.setupNetworkErrorHandler();
    this.setupScreenErrorDetection();
  }

  /**
   * Setup global JavaScript error handler
   */
  private setupGlobalErrorHandlers() {
    // Window error handler
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'javascript',
        message: event.message || 'Unknown JavaScript error',
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        severity: this.determineSeverity(event.message || ''),
        context: {
          route: window.location.pathname,
        },
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'javascript',
        message: event.reason?.message || String(event.reason) || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        url: window.location.href,
        severity: 'high',
        context: {
          route: window.location.pathname,
        },
      });
    });
  }

  /**
   * Setup React error boundary integration
   */
  private setupReactErrorHandler() {
    // This will be called by ErrorBoundary component
    (window as any).__logReactError = (error: Error, errorInfo: any) => {
      this.logError({
        type: 'react',
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        url: window.location.href,
        severity: 'critical',
        context: {
          route: window.location.pathname,
          component: this.extractComponentFromStack(errorInfo?.componentStack),
        },
      });
    };
  }

  /**
   * Setup network error detection
   */
  private setupNetworkErrorHandler() {
    // Intercept fetch errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok && response.status >= 500) {
          this.logError({
            type: 'api',
            message: `API Error: ${response.status} ${response.statusText}`,
            url: args[0] as string,
            severity: response.status >= 500 ? 'high' : 'medium',
            context: {
              route: window.location.pathname,
            },
          });
        }
        return response;
      } catch (error) {
        this.logError({
          type: 'network',
          message: error instanceof Error ? error.message : 'Network request failed',
          stack: error instanceof Error ? error.stack : undefined,
          url: args[0] as string,
          severity: 'high',
          context: {
            route: window.location.pathname,
          },
        });
        throw error;
      }
    };
  }

  /**
   * Setup screen error detection (detects error messages on screen)
   */
  private setupScreenErrorDetection() {
    // Check for error messages in DOM periodically
    setInterval(() => {
      this.detectScreenErrors();
    }, 2000); // Check every 2 seconds
  }

  /**
   * Detect error messages visible on screen
   */
  private detectScreenErrors() {
    // Look for common error indicators
    const errorSelectors = [
      '[data-testid*="error"]',
      '.error',
      '.error-message',
      '[role="alert"]',
      '.alert-danger',
      '.toast-error',
      '[class*="error"]',
    ];

    for (const selector of errorSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const text = element.textContent || '';
        if (text && this.isErrorText(text)) {
          // Check if we've already logged this error
          const errorId = this.generateErrorId(text, selector);
          if (!this.errorLogs.find((log) => log.id === errorId)) {
            this.logError({
              type: 'render',
              message: `Screen Error Detected: ${text.substring(0, 200)}`,
              url: window.location.href,
              severity: 'medium',
              context: {
                route: window.location.pathname,
                component: selector,
              },
              canAutoFix: this.canAutoFixError(text),
            });
          }
        }
      });
    }

    // Check for React error boundary messages
    const errorBoundary = document.querySelector('[class*="error-boundary"], [class*="ErrorBoundary"]');
    if (errorBoundary) {
      const errorText = errorBoundary.textContent || '';
      if (errorText.includes('Something went wrong') || errorText.includes('error occurred')) {
        const errorId = this.generateErrorId(errorText, 'error-boundary');
        if (!this.errorLogs.find((log) => log.id === errorId)) {
          this.logError({
            type: 'react',
            message: `React Error Boundary Triggered: ${errorText.substring(0, 200)}`,
            url: window.location.href,
            severity: 'critical',
            context: {
              route: window.location.pathname,
              component: 'ErrorBoundary',
            },
            canAutoFix: false,
          });
        }
      }
    }
  }

  /**
   * Check if text looks like an error message
   */
  private isErrorText(text: string): boolean {
    const errorKeywords = [
      'error',
      'failed',
      'exception',
      'undefined',
      'null',
      'cannot read',
      'is not defined',
      'something went wrong',
      'an error occurred',
    ];
    const lowerText = text.toLowerCase();
    return errorKeywords.some((keyword) => lowerText.includes(keyword));
  }

  /**
   * Determine if error can be auto-fixed
   */
  private canAutoFixError(message: string): boolean {
    const autoFixablePatterns = [
      /cannot read properties of undefined/i,
      /cannot read property .* of undefined/i,
      /is not defined/i,
      /missing required prop/i,
    ];
    return autoFixablePatterns.some((pattern) => pattern.test(message));
  }

  /**
   * Determine error severity
   */
  private determineSeverity(message: string): ErrorLog['severity'] {
    const criticalPatterns = [
      /cannot read properties of undefined/i,
      /component.*error/i,
      /render.*error/i,
    ];
    const highPatterns = [
      /api.*error/i,
      /network.*error/i,
      /500/i,
      /502/i,
      /503/i,
    ];

    if (criticalPatterns.some((p) => p.test(message))) return 'critical';
    if (highPatterns.some((p) => p.test(message))) return 'high';
    if (message.includes('warning') || message.includes('deprecated')) return 'low';
    return 'medium';
  }

  /**
   * Extract component name from React component stack
   */
  private extractComponentFromStack(componentStack?: string): string | undefined {
    if (!componentStack) return undefined;
    const match = componentStack.match(/at (\w+)/);
    return match ? match[1] : undefined;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(message: string, context: string): string {
    const hash = message.substring(0, 50) + context;
    return btoa(hash).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  /**
   * Log an error
   */
  public logError(error: Partial<ErrorLog>) {
    if (!this.isLoggingEnabled) return;

    const errorLog: ErrorLog = {
      id: error.id || this.generateErrorId(error.message || '', error.type || 'unknown'),
      timestamp: Date.now(),
      type: error.type || 'javascript',
      message: error.message || 'Unknown error',
      stack: error.stack,
      componentStack: error.componentStack,
      url: error.url || window.location.href,
      userAgent: navigator.userAgent,
      severity: error.severity || 'medium',
      context: error.context || {},
      canAutoFix: error.canAutoFix || false,
      autoFixAttempted: error.autoFixAttempted || false,
      autoFixSuccess: error.autoFixSuccess || false,
    };

    // Add to local logs
    this.errorLogs.push(errorLog);
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ErrorLogger] ${errorLog.severity.toUpperCase()}: ${errorLog.message}`, errorLog);
    }

    // Send to backend (non-blocking)
    this.sendToBackend(errorLog).catch(() => {
      // Silently fail - don't break the app
    });

    // Try auto-fix if possible
    if (errorLog.canAutoFix && !errorLog.autoFixAttempted) {
      this.attemptAutoFix(errorLog);
    }
  }

  /**
   * Send error log to backend
   */
  private async sendToBackend(errorLog: ErrorLog) {
    try {
      await fetch(this.logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      });
    } catch (error) {
      // Silently fail - don't break the app
    }
  }

  /**
   * Attempt to auto-fix the error
   */
  private async attemptAutoFix(errorLog: ErrorLog) {
    errorLog.autoFixAttempted = true;

    // Common auto-fixes
    if (errorLog.message.includes('cannot read properties of undefined')) {
      // This would trigger a code fix - for now just log
      console.warn('[ErrorLogger] Auto-fix available for:', errorLog.message);
      // In a real implementation, this would trigger an AI agent to fix the code
    }

    // Update log
    const index = this.errorLogs.findIndex((log) => log.id === errorLog.id);
    if (index !== -1) {
      this.errorLogs[index] = errorLog;
    }
  }

  /**
   * Get all error logs
   */
  public getErrorLogs(): ErrorLog[] {
    return [...this.errorLogs];
  }

  /**
   * Get errors by severity
   */
  public getErrorsBySeverity(severity: ErrorLog['severity']): ErrorLog[] {
    return this.errorLogs.filter((log) => log.severity === severity);
  }

  /**
   * Get critical errors
   */
  public getCriticalErrors(): ErrorLog[] {
    return this.getErrorsBySeverity('critical');
  }

  /**
   * Clear error logs
   */
  public clearLogs() {
    this.errorLogs = [];
  }

  /**
   * Enable/disable logging
   */
  public setLoggingEnabled(enabled: boolean) {
    this.isLoggingEnabled = enabled;
  }
}

// Export singleton instance
export const errorLogger = new ErrorLoggerService();

// Make it available globally for ErrorBoundary
if (typeof window !== 'undefined') {
  (window as any).errorLogger = errorLogger;
}

