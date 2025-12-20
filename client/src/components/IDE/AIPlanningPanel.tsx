import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Bot,
  Search,
  Lightbulb,
  Scale,
  Target,
  CheckCircle2,
  Brain,
  Zap,
  Rocket,
} from 'lucide-react';

// Available AI Models
const availableModels = [
  { id: 'gpt-5', name: 'GPT-5', provider: 'OpenAI', specialty: 'Strategic Planning' },
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    specialty: 'Analytical Reasoning',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    specialty: 'Creative Solutions',
  },
  { id: 'grok-2', name: 'Grok-2', provider: 'XAI', specialty: 'Execution Planning' },
  {
    id: 'perplexity-pro',
    name: 'Perplexity Pro',
    provider: 'Perplexity',
    specialty: 'Research Intelligence',
  },
  {
    id: 'command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    specialty: 'Business Intelligence',
  },
  { id: 'llama-3', name: 'Llama 3', provider: 'Meta', specialty: 'Open Source Flexibility' },
  {
    id: 'copilot-pro',
    name: 'Copilot Pro',
    provider: 'Microsoft',
    specialty: 'Development Assistance',
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    specialty: 'Multilingual Analysis',
  },
  {
    id: 'nvidia-nim',
    name: 'NVIDIA NIM',
    provider: 'NVIDIA',
    specialty: 'High Performance Computing',
  },
];

// Planning Modes
const planningModes = [
  {
    id: 'speed',
    name: 'Speed Mode',
    icon: Zap,
    description: 'Fast analysis with core insights - Perfect for quick decisions',
    duration: '5-8 minutes',
    agents: ['Planning Agent', 'Research Agent', 'Judge Agent'],
    color: 'text-yellow-500',
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive Mode',
    icon: Brain,
    description: 'Deep analysis with all agents - Maximum detail and accuracy',
    duration: '12-18 minutes',
    agents: [
      'Planning Agent',
      'Research Agent',
      'Recommendation Agent',
      'Judge Agent',
      'Executioner Agent',
    ],
    color: 'text-blue-500',
  },
  {
    id: 'strategic',
    name: 'Strategic Mode',
    icon: Target,
    description: 'Focus on competitive intelligence and market positioning',
    duration: '8-12 minutes',
    agents: ['Research Agent', 'Recommendation Agent', 'Judge Agent', 'Executioner Agent'],
    color: 'text-purple-500',
  },
];

type Step = 'setup' | 'agent-results' | 'judge-analysis' | 'user-approval' | 'execution';

export function AIPlanningPanel() {
  const [currentStep, setCurrentStep] = useState<Step>('setup');
  const [isProcessing, setIsProcessing] = useState(false);
  const [individualResults, setIndividualResults] = useState<{ [key: string]: any }>({});
  const [judgmentComplete, setJudgmentComplete] = useState(false);
  const [approvedPlan, setApprovedPlan] = useState<any>(null);

  // Form state
  const [projectDescription, setProjectDescription] = useState(
    'Build a revolutionary cloud development platform called "Stargate" that surpasses Replit through advanced AI agent collaboration, multi-model AI routing, and comprehensive development tools.'
  );
  const [requirements, setRequirements] = useState(
    "Need sophisticated AI planning system with 5 specialized agents, real-time competitive intelligence, multi-agent orchestration, percentage-based decision scoring, and comprehensive execution planning. Must integrate world's top AI models for strategic analysis."
  );
  const [industry, setIndustry] = useState('technology');
  const [selectedModels, setSelectedModels] = useState<string[]>([
    'gpt-5',
    'claude-sonnet-4',
    'gemini-2.5-pro',
    'perplexity-pro',
    'grok-2',
  ]);
  const [planningMode, setPlanningMode] = useState('comprehensive');

  const startStep1Analysis = async () => {
    if (!projectDescription.trim() || !requirements.trim()) {
      alert('Please provide both project description and requirements');
      return;
    }

    if (selectedModels.length === 0) {
      alert('Please select at least one AI model');
      return;
    }

    setIsProcessing(true);
    setCurrentStep('agent-results');

    // Run individual agents and collect their results
    await runAgentsIndividually();
  };

  const runAgentsIndividually = async () => {
    const agentSequence = getAgentSequenceForMode(planningMode);
    const results: { [key: string]: any } = {};

    for (const agent of agentSequence) {
      try {
        setIsProcessing(true);
        const response = await fetch('/api/ai/run-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent,
            projectDescription,
            requirements,
            industry,
            selectedModels: selectedModels.slice(0, 1), // Use first selected model for each agent
            previousResults: results,
          }),
        });

        if (response.ok) {
          const agentResult = await response.json();
          results[agent] = agentResult.result;
        }
      } catch (error) {
        console.error(`Error running ${agent}:`, error);
      }
    }

    setIndividualResults(results);
    setIsProcessing(false);
  };

  const getAgentSequenceForMode = (mode: string): string[] => {
    switch (mode) {
      case 'speed':
        return ['Planning Agent', 'Research Agent', 'Judge Agent'];
      case 'strategic':
        return ['Research Agent', 'Recommendation Agent', 'Judge Agent', 'Executioner Agent'];
      case 'comprehensive':
      default:
        return [
          'Planning Agent',
          'Research Agent',
          'Recommendation Agent',
          'Judge Agent',
          'Executioner Agent',
        ];
    }
  };

  const getAgentIcon = (agentName: string) => {
    switch (agentName) {
      case 'Planning Agent':
        return <Bot className="w-4 h-4" />;
      case 'Research Agent':
        return <Search className="w-4 h-4" />;
      case 'Recommendation Agent':
        return <Lightbulb className="w-4 h-4" />;
      case 'Judge Agent':
        return <Scale className="w-4 h-4" />;
      case 'Executioner Agent':
        return <Target className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const proceedToJudgeAnalysis = () => {
    setCurrentStep('judge-analysis');
    setIsProcessing(true);

    // Simulate judge analysis
    setTimeout(() => {
      setJudgmentComplete(true);
      setIsProcessing(false);
    }, 3000);
  };

  const approveRecommendedPlan = (plan: any) => {
    setApprovedPlan(plan);
    setCurrentStep('user-approval');
  };

  const startExecution = () => {
    setCurrentStep('execution');
    alert('Starting project execution with ongoing user approval...');
  };

  const renderStepHeader = () => {
    const steps = [
      { id: 'setup', name: 'Setup', icon: Brain },
      { id: 'agent-results', name: 'AI Analysis', icon: Bot },
      { id: 'judge-analysis', name: 'Judge Evaluation', icon: Scale },
      { id: 'user-approval', name: 'Approval', icon: CheckCircle2 },
      { id: 'execution', name: 'Execution', icon: Rocket },
    ];

    return (
      <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  isActive
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-gray-200 border-gray-300 text-gray-500'
                }`}
              >
                <IconComponent className="w-4 h-4" />
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4" data-testid="ai-planning-panel">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Multi-Agent AI Planning System
          </CardTitle>
          <CardDescription>
            Step-by-step AI analysis with user approval at each stage
          </CardDescription>
        </CardHeader>
        <CardContent>{renderStepHeader()}</CardContent>
      </Card>

      {/* Step 1: Setup */}
      {currentStep === 'setup' && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Project Setup & AI Selection</CardTitle>
            <CardDescription>Configure your project details and select AI models</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your project idea, goals, and vision..."
                value={projectDescription}
                onChange={e => setProjectDescription(e.target.value)}
                className="min-h-[80px]"
                data-testid="input-project-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Technical Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="List your technical requirements, constraints, and specific needs..."
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                className="min-h-[80px]"
                data-testid="input-requirements"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry/Domain</Label>
              <Input
                id="industry"
                placeholder="e.g., technology, healthcare, fintech, education"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                data-testid="input-industry"
              />
            </div>

            <Separator />

            {/* Planning Mode Selection */}
            <div className="space-y-3">
              <Label>Planning Mode</Label>
              <div className="grid grid-cols-1 gap-3">
                {planningModes.map(mode => {
                  const IconComponent = mode.icon;
                  return (
                    <Card
                      key={mode.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        planningMode === mode.id
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setPlanningMode(mode.id)}
                      data-testid={`planning-mode-${mode.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <IconComponent className={`w-5 h-5 mt-0.5 ${mode.color}`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{mode.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {mode.duration}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{mode.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {mode.agents.map(agent => (
                                <Badge key={agent} variant="secondary" className="text-xs">
                                  {agent.replace(' Agent', '')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* AI Model Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  AI Models ({selectedModels.length}/{availableModels.length} selected)
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedModels(availableModels.map(m => m.id))}
                    data-testid="button-select-all-models"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedModels([])}
                    data-testid="button-clear-models"
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-48">
                <div className="grid grid-cols-1 gap-2">
                  {availableModels.map(model => (
                    <div
                      key={model.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <Checkbox
                        id={model.id}
                        checked={selectedModels.includes(model.id)}
                        onCheckedChange={checked => {
                          if (checked) {
                            setSelectedModels([...selectedModels, model.id]);
                          } else {
                            setSelectedModels(selectedModels.filter(id => id !== model.id));
                          }
                        }}
                        data-testid={`checkbox-${model.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={model.id} className="font-medium cursor-pointer">
                            {model.name}
                          </Label>
                          <Badge variant="outline" className="text-xs">
                            {model.provider}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{model.specialty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Button
              onClick={startStep1Analysis}
              disabled={
                isProcessing ||
                !projectDescription.trim() ||
                !requirements.trim() ||
                selectedModels.length === 0
              }
              className="w-full"
              data-testid="button-start-analysis"
            >
              {isProcessing
                ? 'Starting Analysis...'
                : `Start ${planningModes.find(m => m.id === planningMode)?.name} Analysis`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: AI Agent Results */}
      {currentStep === 'agent-results' && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Individual AI Agent Results</CardTitle>
            <CardDescription>
              Review the analysis from each AI agent before proceeding
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p>AI agents are analyzing your project...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(individualResults).map(([agent, result]) => (
                  <Card key={agent} className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {getAgentIcon(agent)}
                        {agent}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32">
                        <pre className="text-sm whitespace-pre-wrap">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ))}

                {Object.keys(individualResults).length > 0 && (
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep('setup')}>
                      Back to Setup
                    </Button>
                    <Button onClick={proceedToJudgeAnalysis}>Proceed to Judge Analysis</Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Judge Analysis */}
      {currentStep === 'judge-analysis' && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Judge Analysis & Recommendations</CardTitle>
            <CardDescription>
              AI Judge evaluates all plans and provides recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p>Judge is analyzing all plans and scoring them...</p>
              </div>
            ) : judgmentComplete ? (
              <div className="space-y-4">
                <Card className="bg-green-50 dark:bg-green-950 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800 dark:text-green-200">
                      Recommended Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Overall Score:</span>
                        <Badge className="bg-green-500">87/100</Badge>
                      </div>
                      <p className="text-sm">
                        Strategic hybrid approach combining innovation with market-proven
                        strategies.
                      </p>
                      <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={() => setCurrentStep('agent-results')}>
                          Back to Results
                        </Button>
                        <Button
                          onClick={() =>
                            approveRecommendedPlan({ score: 87, plan: 'Strategic Hybrid' })
                          }
                        >
                          Approve This Plan
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Step 4: User Approval */}
      {currentStep === 'user-approval' && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Plan Approval</CardTitle>
            <CardDescription>Confirm the recommended plan before execution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-medium mb-2">Approved Plan: {approvedPlan?.plan}</h4>
                <p className="text-sm mb-4">Score: {approvedPlan?.score}/100</p>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep('judge-analysis')}>
                    Back to Judge Analysis
                  </Button>
                  <Button onClick={startExecution}>Start Execution</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Execution */}
      {currentStep === 'execution' && (
        <Card>
          <CardHeader>
            <CardTitle>Step 5: Project Execution</CardTitle>
            <CardDescription>Building your project with ongoing approval gates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Rocket className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-medium mb-2">Execution Started!</h3>
              <p className="text-muted-foreground">
                Project execution is now in progress. You'll be asked to approve each major step.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
