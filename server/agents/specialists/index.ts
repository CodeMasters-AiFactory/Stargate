/**
 * Specialist Agents Index
 * Export all specialist agents for The Council
 */

// Import all agents first
import { NovaDesignAgent, getNovaAgent } from './NovaDesignAgent';
import { AtlasLayoutAgent, getAtlasAgent } from './AtlasLayoutAgent';
import { SageContentAgent, getSageAgent } from './SageContentAgent';
import { OracleSEOAgent, getOracleAgent } from './OracleSEOAgent';
import { ScoutResearchAgent, getScoutAgent } from './ScoutResearchAgent';
import { CipherCodeAgent, getCipherAgent } from './CipherCodeAgent';
import { PhoenixImageAgent, getPhoenixAgent } from './PhoenixImageAgent';
import { AegisSecurityAgent, getAegisAgent } from './AegisSecurityAgent';
import { TempoPerformanceAgent, getTempoAgent } from './TempoPerformanceAgent';
import { GuardianTemplateAgent, getGuardianAgent } from './GuardianTemplateAgent';

// Re-export all agents
export {
  NovaDesignAgent, getNovaAgent,
  AtlasLayoutAgent, getAtlasAgent,
  SageContentAgent, getSageAgent,
  OracleSEOAgent, getOracleAgent,
  ScoutResearchAgent, getScoutAgent,
  CipherCodeAgent, getCipherAgent,
  PhoenixImageAgent, getPhoenixAgent,
  AegisSecurityAgent, getAegisAgent,
  TempoPerformanceAgent, getTempoAgent,
  GuardianTemplateAgent, getGuardianAgent,
};

// All agent getters for easy initialization
export const agentGetters = {
  nova: getNovaAgent,
  atlas: getAtlasAgent,
  sage: getSageAgent,
  oracle: getOracleAgent,
  scout: getScoutAgent,
  cipher: getCipherAgent,
  phoenix: getPhoenixAgent,
  aegis: getAegisAgent,
  tempo: getTempoAgent,
  guardian: getGuardianAgent,
};

