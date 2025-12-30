/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QUALITY REPORTER - Detailed Logging & Reports
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Generates comprehensive reports showing:
 * - Quality scores per website
 * - Failures and their resolutions
 * - Learning progress over time
 * - Improvement recommendations
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  TestSession,
  Learning,
  QualityScore,
  FailureEntry,
  ExecutionLog,
  SessionReport,
  WebsiteGenerationResult,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const REPORTER_CONFIG = {
  logDir: '.cursor/autonomous-logs',
  reportDir: '.cursor/autonomous-reports',
  maxLogFiles: 100,
  logFormat: 'jsonl',
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface WebsiteReport {
  websiteId: string;
  businessName: string;
  industryId: string;
  templateId: string;
  qualityScore: QualityScore | null;
  status: 'success' | 'failed' | 'partial';
  commandsExecuted: number;
  commandsFailed: number;
  failures: FailureEntry[];
  generationTimeMs: number;
  timestamp: Date;
}

export interface SessionSummary {
  sessionId: string;
  startedAt: Date;
  completedAt: Date;
  totalWebsites: number;
  successfulWebsites: number;
  failedWebsites: number;
  averageScore: number;
  scoreDistribution: {
    poor: number;      // 0-4
    ok: number;        // 4-6
    good: number;      // 6-8
    excellent: number; // 8-9
    worldClass: number; // 9-10
  };
  topIssues: Array<{ issue: string; count: number }>;
  learningsGenerated: number;
  improvementFromPrevious: number;
}

export interface TrendAnalysis {
  sessions: string[];
  scores: number[];
  trend: 'improving' | 'stable' | 'declining';
  averageImprovement: number;
  predictions: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUALITY REPORTER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class QualityReporter {
  private sessionId: string;
  private websiteReports: WebsiteReport[] = [];
  private executionLogs: ExecutionLog[] = [];
  private logFilePath: string;
  private reportFilePath: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.ensureDirectories();
    this.logFilePath = path.join(REPORTER_CONFIG.logDir, `session_${sessionId}.jsonl`);
    this.reportFilePath = path.join(REPORTER_CONFIG.reportDir, `report_${sessionId}.md`);
  }

  /**
   * Ensure log and report directories exist
   */
  private ensureDirectories(): void {
    if (!fs.existsSync(REPORTER_CONFIG.logDir)) {
      fs.mkdirSync(REPORTER_CONFIG.logDir, { recursive: true });
    }
    if (!fs.existsSync(REPORTER_CONFIG.reportDir)) {
      fs.mkdirSync(REPORTER_CONFIG.reportDir, { recursive: true });
    }
  }

  /**
   * Log a website generation result
   */
  logWebsiteResult(
    result: WebsiteGenerationResult,
    qualityScore: QualityScore | null,
    failures: FailureEntry[]
  ): void {
    const report: WebsiteReport = {
      websiteId: result.websiteId,
      businessName: result.businessName,
      industryId: result.industryId,
      templateId: result.templateId,
      qualityScore,
      status: result.success ? 'success' : failures.length > 0 ? 'partial' : 'failed',
      commandsExecuted: result.commandsExecuted,
      commandsFailed: result.commandsFailed,
      failures,
      generationTimeMs: result.generationTimeMs,
      timestamp: new Date(),
    };

    this.websiteReports.push(report);
    this.appendToLog(report);

    console.log(`[QualityReporter] Logged result for ${result.businessName}: ${report.status}`);
  }

  /**
   * Log execution details
   */
  logExecution(logs: ExecutionLog[]): void {
    this.executionLogs.push(...logs);

    // Write to log file
    for (const log of logs) {
      this.appendToLog(log);
    }
  }

  /**
   * Append entry to JSONL log file
   */
  private appendToLog(entry: object): void {
    const line = JSON.stringify({ ...entry, _type: entry.constructor?.name || 'unknown' }) + '\n';
    fs.appendFileSync(this.logFilePath, line);
  }

  /**
   * Generate session report
   */
  generateSessionReport(
    session: TestSession,
    learnings: Learning[]
  ): SessionReport {
    const completedAt = new Date();
    const scores = this.websiteReports
      .filter(r => r.qualityScore)
      .map(r => r.qualityScore!.overallScore);

    const averageScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    const report: SessionReport = {
      sessionId: this.sessionId,
      startedAt: session.startedAt,
      completedAt,
      totalWebsites: this.websiteReports.length,
      successfulWebsites: this.websiteReports.filter(r => r.status === 'success').length,
      failedWebsites: this.websiteReports.filter(r => r.status === 'failed').length,
      averageScore,
      bestScore: Math.max(...scores, 0),
      worstScore: Math.min(...scores, 10),
      totalCommands: this.executionLogs.length,
      commandSuccessRate: this.executionLogs.length > 0
        ? this.executionLogs.filter(l => l.status === 'success').length / this.executionLogs.length
        : 0,
      topLearnings: learnings.slice(0, 5),
      recommendations: this.generateRecommendations(scores, learnings),
      improvementFromPrevious: session.improvementDelta || 0,
    };

    // Save report
    this.saveReport(report);

    return report;
  }

  /**
   * Generate recommendations based on session results
   */
  private generateRecommendations(scores: number[], learnings: Learning[]): string[] {
    const recommendations: string[] = [];

    const avgScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    // Score-based recommendations
    if (avgScore < 6) {
      recommendations.push('Consider reducing command complexity and adding more verification steps.');
      recommendations.push('Review template selection strategy - some templates may not work well with certain industries.');
    } else if (avgScore < 7.5) {
      recommendations.push('Focus on improving content quality and visual design consistency.');
      recommendations.push('Add more detailed form validation before submission.');
    } else if (avgScore < 8.5) {
      recommendations.push('Minor improvements needed in SEO and accessibility.');
      recommendations.push('Consider testing with more diverse industry combinations.');
    } else {
      recommendations.push('Excellent performance! Consider expanding to new industries.');
      recommendations.push('Document successful patterns for replication.');
    }

    // Failure-based recommendations
    const failureCount = this.websiteReports.reduce(
      (sum, r) => sum + r.failures.length, 0
    );
    if (failureCount > 10) {
      recommendations.push(`High failure rate detected (${failureCount} failures). Review error patterns.`);
    }

    // Learning-based recommendations
    const failureLearnings = learnings.filter(l => l.type === 'failure_pattern');
    if (failureLearnings.length > 5) {
      recommendations.push('Multiple failure patterns identified. Prioritize fixing recurring issues.');
    }

    return recommendations;
  }

  /**
   * Save report to markdown file
   */
  private saveReport(report: SessionReport): void {
    const markdown = this.generateMarkdownReport(report);
    fs.writeFileSync(this.reportFilePath, markdown);
    console.log(`[QualityReporter] Report saved to ${this.reportFilePath}`);
  }

  /**
   * Generate markdown report
   */
  private generateMarkdownReport(report: SessionReport): string {
    const duration = (report.completedAt.getTime() - report.startedAt.getTime()) / 1000 / 60;

    const md = `# Autonomous Testing Session Report

## Session: ${report.sessionId}

| Metric | Value |
|--------|-------|
| Started | ${report.startedAt.toISOString()} |
| Completed | ${report.completedAt.toISOString()} |
| Duration | ${duration.toFixed(1)} minutes |

---

## Summary

| Metric | Value |
|--------|-------|
| Total Websites | ${report.totalWebsites} |
| Successful | ${report.successfulWebsites} |
| Failed | ${report.failedWebsites} |
| Success Rate | ${((report.successfulWebsites / report.totalWebsites) * 100).toFixed(1)}% |

---

## Quality Scores

| Metric | Score |
|--------|-------|
| Average | ${report.averageScore.toFixed(2)}/10 |
| Best | ${report.bestScore.toFixed(2)}/10 |
| Worst | ${report.worstScore.toFixed(2)}/10 |
| Improvement | ${report.improvementFromPrevious >= 0 ? '+' : ''}${(report.improvementFromPrevious * 100).toFixed(1)}% |

### Score Verdict:
${this.getVerdict(report.averageScore)}

---

## Command Execution

| Metric | Value |
|--------|-------|
| Total Commands | ${report.totalCommands} |
| Success Rate | ${(report.commandSuccessRate * 100).toFixed(1)}% |
| Failed Commands | ${Math.round(report.totalCommands * (1 - report.commandSuccessRate))} |

---

## Website Details

${this.generateWebsiteTable()}

---

## Top Learnings

${report.topLearnings.map((l, i) => `${i + 1}. **${l.type}**: ${l.insight}`).join('\n')}

---

## Recommendations

${report.recommendations.map(r => `- ${r}`).join('\n')}

---

## Failure Log

${this.generateFailureLog()}

---

*Report generated at ${new Date().toISOString()}*
*Autonomous Merlin Tester v1.0*
`;

    return md;
  }

  /**
   * Get verdict emoji and text
   */
  private getVerdict(score: number): string {
    if (score >= 9) return '🏆 **WORLD-CLASS** - Outstanding quality!';
    if (score >= 8) return '⭐ **EXCELLENT** - Above expectations!';
    if (score >= 7.5) return '✅ **GOOD** - Meets quality standards';
    if (score >= 6) return '⚠️ **OK** - Needs improvement';
    if (score >= 4) return '❌ **POOR** - Significant issues';
    return '🚫 **FAILED** - Major rework needed';
  }

  /**
   * Generate website details table
   */
  private generateWebsiteTable(): string {
    if (this.websiteReports.length === 0) {
      return '*No websites generated*';
    }

    let table = `| # | Business | Industry | Score | Status | Time |
|---|----------|----------|-------|--------|------|
`;

    this.websiteReports.forEach((r, i) => {
      const score = r.qualityScore ? r.qualityScore.overallScore.toFixed(1) : 'N/A';
      const time = (r.generationTimeMs / 1000).toFixed(1);
      table += `| ${i + 1} | ${r.businessName} | ${r.industryId} | ${score} | ${r.status} | ${time}s |\n`;
    });

    return table;
  }

  /**
   * Generate failure log section
   */
  private generateFailureLog(): string {
    const allFailures = this.websiteReports.flatMap(r => r.failures);

    if (allFailures.length === 0) {
      return '*No failures recorded* ✅';
    }

    let log = '| Website | Step | Error | Attempts |\n|---------|------|-------|----------|\n';

    allFailures.slice(0, 20).forEach(f => {
      log += `| ${f.websiteId.substring(0, 8)}... | ${f.step} | ${f.errorMessage.substring(0, 50)}... | ${f.recoveryAttempts} |\n`;
    });

    if (allFailures.length > 20) {
      log += `\n*...and ${allFailures.length - 20} more failures*`;
    }

    return log;
  }

  /**
   * Generate session summary
   */
  generateSessionSummary(): SessionSummary {
    const scores = this.websiteReports
      .filter(r => r.qualityScore)
      .map(r => r.qualityScore!.overallScore);

    const distribution = {
      poor: 0,
      ok: 0,
      good: 0,
      excellent: 0,
      worldClass: 0,
    };

    scores.forEach(s => {
      if (s >= 9) distribution.worldClass++;
      else if (s >= 8) distribution.excellent++;
      else if (s >= 6) distribution.good++;
      else if (s >= 4) distribution.ok++;
      else distribution.poor++;
    });

    // Count top issues
    const issueCount = new Map<string, number>();
    this.websiteReports.forEach(r => {
      if (r.qualityScore) {
        r.qualityScore.issues.forEach(i => {
          const count = issueCount.get(i.message) || 0;
          issueCount.set(i.message, count + 1);
        });
      }
    });

    const topIssues = Array.from(issueCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));

    return {
      sessionId: this.sessionId,
      startedAt: this.websiteReports[0]?.timestamp || new Date(),
      completedAt: new Date(),
      totalWebsites: this.websiteReports.length,
      successfulWebsites: this.websiteReports.filter(r => r.status === 'success').length,
      failedWebsites: this.websiteReports.filter(r => r.status === 'failed').length,
      averageScore: scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0,
      scoreDistribution: distribution,
      topIssues,
      learningsGenerated: 0, // Will be updated by caller
      improvementFromPrevious: 0, // Will be updated by caller
    };
  }

  /**
   * Analyze trends across multiple sessions
   */
  static analyzeTrends(reportDir: string = REPORTER_CONFIG.reportDir): TrendAnalysis {
    const reports: Array<{ sessionId: string; score: number; date: Date }> = [];

    // Read all report files
    if (fs.existsSync(reportDir)) {
      const files = fs.readdirSync(reportDir).filter(f => f.endsWith('.md'));

      for (const file of files.slice(-10)) { // Last 10 sessions
        const content = fs.readFileSync(path.join(reportDir, file), 'utf-8');
        const avgMatch = content.match(/Average \| (\d+\.?\d*)\/10/);
        const sessionMatch = file.match(/report_(.+)\.md/);

        if (avgMatch && sessionMatch) {
          reports.push({
            sessionId: sessionMatch[1],
            score: parseFloat(avgMatch[1]),
            date: fs.statSync(path.join(reportDir, file)).mtime,
          });
        }
      }
    }

    // Sort by date
    reports.sort((a, b) => a.date.getTime() - b.date.getTime());

    const scores = reports.map(r => r.score);
    const sessions = reports.map(r => r.sessionId);

    // Calculate trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    let avgImprovement = 0;

    if (scores.length >= 2) {
      const improvements = [];
      for (let i = 1; i < scores.length; i++) {
        improvements.push(scores[i] - scores[i - 1]);
      }
      avgImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;

      if (avgImprovement > 0.2) trend = 'improving';
      else if (avgImprovement < -0.2) trend = 'declining';
    }

    // Generate predictions
    const predictions: string[] = [];
    if (trend === 'improving') {
      predictions.push(`Expected score next session: ${(scores[scores.length - 1] + avgImprovement).toFixed(1)}`);
      predictions.push('Continue current learning strategies');
    } else if (trend === 'declining') {
      predictions.push('Review recent changes that may have caused regression');
      predictions.push('Consider reverting to previously successful patterns');
    } else {
      predictions.push('Performance is stable - consider experimenting with new approaches');
    }

    return {
      sessions,
      scores,
      trend,
      averageImprovement: avgImprovement,
      predictions,
    };
  }

  /**
   * Get log file path
   */
  getLogFilePath(): string {
    return this.logFilePath;
  }

  /**
   * Get report file path
   */
  getReportFilePath(): string {
    return this.reportFilePath;
  }

  /**
   * Get all website reports
   */
  getWebsiteReports(): WebsiteReport[] {
    return this.websiteReports;
  }

  /**
   * Clean up old log files
   */
  static cleanupOldLogs(maxFiles: number = REPORTER_CONFIG.maxLogFiles): void {
    const logDir = REPORTER_CONFIG.logDir;
    if (!fs.existsSync(logDir)) return;

    const files = fs.readdirSync(logDir)
      .map(f => ({
        name: f,
        path: path.join(logDir, f),
        mtime: fs.statSync(path.join(logDir, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.mtime - a.mtime);

    // Remove oldest files if over limit
    if (files.length > maxFiles) {
      const toRemove = files.slice(maxFiles);
      toRemove.forEach(f => {
        fs.unlinkSync(f.path);
        console.log(`[QualityReporter] Removed old log: ${f.name}`);
      });
    }
  }
}

export default QualityReporter;
