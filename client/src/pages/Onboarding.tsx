/**
 * Onboarding Page - Merlin Website Wizard
 * Dedicated full-page onboarding experience focused on website creation
 * Features Merlin AI video avatar (placeholder for future implementation)
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  ArrowLeft,
  Wand2,
  Sparkles,
  CheckCircle2,
  Play,
  Volume2,
  VolumeX,
  MessageSquare,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
  merlinMessage?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Merlin Website Wizard',
    description: 'Create stunning, professional websites in minutes using AI. No coding required - just describe what you want and watch the magic happen.',
    icon: <Wand2 className="w-10 h-10 text-purple-500" />,
    tip: 'You can always restart this tour from Settings > Help',
    merlinMessage: "Hello! I'm Merlin, your AI website wizard. I'll help you create a beautiful website in just a few simple steps."
  },
  {
    id: 'describe',
    title: 'Tell Me About Your Business',
    description: "Simply describe your business, choose your industry, and tell me what you want. I'll understand your needs and create a website tailored just for you.",
    icon: <MessageSquare className="w-10 h-10 text-blue-500" />,
    tip: 'The more details you provide, the better your website will be!',
    merlinMessage: "Just chat with me naturally! Tell me about your business, your style preferences, and I'll handle the rest."
  },
  {
    id: 'generate',
    title: 'Watch the Magic Happen',
    description: "Once you've told me what you want, I'll generate a complete, professional website with custom content, images, and design - all in under 2 minutes.",
    icon: <Sparkles className="w-10 h-10 text-pink-500" />,
    tip: 'You can regenerate sections or the entire website if you want changes',
    merlinMessage: "I use advanced AI to create unique content, select perfect images, and design a website that truly represents your brand."
  },
  {
    id: 'launch',
    title: 'Launch Your Website',
    description: "When you're happy with your website, publish it instantly with one click. Your site will be live with professional hosting, SSL security, and fast global delivery.",
    icon: <Rocket className="w-10 h-10 text-cyan-500" />,
    tip: 'You can edit your website anytime after publishing',
    merlinMessage: "Ready to go live? I'll handle all the technical stuff - hosting, security, speed optimization. You just click publish!"
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(false);
  const [, setLocation] = useLocation();

  // Check if already completed onboarding
  useEffect(() => {
    const tourCompleted = localStorage.getItem('stargate-tour-completed');
    if (tourCompleted === 'true') {
      // Redirect to home if already completed
      setLocation('/');
    }
  }, [setLocation]);

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, step.id]));

    if (isLastStep) {
      localStorage.setItem('stargate-tour-completed', 'true');
      // Launch the Merlin Website Wizard
      setLocation('/merlin8');
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
    setLocation('/');
  };

  const handleStepClick = (index: number) => {
    if (index <= currentStep || completedSteps.has(tourSteps[index].id)) {
      setCurrentStep(index);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Merlin Website Wizard</span>
          </div>
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-slate-400 hover:text-white"
          >
            Skip Tour
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">

          {/* Left Side - Merlin AI Video Avatar */}
          <div className="order-2 lg:order-1">
            <Card className="bg-slate-900/80 border-slate-700 overflow-hidden">
              {/* Video Avatar Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center">
                {/* Animated Avatar Placeholder */}
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full scale-150" />

                  {/* Avatar Circle */}
                  <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-1">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                      <Wand2 className="w-16 h-16 text-purple-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Orbiting Particles */}
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
                    <div className="absolute top-0 left-1/2 w-2 h-2 bg-purple-500 rounded-full -translate-x-1/2 -translate-y-4" />
                    <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-blue-500 rounded-full -translate-x-1/2 translate-y-4" />
                  </div>
                </div>

                {/* Coming Soon Badge */}
                <div className="absolute top-4 right-4 bg-purple-600/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                  AI Video Coming Soon
                </div>

                {/* Play Button Overlay */}
                <button className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </button>
              </div>

              {/* Merlin's Message */}
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-white">Merlin</span>
                      <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">AI Assistant</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {step.merlinMessage}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Step Content */}
          <div className="order-1 lg:order-2">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                <span>Step {currentStep + 1} of {tourSteps.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2 bg-slate-700" />
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-3 mb-8">
              {tourSteps.map((s, index) => (
                <button
                  key={s.id}
                  onClick={() => handleStepClick(index)}
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                    index === currentStep
                      ? 'bg-purple-600 text-white scale-110 ring-4 ring-purple-600/30'
                      : completedSteps.has(s.id) || index < currentStep
                      ? 'bg-green-600/20 text-green-400 cursor-pointer hover:bg-green-600/30'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  )}
                  disabled={index > currentStep && !completedSteps.has(s.id)}
                >
                  {completedSteps.has(s.id) || index < currentStep ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <span className="text-lg font-semibold">{index + 1}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Step Content Card */}
            <Card className="bg-slate-900/80 border-slate-700 mb-6">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-slate-800 flex items-center justify-center ring-4 ring-slate-700/50">
                    {step.icon}
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-4">{step.title}</h1>
                  <p className="text-lg text-slate-300 leading-relaxed max-w-lg mx-auto">
                    {step.description}
                  </p>
                </div>

                {/* Tip Box */}
                {step.tip && (
                  <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <p className="text-sm text-slate-400 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      {step.tip}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
              >
                {isLastStep ? (
                  <>
                    Create My Website
                    <Wand2 className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          Press <kbd className="px-2 py-1 bg-slate-800 rounded text-slate-400 mx-1">Enter</kbd> to continue or <kbd className="px-2 py-1 bg-slate-800 rounded text-slate-400 mx-1">Esc</kbd> to skip
        </div>
      </footer>
    </div>
  );
}

// Hook for managing onboarding state
export function useOnboarding() {
  const [, setLocation] = useLocation();

  const resetOnboarding = () => {
    localStorage.removeItem('stargate-tour-completed');
    setLocation('/onboarding');
  };

  const isOnboardingCompleted = () => {
    return localStorage.getItem('stargate-tour-completed') === 'true';
  };

  const redirectToOnboarding = () => {
    if (!isOnboardingCompleted()) {
      setLocation('/onboarding');
      return true;
    }
    return false;
  };

  return { resetOnboarding, isOnboardingCompleted, redirectToOnboarding };
}
