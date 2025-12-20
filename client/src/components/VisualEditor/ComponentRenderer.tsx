/**
 * Component Renderer
 * Renders website components in the visual editor with selection capability
 */

import { useCallback, useMemo, useRef, useEffect } from 'react';
import type { GeneratedWebsitePackage } from '@/types/websiteBuilder';
import type { SelectedElement } from './VisualEditor';

export interface ComponentRendererProps {
  website: GeneratedWebsitePackage;
  pageSlug: string;
  selectedElement: SelectedElement | null;
  onElementSelect: (element: SelectedElement | null) => void;
  onWebsiteUpdate: (updated: GeneratedWebsitePackage) => void;
}

export function ComponentRenderer({
  website,
  pageSlug,
  selectedElement,
  onElementSelect,
  onWebsiteUpdate,
}: ComponentRendererProps) {
  // Get page HTML content
  const pageHtml = useMemo(() => {
    const pageFile =
      website.files[`pages/${pageSlug}.html`] ||
      website.files[`pages/home.html`] ||
      website.files['index.html'] ||
      website.files['home.html'] ||
      Object.values(website.files).find((f: any) => f.type === 'html');

    if (!pageFile) return '';

    let html = pageFile.content;
    // Handle base64 encoding if needed
    if (html && typeof html === 'string' && html.length > 100 && !html.includes('<!DOCTYPE')) {
      try {
        const decoded = atob(html);
        if (decoded.includes('<!DOCTYPE') || decoded.includes('<html')) {
          html = decoded;
        }
      } catch (e) {
        // Already plain text
      }
    }

    return html || '';
  }, [website, pageSlug]);

  // Get CSS and JS for the page
  const sharedAssets = website.sharedAssets || { css: '', js: '' };
  let css = sharedAssets.css || '';
  let js = sharedAssets.js || '';

  // Handle base64 encoding for CSS/JS
  if (css && typeof css === 'string' && css.length > 100 && !css.includes('/*') && !css.includes('{')) {
    try {
      const decoded = atob(css);
      if (decoded.includes('/*') || decoded.includes('{')) {
        css = decoded;
      }
    } catch (e) {
      // Already plain text
    }
  }

  if (js && typeof js === 'string' && js.length > 100 && !js.includes('function') && !js.includes('const')) {
    try {
      const decoded = atob(js);
      if (decoded.includes('function') || decoded.includes('const')) {
        js = decoded;
      }
    } catch (e) {
      // Already plain text
    }
  }

  // Extract body content from HTML
  const bodyContent = useMemo(() => {
    if (!pageHtml) return '';
    
    // Try to extract body content
    const bodyMatch = pageHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      return bodyMatch[1];
    }
    
    // If no body tag, return the whole HTML
    return pageHtml;
  }, [pageHtml]);

  const handleElementClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    
    // Find the closest editable element
    const element = target.closest('[data-component-id]') as HTMLElement;
    if (element) {
      const componentId = element.getAttribute('data-component-id');
      const componentType = element.getAttribute('data-component-type') || 'element';
      
      onElementSelect({
        id: componentId || target.id || 'unknown',
        type: componentType as 'component' | 'section' | 'element',
        path: [], // TODO: Build path from DOM
      });
    } else {
      onElementSelect(null);
    }
  }, [onElementSelect]);

  // Create complete HTML document with editor enhancements
  const completeHtml = useMemo(() => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${css}
    
    /* Editor enhancements */
    [data-component-id] {
      position: relative;
      outline: 2px solid transparent;
      outline-offset: 0px;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    /* Hover effect */
    [data-component-id].editor-hover {
      outline: 2px dashed rgba(59, 130, 246, 0.6);
      outline-offset: 2px;
    }

    /* Selected effect */
    [data-component-id].editor-selected {
      outline: 3px solid rgb(59, 130, 246);
      outline-offset: 3px;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* Dragging effect */
    [data-component-id].editor-dragging {
      opacity: 0.5;
      outline: 3px dashed rgb(59, 130, 246);
      cursor: move !important;
    }

    /* Prevent text selection during editing */
    [data-component-id] * {
      user-select: none;
    }

    /* Re-enable text selection for text nodes */
    [data-component-id] p,
    [data-component-id] h1,
    [data-component-id] h2,
    [data-component-id] h3,
    [data-component-id] h4,
    [data-component-id] h5,
    [data-component-id] h6,
    [data-component-id] span,
    [data-component-id] a {
      user-select: text;
      cursor: text;
    }
  </style>
</head>
<body>
  ${bodyContent}
  <script>${js}</script>
</body>
</html>
    `.trim();
  }, [css, js, bodyContent]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle clicks from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'component-click') {
        onElementSelect({
          id: e.data.componentId,
          type: e.data.componentType as 'component' | 'section' | 'element',
          path: [],
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onElementSelect]);

  // Inject click handlers and styling into iframe once loaded
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // Inject editor styles and event handlers
      const script = iframeDoc.createElement('script');
      script.textContent = `
        (function() {
          // Make components draggable for reordering
          function makeComponentsDraggable() {
            const components = document.querySelectorAll('[data-component-id]');
            components.forEach(comp => {
              comp.setAttribute('draggable', 'true');

              comp.addEventListener('dragstart', function(e) {
                const componentId = comp.getAttribute('data-component-id');
                e.dataTransfer.setData('text/plain', componentId);
                e.dataTransfer.effectAllowed = 'move';
                comp.classList.add('editor-dragging');

                window.parent.postMessage({
                  type: 'component-dragstart',
                  componentId
                }, '*');
              });

              comp.addEventListener('dragend', function(e) {
                comp.classList.remove('editor-dragging');
                window.parent.postMessage({
                  type: 'component-dragend'
                }, '*');
              });
            });
          }

          // Initialize on load
          makeComponentsDraggable();

          // Re-initialize after DOM changes
          const observer = new MutationObserver(makeComponentsDraggable);
          observer.observe(document.body, { childList: true, subtree: true });

          // Click handler for components
          document.addEventListener('click', function(e) {
            const target = e.target.closest('[data-component-id]');
            if (target) {
              e.preventDefault();
              e.stopPropagation();

              const componentId = target.getAttribute('data-component-id');
              const componentType = target.getAttribute('data-component-type') || 'component';

              window.parent.postMessage({
                type: 'component-click',
                componentId,
                componentType
              }, '*');

              // Highlight selected element
              document.querySelectorAll('[data-component-id]').forEach(el => {
                el.classList.remove('editor-selected');
              });
              target.classList.add('editor-selected');
            }
          });

          // Hover effect
          document.addEventListener('mouseover', function(e) {
            const target = e.target.closest('[data-component-id]');
            if (target && !target.classList.contains('editor-selected')) {
              target.classList.add('editor-hover');
            }
          });

          document.addEventListener('mouseout', function(e) {
            const target = e.target.closest('[data-component-id]');
            if (target) {
              target.classList.remove('editor-hover');
            }
          });
        })();
      `;
      iframeDoc.body.appendChild(script);
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [completeHtml]);

  // Apply selection styling based on selectedElement prop
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow?.document) return;

    const iframeDoc = iframe.contentWindow.document;

    // Remove previous selections
    iframeDoc.querySelectorAll('[data-component-id]').forEach(el => {
      el.classList.remove('editor-selected');
    });

    // Add selection to current element
    if (selectedElement) {
      const targetEl = iframeDoc.querySelector(`[data-component-id="${selectedElement.id}"]`);
      if (targetEl) {
        targetEl.classList.add('editor-selected');
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedElement]);

  return (
    <div className="relative w-full">
      {/* Render full HTML in iframe for proper isolation */}
      <iframe
        ref={iframeRef}
        title="Visual Editor Preview"
        srcDoc={completeHtml}
        className="w-full border-0"
        style={{ minHeight: '100vh' }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-modals"
      />
    </div>
  );
}

