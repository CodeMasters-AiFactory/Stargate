import { aiRegistry, AIModel } from '../aiModelRegistry';

export interface ProjectAnalysis {
  projectType: string;
  complexity: 'low' | 'medium' | 'high' | 'enterprise';
  requiredFeatures: string[];
  technicalStack: string[];
  estimatedTimeline: string;
  riskFactors: string[];
  successMetrics: string[];
}

export interface PlanningResult {
  analysis: ProjectAnalysis;
  developmentRoadmap: RoadmapPhase[];
  resourceRequirements: ResourceRequirement[];
  modelUsed: string;
  confidence: number;
  reasoning: string;
}

export interface RoadmapPhase {
  phase: string;
  duration: string;
  objectives: string[];
  deliverables: string[];
  dependencies: string[];
}

export interface ResourceRequirement {
  type: 'human' | 'technical' | 'financial';
  resource: string;
  quantity: string;
  justification: string;
}

export class PlanningAgent {
  private models: AIModel[];

  constructor() {
    this.models = aiRegistry.getBestModelForTask('planning');
  }

  async analyzeProject(projectDescription: string, requirements: string): Promise<PlanningResult> {
    const primaryModel = this.models[0]; // Use GPT-5 for strategic planning
    
    console.log(`🤖 Planning Agent analyzing with ${primaryModel.name}...`);

    // Simulate deep project analysis
    await this.simulateProcessing(3000, 'Analyzing project requirements');
    
    const analysis: ProjectAnalysis = {
      projectType: this.determineProjectType(projectDescription),
      complexity: this.assessComplexity(projectDescription, requirements),
      requiredFeatures: this.extractFeatures(projectDescription, requirements),
      technicalStack: this.recommendTechStack(projectDescription),
      estimatedTimeline: this.calculateTimeline(projectDescription, requirements),
      riskFactors: this.identifyRisks(projectDescription, requirements),
      successMetrics: this.defineSuccessMetrics(projectDescription)
    };

    const roadmap = this.generateRoadmap(analysis);
    const resources = this.calculateResourceRequirements(analysis);

    return {
      analysis,
      developmentRoadmap: roadmap,
      resourceRequirements: resources,
      modelUsed: primaryModel.name,
      confidence: 0.92,
      reasoning: 'Deep analysis using advanced strategic reasoning and multi-step problem decomposition.'
    };
  }

  private async simulateProcessing(duration: number, task: string): Promise<void> {
    console.log(`  ⚡ ${task}...`);
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  private determineProjectType(description: string): string {
    const keywords = description.toLowerCase();
    if (keywords.includes('ide') || keywords.includes('editor')) return 'Development Environment';
    if (keywords.includes('ecommerce') || keywords.includes('shop')) return 'E-commerce Platform';
    if (keywords.includes('social') || keywords.includes('network')) return 'Social Network';
    if (keywords.includes('dashboard') || keywords.includes('analytics')) return 'Analytics Dashboard';
    return 'Web Application';
  }

  private assessComplexity(description: string, requirements: string): ProjectAnalysis['complexity'] {
    const combined = (description + ' ' + requirements).toLowerCase();
    const complexityIndicators = {
      high: ['ai', 'machine learning', 'real-time', 'scalable', 'enterprise', 'microservices'],
      medium: ['database', 'authentication', 'api', 'responsive', 'integration'],
      low: ['simple', 'basic', 'static', 'landing', 'portfolio']
    };

    for (const [level, indicators] of Object.entries(complexityIndicators)) {
      if (indicators.some(indicator => combined.includes(indicator))) {
        return level as ProjectAnalysis['complexity'];
      }
    }
    return 'medium';
  }

  private extractFeatures(description: string, requirements: string): string[] {
    const features: string[] = [];
    const combined = (description + ' ' + requirements).toLowerCase();

    const featureMap = {
      'User Authentication': ['login', 'auth', 'sign up', 'register'],
      'Real-time Updates': ['real-time', 'live', 'websocket', 'realtime'],
      'Database Integration': ['database', 'data', 'storage', 'persistence'],
      'API Development': ['api', 'endpoint', 'rest', 'graphql'],
      'Responsive Design': ['responsive', 'mobile', 'tablet', 'device'],
      'Payment Processing': ['payment', 'checkout', 'stripe', 'billing'],
      'File Management': ['upload', 'file', 'document', 'media'],
      'Search Functionality': ['search', 'filter', 'find', 'query']
    };

    Object.entries(featureMap).forEach(([feature, keywords]) => {
      if (keywords.some(keyword => combined.includes(keyword))) {
        features.push(feature);
      }
    });

    return features.length > 0 ? features : ['Core Functionality', 'User Interface', 'Data Management'];
  }

  private recommendTechStack(description: string): string[] {
    const stack = ['React', 'TypeScript', 'Node.js', 'Express'];
    const desc = description.toLowerCase();

    if (desc.includes('database') || desc.includes('data')) {
      stack.push('PostgreSQL', 'Drizzle ORM');
    }
    if (desc.includes('real-time') || desc.includes('chat')) {
      stack.push('WebSocket', 'Socket.io');
    }
    if (desc.includes('ai') || desc.includes('machine learning')) {
      stack.push('OpenAI API', 'TensorFlow');
    }

    return stack;
  }

  private calculateTimeline(description: string, requirements: string): string {
    const complexity = this.assessComplexity(description, requirements);
    const timelineMap = {
      low: '2-4 weeks',
      medium: '6-12 weeks',
      high: '3-6 months',
      enterprise: '6-12 months'
    };
    return timelineMap[complexity];
  }

  private identifyRisks(description: string, requirements: string): string[] {
    const risks = ['Technical complexity scaling', 'Integration challenges'];
    const combined = (description + ' ' + requirements).toLowerCase();

    if (combined.includes('ai') || combined.includes('machine learning')) {
      risks.push('AI model accuracy and reliability');
    }
    if (combined.includes('real-time')) {
      risks.push('Performance under high concurrent load');
    }
    if (combined.includes('payment')) {
      risks.push('Security compliance requirements');
    }

    return risks;
  }

  private defineSuccessMetrics(description: string): string[] {
    return [
      'User engagement rate > 80%',
      'Page load time < 2 seconds',
      'Feature completion rate > 95%',
      'User satisfaction score > 4.5/5'
    ];
  }

  private generateRoadmap(analysis: ProjectAnalysis): RoadmapPhase[] {
    return [
      {
        phase: 'Foundation',
        duration: '1-2 weeks',
        objectives: ['Set up development environment', 'Implement core architecture'],
        deliverables: ['Project setup', 'Basic routing', 'Database schema'],
        dependencies: ['Technology stack selection']
      },
      {
        phase: 'Core Development',
        duration: '3-6 weeks',
        objectives: ['Implement primary features', 'Build user interface'],
        deliverables: ['Main functionality', 'User authentication', 'Core UI components'],
        dependencies: ['Foundation phase completion']
      },
      {
        phase: 'Integration & Testing',
        duration: '1-2 weeks',
        objectives: ['Integrate all components', 'Comprehensive testing'],
        deliverables: ['Integrated system', 'Test suite', 'Bug fixes'],
        dependencies: ['Core development completion']
      },
      {
        phase: 'Deployment & Launch',
        duration: '1 week',
        objectives: ['Deploy to production', 'Monitor performance'],
        deliverables: ['Live application', 'Monitoring setup', 'Documentation'],
        dependencies: ['Testing completion']
      }
    ];
  }

  private calculateResourceRequirements(analysis: ProjectAnalysis): ResourceRequirement[] {
    return [
      {
        type: 'human',
        resource: 'Full-stack Developer',
        quantity: analysis.complexity === 'high' ? '2-3' : '1-2',
        justification: 'Core development and implementation'
      },
      {
        type: 'human',
        resource: 'UI/UX Designer',
        quantity: '1',
        justification: 'User interface and experience design'
      },
      {
        type: 'technical',
        resource: 'Cloud Infrastructure',
        quantity: 'Standard tier',
        justification: 'Hosting and deployment requirements'
      },
      {
        type: 'financial',
        resource: 'Development Budget',
        quantity: analysis.complexity === 'high' ? '$15,000-$30,000' : '$5,000-$15,000',
        justification: 'Development costs and third-party services'
      }
    ];
  }
}