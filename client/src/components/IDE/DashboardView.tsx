import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Code, BarChart3, Brain, Activity, ExternalLink, Zap, Plus, Loader2, Trash2, FolderOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ProjectThumbnail } from '@/components/Projects/ProjectThumbnail';

interface Project {
  id: string;
  name: string;
  templateName?: string;
  templatePreview?: string;
  status: string;
  industry?: string;
  createdAt: string;
  updatedAt: string;
  lastEditedAt?: string;
}

interface DashboardViewProps {
  onGenerate: () => void;
  onAIPlan: () => void;
  onAllTools: () => void;
  onLogout?: () => void;
  onOpenProject?: (projectId: string) => void;
  username?: string;
}

export function DashboardView({ onGenerate, onAIPlan, onAllTools, onLogout, onOpenProject, username }: DashboardViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch user projects
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const response = await fetch('/api/projects', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
        } else if (response.status === 401) {
          // Not logged in - show empty state
          setProjects([]);
        } else {
          setError('Failed to load projects');
        }
      } catch (err) {
        console.error('[Dashboard] Error fetching projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Delete project
  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      setDeletingId(projectId);
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } else {
        alert('Failed to delete project');
      }
    } catch (err) {
      console.error('[Dashboard] Error deleting project:', err);
      alert('Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  // Format relative time
  const formatTime = (dateStr: string | undefined) => {
    if (!dateStr) return 'Never';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Stats
  const stats = {
    total: projects.length,
    published: projects.filter(p => p.status === 'published').length,
    drafts: projects.filter(p => p.status === 'draft').length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-12">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 to-purple-950 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back{username ? `, ${username}` : ''}!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {projects.length > 0
                  ? `You have ${projects.length} project${projects.length === 1 ? '' : 's'}. Ready to build something new?`
                  : 'Ready to build something amazing today?'}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={onGenerate}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
                data-testid="button-new-project"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
              <Button variant="outline" onClick={onAIPlan} data-testid="button-ai-assistant">
                <Brain className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
              {onLogout && (
                <Button variant="ghost" onClick={onLogout} data-testid="button-logout">
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Projects
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Published
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.published}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Drafts
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.drafts}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Templates</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">7,280</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Your Projects</h3>
          {projects.length > 6 && (
            <Button variant="outline" size="sm" data-testid="button-view-all-projects">
              View All Projects
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading your projects...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No projects yet
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first website project by selecting a template
            </p>
            <Button onClick={onGenerate} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.slice(0, 6).map(project => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                data-testid={`project-card-${project.id}`}
                onClick={() => onOpenProject?.(project.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <ProjectThumbnail
                      projectName={project.name}
                      industry={project.industry}
                      templateName={project.templateName}
                      templatePreview={project.templatePreview}
                      size="md"
                    />
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(project.status)}>
                        {project.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => handleDelete(project.id, e)}
                        disabled={deletingId === project.id}
                      >
                        {deletingId === project.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {project.name}
                  </h4>
                  {project.templateName && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Based on: {project.templateName}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Updated {formatTime(project.lastEditedAt || project.updatedAt)}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProject?.(project.id);
                      }}
                    >
                      <Code className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    {project.status === 'published' && (
                      <Button size="sm" variant="outline" className="flex-1">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-24 flex flex-col space-y-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 hover:shadow-lg transition-all"
            onClick={onGenerate}
            data-testid="quick-action-generate"
          >
            <Code className="w-8 h-8 text-blue-600" />
            <span>New Website</span>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex flex-col space-y-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 hover:shadow-lg transition-all"
            onClick={onAIPlan}
            data-testid="quick-action-ai-plan"
          >
            <Brain className="w-8 h-8 text-purple-600" />
            <span>AI Planning</span>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex flex-col space-y-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 hover:shadow-lg transition-all"
            onClick={onAllTools}
            data-testid="quick-action-all-tools"
          >
            <Zap className="w-8 h-8 text-green-600" />
            <span>All Tools</span>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex flex-col space-y-2 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 hover:shadow-lg transition-all"
            data-testid="quick-action-analytics"
          >
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <span>Analytics</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
