/**
 * Integration Catalog Component
 * Browse and discover available integrations
 * Part of Focus 2: Integrations Expansion
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Check,
  Zap,
  Mail,
  BarChart3,
  Share2,
  Settings,
  Star,
  Users,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Integration } from './IntegrationManager';

interface IntegrationCatalogProps {
  onInstallIntegration?: (integration: Integration) => void;
  installedIntegrationIds?: string[];
}

const CATEGORY_ICONS = {
  analytics: BarChart3,
  marketing: Share2,
  email: Mail,
  automation: Zap,
  social: Share2,
  other: Settings,
};

export function IntegrationCatalog({
  onInstallIntegration,
  installedIntegrationIds = [],
}: IntegrationCatalogProps) {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [popularityFilter, setPopularityFilter] = useState<string>('all');

  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/integrations');
        const data = await response.json();
        
        if (data.success && data.integrations) {
          setIntegrations(data.integrations);
        }
      } catch (error) {
        console.error('Failed to load integrations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load integrations. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadIntegrations();
  }, [toast]);

  const categories = Array.from(new Set(integrations.map(i => i.category)));

  const filteredIntegrations = integrations.filter(int => {
    const matchesSearch =
      int.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      int.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      categoryFilter === 'all' || int.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleInstall = async (integration: Integration) => {
    try {
      // Get current project/website ID
      const websiteId = new URLSearchParams(window.location.search).get('websiteId') || 
                        localStorage.getItem('current-website-id') || 
                        'default';
      
      // Load current project integrations
      const projectResponse = await fetch(`/api/integrations/project/${websiteId}`);
      const projectData = await projectResponse.json();
      
      let projectIntegrations: Integration[] = [];
      if (projectData.success && projectData.integrations) {
        projectIntegrations = projectData.integrations;
      } else {
        // Start with all default integrations disabled
        projectIntegrations = integrations.map(int => ({ ...int, enabled: false }));
      }
      
      // Enable the selected integration
      const updatedIntegrations = projectIntegrations.map(int =>
        int.id === integration.id
          ? { ...int, enabled: true }
          : int
      );
      
      // Save to project
      const saveResponse = await fetch(`/api/integrations/project/${websiteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrations: updatedIntegrations }),
      });
      
      const saveData = await saveResponse.json();
      
      if (saveData.success) {
        if (onInstallIntegration) {
          onInstallIntegration(integration);
        }
        toast({
          title: 'Integration Installed',
          description: `${integration.name} has been installed and enabled.`,
        });
        
        // Reload integrations to show updated state
        const reloadResponse = await fetch('/api/integrations');
        const reloadData = await reloadResponse.json();
        if (reloadData.success && reloadData.integrations) {
          setIntegrations(reloadData.integrations);
        }
      } else {
        throw new Error(saveData.error || 'Failed to install integration');
      }
    } catch (error) {
      console.error('Failed to install integration:', error);
      toast({
        title: 'Installation Failed',
        description: error instanceof Error ? error.message : 'Failed to install integration',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Integration Marketplace</h2>
        <p className="text-muted-foreground">
          Discover and install integrations to enhance your website
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{integrations.length}</div>
            <p className="text-xs text-muted-foreground">Total Integrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{installedIntegrationIds.length}</div>
            <p className="text-xs text-muted-foreground">Installed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredIntegrations.length}</div>
            <p className="text-xs text-muted-foreground">Filtered Results</p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredIntegrations.map(integration => {
          const Icon = CATEGORY_ICONS[integration.category] || Settings;
          const isInstalled = installedIntegrationIds.includes(integration.id);
          
          return (
            <Card key={integration.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {integration.category}
                      </Badge>
                    </div>
                  </div>
                  {isInstalled && (
                    <Badge className="bg-green-500">
                      <Check className="w-3 h-3 mr-1" />
                      Installed
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-2">
                  {integration.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Button
                  onClick={() => handleInstall(integration)}
                  disabled={isInstalled}
                  className="w-full"
                  variant={isInstalled ? 'outline' : 'default'}
                >
                  {isInstalled ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Installed
                    </>
                  ) : (
                    'Install Integration'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No integrations found matching your criteria</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

