import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  RefreshCw,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Play,
  Square,
} from 'lucide-react';

export function PreviewPanel() {
  const [isRunning, setIsRunning] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    // Preview should show the actual Stargate IDE
    setPreviewUrl(window.location.origin);
  }, []);

  const toggleApp = () => {
    setIsRunning(!isRunning);
  };

  const refreshPreview = () => {
    // Force iframe reload
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const getViewportStyles = () => {
    switch (viewMode) {
      case 'mobile':
        return {
          width: '375px',
          height: '667px',
          margin: '0 auto',
          border: '1px solid #e5e7eb',
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          margin: '0 auto',
          border: '1px solid #e5e7eb',
        };
      default:
        return {
          width: '100%',
          height: '100%',
          border: 'none',
        };
    }
  };

  return (
    <div className="h-full flex flex-col" data-testid="preview-panel">
      {/* Header */}
      <div className="p-4 border-b border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Stargate Agent Preview
            </h2>
            <p className="text-sm text-muted-foreground">
              Live preview of your Stargate AI development environment
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isRunning ? 'default' : 'secondary'}>
              {isRunning ? 'Running' : 'Stopped'}
            </Badge>
            <Button size="sm" variant="outline" onClick={toggleApp} data-testid="button-toggle-app">
              {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Stop' : 'Start'}
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={refreshPreview}
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(previewUrl, '_blank')}
              data-testid="button-open-external"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Create a full-featured popup window for your Stargate IDE
                const currentUrl = window.location.href;
                const popup = window.open(
                  currentUrl,
                  'stargate-preview',
                  'width=1400,height=900,scrollbars=yes,resizable=yes,location=yes,menubar=yes,toolbar=yes,status=yes'
                );
                if (popup) {
                  popup.focus();
                }
              }}
              data-testid="button-pop-out"
            >
              <Monitor className="w-4 h-4 mr-1" />
              Open Full IDE in New Window
            </Button>
          </div>

          {/* Viewport Controls */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={viewMode === 'desktop' ? 'default' : 'outline'}
              onClick={() => setViewMode('desktop')}
              data-testid="button-desktop-view"
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'tablet' ? 'default' : 'outline'}
              onClick={() => setViewMode('tablet')}
              data-testid="button-tablet-view"
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'mobile' ? 'default' : 'outline'}
              onClick={() => setViewMode('mobile')}
              data-testid="button-mobile-view"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* URL Bar */}
        <div className="mt-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1 bg-muted rounded px-3 py-1 text-sm font-mono">{previewUrl}</div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-2">
        {isRunning ? (
          <div className="h-full rounded-lg overflow-hidden" style={getViewportStyles()}>
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="Application Preview"
              data-testid="preview-iframe"
              style={{
                minWidth: '100%',
                minHeight: '100%',
                border: 'none',
                overflow: 'auto',
              }}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-muted rounded-lg">
            <div className="text-center">
              <Square className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Application Stopped</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start your application to see the preview
              </p>
              <Button onClick={toggleApp}>
                <Play className="w-4 h-4 mr-2" />
                Start Application
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Competitive Advantage */}
      <div className="p-4 border-t border">
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-500" />
              <div>
                <h4 className="font-medium text-green-700 dark:text-green-300 text-sm">
                  🚀 Stargate Preview Advantage
                </h4>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Multi-viewport testing, instant refresh, and unlimited preview sessions - better
                  than Replit's basic preview!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
