/**
 * Template Gallery Component
 * Enhanced template library with preview screenshots and one-click application
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Search,
  Eye,
  Check,
  Filter,
  Grid,
  List,
  Sparkles,
  Zap,
  Heart,
  Star,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Template } from './TemplateLibrary';

export interface BlueprintTemplate {
  id: string;
  name: string;
  description: string;
  industry: string[];
  tone: string;
  bestFor: string[];
  previewImage?: string;
  thumbnail?: string;
  structure: Array<{
    order: number;
    type: string;
    name: string;
  }>;
  isBlueprint?: boolean; // True for premium blueprints, false for generated templates
  category?: string;
}

interface TemplateGalleryProps {
  onSelectTemplate: (template: BlueprintTemplate) => void;
  selectedTemplateId?: string;
}

// Blueprints are loaded from API

export function TemplateGallery({ onSelectTemplate, selectedTemplateId }: TemplateGalleryProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewTemplate, setPreviewTemplate] = useState<BlueprintTemplate | null>(null);
  const [blueprints, setBlueprints] = useState<BlueprintTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [categories, setCategories] = useState<{ industries: string[]; tones: string[] }>({
    industries: [],
    tones: [],
  });

  // Load templates from API (includes 10,000+ generated templates + blueprints)
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        
        // Load ALL templates (10,000+ generated + blueprints)
        // Using pagination: page 1, 100 templates per page (can load up to 10,000)
        const response = await fetch('/api/templates?page=1&pageSize=100&generated=true&limit=10000');
        const data = await response.json();
        
        if (data.success && data.templates) {
          // Combine blueprints (premium) with generated templates
          const formattedTemplates: BlueprintTemplate[] = data.templates.map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description || '',
            industry: Array.isArray(t.industry) ? t.industry : [t.industry || t.category || ''],
            tone: t.tone || '',
            bestFor: Array.isArray(t.industry) ? t.industry : [t.category || ''],
            previewImage: t.previewImage || t.thumbnail,
            thumbnail: t.thumbnail || t.previewImage,
            structure: t.structure || [],
            isBlueprint: t.isBlueprint || false, // Mark if it's a premium blueprint
            category: t.category || '',
          }));
          setBlueprints(formattedTemplates);
          
          // Extract unique industries from templates
          const allIndustries = new Set<string>();
          formattedTemplates.forEach(t => {
            if (Array.isArray(t.industry)) {
              t.industry.forEach(ind => allIndustries.add(ind));
            } else if (t.industry) {
              allIndustries.add(t.industry);
            }
            if (t.category) {
              allIndustries.add(t.category);
            }
          });
          
          setCategories({
            industries: Array.from(allIndustries).sort(),
            tones: [], // Generated templates don't have tones
          });
        }
        
        // Also load blueprint categories for filtering
        try {
          const categoriesResponse = await fetch('/api/blueprints/categories');
          const categoriesData = await categoriesResponse.json();
          if (categoriesData.success && categoriesData.industries) {
            setCategories(prev => ({
              industries: [...new Set([...prev.industries, ...categoriesData.industries])].sort(),
              tones: categoriesData.tones || prev.tones,
            }));
          }
        } catch (e) {
          // Ignore blueprint categories error if templates loaded successfully
          console.warn('Could not load blueprint categories:', e);
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
        toast({
          title: 'Error',
          description: 'Failed to load templates. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [toast]);

  // Get unique industries
  const industries = useMemo(() => {
    return categories.industries || [];
  }, [categories]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('template-favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('template-favorites', JSON.stringify(Array.from(newFavorites)));
  };

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return blueprints.filter(template => {
      const matchesSearch = 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tone.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesIndustry = 
        industryFilter === 'all' || 
        template.industry.some(ind => ind.toLowerCase().includes(industryFilter.toLowerCase()));
      
      const matchesFavorites = !showFavoritesOnly || favorites.has(template.id);
      
      return matchesSearch && matchesIndustry && matchesFavorites;
    });
  }, [blueprints, searchQuery, industryFilter, showFavoritesOnly, favorites]);

  const handleSelectTemplate = (template: BlueprintTemplate) => {
    onSelectTemplate(template);
    toast({
      title: 'Template Selected',
      description: `${template.name} has been selected. This will be used as the base structure for your website.`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Template Gallery</h2>
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading templates...' : `Choose from ${blueprints.length.toLocaleString()} professional templates`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map(industry => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Template Grid/List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          </div>
        ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'
          : 'space-y-4 p-4'
        }>
          {filteredTemplates.map(template => (
            <Card
              key={template.id}
              className={`cursor-pointer hover:shadow-lg transition-all ${
                selectedTemplateId === template.id
                  ? 'ring-2 ring-primary'
                  : ''
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              {/* Preview Image Placeholder */}
              <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                {template.previewImage ? (
                  <img
                    src={template.previewImage}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Sparkles className="w-12 h-12 mx-auto mb-2 text-purple-500" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {template.name}
                    </p>
                  </div>
                )}
                {selectedTemplateId === template.id && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary">
                      <Check className="w-3 h-3 mr-1" />
                      Selected
                    </Badge>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 left-2 bg-background/80 hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewTemplate(template);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`absolute top-2 right-2 bg-background/80 hover:bg-background ${favorites.has(template.id) ? 'text-red-500' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(template.id);
                  }}
                >
                  <Heart className={`w-4 h-4 ${favorites.has(template.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm">{template.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      {template.isBlueprint ? 'Premium Blueprint' : 'AI Generated'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.industry.slice(0, 3).map(industry => (
                      <Badge key={industry} variant="secondary" className="text-xs">
                        {industry}
                      </Badge>
                    ))}
                    {template.industry.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.industry.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No templates found matching your criteria</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setIndustryFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
        )}
      </ScrollArea>

      {/* Preview Dialog */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewTemplate.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {previewTemplate.description}
              </p>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Best For:</h4>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.bestFor.map(item => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Tone:</h4>
                <p className="text-sm">{previewTemplate.tone}</p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    handleSelectTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Use This Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

