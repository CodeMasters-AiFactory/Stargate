/**
 * Device Preview Panel
 * Shows website on different devices with performance metrics
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Smartphone,
  Tablet,
  Monitor,
  Gauge,
  Clock,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export interface PerformanceMetrics {
  loadTime: number; // milliseconds
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  tti: number; // Time to Interactive
}

interface DevicePreviewPanelProps {
  html: string;
  css: string;
  performanceMetrics?: PerformanceMetrics;
}

const DEVICE_PRESETS = {
  mobile: { width: 375, height: 667, name: 'iPhone SE' },
  tablet: { width: 768, height: 1024, name: 'iPad' },
  desktop: { width: 1920, height: 1080, name: 'Desktop' },
};

export function DevicePreviewPanel({
  html,
  css,
  performanceMetrics,
}: DevicePreviewPanelProps) {
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const device = DEVICE_PRESETS[selectedDevice];

  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${css}</style>
      </head>
      <body>${html}</body>
    </html>
  `;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Device Preview</h3>
            <p className="text-sm text-muted-foreground">
              Test responsive design across devices
            </p>
          </div>
          <Tabs value={selectedDevice} onValueChange={(v) => setSelectedDevice(v as any)}>
            <TabsList>
              <TabsTrigger value="mobile" className="gap-2">
                <Smartphone className="w-4 h-4" />
                Mobile
              </TabsTrigger>
              <TabsTrigger value="tablet" className="gap-2">
                <Tablet className="w-4 h-4" />
                Tablet
              </TabsTrigger>
              <TabsTrigger value="desktop" className="gap-2">
                <Monitor className="w-4 h-4" />
                Desktop
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview */}
        <div className="flex-1 flex items-center justify-center bg-muted/30 p-8">
          <div
            className="bg-white shadow-2xl rounded-lg overflow-hidden border-4 border-gray-800"
            style={{
              width: `${device.width * 0.6}px`,
              height: `${device.height * 0.6}px`,
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-white text-xs font-medium">{device.name}</span>
              <div className="w-12"></div>
            </div>
            <div className="overflow-auto" style={{ height: 'calc(100% - 40px)' }}>
              <iframe
                srcDoc={fullHtml}
                className="w-full h-full border-0"
                title={`Device Preview: ${device.name}`}
                sandbox="allow-same-origin allow-scripts"
                style={{
                  minHeight: `${device.height}px`,
                  transform: 'scale(0.6)',
                  transformOrigin: 'top left',
                  width: `${device.width / 0.6}px`,
                  height: `${device.height / 0.6}px`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Performance Metrics Sidebar */}
        {performanceMetrics && (
          <div className="w-80 border-l bg-background p-4 overflow-y-auto">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Performance Metrics
            </h4>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Load Time</span>
                    <Badge variant={performanceMetrics.loadTime < 2000 ? 'default' : 'secondary'}>
                      {performanceMetrics.loadTime}ms
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {performanceMetrics.loadTime < 2000 ? 'Fast' : 'Could be faster'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">First Contentful Paint</span>
                    <Badge variant={performanceMetrics.fcp < 1800 ? 'default' : 'secondary'}>
                      {performanceMetrics.fcp}ms
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    {performanceMetrics.fcp < 1800 ? 'Good' : 'Needs improvement'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Largest Contentful Paint</span>
                    <Badge variant={performanceMetrics.lcp < 2500 ? 'default' : 'secondary'}>
                      {performanceMetrics.lcp}ms
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3" />
                    {performanceMetrics.lcp < 2500 ? 'Optimal' : 'Slow'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Cumulative Layout Shift</span>
                    <Badge variant={performanceMetrics.cls < 0.1 ? 'default' : 'secondary'}>
                      {performanceMetrics.cls.toFixed(3)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {performanceMetrics.cls < 0.1 ? 'Stable' : 'Unstable layout'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Time to Interactive</span>
                    <Badge variant={performanceMetrics.tti < 3800 ? 'default' : 'secondary'}>
                      {performanceMetrics.tti}ms
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {performanceMetrics.tti < 3800 ? 'Interactive' : 'Slow to interact'}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

