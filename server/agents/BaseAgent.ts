/**
 * BaseAgent - Foundation for all AI Specialist Agents
 * 
 * Every agent in "The Council" inherits from this base class.
 * Provides core functionality for:
 * - Task execution
 * - Reporting to Merlin
 * - Self-improvement proposals
 * - Internet research
 * - Version tracking
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  AgentPersonality,
  AgentVersion,
  AgentStatus,
  TaskType,
  TaskContext,
  AgentTask,
  AnalysisReport,
  TaskResult,
  UpgradeProposal,
  ApprovedUpgrade,
  Feedback,
  TrendReport,
  InspirationResult,
  AgentMessage,
  ReportMetric,
  Finding,
  Recommendation,
  VersionChange,
} from './types';
import { generate as generateWithAI, type GenerationRequest } from '../services/multiModelAIOrchestrator';

export abstract class BaseAgent {
  // Core identity
  public readonly id: string;
  public readonly name: string;
  public readonly type: TaskType;
  public readonly expertise: string[];
  public readonly personality: AgentPersonality;
  
  // Version tracking
  protected version: AgentVersion;
  
  // State
  protected status: AgentStatus = 'idle';
  protected currentTask: AgentTask | null = null;
  protected memory: Map<string, unknown> = new Map();
  
  // Performance tracking
  protected totalTasksCompleted: number = 0;
  protected totalScore: number = 0;
  protected feedbackHistory: Feedback[] = [];
  
  // Pending upgrades
  protected pendingUpgrades: UpgradeProposal[] = [];

  constructor(
    name: string,
    type: TaskType,
    expertise: string[],
    personality: AgentPersonality,
    initialVersion: AgentVersion = { major: 1, minor: 0, patch: 0, changelog: [] }
  ) {
    this.id = `agent-${name.toLowerCase()}-${uuidv4().slice(0, 8)}`;
    this.name = name;
    this.type = type;
    this.expertise = expertise;
    this.personality = personality;
    this.version = initialVersion;
  }

  // ==================== VERSION MANAGEMENT ====================

  /**
   * Get current version string (e.g., "1.2.3")
   */
  getVersionString(): string {
    return `${this.version.major}.${this.version.minor}.${this.version.patch}`;
  }

  /**
   * Get full version info
   */
  getVersion(): AgentVersion {
    return { ...this.version };
  }

  /**
   * Increment version after approved upgrade
   */
  protected incrementVersion(type: 'major' | 'minor' | 'patch', changes: string[], approvedBy: string): void {
    const oldVersion = this.getVersionString();
    
    if (type === 'major') {
      this.version.major++;
      this.version.minor = 0;
      this.version.patch = 0;
    } else if (type === 'minor') {
      this.version.minor++;
      this.version.patch = 0;
    } else {
      this.version.patch++;
    }

    const change: VersionChange = {
      version: this.getVersionString(),
      date: new Date().toISOString(),
      changes,
      approvedBy,
    };

    this.version.changelog.push(change);
    console.log(`[${this.name}] 📦 Upgraded from v${oldVersion} to v${this.getVersionString()}`);
  }

  // ==================== STATUS MANAGEMENT ====================

  getStatus(): AgentStatus {
    return this.status;
  }

  protected setStatus(status: AgentStatus): void {
    this.status = status;
    console.log(`[${this.name} v${this.getVersionString()}] Status: ${status}`);
  }

  // ==================== CORE METHODS (Abstract - must be implemented) ====================

  /**
   * Analyze a context and produce a report
   * Each specialist implements their own analysis logic
   */
  abstract analyze(context: TaskContext): Promise<AnalysisReport>;

  /**
   * Execute a task and return results
   * Each specialist implements their own execution logic
   */
  abstract execute(task: AgentTask): Promise<TaskResult>;

  /**
   * Get a greeting message for the conversation UI
   */
  abstract getGreeting(): string;

  /**
   * Get the agent's analysis summary for Merlin
   */
  abstract getSummaryForMerlin(report: AnalysisReport): string;

  // ==================== REPORTING ====================

  /**
   * Generate a report for Merlin
   */
  async reportToMerlin(context: TaskContext): Promise<AgentMessage[]> {
    const messages: AgentMessage[] = [];
    
    // Greeting
    messages.push(this.createMessage('greeting', this.getGreeting()));
    
    // Analyzing
    messages.push(this.createMessage('action', `Analyzing ${context.businessName || 'the project'}...`));
    
    this.setStatus('working');
    const report = await this.analyze(context);
    
    // Report findings
    messages.push(this.createMessage('report', this.formatReport(report)));
    
    // Summary for Merlin
    messages.push(this.createMessage('completion', this.getSummaryForMerlin(report)));
    
    this.setStatus('idle');
    return messages;
  }

  /**
   * Format a report for display
   */
  protected formatReport(report: AnalysisReport): string {
    let formatted = `**${this.name} Analysis Report**\n`;
    formatted += `Overall Score: ${report.overallScore}%\n\n`;
    
    formatted += `**Metrics:**\n`;
    for (const metric of report.metrics) {
      const icon = metric.status === 'excellent' ? '✅' : 
                   metric.status === 'good' ? '👍' :
                   metric.status === 'needs-work' ? '⚠️' : '❌';
      formatted += `${icon} ${metric.name}: ${metric.score}/${metric.maxScore} (${metric.status})\n`;
    }
    
    if (report.recommendations.length > 0) {
      formatted += `\n**Recommendations:**\n`;
      for (const rec of report.recommendations.slice(0, 3)) {
        formatted += `• ${rec.title} (+${rec.expectedImprovement}%)\n`;
      }
    }
    
    return formatted;
  }

  /**
   * Create a conversation message
   */
  protected createMessage(
    messageType: AgentMessage['messageType'],
    content: string,
    metadata?: Record<string, unknown>
  ): AgentMessage {
    return {
      id: uuidv4(),
      agentId: this.id,
      agentName: this.name,
      role: 'specialist',
      content,
      timestamp: new Date(),
      messageType,
      metadata,
    };
  }

  // ==================== SELF-IMPROVEMENT ====================

  /**
   * Propose an upgrade based on new learnings
   */
  async proposeUpgrade(
    title: string,
    description: string,
    reason: string,
    evidence: UpgradeProposal['evidence'],
    expectedBenefits: string[],
    riskLevel: UpgradeProposal['riskAssessment']
  ): Promise<UpgradeProposal> {
    const currentVersion = this.getVersionString();
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    // Determine new version based on risk level
    let proposedVersion: string;
    if (riskLevel === 'critical' || riskLevel === 'high') {
      proposedVersion = `${major + 1}.0.0`;
    } else if (riskLevel === 'medium') {
      proposedVersion = `${major}.${minor + 1}.0`;
    } else {
      proposedVersion = `${major}.${minor}.${patch + 1}`;
    }

    const proposal: UpgradeProposal = {
      id: uuidv4(),
      agentId: this.id,
      agentName: this.name,
      currentVersion,
      proposedVersion,
      title,
      description,
      reason,
      evidence,
      expectedBenefits,
      riskAssessment: riskLevel,
      implementationPlan: [
        'Review current implementation',
        'Apply proposed changes',
        'Run validation tests',
        'Update version number',
        'Log changes to changelog',
      ],
      rollbackPlan: `Revert to v${currentVersion} and restore previous behavior`,
      proposedAt: new Date(),
      status: 'pending',
    };

    this.pendingUpgrades.push(proposal);
    console.log(`[${this.name}] 📝 Proposed upgrade: ${title} (v${currentVersion} → v${proposedVersion})`);
    
    return proposal;
  }

  /**
   * Apply an approved upgrade
   */
  async applyUpgrade(approved: ApprovedUpgrade): Promise<void> {
    console.log(`[${this.name}] ⬆️ Applying upgrade: ${approved.title}`);
    this.setStatus('upgrading');

    try {
      // Determine version increment type
      const riskToType: Record<string, 'major' | 'minor' | 'patch'> = {
        'critical': 'major',
        'high': 'major',
        'medium': 'minor',
        'low': 'patch',
      };

      // Apply the upgrade (subclasses can override for specific behavior)
      await this.onUpgradeApplied(approved);

      // Increment version
      this.incrementVersion(
        riskToType[approved.riskAssessment],
        approved.expectedBenefits,
        approved.approvedBy
      );

      // Remove from pending
      this.pendingUpgrades = this.pendingUpgrades.filter(u => u.id !== approved.id);
      
      console.log(`[${this.name}] ✅ Upgrade applied successfully`);
    } catch (error) {
      console.error(`[${this.name}] ❌ Upgrade failed:`, error);
      throw error;
    } finally {
      this.setStatus('idle');
    }
  }

  /**
   * Hook for subclasses to implement specific upgrade behavior
   */
  protected async onUpgradeApplied(upgrade: ApprovedUpgrade): Promise<void> {
    // Default: store upgrade info in memory
    this.memory.set(`upgrade_${upgrade.id}`, upgrade);
  }

  /**
   * Get pending upgrades
   */
  getPendingUpgrades(): UpgradeProposal[] {
    return [...this.pendingUpgrades];
  }

  // ==================== LEARNING ====================

  /**
   * Learn from feedback
   */
  async learnFrom(feedback: Feedback): Promise<void> {
    this.feedbackHistory.push(feedback);
    
    // Update average score
    this.totalScore += feedback.rating;
    const avgRating = this.totalScore / this.feedbackHistory.length;
    
    console.log(`[${this.name}] 📚 Received feedback: ${feedback.rating}/5 (avg: ${avgRating.toFixed(1)})`);

    // If rating is low, consider proposing improvements
    if (feedback.rating < 3 && feedback.specificImprovements) {
      console.log(`[${this.name}] 🔍 Low rating - will research improvements`);
      // This would trigger research in a real implementation
    }
  }

  // ==================== INTERNET RESEARCH ====================

  /**
   * Research trends in the agent's domain
   * Uses existing scrapers and AI to analyze findings
   */
  async researchTrends(): Promise<TrendReport> {
    this.setStatus('researching');
    console.log(`[${this.name}] 🔍 Researching latest ${this.type} trends...`);

    try {
      // Use AI to generate trend analysis based on the agent's expertise
      const prompt = `As a ${this.type} expert, analyze current trends in ${this.expertise.join(', ')}.
      
      Provide a JSON response with this structure:
      {
        "trends": [
          {
            "name": "Trend name",
            "description": "Brief description",
            "popularity": "emerging|growing|mainstream|declining",
            "relevance": 0-100,
            "examples": ["Example 1", "Example 2"],
            "recommendation": "How to apply this trend"
          }
        ]
      }
      
      Focus on actionable insights for website design and development.`;

      const result = await generateWithAI({
        task: 'analysis',
        prompt,
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Parse the response
      let trends: TrendReport['trends'] = [];
      try {
        const parsed = JSON.parse(result.content);
        trends = parsed.trends || [];
      } catch {
        console.warn(`[${this.name}] Could not parse trend response, using defaults`);
        trends = [{
          name: 'Modern Design Patterns',
          description: 'Contemporary design approaches',
          popularity: 'growing',
          relevance: 80,
          examples: ['Minimalism', 'Dark mode'],
          recommendation: 'Implement based on target audience',
        }];
      }

      const report: TrendReport = {
        agentId: this.id,
        category: this.type,
        trends,
        researchedAt: new Date(),
        sources: ['AI Analysis', 'Industry Knowledge Base'],
      };

      console.log(`[${this.name}] ✅ Found ${trends.length} trends`);
      return report;
    } finally {
      this.setStatus('idle');
    }
  }

  /**
   * Find inspiration from the web
   */
  async findInspiration(query: string): Promise<InspirationResult[]> {
    this.setStatus('researching');
    console.log(`[${this.name}] 💡 Finding inspiration for: ${query}`);

    try {
      // This would integrate with the existing scrapers
      // For now, return AI-generated suggestions
      const prompt = `As a ${this.type} expert, suggest 3 website examples that demonstrate excellent "${query}".
      
      For each, provide:
      - source: Website category/type
      - title: Example name
      - description: Why it's a good example
      - features: Key features to learn from
      - relevanceScore: 0-100
      
      Return as JSON array.`;

      const result = await generateWithAI({
        task: 'creative',
        prompt,
        temperature: 0.8,
        maxTokens: 1500,
      });

      let inspirations: InspirationResult[] = [];
      try {
        const parsed = JSON.parse(result.content);
        inspirations = (Array.isArray(parsed) ? parsed : parsed.examples || []).map((item: {
          source?: string;
          title?: string;
          description?: string;
          features?: string[];
          relevanceScore?: number;
          url?: string;
        }) => ({
          source: item.source || 'Web',
          url: item.url || '#',
          title: item.title || 'Example',
          description: item.description || '',
          relevanceScore: item.relevanceScore || 70,
          features: item.features || [],
          scrapedAt: new Date(),
        }));
      } catch {
        console.warn(`[${this.name}] Could not parse inspiration response`);
      }

      console.log(`[${this.name}] ✅ Found ${inspirations.length} inspirations`);
      return inspirations;
    } finally {
      this.setStatus('idle');
    }
  }

  // ==================== STARTUP ROUTINE ====================

  /**
   * Called when the server starts - agent checks for improvements
   */
  async onStartup(): Promise<{
    status: string;
    trendReport?: TrendReport;
    proposedUpgrades: UpgradeProposal[];
  }> {
    console.log(`[${this.name} v${this.getVersionString()}] 🚀 Starting up...`);
    
    const proposedUpgrades: UpgradeProposal[] = [];
    let trendReport: TrendReport | undefined;

    try {
      // Research current trends
      trendReport = await this.researchTrends();
      
      // Check if any trends warrant an upgrade
      const highRelevanceTrends = trendReport.trends.filter(t => t.relevance > 85);
      
      if (highRelevanceTrends.length > 0) {
        const proposal = await this.proposeUpgrade(
          `Incorporate ${highRelevanceTrends[0].name}`,
          `Based on trend research, ${highRelevanceTrends[0].description}`,
          `This trend has ${highRelevanceTrends[0].relevance}% relevance and is ${highRelevanceTrends[0].popularity}`,
          [{
            source: 'Trend Research',
            finding: highRelevanceTrends[0].recommendation,
            relevance: 'high',
            dateFound: new Date(),
          }],
          [`Improved ${this.type} quality`, 'Stay current with industry standards'],
          'low'
        );
        proposedUpgrades.push(proposal);
      }

      return {
        status: 'ready',
        trendReport,
        proposedUpgrades,
      };
    } catch (error) {
      console.error(`[${this.name}] ❌ Startup error:`, error);
      return {
        status: 'error',
        proposedUpgrades: [],
      };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Create a metric for reports
   */
  protected createMetric(
    name: string,
    score: number,
    maxScore: number = 100,
    details?: string
  ): ReportMetric {
    const percentage = (score / maxScore) * 100;
    let status: ReportMetric['status'];
    
    if (percentage >= 90) status = 'excellent';
    else if (percentage >= 70) status = 'good';
    else if (percentage >= 50) status = 'needs-work';
    else status = 'poor';

    return { name, score, maxScore, status, details };
  }

  /**
   * Create a finding for reports
   */
  protected createFinding(
    type: Finding['type'],
    category: string,
    description: string,
    impact: Finding['impact'],
    evidence?: string
  ): Finding {
    return { type, category, description, impact, evidence };
  }

  /**
   * Create a recommendation for reports
   */
  protected createRecommendation(
    title: string,
    description: string,
    priority: Recommendation['priority'],
    effort: Recommendation['effort'],
    expectedImprovement: number,
    automated: boolean = false
  ): Recommendation {
    return {
      id: uuidv4(),
      title,
      description,
      priority,
      effort,
      expectedImprovement,
      automated,
    };
  }

  /**
   * Get agent info for registry
   */
  getInfo(): {
    id: string;
    name: string;
    type: TaskType;
    version: string;
    status: AgentStatus;
    personality: AgentPersonality;
    expertise: string[];
    totalTasksCompleted: number;
    averageScore: number;
  } {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      version: this.getVersionString(),
      status: this.status,
      personality: this.personality,
      expertise: this.expertise,
      totalTasksCompleted: this.totalTasksCompleted,
      averageScore: this.feedbackHistory.length > 0
        ? this.totalScore / this.feedbackHistory.length
        : 0,
    };
  }
}

