import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  AlertTriangle,
  Loader2,
  Code,
  Circle,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { NavigationButtons } from './BackButton';

export interface GenerationStep {
  id: string;
  phase: string;
  phaseNumber: number;
  stepNumber: number;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
  error?: string;
  duration?: number;
  timestamp: Date;
  data?: unknown;
}

export interface GenerationPhase {
  id: string;
  number: number;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  steps: GenerationStep[];
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

interface WebsiteGenerationDebuggerProps {
  onComplete?: (result: unknown) => void;
  onError?: (error: Error) => void;
}

export function WebsiteGenerationDebugger({ onComplete, onError }: WebsiteGenerationDebuggerProps) {
  const [phases, setPhases] = useState<GenerationPhase[]>([]);
  // Reserved for future use: currentPhase, currentStep
  const [_currentPhase, _setCurrentPhase] = useState<number>(0);
  const [_currentStep, _setCurrentStep] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [errors, setErrors] = useState<Array<{ phase: string; step: string; error: string }>>([]);
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());
  // Reserved for future use: generationResult, sessionId
  const [_generationResult, _setGenerationResult] = useState<unknown>(null);
  const [_sessionId, _setSessionId] = useState<string | null>(null);
  const [generatedWebsite, setGeneratedWebsite] = useState<unknown>(null);

  // Ref to store abort controller for SSE stream cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize phases structure
  useEffect(() => {
    const initialPhases: GenerationPhase[] = [
      {
        id: 'setup',
        number: 1,
        name: 'Setup & Initialization',
        description: 'Load configuration, create directories, initialize systems',
        status: 'pending',
        steps: [],
      },
      {
        id: 'design-strategy',
        number: 2,
        name: 'Design Strategy',
        description: 'Generate AI design strategy and context',
        status: 'pending',
        steps: [],
      },
      {
        id: 'layout',
        number: 3,
        name: 'Layout Generation',
        description: 'Create section plan and layout structure',
        status: 'pending',
        steps: [],
      },
      {
        id: 'style',
        number: 4,
        name: 'Style System',
        description: 'Generate colors, typography, spacing',
        status: 'pending',
        steps: [],
      },
      {
        id: 'content',
        number: 5,
        name: 'Content Generation',
        description: 'Generate intelligent copy for all sections',
        status: 'pending',
        steps: [],
      },
      {
        id: 'images',
        number: 6,
        name: 'Image Planning & Generation',
        description: 'Plan and generate images for sections',
        status: 'pending',
        steps: [],
      },
      {
        id: 'seo',
        number: 7,
        name: 'SEO & Optimization',
        description: 'Generate SEO metadata and structured data',
        status: 'pending',
        steps: [],
      },
      {
        id: 'code',
        number: 8,
        name: 'Code Generation',
        description: 'Generate HTML, CSS, JavaScript',
        status: 'pending',
        steps: [],
      },
      {
        id: 'quality',
        number: 9,
        name: 'Quality Assessment',
        description: 'Analyze and score the generated website',
        status: 'pending',
        steps: [],
      },
      {
        id: 'finalization',
        number: 10,
        name: 'Finalization',
        description: 'Save files, generate metadata, package website',
        status: 'pending',
        steps: [],
      },
    ];
    setPhases(initialPhases);
  }, []);

  const togglePhase = (phaseNumber: number) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseNumber)) {
      newExpanded.delete(phaseNumber);
    } else {
      newExpanded.add(phaseNumber);
    }
    setExpandedPhases(newExpanded);
  };

  // Reserved for future use: updateStep
  const _updateStep = (phaseId: string, stepId: string, updates: Partial<GenerationStep>) => {
    setPhases(prevPhases =>
      prevPhases.map(phase => {
        if (phase.id === phaseId) {
          const updatedSteps = phase.steps.map(step =>
            step.id === stepId ? { ...step, ...updates } : step
          );
          return { ...phase, steps: updatedSteps };
        }
        return phase;
      })
    );
  };

  // Reserved for future use: addStep
  const _addStep = (phaseId: string, step: GenerationStep) => {
    setPhases(prevPhases =>
      prevPhases.map(phase => {
        if (phase.id === phaseId) {
          const existingStep = phase.steps.find(s => s.id === step.id);
          if (existingStep) {
            return phase;
          }
          return {
            ...phase,
            steps: [...phase.steps, step],
            status: phase.status === 'pending' ? 'running' : phase.status,
          };
        }
        return phase;
      })
    );
  };

  const startGeneration = async () => {
    // Cleanup any existing abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsRunning(true);
    setIsPaused(false);
    setErrors([]);
    setOverallProgress(0);
    _setCurrentPhase(0);
    _setCurrentStep(null);
    setGeneratedWebsite(null);

    // Simple test website requirements - 1 PAGE ONLY
    const requirements = {
      businessName: 'Test Website',
      businessType: 'Business',
      location: {
        city: 'Test City',
        region: 'Test Region',
        country: 'US',
      },
      services: [{ name: 'Service 1', shortDescription: 'Test service' }],
      pagesToGenerate: ['Home'], // ONLY 1 PAGE
    };

    try {
      const response = await fetch('/api/website-builder/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requirements,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle Server-Sent Events
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      // CRITICAL: Add yielding to prevent blocking main thread
      let iterationCount = 0;
      while (true) {
        // Yield to browser every 50 iterations to prevent freezing
        if (iterationCount++ % 50 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }

        // Check if aborted
        if (abortController.signal.aborted) {
          reader.cancel();
          break;
        }

        if (isPaused) {
          await new Promise(resolve => {
            const checkPause = () => {
              if (!isPaused || abortController.signal.aborted) {
                resolve(undefined);
              } else {
                setTimeout(checkPause, 100);
              }
            };
            checkPause();
          });
        }

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6)) as { error?: string; stage?: string; data?: unknown; progress?: number; [key: string]: unknown };
            handleDebugEvent(data);
          }
        }
      }

      // Cleanup: Cancel reader if still active
      if (reader && !abortController.signal.aborted) {
        try {
          reader.cancel();
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      // Clear abort controller ref
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    } catch (error: unknown) {
      // Cleanup on error
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }

      // Don't report abort errors as real errors
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Generation aborted');
        setIsRunning(false);
        return;
      }

      console.error('Generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setErrors(prev => [...prev, { phase: 'Connection', step: 'Start', error: errorMessage }]);
      setIsRunning(false);
      if (onError && error instanceof Error) onError(error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const handleDebugEvent = (event: { error?: string; stage?: string; data?: unknown; progress?: number; [key: string]: unknown }) => {
    if (event.error) {
      setErrors(prev => [
        ...prev,
        { phase: 'Unknown', step: 'Unknown', error: String(event.error) },
      ]);
      setIsRunning(false);
      if (onError) onError(new Error(event.error));
      return;
    }

    if (event.stage === 'complete' && event.data) {
      setOverallProgress(100);
      setIsRunning(false);
      _setGenerationResult(event.data);
      setGeneratedWebsite(event.data);
      // PAUSE HERE - Website is displayed
      setIsPaused(true);
      if (onComplete) onComplete(event.data);
      return;
    }

    if (event.progress !== undefined) {
      setOverallProgress(Number(event.progress));
    }
  };

  const handlePause = async () => {
    setIsPaused(true);
  };

  const handleResume = async () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
  };

  const getPhaseIcon = (phase: GenerationPhase) => {
    switch (phase.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepIcon = (step: GenerationStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const completedSteps = phases.reduce(
    (acc, phase) => acc + phase.steps.filter(s => s.status === 'completed').length,
    0
  );
  const totalSteps = phases.reduce((acc, phase) => acc + phase.steps.length, 0);
  const actualProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : overallProgress;

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader>
          <NavigationButtons backDestination="dashboard" className="mb-2" />
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Website Generation Debugger
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Step-by-step visualization - 1 Page Website Only
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isRunning && !isPaused && (
                <Button onClick={startGeneration} size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Start Generation
                </Button>
              )}
              {isRunning && !isPaused && (
                <Button onClick={handlePause} size="sm" variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              {isPaused && (
                <Button onClick={handleResume} size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}
              {isRunning && (
                <Button onClick={handleStop} size="sm" variant="destructive">
                  Stop
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Overall Progress: {actualProgress.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">
                {completedSteps} / {totalSteps} steps completed
              </span>
            </div>
            <Progress value={actualProgress} className="h-2" />
            {actualProgress === 100 && (
              <div className="mt-2 flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Generation Complete! Website displayed below.
                </span>
              </div>
            )}
          </div>

          {/* Website Preview - Display when complete */}
          {generatedWebsite && (
            <div className="mb-4 border rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <div className="bg-muted p-2 text-xs font-mono border-b">
                Website Preview (PAUSED - Ready for review)
              </div>
              <iframe
                srcDoc={(() => {
                  // Extract HTML from generated website
                  const website = generatedWebsite as { files?: Record<string, { content?: string } | string>; assets?: { css?: string; js?: string } };
                  if (website.files) {
                    const firstPage =
                      website.files['pages/index.html'] ||
                      website.files['index.html'] ||
                      Object.values(website.files)[0];
                    if (firstPage) {
                      const html = typeof firstPage === 'string' ? firstPage : (firstPage.content || '');
                      const css = website.assets?.css || '';
                      const js = website.assets?.js || '';
                      return html.includes('</head>')
                        ? html
                            .replace('</head>', `<style>${css}</style></head>`)
                            .replace('</body>', `<script>${js}</script></body>`)
                        : `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}</script></body></html>`;
                    }
                  }
                  return '<html><body>Loading...</body></html>';
                })()}
                className="w-full h-full border-0"
                title="Generated Website"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Errors Detected</AlertTitle>
              <AlertDescription>
                <ScrollArea className="h-32">
                  {errors.map((err, idx) => (
                    <div key={idx} className="text-sm">
                      <strong>
                        {err.phase} → {err.step}:
                      </strong>{' '}
                      {err.error}
                    </div>
                  ))}
                </ScrollArea>
              </AlertDescription>
            </Alert>
          )}

          {/* Phases List */}
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {phases.map(phase => (
                <Card key={phase.id} className="border-2">
                  <CardHeader
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => togglePhase(phase.number)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedPhases.has(phase.number) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        {getPhaseIcon(phase)}
                        <div>
                          <CardTitle className="text-base">
                            Phase {phase.number}: {phase.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{phase.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            phase.status === 'completed'
                              ? 'default'
                              : phase.status === 'running'
                                ? 'secondary'
                                : phase.status === 'error'
                                  ? 'destructive'
                                  : 'outline'
                          }
                        >
                          {phase.status}
                        </Badge>
                        {phase.steps.length > 0 && (
                          <Badge variant="outline">
                            {phase.steps.filter(s => s.status === 'completed').length} /{' '}
                            {phase.steps.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {expandedPhases.has(phase.number) && (
                    <CardContent>
                      {phase.steps.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          No steps executed yet...
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {phase.steps.map(step => (
                            <div
                              key={step.id}
                              className={`p-3 rounded-lg border ${
                                step.status === 'running'
                                  ? 'bg-blue-50 dark:bg-blue-950 border-blue-200'
                                  : step.status === 'error'
                                    ? 'bg-red-50 dark:bg-red-950 border-red-200'
                                    : step.status === 'completed'
                                      ? 'bg-green-50 dark:bg-green-950 border-green-200'
                                      : 'bg-muted/50'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {getStepIcon(step)}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                      Step {step.stepNumber}: {step.name}
                                    </span>
                                    {step.duration && (
                                      <Badge variant="outline" className="text-xs">
                                        {step.duration}ms
                                      </Badge>
                                    )}
                                  </div>
                                  {step.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {step.description}
                                    </p>
                                  )}
                                  {step.error && (
                                    <Alert variant="destructive" className="mt-2">
                                      <AlertDescription className="text-xs">
                                        {step.error}
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
