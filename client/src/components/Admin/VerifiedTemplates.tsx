/**
 * Verified Templates Component
 * Complete workflow: Select templates to verify → Progress bar → View completed
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
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

interface VerifyProgress {
  isProcessing: boolean;
  currentTemplate: string;
  currentIndex: number;
  totalCount: number;
  completed: string[];
  failed: string[];
}

export function VerifiedTemplates() {
  const { toast } = useToast();
  const [allTemplates, setAllTemplates] = useState<TemplateQAStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<VerifyProgress>({
    isProcessing: false,
    currentTemplate: '',
    currentIndex: 0,
    totalCount: 0,
    completed: [],
    failed: []
  });

  // Templates that need verification (SEO done but not yet verified)
  const pendingTemplates = allTemplates.filter(t => t.seoEvaluated && !t.verified);
  
  // Templates that are verified
  const verifiedTemplates = allTemplates.filter(t => t.verified);

  const filteredPendingTemplates = pendingTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVerifiedTemplates = verifiedTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchTemplateStatus();
  }, []);

  const fetchTemplateStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/templates/qa/status', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setAllTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('[VerifiedTemplates] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectTemplate = (templateId: string) => {
    const newSelected = new Set(selectedTemplates);
    if (newSelected.has(templateId)) newSelected.delete(templateId);
    else newSelected.add(templateId);
    setSelectedTemplates(newSelected);
  };

  const selectAllPending = () => setSelectedTemplates(new Set(filteredPendingTemplates.map(t => t.id)));
  const deselectAll = () => setSelectedTemplates(new Set());

  const verifyTemplates = async (templateIds: string[]) => {
    if (templateIds.length === 0) {
      toast({ title: 'No Templates Selected', variant: 'destructive' });
      return;
    }

    setProgress({ isProcessing: true, currentTemplate: '', currentIndex: 0, totalCount: templateIds.length, completed: [], failed: [] });

    const completed: string[] = [];
    const failed: string[] = [];

    for (let i = 0; i < templateIds.length; i++) {
      const templateId = templateIds[i];
      const template = allTemplates.find(t => t.id === templateId);
      
      setProgress(prev => ({ ...prev, currentTemplate: template?.name || templateId, currentIndex: i + 1 }));

      try {
        const response = await fetch(`/api/admin/templates/qa/verify/${templateId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await response.json();
        
        if (data.success && data.verified) {
          completed.push(templateId);
          setProgress(prev => ({ ...prev, completed: [...prev.completed, templateId] }));
        } else {
          failed.push(templateId);
          setProgress(prev => ({ ...prev, failed: [...prev.failed, templateId] }));
        }
      } catch (error) {
        failed.push(templateId);
        setProgress(prev => ({ ...prev, failed: [...prev.failed, templateId] }));
      }

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setProgress(prev => ({ ...prev, isProcessing: false }));
    await fetchTemplateStatus();
    setSelectedTemplates(new Set());

    toast({
      title: 'Verification Complete',
      description: `${completed.length} passed, ${failed.length} failed`,
      variant: failed.length > 0 ? 'destructive' : 'default',
    });
  };

  const progressPercentage = progress.totalCount > 0 ? Math.round((progress.currentIndex / progress.totalCount) * 100) : 0;

  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900 -m-6 p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-blue-700 dark:text-blue-300">Verified Templates</h2>
          <p className="text-blue-600 dark:text-blue-400">Final QA verification - 100% ready for clients</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTemplateStatus} disabled={loading || progress.isProcessing} className="border-blue-300 dark:border-blue-700">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950 dark:to-teal-950 border-cyan-300 dark:border-cyan-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Verification</p>
                <p className="text-3xl font-bold text-cyan-700 dark:text-cyan-300">{pendingTemplates.length}</p>
              </div>
              <Shield className="w-8 h-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-300 dark:border-green-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Verified ✓</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{verifiedTemplates.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {progress.isProcessing && (
        <Card className="bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900 dark:to-teal-900 border-cyan-400 animate-pulse">
          <CardHeader className="bg-cyan-200/50 dark:bg-cyan-800/50 border-b border-cyan-400">
            <CardTitle className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
              <RefreshCw className="w-5 h-5 animate-spin" /> Verifying Templates...
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{progress.currentTemplate}</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600">✓ Passed: {progress.completed.length}</span>
              {progress.failed.length > 0 && <span className="text-red-600">✗ Failed: {progress.failed.length}</span>}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
        <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Shield className="w-5 h-5 text-cyan-500" /> Pending Verification ({pendingTemplates.length})
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAllPending} disabled={progress.isProcessing || pendingTemplates.length === 0}>
                <CheckSquare className="w-4 h-4 mr-2" /> Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll} disabled={progress.isProcessing || selectedTemplates.size === 0}>
                <Square className="w-4 h-4 mr-2" /> Deselect
              </Button>
              <Button size="sm" onClick={() => verifyTemplates(Array.from(selectedTemplates))} disabled={progress.isProcessing || selectedTemplates.size === 0} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Play className="w-4 h-4 mr-2" /> Verify Selected ({selectedTemplates.size})
              </Button>
              <Button size="sm" onClick={() => verifyTemplates(pendingTemplates.map(t => t.id))} disabled={progress.isProcessing || pendingTemplates.length === 0} className="bg-green-600 hover:bg-green-700 text-white">
                <RotateCcw className="w-4 h-4 mr-2" /> Verify All ({pendingTemplates.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
            <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredPendingTemplates.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-green-600 font-medium">{verifiedTemplates.length > 0 ? 'All templates verified!' : 'No templates ready'}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredPendingTemplates.map((template) => (
                <div key={template.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${selectedTemplates.has(template.id) ? 'bg-cyan-100 dark:bg-cyan-800/50 border-cyan-400' : 'bg-white dark:bg-blue-900/30 border-blue-200'}`} onClick={() => !progress.isProcessing && toggleSelectTemplate(template.id)}>
                  <Checkbox checked={selectedTemplates.has(template.id)} disabled={progress.isProcessing} />
                  <Shield className="w-5 h-5 text-cyan-500" />
                  <div className="flex-1 truncate font-medium">{template.name}</div>
                  <Badge variant="outline" className="bg-cyan-100 text-cyan-700">Pending</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
        <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <CheckCircle2 className="w-5 h-5 text-green-500" /> Verified Templates ({verifiedTemplates.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {filteredVerifiedTemplates.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No verified templates yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredVerifiedTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 bg-white dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div className="flex-1 truncate font-medium">{template.name}</div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-700">✓ Verified</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
