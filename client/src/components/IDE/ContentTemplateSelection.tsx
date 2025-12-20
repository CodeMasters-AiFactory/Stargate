/**
 * Content Template Selection - Phase 3
 * User selects SEO/ranking templates for CONTENT structure
 * 
 * Features:
 * - 4-column grid layout
 * - Industry headings (Accounting, Legal, etc.)
 * - Multi-select: tick multiple for AI to merge content
 * - Shows keywords extracted from each template
 * - Preview with content focus
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
  Eye,
  FileText,
  TrendingUp,
  Target,
  Layers,
  ArrowRight,
  Globe,
  Hash,
  Package,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import type { BrandTemplate } from '@/types/templates';

// Industries for ranking templates
const INDUSTRIES = [
  'Accounting',
  'Legal',
  'Healthcare',
  'Real Estate',
  'Technology',
  'E-commerce',
  'Restaurant',
  'Automotive',
  'Construction',
  'Education',
  'Finance',
  'Insurance',
  'Consulting',
  'Marketing',
  'Fitness',
  'Beauty',
  'Travel',
  'Photography',
  'Architecture',
  'Manufacturing',
];

interface ContentTemplateSelectionProps {
  onTemplatesSelect: (templates: BrandTemplate[]) => void;
  selectedTemplates: BrandTemplate[];
  onContinue: () => void;
  onBack?: () => void;
}

export function ContentTemplateSelection({
  onTemplatesSelect,
  selectedTemplates,
  onContinue,
  onBack,
}: ContentTemplateSelectionProps) {
  // State
  const [templates, setTemplates] = useState<BrandTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndustry, setActiveIndustry] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<BrandTemplate | null>(null);
  const [industryCounts, setIndustryCounts] = useState<Record<string, number>>({});
  const [checkingDependencies, setCheckingDependencies] = useState(false);
  const [dependencyResults, setDependencyResults] = useState<any>(null);

  // Check dependencies function
  const handleCheckDependencies = async () => {
    const templatesToCheck = selectedTemplates.length > 0 ? selectedTemplates : templates;
    const templateIds = templatesToCheck.map(t => t.id);

    if (templateIds.length === 0) {
      alert('No templates to check. Please select templates or ensure templates are loaded.');
      return;
    }

    setCheckingDependencies(true);
    setDependencyResults(null);

    try {
      const response = await fetch('/api/templates/check-dependencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateIds }),
      });

      const data = await response.json();
      if (data.success) {
        setDependencyResults(data);
        console.log('[ContentTemplateSelection] Dependency check results:', data);
      } else {
        alert(`Error checking dependencies: ${data.error}`);
      }
    } catch (error) {
      console.error('[ContentTemplateSelection] Error checking dependencies:', error);
      alert('Failed to check dependencies. Please try again.');
    } finally {
      setCheckingDependencies(false);
    }
  };

  // Fetch ranking templates (NOT design quality)
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        // Fetch templates that are NOT design quality (ranking templates)
        const response = await fetch(`/api/templates?isDesignQuality=false&pageSize=10000&_t=${Date.now()}`);
        const data = await response.json();

        if (data.success && data.templates) {
          setTemplates(data.templates);

          // Calculate industry counts
          const counts: Record<string, number> = {};
          data.templates.forEach((template: any) => {
            const industry = template.industry || template.category || 'Other';
            counts[industry] = (counts[industry] || 0) + 1;
          });
          setIndustryCounts(counts);
        }
      } catch (error) {
        console.error('[ContentTemplateSelection] Failed to fetch templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Group templates by industry
  const templatesByIndustry = useMemo(() => {
    const grouped: Record<string, BrandTemplate[]> = {};
    
    templates.forEach(template => {
      const industry = template.industry || template.category || 'Other';
      if (!grouped[industry]) {
        grouped[industry] = [];
      }
      grouped[industry].push(template);
    });

    return grouped;
  }, [templates]);

  // Filter templates by search
  const filteredTemplatesByIndustry = useMemo(() => {
    if (!searchQuery) return templatesByIndustry;

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, BrandTemplate[]> = {};

    Object.entries(templatesByIndustry).forEach(([industry, industryTemplates]) => {
      const matchingTemplates = industryTemplates.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.brand.toLowerCase().includes(query) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
      if (matchingTemplates.length > 0) {
        filtered[industry] = matchingTemplates;
      }
    });

    return filtered;
  }, [templatesByIndustry, searchQuery]);

  // Get templates for active industry or all
  const displayIndustries = useMemo(() => {
    if (activeIndustry) {
      return { [activeIndustry]: filteredTemplatesByIndustry[activeIndustry] || [] };
    }
    return filteredTemplatesByIndustry;
  }, [filteredTemplatesByIndustry, activeIndustry]);

  // Toggle template selection
  const toggleTemplateSelection = useCallback((template: BrandTemplate) => {
    const isSelected = selectedTemplates.some(t => t.id === template.id);
    if (isSelected) {
      onTemplatesSelect(selectedTemplates.filter(t => t.id !== template.id));
    } else {
      onTemplatesSelect([...selectedTemplates, template]);
    }
  }, [selectedTemplates, onTemplatesSelect]);

  // Check if template is selected
  const isTemplateSelected = useCallback((templateId: string) => {
    return selectedTemplates.some(t => t.id === templateId);
  }, [selectedTemplates]);

  // Clear all selections
  const clearSelections = () => {
    onTemplatesSelect([]);
  };

  // Extract keywords from template
  const getTemplateKeywords = (template: BrandTemplate): string[] => {
    const keywords: string[] = [];
    
    // From tags
    if (template.tags) {
      keywords.push(...template.tags.slice(0, 3));
    }
    
    // From content data if available
    const contentData = (template as any).contentData;
    if (contentData?.keywords) {
      keywords.push(...contentData.keywords.slice(0, 3));
    }
    
    // Industry as keyword
    if (template.industry) {
      keywords.push(template.industry);
    }
    
    return [...new Set(keywords)].slice(0, 4);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading top-ranking templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              Choose Your Content Structure
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              <span className="text-amber-400 font-semibold">VITAL:</span> Select templates that rank HIGH on Google in your industry. 
              SAGE Content Agent will analyze and rewrite this content for your client.
            </p>
          </div>
          
          {/* Selection Counter Badge */}
          {selectedTemplates.length > 0 && (
            <div className="flex items-center gap-3">
              <Badge className="bg-cyan-600 text-white px-4 py-2 text-lg">
                <Layers className="w-4 h-4 mr-2" />
                {selectedTemplates.length} Selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelections}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="p-3 border-b border-slate-700 bg-slate-800/30">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by industry, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Industry Filter */}
          <div className="flex items-center gap-2">
            <Button
              variant={!activeIndustry ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveIndustry(null)}
              className={!activeIndustry ? 'bg-cyan-600 hover:bg-cyan-500' : 'border-slate-600 text-slate-300'}
            >
              All ({templates.length})
            </Button>
            <ScrollArea className="max-w-2xl">
              <div className="flex gap-2">
                {INDUSTRIES.filter(ind => industryCounts[ind] > 0).map(industry => (
                  <Button
                    key={industry}
                    variant={activeIndustry === industry ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveIndustry(industry)}
                    className={activeIndustry === industry 
                      ? 'bg-cyan-600 hover:bg-cyan-500 whitespace-nowrap' 
                      : 'border-slate-600 text-slate-300 whitespace-nowrap'}
                  >
                    {industry} ({industryCounts[industry] || 0})
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Check Dependencies Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleCheckDependencies}
            disabled={checkingDependencies || templates.length === 0}
            className="border-cyan-600 text-cyan-400 hover:bg-cyan-600 hover:text-white"
          >
            {checkingDependencies ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Package className="w-4 h-4 mr-1" />
                Check Dependencies
                {selectedTemplates.length > 0 && ` (${selectedTemplates.length})`}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Dependency Results */}
      {dependencyResults && (
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Dependency Check Results
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDependencyResults(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-slate-300">
              Checked <span className="font-semibold text-cyan-400">{dependencyResults.checked}</span> template{dependencyResults.checked !== 1 ? 's' : ''}
            </p>
            {dependencyResults.results && dependencyResults.results.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {dependencyResults.results.map((result: any) => (
                  <Card key={result.templateId} className="bg-slate-800/50 border-slate-700 p-3">
                    <h4 className="font-semibold text-white mb-2">{result.templateName}</h4>
                    <div className="space-y-1 text-xs">
                      {result.cssFrameworks.length > 0 && (
                        <div>
                          <span className="text-purple-400">CSS:</span> {result.cssFrameworks.join(', ')}
                        </div>
                      )}
                      {result.jsLibraries.length > 0 && (
                        <div>
                          <span className="text-blue-400">JS:</span> {result.jsLibraries.join(', ')}
                        </div>
                      )}
                      {result.fonts.length > 0 && (
                        <div>
                          <span className="text-green-400">Fonts:</span> {result.fonts.slice(0, 3).join(', ')}
                          {result.fonts.length > 3 && ` +${result.fonts.length - 3} more`}
                        </div>
                      )}
                      {result.icons.length > 0 && (
                        <div>
                          <span className="text-yellow-400">Icons:</span> {result.icons.join(', ')}
                        </div>
                      )}
                      <div className="text-slate-400 mt-2">
                        Total: {result.totalDependencies} dependencies
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content - Industries with Horizontal Scroll */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.keys(displayIndustries).length === 0 ? (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No ranking templates found. Try a different industry or search term.</p>
            <p className="text-slate-500 text-sm mt-2">
              Use the Search Engine Scraper in Admin Panel to add ranking templates.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(displayIndustries).map(([industry, industryTemplates]) => (
              <div key={industry} className="space-y-3">
                {/* Industry Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    {industry}
                    <Badge variant="secondary" className="ml-2 bg-slate-700 text-slate-300">
                      {industryTemplates.length} templates
                    </Badge>
                  </h2>
                  {industryTemplates.length > 4 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-cyan-400 hover:text-cyan-300"
                      onClick={() => setActiveIndustry(activeIndustry === industry ? null : industry)}
                    >
                      {activeIndustry === industry ? 'Show Less' : 'View All'}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>

                {/* Template Grid - 4 columns */}
                <ScrollArea className="w-full">
                  <div className={`grid gap-4 ${activeIndustry ? 'grid-cols-4' : 'grid-cols-4'}`} 
                       style={{ minWidth: activeIndustry ? 'auto' : `${Math.max(4, industryTemplates.length) * 280}px` }}>
                    {(activeIndustry ? industryTemplates : industryTemplates.slice(0, 8)).map((template) => {
                      const isSelected = isTemplateSelected(template.id);
                      const keywords = getTemplateKeywords(template);
                      
                      return (
                        <Card
                          key={template.id}
                          className={`relative transition-all hover:scale-[1.02] cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-cyan-500 bg-cyan-500/10 shadow-xl shadow-cyan-500/20'
                              : 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50'
                          }`}
                          style={{ minWidth: '260px' }}
                          onClick={() => toggleTemplateSelection(template)}
                        >
                          {/* Selection Checkbox */}
                          <div 
                            className="absolute top-3 left-3 z-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleTemplateSelection(template)}
                              className={`w-6 h-6 rounded-md border-2 ${
                                isSelected 
                                  ? 'bg-cyan-600 border-cyan-600' 
                                  : 'bg-slate-900/80 border-slate-500'
                              }`}
                            />
                          </div>

                          {/* Preview Button */}
                          <div className="absolute top-3 right-3 z-10">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewTemplate(template);
                              }}
                              className="bg-slate-900/80 hover:bg-slate-800 text-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Ranking Badge */}
                          {(template as any).rankingPosition && (
                            <div className="absolute top-3 left-12 z-10">
                              <Badge className="bg-green-600 text-white text-xs">
                                #{(template as any).rankingPosition}
                              </Badge>
                            </div>
                          )}

                          <CardContent className="p-0">
                            {/* Template Preview */}
                            <div className="w-full h-40 rounded-t-lg overflow-hidden bg-white relative">
                              <iframe
                                src={`/api/template-preview/${template.id}`}
                                className="w-full h-full border-0 pointer-events-none"
                                title={`${template.name} Preview`}
                                sandbox="allow-same-origin"
                                loading="lazy"
                                style={{ transform: 'scale(0.4)', transformOrigin: 'top left', width: '250%', height: '250%' }}
                              />
                              {/* Overlay for clicking */}
                              <div className="absolute inset-0 bg-transparent" />
                            </div>

                            {/* Template Info */}
                            <div className="p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-cyan-400" />
                                <h3 className="text-white font-semibold text-sm truncate flex-1">{template.name}</h3>
                              </div>
                              <p className="text-xs text-slate-400 truncate mb-2">by {template.brand}</p>
                              
                              {/* Keywords */}
                              {keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  <Hash className="w-3 h-3 text-slate-500" />
                                  {keywords.map((keyword) => (
                                    <span
                                      key={keyword}
                                      className="text-xs px-1.5 py-0.5 rounded bg-cyan-900/30 text-cyan-300 border border-cyan-800/50"
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Selected Indicator */}
                              {isSelected && (
                                <Badge className="mt-1 bg-cyan-600 text-white">
                                  <Check className="w-3 h-3 mr-1" />
                                  Selected
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  {!activeIndustry && <ScrollBar orientation="horizontal" />}
                </ScrollArea>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedTemplates.length > 0 && (
              <div className="text-slate-300">
                <span className="font-semibold text-cyan-400">{selectedTemplates.length}</span> content template{selectedTemplates.length !== 1 ? 's' : ''} selected
                {selectedTemplates.length > 0 && (
                  <span className="text-emerald-400 ml-2">• SAGE Agent will rewrite for your client</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="outline" onClick={onBack} className="border-slate-600 text-slate-300">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button
              onClick={onContinue}
              disabled={selectedTemplates.length === 0}
              className="bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 px-6"
            >
              Continue to Client Info
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Full-Page Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-slate-900 border-slate-700">
          <DialogHeader className="p-4 border-b border-slate-700 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-white">{previewTemplate?.name}</DialogTitle>
              <Badge variant="secondary" className="bg-slate-700">
                {previewTemplate?.brand}
              </Badge>
              {previewTemplate?.industry && (
                <Badge variant="outline" className="border-cyan-600 text-cyan-400">
                  {previewTemplate.industry}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isTemplateSelected(previewTemplate?.id || '') ? 'default' : 'outline'}
                onClick={() => previewTemplate && toggleTemplateSelection(previewTemplate)}
                className={isTemplateSelected(previewTemplate?.id || '') 
                  ? 'bg-cyan-600 hover:bg-cyan-500' 
                  : 'border-slate-600 text-slate-300'}
              >
                {isTemplateSelected(previewTemplate?.id || '') ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Selected
                  </>
                ) : (
                  'Select This Template'
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>
          
          {/* Full-Page Preview Iframe */}
          <div className="flex-1 w-full h-[calc(95vh-80px)] bg-white">
            {previewTemplate && (
              <iframe
                src={`/api/template-preview/${previewTemplate.id}?full=true`}
                className="w-full h-full border-0"
                title={`${previewTemplate.name} Full Preview`}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContentTemplateSelection;

