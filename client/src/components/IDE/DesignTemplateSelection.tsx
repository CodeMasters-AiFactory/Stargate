/**
 * Design Template Selection - Phase 2
 * User selects the LOOK of their website from world-class designs
 *
 * Features:
 * - 2-column LARGE grid layout (real website size previews)
 * - Category dropdown filters (Type, Industry, Style)
 * - Multi-select: tick multiple designs for AI to merge
 * - Full-page preview with iframe
 * - "Use My Images" vs "Generate with AI (Leonardo)" toggle
 * - Selection counter badge
 * - Click anywhere on template to select
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { BrandTemplate } from '@/types/templates';
import {
    ArrowRight,
    Briefcase,
    Building2,
    Check,
    ChevronLeft,
    Eye,
    Filter,
    LayoutGrid,
    Monitor,
    Sparkles,
    User,
    X
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Template Categories (matching marketplace)
const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: LayoutGrid },
  { id: 'business', name: 'Business', icon: Briefcase },
  { id: 'corporate', name: 'Corporate', icon: Building2 },
  { id: 'startup', name: 'Startup', icon: User },
  { id: 'ecommerce', name: 'E-commerce', icon: Briefcase },
  { id: 'portfolio', name: 'Portfolio', icon: Monitor },
  { id: 'web-design', name: 'Web Design', icon: Sparkles },
  { id: 'restaurant', name: 'Restaurant', icon: LayoutGrid },
  { id: 'healthcare', name: 'Healthcare', icon: User },
  { id: 'real-estate', name: 'Real Estate', icon: Building2 },
  { id: 'technology', name: 'Technology', icon: Sparkles },
  { id: 'education', name: 'Education', icon: Monitor },
  { id: 'finance', name: 'Finance', icon: Building2 },
] as const;


interface DesignTemplateSelectionProps {
  onTemplatesSelect: (templates: BrandTemplate[]) => void;
  selectedTemplates: BrandTemplate[];
  onContinue: () => void;
  onBack?: () => void;
  imageSource?: 'own' | 'leonardo'; // Optional - not used anymore
  onImageSourceChange?: (source: 'own' | 'leonardo') => void; // Optional - not used anymore
}

export function DesignTemplateSelection({
  onTemplatesSelect,
  selectedTemplates,
  onContinue,
  onBack,
  imageSource: _imageSource, // Unused, prefixed with _ to avoid lint errors
  onImageSourceChange: _onImageSourceChange, // Unused, prefixed with _ to avoid lint errors
}: DesignTemplateSelectionProps) {
  // State
  const [templates, setTemplates] = useState<BrandTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<BrandTemplate | null>(null);

  // Category filter (matching marketplace)
  const [selectedCategory, setSelectedCategory] = useState('all');


  // Fetch ALL templates (including downloaded templates from marketplace)
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        // Fetch ALL templates (both downloaded and scraped) - same as marketplace
        const response = await fetch(`/api/templates?pageSize=10000&_t=${Date.now()}`);
        const data = await response.json();

        if (data.success && data.templates) {
          setTemplates(data.templates);
          console.log(`[DesignTemplateSelection] Loaded ${data.templates.length} templates`);
        }
      } catch (error) {
        console.error('[DesignTemplateSelection] Failed to fetch templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Group templates by category
  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, BrandTemplate[]> = {};

    templates.forEach(template => {
      const category = (template as any).designCategory || template.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(template);
    });

    return grouped;
  }, [templates]);

  // Filter templates by category only (no search)
  const filteredTemplatesByCategory = useMemo(() => {
    const filtered: Record<string, BrandTemplate[]> = {};

    Object.entries(templatesByCategory).forEach(([category, categoryTemplates]) => {
      const matchingTemplates = categoryTemplates.filter(t => {
        // Category filter - match selected category (check category, industry, designCategory, and tags)
        const templateCategory = (t.category || t.industry || (t as any).designCategory || category || '').toLowerCase();
        const templateTags = ((t.tags || []) as string[]).map(tag => tag.toLowerCase()).join(' ');
        const allText = `${templateCategory} ${templateTags}`;
        const categoryId = selectedCategory.toLowerCase();

        const matchesCategory =
          selectedCategory === 'all' ||
          templateCategory === categoryId ||
          templateCategory.includes(categoryId) ||
          categoryId.includes(templateCategory) ||
          allText.includes(categoryId) ||
          (categoryId === 'web-design' && (templateCategory === 'web design' || allText.includes('web design'))) ||
          (categoryId === 'real-estate' && (templateCategory === 'real estate' || allText.includes('real estate'))) ||
          (categoryId === 'business' && (
            templateCategory.includes('business') ||
            templateCategory.includes('company') ||
            allText.includes('business') ||
            allText.includes('company') ||
            templateCategory === 'business services' ||
            templateCategory === 'small business'
          )) ||
          (categoryId === 'finance' && (
            templateCategory.includes('finance') ||
            templateCategory.includes('financial') ||
            templateCategory.includes('banking') ||
            allText.includes('finance') ||
            allText.includes('financial')
          )) ||
          (categoryId === 'education' && (
            templateCategory.includes('education') ||
            templateCategory.includes('school') ||
            templateCategory.includes('university') ||
            allText.includes('education') ||
            allText.includes('school')
          ));

        return matchesCategory;
      });

      if (matchingTemplates.length > 0) {
        filtered[category] = matchingTemplates;
      }
    });

    return filtered;
  }, [templatesByCategory, selectedCategory]);

  // Get templates for display (all filtered templates)
  const displayCategories = useMemo(() => {
    return filteredTemplatesByCategory;
  }, [filteredTemplatesByCategory]);

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

  // Handle ESC key to close fullscreen preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewTemplate) {
        setPreviewTemplate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewTemplate]);

  // Clear all selections
  const clearSelections = () => {
    onTemplatesSelect([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading world-class designs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Compact Header */}
      <div className="px-4 py-2 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between gap-4">
          {/* Title - Compact */}
          <h1 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
              Choose Your Design
            </h1>

          {/* Selection Counter & Controls - Compact */}
          <div className="flex items-center gap-2">
          {selectedTemplates.length > 0 && (
              <>
                <Badge className="bg-cyan-500 text-white px-2 py-1 text-sm shadow-lg shadow-cyan-500/50">
                {selectedTemplates.length} Selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelections}
                  className="text-slate-400 hover:text-white h-7 px-2"
              >
                  <X className="w-3 h-3" />
              </Button>
              </>
            )}
            </div>
        </div>
      </div>

      {/* Category Dropdown - Simple */}
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/30">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[250px] bg-slate-800/50 border-slate-700 text-white">
            <Filter className="w-4 h-4 mr-2 text-cyan-400" />
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 w-[280px]">
            {TEMPLATE_CATEGORIES.map(category => {
              const Icon = category.icon;
              const count = templates.filter(t => {
                const templateCategory = (t.category || t.industry || (t as any).designCategory || '').toLowerCase();
                const templateTags = ((t.tags || []) as string[]).map(tag => tag.toLowerCase()).join(' ');
                const categoryId = category.id.toLowerCase();

                // Check category, industry, designCategory, and tags
                const allText = `${templateCategory} ${templateTags}`;

                return category.id === 'all' ||
                  templateCategory === categoryId ||
                  templateCategory.includes(categoryId) ||
                  categoryId.includes(templateCategory) ||
                  allText.includes(categoryId) ||
                  (categoryId === 'web-design' && (templateCategory === 'web design' || allText.includes('web design'))) ||
                  (categoryId === 'real-estate' && (templateCategory === 'real estate' || allText.includes('real estate'))) ||
                  (categoryId === 'business' && (
                    templateCategory.includes('business') ||
                    templateCategory.includes('company') ||
                    allText.includes('business') ||
                    allText.includes('company') ||
                    templateCategory === 'business services' ||
                    templateCategory === 'small business'
                  )) ||
                  (categoryId === 'finance' && (
                    templateCategory.includes('finance') ||
                    templateCategory.includes('financial') ||
                    templateCategory.includes('banking') ||
                    allText.includes('finance') ||
                    allText.includes('financial')
                  )) ||
                  (categoryId === 'education' && (
                    templateCategory.includes('education') ||
                    templateCategory.includes('school') ||
                    templateCategory.includes('university') ||
                    allText.includes('education') ||
                    allText.includes('school')
                  ));
              }).length;

              return (
                <SelectItem key={category.id} value={category.id} className="text-white hover:bg-slate-700">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 flex-1">
                      <Icon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span>{category.name}</span>
            </div>
                    <Badge variant="secondary" className="bg-slate-700 text-purple-200 flex-shrink-0 ml-4 w-8 text-right">
                      {count}
                    </Badge>
                  </div>
                </SelectItem>
              );
            })}
            </SelectContent>
          </Select>
          </div>


      {/* Floating Proceed Button - Appears when template is selected */}
      {selectedTemplates.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Button
            onClick={onContinue}
            className="bg-cyan-500 hover:bg-cyan-400 text-white px-8 py-3 text-base font-semibold shadow-2xl shadow-cyan-500/50 rounded-full"
            size="lg"
          >
            <span className="mr-2">Proceed with {selectedTemplates.length} Template{selectedTemplates.length !== 1 ? 's' : ''}</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Main Content - LARGE 2-Column Template Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {Object.keys(displayCategories).length === 0 ? (
          <div className="text-center py-12">
            <Monitor className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 text-lg">No templates found matching your filters.</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filters above.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(displayCategories).map(([category, categoryTemplates]) => (
              <div key={category} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <LayoutGrid className="w-6 h-6 text-cyan-400" />
                    {category}
                        <Badge variant="secondary" className="ml-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-sm px-3 py-1">
                      {categoryTemplates.length} templates
                    </Badge>
                  </h2>
                </div>

                {/* Template Grid - 2 LARGE columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {categoryTemplates.map((template) => {
                    const isSelected = isTemplateSelected(template.id);
                    return (
                      <Card
                        key={template.id}
                        className={`relative transition-all duration-300 cursor-pointer group overflow-hidden ${
                          isSelected
                            ? 'ring-4 ring-cyan-500 bg-cyan-500/10 shadow-2xl shadow-cyan-500/30 scale-[1.01]'
                            : 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10'
                        }`}
                        onClick={() => toggleTemplateSelection(template)}
                      >
                        {/* Selection Indicator - Large Checkmark Overlay */}
                        {isSelected && (
                          <div className="absolute top-4 left-4 z-30">
                            <div className="bg-cyan-500 rounded-full p-3 shadow-lg shadow-cyan-500/50">
                              <Check className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        )}

                        {/* Preview & Full View Buttons */}
                        <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewTemplate(template);
                            }}
                            className="bg-slate-900/90 hover:bg-slate-800 text-white shadow-lg"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Full Preview
                          </Button>
                        </div>

                        <CardContent className="p-0">
                          {/* LARGE Template Preview - Real Website Size */}
                          <div className="w-full aspect-[16/10] overflow-hidden bg-white relative rounded-t-lg">
                            <iframe
                              src={`/api/templates/${template.id}/preview-html`}
                              className="w-full h-full border-0 pointer-events-none"
                              title={`${template.name} Preview`}
                              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                              loading="lazy"
                              style={{
                                transform: 'scale(0.35)',
                                transformOrigin: 'top left',
                                width: '285%',
                                height: '285%'
                              }}
                            />
                            {/* Hover Overlay */}
                            <div className={`absolute inset-0 z-20 transition-all duration-300 ${
                              isSelected
                                ? 'bg-cyan-500/10'
                                : 'hover:bg-cyan-500/5'
                            }`} />

                            {/* Click to Select Hint */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-slate-900/90 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                                {isSelected ? '✓ Selected - Click to deselect' : 'Click to select this template'}
                              </div>
                            </div>
                          </div>

                          {/* Template Info - Larger and Clearer */}
                          <div className="p-4 bg-slate-800/50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-white font-bold text-lg">{template.name}</h3>
                                <p className="text-sm text-slate-400 mt-1">by {template.brand}</p>
                              </div>

                              {/* Selected Badge */}
                              {isSelected && (
                                <Badge className="bg-cyan-500 text-white px-3 py-1 text-sm shadow-lg shadow-cyan-500/50">
                                  <Check className="w-4 h-4 mr-1" />
                                  Selected
                                </Badge>
                              )}
                            </div>

                            {/* Tags & Category */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {/* Category Tag */}
                              <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {category}
                              </span>
                              {/* Additional Tags */}
                              {(template.tags || []).slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-3 py-1 rounded-full bg-slate-700/50 text-slate-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
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
                <span className="font-semibold text-cyan-400">{selectedTemplates.length}</span> design{selectedTemplates.length !== 1 ? 's' : ''} selected
                {selectedTemplates.length > 1 && (
                  <span className="text-slate-500 ml-2">• AI will merge these into one beautiful design</span>
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
              className="bg-cyan-500 hover:bg-cyan-400 text-white disabled:opacity-50 disabled:cursor-not-allowed px-8 py-2 text-base font-semibold shadow-lg shadow-cyan-500/50"
            >
              Proceed to Next Phase
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* FULLSCREEN Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-[100] bg-black">
          {/* Floating Control Bar - Top */}
          <div className="absolute top-0 left-0 right-0 z-[110] bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between max-w-screen-xl mx-auto">
              {/* Back Button & Template Info */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setPreviewTemplate(null)}
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back to Templates
                </Button>
                <div className="text-white">
                  <h2 className="font-bold text-lg">{previewTemplate.name}</h2>
                  <p className="text-sm text-white/70">by {previewTemplate.brand}</p>
                </div>
              </div>

              {/* Select Button */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => toggleTemplateSelection(previewTemplate)}
                  className={isTemplateSelected(previewTemplate.id)
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20'}
                >
                  {isTemplateSelected(previewTemplate.id) ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Selected
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Select This Template
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setPreviewTemplate(null)}
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>

          {/* FULLSCREEN Preview Iframe */}
          <iframe
            src={`/api/templates/${previewTemplate.id}/preview-html`}
            className="w-full h-full border-0"
            title={`${previewTemplate.name} Full Preview`}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          />

          {/* Press ESC Hint */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[110]">
            <div className="bg-black/60 backdrop-blur-sm text-white/70 text-sm px-4 py-2 rounded-full border border-white/10">
              Press <kbd className="bg-white/20 px-2 py-0.5 rounded mx-1">ESC</kbd> or click Back to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DesignTemplateSelection;

