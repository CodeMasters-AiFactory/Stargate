/**
 * Component Canvas
 * The main editing area where components are placed and arranged
 */

import { useCallback, useMemo, useState, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Grid, AlignCenter, AlignLeft, AlignRight, AlignJustify } from 'lucide-react';
import type { GeneratedWebsitePackage } from '@/types/websiteBuilder';
import type { SelectedElement } from './VisualEditor';
import { ComponentRenderer } from './ComponentRenderer';
import { DropZoneIndicator } from './DropZoneIndicator';

export interface ComponentCanvasProps {
  website: GeneratedWebsitePackage;
  onWebsiteUpdate: (updated: GeneratedWebsitePackage) => void;
  selectedElement: SelectedElement | null;
  onElementSelect: (element: SelectedElement | null) => void;
  selectionMode: 'select' | 'move' | 'resize';
}

export function ComponentCanvas({
  website,
  onWebsiteUpdate,
  selectedElement,
  onElementSelect,
  selectionMode,
}: ComponentCanvasProps) {
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [dropPosition, setDropPosition] = useState<{ x: number; y: number } | null>(null);
  const [insertionIndex, setInsertionIndex] = useState<number>(-1);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Parse components from HTML to get their positions
  const parseComponents = useCallback((html: string) => {
    if (!html) return [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const components = Array.from(doc.querySelectorAll('[data-component-id]'));

      return components.map((el, index) => ({
        id: el.getAttribute('data-component-id') || `comp-${index}`,
        html: el.outerHTML,
        index
      }));
    } catch (e) {
      console.error('Failed to parse components:', e);
      return [];
    }
  }, []);

  // Calculate insertion index based on drop Y position
  const calculateInsertionIndex = useCallback((dropY: number) => {
    if (!canvasRef.current) return -1;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const relativeY = dropY - canvasRect.top;

    // Get all rendered components in the iframe
    const iframe = canvasRef.current.querySelector('iframe');
    if (!iframe?.contentWindow?.document) return -1;

    const components = Array.from(
      iframe.contentWindow.document.querySelectorAll('[data-component-id]')
    );

    if (components.length === 0) return 0; // First component

    // Find insertion point based on Y coordinate
    for (let i = 0; i < components.length; i++) {
      const comp = components[i] as HTMLElement;
      const rect = comp.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;

      if (relativeY < midpoint) {
        return i; // Insert before this component
      }
    }

    return components.length; // Insert at end
  }, []);

  const handleComponentDrop = useCallback(async (componentId: string, dropOffset?: { x: number; y: number }) => {
    try {
      // Generate component HTML from server
      const response = await fetch('/api/visual-editor/generate-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate component');
      }

      const { html, css, js } = await response.json();

      // Get current page HTML
      const activePageId = website.activePageId || 'home';
      const pageFileKey = `pages/${activePageId}.html`;
      const currentPageFile = website.files[pageFileKey] || website.files['index.html'] || website.files['home.html'];
      
      let currentHTML = '';
      if (currentPageFile && typeof currentPageFile === 'object' && 'content' in currentPageFile) {
        currentHTML = currentPageFile.content as string;
      } else if (typeof currentPageFile === 'string') {
        currentHTML = currentPageFile;
      }

      // Extract body content if full HTML
      let bodyContent = currentHTML;
      const bodyMatch = currentHTML.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      if (bodyMatch) {
        bodyContent = bodyMatch[1];
      }

      // Calculate insertion index from drop position
      let targetIndex = -1;
      if (dropOffset) {
        targetIndex = calculateInsertionIndex(dropOffset.y);
      }

      // Insert component at calculated position
      let newBodyContent: string;
      if (targetIndex === -1 || targetIndex >= Number.MAX_SAFE_INTEGER) {
        // Append at end (fallback behavior)
        newBodyContent = bodyContent + '\n' + html;
      } else {
        // Parse existing components
        const components = parseComponents(bodyContent);

        if (components.length === 0 || targetIndex === 0) {
          // Insert at beginning
          newBodyContent = html + '\n' + bodyContent;
        } else if (targetIndex >= components.length) {
          // Insert at end
          newBodyContent = bodyContent + '\n' + html;
        } else {
          // Insert between components
          const insertAfterComponent = components[targetIndex - 1];
          const insertPoint = bodyContent.indexOf(insertAfterComponent.html) + insertAfterComponent.html.length;
          newBodyContent =
            bodyContent.slice(0, insertPoint) +
            '\n' + html + '\n' +
            bodyContent.slice(insertPoint);
        }
      }

      // Reconstruct full HTML
      let newHTML = currentHTML;
      if (bodyMatch) {
        newHTML = currentHTML.replace(/<body[^>]*>[\s\S]*<\/body>/i, `<body>${newBodyContent}</body>`);
      } else {
        newHTML = currentHTML + '\n' + html;
      }

      // Update website package
      const updatedFiles = {
        ...website.files,
        [pageFileKey]: {
          ...(typeof currentPageFile === 'object' ? currentPageFile : {}),
          path: pageFileKey,
          type: 'html',
          content: newHTML,
          checksum: '',
        },
      };

      // Add CSS and JS to shared assets
      const updatedSharedAssets = {
        css: (website.sharedAssets?.css || '') + '\n' + css,
        js: (website.sharedAssets?.js || '') + '\n' + js,
      };

      const updatedWebsite: GeneratedWebsitePackage = {
        ...website,
        files: updatedFiles,
        sharedAssets: updatedSharedAssets,
      };

      onWebsiteUpdate(updatedWebsite);
    } catch (error) {
      console.error('Failed to add component:', error);
    }
  }, [website, onWebsiteUpdate, calculateInsertionIndex, parseComponents]);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item: { component: { id: string; name?: string } }, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      // Capture drop position
      const offset = monitor.getClientOffset();
      if (offset) {
        handleComponentDrop(item.component.id, offset);
      } else {
        handleComponentDrop(item.component.id);
      }
    },
    hover: (item, monitor) => {
      // Track hover position for visual feedback
      const offset = monitor.getClientOffset();
      if (offset) {
        setDropPosition(offset);
        const index = calculateInsertionIndex(offset.y);
        setInsertionIndex(index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [handleComponentDrop, calculateInsertionIndex]);

  const activePageId = website.activePageId || 'home';
  const activePage = website.manifest?.pages?.find(p => p.slug === activePageId);

  // Calculate drop zone indicator position
  const dropZonePosition = useMemo(() => {
    if (!isOver || !canvasRef.current || insertionIndex === -1) {
      return null;
    }

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const iframe = canvasRef.current.querySelector('iframe');

    if (!iframe?.contentWindow?.document) {
      return {
        top: canvasRect.top + 20,
        left: canvasRect.left + 32,
        width: canvasRect.width - 64,
      };
    }

    const components = Array.from(
      iframe.contentWindow.document.querySelectorAll('[data-component-id]')
    );

    if (components.length === 0 || insertionIndex === 0) {
      // Show at top
      return {
        top: canvasRect.top + 32,
        left: canvasRect.left + 32,
        width: canvasRect.width - 64,
      };
    }

    if (insertionIndex >= components.length) {
      // Show at bottom
      const lastComp = components[components.length - 1] as HTMLElement;
      const lastRect = lastComp.getBoundingClientRect();
      return {
        top: lastRect.bottom + 8,
        left: canvasRect.left + 32,
        width: canvasRect.width - 64,
      };
    }

    // Show between components
    const targetComp = components[insertionIndex] as HTMLElement;
    const targetRect = targetComp.getBoundingClientRect();
    return {
      top: targetRect.top - 4,
      left: canvasRect.left + 32,
      width: canvasRect.width - 64,
    };
  }, [isOver, insertionIndex]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/20">
      {/* Canvas Header */}
      <div className="border-b bg-background px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {activePage?.title || 'Page'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {selectionMode === 'select' && 'Click to select elements'}
            {selectionMode === 'move' && 'Drag to move elements'}
            {selectionMode === 'resize' && 'Drag corners to resize'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showGrid ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className="h-7"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={snapToGrid ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSnapToGrid(!snapToGrid)}
            className="h-7"
            disabled={!showGrid}
          >
            Snap
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <ScrollArea className="flex-1">
        <div
          ref={(node) => {
            drop(node);
            if (node) canvasRef.current = node;
          }}
          className={`min-h-full p-8 transition-colors relative ${
            isOver && canDrop
              ? 'bg-primary/5 border-2 border-dashed border-primary'
              : ''
          }`}
          style={{
            minHeight: '100vh',
            maxWidth: '1200px',
            margin: '0 auto',
            background: '#fff',
            backgroundImage: showGrid
              ? 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)'
              : 'none',
            backgroundSize: showGrid ? '20px 20px' : 'auto',
          }}
        >
          {activePage ? (
            <ComponentRenderer
              website={website}
              pageSlug={activePageId}
              selectedElement={selectedElement}
              onElementSelect={onElementSelect}
              onWebsiteUpdate={onWebsiteUpdate}
            />
          ) : (
            <div className="text-center text-muted-foreground py-20">
              <p>No page content available</p>
              <p className="text-sm mt-2">Drag components from the palette to start building</p>
            </div>
          )}

          {/* Drop Zone Indicator - Shows where component will be inserted */}
          {dropZonePosition && (
            <DropZoneIndicator
              position={dropZonePosition}
              isActive={isOver && canDrop}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

