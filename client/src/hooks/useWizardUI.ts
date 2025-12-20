/**
 * Wizard UI State Management Hook
 * Manages all UI-related state (dialogs, views, visibility)
 */

import { useState } from 'react';

interface UseWizardUIReturn {
  // Dialog states
  showRestartDialog: boolean;
  setShowRestartDialog: (show: boolean) => void;
  
  // View states
  viewMode: 'preview' | 'console';
  setViewMode: (mode: 'preview' | 'console') => void;
  screenSize: 'desktop' | 'tablet' | 'mobile';
  setScreenSize: (size: 'desktop' | 'tablet' | 'mobile') => void;
  showWebviewLogs: boolean;
  setShowWebviewLogs: (show: boolean) => void;
  
  // Editor states
  showVisualEditor: boolean;
  setShowVisualEditor: (show: boolean) => void;
  showEcommerceSettings: boolean;
  setShowEcommerceSettings: (show: boolean) => void;
  
  // Feed states
  showResearchFeed: boolean;
  setShowResearchFeed: (show: boolean) => void;
  
  // Save status
  saveStatus: 'saved' | 'saving' | null;
  setSaveStatus: (status: 'saved' | 'saving' | null) => void;
}

/**
 * Custom hook for managing wizard UI state
 */
export function useWizardUI(): UseWizardUIReturn {
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'console'>('preview');
  const [screenSize, setScreenSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showWebviewLogs, setShowWebviewLogs] = useState(false);
  const [showVisualEditor, setShowVisualEditor] = useState(false);
  const [showEcommerceSettings, setShowEcommerceSettings] = useState(false);
  const [showResearchFeed, setShowResearchFeed] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | null>(null);

  return {
    showRestartDialog,
    setShowRestartDialog,
    viewMode,
    setViewMode,
    screenSize,
    setScreenSize,
    showWebviewLogs,
    setShowWebviewLogs,
    showVisualEditor,
    setShowVisualEditor,
    showEcommerceSettings,
    setShowEcommerceSettings,
    showResearchFeed,
    setShowResearchFeed,
    saveStatus,
    setSaveStatus,
  };
}

