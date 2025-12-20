/**
 * Real-Time Preview Panel
 * Shows website building in real-time as pages are generated
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  CheckCircle2,
  Clock,
  Loader2,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

export interface GeneratedPage {
  index: number;
  name: string;
  html: string;
  css: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  progress: number; // 0-100
  phase?: string;
}

interface RealTimePreviewPanelProps {
  currentPage: number;
  totalPages: number;
  pages: GeneratedPage[];
  onPageChange?: (index: number) => void;
}

export function RealTimePreviewPanel({
  currentPage,
  totalPages,
  pages,
  onPageChange,
}: RealTimePreviewPanelProps) {
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');

  // Auto-select current page or first complete page
  useEffect(() => {
    if (selectedPageIndex === null) {
      const completePage = pages.find(p => p.status === 'complete');
      if (completePage) {
        setSelectedPageIndex(completePage.index);
      } else if (pages.length > 0) {
        setSelectedPageIndex(pages[0].index);
      }
    }
  }, [pages, selectedPageIndex]);

  // Update preview HTML when selected page changes
  useEffect(() => {
    if (selectedPageIndex !== null) {
      const page = pages.find(p => p.index === selectedPageIndex);
      if (page && page.html) {
        const fullHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>${page.css}</style>
            </head>
            <body>${page.html}</body>
          </html>
        `;
        setPreviewHtml(fullHtml);
      }
    }
  }, [selectedPageIndex, pages]);

  const selectedPage = pages.find(p => p.index === selectedPageIndex);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Real-Time Preview</h3>
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} • {pages.filter(p => p.status === 'complete').length} complete
            </p>
          </div>
          <Badge variant="outline" className="gap-2">
            <Eye className="w-3 h-3" />
            Live Preview
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Page List (Left Sidebar) */}
        <div className="w-64 border-r bg-muted/30 overflow-y-auto">
          <div className="p-4 space-y-2">
            <h4 className="text-sm font-semibold mb-3">Pages</h4>
            {pages.map((page) => {
              const isSelected = selectedPageIndex === page.index;
              const isCurrent = currentPage === page.index + 1;

              return (
                <button
                  key={page.index}
                  onClick={() => {
                    setSelectedPageIndex(page.index);
                    onPageChange?.(page.index);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-primary/10 border-primary'
                      : 'bg-background hover:bg-muted/50 border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{page.name}</span>
                    </div>
                    {page.status === 'complete' && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    {page.status === 'generating' && (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    )}
                    {page.status === 'pending' && (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  {isCurrent && (
                    <Badge variant="secondary" className="text-xs">
                      Generating...
                    </Badge>
                  )}
                  {page.status === 'generating' && (
                    <div className="mt-2">
                      <Progress value={page.progress} className="h-1" />
                      <p className="text-xs text-muted-foreground mt-1">{page.phase}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview (Right Side) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedPage && selectedPage.status === 'complete' && previewHtml ? (
            <>
              <div className="border-b bg-muted/30 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedPage.name}</span>
                  <Badge variant="outline" className="text-xs">
                    Complete
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ImageIcon className="w-3 h-3" />
                  {selectedPage.html.match(/<img/gi)?.length || 0} images
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-white">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full border-0"
                  title={`Preview: ${selectedPage.name}`}
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            </>
          ) : selectedPage && selectedPage.status === 'generating' ? (
            <div className="flex-1 flex items-center justify-center bg-muted/30">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                <div>
                  <p className="font-medium">Generating {selectedPage.name}...</p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPage.phase}</p>
                  <Progress value={selectedPage.progress} className="w-64 mt-4" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/30">
              <div className="text-center text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Page pending generation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

