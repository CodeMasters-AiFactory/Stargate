/**
 * Website Generation Hook
 * Manages all website generation logic and state
 */

import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { GeneratedWebsitePackage, MultiPageWebsite, LegacyWebsiteContent } from '@/types/websiteBuilder';
import { normalizeGeneratedWebsite } from '@/types/websiteBuilder';

interface GeneratedWebsite {
  id?: string;
  name?: string;
  description?: string;
  template?: string;
  code: GeneratedWebsitePackage;
  requirements?: Record<string, unknown>;
  createdAt?: string;
}

interface BuildingProgress {
  currentBlock: number;
  blocks: Array<{
    name: string;
    status: 'pending' | 'building' | 'complete';
  }>;
  previewHtml?: string;
}

interface UseWebsiteGenerationReturn {
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  buildingProgress: BuildingProgress;
  setBuildingProgress: React.Dispatch<React.SetStateAction<BuildingProgress>>;
  generateAbortControllerRef: React.MutableRefObject<AbortController | null>;
  generationReaderRef: React.MutableRefObject<ReadableStreamDefaultReader<Uint8Array> | null>;
  error: { stage: string; message: string; canRetry: boolean } | null;
  setError: (error: { stage: string; message: string; canRetry: boolean } | null) => void;
  clearError: () => void;
  clearGeneration: () => void;
}

/**
 * Custom hook for managing website generation state and operations
 */
export function useWebsiteGeneration(): UseWebsiteGenerationReturn {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [buildingProgress, setBuildingProgress] = useState<BuildingProgress>({
    currentBlock: 0,
    blocks: [
      { name: 'Layout Structure', status: 'pending' },
      { name: 'Design System', status: 'pending' },
      { name: 'Content Generation', status: 'pending' },
      { name: 'Images & Media', status: 'pending' },
      { name: 'SEO Optimization', status: 'pending' },
      { name: 'Code Assembly', status: 'pending' },
    ],
  });
  const [error, setError] = useState<{ stage: string; message: string; canRetry: boolean } | null>(null);
  
  // Refs for cleanup
  const generateAbortControllerRef = useRef<AbortController | null>(null);
  const generationReaderRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear generation state
  const clearGeneration = useCallback(() => {
    setIsGenerating(false);
    setError(null);
    setBuildingProgress({
      currentBlock: 0,
      blocks: [
        { name: 'Layout Structure', status: 'pending' },
        { name: 'Design System', status: 'pending' },
        { name: 'Content Generation', status: 'pending' },
        { name: 'Images & Media', status: 'pending' },
        { name: 'SEO Optimization', status: 'pending' },
        { name: 'Code Assembly', status: 'pending' },
      ],
    });
    
    // Cleanup abort controller
    if (generateAbortControllerRef.current) {
      generateAbortControllerRef.current.abort();
      generateAbortControllerRef.current = null;
    }
    
    // Cleanup reader
    if (generationReaderRef.current) {
      try {
        generationReaderRef.current.cancel().catch(() => {});
      } catch {
        // Ignore errors during cleanup
      }
      generationReaderRef.current = null;
    }
  }, []);

  return {
    isGenerating,
    setIsGenerating,
    buildingProgress,
    setBuildingProgress,
    generateAbortControllerRef,
    generationReaderRef,
    error,
    setError,
    clearError,
    clearGeneration,
  };
}

