/**
 * Integration Service
 * Manages third-party integrations for generated websites
 * Part of Focus 2: Integrations Expansion
 */

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'analytics' | 'marketing' | 'email' | 'automation' | 'social' | 'other' | 'ecommerce' | 'crm' | 'media' | 'development' | 'communication' | 'forms' | 'customer-support';
  icon?: string;
  enabled: boolean;
  config: Record<string, any>;
  requiresAuth: boolean;
  authStatus?: 'connected' | 'disconnected' | 'error';
}

export interface IntegrationScript {
  head?: string; // Scripts to inject in <head>
  body?: string; // Scripts to inject before </body>
}

/**
 * Generate integration scripts for HTML injection
 */
export function generateIntegrationScripts(
  integrations: Integration[]
): IntegrationScript {
  const scripts: IntegrationScript = {
    head: '',
    body: '',
  };

  for (const integration of integrations) {
    if (!integration.enabled) continue;

    try {
      const integrationScript = generateScriptForIntegration(integration);
      if (integrationScript.head) {
        scripts.head += integrationScript.head + '\n';
      }
      if (integrationScript.body) {
        scripts.body += integrationScript.body + '\n';
      }
    } catch (error) {
      console.error(`[Integrations] Failed to generate script for ${integration.id}:`, error);
    }
  }

  return scripts;
}

/**
 * Generate script for specific integration
 * Phase 1.4: Expanded to support all 60+ integrations
 */
import { generateScriptForIntegration as generateScriptForIntegrationExpanded } from './integrationScriptGenerators';

function generateScriptForIntegration(integration: Integration): IntegrationScript {
  // Use expanded script generator that handles all 60+ integrations
  return generateScriptForIntegrationExpanded(integration);
}

// Legacy script generators removed - now using integrationScriptGenerators.ts for all 60+ integrations

/**
 * Inject integration scripts into HTML
 */
export function injectIntegrationScripts(
  html: string,
  integrations: Integration[]
): string {
  const scripts = generateIntegrationScripts(integrations);

  // Inject head scripts
  if (scripts.head) {
    html = html.replace('</head>', `${scripts.head}\n</head>`);
  }

  // Inject body scripts
  if (scripts.body) {
    html = html.replace('</body>', `${scripts.body}\n</body>`);
  }

  return html;
}

/**
 * Default integrations catalog
 * Phase 1.4: Expanded from 4 to 60+ integrations
 */
import { EXPANDED_INTEGRATIONS_CATALOG } from './integrationsCatalog';

// Use expanded catalog (60+ integrations)
export const DEFAULT_INTEGRATIONS: Integration[] = EXPANDED_INTEGRATIONS_CATALOG;

/**
 * Integration Management Functions
 * Phase 1.4: Complete integration management system
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Get active integrations for a project
 */
export async function getActiveIntegrations(projectSlug: string): Promise<Integration[]> {
  const integrationsPath = path.join(
    process.cwd(),
    'website_projects',
    projectSlug,
    'integrations.json'
  );
  
  if (!fs.existsSync(integrationsPath)) {
    // Return all default integrations with enabled status
    return DEFAULT_INTEGRATIONS.map(int => ({ ...int, enabled: false }));
  }
  
  try {
    const content = fs.readFileSync(integrationsPath, 'utf-8');
    const savedIntegrations: Integration[] = JSON.parse(content);
    
    // Merge with defaults to ensure all integrations are available
    const integrationMap = new Map<string, Integration>();
    
    // Add all defaults
    DEFAULT_INTEGRATIONS.forEach(int => {
      integrationMap.set(int.id, { ...int, enabled: false });
    });
    
    // Override with saved integrations (preserve enabled status)
    savedIntegrations.forEach(savedInt => {
      const defaultInt = DEFAULT_INTEGRATIONS.find(d => d.id === savedInt.id);
      if (defaultInt) {
        integrationMap.set(savedInt.id, {
          ...defaultInt,
          enabled: savedInt.enabled ?? false,
          config: savedInt.config || defaultInt.config,
          authStatus: savedInt.authStatus,
        });
      }
    });
    
    return Array.from(integrationMap.values());
  } catch (error) {
    console.error(`[Integrations] Failed to load integrations for ${projectSlug}:`, error);
    return DEFAULT_INTEGRATIONS.map(int => ({ ...int, enabled: false }));
  }
}

/**
 * Save integrations for a project
 */
export async function saveIntegrations(
  projectSlug: string,
  integrations: Integration[]
): Promise<void> {
  const projectDir = path.join(process.cwd(), 'website_projects', projectSlug);
  
  // Ensure project directory exists
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }
  
  const integrationsPath = path.join(projectDir, 'integrations.json');
  
  try {
    fs.writeFileSync(
      integrationsPath,
      JSON.stringify(integrations, null, 2),
      'utf-8'
    );
    console.log(`[Integrations] Saved ${integrations.length} integrations for ${projectSlug}`);
  } catch (error) {
    console.error(`[Integrations] Failed to save integrations for ${projectSlug}:`, error);
    throw error;
  }
}

/**
 * Enable an integration for a project
 */
export async function enableIntegration(
  projectSlug: string,
  integrationId: string,
  config?: Record<string, any>
): Promise<Integration> {
  const integrations = await getActiveIntegrations(projectSlug);
  const integration = integrations.find(int => int.id === integrationId);
  
  if (!integration) {
    throw new Error(`Integration ${integrationId} not found`);
  }
  
  // Update integration
  integration.enabled = true;
  if (config) {
    integration.config = { ...integration.config, ...config };
  }
  
  // Save updated integrations
  await saveIntegrations(projectSlug, integrations);
  
  console.log(`[Integrations] Enabled ${integrationId} for ${projectSlug}`);
  return integration;
}

/**
 * Disable an integration for a project
 */
export async function disableIntegration(
  projectSlug: string,
  integrationId: string
): Promise<Integration> {
  const integrations = await getActiveIntegrations(projectSlug);
  const integration = integrations.find(int => int.id === integrationId);
  
  if (!integration) {
    throw new Error(`Integration ${integrationId} not found`);
  }
  
  // Update integration
  integration.enabled = false;
  
  // Save updated integrations
  await saveIntegrations(projectSlug, integrations);
  
  console.log(`[Integrations] Disabled ${integrationId} for ${projectSlug}`);
  return integration;
}

/**
 * Update integration configuration
 */
export async function updateIntegrationConfig(
  projectSlug: string,
  integrationId: string,
  config: Record<string, any>
): Promise<Integration> {
  const integrations = await getActiveIntegrations(projectSlug);
  const integration = integrations.find(int => int.id === integrationId);
  
  if (!integration) {
    throw new Error(`Integration ${integrationId} not found`);
  }
  
  // Update config
  integration.config = { ...integration.config, ...config };
  
  // Save updated integrations
  await saveIntegrations(projectSlug, integrations);
  
  console.log(`[Integrations] Updated config for ${integrationId} in ${projectSlug}`);
  return integration;
}

/**
 * Get integration script for HTML injection
 * Phase 1.4: Returns script for a single integration or all active ones
 */
export function getIntegrationScript(
  integrationId: string,
  integrations: Integration[]
): IntegrationScript | null {
  const integration = integrations.find(int => int.id === integrationId && int.enabled);
  
  if (!integration) {
    return null;
  }
  
  return generateScriptForIntegration(integration);
}

