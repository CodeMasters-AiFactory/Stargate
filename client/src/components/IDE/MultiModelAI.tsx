import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Brain,
  Code,
  Bug,
  Sparkles,
  RefreshCw,
  CheckCircle,
  Clock,
  DollarSign,
  Zap,
} from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  costPerToken: number;
  maxTokens: number;
  strengths: string[];
}

interface AIResponse {
  id: string;
  requestId: string;
  modelUsed: string;
  response: string;
  confidence: number;
  suggestions?: string[];
  codeChanges?: { file: string; changes: string }[];
  executionTime: number;
  tokensUsed: number;
  cost: number;
}

export function MultiModelAI() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [requestType, setRequestType] = useState<string>('code_generation');
  const [userInput, setUserInput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetchModels();
    fetchSuggestions();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/ai/models');
      const data = await response.json();
      if (data.success) {
        setModels(data.models);
        if (data.models.length > 0) {
          setSelectedModel(data.models[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch AI models:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(
        '/api/ai/suggestions/demo-project-1?code=console.log("hello")&language=javascript'
      );
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleAIRequest = async () => {
    if (!userInput.trim()) return;

    setIsProcessing(true);
    setResponse(null);

    try {
      const requestData = {
        projectId: 'demo-project-1',
        userId: 'demo-user',
        type: requestType,
        context: {
          language,
          code: userInput,
          files: {},
          description: userInput,
        },
        modelPreference: selectedModel,
      };

      const response = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      if (data.success) {
        setResponse(data.response);
      }
    } catch (error) {
      console.error('AI request failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getModelIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return '🤖';
      case 'anthropic':
        return '🧠';
      case 'cohere':
        return '⚡';
      case 'local':
        return '🏠';
      default:
        return '🤖';
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'code_generation':
        return <Code className="w-4 h-4" />;
      case 'debugging':
        return <Bug className="w-4 h-4" />;
      case 'explanation':
        return <Brain className="w-4 h-4" />;
      case 'optimization':
        return <Zap className="w-4 h-4" />;
      case 'refactoring':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="p-4 space-y-6" data-testid="multi-model-ai">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Multi-Model AI Assistant
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose from multiple AI models for optimal results - way better than single-model
          competitors!
        </p>
      </div>

      {/* AI Models */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Available AI Models</CardTitle>
          <CardDescription>
            Stargate's competitive advantage: Multiple specialized models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map(model => (
              <div
                key={model.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedModel === model.id
                    ? 'border-primary bg-primary/5'
                    : 'border hover:border-primary/50'
                }`}
                onClick={() => setSelectedModel(model.id)}
                data-testid={`model-${model.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getModelIcon(model.provider)}</span>
                    <span className="font-medium">{model.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    ${model.costPerToken.toFixed(5)}/token
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {model.strengths.join(' • ')}
                </div>
                <div className="flex flex-wrap gap-1">
                  {model.capabilities.map(capability => (
                    <Badge key={capability} variant="outline" className="text-xs">
                      {capability.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Request Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Make AI Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Request Type</label>
              <Select value={requestType} onValueChange={setRequestType}>
                <SelectTrigger data-testid="select-request-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="code_generation">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Code Generation
                    </div>
                  </SelectItem>
                  <SelectItem value="debugging">
                    <div className="flex items-center gap-2">
                      <Bug className="w-4 h-4" />
                      Debugging
                    </div>
                  </SelectItem>
                  <SelectItem value="explanation">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Code Explanation
                    </div>
                  </SelectItem>
                  <SelectItem value="optimization">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Optimization
                    </div>
                  </SelectItem>
                  <SelectItem value="refactoring">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Refactoring
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Code or Description</label>
            <Textarea
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder="Enter your code or describe what you want to build..."
              className="min-h-[120px]"
              data-testid="textarea-ai-input"
            />
          </div>

          <Button
            onClick={handleAIRequest}
            disabled={isProcessing || !userInput.trim()}
            className="w-full"
            data-testid="button-ai-request"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing with {models.find(m => m.id === selectedModel)?.name}...
              </>
            ) : (
              <>
                {getRequestTypeIcon(requestType)}
                <span className="ml-2">Get AI Assistance</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* AI Response */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                AI Response
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Badge className={getConfidenceColor(response.confidence)}>
                  {(response.confidence * 100).toFixed(0)}% confidence
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {response.executionTime}ms
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="w-3 h-3" />${response.cost.toFixed(4)}
                </div>
              </div>
            </CardTitle>
            <CardDescription>
              Generated by {response.modelUsed} using {response.tokensUsed} tokens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{response.response}</pre>
            </div>

            {response.suggestions && response.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">💡 Suggestions:</h4>
                <ul className="space-y-1">
                  {response.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <Sparkles className="w-3 h-3 text-yellow-500 mt-1" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {response.codeChanges && response.codeChanges.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">📝 Code Changes:</h4>
                {response.codeChanges.map((change, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="font-medium text-sm mb-2">{change.file}</div>
                    <pre className="text-xs bg-muted p-2 rounded">{change.changes}</pre>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contextual Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎯 Smart Suggestions</CardTitle>
            <CardDescription>Real-time contextual recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setUserInput(suggestion)}
                  data-testid={`suggestion-${index}`}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitive Advantage */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="font-semibold text-blue-700 dark:text-blue-300">
                🧠 Stargate AI Advantage
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Unlike Replit's single AI Agent or GitHub's basic Copilot, you get 4+ specialized AI
                models with intelligent task routing for superior results!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
