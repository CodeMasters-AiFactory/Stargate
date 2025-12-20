/**
 * Enterprise Settings
 * SSO, white-labeling, custom domains, team workspaces
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Shield,
  Palette,
  Globe,
  Users,
  Plus,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth' | 'oidc';
  enabled: boolean;
}

export interface WhiteLabelConfig {
  brandName: string;
  logoUrl: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  removePoweredBy: boolean;
}

export interface CustomDomain {
  domain: string;
  websiteId: string;
  sslEnabled: boolean;
  status: 'pending' | 'active' | 'failed';
}

export interface Workspace {
  id: string;
  name: string;
  members: number;
  projects: number;
}

export function EnterpriseSettings() {
  const [ssoProviders, setSSOProviders] = useState<SSOProvider[]>([]);
  const [whiteLabelConfig, setWhiteLabelConfig] = useState<WhiteLabelConfig>({
    brandName: '',
    logoUrl: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    removePoweredBy: false,
  });
  const [customDomains, setCustomDomains] = useState<CustomDomain[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load SSO providers
      const ssoResponse = await fetch('/api/enterprise/sso/providers');
      const ssoData = await ssoResponse.json();
      if (ssoData.success) {
        setSSOProviders(ssoData.providers || []);
      }

      // Load workspaces
      const workspacesResponse = await fetch('/api/enterprise/workspaces?userId=current');
      const workspacesData = await workspacesResponse.json();
      if (workspacesData.success) {
        setWorkspaces(workspacesData.workspaces || []);
      }
    } catch (error) {
      console.error('Failed to load enterprise data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast.error('Domain is required');
      return;
    }

    try {
      const response = await fetch('/api/enterprise/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: newDomain,
          websiteId: 'current',
          sslEnabled: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCustomDomains(prev => [...prev, data]);
        setNewDomain('');
        toast.success('Domain added successfully');
      } else {
        toast.error(data.error || 'Failed to add domain');
      }
    } catch (error) {
      console.error('Failed to add domain:', error);
      toast.error('Failed to add domain');
    }
  };

  const handleSaveWhiteLabel = async () => {
    try {
      const response = await fetch('/api/enterprise/white-label/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: '<html>...</html>', // Would be actual HTML
          config: whiteLabelConfig,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('White-labeling applied successfully');
      } else {
        toast.error(data.error || 'Failed to apply white-labeling');
      }
    } catch (error) {
      console.error('Failed to save white-label config:', error);
      toast.error('Failed to save white-label config');
    }
  };

  const handleCreateWorkspace = async () => {
    try {
      const response = await fetch('/api/enterprise/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Workspace',
          organizationId: 'org-1',
          ownerId: 'user-1',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setWorkspaces(prev => [...prev, data.workspace]);
        toast.success('Workspace created successfully');
      } else {
        toast.error(data.error || 'Failed to create workspace');
      }
    } catch (error) {
      console.error('Failed to create workspace:', error);
      toast.error('Failed to create workspace');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Enterprise Settings</h2>
        <p className="text-muted-foreground">
          Configure SSO, white-labeling, custom domains, and team workspaces
        </p>
      </div>

      <Tabs defaultValue="sso" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sso">
            <Shield className="w-4 h-4 mr-2" />
            SSO
          </TabsTrigger>
          <TabsTrigger value="white-label">
            <Palette className="w-4 h-4 mr-2" />
            White-Label
          </TabsTrigger>
          <TabsTrigger value="domains">
            <Globe className="w-4 h-4 mr-2" />
            Domains
          </TabsTrigger>
          <TabsTrigger value="workspaces">
            <Users className="w-4 h-4 mr-2" />
            Workspaces
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sso" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Single Sign-On (SSO)</CardTitle>
              <CardDescription>
                Configure SAML, OAuth, or OIDC authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ssoProviders.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No SSO providers configured</p>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add SSO Provider
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {ssoProviders.map(provider => (
                    <Card key={provider.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{provider.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {provider.type.toUpperCase()}
                            </p>
                          </div>
                          <Badge variant={provider.enabled ? 'default' : 'secondary'}>
                            {provider.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="white-label" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>White-Labeling</CardTitle>
              <CardDescription>
                Customize branding for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input
                  id="brand-name"
                  value={whiteLabelConfig.brandName}
                  onChange={(e) =>
                    setWhiteLabelConfig(prev => ({ ...prev, brandName: e.target.value }))
                  }
                  placeholder="Your Company Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-url">Logo URL</Label>
                <Input
                  id="logo-url"
                  value={whiteLabelConfig.logoUrl}
                  onChange={(e) =>
                    setWhiteLabelConfig(prev => ({ ...prev, logoUrl: e.target.value }))
                  }
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={whiteLabelConfig.primaryColor}
                      onChange={(e) =>
                        setWhiteLabelConfig(prev => ({ ...prev, primaryColor: e.target.value }))
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={whiteLabelConfig.primaryColor}
                      onChange={(e) =>
                        setWhiteLabelConfig(prev => ({ ...prev, primaryColor: e.target.value }))
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={whiteLabelConfig.secondaryColor}
                      onChange={(e) =>
                        setWhiteLabelConfig(prev => ({ ...prev, secondaryColor: e.target.value }))
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={whiteLabelConfig.secondaryColor}
                      onChange={(e) =>
                        setWhiteLabelConfig(prev => ({ ...prev, secondaryColor: e.target.value }))
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="remove-powered-by">Remove "Powered By"</Label>
                  <p className="text-xs text-muted-foreground">
                    Remove all "Powered by" branding
                  </p>
                </div>
                <Switch
                  id="remove-powered-by"
                  checked={whiteLabelConfig.removePoweredBy}
                  onCheckedChange={(checked) =>
                    setWhiteLabelConfig(prev => ({ ...prev, removePoweredBy: checked }))
                  }
                />
              </div>

              <Button onClick={handleSaveWhiteLabel} className="w-full">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save White-Label Config
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Domains</CardTitle>
              <CardDescription>
                Connect your custom domain to your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddDomain();
                    }
                  }}
                />
                <Button onClick={handleAddDomain}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Domain
                </Button>
              </div>

              {customDomains.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No custom domains configured</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {customDomains.map((domain, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{domain.domain}</p>
                            <p className="text-sm text-muted-foreground">
                              SSL: {domain.sslEnabled ? 'Enabled' : 'Disabled'}
                            </p>
                          </div>
                          <Badge
                            variant={
                              domain.status === 'active'
                                ? 'default'
                                : domain.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {domain.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspaces" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Workspaces</CardTitle>
                  <CardDescription>
                    Manage team workspaces and members
                  </CardDescription>
                </div>
                <Button onClick={handleCreateWorkspace}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workspace
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {workspaces.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No workspaces yet</p>
                  <Button onClick={handleCreateWorkspace}>
                    Create Your First Workspace
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {workspaces.map(workspace => (
                    <Card key={workspace.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{workspace.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {workspace.members} members • {workspace.projects} projects
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

