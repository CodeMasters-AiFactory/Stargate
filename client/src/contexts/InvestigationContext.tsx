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

interface InvestigationProgress {
  stage: string;
  progress: number;
  message?: string;
  data?: any;
}

interface InvestigationContextType {
  isRunning: boolean;
  progress: InvestigationProgress | null;
  startInvestigation: (payload: any) => void;
  stopInvestigation: () => void;
  updateProgress: (progress: InvestigationProgress) => void;
}

const InvestigationContext = createContext<InvestigationContextType | undefined>(undefined);

export function InvestigationProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<InvestigationProgress | null>(null);
  const prevIsRunningRef = useRef(isRunning);
  const prevProgressRef = useRef(progress);

  const startInvestigation = useCallback((payload: any) => {
    setIsRunning(true);
    setProgress(null);
  }, []);

  const stopInvestigation = useCallback(() => {
    setIsRunning(false);
    setProgress(null);
  }, []);

  const updateProgress = useCallback((newProgress: InvestigationProgress) => {
    setProgress(newProgress);
    if (newProgress.stage === 'complete' || newProgress.stage === 'error') {
      setIsRunning(false);
    }
  }, []);

  // CRITICAL: Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      isRunning,
      progress,
      startInvestigation,
      stopInvestigation,
      updateProgress,
    }),
    [isRunning, progress, startInvestigation, stopInvestigation, updateProgress]
  );

  // Track re-renders
  useEffect(() => {
    const reasons: string[] = [];
    if (prevIsRunningRef.current !== isRunning) {
      reasons.push(`isRunning: ${prevIsRunningRef.current} -> ${isRunning}`);
      prevIsRunningRef.current = isRunning;
    }
    if (prevProgressRef.current !== progress) {
      reasons.push(`progress: ${progress?.stage || 'null'} (${progress?.progress || 0}%)`);
      prevProgressRef.current = progress;
    }
    trackRender('InvestigationProvider', reasons.length > 0 ? reasons.join(' | ') : 'Unknown');
  });

  return (
    <InvestigationContext.Provider value={contextValue}>{children}</InvestigationContext.Provider>
  );
}

export function useInvestigation() {
  const context = useContext(InvestigationContext);
  if (!context) {
    throw new Error('useInvestigation must be used within InvestigationProvider');
  }
  return context;
}
