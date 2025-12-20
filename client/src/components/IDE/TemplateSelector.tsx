import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Code,
  Database,
  Globe,
  Smartphone,
  TrendingUp,
  Gamepad2,
  ShoppingCart,
  Brain,
  Rocket,
  Star,
  Clock,
} from 'lucide-react';
import { NavigationButtons } from './BackButton';

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

const templates: Template[] = [
  // Frontend Templates
  {
    id: 'react-dashboard',
    name: 'React Dashboard',
    description:
      'Modern analytics dashboard with charts, data visualization, and responsive design',
    category: 'frontend',
    icon: Globe,
    difficulty: 'Intermediate',
    estimatedTime: '2-3 hours',
    popularity: 95,
    tags: ['React', 'TypeScript', 'Charts', 'Responsive'],
    aiEnhanced: true,
  },
  {
    id: 'vue-portfolio',
    name: 'Vue.js Portfolio',
    description: 'Professional portfolio website with animations and modern design',
    category: 'frontend',
    icon: Code,
    difficulty: 'Beginner',
    estimatedTime: '1-2 hours',
    popularity: 88,
    tags: ['Vue.js', 'CSS3', 'Animation', 'Portfolio'],
  },
  {
    id: 'nextjs-ecommerce',
    name: 'Next.js E-commerce',
    description: 'Full-featured online store with payments, inventory, and admin panel',
    category: 'frontend',
    icon: ShoppingCart,
    difficulty: 'Advanced',
    estimatedTime: '4-6 hours',
    popularity: 92,
    tags: ['Next.js', 'Stripe', 'Database', 'Admin'],
    aiEnhanced: true,
  },

  // Trading Templates
  {
    id: 'crypto-tracker',
    name: 'Crypto Trading Dashboard',
    description: 'Real-time cryptocurrency tracking with portfolio management and price alerts',
    category: 'trading',
    icon: TrendingUp,
    difficulty: 'Intermediate',
    estimatedTime: '3-4 hours',
    popularity: 89,
    tags: ['Trading', 'API', 'Real-time', 'Charts'],
    aiEnhanced: true,
  },
  {
    id: 'stock-analyzer',
    name: 'Stock Market Analyzer',
    description: 'Advanced stock analysis with technical indicators and AI-powered predictions',
    category: 'trading',
    icon: TrendingUp,
    difficulty: 'Advanced',
    estimatedTime: '5-7 hours',
    popularity: 91,
    tags: ['Stocks', 'AI', 'Analysis', 'Predictions'],
    aiEnhanced: true,
  },
  {
    id: 'forex-bot',
    name: 'Forex Trading Bot',
    description: 'Automated forex trading system with risk management and strategy backtesting',
    category: 'trading',
    icon: Brain,
    difficulty: 'Advanced',
    estimatedTime: '6-8 hours',
    popularity: 85,
    tags: ['Forex', 'Bot', 'Automation', 'Backtesting'],
    aiEnhanced: true,
  },

  // Gaming Templates
  {
    id: 'browser-game',
    name: '2D Browser Game',
    description: 'Interactive 2D game with physics, animations, and multiplayer support',
    category: 'gaming',
    icon: Gamepad2,
    difficulty: 'Intermediate',
    estimatedTime: '4-5 hours',
    popularity: 87,
    tags: ['Game', 'Canvas', 'Multiplayer', 'Physics'],
  },
  {
    id: 'puzzle-game',
    name: 'Puzzle Game Engine',
    description: 'Customizable puzzle game framework with level editor and scoring system',
    category: 'gaming',
    icon: Gamepad2,
    difficulty: 'Advanced',
    estimatedTime: '5-6 hours',
    popularity: 83,
    tags: ['Puzzle', 'Engine', 'Editor', 'Framework'],
  },

  // Backend Templates
  {
    id: 'api-server',
    name: 'REST API Server',
    description: 'Scalable REST API with authentication, database, and comprehensive testing',
    category: 'backend',
    icon: Database,
    difficulty: 'Intermediate',
    estimatedTime: '3-4 hours',
    popularity: 94,
    tags: ['API', 'Node.js', 'Database', 'Auth'],
    aiEnhanced: true,
  },
  {
    id: 'microservices',
    name: 'Microservices Architecture',
    description: 'Production-ready microservices setup with Docker, monitoring, and API gateway',
    category: 'backend',
    icon: Rocket,
    difficulty: 'Advanced',
    estimatedTime: '6-8 hours',
    popularity: 86,
    tags: ['Microservices', 'Docker', 'Gateway', 'Monitoring'],
    aiEnhanced: true,
  },

  // Mobile Templates
  {
    id: 'react-native-app',
    name: 'React Native App',
    description: 'Cross-platform mobile app with navigation, state management, and native features',
    category: 'mobile',
    icon: Smartphone,
    difficulty: 'Intermediate',
    estimatedTime: '4-5 hours',
    popularity: 90,
    tags: ['React Native', 'Mobile', 'Cross-platform', 'Navigation'],
  },
];

const categories = [
  { id: 'all', name: 'All Templates', icon: Globe, count: templates.length },
  {
    id: 'frontend',
    name: 'Frontend',
    icon: Code,
    count: templates.filter(t => t.category === 'frontend').length,
  },
  {
    id: 'backend',
    name: 'Backend',
    icon: Database,
    count: templates.filter(t => t.category === 'backend').length,
  },
  {
    id: 'trading',
    name: 'Trading',
    icon: TrendingUp,
    count: templates.filter(t => t.category === 'trading').length,
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: Gamepad2,
    count: templates.filter(t => t.category === 'gaming').length,
  },
  {
    id: 'mobile',
    name: 'Mobile',
    icon: Smartphone,
    count: templates.filter(t => t.category === 'mobile').length,
  },
];

interface TemplateSelectorProps {
  onTemplateSelect: (template: Template) => void;
  onBack: () => void;
}

export function TemplateSelector({ onTemplateSelect, onBack }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <NavigationButtons backDestination="dashboard" className="mb-2" />
            <h2 className="text-2xl font-bold text-foreground">Create New Project</h2>
            <p className="text-muted-foreground">
              Choose from our collection of AI-enhanced templates
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-template-search"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Code className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Category Sidebar */}
        <div className="w-64 border-r border p-4">
          <h3 className="font-semibold mb-4 text-foreground">Categories</h3>
          <div className="space-y-1">
            {categories.map(category => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                  data-testid={`category-${category.id}`}
                >
                  <div className="flex items-center">
                    <IconComponent className="w-4 h-4 mr-3" />
                    <span>{category.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* AI Enhancement Notice */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center mb-2">
              <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="font-medium text-blue-900 dark:text-blue-100">AI Enhanced</span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Templates marked with AI enhancement include intelligent code generation and
              optimization.
            </p>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              {selectedCategory === 'all'
                ? 'All Templates'
                : categories.find(c => c.id === selectedCategory)?.name}
              <span className="text-muted-foreground ml-2">({filteredTemplates.length})</span>
            </h3>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => {
                const IconComponent = template.icon;
                return (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => onTemplateSelect(template)}
                    data-testid={`template-${template.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-primary/10 mr-3">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg flex items-center">
                              {template.name}
                              {template.aiEnhanced && (
                                <Brain className="w-4 h-4 text-blue-500 ml-2" />
                              )}
                            </CardTitle>
                          </div>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm">{template.popularity}</span>
                        </div>
                      </div>
                      <CardDescription className="text-sm">{template.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getDifficultyColor(template.difficulty)}>
                          {template.difficulty}
                        </Badge>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          <span className="text-xs">{template.estimatedTime}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
