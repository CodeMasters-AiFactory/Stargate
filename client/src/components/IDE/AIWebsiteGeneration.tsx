/**
 * AI Website Generation - Phase 7 (LAST before Final Approval)
 * Uses EXACT scraped templates from database/files
 * Real-time website generation with progress tracking
 * 
 * Features:
 * - Loads EXACT scraped template HTML/CSS from backend
 * - Only transforms client info (name, phone, email, images)
 * - Real-time progress updates via SSE
 * - Step-by-step generation display
 * - Live preview as site builds
 * - Error handling and retry
 * - Estimated time remaining
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  Wand2,
  Palette,
  FileText,
  Code,
  Image,
  CheckCircle,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ArrowRight,
  Zap,
  Clock,
  RefreshCw,
  Eye,
} from 'lucide-react';
import type { BrandTemplate } from '@/types/templates';
import type { WebsiteRequirements } from '@/types/websiteBuilder';

interface GenerationStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed' | 'error';
  message?: string;
  progress?: number;
}

interface GeneratedWebsite {
  html: string;
  css: string;
  js?: string;
  pages?: Array<{ slug: string; html: string }>;
}

interface AIWebsiteGenerationProps {
  designTemplates: BrandTemplate[];
  contentTemplates: BrandTemplate[];
  requirements: WebsiteRequirements;
  imageSource: 'own' | 'leonardo';
  onComplete: (website: GeneratedWebsite) => void;
  onBack?: () => void;
}

// Generation steps
const GENERATION_STEPS: Omit<GenerationStep, 'status'>[] = [
  { id: 'analyze', label: 'Analyzing Templates', icon: <Sparkles className="w-5 h-5" /> },
  { id: 'design', label: 'Creating Design System', icon: <Palette className="w-5 h-5" /> },
  { id: 'content', label: 'Generating Content', icon: <FileText className="w-5 h-5" /> },
  { id: 'images', label: 'Processing Images', icon: <Image className="w-5 h-5" /> },
  { id: 'code', label: 'Building Website', icon: <Code className="w-5 h-5" /> },
  { id: 'optimize', label: 'Optimizing for SEO', icon: <Zap className="w-5 h-5" /> },
  { id: 'finalize', label: 'Finalizing', icon: <CheckCircle className="w-5 h-5" /> },
];

export function AIWebsiteGeneration({
  designTemplates,
  contentTemplates,
  requirements,
  imageSource,
  onComplete,
  onBack,
}: AIWebsiteGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<GenerationStep[]>(
    GENERATION_STEPS.map(step => ({ ...step, status: 'pending' }))
  );
  const [overallProgress, setOverallProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [generatedWebsite, setGeneratedWebsite] = useState<GeneratedWebsite | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);

  // Update step status
  const updateStep = useCallback((stepId: string, updates: Partial<GenerationStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  }, []);

  // Start generation - NOW CALLS BACKEND API WITH EXACT TEMPLATES
  const startGeneration = async () => {
    setIsGenerating(true);
    setHasStarted(true);
    setError(null);
    setCurrentStep(0);
    setOverallProgress(0);
    startTimeRef.current = Date.now();

    // Reset all steps to pending
    setSteps(GENERATION_STEPS.map(step => ({ ...step, status: 'pending' })));

    abortControllerRef.current = new AbortController();

    try {
      // Show loading preview
      const partialHtml = generatePartialPreview(requirements);
      setPreviewHtml(partialHtml);

      // CRITICAL: Call backend API to use EXACT scraped templates
      console.log('[AIWebsiteGeneration] Calling backend API with templates:', {
        designTemplates: designTemplates.length,
        contentTemplates: contentTemplates.length,
      });

      updateStep('analyze', { status: 'active', message: 'Loading scraped template...' });
      setOverallProgress(5);

      const response = await fetch('/api/website-builder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements,
          selectedDesignTemplates: designTemplates,
          selectedContentTemplates: contentTemplates,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Generation failed');
      }

      // Process SSE stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              // Update progress based on backend stage
              if (data.stage) {
                const stage = data.stage.toLowerCase();
                const progress = data.progress || 0;
                
                setOverallProgress(progress);

                // Map backend stages to frontend steps
                if (stage.includes('template-loading') || stage.includes('analyzing')) {
                  updateStep('analyze', { status: 'active', message: data.message || 'Analyzing templates...' });
                } else if (stage.includes('design') || stage.includes('style')) {
                  updateStep('design', { status: 'active', message: data.message || 'Creating design system...' });
                  updateStep('analyze', { status: 'completed' });
                } else if (stage.includes('content') || stage.includes('copy')) {
                  updateStep('content', { status: 'active', message: data.message || 'Generating content...' });
                  updateStep('design', { status: 'completed' });
                } else if (stage.includes('image')) {
                  updateStep('images', { status: 'active', message: data.message || 'Processing images...' });
                  updateStep('content', { status: 'completed' });
                } else if (stage.includes('build') || stage.includes('code') || stage.includes('template-transforming')) {
                  updateStep('code', { status: 'active', message: data.message || 'Building website...' });
                  updateStep('images', { status: 'completed' });
                } else if (stage.includes('optimize') || stage.includes('seo')) {
                  updateStep('optimize', { status: 'active', message: data.message || 'Optimizing...' });
                  updateStep('code', { status: 'completed' });
                } else if (stage.includes('finalize') || stage.includes('complete')) {
                  updateStep('finalize', { status: 'active', message: data.message || 'Finalizing...' });
                  updateStep('optimize', { status: 'completed' });
                }

                // Update preview if HTML is available
                if (data.website?.pages?.[0]?.html) {
                  const html = data.website.pages[0].html;
                  const css = data.website.sharedAssets?.css || '';
                  setPreviewHtml(html + (css ? `<style>${css}</style>` : ''));
                }
              }

              // Handle completion - server sends 'data' field, not 'website'
              if (data.stage === 'complete' && (data.website || data.data)) {
                const websiteData = data.website || data.data;
                
                // Handle both old format (pages) and new format (manifest/files/assets)
                let website: GeneratedWebsite;
                
                if (websiteData.pages) {
                  // Old format with pages
                  website = {
                    html: websiteData.pages?.[0]?.html || '',
                    css: websiteData.sharedAssets?.css || websiteData.assets?.css || '',
                    pages: websiteData.pages,
                  };
                } else if (websiteData.manifest && websiteData.files) {
                  // New format with manifest/files/assets (Base64 encoded)
                  const indexFile = websiteData.files['index.html'] || websiteData.files['/index.html'];
                  const htmlContent = indexFile?.content 
                    ? (websiteData.encoded ? atob(indexFile.content) : indexFile.content)
                    : '';
                  const cssContent = websiteData.assets?.css
                    ? (websiteData.encoded ? atob(websiteData.assets.css) : websiteData.assets.css)
                    : '';
                  
                  website = {
                    html: htmlContent,
                    css: cssContent,
                    pages: [{
                      slug: '/',
                      html: htmlContent,
                    }],
                  };
                } else {
                  throw new Error('Invalid website data format received');
                }
                
                setGeneratedWebsite(website);
                setPreviewHtml(website.html + (website.css ? `<style>${website.css}</style>` : ''));
                updateStep('finalize', { status: 'completed', message: 'Website ready!' });
                setOverallProgress(100);
                setIsGenerating(false);
                return;
              }
            } catch (parseError) {
              console.warn('[AIWebsiteGeneration] Failed to parse SSE data:', parseError);
            }
          }
        }
      }

      // If we get here without completion, something went wrong
      throw new Error('Generation completed but no website received');

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Generation cancelled');
        return;
      }
      
      setError(err instanceof Error ? err.message : 'An error occurred during generation');
      setIsGenerating(false);
      
      // Mark current step as error
      const currentStepId = GENERATION_STEPS[currentStep]?.id;
      if (currentStepId) {
        updateStep(currentStepId, { status: 'error', message: 'Error occurred' });
      }
    }
  };

  // Simulate step with delay
  const _simulateStep = (ms: number) => {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (abortControllerRef.current?.signal.aborted) {
          reject(new DOMException('Aborted', 'AbortError'));
        } else {
          resolve();
        }
      }, ms);

      abortControllerRef.current?.signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  };

  // Generate partial preview (skeleton)
  const generatePartialPreview = (reqs: WebsiteRequirements): string => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reqs.businessName || 'Your Website'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: white; }
    .loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .pulse { animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  </style>
</head>
<body>
  <div class="loading">
    <div class="pulse">
      <h1 style="font-size: 2rem; margin-bottom: 1rem;">Building ${reqs.businessName || 'Your Website'}...</h1>
      <p style="color: #94a3b8;">Please wait while we create your perfect website</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  };

  // REMOVED: generateFinalWebsite() - Now uses backend API with EXACT scraped templates

  // Update estimated time
  useEffect(() => {
    if (isGenerating && startTimeRef.current > 0) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = Math.max(0, 60 - elapsed);
        setEstimatedTime(remaining);
      }, 1000);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [isGenerating]);

  // Cancel generation on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Handle continue
  const handleContinue = () => {
    if (generatedWebsite) {
      onComplete(generatedWebsite);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-violet-400" />
              AI Website Generation
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {isGenerating ? 'Building your website...' : hasStarted && !error ? 'Generation complete!' : 'Ready to build your perfect website'}
            </p>
          </div>
          
          {isGenerating && (
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <span className="text-slate-300">~{estimatedTime}s remaining</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {!hasStarted ? (
            /* Pre-Generation View */
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Build Your Website</h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-8">
                We'll combine your selected templates and client information to create a stunning, 
                SEO-optimized website. This usually takes about 60 seconds.
              </p>
              
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                <Card className="bg-slate-800/50 border-slate-700 p-4 text-center">
                  <Palette className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-300">{designTemplates.length} Design Templates</p>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700 p-4 text-center">
                  <FileText className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-300">{contentTemplates.length} Content Templates</p>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700 p-4 text-center">
                  <Image className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-300">{imageSource === 'leonardo' ? 'AI Images' : 'Your Images'}</p>
                </Card>
              </div>

              <Button
                size="lg"
                onClick={startGeneration}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-8"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Start Generation
              </Button>
            </div>
          ) : (
            /* Generation Progress View */
            <div className="grid grid-cols-2 gap-6">
              {/* Left: Progress Steps */}
              <div className="space-y-4">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300">Overall Progress</span>
                    <span className="text-white font-bold">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>

                {steps.map((step, index) => (
                  <Card
                    key={step.id}
                    className={`border ${
                      step.status === 'active' 
                        ? 'border-violet-500 bg-violet-500/10' 
                        : step.status === 'completed'
                        ? 'border-green-500/50 bg-green-500/5'
                        : step.status === 'error'
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-slate-700 bg-slate-800/50'
                    }`}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        step.status === 'active' 
                          ? 'bg-violet-600 text-white' 
                          : step.status === 'completed'
                          ? 'bg-green-600 text-white'
                          : step.status === 'error'
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {step.status === 'active' ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : step.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : step.status === 'error' ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          step.status === 'active' ? 'text-violet-400' :
                          step.status === 'completed' ? 'text-green-400' :
                          step.status === 'error' ? 'text-red-400' :
                          'text-slate-400'
                        }`}>
                          {step.label}
                        </p>
                        {step.message && (
                          <p className="text-sm text-slate-500">{step.message}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className={
                        step.status === 'active' ? 'bg-violet-600' :
                        step.status === 'completed' ? 'bg-green-600' :
                        step.status === 'error' ? 'bg-red-600' :
                        'bg-slate-700'
                      }>
                        {step.status === 'pending' ? `Step ${index + 1}` :
                         step.status === 'active' ? 'In Progress' :
                         step.status === 'completed' ? 'Done' : 'Error'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}

                {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500 rounded-lg">
                    <p className="text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startGeneration}
                      className="mt-3 border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry Generation
                    </Button>
                  </div>
                )}
              </div>

              {/* Right: Live Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-violet-400" />
                    Live Preview
                  </h3>
                  {generatedWebsite && (
                    <Badge className="bg-green-600">Ready</Badge>
                  )}
                </div>
                <div className="rounded-lg overflow-hidden border border-slate-700 bg-white h-[500px]">
                  {previewHtml ? (
                    <iframe
                      srcDoc={previewHtml + (generatedWebsite?.css ? `<style>${generatedWebsite.css}</style>` : '')}
                      className="w-full h-full border-0"
                      title="Website Preview"
                      sandbox="allow-same-origin"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-slate-900">
                      <p className="text-slate-500">Preview will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            {isGenerating && (
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating your website...
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onBack && !isGenerating && (
              <Button variant="outline" onClick={onBack} className="border-slate-600 text-slate-300">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            {generatedWebsite && !isGenerating && (
              <Button
                onClick={handleContinue}
                className="bg-violet-600 hover:bg-violet-500 text-white px-6"
              >
                Review Website
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIWebsiteGeneration;

