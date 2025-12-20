/**
 * Reimaged Templates Component
 * Complete workflow: Select templates to reimage → Progress bar → View completed
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Image, 
  FileText,
  Calendar,
  Search,
  AlertCircle,
  RefreshCw,
  Play,
  RotateCcw,
  CheckSquare,
  Square,
  CheckCircle2
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

interface ReimageProgress {
  isReimaging: boolean;
  currentTemplate: string;
  currentIndex: number;
  totalCount: number;
  completed: string[];
  failed: string[];
}

export function ReimagedTemplates() {
  const { toast } = useToast();
  const [allTemplates, setAllTemplates] = useState<TemplateQAStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<ReimageProgress>({
    isReimaging: false,
    currentTemplate: '',
    currentIndex: 0,
    totalCount: 0,
    completed: [],
    failed: []
  });

  // Templates that need reimaging (rewritten but not yet reimaged)
  const pendingTemplates = allTemplates.filter(t => t.contentRewritten && !t.imagesRegenerated);
  
  // Templates that are already reimaged
  const reimagedTemplates = allTemplates.filter(t => t.imagesRegenerated);

  // Filtered pending templates based on search
  const filteredPendingTemplates = pendingTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered reimaged templates based on search
  const filteredReimagedTemplates = reimagedTemplates.filter(template =>
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
      console.error('[ReimagedTemplates] Error fetching status:', error);
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

  const reimageTemplates = async (templateIds: string[]) => {
    if (templateIds.length === 0) {
      toast({
        title: 'No Templates Selected',
        description: 'Please select templates to reimage',
        variant: 'destructive',
      });
      return;
    }

    setProgress({
      isReimaging: true,
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
        const response = await fetch(`/api/admin/templates/qa/regenerate-image/${templateId}`, {
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
          console.error(`[ReimagedTemplates] Reimage failed for ${templateId}:`, data.error);
          failed.push(templateId);
          setProgress(prev => ({
            ...prev,
            failed: [...prev.failed, templateId]
          }));
        }
      } catch (error) {
        console.error(`[ReimagedTemplates] Error reimaging template ${templateId}:`, error);
        failed.push(templateId);
        setProgress(prev => ({
          ...prev,
          failed: [...prev.failed, templateId]
        }));
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setProgress(prev => ({
      ...prev,
      isReimaging: false
    }));

    // Refresh templates list
    await fetchTemplateStatus();
    setSelectedTemplates(new Set());

    toast({
      title: 'Reimaging Complete',
      description: `${completed.length} succeeded, ${failed.length} failed`,
      variant: failed.length > 0 ? 'destructive' : 'default',
    });
  };

  const handleReimageSelected = () => {
    reimageTemplates(Array.from(selectedTemplates));
  };

  const handleReimageAll = () => {
    const allPendingIds = pendingTemplates.map(t => t.id);
    reimageTemplates(allPendingIds);
  };

  const progressPercentage = progress.totalCount > 0 
    ? Math.round((progress.currentIndex / progress.totalCount) * 100)
    : 0;

  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900 -m-6 p-6 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-blue-700 dark:text-blue-300">Reimaged Templates</h2>
          <p className="text-blue-600 dark:text-blue-400">
            Regenerate images with AI (Leonardo) and manage completed reimages
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTemplateStatus}
          disabled={loading || progress.isReimaging}
          className="border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-300 dark:border-purple-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Reimage</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{pendingTemplates.length}</p>
              </div>
              <Image className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-300 dark:border-green-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{reimagedTemplates.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section - Only visible during reimaging */}
      {progress.isReimaging && (
        <Card className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 border-purple-400 dark:border-purple-600 animate-pulse">
          <CardHeader className="bg-purple-200/50 dark:bg-purple-800/50 border-b border-purple-400 dark:border-purple-600">
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <RefreshCw className="w-5 h-5 animate-spin text-purple-500" />
              Regenerating Images...
            </CardTitle>
            <CardDescription className="text-purple-600 dark:text-purple-400">
              {progress.currentIndex} of {progress.totalCount} templates
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-700 dark:text-purple-300 font-medium">
                  Current: {progress.currentTemplate}
                </span>
                <span className="text-purple-600 dark:text-purple-400">
                  {progressPercentage}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3 bg-purple-200 dark:bg-purple-800" />
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

      {/* TOP SECTION: Templates Pending Reimage */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
        <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Image className="w-5 h-5 text-purple-500" />
                Templates Pending Reimage ({pendingTemplates.length})
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-400">
                Select templates to regenerate images with AI
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllPending}
                disabled={progress.isReimaging || pendingTemplates.length === 0}
                className="border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deselectAll}
                disabled={progress.isReimaging || selectedTemplates.size === 0}
                className="border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <Square className="w-4 h-4 mr-2" />
                Deselect
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleReimageSelected}
                disabled={progress.isReimaging || selectedTemplates.size === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Reimage Selected ({selectedTemplates.size})
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleReimageAll}
                disabled={progress.isReimaging || pendingTemplates.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reimage All ({pendingTemplates.length})
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
              {pendingTemplates.length === 0 ? (
                <>
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    {reimagedTemplates.length > 0 ? 'All templates have been reimaged!' : 'No templates ready for reimaging'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {reimagedTemplates.length === 0 ? 'Templates must be rewritten first before reimaging' : ''}
                  </p>
                </>
              ) : (
                <>
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No templates match your search</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredPendingTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplates.has(template.id)
                      ? 'bg-purple-100 dark:bg-purple-800/50 border-purple-400 dark:border-purple-500'
                      : 'bg-white dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/40'
                  }`}
                  onClick={() => !progress.isReimaging && toggleSelectTemplate(template.id)}
                >
                  <Checkbox
                    checked={selectedTemplates.has(template.id)}
                    disabled={progress.isReimaging}
                    onCheckedChange={() => toggleSelectTemplate(template.id)}
                    className="border-purple-400 data-[state=checked]:bg-purple-600"
                  />
                  <Image className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-blue-900 dark:text-blue-100 truncate">
                      {template.name}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-300">
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* BOTTOM SECTION: Completed Reimaged Templates */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
        <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Completed Reimages ({reimagedTemplates.length})
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            Templates that have been successfully reimaged with new AI-generated images
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900 pt-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading reimaged templates...</div>
          ) : filteredReimagedTemplates.length === 0 ? (
            <div className="text-center py-8">
              {reimagedTemplates.length === 0 ? (
                <>
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No templates have been reimaged yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Select templates above and click "Reimage Selected" to begin.
                  </p>
                </>
              ) : (
                <>
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reimaged templates match "{searchQuery}"</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredReimagedTemplates.map((template) => (
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
                          Reimaged: {new Date(template.lastUpdated).toLocaleString()}
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
