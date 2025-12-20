/**
 * Performance Dashboard
 * Real-time performance monitoring with Core Web Vitals visualization
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Zap, Gauge, Sparkles, Settings, X } from 'lucide-react';
import { toast } from 'sonner';

export interface PerformanceDashboardProps {
  websiteId: string;
}

export interface CoreWebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  inp?: number; // Interaction to Next Paint
}

export interface PerformanceScores {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

export interface PerformanceReport {
  websiteId: string;
  url: string;
  timestamp: number;
  summary: CoreWebVitals;
  scores: PerformanceScores;
  metrics: Array<{
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
  }>;
}

export function PerformanceDashboard({ websiteId }: PerformanceDashboardProps) {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [trends, setTrends] = useState<Array<{ date: string; score: number; metrics: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [optimizationResults, setOptimizationResults] = useState<any>(null);

  useEffect(() => {
    loadPerformanceData();
  }, [websiteId, timeRange]);

  const loadPerformanceData = async () => {
    setIsLoading(true);
    try {
      // Load performance report
      const reportResponse = await fetch(`/api/performance/report?websiteId=${websiteId}`);
      const reportData = await reportResponse.json();
      if (reportData.success) {
        setReport(reportData.report);
      }

      // Load trends
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const trendsResponse = await fetch(`/api/performance/trends?websiteId=${websiteId}&days=${days}`);
      const trendsData = await trendsResponse.json();
      if (trendsData.success) {
        setTrends(trendsData.trends);
      }
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingColor = (rating: 'good' | 'needs-improvement' | 'poor') => {
    switch (rating) {
      case 'good':
        return 'bg-green-500';
      case 'needs-improvement':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatMetricValue = (name: string, value: number) => {
    if (name === 'cls') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  const handleAutoOptimize = async () => {
    setIsOptimizing(true);
    try {
      // Get current website HTML/CSS (simplified - would fetch from actual website)
      const response = await fetch('/api/performance/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: '<html><body>...</body></html>', // Would be actual HTML
          css: 'body { ... }', // Would be actual CSS
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOptimizationResults(data);
        toast.success(`Optimized! Estimated load time: ${data.estimatedLoadTime}s`);
        loadPerformanceData(); // Refresh metrics
      } else {
        toast.error(data.error || 'Failed to optimize');
      }
    } catch (error) {
      console.error('Failed to optimize:', error);
      toast.error('Failed to optimize performance');
    } finally {
      setIsOptimizing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading performance data...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">No performance data available</p>
        <Button onClick={loadPerformanceData}>Refresh</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Performance Dashboard</h2>
            <p className="text-muted-foreground">Core Web Vitals and performance metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleAutoOptimize}
              disabled={isOptimizing}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isOptimizing ? 'Optimizing...' : 'Auto-Optimize'}
            </Button>
            <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Performance Scores */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Performance</span>
              <Gauge className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(report.scores.performance)}`}>
              {report.scores.performance}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Lighthouse Score</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Accessibility</span>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(report.scores.accessibility)}`}>
              {report.scores.accessibility}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Lighthouse Score</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Best Practices</span>
              <Zap className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(report.scores.bestPractices)}`}>
              {report.scores.bestPractices}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Lighthouse Score</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">SEO</span>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(report.scores.seo)}`}>
              {report.scores.seo}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Lighthouse Score</div>
          </Card>
        </div>

        {/* Core Web Vitals */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'LCP', value: report.summary.lcp, target: 2500, label: 'Largest Contentful Paint' },
              { name: 'FID', value: report.summary.fid, target: 100, label: 'First Input Delay' },
              { name: 'CLS', value: report.summary.cls, target: 0.1, label: 'Cumulative Layout Shift' },
              { name: 'FCP', value: report.summary.fcp, target: 1800, label: 'First Contentful Paint' },
              { name: 'TTFB', value: report.summary.ttfb, target: 800, label: 'Time to First Byte' },
              { name: 'INP', value: report.summary.inp, target: 200, label: 'Interaction to Next Paint' },
            ].map(metric => {
              if (metric.value === undefined) return null;

              const isGood = metric.name === 'CLS'
                ? metric.value < metric.target
                : metric.value < metric.target;
              const rating = isGood ? 'good' : metric.value < metric.target * 1.5 ? 'needs-improvement' : 'poor';

              return (
                <div key={metric.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{metric.name}</div>
                      <div className="text-xs text-muted-foreground">{metric.label}</div>
                    </div>
                    <Badge className={getRatingColor(rating)}>
                      {rating}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatMetricValue(metric.name, metric.value)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Target: {metric.name === 'CLS' ? metric.target : `${metric.target}ms`}
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getRatingColor(rating)}`}
                      style={{
                        width: `${Math.min(100, (metric.value / (metric.target * 2)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Performance Trends */}
        {trends.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
            <div className="space-y-2">
              {trends.map((trend, index) => {
                const previousScore = index > 0 ? trends[index - 1].score : trend.score;
                const change = trend.score - previousScore;
                const isImproving = change > 0;

                return (
                  <div key={trend.date} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-16 text-sm font-medium">{trend.date}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold">{trend.score}</span>
                          {index > 0 && (
                            <div className={`flex items-center gap-1 text-xs ${isImproving ? 'text-green-500' : 'text-red-500'}`}>
                              {isImproving ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {Math.abs(change).toFixed(1)}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{trend.metrics} metrics</div>
                      </div>
                    </div>
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getScoreColor(trend.score).replace('text-', 'bg-')}`}
                        style={{ width: `${trend.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Optimization Results */}
        {optimizationResults && (
          <Card className="p-6 border-primary">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Optimization Results
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setOptimizationResults(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Load Time</p>
                  <p className="text-2xl font-bold text-primary">
                    {optimizationResults.estimatedLoadTime}s
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lighthouse Score</p>
                  <p className="text-2xl font-bold text-primary">
                    {optimizationResults.lighthouseScore}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">
                  Applied Optimizations ({optimizationResults.optimizations?.length || 0})
                </p>
                <div className="space-y-1">
                  {optimizationResults.optimizations?.map((opt: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                      <span>{opt.description}</span>
                      <Badge variant={opt.impact === 'high' ? 'default' : 'secondary'}>
                        {opt.impact}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* All Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">All Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.metrics.map(metric => (
              <div key={metric.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{metric.name.toUpperCase()}</div>
                  <div className="text-sm text-muted-foreground">{formatMetricValue(metric.name, metric.value)}</div>
                </div>
                <Badge className={getRatingColor(metric.rating)}>
                  {metric.rating}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

