/**
 * Research Phase Component
 * Mandatory 10-step research process before website generation
 * Shows live research activities and allows page-by-page navigation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { WebsiteRequirements } from '@/types/websiteBuilder';

interface ResearchActivity {
  id: string;
  type: 'search' | 'analysis' | 'finding';
  timestamp: Date;
  query?: string;
  title?: string;
  description: string;
  findings?: string[];
}

interface ResearchStep {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'completed';
  pages: {
    name: string;
    status: 'pending' | 'active' | 'completed';
  }[];
}

interface ResearchPhaseProps {
  requirements: WebsiteRequirements;
  onComplete: (researchData: any) => void;
  onCancel?: () => void;
}

const RESEARCH_STEPS = [
  'Topic Research',
  'Industry Research',
  'Competitor ID',
  'Content Analysis',
  'SEO Analysis',
  'SWOT Analysis',
  'Content Strategy',
  'SEO Strategy',
  'Site Structure',
  'Content Plan',
];

const PAGES = ['Home', 'Services', 'About', 'Contact'];

export function ResearchPhase({ requirements, onComplete, onCancel: _onCancel }: ResearchPhaseProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [researchSteps, setResearchSteps] = useState<ResearchStep[]>(() =>
    RESEARCH_STEPS.map((name, idx) => ({
      id: idx,
      name,
      status: idx === 0 ? 'active' : 'pending',
      pages: PAGES.map(pageName => ({
        name: pageName,
        status: idx === 0 && pageName === 'Home' ? 'active' : 'pending',
      })),
    }))
  );
  const [activities, setActivities] = useState<ResearchActivity[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isResearching, setIsResearching] = useState(false);

  // Track which step/page combinations have been researched to prevent infinite loops
  const researchedRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(true);

  const currentPage = PAGES[currentPageIndex];
  const currentStepName = RESEARCH_STEPS[currentStep];

  // Calculate overall progress
  useEffect(() => {
    const totalPages = RESEARCH_STEPS.length * PAGES.length;
    let completedPages = 0;

    researchSteps.forEach(step => {
      step.pages.forEach(page => {
        if (page.status === 'completed') completedPages++;
      });
    });

    const progress = (completedPages / totalPages) * 100;
    setOverallProgress(Math.round(progress));
  }, [researchSteps]);

  // Add research activity to feed
  const addActivity = useCallback((activity: Omit<ResearchActivity, 'id' | 'timestamp'>) => {
    const newActivity: ResearchActivity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };
    setActivities(prev => [newActivity, ...prev]);
  }, []);

  // Navigate to previous/next page
  const navigatePage = useCallback(
    (direction: number) => {
      if (direction === -1) {
        // Previous
        if (currentPageIndex > 0) {
          setCurrentPageIndex(prev => prev - 1);
        } else if (currentStep > 0) {
          setCurrentStep(prev => prev - 1);
          setCurrentPageIndex(PAGES.length - 1);
        }
      } else {
        // Next
        if (currentPageIndex < PAGES.length - 1) {
          setCurrentPageIndex(prev => prev + 1);
        } else if (currentStep < RESEARCH_STEPS.length - 1) {
          setCurrentStep(prev => prev + 1);
          setCurrentPageIndex(0);
        }
      }
    },
    [currentPageIndex, currentStep]
  );

  // Jump to specific step/page
  const jumpToPage = useCallback((stepIndex: number, pageIndex: number) => {
    setCurrentStep(stepIndex);
    setCurrentPageIndex(pageIndex);
  }, []);

  // Simulate research for current page (this will be replaced with actual research logic)
  const performResearch = useCallback(async () => {
    // Guard: Prevent multiple simultaneous research calls
    if (isResearching) return;

    // Guard: Check if already researched this step/page combination
    const researchKey = `${currentStep}-${currentPageIndex}`;
    if (researchedRef.current.has(researchKey)) {
      return; // Already researched, skip
    }

    setIsResearching(true);
    setActivities([]);

    // Mark as researched immediately to prevent re-triggers
    researchedRef.current.add(researchKey);

    // Update status to active
    setResearchSteps(prev =>
      prev.map((step, sIdx) => {
        if (sIdx === currentStep) {
          return {
            ...step,
            status: 'active',
            pages: step.pages.map((page, pIdx) => ({
              ...page,
              status: pIdx === currentPageIndex ? 'active' : page.status,
            })),
          };
        }
        return step;
      })
    );

    // Simulate research activities
    addActivity({
      type: 'search',
      query: `${currentStepName} for ${currentPage} page - ${requirements.businessType}`,
      description: `Researching ${currentStepName.toLowerCase()} topics for ${currentPage} page...`,
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    addActivity({
      type: 'analysis',
      description: `Analyzing findings and identifying key insights...`,
      findings: [
        `Found 12 relevant topics for ${currentPage} page`,
        `Identified 8 high-value keywords`,
        `Discovered 3 competitor strategies to analyze`,
      ],
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    addActivity({
      type: 'finding',
      title: 'Key Insight',
      description: `Research complete for ${currentPage} page. Ready to proceed.`,
    });

    // Mark as completed
    setResearchSteps(prev =>
      prev.map((step, sIdx) => {
        if (sIdx === currentStep) {
          return {
            ...step,
            pages: step.pages.map((page, pIdx) => ({
              ...page,
              status: pIdx === currentPageIndex ? 'completed' : page.status,
            })),
          };
        }
        return step;
      })
    );

    setIsResearching(false);
  }, [
    currentStep,
    currentPageIndex,
    currentStepName,
    currentPage,
    requirements.businessType,
    addActivity,
    isResearching,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auto-start research when page changes - DISABLED to prevent infinite loops
  // User must manually trigger research via button click
  // useEffect(() => {
  //   if (!isMountedRef.current) return;
  //
  //   const currentStepData = researchSteps[currentStep];
  //   const currentPageData = currentStepData?.pages[currentPageIndex];
  //   const researchKey = `${currentStep}-${currentPageIndex}`;
  //
  //   // Only auto-start if not already researched and not currently researching
  //   if (!researchedRef.current.has(researchKey) &&
  //       !isResearching &&
  //       (currentPageData?.status === 'pending' || currentPageData?.status === 'active')) {
  //     performResearch();
  //   }
  // }, [currentStep, currentPageIndex, researchSteps, isResearching, performResearch]);

  // Check if all research is complete
  const isComplete = researchSteps.every(step =>
    step.pages.every(page => page.status === 'completed')
  );

  // Handle completion
  useEffect(() => {
    if (isComplete && overallProgress === 100) {
      // All research complete, allow generation
      setTimeout(() => {
        onComplete({
          steps: researchSteps,
          activities,
          completedAt: new Date(),
        });
      }, 1000);
    }
  }, [isComplete, overallProgress, researchSteps, activities, onComplete]);

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'active':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'search':
        return <Search className="w-4 h-4" />;
      case 'analysis':
        return <BarChart3 className="w-4 h-4" />;
      case 'finding':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-full w-full gap-4 p-6">
      {/* Sidebar: Progress Overview */}
      <div className="w-80 flex-shrink-0">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Research Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-semibold text-blue-600">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>

            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-2">
                {researchSteps.map((step, stepIdx) => (
                  <div key={step.id} className="space-y-1">
                    <div
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        stepIdx === currentStep
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : 'bg-gray-50 border-2 border-transparent'
                      }`}
                      onClick={() => {
                        setCurrentStep(stepIdx);
                        setCurrentPageIndex(0);
                      }}
                    >
                      {getStepStatusIcon(step.status)}
                      <span className="text-sm font-medium flex-1">
                        {stepIdx + 1}. {step.name}
                      </span>
                    </div>
                    {stepIdx === currentStep && (
                      <div className="ml-6 space-y-1">
                        {step.pages.map((page, pageIdx) => (
                          <div
                            key={pageIdx}
                            className={`flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer transition-colors ${
                              pageIdx === currentPageIndex
                                ? 'bg-blue-100 text-blue-700 font-semibold'
                                : 'text-gray-600'
                            }`}
                            onClick={() => setCurrentPageIndex(pageIdx)}
                          >
                            {getStepStatusIcon(page.status)}
                            <span>{page.name} Page</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Live Research Feed */}
      <div className="flex-1 flex flex-col">
        {/* Admin Navigation Bar */}
        <Card className="mb-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-yellow-400 text-yellow-900">
                  ADMIN VIEW
                </Badge>
                <span className="font-semibold">
                  Step {currentStep + 1}: {currentStepName} → {currentPage} Page
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigatePage(-1)}
                  disabled={currentPageIndex === 0 && currentStep === 0}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Select
                  value={`step${currentStep + 1}-${currentPage.toLowerCase()}`}
                  onValueChange={value => {
                    const [stepPart, pagePart] = value.split('-');
                    const stepNum = parseInt(stepPart.replace('step', '')) - 1;
                    const pageIdx = PAGES.findIndex(p => p.toLowerCase() === pagePart);
                    jumpToPage(stepNum, pageIdx);
                  }}
                >
                  <SelectTrigger className="w-64 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {researchSteps.map((step, sIdx) => (
                      <optgroup key={sIdx} label={`Step ${sIdx + 1}: ${step.name}`}>
                        {step.pages.map((page, pIdx) => (
                          <SelectItem
                            key={pIdx}
                            value={`step${sIdx + 1}-${page.name.toLowerCase()}`}
                          >
                            {page.name} Page
                          </SelectItem>
                        ))}
                      </optgroup>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigatePage(1)}
                  disabled={
                    currentPageIndex === PAGES.length - 1 &&
                    currentStep === RESEARCH_STEPS.length - 1
                  }
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Step Header */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  Step {currentStep + 1}: {currentStepName}
                </CardTitle>
                <p className="text-sm text-gray-600">Researching: {currentPage} Page</p>
              </div>
              <Button
                onClick={() => performResearch()}
                disabled={isResearching}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isResearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Start Research
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Page Tabs */}
        <div className="flex gap-2 mb-4">
          {PAGES.map((page, idx) => {
            const stepData = researchSteps[currentStep];
            const pageData = stepData?.pages[idx];
            return (
              <Button
                key={idx}
                variant={idx === currentPageIndex ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPageIndex(idx)}
                className={
                  pageData?.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : ''
                }
              >
                {pageData?.status === 'completed' && <CheckCircle2 className="w-4 h-4 mr-1" />}
                {page} Page
              </Button>
            );
          })}
        </div>

        {/* Live Research Feed */}
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              {isResearching && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
              Live Research Activities
              {isResearching && (
                <Badge variant="outline" className="ml-auto">
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  Researching...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p>Starting research...</p>
                  </div>
                ) : (
                  activities.map(activity => (
                    <div
                      key={activity.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        activity.type === 'search'
                          ? 'bg-blue-50 border-blue-500'
                          : activity.type === 'analysis'
                            ? 'bg-green-50 border-green-500'
                            : 'bg-yellow-50 border-yellow-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getActivityIcon(activity.type)}
                        <span className="font-semibold text-sm uppercase">{activity.type}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {activity.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      {activity.query && (
                        <div className="bg-white p-2 rounded mb-2 font-mono text-xs text-blue-700">
                          Searching: "{activity.query}"
                        </div>
                      )}
                      {activity.title && <div className="font-semibold mb-1">{activity.title}</div>}
                      <p className="text-sm text-gray-700">{activity.description}</p>
                      {activity.findings && activity.findings.length > 0 && (
                        <div className="mt-2 bg-white p-3 rounded border-l-2 border-yellow-400">
                          <strong className="text-xs text-yellow-800">Key Findings:</strong>
                          <ul className="mt-1 space-y-1">
                            {activity.findings.map((finding, idx) => (
                              <li key={idx} className="text-xs text-yellow-700">
                                • {finding}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Status Footer */}
        <Card className="mt-4 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                <strong>Research in progress:</strong> {currentStepName} → {currentPage} Page
              </p>
              <p className="text-xs text-yellow-700 ml-auto">
                Website generation locked until research reaches 100%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
