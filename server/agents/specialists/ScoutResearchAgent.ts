/**
 * SCOUT - Research Expert Agent
 * 
 * Expertise: Competitor analysis, trend research, web scraping
 * Personality: Curious, thorough, investigative
 */

import { BaseAgent } from '../BaseAgent';
import type { TaskContext, AgentTask, AnalysisReport, TaskResult, AgentPersonality } from '../types';
import { generateWithAI } from '../../services/multiModelAIOrchestrator';
import { researchDesignTrends, researchCompetitors, findInspiration } from '../research/InternetResearchEngine';

const SCOUT_PERSONALITY: AgentPersonality = {
  trait: 'Curious & Thorough',
  communicationStyle: 'technical',
  emoji: '🔍',
  color: '#EC4899',
};

const SCOUT_EXPERTISE = [
  'Competitor analysis', 'Trend research', 'Web scraping', 'Market research',
  'Industry analysis', 'Benchmark studies', 'Pattern recognition', 'Data collection',
];

export class ScoutResearchAgent extends BaseAgent {
  constructor() {
    super('SCOUT', 'research', SCOUT_EXPERTISE, SCOUT_PERSONALITY);
  }

  getGreeting(): string {
    return `Hello! I'm SCOUT, your Research Expert (v${this.getVersionString()}). ` +
      `I specialize in gathering competitive intelligence and industry insights. ` +
      `Let me investigate the landscape for your project.`;
  }

  getSummaryForMerlin(report: AnalysisReport): string {
    return `Research complete. Found ${report.findings.length} key findings. ` +
      `${report.recommendations.length} actionable insight(s) identified.`;
  }

  async analyze(context: TaskContext): Promise<AnalysisReport> {
    console.log(`[SCOUT v${this.getVersionString()}] Researching for ${context.businessName}...`);
    this.setStatus('researching');

    try {
      // Use the internet research engine
      const [trends, competitors] = await Promise.all([
        researchDesignTrends(),
        researchCompetitors(context.industry),
      ]);

      const findings = [
        ...trends.trends.slice(0, 3).map(t => this.createFinding('opportunity', 'Trend', t.name + ': ' + t.description, 'medium')),
        ...competitors.insights.map(i => this.createFinding('opportunity', 'Competitive', i, 'medium')),
      ];

      return {
        agentId: this.id,
        agentName: this.name,
        timestamp: new Date(),
        overallScore: 100, // Research doesn't have a "score" per se
        metrics: [
          this.createMetric('Trends Identified', trends.trends.length, 10),
          this.createMetric('Competitors Analyzed', competitors.competitors.length, 5),
          this.createMetric('Insights Generated', competitors.insights.length, 5),
        ],
        findings,
        recommendations: trends.trends.slice(0, 3).map(t => 
          this.createRecommendation(`Apply ${t.name}`, t.recommendation, 'medium', 'medium', 10, false)
        ),
        canImprove: false,
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

  async findInspirationFor(query: string): Promise<any[]> {
    return findInspiration(query, 'design');
  }
}

let instance: ScoutResearchAgent | null = null;
export function getScoutAgent(): ScoutResearchAgent {
  if (!instance) instance = new ScoutResearchAgent();
  return instance;
}
export default ScoutResearchAgent;

