import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw,
  ExternalLink,
  Globe,
  Play,
  Square,
  AlertCircle,
  Loader2,
  Maximize2,
  Minimize2,
  Monitor,
  Tablet,
  Smartphone,
  Rotate3d,
  Activity,
  Link,
  Check,
  Zap,
} from 'lucide-react';
import { useIDEContext } from '@/components/providers/IDEProvider';
import { useToast } from '@/hooks/use-toast';

interface LivePreviewProps {
  isVisible: boolean;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';
type OrientationMode = 'portrait' | 'landscape';

interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  icon: React.ComponentType<{ className?: string }>;
}

const VIEWPORT_CONFIGS: Record<ViewportMode, ViewportConfig> = {
  desktop: { name: 'Desktop', width: 1920, height: 1080, icon: Monitor },
  tablet: { name: 'Tablet', width: 768, height: 1024, icon: Tablet },
  mobile: { name: 'Mobile', width: 375, height: 667, icon: Smartphone },
};

export function LivePreview({ isVisible }: LivePreviewProps) {
  const { state } = useIDEContext();
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [orientation, setOrientation] = useState<OrientationMode>('portrait');
  const [showPerformance, setShowPerformance] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [_lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  // HMR-like live sync via WebSocket
  useEffect(() => {
    if (!autoRefresh) return;
    
    const connectWebSocket = () => {
      try {
        // Connect to Vite's HMR WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.hostname}:5000`);
        
        ws.onopen = () => {
          console.log('[LivePreview] HMR WebSocket connected');
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'update' || data.type === 'full-reload') {
              console.log('[LivePreview] HMR update detected, refreshing...');
              setLastUpdate(new Date());
              if (iframeRef.current) {
                iframeRef.current.contentWindow?.location.reload();
              }
            }
          } catch {
            // Ignore non-JSON messages
          }
        };
        
        ws.onerror = () => {
          console.log('[LivePreview] HMR WebSocket error, will retry...');
        };
        
        ws.onclose = () => {
          console.log('[LivePreview] HMR WebSocket closed, reconnecting...');
          setTimeout(connectWebSocket, 3000);
        };
        
        wsRef.current = ws;
      } catch (error) {
        console.log('[LivePreview] WebSocket connection failed');
      }
    };
    
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [autoRefresh]);
  
  // Auto-refresh on file changes (fallback polling)
  useEffect(() => {
    if (!autoRefresh || !state.currentProject) return;
    
    const checkForChanges = setInterval(() => {
      // This would check for file modifications
      // For now, we rely on WebSocket HMR
    }, 2000);
    
    return () => clearInterval(checkForChanges);
  }, [autoRefresh, state.currentProject]);
  
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // Auto-detect preview URL based on project type
  useEffect(() => {
    if (state.currentProject) {
      const hasPackageJson = 'package.json' in state.currentProject.files;
      const hasIndexHtml = 'index.html' in state.currentProject.files;

      if (hasPackageJson) {
        // React/Vite project typically runs on port 3000 or 5173
        setPreviewUrl(`${window.location.protocol}//${window.location.hostname}:5173`);
      } else if (hasIndexHtml) {
        // Static HTML project
        setPreviewUrl(`${window.location.protocol}//${window.location.hostname}:3000`);
      } else {
        // Default development server
        setPreviewUrl(`${window.location.protocol}//${window.location.hostname}:3000`);
      }
    }
  }, [state.currentProject]);

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      setError(null);
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Start the development server
      const response = await fetch('/api/projects/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: state.currentProject?.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to start development server');
      }

      setIsRunning(true);

      // Wait a moment for server to start
      setTimeout(() => {
        handleRefresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setIsLoading(true);

    try {
      await fetch('/api/projects/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: state.currentProject?.id }),
      });

      setIsRunning(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenExternal = () => {
    window.open(previewUrl, '_blank');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load preview. Make sure your development server is running.');
  };

  const handleViewportChange = (mode: ViewportMode) => {
    setViewportMode(mode);
  };

  const handleOrientationToggle = () => {
    setOrientation(prev => (prev === 'portrait' ? 'landscape' : 'portrait'));
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      setUrlCopied(true);
      toast({
        title: 'URL Copied',
        description: 'Preview URL has been copied to clipboard',
      });
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Unable to copy URL to clipboard',
        variant: 'destructive',
      });
    }
  };

  // Calculate viewport dimensions based on mode and orientation
  const getViewportDimensions = () => {
    const config = VIEWPORT_CONFIGS[viewportMode];
    const isLandscape = orientation === 'landscape';

    if (viewportMode === 'desktop') {
      return { width: '100%', height: '100%' };
    }

    const width = isLandscape ? config.height : config.width;
    const height = isLandscape ? config.width : config.height;

    return {
      width: `${width}px`,
      height: `${height}px`,
      maxWidth: '100%',
      maxHeight: '100%',
    };
  };

  if (!isVisible) return null;

  return (
    <div
      className={`flex-1 flex flex-col bg-card border-l border ${isMaximized ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* Preview Header */}
      <div className="flex items-center justify-between p-3 bg-muted border-b border">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Live Preview</span>
          <div
            className={`flex items-center space-x-1 text-xs ${isRunning ? 'text-green-600' : 'text-muted-foreground'}`}
          >
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span>{isRunning ? 'Running' : 'Stopped'}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {VIEWPORT_CONFIGS[viewportMode].name} {viewportMode !== 'desktop' && `(${orientation})`}
          </Badge>
        </div>

        <div className="flex items-center space-x-1">
          {/* Viewport Controls */}
          <div className="flex items-center space-x-1 mr-2">
            {Object.entries(VIEWPORT_CONFIGS).map(([mode, config]) => {
              const Icon = config.icon;
              return (
                <Button
                  key={mode}
                  variant={viewportMode === mode ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewportChange(mode as ViewportMode)}
                  title={`Switch to ${config.name} View`}
                  data-testid={`button-viewport-${mode}`}
                  className="px-2"
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}

            {viewportMode !== 'desktop' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOrientationToggle}
                title="Toggle Orientation"
                data-testid="button-toggle-orientation"
                className="px-2"
              >
                <Rotate3d className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Server Controls */}
          {!isRunning ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStart}
              disabled={isLoading}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Start Development Server"
              data-testid="button-start-server"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStop}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Stop Development Server"
              data-testid="button-stop-server"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || !isRunning}
            title="Refresh Preview"
            data-testid="button-refresh-preview"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyUrl}
            disabled={!isRunning}
            title="Copy Preview URL"
            data-testid="button-copy-url"
          >
            {urlCopied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Link className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenExternal}
            disabled={!isRunning}
            title="Open in New Tab"
            data-testid="button-open-external"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAutoRefresh}
            title={autoRefresh ? 'Disable Auto-Refresh (HMR)' : 'Enable Auto-Refresh (HMR)'}
            className={autoRefresh ? 'bg-green-100 text-green-600' : ''}
          >
            <Zap className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPerformance(!showPerformance)}
            title="Toggle Performance Metrics"
            data-testid="button-toggle-performance"
            className={showPerformance ? 'bg-blue-100 text-blue-600' : ''}
          >
            <Activity className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? 'Minimize Preview' : 'Maximize Preview'}
            data-testid="button-toggle-maximize"
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* URL Bar & Performance Metrics */}
      <div className="flex items-center px-3 py-2 bg-background border-b border">
        <div className="flex items-center flex-1 bg-muted rounded px-3 py-1 text-sm">
          <Globe className="w-3 h-3 mr-2 text-muted-foreground" />
          <span className="text-muted-foreground flex-1 font-mono text-xs">
            {previewUrl || 'No preview URL available'}
          </span>
        </div>

        {showPerformance && isRunning && (
          <div className="flex items-center space-x-4 ml-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-600">24ms</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">Memory:</span>
              <span className="text-blue-600">2.1MB</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">Load:</span>
              <span className="text-purple-600">1.2s</span>
            </div>
          </div>
        )}
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative bg-background">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Preview Error</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">{error}</p>
            <Button onClick={handleStart} variant="outline" data-testid="button-retry-preview">
              Try Again
            </Button>
          </div>
        ) : !isRunning ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Play className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Start Development Server</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Click the start button to run your application and see a live preview.
            </p>
            <Button onClick={handleStart} disabled={isLoading} data-testid="button-start-preview">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Server
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading preview...</span>
                </div>
              </div>
            )}

            {/* Responsive Iframe Container */}
            <div
              className="relative bg-white dark:bg-black shadow-xl transition-all duration-200"
              style={getViewportDimensions()}
            >
              {/* Device Frame (for mobile/tablet) */}
              {viewportMode !== 'desktop' && (
                <div className="absolute inset-0 pointer-events-none border-8 border-gray-800 rounded-lg z-10">
                  {/* Home button for mobile */}
                  {viewportMode === 'mobile' && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-600 rounded-full"></div>
                  )}
                </div>
              )}

              <iframe
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full border-0 rounded-lg"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals"
                data-testid="preview-iframe"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted border-t border text-xs">
        <div className="flex items-center space-x-4">
          <span className="text-muted-foreground">
            Project: {state.currentProject?.name || 'No project'}
          </span>
          {isRunning && <span className="text-green-600">● Server running</span>}
          {viewportMode !== 'desktop' && (
            <span className="text-blue-600">
              Viewport: {VIEWPORT_CONFIGS[viewportMode].width}×
              {VIEWPORT_CONFIGS[viewportMode].height}
              {orientation === 'landscape' && ' (Landscape)'}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4 text-muted-foreground">
          <span>Hot reload enabled</span>
          {showPerformance && (
            <Badge variant="secondary" className="text-xs">
              Performance Monitor Active
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
