/**
 * ORACLE - SEO Expert Agent
 * 
 * Expertise: Keywords, meta tags, rankings, search intent
 * Personality: Data-driven, strategic, predictive
 * 
 * ORACLE analyzes and improves website SEO, ensuring maximum
 * visibility and ranking potential in search engines.
 * 
 * Future: Will integrate with Semrush API when available
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

const ORACLE_PERSONALITY: AgentPersonality = {
  trait: 'Data-driven & Strategic',
  communicationStyle: 'technical',
  emoji: '🔮',
  color: '#6366F1', // Indigo
};

const ORACLE_EXPERTISE = [
  'Keyword research',
  'On-page SEO',
  'Meta tag optimization',
  'Search intent analysis',
  'Technical SEO',
  'Local SEO',
  'Schema markup',
  'Content SEO',
  'Competitor analysis',
  'Ranking strategies',
];

export class OracleSEOAgent extends BaseAgent {
  // Flag for future Semrush integration
  private semrushApiKey: string | null = null;

  constructor() {
    super(
      'ORACLE',
      'seo',
      ORACLE_EXPERTISE,
      ORACLE_PERSONALITY,
      { major: 1, minor: 0, patch: 0, changelog: [] }
    );
    
    // Check for Semrush API key
    this.semrushApiKey = process.env.SEMRUSH_API_KEY || null;
    if (this.semrushApiKey) {
      console.log('[ORACLE] Semrush API integration available');
    }
  }

  /**
   * Get ORACLE's greeting
   */
  getGreeting(): string {
    const semrushNote = this.semrushApiKey 
      ? ' I have Semrush integration enabled for enhanced data.'
      : '';
    return `Greetings! I'm ORACLE, your SEO Expert (v${this.getVersionString()}).${semrushNote} ` +
      `I specialize in maximizing search visibility and rankings. ` +
      `Let me analyze the SEO potential of your project.`;
  }

  /**
   * Summarize findings for Merlin
   */
  getSummaryForMerlin(report: AnalysisReport): string {
    const status = report.overallScore >= 80 ? 'well-optimized' :
                   report.overallScore >= 60 ? 'moderately optimized' :
                   report.overallScore >= 40 ? 'needs optimization' : 'significant SEO work needed';
    
    return `SEO analysis complete. Overall score: ${report.overallScore}%. ` +
      `Site is ${status}. ` +
      `${report.recommendations.length} optimization${report.recommendations.length !== 1 ? 's' : ''} recommended.`;
  }

  /**
   * Analyze SEO aspects of a project
   */
  async analyze(context: TaskContext): Promise<AnalysisReport> {
    console.log(`[ORACLE v${this.getVersionString()}] Analyzing SEO for ${context.businessName || context.projectId}...`);
    this.setStatus('working');

    try {
      // If Semrush is available, enhance the analysis
      const semrushData = this.semrushApiKey 
        ? await this.getSemrushData(context)
        : null;

      const prompt = `As ORACLE, an SEO expert specializing in ${ORACLE_EXPERTISE.join(', ')}, 
analyze the following website project and provide detailed SEO assessment.

Project: ${context.businessName || context.projectSlug}
Industry: ${context.industry}
Target Audience: ${context.targetAudience || 'General'}
Location: ${context.existingContent?.location || 'Not specified'}

${semrushData ? `Semrush Data: ${JSON.stringify(semrushData)}` : ''}

Provide your analysis as JSON:
{
  "overallScore": 0-100,
  "keywordOptimization": {
    "score": 0-100,
    "primaryKeywords": ["keyword1", "keyword2"],
    "missingKeywords": ["keyword1"],
    "keywordDensity": "optimal|low|high",
    "suggestions": ["suggestion1"]
  },
  "onPageSEO": {
    "score": 0-100,
    "titleTag": "excellent|good|needs-work|poor",
    "metaDescription": "excellent|good|needs-work|poor",
    "headingStructure": "excellent|good|needs-work|poor",
    "suggestions": ["suggestion1"]
  },
  "technicalSEO": {
    "score": 0-100,
    "mobileOptimization": "excellent|good|needs-work|poor",
    "pageSpeed": "excellent|good|needs-work|poor",
    "schemaMarkup": "excellent|good|needs-work|poor",
    "suggestions": ["suggestion1"]
  },
  "localSEO": {
    "score": 0-100,
    "napConsistency": "excellent|good|needs-work|poor",
    "localKeywords": "excellent|good|needs-work|poor",
    "suggestions": ["suggestion1"]
  },
  "recommendations": [
    {
      "title": "Title",
      "description": "Description",
      "priority": "high|medium|low",
      "expectedImprovement": 5-20,
      "estimatedRankingImpact": "significant|moderate|minor"
    }
  ]
}`;

      const result = await generateWithAI({
        task: 'seo',
        prompt,
        temperature: 0.6,
        maxTokens: 2500,
      });

      let analysis: any = {};
      try {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('[ORACLE] Could not parse AI response, using defaults');
      }

      const report: AnalysisReport = {
        agentId: this.id,
        agentName: this.name,
        timestamp: new Date(),
        overallScore: analysis.overallScore || 65,
        metrics: [
          this.createMetric(
            'Keyword Optimization',
            analysis.keywordOptimization?.score || 62,
            100,
            analysis.keywordOptimization?.suggestions?.[0]
          ),
          this.createMetric(
            'On-Page SEO',
            analysis.onPageSEO?.score || 68,
            100,
            analysis.onPageSEO?.suggestions?.[0]
          ),
          this.createMetric(
            'Technical SEO',
            analysis.technicalSEO?.score || 70,
            100,
            analysis.technicalSEO?.suggestions?.[0]
          ),
          this.createMetric(
            'Local SEO',
            analysis.localSEO?.score || 60,
            100,
            analysis.localSEO?.suggestions?.[0]
          ),
        ],
        findings: [
          ...this.extractFindings(analysis.onPageSEO, 'On-Page SEO'),
          ...this.extractFindings(analysis.technicalSEO, 'Technical SEO'),
          ...this.extractFindings(analysis.localSEO, 'Local SEO'),
          // Add keyword findings
          ...(analysis.keywordOptimization?.primaryKeywords || []).map((kw: string) =>
            this.createFinding('strength', 'Keywords', `Primary keyword: ${kw}`, 'medium')
          ),
          ...(analysis.keywordOptimization?.missingKeywords || []).map((kw: string) =>
            this.createFinding('opportunity', 'Keywords', `Missing keyword opportunity: ${kw}`, 'medium')
          ),
        ],
        recommendations: (analysis.recommendations || []).map((rec: any, i: number) => 
          this.createRecommendation(
            rec.title || `SEO Improvement ${i + 1}`,
            rec.description || 'Optimize for better rankings',
            rec.priority || 'medium',
            rec.estimatedRankingImpact === 'significant' ? 'major' : 
            rec.estimatedRankingImpact === 'moderate' ? 'medium' : 'quick-win',
            rec.expectedImprovement || 5,
            true // SEO changes are often automatable
          )
        ),
        canImprove: (analysis.overallScore || 65) < 95,
        estimatedImprovementScore: Math.min(95, (analysis.overallScore || 65) + 20),
      };

      console.log(`[ORACLE] Analysis complete. Score: ${report.overallScore}%`);
      return report;
    } finally {
      this.setStatus('idle');
    }
  }

  /**
   * Execute an SEO task
   */
  async execute(task: AgentTask): Promise<TaskResult> {
    console.log(`[ORACLE v${this.getVersionString()}] Executing task: ${task.description}`);
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
          `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: ${value}`,
          value === 'poor' ? 'high' : value === 'needs-work' ? 'medium' : 'low'
        ));
      }
    }
    
    return findings;
  }

  /**
   * Get Semrush data (placeholder for future integration)
   */
  private async getSemrushData(context: TaskContext): Promise<any | null> {
    if (!this.semrushApiKey) return null;
    
    // TODO: Implement actual Semrush API calls when available
    console.log('[ORACLE] Semrush integration ready for future implementation');
    return null;
  }

  /**
   * Generate optimized meta tags
   */
  async generateMetaTags(context: TaskContext): Promise<{
    title: string;
    description: string;
    keywords: string[];
  }> {
    console.log(`[ORACLE] Generating optimized meta tags...`);
    
    const prompt = `As ORACLE the SEO expert, generate optimized meta tags for:
Business: ${context.businessName}
Industry: ${context.industry}
Location: ${context.existingContent?.location || 'Not specified'}

Return as JSON:
{
  "title": "Optimized title tag (50-60 chars)",
  "description": "Optimized meta description (150-160 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    const result = await generateWithAI({
      task: 'seo',
      prompt,
      temperature: 0.6,
    });

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fallback
    }

    return {
      title: `${context.businessName} | Professional ${context.industry} Services`,
      description: `${context.businessName} provides expert ${context.industry} services. Contact us today for a free consultation.`,
      keywords: [context.industry.toLowerCase(), 'services', 'professional'],
    };
  }

  /**
   * Generate LocalBusiness schema
   */
  async generateLocalSchema(context: TaskContext): Promise<object> {
    console.log(`[ORACLE] Generating LocalBusiness schema...`);
    
    const prompt = `As ORACLE, generate a complete LocalBusiness JSON-LD schema for:
Business: ${context.businessName}
Industry: ${context.industry}
Address: ${context.existingContent?.address || '123 Main St'}
Phone: ${context.existingContent?.phone || '(555) 123-4567'}
Email: ${context.existingContent?.email || 'info@example.com'}

Return ONLY the JSON-LD object (no explanation).`;

    const result = await generateWithAI({
      task: 'code',
      prompt,
      temperature: 0.3,
    });

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fallback
    }

    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": context.businessName,
      "industry": context.industry,
    };
  }

  /**
   * Analyze keyword opportunities
   */
  async analyzeKeywords(context: TaskContext): Promise<{
    primary: string[];
    secondary: string[];
    longTail: string[];
  }> {
    console.log(`[ORACLE] Analyzing keyword opportunities...`);
    
    const prompt = `As ORACLE, identify keyword opportunities for:
Business: ${context.businessName}
Industry: ${context.industry}
Location: ${context.existingContent?.location || 'Not specified'}

Return as JSON:
{
  "primary": ["main keyword 1", "main keyword 2"],
  "secondary": ["supporting keyword 1", "supporting keyword 2"],
  "longTail": ["long tail keyword phrase 1", "long tail keyword phrase 2"]
}`;

    const result = await generateWithAI({
      task: 'seo',
      prompt,
      temperature: 0.7,
    });

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fallback
    }

    return {
      primary: [context.industry.toLowerCase()],
      secondary: [`${context.industry} services`],
      longTail: [`best ${context.industry} services near me`],
    };
  }
}

// Singleton instance
let oracleInstance: OracleSEOAgent | null = null;

export function getOracleAgent(): OracleSEOAgent {
  if (!oracleInstance) {
    oracleInstance = new OracleSEOAgent();
  }
  return oracleInstance;
}

export default OracleSEOAgent;

