/**
 * TEMPO - Performance Expert Agent
 * 
 * Expertise: Speed optimization, Core Web Vitals, caching
 * Personality: Fast, efficient, metrics-focused
 */

import { BaseAgent } from '../BaseAgent';
import type { TaskContext, AgentTask, AnalysisReport, TaskResult, AgentPersonality } from '../types';
import { generate as generateWithAI } from '../../services/multiModelAIOrchestrator';

const TEMPO_PERSONALITY: AgentPersonality = {
  trait: 'Fast & Metrics-focused',
  communicationStyle: 'technical',
  emoji: '⚡',
  color: '#FBBF24',
};

const TEMPO_EXPERTISE = [
  'Core Web Vitals', 'Page speed', 'LCP optimization', 'FID optimization',
  'CLS prevention', 'Image optimization', 'Code splitting', 'Lazy loading',
  'Caching strategies', 'CDN', 'Compression', 'Resource hints',
];

export class TempoPerformanceAgent extends BaseAgent {
  constructor() {
    super('TEMPO', 'performance', TEMPO_EXPERTISE, TEMPO_PERSONALITY);
  }

  getGreeting(): string {
    return `Hello! I'm TEMPO, your Performance Expert (v${this.getVersionString()}). ` +
      `I specialize in making websites blazing fast. ` +
      `Let me analyze the speed potential of your project.`;
  }

  getSummaryForMerlin(report: AnalysisReport): string {
    const status = report.overallScore >= 90 ? 'excellent' :
                   report.overallScore >= 70 ? 'good' : 'needs optimization';
    return `Performance analysis complete. Score: ${report.overallScore}%. Speed is ${status}. ` +
      `${report.recommendations.length} optimization(s) available.`;
  }

  async analyze(context: TaskContext): Promise<AnalysisReport> {
    console.log(`[TEMPO v${this.getVersionString()}] Performance analysis for ${context.businessName}...`);
    this.setStatus('working');

    try {
      const prompt = `As TEMPO the performance expert, evaluate performance requirements for a ${context.industry} website.
Consider: Core Web Vitals (LCP, FID, CLS), image optimization, code efficiency, caching.
Return JSON: { overallScore, lcp: {target, score}, fid: {target, score}, cls: {target, score}, recommendations: [{title, description, priority, expectedImprovement}] }`;

      const result = await generateWithAI({ task: 'analysis', prompt, temperature: 0.5 });
      
      let analysis: any = {};
      try { analysis = JSON.parse(result.content.match(/\{[\s\S]*\}/)?.[0] || '{}'); } catch {}

      return {
        agentId: this.id,
        agentName: this.name,
        timestamp: new Date(),
        overallScore: analysis.overallScore || 75,
        metrics: [
          this.createMetric('LCP (Largest Contentful Paint)', analysis.lcp?.score || 72, 100, 'Target: <2.5s'),
          this.createMetric('FID (First Input Delay)', analysis.fid?.score || 85, 100, 'Target: <100ms'),
          this.createMetric('CLS (Cumulative Layout Shift)', analysis.cls?.score || 78, 100, 'Target: <0.1'),
          this.createMetric('Overall Speed Index', 70, 100),
        ],
        findings: [
          this.createFinding('strength', 'Performance', 'Modern framework provides good baseline', 'medium'),
          this.createFinding('opportunity', 'Optimization', 'Image optimization can improve LCP', 'high'),
        ],
        recommendations: (analysis.recommendations || [
          { title: 'Optimize Images', description: 'Use WebP format and lazy loading', priority: 'high', expectedImprovement: 15 },
          { title: 'Enable Compression', description: 'Use Gzip/Brotli compression', priority: 'medium', expectedImprovement: 10 },
        ]).map((r: any, i: number) =>
          this.createRecommendation(r.title, r.description || '', r.priority || 'medium', 'quick-win', r.expectedImprovement || 10, true)
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

let instance: TempoPerformanceAgent | null = null;
export function getTempoAgent(): TempoPerformanceAgent {
  if (!instance) instance = new TempoPerformanceAgent();
  return instance;
}
export default TempoPerformanceAgent;

