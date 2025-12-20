/**
 * Template Monitor Service
 * Monitors template quality over time
 */

import { db } from '../db';
import { brandTemplates, templateHealthLogs } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { verifyTemplate } from './templateVerifier';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { saveTemplateHealthLog as hybridSaveHealthLog, getTemplateHealthLogs as hybridGetHealthLogs } from './hybridStorage';

export type MonitoringFrequency = 'daily' | 'weekly' | 'monthly';

export interface MonitoringJob {
  templateId: string;
  frequency: MonitoringFrequency;
  lastChecked: Date | null;
  nextCheck: Date;
}

export interface HealthReport {
  templateId: string;
  templateName: string;
  qualityScore: number;
  status: 'healthy' | 'warning' | 'critical';
  checksPassed: Record<string, boolean>;
  issues: Array<{ type: string; severity: 'error' | 'warning'; message: string }>;
  checkedAt: Date;
  trend?: 'improving' | 'stable' | 'declining';
}

/**
 * Schedule template check
 */
export async function scheduleTemplateCheck(
  templateId: string,
  frequency: MonitoringFrequency
): Promise<MonitoringJob> {
  const now = new Date();
  const nextCheck = new Date();

  switch (frequency) {
    case 'daily':
      nextCheck.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      nextCheck.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      nextCheck.setMonth(now.getMonth() + 1);
      break;
  }

  // In a real implementation, this would be stored in a monitoring_jobs table
  console.log(`[TemplateMonitor] ✅ Scheduled ${frequency} check for template ${templateId}`);

  return {
    templateId,
    frequency,
    lastChecked: null,
    nextCheck,
  };
}

/**
 * Check template health
 */
export async function checkTemplateHealth(
  templateId: string
): Promise<HealthReport> {
  try {
    if (!db) {
      throw new Error('Database not available');
    }

    // Verify template
    const verification = await verifyTemplate(templateId);

    // Determine status based on score
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (verification.score < 50) {
      status = 'critical';
    } else if (verification.score < 80) {
      status = 'warning';
    }

    // Extract checks passed
    const checksPassed: Record<string, boolean> = {};
    Object.entries(verification.checks).forEach(([key, check]) => {
      checksPassed[key] = check.passed;
    });

    // Extract issues
    const issues: Array<{ type: string; severity: 'error' | 'warning'; message: string }> = [];
    Object.entries(verification.checks).forEach(([key, check]) => {
      if (!check.passed) {
        issues.push({
          type: key,
          severity: verification.score < 50 ? 'error' : 'warning',
          message: check.message,
        });
      }
    });

    // Get previous health log for trend (using hybrid storage)
    const previousLogs = await hybridGetHealthLogs(templateId, 1);

    let trend: 'improving' | 'stable' | 'declining' | undefined;
    if (previousLogs.length > 0) {
      const previousScore = parseInt(previousLogs[0].qualityScore);
      if (verification.score > previousScore + 5) {
        trend = 'improving';
      } else if (verification.score < previousScore - 5) {
        trend = 'declining';
      } else {
        trend = 'stable';
      }
    }

    // Save health log (using hybrid storage)
    await hybridSaveHealthLog(
      templateId,
      String(verification.score),
      checksPassed,
      issues,
      status
    );

    console.log(`[TemplateMonitor] ✅ Health check complete for template ${templateId}: ${status} (${verification.score}%)`);

    return {
      templateId,
      templateName: verification.templateName,
      qualityScore: verification.score,
      status,
      checksPassed,
      issues,
      checkedAt: new Date(),
      trend,
    };
  } catch (error) {
    logError(error, 'TemplateMonitor - CheckHealth');
    throw error;
  }
}

/**
 * Check all templates health
 */
export async function checkAllTemplatesHealth(): Promise<HealthReport[]> {
  try {
    if (!db) {
      return [];
    }

    const templates = await db
      .select({ id: brandTemplates.id })
      .from(brandTemplates);

    const reports: HealthReport[] = [];

    for (const template of templates) {
      try {
        const report = await checkTemplateHealth(template.id);
        reports.push(report);
      } catch (error) {
        console.warn(`[TemplateMonitor] Failed to check template ${template.id}:`, getErrorMessage(error));
      }
    }

    return reports;
  } catch (error) {
    logError(error, 'TemplateMonitor - CheckAll');
    return [];
  }
}

