import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Terminal,
  Monitor,
  Eye,
  GitBranch,
  Database,
  HardDrive,
  Key,
  Users,
  History,
  Puzzle,
  Package,
  BarChart3,
  Activity,
  Folder,
  FileText,
  Bot,
  Crown,
  Zap,
  Shield,
  Rocket,
} from 'lucide-react';
import { useIDE } from '@/hooks/use-ide';

export function AllToolsPanel() {
  const { setState } = useIDE();

  const toolCategories = [
    {
      title: 'Code & Development',
      tools: [
        {
          id: 'explorer',
          icon: Folder,
          title: 'Files',
          description: 'Manage project files and folders',
        },
        {
          id: 'console',
          icon: Terminal,
          title: 'Console',
          description: 'View application output and logs',
        },
        { id: 'shell', icon: Monitor, title: 'Shell', description: 'Command-line terminal access' },
        {
          id: 'preview',
          icon: Eye,
          title: 'Preview',
          description: 'Live preview of your application',
        },
        {
          id: 'git',
          icon: GitBranch,
          title: 'Git',
          description: 'Version control and collaboration',
        },
      ],
    },
    {
      title: 'Data & Storage',
      tools: [
        {
          id: 'database',
          icon: Database,
          title: 'Database',
          description: 'Manage your database and tables',
        },
        {
          id: 'storage',
          icon: HardDrive,
          title: 'App Storage',
          description: 'File storage and assets',
        },
        {
          id: 'secrets',
          icon: Key,
          title: 'Secrets',
          description: 'Environment variables and API keys',
        },
      ],
    },
    {
      title: 'Collaboration & History',
      tools: [
        {
          id: 'multiplayer',
          icon: Users,
          title: 'Multiplayer',
          description: 'Real-time collaborative editing',
        },
        {
          id: 'history',
          icon: History,
          title: 'File History',
          description: 'Track changes and versions',
        },
      ],
    },
    {
      title: 'Extensions & Deployment',
      tools: [
        {
          id: 'extensions',
          icon: Puzzle,
          title: 'Extensions',
          description: 'IDE extensions and plugins',
        },
        {
          id: 'deployments',
          icon: Package,
          title: 'Deployments',
          description: 'Deploy and manage applications',
        },
      ],
    },
    {
      title: 'Analytics & Management',
      tools: [
        {
          id: 'analytics',
          icon: BarChart3,
          title: 'Analytics',
          description: 'Application performance metrics',
        },
        { id: 'usage', icon: Activity, title: 'Usage', description: 'Resource usage and billing' },
      ],
    },
    {
      title: 'AI & Advanced Features',
      tools: [
        { id: 'ai', icon: Bot, title: 'AI Assistant', description: 'AI-powered coding assistance' },
        {
          id: 'quantum',
          icon: Zap,
          title: 'Quantum Computing',
          description: 'Advanced quantum algorithms',
        },
        {
          id: 'security',
          icon: Shield,
          title: 'Security Firewall',
          description: 'Custom security configurations',
        },
      ],
    },
  ];

  const handleToolClick = (toolId: string) => {
    setState(prev => ({ ...prev, currentView: toolId as any }));
  };

  return (
    <div className="h-full bg-background overflow-y-auto" data-testid="all-tools-panel">
      <div className="w-full px-6 py-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <FileText className="w-6 h-6" />
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Stargate
            </span>{' '}
            All Tools
          </h1>
        </div>

        {/* Stargate Premium Badge */}
        <Card className="mb-8 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="w-6 h-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Stargate Unlimited
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Access to all premium tools and unlimited resources
                  </p>
                </div>
              </div>
              <Badge className="bg-yellow-600 hover:bg-yellow-700">Premium</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tool Categories */}
        <div className="space-y-8">
          {toolCategories.map(category => (
            <div key={category.title}>
              <h2 className="text-xl font-semibold mb-4 text-foreground">{category.title}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {category.tools.map(tool => (
                  <Card
                    key={tool.id}
                    className="hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:shadow-md"
                    onClick={() => handleToolClick(tool.id)}
                    data-testid={`tool-card-${tool.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <tool.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-1">{tool.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {tool.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Rocket className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => handleToolClick('explorer')}
                data-testid="quick-action-files"
              >
                <Folder className="w-6 h-6" />
                <span className="text-sm">Files</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => handleToolClick('console')}
                data-testid="quick-action-console"
              >
                <Terminal className="w-6 h-6" />
                <span className="text-sm">Console</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => handleToolClick('preview')}
                data-testid="quick-action-preview"
              >
                <Eye className="w-6 h-6" />
                <span className="text-sm">Preview</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => handleToolClick('deployments')}
                data-testid="quick-action-deploy"
              >
                <Package className="w-6 h-6" />
                <span className="text-sm">Deploy</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
