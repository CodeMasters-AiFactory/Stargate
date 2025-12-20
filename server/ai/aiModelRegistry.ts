export interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: 'language' | 'multimodal' | 'code' | 'research' | 'creative' | 'analytical';
  specialty: string;
  mockApiKey: string;
  strengths: string[];
  capabilities: string[];
  costTier: 'low' | 'medium' | 'high' | 'premium';
}

export const TOP_AI_MODELS: AIModel[] = [
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'OpenAI',
    type: 'language',
    specialty: 'Advanced reasoning and strategic planning',
    mockApiKey: 'sk-mock-openai-gpt5-key-123',
    strengths: ['Strategic thinking', 'Complex problem solving', 'Multi-step reasoning'],
    capabilities: ['text generation', 'analysis', 'planning', 'code generation'],
    costTier: 'premium'
  },
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    type: 'analytical',
    specialty: 'Analytical decision making and ethical reasoning',
    mockApiKey: 'claude-mock-sonnet4-analytical-key-456',
    strengths: ['Analytical thinking', 'Ethical reasoning', 'Detailed analysis'],
    capabilities: ['text analysis', 'decision making', 'ethical evaluation'],
    costTier: 'premium'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    type: 'multimodal',
    specialty: 'Creative solutions and innovative recommendations',
    mockApiKey: 'gemini-mock-pro-creative-key-789',
    strengths: ['Creative thinking', 'Multimodal processing', 'Innovation'],
    capabilities: ['text', 'image', 'video', 'creative generation'],
    costTier: 'high'
  },
  {
    id: 'grok-2',
    name: 'Grok-2',
    provider: 'XAI',
    type: 'language',
    specialty: 'Execution planning and real-time analysis',
    mockApiKey: 'grok-mock-execution-key-101',
    strengths: ['Real-time analysis', 'Execution planning', 'Direct responses'],
    capabilities: ['planning', 'execution', 'real-time processing'],
    costTier: 'high'
  },
  {
    id: 'perplexity-pro',
    name: 'Perplexity Pro',
    provider: 'Perplexity',
    type: 'research',
    specialty: 'Internet research and competitive intelligence',
    mockApiKey: 'perplexity-mock-research-key-202',
    strengths: ['Internet research', 'Real-time data', 'Source citation'],
    capabilities: ['web search', 'research', 'fact checking', 'competitive analysis'],
    costTier: 'medium'
  },
  {
    id: 'command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    type: 'language',
    specialty: 'Enterprise RAG and business intelligence',
    mockApiKey: 'cohere-mock-command-key-303',
    strengths: ['Business intelligence', 'RAG processing', 'Enterprise focus'],
    capabilities: ['business analysis', 'enterprise solutions', 'RAG'],
    costTier: 'high'
  },
  {
    id: 'llama-3',
    name: 'Llama 3',
    provider: 'Meta',
    type: 'language',
    specialty: 'Open-source flexibility and customization',
    mockApiKey: 'llama-mock-open-key-404',
    strengths: ['Open source', 'Customizable', 'Cost effective'],
    capabilities: ['text generation', 'customization', 'fine-tuning'],
    costTier: 'low'
  },
  {
    id: 'copilot-pro',
    name: 'Microsoft Copilot Pro',
    provider: 'Microsoft',
    type: 'code',
    specialty: 'Code generation and development assistance',
    mockApiKey: 'msft-mock-copilot-key-505',
    strengths: ['Code generation', 'Development tools', 'Integration'],
    capabilities: ['code completion', 'debugging', 'development'],
    costTier: 'medium'
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    type: 'language',
    specialty: 'European AI with multilingual expertise',
    mockApiKey: 'mistral-mock-large-key-707',
    strengths: ['Multilingual', 'European focus', 'Privacy'],
    capabilities: ['multilingual processing', 'privacy-focused', 'European compliance'],
    costTier: 'medium'
  },
  {
    id: 'nvidia-nim',
    name: 'NVIDIA NIM',
    provider: 'NVIDIA',
    type: 'multimodal',
    specialty: 'High-performance GPU-accelerated AI',
    mockApiKey: 'nvidia-mock-nim-key-777',
    strengths: ['GPU acceleration', 'High performance', 'Edge deployment'],
    capabilities: ['gpu acceleration', 'high performance', 'edge deployment'],
    costTier: 'premium'
  }
];

export class AIModelRegistry {
  private models: Map<string, AIModel> = new Map();

  constructor() {
    TOP_AI_MODELS.forEach(model => {
      this.models.set(model.id, model);
    });
  }

  getModel(id: string): AIModel | undefined {
    return this.models.get(id);
  }

  getModelsByType(type: AIModel['type']): AIModel[] {
    return Array.from(this.models.values()).filter(model => model.type === type);
  }

  getModelsByProvider(provider: string): AIModel[] {
    return Array.from(this.models.values()).filter(model => model.provider === provider);
  }

  getAllModels(): AIModel[] {
    return Array.from(this.models.values());
  }

  getBestModelForTask(task: 'planning' | 'research' | 'recommendation' | 'judgment' | 'execution'): AIModel[] {
    const taskToTypes: Record<string, AIModel['type'][]> = {
      planning: ['language', 'analytical'],
      research: ['research', 'multimodal'],
      recommendation: ['creative', 'multimodal', 'language'],
      judgment: ['analytical', 'language'],
      execution: ['code', 'language']
    };

    const relevantTypes = taskToTypes[task] || ['language'];
    return Array.from(this.models.values())
      .filter(model => relevantTypes.includes(model.type))
      .sort((a, b) => {
        const tierOrder = { premium: 4, high: 3, medium: 2, low: 1 };
        return tierOrder[b.costTier] - tierOrder[a.costTier];
      });
  }
}

export const aiRegistry = new AIModelRegistry();