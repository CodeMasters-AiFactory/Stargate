/**
 * Device Frame Preview Component
 * Phase 4: Real-Time Preview Enhancement
 * Shows website preview in realistic device frames (iPhone, Android, iPad, etc.)
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCw,
  RefreshCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Loader2,
} from 'lucide-react';

// Device configurations with realistic dimensions
const DEVICES = {
  iphone14Pro: {
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    bezelRadius: 47,
    notch: true,
    category: 'phone',
    scale: 0.6,
  },
  iphone14ProMax: {
    name: 'iPhone 14 Pro Max',
    width: 430,
    height: 932,
    bezelRadius: 55,
    notch: true,
    category: 'phone',
    scale: 0.55,
  },
  iphoneSE: {
    name: 'iPhone SE',
    width: 375,
    height: 667,
    bezelRadius: 0,
    notch: false,
    category: 'phone',
    scale: 0.7,
  },
  pixel7: {
    name: 'Pixel 7',
    width: 412,
    height: 915,
    bezelRadius: 20,
    notch: false,
    category: 'phone',
    scale: 0.55,
  },
  samsungS23: {
    name: 'Samsung S23',
    width: 360,
    height: 780,
    bezelRadius: 30,
    notch: false,
    category: 'phone',
    scale: 0.65,
  },
  iPadPro12: {
    name: 'iPad Pro 12.9"',
    width: 1024,
    height: 1366,
    bezelRadius: 18,
    notch: false,
    category: 'tablet',
    scale: 0.4,
  },
  iPadPro11: {
    name: 'iPad Pro 11"',
    width: 834,
    height: 1194,
    bezelRadius: 18,
    notch: false,
    category: 'tablet',
    scale: 0.45,
  },
  iPadMini: {
    name: 'iPad Mini',
    width: 744,
    height: 1133,
    bezelRadius: 18,
    notch: false,
    category: 'tablet',
    scale: 0.45,
  },
  macbookPro14: {
    name: 'MacBook Pro 14"',
    width: 1512,
    height: 982,
    bezelRadius: 10,
    notch: true,
    category: 'desktop',
    scale: 0.35,
  },
  desktop1080p: {
    name: 'Desktop 1080p',
    width: 1920,
    height: 1080,
    bezelRadius: 0,
    notch: false,
    category: 'desktop',
    scale: 0.3,
  },
  desktop1440p: {
    name: 'Desktop 1440p',
    width: 2560,
    height: 1440,
    bezelRadius: 0,
    notch: false,
    category: 'desktop',
    scale: 0.22,
  },
};

type DeviceType = keyof typeof DEVICES;
type Orientation = 'portrait' | 'landscape';

interface DeviceFramePreviewProps {
  previewUrl: string;
  onRefresh?: () => void;
  onOpenExternal?: () => void;
  isLoading?: boolean;
}

export function DeviceFramePreview({
  previewUrl,
  onRefresh,
  onOpenExternal,
  isLoading = false,
}: DeviceFramePreviewProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('iphone14Pro');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [category, setCategory] = useState<'phone' | 'tablet' | 'desktop'>('phone');

  const device = DEVICES[selectedDevice];
  
  // Calculate dimensions based on orientation
  const dimensions = useMemo(() => {
    const width = orientation === 'portrait' ? device.width : device.height;
    const height = orientation === 'portrait' ? device.height : device.width;
    return { width, height };
  }, [device, orientation]);
  
  // Filter devices by category
  const filteredDevices = useMemo(() => {
    return Object.entries(DEVICES).filter(([_, d]) => d.category === category);
  }, [category]);

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-muted border-b">
        <div className="flex items-center gap-2">
          {/* Category Selection */}
          <div className="flex items-center gap-1 bg-background rounded-lg p-1">
            <Button
              variant={category === 'phone' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setCategory('phone');
                setSelectedDevice('iphone14Pro');
              }}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button
              variant={category === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setCategory('tablet');
                setSelectedDevice('iPadPro11');
              }}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={category === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setCategory('desktop');
                setSelectedDevice('desktop1080p');
              }}
            >
              <Monitor className="w-4 h-4" />
            </Button>
          </div>

          {/* Device Selection */}
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value as DeviceType)}
            className="h-8 px-2 text-sm border rounded bg-background"
          >
            {filteredDevices.map(([key, d]) => (
              <option key={key} value={key}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Orientation Toggle (only for phone/tablet) */}
          {category !== 'desktop' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOrientation(o => o === 'portrait' ? 'landscape' : 'portrait')}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          )}

          <Badge variant="outline" className="text-xs">
            {dimensions.width} × {dimensions.height}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
          {onOpenExternal && (
            <Button variant="outline" size="sm" onClick={onOpenExternal}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-8">
        <div
          className="relative transition-all duration-300"
          style={{
            transform: `scale(${device.scale})`,
            transformOrigin: 'center',
          }}
        >
          {/* Device Frame */}
          <div
            className="relative bg-gray-800 shadow-2xl"
            style={{
              width: dimensions.width + 24, // Bezel
              height: dimensions.height + 24,
              borderRadius: device.bezelRadius + 8,
              padding: '12px',
            }}
          >
            {/* Notch (for iPhones) */}
            {device.notch && orientation === 'portrait' && (
              <div
                className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-black rounded-full z-10"
                style={{
                  width: '100px',
                  height: '30px',
                }}
              />
            )}

            {/* Screen */}
            <div
              className="relative bg-white overflow-hidden"
              style={{
                width: dimensions.width,
                height: dimensions.height,
                borderRadius: device.bezelRadius,
              }}
            >
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title={`Preview on ${device.name}`}
                  style={{
                    pointerEvents: isFullscreen ? 'auto' : 'none',
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <p className="text-gray-400">No preview URL</p>
                </div>
              )}
            </div>

            {/* Home Button (for older iPhones/iPads) */}
            {!device.notch && category === 'phone' && (
              <div
                className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full border-2 border-gray-600"
              />
            )}
          </div>

          {/* Device Name Label */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <Badge variant="secondary" className="text-xs">
              {device.name} ({orientation})
            </Badge>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-2 bg-muted border-t text-xs text-muted-foreground flex items-center justify-between">
        <span>Device Preview Mode - {device.name}</span>
        <span>
          {orientation === 'portrait' ? 'Portrait' : 'Landscape'} • {dimensions.width}×{dimensions.height}px
        </span>
      </div>
    </div>
  );
}

export default DeviceFramePreview;

