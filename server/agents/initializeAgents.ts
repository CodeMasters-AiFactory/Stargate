/**
 * Agent Initialization
 * 
 * Registers all specialist agents with the AgentRegistry
 * and initializes The Council
 */

import { AgentRegistry } from './AgentRegistry';
import { MerlinCoordinator } from './MerlinCoordinator';
import {
  getNovaAgent,
  getAtlasAgent,
  getSageAgent,
  getOracleAgent,
  getScoutAgent,
  getCipherAgent,
  getPhoenixAgent,
  getAegisAgent,
  getTempoAgent,
  getGuardianAgent,
} from './specialists';

let initialized = false;

/**
 * Register all specialist agents
 */
export function registerAllAgents(): void {
  if (initialized) {
    console.log('[AgentInit] Agents already registered');
    return;
  }

  console.log('\n' + '═'.repeat(60));
  console.log('🏛️ THE COUNCIL - Registering Specialist Agents');
  console.log('═'.repeat(60) + '\n');

  // Register each specialist
  AgentRegistry.register(getNovaAgent());     // Design
  AgentRegistry.register(getAtlasAgent());    // Layout
  AgentRegistry.register(getSageAgent());     // Content
  AgentRegistry.register(getOracleAgent());   // SEO
  AgentRegistry.register(getScoutAgent());    // Research
  AgentRegistry.register(getCipherAgent());   // Code
  AgentRegistry.register(getPhoenixAgent());  // Image
  AgentRegistry.register(getAegisAgent());    // Security
  AgentRegistry.register(getTempoAgent());   // Performance
  AgentRegistry.register(getGuardianAgent()); // Template Monitoring

  console.log('\n' + AgentRegistry.getSummary());
  
  initialized = true;
}

/**
 * Initialize the complete agent system
 */
export async function initializeAgentSystem(): Promise<{
  success: boolean;
  agentCount: number;
  pendingUpgrades: number;
}> {
  // Register agents if not already done
  registerAllAgents();

  // Initialize via Merlin
  const result = await MerlinCoordinator.initialize();

  console.log('\n' + '═'.repeat(60));
  console.log('🧙 MERLIN: The Council is assembled and ready');
  console.log('═'.repeat(60) + '\n');

  return {
    success: result.success,
    agentCount: result.agentCount,
    pendingUpgrades: result.pendingUpgrades.length,
  };
}

/**
 * Get initialization status
 */
export function isAgentSystemInitialized(): boolean {
  return initialized && AgentRegistry.isInitialized();
}

/**
 * Reset agent system (for testing)
 */
export function resetAgentSystem(): void {
  AgentRegistry.reset();
  initialized = false;
  console.log('[AgentInit] Agent system reset');
}

