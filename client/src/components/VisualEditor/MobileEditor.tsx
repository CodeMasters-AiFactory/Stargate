/**
 * Mobile Editor Component
 * Phase 4.2: UI/UX Polish - Mobile-responsive visual editor
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, Tablet, Monitor, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DeviceView = 'mobile' | 'tablet' | 'desktop' | 'full';

interface MobileEditorProps {
  children: React.ReactNode;
  onDeviceChange?: (device: DeviceView) => void;
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

export function MobileEditor({ children, onDeviceChange, className }: MobileEditorProps) {
  const [device, setDevice] = useState<DeviceView>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const config = DEVICE_CONFIGS[device];
  const isFullWidth = device === 'full';

  const handleDeviceChange = (newDevice: DeviceView) => {
    setDevice(newDevice);
    onDeviceChange?.(newDevice);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <Select value={device} onValueChange={handleDeviceChange}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                {config.icon}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DEVICE_CONFIGS).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span>{config.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!isFullWidth && (
            <span className="text-sm text-muted-foreground">
              {config.width} × {config.height}px
            </span>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="flex items-center gap-2"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4" />
              Exit Fullscreen
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              Fullscreen
            </>
          )}
        </Button>
      </div>

      {/* Editor Viewport */}
      <div
        className={cn(
          'flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 p-4',
          isFullscreen && 'fixed inset-0 z-50 p-0'
        )}
      >
        <div className="flex items-center justify-center h-full">
          <div
            className={cn(
              'bg-white dark:bg-slate-800 shadow-2xl transition-all duration-300',
              !isFullWidth && 'rounded-lg border-4 border-slate-300 dark:border-slate-600',
              isFullWidth && 'w-full h-full'
            )}
            style={
              !isFullWidth
                ? {
                    width: `${config.width}px`,
                    height: `${config.height}px`,
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }
                : undefined
            }
          >
            <div className="h-full overflow-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

