/**
 * Template Transformation Progress
 * 
 * Shows progress bars and instructions for each transformation phase:
 * - Content Rewriting
 * - Image Creation
 * - Color Management
 * - SEO Optimization
 * - Technical Cleanup
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Image as ImageIcon,
  Palette,
  Search,
  Settings,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { TransformationOptions } from './TemplateTransformationConfig';

export type TransformationPhase =
  | 'idle'
  | 'content'
  | 'images'
  | 'colors'
  | 'seo'
  | 'technical'
  | 'complete'
  | 'error';

export interface PhaseProgress {
  phase: TransformationPhase;
  status: 'pending' | 'running' | 'completed' | 'skipped' | 'error';
  progress: number; // 0-100
  message?: string;
  error?: string;
}

interface TemplateTransformationProgressProps {
  options: TransformationOptions;
  clientInfo: {
    businessName: string;
    industry?: string;
    city?: string;
  };
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
}

const PHASE_CONFIG = {
  content: {
    title: 'Content Rewriting',
    description: 'Rewriting all content, brand names, and service descriptions for your business',
    icon: FileText,
    color: 'cyan',
  },
  images: {
    title: 'Image Creation',
    description: 'Generating new images and replacing template images',
    icon: ImageIcon,
    color: 'purple',
  },
  colors: {
    title: 'Color Management',
    description: 'Updating color schemes and typography to match your brand',
    icon: Palette,
    color: 'pink',
  },
  seo: {
    title: 'SEO Optimization',
    description: 'Optimizing meta tags, schema markup, and SEO content',
    icon: Search,
    color: 'green',
  },
  technical: {
    title: 'Technical Cleanup',
    description: 'Removing tracking scripts, optimizing performance, and cleaning up code',
    icon: Settings,
    color: 'yellow',
  },
};

export function TemplateTransformationProgress({
  options,
  clientInfo,
  onComplete,
  onError,
}: TemplateTransformationProgressProps) {
  const [phases, setPhases] = useState<Record<TransformationPhase, PhaseProgress>>({
    idle: { phase: 'idle', status: 'pending', progress: 0 },
    content: {
      phase: 'content',
      status: options.rewriteContent || options.replaceBrandName || options.rewriteServices ? 'pending' : 'skipped',
      progress: 0,
      message: 'Ready to start...',
    },
    images: {
      phase: 'images',
      status: options.replaceImages ? 'pending' : 'skipped',
      progress: 0,
      message: 'Waiting for content phase...',
    },
    colors: {
      phase: 'colors',
      status: options.updateColors || options.adjustTypography ? 'pending' : 'skipped',
      progress: 0,
      message: 'Waiting...',
    },
    seo: {
      phase: 'seo',
      status: options.optimizeSEO || options.updateMetaTags ? 'pending' : 'skipped',
      progress: 0,
      message: 'Waiting...',
    },
    technical: {
      phase: 'technical',
      status: options.removeTrackingScripts || options.optimizePerformance ? 'pending' : 'skipped',
      progress: 0,
      message: 'Waiting...',
    },
    complete: { phase: 'complete', status: 'pending', progress: 0 },
    error: { phase: 'error', status: 'pending', progress: 0 },
  });

  const [currentPhase, setCurrentPhase] = useState<TransformationPhase>('idle');
  const [isRunning, setIsRunning] = useState(false);

  // Calculate overall progress
  const overallProgress = React.useMemo(() => {
    const activePhases = Object.values(phases).filter(
      p => p.status !== 'skipped' && p.phase !== 'idle' && p.phase !== 'complete' && p.phase !== 'error'
    );
    if (activePhases.length === 0) return 100;
    const total = activePhases.reduce((sum, p) => sum + p.progress, 0);
    return Math.round(total / activePhases.length);
  }, [phases]);

  const updatePhase = (phase: TransformationPhase, updates: Partial<PhaseProgress>) => {
    setPhases(prev => ({
      ...prev,
      [phase]: { ...prev[phase], ...updates },
    }));
  };

  const startTransformation = async () => {
    setIsRunning(true);
    setCurrentPhase('content');

    try {
      // Phase 1: Content Rewriting
      if (options.rewriteContent || options.replaceBrandName || options.rewriteServices) {
        updatePhase('content', { status: 'running', progress: 0, message: 'Starting content rewrite...' });
        
        // Simulate progress - replace with actual API call
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          updatePhase('content', {
            progress: i,
            message: getContentPhaseMessage(i),
          });
        }

        updatePhase('content', {
          status: 'completed',
          progress: 100,
          message: 'Content rewriting complete!',
        });
      }

      // Phase 2: Image Creation
      if (options.replaceImages) {
        setCurrentPhase('images');
        updatePhase('images', { status: 'running', progress: 0, message: 'Generating images...' });

        // Simulate progress - replace with actual API call
        for (let i = 0; i <= 100; i += 15) {
          await new Promise(resolve => setTimeout(resolve, 300));
          updatePhase('images', {
            progress: i,
            message: getImagePhaseMessage(i),
          });
        }

        updatePhase('images', {
          status: 'completed',
          progress: 100,
          message: 'All images generated!',
        });
      }

      // Phase 3: Color Management
      if (options.updateColors || options.adjustTypography) {
        setCurrentPhase('colors');
        updatePhase('colors', { status: 'running', progress: 0, message: 'Updating colors...' });

        // Simulate progress
        for (let i = 0; i <= 100; i += 20) {
          await new Promise(resolve => setTimeout(resolve, 150));
          updatePhase('colors', {
            progress: i,
            message: 'Applying color scheme...',
          });
        }

        updatePhase('colors', {
          status: 'completed',
          progress: 100,
          message: 'Colors updated!',
        });
      }

      // Phase 4: SEO Optimization
      if (options.optimizeSEO || options.updateMetaTags) {
        setCurrentPhase('seo');
        updatePhase('seo', { status: 'running', progress: 0, message: 'Optimizing SEO...' });

        // Simulate progress
        for (let i = 0; i <= 100; i += 25) {
          await new Promise(resolve => setTimeout(resolve, 200));
          updatePhase('seo', {
            progress: i,
            message: 'Updating meta tags and schema...',
          });
        }

        updatePhase('seo', {
          status: 'completed',
          progress: 100,
          message: 'SEO optimization complete!',
        });
      }

      // Phase 5: Technical Cleanup
      if (options.removeTrackingScripts || options.optimizePerformance) {
        setCurrentPhase('technical');
        updatePhase('technical', { status: 'running', progress: 0, message: 'Cleaning up code...' });

        // Simulate progress
        for (let i = 0; i <= 100; i += 33) {
          await new Promise(resolve => setTimeout(resolve, 150));
          updatePhase('technical', {
            progress: i,
            message: 'Removing tracking scripts...',
          });
        }

        updatePhase('technical', {
          status: 'completed',
          progress: 100,
          message: 'Cleanup complete!',
        });
      }

      // Complete
      setCurrentPhase('complete');
      updatePhase('complete', { status: 'completed', progress: 100 });
      
      if (onComplete) {
        onComplete({ success: true, phases });
      }
    } catch (error) {
      setCurrentPhase('error');
      updatePhase('error', {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      if (onError) {
        onError(error instanceof Error ? error : new Error('Transformation failed'));
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-start when component mounts
  useEffect(() => {
    if (!isRunning) {
      startTransformation();
    }
  }, []);

  const getPhaseColor = (color: string) => {
    const colors = {
      cyan: 'bg-cyan-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
    };
    return colors[color as keyof typeof colors] || 'bg-slate-500';
  };

  const getPhaseStatusIcon = (phase: PhaseProgress) => {
    if (phase.status === 'skipped') {
      return <AlertCircle className="w-5 h-5 text-slate-500" />;
    }
    if (phase.status === 'completed') {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
    if (phase.status === 'running') {
      return <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />;
    }
    if (phase.status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    return <div className="w-5 h-5 rounded-full border-2 border-slate-600" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Transforming Website</h1>
        <p className="text-slate-400">
          Creating your custom website for <strong className="text-white">{clientInfo.businessName}</strong>
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Overall Progress</CardTitle>
            <Badge variant="outline" className="text-cyan-400 border-cyan-400">
              {overallProgress}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-3" />
          <p className="text-sm text-slate-400 mt-2 text-center">
            {currentPhase === 'complete' ? 'Transformation complete!' : 'Processing...'}
          </p>
        </CardContent>
      </Card>

      {/* Phase Progress Cards */}
      <div className="space-y-4">
        {(['content', 'images', 'colors', 'seo', 'technical'] as TransformationPhase[]).map(phaseKey => {
          const phase = phases[phaseKey];
          const config = PHASE_CONFIG[phaseKey as keyof typeof PHASE_CONFIG];
          if (!config) return null;
          if (phase.status === 'skipped') return null;

          const Icon = config.icon;
          const isActive = currentPhase === phaseKey && phase.status === 'running';
          const isCompleted = phase.status === 'completed';
          const hasError = phase.status === 'error';

          return (
            <Card
              key={phaseKey}
              className={`bg-slate-800/50 border-slate-700 transition-all ${
                isActive ? 'ring-2 ring-cyan-500' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPhaseStatusIcon(phase)}
                    <Icon className={`w-5 h-5 ${getPhaseColor(config.color).replace('bg-', 'text-')}`} />
                    <div>
                      <CardTitle className="text-white">{config.title}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {config.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={isCompleted ? 'default' : 'outline'}
                    className={
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'text-cyan-400 border-cyan-400'
                        : 'text-slate-400 border-slate-600'
                    }
                  >
                    {phase.progress}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={phase.progress} className="h-2" />
                {phase.message && (
                  <p className={`text-sm ${hasError ? 'text-red-400' : 'text-slate-400'}`}>
                    {phase.message}
                  </p>
                )}
                {phase.error && (
                  <p className="text-sm text-red-400">{phase.error}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Instructions */}
      {currentPhase !== 'complete' && currentPhase !== 'error' && (
        <Card className="bg-blue-900/20 border-blue-700">
          <CardHeader>
            <CardTitle className="text-blue-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              What's Happening?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-sm">
              {getCurrentPhaseInstruction(currentPhase, phases[currentPhase])}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getContentPhaseMessage(progress: number): string {
  if (progress < 30) return 'Analyzing content structure...';
  if (progress < 60) return 'Rewriting paragraphs and headings...';
  if (progress < 90) return 'Replacing brand names and contact info...';
  return 'Finalizing content changes...';
}

function getImagePhaseMessage(progress: number): string {
  if (progress < 25) return 'Identifying images to replace...';
  if (progress < 50) return 'Generating hero image...';
  if (progress < 75) return 'Creating service images...';
  return 'Optimizing and replacing images...';
}

function getCurrentPhaseInstruction(
  phase: TransformationPhase,
  phaseData: PhaseProgress
): string {
  switch (phase) {
    case 'content':
      return 'We are rewriting all content, replacing brand names, updating contact information, and customizing service descriptions to match your business.';
    case 'images':
      return 'AI is generating new images for your industry and replacing all template images with custom visuals that represent your business.';
    case 'colors':
      return 'Updating the color scheme and typography to match your brand identity and create a cohesive visual experience.';
    case 'seo':
      return 'Optimizing meta tags, adding schema markup, and enhancing SEO content to improve your search engine visibility.';
    case 'technical':
      return 'Cleaning up the code by removing tracking scripts, optimizing performance, and ensuring the website is ready for production.';
    default:
      return 'Preparing to transform your website...';
  }
}

