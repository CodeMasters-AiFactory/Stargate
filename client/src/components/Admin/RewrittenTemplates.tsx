/**
 * Rewritten Templates Component
 * Complete workflow: Select templates to rewrite → Progress bar → View completed
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  FileText,
  Calendar,
  Search,
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  CheckSquare,
  Square
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface TemplateQAStatus {
  id: string;
  name: string;
  contentRewritten: boolean;
  imagesRegenerated: boolean;
  seoEvaluated: boolean;
  verified: boolean;
  errors: string[];
  lastUpdated?: string;
}

interface RewriteProgress {
  isRewriting: boolean;
  currentTemplate: string;
  currentIndex: number;
  totalCount: number;
  completed: string[];
  failed: string[];
}

export function RewrittenTemplates() {
  const { toast } = useToast();
  const [allTemplates, setAllTemplates] = useState<TemplateQAStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<RewriteProgress>({
    isRewriting: false,
    currentTemplate: '',
    currentIndex: 0,
    totalCount: 0,
    completed: [],
    failed: []
  });

  // Templates that need rewriting (not yet rewritten)
  const pendingTemplates = allTemplates.filter(t => !t.contentRewritten);
  
  // Templates that are already rewritten
  const rewrittenTemplates = allTemplates.filter(t => t.contentRewritten);

  // Filtered pending templates based on search
  const filteredPendingTemplates = pendingTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered rewritten templates based on search
  const filteredRewrittenTemplates = rewrittenTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchTemplateStatus();
  }, []);

  const fetchTemplateStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/templates/qa/status', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setAllTemplates(data.templates || []);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch templates',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[RewrittenTemplates] Error fetching status:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectTemplate = (templateId: string) => {
    const newSelected = new Set(selectedTemplates);
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId);
    } else {
      newSelected.add(templateId);
    }
    setSelectedTemplates(newSelected);
  };

  const selectAllPending = () => {
    const allPendingIds = new Set(filteredPendingTemplates.map(t => t.id));
    setSelectedTemplates(allPendingIds);
  };

  const deselectAll = () => {
    setSelectedTemplates(new Set());
  };

  const rewriteTemplates = async (templateIds: string[]) => {
    if (templateIds.length === 0) {
      toast({
        title: 'No Templates Selected',
        description: 'Please select templates to rewrite',
        variant: 'destructive',
      });
      return;
    }

    setProgress({
      isRewriting: true,
      currentTemplate: '',
      currentIndex: 0,
      totalCount: templateIds.length,
      completed: [],
      failed: []
    });

    const completed: string[] = [];
    const failed: string[] = [];

    for (let i = 0; i < templateIds.length; i++) {
      const templateId = templateIds[i];
      const template = allTemplates.find(t => t.id === templateId);
      
      setProgress(prev => ({
        ...prev,
        currentTemplate: template?.name || templateId,
        currentIndex: i + 1
      }));

      try {
        const response = await fetch(`/api/admin/templates/qa/rewrite-content/${templateId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const data = await response.json();
        
        if (data.success) {
          completed.push(templateId);
          setProgress(prev => ({
            ...prev,
            completed: [...prev.completed, templateId]
          }));
        } else {
          console.error(`[RewrittenTemplates] Rewrite failed for ${templateId}:`, data.error);
          failed.push(templateId);
          setProgress(prev => ({
            ...prev,
            failed: [...prev.failed, templateId]
          }));
        }
      } catch (error) {
        console.error(`[RewrittenTemplates] Error rewriting template ${templateId}:`, error);
        failed.push(templateId);
        setProgress(prev => ({
          ...prev,
          failed: [...prev.failed, templateId]
        }));
      }

      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setProgress(prev => ({
      ...prev,
      isRewriting: false
    }));

    // Refresh templates list
    await fetchTemplateStatus();
    setSelectedTemplates(new Set());

    toast({
      title: 'Rewriting Complete',
      description: `${completed.length} succeeded, ${failed.length} failed`,
      variant: failed.length > 0 ? 'destructive' : 'default',
    });
  };

  const handleRewriteSelected = () => {
    rewriteTemplates(Array.from(selectedTemplates));
  };

  const handleRewriteAll = () => {
    const allPendingIds = pendingTemplates.map(t => t.id);
    rewriteTemplates(allPendingIds);
  };

  const progressPercentage = progress.totalCount > 0 
    ? Math.round((progress.currentIndex / progress.totalCount) * 100)
    : 0;

  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900 -m-6 p-6 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-blue-700 dark:text-blue-300">Rewritten Templates</h2>
          <p className="text-blue-600 dark:text-blue-400">
            Rewrite templates with AI-generated content and manage completed rewrites
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTemplateStatus}
          disabled={loading || progress.isRewriting}
          className="border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-300 dark:border-amber-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Rewrite</p>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{pendingTemplates.length}</p>
              </div>
              <FileText className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-300 dark:border-green-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{rewrittenTemplates.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section - Only visible during rewriting */}
      {progress.isRewriting && (
        <Card className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 border-blue-400 dark:border-blue-600 animate-pulse">
          <CardHeader className="bg-blue-200/50 dark:bg-blue-800/50 border-b border-blue-400 dark:border-blue-600">
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
              Rewriting Templates...
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              {progress.currentIndex} of {progress.totalCount} templates
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  Current: {progress.currentTemplate}
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  {progressPercentage}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3 bg-blue-200 dark:bg-blue-800" />
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 dark:text-green-400">
                ✓ Completed: {progress.completed.length}
              </span>
              {progress.failed.length > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  ✗ Failed: {progress.failed.length}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TOP SECTION: Templates Pending Rewrite */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
        <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <FileText className="w-5 h-5 text-amber-500" />
                Templates Pending Rewrite ({pendingTemplates.length})
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-400">
                Select templates to rewrite with AI-generated content
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllPending}
                disabled={progress.isRewriting || pendingTemplates.length === 0}
                className="border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deselectAll}
                disabled={progress.isRewriting || selectedTemplates.size === 0}
                className="border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <Square className="w-4 h-4 mr-2" />
                Deselect
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleRewriteSelected}
                disabled={progress.isRewriting || selectedTemplates.size === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Rewrite Selected ({selectedTemplates.size})
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleRewriteAll}
                disabled={progress.isRewriting || pendingTemplates.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Rewrite All ({pendingTemplates.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900 pt-4">
          {/* Search for pending */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-blue-900/50 border-blue-300 dark:border-blue-700"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
          ) : filteredPendingTemplates.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-green-600 dark:text-green-400 font-medium">All templates have been rewritten!</p>
              <p className="text-sm text-muted-foreground mt-2">
                {pendingTemplates.length === 0 ? 'No pending templates' : 'No templates match your search'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredPendingTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplates.has(template.id)
                      ? 'bg-blue-100 dark:bg-blue-800/50 border-blue-400 dark:border-blue-500'
                      : 'bg-white dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/40'
                  }`}
                  onClick={() => !progress.isRewriting && toggleSelectTemplate(template.id)}
                >
                  <Checkbox
                    checked={selectedTemplates.has(template.id)}
                    disabled={progress.isRewriting}
                    onCheckedChange={() => toggleSelectTemplate(template.id)}
                    className="border-blue-400 data-[state=checked]:bg-blue-600"
                  />
                  <FileText className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-blue-900 dark:text-blue-100 truncate">
                      {template.name}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300">
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* BOTTOM SECTION: Completed Rewritten Templates */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
        <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Completed Rewrites ({rewrittenTemplates.length})
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            Templates that have been successfully rewritten and are ready for use
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900 pt-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading rewritten templates...</div>
          ) : filteredRewrittenTemplates.length === 0 ? (
            <div className="text-center py-8">
              {rewrittenTemplates.length === 0 ? (
                <>
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No templates have been rewritten yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Select templates above and click "Rewrite Selected" to begin.
                  </p>
                </>
              ) : (
                <>
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No rewritten templates match "{searchQuery}"</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredRewrittenTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-blue-900 dark:text-blue-100 truncate">
                        {template.name}
                      </div>
                      {template.lastUpdated && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                          <Calendar className="w-3 h-3" />
                          Rewritten: {new Date(template.lastUpdated).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-300">
                    ✓ Complete
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
