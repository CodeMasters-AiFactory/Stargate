/**
 * Empty Template Preview - Phase 2.5
 * 
 * Shows the selected design template with ALL content stripped.
 * This demonstrates to the user what the "empty shell" looks like
 * before content is added from the content template.
 * 
 * Features:
 * - Full preview of stripped template
 * - Visual comparison (before/after)
 * - Clear indication of what will be filled by AI
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eraser,
  Sparkles,
} from 'lucide-react';
import { stripContent, createStrippedDocument } from '@/utils/contentStripper';
import type { BrandTemplate } from '@/types/templates';

interface EmptyTemplatePreviewProps {
  designTemplate: BrandTemplate;
  onContinue: (strippedHtml: string) => void;
  onBack?: () => void;
}

export function EmptyTemplatePreview({
  designTemplate,
  onContinue,
  onBack,
}: EmptyTemplatePreviewProps) {
  const [originalHtml, setOriginalHtml] = useState<string>('');
  const [strippedHtml, setStrippedHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'stripped' | 'original'>('stripped');

  // Load and strip template
  useEffect(() => {
    const loadAndStrip = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get HTML from template contentData or fetch from API
        let htmlContent = designTemplate.contentData?.html || '';

        // If HTML not in template, fetch from API
        if (!htmlContent) {
          try {
            const response = await fetch(`/api/templates/${designTemplate.id}/html`);
            if (response.ok) {
              const data = await response.json();
              htmlContent = data.html || '';
            }
          } catch (err) {
            console.warn('[EmptyTemplatePreview] Failed to fetch template HTML:', err);
          }
        }

        if (!htmlContent) {
          throw new Error('Template has no HTML content available');
        }

        // Store original
        const css = designTemplate.css || '';
        const fullOriginal = createStrippedDocument(htmlContent, css);
        setOriginalHtml(htmlContent + (css ? `<style>${css}</style>` : ''));

        // Strip content
        console.log('[EmptyTemplatePreview] Stripping content from template...');
        const stripped = stripContent(htmlContent);
        const fullStripped = createStrippedDocument(stripped, css);
        setStrippedHtml(fullStripped);

        console.log('[EmptyTemplatePreview] Content stripped successfully');
        setLoading(false);
      } catch (err) {
        console.error('[EmptyTemplatePreview] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to process template');
        setLoading(false);
      }
    };

    loadAndStrip();
  }, [designTemplate]);

  const handleContinue = () => {
    onContinue(strippedHtml);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">Stripping content from template...</p>
          <p className="text-slate-500 text-sm">Creating empty design shell</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-400 text-lg mb-4">{error}</p>
        {onBack && (
          <Button onClick={onBack} variant="outline" className="border-slate-600 text-slate-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back to Template Selection
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 absolute inset-0">
      {/* Minimal Floating Header - Overlays the preview */}
      <div className="absolute top-0 left-0 right-0 z-10 px-3 py-1.5 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-cyan-600/30 text-cyan-300 border-0 text-xs px-2 py-0.5">
            {designTemplate.name}
          </Badge>
          <span className="text-[10px] text-green-400">✓ Design Preserved</span>
          <span className="text-[10px] text-purple-400">✨ Content Stripped</span>
        </div>

        {/* View Toggle */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'stripped' | 'original')}>
          <TabsList className="bg-slate-800/80 border border-slate-700/50 h-6">
            <TabsTrigger 
              value="stripped" 
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-[10px] h-5 px-2"
            >
              Empty
            </TabsTrigger>
            <TabsTrigger 
              value="original"
              className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-[10px] h-5 px-2"
            >
              Original
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* FULL SCREEN Preview Area */}
      <div className="flex-1 w-full h-full pt-8">
        {activeView === 'stripped' ? (
          <iframe
            srcDoc={strippedHtml}
            className="w-full h-full border-0"
            title="Empty Template Preview"
            sandbox="allow-same-origin allow-scripts"
            style={{ minHeight: '800px', height: '100%' }}
          />
        ) : (
          <iframe
            srcDoc={originalHtml}
            className="w-full h-full border-0"
            title="Original Template Preview"
            sandbox="allow-same-origin allow-scripts"
            style={{ minHeight: '800px', height: '100%' }}
          />
        )}
      </div>

      {/* Minimal Floating Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-3 py-1.5 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700/50 flex items-center justify-end gap-2">
        {onBack && (
          <Button onClick={onBack} variant="ghost" size="sm" className="text-slate-400 hover:text-white h-7 text-xs">
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back
          </Button>
        )}
        <Button 
          onClick={handleContinue} 
          size="sm"
          className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white h-7 text-xs"
        >
          Continue to Content Selection
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export default EmptyTemplatePreview;

