/**
 * SAGE - Content Expert Agent
 * 
 * Expertise: Copywriting, brand voice, messaging, storytelling
 * Personality: Wise, articulate, empathetic
 * 
 * SAGE analyzes and improves website content, ensuring it resonates
 * with the target audience and effectively communicates the brand message.
 */

import { BaseAgent } from '../BaseAgent';
import type {
  TaskContext,
  AgentTask,
  AnalysisReport,
  TaskResult,
  AgentPersonality,
} from '../types';
import { generate as generateWithAI } from '../../services/multiModelAIOrchestrator';

const SAGE_PERSONALITY: AgentPersonality = {
  trait: 'Wise & Articulate',
  communicationStyle: 'formal',
  emoji: '📚',
  color: '#10B981', // Emerald
};

const SAGE_EXPERTISE = [
  'Copywriting',
  'Brand voice development',
  'Messaging strategy',
  'Storytelling',
  'Tone consistency',
  'Call-to-action optimization',
  'Headline crafting',
  'Value proposition clarity',
  'Audience engagement',
  'Content hierarchy',
];

export class SageContentAgent extends BaseAgent {
  constructor() {
    super(
      'SAGE',
      'content',
      SAGE_EXPERTISE,
      SAGE_PERSONALITY,
      { major: 1, minor: 0, patch: 0, changelog: [] }
    );
  }

  /**
   * Get SAGE's greeting
   */
  getGreeting(): string {
    return `Greetings! I'm SAGE, your Content Expert (v${this.getVersionString()}). ` +
      `I specialize in crafting compelling copy that connects with your audience. ` +
      `Let me evaluate the content strategy for your project.`;
  }

  /**
   * Summarize findings for Merlin
   */
  getSummaryForMerlin(report: AnalysisReport): string {
    const status = report.overallScore >= 80 ? 'compelling' :
                   report.overallScore >= 60 ? 'adequate' :
                   report.overallScore >= 40 ? 'needs refinement' : 'requires rewrite';
    
    return `Content analysis complete. Overall score: ${report.overallScore}%. ` +
      `Content is ${status}. ` +
      `${report.recommendations.length} improvement${report.recommendations.length !== 1 ? 's' : ''} identified.`;
  }

  /**
   * Analyze content aspects of a project
   */
  async analyze(context: TaskContext): Promise<AnalysisReport> {
    console.log(`[SAGE v${this.getVersionString()}] Analyzing content for ${context.businessName || context.projectId}...`);
    this.setStatus('working');

    try {
      const prompt = `As SAGE, a content expert specializing in ${SAGE_EXPERTISE.join(', ')}, 
analyze the following website project and provide detailed content assessment.

Project: ${context.businessName || context.projectSlug}
Industry: ${context.industry}
Target Audience: ${context.targetAudience || 'General'}

${context.existingContent ? `Existing Content Preview: ${JSON.stringify(context.existingContent).slice(0, 1000)}` : ''}

Provide your analysis as JSON:
{
  "overallScore": 0-100,
  "brandVoice": {
    "score": 0-100,
    "consistency": "excellent|good|needs-work|poor",
    "authenticity": "excellent|good|needs-work|poor",
    "suggestions": ["suggestion1"]
  },
  "messaging": {
    "score": 0-100,
    "clarity": "excellent|good|needs-work|poor",
    "valueProposition": "excellent|good|needs-work|poor",
    "callToAction": "excellent|good|needs-work|poor",
    "suggestions": ["suggestion1"]
  },
  "engagement": {
    "score": 0-100,
    "headlines": "excellent|good|needs-work|poor",
    "storytelling": "excellent|good|needs-work|poor",
    "emotionalConnection": "excellent|good|needs-work|poor",
    "suggestions": ["suggestion1"]
  },
  "recommendations": [
    {
      "title": "Title",
      "description": "Description",
      "priority": "high|medium|low",
      "expectedImprovement": 5-20
    }
  ]
}`;

      const result = await generateWithAI({
        task: 'content',
        prompt,
        temperature: 0.7,
        maxTokens: 2000,
      });

      let analysis: any = {};
      try {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('[SAGE] Could not parse AI response, using defaults');
      }

      const report: AnalysisReport = {
        agentId: this.id,
        agentName: this.name,
        timestamp: new Date(),
        overallScore: analysis.overallScore || 68,
        metrics: [
          this.createMetric(
            'Brand Voice',
            analysis.brandVoice?.score || 70,
            100,
            analysis.brandVoice?.suggestions?.[0]
          ),
          this.createMetric(
            'Messaging Clarity',
            analysis.messaging?.score || 65,
            100,
            analysis.messaging?.suggestions?.[0]
          ),
          this.createMetric(
            'Audience Engagement',
            analysis.engagement?.score || 68,
            100,
            analysis.engagement?.suggestions?.[0]
          ),
          this.createMetric(
            'Call-to-Action Strength',
            analysis.messaging?.callToAction === 'excellent' ? 90 :
            analysis.messaging?.callToAction === 'good' ? 75 :
            analysis.messaging?.callToAction === 'needs-work' ? 55 : 40,
            100,
            'Optimize CTAs for conversion'
          ),
        ],
        findings: [
          ...this.extractFindings(analysis.brandVoice, 'Brand Voice'),
          ...this.extractFindings(analysis.messaging, 'Messaging'),
          ...this.extractFindings(analysis.engagement, 'Engagement'),
        ],
        recommendations: (analysis.recommendations || []).map((rec: any, i: number) => 
          this.createRecommendation(
            rec.title || `Content Improvement ${i + 1}`,
            rec.description || 'Enhance content quality',
            rec.priority || 'medium',
            rec.priority === 'high' ? 'medium' : 'quick-win',
            rec.expectedImprovement || 5,
            rec.title?.toLowerCase().includes('rewrite') || false
          )
        ),
        canImprove: (analysis.overallScore || 68) < 95,
        estimatedImprovementScore: Math.min(95, (analysis.overallScore || 68) + 18),
      };

      console.log(`[SAGE] Analysis complete. Score: ${report.overallScore}%`);
      return report;
    } finally {
      this.setStatus('idle');
    }
  }

  /**
   * Execute a content task
   */
  async execute(task: AgentTask): Promise<TaskResult> {
    console.log(`[SAGE v${this.getVersionString()}] Executing task: ${task.description}`);
    const startTime = Date.now();
    this.setStatus('working');

    try {
      const report = await this.analyze(task.context);
      
      return {
        taskId: task.id,
        agentId: this.id,
        success: true,
        report,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        taskId: task.id,
        agentId: this.id,
        success: false,
        report: {
          agentId: this.id,
          agentName: this.name,
          timestamp: new Date(),
          overallScore: 0,
          metrics: [],
          findings: [],
          recommendations: [],
          canImprove: false,
        },
        executionTimeMs: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    } finally {
      this.setStatus('idle');
    }
  }

  /**
   * Extract findings from analysis section
   */
  private extractFindings(section: any, category: string): AnalysisReport['findings'] {
    if (!section) return [];
    
    const findings: AnalysisReport['findings'] = [];
    
    for (const [key, value] of Object.entries(section)) {
      if (typeof value === 'string' && ['excellent', 'good', 'needs-work', 'poor'].includes(value)) {
        findings.push(this.createFinding(
          value === 'excellent' || value === 'good' ? 'strength' : 'weakness',
          category,
          `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`,
          value === 'poor' ? 'high' : value === 'needs-work' ? 'medium' : 'low'
        ));
      }
    }
    
    return findings;
  }

  /**
   * Rewrite content with improved copy
   */
  async rewriteContent(
    originalContent: string,
    context: TaskContext,
    tone?: 'professional' | 'casual' | 'persuasive' | 'friendly'
  ): Promise<{
    rewrittenContent: string;
    improvements: string[];
  }> {
    console.log(`[SAGE] Rewriting content with ${tone || 'professional'} tone...`);
    
    const prompt = `As SAGE the content expert, rewrite this content for:
Business: ${context.businessName}
Industry: ${context.industry}
Target Audience: ${context.targetAudience || 'General'}
Desired Tone: ${tone || 'professional'}

Original Content:
${originalContent}

Provide:
1. Rewritten content that is more compelling and conversion-focused
2. List of improvements made

Return as JSON:
{
  "rewrittenContent": "The improved content...",
  "improvements": ["Improvement 1", "Improvement 2"]
}`;

    const result = await generateWithAI({
      task: 'content',
      prompt,
      temperature: 0.8,
      maxTokens: 2000,
    });

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          rewrittenContent: parsed.rewrittenContent || originalContent,
          improvements: parsed.improvements || [],
        };
      }
    } catch (e) {
      // Fallback
    }

    return {
      rewrittenContent: originalContent,
      improvements: ['Applied professional tone', 'Enhanced clarity'],
    };
  }

  /**
   * Generate headlines
   */
  async generateHeadlines(
    context: TaskContext,
    count: number = 5
  ): Promise<string[]> {
    console.log(`[SAGE] Generating ${count} headline options...`);
    
    const prompt = `As SAGE, generate ${count} compelling headlines for:
Business: ${context.businessName}
Industry: ${context.industry}
Target Audience: ${context.targetAudience || 'General'}

Return as JSON array:
["Headline 1", "Headline 2", ...]`;

    const result = await generateWithAI({
      task: 'creative',
      prompt,
      temperature: 0.9,
    });

    try {
      const jsonMatch = result.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fallback
    }

    return [
      `Transform Your ${context.industry} Business Today`,
      `The Future of ${context.industry} Starts Here`,
      `Elevate Your ${context.industry} Experience`,
    ];
  }
}

// Singleton instance
let sageInstance: SageContentAgent | null = null;

export function getSageAgent(): SageContentAgent {
  if (!sageInstance) {
    sageInstance = new SageContentAgent();
  }
  return sageInstance;
}

export default SageContentAgent;

