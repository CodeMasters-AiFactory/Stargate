/**
 * Mobile Editor Component - Enhanced Version
 * Phase 4.2.1: Mobile Editor with Touch Support
 * 
 * Features:
 * - Touch-friendly controls
 * - Gesture support (pinch zoom, swipe)
 * - Mobile-optimized toolbar
 * - Haptic feedback (where available)
 * - Portrait/Landscape detection
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Settings,
  Layers,
  PanelLeft,
  Undo,
  Redo,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type DeviceView = 'mobile' | 'tablet' | 'desktop' | 'full';
export type Orientation = 'portrait' | 'landscape';

interface TouchState {
  initialDistance: number;
  initialScale: number;
  startX: number;
  startY: number;
  isDragging: boolean;
  isPinching: boolean;
}

interface MobileEditorProps {
  children: React.ReactNode;
  onDeviceChange?: (device: DeviceView) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
}

const DEVICE_CONFIGS: Record<DeviceView, { width: number; height: number; label: string; icon: React.ReactNode }> = {
  mobile: {
    width: 375,
    height: 667,
    label: 'Mobile',
    icon: <Smartphone className="w-4 h-4" />,
  },
  tablet: {
    width: 768,
    height: 1024,
    label: 'Tablet',
    icon: <Tablet className="w-4 h-4" />,
  },
  desktop: {
    width: 1920,
    height: 1080,
    label: 'Desktop',
    icon: <Monitor className="w-4 h-4" />,
  },
  full: {
    width: 100,
    height: 100,
    label: 'Full Width',
    icon: <Maximize2 className="w-4 h-4" />,
  },
};

// Detect if device supports touch
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Haptic feedback (if available)
const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const durations: Record<string, number> = {
      light: 10,
      medium: 25,
      heavy: 50
    };
    navigator.vibrate(durations[type]);
  }
};

export function MobileEditor({ 
  children, 
  onDeviceChange, 
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  className 
}: MobileEditorProps) {
  const [device, setDevice] = useState<DeviceView>('desktop');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const touchStateRef = useRef<TouchState>({
    initialDistance: 0,
    initialScale: 1,
    startX: 0,
    startY: 0,
    isDragging: false,
    isPinching: false
  });

  const config = DEVICE_CONFIGS[device];
  const isFullWidth = device === 'full';

  // Detect touch device on mount
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  // Handle device orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      setOrientation(isLandscape ? 'landscape' : 'portrait');
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  const handleDeviceChange = useCallback((newDevice: DeviceView) => {
    hapticFeedback('light');
    setDevice(newDevice);
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
    onDeviceChange?.(newDevice);
  }, [onDeviceChange]);

  const toggleFullscreen = useCallback(() => {
    hapticFeedback('medium');
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const toggleOrientation = useCallback(() => {
    hapticFeedback('light');
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  }, []);

  const handleZoomIn = useCallback(() => {
    hapticFeedback('light');
    setScale(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    hapticFeedback('light');
    setScale(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const resetView = useCallback(() => {
    hapticFeedback('medium');
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Touch event handlers for pinch-zoom and pan
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture start
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStateRef.current = {
        ...touchStateRef.current,
        initialDistance: distance,
        initialScale: scale,
        isPinching: true
      };
    } else if (e.touches.length === 1) {
      // Pan gesture start
      touchStateRef.current = {
        ...touchStateRef.current,
        startX: e.touches[0].clientX - panOffset.x,
        startY: e.touches[0].clientY - panOffset.y,
        isDragging: true
      };
    }
  }, [scale, panOffset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStateRef.current.isPinching && e.touches.length === 2) {
      // Pinch zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleFactor = distance / touchStateRef.current.initialDistance;
      const newScale = Math.min(Math.max(touchStateRef.current.initialScale * scaleFactor, 0.25), 3);
      setScale(newScale);
    } else if (touchStateRef.current.isDragging && e.touches.length === 1) {
      // Pan
      const x = e.touches[0].clientX - touchStateRef.current.startX;
      const y = e.touches[0].clientY - touchStateRef.current.startY;
      setPanOffset({ x, y });
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchStateRef.current = {
      ...touchStateRef.current,
      isDragging: false,
      isPinching: false
    };
  }, []);

  // Get actual dimensions based on orientation
  const getViewportDimensions = () => {
    if (isFullWidth) return { width: '100%', height: '100%' };
    
    const w = orientation === 'portrait' ? config.width : config.height;
    const h = orientation === 'portrait' ? config.height : config.width;
    
    return {
      width: `${w}px`,
      height: `${h}px`
    };
  };

  const dimensions = getViewportDimensions();

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Mobile-Optimized Toolbar */}
      <div className={cn(
        'flex items-center justify-between p-2 border-b bg-white dark:bg-slate-800',
        isTouch && 'gap-1'
      )}>
        {/* Left Controls */}
        <div className="flex items-center gap-1">
          {/* Device Selector - Compact on mobile */}
          {isTouch ? (
            <div className="flex gap-1">
              {Object.entries(DEVICE_CONFIGS).slice(0, 3).map(([key, cfg]) => (
                <Button
                  key={key}
                  variant={device === key ? 'default' : 'ghost'}
                  size="sm"
                  className="h-10 w-10 p-0"
                  onClick={() => handleDeviceChange(key as DeviceView)}
                >
                  {cfg.icon}
                </Button>
              ))}
            </div>
          ) : (
            <Select value={device} onValueChange={handleDeviceChange}>
              <SelectTrigger className="w-[140px]">
                <div className="flex items-center gap-2">
                  {config.icon}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DEVICE_CONFIGS).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {cfg.icon}
                      <span>{cfg.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Rotate Button - Only for non-full view */}
          {!isFullWidth && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleOrientation}
              className="h-10 w-10 p-0"
              title="Rotate"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Center - Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="h-10 w-10 p-0"
            disabled={scale <= 0.25}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <span className="text-sm w-12 text-center font-mono">
            {Math.round(scale * 100)}%
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="h-10 w-10 p-0"
            disabled={scale >= 3}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetView}
            className="h-10 w-10 p-0"
            title="Reset View"
          >
            <Move className="w-4 h-4" />
          </Button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1">
          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-10 w-10 p-0"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-10 w-10 p-0"
          >
            <Redo className="w-4 h-4" />
          </Button>

          {/* Grid Toggle */}
          <Button
            variant={showGrid ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className="h-10 w-10 p-0"
          >
            <Layers className="w-4 h-4" />
          </Button>

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-10 w-10 p-0"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>

          {/* Settings Sheet for mobile */}
          {isTouch && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                  <Settings className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[300px]">
                <div className="space-y-4 p-4">
                  <h3 className="font-semibold">Editor Settings</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Zoom Level</label>
                    <Slider
                      value={[scale * 100]}
                      min={25}
                      max={300}
                      step={25}
                      onValueChange={([value]) => setScale(value / 100)}
                    />
                    <span className="text-sm text-muted-foreground">{Math.round(scale * 100)}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Show Grid</span>
                    <Button
                      variant={showGrid ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowGrid(!showGrid)}
                    >
                      {showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={resetView}
                  >
                    Reset View
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {/* Editor Viewport with Touch Support */}
      <div
        ref={viewportRef}
        className={cn(
          'flex-1 overflow-hidden bg-slate-100 dark:bg-slate-900',
          isFullscreen && 'fixed inset-0 z-50',
          showGrid && 'bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px]'
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <div 
          className="flex items-center justify-center w-full h-full"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: touchStateRef.current.isDragging || touchStateRef.current.isPinching 
              ? 'none' 
              : 'transform 0.2s ease-out'
          }}
        >
          <div
            className={cn(
              'bg-white dark:bg-slate-800 shadow-2xl transition-all duration-300',
              !isFullWidth && 'rounded-lg border-4 border-slate-300 dark:border-slate-600',
              isFullWidth && 'w-full h-full'
            )}
            style={!isFullWidth ? {
              width: dimensions.width,
              height: dimensions.height,
              maxWidth: '100vw',
              maxHeight: '100vh',
            } : undefined}
          >
            {/* Device Frame Notch (for mobile view) */}
            {device === 'mobile' && !isFullWidth && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-xl z-10" />
            )}
            
            <div className="h-full overflow-auto">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Touch Gesture Hint (first time users) */}
      {isTouch && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none opacity-50">
          Pinch to zoom • Drag to pan
        </div>
      )}
    </div>
  );
}

export default MobileEditor;
