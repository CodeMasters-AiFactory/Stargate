import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Loader2,
  Trash2,
  FolderOpen,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Globe,
  Clock,
  Sparkles,
  LayoutTemplate,
  Wand2,
  ExternalLink,
  Copy,
  Settings,
  RotateCcw,
  AlertTriangle,
  Trash,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  templateName?: string;
  templatePreview?: string;
  html?: string;
  status: string;
  industry?: string;
  createdAt: string;
  updatedAt: string;
  lastEditedAt?: string;
  deletedAt?: string;
  daysRemaining?: number;
}

interface DashboardViewProps {
  onGenerate: () => void;
  onAIPlan: () => void;
  onAllTools: () => void;
  onLogout?: () => void;
  onOpenProject?: (projectId: string) => void;
  username?: string;
}

type ViewMode = 'projects' | 'trash';

export function DashboardView({ onGenerate, onAIPlan, onAllTools, onLogout, onOpenProject, username }: DashboardViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [trashedProjects, setTrashedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('projects');
  const [showEmptyTrashDialog, setShowEmptyTrashDialog] = useState(false);
  const [emptyingTrash, setEmptyingTrash] = useState(false);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<Project | null>(null);
  const { toast } = useToast();

  // Fetch user projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const [projectsRes, trashRes] = await Promise.all([
        fetch('/api/projects', { credentials: 'include' }),
        fetch('/api/projects/trash', { credentials: 'include' }),
      ]);

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data.projects || []);
      } else if (projectsRes.status === 401) {
        setProjects([]);
      } else {
        setError('Failed to load projects');
      }

      if (trashRes.ok) {
        const data = await trashRes.json();
        setTrashedProjects(data.projects || []);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Show delete confirmation dialog
  const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmProject(project);
  };

  // Delete project (move to trash) - called after confirmation
  const handleConfirmDelete = async () => {
    if (!deleteConfirmProject) return;
    const projectId = deleteConfirmProject.id;

    try {
      setDeletingId(projectId);
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        const deletedProject = projects.find(p => p.id === projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (deletedProject) {
          setTrashedProjects(prev => [{
            ...deletedProject,
            deletedAt: new Date().toISOString(),
            daysRemaining: 60,
          }, ...prev]);
        }
        toast({
          title: 'Moved to trash',
          description: 'Project will be permanently deleted after 60 days.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete project',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('[Dashboard] Error deleting project:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setDeleteConfirmProject(null);
    }
  };

  // Restore project from trash
  const handleRestore = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      setRestoringId(projectId);
      const response = await fetch(`/api/projects/${projectId}/restore`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const restoredProject = trashedProjects.find(p => p.id === projectId);
        setTrashedProjects(prev => prev.filter(p => p.id !== projectId));
        if (restoredProject) {
          setProjects(prev => [restoredProject, ...prev]);
        }
        toast({
          title: 'Project restored',
          description: 'Your project has been restored successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to restore project',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('[Dashboard] Error restoring project:', err);
      toast({
        title: 'Error',
        description: 'Failed to restore project',
        variant: 'destructive',
      });
    } finally {
      setRestoringId(null);
    }
  };

  // Permanently delete project
  const handlePermanentDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('This will permanently delete the project. This cannot be undone.')) return;

    try {
      setDeletingId(projectId);
      const response = await fetch(`/api/projects/${projectId}?permanent=true`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setTrashedProjects(prev => prev.filter(p => p.id !== projectId));
        toast({
          title: 'Permanently deleted',
          description: 'Project has been permanently removed.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete project',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('[Dashboard] Error permanently deleting project:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Empty trash
  const handleEmptyTrash = async () => {
    try {
      setEmptyingTrash(true);
      const response = await fetch('/api/projects/trash/empty', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setTrashedProjects([]);
        toast({
          title: 'Trash emptied',
          description: 'All projects in trash have been permanently deleted.',
        });
      }
    } catch (err) {
      console.error('[Dashboard] Error emptying trash:', err);
      toast({
        title: 'Error',
        description: 'Failed to empty trash',
        variant: 'destructive',
      });
    } finally {
      setEmptyingTrash(false);
      setShowEmptyTrashDialog(false);
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

  // Filter projects by search
  const filteredProjects = (viewMode === 'projects' ? projects : trashedProjects).filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.templateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get a color for project based on industry/name
  const getProjectColor = (project: Project) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-amber-500',
      'from-red-500 to-rose-500',
      'from-indigo-500 to-violet-500',
    ];
    const index = project.name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-full bg-slate-950">
      {/* Header Section */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Title & Search */}
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Wand2 className="w-7 h-7 text-purple-400" />
                  {viewMode === 'projects' ? 'My Projects' : 'Trash'}
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  {viewMode === 'projects'
                    ? `${projects.length} project${projects.length !== 1 ? 's' : ''} total`
                    : `${trashedProjects.length} item${trashedProjects.length !== 1 ? 's' : ''} in trash`
                  }
                </p>
              </div>

              {/* Search */}
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder={viewMode === 'projects' ? 'Search projects...' : 'Search trash...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Right: View Toggle & Actions */}
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-slate-800/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('projects')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'projects'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  Projects
                </button>
                <button
                  onClick={() => setViewMode('trash')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'trash'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Trash className="w-4 h-4" />
                  Trash
                  {trashedProjects.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500/30 rounded-full">
                      {trashedProjects.length}
                    </span>
                  )}
                </button>
              </div>

              {viewMode === 'projects' ? (
                <Button
                  onClick={onGenerate}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25"
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New
                </Button>
              ) : trashedProjects.length > 0 && (
                <Button
                  onClick={() => setShowEmptyTrashDialog(true)}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Empty Trash
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions Row - Only show in projects view */}
        {viewMode === 'projects' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <button
              onClick={onGenerate}
              className="group p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <LayoutTemplate className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-white font-medium text-left">Templates</h3>
              <p className="text-slate-500 text-sm text-left">Browse & select</p>
            </button>

            <button
              onClick={onAIPlan}
              className="group p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-white font-medium text-left">AI Canvas</h3>
              <p className="text-slate-500 text-sm text-left">Build from scratch</p>
            </button>

            <button
              onClick={onAllTools}
              className="group p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10"
            >
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-white font-medium text-left">Deploy</h3>
              <p className="text-slate-500 text-sm text-left">Publish live</p>
            </button>

            <button
              className="group p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/10"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Settings className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-white font-medium text-left">Settings</h3>
              <p className="text-slate-500 text-sm text-left">Configure</p>
            </button>
          </div>
        )}

        {/* Trash Info Banner */}
        {viewMode === 'trash' && trashedProjects.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-200 font-medium">Items in trash are automatically deleted after 60 days</p>
              <p className="text-amber-200/70 text-sm mt-1">
                Restore items to keep them, or empty the trash to free up space immediately.
              </p>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            {viewMode === 'projects' ? (
              <>
                <Clock className="w-4 h-4 text-slate-400" />
                Recent Projects
              </>
            ) : (
              <>
                <Trash className="w-4 h-4 text-slate-400" />
                Deleted Projects
              </>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
            <p className="text-slate-400">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-6">
              {viewMode === 'projects' ? (
                <FolderOpen className="w-10 h-10 text-slate-600" />
              ) : (
                <Trash className="w-10 h-10 text-slate-600" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery
                ? 'No results found'
                : viewMode === 'projects'
                ? 'No projects yet'
                : 'Trash is empty'}
            </h3>
            <p className="text-slate-400 text-center mb-6 max-w-md">
              {searchQuery
                ? `No items match "${searchQuery}". Try a different search.`
                : viewMode === 'projects'
                ? 'Start building your first website. Choose from professional templates or let AI create one for you.'
                : 'Deleted projects will appear here for 60 days before being permanently removed.'}
            </p>
            {!searchQuery && viewMode === 'projects' && (
              <div className="flex gap-3">
                <Button
                  onClick={onGenerate}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  Browse Templates
                </Button>
                <Button
                  variant="outline"
                  onClick={onAIPlan}
                  className="border-slate-700 text-white hover:bg-slate-800"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Canvas
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className={`group relative rounded-xl overflow-hidden bg-slate-900/50 border transition-all cursor-pointer ${
                  viewMode === 'trash'
                    ? 'border-red-900/50 hover:border-red-700/50'
                    : 'border-slate-800 hover:border-slate-700'
                } hover:shadow-xl hover:shadow-black/20`}
                onClick={() => viewMode === 'projects' && onOpenProject?.(project.id)}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                {/* Preview Image / Thumbnail */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  {project.templatePreview || project.html ? (
                    <div className="absolute inset-0 bg-slate-800">
                      {project.templatePreview ? (
                        <img
                          src={project.templatePreview}
                          alt={project.name}
                          className={`w-full h-full object-cover object-top ${viewMode === 'trash' ? 'opacity-50 grayscale' : ''}`}
                        />
                      ) : (
                        <div
                          className={`w-full h-full transform scale-[0.25] origin-top-left ${viewMode === 'trash' ? 'opacity-50 grayscale' : ''}`}
                          style={{ width: '400%', height: '400%' }}
                          dangerouslySetInnerHTML={{ __html: project.html?.slice(0, 5000) || '' }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${getProjectColor(project)} ${viewMode === 'trash' ? 'opacity-30 grayscale' : 'opacity-80'}`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl font-bold text-white/30">
                          {project.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className={`absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-opacity ${hoveredProject === project.id ? 'opacity-100' : 'opacity-0'}`}>
                    {viewMode === 'projects' ? (
                      <>
                        <Button
                          size="sm"
                          className="bg-white text-black hover:bg-white/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenProject?.(project.id);
                          }}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white/10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-500 text-white"
                          onClick={(e) => handleDeleteClick(project, e)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-500"
                          onClick={(e) => handleRestore(project.id, e)}
                          disabled={restoringId === project.id}
                        >
                          {restoringId === project.id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <RotateCcw className="w-4 h-4 mr-1" />
                          )}
                          Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-500"
                          onClick={(e) => handlePermanentDelete(project.id, e)}
                          disabled={deletingId === project.id}
                        >
                          {deletingId === project.id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-1" />
                          )}
                          Delete
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {viewMode === 'trash' ? (
                      <Badge className="bg-red-500/90 text-white text-xs">
                        {project.daysRemaining} days left
                      </Badge>
                    ) : (
                      <Badge
                        className={`text-xs ${
                          project.status === 'published'
                            ? 'bg-green-500/90 text-white'
                            : 'bg-slate-700/90 text-slate-300'
                        }`}
                      >
                        {project.status === 'published' ? 'Live' : 'Draft'}
                      </Badge>
                    )}
                  </div>

                  {/* More Menu - Only for projects view */}
                  {viewMode === 'projects' && (
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                          <DropdownMenuItem className="text-slate-300 hover:text-white focus:text-white focus:bg-slate-800">
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-300 hover:text-white focus:text-white focus:bg-slate-800">
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-300 hover:text-white focus:text-white focus:bg-slate-800">
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-300 hover:text-white focus:text-white focus:bg-slate-800">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in new tab
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-700" />
                          <DropdownMenuItem
                            className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-900/20"
                            onClick={(e) => handleDeleteClick(project, e as unknown as React.MouseEvent)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                {/* Project Info */}
                <div className="p-4">
                  <h3 className={`font-semibold truncate mb-1 transition-colors ${
                    viewMode === 'trash' ? 'text-slate-400' : 'text-white group-hover:text-purple-400'
                  }`}>
                    {project.name}
                  </h3>
                  {project.templateName && (
                    <p className="text-sm text-slate-500 truncate mb-2">
                      {project.templateName}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {viewMode === 'trash'
                        ? `Deleted ${formatTime(project.deletedAt)}`
                        : formatTime(project.lastEditedAt || project.updatedAt)
                      }
                    </span>
                    {project.industry && viewMode === 'projects' && (
                      <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                        {project.industry}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* New Project Card - Only in projects view */}
            {viewMode === 'projects' && (
              <button
                onClick={onGenerate}
                className="rounded-xl border-2 border-dashed border-slate-700 hover:border-purple-500/50 bg-slate-900/30 hover:bg-slate-800/30 transition-all flex flex-col items-center justify-center p-8 min-h-[240px] group"
              >
                <div className="w-14 h-14 rounded-xl bg-slate-800 group-hover:bg-purple-500/20 flex items-center justify-center mb-4 transition-colors">
                  <Plus className="w-7 h-7 text-slate-500 group-hover:text-purple-400 transition-colors" />
                </div>
                <span className="text-slate-400 group-hover:text-white font-medium transition-colors">Create New Project</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmProject} onOpenChange={(open) => !open && setDeleteConfirmProject(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete <span className="font-semibold text-white">"{deleteConfirmProject?.name}"</span>?
              <br /><br />
              The project will be moved to trash and permanently deleted after 60 days. You can restore it from trash if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deletingId === deleteConfirmProject?.id}
              className="bg-red-600 hover:bg-red-500"
            >
              {deletingId === deleteConfirmProject?.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Yes, Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Empty Trash Confirmation Dialog */}
      <AlertDialog open={showEmptyTrashDialog} onOpenChange={setShowEmptyTrashDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Empty Trash?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete all {trashedProjects.length} project{trashedProjects.length !== 1 ? 's' : ''} in the trash.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmptyTrash}
              disabled={emptyingTrash}
              className="bg-red-600 hover:bg-red-500"
            >
              {emptyingTrash ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Emptying...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Empty Trash
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
