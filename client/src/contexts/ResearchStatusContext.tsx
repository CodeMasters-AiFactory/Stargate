/**
 * Research Status Context
 * Shared state for research/testing status across components
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import { trackRender } from '@/utils/renderTracker';

export interface ResearchStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  progress: number;
  message?: string;
  timestamp?: Date;
}

export interface ResearchStatus {
  department: string;
  status: 'idle' | 'researching' | 'analyzing' | 'complete' | 'error';
  progress: number;
  currentStep?: string;
  steps: ResearchStep[];
  messagesReceived: number;
  logs: Array<{
    timestamp: Date;
    level: 'info' | 'success' | 'error';
    message: string;
  }>;
}

interface ResearchStatusContextType {
  status: ResearchStatus;
  updateStatus: (updates: Partial<ResearchStatus>) => void;
  updateStep: (stepId: string, updates: Partial<ResearchStep>) => void;
  addLog: (level: 'info' | 'success' | 'error', message: string) => void;
  resetStatus: () => void;
  setDepartment: (department: string) => void;
}

const defaultStatus: ResearchStatus = {
  department: 'Merlin Website Wizard',
  status: 'idle',
  progress: 0,
  steps: [
    { id: 'server-check', name: 'Server Health Check', status: 'pending', progress: 0 },
    { id: 'send-request', name: 'Send Investigation Request', status: 'pending', progress: 0 },
    { id: 'keyword-research', name: 'Keyword Research', status: 'pending', progress: 0 },
    { id: 'competitor-analysis', name: 'Competitor Analysis', status: 'pending', progress: 0 },
    { id: 'ai-strategy', name: 'AI Strategy', status: 'pending', progress: 0 },
    { id: 'complete', name: 'Complete', status: 'pending', progress: 0 },
  ],
  messagesReceived: 0,
  logs: [],
};

const ResearchStatusContext = createContext<ResearchStatusContextType | undefined>(undefined);

export function ResearchStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ResearchStatus>(defaultStatus);
  const prevStatusRef = useRef(status);

  const updateStatus = useCallback((updates: Partial<ResearchStatus>) => {
    setStatus(prev => ({ ...prev, ...updates }));
  }, []);

  const updateStep = useCallback((stepId: string, updates: Partial<ResearchStep>) => {
    setStatus(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, ...updates, timestamp: new Date() } : step
      ),
    }));
  }, []);

  // Throttle log additions to prevent excessive re-renders
  const logBufferRef = useRef<
    Array<{ timestamp: Date; level: 'info' | 'success' | 'error'; message: string }>
  >([]);
  const logFlushTimeoutRef = useRef<NodeJS.Timeout>();

  const addLog = useCallback((level: 'info' | 'success' | 'error', message: string) => {
    // Buffer logs and flush every 500ms to prevent excessive re-renders
    logBufferRef.current.push({ timestamp: new Date(), level, message });

    // Limit log buffer size to prevent memory issues
    if (logBufferRef.current.length > 100) {
      logBufferRef.current = logBufferRef.current.slice(-50); // Keep last 50
    }

    // Clear existing timeout
    if (logFlushTimeoutRef.current) {
      clearTimeout(logFlushTimeoutRef.current);
    }

    // Flush logs after 500ms of inactivity
    logFlushTimeoutRef.current = setTimeout(() => {
      if (logBufferRef.current.length > 0) {
        setStatus(prev => ({
          ...prev,
          logs: [...prev.logs, ...logBufferRef.current],
        }));
        logBufferRef.current = [];
      }
    }, 500);
  }, []);

  const resetStatus = useCallback(() => {
    // Clear log buffer on reset
    if (logFlushTimeoutRef.current) {
      clearTimeout(logFlushTimeoutRef.current);
    }
    logBufferRef.current = [];
    setStatus(defaultStatus);
  }, []);

  const setDepartment = useCallback((department: string) => {
    setStatus(prev => ({ ...prev, department }));
  }, []);

  // Cleanup log buffer on unmount
  useEffect(() => {
    return () => {
      if (logFlushTimeoutRef.current) {
        clearTimeout(logFlushTimeoutRef.current);
      }
    };
  }, []);

  // Track re-renders
  useEffect(() => {
    const reasons: string[] = [];
    if (prevStatusRef.current.status !== status.status) {
      reasons.push(`status: ${prevStatusRef.current.status} -> ${status.status}`);
    }
    if (prevStatusRef.current.progress !== status.progress) {
      reasons.push(`progress: ${prevStatusRef.current.progress}% -> ${status.progress}%`);
    }
    if (prevStatusRef.current.logs.length !== status.logs.length) {
      reasons.push(`logs: ${prevStatusRef.current.logs.length} -> ${status.logs.length}`);
    }
    if (prevStatusRef.current.steps.length !== status.steps.length) {
      reasons.push(`steps: ${prevStatusRef.current.steps.length} -> ${status.steps.length}`);
    }
    trackRender('ResearchStatusProvider', reasons.length > 0 ? reasons.join(' | ') : 'Unknown');
    prevStatusRef.current = status;
  });

  // CRITICAL: Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      status,
      updateStatus,
      updateStep,
      addLog,
      resetStatus,
      setDepartment,
    }),
    [status, updateStatus, updateStep, addLog, resetStatus, setDepartment]
  );

  return (
    <ResearchStatusContext.Provider value={contextValue}>{children}</ResearchStatusContext.Provider>
  );
}

export function useResearchStatus() {
  const context = useContext(ResearchStatusContext);
  if (context === undefined) {
    throw new Error('useResearchStatus must be used within a ResearchStatusProvider');
  }
  return context;
}
