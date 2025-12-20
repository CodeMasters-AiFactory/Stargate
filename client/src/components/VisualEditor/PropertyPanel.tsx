/**
 * Property Panel
 * Right sidebar for editing selected element properties
 */

import { useState, useEffect, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Palette, Type, Box, Settings, Lock, Unlock, Eye, EyeOff, Monitor, Tablet, Smartphone, Sparkles } from 'lucide-react';
import type { GeneratedWebsitePackage } from '@/types/websiteBuilder';
import type { SelectedElement } from './VisualEditor';

export interface PropertyPanelProps {
  element: SelectedElement;
  website: GeneratedWebsitePackage;
  onUpdate: (updated: GeneratedWebsitePackage) => void;
}

export function PropertyPanel({ element, website, onUpdate }: PropertyPanelProps) {
  const [properties, setProperties] = useState({
    text: 'Sample text',
    fontSize: '16px',
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: '1.5',
    color: '#000000',
    backgroundColor: '#ffffff',
    gradient: '',
    padding: '16px',
    margin: '0px',
    width: '100%',
    height: 'auto',
    borderRadius: '0px',
    opacity: '1',
    display: 'block',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    gap: '0px',
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto',
    position: 'static',
    zIndex: '0',
    borderWidth: '0px',
    borderStyle: 'solid',
    borderColor: '#000000',
    borderTopLeftRadius: '0px',
    borderTopRightRadius: '0px',
    borderBottomLeftRadius: '0px',
    borderBottomRightRadius: '0px',
    boxShadow: 'none',
    textShadow: 'none',
    transform: 'none',
    transition: 'none',
    cursor: 'default',
    overflow: 'visible',
    textAlign: 'left',
    textDecoration: 'none',
    textTransform: 'none',
    letterSpacing: '0px',
    wordSpacing: '0px',
    whiteSpace: 'normal',
    objectFit: 'fill',
    filter: 'none',
    backdropFilter: 'none',
  });

  const [isLocked, setIsLocked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Apply CSS changes to website structure with responsive breakpoints
  const applyCSSChanges = useCallback((cssUpdates: Record<string, string>, breakpoint?: 'desktop' | 'tablet' | 'mobile') => {
    const activePageId = website.activePageId || 'home';
    const pageFileKey = `pages/${activePageId}.html`;
    const currentPageFile = website.files[pageFileKey] || website.files['index.html'] || website.files['home.html'];
    
    let currentHTML = '';
    if (currentPageFile && typeof currentPageFile === 'object' && 'content' in currentPageFile) {
      currentHTML = currentPageFile.content as string;
    } else if (typeof currentPageFile === 'string') {
      currentHTML = currentPageFile;
    }

    // Generate CSS for the component
    const componentId = element.id;
    const cssSelector = `[data-component-id="${componentId}"]`;
    let componentCSS = '';

    // Handle responsive breakpoints
    if (breakpoint && breakpoint !== 'desktop') {
      const mediaQuery = breakpoint === 'tablet' 
        ? '@media (max-width: 1024px)'
        : '@media (max-width: 768px)';
      
      componentCSS += `\n${mediaQuery} {\n  ${cssSelector} {\n`;
      Object.entries(cssUpdates).forEach(([key, value]) => {
        if (value) {
          const cssProperty = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          componentCSS += `    ${cssProperty}: ${value};\n`;
        }
      });
      componentCSS += '  }\n}\n';
    } else {
      componentCSS = `\n${cssSelector} {\n`;
      Object.entries(cssUpdates).forEach(([key, value]) => {
        if (value) {
          const cssProperty = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          componentCSS += `  ${cssProperty}: ${value};\n`;
        }
      });
      componentCSS += '}\n';
    }

    // Add CSS to shared assets
    const updatedSharedAssets = {
      css: (website.sharedAssets?.css || '') + componentCSS,
      js: website.sharedAssets?.js || '',
    };

    // Update website package
    const updatedWebsite: GeneratedWebsitePackage = {
      ...website,
      sharedAssets: updatedSharedAssets,
    };

    onUpdate(updatedWebsite);
  }, [element, website, onUpdate]);

  const handlePropertyChange = (key: string, value: string) => {
    setProperties(prev => {
      const updated = { ...prev, [key]: value };
      
      // Auto-apply CSS changes for style properties
      if (['color', 'backgroundColor', 'fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 
           'padding', 'margin', 'width', 'height', 'borderRadius', 'opacity', 'display',
           'flexDirection', 'justifyContent', 'alignItems', 'gap', 'gridTemplateColumns',
           'gridTemplateRows', 'position', 'zIndex'].includes(key)) {
        const cssUpdates: Record<string, string> = {};
        
        // Map property keys to CSS properties
        if (key === 'backgroundColor' && !updated.gradient) {
          cssUpdates.backgroundColor = value;
        } else if (key === 'gradient') {
          cssUpdates.background = value || updated.backgroundColor || '#ffffff';
        } else {
          cssUpdates[key] = value;
        }
        
        // Apply changes with debounce (in production, use proper debounce)
        setTimeout(() => applyCSSChanges(cssUpdates, currentBreakpoint), 300);
      }
      
      return updated;
    });
  };

  const handleApplyChanges = useCallback(() => {
    const cssUpdates: Record<string, string> = {
      color: properties.color,
      fontSize: properties.fontSize,
      fontFamily: properties.fontFamily,
      fontWeight: properties.fontWeight,
      lineHeight: properties.lineHeight,
      padding: properties.padding,
      margin: properties.margin,
      width: properties.width,
      height: properties.height,
      borderRadius: properties.borderRadius,
      opacity: properties.opacity,
      display: properties.display || 'block',
      flexDirection: properties.flexDirection,
      justifyContent: properties.justifyContent,
      alignItems: properties.alignItems,
      gap: properties.gap,
      gridTemplateColumns: properties.gridTemplateColumns,
      gridTemplateRows: properties.gridTemplateRows,
      position: properties.position || 'static',
      zIndex: properties.zIndex,
    };

    if (properties.gradient) {
      cssUpdates.background = properties.gradient;
    } else {
      cssUpdates.backgroundColor = properties.backgroundColor;
    }

    applyCSSChanges(cssUpdates, currentBreakpoint);
  }, [properties, applyCSSChanges, currentBreakpoint]);

  const handleReset = useCallback(() => {
    setProperties({
      text: 'Sample text',
      fontSize: '16px',
      fontFamily: 'Inter',
      fontWeight: '400',
      lineHeight: '1.5',
      color: '#000000',
      backgroundColor: '#ffffff',
      gradient: '',
      padding: '16px',
      margin: '0px',
      width: '100%',
      height: 'auto',
      borderRadius: '0px',
      opacity: '1',
    });
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Properties</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {element.type} • {element.id}
          </p>
        </div>
        
        {/* Responsive Breakpoint Selector */}
        <div className="flex items-center gap-1 bg-muted rounded-md p-1">
          <Button
            variant={currentBreakpoint === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentBreakpoint('desktop')}
            className="flex-1 h-7"
          >
            <Monitor className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={currentBreakpoint === 'tablet' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentBreakpoint('tablet')}
            className="flex-1 h-7"
          >
            <Tablet className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={currentBreakpoint === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentBreakpoint('mobile')}
            className="flex-1 h-7"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Properties */}
      <ScrollArea className="flex-1">
        <Tabs defaultValue="style" className="p-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="style">
              <Palette className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="typography">
              <Type className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="layout">
              <Box className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="effects">
              <Sparkles className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="color">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={properties.color}
                  onChange={(e) => handlePropertyChange('color', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={properties.color}
                  onChange={(e) => handlePropertyChange('color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={properties.backgroundColor}
                  onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={properties.backgroundColor}
                  onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradient">Gradient Background</Label>
              <div className="flex gap-2">
                <Input
                  id="gradient"
                  type="text"
                  placeholder="linear-gradient(135deg, #3b82f6, #10b981)"
                  value={properties.gradient || ''}
                  onChange={(e) => handlePropertyChange('gradient', e.target.value)}
                  className="flex-1 text-sm font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                CSS gradient syntax: linear-gradient(direction, color1, color2)
              </p>
            </div>

            <Separator />

            {/* Border */}
            <div className="space-y-3">
              <Label>Border</Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="borderWidth" className="text-xs">Width</Label>
                  <Input
                    id="borderWidth"
                    value={properties.borderWidth || '0px'}
                    onChange={(e) => handlePropertyChange('borderWidth', e.target.value)}
                    placeholder="0px"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="borderStyle" className="text-xs">Style</Label>
                  <Select
                    value={properties.borderStyle || 'solid'}
                    onValueChange={(value) => handlePropertyChange('borderStyle', value)}
                  >
                    <SelectTrigger id="borderStyle">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="borderColor" className="text-xs">Color</Label>
                  <Input
                    id="borderColor"
                    type="color"
                    value={properties.borderColor || '#000000'}
                    onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Border Radius */}
            <div className="space-y-2">
              <Label>Border Radius</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="borderTopLeftRadius" className="text-xs">Top Left</Label>
                  <Input
                    id="borderTopLeftRadius"
                    value={properties.borderTopLeftRadius || '0px'}
                    onChange={(e) => handlePropertyChange('borderTopLeftRadius', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="borderTopRightRadius" className="text-xs">Top Right</Label>
                  <Input
                    id="borderTopRightRadius"
                    value={properties.borderTopRightRadius || '0px'}
                    onChange={(e) => handlePropertyChange('borderTopRightRadius', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="borderBottomLeftRadius" className="text-xs">Bottom Left</Label>
                  <Input
                    id="borderBottomLeftRadius"
                    value={properties.borderBottomLeftRadius || '0px'}
                    onChange={(e) => handlePropertyChange('borderBottomLeftRadius', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="borderBottomRightRadius" className="text-xs">Bottom Right</Label>
                  <Input
                    id="borderBottomRightRadius"
                    value={properties.borderBottomRightRadius || '0px'}
                    onChange={(e) => handlePropertyChange('borderBottomRightRadius', e.target.value)}
                  />
                </div>
              </div>
              <Input
                value={properties.borderRadius || '0px'}
                onChange={(e) => {
                  const value = e.target.value;
                  handlePropertyChange('borderRadius', value);
                  handlePropertyChange('borderTopLeftRadius', value);
                  handlePropertyChange('borderTopRightRadius', value);
                  handlePropertyChange('borderBottomLeftRadius', value);
                  handlePropertyChange('borderBottomRightRadius', value);
                }}
                placeholder="All corners (e.g., 8px)"
                className="mt-2"
              />
            </div>

            <Separator />

            {/* Opacity */}
            <div className="space-y-2">
              <Label htmlFor="opacity">Opacity</Label>
              <div className="flex gap-2">
                <Input
                  id="opacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={parseFloat(properties.opacity as string) || 1}
                  onChange={(e) => handlePropertyChange('opacity', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={parseFloat(properties.opacity as string) || 1}
                  onChange={(e) => handlePropertyChange('opacity', e.target.value)}
                  className="w-20"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Text Content</Label>
              <Input
                id="text"
                value={properties.text}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <div className="flex gap-2">
                <Input
                  id="fontSize"
                  type="number"
                  value={parseInt(properties.fontSize) || 16}
                  onChange={(e) => handlePropertyChange('fontSize', `${e.target.value}px`)}
                  className="flex-1"
                />
                <Select
                  value={properties.fontSize}
                  onValueChange={(value) => handlePropertyChange('fontSize', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12px">12px</SelectItem>
                    <SelectItem value="14px">14px</SelectItem>
                    <SelectItem value="16px">16px</SelectItem>
                    <SelectItem value="18px">18px</SelectItem>
                    <SelectItem value="20px">20px</SelectItem>
                    <SelectItem value="24px">24px</SelectItem>
                    <SelectItem value="32px">32px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select
                value={properties.fontFamily || 'Inter'}
                onValueChange={(value) => handlePropertyChange('fontFamily', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                  <SelectItem value="Lato">Lato</SelectItem>
                  <SelectItem value="Montserrat">Montserrat</SelectItem>
                  <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                  <SelectItem value="Merriweather">Merriweather</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontWeight">Font Weight</Label>
              <Select
                value={properties.fontWeight || '400'}
                onValueChange={(value) => handlePropertyChange('fontWeight', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">Light (300)</SelectItem>
                  <SelectItem value="400">Regular (400)</SelectItem>
                  <SelectItem value="500">Medium (500)</SelectItem>
                  <SelectItem value="600">Semi-Bold (600)</SelectItem>
                  <SelectItem value="700">Bold (700)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lineHeight">Line Height</Label>
              <Input
                id="lineHeight"
                type="number"
                step="0.1"
                value={parseFloat(properties.lineHeight) || 1.5}
                onChange={(e) => handlePropertyChange('lineHeight', e.target.value)}
              />
            </div>

            <Separator />

            {/* Text Alignment */}
            <div className="space-y-2">
              <Label>Text Alignment</Label>
              <Select
                value={properties.textAlign || 'left'}
                onValueChange={(value) => handlePropertyChange('textAlign', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Text Decoration */}
            <div className="space-y-2">
              <Label>Text Decoration</Label>
              <Select
                value={properties.textDecoration || 'none'}
                onValueChange={(value) => handlePropertyChange('textDecoration', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="underline">Underline</SelectItem>
                  <SelectItem value="overline">Overline</SelectItem>
                  <SelectItem value="line-through">Line Through</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Text Transform */}
            <div className="space-y-2">
              <Label>Text Transform</Label>
              <Select
                value={properties.textTransform || 'none'}
                onValueChange={(value) => handlePropertyChange('textTransform', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="uppercase">Uppercase</SelectItem>
                  <SelectItem value="lowercase">Lowercase</SelectItem>
                  <SelectItem value="capitalize">Capitalize</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Letter Spacing */}
            <div className="space-y-2">
              <Label htmlFor="letterSpacing">Letter Spacing</Label>
              <Input
                id="letterSpacing"
                value={properties.letterSpacing || '0px'}
                onChange={(e) => handlePropertyChange('letterSpacing', e.target.value)}
                placeholder="e.g., 0.5px, 0.1em"
              />
            </div>
          </TabsContent>

          <TabsContent value="layout" className="mt-4 space-y-4">
            {/* Display Type */}
            <div className="space-y-2">
              <Label>Display</Label>
              <Select
                value={properties.display || 'block'}
                onValueChange={(value) => handlePropertyChange('display', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Block</SelectItem>
                  <SelectItem value="flex">Flex</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="inline">Inline</SelectItem>
                  <SelectItem value="inline-block">Inline Block</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Flexbox Controls */}
            {(properties.display === 'flex' || properties.display === 'grid') && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Flex Direction</Label>
                  <Select
                    value={properties.flexDirection || 'row'}
                    onValueChange={(value) => handlePropertyChange('flexDirection', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="row">Row</SelectItem>
                      <SelectItem value="column">Column</SelectItem>
                      <SelectItem value="row-reverse">Row Reverse</SelectItem>
                      <SelectItem value="column-reverse">Column Reverse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Justify Content</Label>
                  <Select
                    value={properties.justifyContent || 'flex-start'}
                    onValueChange={(value) => handlePropertyChange('justifyContent', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flex-start">Flex Start</SelectItem>
                      <SelectItem value="flex-end">Flex End</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="space-between">Space Between</SelectItem>
                      <SelectItem value="space-around">Space Around</SelectItem>
                      <SelectItem value="space-evenly">Space Evenly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Align Items</Label>
                  <Select
                    value={properties.alignItems || 'stretch'}
                    onValueChange={(value) => handlePropertyChange('alignItems', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stretch">Stretch</SelectItem>
                      <SelectItem value="flex-start">Flex Start</SelectItem>
                      <SelectItem value="flex-end">Flex End</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="baseline">Baseline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Gap</Label>
                  <Input
                    value={properties.gap || '0px'}
                    onChange={(e) => handlePropertyChange('gap', e.target.value)}
                    placeholder="e.g., 16px, 1rem"
                  />
                </div>
              </>
            )}

            {/* Grid Controls */}
            {properties.display === 'grid' && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Grid Template Columns</Label>
                  <Input
                    value={properties.gridTemplateColumns || '1fr'}
                    onChange={(e) => handlePropertyChange('gridTemplateColumns', e.target.value)}
                    placeholder="e.g., 1fr 1fr 1fr, repeat(3, 1fr)"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Grid Template Rows</Label>
                  <Input
                    value={properties.gridTemplateRows || 'auto'}
                    onChange={(e) => handlePropertyChange('gridTemplateRows', e.target.value)}
                    placeholder="e.g., auto 1fr auto"
                  />
                </div>
              </>
            )}

            <Separator />

            {/* Dimensions */}
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                value={properties.width}
                onChange={(e) => handlePropertyChange('width', e.target.value)}
                placeholder="e.g., 100%, 500px, auto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                value={properties.height}
                onChange={(e) => handlePropertyChange('height', e.target.value)}
                placeholder="e.g., auto, 100vh, 500px"
              />
            </div>

            <Separator />

            {/* Spacing */}
            <div className="space-y-2">
              <Label htmlFor="padding">Padding</Label>
              <Input
                id="padding"
                value={properties.padding}
                onChange={(e) => handlePropertyChange('padding', e.target.value)}
                placeholder="e.g., 16px, 1rem 2rem"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="margin">Margin</Label>
              <Input
                id="margin"
                value={properties.margin}
                onChange={(e) => handlePropertyChange('margin', e.target.value)}
                placeholder="e.g., 0 auto, 16px"
              />
            </div>

            {/* Position */}
            <Separator />
            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={properties.position || 'static'}
                onValueChange={(value) => handlePropertyChange('position', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">Static</SelectItem>
                  <SelectItem value="relative">Relative</SelectItem>
                  <SelectItem value="absolute">Absolute</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="sticky">Sticky</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Z-Index */}
            {(properties.position === 'absolute' || properties.position === 'fixed' || properties.position === 'sticky') && (
              <div className="space-y-2">
                <Label htmlFor="zIndex">Z-Index</Label>
                <Input
                  id="zIndex"
                  type="number"
                  value={parseInt(properties.zIndex as string) || 0}
                  onChange={(e) => handlePropertyChange('zIndex', e.target.value)}
                />
              </div>
            )}

            <Separator />

            {/* Overflow */}
            <div className="space-y-2">
              <Label>Overflow</Label>
              <Select
                value={properties.overflow || 'visible'}
                onValueChange={(value) => handlePropertyChange('overflow', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visible">Visible</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                  <SelectItem value="scroll">Scroll</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cursor */}
            <div className="space-y-2">
              <Label>Cursor</Label>
              <Select
                value={properties.cursor || 'default'}
                onValueChange={(value) => handlePropertyChange('cursor', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="pointer">Pointer</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="move">Move</SelectItem>
                  <SelectItem value="not-allowed">Not Allowed</SelectItem>
                  <SelectItem value="wait">Wait</SelectItem>
                  <SelectItem value="help">Help</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="effects" className="mt-4 space-y-4">
            {/* Box Shadow */}
            <div className="space-y-2">
              <Label htmlFor="boxShadow">Box Shadow</Label>
              <Input
                id="boxShadow"
                value={properties.boxShadow || 'none'}
                onChange={(e) => handlePropertyChange('boxShadow', e.target.value)}
                placeholder="e.g., 0 2px 4px rgba(0,0,0,0.1)"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePropertyChange('boxShadow', '0 2px 4px rgba(0,0,0,0.1)')}
                  className="flex-1 text-xs"
                >
                  Small
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePropertyChange('boxShadow', '0 4px 8px rgba(0,0,0,0.15)')}
                  className="flex-1 text-xs"
                >
                  Medium
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePropertyChange('boxShadow', '0 8px 16px rgba(0,0,0,0.2)')}
                  className="flex-1 text-xs"
                >
                  Large
                </Button>
              </div>
            </div>

            {/* Text Shadow */}
            <div className="space-y-2">
              <Label htmlFor="textShadow">Text Shadow</Label>
              <Input
                id="textShadow"
                value={properties.textShadow || 'none'}
                onChange={(e) => handlePropertyChange('textShadow', e.target.value)}
                placeholder="e.g., 1px 1px 2px rgba(0,0,0,0.5)"
              />
            </div>

            <Separator />

            {/* Transform */}
            <div className="space-y-2">
              <Label htmlFor="transform">Transform</Label>
              <Input
                id="transform"
                value={properties.transform || 'none'}
                onChange={(e) => handlePropertyChange('transform', e.target.value)}
                placeholder="e.g., rotate(45deg), scale(1.2), translateX(10px)"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePropertyChange('transform', 'scale(1.1)')}
                  className="flex-1 text-xs"
                >
                  Scale Up
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePropertyChange('transform', 'rotate(5deg)')}
                  className="flex-1 text-xs"
                >
                  Rotate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePropertyChange('transform', 'none')}
                  className="flex-1 text-xs"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Transition */}
            <div className="space-y-2">
              <Label htmlFor="transition">Transition</Label>
              <Input
                id="transition"
                value={properties.transition || 'none'}
                onChange={(e) => handlePropertyChange('transition', e.target.value)}
                placeholder="e.g., all 0.3s ease"
              />
            </div>

            <Separator />

            {/* Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter">Filter</Label>
              <Input
                id="filter"
                value={properties.filter || 'none'}
                onChange={(e) => handlePropertyChange('filter', e.target.value)}
                placeholder="e.g., blur(5px), brightness(1.2), contrast(1.1)"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePropertyChange('filter', 'blur(5px)')}
                  className="flex-1 text-xs"
                >
                  Blur
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePropertyChange('filter', 'brightness(1.2)')}
                  className="flex-1 text-xs"
                >
                  Bright
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePropertyChange('filter', 'grayscale(100%)')}
                  className="flex-1 text-xs"
                >
                  Grayscale
                </Button>
              </div>
            </div>

            {/* Backdrop Filter */}
            <div className="space-y-2">
              <Label htmlFor="backdropFilter">Backdrop Filter</Label>
              <Input
                id="backdropFilter"
                value={properties.backdropFilter || 'none'}
                onChange={(e) => handlePropertyChange('backdropFilter', e.target.value)}
                placeholder="e.g., blur(10px), saturate(180%)"
              />
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t space-y-2">
        <div className="flex gap-2">
          <Button
            variant={isLocked ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsLocked(!isLocked)}
            className="flex-1"
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            {isLocked ? 'Locked' : 'Unlocked'}
          </Button>
          <Button
            variant={!isVisible ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="flex-1"
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {isVisible ? 'Visible' : 'Hidden'}
          </Button>
        </div>
        <Button className="w-full" size="sm" onClick={handleApplyChanges} disabled={isLocked}>
          Apply Changes
        </Button>
        <Button variant="outline" className="w-full" size="sm" onClick={handleReset}>
          Reset to Default
        </Button>
      </div>
    </div>
  );
}

