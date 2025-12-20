/**
 * Investigation State Management Hook
 * Manages investigation progress, activities, and connection state
 */

import { useState, useRef } from 'react';

export interface InvestigationJob {
  name: string;
  status: 'pending' | 'in-progress' | 'complete' | 'failed';
  progress: number;
  checkScores?: Record<string, number>;
  error?: string;
}

export interface InvestigationProgressState {
  currentJob: number;
  jobs: InvestigationJob[];
}

export interface ResearchActivity {
  id: string;
  timestamp: Date;
  type: 'check' | 'info' | 'warning' | 'error';
  category: string;
  message: string;
  status: 'active' | 'complete' | 'error';
}

type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

interface UseInvestigationStateReturn {
  // Progress state
  investigationProgress: InvestigationProgressState;
  setInvestigationProgress: React.Dispatch<React.SetStateAction<InvestigationProgressState>>;
  lastSavedProgressRef: React.MutableRefObject<InvestigationProgressState | null>;
  
  // Activities
  researchActivities: ResearchActivity[];
  setResearchActivities: React.Dispatch<React.SetStateAction<ResearchActivity[]>>;
  
  // Status flags
  isResearchActive: boolean;
  setIsResearchActive: (active: boolean) => void;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  reconnectAttempts: number;
  setReconnectAttempts: (attempts: number) => void;
  
  // UI state
  activityFilter: 'all' | 'checks' | 'errors' | 'info';
  setActivityFilter: (filter: 'all' | 'checks' | 'errors' | 'info') => void;
  activitySearch: string;
  setActivitySearch: (search: string) => void;
  expandedCategories: Set<number>;
  setExpandedCategories: (categories: Set<number>) => void;
  
  // Refs for cleanup
  investigationReaderRef: React.MutableRefObject<ReadableStreamDefaultReader<Uint8Array> | null>;
  saveProgressTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  
  // Helpers
  clearInvestigation: () => void;
}

/**
 * Custom hook for managing investigation state
 */
export function useInvestigationState(): UseInvestigationStateReturn {
  const [investigationProgress, setInvestigationProgress] = useState<InvestigationProgressState>({
    currentJob: 0,
    jobs: [],
  });
  
  const [researchActivities, setResearchActivities] = useState<ResearchActivity[]>([]);
  const [isResearchActive, setIsResearchActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [activityFilter, setActivityFilter] = useState<'all' | 'checks' | 'errors' | 'info'>('all');
  const [activitySearch, setActivitySearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  
  // Refs
  const lastSavedProgressRef = useRef<InvestigationProgressState | null>(null);
  const investigationReaderRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const saveProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear investigation state
  const clearInvestigation = () => {
    setInvestigationProgress({
      currentJob: 0,
      jobs: [],
    });
    setResearchActivities([]);
    setIsResearchActive(false);
    setConnectionStatus('disconnected');
    setReconnectAttempts(0);
    lastSavedProgressRef.current = null;
    
    // Cleanup reader
    if (investigationReaderRef.current) {
      try {
        investigationReaderRef.current.cancel().catch(() => {});
      } catch {
        // Ignore errors
      }
      investigationReaderRef.current = null;
    }
    
    // Cleanup timeout
    if (saveProgressTimeoutRef.current) {
      clearTimeout(saveProgressTimeoutRef.current);
      saveProgressTimeoutRef.current = null;
    }
  };

  return {
    investigationProgress,
    setInvestigationProgress,
    lastSavedProgressRef,
    researchActivities,
    setResearchActivities,
    isResearchActive,
    setIsResearchActive,
    connectionStatus,
    setConnectionStatus,
    reconnectAttempts,
    setReconnectAttempts,
    activityFilter,
    setActivityFilter,
    activitySearch,
    setActivitySearch,
    expandedCategories,
    setExpandedCategories,
    investigationReaderRef,
    saveProgressTimeoutRef,
    clearInvestigation,
  };
}

