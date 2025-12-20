import { useState, useEffect, useRef } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  Square,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Activity,
} from 'lucide-react';
import { NavigationButtons } from './BackButton';

interface TestStepDetails {
  keywords?: string[];
  competitorInsights?: string[];
  [key: string]: unknown;
}

interface TestStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  progress: number;
  message?: string;
  timestamp?: Date;
  details?: TestStepDetails;
}

interface LiveTestResult {
  steps: TestStep[];
  currentStep: number;
  isRunning: boolean;
  isComplete: boolean;
  hasError: boolean;
  totalTime?: number;
  messagesReceived: number;
}

export function LiveTestingPanel() {
  const [testResult, setTestResult] = useState<LiveTestResult>({
    steps: [
      { id: 'server-check', name: 'Server Health Check', status: 'pending', progress: 0 },
      { id: 'send-request', name: 'Send Investigation Request', status: 'pending', progress: 0 },
      { id: 'keyword-research', name: 'Keyword Research', status: 'pending', progress: 0 },
      { id: 'competitor-analysis', name: 'Competitor Analysis', status: 'pending', progress: 0 },
      { id: 'ai-strategy', name: 'AI Strategy', status: 'pending', progress: 0 },
      { id: 'complete', name: 'Complete', status: 'pending', progress: 0 },
    ],
    currentStep: 0,
    isRunning: false,
    isComplete: false,
    hasError: false,
    messagesReceived: 0,
  });

  const [executionLog, setExecutionLog] = useState<
    Array<{
      timestamp: Date;
      level: 'info' | 'success' | 'error' | 'warning';
      message: string;
      step?: string;
    }>
  >([]);

  const [showPreview, setShowPreview] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [executionLog]);

  const addLog = (
    level: 'info' | 'success' | 'error' | 'warning',
    message: string,
    step?: string
  ) => {
    setExecutionLog(prev => [
      ...prev,
      {
        timestamp: new Date(),
        level,
        message,
        step,
      },
    ]);
  };

  const updateStep = (stepId: string, updates: Partial<TestStep>) => {
    setTestResult(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, ...updates, timestamp: new Date() } : step
      ),
    }));
  };

  const runTest = async () => {
    // Reset state
    setTestResult({
      steps: [
        { id: 'server-check', name: 'Server Health Check', status: 'pending', progress: 0 },
        { id: 'send-request', name: 'Send Investigation Request', status: 'pending', progress: 0 },
        { id: 'keyword-research', name: 'Keyword Research', status: 'pending', progress: 0 },
        { id: 'competitor-analysis', name: 'Competitor Analysis', status: 'pending', progress: 0 },
        { id: 'ai-strategy', name: 'AI Strategy', status: 'pending', progress: 0 },
        { id: 'complete', name: 'Complete', status: 'pending', progress: 0 },
      ],
      currentStep: 0,
      isRunning: true,
      isComplete: false,
      hasError: false,
      messagesReceived: 0,
    });
    setExecutionLog([]);
    addLog('info', '🚀 Starting live test...');

    abortControllerRef.current = new AbortController();
    const startTime = Date.now();

    try {
      // Step 1: Server Health Check
      updateStep('server-check', { status: 'running', progress: 0 });
      addLog('info', '⏳ Checking server health...', 'server-check');

      try {
        const healthResponse = await fetch('/', {
          signal: abortControllerRef.current.signal,
          method: 'GET',
        });
        if (healthResponse.ok) {
          updateStep('server-check', { status: 'success', progress: 100 });
          addLog('success', '✅ Server is responding', 'server-check');
        } else {
          throw new Error('Server returned non-OK status');
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateStep('server-check', { status: 'error', progress: 0, message: errorMessage });
        addLog('error', `❌ Server check failed: ${errorMessage}`, 'server-check');
        throw error;
      }

      // Step 2: Send Investigation Request
      updateStep('send-request', { status: 'running', progress: 0 });
      addLog('info', '📤 Preparing investigation request...', 'send-request');

      const payload = {
        businessType: 'restaurant',
        businessName: 'Test Restaurant',
        description: 'A test restaurant for live testing',
        competitors: [{ url: 'https://www.example.com' }],
      };

      addLog('info', '📡 Sending request to /api/website-builder/investigate...', 'send-request');

      const response = await fetch('/api/website-builder/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      updateStep('send-request', { status: 'success', progress: 100 });
      addLog('success', '✅ Request sent successfully', 'send-request');

      // Step 3: Parse SSE Stream
      addLog('info', '📥 Receiving SSE stream...');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let messageCount = 0;
      let lastStage = '';

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      // CRITICAL: Add yielding to prevent blocking main thread
      let iterationCount = 0;
      while (true) {
        // Yield to browser every 50 iterations to prevent freezing
        if (iterationCount++ % 50 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              messageCount++;
              lastStage = data.stage || 'unknown';

              addLog(
                'info',
                `📊 Message #${messageCount}: ${data.stage} (${data.progress}%)`,
                data.stage
              );

              // Update step based on stage
              const stageMap: { [key: string]: string } = {
                keyword_research: 'keyword-research',
                competitor_analysis: 'competitor-analysis',
                ai_strategy: 'ai-strategy',
                complete: 'complete',
              };

              const stepId = stageMap[data.stage];
              if (stepId) {
                updateStep(stepId, {
                  status: 'running',
                  progress: data.progress || 0,
                  message: data.message,
                  details: data,
                });

                // Mark previous steps as complete
                setTestResult(prev => {
                  const stepIndex = prev.steps.findIndex(s => s.id === stepId);
                  if (stepIndex > 0) {
                    const updatedSteps = prev.steps.map((step, idx) => {
                      if (idx < stepIndex && step.status !== 'success' && step.status !== 'error') {
                        return {
                          ...step,
                          status: 'success' as const,
                          progress: 100,
                          timestamp: new Date(),
                        };
                      }
                      return step;
                    });
                    return { ...prev, steps: updatedSteps };
                  }
                  return prev;
                });
              }

              // Handle complete
              if (data.stage === 'complete') {
                updateStep('complete', { status: 'success', progress: 100, details: data.data });
                addLog('success', '✅ Investigation completed successfully!', 'complete');

                const totalTime = Date.now() - startTime;
                setTestResult(prev => ({
                  ...prev,
                  isComplete: true,
                  isRunning: false,
                  totalTime,
                  messagesReceived: messageCount,
                }));
                return;
              }

              // Handle error
              if (data.stage === 'error' || data.error) {
                updateStep(lastStage || 'complete', {
                  status: 'error',
                  message: data.error || data.message,
                });
                addLog('error', `❌ Error: ${data.error || data.message}`, lastStage);

                setTestResult(prev => ({
                  ...prev,
                  isComplete: true,
                  isRunning: false,
                  hasError: true,
                  messagesReceived: messageCount,
                }));
                return;
              }
            } catch (parseError: unknown) {
              const errorMessage =
                parseError instanceof Error ? parseError.message : 'Unknown parse error';
              addLog('warning', `⚠️ Failed to parse message: ${errorMessage}`);
            }
          } else if (line.startsWith(': ')) {
            // Comment/keepalive message
            if (line.includes('connected')) {
              addLog('info', '🔗 SSE connection established');
            } else if (line.includes('keepalive')) {
              addLog('info', '💓 Keep-alive received');
            }
          }
        }
      }

      // If we get here, stream ended without complete
      addLog('warning', '⚠️ Stream ended without complete message');
      setTestResult(prev => ({
        ...prev,
        isComplete: true,
        isRunning: false,
        messagesReceived: messageCount,
      }));
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        addLog('warning', '⏹️ Test cancelled by user');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addLog('error', `❌ Test failed: ${errorMessage}`);
        setTestResult(prev => ({
          ...prev,
          isComplete: true,
          isRunning: false,
          hasError: true,
        }));
      }
    } finally {
      setTestResult(prev => ({ ...prev, isRunning: false }));
    }
  };

  const stopTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      addLog('warning', '⏹️ Test stopped by user');
      setTestResult(prev => ({ ...prev, isRunning: false }));
    }
  };

  const getStatusIcon = (status: TestStep['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: TestStep['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <CardHeader className="border-b">
        <NavigationButtons backDestination="dashboard" className="mb-2" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Live Testing Panel</CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time investigation testing (like Replit's live testing)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {testResult.isRunning ? (
              <Button onClick={stopTest} variant="destructive" size="sm">
                <Square className="w-4 h-4 mr-2" />
                Stop Test
              </Button>
            ) : (
              <Button onClick={runTest} size="sm">
                <Play className="w-4 h-4 mr-2" />
                Run Test
              </Button>
            )}
            <Button onClick={() => setShowPreview(!showPreview)} variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Testing Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CardContent className="flex-1 overflow-hidden p-6">
            {/* Test Steps */}
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Test Steps
              </h3>
              {testResult.steps.map((step) => (
                <div key={step.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(step.status)}
                      <span className="text-sm font-medium">{step.name}</span>
                      {step.progress > 0 && step.status === 'running' && (
                        <Badge variant="outline" className="text-xs">
                          {step.progress}%
                        </Badge>
                      )}
                    </div>
                    {step.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {step.timestamp.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  {step.status === 'running' && <Progress value={step.progress} className="h-2" />}
                  {step.message && (
                    <p className="text-xs text-muted-foreground ml-7">{step.message}</p>
                  )}
                  {step.status === 'error' && step.message && (
                    <div className="ml-7 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded text-xs text-red-800 dark:text-red-200">
                      {step.message}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Execution Log */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Execution Log
                </h3>
                {testResult.isComplete && (
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">
                      Messages: {testResult.messagesReceived}
                    </span>
                    {testResult.totalTime && (
                      <span className="text-muted-foreground">
                        Time: {(testResult.totalTime / 1000).toFixed(2)}s
                      </span>
                    )}
                  </div>
                )}
              </div>
              <ScrollArea className="h-64 border rounded-lg p-4 bg-muted/50" ref={scrollRef}>
                <div className="space-y-1 font-mono text-xs">
                  {executionLog.length === 0 ? (
                    <div className="text-muted-foreground italic">
                      No logs yet. Click "Run Test" to start...
                    </div>
                  ) : (
                    executionLog.map((log, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span
                          className={
                            log.level === 'success'
                              ? 'text-green-600 dark:text-green-400'
                              : log.level === 'error'
                                ? 'text-red-600 dark:text-red-400'
                                : log.level === 'warning'
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-foreground'
                          }
                        >
                          {log.message}
                        </span>
                        {log.step && (
                          <Badge variant="outline" className="text-xs">
                            {log.step}
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Test Summary */}
            {testResult.isComplete && (
              <div className="mt-6 p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  {testResult.hasError ? (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <h4 className="font-semibold text-red-600 dark:text-red-400">Test Failed</h4>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <h4 className="font-semibold text-green-600 dark:text-green-400">
                        Test Passed
                      </h4>
                    </>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Messages received: {testResult.messagesReceived}</div>
                  {testResult.totalTime && (
                    <div>Total time: {(testResult.totalTime / 1000).toFixed(2)} seconds</div>
                  )}
                  <div>
                    Steps completed: {testResult.steps.filter(s => s.status === 'success').length} /{' '}
                    {testResult.steps.length}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </div>

        {/* Preview Panel (like Replit's live preview) */}
        {showPreview && (
          <div className="w-96 border-l bg-muted/30 flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                    Current Status
                  </h4>
                  <div className="space-y-2">
                    {testResult.steps.map(step => (
                      <div key={step.id} className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(step.status)}`} />
                        <span>{step.name}</span>
                        {step.status === 'running' && (
                          <span className="text-muted-foreground">({step.progress}%)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {testResult.steps.find(s => s.id === 'complete' && s.status === 'success')
                  ?.details && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">Results</h4>
                    <div className="text-xs space-y-1">
                      <div>
                        Keywords:{' '}
                        {testResult.steps.find(s => s.id === 'complete')?.details?.keywords
                          ?.length || 0}
                      </div>
                      <div>
                        Competitors:{' '}
                        {testResult.steps.find(s => s.id === 'complete')?.details
                          ?.competitorInsights?.length || 0}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
