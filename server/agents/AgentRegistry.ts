/**
 * Agent Registry
 * 
 * Central registry for all AI Specialist Agents in "The Council"
 * Manages agent lifecycle, registration, and discovery
 */

import { BaseAgent } from './BaseAgent';
import type { 
  TaskType, 
  AgentStatus, 
  UpgradeProposal,
  TrendReport,
  AgentRegistryEntry,
} from './types';

interface StartupReport {
  agentName: string;
  version: string;
  status: string;
  trendReport?: TrendReport;
  proposedUpgrades: UpgradeProposal[];
}

class AgentRegistryClass {
  private agents: Map<string, BaseAgent> = new Map();
  private agentsByType: Map<TaskType, BaseAgent[]> = new Map();
  private startupReports: StartupReport[] = [];
  private initialized: boolean = false;

  /**
   * Register an agent with the registry
   */
  register(agent: BaseAgent): void {
    // Store by ID
    this.agents.set(agent.id, agent);
    
    // Store by type for quick lookup
    const typeAgents = this.agentsByType.get(agent.type) || [];
    typeAgents.push(agent);
    this.agentsByType.set(agent.type, typeAgents);
    
    console.log(`[AgentRegistry] ✅ Registered: ${agent.name} v${agent.getVersionString()} (${agent.type})`);
  }

  /**
   * Unregister an agent
   */
  unregister(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    
    // Remove from ID map
    this.agents.delete(agentId);
    
    // Remove from type map
    const typeAgents = this.agentsByType.get(agent.type) || [];
    const filtered = typeAgents.filter(a => a.id !== agentId);
    this.agentsByType.set(agent.type, filtered);
    
    console.log(`[AgentRegistry] 🗑️ Unregistered: ${agent.name}`);
    return true;
  }

  /**
   * Get an agent by ID
   */
  getAgent(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get an agent by name
   */
  getAgentByName(name: string): BaseAgent | undefined {
    for (const agent of this.agents.values()) {
      if (agent.name.toLowerCase() === name.toLowerCase()) {
        return agent;
      }
    }
    return undefined;
  }

  /**
   * Get all agents of a specific type
   */
  getAgentsByType(type: TaskType): BaseAgent[] {
    return this.agentsByType.get(type) || [];
  }

  /**
   * Get the best available agent for a task type
   */
  getBestAgentForType(type: TaskType): BaseAgent | undefined {
    const agents = this.getAgentsByType(type);
    if (agents.length === 0) return undefined;
    
    // Filter to idle agents, prefer highest version
    const available = agents.filter(a => a.getStatus() === 'idle');
    if (available.length === 0) {
      // All busy, return first one
      return agents[0];
    }
    
    // Sort by version (highest first)
    return available.sort((a, b) => {
      const vA = a.getVersionString().split('.').map(Number);
      const vB = b.getVersionString().split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        if (vA[i] !== vB[i]) return vB[i] - vA[i];
      }
      return 0;
    })[0];
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get registry entries for all agents
   */
  getAllAgentInfo(): AgentRegistryEntry[] {
    return this.getAllAgents().map(agent => {
      const info = agent.getInfo();
      return {
        id: info.id,
        name: info.name,
        type: info.type,
        version: agent.getVersion(),
        status: info.status,
        personality: info.personality,
        expertise: info.expertise,
        lastActive: new Date(),
        totalTasksCompleted: info.totalTasksCompleted,
        averageScore: info.averageScore,
        upgradeHistory: agent.getVersion().changelog,
      };
    });
  }

  /**
   * Get count of agents
   */
  getAgentCount(): number {
    return this.agents.size;
  }

  /**
   * Get agents by status
   */
  getAgentsByStatus(status: AgentStatus): BaseAgent[] {
    return this.getAllAgents().filter(a => a.getStatus() === status);
  }

  /**
   * Initialize all agents - run startup routine
   * This is called when the server starts
   */
  async initializeAll(): Promise<StartupReport[]> {
    if (this.initialized) {
      console.log('[AgentRegistry] Already initialized');
      return this.startupReports;
    }

    console.log('\n' + '═'.repeat(60));
    console.log('[AgentRegistry] 🚀 Initializing The Council...');
    console.log('═'.repeat(60) + '\n');

    this.startupReports = [];

    for (const agent of this.agents.values()) {
      try {
        console.log(`\n[AgentRegistry] Starting ${agent.name}...`);
        const result = await agent.onStartup();
        
        const report: StartupReport = {
          agentName: agent.name,
          version: agent.getVersionString(),
          status: result.status,
          trendReport: result.trendReport,
          proposedUpgrades: result.proposedUpgrades,
        };
        
        this.startupReports.push(report);

        // Log any proposed upgrades
        if (result.proposedUpgrades.length > 0) {
          console.log(`[AgentRegistry] 📝 ${agent.name} proposed ${result.proposedUpgrades.length} upgrade(s)`);
        }
      } catch (error) {
        console.error(`[AgentRegistry] ❌ Failed to initialize ${agent.name}:`, error);
        this.startupReports.push({
          agentName: agent.name,
          version: agent.getVersionString(),
          status: 'error',
          proposedUpgrades: [],
        });
      }
    }

    this.initialized = true;
    
    console.log('\n' + '═'.repeat(60));
    console.log('[AgentRegistry] ✅ The Council is ready');
    console.log(`[AgentRegistry] 📊 ${this.agents.size} agents initialized`);
    console.log('═'.repeat(60) + '\n');

    return this.startupReports;
  }

  /**
   * Get all pending upgrades from all agents
   */
  getAllPendingUpgrades(): UpgradeProposal[] {
    const allUpgrades: UpgradeProposal[] = [];
    for (const agent of this.agents.values()) {
      allUpgrades.push(...agent.getPendingUpgrades());
    }
    return allUpgrades;
  }

  /**
   * Get startup reports
   */
  getStartupReports(): StartupReport[] {
    return [...this.startupReports];
  }

  /**
   * Check if registry is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Reset the registry (for testing)
   */
  reset(): void {
    this.agents.clear();
    this.agentsByType.clear();
    this.startupReports = [];
    this.initialized = false;
    console.log('[AgentRegistry] 🔄 Reset complete');
  }

  /**
   * Get summary of all agents
   */
  getSummary(): string {
    let summary = '\n🏛️ THE COUNCIL - Agent Summary\n';
    summary += '━'.repeat(50) + '\n';
    
    for (const agent of this.agents.values()) {
      const info = agent.getInfo();
      const statusEmoji = info.status === 'idle' ? '🟢' : 
                         info.status === 'working' ? '🟡' :
                         info.status === 'researching' ? '🔵' :
                         info.status === 'error' ? '🔴' : '⚪';
      
      summary += `${info.personality.emoji} ${info.name} v${info.version} ${statusEmoji}\n`;
      summary += `   ${info.expertise.slice(0, 3).join(', ')}\n`;
    }
    
    summary += '━'.repeat(50) + '\n';
    summary += `Total: ${this.agents.size} agents\n`;
    
    return summary;
  }
}

// Singleton instance
export const AgentRegistry = new AgentRegistryClass();

// Export the class for testing
export { AgentRegistryClass };

