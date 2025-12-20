/**
 * Template Update Scheduler
 * 
 * Automatically checks all templates monthly for changes and updates them
 * Runs on the 1st of each month at 2 AM (configurable)
 */

import { db } from '../db';
import { brandTemplates } from '@shared/schema';
import { processNewTemplate, checkTemplateForChanges, updateTemplate } from './templateManager';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface SchedulerStatus {
  isRunning: boolean;
  lastRun: Date | null;
  nextRun: Date;
  totalTemplates: number;
  checkedTemplates: number;
  updatedTemplates: number;
}

let schedulerInterval: NodeJS.Timeout | null = null;
let lastRun: Date | null = null;
let isRunning = false;

/**
 * Calculate next run time (1st of next month at 2 AM)
 */
function calculateNextRun(): Date {
  const now = new Date();
  const nextRun = new Date(now.getFullYear(), now.getMonth() + 1, 1, 2, 0, 0);
  return nextRun;
}

/**
 * Check all templates for changes and update if needed
 */
export async function checkAllTemplates(): Promise<{
  total: number;
  checked: number;
  updated: number;
  errors: string[];
}> {
  if (isRunning) {
    console.log('[TemplateUpdateScheduler] ⚠️ Check already running, skipping...');
    return { total: 0, checked: 0, updated: 0, errors: ['Already running'] };
  }

  isRunning = true;
  const errors: string[] = [];
  let checked = 0;
  let updated = 0;

  try {
    console.log('[TemplateUpdateScheduler] 🔄 Starting monthly template check...');

    if (!db) {
      throw new Error('Database not available');
    }

    // Get all templates with source URLs and auto-update enabled
    const allTemplates = await db
      .select()
      .from(brandTemplates)
      .where(eq(brandTemplates.autoUpdate, true));

    const total = allTemplates.length;
    console.log(`[TemplateUpdateScheduler] Found ${total} templates to check`);

    for (const template of allTemplates) {
      try {
        const contentData = (template.contentData as any) || {};
        const sourceUrl = contentData.metadata?.sourceUrl || contentData.metadata?.url;

        if (!sourceUrl) {
          console.log(`[TemplateUpdateScheduler] ⚠️ Template ${template.id} has no source URL, skipping`);
          continue;
        }

        checked++;

        // Check if source has changed
        const changeCheck = await checkTemplateForChanges(template.id);

        if (changeCheck.changed) {
          console.log(`[TemplateUpdateScheduler] 🔄 Template ${template.id} has changed, updating...`);
          
          const result = await updateTemplate(template.id);
          
          if (result.success) {
            updated++;
            console.log(`[TemplateUpdateScheduler] ✅ Updated template ${template.id}`);
          } else {
            errors.push(`Failed to update ${template.id}: ${result.errors.join(', ')}`);
          }
        } else {
          // Update lastChecked timestamp even if no changes
          await db
            .update(brandTemplates)
            .set({ lastChecked: new Date() })
            .where(eq(brandTemplates.id, template.id));
        }
      } catch (error) {
        const errorMsg = `Error checking template ${template.id}: ${getErrorMessage(error)}`;
        errors.push(errorMsg);
        logError(error, `TemplateUpdateScheduler - Check Template ${template.id}`);
      }
    }

    lastRun = new Date();
    console.log(`[TemplateUpdateScheduler] ✅ Check complete: ${checked} checked, ${updated} updated`);

    return { total, checked, updated, errors };
  } catch (error) {
    logError(error, 'TemplateUpdateScheduler - Check All Templates');
    errors.push(getErrorMessage(error));
    return { total: 0, checked, updated, errors };
  } finally {
    isRunning = false;
  }
}

/**
 * Start the scheduler
 */
export function startScheduler(): void {
  if (schedulerInterval) {
    console.log('[TemplateUpdateScheduler] ⚠️ Scheduler already running');
    return;
  }

  console.log('[TemplateUpdateScheduler] 🚀 Starting template update scheduler');

  // Calculate time until next run
  const nextRun = calculateNextRun();
  const now = new Date();
  const msUntilNextRun = nextRun.getTime() - now.getTime();

  console.log(`[TemplateUpdateScheduler] Next check scheduled for: ${nextRun.toISOString()}`);

  // Run immediately if it's past the scheduled time
  if (msUntilNextRun <= 0) {
    console.log('[TemplateUpdateScheduler] Running check immediately (scheduled time has passed)');
    checkAllTemplates().catch(error => {
      logError(error, 'TemplateUpdateScheduler - Initial Run');
    });
  }

  // Schedule monthly checks
  // Check every hour to see if it's time to run
  schedulerInterval = setInterval(() => {
    const now = new Date();
    const nextRun = calculateNextRun();
    
    // If we're past the scheduled time and haven't run yet this month
    if (now >= nextRun && (!lastRun || lastRun < new Date(now.getFullYear(), now.getMonth(), 1))) {
      console.log('[TemplateUpdateScheduler] ⏰ Scheduled check time reached, running...');
      checkAllTemplates().catch(error => {
        logError(error, 'TemplateUpdateScheduler - Scheduled Run');
      });
    }
  }, 60 * 60 * 1000); // Check every hour

  console.log('[TemplateUpdateScheduler] ✅ Scheduler started');
}

/**
 * Stop the scheduler
 */
export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[TemplateUpdateScheduler] ⏹️ Scheduler stopped');
  }
}

/**
 * Get scheduler status
 */
export async function getSchedulerStatus(): Promise<SchedulerStatus> {
  let totalTemplates = 0;
  let checkedTemplates = 0;
  const updatedTemplates = 0;

  try {
    if (db) {
      const templates = await db
        .select()
        .from(brandTemplates)
        .where(eq(brandTemplates.autoUpdate, true));
      
      totalTemplates = templates.length;
      checkedTemplates = templates.filter(t => t.lastChecked).length;
    }
  } catch (error) {
    console.error('[TemplateUpdateScheduler] Error getting status:', error);
  }

  return {
    isRunning,
    lastRun,
    nextRun: calculateNextRun(),
    totalTemplates,
    checkedTemplates,
    updatedTemplates,
  };
}

