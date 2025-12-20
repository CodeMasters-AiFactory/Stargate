/**
 * Component Palette
 * Sidebar displaying draggable components that can be added to the canvas
 */

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Grid, Sparkles } from 'lucide-react';
import { DraggableComponentItem } from './DraggableComponentItem';
import { COMPONENT_LIBRARY, type ComponentDefinition } from './componentsLibrary';
import { VariantPicker } from './VariantPicker';

// Component library is now imported from componentsLibrary.ts (100 components)

const CATEGORIES = ['all', 'layout', 'content', 'media', 'forms', 'ecommerce', 'social', 'navigation'] as const;

export function ComponentPalette() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>('all');
  const [activeTab, setActiveTab] = useState<'components' | 'variants'>('components');

  const filteredComponents = COMPONENT_LIBRARY.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedComponents = filteredComponents.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {} as Record<string, ComponentDefinition[]>);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold mb-3">Components</h3>

        {/* Tabs for Components vs Variants */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'components' | 'variants')} className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-3">
            <TabsTrigger value="components" className="text-xs">
              <Grid className="w-3 h-3 mr-1" />
              Base ({COMPONENT_LIBRARY.length})
            </TabsTrigger>
            <TabsTrigger value="variants" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Variants (35K+)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="m-0">
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </TabsContent>

          <TabsContent value="variants" className="m-0">
            {/* VariantPicker has its own search */}
          </TabsContent>
        </Tabs>
      </div>

      {/* Content */}
      {activeTab === 'components' ? (
        <>
          {/* Category Filter */}
          <div className="px-4 py-2 border-b">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Component List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {Object.entries(groupedComponents).map(([category, components]) => (
                <div key={category} className="mb-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-2">
                    {category}
                  </h4>
                  <div className="space-y-1">
                    {components.map(component => (
                      <DraggableComponentItem
                        key={component.id}
                        component={component}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {filteredComponents.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No components found
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      ) : (
        <VariantPicker
          onSelect={(variant) => {
            console.log('Selected variant:', variant);
            // TODO: Add variant to canvas
          }}
          showRecommended
        />
      )}
    </div>
  );
}

