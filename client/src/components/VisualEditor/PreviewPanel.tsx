/**
 * Preview Panel
 * Real-time preview of the website being edited
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Monitor, Tablet, Smartphone, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import type { GeneratedWebsitePackage } from '@/types/websiteBuilder';

export interface PreviewPanelProps {
  website: GeneratedWebsitePackage;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const DEVICE_SIZES: Record<PreviewDevice, { width: number; height: number }> = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

export function PreviewPanel({ website, zoom = 100, onZoomChange }: PreviewPanelProps) {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [previewHTML, setPreviewHTML] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Generate preview HTML
  const generatePreviewHTML = useCallback(() => {
    const activePageId = website.activePageId || 'home';
    const pageFileKey = `pages/${activePageId}.html`;
    const currentPageFile = website.files[pageFileKey] || website.files['index.html'] || website.files['home.html'];
    
    let pageHTML = '';
    if (currentPageFile && typeof currentPageFile === 'object' && 'content' in currentPageFile) {
      pageHTML = currentPageFile.content as string;
    } else if (typeof currentPageFile === 'string') {
      pageHTML = currentPageFile;
    }

    // Handle base64 encoding
    if (pageHTML && typeof pageHTML === 'string' && pageHTML.length > 100 && !pageHTML.includes('<!DOCTYPE')) {
      try {
        const decoded = atob(pageHTML);
        if (decoded.includes('<!DOCTYPE') || decoded.includes('<html')) {
          pageHTML = decoded;
        }
      } catch (e) {
        // Already plain text
      }
    }

    // Extract body if full HTML
    let bodyContent = pageHTML;
    const bodyMatch = pageHTML.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      bodyContent = bodyMatch[1];
    }

    // Get CSS and JS
    const css = website.sharedAssets?.css || '';
    const js = website.sharedAssets?.js || '';

    // Construct full HTML
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${website.manifest?.siteName || 'Website'}</title>
  <style>
    ${css}
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  ${bodyContent}
  <script>
    ${js}
  </script>
</body>
</html>
    `.trim();

    return fullHTML;
  }, [website]);

  // Update preview with debounce
  const updatePreview = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      const html = generatePreviewHTML();
      setPreviewHTML(html);
      
      // Update iframe
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const iframe = iframeRef.current;
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
      }
    }, 200); // 200ms debounce
  }, [generatePreviewHTML]);

  // Update preview when website changes
  useEffect(() => {
    updatePreview();
  }, [website, updatePreview]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    updatePreview();
    setTimeout(() => setIsRefreshing(false), 300);
  }, [updatePreview]);

  const handleZoomIn = useCallback(() => {
    if (onZoomChange) {
      onZoomChange(Math.min(zoom + 10, 200));
    }
  }, [zoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    if (onZoomChange) {
      onZoomChange(Math.max(zoom - 10, 25));
    }
  }, [zoom, onZoomChange]);

  const deviceSize = DEVICE_SIZES[device];
  const scaledWidth = (deviceSize.width * zoom) / 100;
  const scaledHeight = (deviceSize.height * zoom) / 100;

  return (
    <div className="flex flex-col h-full bg-muted/20">
      {/* Preview Controls */}
      <div className="border-b bg-background px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={device} onValueChange={(v) => setDevice(v as PreviewDevice)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desktop">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Desktop
                </div>
              </SelectItem>
              <SelectItem value="tablet">
                <div className="flex items-center gap-2">
                  <Tablet className="w-4 h-4" />
                  Tablet
                </div>
              </SelectItem>
              <SelectItem value="mobile">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Mobile
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 25}
              className="h-7 px-2"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="h-7 px-2"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-7"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <div
          className="bg-white shadow-lg border rounded-lg overflow-hidden"
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            transform: `scale(${Math.min(1, (window.innerHeight - 200) / scaledHeight)})`,
            transformOrigin: 'top center',
          }}
        >
          <iframe
            ref={iframeRef}
            srcDoc={previewHTML}
            className="w-full h-full border-0"
            style={{
              width: `${deviceSize.width}px`,
              height: `${deviceSize.height}px`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
            }}
            title="Website Preview"
          />
        </div>
      </div>
    </div>
  );
}

