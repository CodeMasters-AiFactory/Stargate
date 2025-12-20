/**
 * Template Selection Stage Component
 * First step in the wizard - user selects their template
 */

import { INDUSTRIES, IndustrySelector } from '@/components/TemplateSelector/IndustrySelector';
import { SubCategorySelector } from '@/components/TemplateSelector/SubCategorySelector';
import { TemplatePreview } from '@/components/TemplateSelector/TemplatePreview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BrandTemplate } from '@/types/templates';
import { Check, ChevronLeft, ChevronRight, Grid3x3, Maximize2, Search, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

interface TemplateSelectionStageProps {
  onTemplateSelect: (template: BrandTemplate) => void;
  selectedTemplate: BrandTemplate | null;
  onContinue: () => void;
  onBack?: () => void;
}

// Normalize industry names for filtering (moved outside component)
const INDUSTRY_MAP: Record<string, string> = {
  'restaurant': 'Food & Beverage',
  'cafe': 'Food & Beverage',
  'bar': 'Food & Beverage',
  'food': 'Food & Beverage',
  'coffee': 'Food & Beverage',
  'bakery': 'Food & Beverage',
  'fitness': 'Healthcare',
  'yoga': 'Healthcare',
  'healthcare': 'Healthcare',
  'medical': 'Healthcare',
  'dental': 'Healthcare',
  'veterinary': 'Healthcare',
  'real-estate': 'Real Estate',
  'real estate': 'Real Estate',
  'tech': 'Technology',
  'it': 'Technology',
  'technology': 'Technology',
  'retail': 'E-commerce',
  'ecommerce': 'E-commerce',
  'e-commerce': 'E-commerce',
  'education': 'Education',
  'finance': 'Finance',
  'automotive': 'Automotive',
  'fashion': 'Fashion',
  'legal': 'Legal',
  'consulting': 'Consulting',
  'nonprofit': 'Non-profit',
  'non-profit': 'Non-profit',
  'entertainment': 'Entertainment',
  'music': 'Entertainment',
  'hospitality': 'Hospitality',
  'travel': 'Hospitality',
  'manufacturing': 'Manufacturing',
};

// Import templates from API or use local data
// For now, we'll fetch from API
export function TemplateSelectionStage({
  onTemplateSelect,
  selectedTemplate,
  onContinue,
  onBack,
}: TemplateSelectionStageProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<BrandTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<BrandTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [templateCounts, setTemplateCounts] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<'compact' | 'large'>('large');
  const [currentPage, setCurrentPage] = useState(1);
  const TEMPLATES_PER_PAGE = viewMode === 'compact' ? 12 : 8; // 4x3 for compact, 4x2 for large (4 per row)
  const [templateTypeFilter, setTemplateTypeFilter] = useState<'all' | 'free' | 'paid'>('all');

  // Design quality templates state
  const [showDesignQuality, setShowDesignQuality] = useState(false);
  const [selectedDesignCategory, setSelectedDesignCategory] = useState<string | null>(null);
  const [designQualityTemplates, setDesignQualityTemplates] = useState<BrandTemplate[]>([]);
  const [designCategoryCounts, setDesignCategoryCounts] = useState<Record<string, number>>({});

  // Fetch design quality templates
  useEffect(() => {
    const fetchDesignQualityTemplates = async () => {
      try {
        const response = await fetch(`/api/templates?isDesignQuality=true&pageSize=10000&_t=${Date.now()}`);
        const data = await response.json();

        if (data.success && data.templates) {
          setDesignQualityTemplates(data.templates);

          // Calculate counts by design category
          const counts: Record<string, number> = {};
          data.templates.forEach((template: BrandTemplate) => {
            const category = (template as any).designCategory || 'Uncategorized';
            counts[category] = (counts[category] || 0) + 1;
          });

          setDesignCategoryCounts(counts);
        }
      } catch (error) {
        console.error('[TemplateSelectionStage] Failed to fetch design quality templates:', error);
      }
    };

    fetchDesignQualityTemplates();
  }, []);

  // Filter design quality templates by category
  const filteredDesignQualityTemplates = useMemo(() => {
    if (!showDesignQuality) return [];

    let filtered = designQualityTemplates;

    // Filter by design category
    if (selectedDesignCategory) {
      filtered = filtered.filter(t => {
        const category = (t as any).designCategory;
        return category === selectedDesignCategory;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.brand.toLowerCase().includes(query) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [designQualityTemplates, showDesignQuality, selectedDesignCategory, searchQuery]);

  // Fetch templates and counts from API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // Fetch all templates (no pagination) to get accurate industry counts
        // Add cache-busting timestamp to force fresh data
        const [templatesResponse, countsResponse] = await Promise.all([
          (() => {
            let url = `/api/templates?ranked=true&brand=true&pageSize=10000&_t=${Date.now()}`;
            if (templateTypeFilter === 'free') url += '&freeOnly=true';
            else if (templateTypeFilter === 'paid') url += '&isPremium=true';
            return url;
          })(),
          fetch(`/api/templates/counts-by-industry?_t=${Date.now()}`),
        ]);

        const templatesData = await templatesResponse.json();
        const countsData = await countsResponse.json();

        // eslint-disable-next-line no-console
        console.log('[TemplateSelectionStage] API Response:', {
          success: templatesData.success,
          templateCount: templatesData.templates?.length || 0,
          industryCounts: countsData.counts || {},
        });

        if (templatesData.success && templatesData.templates) {
          setTemplates(templatesData.templates);
        } else {
          // eslint-disable-next-line no-console
          console.warn('[TemplateSelectionStage] No templates in API response');
          setTemplates([]);
        }

        // Use accurate counts from dedicated endpoint
        if (countsData.success && countsData.counts) {
          setTemplateCounts(countsData.counts);
        } else {
          // Fallback: Calculate from templates if counts endpoint fails
          const counts: Record<string, number> = {};
          if (templatesData.templates) {
            templatesData.templates.forEach((template: BrandTemplate) => {
              const industry = template.industry || template.category || 'general';
              counts[industry] = (counts[industry] || 0) + 1;
            });
          }
          setTemplateCounts(counts);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[TemplateSelectionStage] Failed to fetch templates:', error);
        // Fallback to empty array
        setTemplates([]);
        setTemplateCounts({});
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [templateTypeFilter]);

  // Normalize industry helper
  const normalizeIndustryHelper = React.useCallback((industry: string): string => {
    const normalized = industry.toLowerCase().trim();
    return INDUSTRY_MAP[normalized] || industry;
  }, []);

  // Check if selected industry is a design quality category
  const isDesignQualityCategory = useMemo(() => {
    return selectedIndustry === 'Top 100' || selectedIndustry === 'Top 1000' || selectedIndustry === 'Top 10000';
  }, [selectedIndustry]);

  // Filter templates by industry, sub-category, and search
  const filteredTemplates = useMemo(() => {
    // If design quality category is selected, show design quality templates instead
    if (isDesignQualityCategory) {
      let filtered = designQualityTemplates;

      // Filter by design category (Top 100, Top 1000, Top 10000)
      if (selectedIndustry) {
        filtered = filtered.filter(t => {
          const category = (t as any).designCategory;
          return category === selectedIndustry;
        });
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(t =>
          t.name.toLowerCase().includes(query) ||
          t.brand.toLowerCase().includes(query) ||
          (t.tags || []).some(tag => tag.toLowerCase().includes(query))
        );
      }

      return filtered;
    }

    if (showDesignQuality) return []; // Don't show regular templates when showing design quality

    let filtered = templates;

    // REQUIRED: Filter by industry (force selection)
    if (selectedIndustry) {
      filtered = filtered.filter(t => {
        if (!t.industry) return false;
        const normalized = normalizeIndustryHelper(t.industry);
        return normalized === selectedIndustry;
      });
    } else {
      // If no industry selected, return empty array (force selection)
      return [];
    }

    // Filter by sub-category (if selected)
    if (selectedSubCategory) {
      const subCategoryMap: Record<string, string[]> = {
        'Corporate': ['corporate', 'enterprise', 'business'],
        'Startup': ['startup', 'tech'],
        'Luxury': ['luxury', 'premium'],
        'Minimal': ['minimal', 'clean'],
        'Modern': ['modern', 'contemporary'],
        'Classic': ['classic', 'traditional'],
        'Creative': ['creative', 'artistic'],
        'Business': ['business', 'professional'],
        'Private': ['private', 'personal'],
        'Enterprise': ['enterprise', 'corporate'],
      };

      const keywords = subCategoryMap[selectedSubCategory] || [];
      filtered = filtered.filter(t => {
        const category = (t.category || '').toLowerCase();
        const tags = (t.tags || []).map(tag => tag.toLowerCase());
        const allKeywords = [category, ...tags].join(' ');
        return keywords.some(keyword => allKeywords.includes(keyword));
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.brand.toLowerCase().includes(query) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [templates, selectedIndustry, selectedSubCategory, searchQuery, normalizeIndustryHelper, isDesignQualityCategory, designQualityTemplates, showDesignQuality]);

  // Pagination
  const totalPages = Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE);
  const startIndex = (currentPage - 1) * TEMPLATES_PER_PAGE;
  const endIndex = startIndex + TEMPLATES_PER_PAGE;
  const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedIndustry, selectedSubCategory, searchQuery]);

  const handleTemplateClick = (template: BrandTemplate) => {
    onTemplateSelect(template);
  };

  const handleDeselect = () => {
    onTemplateSelect(null as unknown as BrandTemplate); // Clear selection
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading templates...</p>
        </div>
      </div>
    );
  }

  // If no industry selected, show industry selection screen
  if (!selectedIndustry) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 items-center justify-center">
        <div className="w-full px-6" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1"></div>
              <h1 className="text-4xl font-bold text-white flex-1">Choose Your Industry</h1>
              <div className="flex-1 flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    // Exit wizard and return to home
                    window.location.href = '/';
                  }}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                  title="Exit Wizard"
                >
                  <X className="w-5 h-5 mr-2" />
                  Exit
                </Button>
              </div>
            </div>
            <p className="text-slate-400 text-lg">
              Select your industry to see the top-ranked templates. We&apos;ll show you the best designs based on Google rankings.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <IndustrySelector
              selectedIndustry={selectedIndustry}
              onIndustryChange={(industry) => {
                setSelectedIndustry(industry);
                setSelectedSubCategory(null); // Reset sub-category when industry changes
                setCurrentPage(1);
              }}
              templateCounts={templateCounts}
              className="w-full"
            />
            <p className="text-sm text-slate-500 mt-4 text-center">
              <span className="font-semibold text-slate-300">{INDUSTRIES.length} industries</span> available • {Object.values(templateCounts).reduce((a, b) => a + b, 0)} templates available across all industries
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="mx-auto" style={{ maxWidth: '100%', width: '100%' }}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Choose Your Design Among the Top 1000 Websites in the World</h1>
                  <p className="text-sm text-slate-400">
                    {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
                    {selectedIndustry && (
                      <> for <strong className="text-white">{selectedIndustry}</strong></>
                    )}
                    {selectedSubCategory && (
                      <> • <strong className="text-white">{selectedSubCategory}</strong></>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">
                    <span className="font-semibold text-slate-300">{INDUSTRIES.length} industries</span> available
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  // Exit wizard and return to home
                  window.location.href = '/';
                }}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
                title="Exit Wizard"
              >
                <X className="w-4 h-4 mr-2" />
                Exit
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedIndustry(null)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <X className="w-4 h-4 mr-2" />
                Change Industry
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="p-3 border-b border-slate-700 bg-slate-800/30">
        <div className="mx-auto flex items-center gap-3 flex-wrap" style={{ width: '100%', maxWidth: '100%' }}>
          {/* Sub-Category Selector (shown after industry is selected) */}
          {selectedIndustry && (
            <SubCategorySelector
              selectedSubCategory={selectedSubCategory}
              onSubCategoryChange={(subCategory) => {
                setSelectedSubCategory(subCategory);
                setCurrentPage(1);
              }}
              templateCounts={(() => {
                // Calculate counts for templates in selected industry only
                const industryTemplates = templates.filter(t => {
                  if (!t.industry) return false;
                  const normalized = normalizeIndustryHelper(t.industry);
                  return normalized === selectedIndustry;
                });

                // Map sub-categories to keywords
                const subCategoryMap: Record<string, string[]> = {
                  'Corporate': ['corporate', 'enterprise', 'business'],
                  'Startup': ['startup', 'tech'],
                  'Luxury': ['luxury', 'premium'],
                  'Minimal': ['minimal', 'clean'],
                  'Modern': ['modern', 'contemporary'],
                  'Classic': ['classic', 'traditional'],
                  'Creative': ['creative', 'artistic'],
                  'Business': ['business', 'professional'],
                  'Private': ['private', 'personal'],
                  'Enterprise': ['enterprise', 'corporate'],
                };

                const counts: Record<string, number> = {};

                // Count templates by sub-category
                industryTemplates.forEach(t => {
                  const category = (t.category || '').toLowerCase();
                  const tags = (t.tags || []).map(tag => tag.toLowerCase());
                  const allKeywords = [category, ...tags].join(' ');

                  Object.entries(subCategoryMap).forEach(([subCat, keywords]) => {
                    if (keywords.some(keyword => allKeywords.includes(keyword))) {
                      counts[subCat.toLowerCase()] = (counts[subCat.toLowerCase()] || 0) + 1;
                    }
                  });
                });

                return counts;
              })()}
            />
          )}

          <div className="flex-1" style={{ width: '100%', maxWidth: '100%' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
            <Button
              size="sm"
              variant={viewMode === 'compact' ? 'default' : 'ghost'}
              onClick={() => setViewMode('compact')}
              className={viewMode === 'compact' ? 'bg-cyan-600 hover:bg-cyan-500' : 'text-slate-400 hover:text-white'}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'large' ? 'default' : 'ghost'}
              onClick={() => setViewMode('large')}
              className={viewMode === 'large' ? 'bg-cyan-600 hover:bg-cyan-500' : 'text-slate-400 hover:text-white'}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          {selectedTemplate && (
            <Button
              onClick={handleDeselect}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <X className="w-4 h-4 mr-2" />
              Deselect
            </Button>
          )}
        </div>
      </div>

      {/* Main Content - Full width container for 7 templates per row */}
      <div className="flex-1 overflow-auto p-4" style={{ overflowX: 'auto', overflowY: 'auto', width: '100%', maxWidth: '100%' }}>
        <div className="mx-auto" style={{ width: '100%', maxWidth: '100%' }}>
          {/* Toggle between Ranking-based and Design Quality templates */}
          <div className="mb-4 flex items-center gap-4 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <Button
              variant={!showDesignQuality ? 'default' : 'outline'}
              onClick={() => setShowDesignQuality(false)}
              className={!showDesignQuality ? 'bg-cyan-600 hover:bg-cyan-500' : 'border-slate-600 text-slate-300'}
            >
              Ranking-Based Templates
            </Button>
            <Button
              variant={showDesignQuality ? 'default' : 'outline'}
              onClick={() => setShowDesignQuality(true)}
              className={showDesignQuality ? 'bg-pink-600 hover:bg-pink-500' : 'border-slate-600 text-slate-300'}
            >
              Design Quality Templates
            </Button>
          </div>

          {/* Free/Paid Template Filter (only for Ranking-Based templates) */}
          {!showDesignQuality && (
            <div className="mb-4 flex items-center gap-4 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <Button
                variant={templateTypeFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setTemplateTypeFilter('all')}
                className={templateTypeFilter === 'all' ? 'bg-green-600 hover:bg-green-500' : 'border-slate-600 text-slate-300'}
              >
                All Templates
              </Button>
              <Button
                variant={templateTypeFilter === 'free' ? 'default' : 'outline'}
                onClick={() => setTemplateTypeFilter('free')}
                className={templateTypeFilter === 'free' ? 'bg-green-600 hover:bg-green-500' : 'border-slate-600 text-slate-300'}
              >
                Free Templates
              </Button>
              <Button
                variant={templateTypeFilter === 'paid' ? 'default' : 'outline'}
                onClick={() => setTemplateTypeFilter('paid')}
                className={templateTypeFilter === 'paid' ? 'bg-yellow-600 hover:bg-yellow-500' : 'border-slate-600 text-slate-300'}
              >
                Premium Templates
              </Button>
            </div>
          )}

          {/* Design Category Selector (for Design Quality templates) */}
          {(showDesignQuality || isDesignQualityCategory) && (
            <div className="mb-4 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Design Category</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!selectedDesignCategory ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDesignCategory(null)}
                  className={!selectedDesignCategory ? 'bg-cyan-600 hover:bg-cyan-500' : 'border-slate-600 text-slate-300'}
                >
                  All Categories ({designQualityTemplates.length})
                </Button>
                {Object.entries(designCategoryCounts).map(([category, count]) => (
                  <Button
                    key={category}
                    variant={selectedDesignCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDesignCategory(category)}
                    className={selectedDesignCategory === category ? 'bg-cyan-600 hover:bg-cyan-500' : 'border-slate-600 text-slate-300'}
                  >
                    {category} ({count})
                  </Button>
                ))}
              </div>
            </div>
          )}

          {(showDesignQuality ? filteredDesignQualityTemplates : filteredTemplates).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No templates found. Try a different {showDesignQuality ? 'design category' : 'industry'} or search term.</p>
            </div>
          ) : (
            <>
              {/* Template Grid - 7 per row with proper spacing and scrolling */}
              <div
                className="grid gap-4 grid-cols-7"
                style={{
                  width: '100%',
                  maxWidth: '100%',
                }}
              >
                {paginatedTemplates.map((template) => {
                  const isSelected = selectedTemplate?.id === template.id;
                  return (
                    <Card
                      key={template.id}
                      className={`transition-all hover:scale-[1.02] hover:shadow-xl ${
                        isSelected
                          ? 'ring-2 ring-cyan-500 bg-cyan-500/5 shadow-2xl'
                          : 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 hover:shadow-lg'
                      } flex flex-col h-full`}
                      style={{ minWidth: '180px', maxWidth: '100%' }}
                    >
                      <CardContent className="p-0 flex flex-col h-full">
                        {/* Interactive Preview Iframe */}
                        <div
                          className="w-full rounded-t-md overflow-hidden bg-white relative h-72"
                          style={{
                            border: isSelected ? '3px solid #06b6d4' : '1px solid #334155',
                          }}
                        >
                          <iframe
                            src={`/api/template-preview/${template.id}`}
                            className="w-full h-full border-0"
                            title={`${template.name} Preview`}
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                            loading="lazy"
                            style={{ pointerEvents: 'auto' }}
                            onLoad={(e) => {
                              // Hide loading overlay when iframe loads
                              const overlay = e.currentTarget.parentElement?.querySelector('.loading-overlay');
                              if (overlay) {
                                (overlay as HTMLElement).style.display = 'none';
                              }
                            }}
                          />
                          {/* Loading overlay */}
                          <div className="loading-overlay absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                          </div>
                        </div>

                        {/* Template Info & Actions */}
                        <div className="p-3 flex-1 flex flex-col">
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-white font-bold text-sm">
                                {template.name}
                              </h3>
                              {(template as any).isPremium ? (
                                <Badge className="bg-yellow-500 text-white text-xs">PREMIUM</Badge>
                              ) : (
                                <Badge className="bg-green-500 text-white text-xs">FREE</Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">by {template.brand}</p>
                            {(template as any).isPremium && (template as any).price && (
                              <p className="text-xs text-yellow-400 font-semibold mt-0.5">${(template as any).price}</p>
                            )}
                          </div>

                          {/* Selected Badge */}
                          {isSelected && (
                            <Badge className="bg-cyan-500 text-white text-xs mb-2 px-2 py-0.5 w-fit">
                              <Check className="w-3 h-3 mr-1" />
                              Selected
                            </Badge>
                          )}

                          {/* Tags */}
                          {(template.tags || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {(template.tags || []).slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Selection Button */}
                          <div className="mt-auto">
                            <Button
                              size="sm"
                              variant={isSelected ? "default" : "outline"}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTemplateClick(template);
                              }}
                              className={`w-full ${
                                isSelected
                                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                                  : 'border border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-cyan-500'
                              } text-xs py-2 h-auto`}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Selected
                                </>
                              ) : (
                                'Select This Design'
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-slate-600 text-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="text-slate-300 text-sm">
                    Page {currentPage} of {totalPages} ({filteredTemplates.length} templates)
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-slate-600 text-slate-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview Modal (when View clicked) */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-lg w-full max-h-[90vh] overflow-auto border border-slate-700" style={{ width: '100%', maxWidth: '100%' }}>
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{previewTemplate.name}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <TemplatePreview
                template={previewTemplate}
                onClose={() => setPreviewTemplate(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-700 bg-slate-800/30">
        <div className="mx-auto flex items-center justify-between" style={{ maxWidth: '100%', width: '100%' }}>
          <div>
            {selectedTemplate && (
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-5 h-5 text-cyan-500" />
                <span>
                  Selected: <strong className="text-white">{selectedTemplate.name}</strong>
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                // Exit wizard and return to home
                window.location.href = '/';
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <X className="w-4 h-4 mr-2" />
              Exit Wizard
            </Button>
            {onBack && (
              <Button variant="outline" onClick={onBack} className="border-slate-600 text-slate-300">
                Back
              </Button>
            )}
            <Button
              onClick={onContinue}
              disabled={!selectedTemplate}
              className="bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed px-6"
            >
              Proceed
              <span className="ml-2">→</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

