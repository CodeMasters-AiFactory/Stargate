/**
 * Brand Template Selector
 * 
 * User selects from real brand templates:
 * - Tesla Template, Apple Template, BMW Template, etc.
 * - Left/Right arrows to browse
 * - Mix & Match: Layout from one, colors from another
 * - Custom colors: Pick your own scheme
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Palette,
  LayoutGrid,
  Monitor,
  Tablet,
  Smartphone,
  Shuffle,
  Sparkles,
  X,
} from 'lucide-react';

// Template data - matches server/services/brandTemplateLibrary.ts
type TemplateCategory = 'corporate' | 'automotive' | 'tech' | 'startup' | 'sports' | 'luxury' | 'food';

interface BrandTemplate {
  id: string;
  name: string;
  brand: string;
  category: TemplateCategory;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: string;
  };
  layout: {
    heroStyle: string;
    maxWidth: string;
    borderRadius: string;
  };
  darkMode: boolean;
  tags: string[];
}

// Templates matching the server library
const TEMPLATES: BrandTemplate[] = [
  // AUTOMOTIVE
  {
    id: 'tesla',
    name: 'Tesla Template',
    brand: 'Tesla',
    category: 'automotive',
    colors: { primary: '#E82127', secondary: '#393C41', accent: '#FFFFFF', background: '#000000', surface: '#171A20', text: '#FFFFFF', textMuted: '#8E8E8E' },
    typography: { headingFont: 'Gotham', bodyFont: 'Gotham', headingWeight: '500' },
    layout: { heroStyle: 'fullscreen', maxWidth: '100%', borderRadius: '0' },
    darkMode: true,
    tags: ['minimal', 'fullscreen', 'electric', 'modern'],
  },
  {
    id: 'bmw',
    name: 'BMW Template',
    brand: 'BMW',
    category: 'automotive',
    colors: { primary: '#1C69D4', secondary: '#262626', accent: '#FFFFFF', background: '#FFFFFF', surface: '#F5F5F5', text: '#262626', textMuted: '#666666' },
    typography: { headingFont: 'BMW Type Global', bodyFont: 'BMW Type Global', headingWeight: '700' },
    layout: { heroStyle: 'split-right', maxWidth: '1440px', borderRadius: '0' },
    darkMode: false,
    tags: ['premium', 'split', 'automotive', 'german'],
  },
  {
    id: 'mercedes',
    name: 'Mercedes Template',
    brand: 'Mercedes-Benz',
    category: 'automotive',
    colors: { primary: '#00ADEF', secondary: '#000000', accent: '#9F8E7D', background: '#000000', surface: '#1A1A1A', text: '#FFFFFF', textMuted: '#999999' },
    typography: { headingFont: 'MB Corpo S', bodyFont: 'MB Corpo A', headingWeight: '400' },
    layout: { heroStyle: 'fullscreen', maxWidth: '100%', borderRadius: '0' },
    darkMode: true,
    tags: ['luxury', 'elegant', 'premium', 'fullscreen'],
  },
  {
    id: 'porsche',
    name: 'Porsche Template',
    brand: 'Porsche',
    category: 'automotive',
    colors: { primary: '#D5001C', secondary: '#000000', accent: '#B12B29', background: '#FFFFFF', surface: '#F5F5F5', text: '#000000', textMuted: '#666666' },
    typography: { headingFont: 'Porsche Next', bodyFont: 'Porsche Next', headingWeight: '700' },
    layout: { heroStyle: 'centered', maxWidth: '1400px', borderRadius: '0' },
    darkMode: false,
    tags: ['sports', 'premium', 'red', 'performance'],
  },
  // CORPORATE
  {
    id: 'apple',
    name: 'Apple Template',
    brand: 'Apple',
    category: 'corporate',
    colors: { primary: '#0071E3', secondary: '#1D1D1F', accent: '#F5F5F7', background: '#FFFFFF', surface: '#F5F5F7', text: '#1D1D1F', textMuted: '#6E6E73' },
    typography: { headingFont: 'SF Pro Display', bodyFont: 'SF Pro Text', headingWeight: '600' },
    layout: { heroStyle: 'centered', maxWidth: '980px', borderRadius: '18px' },
    darkMode: false,
    tags: ['minimal', 'clean', 'premium', 'centered'],
  },
  {
    id: 'microsoft',
    name: 'Microsoft Template',
    brand: 'Microsoft',
    category: 'corporate',
    colors: { primary: '#0078D4', secondary: '#106EBE', accent: '#FFB900', background: '#FFFFFF', surface: '#F3F2F1', text: '#323130', textMuted: '#605E5C' },
    typography: { headingFont: 'Segoe UI', bodyFont: 'Segoe UI', headingWeight: '600' },
    layout: { heroStyle: 'split-right', maxWidth: '1600px', borderRadius: '8px' },
    darkMode: false,
    tags: ['corporate', 'clean', 'professional', 'enterprise'],
  },
  {
    id: 'spacex',
    name: 'SpaceX Template',
    brand: 'SpaceX',
    category: 'corporate',
    colors: { primary: '#000000', secondary: '#1A1A1A', accent: '#FFFFFF', background: '#000000', surface: '#0F0F0F', text: '#FFFFFF', textMuted: '#8E8E8E' },
    typography: { headingFont: 'SpaceX Sans', bodyFont: 'SpaceX Sans', headingWeight: '400' },
    layout: { heroStyle: 'fullscreen', maxWidth: '100%', borderRadius: '0' },
    darkMode: true,
    tags: ['minimal', 'fullscreen', 'space', 'futuristic', 'corporate'],
  },
  {
    id: 'google',
    name: 'Google Template',
    brand: 'Google',
    category: 'corporate',
    colors: { primary: '#4285F4', secondary: '#34A853', accent: '#FBBC05', background: '#FFFFFF', surface: '#F8F9FA', text: '#202124', textMuted: '#5F6368' },
    typography: { headingFont: 'Google Sans', bodyFont: 'Roboto', headingWeight: '400' },
    layout: { heroStyle: 'centered', maxWidth: '1200px', borderRadius: '8px' },
    darkMode: false,
    tags: ['clean', 'modern', 'corporate', 'tech'],
  },
  {
    id: 'amazon',
    name: 'Amazon Template',
    brand: 'Amazon',
    category: 'corporate',
    colors: { primary: '#FF9900', secondary: '#232F3E', accent: '#146EB4', background: '#FFFFFF', surface: '#F8F9FA', text: '#232F3E', textMuted: '#6B7280' },
    typography: { headingFont: 'Amazon Ember', bodyFont: 'Amazon Ember', headingWeight: '700' },
    layout: { heroStyle: 'split-right', maxWidth: '1400px', borderRadius: '0' },
    darkMode: false,
    tags: ['corporate', 'ecommerce', 'enterprise', 'orange'],
  },
  {
    id: 'meta',
    name: 'Meta Template',
    brand: 'Meta',
    category: 'corporate',
    colors: { primary: '#0084FF', secondary: '#1877F2', accent: '#42B883', background: '#FFFFFF', surface: '#F0F2F5', text: '#050505', textMuted: '#65676B' },
    typography: { headingFont: 'SF Pro Display', bodyFont: 'SF Pro Text', headingWeight: '600' },
    layout: { heroStyle: 'split-left', maxWidth: '1400px', borderRadius: '12px' },
    darkMode: false,
    tags: ['corporate', 'social', 'tech', 'blue'],
  },
  // TECH
  {
    id: 'nvidia',
    name: 'NVIDIA Template',
    brand: 'NVIDIA',
    category: 'tech',
    colors: { primary: '#76B900', secondary: '#1A1A1A', accent: '#00FF00', background: '#000000', surface: '#1A1A1A', text: '#FFFFFF', textMuted: '#999999' },
    typography: { headingFont: 'NVIDIA Sans', bodyFont: 'NVIDIA Sans', headingWeight: '700' },
    layout: { heroStyle: 'split-left', maxWidth: '1400px', borderRadius: '0' },
    darkMode: true,
    tags: ['gaming', 'tech', 'bold', 'green'],
  },
  // STARTUPS
  {
    id: 'stripe',
    name: 'Stripe Template',
    brand: 'Stripe',
    category: 'startup',
    colors: { primary: '#635BFF', secondary: '#0A2540', accent: '#00D4FF', background: '#0A2540', surface: '#1A3A5C', text: '#FFFFFF', textMuted: '#ADBDCC' },
    typography: { headingFont: 'Sohne', bodyFont: 'Sohne', headingWeight: '600' },
    layout: { heroStyle: 'split-right', maxWidth: '1280px', borderRadius: '12px' },
    darkMode: true,
    tags: ['developer', 'gradient', 'saas', 'fintech'],
  },
  {
    id: 'linear',
    name: 'Linear Template',
    brand: 'Linear',
    category: 'startup',
    colors: { primary: '#5E6AD2', secondary: '#2E3138', accent: '#8B5CF6', background: '#000000', surface: '#1A1A1A', text: '#EEEEEE', textMuted: '#7D7D7D' },
    typography: { headingFont: 'Inter', bodyFont: 'Inter', headingWeight: '500' },
    layout: { heroStyle: 'centered', maxWidth: '1100px', borderRadius: '8px' },
    darkMode: true,
    tags: ['minimal', 'dark', 'saas', 'product'],
  },
  {
    id: 'vercel',
    name: 'Vercel Template',
    brand: 'Vercel',
    category: 'startup',
    colors: { primary: '#000000', secondary: '#666666', accent: '#0070F3', background: '#000000', surface: '#111111', text: '#FFFFFF', textMuted: '#888888' },
    typography: { headingFont: 'Geist', bodyFont: 'Geist', headingWeight: '700' },
    layout: { heroStyle: 'centered', maxWidth: '1100px', borderRadius: '8px' },
    darkMode: true,
    tags: ['developer', 'minimal', 'dark', 'modern'],
  },
  {
    id: 'notion',
    name: 'Notion Template',
    brand: 'Notion',
    category: 'startup',
    colors: { primary: '#000000', secondary: '#37352F', accent: '#EB5757', background: '#FFFFFF', surface: '#F7F6F3', text: '#37352F', textMuted: '#9B9A97' },
    typography: { headingFont: 'Inter', bodyFont: 'Inter', headingWeight: '700' },
    layout: { heroStyle: 'centered', maxWidth: '1080px', borderRadius: '8px' },
    darkMode: false,
    tags: ['clean', 'productivity', 'saas', 'minimal'],
  },
  // SPORTS
  {
    id: 'redbull',
    name: 'Red Bull Template',
    brand: 'Red Bull',
    category: 'sports',
    colors: { primary: '#DB0A40', secondary: '#1E3264', accent: '#FFCC00', background: '#1E3264', surface: '#283D6B', text: '#FFFFFF', textMuted: '#A0ACBE' },
    typography: { headingFont: 'Bull', bodyFont: 'Red Bull', headingWeight: '700' },
    layout: { heroStyle: 'fullscreen', maxWidth: '100%', borderRadius: '0' },
    darkMode: true,
    tags: ['energy', 'sports', 'bold', 'extreme'],
  },
  {
    id: 'nike',
    name: 'Nike Template',
    brand: 'Nike',
    category: 'sports',
    colors: { primary: '#FF6B00', secondary: '#111111', accent: '#FFFFFF', background: '#FFFFFF', surface: '#F5F5F5', text: '#111111', textMuted: '#757575' },
    typography: { headingFont: 'Nike Futura', bodyFont: 'Helvetica Neue', headingWeight: '700' },
    layout: { heroStyle: 'fullscreen', maxWidth: '100%', borderRadius: '0' },
    darkMode: false,
    tags: ['sports', 'bold', 'athletic', 'iconic'],
  },
  {
    id: 'adidas',
    name: 'Adidas Template',
    brand: 'Adidas',
    category: 'sports',
    colors: { primary: '#000000', secondary: '#1F1F1F', accent: '#FFFFFF', background: '#000000', surface: '#1F1F1F', text: '#FFFFFF', textMuted: '#999999' },
    typography: { headingFont: 'Adidas', bodyFont: 'Helvetica', headingWeight: '700' },
    layout: { heroStyle: 'split-left', maxWidth: '100%', borderRadius: '0' },
    darkMode: true,
    tags: ['sports', 'minimal', 'bold', 'streetwear'],
  },
  // LUXURY
  {
    id: 'gucci',
    name: 'Gucci Template',
    brand: 'Gucci',
    category: 'luxury',
    colors: { primary: '#000000', secondary: '#1B1B1B', accent: '#C9A227', background: '#000000', surface: '#1B1B1B', text: '#FFFFFF', textMuted: '#888888' },
    typography: { headingFont: 'Gucci Sans Pro', bodyFont: 'Gucci Sans Pro', headingWeight: '400' },
    layout: { heroStyle: 'fullscreen', maxWidth: '100%', borderRadius: '0' },
    darkMode: true,
    tags: ['luxury', 'fashion', 'elegant', 'premium'],
  },
  {
    id: 'rolex',
    name: 'Rolex Template',
    brand: 'Rolex',
    category: 'luxury',
    colors: { primary: '#006039', secondary: '#127749', accent: '#A37E2C', background: '#FFFFFF', surface: '#F5F5F0', text: '#452C1E', textMuted: '#7A7A7A' },
    typography: { headingFont: 'Rolex', bodyFont: 'Helvetica Neue', headingWeight: '400' },
    layout: { heroStyle: 'centered', maxWidth: '1400px', borderRadius: '0' },
    darkMode: false,
    tags: ['luxury', 'watches', 'heritage', 'premium'],
  },
  // FOOD
  {
    id: 'starbucks',
    name: 'Starbucks Template',
    brand: 'Starbucks',
    category: 'food',
    colors: { primary: '#00704A', secondary: '#1E3932', accent: '#D4E9E2', background: '#FFFFFF', surface: '#F1F8F6', text: '#1E3932', textMuted: '#6B7775' },
    typography: { headingFont: 'Sodo Sans', bodyFont: 'Sodo Sans', headingWeight: '700' },
    layout: { heroStyle: 'split-right', maxWidth: '1440px', borderRadius: '8px' },
    darkMode: false,
    tags: ['food', 'coffee', 'green', 'friendly'],
  },
  {
    id: 'mcdonalds',
    name: "McDonald's Template",
    brand: "McDonald's",
    category: 'food',
    colors: { primary: '#FFC72C', secondary: '#DA291C', accent: '#27251F', background: '#FFFFFF', surface: '#F5F5F5', text: '#27251F', textMuted: '#6F6F6F' },
    typography: { headingFont: 'Speedee', bodyFont: 'Speedee', headingWeight: '700' },
    layout: { heroStyle: 'centered', maxWidth: '1200px', borderRadius: '20px' },
    darkMode: false,
    tags: ['food', 'fast-food', 'yellow', 'friendly'],
  },
];

const CATEGORIES: { id: TemplateCategory; label: string; icon: string }[] = [
  { id: 'corporate', label: 'Corporate', icon: '🏢' },
  { id: 'automotive', label: 'Automotive', icon: '🚗' },
  { id: 'tech', label: 'Tech Giants', icon: '💻' },
  { id: 'startup', label: 'Startups', icon: '🚀' },
  { id: 'sports', label: 'Sports', icon: '⚡' },
  { id: 'luxury', label: 'Luxury', icon: '👜' },
  { id: 'food', label: 'Food & Drink', icon: '🍔' },
];

interface BrandTemplateSelectorProps {
  onSelect: (template: BrandTemplate, customColors?: BrandTemplate['colors']) => void;
  onClose?: () => void;
}

export function BrandTemplateSelector({ onSelect, onClose }: BrandTemplateSelectorProps) {
  const [category, setCategory] = useState<TemplateCategory>('corporate');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<'browse' | 'mixmatch' | 'custom'>('browse');
  const [mixLayoutId, setMixLayoutId] = useState<string | null>(null);
  const [mixColorsId, setMixColorsId] = useState<string | null>(null);
  const [customColors, setCustomColors] = useState<BrandTemplate['colors'] | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Get templates for current category
  const categoryTemplates = useMemo(() => 
    TEMPLATES.filter(t => t.category === category),
    [category]
  );

  // Current template
  const currentTemplate = categoryTemplates[currentIndex] || categoryTemplates[0];

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [category]);

  // Initialize custom colors when entering custom mode
  useEffect(() => {
    if (mode === 'custom' && currentTemplate && !customColors) {
      setCustomColors({ ...currentTemplate.colors });
    }
  }, [mode, currentTemplate, customColors]);

  // Navigate templates
  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % categoryTemplates.length);
  }, [categoryTemplates.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + categoryTemplates.length) % categoryTemplates.length);
  }, [categoryTemplates.length]);

  // Get effective colors (for preview)
  const effectiveColors = useMemo(() => {
    if (mode === 'custom' && customColors) {
      return customColors;
    }
    if (mode === 'mixmatch' && mixColorsId) {
      const colorTemplate = TEMPLATES.find(t => t.id === mixColorsId);
      return colorTemplate?.colors || currentTemplate?.colors;
    }
    return currentTemplate?.colors;
  }, [mode, customColors, mixColorsId, currentTemplate]);

  // Get effective layout (for mix-match)
  const effectiveLayout = useMemo(() => {
    if (mode === 'mixmatch' && mixLayoutId) {
      const layoutTemplate = TEMPLATES.find(t => t.id === mixLayoutId);
      return layoutTemplate || currentTemplate;
    }
    return currentTemplate;
  }, [mode, mixLayoutId, currentTemplate]);

  // Handle selection
  const handleSelect = useCallback(() => {
    if (mode === 'custom' && customColors) {
      onSelect(currentTemplate, customColors);
    } else if (mode === 'mixmatch' && mixLayoutId && mixColorsId) {
      const layoutTemplate = TEMPLATES.find(t => t.id === mixLayoutId) || currentTemplate;
      const colorTemplate = TEMPLATES.find(t => t.id === mixColorsId);
      onSelect(layoutTemplate, colorTemplate?.colors);
    } else {
      onSelect(currentTemplate);
    }
  }, [mode, currentTemplate, customColors, mixLayoutId, mixColorsId, onSelect]);

  // Update custom color
  const updateColor = useCallback((key: keyof BrandTemplate['colors'], value: string) => {
    setCustomColors(prev => prev ? { ...prev, [key]: value } : null);
  }, []);

  const deviceWidth = previewDevice === 'mobile' ? 375 : previewDevice === 'tablet' ? 768 : '100%';

  if (!currentTemplate) {
    return <div className="text-center p-8 text-muted-foreground">No templates available</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#0A1628]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-white">Choose Your Template</h2>
          <p className="text-slate-400">Select from world-famous brand designs</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Controls */}
        <div className="w-80 border-r border-slate-700 p-4 space-y-4 overflow-y-auto bg-slate-900/50">
          {/* Categories */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300">Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center justify-start px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    category === cat.id 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template Navigation */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300">Template ({currentIndex + 1}/{categoryTemplates.length})</Label>
            <div className="flex items-center gap-2">
              <button onClick={goPrev} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex-1 text-center">
                <div className="font-semibold text-white">{currentTemplate.name}</div>
                <div className="text-xs text-slate-400">{currentTemplate.brand}</div>
              </div>
              <button onClick={goNext} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mode Tabs */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
            <TabsList className="w-full">
              <TabsTrigger value="browse" className="flex-1">
                <Monitor className="h-4 w-4 mr-1" />
                Browse
              </TabsTrigger>
              <TabsTrigger value="mixmatch" className="flex-1">
                <Shuffle className="h-4 w-4 mr-1" />
                Mix
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex-1">
                <Palette className="h-4 w-4 mr-1" />
                Colors
              </TabsTrigger>
            </TabsList>

            {/* Browse Mode */}
            <TabsContent value="browse" className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Current Colors</Label>
                <div className="flex gap-1">
                  {Object.entries(currentTemplate.colors).slice(0, 5).map(([key, color]) => (
                    <div
                      key={key}
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: color }}
                      title={key}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Typography</Label>
                <p className="text-sm">{currentTemplate.typography.headingFont}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Layout</Label>
                <p className="text-sm capitalize">{currentTemplate.layout.heroStyle}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {currentTemplate.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </TabsContent>

            {/* Mix & Match Mode */}
            <TabsContent value="mixmatch" className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Layout From:</Label>
                <select 
                  className="w-full p-2 rounded border bg-background text-sm"
                  value={mixLayoutId || ''}
                  onChange={e => setMixLayoutId(e.target.value)}
                >
                  <option value="">Select layout...</option>
                  {TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Colors From:</Label>
                <select 
                  className="w-full p-2 rounded border bg-background text-sm"
                  value={mixColorsId || ''}
                  onChange={e => setMixColorsId(e.target.value)}
                >
                  <option value="">Select colors...</option>
                  {TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              {mixLayoutId && mixColorsId && (
                <div className="p-2 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-600">
                  <Check className="h-3 w-3 inline mr-1" />
                  Ready to mix!
                </div>
              )}
            </TabsContent>

            {/* Custom Colors Mode */}
            <TabsContent value="custom" className="space-y-2">
              {customColors && Object.entries(customColors).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Label className="text-xs w-20 capitalize">{key}:</Label>
                  <Input
                    type="color"
                    value={value}
                    onChange={e => updateColor(key as keyof BrandTemplate['colors'], e.target.value)}
                    className="w-10 h-8 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={value}
                    onChange={e => updateColor(key as keyof BrandTemplate['colors'], e.target.value)}
                    className="flex-1 text-xs h-8"
                  />
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setCustomColors({ ...currentTemplate.colors })}
              >
                <Sparkles className="h-3 w-3 mr-2" />
                Reset to Template Colors
              </Button>
            </TabsContent>
          </Tabs>

          {/* Device Preview */}
          <div className="flex gap-2 pt-4 border-t border-slate-700">
            {[
              { id: 'desktop', icon: Monitor },
              { id: 'tablet', icon: Tablet },
              { id: 'mobile', icon: Smartphone },
            ].map(device => (
              <button
                key={device.id}
                onClick={() => setPreviewDevice(device.id as typeof previewDevice)}
                className={`p-2 rounded-lg transition-colors ${
                  previewDevice === device.id 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <device.icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {/* Select Button */}
          <button 
            className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors flex items-center justify-center gap-2"
            onClick={handleSelect}
          >
            <Check className="h-4 w-4" />
            Use {currentTemplate.name}
          </button>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-slate-900/50 p-4 overflow-hidden flex items-center justify-center">
          <div 
            className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
            style={{ 
              width: deviceWidth,
              maxWidth: '100%',
              height: previewDevice === 'mobile' ? '667px' : previewDevice === 'tablet' ? '600px' : '100%',
              maxHeight: '100%',
            }}
          >
            <ScrollArea className="h-full">
              {/* Live Preview */}
              <div 
                style={{ 
                  background: effectiveColors?.background || '#000',
                  color: effectiveColors?.text || '#fff',
                  minHeight: '100%',
                  fontFamily: currentTemplate.typography.bodyFont,
                }}
              >
                {/* Nav */}
                <nav 
                  className="flex items-center justify-between px-6 py-4"
                  style={{ borderBottom: `1px solid ${effectiveColors?.surface}` }}
                >
                  <div className="font-bold text-lg" style={{ color: effectiveColors?.text }}>
                    {currentTemplate.brand}
                  </div>
                  <div className="flex gap-4 text-sm" style={{ color: effectiveColors?.textMuted }}>
                    <span>Products</span>
                    <span>About</span>
                    <span>Contact</span>
                  </div>
                </nav>

                {/* Hero */}
                <div 
                  className={`py-20 px-6 text-center ${effectiveLayout?.layout.heroStyle === 'fullscreen' ? 'min-h-[400px] flex flex-col justify-center' : ''}`}
                  style={{ background: effectiveColors?.surface }}
                >
                  <h1 
                    className="text-4xl md:text-5xl mb-4"
                    style={{ 
                      fontWeight: currentTemplate.typography.headingWeight,
                      fontFamily: currentTemplate.typography.headingFont,
                      color: effectiveColors?.text,
                    }}
                  >
                    Welcome to the Future
                  </h1>
                  <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: effectiveColors?.textMuted }}>
                    Experience innovation like never before. Designed for those who demand excellence.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button 
                      className="px-6 py-3 rounded font-semibold"
                      style={{ 
                        background: effectiveColors?.primary,
                        color: currentTemplate.darkMode ? '#fff' : '#000',
                        borderRadius: currentTemplate.layout.borderRadius,
                      }}
                    >
                      Get Started
                    </button>
                    <button 
                      className="px-6 py-3 rounded font-semibold"
                      style={{ 
                        border: `1px solid ${effectiveColors?.text}`,
                        color: effectiveColors?.text,
                        background: 'transparent',
                        borderRadius: currentTemplate.layout.borderRadius,
                      }}
                    >
                      Learn More
                    </button>
                  </div>
                </div>

                {/* Features Section */}
                <div className="py-16 px-6" style={{ background: effectiveColors?.background }}>
                  <h2 
                    className="text-2xl mb-8 text-center"
                    style={{ 
                      fontWeight: currentTemplate.typography.headingWeight,
                      color: effectiveColors?.text,
                    }}
                  >
                    Why Choose Us
                  </h2>
                  <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {['Innovation', 'Quality', 'Excellence'].map((feature, i) => (
                      <div 
                        key={i}
                        className="p-6 rounded text-center"
                        style={{ 
                          background: effectiveColors?.surface,
                          borderRadius: currentTemplate.layout.borderRadius || '8px',
                        }}
                      >
                        <div 
                          className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                          style={{ background: effectiveColors?.primary }}
                        >
                          <Sparkles className="h-6 w-6" style={{ color: currentTemplate.darkMode ? '#fff' : '#000' }} />
                        </div>
                        <h3 className="font-semibold mb-2" style={{ color: effectiveColors?.text }}>
                          {feature}
                        </h3>
                        <p className="text-sm" style={{ color: effectiveColors?.textMuted }}>
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Section */}
                <div 
                  className="py-12 px-6 text-center"
                  style={{ background: effectiveColors?.primary }}
                >
                  <h2 
                    className="text-2xl mb-4"
                    style={{ 
                      color: currentTemplate.darkMode ? '#fff' : '#000',
                      fontWeight: currentTemplate.typography.headingWeight,
                    }}
                  >
                    Ready to Start?
                  </h2>
                  <button 
                    className="px-8 py-3 rounded font-semibold"
                    style={{ 
                      background: currentTemplate.darkMode ? '#fff' : '#000',
                      color: currentTemplate.darkMode ? '#000' : '#fff',
                      borderRadius: currentTemplate.layout.borderRadius,
                    }}
                  >
                    Contact Us Today
                  </button>
                </div>

                {/* Footer */}
                <footer 
                  className="py-8 px-6 text-center text-sm"
                  style={{ 
                    background: effectiveColors?.surface,
                    color: effectiveColors?.textMuted,
                  }}
                >
                  © 2025 {currentTemplate.brand}. All rights reserved.
                </footer>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrandTemplateSelector;
