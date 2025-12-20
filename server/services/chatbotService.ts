/**
 * AI Chatbot Service for Wizard Assistance
 * Provides contextual help, suggestions, and answers about packages/features
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Types for wizard chatbot context
export type PackageId = 'basic' | 'advanced' | 'seo' | 'deluxe' | 'ultra' | 'custom';

export interface PackageConstraints {
  maxPages: number;
  maxServices: number;
  includesCompetitorResearch: boolean;
  includesAdvancedSEO: boolean;
  includesCustomDesign: boolean;
  includesAutomatedMaintenance: boolean;
}

export interface ChecklistState {
  [category: string]: {
    [itemId: string]: boolean;
  };
}

export interface ChatbotMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatbotContext {
  currentStage?: string;
  selectedPackage?: PackageId;
  packageConstraints?: PackageConstraints;
  checklistState?: ChecklistState;
  requirements?: Partial<WebsiteRequirements>;
  conversationHistory?: ChatbotMessage[];
}

export interface ChatbotResponse {
  message: string;
  suggestions?: string[];
  relatedQuestions?: string[];
  error?: string;
}

/**
 * Create OpenAI client
 */
function createOpenAIClient(): OpenAI | null {
  if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
}

/**
 * Create Anthropic client
 */
function createAnthropicClient(): Anthropic | null {
  if (process.env.ANTHROPIC_API_KEY) {
    return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return null;
}

const openai = createOpenAIClient();
const anthropic = createAnthropicClient();
const USE_MOCK = !openai && !anthropic;

/**
 * Build system prompt with context
 */
function buildSystemPrompt(context: ChatbotContext): string {
  let prompt = `You are a helpful AI assistant for the Merlin Website Builder wizard. Your role is to:
- Answer questions about packages, features, and capabilities
- Provide contextual suggestions based on the user's current progress
- Help users understand what they need for their website
- Guide them through the wizard process

Be friendly, concise, and helpful. Focus on actionable advice.

`;

  if (context.currentStage) {
    prompt += `Current Stage: ${context.currentStage}\n`;
  }

  if (context.selectedPackage) {
    const packageNames: Record<PackageId, string> = {
      basic: 'Essential',
      advanced: 'Professional',
      seo: 'SEO Optimized',
      deluxe: 'Deluxe',
      ultra: 'Ultra',
      custom: 'Custom',
    };
    prompt += `Selected Package: ${packageNames[context.selectedPackage] || context.selectedPackage}\n`;
    
    if (context.packageConstraints) {
      prompt += `Package Limits: ${context.packageConstraints.maxPages} pages, ${context.packageConstraints.maxServices} services\n`;
      prompt += `Features: ${context.packageConstraints.includesCompetitorResearch ? 'Competitor Research, ' : ''}${context.packageConstraints.includesAdvancedSEO ? 'Advanced SEO, ' : ''}${context.packageConstraints.includesAutomatedMaintenance ? 'Automated Maintenance' : ''}\n`;
    }
  }

  if (context.checklistState) {
    const checkedItems = Object.values(context.checklistState).reduce(
      (sum, cat) => sum + Object.values(cat).filter(Boolean).length,
      0
    );
    prompt += `Checklist Progress: ${checkedItems} items checked\n`;
  }

  prompt += `\nPackage Information:
- Essential ($29/mo): 1 page, 3 services, basic features
- Professional ($49/mo): 5 pages, 8 services, competitor research
- SEO Optimized ($69/mo): 10 pages, 15 services, advanced SEO
- Deluxe ($99/mo): 20 pages, 25 services, all features + maintenance
- Ultra ($199/mo): 50 pages, 50 services, unlimited features

Available Features:
- Contact forms, booking systems, e-commerce, blogs
- Social media integration, Google Maps, live chat
- SEO optimization, analytics, newsletter signup
- Photo galleries, video integration, custom pages
`;

  return prompt;
}

/**
 * Generate AI response using available models
 */
async function generateAIResponse(
  userMessage: string,
  context: ChatbotContext
): Promise<ChatbotResponse> {
  // Build conversation history
  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
    { role: 'system', content: buildSystemPrompt(context) },
  ];

  // Add conversation history (last 10 messages)
  if (context.conversationHistory) {
    const recentHistory = context.conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });
  }

  // Add current user message
  messages.push({ role: 'user', content: userMessage });

  try {
    // Try Anthropic first (better for conversations)
    if (anthropic) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: messages.filter(m => m.role !== 'system') as any,
        system: buildSystemPrompt(context),
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return {
          message: content.text,
          suggestions: extractSuggestions(content.text),
          relatedQuestions: extractRelatedQuestions(content.text),
        };
      }
    }

    // Fallback to OpenAI
    if (openai) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages as any,
        max_tokens: 1024,
        temperature: 0.7,
      });

      const message = response.choices[0]?.message?.content || '';
      return {
        message,
        suggestions: extractSuggestions(message),
        relatedQuestions: extractRelatedQuestions(message),
      };
    }

    // Mock response for testing
    return generateMockResponse(userMessage, context);
  } catch (error) {
    console.error('[Chatbot Service] AI API error:', error);
    return {
      message: generateMockResponse(userMessage, context).message,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract suggestions from AI response
 */
function extractSuggestions(text: string): string[] {
  const suggestions: string[] = [];
  const suggestionPatterns = [
    /suggest[^:]*:\s*([^\n]+)/gi,
    /you (?:could|should|might|can) (?:try|consider|use|add) ([^\n]+)/gi,
    /recommend ([^\n]+)/gi,
  ];

  suggestionPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        suggestions.push(match[1].trim());
      }
    }
  });

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

/**
 * Extract related questions from AI response
 */
function extractRelatedQuestions(text: string): string[] {
  const questions: string[] = [];
  const questionPattern = /\?/g;
  const sentences = text.split(/[.!?]\s+/);
  
  sentences.forEach(sentence => {
    if (sentence.includes('?') && sentence.length < 100) {
      questions.push(sentence.trim());
    }
  });

  return questions.slice(0, 3); // Limit to 3 questions
}

/**
 * Generate mock response for testing
 */
function generateMockResponse(
  userMessage: string,
  context: ChatbotContext
): ChatbotResponse {
  const lowerMessage = userMessage.toLowerCase();

  // Package questions
  if (lowerMessage.includes('package') || lowerMessage.includes('pricing')) {
    return {
      message: `Based on your needs, I can help you choose the right package. Here's what each package includes:

**Essential ($29/mo)**: Perfect for simple websites with 1 page and 3 services.
**Professional ($49/mo)**: Great for small businesses with up to 5 pages and 8 services.
**SEO Optimized ($69/mo)**: Ideal for businesses focused on search engine visibility.
**Deluxe ($99/mo)**: Comprehensive solution with 20 pages and all features.
**Ultra ($199/mo)**: Unlimited pages and services for large businesses.

What type of website are you building? I can recommend the best package for you.`,
      suggestions: [
        'Tell me about your business size',
        'Describe your website goals',
      ],
      relatedQuestions: [
        'What features do you need?',
        'How many pages do you want?',
      ],
    };
  }

  // Feature questions
  if (lowerMessage.includes('feature') || lowerMessage.includes('can i') || lowerMessage.includes('do you support')) {
    return {
      message: `Yes! The Merlin Website Builder supports many features:

- Contact forms and booking systems
- E-commerce with shopping cart
- Blog and content management
- Social media integration
- Google Maps integration
- Live chat support
- Newsletter signup
- Photo galleries
- Video integration
- SEO optimization

${context.selectedPackage ? `Your ${context.selectedPackage} package includes all these features!` : 'Which features are you interested in?'}`,
      suggestions: [
        'Check the features you need in the checklist',
        'Select a package that includes your desired features',
      ],
    };
  }

  // Default response
  return {
    message: `I'm here to help you with the Merlin Website Builder! I can answer questions about:

- Package selection and pricing
- Available features and capabilities
- How to use the wizard
- Best practices for your website

What would you like to know?`,
    suggestions: [
      'Ask about packages',
      'Ask about features',
      'Get help with the checklist',
    ],
  };
}

/**
 * Main chatbot service function
 */
export async function processChatbotMessage(
  userMessage: string,
  context: ChatbotContext = {}
): Promise<ChatbotResponse> {
  if (!userMessage || userMessage.trim().length === 0) {
    return {
      message: "Please ask me a question! I'm here to help with the Merlin Website Builder.",
    };
  }

  return generateAIResponse(userMessage, context);
}

/**
 * Generate contextual suggestions based on current state
 */
export function generateContextualSuggestions(context: ChatbotContext): string[] {
  const suggestions: string[] = [];

  if (!context.selectedPackage) {
    suggestions.push('Which package is best for my business?');
    suggestions.push('What are the differences between packages?');
  }

  if (context.currentStage === 'requirements' || context.currentStage === 'package-select') {
    suggestions.push('What features are included in my package?');
    suggestions.push('How do I know what pages I need?');
    suggestions.push('Can I add more services later?');
  }

  if (context.checklistState) {
    const checkedItems = Object.values(context.checklistState).reduce(
      (sum, cat) => sum + Object.values(cat).filter(Boolean).length,
      0
    );
    if (checkedItems === 0) {
      suggestions.push('Where should I start with the checklist?');
      suggestions.push('What are the most important items to check?');
    }
  }

  return suggestions.length > 0 ? suggestions : [
    'How do I get started?',
    'What happens after I complete the checklist?',
    'Can I change my package later?',
  ];
}

