/**
 * Merge Preview Component
 * Displays design template (LEFT) and content template (RIGHT) side-by-side
 * Allows user to preview both before merging
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  Layers,
  FileText,
  Palette,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { BrandTemplate } from '@/types/templates';

interface MergePreviewProps {
  designTemplate: BrandTemplate;
  contentTemplate: BrandTemplate;
  onMerge: () => void;
  onBack?: () => void;
}

export function MergePreview({
  designTemplate,
  contentTemplate,
  onMerge,
  onBack,
}: MergePreviewProps) {
  const [designHtml, setDesignHtml] = useState<string>('');
  const [contentHtml, setContentHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load template HTML content
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get HTML from template contentData or fetch from API
        let designHtmlContent = designTemplate.contentData?.html || '';
        let contentHtmlContent = contentTemplate.contentData?.html || '';

        // If HTML not in template, fetch from API
        if (!designHtmlContent) {
          try {
            const response = await fetch(`/api/templates/${designTemplate.id}/html`);
            if (response.ok) {
              const data = await response.json();
              designHtmlContent = data.html || '';
            }
          } catch (err) {
            console.warn('[MergePreview] Failed to fetch design template HTML:', err);
          }
        }

        if (!contentHtmlContent) {
          try {
            const response = await fetch(`/api/templates/${contentTemplate.id}/html`);
            if (response.ok) {
              const data = await response.json();
              contentHtmlContent = data.html || '';
            }
          } catch (err) {
            console.warn('[MergePreview] Failed to fetch content template HTML:', err);
          }
        }

        if (!designHtmlContent && !contentHtmlContent) {
          throw new Error('Templates have no HTML content available');
        }

        // Combine HTML with CSS if available
        const designCss = designTemplate.css || '';
        const contentCss = contentTemplate.css || '';

        setDesignHtml(
          designHtmlContent + (designCss ? `<style>${designCss}</style>` : '')
        );
        setContentHtml(
          contentHtmlContent + (contentCss ? `<style>${contentCss}</style>` : '')
        );

        setLoading(false);
      } catch (err) {
        console.error('[MergePreview] Error loading templates:', err);
        setError(err instanceof Error ? err.message : 'Failed to load templates');
        setLoading(false);
      }
    };

    loadTemplates();
  }, [designTemplate, contentTemplate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="text-destructive">{error}</p>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Preview Templates</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Review your design and content templates before merging
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-2">
                <Palette className="w-3 h-3" />
                Design Selected
              </Badge>
              <Badge variant="outline" className="gap-2">
                <FileText className="w-3 h-3" />
                Content Selected
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Design Template (LEFT) */}
        <div className="flex-1 flex flex-col border-r">
          <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              <span className="font-semibold">DESIGN SOURCE</span>
              <Badge variant="secondary">{designTemplate.name}</Badge>
            </div>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 overflow-auto bg-white">
            {designHtml ? (
              <iframe
                srcDoc={designHtml}
                className="w-full h-full border-0"
                title="Design Template Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No HTML content available
              </div>
            )}
          </div>
        </div>

        {/* Content Template (RIGHT) */}
        <div className="flex-1 flex flex-col">
          <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-semibold">CONTENT SOURCE</span>
              <Badge variant="secondary">{contentTemplate.name}</Badge>
            </div>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 overflow-auto bg-white">
            {contentHtml ? (
              <iframe
                srcDoc={contentHtml}
                className="w-full h-full border-0"
                title="Content Template Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No HTML content available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <p>
                The design structure will be preserved, and content text will be injected into matching sections.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {onBack && (
                <Button onClick={onBack} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button onClick={onMerge} size="lg" className="gap-2">
                <Layers className="w-4 h-4" />
                Merge Templates
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

