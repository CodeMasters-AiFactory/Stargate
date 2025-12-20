/**
 * Variant Picker Component
 * Visual picker for 35,000+ component variants
 * Phase 1A Week 3 - 130% Competitive Advantage
 */

import { useState, useEffect, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Filter,
  Star,
  Sparkles,
  Loader2,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';

type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ComponentColor = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
type ComponentState = 'default' | 'hover' | 'active' | 'disabled' | 'loading';

interface ComponentVariant {
  id: string;
  componentId: string;
  componentName: string;
  size: ComponentSize;
  color: ComponentColor;
  state: ComponentState;
  displayName: string;
  description: string;
  category: string;
  styles: Record<string, string>;
  html: string;
  tags: string[];
  usage: {
    whenToUse: string;
    bestFor: string[];
  };
}

interface VariantPickerProps {
  componentId?: string;
  onSelect?: (variant: ComponentVariant) => void;
  showRecommended?: boolean;
}

export function VariantPicker({ componentId, onSelect, showRecommended = true }: VariantPickerProps) {
  const [variants, setVariants] = useState<ComponentVariant[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<ComponentVariant[]>([]);
  const [recommended, setRecommended] = useState<ComponentVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState<ComponentSize | 'all'>('all');
  const [selectedColor, setSelectedColor] = useState<ComponentColor | 'all'>('all');
  const [selectedState, setSelectedState] = useState<ComponentState | 'all'>('default');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch variants
  useEffect(() => {
    fetchVariants();
  }, [componentId]);

  const fetchVariants = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let url = '/api/visual-editor/variants';
      if (componentId) {
        url = `/api/visual-editor/variants/component/${componentId}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setVariants(data.variants || []);
        setFilteredVariants(data.variants || []);

        // Fetch recommended variants if enabled
        if (showRecommended && !componentId) {
          fetchRecommended();
        }
      } else {
        setError(data.error || 'Failed to load variants');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load variants');
    } finally {
      setIsLoading(false);
    }
  }, [componentId, showRecommended]);

  const fetchRecommended = async () => {
    try {
      // Get user preferences from neural learning
      const userId = 'user-1'; // TODO: Get from auth
      const projectId = 'current-project'; // TODO: Get from context

      const prefsResponse = await fetch(`/api/visual-editor/preferences/${userId}/${projectId}`);
      const prefsData = await prefsResponse.json();

      const preferences = prefsData.success && prefsData.profile
        ? {
            preferredSize: 'md' as ComponentSize, // Extract from profile
            preferredColor: 'primary' as ComponentColor, // Extract from profile
          }
        : {};

      const response = await fetch('/api/visual-editor/variants/recommended', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      });

      const data = await response.json();
      if (data.success) {
        setRecommended(data.recommended || []);
      }
    } catch (err) {
      console.error('Failed to fetch recommended variants:', err);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...variants];

    // Text search
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.displayName.toLowerCase().includes(lower) ||
          v.description.toLowerCase().includes(lower) ||
          v.tags.some((tag) => tag.toLowerCase().includes(lower))
      );
    }

    // Size filter
    if (selectedSize !== 'all') {
      filtered = filtered.filter((v) => v.size === selectedSize);
    }

    // Color filter
    if (selectedColor !== 'all') {
      filtered = filtered.filter((v) => v.color === selectedColor);
    }

    // State filter
    if (selectedState !== 'all') {
      filtered = filtered.filter((v) => v.state === selectedState);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((v) => v.category === selectedCategory);
    }

    setFilteredVariants(filtered);
  }, [variants, searchQuery, selectedSize, selectedColor, selectedState, selectedCategory]);

  const handleSelectVariant = (variant: ComponentVariant) => {
    setSelectedVariant(variant.id);
    onSelect?.(variant);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSize('all');
    setSelectedColor('all');
    setSelectedState('default');
    setSelectedCategory('all');
  };

  const getSizeIcon = (size: ComponentSize) => {
    const sizes = { xs: '○', sm: '◯', md: '●', lg: '◉', xl: '⬤' };
    return sizes[size];
  };

  const getColorBadge = (color: ComponentColor) => {
    const colors: Record<ComponentColor, string> = {
      primary: 'bg-blue-500',
      secondary: 'bg-gray-500',
      accent: 'bg-purple-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
      neutral: 'bg-gray-300',
    };
    return colors[color];
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold">
              {componentId ? `Variants (${filteredVariants.length})` : `All Variants (${filteredVariants.length})`}
            </h3>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search variants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 space-y-2">
            {/* Size Filter */}
            <div>
              <p className="text-xs font-medium mb-1">Size</p>
              <div className="flex gap-1">
                {(['all', 'xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                    className="h-7 text-xs"
                  >
                    {size === 'all' ? 'All' : size.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div>
              <p className="text-xs font-medium mb-1">Color</p>
              <div className="flex gap-1 flex-wrap">
                <Button
                  variant={selectedColor === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedColor('all')}
                  className="h-7 text-xs"
                >
                  All
                </Button>
                {(['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'neutral'] as const).map(
                  (color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedColor(color)}
                      className="h-7 text-xs capitalize"
                    >
                      <span className={`w-3 h-3 rounded-full mr-1 ${getColorBadge(color)}`} />
                      {color}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* State Filter */}
            <div>
              <p className="text-xs font-medium mb-1">State</p>
              <div className="flex gap-1">
                {(['all', 'default', 'hover', 'active', 'disabled', 'loading'] as const).map((state) => (
                  <Button
                    key={state}
                    variant={selectedState === state ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedState(state)}
                    className="h-7 text-xs capitalize"
                  >
                    {state === 'all' ? 'All' : state}
                  </Button>
                ))}
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full h-7 text-xs">
              <X className="w-3 h-3 mr-1" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {error && (
            <Card className="p-4 border-destructive bg-destructive/10">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="text-xs text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading variants...</p>
            </div>
          ) : (
            <>
              {/* Recommended Section */}
              {showRecommended && recommended.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                      Recommended for You
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {recommended.slice(0, 4).map((variant) => (
                      <VariantCard
                        key={variant.id}
                        variant={variant}
                        isSelected={selectedVariant === variant.id}
                        onSelect={handleSelectVariant}
                        showBadge
                      />
                    ))}
                  </div>
                  <Separator />
                </>
              )}

              {/* All Variants */}
              {filteredVariants.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium">No variants found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting your filters or search query
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filteredVariants.map((variant) => (
                    <VariantCard
                      key={variant.id}
                      variant={variant}
                      isSelected={selectedVariant === variant.id}
                      onSelect={handleSelectVariant}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredVariants.length} variants</span>
          <span className="text-primary font-medium">35,000+ total</span>
        </div>
      </div>
    </div>
  );
}

// Variant Card Component
interface VariantCardProps {
  variant: ComponentVariant;
  isSelected: boolean;
  onSelect: (variant: ComponentVariant) => void;
  showBadge?: boolean;
}

function VariantCard({ variant, isSelected, onSelect, showBadge }: VariantCardProps) {
  const getColorBadge = (color: ComponentColor) => {
    const colors: Record<ComponentColor, string> = {
      primary: 'bg-blue-500',
      secondary: 'bg-gray-500',
      accent: 'bg-purple-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
      neutral: 'bg-gray-300',
    };
    return colors[color];
  };

  return (
    <Card
      className={`p-3 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
      }`}
      onClick={() => onSelect(variant)}
    >
      {/* Preview */}
      <div
        className="w-full h-16 rounded-md border flex items-center justify-center mb-2 overflow-hidden bg-white dark:bg-gray-900"
        dangerouslySetInnerHTML={{ __html: variant.html }}
      />

      {/* Info */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-1">
          <p className="text-xs font-medium line-clamp-1">{variant.componentName}</p>
          {isSelected && <Check className="w-3 h-3 text-primary flex-shrink-0" />}
          {showBadge && <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
        </div>

        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs h-5">
            {variant.size.toUpperCase()}
          </Badge>
          <div className={`w-3 h-3 rounded-full ${getColorBadge(variant.color)}`} title={variant.color} />
          {variant.state !== 'default' && (
            <Badge variant="secondary" className="text-xs h-5">
              {variant.state}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
