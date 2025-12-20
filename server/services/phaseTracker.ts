/**
 * Phase-by-Phase Reporting System
 * Implements CRITICAL RULE 3 from .cursorrules
 * Tracks all 17 phases with ratings (0-100) and generates detailed reports
 */

export interface PhaseStep {
  stepNumber: number;
  stepName: string;
  description: string;
  startTime: number;
  endTime?: number;
  duration?: number; // in milliseconds
  status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
  data?: any; // Step-specific data
  errors?: string[];
  warnings?: string[];
  output?: string; // What was produced/resulted from this step
}

export interface PhaseReport {
  phaseNumber: number;
  phaseName: string;
  startTime: number;
  endTime?: number;
  duration?: number; // in milliseconds
  rating: number; // 0-100
  ratingBreakdown: {
    criteria: string;
    score: number;
    maxScore: number;
    notes: string;
  }[];
  detailedAnalysis: string; // For ChatGPT review
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  steps: PhaseStep[]; // All steps taken in this phase
  phaseData?: any; // Phase-specific data
  errors?: string[];
  warnings?: string[];
}

export interface PhaseRatingCriteria {
  completionQuality: number; // 0-25
  adherenceToRequirements: number; // 0-25
  technicalImplementation: number; // 0-25
  bestPracticesCompliance: number; // 0-25
}

export interface WebsiteGenerationReport {
  projectSlug: string;
  projectName: string;
  generationId: string;
  startTime: number;
  endTime?: number;
  totalDuration?: number;
  overallScore: number; // Average of all phase ratings
  phases: PhaseReport[];
  summary: {
    totalPhases: number;
    completedPhases: number;
    averagePhaseScore: number;
    highestRatedPhase: {
      phaseNumber: number;
      phaseName: string;
      rating: number;
    };
    lowestRatedPhase: {
      phaseNumber: number;
      phaseName: string;
      rating: number;
    };
  };
  recommendations: string[];
  metadata: {
    version: string;
    generatedAt: string;
    generator: string;
  };
}

/**
 * Phase definitions matching Rule 3 requirements
 */
export const PHASE_DEFINITIONS = [
  { number: 1, name: 'Package Selection' },
  { number: 2, name: 'Client Specification' },
  { number: 3, name: 'Google Rating: Page Experience' },
  { number: 4, name: 'Google Rating: Core Web Vitals' },
  { number: 5, name: 'Google Rating: Mobile Usability' },
  { number: 6, name: 'Google Rating: Security' },
  { number: 7, name: 'Google Rating: Structured Data' },
  { number: 8, name: 'Google Rating: Content Quality' },
  { number: 9, name: 'Google Rating: Internal Linking' },
  { number: 10, name: 'Google Rating: Image Optimization' },
  { number: 11, name: 'Google Rating: URL Structure' },
  { number: 12, name: 'Google Rating: Meta Tags' },
  { number: 13, name: 'Google Rating: Accessibility' },
  { number: 14, name: 'Google Rating: Site Speed' },
  { number: 15, name: 'Google Rating: Mobile-First Design' },
  { number: 16, name: 'Website Builder' },
  { number: 17, name: 'Review & Final Output' },
] as const;

export class PhaseTracker {
  private phases: Map<number, PhaseReport> = new Map();
  private generationId: string;
  private projectSlug: string;
  private projectName: string;
  private startTime: number;

  constructor(projectSlug: string, projectName: string) {
    this.generationId = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.projectSlug = projectSlug;
    this.projectName = projectName;
    this.startTime = Date.now();

    // Initialize all phases
    PHASE_DEFINITIONS.forEach(phase => {
      this.phases.set(phase.number, {
        phaseNumber: phase.number,
        phaseName: phase.name,
        startTime: 0,
        rating: 0,
        ratingBreakdown: [],
        detailedAnalysis: '',
        strengths: [],
        weaknesses: [],
        improvementSuggestions: [],
        steps: [],
      });
    });
  }

  /**
   * Start tracking a phase
   */
  startPhase(phaseNumber: number): void {
    const phase = this.phases.get(phaseNumber);
    if (phase) {
      phase.startTime = Date.now();
      console.log(`[PhaseTracker] Started Phase ${phaseNumber}: ${phase.phaseName}`);
    }
  }

  /**
   * Add a step to a phase
   */
  addStep(
    phaseNumber: number,
    stepName: string,
    description: string,
    data?: any
  ): number {
    const phase = this.phases.get(phaseNumber);
    if (!phase) {
      console.warn(`[PhaseTracker] Phase ${phaseNumber} not found for step: ${stepName}`);
      return -1;
    }

    const stepNumber = phase.steps.length + 1;
    const step: PhaseStep = {
      stepNumber,
      stepName,
      description,
      startTime: Date.now(),
      status: 'running',
      data,
    };

    phase.steps.push(step);
    console.log(`[PhaseTracker] Phase ${phaseNumber} - Step ${stepNumber}: ${stepName} - ${description}`);
    return stepNumber;
  }

  /**
   * Complete a step in a phase
   */
  completeStep(
    phaseNumber: number,
    stepNumber: number,
    output?: string,
    errors?: string[],
    warnings?: string[]
  ): void {
    const phase = this.phases.get(phaseNumber);
    if (!phase) {
      console.warn(`[PhaseTracker] Phase ${phaseNumber} not found`);
      return;
    }

    const step = phase.steps.find(s => s.stepNumber === stepNumber);
    if (!step) {
      console.warn(`[PhaseTracker] Step ${stepNumber} not found in Phase ${phaseNumber}`);
      return;
    }

    step.endTime = Date.now();
    step.duration = step.endTime - step.startTime;
    step.status = errors && errors.length > 0 ? 'error' : 'completed';
    step.output = output;
    step.errors = errors;
    step.warnings = warnings;

    console.log(`[PhaseTracker] Phase ${phaseNumber} - Step ${stepNumber} completed in ${this.formatDuration(step.duration)}`);
  }

  /**
   * Complete a phase with rating and analysis
   */
  completePhase(
    phaseNumber: number,
    rating: number,
    ratingBreakdown: PhaseReport['ratingBreakdown'],
    detailedAnalysis: string,
    strengths: string[],
    weaknesses: string[],
    improvementSuggestions: string[],
    phaseData?: any,
    errors?: string[],
    warnings?: string[]
  ): void {
    const phase = this.phases.get(phaseNumber);
    if (!phase) {
      console.warn(`[PhaseTracker] Phase ${phaseNumber} not found`);
      return;
    }

    phase.endTime = Date.now();
    phase.duration = phase.endTime - phase.startTime;
    phase.rating = Math.max(0, Math.min(100, rating)); // Clamp to 0-100
    phase.ratingBreakdown = ratingBreakdown;
    phase.detailedAnalysis = detailedAnalysis;
    phase.strengths = strengths;
    phase.weaknesses = weaknesses;
    phase.improvementSuggestions = improvementSuggestions;
    phase.phaseData = phaseData;
    phase.errors = errors;
    phase.warnings = warnings;

    console.log(`[PhaseTracker] Completed Phase ${phaseNumber}: ${phase.phaseName} - Rating: ${rating}/100`);
  }

  /**
   * Get current phase report
   */
  getPhase(phaseNumber: number): PhaseReport | undefined {
    return this.phases.get(phaseNumber);
  }

  /**
   * Get all phases
   */
  getAllPhases(): PhaseReport[] {
    return Array.from(this.phases.values()).sort((a, b) => a.phaseNumber - b.phaseNumber);
  }

  /**
   * Generate complete website generation report
   */
  generateReport(): WebsiteGenerationReport {
    const allPhases = this.getAllPhases();
    const completedPhases = allPhases.filter(p => p.endTime !== undefined);
    const ratings = completedPhases.map(p => p.rating).filter(r => r > 0);
    const averageScore = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
      : 0;

    const highestRated = completedPhases.reduce((max, phase) => 
      phase.rating > max.rating ? phase : max, 
      completedPhases[0] || { phaseNumber: 0, phaseName: '', rating: 0 }
    );

    const lowestRated = completedPhases.reduce((min, phase) => 
      phase.rating < min.rating ? phase : min, 
      completedPhases[0] || { phaseNumber: 0, phaseName: '', rating: 100 }
    );

    // Generate recommendations based on lowest rated phases
    const recommendations = this.generateRecommendations(completedPhases);

    return {
      projectSlug: this.projectSlug,
      projectName: this.projectName,
      generationId: this.generationId,
      startTime: this.startTime,
      endTime: Date.now(),
      totalDuration: Date.now() - this.startTime,
      overallScore: averageScore,
      phases: allPhases,
      summary: {
        totalPhases: PHASE_DEFINITIONS.length,
        completedPhases: completedPhases.length,
        averagePhaseScore: averageScore,
        highestRatedPhase: {
          phaseNumber: highestRated.phaseNumber,
          phaseName: highestRated.phaseName,
          rating: highestRated.rating,
        },
        lowestRatedPhase: {
          phaseNumber: lowestRated.phaseNumber,
          phaseName: lowestRated.phaseName,
          rating: lowestRated.rating,
        },
      },
      recommendations,
      metadata: {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        generator: 'Merlin Website Wizard',
      },
    };
  }

  /**
   * Generate recommendations based on phase ratings
   */
  private generateRecommendations(phases: PhaseReport[]): string[] {
    const recommendations: string[] = [];
    const lowRatedPhases = phases.filter(p => p.rating < 70);

    if (lowRatedPhases.length > 0) {
      recommendations.push(
        `Focus on improving ${lowRatedPhases.length} phase(s) with ratings below 70: ${lowRatedPhases.map(p => p.phaseName).join(', ')}`
      );
    }

    phases.forEach(phase => {
      if (phase.weaknesses.length > 0) {
        recommendations.push(
          `${phase.phaseName}: Address ${phase.weaknesses.length} identified weakness(es)`
        );
      }
      if (phase.errors && phase.errors.length > 0) {
        recommendations.push(
          `${phase.phaseName}: Fix ${phase.errors.length} critical error(s)`
        );
      }
    });

    return recommendations;
  }

  /**
   * Export report as Markdown
   */
  exportMarkdown(): string {
    const report = this.generateReport();
    let markdown = `# Website Generation Report\n\n`;
    markdown += `**Project:** ${report.projectName}\n`;
    markdown += `**Project Slug:** ${report.projectSlug}\n`;
    markdown += `**Generation ID:** ${report.generationId}\n`;
    markdown += `**Generated At:** ${report.metadata.generatedAt}\n`;
    markdown += `**Total Duration:** ${this.formatDuration(report.totalDuration || 0)}\n\n`;

    markdown += `## Overall Score: ${report.overallScore.toFixed(1)}/100\n\n`;

    markdown += `### Summary Statistics\n`;
    markdown += `- **Total Phases:** ${report.summary.totalPhases}\n`;
    markdown += `- **Completed Phases:** ${report.summary.completedPhases}\n`;
    markdown += `- **Average Phase Score:** ${report.summary.averagePhaseScore.toFixed(1)}/100\n`;
    markdown += `- **Highest Rated Phase:** ${report.summary.highestRatedPhase.phaseName} (${report.summary.highestRatedPhase.rating}/100)\n`;
    markdown += `- **Lowest Rated Phase:** ${report.summary.lowestRatedPhase.phaseName} (${report.summary.lowestRatedPhase.rating}/100)\n\n`;

    if (report.recommendations.length > 0) {
      markdown += `### Recommendations\n\n`;
      report.recommendations.forEach(rec => {
        markdown += `- ${rec}\n`;
      });
      markdown += `\n`;
    }

    markdown += `---\n\n`;
    markdown += `## Phase-by-Phase Reports\n\n`;

    report.phases.forEach(phase => {
      markdown += `### Phase ${phase.phaseNumber}: ${phase.phaseName}\n\n`;
      markdown += `**Rating:** ${phase.rating}/100\n`;
      if (phase.duration) {
        markdown += `**Duration:** ${this.formatDuration(phase.duration)}\n`;
      }
      markdown += `**Status:** ${phase.endTime ? '✅ Completed' : '⏳ In Progress'}\n\n`;

      // Add steps section
      if (phase.steps && phase.steps.length > 0) {
        markdown += `#### Steps Taken (${phase.steps.length} total)\n\n`;
        phase.steps.forEach(step => {
          const statusIcon = step.status === 'completed' ? '✅' : 
                            step.status === 'error' ? '❌' : 
                            step.status === 'running' ? '⏳' : 
                            step.status === 'skipped' ? '⏭️' : '⏸️';
          markdown += `${statusIcon} **Step ${step.stepNumber}: ${step.stepName}**\n`;
          markdown += `   - Description: ${step.description}\n`;
          if (step.duration) {
            markdown += `   - Duration: ${this.formatDuration(step.duration)}\n`;
          }
          if (step.output) {
            markdown += `   - Output: ${step.output}\n`;
          }
          if (step.data) {
            markdown += `   - Data: ${JSON.stringify(step.data, null, 2).substring(0, 200)}${JSON.stringify(step.data).length > 200 ? '...' : ''}\n`;
          }
          if (step.errors && step.errors.length > 0) {
            markdown += `   - Errors: ${step.errors.join(', ')}\n`;
          }
          if (step.warnings && step.warnings.length > 0) {
            markdown += `   - Warnings: ${step.warnings.join(', ')}\n`;
          }
          markdown += `\n`;
        });
        markdown += `\n`;
      }

      if (phase.ratingBreakdown.length > 0) {
        markdown += `#### Rating Breakdown\n\n`;
        phase.ratingBreakdown.forEach(criteria => {
          markdown += `- **${criteria.criteria}:** ${criteria.score}/${criteria.maxScore} - ${criteria.notes}\n`;
        });
        markdown += `\n`;
      }

      if (phase.detailedAnalysis) {
        markdown += `#### Detailed Analysis\n\n${phase.detailedAnalysis}\n\n`;
      }

      if (phase.strengths.length > 0) {
        markdown += `#### Strengths\n\n`;
        phase.strengths.forEach(strength => {
          markdown += `- ✅ ${strength}\n`;
        });
        markdown += `\n`;
      }

      if (phase.weaknesses.length > 0) {
        markdown += `#### Weaknesses\n\n`;
        phase.weaknesses.forEach(weakness => {
          markdown += `- ⚠️ ${weakness}\n`;
        });
        markdown += `\n`;
      }

      if (phase.improvementSuggestions.length > 0) {
        markdown += `#### Improvement Suggestions\n\n`;
        phase.improvementSuggestions.forEach(suggestion => {
          markdown += `- 💡 ${suggestion}\n`;
        });
        markdown += `\n`;
      }

      if (phase.errors && phase.errors.length > 0) {
        markdown += `#### Errors\n\n`;
        phase.errors.forEach(error => {
          markdown += `- 🔴 ${error}\n`;
        });
        markdown += `\n`;
      }

      if (phase.warnings && phase.warnings.length > 0) {
        markdown += `#### Warnings\n\n`;
        phase.warnings.forEach(warning => {
          markdown += `- 🟡 ${warning}\n`;
        });
        markdown += `\n`;
      }

      markdown += `---\n\n`;
    });

    return markdown;
  }

  /**
   * Export report as JSON
   */
  exportJSON(): string {
    return JSON.stringify(this.generateReport(), null, 2);
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}


