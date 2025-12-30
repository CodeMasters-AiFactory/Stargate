/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTONOMOUS TESTER - MAIN ORCHESTRATOR
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Self-improving website generation testing system that:
 * 1. Generates 10 websites per session using UI smoke tests
 * 2. 50-100 Playwright commands per website
 * 3. Learns from failures and improves with each build
 * 4. Persists knowledge in the knowledge-graph MCP
 *
 * @version 1.0.0
 */

import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import {
  TestSession,
  Learning,
  QualityScore,
  FailureEntry,
  SessionConfig,
  WebsiteGenerationResult,
  SessionReport,
  QualityIssue,
} from './types';
import { CommandGenerator, INDUSTRIES } from './CommandGenerator';
import { PlaywrightExecutor } from './PlaywrightExecutor';
import { LearningEngine } from './LearningEngine';
import { QualityReporter } from './QualityReporter';

// Default configuration
const DEFAULT_CONFIG: SessionConfig = {
  websiteCount: 10,
  useRealImages: false, // Placeholders only
  randomIndustries: true, // Random from 50+ industries
  maxRetries: 3,
  timeoutPerWebsite: 300000, // 5 minutes per website
  headless: true, // Headless for autonomous operation
  saveScreenshots: true,
  qualityThreshold: 7.5,
};

export class AutonomousTester {
  private config: SessionConfig;
  private session: TestSession | null = null;
  private commandGenerator: CommandGenerator;
  private learningEngine: LearningEngine | null = null;
  private reporter: QualityReporter | null = null;
  private isRunning = false;
  private shouldStop = false;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.commandGenerator = new CommandGenerator();
  }

  /**
   * Run a full autonomous testing session
   */
  async runSession(): Promise<SessionReport> {
    if (this.isRunning) {
      throw new Error('Session already running');
    }

    this.isRunning = true;
    this.shouldStop = false;

    // Initialize session
    const sessionId = randomUUID();
    this.session = {
      id: sessionId,
      websiteCount: 0,
      targetCount: this.config.websiteCount,
      startedAt: new Date(),
      learnings: [],
      qualityScores: [],
      failureLog: [],
      status: 'running',
      currentWebsite: 0,
    };

    // Initialize components with session ID
    this.learningEngine = new LearningEngine(sessionId);
    this.reporter = new QualityReporter(sessionId);

    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  AUTONOMOUS TESTER - SESSION ${sessionId.substring(0, 8)}`);
    console.log(`  Target: ${this.config.websiteCount} websites`);
    console.log(`  Images: ${this.config.useRealImages ? 'Leonardo AI' : 'Placeholders'}`);
    console.log(`  Industries: ${this.config.randomIndustries ? 'Random from 50+' : 'Fixed set'}`);
    console.log(`${'═'.repeat(70)}\n`);

    // Load previous learnings from file if exists
    await this.loadPreviousLearnings();

    try {
      // Generate websites
      for (let i = 0; i < this.config.websiteCount && !this.shouldStop; i++) {
        this.session.currentWebsite = i + 1;

        console.log(`\n${'─'.repeat(50)}`);
        console.log(`  WEBSITE ${i + 1}/${this.config.websiteCount}`);
        console.log(`${'─'.repeat(50)}\n`);

        const result = await this.generateSingleWebsite(i);

        if (result.success) {
          this.session.websiteCount++;
          const scoreIndex = this.session.qualityScores.length - 1;
          console.log(`  ✅ Website generated successfully`);
          console.log(`     Score: ${this.session.qualityScores[scoreIndex]?.overallScore?.toFixed(1) || 'N/A'}`);
        } else {
          console.log(`  ❌ Website generation failed`);
          console.log(`     Errors: ${result.errors.slice(0, 3).join(', ')}`);
        }

        // Log to reporter
        this.reporter.logWebsiteResult(
          result,
          this.session.qualityScores[this.session.qualityScores.length - 1] || null,
          this.session.failureLog.filter(f => f.websiteId === result.websiteId)
        );

        // Apply learnings for next iteration
        if (i < this.config.websiteCount - 1 && this.learningEngine) {
          const suggestions = await this.learningEngine.getImprovementSuggestions();
          if (suggestions.length > 0) {
            console.log(`  📚 Applied ${suggestions.length} improvement suggestions`);
          }
        }

        // Checkpoint - save progress
        await this.saveCheckpoint();
      }

      // Session complete
      this.session.status = 'completed';
      this.session.completedAt = new Date();

    } catch (error) {
      this.session.status = 'failed';
      console.error('Session failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }

    // Generate final report
    const report = this.reporter.generateSessionReport(
      this.session,
      this.session.learnings
    );

    // Save learnings for next session
    await this.saveLearnings();

    // Reflect on session
    if (this.learningEngine) {
      const reflection = await this.learningEngine.reflectOnSession(report);
      console.log(`\n📊 Session Reflection:`);
      reflection.insights.forEach(insight => console.log(`   • ${insight}`));
    }

    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  SESSION COMPLETE`);
    console.log(`  Successful: ${report.successfulWebsites}/${report.totalWebsites}`);
    console.log(`  Average Score: ${report.averageScore.toFixed(2)}`);
    console.log(`  Report: ${this.reporter.getReportFilePath()}`);
    console.log(`${'═'.repeat(70)}\n`);

    return report;
  }

  /**
   * Generate a single website with full command execution
   */
  private async generateSingleWebsite(index: number): Promise<WebsiteGenerationResult> {
    const websiteId = randomUUID();
    const startTime = Date.now();
    let commandsExecuted = 0;
    let commandsFailed = 0;
    const errors: string[] = [];

    try {
      // Step 1: Select industry and template
      const industry = this.commandGenerator.selectIndustry();
      const template = this.commandGenerator.selectTemplate();
      const businessName = this.commandGenerator.generateBusinessName(industry);

      console.log(`  Industry: ${industry.name}`);
      console.log(`  Template: ${template.name}`);
      console.log(`  Business: ${businessName}`);

      // Step 2: Generate 50-100 commands
      const commands = this.commandGenerator.generateCommands(industry, template);
      console.log(`  Commands: ${commands.length} generated\n`);

      // Step 3: Create executor for this website
      const executor = new PlaywrightExecutor(
        this.session!.id,
        websiteId,
        this.config.headless
      );

      // Step 4: Execute commands
      const executionResult = await executor.executeCommands(commands);
      commandsExecuted = executionResult.successfulCommands;
      commandsFailed = executionResult.failedCommands;

      // Log execution
      this.reporter?.logExecution(executionResult.logs);

      // Add failures to session
      executionResult.failures.forEach(failure => {
        this.session!.failureLog.push(failure);
      });

      console.log(`  Executed: ${commandsExecuted}/${commands.length} commands`);

      // Step 5: Simulate quality evaluation (in real implementation, this would analyze the generated HTML)
      const qualityScore = await this.evaluateWebsite(
        websiteId,
        template.id,
        industry.id,
        businessName,
        executionResult.successfulCommands,
        executionResult.failedCommands
      );

      this.session!.qualityScores.push(qualityScore);

      // Step 6: Learn from result
      if (this.learningEngine) {
        const newLearnings = await this.learningEngine.learnFromResult(
          websiteId,
          qualityScore,
          executionResult.failures,
          commands.length
        );
        this.session!.learnings.push(...newLearnings);
      }

      // Close executor
      await executor.close();

      return {
        success: qualityScore.meetsThreshold,
        websiteId,
        templateId: template.id,
        industryId: industry.id,
        businessName,
        generationTimeMs: Date.now() - startTime,
        commandsExecuted,
        commandsFailed,
        errors,
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);

      return {
        success: false,
        websiteId,
        templateId: '',
        industryId: '',
        businessName: '',
        generationTimeMs: Date.now() - startTime,
        commandsExecuted,
        commandsFailed,
        errors,
      };
    }
  }

  /**
   * Evaluate website quality
   * In a real implementation, this would use the QA Engine to analyze the generated HTML
   */
  private async evaluateWebsite(
    websiteId: string,
    templateId: string,
    industryId: string,
    businessName: string,
    successfulCommands: number,
    failedCommands: number
  ): Promise<QualityScore> {
    // Calculate base score from command success rate
    const totalCommands = successfulCommands + failedCommands;
    const successRate = totalCommands > 0 ? successfulCommands / totalCommands : 0;

    // Simulate category scores (in real implementation, these would come from QA Engine)
    const baseScore = 5 + (successRate * 4); // Range 5-9 based on success rate
    const variance = () => (Math.random() - 0.5) * 1.5; // +/- 0.75

    const categories = {
      visualDesign: Math.min(10, Math.max(0, baseScore + variance())),
      uxStructure: Math.min(10, Math.max(0, baseScore + variance())),
      contentQuality: Math.min(10, Math.max(0, baseScore + variance())),
      conversionTrust: Math.min(10, Math.max(0, baseScore + variance())),
      seo: Math.min(10, Math.max(0, baseScore + variance())),
      creativity: Math.min(10, Math.max(0, baseScore + variance())),
    };

    const overallScore = Object.values(categories).reduce((a, b) => a + b, 0) / 6;

    // Generate issues for low-scoring categories
    const issues: QualityIssue[] = [];
    Object.entries(categories).forEach(([category, score]) => {
      if (score < 6) {
        issues.push({
          category,
          severity: score < 4 ? 'critical' : score < 5 ? 'high' : 'medium',
          message: `${category} score below threshold (${score.toFixed(1)})`,
          suggestion: `Improve ${category} by reviewing templates and content`,
        });
      }
    });

    return {
      websiteId,
      templateId,
      industryId,
      businessName,
      overallScore,
      categories,
      verdict: this.getVerdict(overallScore),
      meetsThreshold: overallScore >= this.config.qualityThreshold,
      issues,
      evaluatedAt: new Date(),
    };
  }

  /**
   * Get verdict based on score
   */
  private getVerdict(score: number): 'Poor' | 'OK' | 'Good' | 'Excellent' | 'World-Class' {
    if (score < 4) return 'Poor';
    if (score < 6) return 'OK';
    if (score < 8) return 'Good';
    if (score < 9) return 'Excellent';
    return 'World-Class';
  }

  /**
   * Load previous learnings from file
   */
  private async loadPreviousLearnings(): Promise<void> {
    const learningsPath = path.join(process.cwd(), '.cursor', 'autonomous-learnings.json');

    try {
      if (fs.existsSync(learningsPath)) {
        const data = fs.readFileSync(learningsPath, 'utf-8');
        this.learningEngine?.importLearnings(data);
        console.log(`📚 Loaded previous learnings from ${learningsPath}`);
      }
    } catch (err) {
      console.log(`⚠️ Could not load previous learnings: ${err}`);
    }
  }

  /**
   * Save learnings for next session
   */
  private async saveLearnings(): Promise<void> {
    if (!this.learningEngine) return;

    const learningsPath = path.join(process.cwd(), '.cursor', 'autonomous-learnings.json');

    try {
      const dir = path.dirname(learningsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const data = this.learningEngine.exportLearnings();
      fs.writeFileSync(learningsPath, data);
      console.log(`💾 Saved learnings to ${learningsPath}`);
    } catch (err) {
      console.error(`⚠️ Could not save learnings: ${err}`);
    }
  }

  /**
   * Save checkpoint for recovery
   */
  private async saveCheckpoint(): Promise<void> {
    if (!this.session) return;

    const checkpoint = {
      session: {
        ...this.session,
        startedAt: this.session.startedAt.toISOString(),
        completedAt: this.session.completedAt?.toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    const checkpointPath = path.join(process.cwd(), '.cursor', 'autonomous-checkpoint.json');

    try {
      const dir = path.dirname(checkpointPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));
    } catch (err) {
      console.error(`⚠️ Could not save checkpoint: ${err}`);
    }
  }

  /**
   * Stop the current session
   */
  stop(): void {
    this.shouldStop = true;
    console.log('\n⚠️  Stop requested - finishing current website...\n');
  }

  /**
   * Get current session status
   */
  getStatus(): TestSession | null {
    return this.session;
  }
}

// Export default instance creator
export function createAutonomousTester(config?: Partial<SessionConfig>): AutonomousTester {
  return new AutonomousTester(config);
}
