import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Rocket,
  Globe,
  Settings,
  ExternalLink,
  Play,
  Pause,
  Plus,
  Activity,
  BarChart3,
  Clock,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { insertDeploymentSchema, type Deployment } from '@shared/schema';
import { z } from 'zod';
import { BackButton } from './BackButton';

const deploymentFormSchema = insertDeploymentSchema.extend({
  environmentVars: z.record(z.string()).optional(),
});

export function DeploymentsScreen() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch deployments for the current project
  const { data: deployments = [], isLoading } = useQuery({
    queryKey: ['/api/deployments'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/deployments?projectId=demo-project-1');
      return response as unknown as Deployment[];
    },
  });

  // Create deployment mutation
  const createDeploymentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof deploymentFormSchema>) => {
      await apiRequest('POST', '/api/projects/demo-project-1/deployments', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deployments'] });
      setIsCreateOpen(false);
      toast({
        title: 'Deployment Created',
        description: 'Your deployment has been created successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Creation Failed',
        description: 'Unable to create deployment. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Deploy mutation (trigger new build)
  const deployMutation = useMutation({
    mutationFn: async (deploymentId: string) => {
      await apiRequest('POST', `/api/deployments/${deploymentId}/builds`, {
        branch: 'main',
        commitMessage: 'Manual deployment',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deployments'] });
      toast({
        title: 'Deployment Started',
        description: 'Your deployment build has been started.',
      });
    },
  });

  // Toggle deployment status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === 'active' ? 'paused' : 'active';
      await apiRequest('PATCH', `/api/deployments/${id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deployments'] });
    },
  });

  const form = useForm<z.infer<typeof deploymentFormSchema>>({
    resolver: zodResolver(deploymentFormSchema),
    defaultValues: {
      name: '',
      type: 'static',
      buildCommand: 'npm run build',
      startCommand: '',
      environmentVars: {},
      resources: {},
      config: {},
    },
  });

  const onSubmit = (data: z.infer<typeof deploymentFormSchema>) => {
    createDeploymentMutation.mutate(data);
  };

  const handleVisit = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'building':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      case 'paused':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getTimeAgo = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="h-full bg-background overflow-y-auto" data-testid="deployments-screen">
      <div className="w-full px-8 py-8">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Rocket className="w-6 h-6" />
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Stargate
              </span>{' '}
              Deployments
            </h1>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary hover:bg-primary/90"
                data-testid="button-new-deployment"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Deployment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Deployment</DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deployment Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="my-awesome-app"
                              {...field}
                              data-testid="input-deployment-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deployment Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            data-testid="select-deployment-type"
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select deployment type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="static">Static Site</SelectItem>
                              <SelectItem value="autoscale">Autoscale</SelectItem>
                              <SelectItem value="reserved-vm">Reserved VM</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="buildCommand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Build Command</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="npm run build"
                              {...field}
                              value={field.value ?? ''}
                              data-testid="input-build-command"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startCommand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Command (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="npm start"
                              {...field}
                              value={field.value ?? ''}
                              data-testid="input-start-command"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createDeploymentMutation.isPending}
                      data-testid="button-create-deployment"
                    >
                      {createDeploymentMutation.isPending ? 'Creating...' : 'Create Deployment'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Deployments List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading deployments...</p>
            </div>
          ) : deployments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Rocket className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No deployments yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first deployment
                </p>
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  data-testid="button-create-first-deployment"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Deployment
                </Button>
              </CardContent>
            </Card>
          ) : (
            deployments.map(deployment => (
              <Card key={deployment.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold">{deployment.name}</h3>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(deployment.status || 'inactive')}
                        >
                          {deployment.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {deployment.type}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Globe className="w-4 h-4" />
                            <span>{deployment.url || 'URL not generated'}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Updated {getTimeAgo(deployment.lastDeployedAt || deployment.createdAt)}</span>
                          </div>
                        </div>

                        {deployment.resources && typeof deployment.resources === 'object' && Object.keys(deployment.resources).length > 0 ? (
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Activity className="w-3 h-3" />
                              <span>{((deployment.resources as Record<string, unknown>)?.cpu as string) || 'Auto'} CPU</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <BarChart3 className="w-3 h-3" />
                              <span>{((deployment.resources as Record<string, unknown>)?.memory as string) || 'Auto'} Memory</span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {deployment.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVisit(deployment.url)}
                          data-testid={`button-visit-${deployment.id}`}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Visit
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deployMutation.mutate(deployment.id)}
                        disabled={deployMutation.isPending || deployment.status === 'building'}
                        data-testid={`button-deploy-${deployment.id}`}
                      >
                        <Rocket className="w-4 h-4 mr-1" />
                        {deployment.status === 'building' ? 'Building...' : 'Deploy'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleStatusMutation.mutate({
                            id: deployment.id,
                            status: deployment.status || 'inactive',
                          })
                        }
                        data-testid={`button-toggle-${deployment.id}`}
                      >
                        {deployment.status === 'active' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid={`button-settings-${deployment.id}`}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stargate Advantage */}
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Rocket className="w-5 h-5 text-primary" />
              <span>Stargate Deployment Advantages</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>⚡ Instant Zero-Downtime Deploys</span>
              <Badge variant="outline" className="text-primary border-primary">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>🌍 Global Edge Distribution</span>
              <Badge variant="outline" className="text-primary border-primary">
                12 Regions
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>🔄 Auto-scaling to Millions</span>
              <Badge variant="outline" className="text-primary border-primary">
                Unlimited
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
