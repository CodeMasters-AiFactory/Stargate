/**
 * Integration Manager Component
 * Allows users to configure and enable third-party integrations
 * Part of Focus 2: Integrations Expansion
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  Settings,
  ExternalLink,
  Zap,
  Mail,
  BarChart3,
  Share2,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'analytics' | 'marketing' | 'email' | 'automation' | 'social' | 'other';
  enabled: boolean;
  config: Record<string, any>;
  requiresAuth: boolean;
  authStatus?: 'connected' | 'disconnected' | 'error';
}

interface IntegrationManagerProps {
  projectSlug?: string;
  onIntegrationsChange?: (integrations: Integration[]) => void;
}

const CATEGORY_ICONS = {
  analytics: BarChart3,
  marketing: Share2,
  email: Mail,
  automation: Zap,
  social: Share2,
  other: Settings,
};

const CATEGORY_COLORS = {
  analytics: 'bg-blue-500',
  marketing: 'bg-purple-500',
  email: 'bg-green-500',
  automation: 'bg-orange-500',
  social: 'bg-pink-500',
  other: 'bg-gray-500',
};

export function IntegrationManager({ projectSlug, onIntegrationsChange }: IntegrationManagerProps) {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load integrations
  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        setLoading(true);
        
        // Load available integrations
        const response = await fetch('/api/integrations');
        const data = await response.json();
        
        if (data.success && data.integrations) {
          let loadedIntegrations: Integration[] = data.integrations;
          
          // Load project-specific integrations if projectSlug provided
          if (projectSlug) {
            try {
              const projectResponse = await fetch(`/api/integrations/project/${projectSlug}`);
              const projectData = await projectResponse.json();
              if (projectData.success && projectData.integrations?.length > 0) {
                // Merge project configs with defaults
                loadedIntegrations = loadedIntegrations.map(defaultInt => {
                  const projectInt = projectData.integrations.find(
                    (pi: Integration) => pi.id === defaultInt.id
                  );
                  return projectInt || defaultInt;
                });
              }
            } catch (error) {
              console.error('Failed to load project integrations:', error);
            }
          }
          
          setIntegrations(loadedIntegrations);
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
  }, [projectSlug, toast]);

  // Notify parent of changes
  useEffect(() => {
    if (onIntegrationsChange) {
      onIntegrationsChange(integrations);
    }
  }, [integrations, onIntegrationsChange]);

  const handleToggleIntegration = async (integrationId: string) => {
    const updatedIntegrations = integrations.map(int =>
      int.id === integrationId
        ? { ...int, enabled: !int.enabled }
        : int
    );
    setIntegrations(updatedIntegrations);
    await saveIntegrations(updatedIntegrations);
  };

  const handleConfigChange = (integrationId: string, key: string, value: string) => {
    const updatedIntegrations = integrations.map(int =>
      int.id === integrationId
        ? {
            ...int,
            config: {
              ...int.config,
              [key]: value,
            },
          }
        : int
    );
    setIntegrations(updatedIntegrations);
  };

  const saveIntegrations = async (integrationsToSave: Integration[]) => {
    if (!projectSlug) return;
    
    try {
      setSaving(true);
      const response = await fetch(`/api/integrations/project/${projectSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrations: integrationsToSave }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Integrations saved successfully',
        });
      }
    } catch (error) {
      console.error('Failed to save integrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to save integrations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (integration: Integration) => {
    try {
      const response = await fetch(`/api/integrations/${integration.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: integration.config }),
      });

      const data = await response.json();
      if (data.success && data.connected) {
        toast({
          title: 'Connection Successful',
          description: `${integration.name} is connected and working.`,
        });
        
        // Update auth status
        const updatedIntegrations = integrations.map(int =>
          int.id === integration.id
            ? { ...int, authStatus: 'connected' as const }
            : int
        );
        setIntegrations(updatedIntegrations);
      } else {
        toast({
          title: 'Connection Failed',
          description: `Failed to connect to ${integration.name}. Please check your configuration.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Connection test failed. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openConfigDialog = (integration: Integration) => {
    setSelectedIntegration({ ...integration });
    setConfigDialogOpen(true);
  };

  const saveConfig = async () => {
    if (!selectedIntegration) return;
    
    const updatedIntegrations = integrations.map(int =>
      int.id === selectedIntegration.id ? selectedIntegration : int
    );
    setIntegrations(updatedIntegrations);
    await saveIntegrations(updatedIntegrations);
    setConfigDialogOpen(false);
    setSelectedIntegration(null);
  };

  // Group integrations by category
  const groupedIntegrations = integrations.reduce((acc, int) => {
    if (!acc[int.category]) {
      acc[int.category] = [];
    }
    acc[int.category].push(int);
    return acc;
  }, {} as Record<string, Integration[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Integrations</h2>
        <p className="text-muted-foreground">
          Connect third-party services to enhance your website functionality
        </p>
      </div>

      {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => {
        const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Settings;
        
        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              <h3 className="text-lg font-semibold capitalize">{category}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryIntegrations.map(integration => {
                const CategoryIcon = CATEGORY_ICONS[integration.category] || Settings;
                const isConnected = integration.authStatus === 'connected';
                
                return (
                  <Card key={integration.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${CATEGORY_COLORS[integration.category]} text-white`}>
                            <CategoryIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {integration.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Switch
                          checked={integration.enabled}
                          onCheckedChange={() => handleToggleIntegration(integration.id)}
                        />
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        {integration.enabled ? (
                          <Badge variant={isConnected ? 'default' : 'secondary'}>
                            {isConnected ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Connected
                              </>
                            ) : (
                              'Enabled'
                            )}
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <XCircle className="w-3 h-3 mr-1" />
                            Disabled
                          </Badge>
                        )}
                      </div>
                      
                      {integration.enabled && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openConfigDialog(integration)}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                          </Button>
                          {integration.requiresAuth && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestConnection(integration)}
                            >
                              Test
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <Separator className="my-6" />
          </div>
        );
      })}

      {/* Configuration Dialog */}
      {selectedIntegration && (
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configure {selectedIntegration.name}</DialogTitle>
              <DialogDescription>
                Enter your {selectedIntegration.name} credentials and settings
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              {selectedIntegration.id === 'google-analytics' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="measurementId">Measurement ID (G-XXXXXXXXXX)</Label>
                    <Input
                      id="measurementId"
                      placeholder="G-XXXXXXXXXX"
                      value={selectedIntegration.config.measurementId || ''}
                      onChange={(e) => {
                        setSelectedIntegration({
                          ...selectedIntegration,
                          config: {
                            ...selectedIntegration.config,
                            measurementId: e.target.value,
                          },
                        });
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Find this in your Google Analytics account under Admin → Data Streams
                    </p>
                  </div>
                </>
              )}
              
              {selectedIntegration.id === 'facebook-pixel' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="pixelId">Facebook Pixel ID</Label>
                    <Input
                      id="pixelId"
                      placeholder="123456789012345"
                      value={selectedIntegration.config.pixelId || ''}
                      onChange={(e) => {
                        setSelectedIntegration({
                          ...selectedIntegration,
                          config: {
                            ...selectedIntegration.config,
                            pixelId: e.target.value,
                          },
                        });
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Find this in Facebook Events Manager
                    </p>
                  </div>
                </>
              )}
              
              {selectedIntegration.id === 'zapier' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      value={selectedIntegration.config.webhookUrl || ''}
                      onChange={(e) => {
                        setSelectedIntegration({
                          ...selectedIntegration,
                          config: {
                            ...selectedIntegration.config,
                            webhookUrl: e.target.value,
                          },
                        });
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Get this from your Zapier webhook trigger
                    </p>
                  </div>
                </>
              )}
              
              {selectedIntegration.id === 'mailchimp' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">Mailchimp API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="your-api-key"
                      value={selectedIntegration.config.apiKey || ''}
                      onChange={(e) => {
                        setSelectedIntegration({
                          ...selectedIntegration,
                          config: {
                            ...selectedIntegration.config,
                            apiKey: e.target.value,
                          },
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="listId">Audience/List ID</Label>
                    <Input
                      id="listId"
                      placeholder="audience-id"
                      value={selectedIntegration.config.listId || ''}
                      onChange={(e) => {
                        setSelectedIntegration({
                          ...selectedIntegration,
                          config: {
                            ...selectedIntegration.config,
                            listId: e.target.value,
                          },
                        });
                      }}
                    />
                  </div>
                </>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={saveConfig}
                  className="flex-1"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Configuration'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setConfigDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

