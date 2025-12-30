/**
 * Client Template Gallery Component
 * Shows templates in a card grid layout similar to services dashboard
 * Categories at top, double-click to open full screen browser
 */

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
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
  Crown,
  ShoppingCart,
  Loader2,
  ArrowRight
} from 'lucide-react';
import type { BrandTemplate } from '@/types/templates';
import { useAuth } from '@/contexts/AuthContext';

interface ClientTemplateGalleryProps {
  onSelectTemplate?: (template: BrandTemplate) => void;
  onProceed?: (template: BrandTemplate) => void;
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
  onProceed,
  selectedTemplateId,
  pricingFilter = 'all'
}: ClientTemplateGalleryProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templates, setTemplates] = useState<BrandTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedPreviews, setLoadedPreviews] = useState<Set<string>>(new Set());
  const [failedPreviews, setFailedPreviews] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<BrandTemplate | null>(null);
  const [purchasedTemplates, setPurchasedTemplates] = useState<Set<string>>(new Set());
  const [purchasingTemplate, setPurchasingTemplate] = useState<string | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [templateToPurchase, setTemplateToPurchase] = useState<BrandTemplate | null>(null);

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

  // Load user's purchased templates
  useEffect(() => {
    const loadPurchasedTemplates = async () => {
      if (!isAuthenticated) {
        setPurchasedTemplates(new Set());
        return;
      }

      try {
        const response = await fetch('/api/payments/my-templates');
        const data = await response.json();

        if (data.success && data.purchases) {
          const purchasedIds = new Set<string>(data.purchases.map((p: any) => p.templateId as string));
          setPurchasedTemplates(purchasedIds);
        }
      } catch (error) {
        console.error('Failed to load purchased templates:', error);
      }
    };

    loadPurchasedTemplates();
  }, [isAuthenticated]);

  // Handle purchasing a premium template
  const handlePurchaseTemplate = async (template: BrandTemplate) => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to purchase premium templates',
        variant: 'destructive',
      });
      setLocation('/login?redirect=/merlin8/templates?type=premium');
      return;
    }

    setPurchasingTemplate(template.id);

    try {
      const response = await fetch('/api/payments/purchase-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template.id }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else if (data.alreadyOwned) {
        toast({
          title: 'Already Owned',
          description: 'You already own this template!',
        });
        setPurchasedTemplates(prev => new Set(prev).add(template.id));
      } else {
        toast({
          title: 'Purchase Failed',
          description: data.error || 'Unable to process purchase',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate purchase',
        variant: 'destructive',
      });
    } finally {
      setPurchasingTemplate(null);
    }
  };

  // Handle template selection (check if premium and not owned)
  const handleTemplateClick = (template: BrandTemplate) => {
    const isPremium = (template as any).isPremium === true;
    const isOwned = purchasedTemplates.has(template.id);

    if (isPremium && !isOwned) {
      // Show purchase dialog
      setTemplateToPurchase(template);
      setPurchaseDialogOpen(true);
    } else {
      // Free or already owned - proceed with selection
      handleSelectTemplate(template);
    }
  };

  // Helper function to check if a template matches a category
  // This ensures consistent matching logic across filtering and counting
  const matchesCategory = (templateCategory: string, categoryId: string): boolean => {
    if (categoryId === 'all') return true;

    const normalizedTemplate = templateCategory.toLowerCase().trim();
    const normalizedCategory = categoryId.toLowerCase().trim();

    // Exact match
    if (normalizedTemplate === normalizedCategory) return true;

    // Handle hyphenated categories (e.g., 'web-design' matches 'web design')
    const categoryWithSpaces = normalizedCategory.replace(/-/g, ' ');
    if (normalizedTemplate === categoryWithSpaces) return true;

    // Handle reverse (e.g., 'web design' matches 'web-design')
    const templateWithHyphens = normalizedTemplate.replace(/\s+/g, '-');
    if (templateWithHyphens === normalizedCategory) return true;

    // Exact word match - template category contains the category as a complete word
    // This prevents 'web' from matching 'web-design' incorrectly
    const words = normalizedTemplate.split(/[\s-]+/);
    const categoryWords = normalizedCategory.split(/[\s-]+/);

    // Check if all category words are present in template words
    return categoryWords.every(catWord =>
      words.some(word => word === catWord)
    );
  };

  // Filter templates by category and pricing
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // Pricing filter - check isPremium field
      const isPremium = (template as any).isPremium === true;
      const matchesPricing =
        pricingFilter === 'all' ||
        (pricingFilter === 'free' && !isPremium) ||
        (pricingFilter === 'paid' && isPremium);

      if (!matchesPricing) return false;

      // Category filter using the helper function
      const templateCategory = template.category || template.industry || '';
      return matchesCategory(templateCategory, selectedCategory);
    });
  }, [templates, selectedCategory, pricingFilter]);

  // Get category counts using the same matching logic
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TEMPLATE_CATEGORIES.forEach(cat => {
      if (cat.id === 'all') {
        counts.all = templates.length;
      } else {
        counts[cat.id] = templates.filter(t => {
          const templateCategory = t.category || t.industry || '';
          return matchesCategory(templateCategory, cat.id);
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
              const isPremium = (template as any).isPremium === true;
              const isOwned = purchasedTemplates.has(template.id);

              return (
                <Card
                  key={template.id}
                  className={`group cursor-pointer transition-all hover:shadow-2xl hover:scale-105 ${
                    isSelected
                      ? 'ring-2 ring-purple-500 shadow-purple-500/50'
                      : isPremium && !isOwned
                      ? 'bg-gradient-to-br from-amber-900/30 to-slate-800/50 border-amber-500/50'
                      : 'bg-slate-800/50 border-purple-800/50'
                  }`}
                  onDoubleClick={() => handleDoubleClick(template)}
                  onClick={() => handleTemplateClick(template)}
                >
                  {/* Template Name and Price - Small at top */}
                  <div className="px-3 pt-3 pb-2 flex items-start justify-between gap-2">
                    <h3 className="text-xs font-medium text-white line-clamp-2 leading-tight flex-1">
                      {template.name}
                    </h3>
                    {isPremium && (
                      <Badge
                        className={`shrink-0 text-xs ${
                          isOwned
                            ? 'bg-green-600 text-white'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        }`}
                      >
                        {isOwned ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Owned
                          </>
                        ) : (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            ${(template as any).price || '0'}
                          </>
                        )}
                      </Badge>
                    )}
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
                          // Clear from failed state if it was previously failed
                          setFailedPreviews(prev => {
                            const next = new Set(prev);
                            next.delete(template.id);
                            return next;
                          });
                        }}
                        onError={() => {
                          console.error(`Failed to load preview for template: ${template.id}`);
                          // Track failed preview and also mark as "loaded" to hide spinner
                          setFailedPreviews(prev => new Set(prev).add(template.id));
                          setLoadedPreviews(prev => new Set(prev).add(template.id));
                        }}
                      />
                    </div>
                    
                    {/* Loading overlay - hidden once iframe loads */}
                    {!loadedPreviews.has(template.id) && (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center pointer-events-none z-10 transition-opacity duration-300">
                        <Sparkles className="w-8 h-8 text-white/50 animate-pulse" />
                      </div>
                    )}

                    {/* Failed preview overlay - shows when preview fails to load */}
                    {failedPreviews.has(template.id) && (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center pointer-events-none z-10">
                        <Globe className="w-10 h-10 text-slate-400 mb-2" />
                        <p className="text-slate-400 text-sm">Preview unavailable</p>
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

                  {/* Proceed Button - Shows when template is selected */}
                  {isSelected && onProceed && (
                    <div className="px-3 pb-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onProceed(template);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        size="lg"
                      >
                        Proceed with Template
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
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

      {/* Purchase Confirmation Dialog */}
      <AlertDialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-amber-500/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <Crown className="w-5 h-5 text-amber-400" />
              Premium Template
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-slate-800 rounded-lg border border-amber-500/30">
                  <h4 className="font-semibold text-white mb-1">{templateToPurchase?.name}</h4>
                  <p className="text-sm text-slate-400">{templateToPurchase?.brand} - {templateToPurchase?.category}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-amber-950/30 rounded-lg border border-amber-500/30">
                  <span className="text-slate-300">One-time purchase</span>
                  <span className="text-2xl font-bold text-amber-400">
                    ${(templateToPurchase as any)?.price || '0'}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  After purchase, you'll own this template forever and can use it for unlimited projects.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setPurchaseDialogOpen(false);
                if (templateToPurchase) {
                  handlePurchaseTemplate(templateToPurchase);
                }
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              disabled={purchasingTemplate !== null}
            >
              {purchasingTemplate ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Purchase for ${(templateToPurchase as any)?.price || '0'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

