/**
 * Merlin Website Wizard - Version System
 * Tracks pipeline version and logs at start of each generation
 */

export const MERLIN_VERSION = '6.10-cleanup-hardening';

export interface VersionInfo {
  version: string;
  pipeline: 'v6.10-cleanup-hardening';
  timestamp: string;
  features: string[];
}

export function getVersionInfo(): VersionInfo {
  return {
    version: MERLIN_VERSION,
    pipeline: 'v6.10-cleanup-hardening',
    timestamp: new Date().toISOString(),
    features: [
      'v5.1-llm-content-all-sections',
      'v5.1-dalle-image-generation',
      'v5.1-modern-css',
      'v6.0-foundations',
      'v6.1-ai-section-planner',
      'v6.2-ai-style-designer',
      'v6.3-component-variants',
      'v6.4-responsive-engine',
      'v6.5-ai-image-planner',
      'v6.6-ai-copywriting-3.0',
      'v6.7-ai-seo-engine',
      'v6.8-multi-page-architecture',
      'v6.9-global-theme-engine',
      'v6.10-cleanup-hardening'
    ]
  };
}

export function logPipelineVersion(projectName: string): void {
  const versionInfo = getVersionInfo();
  console.log('');
  console.log('='.repeat(80));
  console.log(`MERLIN WEBSITE WIZARD ${versionInfo.version.toUpperCase()}`);
  console.log('='.repeat(80));
  console.log(`Project: ${projectName}`);
  console.log(`Pipeline: ${versionInfo.pipeline}`);
  console.log(`Timestamp: ${versionInfo.timestamp}`);
  console.log(`Features: ${versionInfo.features.join(', ')}`);
  console.log('='.repeat(80));
  console.log('');
}

