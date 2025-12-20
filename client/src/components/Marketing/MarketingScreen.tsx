/**
 * Marketing Screen
 * Phase 3.3: Marketing Automation - Main screen for all marketing features
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadCaptureFormBuilder } from './LeadCaptureFormBuilder';
import { Mail, FileText, TrendingUp, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { useIDE } from '@/hooks/use-ide';

export function MarketingScreen() {
  const { state } = useIDE();
  const websiteId = state.currentWebsiteId || 'default';

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Marketing Automation
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Build forms, capture leads, and automate your marketing campaigns
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="lead-capture" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-2 mb-6">
            <TabsTrigger value="lead-capture" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Lead Capture Forms
            </TabsTrigger>
            <TabsTrigger value="coming-soon" disabled className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Marketing Funnels
              <span className="text-xs text-muted-foreground">(Coming Soon)</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lead-capture" className="mt-0">
            <LeadCaptureFormBuilder websiteId={websiteId} />
          </TabsContent>

          <TabsContent value="coming-soon" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Marketing Funnels</CardTitle>
                <CardDescription>
                  Visual funnel builder for tracking and optimizing conversions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">This feature is coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

