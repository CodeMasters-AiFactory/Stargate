/**
 * Scheduled Reports Service
 * Phase 3.5: Advanced Analytics - Report scheduling and export
 */

import * as fs from 'fs';
import * as path from 'path';
import { getReport, generateReportData } from './reportBuilderService';
import { sendEmail } from '../../services/marketing';

export interface ScheduledReport {
  id: string;
  websiteId: string;
  reportId: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time: string; // HH:mm format
    timezone?: string;
  };
  recipients: string[];
  format: 'pdf' | 'csv' | 'excel' | 'json';
  enabled: boolean;
  lastSent?: Date;
  nextSend?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get scheduled reports directory
 */
function getScheduledReportsDir(websiteId: string): string {
  const projectDir = path.join(process.cwd(), 'website_projects', websiteId);
  const scheduledDir = path.join(projectDir, 'analytics', 'scheduled-reports');
  
  if (!fs.existsSync(scheduledDir)) {
    fs.mkdirSync(scheduledDir, { recursive: true });
  }
  
  return scheduledDir;
}

/**
 * Scheduled Report Management
 */

export async function getScheduledReports(websiteId: string): Promise<ScheduledReport[]> {
  const scheduledDir = getScheduledReportsDir(websiteId);
  const scheduledPath = path.join(scheduledDir, 'scheduled.json');
  
  if (!fs.existsSync(scheduledPath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(scheduledPath, 'utf-8');
    const scheduled: ScheduledReport[] = JSON.parse(content);
    return scheduled.map(s => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
      lastSent: s.lastSent ? new Date(s.lastSent) : undefined,
      nextSend: s.nextSend ? new Date(s.nextSend) : undefined,
    }));
  } catch (error) {
    console.error(`[Report Scheduler] Failed to load scheduled reports for ${websiteId}:`, error);
    return [];
  }
}

export async function saveScheduledReport(websiteId: string, scheduled: ScheduledReport): Promise<void> {
  const scheduledDir = getScheduledReportsDir(websiteId);
  const scheduledPath = path.join(scheduledDir, 'scheduled.json');
  
  const scheduledReports = await getScheduledReports(websiteId);
  const existingIndex = scheduledReports.findIndex(s => s.id === scheduled.id);
  
  if (existingIndex >= 0) {
    scheduledReports[existingIndex] = { ...scheduled, updatedAt: new Date() };
  } else {
    scheduledReports.push({ ...scheduled, createdAt: new Date(), updatedAt: new Date() });
  }
  
  // Calculate next send time
  scheduled.nextSend = calculateNextSendTime(scheduled);
  
  fs.writeFileSync(scheduledPath, JSON.stringify(scheduledReports, null, 2), 'utf-8');
  console.log(`[Report Scheduler] Saved scheduled report: ${scheduled.id} for ${websiteId}`);
}

/**
 * Calculate next send time for a scheduled report
 */
function calculateNextSendTime(scheduled: ScheduledReport): Date {
  const now = new Date();
  const [hours, minutes] = scheduled.schedule.time.split(':').map(Number);
  
  const nextSend = new Date();
  nextSend.setHours(hours, minutes, 0, 0);
  
  switch (scheduled.schedule.frequency) {
    case 'daily':
      if (nextSend <= now) {
        nextSend.setDate(nextSend.getDate() + 1);
      }
      break;
      
    case 'weekly':
      const targetDay = scheduled.schedule.dayOfWeek || 0;
      const currentDay = nextSend.getDay();
      const daysUntilTarget = (targetDay - currentDay + 7) % 7;
      if (daysUntilTarget === 0 && nextSend <= now) {
        nextSend.setDate(nextSend.getDate() + 7);
      } else {
        nextSend.setDate(nextSend.getDate() + daysUntilTarget);
      }
      break;
      
    case 'monthly':
      const targetDayOfMonth = scheduled.schedule.dayOfMonth || 1;
      nextSend.setDate(targetDayOfMonth);
      if (nextSend <= now) {
        nextSend.setMonth(nextSend.getMonth() + 1);
      }
      break;
  }
  
  return nextSend;
}

/**
 * Send scheduled reports that are due
 */
export async function processScheduledReports(websiteId: string): Promise<{ sent: number; errors: number }> {
  const scheduledReports = await getScheduledReports(websiteId);
  const now = new Date();
  
  const dueReports = scheduledReports.filter(
    s => s.enabled && s.nextSend && s.nextSend <= now
  );
  
  let sent = 0;
  let errors = 0;
  
  for (const scheduled of dueReports) {
    try {
      await sendScheduledReport(websiteId, scheduled);
      scheduled.lastSent = new Date();
      scheduled.nextSend = calculateNextSendTime(scheduled);
      await saveScheduledReport(websiteId, scheduled);
      sent++;
    } catch (error) {
      console.error(`[Report Scheduler] Failed to send scheduled report ${scheduled.id}:`, error);
      errors++;
    }
  }
  
  return { sent, errors };
}

/**
 * Send a scheduled report
 */
async function sendScheduledReport(websiteId: string, scheduled: ScheduledReport): Promise<void> {
  const report = await getReport(websiteId, scheduled.reportId);
  if (!report) {
    throw new Error('Report not found');
  }
  
  // Generate report data
  const reportData = await generateReportData(report);
  
  // Export to requested format
  let attachment: { filename: string; content: string; contentType: string } | undefined;
  
  switch (scheduled.format) {
    case 'csv':
      attachment = {
        filename: `${report.name}.csv`,
        content: exportToCSV(reportData),
        contentType: 'text/csv',
      };
      break;
      
    case 'json':
      attachment = {
        filename: `${report.name}.json`,
        content: JSON.stringify(reportData, null, 2),
        contentType: 'application/json',
      };
      break;
      
    case 'pdf':
      // PDF generation would require a library like puppeteer or pdfkit
      // For now, generate HTML that can be converted to PDF
      attachment = {
        filename: `${report.name}.html`,
        content: exportToHTML(report, reportData),
        contentType: 'text/html',
      };
      break;
  }
  
  // Send email to recipients
  const subject = `Scheduled Report: ${report.name}`;
  const body = `
    <h2>${report.name}</h2>
    <p>Report generated on ${new Date().toLocaleString()}</p>
    <p>Date Range: ${report.dateRange.start.toLocaleDateString()} - ${report.dateRange.end.toLocaleDateString()}</p>
    ${attachment ? `<p>See attached ${scheduled.format.toUpperCase()} file.</p>` : ''}
  `;
  
  for (const recipient of scheduled.recipients) {
    await sendEmail(recipient, subject, body);
    // In production, attach the file to the email
  }
}

/**
 * Export report data to CSV
 */
function exportToCSV(data: Record<string, any>): string {
  const lines: string[] = [];
  
  for (const [chartId, chartData] of Object.entries(data)) {
    lines.push(`Chart: ${chartId}`);
    
    if (Array.isArray(chartData)) {
      if (chartData.length > 0) {
        // Headers
        const headers = Object.keys(chartData[0]).join(',');
        lines.push(headers);
        
        // Data rows
        chartData.forEach((row: any) => {
          const values = Object.values(row).map(v => `"${v}"`).join(',');
          lines.push(values);
        });
      }
    }
    
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Export report to HTML
 */
function exportToHTML(report: any, data: Record<string, any>): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${report.name}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #333; }
    .chart { margin: 20px 0; border: 1px solid #ddd; padding: 15px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>${report.name}</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <p>Date Range: ${report.dateRange.start.toLocaleDateString()} - ${report.dateRange.end.toLocaleDateString()}</p>
  
  ${Object.entries(data).map(([chartId, chartData]: [string, any]) => `
    <div class="chart">
      <h3>Chart: ${chartId}</h3>
      ${Array.isArray(chartData) && chartData.length > 0 ? `
        <table>
          <thead>
            <tr>
              ${Object.keys(chartData[0]).map(key => `<th>${key}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${chartData.map((row: any) => `
              <tr>
                ${Object.values(row).map(val => `<td>${val}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>No data available</p>'}
    </div>
  `).join('')}
</body>
</html>
  `.trim();
}

