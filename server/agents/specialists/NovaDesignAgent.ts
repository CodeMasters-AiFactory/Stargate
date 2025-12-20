/**
 * NOVA - Design Expert Agent
 * 
 * Expertise: Visual aesthetics, color theory, typography, modern trends
 * Personality: Creative, passionate, perfectionist
 * 
 * NOVA analyzes and improves the visual design of websites,
 * ensuring they meet modern design standards and best practices.
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

const NOVA_PERSONALITY: AgentPersonality = {
  trait: 'Creative & Perfectionist',
  communicationStyle: 'creative',
  emoji: '✨',
  color: '#F59E0B', // Amber
};

const NOVA_EXPERTISE = [
  'Visual aesthetics',
  'Color theory',
  'Typography',
  'Modern design trends',
  'UI/UX best practices',
  'Brand consistency',
  'Visual hierarchy',
  'Responsive design visuals',
  'Micro-interactions',
  'Design systems',
];

export class NovaDesignAgent extends BaseAgent {
  constructor() {
    super(
      'NOVA',
      'design',
      NOVA_EXPERTISE,
      NOVA_PERSONALITY,
      { major: 1, minor: 0, patch: 0, changelog: [] }
    );
  }

  /**
   * Get NOVA's greeting
   */
  getGreeting(): string {
    return `Hello! I'm NOVA, your Design Expert (v${this.getVersionString()}). ` +
      `I specialize in creating visually stunning and modern website designs. ` +
      `Let me analyze the visual aspects of your project.`;
  }

  /**
   * Summarize findings for Merlin
   */
  getSummaryForMerlin(report: AnalysisReport): string {
    const status = report.overallScore >= 80 ? 'excellent' :
                   report.overallScore >= 60 ? 'good' :
                   report.overallScore >= 40 ? 'needs improvement' : 'significant work needed';
    
    return `Design analysis complete. Overall score: ${report.overallScore}%. ` +
      `Status: ${status}. ` +
      `${report.recommendations.length} improvement${report.recommendations.length !== 1 ? 's' : ''} suggested.`;
  }

  /**
   * Analyze design aspects of a project
   */
  async analyze(context: TaskContext): Promise<AnalysisReport> {
    console.log(`[NOVA v${this.getVersionString()}] Analyzing design for ${context.businessName || context.projectId}...`);
    this.setStatus('working');

    try {
      // Use AI to analyze design
      const prompt = `As NOVA, a design expert specializing in ${NOVA_EXPERTISE.join(', ')}, 
analyze the following website project and provide detailed design assessment.

Project: ${context.businessName || context.projectSlug}
Industry: ${context.industry}
Target Audience: ${context.targetAudience || 'General'}

${context.designTokens ? `Current Design Tokens: ${JSON.stringify(context.designTokens, null, 2)}` : ''}

Provide your analysis as JSON with this structure:
{
  "overallScore": 0-100,
  "colorAnalysis": {
    "score": 0-100,
    "harmony": "excellent|good|needs-work|poor",
    "contrast": "excellent|good|needs-work|poor",
    "brandAlignment": "excellent|good|needs-work|poor",
    "suggestions": ["suggestion1", "suggestion2"]
  },
  "typographyAnalysis": {
    "score": 0-100,
    "hierarchy": "excellent|good|needs-work|poor",
    "readability": "excellent|good|needs-work|poor",
    "fontPairing": "excellent|good|needs-work|poor",
    "suggestions": ["suggestion1"]
  },
  "visualBalance": {
    "score": 0-100,
    "whitespace": "excellent|good|needs-work|poor",
    "alignment": "excellent|good|needs-work|poor",
    "suggestions": ["suggestion1"]
  },
  "modernTrends": {
    "score": 0-100,
    "trendsApplied": ["trend1", "trend2"],
    "trendsMissing": ["trend1"],
    "suggestions": ["suggestion1"]
  },
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed description",
      "priority": "high|medium|low",
      "expectedImprovement": 5-20
    }
  ]
}`;

      const result = await generateWithAI({
        task: 'design',
        prompt,
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Parse AI response
      let analysis: any = {};
      try {
        // Extract JSON from response
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('[NOVA] Could not parse AI response, using defaults');
      }

      // Build report
      const report: AnalysisReport = {
        agentId: this.id,
        agentName: this.name,
        timestamp: new Date(),
        overallScore: analysis.overallScore || 70,
        metrics: [
          this.createMetric(
            'Color Harmony',
            analysis.colorAnalysis?.score || 75,
            100,
            analysis.colorAnalysis?.suggestions?.[0]
          ),
          this.createMetric(
            'Typography',
            analysis.typographyAnalysis?.score || 70,
            100,
            analysis.typographyAnalysis?.suggestions?.[0]
          ),
          this.createMetric(
            'Visual Balance',
            analysis.visualBalance?.score || 72,
            100,
            analysis.visualBalance?.suggestions?.[0]
          ),
          this.createMetric(
            'Modern Trends',
            analysis.modernTrends?.score || 68,
            100,
            analysis.modernTrends?.suggestions?.[0]
          ),
        ],
        findings: [
          ...this.extractFindings(analysis.colorAnalysis, 'Color'),
          ...this.extractFindings(analysis.typographyAnalysis, 'Typography'),
          ...this.extractFindings(analysis.visualBalance, 'Visual Balance'),
          ...this.extractFindings(analysis.modernTrends, 'Modern Trends'),
        ],
        recommendations: (analysis.recommendations || []).map((rec: any, i: number) => 
          this.createRecommendation(
            rec.title || `Improvement ${i + 1}`,
            rec.description || 'Improve design quality',
            rec.priority || 'medium',
            rec.priority === 'high' ? 'medium' : 'quick-win',
            rec.expectedImprovement || 5,
            false
          )
        ),
        canImprove: (analysis.overallScore || 70) < 95,
        estimatedImprovementScore: Math.min(95, (analysis.overallScore || 70) + 15),
      };

      console.log(`[NOVA] Analysis complete. Score: ${report.overallScore}%`);
      return report;
    } finally {
      this.setStatus('idle');
    }
  }

  /**
   * Execute a design task
   */
  async execute(task: AgentTask): Promise<TaskResult> {
    console.log(`[NOVA v${this.getVersionString()}] Executing task: ${task.description}`);
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
    
    // Convert harmony/readability/etc to findings
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
   * Generate design improvements
   */
  async improveDesign(context: TaskContext): Promise<{
    improvements: string[];
    newScore: number;
  }> {
    console.log(`[NOVA] Generating design improvements...`);
    
    const prompt = `As NOVA the design expert, suggest specific design improvements for:
Project: ${context.businessName}
Industry: ${context.industry}

Provide 3-5 specific, actionable improvements in JSON format:
{
  "improvements": [
    "Specific improvement 1",
    "Specific improvement 2"
  ],
  "expectedScoreAfter": 85
}`;

    const result = await generateWithAI({
      task: 'design',
      prompt,
      temperature: 0.8,
    });

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          improvements: parsed.improvements || [],
          newScore: parsed.expectedScoreAfter || 80,
        };
      }
    } catch (e) {
      // Fallback
    }

    return {
      improvements: [
        'Enhance color contrast for accessibility',
        'Improve typography hierarchy',
        'Add more visual breathing room',
      ],
      newScore: 80,
    };
  }
}

// Singleton instance
let novaInstance: NovaDesignAgent | null = null;

export function getNovaAgent(): NovaDesignAgent {
  if (!novaInstance) {
    novaInstance = new NovaDesignAgent();
  }
  return novaInstance;
}

export default NovaDesignAgent;

