import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Key, Plus, Edit, Trash2, Shield, Copy, CheckCircle } from 'lucide-react';

interface ProjectSecret {
  id: string;
  keyName: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SecretsManagerProps {
  projectId: string;
}

export function SecretsManager({ projectId }: SecretsManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [, setEditingSecret] = useState<ProjectSecret | null>(null);
  const [newSecret, setNewSecret] = useState({ keyName: '', value: '', description: '' });
  const [editSecret, setEditSecret] = useState({ value: '', description: '' });
  const [copiedKeys, setCopiedKeys] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch project secrets - DISABLED AUTO-REFETCH to prevent excessive polling
  const { data: secrets = [], isLoading } = useQuery({
    queryKey: ['/api/projects', projectId, 'secrets'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/projects/${projectId}/secrets`);
      return response as unknown as ProjectSecret[];
    },
    refetchInterval: false, // Disable auto-refetch
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Only fetch on mount
    staleTime: Infinity, // Never consider stale
  });

  // Create secret mutation
  const createSecretMutation = useMutation({
    mutationFn: async (data: { keyName: string; value: string; description: string }) => {
      return apiRequest('POST', `/api/projects/${projectId}/secrets`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'secrets'] });
      setIsCreateOpen(false);
      setNewSecret({ keyName: '', value: '', description: '' });
      toast({
        title: 'Secret Created',
        description: 'Your secret has been encrypted and stored securely.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Create Secret',
        description: error.message || 'An error occurred while creating the secret.',
        variant: 'destructive',
      });
    },
  });

  // Update secret mutation
  const updateSecretMutation = useMutation({
    mutationFn: async ({
      secretId,
      data,
    }: {
      secretId: string;
      data: { value: string; description: string };
    }) => {
      return apiRequest('PUT', `/api/projects/${projectId}/secrets/${secretId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'secrets'] });
      setEditingSecret(null);
      setEditSecret({ value: '', description: '' });
      toast({
        title: 'Secret Updated',
        description: 'Your secret has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Update Secret',
        description: error.message || 'An error occurred while updating the secret.',
        variant: 'destructive',
      });
    },
  });

  // Delete secret mutation
  const deleteSecretMutation = useMutation({
    mutationFn: async (secretId: string) => {
      return apiRequest('DELETE', `/api/projects/${projectId}/secrets/${secretId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'secrets'] });
      toast({
        title: 'Secret Deleted',
        description: 'The secret has been permanently deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Delete Secret',
        description: error.message || 'An error occurred while deleting the secret.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateSecret = () => {
    if (!newSecret.keyName || !newSecret.value) {
      toast({
        title: 'Validation Error',
        description: 'Key name and value are required.',
        variant: 'destructive',
      });
      return;
    }
    createSecretMutation.mutate(newSecret);
  };

  const handleUpdateSecret = (secret: ProjectSecret) => {
    if (!editSecret.value) {
      toast({
        title: 'Validation Error',
        description: 'Value is required.',
        variant: 'destructive',
      });
      return;
    }
    updateSecretMutation.mutate({ secretId: secret.id, data: editSecret });
  };

  const handleCopyKey = async (keyName: string) => {
    try {
      await navigator.clipboard.writeText(keyName);
      setCopiedKeys(prev => ({ ...prev, [keyName]: true }));
      setTimeout(() => {
        setCopiedKeys(prev => ({ ...prev, [keyName]: false }));
      }, 2000);
      toast({
        title: 'Copied',
        description: `Key name "${keyName}" copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy key name to clipboard.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4" data-testid="secrets-manager">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Secrets</h2>
          <Badge variant="secondary">{(secrets as ProjectSecret[]).length}</Badge>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-secret">
              <Plus className="h-4 w-4 mr-2" />
              Add Secret
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Secret</DialogTitle>
              <DialogDescription>
                Create a new encrypted secret for your project. These will be available as
                environment variables.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="API_KEY"
                  value={newSecret.keyName}
                  onChange={e => setNewSecret(prev => ({ ...prev, keyName: e.target.value }))}
                  data-testid="input-secret-key-name"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use UPPERCASE with underscores (e.g., DATABASE_URL, API_KEY)
                </p>
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Textarea
                  id="value"
                  placeholder="Enter secret value..."
                  value={newSecret.value}
                  onChange={e => setNewSecret(prev => ({ ...prev, value: e.target.value }))}
                  data-testid="input-secret-value"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="What is this secret used for?"
                  value={newSecret.description}
                  onChange={e => setNewSecret(prev => ({ ...prev, description: e.target.value }))}
                  data-testid="input-secret-description"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreateSecret}
                  disabled={createSecretMutation.isPending}
                  data-testid="button-create-secret"
                >
                  {createSecretMutation.isPending ? 'Creating...' : 'Create Secret'}
                </Button>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {(secrets as ProjectSecret[]).length === 0 ? (
        <Card data-testid="empty-secrets-state">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Key className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No secrets yet</h3>
                <p className="text-muted-foreground">
                  Add your first secret to securely store API keys, tokens, and other sensitive
                  data.
                </p>
              </div>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Secret
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {(secrets as ProjectSecret[]).map((secret: ProjectSecret) => (
            <Card
              key={secret.id}
              className="hover:shadow-sm transition-shadow"
              data-testid={`card-secret-${secret.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {secret.keyName}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyKey(secret.keyName)}
                        data-testid={`button-copy-key-${secret.id}`}
                      >
                        {copiedKeys[secret.keyName] ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    {secret.description && (
                      <p className="text-sm text-muted-foreground">{secret.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(secret.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          data-testid={`button-edit-secret-${secret.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Secret</DialogTitle>
                          <DialogDescription>
                            Update the value and description for <code>{secret.keyName}</code>
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="editValue">New Value</Label>
                            <Textarea
                              id="editValue"
                              placeholder="Enter new secret value..."
                              value={editSecret.value}
                              onChange={e =>
                                setEditSecret(prev => ({ ...prev, value: e.target.value }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="editDescription">Description</Label>
                            <Input
                              id="editDescription"
                              placeholder="What is this secret used for?"
                              value={editSecret.description}
                              onChange={e =>
                                setEditSecret(prev => ({ ...prev, description: e.target.value }))
                              }
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleUpdateSecret(secret)}
                              disabled={updateSecretMutation.isPending}
                            >
                              {updateSecretMutation.isPending ? 'Updating...' : 'Update Secret'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete "${secret.keyName}"? This action cannot be undone.`
                          )
                        ) {
                          deleteSecretMutation.mutate(secret.id);
                        }
                      }}
                      disabled={deleteSecretMutation.isPending}
                      data-testid={`button-delete-secret-${secret.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
