import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Plus,
  Check,
  AlertTriangle,
  Clock,
  User,
  FileText,
  RefreshCw,
  Upload,
  Download,
  Eye,
  Code,
  Trash2,
  Copy,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { NavigationButtons } from './BackButton';

interface GitStatus {
  currentBranch: string;
  isDirty: boolean;
  ahead: number;
  behind: number;
  untracked: string[];
  modified: string[];
  staged: string[];
  conflicts: string[];
}

interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  files: number;
}

interface GitBranch {
  name: string;
  current: boolean;
  remote?: string;
  lastCommit?: string;
  ahead?: number;
  behind?: number;
}

export function GitManager() {
  const [commitMessage, setCommitMessage] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'status' | 'history' | 'branches' | 'conflicts'>(
    'status'
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Git status query
  const { data: gitStatus } = useQuery({
    queryKey: ['/api/git/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/git/status');
      return response as unknown as GitStatus;
    },
    refetchInterval: false, // DISABLED - was causing excessive polling and freezing
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Only fetch on mount
  });

  // Git history query - DISABLED AUTO-REFETCH to prevent excessive polling
  const { data: gitHistory } = useQuery({
    queryKey: ['/api/git/history'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/git/history');
      return response as unknown as GitCommit[];
    },
    refetchInterval: false, // DISABLED - was causing excessive polling
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Only fetch on mount
  });

  // Git branches query - DISABLED AUTO-REFETCH to prevent excessive polling
  const { data: gitBranches } = useQuery({
    queryKey: ['/api/git/branches'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/git/branches');
      return response as unknown as GitBranch[];
    },
    refetchInterval: false, // DISABLED - was causing excessive polling
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Only fetch on mount
    staleTime: Infinity, // Never consider stale
  });

  // Commit mutation
  const commitMutation = useMutation({
    mutationFn: async ({ message, files }: { message: string; files: string[] }) => {
      return await apiRequest('POST', '/api/git/commit', { message, files });
    },
    onSuccess: () => {
      setCommitMessage('');
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: ['/api/git/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/git/history'] });
      toast({
        title: 'Commit Successful',
        description: 'Changes have been committed to the repository',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Commit Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Branch operations
  const branchMutation = useMutation({
    mutationFn: async ({
      action,
      name,
    }: {
      action: 'create' | 'switch' | 'delete';
      name: string;
    }) => {
      return await apiRequest('POST', '/api/git/branch', { action, name });
    },
    onSuccess: (_, variables) => {
      setNewBranchName('');
      queryClient.invalidateQueries({ queryKey: ['/api/git/branches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/git/status'] });
      toast({
        title: `Branch ${variables.action === 'create' ? 'Created' : variables.action === 'switch' ? 'Switched' : 'Deleted'}`,
        description: `Successfully ${variables.action === 'create' ? 'created' : variables.action === 'switch' ? 'switched to' : 'deleted'} branch "${variables.name}"`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Branch Operation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Sync operations
  const syncMutation = useMutation({
    mutationFn: async ({ action }: { action: 'pull' | 'push' }) => {
      return await apiRequest('POST', '/api/git/sync', { action });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/git/status'] });
      toast({
        title: `${variables.action === 'pull' ? 'Pull' : 'Push'} Successful`,
        description: `Changes ${variables.action === 'pull' ? 'pulled from' : 'pushed to'} remote repository`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Sync Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCommit = () => {
    if (!commitMessage.trim()) {
      toast({
        title: 'Commit Message Required',
        description: 'Please enter a commit message',
        variant: 'destructive',
      });
      return;
    }

    const filesToCommit =
      selectedFiles.length > 0
        ? selectedFiles
        : [...(gitStatus?.staged || []), ...(gitStatus?.modified || [])];

    commitMutation.mutate({
      message: commitMessage,
      files: filesToCommit,
    });
  };

  const toggleFileSelection = (file: string) => {
    setSelectedFiles(prev =>
      prev.includes(file) ? prev.filter(f => f !== file) : [...prev, file]
    );
  };

  const getStatusColor = (status: GitStatus | undefined) => {
    if (!status) return 'text-gray-500';
    if (status.conflicts.length > 0) return 'text-red-500';
    if (status.isDirty) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = (status: GitStatus | undefined) => {
    if (!status) return Clock;
    if (status.conflicts.length > 0) return AlertTriangle;
    if (status.isDirty) return RefreshCw;
    return Check;
  };

  const StatusIcon = getStatusIcon(gitStatus);

  return (
    <div className="h-full bg-background overflow-y-auto" data-testid="git-manager">
      <div className="w-full px-8 py-8">
        <NavigationButtons backDestination="dashboard" className="mb-4" />
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <GitBranch className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Git Version Control
              </span>
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
              Advanced
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${getStatusColor(gitStatus)}`}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-semibold">{gitStatus?.currentBranch || 'main'}</span>
            </div>
            {gitStatus && (gitStatus.ahead > 0 || gitStatus.behind > 0) && (
              <div className="flex items-center space-x-2 text-sm">
                {gitStatus.ahead > 0 && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ↑{gitStatus.ahead}
                  </Badge>
                )}
                {gitStatus.behind > 0 && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    ↓{gitStatus.behind}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
          {[
            { id: 'status', label: 'Status', icon: GitCommit },
            { id: 'history', label: 'History', icon: Clock },
            { id: 'branches', label: 'Branches', icon: GitBranch },
            { id: 'conflicts', label: 'Conflicts', icon: AlertTriangle },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center space-x-2"
                data-testid={`button-tab-${tab.id}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'status' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Repository Status</span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => syncMutation.mutate({ action: 'pull' })}
                        disabled={syncMutation.isPending}
                        data-testid="button-git-pull"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Pull
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => syncMutation.mutate({ action: 'push' })}
                        disabled={syncMutation.isPending || !gitStatus?.ahead}
                        data-testid="button-git-push"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Push
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Changed Files */}
                  {gitStatus && (
                    <div className="space-y-4">
                      {gitStatus.modified.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-orange-600 mb-2">
                            Modified Files ({gitStatus.modified.length})
                          </h4>
                          <div className="space-y-2">
                            {gitStatus.modified.map(file => (
                              <div
                                key={file}
                                className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950/20 rounded"
                              >
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedFiles.includes(file)}
                                    onChange={() => toggleFileSelection(file)}
                                    className="rounded"
                                  />
                                  <FileText className="w-4 h-4 text-orange-500" />
                                  <span className="text-sm font-mono">{file}</span>
                                </div>
                                <Button size="sm" variant="ghost">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {gitStatus.staged.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-green-600 mb-2">
                            Staged Files ({gitStatus.staged.length})
                          </h4>
                          <div className="space-y-2">
                            {gitStatus.staged.map(file => (
                              <div
                                key={file}
                                className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded"
                              >
                                <div className="flex items-center space-x-2">
                                  <Check className="w-4 h-4 text-green-500" />
                                  <FileText className="w-4 h-4" />
                                  <span className="text-sm font-mono">{file}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {gitStatus.untracked.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-blue-600 mb-2">
                            Untracked Files ({gitStatus.untracked.length})
                          </h4>
                          <div className="space-y-2">
                            {gitStatus.untracked.map(file => (
                              <div
                                key={file}
                                className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 rounded"
                              >
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedFiles.includes(file)}
                                    onChange={() => toggleFileSelection(file)}
                                    className="rounded"
                                  />
                                  <Plus className="w-4 h-4 text-blue-500" />
                                  <span className="text-sm font-mono">{file}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Separator />

                  {/* Commit Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Commit Changes</h4>
                    <Textarea
                      placeholder="Enter commit message..."
                      value={commitMessage}
                      onChange={e => setCommitMessage(e.target.value)}
                      className="min-h-[100px]"
                      data-testid="textarea-commit-message"
                    />
                    <Button
                      onClick={handleCommit}
                      disabled={commitMutation.isPending || !commitMessage.trim()}
                      className="w-full"
                      data-testid="button-commit"
                    >
                      {commitMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Committing...
                        </>
                      ) : (
                        <>
                          <GitCommit className="w-4 h-4 mr-2" />
                          Commit Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'history' && (
              <Card>
                <CardHeader>
                  <CardTitle>Commit History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gitHistory?.map(commit => (
                      <div key={commit.hash} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Code className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono text-sm text-muted-foreground">
                              {commit.hash.substring(0, 8)}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">{commit.date}</span>
                        </div>
                        <p className="font-semibold">{commit.message}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{commit.author}</span>
                          </div>
                          <span>{commit.files} files changed</span>
                        </div>
                      </div>
                    )) || (
                      <p className="text-center text-muted-foreground py-8">
                        No commit history available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'branches' && (
              <Card>
                <CardHeader>
                  <CardTitle>Branch Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Create Branch */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="New branch name..."
                      value={newBranchName}
                      onChange={e => setNewBranchName(e.target.value)}
                      data-testid="input-new-branch-name"
                    />
                    <Button
                      onClick={() =>
                        branchMutation.mutate({ action: 'create', name: newBranchName })
                      }
                      disabled={branchMutation.isPending || !newBranchName.trim()}
                      data-testid="button-create-branch"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create
                    </Button>
                  </div>

                  <Separator />

                  {/* Branch List */}
                  <div className="space-y-2">
                    {gitBranches?.map(branch => (
                      <div
                        key={branch.name}
                        className={`p-3 rounded-lg border ${branch.current ? 'bg-primary/10 border-primary' : 'bg-muted/50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <GitBranch
                              className={`w-4 h-4 ${branch.current ? 'text-primary' : 'text-muted-foreground'}`}
                            />
                            <span
                              className={`font-semibold ${branch.current ? 'text-primary' : ''}`}
                            >
                              {branch.name}
                            </span>
                            {branch.current && (
                              <Badge variant="default" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {!branch.current && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    branchMutation.mutate({ action: 'switch', name: branch.name })
                                  }
                                  disabled={branchMutation.isPending}
                                  data-testid={`button-switch-${branch.name}`}
                                >
                                  Switch
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    branchMutation.mutate({ action: 'delete', name: branch.name })
                                  }
                                  disabled={branchMutation.isPending}
                                  data-testid={`button-delete-${branch.name}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )) || (
                      <p className="text-center text-muted-foreground py-8">No branches found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'conflicts' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span>Merge Conflicts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gitStatus?.conflicts && gitStatus.conflicts.length > 0 ? (
                    <div className="space-y-4">
                      {gitStatus.conflicts.map(file => (
                        <div
                          key={file}
                          className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20 rounded"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-red-700">{file}</span>
                            <Button size="sm" variant="outline">
                              <Code className="w-4 h-4 mr-2" />
                              Resolve
                            </Button>
                          </div>
                          <p className="text-sm text-red-600">
                            This file has merge conflicts that need to be resolved manually.
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">No merge conflicts detected</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Repository Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {gitHistory?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Commits</div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {gitBranches?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Branches</div>
                  </div>
                </div>

                {gitStatus && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Modified:</span>
                      <span className="font-semibold text-orange-600">
                        {gitStatus.modified.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Staged:</span>
                      <span className="font-semibold text-green-600">
                        {gitStatus.staged.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Untracked:</span>
                      <span className="font-semibold text-blue-600">
                        {gitStatus.untracked.length}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Copy className="w-4 h-4 mr-2" />
                  Clone Repository
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <GitMerge className="w-4 h-4 mr-2" />
                  Merge Branch
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <GitPullRequest className="w-4 h-4 mr-2" />
                  Create PR
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
