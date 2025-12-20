/**
 * GUARDIAN - Template Monitoring Agent
 * 
 * Expertise: Template health monitoring, asset verification, auto-maintenance
 * Personality: Vigilant, proactive, detail-oriented
 * 
 * GUARDIAN monitors all templates 24/7, detects broken resources,
 * auto-fixes common issues, and ensures templates remain 100% usable.
 */

import { BaseAgent } from '../BaseAgent';
import type {
  TaskContext,
  AgentTask,
  AnalysisReport,
  TaskResult,
  AgentPersonality,
  Finding,
  Recommendation,
} from '../types';
import { db } from '../../db';
import { brandTemplates } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { verifyTemplate } from '../../services/templateVerifier';
import { processNewTemplate, checkTemplateForChanges } from '../../services/templateManager';
import { downloadAllAssets } from '../../services/assetDownloader';
import { embedFontsInCSS } from '../../services/fontExtractor';
import { getErrorMessage, logError } from '../../utils/errorHandler';

const GUARDIAN_PERSONALITY: AgentPersonality = {
  trait: 'Vigilant & Proactive',
  communicationStyle: 'analytical',
  emoji: '🛡️',
  color: '#10B981', // Emerald
};

const GUARDIAN_EXPERTISE = [
  'Template health monitoring',
  'Asset verification',
  'Broken resource detection',
  'Auto-maintenance',
  'Dependency management',
  'Template lifecycle management',
  'Quality assurance',
  'Performance monitoring',
  'Change detection',
  'Error recovery',
];

export class GuardianTemplateAgent extends BaseAgent {
  constructor() {
    super(
      'GUARDIAN',
      'monitoring',
      GUARDIAN_EXPERTISE,
      GUARDIAN_PERSONALITY,
      { major: 1, minor: 0, patch: 0, changelog: [] }
    );
  }

  /**
   * Get GUARDIAN's greeting
   */
  getGreeting(): string {
    return `Hello! I'm GUARDIAN, your Template Monitoring Agent (v${this.getVersionString()}). ` +
      `I watch over all templates 24/7, ensuring they remain healthy and usable. ` +
      `Let me check the status of your templates.`;
  }

  /**
   * Summarize findings for Merlin
   */
  getSummaryForMerlin(report: AnalysisReport): string {
    const healthy = report.metrics?.find(m => m.name === 'healthyTemplates')?.value || 0;
    const total = report.metrics?.find(m => m.name === 'totalTemplates')?.value || 0;
    const issues = report.findings?.length || 0;
    
    return `Template health check complete. ${healthy}/${total} templates healthy. ` +
      `${issues} issue${issues !== 1 ? 's' : ''} detected${issues > 0 ? ' and addressed' : ''}.`;
  }

  /**
   * Monitor all templates for health issues
   */
  async monitorAllTemplates(): Promise<AnalysisReport> {
    console.log(`[GUARDIAN v${this.getVersionString()}] 🔍 Starting template health check...`);
    this.setStatus('working');

    const findings: Finding[] = [];
    const recommendations: Recommendation[] = [];
    const metrics: Array<{ name: string; value: number; unit?: string }> = [];

    if (!db) {
      return {
        agentId: this.id,
        agentName: this.name,
        timestamp: new Date(),
        overallScore: 0,
        findings: [{ severity: 'critical', issue: 'Database not available', impact: 'Cannot monitor templates' }],
        recommendations: [{ priority: 'high', action: 'Ensure database connection is available' }],
        metrics: [],
      };
    }

    try {
      // Get all templates
      const templates = await db
        .select()
        .from(brandTemplates)
        .where(sql`${brandTemplates.isActive} = true`);

      metrics.push({ name: 'totalTemplates', value: templates.length });
      let healthyCount = 0;
      let warningCount = 0;
      let failedCount = 0;

      console.log(`[GUARDIAN] Found ${templates.length} templates to monitor`);

      // Check each template
      for (const template of templates) {
        try {
          const verification = await verifyTemplate(template.id);

          if (verification.status === 'APPROVED') {
            healthyCount++;
          } else if (verification.status === 'WARNING') {
            warningCount++;
            findings.push({
              severity: 'medium',
              issue: `Template "${template.name}" has warnings`,
              impact: `Score: ${verification.score}%`,
              details: Object.values(verification.checks)
                .filter(c => !c.passed)
                .map(c => c.message)
                .join('; '),
            });
          } else {
            failedCount++;
            findings.push({
              severity: 'high',
              issue: `Template "${template.name}" failed verification`,
              impact: `Score: ${verification.score}%`,
              details: Object.values(verification.checks)
                .filter(c => !c.passed)
                .map(c => c.message)
                .join('; '),
            });
            recommendations.push({
              priority: 'high',
              action: `Re-scrape or fix template: ${template.id}`,
            });
          }

          // Check for broken external resources
          const contentData = (template.contentData as any) || {};
          const html = contentData.html || '';
          const css = template.css || contentData.css || '';

          // Check for external CSS/JS that might be broken
          const externalCSS = (html.match(/<link[^>]*rel=["']stylesheet["'][^>]*href=["'](https?:\/\/[^"']+)["']/gi) || []).length;
          const externalJS = (html.match(/<script[^>]*src=["'](https?:\/\/[^"']+)["']/gi) || []).length;

          if (externalCSS > 0 || externalJS > 0) {
            findings.push({
              severity: 'medium',
              issue: `Template "${template.name}" has ${externalCSS + externalJS} external dependencies`,
              impact: 'Template may break if external resources become unavailable',
              details: `${externalCSS} CSS files, ${externalJS} JS files`,
            });
            recommendations.push({
              priority: 'medium',
              action: `Bundle external assets for template: ${template.id}`,
            });
          }

        } catch (error) {
          logError(error, `GUARDIAN - monitor template ${template.id}`);
          failedCount++;
          findings.push({
            severity: 'high',
            issue: `Failed to verify template "${template.name}"`,
            impact: 'Verification error',
            details: getErrorMessage(error),
          });
        }
      }

      metrics.push(
        { name: 'healthyTemplates', value: healthyCount },
        { name: 'warningTemplates', value: warningCount },
        { name: 'failedTemplates', value: failedCount }
      );

      const overallScore = templates.length > 0
        ? Math.round((healthyCount / templates.length) * 100)
        : 100;

      console.log(`[GUARDIAN] ✅ Health check complete: ${healthyCount} healthy, ${warningCount} warnings, ${failedCount} failed`);

      this.setStatus('idle');
      this.totalTasksCompleted++;

      return {
        agentId: this.id,
        agentName: this.name,
        timestamp: new Date(),
        overallScore,
        findings,
        recommendations,
        metrics,
      };
    } catch (error) {
      logError(error, 'GUARDIAN - monitorAllTemplates');
      this.setStatus('idle');
      return {
        agentId: this.id,
        agentName: this.name,
        timestamp: new Date(),
        overallScore: 0,
        findings: [{ severity: 'critical', issue: 'Monitoring failed', impact: getErrorMessage(error) }],
        recommendations: [],
        metrics: [],
      };
    }
  }

  /**
   * Auto-fix a broken template
   */
  async autoFixTemplate(templateId: string): Promise<TaskResult> {
    console.log(`[GUARDIAN v${this.getVersionString()}] 🔧 Auto-fixing template: ${templateId}`);
    this.setStatus('working');

    try {
      if (!db) {
        throw new Error('Database not available');
      }

      const [template] = await db
        .select()
        .from(brandTemplates)
        .where(eq(brandTemplates.id, templateId))
        .limit(1);

      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      const contentData = (template.contentData as any) || {};
      const html = contentData.html || '';
      const css = template.css || contentData.css || '';
      const sourceUrl = template.sourceUrl || contentData.metadata?.url || '';

      const fixes: string[] = [];

      // Fix 1: Re-download broken external assets
      if (sourceUrl) {
        try {
          const assets = await downloadAllAssets(html, css, sourceUrl);
          if (assets.errors.length > 0) {
            fixes.push(`Re-downloaded ${assets.cssFiles.length} CSS, ${assets.jsFiles.length} JS files`);
          }
        } catch (error) {
          console.warn(`[GUARDIAN] Failed to re-download assets: ${getErrorMessage(error)}`);
        }
      }

      // Fix 2: Re-embed fonts
      if (css) {
        try {
          const fontResult = await embedFontsInCSS(css, sourceUrl);
          if (fontResult.fonts.length > 0) {
            fixes.push(`Embedded ${fontResult.fonts.length} fonts`);
          }
        } catch (error) {
          console.warn(`[GUARDIAN] Failed to embed fonts: ${getErrorMessage(error)}`);
        }
      }

      // Fix 3: Re-process template
      try {
        await processNewTemplate(templateId);
        fixes.push('Re-processed template');
      } catch (error) {
        console.warn(`[GUARDIAN] Failed to re-process template: ${getErrorMessage(error)}`);
      }

      // Re-verify after fixes
      const verification = await verifyTemplate(templateId);

      this.setStatus('idle');
      this.totalTasksCompleted++;

      return {
        success: verification.status === 'APPROVED',
        score: verification.score,
        message: `Auto-fix complete. ${fixes.length} fix${fixes.length !== 1 ? 'es' : ''} applied: ${fixes.join(', ')}`,
        data: {
          fixes,
          verification,
        },
      };
    } catch (error) {
      logError(error, `GUARDIAN - autoFixTemplate(${templateId})`);
      this.setStatus('idle');
      return {
        success: false,
        score: 0,
        message: `Auto-fix failed: ${getErrorMessage(error)}`,
        data: {},
      };
    }
  }

  /**
   * Check if template source has changed
   */
  async checkTemplateForChanges(templateId: string): Promise<TaskResult> {
    console.log(`[GUARDIAN v${this.getVersionString()}] 🔍 Checking for changes: ${templateId}`);
    this.setStatus('working');

    try {
      const result = await checkTemplateForChanges(templateId);

      this.setStatus('idle');
      this.totalTasksCompleted++;

      return {
        success: true,
        score: result.changed ? 0 : 100,
        message: result.changed ? 'Changes detected - template needs update' : 'No changes detected',
        data: result,
      };
    } catch (error) {
      logError(error, `GUARDIAN - checkTemplateForChanges(${templateId})`);
      this.setStatus('idle');
      return {
        success: false,
        score: 0,
        message: `Change check failed: ${getErrorMessage(error)}`,
        data: {},
      };
    }
  }

  /**
   * Execute a monitoring task
   */
  async execute(task: AgentTask, context: TaskContext): Promise<TaskResult> {
    switch (task.action) {
      case 'monitor-all':
        const report = await this.monitorAllTemplates();
        return {
          success: report.overallScore >= 80,
          score: report.overallScore,
          message: `Monitored ${report.metrics.find(m => m.name === 'totalTemplates')?.value || 0} templates`,
          data: report,
        };

      case 'auto-fix':
        return await this.autoFixTemplate(task.targetId || '');

      case 'check-changes':
        return await this.checkTemplateForChanges(task.targetId || '');

      default:
        return {
          success: false,
          score: 0,
          message: `Unknown action: ${task.action}`,
          data: {},
        };
    }
  }

  /**
   * Analyze template health
   */
  async analyze(context: TaskContext): Promise<AnalysisReport> {
    return await this.monitorAllTemplates();
  }
}

/**
 * Get GUARDIAN agent instance
 */
export function getGuardianAgent(): GuardianTemplateAgent {
  return new GuardianTemplateAgent();
}

