/**
 * Global Wizard Navigation Component
 * Provides forward/back navigation across all wizard stages
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Navigation, Home } from 'lucide-react';
import type { WizardStage } from '@/types/websiteBuilder';
import { useLocation } from 'wouter';
import { useIDE } from '@/hooks/use-ide';

interface WizardNavigationProps {
  currentStage: WizardStage;
  onNavigate: (stage: WizardStage) => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  visitedStages?: WizardStage[];
  className?: string;
}

// NEW 3-PHASE ULTRA-SIMPLIFIED WORKFLOW
// 1. Package → 2. Template → 3. Final Website
const STAGE_ORDER: WizardStage[] = [
  'package-select',      // Phase 1: Choose Package
  'template-select',     // Phase 2: Design Template Selection (LOOK/Layout)
  'final-website',       // Phase 3: Display final website
];

const STAGE_LABELS: Record<WizardStage, string> = {
  // NEW 3-PHASE ULTRA-SIMPLIFIED WORKFLOW
  'package-select': 'Phase 1: Choose Your Package',
  'template-select': 'Phase 2: Select Design Template',
  'final-website': 'Phase 3: Final Website',
  // Deprecated phases (removed from workflow)
  'keywords-collection': 'Pages & Keywords (REMOVED)',
  'content-rewriting': 'AI Content Rewriting (REMOVED)',
  'image-generation': 'AI Image Generation (REMOVED)',
  'seo-assessment': 'SEO Assessment (REMOVED)',
  'review-redo': 'Review & Redo (REMOVED)',
  'final-approval': 'Client Approval (REMOVED)',
  // Deprecated phases
  'empty-preview': 'Empty Preview (deprecated)',
  'content-select': 'Content Select (deprecated)',
  'client-info': 'Client Info (deprecated)',
  'merge-preview': 'Merge Preview (deprecated)',
  // Legacy stages (deprecated)
  'mode-select': 'Mode Selection (DEPRECATED)',
  discover: 'Discovery (DEPRECATED)',
  define: 'Define Requirements (DEPRECATED)',
  ecommerce: 'E-Commerce Setup (DEPRECATED)',
  confirm: 'Confirmation (DEPRECATED)',
  research: 'Research Phase (DEPRECATED)',
  commit: 'Complete (DEPRECATED)',
  requirements: 'Requirements (DEPRECATED)',
  'content-quality': 'Content Quality (DEPRECATED)',
  'keywords-semantic-seo': 'Keywords & SEO (DEPRECATED)',
  'technical-seo': 'Technical SEO (DEPRECATED)',
  'core-web-vitals': 'Core Web Vitals (DEPRECATED)',
  'structure-navigation': 'Structure & Navigation (DEPRECATED)',
  'mobile-optimization': 'Mobile Optimization (DEPRECATED)',
  'visual-quality': 'Visual Quality (DEPRECATED)',
  'image-media-quality': 'Image & Media Quality (DEPRECATED)',
  'local-seo': 'Local SEO (DEPRECATED)',
  'trust-signals': 'Trust Signals (DEPRECATED)',
  'schema-structured-data': 'Schema & Structured Data (DEPRECATED)',
  'on-page-seo-structure': 'On-Page SEO Structure (DEPRECATED)',
  security: 'Security (DEPRECATED)',
  build: 'Website Builder (DEPRECATED)',
  review: 'Review (DEPRECATED)',
  'ai-generation': 'AI Generation (DEPRECATED)',
  'review-redesign': 'Review Redesign (DEPRECATED)',
  'seo-evaluation': 'SEO Evaluation (DEPRECATED)',
};

export function WizardNavigation({
  currentStage,
  onNavigate,
  canGoBack = true,
  canGoForward = true,
  visitedStages = [],
  className = '',
}: WizardNavigationProps) {
  const [, setLocation] = useLocation();
  const { setState } = useIDE();
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const previousStage = currentIndex > 0 ? STAGE_ORDER[currentIndex - 1] : null;
  const nextStage = currentIndex < STAGE_ORDER.length - 1 ? STAGE_ORDER[currentIndex + 1] : null;

  // Allow forward navigation to any stage (for easy movement)
  // Allow back navigation if there's a previous stage
  const canNavigateBack = canGoBack && previousStage !== null;
  const canNavigateForward = canGoForward && nextStage !== null;

  const handlePrevious = () => {
    if (previousStage) {
      onNavigate(previousStage);
    }
  };

  const handleNext = () => {
    if (nextStage) {
      onNavigate(nextStage);
    }
  };

  const handleJumpTo = (stage: WizardStage) => {
    try {
      // Validate stage exists before navigating
      if (!STAGE_ORDER.includes(stage)) {
        console.warn(`[WizardNavigation] Invalid stage: ${stage}`);
        return;
      }

      // Ensure we're navigating to a valid stage
      if (stage === currentStage) {
        // Already on this stage, no need to navigate
        return;
      }

      // Navigate to the stage
      onNavigate(stage);
    } catch (error) {
      console.error('[WizardNavigation] Error navigating to stage:', error);
      // Fallback: Try to navigate using Next/Previous if possible
      const targetIndex = STAGE_ORDER.indexOf(stage);
      const currentIndex = STAGE_ORDER.indexOf(currentStage);

      if (targetIndex > currentIndex && nextStage) {
        // Try to navigate forward
        handleNext();
      } else if (targetIndex < currentIndex && previousStage) {
        // Try to navigate backward
        handlePrevious();
      }
    }
  };

  // NEW: Only show navigation for active stages in Content Investigation Engine
  // Hide navigation if stage is not in the new active flow
  if (!STAGE_ORDER.includes(currentStage)) {
    return null;
  }

  return (
    <div
      className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Back to Home + Current Stage Info */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Update IDE state to go back to landing page
                setState(prev => ({ ...prev, currentView: 'landing' }));
                setLocation('/');
              }}
              className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
              title="Back to Home"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </Button>
            <div className="h-6 w-px bg-white/30" />
            <Navigation className="w-5 h-5" />
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Step {currentIndex + 1} of {STAGE_ORDER.length}
              </Badge>
              <span className="font-semibold text-sm">{STAGE_LABELS[currentStage]}</span>
            </div>
          </div>

          {/* Center: Quick Jump */}
          <div className="flex-1 max-w-md">
            <Select value={currentStage} onValueChange={handleJumpTo}>
              <SelectTrigger
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                aria-label="Select phase to navigate to"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[400px] overflow-y-auto">
                {STAGE_ORDER.map((stage, index) => (
                  <SelectItem key={stage} value={stage} data-phase={stage} data-phase-index={index}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-6">{index + 1}.</span>
                      <span>{STAGE_LABELS[stage]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Right: Navigation Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={!canNavigateBack}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              title={previousStage ? `Go to: ${STAGE_LABELS[previousStage]}` : 'No previous stage'}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={!canNavigateForward}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              title={nextStage ? `Go to: ${STAGE_LABELS[nextStage]}` : 'No next stage'}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
