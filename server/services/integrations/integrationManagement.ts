/**
 * Integration Management Service
 * Phase 1.4: Functions to load, save, and manage integrations for websites
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { Integration } from './integrationService';
import { DEFAULT_INTEGRATIONS } from './integrationService';

/**
 * Get active integrations for a website
 */
export async function getActiveIntegrations(projectSlug: string): Promise<Integration[]> {
  const integrationsPath = path.join(
    process.cwd(),
    'website_projects',
    projectSlug,
    'integrations.json'
  );

  try {
    const content = await fs.readFile(integrationsPath, 'utf-8');
    const integrations: Integration[] = JSON.parse(content);
    return integrations.filter(i => i.enabled);
  } catch (error) {
    // File doesn't exist or is invalid, return empty array
    console.warn(`[Integrations] No integrations file found for ${projectSlug}`);
    return [];
  }
}

/**
 * Get all integrations for a website (enabled and disabled)
 */
export async function getIntegrations(projectSlug: string): Promise<Integration[]> {
  const integrationsPath = path.join(
    process.cwd(),
    'website_projects',
    projectSlug,
    'integrations.json'
  );

  try {
    const content = await fs.readFile(integrationsPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // File doesn't exist, return defaults
    return DEFAULT_INTEGRATIONS.map(int => ({ ...int }));
  }
}

/**
 * Save integrations for a website
 */
export async function saveIntegrations(
  projectSlug: string,
  integrations: Integration[]
): Promise<void> {
  const projectDir = path.join(process.cwd(), 'website_projects', projectSlug);
  const integrationsPath = path.join(projectDir, 'integrations.json');

  // Ensure project directory exists
  await fs.mkdir(projectDir, { recursive: true });

  // Save integrations
  await fs.writeFile(
    integrationsPath,
    JSON.stringify(integrations, null, 2),
    'utf-8'
  );
}

/**
 * Get integration script for a specific integration ID
 */
export async function getIntegrationScript(
  projectSlug: string,
  integrationId: string
): Promise<string | null> {
  const integrations = await getActiveIntegrations(projectSlug);
  const integration = integrations.find(i => i.id === integrationId);
  
  if (!integration || !integration.enabled) {
    return null;
  }

  // Generate script using the script generator
  const { generateScriptForIntegration } = require('./integrationScriptGenerators');
  const script = generateScriptForIntegration(integration);
  
  return script.head + (script.body || '');
}

