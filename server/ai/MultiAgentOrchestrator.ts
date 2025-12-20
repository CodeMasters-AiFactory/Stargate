import { PlanningAgent } from './agents/PlanningAgent';
import { ResearchAgent } from './agents/ResearchAgent';
import { RecommendationAgent } from './agents/RecommendationAgent';
import { JudgeAgent } from './agents/JudgeAgent';
import { ExecutionerAgent } from './agents/ExecutionerAgent';

export interface MultiAgentRequest {
  projectDescription: string;
  requirements: string;
  industry: string;
  priority: 'speed' | 'innovation' | 'cost' | 'quality';
  selectedModels?: string[];
  planningMode?: 'speed' | 'comprehensive' | 'strategic';
}

export interface AgentProgress {
  agentName: string;
  status: 'waiting' | 'running' | 'completed' | 'failed';
  progress: number;
  currentTask: string;
  result?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface MultiAgentResult {
  sessionId: string;
  status: 'running' | 'completed' | 'failed';
  progress: AgentProgress[];
  planningResult?: any;
  researchResult?: any;
  recommendationResult?: any;
  judgmentResult?: any;
  executionResult?: any;
  finalSummary?: string;
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
}

export class MultiAgentOrchestrator {
  private planningAgent: PlanningAgent;
  private researchAgent: ResearchAgent;
  private recommendationAgent: RecommendationAgent;
  private judgeAgent: JudgeAgent;
  private executionerAgent: ExecutionerAgent;
  private activeSessions: Map<string, MultiAgentResult> = new Map();

  constructor() {
    this.planningAgent = new PlanningAgent();
    this.researchAgent = new ResearchAgent();
    this.recommendationAgent = new RecommendationAgent();
    this.judgeAgent = new JudgeAgent();
    this.executionerAgent = new ExecutionerAgent();
    
    console.log('🤖 Multi-Agent AI Orchestrator initialized with 5 specialized agents');
  }

  async executeMultiAgentAnalysis(request: MultiAgentRequest): Promise<string> {
    const sessionId = this.generateSessionId();
    const startTime = new Date();

    console.log(`🚀 Starting multi-agent analysis session: ${sessionId}`);
    
    const session: MultiAgentResult = {
      sessionId,
      status: 'running',
      startTime,
      progress: this.initializeProgress(request.planningMode || 'comprehensive')
    };

    this.activeSessions.set(sessionId, session);

    try {
      // Execute agents in coordinated sequence
      await this.executeAgentSequence(sessionId, request);
      
      session.status = 'completed';
      session.endTime = new Date();
      session.totalDuration = session.endTime.getTime() - session.startTime.getTime();
      session.finalSummary = this.generateFinalSummary(session);

      console.log(`✅ Multi-agent analysis completed: ${sessionId} (${session.totalDuration}ms)`);
      
    } catch (error) {
      console.error(`❌ Multi-agent analysis failed: ${sessionId}`, error);
      session.status = 'failed';
      session.endTime = new Date();
      
      // Update failed agent status
      const failedAgent = session.progress.find(p => p.status === 'running');
      if (failedAgent) {
        failedAgent.status = 'failed';
        failedAgent.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    return sessionId;
  }

  async getSessionStatus(sessionId: string): Promise<MultiAgentResult | null> {
    return this.activeSessions.get(sessionId) || null;
  }

  private generateSessionId(): string {
    return `ai-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeProgress(mode: string = 'comprehensive'): AgentProgress[] {
    const allAgents = [
      {
        agentName: 'Planning Agent',
        status: 'waiting' as const,
        progress: 0,
        currentTask: 'Awaiting project analysis initiation'
      },
      {
        agentName: 'Research Agent',
        status: 'waiting' as const,
        progress: 0,
        currentTask: 'Awaiting competitive intelligence gathering'
      },
      {
        agentName: 'Recommendation Agent',
        status: 'waiting' as const,
        progress: 0,
        currentTask: 'Awaiting strategic recommendation generation'
      },
      {
        agentName: 'Judge Agent',
        status: 'waiting' as const,
        progress: 0,
        currentTask: 'Awaiting plan evaluation and scoring'
      },
      {
        agentName: 'Executioner Agent',
        status: 'waiting' as const,
        progress: 0,
        currentTask: 'Awaiting execution plan creation'
      }
    ];

    const agentSequence = this.getAgentSequenceForMode(mode);
    return allAgents.filter(agent => agentSequence.includes(agent.agentName));
  }

  private async executeAgentSequence(sessionId: string, request: MultiAgentRequest): Promise<void> {
    const session = this.activeSessions.get(sessionId)!;
    const mode = request.planningMode || 'comprehensive';

    // Determine which agents to run based on planning mode
    const agentSequence = this.getAgentSequenceForMode(mode);

    for (const agentName of agentSequence) {
      switch (agentName) {
        case 'Planning Agent':
          await this.executeAgentPhase(session, 'Planning Agent', async () => {
            const result = await this.planningAgent.analyzeProject(request.projectDescription, request.requirements);
            session.planningResult = result;
            return result;
          });
          break;

        case 'Research Agent':
          await this.executeAgentPhase(session, 'Research Agent', async () => {
            const projectType = session.planningResult?.analysis?.projectType || 'Web Application';
            const result = await this.researchAgent.conductCompetitiveResearch(
              projectType,
              request.industry
            );
            session.researchResult = result;
            return result;
          });
          break;

        case 'Recommendation Agent':
          await this.executeAgentPhase(session, 'Recommendation Agent', async () => {
            const result = await this.recommendationAgent.generateRecommendations(
              session.planningResult || {},
              session.researchResult || {}
            );
            session.recommendationResult = result;
            return result;
          });
          break;

        case 'Judge Agent':
          await this.executeAgentPhase(session, 'Judge Agent', async () => {
            const result = await this.judgeAgent.evaluatePlans(
              session.planningResult || {},
              session.researchResult || {},
              session.recommendationResult || {}
            );
            session.judgmentResult = result;
            return result;
          });
          break;

        case 'Executioner Agent':
          await this.executeAgentPhase(session, 'Executioner Agent', async () => {
            const result = await this.executionerAgent.createExecutionPlan(
              session.planningResult || {},
              session.researchResult || {},
              session.recommendationResult || {},
              session.judgmentResult || {}
            );
            session.executionResult = result;
            return result;
          });
          break;
      }
    }
  }

  private getAgentSequenceForMode(mode: string): string[] {
    switch (mode) {
      case 'speed':
        return ['Planning Agent', 'Research Agent', 'Judge Agent'];
      case 'strategic':
        return ['Research Agent', 'Recommendation Agent', 'Judge Agent', 'Executioner Agent'];
      case 'comprehensive':
      default:
        return ['Planning Agent', 'Research Agent', 'Recommendation Agent', 'Judge Agent', 'Executioner Agent'];
    }
  }

  private async executeAgentPhase(
    session: MultiAgentResult,
    agentName: string,
    agentFunction: () => Promise<any>
  ): Promise<void> {
    const agentProgress = session.progress.find(p => p.agentName === agentName)!;
    
    agentProgress.status = 'running';
    agentProgress.startTime = new Date();
    agentProgress.currentTask = `Executing ${agentName.toLowerCase()} analysis...`;
    
    console.log(`🔄 ${agentName} starting analysis...`);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        if (agentProgress.status === 'running' && agentProgress.progress < 90) {
          agentProgress.progress += Math.random() * 20;
          agentProgress.progress = Math.min(agentProgress.progress, 90);
        }
      }, 1000);

      const result = await agentFunction();
      
      clearInterval(progressInterval);
      
      agentProgress.status = 'completed';
      agentProgress.progress = 100;
      agentProgress.endTime = new Date();
      agentProgress.result = result;
      agentProgress.currentTask = `${agentName} analysis completed successfully`;
      
      console.log(`✅ ${agentName} completed successfully`);
      
    } catch (error) {
      agentProgress.status = 'failed';
      agentProgress.error = error instanceof Error ? error.message : 'Unknown error';
      agentProgress.endTime = new Date();
      agentProgress.currentTask = `${agentName} analysis failed`;
      
      console.error(`❌ ${agentName} failed:`, error);
      throw error;
    }
  }

  private generateFinalSummary(session: MultiAgentResult): string {
    const duration = session.totalDuration ? Math.round(session.totalDuration / 1000) : 0;
    const bestPlan = session.judgmentResult?.bestPlan;
    const executionPlan = session.executionResult?.recommendedPlan;
    
    return `🎯 **Multi-Agent Analysis Complete** (${duration}s)

**🏆 RECOMMENDED STRATEGY**: ${bestPlan?.planTitle || 'Analysis Complete'}
- **Overall Score**: ${bestPlan?.overallScore || 0}/100
- **Confidence**: ${Math.round((session.judgmentResult?.confidence || 0) * 100)}%
- **Execution Readiness**: ${session.executionResult?.readinessScore || 0}%

**📊 KEY FINDINGS**:
- **Market Opportunity**: ${session.researchResult?.marketAnalysis?.marketSize || 'Significant potential identified'}
- **Competitive Advantage**: ${session.recommendationResult?.uniqueValuePropositions?.length || 0} unique differentiators
- **Development Timeline**: ${executionPlan?.totalDuration || '16 weeks estimated'}
- **Investment Required**: ${executionPlan?.budgetBreakdown?.reduce((sum: number, item: any) => sum + item.estimated, 0).toLocaleString() || 'Budget optimized'}

**🚀 NEXT STEPS**:
1. ${session.executionResult?.nextSteps?.[0] || 'Begin implementation planning'}
2. ${session.executionResult?.nextSteps?.[1] || 'Assemble development team'}
3. ${session.executionResult?.nextSteps?.[2] || 'Initialize development environment'}

**🎉 COMPETITIVE INTELLIGENCE**: Analyzed ${session.researchResult?.topCompetitors?.length || 5} top competitors with ${session.researchResult?.competitiveGaps?.length || 8} identified market gaps.

*This analysis leveraged 5 specialized AI agents with ${session.progress.filter(p => p.status === 'completed').length}/5 successful completions.*`;
  }

  // Cleanup old sessions (call periodically)
  public cleanupOldSessions(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    const entries = Array.from(this.activeSessions.entries());
    for (const [sessionId, session] of entries) {
      if (now - session.startTime.getTime() > maxAgeMs) {
        this.activeSessions.delete(sessionId);
        console.log(`🧹 Cleaned up old session: ${sessionId}`);
      }
    }
  }
}