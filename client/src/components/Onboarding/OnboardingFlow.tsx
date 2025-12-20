/**
 * Onboarding Flow Component
 * Phase 4.2: UI/UX Polish - User onboarding experience
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  optional?: boolean;
}

interface OnboardingFlowProps {
  steps: OnboardingStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  storageKey?: string;
}

export function OnboardingFlow({
  steps,
  onComplete,
  onSkip,
  storageKey = 'onboarding-completed',
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Check if onboarding was already completed
  const isCompleted = typeof window !== 'undefined' && localStorage.getItem(storageKey) === 'true';

  if (isCompleted) {
    return null;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, step.id]));

    if (isLastStep) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, 'true');
      }
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
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
    onSkip?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Welcome to Merlin Website Builder</CardTitle>
              <CardDescription>
                Step {currentStep + 1} of {steps.length}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip
            </Button>
          </div>

          <Progress value={progress} className="h-2" />

          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4">
            {steps.map((s, index) => (
              <div
                key={s.id}
                className={cn(
                  'flex items-center gap-2',
                  index < steps.length - 1 && 'flex-1'
                )}
              >
                <div className="flex items-center gap-2">
                  {completedSteps.has(s.id) || index < currentStep ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : index === currentStep ? (
                    <Circle className="w-5 h-5 text-primary fill-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span
                    className={cn(
                      'text-sm',
                      index === currentStep && 'font-semibold',
                      index < currentStep && 'text-muted-foreground'
                    )}
                  >
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px bg-border mx-2" />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-muted-foreground mb-4">{step.description}</p>
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

            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

