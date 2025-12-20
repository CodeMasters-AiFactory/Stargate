/**
 * Wizard Error Boundary Component
 *
 * Catches errors in the wizard component tree and displays
 * a user-friendly error message with recovery options.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  WIZARD_STORAGE_KEY,
  WIZARD_CHECKLIST_STORAGE_KEY,
  WIZARD_GENERATED_WEBSITE_KEY,
  WIZARD_DEBUG_MODE,
} from '@/config/wizard';

// ============================================================================
// TYPES
// ============================================================================

interface WizardErrorBoundaryProps {
  children: ReactNode;
  /**
   * Fallback component to render instead of default error UI
   */
  fallback?: ReactNode;
  /**
   * Callback when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Whether to show the "Clear Data" button
   */
  showClearDataButton?: boolean;
  /**
   * Whether to show error details in production
   */
  showDetailsInProduction?: boolean;
  /**
   * Custom error title
   */
  errorTitle?: string;
  /**
   * Custom error description
   */
  errorDescription?: string;
}

interface WizardErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

export class WizardErrorBoundary extends Component<
  WizardErrorBoundaryProps,
  WizardErrorBoundaryState
> {
  constructor(props: WizardErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<WizardErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error for debugging
    console.error('[WizardErrorBoundary] Caught error:', error);
    console.error('[WizardErrorBoundary] Component stack:', errorInfo.componentStack);

    this.setState({ errorInfo });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send this to an error tracking service
    if (!WIZARD_DEBUG_MODE) {
      // TODO: Send to error tracking service (Sentry, etc.)
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // Placeholder for error tracking service integration
    // Example: Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
    console.warn('[WizardErrorBoundary] Would log to error service in production');
  }

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  private handleClearDataAndRetry = (): void => {
    // Clear wizard-related localStorage
    try {
      localStorage.removeItem(WIZARD_STORAGE_KEY);
      localStorage.removeItem(WIZARD_CHECKLIST_STORAGE_KEY);
      localStorage.removeItem(WIZARD_GENERATED_WEBSITE_KEY);
      console.log('[WizardErrorBoundary] Cleared wizard data from localStorage');
    } catch (e) {
      console.error('[WizardErrorBoundary] Failed to clear localStorage:', e);
    }

    // Reset error state
    this.handleRetry();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  private toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  private copyErrorDetails = (): void => {
    const { error, errorInfo } = this.state;
    const details = `
Error: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace'}
Component Stack: ${errorInfo?.componentStack || 'No component stack'}
URL: ${window.location.href}
Time: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
    `.trim();

    navigator.clipboard.writeText(details).then(
      () => alert('Error details copied to clipboard'),
      () => alert('Failed to copy error details')
    );
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const {
      children,
      fallback,
      showClearDataButton = true,
      showDetailsInProduction = false,
      errorTitle = 'Something went wrong',
      errorDescription = 'The website builder encountered an unexpected error. You can try again or start fresh.',
    } = this.props;

    if (!hasError) {
      return children;
    }

    // Use custom fallback if provided
    if (fallback) {
      return fallback;
    }

    const canShowDetails = WIZARD_DEBUG_MODE || showDetailsInProduction;

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-xl">{errorTitle}</CardTitle>
                <CardDescription>{errorDescription}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="font-mono text-sm">
                  {error.message || 'An unknown error occurred'}
                </AlertDescription>
              </Alert>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={this.handleRetry} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>

              {showClearDataButton && (
                <Button
                  onClick={this.handleClearDataAndRetry}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Data & Retry
                </Button>
              )}

              <Button onClick={this.handleGoHome} variant="ghost" className="flex-1">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Error details (development only by default) */}
            {canShowDetails && (
              <div className="pt-4 border-t">
                <Button
                  onClick={this.toggleDetails}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between"
                >
                  <span className="flex items-center">
                    <Bug className="h-4 w-4 mr-2" />
                    Technical Details
                  </span>
                  <span>{showDetails ? '▲' : '▼'}</span>
                </Button>

                {showDetails && (
                  <div className="mt-2 space-y-2">
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md overflow-auto max-h-48">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {error?.stack || 'No stack trace available'}
                      </pre>
                    </div>

                    {errorInfo?.componentStack && (
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md overflow-auto max-h-48">
                        <p className="text-xs font-semibold mb-1">Component Stack:</p>
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}

                    <Button
                      onClick={this.copyErrorDetails}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Copy Error Details
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Help text */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
              If this problem persists, please contact support with the error details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}

// ============================================================================
// FUNCTIONAL WRAPPER WITH HOOKS
// ============================================================================

interface UseWizardErrorBoundaryOptions {
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Hook to programmatically trigger error boundary
 * Useful for catching async errors that error boundaries don't catch
 */
export function useWizardErrorHandler(options?: UseWizardErrorBoundaryOptions) {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('[useWizardErrorHandler] Error:', error);
    setError(error);
    options?.onError?.(error, { componentStack: '' } as ErrorInfo);
  }, [options]);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  // If there's an error, throw it to be caught by error boundary
  if (error) {
    throw error;
  }

  return { handleError, resetError };
}

// ============================================================================
// ASYNC ERROR BOUNDARY
// ============================================================================

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

/**
 * Component that catches async errors and displays them
 * Use this inside a WizardErrorBoundary for async operations
 */
export function AsyncErrorBoundary({
  children,
  fallback,
  onError,
}: AsyncErrorBoundaryProps) {
  const [asyncError, setAsyncError] = React.useState<Error | null>(null);

  // Provide error handler to children via context
  const handleAsyncError = React.useCallback((error: Error) => {
    console.error('[AsyncErrorBoundary] Async error:', error);
    onError?.(error);
    setAsyncError(error);
  }, [onError]);

  const resetError = React.useCallback(() => {
    setAsyncError(null);
  }, []);

  // If there's an async error, throw it to be caught by parent error boundary
  if (asyncError) {
    throw asyncError;
  }

  return (
    <AsyncErrorContext.Provider value={{ handleAsyncError, resetError }}>
      {children}
    </AsyncErrorContext.Provider>
  );
}

// ============================================================================
// ASYNC ERROR CONTEXT
// ============================================================================

interface AsyncErrorContextValue {
  handleAsyncError: (error: Error) => void;
  resetError: () => void;
}

const AsyncErrorContext = React.createContext<AsyncErrorContextValue | null>(null);

/**
 * Hook to access async error handler
 */
export function useAsyncError() {
  const context = React.useContext(AsyncErrorContext);

  if (!context) {
    // Return a default handler that logs and re-throws
    return {
      handleAsyncError: (error: Error) => {
        console.error('[useAsyncError] No AsyncErrorBoundary found, throwing:', error);
        throw error;
      },
      resetError: () => {},
    };
  }

  return context;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default WizardErrorBoundary;
