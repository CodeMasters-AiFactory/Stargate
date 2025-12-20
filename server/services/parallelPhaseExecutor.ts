/**
 * Parallel Phase Executor
 * Enables multiple AI phases to run simultaneously where dependencies allow
 * 
 * This allows the "AI farm" to work on multiple phases at once for faster generation
 */

import type { ProjectConfig } from './projectConfig';
import type { DesignContext } from '../generator/designThinking';
import type { LayoutStructure } from '../generator/layoutLLM';
import type { StyleSystem } from '../generator/styleSystem';

/**
 * Phase dependency graph
 * Maps which phases can run in parallel and their dependencies
 */
export interface PhaseDependency {
  phase: string;
  dependsOn: string[];
  canParallelWith: string[];
}

/**
 * Execute phases in parallel where possible
 * Returns results as they complete
 */
export async function executePhasesInParallel<T extends Record<string, any>>(
  phases: Array<{
    id: string;
    execute: () => Promise<any>;
    dependsOn?: string[];
  }>
): Promise<T> {
  const results: Partial<T> = {};
  const completed = new Set<string>();
  const executing = new Set<string>();
  const phaseMap = new Map(phases.map(p => [p.id, p]));

  // Helper to check if dependencies are met
  const canExecute = (phaseId: string): boolean => {
    const phase = phaseMap.get(phaseId);
    if (!phase || executing.has(phaseId) || completed.has(phaseId)) {
      return false;
    }
    if (!phase.dependsOn || phase.dependsOn.length === 0) {
      return true;
    }
    return phase.dependsOn.every(dep => completed.has(dep));
  };

  // Helper to get phases ready to execute
  const getReadyPhases = (): Array<typeof phases[0]> => {
    return phases.filter(p => canExecute(p.id));
  };

  // Execute phases in waves of parallelism
  while (completed.size < phases.length) {
    const readyPhases = getReadyPhases();

    if (readyPhases.length === 0) {
      // Wait a bit if no phases are ready (shouldn't happen in acyclic graph)
      await new Promise(resolve => setTimeout(resolve, 100));
      continue;
    }

    // Execute all ready phases in parallel
    const promises = readyPhases.map(async phase => {
      executing.add(phase.id);
      try {
        const result = await phase.execute();
        results[phase.id as keyof T] = result;
        completed.add(phase.id);
        return { id: phase.id, success: true, result };
      } catch (error) {
        console.error(`[Parallel Executor] Phase ${phase.id} failed:`, error);
        completed.add(phase.id); // Mark as completed to avoid blocking
        return { id: phase.id, success: false, error };
      } finally {
        executing.delete(phase.id);
      }
    });

    // Wait for this wave to complete before starting next wave
    await Promise.all(promises);
  }

  return results as T;
}

/**
 * Identify phases that can run in parallel
 * Based on dependency analysis
 */
export function identifyParallelizablePhases(
  phases: Array<{ id: string; dependsOn?: string[] }>
): Array<Array<string>> {
  const waves: Array<Array<string>> = [];
  const completed = new Set<string>();
  const phaseMap = new Map(phases.map(p => [p.id, p]));

  const canExecute = (phaseId: string): boolean => {
    const phase = phaseMap.get(phaseId);
    if (!phase || completed.has(phaseId)) {
      return false;
    }
    if (!phase.dependsOn || phase.dependsOn.length === 0) {
      return true;
    }
    return phase.dependsOn.every(dep => completed.has(dep));
  };

  while (completed.size < phases.length) {
    const readyPhases = phases.filter(p => canExecute(p.id)).map(p => p.id);
    
    if (readyPhases.length === 0) {
      break; // Shouldn't happen in valid dependency graph
    }

    waves.push(readyPhases);
    readyPhases.forEach(id => completed.add(id));
  }

  return waves;
}

/**
 * Optimize phase execution order for maximum parallelism
 */
export function optimizePhaseOrder<T extends { id: string; dependsOn?: string[] }>(
  phases: T[]
): {
  sequential: T[];
  parallel: Array<T[]>;
  estimatedTimeSavings: number; // Percentage
} {
  const waves = identifyParallelizablePhases(phases);
  
  const sequential: T[] = [];
  const parallel: Array<T[]> = [];
  
  for (const wave of waves) {
    const wavePhases = wave.map(id => phases.find(p => p.id === id)!).filter(Boolean);
    if (wavePhases.length === 1) {
      sequential.push(wavePhases[0]);
    } else {
      parallel.push(wavePhases);
    }
  }

  // Estimate time savings (assuming phases take similar time)
  const totalPhases = phases.length;
  const sequentialTime = totalPhases;
  const parallelTime = waves.length;
  const estimatedTimeSavings = ((sequentialTime - parallelTime) / sequentialTime) * 100;

  return {
    sequential,
    parallel,
    estimatedTimeSavings,
  };
}

/**
 * Execute specific phase combinations in parallel
 * Useful for known parallelizable operations
 */
export async function executeParallel<T1, T2>(
  phase1: () => Promise<T1>,
  phase2: () => Promise<T2>
): Promise<[T1, T2]>;
export async function executeParallel<T1, T2, T3>(
  phase1: () => Promise<T1>,
  phase2: () => Promise<T2>,
  phase3: () => Promise<T3>
): Promise<[T1, T2, T3]>;
export async function executeParallel<T1, T2, T3, T4>(
  phase1: () => Promise<T1>,
  phase2: () => Promise<T2>,
  phase3: () => Promise<T3>,
  phase4: () => Promise<T4>
): Promise<[T1, T2, T3, T4]>;
export async function executeParallel(...phases: Array<() => Promise<any>>): Promise<any[]> {
  return Promise.all(phases.map(p => p()));
}

