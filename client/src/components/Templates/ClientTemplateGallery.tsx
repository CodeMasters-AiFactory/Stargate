/**
 * Client Template Gallery Component
 * Shows templates in a card grid layout similar to services dashboard
 * Categories at top, double-click to open full screen browser
 */

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
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
import { 
  Globe, 
  Download, 
  Sparkles, 
  Maximize2,
  ExternalLink,
  CheckCircle2,
  Circle,
  Trash2,
  X
} from 'lucide-react';
import type { BrandTemplate } from '@/types/templates';

interface ClientTemplateGalleryProps {
  onSelectTemplate?: (template: BrandTemplate) => void;
  selectedTemplateId?: string;
  pricingFilter?: 'all' | 'free' | 'paid';
}

// Template categories (excluding 'all' since it's now in the header pricing filter)
const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: Globe },
  { id: 'web-design', name: 'Web Design', icon: Sparkles },
  { id: 'startup', name: 'Startup', icon: Circle },
  { id: 'corporate', name: 'Corporate', icon: CheckCircle2 },
  { id: 'ecommerce', name: 'E-commerce', icon: Download },
  { id: 'portfolio', name: 'Portfolio', icon: ExternalLink },
  { id: 'restaurant', name: 'Restaurant', icon: Globe },
  { id: 'healthcare', name: 'Healthcare', icon: Circle },
  { id: 'real-estate', name: 'Real Estate', icon: CheckCircle2 },
  { id: 'technology', name: 'Technology', icon: Sparkles },
] as const;

export function ClientTemplateGallery({ 
  onSelectTemplate, 
  selectedTemplateId,
  pricingFilter = 'all'
}: ClientTemplateGalleryProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templates, setTemplates] = useState<BrandTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedPreviews, setLoadedPreviews] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<BrandTemplate | null>(null);

  // Load templates from API
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        
        // Load all templates (both downloaded and scraped)
        const response = await fetch('/api/templates?pageSize=10000');
        const data = await response.json();
        
        if (data.success && data.templates) {
          setTemplates(data.templates);
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Filter templates by category and pricing
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // Pricing filter - for now, all templates are free (no isPaid field yet)
      // When paid templates are added, check template.isPaid or template.pricing === 'paid'
      const isPaid = false; // TODO: Add isPaid field to template type
      const matchesPricing = 
        pricingFilter === 'all' ||
        (pricingFilter === 'free' && !isPaid) ||
        (pricingFilter === 'paid' && isPaid);
      
      if (!matchesPricing) return false;
      
      // Category filter
      const templateCategory = (template.category || template.industry || '').toLowerCase();
      const categoryId = selectedCategory.toLowerCase();
      
      const matchesCategory = 
        selectedCategory === 'all' ||
        templateCategory === categoryId ||
        templateCategory.includes(categoryId) ||
        categoryId.includes(templateCategory) ||
        (categoryId === 'web-design' && templateCategory === 'web design') ||
        (categoryId === 'real-estate' && templateCategory === 'real estate');
      
      return matchesCategory;
    });
  }, [templates, selectedCategory, pricingFilter]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TEMPLATE_CATEGORIES.forEach(cat => {
      if (cat.id === 'all') {
        counts.all = templates.length;
      } else {
        const categoryId = cat.id.toLowerCase();
        counts[cat.id] = templates.filter(t => {
          const templateCategory = (t.category || t.industry || '').toLowerCase();
          return templateCategory === categoryId ||
                 templateCategory.includes(categoryId) ||
                 categoryId.includes(templateCategory) ||
                 (categoryId === 'web-design' && templateCategory === 'web design') ||
                 (categoryId === 'real-estate' && templateCategory === 'real estate');
        }).length;
      }
    });
    return counts;
  }, [templates]);

  const handleDoubleClick = (template: BrandTemplate) => {
    // Navigate to full-page preview
    setLocation(`/template-preview/${template.id}`);
  };

  const handleSelectTemplate = (template: BrandTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, template: BrandTemplate) => {
    e.stopPropagation(); // Prevent card click
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    try {
      const response = await fetch(`/api/templates/${templateToDelete.id}?hardDelete=true`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Remove template from list
        setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
        toast({
          title: 'Template Deleted',
          description: `${templateToDelete.name} has been deleted.`,
        });
      } else {
        toast({
          title: 'Delete Failed',
          description: data.error || 'Failed to delete template',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'An error occurred while deleting the template',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-purple-800/50">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.map(category => {
            const Icon = category.icon;
            const count = categoryCounts[category.id] || 0;
            
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                className={`flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-slate-800/50 hover:bg-slate-700 text-purple-200 border-purple-700'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
                <Badge 
                  variant="secondary" 
                  className={`ml-1 ${
                    selectedCategory === category.id 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-slate-700 text-purple-200'
                  }`}
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>

      </div>

      {/* Template Grid */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto" />
              <p className="text-purple-200">Loading templates...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredTemplates.map(template => {
              const isSelected = selectedTemplateId === template.id;
              
              return (
                <Card
                  key={template.id}
                  className={`group cursor-pointer transition-all hover:shadow-2xl hover:scale-105 ${
                    isSelected
                      ? 'ring-2 ring-purple-500 shadow-purple-500/50'
                      : 'bg-slate-800/50 border-purple-800/50'
                  }`}
                  onDoubleClick={() => handleDoubleClick(template)}
                  onClick={() => handleSelectTemplate(template)}
                >
                  {/* Template Name - Small at top */}
                  <div className="px-3 pt-3 pb-2">
                    <h3 className="text-xs font-medium text-white line-clamp-2 leading-tight">
                      {template.name}
                    </h3>
                  </div>

                  {/* Live Landing Page Preview - Actual rendered template */}
                  <div className="relative h-72 bg-gradient-to-br from-purple-600 to-blue-600 overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 bg-white"
                      style={{
                        width: '1200px',  // Full desktop width
                        height: '800px',  // Full viewport height
                        transform: 'scale(0.44)',  // Scale down to fit ~527px card width (1200 * 0.44 ≈ 528px)
                        transformOrigin: 'top left',
                        pointerEvents: 'none',  // Prevent iframe interaction - clicks go to card
                      }}
                    >
                      <iframe
                        src={`/api/templates/${template.id}/preview-html`}
                        className="w-full h-full border-0 bg-white"
                        title={`${template.name} Preview`}
                        loading="lazy"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"  // Allow scripts for proper rendering
                        onLoad={() => {
                          setLoadedPreviews(prev => new Set(prev).add(template.id));
                        }}
                        onError={() => {
                          console.error(`Failed to load preview for template: ${template.id}`);
                        }}
                      />
                    </div>
                    
                    {/* Loading overlay - hidden once iframe loads */}
                    {!loadedPreviews.has(template.id) && (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center pointer-events-none z-10 transition-opacity duration-300">
                        <Sparkles className="w-8 h-8 text-white/50 animate-pulse" />
                      </div>
                    )}
                    
                    {/* Action Buttons - Top Right */}
                    <div className="absolute top-2 right-2 z-30 flex items-center gap-2 pointer-events-auto">
                      {/* Delete Button */}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeleteClick(e, template);
                        }}
                        title="Delete template"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      
                      {/* Selected Badge */}
                      {isSelected && (
                        <Badge className="bg-purple-600 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </div>
                    
                    {/* Double-click hint */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <Badge variant="outline" className="bg-black/70 text-white border-white/30 text-xs">
                        <Maximize2 className="w-3 h-3 mr-1" />
                        Double-click to preview
                      </Badge>
                    </div>
                  </div>

                  {/* Category badge at bottom */}
                  <div className="px-3 pb-3 pt-2">
                    {template.category && (
                      <Badge variant="secondary" className="bg-purple-900/50 text-purple-200 text-xs">
                        {template.category}
                      </Badge>
                    )}
                  </div>
                </Card>
              );
            })}
            
            {filteredTemplates.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-purple-200 text-lg">No templates found</p>
                <p className="text-purple-400 text-sm mt-2">
                  Try selecting a different category or template type
                </p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

