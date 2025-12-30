/**
 * WebsiteBuildProgress - Progress overlay during auto-build
 * Shows animated progress bar with live status messages while Merlin transforms the template
 */

import { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Wand2, X, CheckCircle2, Sparkles } from 'lucide-react';

export interface BuildStep {
  id: string;
  message: string;
  progress: number;
}

interface WebsiteBuildProgressProps {
  businessName: string;
  industry: string;
  isBuilding: boolean;
  currentStep?: string;
  progress?: number;
  onCancel?: () => void;
  onComplete?: () => void;
}

// Default build steps with progress percentages
const BUILD_STEPS: BuildStep[] = [
  { id: 'setup', message: 'Setting up your website...', progress: 5 },
  { id: 'business-name', message: 'Updating business name...', progress: 15 },
  { id: 'hero', message: 'Customizing hero section...', progress: 25 },
  { id: 'images', message: 'Generating images...', progress: 45 },
  { id: 'about', message: 'Writing about section...', progress: 60 },
  { id: 'services', message: 'Adding services...', progress: 70 },
  { id: 'contact', message: 'Setting up contact info...', progress: 80 },
  { id: 'colors', message: 'Applying brand colors...', progress: 90 },
  { id: 'final', message: 'Final touches...', progress: 95 },
  { id: 'complete', message: 'Website ready!', progress: 100 },
];

export function WebsiteBuildProgress({
  businessName,
  industry,
  isBuilding,
  currentStep,
  progress: externalProgress,
  onCancel,
  onComplete,
}: WebsiteBuildProgressProps) {
  const [internalProgress, setInternalProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(BUILD_STEPS[0].message);
  const [stepIndex, setStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use external progress if provided, otherwise use internal simulation
  const progress = externalProgress ?? internalProgress;

  // Personalize messages based on business
  const getPersonalizedMessage = (baseMessage: string): string => {
    return baseMessage
      .replace('your website', `${businessName}'s website`)
      .replace('images', `${industry.toLowerCase()} images`)
      .replace('hero section', `hero section for ${businessName}`);
  };

  // Simulate progress if no external progress provided
  useEffect(() => {
    if (!isBuilding || externalProgress !== undefined) {
      return;
    }

    // Simulate progress over ~30 seconds
    const totalDuration = 30000; // 30 seconds
    const updateInterval = 300; // Update every 300ms
    const progressPerUpdate = 100 / (totalDuration / updateInterval);

    animationRef.current = setInterval(() => {
      setInternalProgress(prev => {
        const newProgress = Math.min(prev + progressPerUpdate, 100);

        if (newProgress >= 100) {
          if (animationRef.current) clearInterval(animationRef.current);
          setIsComplete(true);
          onComplete?.();
        }

        return newProgress;
      });
    }, updateInterval);

    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [isBuilding, externalProgress, onComplete]);

  // Update current message based on progress
  useEffect(() => {
    const currentStepData = BUILD_STEPS.find((step, idx) => {
      const nextStep = BUILD_STEPS[idx + 1];
      return progress >= step.progress && (!nextStep || progress < nextStep.progress);
    }) || BUILD_STEPS[BUILD_STEPS.length - 1];

    if (currentStepData) {
      setCurrentMessage(getPersonalizedMessage(currentStepData.message));
      setStepIndex(BUILD_STEPS.indexOf(currentStepData));
    }
  }, [progress, businessName, industry]);

  // Update message based on external currentStep
  useEffect(() => {
    if (currentStep) {
      const step = BUILD_STEPS.find(s => s.id === currentStep);
      if (step) {
        setCurrentMessage(getPersonalizedMessage(step.message));
      } else {
        setCurrentMessage(currentStep);
      }
    }
  }, [currentStep, businessName, industry]);

  if (!isBuilding && !isComplete) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4">
        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  {isComplete ? (
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  ) : (
                    <Wand2 className="w-7 h-7 text-white animate-pulse" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {isComplete ? 'Website Ready!' : 'Merlin is building...'}
                  </h2>
                  <p className="text-white/70 text-sm">{businessName}</p>
                </div>
              </div>

              {onCancel && !isComplete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onCancel}
                  className="text-white/70 hover:text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Progress Section */}
          <div className="px-6 py-8">
            {/* Current Step Message */}
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <p className="text-slate-300 text-lg">{currentMessage}</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress
                value={progress}
                className="h-3 bg-slate-800"
              />
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Step {stepIndex + 1} of {BUILD_STEPS.length}
                </span>
                <span className="text-purple-400 font-mono">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="mt-6 flex justify-center gap-1.5">
              {BUILD_STEPS.map((step, idx) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx <= stepIndex
                      ? 'bg-purple-500'
                      : 'bg-slate-700'
                  } ${idx === stepIndex ? 'w-4' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          {!isComplete && (
            <div className="px-6 pb-6">
              <p className="text-center text-slate-500 text-sm">
                This usually takes about 30 seconds
              </p>
            </div>
          )}

          {/* Complete State */}
          {isComplete && (
            <div className="px-6 pb-6">
              <Button
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                View Your Website
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
