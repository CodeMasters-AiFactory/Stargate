/**
 * Error Boundary Fallback Component
 * Displayed when an error boundary catches an error
 */

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
  componentName?: string;
}

export function ErrorBoundaryFallback({
  error,
  resetError,
  componentName,
}: ErrorBoundaryFallbackProps) {
  return (
    <Card className="m-4 border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          Something went wrong
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {componentName && (
          <p className="text-sm text-muted-foreground">
            Error in: <strong>{componentName}</strong>
          </p>
        )}
        <div className="rounded-md bg-muted p-4">
          <p className="font-mono text-sm text-destructive">{error.message}</p>
          {error.stack && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted-foreground">
                Stack trace
              </summary>
              <pre className="mt-2 overflow-auto text-xs">{error.stack}</pre>
            </details>
          )}
        </div>
        <Button onClick={resetError} variant="outline" className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}

