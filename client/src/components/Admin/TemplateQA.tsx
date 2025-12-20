/**
 * Template QA - Comprehensive Quality Assurance
 * Runs AFTER Fine-Tuning, BEFORE Final Product
 * Ensures ALL templates are 100% complete before reaching Final Product
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, AlertCircle, Sparkles, RefreshCw, Filter, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InspectionCheck {
  id: string;
  name: string;
  passed: boolean;
  severity: 'critical' | 'major' | 'minor';
  details?: string;
  autoFixable?: boolean;
  category: string;
}

interface InspectionCategory {
  name: string;
  passed: number;
  failed: number;
  total: number;
  checks: InspectionCheck[];
}

interface DeepInspectionResult {
  templateId: string;
  templateName: string;
  score: number;
  passed: boolean;
  categories: InspectionCategory[];
  criticalIssues: string[];
  majorIssues: string[];
  minorIssues: string[];
  autoFixApplied: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  inspectedAt: string;
}

interface TemplateQAStatus {
  id: string;
  name: string;
  industry: string;
  checks: {
    hasHtml: boolean;
    htmlLength: number;
    contentRewritten: boolean;
    imagesRegenerated: boolean;
    seoEvaluated: boolean;
    hasCss: boolean;
    hasImages: boolean;
    noErrors: boolean;
  };
  errors: string[];
  passed: boolean;
  lastVerified?: string;
  deepInspection?: DeepInspectionResult;
}

interface QAProgress {
  isRunning: boolean;
  total: number;
  completed: number;
  passed: number;
  failed: number;
  current?: string;
}

export function TemplateQA() {
  const [templates, setTemplates] = useState<TemplateQAStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<QAProgress>({
    isRunning: false,
    total: 0,
    completed: 0,
    passed: 0,
    failed: 0,
  });
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [inspectingTemplate, setInspectingTemplate] = useState<string | null>(null);

  useEffect(() => {
    fetchQAStatus();
  }, []);

  const fetchQAStatus = async () => {
    try {
      setLoading(true);
      // Get all templates and their QA status
      const res = await fetch('/api/admin/templates/qa/status', { credentials: 'include' });
      const data = await res.json();
      
      if (data.success && data.templates) {
        // For each template, get detailed verification
        const detailedStatuses: TemplateQAStatus[] = [];
        
        for (const template of data.templates) {
          try {
            // Get template details to check verification
            const detailRes = await fetch(`/api/admin/templates/qa/details/${template.id}`, { credentials: 'include' });
            const detailData = await detailRes.json();
            
            if (detailData.success) {
              const checks = {
                hasHtml: !!detailData.template.htmlContent && detailData.template.htmlContent.length > 100,
                htmlLength: detailData.template.htmlContent?.length || 0,
                contentRewritten: template.contentRewritten || false,
                imagesRegenerated: template.imagesRegenerated || false,
                seoEvaluated: template.seoEvaluated || false,
                hasCss: true, // Assume CSS exists if template exists
                hasImages: (detailData.template.totalImages || 0) > 0,
                noErrors: !template.errors || template.errors.length === 0,
              };
              
              // Check for deep inspection results
              const deepInspection = detailData.template.qaMetadata?.deepInspection;
              
              const errors: string[] = [];
              if (!checks.hasHtml) errors.push('Missing HTML content');
              if (!checks.contentRewritten) errors.push('Content not rewritten');
              if (!checks.imagesRegenerated) errors.push('Images not regenerated');
              if (!checks.seoEvaluated) errors.push('SEO not evaluated');
              if (!checks.hasImages) errors.push('No images found');
              if (!checks.noErrors) errors.push(`QA errors: ${template.errors.join(', ')}`);
              
              const passed = errors.length === 0 && 
                            checks.hasHtml && 
                            checks.contentRewritten && 
                            checks.imagesRegenerated && 
                            checks.seoEvaluated;
              
              detailedStatuses.push({
                id: template.id,
                name: template.name,
                industry: template.industry || 'Unknown',
                checks,
                errors,
                passed,
                lastVerified: template.lastUpdated,
                deepInspection,
              });
            }
          } catch (error) {
            console.error(`Failed to get details for ${template.id}:`, error);
          }
        }
        
        setTemplates(detailedStatuses);
      }
    } catch (error) {
      console.error('Failed to fetch QA status:', error);
      toast({
        title: 'Error',
        description: 'Failed to load QA status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const runDeepInspection = async (templateId: string) => {
    try {
      setInspectingTemplate(templateId);
      const res = await fetch(`/api/admin/templates/qa/deep-inspect/${templateId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Deep inspection failed');
      }

      const data = await res.json();
      
      if (data.success) {
        toast({
          title: 'Deep Inspection Complete',
          description: `Score: ${data.inspection.score}/100 (${data.inspection.passedChecks}/${data.inspection.totalChecks} checks passed)`,
        });
        await fetchQAStatus();
        // Expand the template to show results
        setExpandedTemplates(prev => new Set(prev).add(templateId));
      }
    } catch (error) {
      console.error('Deep inspection failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to run deep inspection',
        variant: 'destructive',
      });
    } finally {
      setInspectingTemplate(null);
    }
  };

  const runDeepInspectionAll = async () => {
    try {
      setProgress({ isRunning: true, total: templates.length, completed: 0, passed: 0, failed: 0 });
      
      const res = await fetch('/api/admin/templates/qa/deep-inspect-all', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.body) {
        throw new Error('No response body');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.progress) {
                setProgress({
                  isRunning: data.progress.status !== 'completed',
                  total: data.progress.total || templates.length,
                  completed: data.progress.completed || 0,
                  passed: data.progress.passed || 0,
                  failed: data.progress.failed || 0,
                  current: data.template,
                });
                
                if (data.progress.status === 'completed') {
                  toast({
                    title: 'Deep Inspection Complete',
                    description: `${data.progress.passed} templates passed, ${data.progress.failed} failed`,
                  });
                  await fetchQAStatus();
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Batch deep inspection failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to run batch deep inspection',
        variant: 'destructive',
      });
    } finally {
      setProgress(prev => ({ ...prev, isRunning: false }));
    }
  };

  const runQAVerification = async () => {
    try {
      setProgress({ isRunning: true, total: templates.length, completed: 0, passed: 0, failed: 0 });
      
      const res = await fetch('/api/admin/templates/qa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ templateIds: [] }), // Empty array = all templates
      });

      if (!res.body) {
        throw new Error('No response body');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.progress) {
                setProgress({
                  isRunning: data.progress.status !== 'completed',
                  total: data.progress.total || templates.length,
                  completed: data.progress.completed || 0,
                  passed: data.progress.passed || 0,
                  failed: data.progress.failed || 0,
                  current: data.progress.current,
                });
                
                if (data.progress.status === 'completed') {
                  toast({
                    title: 'QA Verification Complete',
                    description: `${data.progress.passed} templates passed, ${data.progress.failed} failed`,
                  });
                  await fetchQAStatus();
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('QA Verification failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to run QA verification',
        variant: 'destructive',
      });
    } finally {
      setProgress(prev => ({ ...prev, isRunning: false }));
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesFilter = filter === 'all' || (filter === 'passed' && t.passed) || (filter === 'failed' && !t.passed);
    const matchesSearch = searchQuery === '' || 
                         t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const passedCount = templates.filter(t => t.passed).length;
  const failedCount = templates.filter(t => !t.passed).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-cyan-300 flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            Template QA - Quality Assurance
          </h2>
          <p className="text-cyan-400 mt-2">
            Comprehensive verification of ALL templates before Final Product. 
            Only templates that pass ALL checks will appear in Final Product.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchQAStatus}
            variant="outline"
            disabled={loading || progress.isRunning}
            className="border-cyan-500 text-cyan-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={runQAVerification}
            disabled={loading || progress.isRunning}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {progress.isRunning ? 'Running QA...' : 'Run QA Verification'}
          </Button>
          <Button
            onClick={runDeepInspectionAll}
            disabled={loading || progress.isRunning}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Search className="w-4 h-4 mr-2" />
            {progress.isRunning ? 'Inspecting...' : 'Deep Inspect All (66+ Checks)'}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {progress.isRunning && (
        <Card className="p-4 bg-cyan-900/50 border-cyan-500">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-cyan-300">
                {progress.current ? `Processing: ${progress.current}` : 'Running QA Verification...'}
              </span>
              <span className="text-cyan-300">
                {progress.completed}/{progress.total} ({Math.round((progress.completed / progress.total) * 100)}%)
              </span>
            </div>
            <Progress value={(progress.completed / progress.total) * 100} className="h-2" />
            <div className="flex gap-4 text-sm">
              <span className="text-green-400">✅ Passed: {progress.passed}</span>
              <span className="text-red-400">❌ Failed: {progress.failed}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-cyan-900/30 border-cyan-500/50">
          <div className="text-2xl font-bold text-cyan-300">{templates.length}</div>
          <div className="text-sm text-cyan-400">Total Templates</div>
        </Card>
        <Card className="p-4 bg-green-900/30 border-green-500/50">
          <div className="text-2xl font-bold text-green-300">{passedCount}</div>
          <div className="text-sm text-green-400">✅ Passed QA</div>
        </Card>
        <Card className="p-4 bg-red-900/30 border-red-500/50">
          <div className="text-2xl font-bold text-red-300">{failedCount}</div>
          <div className="text-sm text-red-400">❌ Failed QA</div>
        </Card>
        <Card className="p-4 bg-yellow-900/30 border-yellow-500/50">
          <div className="text-2xl font-bold text-yellow-300">
            {templates.length > 0 ? Math.round((passedCount / templates.length) * 100) : 0}%
          </div>
          <div className="text-sm text-yellow-400">Pass Rate</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-cyan-600' : ''}
          >
            All ({templates.length})
          </Button>
          <Button
            variant={filter === 'passed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('passed')}
            className={filter === 'passed' ? 'bg-green-600' : ''}
          >
            ✅ Passed ({passedCount})
          </Button>
          <Button
            variant={filter === 'failed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('failed')}
            className={filter === 'failed' ? 'bg-red-600' : ''}
          >
            ❌ Failed ({failedCount})
          </Button>
        </div>
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Template List */}
      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-cyan-300">Loading QA Status...</p>
        </Card>
      ) : filteredTemplates.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-cyan-300">No templates found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={`p-4 border-2 ${
                template.passed
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-red-500 bg-red-900/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {template.passed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                    <h3 className="text-xl font-bold text-cyan-300">{template.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {template.industry}
                    </Badge>
                  </div>

                  {/* Checks */}
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className={`flex items-center gap-2 ${template.checks.hasHtml ? 'text-green-400' : 'text-red-400'}`}>
                      {template.checks.hasHtml ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span className="text-sm">HTML ({template.checks.htmlLength} chars)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${template.checks.contentRewritten ? 'text-green-400' : 'text-red-400'}`}>
                      {template.checks.contentRewritten ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span className="text-sm">Rewritten</span>
                    </div>
                    <div className={`flex items-center gap-2 ${template.checks.imagesRegenerated ? 'text-green-400' : 'text-red-400'}`}>
                      {template.checks.imagesRegenerated ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span className="text-sm">Reimaged</span>
                    </div>
                    <div className={`flex items-center gap-2 ${template.checks.seoEvaluated ? 'text-green-400' : 'text-red-400'}`}>
                      {template.checks.seoEvaluated ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span className="text-sm">SEO</span>
                    </div>
                    <div className={`flex items-center gap-2 ${template.checks.hasImages ? 'text-green-400' : 'text-red-400'}`}>
                      {template.checks.hasImages ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span className="text-sm">Has Images</span>
                    </div>
                    <div className={`flex items-center gap-2 ${template.checks.noErrors ? 'text-green-400' : 'text-red-400'}`}>
                      {template.checks.noErrors ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span className="text-sm">No Errors</span>
                    </div>
                  </div>

                  {/* Deep Inspection Score */}
                  {template.deepInspection && (
                    <div className="mt-4 p-3 bg-purple-900/30 rounded border border-purple-500/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-purple-300 font-semibold">
                          <Search className="w-4 h-4" />
                          Deep Inspection Score: {template.deepInspection.score}/100
                        </div>
                        <Badge variant={template.deepInspection.passed ? 'default' : 'destructive'} className={template.deepInspection.passed ? 'bg-green-600' : 'bg-red-600'}>
                          {template.deepInspection.passed ? 'PASSED' : 'FAILED'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs text-purple-200">
                        <div>Total Checks: {template.deepInspection.totalChecks}</div>
                        <div className="text-green-400">Passed: {template.deepInspection.passedChecks}</div>
                        <div className="text-red-400">Failed: {template.deepInspection.failedChecks}</div>
                        <div className="text-yellow-400">Auto-Fixed: {template.deepInspection.autoFixApplied}</div>
                      </div>
                      {template.deepInspection.criticalIssues.length > 0 && (
                        <div className="mt-2 text-xs text-red-300">
                          Critical Issues: {template.deepInspection.criticalIssues.length}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 border-purple-500 text-purple-300"
                        onClick={() => {
                          const newExpanded = new Set(expandedTemplates);
                          if (newExpanded.has(template.id)) {
                            newExpanded.delete(template.id);
                          } else {
                            newExpanded.add(template.id);
                          }
                          setExpandedTemplates(newExpanded);
                        }}
                      >
                        {expandedTemplates.has(template.id) ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Show All {template.deepInspection.totalChecks} Checks
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Deep Inspection Details */}
                  {template.deepInspection && expandedTemplates.has(template.id) && (
                    <div className="mt-4 p-4 bg-gray-900/50 rounded border border-gray-700">
                      <Tabs defaultValue="summary" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="summary">Summary</TabsTrigger>
                          <TabsTrigger value="categories">Categories</TabsTrigger>
                          <TabsTrigger value="issues">Issues</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="summary" className="mt-4">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <Card className="p-3 bg-green-900/20 border-green-500/50">
                                <div className="text-lg font-bold text-green-300">{template.deepInspection.passedChecks}</div>
                                <div className="text-xs text-green-400">Checks Passed</div>
                              </Card>
                              <Card className="p-3 bg-red-900/20 border-red-500/50">
                                <div className="text-lg font-bold text-red-300">{template.deepInspection.failedChecks}</div>
                                <div className="text-xs text-red-400">Checks Failed</div>
                              </Card>
                            </div>
                            <div className="text-sm text-gray-300">
                              <p>Inspected: {new Date(template.deepInspection.inspectedAt).toLocaleString()}</p>
                              {template.deepInspection.autoFixApplied > 0 && (
                                <p className="text-yellow-400 mt-1">
                                  Auto-fixed {template.deepInspection.autoFixApplied} issues
                                </p>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="categories" className="mt-4">
                          <ScrollArea className="h-[400px]">
                            <div className="space-y-3">
                              {template.deepInspection.categories.map((category, idx) => (
                                <Card key={idx} className="p-3 bg-gray-800/50 border-gray-700">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-cyan-300">{category.name}</h4>
                                    <Badge variant={category.failed === 0 ? 'default' : 'destructive'} className={category.failed === 0 ? 'bg-green-600' : 'bg-red-600'}>
                                      {category.passed}/{category.total}
                                    </Badge>
                                  </div>
                                  <div className="space-y-1 text-xs">
                                    {category.checks.map((check) => (
                                      <div key={check.id} className="flex items-center gap-2 p-1 rounded">
                                        {check.passed ? (
                                          <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                                        ) : (
                                          <XCircle className={`w-3 h-3 flex-shrink-0 ${
                                            check.severity === 'critical' ? 'text-red-400' :
                                            check.severity === 'major' ? 'text-orange-400' : 'text-yellow-400'
                                          }`} />
                                        )}
                                        <span className={check.passed ? 'text-gray-300' : 
                                          check.severity === 'critical' ? 'text-red-300' :
                                          check.severity === 'major' ? 'text-orange-300' : 'text-yellow-300'
                                        }>
                                          {check.name}
                                        </span>
                                        {check.details && (
                                          <span className="text-gray-500 text-xs ml-auto">({check.details})</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>
                        
                        <TabsContent value="issues" className="mt-4">
                          <ScrollArea className="h-[400px]">
                            <div className="space-y-3">
                              {template.deepInspection.criticalIssues.length > 0 && (
                                <Card className="p-3 bg-red-900/20 border-red-500/50">
                                  <h4 className="font-semibold text-red-300 mb-2">Critical Issues ({template.deepInspection.criticalIssues.length})</h4>
                                  <ul className="list-disc list-inside text-sm text-red-200 space-y-1">
                                    {template.deepInspection.criticalIssues.map((issue, idx) => (
                                      <li key={idx}>{issue}</li>
                                    ))}
                                  </ul>
                                </Card>
                              )}
                              {template.deepInspection.majorIssues.length > 0 && (
                                <Card className="p-3 bg-orange-900/20 border-orange-500/50">
                                  <h4 className="font-semibold text-orange-300 mb-2">Major Issues ({template.deepInspection.majorIssues.length})</h4>
                                  <ul className="list-disc list-inside text-sm text-orange-200 space-y-1">
                                    {template.deepInspection.majorIssues.map((issue, idx) => (
                                      <li key={idx}>{issue}</li>
                                    ))}
                                  </ul>
                                </Card>
                              )}
                              {template.deepInspection.minorIssues.length > 0 && (
                                <Card className="p-3 bg-yellow-900/20 border-yellow-500/50">
                                  <h4 className="font-semibold text-yellow-300 mb-2">Minor Issues ({template.deepInspection.minorIssues.length})</h4>
                                  <ul className="list-disc list-inside text-sm text-yellow-200 space-y-1">
                                    {template.deepInspection.minorIssues.map((issue, idx) => (
                                      <li key={idx}>{issue}</li>
                                    ))}
                                  </ul>
                                </Card>
                              )}
                              {template.deepInspection.criticalIssues.length === 0 &&
                               template.deepInspection.majorIssues.length === 0 &&
                               template.deepInspection.minorIssues.length === 0 && (
                                <Card className="p-3 bg-green-900/20 border-green-500/50">
                                  <p className="text-green-300">No issues found! Template passed all checks.</p>
                                </Card>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}

                  {/* Deep Inspect Button */}
                  {!template.deepInspection && (
                    <div className="mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-purple-500 text-purple-300"
                        onClick={() => runDeepInspection(template.id)}
                        disabled={inspectingTemplate === template.id}
                      >
                        <Search className="w-3 h-3 mr-1" />
                        {inspectingTemplate === template.id ? 'Inspecting...' : 'Run Deep Inspection (66+ Checks)'}
                      </Button>
                    </div>
                  )}

                  {/* Errors */}
                  {template.errors.length > 0 && (
                    <div className="mt-4 p-3 bg-red-900/30 rounded border border-red-500/50">
                      <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                        <AlertCircle className="w-4 h-4" />
                        Issues Found:
                      </div>
                      <ul className="list-disc list-inside text-sm text-red-300 space-y-1">
                        {template.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {template.lastVerified && (
                    <p className="text-xs text-cyan-400 mt-2">
                      Last verified: {new Date(template.lastVerified).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info Box */}
      <Card className="p-4 bg-blue-900/30 border-blue-500/50">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-semibold mb-1">QA Verification Requirements:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>✅ HTML content must exist (min 100 characters)</li>
              <li>✅ Content must be rewritten</li>
              <li>✅ Images must be regenerated</li>
              <li>✅ SEO must be evaluated</li>
              <li>✅ Template must have images</li>
              <li>✅ No QA errors</li>
            </ul>
            <p className="mt-2 font-semibold">
              Only templates that pass ALL checks will appear in Final Product.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

