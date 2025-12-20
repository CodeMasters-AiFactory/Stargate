import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useIDE } from '@/hooks/use-ide';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Download,
  Eye,
  RefreshCw,
  Wand2,
  FileCode,
  Palette,
  Layout,
  Image,
  Type,
  Globe,
} from 'lucide-react';
import { NavigationButtons } from './BackButton';

interface GenerationStep {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'pending' | 'in-progress' | 'complete' | 'error';
  message?: string;
}

export function MerlinQuickGenerate() {
  const { state, setState } = useIDE();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWebsite, setGeneratedWebsite] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [_currentStep, setCurrentStep] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: 'design', name: 'AI Design Thinking', icon: <Palette className="w-4 h-4" />, status: 'pending' },
    { id: 'layout', name: 'Layout Planning', icon: <Layout className="w-4 h-4" />, status: 'pending' },
    { id: 'copy', name: 'Copywriting', icon: <Type className="w-4 h-4" />, status: 'pending' },
    { id: 'images', name: 'Image Generation', icon: <Image className="w-4 h-4" />, status: 'pending' },
    { id: 'code', name: 'Code Generation', icon: <FileCode className="w-4 h-4" />, status: 'pending' },
    { id: 'optimize', name: 'Optimization', icon: <Globe className="w-4 h-4" />, status: 'pending' },
  ]);

  // Get requirements from state or localStorage
  const requirements = state.merlinQuickGenerate?.requirements || 
    JSON.parse(localStorage.getItem('merlin_quick_generate') || '{}');

  // Auto-start generation on mount
  useEffect(() => {
    if (requirements && Object.keys(requirements).length > 0 && !isGenerating && !generatedWebsite) {
      startGeneration();
    }
  }, []);

  const updateStep = (stepId: string, status: GenerationStep['status'], message?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, message } : step
    ));
  };

  const startGeneration = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsGenerating(true);
    setError(null);
    setCurrentStep(0);

    // Reset all steps
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', message: undefined })));

    try {
      // Start design step
      updateStep('design', 'in-progress', 'Analyzing your requirements...');
      setCurrentStep(1);

      const response = await fetch('/api/website/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...requirements,
          quickGenerate: true,
          skipInvestigation: true,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status}`);
      }

      // Handle SSE streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
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
                
                // Update progress based on stage
                if (data.stage) {
                  const stageMap: Record<string, string> = {
                    'design-thinking': 'design',
                    'layout': 'layout',
                    'copywriting': 'copy',
                    'images': 'images',
                    'code-generation': 'code',
                    'optimization': 'optimize',
                  };
                  
                  const stepId = stageMap[data.stage];
                  if (stepId) {
                    // Mark previous steps as complete
                    const stepIndex = steps.findIndex(s => s.id === stepId);
                    setSteps(prev => prev.map((step, idx) => ({
                      ...step,
                      status: idx < stepIndex ? 'complete' : 
                              idx === stepIndex ? 'in-progress' : 'pending',
                      message: idx === stepIndex ? data.message : step.message,
                    })));
                    setCurrentStep(stepIndex + 1);
                  }
                }

                // Handle completion
                if (data.complete && data.website) {
                  setGeneratedWebsite(data.website);
                  setSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      } else {
        // Fallback for non-streaming response
        const data = await response.json();
        if (data.website) {
          setGeneratedWebsite(data.website);
          setSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));
        }
      }

      toast({
        title: '🎉 Website Generated!',
        description: 'Your website is ready to preview and download.',
      });

    } catch (err: any) {
      if (err.name === 'AbortError') return;
      
      console.error('[QuickGenerate] Error:', err);
      setError(err.message || 'Generation failed');
      
      toast({
        title: 'Generation Failed',
        description: err.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    setState(prev => ({ ...prev, currentView: 'stargate-websites' }));
  };

  const handleDownload = () => {
    if (!generatedWebsite) return;

    // Create a zip file with the website
    const html = generatedWebsite.html || generatedWebsite.code?.html || '';
    const css = generatedWebsite.css || generatedWebsite.code?.css || '';
    const js = generatedWebsite.js || generatedWebsite.code?.js || '';

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${requirements.businessName || 'My Website'}</title>
  <style>${css}</style>
</head>
<body>
${html}
<script>${js}</script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(requirements.businessName || 'website').toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded!',
      description: 'Your website has been downloaded.',
    });
  };

  const completedSteps = steps.filter(s => s.status === 'complete').length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="w-full h-full overflow-y-auto bg-[#080810] antialiased">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(120,119,198,0.1), transparent)' }} />
        <div className="absolute w-[800px] h-[800px] rounded-full" 
          style={{ 
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', 
            filter: 'blur(60px)',
            top: '-200px', 
            right: '-200px' 
          }} />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <NavigationButtons backDestination="merlin-packages" className="mb-4 [&_button]:text-white/60 [&_button:hover]:text-white [&_button:hover]:bg-white/5" />

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/15 to-cyan-500/10 border border-violet-500/20 backdrop-blur-sm mb-4">
              <Wand2 className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">Merlin Quick Generate</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              {isGenerating ? 'Creating Your Website...' : 
               generatedWebsite ? '🎉 Website Ready!' : 
               error ? 'Generation Failed' : 'Starting Generation...'}
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              {isGenerating ? 'Merlin is working its magic. This usually takes 30-60 seconds.' :
               generatedWebsite ? 'Your website has been generated successfully!' :
               error ? error : 'Preparing to generate your website...'}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="bg-white/[0.03] border-white/10 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Generation Progress</h3>
              <span className="text-sm text-white/50">{completedSteps}/{steps.length} steps</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div 
                  key={step.id}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                    step.status === 'in-progress' ? 'bg-violet-500/10 border border-violet-500/30' :
                    step.status === 'complete' ? 'bg-emerald-500/10' :
                    step.status === 'error' ? 'bg-red-500/10' :
                    'bg-white/[0.02]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.status === 'in-progress' ? 'bg-violet-500 text-white' :
                    step.status === 'complete' ? 'bg-emerald-500 text-white' :
                    step.status === 'error' ? 'bg-red-500 text-white' :
                    'bg-white/10 text-white/50'
                  }`}>
                    {step.status === 'in-progress' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                     step.status === 'complete' ? <CheckCircle className="w-4 h-4" /> :
                     step.status === 'error' ? <AlertCircle className="w-4 h-4" /> :
                     step.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      step.status === 'in-progress' ? 'text-white' :
                      step.status === 'complete' ? 'text-emerald-400' :
                      'text-white/60'
                    }`}>
                      {step.name}
                    </div>
                    {step.message && (
                      <div className="text-sm text-white/40">{step.message}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {generatedWebsite && (
          <Card className="bg-white/[0.03] border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Website is Ready!</h3>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Website
                </Button>
                <Button 
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5"
                  onClick={() => {
                    // Open preview in new tab
                    const html = generatedWebsite.html || generatedWebsite.code?.html || '';
                    const css = generatedWebsite.css || generatedWebsite.code?.css || '';
                    const blob = new Blob([`<style>${css}</style>${html}`], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {error && !isGenerating && (
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-400">Generation Failed</h3>
                  <p className="text-red-300/70">{error}</p>
                </div>
                <Button 
                  onClick={startGeneration}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

