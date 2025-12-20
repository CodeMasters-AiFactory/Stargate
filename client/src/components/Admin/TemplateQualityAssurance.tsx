/**
 * Template Quality Assurance Component
 * Pre-process all templates to perfection before client selection
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Image, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  Square
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface QAProgress {
  total: number;
  completed: number;
  current?: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  operation?: 'content' | 'images' | 'seo' | 'verify';
}

export function TemplateQualityAssurance() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TemplateQAStatus[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<QAProgress>({
    total: 0,
    completed: 0,
    status: 'idle',
  });
  const [isRewriting, setIsRewriting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

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
        setTemplates(data.templates || []);
        updateProgress(data.templates || []);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch template status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[TemplateQA] Error fetching status:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch template status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = (templates: TemplateQAStatus[]) => {
    const total = templates.length;
    const contentDone = templates.filter(t => t.contentRewritten).length;
    const imagesDone = templates.filter(t => t.imagesRegenerated).length;
    const seoDone = templates.filter(t => t.seoEvaluated).length;
    const verified = templates.filter(t => t.verified).length;

    setProgress({
      total,
      completed: 0, // Will be updated per operation
      status: 'idle',
    });
  };

  const handleSelectTemplate = (templateId: string, checked: boolean) => {
    const newSelected = new Set(selectedTemplates);
    if (checked) {
      newSelected.add(templateId);
    } else {
      newSelected.delete(templateId);
    }
    setSelectedTemplates(newSelected);
  };

  const handleSelectAll = () => {
    const pendingTemplates = templates.filter(t => !t.contentRewritten);
    if (selectedTemplates.size === pendingTemplates.length) {
      setSelectedTemplates(new Set());
    } else {
      setSelectedTemplates(new Set(pendingTemplates.map(t => t.id)));
    }
  };

  const handleRewriteSelectedContent = async () => {
    if (isRewriting) return;
    
    const templateIdsToRewrite = selectedTemplates.size > 0
      ? Array.from(selectedTemplates)
      : templates.map(t => t.id); // If none selected, rewrite all
    
    if (templateIdsToRewrite.length === 0) {
      toast({
        title: 'No Templates Selected',
        description: 'Please select at least one template to rewrite',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsRewriting(true);
      setProgress({
        total: templateIdsToRewrite.length,
        completed: 0,
        status: 'running',
        operation: 'content',
      });

      const response = await fetch('/api/admin/templates/qa/rewrite-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ templateIds: templateIdsToRewrite }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.progress) {
                setProgress({
                  total: data.progress.total,
                  completed: data.progress.completed,
                  current: data.progress.current,
                  status: data.progress.status,
                  operation: 'content',
                });
              }
              if (data.complete) {
                toast({
                  title: '✅ Content Rewrite Complete',
                  description: `Successfully rewrote content for ${data.complete} templates`,
                });
                setSelectedTemplates(new Set()); // Clear selection after completion
                await fetchTemplateStatus();
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('[TemplateQA] Error rewriting content:', error);
      toast({
        title: 'Error',
        description: 'Failed to rewrite content',
        variant: 'destructive',
      });
    } finally {
      setIsRewriting(false);
      setProgress(prev => ({ ...prev, status: 'idle' }));
    }
  };


  const handleRegenerateAllImages = async () => {
    if (isRegenerating) return;
    
    try {
      setIsRegenerating(true);
      setProgress({
        total: templates.length,
        completed: 0,
        status: 'running',
        operation: 'images',
      });

      const response = await fetch('/api/admin/templates/qa/regenerate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.progress) {
                setProgress({
                  total: data.progress.total,
                  completed: data.progress.completed,
                  current: data.progress.current,
                  status: data.progress.status,
                  operation: 'images',
                });
              }
              if (data.complete) {
                toast({
                  title: 'Image Regeneration Complete',
                  description: `Successfully regenerated images for ${data.complete} templates`,
                });
                await fetchTemplateStatus();
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('[TemplateQA] Error regenerating images:', error);
      toast({
        title: 'Error',
        description: 'Failed to regenerate images',
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
      setProgress(prev => ({ ...prev, status: 'idle' }));
    }
  };

  const handleEvaluateSEO = async () => {
    if (isEvaluating) return;
    
    try {
      setIsEvaluating(true);
      setProgress({
        total: templates.length,
        completed: 0,
        status: 'running',
        operation: 'seo',
      });

      const response = await fetch('/api/admin/templates/qa/evaluate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.progress) {
                setProgress({
                  total: data.progress.total,
                  completed: data.progress.completed,
                  current: data.progress.current,
                  status: data.progress.status,
                  operation: 'seo',
                });
              }
              if (data.complete) {
                toast({
                  title: 'SEO Evaluation Complete',
                  description: `Evaluated and improved SEO for ${data.complete} templates`,
                });
                await fetchTemplateStatus();
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('[TemplateQA] Error evaluating SEO:', error);
      toast({
        title: 'Error',
        description: 'Failed to evaluate SEO',
        variant: 'destructive',
      });
    } finally {
      setIsEvaluating(false);
      setProgress(prev => ({ ...prev, status: 'idle' }));
    }
  };

  const handleVerifyAll = async () => {
    if (isVerifying) return;
    
    try {
      setIsVerifying(true);
      setProgress({
        total: templates.length,
        completed: 0,
        status: 'running',
        operation: 'verify',
      });

      const response = await fetch('/api/admin/templates/qa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Verification Complete',
          description: `Verified ${data.verified} templates. ${data.errors} errors found.`,
        });
        await fetchTemplateStatus();
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('[TemplateQA] Error verifying templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify templates',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
      setProgress(prev => ({ ...prev, status: 'idle' }));
    }
  };

  const contentDone = templates.filter(t => t.contentRewritten).length;
  const imagesDone = templates.filter(t => t.imagesRegenerated).length;
  const seoDone = templates.filter(t => t.seoEvaluated).length;
  const verified = templates.filter(t => t.verified).length;
  const total = templates.length;
  const allComplete = total > 0 && contentDone === total && imagesDone === total && seoDone === total && verified === total;

  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900 -m-6 p-6 rounded-lg">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Template Quality Assurance
        </h2>
        <p className="text-blue-600 dark:text-blue-400 text-lg">
          Select templates below to rewrite, then click the rewrite button to process them.
        </p>
        <div className="mt-4 p-4 bg-blue-100/50 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>📋 How to rewrite templates:</strong> Scroll down to see all templates. Click the checkboxes next to templates you want to rewrite, then click the "Rewrite Selected Templates" button at the bottom.
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      {total > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
          <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
            <CardTitle className="text-blue-700 dark:text-blue-300">Overall Progress</CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              {total} templates in system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Content Rewritten</div>
                <div className="text-2xl font-bold">{contentDone}/{total}</div>
                <Progress value={(contentDone / total) * 100} className="mt-2" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Images Regenerated</div>
                <div className="text-2xl font-bold">{imagesDone}/{total}</div>
                <Progress value={(imagesDone / total) * 100} className="mt-2" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">SEO Evaluated</div>
                <div className="text-2xl font-bold">{seoDone}/{total}</div>
                <Progress value={(seoDone / total) * 100} className="mt-2" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Verified</div>
                <div className="text-2xl font-bold">{verified}/{total}</div>
                <Progress value={(verified / total) * 100} className="mt-2" />
              </div>
            </div>
            {allComplete && (
              <Alert className="bg-blue-100/50 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  🎉 All templates are 100% perfect and ready for client selection!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Template Selection and Rewrite Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700 border-2">
        <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b-2 border-blue-300 dark:border-blue-700">
          <CardTitle className="flex items-center gap-3 text-blue-700 dark:text-blue-300 text-xl">
            <FileText className="w-6 h-6 text-blue-500" />
            📝 SELECT TEMPLATES TO REWRITE ({templates.filter(t => !t.contentRewritten).length})
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400 text-base mt-2">
            {templates.length === 0 ? (
              <>
                <strong>⚠️ No templates available yet.</strong> You need to scrape websites first to create templates.
                <br />
                <strong>Steps:</strong> Go to <strong>"Website Scraper"</strong> tab → Scrape websites → Return here to select and rewrite templates.
              </>
            ) : (
              <>
                <strong>Step 1:</strong> Use the checkboxes below to select which templates you want to rewrite.
                <br />
                <strong>Step 2:</strong> Click "Select All" to select all templates at once, or select individual templates.
                <br />
                <strong>Step 3:</strong> Scroll down and click the "Rewrite Selected Templates" button to start the process.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
          ) : (
            <div className="space-y-4">
              {templates.length === 0 ? (
                <>
                  {/* Show placeholder structure so user knows where templates will appear */}
                  <div className="mb-4 p-4 bg-blue-100/50 dark:bg-blue-900/50 border-2 border-blue-300 dark:border-blue-700 rounded-lg">
                    <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-2 text-center">No Templates Found</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-3 text-center">
                      You need to scrape websites first to create templates.
                    </p>
                    <Alert className="bg-blue-100/50 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <AlertDescription className="text-blue-700 dark:text-blue-300">
                        <strong>Next Step:</strong> Go to the <strong>"Website Scraper"</strong> tab (5th tab) to scrape websites and create templates. 
                        Then return here to select and rewrite them!
                      </AlertDescription>
                    </Alert>
                  </div>
                  
                  {/* Placeholder showing where template list will appear */}
                  <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-6 bg-blue-50/50 dark:bg-blue-900/20">
                    <div className="text-center mb-4">
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                        📋 Template Selection Area (Empty - No Templates Yet)
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Once you scrape templates, they will appear here as a list with checkboxes like this:
                      </p>
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-hidden">
                      {/* Example template structure */}
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-blue-950/50 opacity-50">
                        <div className="w-4 h-4 border-2 border-blue-400 rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-blue-100 dark:bg-blue-900 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-blue-950/50 opacity-30">
                        <div className="w-4 h-4 border-2 border-blue-400 rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded w-28 mb-2"></div>
                          <div className="h-3 bg-blue-100 dark:bg-blue-900 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-center text-blue-600 dark:text-blue-400 mt-4">
                      ✓ Use checkboxes to select templates → Click "Select All" button → Click "Rewrite Selected Templates" button below
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Filter: Show only non-rewritten templates for selection */}
                  {templates.filter(t => !t.contentRewritten).length > 0 ? (
                    <>
                      {/* Select All Button - More Prominent */}
                      <div className="flex items-center justify-between pb-3 border-b-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => {
                              const pendingTemplates = templates.filter(t => !t.contentRewritten);
                              if (selectedTemplates.size === pendingTemplates.length) {
                                setSelectedTemplates(new Set());
                              } else {
                                setSelectedTemplates(new Set(pendingTemplates.map(t => t.id)));
                              }
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-600 font-semibold"
                          >
                            {selectedTemplates.size === templates.filter(t => !t.contentRewritten).length ? (
                              <>
                                <Square className="w-5 h-5 mr-2" />
                                Deselect All
                              </>
                            ) : (
                              <>
                                <CheckSquare className="w-5 h-5 mr-2" />
                                Select All ({templates.filter(t => !t.contentRewritten).length})
                              </>
                            )}
                          </Button>
                          <span className="text-base font-semibold text-blue-700 dark:text-blue-300">
                            ✓ {selectedTemplates.size} of {templates.filter(t => !t.contentRewritten).length} templates selected
                          </span>
                        </div>
                      </div>

                      {/* Template List - Only show non-rewritten templates */}
                      <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {templates.filter(t => !t.contentRewritten).map((template) => {
                          const isSelected = selectedTemplates.has(template.id);
                          return (
                            <div
                              key={template.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                isSelected
                                  ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-400 dark:border-blue-600'
                                  : 'bg-white dark:bg-blue-950/50 border-gray-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                              }`}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => handleSelectTemplate(template.id, checked as boolean)}
                                className="border-blue-400"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-blue-900 dark:text-blue-100">{template.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-300">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending Rewrite
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">All templates have been rewritten! 🎉</p>
                    </div>
                  )}
                </>
              )}

              {/* Rewrite Button - Always Visible - More Prominent */}
              <div className="pt-6 border-t-2 border-blue-300 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 p-4 rounded-lg">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-2">
                    🚀 Ready to Rewrite?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {templates.length === 0
                      ? '⚠️ No templates found. Go to "Website Scraper" tab to create templates first.'
                      : selectedTemplates.size === 0 
                      ? '⚠️ Please select at least one template above using the checkboxes' 
                      : `✅ ${selectedTemplates.size} template${selectedTemplates.size === 1 ? '' : 's'} selected - Click the button below to start rewriting!`}
                  </p>
                </div>
                <Button
                  onClick={handleRewriteSelectedContent}
                  disabled={isRewriting || loading || selectedTemplates.size === 0 || templates.filter(t => !t.contentRewritten).length === 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold py-6 h-auto"
                  size="lg"
                  data-testid="rewrite-selected-templates-button"
                  id="rewrite-selected-templates-button"
                >
                  {isRewriting ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                      Rewriting {progress.completed}/{progress.total} templates...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-3" />
                      {templates.length === 0
                        ? '⚠️ No Templates Available - Scrape Websites First'
                        : templates.filter(t => !t.contentRewritten).length === 0
                        ? 'All Templates Rewritten! 🎉'
                        : `✨ Rewrite Selected Templates (${selectedTemplates.size})`}
                    </>
                  )}
                </Button>
                {progress.operation === 'content' && progress.status === 'running' && (
                  <div className="mt-4 space-y-2">
                    <Progress value={(progress.completed / progress.total) * 100} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      {progress.completed}/{progress.total} - {progress.current || 'Processing...'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Image Regeneration Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Image className="w-6 h-6 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">Image Regeneration</h2>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Generate new, high-quality images for all templates using AI
            </p>
          </div>
        </div>
      </div>

      {/* Other Action Buttons */}
      <div className="grid gap-4 md:grid-cols-2">

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
          <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Image className="w-5 h-5 text-blue-500" />
              Re-image All Templates
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Generate new, high-quality images for all templates using AI
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900">
            <Button
              onClick={handleRegenerateAllImages}
              disabled={isRegenerating || loading || total === 0}
              className="w-full"
              size="lg"
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Image className="w-4 h-4 mr-2" />
                  Re-image All Templates
                </>
              )}
            </Button>
            {progress.operation === 'images' && progress.status === 'running' && (
              <div className="mt-4 space-y-2">
                <Progress value={(progress.completed / progress.total) * 100} />
                <p className="text-sm text-muted-foreground">
                  {progress.completed}/{progress.total} - {progress.current || 'Processing...'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
          <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Search className="w-5 h-5 text-blue-500" />
              SEO Evaluation
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Evaluate and improve SEO for all templates automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900">
            <Button
              onClick={handleEvaluateSEO}
              disabled={isEvaluating || loading || total === 0}
              className="w-full"
              size="lg"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Evaluate SEO
                </>
              )}
            </Button>
            {progress.operation === 'seo' && progress.status === 'running' && (
              <div className="mt-4 space-y-2">
                <Progress value={(progress.completed / progress.total) * 100} />
                <p className="text-sm text-muted-foreground">
                  {progress.completed}/{progress.total} - {progress.current || 'Processing...'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verification */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
        <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            Template Verification
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            Verify all templates are working correctly (HTML valid, images load, links work)
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900">
          <Button
            onClick={handleVerifyAll}
            disabled={isVerifying || loading || total === 0}
            className="w-full"
            size="lg"
            variant="outline"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Verify All Templates
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Template Status List */}
      {templates.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
          <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
            <CardTitle className="text-blue-700 dark:text-blue-300">Template Status</CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Individual template quality assurance status
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900">
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{template.name}</div>
                    {template.errors.length > 0 && (
                      <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {template.errors.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={template.contentRewritten ? 'default' : 'secondary'}>
                      {template.contentRewritten ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      Content
                    </Badge>
                    <Badge variant={template.imagesRegenerated ? 'default' : 'secondary'}>
                      {template.imagesRegenerated ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      Images
                    </Badge>
                    <Badge variant={template.seoEvaluated ? 'default' : 'secondary'}>
                      {template.seoEvaluated ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      SEO
                    </Badge>
                    <Badge variant={template.verified ? 'default' : 'destructive'}>
                      {template.verified ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      Verified
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center py-8 text-muted-foreground">
          Loading template status...
        </div>
      )}

      {!loading && total === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No templates found. Please scrape some websites first to create templates.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}



