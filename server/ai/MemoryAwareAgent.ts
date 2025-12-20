import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { AgentMemoryContext } from '../memory/PersistentMemorySystem';

interface AIResponse {
  content: string;
  metadata?: any;
  contextUpdates?: any;
  projectData?: any;
  actions?: string[];
}

interface AgentProfile {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  specialties: string[];
  preferredModel: 'openai' | 'anthropic' | 'gemini';
}

export class MemoryAwareAgent {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private profiles: Map<string, AgentProfile> = new Map();

  constructor() {
    // Initialize AI clients
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }

    // Initialize agent profiles
    this.initializeAgentProfiles();
  }

  private initializeAgentProfiles() {
    // Full-stack Development Agent
    this.profiles.set('fullstack-generalist', {
      id: 'fullstack-generalist',
      name: 'Full-Stack Developer',
      description: 'Expert in React, Node.js, databases, and deployment',
      systemPrompt: `You are an expert full-stack developer with persistent memory. You remember:
- Previous conversations and user preferences
- Project architecture decisions you've helped make
- User's coding style and experience level
- Past problems solved and solutions implemented

Key behaviors:
1. ALWAYS reference previous context when available
2. Build on past decisions rather than starting over
3. Remember user's preferred frameworks and patterns
4. Maintain project continuity across sessions
5. Provide actionable, specific code solutions

When helping users:
- Reference their previous work: "Based on our earlier discussion about..."
- Build incrementally: "Continuing from the API we built..."
- Adapt to their skill level: "Since you're comfortable with React..."
- Remember their preferences: "Using your preferred PostgreSQL setup..."`,
      specialties: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Deployment'],
      preferredModel: 'openai'
    });

    // Frontend Specialist Agent  
    this.profiles.set('frontend-specialist', {
      id: 'frontend-specialist',
      name: 'Frontend Specialist',
      description: 'Expert in React, UI/UX, and modern frontend development',
      systemPrompt: `You are a frontend development expert with perfect memory. You remember:
- UI/UX preferences and design decisions
- Component architectures you've recommended
- Styling approaches and theme preferences
- User's frontend skill progression

Always reference previous design decisions and build upon established patterns.
Focus on creating beautiful, accessible, performant user interfaces.`,
      specialties: ['React', 'TypeScript', 'CSS', 'UI/UX', 'Performance'],
      preferredModel: 'anthropic'
    });

    // Backend Specialist Agent
    this.profiles.set('backend-specialist', {
      id: 'backend-specialist', 
      name: 'Backend Specialist',
      description: 'Expert in APIs, databases, and server architecture',
      systemPrompt: `You are a backend development expert with comprehensive memory. You remember:
- API architectures and database schemas you've designed
- Performance optimizations implemented
- Security measures discussed and implemented
- Deployment strategies and infrastructure decisions

Build scalable, secure, maintainable backend systems while referencing past architectural decisions.`,
      specialties: ['Node.js', 'PostgreSQL', 'APIs', 'Security', 'Scalability'],
      preferredModel: 'openai'
    });

    // DevOps & Deployment Agent
    this.profiles.set('devops-specialist', {
      id: 'devops-specialist',
      name: 'DevOps Specialist', 
      description: 'Expert in deployment, scaling, and infrastructure',
      systemPrompt: `You are a DevOps expert with persistent memory of infrastructure decisions. You remember:
- Deployment configurations and infrastructure choices
- Scaling requirements and performance targets
- Security configurations and compliance needs
- Monitoring and alerting setups

Focus on reliable, scalable, secure deployments while building on established infrastructure patterns.`,
      specialties: ['Azure', 'Docker', 'CI/CD', 'Monitoring', 'Security'],
      preferredModel: 'anthropic'
    });
  }

  async processMessage(
    _sessionId: string, 
    message: string, 
    context: AgentMemoryContext,
    _projectId?: string
  ): Promise<AIResponse> {
    try {
      // Get agent profile
      const profile = this.profiles.get(context.agentId) || this.profiles.get('fullstack-generalist')!;
      
      // Build enhanced context for AI
      const enhancedContext = await this.buildEnhancedContext(context, projectId);
      
      // Generate AI response based on profile
      let aiResponse: AIResponse;
      
      if (profile.preferredModel === 'anthropic' && this.anthropic) {
        aiResponse = await this.generateAnthropicResponse(message, enhancedContext, profile);
      } else if (this.openai) {
        aiResponse = await this.generateOpenAIResponse(message, enhancedContext, profile);
      } else {
        // Fallback to intelligent template-based responses
        aiResponse = await this.generateIntelligentFallback(message, enhancedContext, profile);
      }

      // Analyze and extract context updates
      const contextAnalysis = this.analyzeConversationContext(message, aiResponse.content, context);
      aiResponse.contextUpdates = contextAnalysis;

      return aiResponse;

    } catch (error) {
      console.error('Memory-aware agent processing error:', error);
      return this.generateErrorResponse(message, context);
    }
  }

  private async buildEnhancedContext(context: AgentMemoryContext, _projectId?: string): Promise<string> {
    let contextStr = '';

    // Add conversation history summary
    if (context.conversationContext?.history?.length > 0) {
      contextStr += '## Previous Conversation Summary\n';
      const recentMessages = context.conversationContext.history.slice(-10);
      recentMessages.forEach((msg: any) => {
        contextStr += `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content.substring(0, 200)}\n`;
      });
      contextStr += '\n';
    }

    // Add user preferences
    if (context.userPreferences) {
      contextStr += '## User Preferences\n';
      contextStr += `- Experience Level: ${context.userPreferences.experienceLevel || 'Not specified'}\n`;
      contextStr += `- Preferred Communication: ${context.userPreferences.communicationStyle || 'Professional'}\n`;
      if (context.userPreferences.favoriteFrameworks) {
        contextStr += `- Favorite Technologies: ${JSON.stringify(context.userPreferences.favoriteFrameworks)}\n`;
      }
      contextStr += '\n';
    }

    // Add project context
    if (context.projectContext) {
      contextStr += '## Current Project Context\n';
      contextStr += `- Project: ${context.projectContext.name || 'Unnamed Project'}\n`;
      contextStr += `- Phase: ${context.projectContext.developmentPhase || 'Planning'}\n`;
      if (context.projectContext.architecture) {
        contextStr += `- Architecture: ${JSON.stringify(context.projectContext.architecture)}\n`;
      }
      if (context.projectContext.requirements) {
        contextStr += `- Requirements: ${JSON.stringify(context.projectContext.requirements)}\n`;
      }
      contextStr += '\n';
    }

    // Add work history patterns
    if (context.workHistory) {
      contextStr += '## Work History Patterns\n';
      contextStr += `- Recent Focus: ${context.workHistory.recentFocus || 'General development'}\n`;
      contextStr += `- Common Challenges: ${context.workHistory.commonChallenges || 'Various'}\n`;
      contextStr += '\n';
    }

    return contextStr;
  }

  private async generateOpenAIResponse(
    message: string, 
    context: string, 
    profile: AgentProfile
  ): Promise<AIResponse> {
    if (!this.openai) throw new Error('OpenAI not configured');

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4', // Use gpt-4 for better context understanding
      messages: [
        {
          role: 'system',
          content: `${profile.systemPrompt}\n\n## Current Context:\n${context}\n\nImportant: Reference previous context and maintain continuity in your responses.`
        },
        {
          role: 'user', 
          content: message
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content || '';
    
    return {
      content,
      metadata: {
        model: 'gpt-4',
        agent: profile.id,
        tokensUsed: completion.usage?.total_tokens,
        memoryEnabled: true
      }
    };
  }

  private async generateAnthropicResponse(
    message: string,
    context: string, 
    profile: AgentProfile
  ): Promise<AIResponse> {
    if (!this.anthropic) throw new Error('Anthropic not configured');

    const completion = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: `${profile.systemPrompt}\n\n## Current Context:\n${context}\n\nImportant: Reference previous context and maintain continuity in your responses.`,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    });

    const content = completion.content[0].type === 'text' ? completion.content[0].text : '';

    return {
      content,
      metadata: {
        model: 'claude-3-5-sonnet',
        agent: profile.id,
        tokensUsed: completion.usage.input_tokens + completion.usage.output_tokens,
        memoryEnabled: true
      }
    };
  }

  private async generateIntelligentFallback(
    message: string,
    context: string,
    profile: AgentProfile
  ): Promise<AIResponse> {
    // Intelligent template-based responses when AI APIs are unavailable
    const lowerMessage = message.toLowerCase();
    
    // Analyze context for personalization
    const hasHistory = context.includes('Previous Conversation');
    const hasProject = context.includes('Current Project');
    const hasPreferences = context.includes('User Preferences');
    
    let response = '';
    let contextUpdates: any = {};
    
    // Project creation requests
    if (lowerMessage.includes('build') || lowerMessage.includes('create') || lowerMessage.includes('make')) {
      if (hasHistory) {
        response = `I remember our previous discussions! Based on our conversation history and your preferences, I can help you build that. 

Since I have context from our past work together, I can:
- Continue with the patterns we've established
- Use the technologies you prefer
- Build upon previous architectural decisions

What specific aspect would you like to focus on first? I'll make sure it aligns with everything we've discussed before.`;
      } else {
        response = `I'd love to help you build that! As your memory-aware assistant, I'll remember all our decisions and preferences throughout this project.

Let me gather some context:
- What type of application are you thinking about?
- Any preferred technologies or frameworks?
- What's the main purpose or functionality?

I'll store all this information so we can have seamless conversations even if the system restarts.`;
      }
      
      contextUpdates = { 
        phase: 'discovery', 
        intent: 'project_creation',
        timestamp: new Date().toISOString()
      };
    }
    // Continue existing project
    else if (hasProject && (lowerMessage.includes('continue') || lowerMessage.includes('next'))) {
      response = `Perfect! I can see we're working on your project. Based on our previous context, I remember:

${context.includes('Architecture') ? '- The architectural decisions we made' : ''}
${context.includes('Requirements') ? '- Your project requirements' : ''}
${context.includes('Phase') ? '- Where we left off in development' : ''}

Let's continue building! What aspect would you like to work on next? I have full context of our project so we can pick up exactly where we left off.`;
      
      contextUpdates = { 
        phase: 'building',
        continuingWork: true
      };
    }
    // General assistance
    else {
      const personalizedGreeting = hasPreferences ? 
        `I remember your preferences and can tailor my assistance accordingly.` :
        `I'll learn your preferences as we work together.`;
        
      response = `I'm your memory-aware development assistant! ${personalizedGreeting}

${hasHistory ? 'Based on our previous conversations, ' : ''}How can I help you today? I can assist with:

- Building full-stack applications
- Architecture and design decisions  
- Code implementation and debugging
- Deployment and DevOps
- Database design and optimization

Everything we discuss is automatically saved, so I'll always remember our context and decisions.`;
    }

    return {
      content: response,
      metadata: {
        model: 'intelligent-fallback',
        agent: profile.id,
        memoryEnabled: true,
        fallbackUsed: true
      },
      contextUpdates
    };
  }

  private analyzeConversationContext(userMessage: string, _aiResponse: string, _currentContext: AgentMemoryContext): any {
    const lowerMessage = userMessage.toLowerCase();
    const updates: any = {};
    
    // Determine conversation phase
    if (lowerMessage.includes('build') || lowerMessage.includes('create')) {
      updates.phase = 'discovery';
    } else if (lowerMessage.includes('continue') || lowerMessage.includes('next')) {
      updates.phase = 'building';
    } else if (lowerMessage.includes('deploy') || lowerMessage.includes('launch')) {
      updates.phase = 'deployment';
    }
    
    // Extract project type
    if (lowerMessage.includes('react') || lowerMessage.includes('frontend')) {
      updates.projectType = 'frontend';
    } else if (lowerMessage.includes('api') || lowerMessage.includes('backend')) {
      updates.projectType = 'backend';
    } else if (lowerMessage.includes('full stack') || lowerMessage.includes('app')) {
      updates.projectType = 'fullstack';
    }
    
    // Extract technologies mentioned
    const technologies = [];
    if (lowerMessage.includes('react')) technologies.push('React');
    if (lowerMessage.includes('node')) technologies.push('Node.js');
    if (lowerMessage.includes('postgres')) technologies.push('PostgreSQL');
    if (lowerMessage.includes('typescript')) technologies.push('TypeScript');
    
    if (technologies.length > 0) {
      updates.mentionedTechnologies = technologies;
    }
    
    // Track user experience indicators
    if (lowerMessage.includes('beginner') || lowerMessage.includes('new to')) {
      updates.experienceLevel = 'beginner';
    } else if (lowerMessage.includes('advanced') || lowerMessage.includes('expert')) {
      updates.experienceLevel = 'advanced';
    }
    
    updates.lastInteraction = new Date().toISOString();
    
    return updates;
  }

  private generateErrorResponse(_message: string, context: AgentMemoryContext): AIResponse {
    const hasMemory = context.conversationContext?.history?.length > 0;
    
    return {
      content: `I apologize, but I'm having trouble processing your request right now. However, ${hasMemory ? 'I still remember our previous conversation and' : ''} your message has been saved to my persistent memory.

When my AI processing is restored, I'll be able to:
- Reference everything we've discussed
- Continue with full context
- Pick up exactly where we left off

Your data and conversation history are safe and will be available in all future interactions.`,
      metadata: {
        model: 'error-fallback',
        memoryEnabled: true,
        error: true
      }
    };
  }

  getAgentProfiles(): AgentProfile[] {
    return Array.from(this.profiles.values());
  }

  getAgentProfile(agentId: string): AgentProfile | undefined {
    return this.profiles.get(agentId);
  }
}

// Export singleton instance
export const memoryAwareAgent = new MemoryAwareAgent();