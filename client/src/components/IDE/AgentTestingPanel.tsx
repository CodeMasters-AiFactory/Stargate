import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInvestigation } from '@/contexts/InvestigationContext';
import { useResearchStatus } from '@/contexts/ResearchStatusContext';
import {
  Play,
  Square,
  CheckCircle2,
  XCircle,
  Loader2,
  Activity,
} from 'lucide-react';

interface TestStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  progress: number;
  message?: string;
  timestamp?: Date;
}

interface AgentTestingPanelProps {
  onTestComplete?: (success: boolean) => void;
  autoStart?: boolean;
}

export function AgentTestingPanel({ onTestComplete, autoStart = false }: AgentTestingPanelProps) {
  const {
    isRunning: contextIsRunning,
    progress: contextProgress,
    updateProgress: _updateProgress,
  } = useInvestigation();
  const {
    status: _researchStatus,
    updateStatus,
    updateStep: updateResearchStep,
    addLog: addResearchLog,
    resetStatus: resetResearchStatus,
  } = useResearchStatus();

  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<TestStep[]>([
    { id: 'server-check', name: 'Server Health Check', status: 'pending', progress: 0 },
    { id: 'send-request', name: 'Send Investigation Request', status: 'pending', progress: 0 },
    { id: 'keyword-research', name: 'Keyword Research', status: 'pending', progress: 0 },
    { id: 'competitor-analysis', name: 'Competitor Analysis', status: 'pending', progress: 0 },
    { id: 'ai-strategy', name: 'AI Strategy', status: 'pending', progress: 0 },
    { id: 'complete', name: 'Complete', status: 'pending', progress: 0 },
  ]);
  const [logs, setLogs] = useState<
    Array<{ timestamp: Date; level: 'info' | 'success' | 'error'; message: string }>
  >([]);
  const [messagesReceived, setMessagesReceived] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isExternalInvestigation = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (autoStart && !isRunning) {
      runTest();
    }
  }, [autoStart]);

  // Listen to external investigation context
  useEffect(() => {
    if (contextIsRunning && !isRunning) {
      // External investigation started
      isExternalInvestigation.current = true;
      setIsRunning(true);
      setSteps(prev => prev.map(s => ({ ...s, status: 'pending' as const, progress: 0 })));
      setLogs([]);
      setMessagesReceived(0);
      addLog('info', '🔍 External investigation started - monitoring progress...');
      updateStep('server-check', { status: 'success', progress: 100 });
      updateStep('send-request', { status: 'success', progress: 100 });
    } else if (!contextIsRunning && isRunning && isExternalInvestigation.current) {
      // External investigation stopped
      setIsRunning(false);
      isExternalInvestigation.current = false;
    }
  }, [contextIsRunning]);

  // Update steps based on external investigation progress
  useEffect(() => {
    if (contextProgress && isExternalInvestigation.current) {
      const stageMap: { [key: string]: string } = {
        keyword_research: 'keyword-research',
        competitor_analysis: 'competitor-analysis',
        ai_strategy: 'ai-strategy',
        complete: 'complete',
      };

      const stepId = stageMap[contextProgress.stage];
      if (stepId) {
        updateStep(stepId, {
          status: contextProgress.stage === 'complete' ? 'success' : 'running',
          progress: contextProgress.progress || 0,
          message: contextProgress.message,
        });

        // Mark previous steps as complete
        setSteps(prev => {
          const stepIndex = prev.findIndex(s => s.id === stepId);
          if (stepIndex > 0) {
            return prev.map((step, idx) => {
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
          }
          return prev;
        });

        addLog(
          'info',
          `📊 ${contextProgress.stage}: ${contextProgress.progress}%${contextProgress.message ? ` - ${contextProgress.message}` : ''}`
        );

        if (contextProgress.stage === 'complete') {
          addLog('success', '✅ Investigation completed successfully!');
          setIsRunning(false);
          onTestComplete?.(true);
        } else if (contextProgress.stage === 'error') {
          addLog('error', `❌ Error: ${contextProgress.message || 'Unknown error'}`);
          updateStep('complete', { status: 'error', message: contextProgress.message });
          setIsRunning(false);
          onTestComplete?.(false);
        }
      }
    }
  }, [contextProgress]);

  const addLog = (level: 'info' | 'success' | 'error', message: string) => {
    setLogs(prev => [...prev, { timestamp: new Date(), level, message }]);
    // Also update research status context
    addResearchLog(level, message);
  };

  const updateStep = (stepId: string, updates: Partial<TestStep>) => {
    setSteps(prev => {
      const updated = prev.map(step =>
        step.id === stepId ? { ...step, ...updates, timestamp: new Date() } : step
      );

      // Calculate overall progress
      const completedSteps = updated.filter(s => s.status === 'success').length;
      const totalSteps = updated.length;
      const overallProgress = Math.round((completedSteps / totalSteps) * 100);

      // Determine status
      let status: 'idle' | 'researching' | 'analyzing' | 'complete' | 'error' = 'idle';
      if (isRunning) {
        if (stepId.includes('keyword') || stepId.includes('competitor')) {
          status = 'researching';
        } else if (stepId.includes('ai-strategy')) {
          status = 'analyzing';
        } else {
          status = 'researching';
        }
      }
      if (updates.status === 'success' && stepId === 'complete') {
        status = 'complete';
      }
      if (updates.status === 'error') {
        status = 'error';
      }

      // Update research status context
      updateResearchStep(stepId, updates);
      updateStatus({
        progress: overallProgress,
        status,
        currentStep:
          updates.status === 'running' ? updated.find(s => s.id === stepId)?.name : undefined,
      });

      return updated;
    });
  };

  const runTest = async () => {
    setIsRunning(true);
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending' as const, progress: 0 })));
    setLogs([]);
    setMessagesReceived(0);
    resetResearchStatus();
    updateStatus({ status: 'researching', progress: 0 });
    addLog('info', '🚀 Starting investigation test...');

    abortControllerRef.current = new AbortController();
    const startTime = Date.now();

    try {
      // Step 1: Server Check
      updateStep('server-check', { status: 'running', progress: 0 });
      addLog('info', '⏳ Checking server health...');

      try {
        const healthResponse = await fetch('/', { signal: abortControllerRef.current.signal });
        if (healthResponse.ok) {
          updateStep('server-check', { status: 'success', progress: 100 });
          addLog('success', '✅ Server is responding');
        } else {
          throw new Error('Server returned non-OK status');
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateStep('server-check', { status: 'error', message: errorMessage });
        addLog('error', `❌ Server check failed: ${errorMessage}`);
        throw error;
      }

      // Step 2: Send Request
      updateStep('send-request', { status: 'running', progress: 0 });
      addLog('info', '📤 Sending investigation request...');

      const payload = {
        businessType: 'restaurant',
        businessName: 'Test Restaurant',
        description: 'Agent testing',
        competitors: [{ url: 'https://www.example.com' }],
      };

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
      addLog('success', '✅ Request sent successfully');

      // Step 3: Parse SSE Stream
      addLog('info', '📥 Receiving SSE stream...');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let messageCount = 0;

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
              setMessagesReceived(messageCount);
              updateStatus({ messagesReceived: messageCount });

              addLog('info', `📊 Message #${messageCount}: ${data.stage} (${data.progress}%)`);

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
                });

                // Mark previous steps as complete
                setSteps(prev => {
                  const stepIndex = prev.findIndex(s => s.id === stepId);
                  if (stepIndex > 0) {
                    return prev.map((step, idx) => {
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
                  }
                  return prev;
                });
              }

              // Handle complete
              if (data.stage === 'complete') {
                updateStep('complete', { status: 'success', progress: 100 });
                addLog('success', '✅ Investigation completed successfully!');

                const totalTime = Date.now() - startTime;
                addLog('info', `⏱️ Total time: ${(totalTime / 1000).toFixed(2)}s`);
                addLog('info', `📨 Messages received: ${messageCount}`);

                setIsRunning(false);
                onTestComplete?.(true);
                return;
              }

              // Handle error
              if (data.stage === 'error' || data.error) {
                updateStep('complete', { status: 'error', message: data.error || data.message });
                addLog('error', `❌ Error: ${data.error || data.message}`);

                setIsRunning(false);
                onTestComplete?.(false);
                return;
              }
            } catch (parseError: unknown) {
              const errorMessage =
                parseError instanceof Error ? parseError.message : 'Unknown parse error';
              addLog('error', `⚠️ Failed to parse message: ${errorMessage}`);
            }
          }
        }
      }

      // If we get here, stream ended without complete
      addLog('error', '⚠️ Stream ended without complete message');
      setIsRunning(false);
      onTestComplete?.(false);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        addLog('info', '⏹️ Test cancelled by user');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addLog('error', `❌ Test failed: ${errorMessage}`);
      }
      setIsRunning(false);
      onTestComplete?.(false);
    }
  };

  const stopTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      addLog('info', '⏹️ Test stopped by user');
      setIsRunning(false);
      updateStatus({ status: 'idle', progress: 0 });
    }
  };

  return (
    <div className="h-full flex flex-col bg-background border-r">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Agent Testing</span>
          {isRunning && (
            <Badge variant="secondary" className="text-xs">
              Running
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isRunning ? (
            <Button onClick={stopTest} variant="destructive" size="sm">
              <Square className="w-3 h-3 mr-1" />
              Stop
            </Button>
          ) : (
            <Button onClick={runTest} size="sm">
              <Play className="w-3 h-3 mr-1" />
              Test
            </Button>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="p-3 border-b space-y-2 max-h-48 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase">Test Steps</div>
        {steps.map(step => (
          <div key={step.id} className="flex items-center gap-2 text-xs">
            {step.status === 'running' ? (
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            ) : step.status === 'success' ? (
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            ) : step.status === 'error' ? (
              <XCircle className="w-3 h-3 text-red-500" />
            ) : (
              <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
            )}
            <span className="flex-1">{step.name}</span>
            {step.progress > 0 && <span className="text-muted-foreground">{step.progress}%</span>}
          </div>
        ))}
      </div>

      {/* Logs */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-2 border-b text-xs font-semibold text-muted-foreground">
          Execution Log ({logs.length} entries)
        </div>
        <ScrollArea className="flex-1 p-2" ref={scrollRef}>
          <div className="space-y-1 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-muted-foreground italic">
                No logs yet. Click Test to start...
              </div>
            ) : (
              logs.map((log, index) => (
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
                          : 'text-foreground'
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Summary */}
      {!isRunning && logs.length > 0 && (
        <div className="p-2 border-t bg-muted/50 text-xs">
          <div className="flex items-center justify-between">
            <span>Messages: {messagesReceived}</span>
            <span>
              Steps: {steps.filter(s => s.status === 'success').length} / {steps.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
