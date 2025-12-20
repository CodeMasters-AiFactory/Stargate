/**
 * Wizard State Management Hook
 * Extracts and manages all wizard state to reduce complexity in main component
 *
 * Features:
 * - LocalStorage persistence with debounced auto-save
 * - State validation using Zod schemas
 * - Safe cleanup with proper timeout management
 * - Update guards to prevent infinite loops
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { WizardState, WizardStage } from '@/types/websiteBuilder';
import {
  WIZARD_STORAGE_KEY,
  WIZARD_AUTOSAVE_DEBOUNCE_MS,
  WIZARD_GENERATED_WEBSITE_KEY,
  WIZARD_ERROR_MESSAGES,
} from '@/config/wizard';
import { parseWizardState, isValidWizardStage } from '@/config/wizardValidation';
import { useSafeTimeout, useUpdateGuard, useIsMounted } from './useCleanup';

interface UseWizardStateOptions {
  /**
   * Debug logging function (disabled in production by default)
   */
  debugLog?: (...args: unknown[]) => void;
  /**
   * Whether to enable strict validation
   */
  strictValidation?: boolean;
  /**
   * Callback when state restoration fails
   */
  onRestoreError?: (error: Error) => void;
}

interface UseWizardStateReturn {
  wizardState: WizardState;
  setWizardState: React.Dispatch<React.SetStateAction<WizardState>>;
  updateWizardState: (updates: Partial<WizardState>) => void;
  navigateToStage: (stage: WizardStage) => void;
  clearWizardData: () => void;
  resetWizard: () => void;
}

/**
 * Custom hook for managing wizard state with localStorage persistence
 *
 * @param options - Configuration options
 * @returns Wizard state and control functions
 *
 * @example
 * ```tsx
 * function WizardComponent() {
 *   const { wizardState, updateWizardState, navigateToStage, resetWizard } = useWizardState({
 *     debugLog: console.log,
 *     onRestoreError: (error) => toast.error('Failed to restore progress'),
 *   });
 *
 *   return <div>Stage: {wizardState.stage}</div>;
 * }
 * ```
 */
export function useWizardState(
  options: UseWizardStateOptions = {}
): UseWizardStateReturn {
  const { debugLog = () => {}, strictValidation = false, onRestoreError } = options;

  // Use safe timeout hook for cleanup
  const { setSafeTimeout, clearAllTimeouts } = useSafeTimeout();
  const isMounted = useIsMounted();

  // Update guard to prevent infinite loops
  const { shouldUpdate, recordUpdate } = useUpdateGuard({
    maxUpdates: 20,
    timeWindow: 1000,
    onLimitExceeded: () => {
      debugLog('[useWizardState] ⚠️ Update limit exceeded - possible infinite loop detected');
    },
  });

  const isInitialMount = useRef(true);

  // Clear all wizard data from localStorage
  const clearWizardData = useCallback(() => {
    try {
      debugLog('[useWizardState] Clearing all wizard data');
      localStorage.removeItem(WIZARD_STORAGE_KEY);
      localStorage.removeItem(WIZARD_GENERATED_WEBSITE_KEY);

      // Clear all wizard-related keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('stargate-wizard') || key.startsWith('merlin_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      debugLog(`[useWizardState] Cleared ${keysToRemove.length} items from localStorage`);
    } catch (error) {
      debugLog('[useWizardState] Error clearing wizard data:', error);
    }
  }, [debugLog]);

  /**
   * Load saved state synchronously (for useState initializer)
   * Uses Zod validation to ensure state integrity
   */
  const loadSavedStateSync = useCallback((): WizardState | null => {
    try {
      const saved = localStorage.getItem(WIZARD_STORAGE_KEY);
      if (!saved) {
        return null;
      }

      const rawParsed = JSON.parse(saved);

      // Validate with Zod if strict validation is enabled
      const parsed = strictValidation ? parseWizardState(rawParsed) : rawParsed;
      if (!parsed) {
        debugLog('[useWizardState] State validation failed - clearing old data');
        clearWizardData();
        onRestoreError?.(new Error(WIZARD_ERROR_MESSAGES.loadStateFailed));
        return null;
      }

      // Guard: Never restore if at package-select without package selected
      if (parsed.stage === 'package-select' && !parsed.selectedPackage) {
        debugLog('[useWizardState] Detected package-select without package - clearing old data');
        clearWizardData();
        return null;
      }

      // Guard: Never restore if no package selected
      if (!parsed.selectedPackage) {
        debugLog('[useWizardState] No package selected - clearing old data');
        clearWizardData();
        return null;
      }

      // Guard: Never restore completed states
      if (parsed.stage === 'commit' || parsed.stage === 'review') {
        debugLog('[useWizardState] Detected completed project - clearing old data');
        clearWizardData();
        return null;
      }

      // Guard: Validate stage is valid
      if (!isValidWizardStage(parsed.stage)) {
        debugLog('[useWizardState] Invalid stage detected - clearing old data');
        clearWizardData();
        return null;
      }

      debugLog('[useWizardState] Restoring saved state:', parsed.stage);
      return parsed as WizardState;
    } catch (error) {
      debugLog('[useWizardState] Error loading saved state:', error);
      clearWizardData();
      onRestoreError?.(error instanceof Error ? error : new Error(WIZARD_ERROR_MESSAGES.loadStateFailed));
    }
    return null;
  }, [clearWizardData, debugLog, strictValidation, onRestoreError]);

  // Initialize state
  const [wizardState, setWizardState] = useState<WizardState>(() => {
    // Always clear old data on initial mount
    debugLog('[useWizardState] Initialized - clearing all previous data for fresh start');
    
    // Try to load saved state
    const saved = loadSavedStateSync();
    if (saved?.selectedPackage && saved.stage !== 'package-select' && saved.stage !== 'commit' && saved.stage !== 'review') {
      debugLog('[useWizardState] Restoring in-progress state:', saved.stage);
      return saved;
    }
    
    // Default state
    debugLog('[useWizardState] Initialized with default state');
    return {
      stage: 'package-select',
      currentPage: 'project-overview',
      currentQuestion: 0,
      requirements: {},
      messages: [],
      stageHistory: [],
      selectedPackage: undefined,
      packageConstraints: undefined,
    };
  });

  /**
   * Auto-save state to localStorage with debounce
   * Uses safe timeout hook for proper cleanup on unmount
   */
  useEffect(() => {
    // Skip save on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Check update guard to prevent infinite loops
    if (!shouldUpdate()) {
      debugLog('[useWizardState] ⚠️ Auto-save blocked by update guard');
      return;
    }
    recordUpdate();

    // Clear existing timeouts before setting new one
    clearAllTimeouts();

    // Set new timeout to save after debounce period (using safe timeout)
    setSafeTimeout(() => {
      // Double-check we're still mounted before saving
      if (!isMounted()) {
        return;
      }

      try {
        // CRITICAL: Never save package-select stage if we have a selected package
        // This prevents the reset loop
        if (wizardState.stage === 'package-select' && wizardState.selectedPackage) {
          debugLog('[useWizardState] ⚠️ BLOCKED save - would save package-select with selected package');
          return;
        }

        localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(wizardState));
        debugLog('[useWizardState] State saved to localStorage:', wizardState.stage);
      } catch (error) {
        debugLog('[useWizardState] Error saving state:', error);
      }
    }, WIZARD_AUTOSAVE_DEBOUNCE_MS);

    // Cleanup is handled automatically by useSafeTimeout hook
  }, [wizardState, debugLog, shouldUpdate, recordUpdate, clearAllTimeouts, setSafeTimeout, isMounted]);

  /**
   * Update wizard state with partial updates
   * Validates stage transitions if strict validation is enabled
   */
  const updateWizardState = useCallback(
    (updates: Partial<WizardState>) => {
      // Validate stage if being updated
      if (updates.stage && strictValidation && !isValidWizardStage(updates.stage)) {
        debugLog('[useWizardState] ⚠️ Invalid stage in update:', updates.stage);
        return;
      }

      setWizardState((prev) => ({ ...prev, ...updates }));
    },
    [strictValidation, debugLog]
  );

  /**
   * Navigate to a specific stage
   * Records current stage in history for back navigation
   */
  const navigateToStage = useCallback(
    (stage: WizardStage) => {
      // Validate stage
      if (!isValidWizardStage(stage)) {
        debugLog('[useWizardState] ⚠️ Attempted navigation to invalid stage:', stage);
        return;
      }

      setWizardState((prev) => ({
        ...prev,
        stageHistory: [...prev.stageHistory, prev.stage],
        stage,
      }));
    },
    [debugLog]
  );

  /**
   * Reset wizard to initial state
   * Clears all localStorage data and returns to package selection
   */
  const resetWizard = useCallback(() => {
    debugLog('[useWizardState] Resetting wizard');
    clearWizardData();
    setWizardState({
      stage: 'package-select',
      currentPage: 'project-overview',
      currentQuestion: 0,
      requirements: {},
      messages: [],
      stageHistory: [],
      selectedPackage: undefined,
      packageConstraints: undefined,
    });
  }, [clearWizardData, debugLog]);

  return {
    wizardState,
    setWizardState,
    updateWizardState,
    navigateToStage,
    clearWizardData,
    resetWizard,
  };
}

