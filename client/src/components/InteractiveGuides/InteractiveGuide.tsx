/**
 * Interactive Guide Component
 * Phase 4.3: Documentation - In-app interactive tutorials
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  content: React.ReactNode;
}

interface InteractiveGuideProps {
  guideId: string;
  title: string;
  steps: GuideStep[];
  onComplete?: () => void;
  onClose?: () => void;
  storageKey?: string;
}

export function InteractiveGuide({
  guideId,
  title,
  steps,
  onComplete,
  onClose,
  storageKey,
}: InteractiveGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const storage = storageKey || `guide-${guideId}`;

  // Check if guide was already completed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem(storage) === 'true';
      if (completed) {
        setIsVisible(false);
      }
    }
  }, [storage]);

  if (!isVisible) {
    return null;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storage, 'true');
      }
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

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storage, 'true');
    }
    setIsVisible(false);
    onClose?.();
  };

  // Calculate position for tooltip
  const getTooltipPosition = () => {
    if (!step.target) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const element = document.querySelector(step.target);
    if (!element) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const rect = element.getBoundingClientRect();
    const position = step.position || 'bottom';

    switch (position) {
      case 'top':
        return {
          top: `${rect.top - 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: `${rect.bottom + 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - 10}px`,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 10}px`,
          transform: 'translateY(-50%)',
        };
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" />

      {/* Highlight Target Element */}
      {step.target && (
        <div
          className="fixed z-40 border-2 border-primary rounded-lg pointer-events-none transition-all"
          style={{
            ...getTooltipPosition(),
            width: '200px',
            height: '100px',
          }}
        />
      )}

      {/* Guide Card */}
      <Card
        className="fixed z-50 max-w-md w-full shadow-2xl"
        style={step.target ? getTooltipPosition() : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
            <div>{step.content}</div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button onClick={handleNext} className="flex items-center gap-2">
              {isLastStep ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

