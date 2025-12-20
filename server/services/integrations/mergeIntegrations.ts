/**
 * Merge Phase 3 integrations with existing catalog
 */

import { EXPANDED_INTEGRATIONS_CATALOG } from './integrationsCatalog';
import { PHASE_3_INTEGRATIONS } from './integrationExpansionPhase3';
import type { Integration } from './integrationService';

/**
 * Get all integrations (existing + Phase 3 additions)
 */
export function getAllIntegrations(): Integration[] {
  return [...EXPANDED_INTEGRATIONS_CATALOG, ...PHASE_3_INTEGRATIONS];
}

/**
 * Get total integration count
 */
export function getTotalIntegrationCount(): number {
  return EXPANDED_INTEGRATIONS_CATALOG.length + PHASE_3_INTEGRATIONS.length;
}

