/**
 * Onboarding Tour Component
 * Interactive tour for new users with step-by-step guidance
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Layout,
  Code,
  Palette,
  Globe,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
  image?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Stargate Portal',
    description: 'Your AI-powered website building platform. Let us show you how to create stunning websites in minutes with our intelligent tools.',
    icon: <Sparkles className="w-8 h-8 text-purple-500" />,
    tip: 'Tip: You can always restart this tour from Settings > Help'
  },
  {
    id: 'wizard',
    title: 'Meet Merlin - Your AI Assistant',
    description: 'Merlin is our AI wizard that helps you create websites from scratch. Simply describe what you want, select a template, and watch the magic happen.',
    icon: <Wand2 className="w-8 h-8 text-blue-500" />,
    tip: 'Tip: Be as specific as possible when describing your website to get better results'
  },
  {
    id: 'templates',
    title: 'Professional Templates',
    description: 'Choose from 7,000+ professionally designed templates across industries. Each template is fully customizable and optimized for performance.',
    icon: <Layout className="w-8 h-8 text-green-500" />,
    tip: 'Tip: Filter templates by industry to find the perfect starting point'
  },
  {
    id: 'editor',
    title: 'Visual Code Editor',
    description: 'Edit your website with our powerful visual editor. See changes in real-time, modify HTML/CSS directly, or use AI to make updates.',
    icon: <Code className="w-8 h-8 text-orange-500" />,
    tip: 'Tip: Use keyboard shortcuts (Ctrl+S to save, Ctrl+Z to undo) for faster editing'
  },
  {
    id: 'design',
    title: 'AI Design Tools',
    description: 'Transform your website with AI-powered design tools. Change colors, fonts, layouts, and generate custom images - all with natural language commands.',
    icon: <Palette className="w-8 h-8 text-pink-500" />,
    tip: 'Tip: Try commands like "Make the header blue" or "Add a modern gradient"'
  },
  {
    id: 'publish',
    title: 'One-Click Publishing',
    description: 'When you\'re ready, publish your website with a single click. We handle hosting, SSL, and CDN distribution globally.',
    icon: <Globe className="w-8 h-8 text-cyan-500" />,
    tip: 'Tip: You can connect your custom domain or use our free subdomain'
  }
];

interface OnboardingTourProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Check if tour was already completed
  useEffect(() => {
    const tourCompleted = localStorage.getItem('stargate-tour-completed');
    if (tourCompleted === 'true') {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, step.id]));

    if (isLastStep) {
      localStorage.setItem('stargate-tour-completed', 'true');
      setIsVisible(false);
      onComplete?.();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('stargate-tour-completed', 'true');
    setIsVisible(false);
    onSkip?.();
  };

  const handleStepClick = (index: number) => {
    if (index <= currentStep || completedSteps.has(tourSteps[index].id)) {
      setCurrentStep(index);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="max-w-2xl w-full bg-slate-900 border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-white font-semibold">Getting Started Guide</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Step {currentStep + 1} of {tourSteps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-700" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 py-4 px-6">
          {tourSteps.map((s, index) => (
            <button
              key={s.id}
              onClick={() => handleStepClick(index)}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                index === currentStep
                  ? 'bg-purple-600 text-white scale-110'
                  : completedSteps.has(s.id) || index < currentStep
                  ? 'bg-green-600/20 text-green-400 cursor-pointer hover:bg-green-600/30'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              )}
              disabled={index > currentStep && !completedSteps.has(s.id)}
            >
              {completedSteps.has(s.id) || index < currentStep ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800 flex items-center justify-center ring-4 ring-slate-700">
              {step.icon}
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
            <p className="text-slate-300 leading-relaxed max-w-md mx-auto">
              {step.description}
            </p>
          </div>

          {/* Tip Box */}
          {step.tip && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-400 flex items-start gap-2">
                <span className="text-yellow-400">*</span>
                {step.tip}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-slate-500 hover:text-slate-300"
            >
              Skip Tour
            </Button>

            <Button
              onClick={handleNext}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLastStep ? (
                <>
                  Get Started
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to reset tour for testing
export function useOnboardingTour() {
  const resetTour = () => {
    localStorage.removeItem('stargate-tour-completed');
    window.location.reload();
  };

  const isTourCompleted = () => {
    return localStorage.getItem('stargate-tour-completed') === 'true';
  };

  return { resetTour, isTourCompleted };
}
