import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { MultiPagePreview } from './MultiPagePreview';
import type { GeneratedWebsitePackage } from '@/types/websiteBuilder';

interface ResizableLivePreviewProps {
  website: any | null;
  previewHtml?: string;
  isVisible?: boolean;
  defaultWidth?: number;
  minWidth?: number; // Reserved for future use
  maxWidth?: number; // Reserved for future use
}

export function ResizableLivePreview({
  website,
  previewHtml,
  isVisible = true,
  defaultWidth: _defaultWidth = 400,
  minWidth: _minWidth = 300,
  maxWidth: _maxWidth = 1200,
}: ResizableLivePreviewProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Reserved for future use: previewWidth, setPreviewWidth
  const [isRefreshing, setIsRefreshing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate HTML content for preview
  const getPreviewContent = (): string => {
    if (!website && !previewHtml) {
      return '<!DOCTYPE html><html><head><title>No Preview</title></head><body><div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#666;font-family:system-ui">No website preview available yet. Start building to see live preview.</div></body></html>';
    }

    // If we have a multi-page website
    if (website?.code?.manifest && website?.code?.files) {
      // MultiPagePreview component will handle this
      return '';
    }

    // If we have previewHtml from building progress
    if (previewHtml) {
      return previewHtml;
    }

    // Legacy single-page format
    if (website?.code) {
      const code = website.code;
      let html = code.html || '';
      const css = code.css || '';
      const js = code.js || '';

      // Assemble full HTML
      if (html.includes('</head>')) {
        html = html.replace('</head>', `<style>${css}</style></head>`);
      } else {
        html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${website.name || 'Website'}</title><style>${css}</style></head><body>${html}`;
      }

      if (html.includes('</body>')) {
        html = html.replace('</body>', `<script>${js}</script></body></html>`);
      } else {
        html = html + `<script>${js}</script></body></html>`;
      }

      return html;
    }

    return '<!DOCTYPE html><html><head><title>Loading...</title></head><body><div style="display:flex;align-items:center;justify-content:center;height:100vh">Loading preview...</div></body></html>';
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (!isVisible) return null;

  const hasMultiPage = website?.code?.manifest && website?.code?.files;
  const previewContent = getPreviewContent();

  return (
    <div className="h-full flex flex-col border-l border-border bg-background">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Live Preview</span>
          {website && (
            <Badge variant="secondary" className="text-xs">
              {hasMultiPage ? `${website.code.pages?.length || 0} Pages` : 'Single Page'}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-7 w-7 p-0"
            title="Refresh Preview"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleCollapse}
            className="h-7 w-7 p-0"
            title={isCollapsed ? 'Expand Preview' : 'Collapse Preview'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      {!isCollapsed ? (
        <div className="flex-1 overflow-hidden relative">
          {hasMultiPage ? (
            <MultiPagePreview
              website={website.code as GeneratedWebsitePackage}
              className="h-full"
            />
          ) : (
            <div className="h-full w-full bg-white dark:bg-gray-900">
              <iframe
                ref={iframeRef}
                srcDoc={previewContent}
                className="w-full h-full border-0"
                title="Website Preview"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleCollapse}
            className="flex flex-col items-center gap-2 h-auto p-4"
            title="Expand Preview"
          >
            <Eye className="w-5 h-5" />
            <span className="text-xs">Preview</span>
          </Button>
        </div>
      )}
    </div>
  );
}
