import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  FolderOpen,
  Clock,
  Star,
  MoreHorizontal,
  Paperclip,
  Brain,
  Code,
  ExternalLink,
} from 'lucide-react';
import { useIDE } from '@/hooks/use-ide';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { BackButton } from './BackButton';

export function StargateIDEPage() {
  const { setState } = useIDE();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [description, setDescription] = useState('');
  const [complexity] = useState('medium');

  const recentProjects = [
    {
      id: '1',
      name: 'StargatePortal',
      lastModified: '13 minutes ago',
      status: 'Public',
      language: 'React',
      icon: '⚛️',
    },
    {
      id: '2',
      name: 'CodeMasters',
      lastModified: '19 hours ago',
      status: 'Deployed',
      language: 'Node.js',
      icon: '🟢',
    },
    {
      id: '3',
      name: 'Genesis Church',
      lastModified: '2 days ago',
      status: 'Deployed',
      language: 'Python',
      icon: '🐍',
    },
    {
      id: '4',
      name: 'AI Assistant Bot',
      lastModified: '3 days ago',
      status: 'Private',
      language: 'TypeScript',
      icon: '🤖',
    },
    {
      id: '5',
      name: 'E-commerce Store',
      lastModified: '1 week ago',
      status: 'Public',
      language: 'Next.js',
      icon: '🛒',
    },
    {
      id: '6',
      name: 'Data Visualizer',
      lastModified: '2 weeks ago',
      status: 'Private',
      language: 'Python',
      icon: '📊',
    },
  ];

  const templateOptions = [
    { id: 'react', label: 'React', icon: '⚛️', description: 'Modern web apps' },
    { id: 'nodejs', label: 'Node.js', icon: '🟢', description: 'Backend services' },
    { id: 'python', label: 'Python', icon: '🐍', description: 'Data & AI' },
    { id: 'nextjs', label: 'Next.js', icon: '▲', description: 'Full-stack React' },
    { id: 'vue', label: 'Vue.js', icon: '💚', description: 'Progressive framework' },
    { id: 'game', label: 'Game', icon: '🎮', description: 'Interactive games' },
  ];

  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateProject = async (template?: string) => {
    setIsCreating(true);
    try {
      await apiRequest('POST', '/api/projects/create', {
        template,
        name: `${template || 'new'}-project-${Date.now()}`,
        description: description || `New ${template || ''} project`,
      });

      toast({
        title: 'Project Created!',
        description: `Successfully created ${template || 'new'} project`,
      });

      setState(prev => ({ ...prev, currentView: 'explorer' }));
      setDescription('');
    } catch (error: any) {
      toast({
        title: 'Project Creation Failed',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: 'Description Required',
        description: 'Please describe what you want to build',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = (await apiRequest('POST', '/api/projects/generate', {
        description,
        complexity: complexity || 'medium',
        useAI: true,
      })) as any;

      toast({
        title: 'AI Project Generated!',
        description: `Successfully generated project: ${response.name}`,
      });

      setState(prev => ({ ...prev, currentView: 'explorer' }));
      setDescription('');
    } catch (error: any) {
      toast({
        title: 'AI Generation Failed',
        description: error.message || 'Failed to generate project with AI',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleAIPlan = () => {
    console.log('AI Planning button clicked!');
    setState(prev => {
      console.log('Setting currentView to aiplanning, current state:', prev);
      return { ...prev, currentView: 'aiplanning' };
    });
  };

  return (
    <div className="w-full bg-background h-full overflow-y-auto" data-testid="home-page">
      <div className="w-full max-w-7xl mx-auto px-3 py-3">
        {/* Back Button */}
        <div className="mb-2 flex items-center gap-2">
          <BackButton />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('[StargateIDEPage] Clicking View Landing Page button');
              setState(prev => {
                console.log('[StargateIDEPage] Setting currentView to landing, previous:', prev.currentView);
                return { ...prev, currentView: 'landing' };
              });
            }}
            className="text-xs"
          >
            View Website Page
          </Button>
        </div>
        {/* Header Section */}
        <div className="mb-3">
          <h1 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Welcome back, {user?.username || 'User'}!
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            What would you like to create today?
          </p>
        </div>

        {/* Create New Project Section */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-md p-3 border border-gray-200 dark:border-gray-700">
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Create a new project
              </h2>

              {/* Description Input */}
              <div className="mb-2">
                <Textarea
                  placeholder="Describe what you want to build... (optional)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="min-h-[40px] resize-none text-xs"
                  data-testid="input-project-description"
                />

                <div className="flex items-center justify-between mt-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Paperclip className="w-4 h-4 mr-2" />
                    Attach file
                  </Button>

                  <Select defaultValue="auto-theme">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto-theme">Auto theme</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                <Button variant="outline" size="sm" onClick={handleAIPlan} data-testid="button-ai-plan" className="h-7 text-xs">
                  <Brain className="w-2.5 h-2.5 mr-1" />
                  AI Planning
                </Button>

                <Button
                  size="sm"
                  onClick={handleGenerate}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-7 text-xs"
                  disabled={!description.trim() || isCreating}
                  data-testid="button-generate-project"
                >
                  {isCreating ? (
                    <div className="animate-spin w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full mr-1" />
                  ) : (
                    <Code className="w-2.5 h-2.5 mr-1" />
                  )}
                  {isCreating ? 'Generating...' : 'Generate with AI'}
                </Button>
              </div>
            </div>

            {/* Template Options */}
            <div>
              <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Or start with a template:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
                {templateOptions.map(template => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    className="h-auto p-1.5 flex flex-col items-center space-y-0 hover:bg-muted/50"
                    onClick={() => handleCreateProject(template.id)}
                    disabled={isCreating}
                    data-testid={`template-${template.id}`}
                  >
                    <span className="text-xs">{template.icon}</span>
                    <span className="text-xs font-medium">{template.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-7 text-xs h-7"
                data-testid="input-search-projects"
              />
            </div>

            <div className="flex items-center space-x-1.5">
              <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                <Clock className="w-2.5 h-2.5 mr-0.5" />
                Recent
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                <Star className="w-2.5 h-2.5 mr-0.5" />
                Starred
              </Button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Recent projects ({recentProjects.length})
            </h2>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2">
              View all
              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {recentProjects
              .filter(
                project =>
                  searchQuery === '' ||
                  project.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(project => (
                <Card
                  key={project.id}
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  data-testid={`project-card-${project.id}`}
                >
                  <CardContent className="p-2">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs">{project.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-xs">
                            {project.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {project.language}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 p-0.5 h-auto"
                      >
                        <MoreHorizontal className="w-2.5 h-2.5" />
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {project.lastModified}
                        </span>
                        <Badge
                          variant={project.status === 'Deployed' ? 'default' : 'secondary'}
                          className="text-xs px-1 py-0"
                        >
                          {project.status}
                        </Badge>
                      </div>

                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" className="flex-1 text-xs h-6 px-1">
                          <FolderOpen className="w-2.5 h-2.5 mr-0.5" />
                          Open
                        </Button>
                        <Button size="sm" className="flex-1 text-xs h-6 px-1">
                          <ExternalLink className="w-2.5 h-2.5 mr-0.5" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Empty State */}
          {recentProjects.filter(
            project =>
              searchQuery === '' || project.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FolderOpen className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No projects found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery
                  ? 'Try adjusting your search terms.'
                  : 'Create your first project to get started.'}
              </p>
              <Button onClick={() => handleCreateProject()}>
                <Plus className="w-4 h-4 mr-2" />
                Create new project
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
