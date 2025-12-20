/**
 * AEGIS - Security Expert Agent
 * 
 * Expertise: SSL, privacy, GDPR, best practices
 * Personality: Protective, vigilant, trustworthy
 */

import { BaseAgent } from '../BaseAgent';
import type { TaskContext, AgentTask, AnalysisReport, TaskResult, AgentPersonality } from '../types';
import { generate as generateWithAI } from '../../services/multiModelAIOrchestrator';

const AEGIS_PERSONALITY: AgentPersonality = {
  trait: 'Protective & Vigilant',
  communicationStyle: 'formal',
  emoji: '🛡️',
  color: '#14B8A6',
};

const AEGIS_EXPERTISE = [
  'SSL/TLS', 'HTTPS', 'GDPR compliance', 'Privacy policies', 'Cookie consent',
  'Data protection', 'Form security', 'XSS prevention', 'CORS', 'CSP headers',
];

export class AegisSecurityAgent extends BaseAgent {
  constructor() {
    super('AEGIS', 'security', AEGIS_EXPERTISE, AEGIS_PERSONALITY);
  }

  getGreeting(): string {
    return `Greetings! I'm AEGIS, your Security Expert (v${this.getVersionString()}). ` +
      `I specialize in protecting your website and user data. ` +
      `Let me evaluate the security posture of your project.`;
  }

  getSummaryForMerlin(report: AnalysisReport): string {
    const status = report.overallScore >= 80 ? 'secure' :
                   report.overallScore >= 60 ? 'moderately secure' : 'needs security attention';
    return `Security analysis complete. Score: ${report.overallScore}%. Status: ${status}. ` +
      `${report.recommendations.length} security measure(s) recommended.`;
  }

  async analyze(context: TaskContext): Promise<AnalysisReport> {
    console.log(`[AEGIS v${this.getVersionString()}] Security audit for ${context.businessName}...`);
    this.setStatus('working');

    try {
      const prompt = `As AEGIS the security expert, evaluate security requirements for a ${context.industry} website.
Consider: SSL, privacy policy, cookie consent, GDPR, form security, data protection.
Return JSON: { overallScore, ssl: {required, score}, privacy: {needed, score}, gdpr: {applicable, score}, recommendations: [{title, description, priority, expectedImprovement}] }`;

      const result = await generateWithAI({ task: 'analysis', prompt, temperature: 0.5 });
      
      let analysis: any = {};
      try { analysis = JSON.parse(result.content.match(/\{[\s\S]*\}/)?.[0] || '{}'); } catch {}

      return {
        agentId: this.id,
        agentName: this.name,
        timestamp: new Date(),
        overallScore: analysis.overallScore || 72,
        metrics: [
          this.createMetric('SSL/HTTPS', analysis.ssl?.score || 90, 100),
          this.createMetric('Privacy Policy', analysis.privacy?.score || 70, 100),
          this.createMetric('GDPR Compliance', analysis.gdpr?.score || 65, 100),
          this.createMetric('Form Security', 75, 100),
        ],
        findings: [
          this.createFinding('strength', 'Security', 'SSL certificate required', 'high'),
          this.createFinding('opportunity', 'Compliance', 'Privacy policy needed', 'medium'),
        ],
        recommendations: (analysis.recommendations || [
          { title: 'Add SSL Certificate', description: 'Enable HTTPS', priority: 'high', expectedImprovement: 15 },
          { title: 'Add Privacy Policy', description: 'Create compliant privacy policy', priority: 'high', expectedImprovement: 10 },
        ]).map((r: any, i: number) =>
          this.createRecommendation(r.title, r.description || '', r.priority || 'high', 'quick-win', r.expectedImprovement || 10, false)
        ),
        canImprove: true,
        estimatedImprovementScore: 90,
      };
    } finally {
      this.setStatus('idle');
    }
  }

  async execute(task: AgentTask): Promise<TaskResult> {
    const startTime = Date.now();
    const report = await this.analyze(task.context);
    return { taskId: task.id, agentId: this.id, success: true, report, executionTimeMs: Date.now() - startTime };
  }
}

let instance: AegisSecurityAgent | null = null;
export function getAegisAgent(): AegisSecurityAgent {
  if (!instance) instance = new AegisSecurityAgent();
  return instance;
}
export default AegisSecurityAgent;

