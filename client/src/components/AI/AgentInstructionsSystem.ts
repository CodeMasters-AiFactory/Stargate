// AI Agent System Instructions Implementation for Stargate Platform

export interface AgentPersonality {
  id: string;
  name: string;
  role: string;
  greeting: string;
  questionPatterns: string[];
  communicationStyle: 'friendly' | 'professional' | 'technical' | 'casual';
  expertise: string[];
}

export interface ConversationContext {
  projectType?: string;
  userExperienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferences: {
    language?: string;
    framework?: string;
    communicationDetail?: 'high' | 'medium' | 'low';
    updateFrequency?: 'every_step' | 'major_milestones' | 'on_request';
  };
  currentPhase: 'greeting' | 'discovery' | 'planning' | 'building' | 'reviewing';
  history: ConversationMessage[];
}

export interface ConversationMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  context?: any;
}

export class AgentInstructionsSystem {
  private agents: Map<string, AgentPersonality> = new Map();
  private conversationContexts: Map<string, ConversationContext> = new Map();

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents() {
    const agents: AgentPersonality[] = [
      {
        id: 'frontend-specialist',
        name: 'Alex',
        role: 'Frontend Development Specialist',
        greeting:
          "Hi! I'm Alex, your frontend specialist. What kind of user interface would you like to create today?",
        questionPatterns: [
          'What type of website or app are you building?',
          'Who are your target users?',
          'Do you have any design preferences or inspiration?',
          'Should this be responsive for mobile devices?',
          "What's the main functionality users need?",
        ],
        communicationStyle: 'friendly',
        expertise: ['React', 'Vue.js', 'CSS', 'UI/UX', 'Responsive Design'],
      },
      {
        id: 'backend-specialist',
        name: 'Jordan',
        role: 'Backend Development Specialist',
        greeting:
          "Hello! I'm Jordan, and I specialize in backend systems. What kind of server-side functionality do you need?",
        questionPatterns: [
          'What type of data will your application handle?',
          'Do you need user authentication?',
          "What's your expected traffic volume?",
          'Do you need real-time features?',
          'Any specific database requirements?',
        ],
        communicationStyle: 'technical',
        expertise: ['Node.js', 'Python', 'Databases', 'APIs', 'Authentication'],
      },
      {
        id: 'fullstack-generalist',
        name: 'Sam',
        role: 'Full-Stack Development Generalist',
        greeting:
          "Hi there! I'm Sam, and I can help you build complete applications from front to back. What would you like to create?",
        questionPatterns: [
          "What's the main purpose of your application?",
          'What features are most important to you?',
          "Are there any similar apps you'd like to reference?",
          "What's your timeline for this project?",
          'Do you have any technical constraints?',
        ],
        communicationStyle: 'professional',
        expertise: ['Full-Stack', 'System Architecture', 'Project Planning', 'DevOps'],
      },
      {
        id: 'ai-specialist',
        name: 'Maya',
        role: 'AI/ML Integration Specialist',
        greeting:
          "Hi! I'm Maya, your AI specialist. What kind of intelligent features would you like to add to your project?",
        questionPatterns: [
          'What type of AI functionality do you need?',
          'What data will the AI work with?',
          "What's the expected accuracy or performance?",
          'Do you need real-time AI responses?',
          'Any specific AI models you prefer?',
        ],
        communicationStyle: 'technical',
        expertise: [
          'Machine Learning',
          'Natural Language Processing',
          'Computer Vision',
          'AI APIs',
        ],
      },
    ];

    agents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  public getAgent(agentId: string): AgentPersonality | undefined {
    return this.agents.get(agentId);
  }

  public initializeConversation(sessionId: string, _agentId: string): ConversationContext {
    const context: ConversationContext = {
      preferences: {},
      currentPhase: 'greeting',
      history: [],
    };

    this.conversationContexts.set(sessionId, context);
    return context;
  }

  public generateGreeting(agentId: string): string {
    const agent = this.getAgent(agentId);
    if (!agent) return 'Hello! How can I help you today?';

    return agent.greeting;
  }

  public generateDiscoveryQuestions(context: ConversationContext, agentId: string): string[] {
    const agent = this.getAgent(agentId);
    if (!agent) return ['What would you like to build?'];

    // Return relevant questions based on conversation context
    let questions = [...agent.questionPatterns];

    // Filter questions based on what we already know
    if (context.projectType) {
      questions = questions.filter(q => !q.toLowerCase().includes('type'));
    }

    return questions.slice(0, 3); // Return top 3 relevant questions
  }

  public generatePlanProposal(context: ConversationContext, agentId: string): string {
    const agent = this.getAgent(agentId);
    const projectType = context.projectType || 'application';

    let plan = `Great! Based on our conversation, I'll help you create this ${projectType}. Here's my suggested approach:\n\n`;

    // Generate plan based on agent specialty and context
    switch (agent?.role) {
      case 'Frontend Development Specialist':
        plan += `1. **Setup & Structure**: Create the project structure and install necessary dependencies\n`;
        plan += `2. **Core Components**: Build the main UI components and layout\n`;
        plan += `3. **Styling & Responsiveness**: Implement the design and ensure mobile compatibility\n`;
        plan += `4. **Interactivity**: Add user interactions and state management\n`;
        plan += `5. **Testing & Polish**: Test functionality and refine the user experience\n`;
        break;

      case 'Backend Development Specialist':
        plan += `1. **Database Design**: Set up the data models and database structure\n`;
        plan += `2. **API Development**: Create the core API endpoints\n`;
        plan += `3. **Authentication**: Implement user authentication and security\n`;
        plan += `4. **Business Logic**: Add the core functionality and data processing\n`;
        plan += `5. **Testing & Deployment**: Test endpoints and prepare for deployment\n`;
        break;

      default:
        plan += `1. **Project Setup**: Initialize the project with the right tools and structure\n`;
        plan += `2. **Core Features**: Build the main functionality you requested\n`;
        plan += `3. **User Interface**: Create an intuitive and attractive interface\n`;
        plan += `4. **Integration**: Connect all components and test functionality\n`;
        plan += `5. **Polish & Deploy**: Refine details and prepare for launch\n`;
    }

    plan += `\nDoes this plan look good to you? Would you like me to adjust anything before we start?`;

    return plan;
  }

  public generateProgressUpdate(
    context: ConversationContext,
    completedFeature: string,
    nextFeature: string
  ): string {
    const updateLevel = context.preferences.communicationDetail || 'medium';

    let update = `I've just completed **${completedFeature}**. `;

    if (updateLevel === 'high') {
      update += `Here's what I implemented:\n`;
      update += `- Core functionality is working\n`;
      update += `- Added proper error handling\n`;
      update += `- Tested the feature\n\n`;
    }

    update += `Next, I'll work on **${nextFeature}**. `;

    if (context.preferences.updateFrequency === 'every_step') {
      update += `Would you like to review what I've built so far, or should I continue?`;
    } else {
      update += `I'll let you know when it's ready!`;
    }

    return update;
  }

  public generateClarificationRequest(questions: string[]): string {
    let request = `I want to make sure I build exactly what you need. Could you help me understand:\n\n`;

    questions.forEach((question, index) => {
      request += `${index + 1}. ${question}\n`;
    });

    request += `\nThis will help me create the best solution for your use case.`;
    return request;
  }

  public updateConversationContext(sessionId: string, updates: Partial<ConversationContext>): void {
    const context = this.conversationContexts.get(sessionId);
    if (context) {
      Object.assign(context, updates);
      this.conversationContexts.set(sessionId, context);
    }
  }

  public addMessage(sessionId: string, message: ConversationMessage): void {
    const context = this.conversationContexts.get(sessionId);
    if (context) {
      context.history.push(message);
      this.conversationContexts.set(sessionId, context);
    }
  }

  public analyzeUserResponse(
    response: string,
    context: ConversationContext
  ): {
    projectType?: string;
    experienceLevel?: string;
    preferences?: any;
    phase?: string;
  } {
    const analysis: any = {};

    // Simple keyword analysis (in production, use more sophisticated NLP)
    const projectKeywords = {
      website: ['website', 'site', 'web', 'homepage', 'blog'],
      app: ['app', 'application', 'mobile'],
      ecommerce: ['shop', 'store', 'ecommerce', 'buy', 'sell', 'cart'],
      dashboard: ['dashboard', 'admin', 'analytics', 'data'],
      api: ['api', 'backend', 'server', 'database'],
    };

    const experienceKeywords = {
      beginner: ['new', 'learning', 'first time', 'beginner', 'help'],
      advanced: ['experienced', 'professional', 'complex', 'advanced'],
    };

    // Analyze project type
    for (const [type, keywords] of Object.entries(projectKeywords)) {
      if (keywords.some(keyword => response.toLowerCase().includes(keyword))) {
        analysis.projectType = type;
        break;
      }
    }

    // Analyze experience level
    for (const [level, keywords] of Object.entries(experienceKeywords)) {
      if (keywords.some(keyword => response.toLowerCase().includes(keyword))) {
        analysis.experienceLevel = level;
        break;
      }
    }

    // Determine next phase
    if (context.currentPhase === 'greeting' && analysis.projectType) {
      analysis.phase = 'discovery';
    } else if (context.currentPhase === 'discovery') {
      analysis.phase = 'planning';
    }

    return analysis;
  }

  public getConversationContext(sessionId: string): ConversationContext | undefined {
    return this.conversationContexts.get(sessionId);
  }
}

// Export singleton instance
export const agentInstructions = new AgentInstructionsSystem();
