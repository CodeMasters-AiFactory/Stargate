import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  lastErrorTime: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const now = Date.now();
    return {
      hasError: true,
      error,
      errorInfo: null,
      lastErrorTime: now,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const now = Date.now();
    const timeSinceLastError = now - this.state.lastErrorTime;
    const newErrorCount = timeSinceLastError < 5000 ? this.state.errorCount + 1 : 1; // Reset count if >5s since last error

    console.error(`[ErrorBoundary] Caught error #${newErrorCount}:`, error.message, errorInfo);
    console.error('[ErrorBoundary] Error stack:', error.stack);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

    // Log to automated error logger (if available)
    if (typeof window !== 'undefined' && (window as any).errorLogger) {
      try {
        (window as any).errorLogger.logError({
          type: 'react',
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          severity: 'critical',
          context: {
            route: window.location.pathname,
            component: this.extractComponentName(errorInfo.componentStack || ''),
          },
        });
      } catch (e) {
        // Silently fail - don't break error boundary
      }
    }

    // If we're getting errors too frequently (>5 in 5 seconds), prevent reset loop
    if (newErrorCount > 5 && timeSinceLastError < 5000) {
      console.error(
        '[ErrorBoundary] ⚠️ ERROR LOOP DETECTED! Preventing reset to avoid infinite loop.'
      );
      console.error('[ErrorBoundary] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });

      // Don't update state if we're in an error loop - this prevents the reset
      return;
    }

    this.setState({
      error,
      errorInfo,
      errorCount: newErrorCount,
      lastErrorTime: now,
    });

    // Clear any existing reset timeout
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    // If error was cleared but we're still getting errors, prevent reset loop
    if (!prevState.hasError && this.state.hasError && this.state.errorCount > 5) {
      console.error('[ErrorBoundary] ⚠️ Preventing reset - error loop detected');
      this.setState(prevState => ({
        ...prevState,
        hasError: true, // Keep error state
      }));
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private extractComponentName(componentStack?: string): string | undefined {
    if (!componentStack) return undefined;
    const match = componentStack.match(/at (\w+)/);
    return match ? match[1] : undefined;
  }

  handleReset = () => {
    // Clear reset timeout if exists
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    // IMPORTANT: Preserve the current URL - don't navigate away
    // The persisted view state in localStorage will restore the correct view
    console.log('[ErrorBoundary] Resetting error state - preserving current URL:', window.location.href);

    // Reset state - this will re-render children in place without navigation
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <div className="max-w-2xl w-full bg-card border border-destructive rounded-lg p-6">
            <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">
              An error occurred while rendering the application. Please check the console for more
              details.
            </p>
            {this.state.error && (
              <div className="bg-muted p-4 rounded mb-4">
                <p className="font-mono text-sm text-destructive">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-muted-foreground">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              >
                Reload Page
              </button>
            </div>
            {this.state.errorCount > 5 && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded">
                <p className="text-sm text-destructive font-semibold">
                  ⚠️ Error Loop Detected ({this.state.errorCount} errors)
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  The application is encountering repeated errors. Check the console for details.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
