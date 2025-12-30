/**
 * Responsive Breakpoints System
 * Complete breakpoint controls for visual editor
 * Supports desktop, tablet, mobile with custom breakpoints
 */

import React, { useState, useCallback, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Monitor, Tablet, Smartphone, RotateCw,
  ChevronDown, Plus, Eye,
  Laptop
} from 'lucide-react';

// ==============================================
// BREAKPOINT DEFINITIONS
// ==============================================

export interface Breakpoint {
  id: string;
  name: string;
  width: number;
  height: number;
  icon: React.ComponentType<{ className?: string }>;
  minWidth?: number;
  maxWidth?: number;
  isCustom?: boolean;
}

export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  {
    id: 'desktop-xl',
    name: 'Desktop XL',
    width: 1920,
    height: 1080,
    icon: Monitor,
    minWidth: 1440,
  },
  {
    id: 'desktop',
    name: 'Desktop',
    width: 1440,
    height: 900,
    icon: Monitor,
    minWidth: 1280,
    maxWidth: 1439,
  },
  {
    id: 'laptop',
    name: 'Laptop',
    width: 1280,
    height: 800,
    icon: Laptop,
    minWidth: 1024,
    maxWidth: 1279,
  },
  {
    id: 'tablet-landscape',
    name: 'Tablet Landscape',
    width: 1024,
    height: 768,
    icon: Tablet,
    minWidth: 768,
    maxWidth: 1023,
  },
  {
    id: 'tablet',
    name: 'Tablet',
    width: 768,
    height: 1024,
    icon: Tablet,
    minWidth: 640,
    maxWidth: 767,
  },
  {
    id: 'mobile-large',
    name: 'Mobile Large',
    width: 428,
    height: 926,
    icon: Smartphone,
    minWidth: 390,
    maxWidth: 639,
  },
  {
    id: 'mobile',
    name: 'Mobile',
    width: 375,
    height: 812,
    icon: Smartphone,
    minWidth: 320,
    maxWidth: 389,
  },
  {
    id: 'mobile-small',
    name: 'Mobile Small',
    width: 320,
    height: 568,
    icon: Smartphone,
    maxWidth: 319,
  },
];

// Popular device presets
export const DEVICE_PRESETS: Record<string, { width: number; height: number; name: string }> = {
  'iphone-14-pro': { width: 393, height: 852, name: 'iPhone 14 Pro' },
  'iphone-14-pro-max': { width: 430, height: 932, name: 'iPhone 14 Pro Max' },
  'iphone-se': { width: 375, height: 667, name: 'iPhone SE' },
  'pixel-7': { width: 412, height: 915, name: 'Pixel 7' },
  'samsung-s23': { width: 360, height: 780, name: 'Samsung S23' },
  'ipad-pro-12': { width: 1024, height: 1366, name: 'iPad Pro 12.9"' },
  'ipad-pro-11': { width: 834, height: 1194, name: 'iPad Pro 11"' },
  'ipad-mini': { width: 744, height: 1133, name: 'iPad Mini' },
  'macbook-pro-14': { width: 1512, height: 982, name: 'MacBook Pro 14"' },
  'macbook-air': { width: 1280, height: 800, name: 'MacBook Air' },
};

// ==============================================
// BREAKPOINT CONTEXT
// ==============================================

interface BreakpointContextType {
  currentBreakpoint: Breakpoint;
  breakpoints: Breakpoint[];
  orientation: 'portrait' | 'landscape';
  zoom: number;
  setCurrentBreakpoint: (bp: Breakpoint) => void;
  setBreakpoints: (bps: Breakpoint[]) => void;
  setOrientation: (o: 'portrait' | 'landscape') => void;
  setZoom: (z: number) => void;
  addCustomBreakpoint: (bp: Omit<Breakpoint, 'id' | 'isCustom'>) => void;
  removeBreakpoint: (id: string) => void;
  getResponsiveValue: <T>(values: Record<string, T>, defaultValue: T) => T;
}

const BreakpointContext = createContext<BreakpointContextType | null>(null);

export function useBreakpoints() {
  const context = useContext(BreakpointContext);
  if (!context) {
    throw new Error('useBreakpoints must be used within BreakpointProvider');
  }
  return context;
}

// ==============================================
// BREAKPOINT PROVIDER
// ==============================================

interface BreakpointProviderProps {
  children: React.ReactNode;
  defaultBreakpoint?: string;
}

export function BreakpointProvider({ children, defaultBreakpoint = 'desktop' }: BreakpointProviderProps) {
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>(DEFAULT_BREAKPOINTS);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>(
    breakpoints.find(b => b.id === defaultBreakpoint) || breakpoints[0]
  );
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [zoom, setZoom] = useState(100);

  const addCustomBreakpoint = useCallback((bp: Omit<Breakpoint, 'id' | 'isCustom'>) => {
    const newBreakpoint: Breakpoint = {
      ...bp,
      id: `custom-${Date.now()}`,
      isCustom: true,
    };
    setBreakpoints(prev => [...prev, newBreakpoint].sort((a, b) => b.width - a.width));
  }, []);

  const removeBreakpoint = useCallback((id: string) => {
    setBreakpoints(prev => prev.filter(b => b.id !== id));
    if (currentBreakpoint.id === id) {
      setCurrentBreakpoint(breakpoints[0]);
    }
  }, [currentBreakpoint, breakpoints]);

  const getResponsiveValue = useCallback(<T,>(values: Record<string, T>, defaultValue: T): T => {
    // Find the closest breakpoint value
    const sortedBreakpoints = [...breakpoints].sort((a, b) => b.width - a.width);
    
    for (const bp of sortedBreakpoints) {
      if (bp.width <= currentBreakpoint.width && values[bp.id] !== undefined) {
        return values[bp.id];
      }
    }
    
    return defaultValue;
  }, [currentBreakpoint, breakpoints]);

  return (
    <BreakpointContext.Provider
      value={{
        currentBreakpoint,
        breakpoints,
        orientation,
        zoom,
        setCurrentBreakpoint,
        setBreakpoints,
        setOrientation,
        setZoom,
        addCustomBreakpoint,
        removeBreakpoint,
        getResponsiveValue,
      }}
    >
      {children}
    </BreakpointContext.Provider>
  );
}

// ==============================================
// BREAKPOINT TOOLBAR
// ==============================================

interface BreakpointToolbarProps {
  onPreview?: () => void;
}

export function BreakpointToolbar({ onPreview }: BreakpointToolbarProps) {
  const {
    currentBreakpoint,
    breakpoints,
    orientation,
    zoom,
    setCurrentBreakpoint,
    setOrientation,
    setZoom,
    addCustomBreakpoint,
  } = useBreakpoints();

  const [showCustom, setShowCustom] = useState(false);
  const [customWidth, setCustomWidth] = useState(1024);
  const [customHeight, setCustomHeight] = useState(768);
  const [customName, setCustomName] = useState('Custom');

  const mainBreakpoints = breakpoints.filter(b => 
    ['desktop', 'tablet', 'mobile'].includes(b.id) || b.isCustom
  );

  const handleAddCustom = () => {
    addCustomBreakpoint({
      name: customName,
      width: customWidth,
      height: customHeight,
      icon: Monitor,
    });
    setShowCustom(false);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 border-b">
      {/* Main Breakpoint Buttons */}
      <div className="flex items-center gap-1 bg-background rounded-lg p-1">
        {[
          { id: 'desktop', icon: Monitor, label: 'Desktop' },
          { id: 'tablet', icon: Tablet, label: 'Tablet' },
          { id: 'mobile', icon: Smartphone, label: 'Mobile' },
        ].map(({ id, icon: Icon, label }) => {
          const bp = breakpoints.find(b => b.id === id);
          if (!bp) return null;
          return (
            <Button
              key={id}
              variant={currentBreakpoint.id === id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentBreakpoint(bp)}
              title={`${label} (${bp.width}px)`}
            >
              <Icon className="w-4 h-4" />
            </Button>
          );
        })}
      </div>

      {/* Breakpoint Dropdown */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {React.createElement(currentBreakpoint.icon, { className: 'w-4 h-4' })}
            <span className="text-xs">{currentBreakpoint.name}</span>
            <Badge variant="secondary" className="text-xs">
              {currentBreakpoint.width}×{currentBreakpoint.height}
            </Badge>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <div className="p-2 border-b">
            <h4 className="text-sm font-medium">Breakpoints</h4>
          </div>
          <div className="max-h-64 overflow-auto p-2">
            {breakpoints.map((bp) => (
              <div
                key={bp.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted ${
                  currentBreakpoint.id === bp.id ? 'bg-muted' : ''
                }`}
                onClick={() => setCurrentBreakpoint(bp)}
              >
                <div className="flex items-center gap-2">
                  {React.createElement(bp.icon, { className: 'w-4 h-4' })}
                  <span className="text-sm">{bp.name}</span>
                  {bp.isCustom && <Badge variant="outline" className="text-xs">Custom</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {bp.width}×{bp.height}
                </span>
              </div>
            ))}
          </div>
          <div className="p-2 border-t">
            {!showCustom ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowCustom(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Breakpoint
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="h-8"
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Width"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                    className="h-8"
                  />
                  <Input
                    type="number"
                    placeholder="Height"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddCustom} className="flex-1">
                    Add
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowCustom(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Orientation Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOrientation(o => o === 'portrait' ? 'landscape' : 'portrait')}
        title={`Orientation: ${orientation}`}
      >
        <RotateCw className="w-4 h-4" />
      </Button>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-muted-foreground">Zoom</span>
        <div className="w-24">
          <Slider
            value={[zoom]}
            onValueChange={([v]) => setZoom(v)}
            min={25}
            max={200}
            step={25}
          />
        </div>
        <Badge variant="outline" className="text-xs w-12 justify-center">
          {zoom}%
        </Badge>
      </div>

      {/* Preview Button */}
      {onPreview && (
        <Button variant="outline" size="sm" onClick={onPreview}>
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
      )}
    </div>
  );
}

// ==============================================
// RESPONSIVE PREVIEW CONTAINER
// ==============================================

interface ResponsivePreviewProps {
  children: React.ReactNode;
  showFrame?: boolean;
}

export function ResponsivePreview({ children, showFrame = true }: ResponsivePreviewProps) {
  const { currentBreakpoint, orientation, zoom } = useBreakpoints();

  const width = orientation === 'landscape' ? currentBreakpoint.height : currentBreakpoint.width;
  const height = orientation === 'landscape' ? currentBreakpoint.width : currentBreakpoint.height;
  const scale = zoom / 100;

  return (
    <div className="flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-900 min-h-full overflow-auto">
      <div
        className="relative transition-all duration-300"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center top',
        }}
      >
        {showFrame && currentBreakpoint.id.includes('mobile') && (
          <div className="absolute -inset-3 bg-gray-800 rounded-[40px] shadow-2xl" />
        )}
        {showFrame && currentBreakpoint.id.includes('tablet') && (
          <div className="absolute -inset-4 bg-gray-800 rounded-[20px] shadow-2xl" />
        )}
        <div
          className="relative bg-white shadow-xl overflow-hidden"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            borderRadius: showFrame && currentBreakpoint.id.includes('mobile') ? '32px' : 
                         showFrame && currentBreakpoint.id.includes('tablet') ? '16px' : '0',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// ==============================================
// RESPONSIVE VALUE HELPER
// ==============================================

interface ResponsiveValueProps<T> {
  values: Partial<Record<string, T>>;
  defaultValue: T;
  children: (value: T) => React.ReactNode;
}

export function ResponsiveValue<T>({ values, defaultValue, children }: ResponsiveValueProps<T>) {
  const { getResponsiveValue } = useBreakpoints();
  const value = getResponsiveValue(values as Record<string, T>, defaultValue);
  return <>{children(value)}</>;
}

// ==============================================
// CSS MEDIA QUERY GENERATOR
// ==============================================

export function generateMediaQueries(breakpoints: Breakpoint[]): string {
  const sorted = [...breakpoints].sort((a, b) => a.width - b.width);
  
  let css = '/* Generated Media Queries */\n\n';
  
  sorted.forEach((bp, index: number) => {
    const minWidth = bp.minWidth || 0;
    const maxWidth = bp.maxWidth || (sorted[index + 1]?.width ? sorted[index + 1].width - 1 : undefined);
    
    if (maxWidth) {
      css += `/* ${bp.name} */\n`;
      css += `@media (min-width: ${minWidth}px) and (max-width: ${maxWidth}px) {\n`;
      css += `  /* Styles for ${bp.name} */\n`;
      css += `}\n\n`;
    } else {
      css += `/* ${bp.name} and up */\n`;
      css += `@media (min-width: ${minWidth}px) {\n`;
      css += `  /* Styles for ${bp.name} */\n`;
      css += `}\n\n`;
    }
  });
  
  return css;
}

export default BreakpointToolbar;

