/**
 * Advanced Analytics Screen
 * Phase 3.5: Advanced Analytics - Main screen for analytics features
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Calendar, FileText } from 'lucide-react';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card as UICard } from '@/components/ui/card';

export function AdvancedAnalyticsScreen() {
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch custom reports
  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics-advanced/reports');
      const data = await response.json();
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Advanced Analytics
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Track events, analyze data, and generate custom reports
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-3 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Custom Reports
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Scheduled Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Custom Reports</CardTitle>
                <CardDescription>
                  Create and manage custom analytics reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading reports...</p>
                ) : reports.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No custom reports yet.</p>
                    <Button onClick={() => toast({
                      title: 'Feature Coming Soon',
                      description: 'Report builder interface will be available soon.',
                    })}>
                      Create Report
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <UICard key={report.id} className="p-4">
                        <h3 className="font-semibold">{report.name}</h3>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </UICard>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>
                  Manage automated report deliveries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Scheduled reports feature coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

