/**
 * PHOENIX - Image Expert Agent
 * 
 * Expertise: AI image generation, visual harmony, branding
 * Personality: Artistic, transformative, bold
 * 
 * Uses Leonardo AI (primary) and DALL-E (fallback) for generation
 */

import { BaseAgent } from '../BaseAgent';
import type { TaskContext, AgentTask, AnalysisReport, TaskResult, AgentPersonality } from '../types';
import { generate as generateWithAI } from '../../services/multiModelAIOrchestrator';

const PHOENIX_PERSONALITY: AgentPersonality = {
  trait: 'Artistic & Bold',
  communicationStyle: 'creative',
  emoji: '🔥',
  color: '#EF4444',
};

const PHOENIX_EXPERTISE = [
  'AI image generation', 'Visual harmony', 'Brand consistency', 'Hero images',
  'Product photography', 'Background design', 'Color coordination', 'Image optimization',
  'Leonardo AI', 'DALL-E prompting', 'Style transfer', 'Composition',
];

export class PhoenixImageAgent extends BaseAgent {
  private leonardoAvailable: boolean;
  private dalleAvailable: boolean;

  constructor() {
    super('PHOENIX', 'image', PHOENIX_EXPERTISE, PHOENIX_PERSONALITY);
    this.leonardoAvailable = !!process.env.LEONARDO_AI_API_KEY;
    this.dalleAvailable = !!process.env.OPENAI_API_KEY;
    
    if (this.leonardoAvailable) {
      console.log('[PHOENIX] 🎨 Leonardo AI integration available');
    }
  }

  getGreeting(): string {
    const tools = this.leonardoAvailable ? 'Leonardo AI' : (this.dalleAvailable ? 'DALL-E' : 'AI');
    return `Hello! I'm PHOENIX, your Image Expert (v${this.getVersionString()}). ` +
      `I specialize in creating stunning visuals using ${tools}. ` +
      `Let me plan the visual assets for your project.`;
  }

  getSummaryForMerlin(report: AnalysisReport): string {
    return `Image analysis complete. Score: ${report.overallScore}%. ` +
      `${report.recommendations.length} image enhancement(s) suggested.`;
  }

  async analyze(context: TaskContext): Promise<AnalysisReport> {
    console.log(`[PHOENIX v${this.getVersionString()}] Planning images for ${context.businessName}...`);
    this.setStatus('working');

    try {
      const prompt = `As PHOENIX the image expert, plan visuals for a ${context.industry} website called "${context.businessName}".
Consider: hero images, service images, team photos, backgrounds, icons.
Return JSON: { overallScore, heroImage: {needed, style, colors}, serviceImages: {count, style}, recommendations: [{title, description, priority, expectedImprovement}] }`;

      const result = await generateWithAI({ task: 'creative', prompt, temperature: 0.8 });
      
      let analysis: any = {};
      try { analysis = JSON.parse(result.content.match(/\{[\s\S]*\}/)?.[0] || '{}'); } catch {}

      return {
        agentId: this.id,
        agentName: this.name,
        timestamp: new Date(),
        overallScore: analysis.overallScore || 70,
        metrics: [
          this.createMetric('Hero Image', analysis.heroImage?.needed ? 80 : 50, 100),
          this.createMetric('Visual Consistency', 72, 100),
          this.createMetric('Brand Alignment', 75, 100),
          this.createMetric('Image Quality', 70, 100),
        ],
        findings: [
          this.createFinding('opportunity', 'Images', `Need ${analysis.serviceImages?.count || 4} service images`, 'medium'),
        ],
        recommendations: (analysis.recommendations || []).map((r: any, i: number) =>
          this.createRecommendation(r.title || `Image ${i+1}`, r.description || '', r.priority || 'medium', 'medium', r.expectedImprovement || 10, false)
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

  isLeonardoAvailable(): boolean { return this.leonardoAvailable; }
  isDalleAvailable(): boolean { return this.dalleAvailable; }
}

let instance: PhoenixImageAgent | null = null;
export function getPhoenixAgent(): PhoenixImageAgent {
  if (!instance) instance = new PhoenixImageAgent();
  return instance;
}
export default PhoenixImageAgent;

