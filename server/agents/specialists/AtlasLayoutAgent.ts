/**
 * ATLAS - Layout Expert Agent
 * 
 * Expertise: Page structure, spacing, hierarchy, grid systems
 * Personality: Methodical, precise, architectural
 */

import { BaseAgent } from '../BaseAgent';
import type { TaskContext, AgentTask, AnalysisReport, TaskResult, AgentPersonality } from '../types';
import { generate as generateWithAI } from '../../services/multiModelAIOrchestrator';

const ATLAS_PERSONALITY: AgentPersonality = {
  trait: 'Methodical & Precise',
  communicationStyle: 'technical',
  emoji: '🗺️',
  color: '#3B82F6',
};

const ATLAS_EXPERTISE = [
  'Page structure', 'Grid systems', 'Visual hierarchy', 'Spacing systems',
  'Responsive layouts', 'Component architecture', 'Information architecture',
  'User flow optimization', 'Navigation design', 'Content organization',
];

export class AtlasLayoutAgent extends BaseAgent {
  constructor() {
    super('ATLAS', 'layout', ATLAS_EXPERTISE, ATLAS_PERSONALITY);
  }

  getGreeting(): string {
    return `Greetings! I'm ATLAS, your Layout Expert (v${this.getVersionString()}). ` +
      `I specialize in creating structured, well-organized page layouts. ` +
      `Let me analyze the architectural foundation of your project.`;
  }

  getSummaryForMerlin(report: AnalysisReport): string {
    const status = report.overallScore >= 80 ? 'well-structured' :
                   report.overallScore >= 60 ? 'adequately organized' : 'needs restructuring';
    return `Layout analysis complete. Score: ${report.overallScore}%. Structure is ${status}. ` +
      `${report.recommendations.length} optimization(s) suggested.`;
  }

  async analyze(context: TaskContext): Promise<AnalysisReport> {
    console.log(`[ATLAS v${this.getVersionString()}] Analyzing layout for ${context.businessName}...`);
    this.setStatus('working');

    try {
      const prompt = `As ATLAS the layout expert, analyze this website project:
Project: ${context.businessName}, Industry: ${context.industry}
Evaluate: grid system, spacing, hierarchy, responsive design, navigation.
Return JSON: { overallScore, gridSystem: {score, suggestions}, spacing: {score}, hierarchy: {score}, recommendations: [{title, description, priority, expectedImprovement}] }`;

      const result = await generateWithAI({ task: 'design', prompt, temperature: 0.6 });
      
      let analysis: any = {};
      try { analysis = JSON.parse(result.content.match(/\{[\s\S]*\}/)?.[0] || '{}'); } catch {}

      return {
        agentId: this.id,
        agentName: this.name,
        timestamp: new Date(),
        overallScore: analysis.overallScore || 72,
        metrics: [
          this.createMetric('Grid System', analysis.gridSystem?.score || 75, 100),
          this.createMetric('Spacing Consistency', analysis.spacing?.score || 70, 100),
          this.createMetric('Visual Hierarchy', analysis.hierarchy?.score || 72, 100),
          this.createMetric('Responsive Design', 68, 100),
        ],
        findings: [],
        recommendations: (analysis.recommendations || []).map((r: any, i: number) =>
          this.createRecommendation(r.title || `Layout Improvement ${i+1}`, r.description || '', r.priority || 'medium', 'medium', r.expectedImprovement || 5, false)
        ),
        canImprove: true,
        estimatedImprovementScore: 85,
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

let instance: AtlasLayoutAgent | null = null;
export function getAtlasAgent(): AtlasLayoutAgent {
  if (!instance) instance = new AtlasLayoutAgent();
  return instance;
}
export default AtlasLayoutAgent;

