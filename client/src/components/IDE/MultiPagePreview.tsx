/**
 * Multi-Page Website Preview Component
 * Displays tabbed navigation for viewing different pages
 */

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { GeneratedWebsitePackage } from '@/types/websiteBuilder';
import { FileCode2, Layout, Maximize2, Minimize2 } from 'lucide-react';

interface MultiPagePreviewProps {
  website: GeneratedWebsitePackage;
  onPageChange?: (pageId: string) => void;
  className?: string;
}

export function MultiPagePreview({ website, onPageChange, className = '' }: MultiPagePreviewProps) {
  const [activePageId, setActivePageId] = useState(website.activePageId);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate complete HTML for current page
  const currentPageHTML = useMemo(() => {
    // Try multiple possible file paths
    const pageFile =
      website.files[`pages/${activePageId}.html`] ||
      website.files[`pages/home.html`] ||
      website.files['index.html'] ||
      website.files['home.html'] ||
      Object.values(website.files).find((f: any) => f.type === 'html');

    console.log('[MultiPagePreview] Looking for page file:', {
      activePageId,
      fileFound: !!pageFile,
      filePath: pageFile?.path,
      availableFiles: Object.keys(website.files),
      contentLength: pageFile?.content?.length || 0,
    });

    if (!pageFile) {
      console.warn('[MultiPagePreview] No page file found for', activePageId);
      return '';
    }

    // Decode base64 if content is still encoded (safety check)
    let html = pageFile.content;
    if (html && typeof html === 'string') {
      // Check if content looks like base64 (long string without HTML tags)
      const isBase64 =
        html.length > 100 &&
        !html.includes('<!DOCTYPE') &&
        !html.includes('<html') &&
        !html.includes('<head');
      if (isBase64) {
        try {
          // Try to decode base64
          const decoded = atob(html);
          // Check if decoded content looks like HTML
          if (
            decoded.includes('<!DOCTYPE') ||
            decoded.includes('<html') ||
            decoded.includes('<head')
          ) {
            html = decoded;
          }
        } catch (e) {
          // If decoding fails, assume it's already plain text/HTML
          console.warn('Failed to decode base64 content, using as-is:', e);
        }
      }
    }

    // Decode CSS and JS if they're base64 encoded
    // Handle case where sharedAssets might be undefined (defensive programming)
    const sharedAssets = website.sharedAssets || { css: '', js: '' };
    let css = sharedAssets.css || '';
    let js = sharedAssets.js || '';

    // Decode CSS if needed
    if (
      css &&
      typeof css === 'string' &&
      css.length > 100 &&
      !css.includes('/*') &&
      !css.includes('{')
    ) {
      try {
        const decoded = atob(css);
        if (decoded.includes('/*') || decoded.includes('{')) {
          css = decoded;
        }
      } catch (e) {
        console.warn('Failed to decode CSS, using as-is:', e);
      }
    }

    // Decode JS if needed
    if (
      js &&
      typeof js === 'string' &&
      js.length > 100 &&
      !js.includes('//') &&
      !js.includes('function')
    ) {
      try {
        const decoded = atob(js);
        if (decoded.includes('//') || decoded.includes('function')) {
          js = decoded;
        }
      } catch (e) {
        console.warn('Failed to decode JS, using as-is:', e);
      }
    }

    // Inject shared CSS and JS
    if (html.includes('</head>')) {
      html = html.replace('</head>', `<style>${css}</style></head>`);
    }

    if (html.includes('</body>')) {
      html = html.replace('</body>', `<script>${js}</script></body>`);
    }

    return html;
  }, [activePageId, website.files, website.sharedAssets]);

  // Safety check: website.pages might not exist or might not be an array
  const sortedPages =
    website.pages && Array.isArray(website.pages)
      ? [...website.pages].sort((a, b) => (a.order || 0) - (b.order || 0))
      : website.manifest?.pages && Array.isArray(website.manifest.pages)
        ? [...website.manifest.pages].sort((a, b) => (a.order || 0) - (b.order || 0))
        : [];

  // Validate activePageId against sortedPages to prevent Tabs value mismatch
  // If sortedPages is empty, use "no-pages" as the value
  // If activePageId doesn't exist in sortedPages, use the first page's slug or "no-pages"
  const validatedActivePageId =
    sortedPages.length === 0
      ? 'no-pages'
      : sortedPages.some(page => page.slug === activePageId)
        ? activePageId
        : sortedPages[0]?.slug || 'no-pages';

  const handlePageChange = (pageId: string) => {
    // Only update activePageId if the pageId is valid (not "no-pages" and exists in sortedPages)
    // This prevents setting an invalid activePageId that would cause Tabs value mismatch
    if (pageId === 'no-pages') {
      // Don't update activePageId when "no-pages" is selected (it's just a placeholder)
      return;
    }

    // Normalize pageId - handle "home" vs "Home" vs actual slug
    const normalizedPageId = pageId.toLowerCase();
    const matchingPage = sortedPages.find(
      page =>
        page.slug.toLowerCase() === normalizedPageId ||
        (page.slug.toLowerCase() === 'home' && normalizedPageId === 'home')
    );

    // Validate that the pageId exists in sortedPages before setting it
    if (matchingPage) {
      setActivePageId(matchingPage.slug);
      onPageChange?.(matchingPage.slug);
    } else {
      // If invalid, fall back to first page or keep current valid page
      const fallbackPageId = sortedPages[0]?.slug || validatedActivePageId;
      if (fallbackPageId !== activePageId && fallbackPageId !== 'no-pages') {
        setActivePageId(fallbackPageId);
        onPageChange?.(fallbackPageId);
      }
    }
  };

  return (
    <div
      className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-full w-full'} ${className}`}
    >
      {/* Page Navigation Tabs */}
      <div className="border-b bg-background flex-shrink-0">
        <Tabs value={validatedActivePageId} onValueChange={handlePageChange} className="w-full">
          <div className="flex items-center gap-2 px-4 py-2">
            <Layout className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Pages:</span>
            <TabsList className="h-9">
              {sortedPages.length > 0 ? (
                sortedPages.map(page => (
                  <TabsTrigger
                    key={page.slug}
                    value={page.slug}
                    className="text-sm"
                    data-testid={`tab-page-${page.slug}`}
                  >
                    {page.title}
                    {page.slug === 'home' && (
                      <Badge variant="secondary" className="ml-2 h-5 text-xs">
                        Home
                      </Badge>
                    )}
                  </TabsTrigger>
                ))
              ) : (
                <TabsTrigger value="no-pages" disabled className="text-sm text-muted-foreground">
                  No pages available
                </TabsTrigger>
              )}
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <FileCode2 className="w-3 h-3 mr-1" />
                {sortedPages.length} {sortedPages.length === 1 ? 'Page' : 'Pages'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-8 w-8 p-0"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Preview Iframe */}
      <div className="flex-1 bg-white dark:bg-gray-900 p-4 min-h-0 overflow-hidden">
        <Card className="h-full w-full overflow-hidden shadow-lg bg-white dark:bg-white">
          <iframe
            key={activePageId}
            srcDoc={currentPageHTML}
            title={`Preview: ${activePageId}`}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms"
            data-testid={`iframe-preview-${activePageId}`}
            style={{ backgroundColor: 'white' }}
            // Suppress console warning about sandbox - this is intentional for preview functionality
            onLoad={() => {
              // Silently handle iframe load
            }}
          />
        </Card>
      </div>

      {/* Page Info Footer */}
      <div className="border-t bg-background px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Current Page:</span>{' '}
            {sortedPages.find(p => p.slug === activePageId)?.title ||
              website.manifest?.pages?.find((p: any) => p.slug === activePageId)?.title ||
              activePageId}
          </div>
          <div>
            <span className="font-medium">SEO Title:</span>{' '}
            {sortedPages.find(p => p.slug === activePageId)?.seo?.title ||
              website.manifest?.pages?.find((p: any) => p.slug === activePageId)?.seo?.title ||
              'N/A'}
          </div>
          <div>
            <span className="font-medium">Sections:</span>{' '}
            {sortedPages.find(p => p.slug === activePageId)?.sections?.length ||
              website.manifest?.pages?.find((p: any) => p.slug === activePageId)?.sections
                ?.length ||
              0}
          </div>
        </div>
      </div>
    </div>
  );
}
