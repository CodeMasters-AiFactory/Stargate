import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  Rocket,
  Brain,
  CheckCircle2,
  Globe,
  Users,
  Shield,
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  popularity: number;
  tags: string[];
  aiEnhanced?: boolean;
}

interface ProjectCreationFlowProps {
  template: Template;
  onBack: () => void;
  onCreateProject: (projectData: any) => void;
}

export function ProjectCreationFlow({
  template,
  onBack,
  onCreateProject,
}: ProjectCreationFlowProps) {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    visibility: 'private',
    aiEnhancements: template.aiEnhanced ? ['smart-completion', 'code-optimization'] : [],
    features: [] as string[],
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleCreateProject = async () => {
    setIsCreating(true);

    // Simulate project creation
    setTimeout(() => {
      onCreateProject({
        ...projectData,
        template: template.id,
        templateName: template.name,
      });
      setIsCreating(false);
    }, 3000);
  };

  const getAvailableFeatures = () => {
    const baseFeatures = [
      'Authentication',
      'Database Integration',
      'API Endpoints',
      'Testing Suite',
    ];

    if (template.category === 'frontend') {
      return [
        ...baseFeatures,
        'Responsive Design',
        'PWA Support',
        'Component Library',
        'State Management',
      ];
    }

    if (template.category === 'trading') {
      return [
        ...baseFeatures,
        'Real-time Data',
        'Portfolio Management',
        'Risk Analytics',
        'Automated Trading',
      ];
    }

    if (template.category === 'gaming') {
      return [
        ...baseFeatures,
        'Physics Engine',
        'Multiplayer Support',
        'Level Editor',
        'Asset Management',
      ];
    }

    if (template.category === 'backend') {
      return [...baseFeatures, 'Rate Limiting', 'Monitoring', 'Load Balancing', 'Message Queue'];
    }

    return baseFeatures;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Project Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    placeholder="Enter your project name"
                    value={projectData.name}
                    onChange={e => setProjectData({ ...projectData, name: e.target.value })}
                    data-testid="input-project-name"
                  />
                </div>

                <div>
                  <Label htmlFor="project-description">Description (Optional)</Label>
                  <Textarea
                    id="project-description"
                    placeholder="Describe what your project will do"
                    value={projectData.description}
                    onChange={e => setProjectData({ ...projectData, description: e.target.value })}
                    className="min-h-[100px]"
                    data-testid="textarea-project-description"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Privacy & Sharing</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="private"
                      name="visibility"
                      value="private"
                      checked={projectData.visibility === 'private'}
                      onChange={e => setProjectData({ ...projectData, visibility: e.target.value })}
                      className="text-primary"
                    />
                    <Label htmlFor="private" className="flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Private - Only you can see this project
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="public"
                      name="visibility"
                      value="public"
                      checked={projectData.visibility === 'public'}
                      onChange={e => setProjectData({ ...projectData, visibility: e.target.value })}
                      className="text-primary"
                    />
                    <Label htmlFor="public" className="flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      Public - Anyone can view and fork
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="team"
                      name="visibility"
                      value="team"
                      checked={projectData.visibility === 'team'}
                      onChange={e => setProjectData({ ...projectData, visibility: e.target.value })}
                      className="text-primary"
                    />
                    <Label htmlFor="team" className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Team - Shared with invited collaborators
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Features & Add-ons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getAvailableFeatures().map(feature => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={projectData.features.includes(feature)}
                      onCheckedChange={checked => {
                        if (checked) {
                          setProjectData({
                            ...projectData,
                            features: [...projectData.features, feature],
                          });
                        } else {
                          setProjectData({
                            ...projectData,
                            features: projectData.features.filter(f => f !== feature),
                          });
                        }
                      }}
                      data-testid={`checkbox-feature-${feature.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                    <Label htmlFor={feature}>{feature}</Label>
                  </div>
                ))}
              </div>

              {template.aiEnhanced && (
                <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                    AI Enhancements
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="smart-completion"
                        checked={projectData.aiEnhancements.includes('smart-completion')}
                        onCheckedChange={checked => {
                          if (checked) {
                            setProjectData({
                              ...projectData,
                              aiEnhancements: [...projectData.aiEnhancements, 'smart-completion'],
                            });
                          } else {
                            setProjectData({
                              ...projectData,
                              aiEnhancements: projectData.aiEnhancements.filter(
                                f => f !== 'smart-completion'
                              ),
                            });
                          }
                        }}
                      />
                      <Label htmlFor="smart-completion">Smart Code Completion</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="code-optimization"
                        checked={projectData.aiEnhancements.includes('code-optimization')}
                        onCheckedChange={checked => {
                          if (checked) {
                            setProjectData({
                              ...projectData,
                              aiEnhancements: [...projectData.aiEnhancements, 'code-optimization'],
                            });
                          } else {
                            setProjectData({
                              ...projectData,
                              aiEnhancements: projectData.aiEnhancements.filter(
                                f => f !== 'code-optimization'
                              ),
                            });
                          }
                        }}
                      />
                      <Label htmlFor="code-optimization">AI Code Optimization</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ai-debugging"
                        checked={projectData.aiEnhancements.includes('ai-debugging')}
                        onCheckedChange={checked => {
                          if (checked) {
                            setProjectData({
                              ...projectData,
                              aiEnhancements: [...projectData.aiEnhancements, 'ai-debugging'],
                            });
                          } else {
                            setProjectData({
                              ...projectData,
                              aiEnhancements: projectData.aiEnhancements.filter(
                                f => f !== 'ai-debugging'
                              ),
                            });
                          }
                        }}
                      />
                      <Label htmlFor="ai-debugging">AI-Powered Debugging</Label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Review & Create</h3>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Project Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Name:</strong> {projectData.name || 'Untitled Project'}
                    </div>
                    <div>
                      <strong>Template:</strong> {template.name}
                    </div>
                    <div>
                      <strong>Category:</strong> {template.category}
                    </div>
                    <div>
                      <strong>Visibility:</strong> {projectData.visibility}
                    </div>
                    {projectData.description && (
                      <div>
                        <strong>Description:</strong> {projectData.description}
                      </div>
                    )}
                  </div>
                </div>

                {projectData.features.length > 0 && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Selected Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {projectData.features.map(feature => (
                        <Badge key={feature} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {projectData.aiEnhancements.length > 0 && (
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Brain className="w-4 h-4 mr-2" />
                      AI Enhancements
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {projectData.aiEnhancements.map(enhancement => (
                        <Badge key={enhancement} className="bg-blue-100 text-blue-800">
                          {enhancement.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center text-green-800 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    <span className="font-medium">Ready to Create!</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Estimated setup time: {template.estimatedTime}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button variant="outline" size="sm" onClick={onBack} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Create {template.name}</h2>
              <p className="text-muted-foreground">
                Step {step} of {totalSteps}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <template.icon className="w-8 h-8 text-primary mr-3" />
            <div className="text-right">
              <div className="font-medium">{template.name}</div>
              <div className="text-sm text-muted-foreground">{template.difficulty}</div>
            </div>
          </div>
        </div>

        <Progress value={progress} className="h-2" />
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          {isCreating ? (
            <div className="text-center space-y-4">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <h3 className="text-lg font-semibold">Creating Your Project...</h3>
              <p className="text-muted-foreground">
                Setting up your development environment and AI enhancements
              </p>
              <div className="space-y-2 text-sm text-left max-w-md mx-auto">
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                  <span>Initializing project structure</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                  <span>Installing dependencies</span>
                </div>
                <div className="flex items-center animate-pulse">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Setting up AI enhancements</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {renderStep()}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                >
                  Previous
                </Button>

                {step < totalSteps ? (
                  <Button
                    onClick={() => setStep(Math.min(totalSteps, step + 1))}
                    disabled={step === 1 && !projectData.name.trim()}
                    data-testid="button-next-step"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateProject}
                    disabled={!projectData.name.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    data-testid="button-create-project"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
