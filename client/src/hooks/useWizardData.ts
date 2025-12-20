/**
 * Wizard Data State Management Hook
 * Manages all data-related state (website, reports, ratings, etc.)
 */

import { useState, useCallback } from 'react';
import type { GeneratedWebsitePackage, ChecklistState, Template, Product } from '@/types/websiteBuilder';
import type { WebsiteReport, PhaseReport } from '@/types/phaseReport';

interface GeneratedWebsite {
  id?: string;
  name?: string;
  description?: string;
  template?: string;
  code: GeneratedWebsitePackage;
  requirements?: Record<string, unknown>;
  createdAt?: string;
}

interface WebsiteRating {
  overall: number;
  categories: Record<string, number>;
}

interface UseWizardDataReturn {
  // Generated website
  generatedWebsite: GeneratedWebsite | null;
  setGeneratedWebsite: (website: GeneratedWebsite | null) => void;
  
  // Checklist
  checklistState: ChecklistState;
  setChecklistState: (state: ChecklistState | ((prev: ChecklistState) => ChecklistState)) => void;
  
  // Template and products
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
  ecommerceProducts: Product[];
  setEcommerceProducts: (products: Product[]) => void;
  
  // Ratings and reports
  websiteRating: WebsiteRating | null;
  setWebsiteRating: (rating: WebsiteRating | null) => void;
  phaseReports: Map<string, PhaseReport>;
  setPhaseReports: (reports: Map<string, PhaseReport> | ((prev: Map<string, PhaseReport>) => Map<string, PhaseReport>)) => void;
  websiteReport: WebsiteReport | null;
  setWebsiteReport: (report: WebsiteReport | null) => void;
  
  // Helpers
  clearGeneratedWebsite: () => void;
  addPhaseReport: (phase: string, report: PhaseReport) => void;
  getPhaseReport: (phase: string) => PhaseReport | undefined;
}

/**
 * Custom hook for managing wizard data state
 */
export function useWizardData(): UseWizardDataReturn {
  // Load generated website from localStorage on mount
  const [generatedWebsite, setGeneratedWebsiteState] = useState<GeneratedWebsite | null>(() => {
    try {
      const saved = localStorage.getItem('merlin_generated_website');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  });

  // Checklist state
  const [checklistState, setChecklistState] = useState<ChecklistState>(() => {
    try {
      const saved = localStorage.getItem('stargate-wizard-checklist');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore parse errors
    }
    return {};
  });

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [ecommerceProducts, setEcommerceProducts] = useState<Product[]>([]);
  const [websiteRating, setWebsiteRating] = useState<WebsiteRating | null>(null);
  const [phaseReports, setPhaseReports] = useState<Map<string, PhaseReport>>(new Map());
  const [websiteReport, setWebsiteReport] = useState<WebsiteReport | null>(null);

  // Wrapper for setGeneratedWebsite that also persists to localStorage
  const setGeneratedWebsite = useCallback((website: GeneratedWebsite | null) => {
    setGeneratedWebsiteState(website);
    try {
      if (website) {
        localStorage.setItem('merlin_generated_website', JSON.stringify(website));
      } else {
        localStorage.removeItem('merlin_generated_website');
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Clear generated website
  const clearGeneratedWebsite = useCallback(() => {
    setGeneratedWebsite(null);
  }, [setGeneratedWebsite]);

  // Add phase report
  const addPhaseReport = useCallback((phase: string, report: PhaseReport) => {
    setPhaseReports(prev => {
      const newMap = new Map(prev);
      newMap.set(phase, report);
      return newMap;
    });
  }, []);

  // Get phase report
  const getPhaseReport = useCallback((phase: string) => {
    return phaseReports.get(phase);
  }, [phaseReports]);

  return {
    generatedWebsite,
    setGeneratedWebsite,
    checklistState,
    setChecklistState,
    selectedTemplate,
    setSelectedTemplate,
    ecommerceProducts,
    setEcommerceProducts,
    websiteRating,
    setWebsiteRating,
    phaseReports,
    setPhaseReports,
    websiteReport,
    setWebsiteReport,
    clearGeneratedWebsite,
    addPhaseReport,
    getPhaseReport,
  };
}

