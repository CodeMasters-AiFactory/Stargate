/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LEARNING ENGINE - Self-Improving AI Memory System
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Implements the Reflexion Loop pattern for continuous self-improvement:
 * 1. Execute → 2. Evaluate → 3. Reflect → 4. Store → 5. Apply → Repeat
 *
 * Uses Knowledge Graph MCP for persistent memory across sessions.
 */

import {
  Learning,
  QualityScore,
  FailureEntry,
  TestCommand,
  SessionReport,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const LEARNING_CONFIG = {
  context: 'merlin-autonomous', // Knowledge graph context
  minEffectivenessToApply: 0.6, // Only apply learnings with > 60% effectiveness
  maxLearningsPerSession: 50,
  similarityThreshold: 0.7,
  qualityThreshold: 7.5,
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ReflectionResult {
  insights: string[];
  patterns: LearningPattern[];
  improvements: ImprovementSuggestion[];
}

export interface LearningPattern {
  type: 'success' | 'failure';
  context: string;
  frequency: number;
  actions: string[];
  outcome: string;
}

export interface ImprovementSuggestion {
  area: 'commands' | 'timing' | 'templates' | 'industries' | 'form_filling';
  current: string;
  suggested: string;
  expectedImpact: number;
  confidence: number;
}

export interface KnowledgeEntity {
  name: string;
  entityType: string;
  observations: string[];
}

export interface KnowledgeRelation {
  from: string;
  to: string;
  relationType: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEARNING ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class LearningEngine {
  private sessionId: string;
  private learnings: Learning[] = [];
  private pendingEntities: KnowledgeEntity[] = [];
  private pendingRelations: KnowledgeRelation[] = [];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  /**
   * Learn from a website generation result
   * Implements the Reflexion pattern
   */
  async learnFromResult(
    websiteId: string,
    qualityScore: QualityScore,
    failures: FailureEntry[],
    commandsExecuted: number
  ): Promise<Learning[]> {
    console.log(`[LearningEngine] Analyzing result for website ${websiteId}`);
    const newLearnings: Learning[] = [];

    // 1. Analyze quality score
    const qualityLearnings = this.analyzeQuality(websiteId, qualityScore);
    newLearnings.push(...qualityLearnings);

    // 2. Analyze failures
    const failureLearnings = this.analyzeFailures(websiteId, failures);
    newLearnings.push(...failureLearnings);

    // 3. Identify success patterns
    if (qualityScore.overallScore >= LEARNING_CONFIG.qualityThreshold) {
      const successLearning = this.captureSuccessPattern(websiteId, qualityScore, commandsExecuted);
      newLearnings.push(successLearning);
    }

    // 4. Store learnings in knowledge graph
    await this.storeLearnings(newLearnings);

    this.learnings.push(...newLearnings);
    console.log(`[LearningEngine] Generated ${newLearnings.length} new learnings`);

    return newLearnings;
  }

  /**
   * Analyze quality score and generate learnings
   */
  private analyzeQuality(websiteId: string, score: QualityScore): Learning[] {
    const learnings: Learning[] = [];

    // Check each category for issues
    const categories = Object.entries(score.categories) as [string, number][];

    for (const [category, value] of categories) {
      if (value < LEARNING_CONFIG.qualityThreshold) {
        // Below threshold - create improvement learning
        const learning: Learning = {
          id: `learning_quality_${category}_${Date.now()}`,
          type: 'improvement',
          context: `quality_${category}`,
          insight: `${category} scored ${value.toFixed(1)}/10 for ${score.industryId} industry with ${score.templateId} template. Issues: ${score.issues.filter(i => i.category === category).map(i => i.message).join('; ')}`,
          appliedCount: 0,
          effectivenessScore: 0,
          createdAt: new Date(),
          relatedWebsiteIds: [websiteId],
        };
        learnings.push(learning);

        // Queue for knowledge graph
        this.queueEntity({
          name: `QualityIssue_${category}_${websiteId}`,
          entityType: 'quality_issue',
          observations: [
            `Category: ${category}`,
            `Score: ${value.toFixed(1)}`,
            `Industry: ${score.industryId}`,
            `Template: ${score.templateId}`,
            `Timestamp: ${new Date().toISOString()}`,
          ],
        });
      }
    }

    return learnings;
  }

  /**
   * Analyze failures and generate learnings
   */
  private analyzeFailures(websiteId: string, failures: FailureEntry[]): Learning[] {
    const learnings: Learning[] = [];

    // Group failures by type
    const failureGroups = new Map<string, FailureEntry[]>();
    for (const failure of failures) {
      const key = `${failure.errorType}_${failure.step}`;
      if (!failureGroups.has(key)) {
        failureGroups.set(key, []);
      }
      failureGroups.get(key)!.push(failure);
    }

    // Create learning for each failure pattern
    for (const [key, group] of Array.from(failureGroups.entries())) {
      const learning: Learning = {
        id: `learning_failure_${key}_${Date.now()}`,
        type: 'failure_pattern',
        context: key,
        insight: `Failure at ${group[0].step}: ${group[0].errorMessage}. Occurred ${group.length} times. Context: ${JSON.stringify(group[0].context)}`,
        appliedCount: 0,
        effectivenessScore: 0,
        createdAt: new Date(),
        relatedWebsiteIds: [websiteId],
      };
      learnings.push(learning);

      // Queue for knowledge graph
      this.queueEntity({
        name: `Failure_${key.replace(/[^a-zA-Z0-9]/g, '_')}`,
        entityType: 'failure_pattern',
        observations: [
          `Step: ${group[0].step}`,
          `Error: ${group[0].errorMessage}`,
          `Occurrences: ${group.length}`,
          `Timestamp: ${new Date().toISOString()}`,
        ],
      });
    }

    return learnings;
  }

  /**
   * Capture success pattern from high-quality website
   */
  private captureSuccessPattern(
    websiteId: string,
    score: QualityScore,
    commandsExecuted: number
  ): Learning {
    const learning: Learning = {
      id: `learning_success_${websiteId}_${Date.now()}`,
      type: 'success_pattern',
      context: `${score.industryId}_${score.templateId}`,
      insight: `High-quality website (${score.overallScore.toFixed(1)}/10) generated for ${score.businessName} in ${score.industryId} industry using ${score.templateId} template. ${commandsExecuted} commands executed successfully.`,
      appliedCount: 0,
      effectivenessScore: score.overallScore / 10,
      createdAt: new Date(),
      relatedWebsiteIds: [websiteId],
    };

    // Queue for knowledge graph
    this.queueEntity({
      name: `SuccessPattern_${score.industryId}_${score.templateId}`,
      entityType: 'success_pattern',
      observations: [
        `Industry: ${score.industryId}`,
        `Template: ${score.templateId}`,
        `Score: ${score.overallScore.toFixed(1)}`,
        `Commands: ${commandsExecuted}`,
        `Verdict: ${score.verdict}`,
        `Timestamp: ${new Date().toISOString()}`,
      ],
    });

    // Create relation to session
    this.queueRelation({
      from: `Session_${this.sessionId}`,
      to: `SuccessPattern_${score.industryId}_${score.templateId}`,
      relationType: 'discovered',
    });

    return learning;
  }

  /**
   * Store learnings in knowledge graph MCP
   */
  private async storeLearnings(learnings: Learning[]): Promise<void> {
    console.log(`[LearningEngine] Storing ${learnings.length} learnings in knowledge graph`);

    // Store each learning as an entity
    for (const learning of learnings) {
      this.queueEntity({
        name: learning.id,
        entityType: learning.type,
        observations: [
          `Context: ${learning.context}`,
          `Insight: ${learning.insight}`,
          `Effectiveness: ${learning.effectivenessScore}`,
          `Created: ${learning.createdAt.toISOString()}`,
        ],
      });

      // Link to session
      this.queueRelation({
        from: `Session_${this.sessionId}`,
        to: learning.id,
        relationType: 'generated',
      });

      // Link to related websites
      for (const websiteId of learning.relatedWebsiteIds) {
        this.queueRelation({
          from: learning.id,
          to: `Website_${websiteId}`,
          relationType: 'relates_to',
        });
      }
    }
  }

  /**
   * Query past learnings for similar situations
   */
  async queryRelevantLearnings(context: string): Promise<Learning[]> {
    console.log(`[LearningEngine] Querying learnings for context: ${context}`);

    // This will be executed by the daemon via MCP
    // For now, return from local cache
    return this.learnings.filter(l =>
      l.context.includes(context) ||
      l.insight.toLowerCase().includes(context.toLowerCase())
    );
  }

  /**
   * Get improvement suggestions based on learnings
   */
  async getImprovementSuggestions(): Promise<ImprovementSuggestion[]> {
    const suggestions: ImprovementSuggestion[] = [];

    // Analyze failure patterns
    const failureLearnings = this.learnings.filter(l => l.type === 'failure_pattern');
    const failureContexts = new Map<string, number>();

    for (const learning of failureLearnings) {
      const count = failureContexts.get(learning.context) || 0;
      failureContexts.set(learning.context, count + 1);
    }

    // Generate suggestions for frequent failures
    for (const [context, count] of Array.from(failureContexts.entries())) {
      if (count >= 2) {
        suggestions.push({
          area: this.categorizeContext(context),
          current: `Frequent failures in ${context}`,
          suggested: this.generateSuggestionForContext(context),
          expectedImpact: Math.min(count * 0.1, 0.5),
          confidence: Math.min(count * 0.2, 0.8),
        });
      }
    }

    // Analyze success patterns for replication
    const successLearnings = this.learnings.filter(l => l.type === 'success_pattern');
    for (const success of successLearnings) {
      if (success.effectivenessScore > 0.8) {
        suggestions.push({
          area: 'templates',
          current: 'Random template selection',
          suggested: `Prioritize templates similar to ${success.context}`,
          expectedImpact: 0.3,
          confidence: success.effectivenessScore,
        });
      }
    }

    return suggestions;
  }

  /**
   * Apply learnings to improve command generation
   */
  applyLearningsToCommands(commands: TestCommand[]): TestCommand[] {
    console.log(`[LearningEngine] Applying learnings to ${commands.length} commands`);

    const optimizedCommands = [...commands];

    // Get applicable learnings
    const applicableLearnings = this.learnings.filter(
      l => l.effectivenessScore >= LEARNING_CONFIG.minEffectivenessToApply
    );

    for (const learning of applicableLearnings) {
      // Apply command optimizations based on learning type
      if (learning.type === 'command_optimization') {
        this.applyCommandOptimization(optimizedCommands, learning);
      }

      // Increase retry count for known problematic steps
      if (learning.type === 'failure_pattern') {
        this.increaseRetriesForFailurePattern(optimizedCommands, learning);
      }

      // Update learning applied count
      learning.appliedCount++;
    }

    return optimizedCommands;
  }

  /**
   * Apply command optimization from learning
   */
  private applyCommandOptimization(commands: TestCommand[], learning: Learning): void {
    // Parse optimization from learning insight
    // Example: "Increase wait time before form submission"
    if (learning.insight.includes('wait time')) {
      for (const cmd of commands) {
        if (cmd.action === 'submit_form' || cmd.action === 'click_button') {
          cmd.timeout = (cmd.timeout || 5000) * 1.5;
        }
      }
    }
  }

  /**
   * Increase retries for known failure patterns
   */
  private increaseRetriesForFailurePattern(commands: TestCommand[], learning: Learning): void {
    const failureStep = learning.context.split('_').pop();

    for (const cmd of commands) {
      if (cmd.action === failureStep) {
        cmd.retries = Math.min((cmd.retries || 1) + 1, 5);
      }
    }
  }

  /**
   * Categorize context into improvement area
   */
  private categorizeContext(context: string): ImprovementSuggestion['area'] {
    if (context.includes('form') || context.includes('fill')) return 'form_filling';
    if (context.includes('template')) return 'templates';
    if (context.includes('industry')) return 'industries';
    if (context.includes('timeout') || context.includes('wait')) return 'timing';
    return 'commands';
  }

  /**
   * Generate suggestion for a context
   */
  private generateSuggestionForContext(context: string): string {
    const suggestions: Record<string, string> = {
      form_fill: 'Add validation before form submission',
      timeout: 'Increase wait times between steps',
      click: 'Verify element visibility before clicking',
      navigation: 'Add page load verification after navigation',
      default: 'Add more robust error handling',
    };

    for (const [key, suggestion] of Object.entries(suggestions)) {
      if (context.includes(key)) return suggestion;
    }
    return suggestions.default;
  }

  /**
   * Reflect on session results and generate meta-insights
   */
  async reflectOnSession(report: SessionReport): Promise<ReflectionResult> {
    console.log(`[LearningEngine] Reflecting on session ${report.sessionId}`);

    const insights: string[] = [];
    const patterns: LearningPattern[] = [];
    const improvements: ImprovementSuggestion[] = [];

    // Analyze overall performance
    if (report.averageScore >= 8) {
      insights.push(`Session achieved excellent quality (${report.averageScore.toFixed(1)}/10). Maintain current strategies.`);
    } else if (report.averageScore < 6) {
      insights.push(`Session quality below target (${report.averageScore.toFixed(1)}/10). Major improvements needed.`);
    }

    // Analyze improvement trend
    if (report.improvementFromPrevious > 0) {
      insights.push(`Improved by ${(report.improvementFromPrevious * 100).toFixed(1)}% from previous session. Learning is effective.`);
    } else if (report.improvementFromPrevious < 0) {
      insights.push(`Decreased by ${(Math.abs(report.improvementFromPrevious) * 100).toFixed(1)}% from previous session. Review recent changes.`);
    }

    // Analyze command success rate
    if (report.commandSuccessRate < 0.9) {
      insights.push(`Command success rate is ${(report.commandSuccessRate * 100).toFixed(1)}%. Consider reducing command complexity.`);
      improvements.push({
        area: 'commands',
        current: `${report.totalCommands} commands with ${report.commandSuccessRate * 100}% success`,
        suggested: 'Reduce command count and increase verification steps',
        expectedImpact: 0.2,
        confidence: 0.7,
      });
    }

    // Store reflection in knowledge graph
    this.queueEntity({
      name: `Reflection_${report.sessionId}`,
      entityType: 'session_reflection',
      observations: [
        `Average Score: ${report.averageScore.toFixed(1)}`,
        `Success Rate: ${report.commandSuccessRate * 100}%`,
        `Improvement: ${report.improvementFromPrevious * 100}%`,
        `Insights: ${insights.join(' | ')}`,
        `Timestamp: ${new Date().toISOString()}`,
      ],
    });

    // Extract patterns from top learnings
    for (const learning of report.topLearnings) {
      if (learning.appliedCount > 0) {
        patterns.push({
          type: learning.type === 'success_pattern' ? 'success' : 'failure',
          context: learning.context,
          frequency: learning.appliedCount,
          actions: [learning.insight.split('.')[0]],
          outcome: learning.effectivenessScore > 0.7 ? 'positive' : 'needs_improvement',
        });
      }
    }

    return { insights, patterns, improvements };
  }

  /**
   * Queue entity for knowledge graph storage
   */
  private queueEntity(entity: KnowledgeEntity): void {
    this.pendingEntities.push(entity);
  }

  /**
   * Queue relation for knowledge graph storage
   */
  private queueRelation(relation: KnowledgeRelation): void {
    this.pendingRelations.push(relation);
  }

  /**
   * Get pending entities for MCP storage
   */
  getPendingEntities(): KnowledgeEntity[] {
    return [...this.pendingEntities];
  }

  /**
   * Get pending relations for MCP storage
   */
  getPendingRelations(): KnowledgeRelation[] {
    return [...this.pendingRelations];
  }

  /**
   * Clear pending items after successful storage
   */
  clearPendingItems(): void {
    this.pendingEntities = [];
    this.pendingRelations = [];
  }

  /**
   * Get all learnings from this session
   */
  getLearnings(): Learning[] {
    return this.learnings;
  }

  /**
   * Get learnings by type
   */
  getLearningsByType(type: Learning['type']): Learning[] {
    return this.learnings.filter(l => l.type === type);
  }

  /**
   * Update learning effectiveness after application
   */
  updateLearningEffectiveness(learningId: string, newScore: number): void {
    const learning = this.learnings.find(l => l.id === learningId);
    if (learning) {
      // Running average of effectiveness
      learning.effectivenessScore =
        (learning.effectivenessScore * learning.appliedCount + newScore) /
        (learning.appliedCount + 1);

      console.log(`[LearningEngine] Updated ${learningId} effectiveness to ${learning.effectivenessScore.toFixed(2)}`);
    }
  }

  /**
   * Export learnings for persistence
   */
  exportLearnings(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      learnings: this.learnings,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Import learnings from previous session
   */
  importLearnings(data: string): void {
    try {
      const imported = JSON.parse(data);
      if (imported.learnings && Array.isArray(imported.learnings)) {
        this.learnings = imported.learnings.map((l: Learning) => ({
          ...l,
          createdAt: new Date(l.createdAt),
        }));
        console.log(`[LearningEngine] Imported ${this.learnings.length} learnings from previous session`);
      }
    } catch (err) {
      console.error('[LearningEngine] Failed to import learnings:', err);
    }
  }
}

export default LearningEngine;
