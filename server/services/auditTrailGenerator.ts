/**
 * Audit Trail Generator Service
 * 
 * Complete legal documentation:
 * - Timestamped scraping logs
 * - robots.txt compliance proof
 * - ToS change detection
 * - Export court-ready documentation
 */

import { generateComplianceReport } from './legalComplianceEngine';
import * as fs from 'fs';
import * as path from 'path';

export interface AuditTrailEntry {
  timestamp: Date;
  action: 'scrape' | 'check_robots' | 'check_tos' | 'compliance_check';
  url: string;
  details: Record<string, unknown>;
  compliance: {
    robotsTxtCompliant: boolean;
    tosCompliant: boolean;
    gdprCompliant: boolean;
  };
}

export interface AuditTrail {
  id: string;
  url: string;
  createdAt: Date;
  entries: AuditTrailEntry[];
  summary: {
    totalScrapes: number;
    complianceRate: number;
    violations: number;
  };
  exportPath?: string;
}

// In-memory store (in production, use database)
const auditTrails = new Map<string, AuditTrail>();

/**
 * Create audit trail
 */
export function createAuditTrail(url: string): string {
  const id = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const trail: AuditTrail = {
    id,
    url,
    createdAt: new Date(),
    entries: [],
    summary: {
      totalScrapes: 0,
      complianceRate: 100,
      violations: 0,
    },
  };

  auditTrails.set(id, trail);
  return id;
}

/**
 * Add entry to audit trail
 */
export async function addAuditEntry(
  trailId: string,
  action: AuditTrailEntry['action'],
  url: string,
  details: Record<string, unknown> = {}
): Promise<void> {
  const trail = auditTrails.get(trailId);
  if (!trail) {
    throw new Error(`Audit trail ${trailId} not found`);
  }

  // Check compliance
  const complianceReport = await generateComplianceReport(url);

  const entry: AuditTrailEntry = {
    timestamp: new Date(),
    action,
    url,
    details,
    compliance: {
      robotsTxtCompliant: complianceReport.robotsTxt.hasRobotsTxt && 
                         complianceReport.overallStatus !== 'non_compliant',
      tosCompliant: !complianceReport.tosAnalysis.scrapingClausesDetected,
      gdprCompliant: complianceReport.tosAnalysis.gdprComplianceSummary?.toLowerCase().includes('compliant') || false,
    },
  };

  trail.entries.push(entry);
  trail.summary.totalScrapes++;

  // Update compliance rate
  const compliantEntries = trail.entries.filter(e => 
    e.compliance.robotsTxtCompliant && 
    e.compliance.tosCompliant
  ).length;
  trail.summary.complianceRate = (compliantEntries / trail.entries.length) * 100;
  trail.summary.violations = trail.entries.length - compliantEntries;

  auditTrails.set(trailId, trail);
}

/**
 * Export audit trail to file
 */
export async function exportAuditTrail(trailId: string, format: 'json' | 'pdf' | 'html' = 'json'): Promise<string> {
  const trail = auditTrails.get(trailId);
  if (!trail) {
    throw new Error(`Audit trail ${trailId} not found`);
  }

  const exportDir = path.join(process.cwd(), 'audit_trails');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const filename = `audit_${trailId}_${Date.now()}.${format}`;
  const filepath = path.join(exportDir, filename);

  if (format === 'json') {
    fs.writeFileSync(filepath, JSON.stringify(trail, null, 2), 'utf8');
  } else if (format === 'html') {
    const html = generateAuditTrailHTML(trail);
    fs.writeFileSync(filepath, html, 'utf8');
  } else {
    // PDF would require a library like puppeteer or pdfkit
    throw new Error('PDF export not yet implemented');
  }

  trail.exportPath = filepath;
  auditTrails.set(trailId, trail);

  return filepath;
}

/**
 * Generate HTML report
 */
function generateAuditTrailHTML(trail: AuditTrail): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Audit Trail - ${trail.url}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .entry { border-left: 3px solid #007bff; padding: 10px; margin: 10px 0; }
    .compliant { color: green; }
    .non-compliant { color: red; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #007bff; color: white; }
  </style>
</head>
<body>
  <h1>Audit Trail Report</h1>
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>URL:</strong> ${trail.url}</p>
    <p><strong>Created:</strong> ${trail.createdAt.toISOString()}</p>
    <p><strong>Total Scrapes:</strong> ${trail.summary.totalScrapes}</p>
    <p><strong>Compliance Rate:</strong> ${trail.summary.complianceRate.toFixed(1)}%</p>
    <p><strong>Violations:</strong> ${trail.summary.violations}</p>
  </div>
  
  <h2>Entries</h2>
  <table>
    <thead>
      <tr>
        <th>Timestamp</th>
        <th>Action</th>
        <th>URL</th>
        <th>Robots.txt</th>
        <th>ToS</th>
        <th>GDPR</th>
      </tr>
    </thead>
    <tbody>
      ${trail.entries.map(entry => `
        <tr>
          <td>${entry.timestamp.toISOString()}</td>
          <td>${entry.action}</td>
          <td>${entry.url}</td>
          <td class="${entry.compliance.robotsTxtCompliant ? 'compliant' : 'non-compliant'}">
            ${entry.compliance.robotsTxtCompliant ? '✓' : '✗'}
          </td>
          <td class="${entry.compliance.tosCompliant ? 'compliant' : 'non-compliant'}">
            ${entry.compliance.tosCompliant ? '✓' : '✗'}
          </td>
          <td class="${entry.compliance.gdprCompliant ? 'compliant' : 'non-compliant'}">
            ${entry.compliance.gdprCompliant ? '✓' : '✗'}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;
}

/**
 * Get audit trail
 */
export function getAuditTrail(trailId: string): AuditTrail | undefined {
  return auditTrails.get(trailId);
}

