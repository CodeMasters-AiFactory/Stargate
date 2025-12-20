import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Zap,
  Bug,
  Gauge,
  BookOpen,
  RefreshCw,
  Sparkles,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AIRequest {
  type: 'completion' | 'debugging' | 'optimization' | 'explanation' | 'refactor';
  content: string;
  language?: string;
  context?: string;
  model?: 'auto' | 'openai' | 'anthropic' | 'gemini' | 'xai';
}

interface AIResponse {
  content: string;
  model: string;
  tokens: number;
  cost: number;
  confidence: number;
}

const AI_TASK_TYPES = [
  {
    value: 'completion',
    label: 'Code Completion',
    icon: Zap,
    description: 'Complete code snippets and functions',
    color: 'text-blue-500',
  },
  {
    value: 'debugging',
    label: 'Debug & Fix',
    icon: Bug,
    description: 'Find and fix bugs in your code',
    color: 'text-red-500',
  },
  {
    value: 'optimization',
    label: 'Optimize Code',
    icon: Gauge,
    description: 'Improve performance and efficiency',
    color: 'text-green-500',
  },
  {
    value: 'explanation',
    label: 'Explain Code',
    icon: BookOpen,
    description: 'Understand how code works',
    color: 'text-purple-500',
  },
  {
    value: 'refactor',
    label: 'Refactor',
    icon: RefreshCw,
    description: 'Improve code structure and readability',
    color: 'text-orange-500',
  },
];

const PROGRAMMING_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'Go',
  'Rust',
  'PHP',
  'Ruby',
  'Swift',
  'Kotlin',
  'HTML',
  'CSS',
  'SQL',
  'Shell',
];

export function AIWorkspace() {
  const [selectedTask, setSelectedTask] = useState<string>('completion');
  const [selectedModel, setSelectedModel] = useState<string>('auto');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [codeInput, setCodeInput] = useState<string>('');
  const [contextInput, setContextInput] = useState<string>('');
  const [aiHistory, setAiHistory] = useState<
    (AIRequest & { response?: AIResponse; timestamp: Date })[]
  >([]);
  const { toast } = useToast();

  // Fetch AI model status
  const { data: modelStatus } = useQuery({
    queryKey: ['/api/ai/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/ai/status');
      return response as any;
    },
  });

  // AI processing mutation
  const aiMutation = useMutation({
    mutationFn: async (request: AIRequest) => {
      const response = await apiRequest('POST', '/api/ai/process', request);
      return response as unknown as AIResponse;
    },
    onSuccess: (response, request) => {
      const historyItem = {
        ...request,
        response,
        timestamp: new Date(),
      };
      setAiHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10

      toast({
        title: 'AI Processing Complete',
        description: `Used ${response.model} with ${response.confidence * 100}% confidence`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'AI Processing Failed',
        description: error.message || 'Please try again with a different model',
        variant: 'destructive',
      });
    },
  });

  const handleProcessCode = () => {
    if (!codeInput.trim()) {
      toast({
        title: 'Code Required',
        description: 'Please enter some code to process',
        variant: 'destructive',
      });
      return;
    }

    const request: AIRequest = {
      type: selectedTask as any,
      content: codeInput,
      language: selectedLanguage || undefined,
      context: contextInput || undefined,
      model: selectedModel as any,
    };

    aiMutation.mutate(request);
  };

  const selectedTaskConfig = AI_TASK_TYPES.find(t => t.value === selectedTask);
  const TaskIcon = selectedTaskConfig?.icon || Brain;

  const getTotalCost = () => {
    return aiHistory.reduce((sum, item) => sum + (item.response?.cost || 0), 0);
  };

  const getAverageConfidence = () => {
    const responses = aiHistory.filter(item => item.response);
    if (responses.length === 0) return 0;
    return (
      responses.reduce((sum, item) => sum + (item.response?.confidence || 0), 0) / responses.length
    );
  };

  return (
    <div className="h-full bg-background overflow-y-auto" data-testid="ai-workspace">
      <div className="w-full px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Brain className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Workspace
              </span>
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
              Multi-Model
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Session Cost</p>
              <p className="font-semibold text-primary">${getTotalCost().toFixed(4)}</p>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Avg Confidence</p>
              <p className="font-semibold">{(getAverageConfidence() * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TaskIcon className={`w-5 h-5 ${selectedTaskConfig?.color}`} />
                  <span>AI Task Selection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AI_TASK_TYPES.map(task => {
                    const Icon = task.icon;
                    return (
                      <Button
                        key={task.value}
                        variant={selectedTask === task.value ? 'default' : 'outline'}
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                        onClick={() => setSelectedTask(task.value)}
                        data-testid={`button-task-${task.value}`}
                      >
                        <Icon
                          className={`w-6 h-6 ${selectedTask === task.value ? 'text-white' : task.color}`}
                        />
                        <div className="text-center">
                          <div className="font-semibold text-sm">{task.label}</div>
                          <div className="text-xs opacity-70">{task.description}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Model Selection</label>
                    <Select
                      value={selectedModel}
                      onValueChange={setSelectedModel}
                      data-testid="select-ai-model"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose AI model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">🤖 Auto-Select (Recommended)</SelectItem>
                        <SelectItem
                          value="openai"
                          disabled={!modelStatus?.models?.openai?.available}
                        >
                          🧠 OpenAI GPT-5{' '}
                          {!modelStatus?.models?.openai?.available && '(Not Available)'}
                        </SelectItem>
                        <SelectItem
                          value="anthropic"
                          disabled={!modelStatus?.models?.anthropic?.available}
                        >
                          🎯 Anthropic Claude{' '}
                          {!modelStatus?.models?.anthropic?.available && '(Not Available)'}
                        </SelectItem>
                        <SelectItem
                          value="gemini"
                          disabled={!modelStatus?.models?.gemini?.available}
                        >
                          ⭐ Google Gemini{' '}
                          {!modelStatus?.models?.gemini?.available && '(Not Available)'}
                        </SelectItem>
                        <SelectItem value="xai" disabled={!modelStatus?.models?.xai?.available}>
                          🚀 xAI Grok {!modelStatus?.models?.xai?.available && '(Not Available)'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Programming Language</label>
                    <Select
                      value={selectedLanguage}
                      onValueChange={setSelectedLanguage}
                      data-testid="select-language"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROGRAMMING_LANGUAGES.map(lang => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Input */}
            <Card>
              <CardHeader>
                <CardTitle>Code Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your code here..."
                  value={codeInput}
                  onChange={e => setCodeInput(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  data-testid="textarea-code-input"
                />

                <Textarea
                  placeholder="Additional context or requirements (optional)..."
                  value={contextInput}
                  onChange={e => setContextInput(e.target.value)}
                  className="min-h-[100px]"
                  data-testid="textarea-context-input"
                />

                <Button
                  onClick={handleProcessCode}
                  disabled={aiMutation.isPending || !codeInput.trim()}
                  className="w-full"
                  data-testid="button-process-code"
                >
                  {aiMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Process with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Model Status & History */}
          <div className="space-y-6">
            {/* Model Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span>AI Models Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {modelStatus?.models &&
                  Object.entries(modelStatus.models).map(([key, model]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {model.available ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium capitalize">{key}</span>
                      </div>
                      <Badge
                        variant={model.available ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {model.available ? 'Active' : 'Offline'}
                      </Badge>
                    </div>
                  ))}

                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground mb-2">Available Models</div>
                  <div className="flex justify-between text-sm">
                    <span>Active:</span>
                    <span className="font-semibold text-green-600">
                      {modelStatus?.available?.length || 0}/{modelStatus?.total || 4}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent AI History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span>Recent Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No AI sessions yet
                  </p>
                ) : (
                  aiHistory.slice(0, 5).map((item, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleTimeString()}
                        </div>
                      </div>

                      {item.response && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Model:</span>
                            <span className="font-medium">{item.response.model}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Confidence:</span>
                            <span className="font-medium">
                              {(item.response.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Cost:</span>
                            <span className="font-medium">${item.response.cost.toFixed(4)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-yellow-500" />
                  <span>Usage Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Sessions:</span>
                  <span className="font-semibold">{aiHistory.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Cost:</span>
                  <span className="font-semibold text-primary">${getTotalCost().toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Confidence:</span>
                  <span className="font-semibold">
                    {(getAverageConfidence() * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="pt-2">
                  <div className="text-xs text-muted-foreground mb-1">Confidence Score</div>
                  <Progress value={getAverageConfidence() * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Response Display */}
        {aiMutation.data && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>AI Response</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <Badge variant="outline">{aiMutation.data.model}</Badge>
                  <span className="text-muted-foreground">
                    {aiMutation.data.tokens} tokens • ${aiMutation.data.cost.toFixed(4)}
                  </span>
                  <span className="text-green-600 font-semibold">
                    {(aiMutation.data.confidence * 100).toFixed(1)}% confidence
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm font-mono">
                {aiMutation.data.content}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
