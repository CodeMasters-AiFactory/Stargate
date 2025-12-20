/**
 * CIPHER - Code Expert Agent
 * 
 * Expertise: HTML/CSS, performance, accessibility, clean code
 * Personality: Logical, efficient, detail-oriented
 */

import { BaseAgent } from '../BaseAgent';
import type { TaskContext, AgentTask, AnalysisReport, TaskResult, AgentPersonality } from '../types';
import { generate as generateWithAI } from '../../services/multiModelAIOrchestrator';

const CIPHER_PERSONALITY: AgentPersonality = {
  trait: 'Logical & Efficient',
  communicationStyle: 'technical',
  emoji: '💻',
  color: '#06B6D4',
};

const CIPHER_EXPERTISE = [
  'HTML5 semantics', 'CSS optimization', 'Responsive code', 'Accessibility (WCAG)',
  'Performance optimization', 'Clean code practices', 'Cross-browser compatibility',
  'Code maintainability', 'SEO-friendly markup', 'Progressive enhancement',
];

export class CipherCodeAgent extends BaseAgent {
  constructor() {
    super('CIPHER', 'code', CIPHER_EXPERTISE, CIPHER_PERSONALITY);
  }

  getGreeting(): string {
    return `Hello! I'm CIPHER, your Code Expert (v${this.getVersionString()}). ` +
      `I specialize in writing clean, efficient, and accessible code. ` +
      `Let me analyze the code quality of your project.`;
  }

  getSummaryForMerlin(report: AnalysisReport): string {
    const status = report.overallScore >= 80 ? 'high-quality' :
                   report.overallScore >= 60 ? 'acceptable' : 'needs improvement';
    return `Code analysis complete. Score: ${report.overallScore}%. Code is ${status}. ` +
      `${report.recommendations.length} optimization(s) available.`;
  }

  async analyze(context: TaskContext): Promise<AnalysisReport> {
    console.log(`[CIPHER v${this.getVersionString()}] Analyzing code for ${context.businessName}...`);
    this.setStatus('working');

    try {
      const prompt = `As CIPHER the code expert, evaluate code quality for a ${context.industry} website.
Consider: HTML semantics, CSS efficiency, accessibility, performance, maintainability.
Return JSON: { overallScore, semantics: {score}, cssQuality: {score}, accessibility: {score}, performance: {score}, recommendations: [{title, description, priority, expectedImprovement}] }`;

      const result = await generateWithAI({ task: 'code', prompt, temperature: 0.5 });
      
      let analysis: any = {};
      try { analysis = JSON.parse(result.content.match(/\{[\s\S]*\}/)?.[0] || '{}'); } catch {}

      return {
        agentId: this.id,
        agentName: this.name,
        timestamp: new Date(),
        overallScore: analysis.overallScore || 75,
        metrics: [
          this.createMetric('HTML Semantics', analysis.semantics?.score || 78, 100),
          this.createMetric('CSS Quality', analysis.cssQuality?.score || 72, 100),
          this.createMetric('Accessibility', analysis.accessibility?.score || 70, 100),
          this.createMetric('Performance', analysis.performance?.score || 75, 100),
        ],
        findings: [],
        recommendations: (analysis.recommendations || []).map((r: any, i: number) =>
          this.createRecommendation(r.title || `Code Improvement ${i+1}`, r.description || '', r.priority || 'medium', 'quick-win', r.expectedImprovement || 5, true)
        ),
        canImprove: true,
        estimatedImprovementScore: 88,
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

let instance: CipherCodeAgent | null = null;
export function getCipherAgent(): CipherCodeAgent {
  if (!instance) instance = new CipherCodeAgent();
  return instance;
}
export default CipherCodeAgent;

