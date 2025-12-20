import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from "@google/genai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const DEFAULT_OPENAI_MODEL = "gpt-5";

// The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

export interface AIRequest {
  type: 'completion' | 'debugging' | 'optimization' | 'explanation' | 'refactor';
  content: string;
  language?: string;
  context?: string;
  model?: 'auto' | 'openai' | 'anthropic' | 'gemini' | 'xai';
}

export interface AIResponse {
  content: string;
  model: string;
  tokens: number;
  cost: number;
  confidence: number;
}

export class AIModelRouter {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private gemini: GoogleGenAI | null = null;
  private xai: OpenAI | null = null;
  private useMockMode = false;

  constructor() {
    // Check if we should use mock mode (for testing without real API keys)
    this.useMockMode = this.shouldUseMockMode();
    
    if (this.useMockMode) {
      console.log('🤖 AI Router: Using mock mode for testing');
      // Set all models as "available" in mock mode
      this.openai = {} as OpenAI;
      this.anthropic = {} as Anthropic;
      this.gemini = {} as GoogleGenAI;
      this.xai = {} as OpenAI;
    } else {
      // Initialize available models based on real API keys
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      }
      
      if (process.env.ANTHROPIC_API_KEY) {
        this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      }
      
      if (process.env.GEMINI_API_KEY) {
        this.gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      }
      
      if (process.env.XAI_API_KEY) {
        this.xai = new OpenAI({ 
          baseURL: "https://api.x.ai/v1", 
          apiKey: process.env.XAI_API_KEY 
        });
      }
    }
  }

  private shouldUseMockMode(): boolean {
    // Use mock mode if:
    // 1. Explicitly enabled via env var, OR
    // 2. No real API keys are provided (for testing)
    const forceMock = process.env.USE_MOCK_AI === 'true';
    const hasRealKeys = !!(
      process.env.OPENAI_API_KEY || 
      process.env.ANTHROPIC_API_KEY || 
      process.env.GEMINI_API_KEY || 
      process.env.XAI_API_KEY
    );
    
    return forceMock || !hasRealKeys;
  }

  /**
   * Intelligently routes requests to the best model based on task type
   */
  private selectBestModel(request: AIRequest): 'openai' | 'anthropic' | 'gemini' | 'xai' {
    if (request.model && request.model !== 'auto') {
      return request.model as 'openai' | 'anthropic' | 'gemini' | 'xai';
    }

    // Smart routing based on task type and availability
    switch (request.type) {
      case 'completion':
        // OpenAI GPT-5 excels at code completion
        return this.openai ? 'openai' : this.getFirstAvailable();
      
      case 'debugging':
        // Anthropic Claude excels at detailed analysis and debugging
        return this.anthropic ? 'anthropic' : this.getFirstAvailable();
      
      case 'optimization':
        // XAI Grok is good for code optimization
        return this.xai ? 'xai' : this.getFirstAvailable();
      
      case 'explanation':
        // Gemini is excellent for explanations and teaching
        return this.gemini ? 'gemini' : this.getFirstAvailable();
      
      case 'refactor':
        // Anthropic Claude is best for refactoring
        return this.anthropic ? 'anthropic' : this.getFirstAvailable();
      
      default:
        return this.getFirstAvailable();
    }
  }

  private getFirstAvailable(): 'openai' | 'anthropic' | 'gemini' | 'xai' {
    if (this.openai) return 'openai';
    if (this.anthropic) return 'anthropic';
    if (this.gemini) return 'gemini';
    if (this.xai) return 'xai';
    throw new Error('No AI models configured. Please add API keys.');
  }

  private getAvailableModels(): string[] {
    const models: string[] = [];
    if (this.openai) models.push('openai');
    if (this.anthropic) models.push('anthropic');
    if (this.gemini) models.push('gemini');
    if (this.xai) models.push('xai');
    return models;
  }

  /**
   * Process AI request with intelligent routing
   */
  async processRequest(request: AIRequest): Promise<AIResponse> {
    const selectedModel = this.selectBestModel(request);
    const prompt = this.buildPrompt(request);

    try {
      switch (selectedModel) {
        case 'openai':
          return await this.processOpenAI(prompt, request);
        case 'anthropic':
          return await this.processAnthropic(prompt, request);
        case 'gemini':
          return await this.processGemini(prompt, request);
        case 'xai':
          return await this.processXAI(prompt, request);
        default:
          throw new Error(`Model ${selectedModel} not available`);
      }
    } catch (error) {
      // Fallback to any available model
      const availableModels = this.getAvailableModels().filter(m => m !== selectedModel);
      if (availableModels.length > 0) {
        return await this.processRequest({ ...request, model: availableModels[0] as any });
      }
      throw error;
    }
  }

  private buildPrompt(request: AIRequest): string {
    const taskInstructions = {
      completion: "Complete the following code. Provide only the completion, no explanations:",
      debugging: "Analyze this code for bugs and provide fixes with explanations:",
      optimization: "Optimize this code for better performance and readability:",
      explanation: "Explain this code in detail, including what it does and how it works:",
      refactor: "Refactor this code to improve structure and maintainability:"
    };

    let prompt = taskInstructions[request.type] + "\n\n";
    
    if (request.language) {
      prompt += `Language: ${request.language}\n\n`;
    }
    
    if (request.context) {
      prompt += `Context: ${request.context}\n\n`;
    }
    
    prompt += `Code:\n${request.content}`;
    
    return prompt;
  }

  private async processOpenAI(prompt: string, request: AIRequest): Promise<AIResponse> {
    if (!this.openai) throw new Error('OpenAI not configured');
    
    if (this.useMockMode) {
      return this.generateMockResponse(request, 'openai-gpt5', 0.95);
    }
    
    const response = await this.openai.chat.completions.create({
      model: DEFAULT_OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: request.type === 'completion' ? 500 : 1500,
      temperature: request.type === 'completion' ? 0.1 : 0.3,
    });

    const content = response.choices[0].message.content || '';
    const tokens = response.usage?.total_tokens || 0;
    
    return {
      content,
      model: 'openai-gpt5',
      tokens,
      cost: this.calculateCost(tokens, 'openai'),
      confidence: 0.95
    };
  }

  private async processAnthropic(prompt: string, request: AIRequest): Promise<AIResponse> {
    if (!this.anthropic) throw new Error('Anthropic not configured');
    
    if (this.useMockMode) {
      return this.generateMockResponse(request, 'anthropic-claude-sonnet-4', 0.93);
    }
    
    const response = await this.anthropic.messages.create({
      model: DEFAULT_ANTHROPIC_MODEL,
      max_tokens: request.type === 'completion' ? 500 : 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    const tokens = response.usage.input_tokens + response.usage.output_tokens;
    
    return {
      content,
      model: 'anthropic-claude-sonnet-4',
      tokens,
      cost: this.calculateCost(tokens, 'anthropic'),
      confidence: 0.93
    };
  }

  private async processGemini(prompt: string, request: AIRequest): Promise<AIResponse> {
    if (!this.gemini) throw new Error('Gemini not configured');
    
    if (this.useMockMode) {
      return this.generateMockResponse(request, 'gemini-2.5-pro', 0.90);
    }
    
    const response = await this.gemini.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    const content = response.text || '';
    const tokens = Math.ceil(content.length / 4); // Rough estimation
    
    return {
      content,
      model: 'gemini-2.5-pro',
      tokens,
      cost: this.calculateCost(tokens, 'gemini'),
      confidence: 0.90
    };
  }

  private async processXAI(prompt: string, request: AIRequest): Promise<AIResponse> {
    if (!this.xai) throw new Error('XAI not configured');
    
    if (this.useMockMode) {
      return this.generateMockResponse(request, 'xai-grok-2', 0.88);
    }
    
    const response = await this.xai.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      max_tokens: request.type === 'completion' ? 500 : 1500,
      temperature: request.type === 'completion' ? 0.1 : 0.3,
    });

    const content = response.choices[0].message.content || '';
    const tokens = response.usage?.total_tokens || 0;
    
    return {
      content,
      model: 'xai-grok-2',
      tokens,
      cost: this.calculateCost(tokens, 'xai'),
      confidence: 0.88
    };
  }

  private calculateCost(tokens: number, model: string): number {
    // Effort-based pricing - more complex tasks cost more
    const baseCosts = {
      openai: 0.00015,    // $0.15 per 1K tokens
      anthropic: 0.00012, // $0.12 per 1K tokens  
      gemini: 0.0001,     // $0.10 per 1K tokens
      xai: 0.0008         // $0.08 per 1K tokens
    };

    const multipliers = {
      completion: 1.0,
      debugging: 1.5,
      optimization: 2.0,
      explanation: 1.2,
      refactor: 1.8
    };

    const baseCost = (tokens / 1000) * (baseCosts[model as keyof typeof baseCosts] || 0.0001);
    return Number((baseCost * (multipliers.completion || 1.0)).toFixed(6));
  }

  /**
   * Generate realistic mock responses for testing
   */
  private generateMockResponse(request: AIRequest, model: string, confidence: number): AIResponse {
    const mockResponses = {
      completion: this.getMockCompletion(request),
      debugging: this.getMockDebugging(request),
      optimization: this.getMockOptimization(request),
      explanation: this.getMockExplanation(request),
      refactor: this.getMockRefactor(request)
    };

    const content = mockResponses[request.type] || mockResponses.completion;
    const tokens = Math.ceil(content.length / 4);
    
    return {
      content,
      model: `${model}-mock`,
      tokens,
      cost: this.calculateCost(tokens, model.split('-')[0]),
      confidence
    };
  }

  private getMockCompletion(request: AIRequest): string {
    // Check if this is a project generation request
    if (request.content.includes('Generate a complete project structure')) {
      const description = request.content.match(/for: "([^"]+)"/)?.[1] || 'web application';
      
      // Generate appropriate project structure
      const projectData = {
        name: description.toLowerCase().includes('ecommerce') ? 'ecommerce-store' :
              description.toLowerCase().includes('blog') ? 'blog-platform' :
              description.toLowerCase().includes('trading') ? 'trading-dashboard' :
              'modern-web-app',
        stack: description.toLowerCase().includes('trading') ? 
               ['react', 'typescript', 'recharts', 'websockets', 'nodejs'] :
               ['react', 'typescript', 'tailwindcss', 'vite'],
        files: {
          'src/App.tsx': 'import React from "react"; export default function App() { return <div>Modern App</div>; }',
          'package.json': '{"name": "project", "version": "1.0.0", "dependencies": {"react": "^18.0.0"}}'
        },
        features: description.toLowerCase().includes('trading') ? 
                  ['real-time data', 'charts', 'portfolio tracking', 'alerts'] :
                  ['responsive design', 'modern ui', 'typescript support']
      };
      
      return JSON.stringify(projectData, null, 2);
    }
    
    // Regular code completion
    return 'function handleSubmit(event) {\n  event.preventDefault();\n  console.log("Form submitted");\n}';
  }

  private getMockDebugging(request: AIRequest): string {
    return `I found several issues in your code:

1. **Potential null reference error**: Line 15 - \`user.name\` could be null
   Fix: Add null check: \`user?.name || 'Anonymous'\`

2. **Missing error handling**: The async function lacks try-catch
   Fix: Wrap in try-catch block for proper error handling

3. **Memory leak**: Event listener not cleaned up in useEffect
   Fix: Return cleanup function in useEffect

Here's the corrected version:
\`\`\`javascript
useEffect(() => {
  const controller = new AbortController();
  
  async function fetchData() {
    try {
      const response = await fetch('/api/data', {
        signal: controller.signal
      });
      const data = await response.json();
      setData(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Fetch error:', error);
      }
    }
  }
  
  fetchData();
  
  return () => controller.abort();
}, []);
\`\`\``;
  }

  private getMockOptimization(request: AIRequest): string {
    return `Here are several optimizations for your code:

**Performance Improvements:**
1. **Memoization**: Use \`useMemo\` for expensive calculations
2. **Virtual scrolling**: For long lists, implement virtualization
3. **Lazy loading**: Split code with \`React.lazy\` and \`Suspense\`

**Optimized version:**
\`\`\`javascript
import { useMemo, useCallback } from 'react';

const OptimizedComponent = ({ items, onSelect }) => {
  const sortedItems = useMemo(() => 
    items.sort((a, b) => a.priority - b.priority),
    [items]
  );
  
  const handleSelect = useCallback((id) => {
    onSelect(id);
  }, [onSelect]);

  return (
    <div>
      {sortedItems.map(item => (
        <ItemComponent 
          key={item.id}
          item={item}
          onClick={handleSelect}
        />
      ))}
    </div>
  );
};
\`\`\`

**Benefits:**
- 60% faster rendering with memoization
- Reduced memory usage by 40%
- Better user experience with optimized re-renders`;
  }

  private getMockExplanation(request: AIRequest): string {
    return `**Code Explanation:**

This code implements a React component with the following functionality:

**Purpose:** Creates a dynamic user interface that manages state and handles user interactions.

**Key Components:**
1. **State Management**: Uses \`useState\` to track component state
2. **Event Handling**: Processes user interactions with callback functions
3. **Lifecycle**: Utilizes \`useEffect\` for side effects and cleanup

**How it works:**
1. Component initializes with default state values
2. User interactions trigger event handlers
3. State updates cause re-renders with new data
4. Side effects are managed through useEffect hooks

**Best Practices Demonstrated:**
- Proper state management patterns
- Clean separation of concerns
- Effective use of React hooks
- Error boundary implementation

This pattern is commonly used in modern React applications for building interactive user interfaces.`;
  }

  private getMockRefactor(request: AIRequest): string {
    return `**Refactored Code Structure:**

Here's an improved version with better organization and maintainability:

\`\`\`javascript
// Custom hook for business logic
const useUserData = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { users, loading, fetchUsers };
};

// Refactored component
const UserList = () => {
  const { users, loading, fetchUsers } = useUserData();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) return <LoadingSpinner />;
  
  return (
    <UserGrid users={users} />
  );
};
\`\`\`

**Improvements Made:**
1. **Separation of Concerns**: Business logic moved to custom hook
2. **Reusability**: Hook can be used in other components  
3. **Testability**: Easier to unit test isolated functions
4. **Maintainability**: Cleaner, more organized code structure
5. **Performance**: Better optimization opportunities`;
  }

  /**
   * Get model capabilities and status
   */
  getModelStatus() {
    return {
      available: this.getAvailableModels(),
      total: 4,
      models: {
        openai: {
          available: !!this.openai,
          model: DEFAULT_OPENAI_MODEL,
          strengths: ['Code completion', 'General programming', 'Quick responses']
        },
        anthropic: {
          available: !!this.anthropic,
          model: DEFAULT_ANTHROPIC_MODEL,
          strengths: ['Code analysis', 'Debugging', 'Detailed explanations']
        },
        gemini: {
          available: !!this.gemini,
          model: 'gemini-2.5-pro',
          strengths: ['Teaching', 'Documentation', 'Multi-modal analysis']
        },
        xai: {
          available: !!this.xai,
          model: 'grok-2-1212',
          strengths: ['Optimization', 'Performance analysis', 'Creative solutions']
        }
      }
    };
  }
}

export const aiRouter = new AIModelRouter();