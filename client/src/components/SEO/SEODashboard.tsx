/**
 * SEO Dashboard
 * Automatic SEO optimization with schema, sitemap, and meta tags
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Sparkles, Download } from 'lucide-react';
import { toast } from 'sonner';

export interface SEOOptimization {
  html: string;
  sitemap: string;
  robotsTxt: string;
  schema: Record<string, unknown>;
  metaTags: {
    title: string;
    description: string;
    keywords: string;
    openGraph: Record<string, string>;
    twitter: Record<string, string>;
  };
  improvements: Array<{
    type: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  seoScore: number;
}

export interface SEODashboardProps {
  websiteId?: string;
  currentHtml?: string;
  clientInfo?: {
    businessName: string;
    industry: string;
    location: { city: string; state: string; country: string };
    services: Array<{ name: string; description: string }>;
    phone: string;
    email: string;
    address: string;
    websiteUrl?: string;
  };
  onOptimized?: (optimization: SEOOptimization) => void;
}

export function SEODashboard({
  websiteId,
  currentHtml,
  clientInfo,
  onOptimized,
}: SEODashboardProps) {
  const [optimization, setOptimization] = useState<SEOOptimization | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async (): Promise<void> => {
    if (!currentHtml || !clientInfo) {
      toast.error('Website content and client information are required');
      return;
    }

    setIsOptimizing(true);
    try {
      const response = await fetch('/api/seo-automation/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: currentHtml,
          clientInfo,
          pages: [], // Would be fetched from website structure
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOptimization(data);
        toast.success(`SEO optimized! Score: ${data.seoScore}/100`);
        if (onOptimized) {
          onOptimized(data);
        }
      } else {
        toast.error(data.error || 'Failed to optimize SEO');
      }
    } catch (_error: unknown) {
      console.error('Failed to optimize SEO:', _error);
      toast.error('Failed to optimize SEO');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDownloadSitemap = (): void => {
    if (!optimization) return;
    const blob = new Blob([optimization.sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadRobots = (): void => {
    if (!optimization) return;
    const blob = new Blob([optimization.robotsTxt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getImpactColor = (impact: 'high' | 'medium' | 'low'): string => {
    switch (impact) {
      case 'high':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SEO Automation</h2>
          <p className="text-muted-foreground">
            Automatic schema markup, sitemap, robots.txt, and meta tag generation
          </p>
        </div>
        <Button
          onClick={handleOptimize}
          disabled={isOptimizing || !currentHtml || !clientInfo}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {isOptimizing ? 'Optimizing...' : 'Auto-Optimize SEO'}
        </Button>
      </div>

      {/* SEO Score */}
      {optimization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>SEO Score</span>
              <Badge
                variant={optimization.seoScore >= 80 ? 'default' : optimization.seoScore >= 60 ? 'secondary' : 'destructive'}
                className="text-lg px-3 py-1"
              >
                {optimization.seoScore}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  optimization.seoScore >= 80 ? 'bg-green-500' :
                  optimization.seoScore >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${optimization.seoScore}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Results */}
      {optimization && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="meta">Meta Tags</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
            <TabsTrigger value="robots">Robots.txt</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Improvements Applied</CardTitle>
                <CardDescription>
                  {optimization.improvements.length} SEO improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {optimization.improvements.map((improvement, _index) => (
                    <div key={_index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getImpactColor(improvement.impact)}`} />
                        <div>
                          <p className="font-medium">{improvement.type}</p>
                          <p className="text-sm text-muted-foreground">{improvement.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {improvement.impact}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meta" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meta Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                    {optimization.metaTags.title}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                    {optimization.metaTags.description}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Keywords</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                    {optimization.metaTags.keywords}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Open Graph</Label>
                  <div className="space-y-1 mt-1">
                    {Object.entries(optimization.metaTags.openGraph).map(([key, value]) => (
                      <div key={key} className="text-xs font-mono bg-muted p-2 rounded">
                        <span className="font-semibold">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Twitter Card</Label>
                  <div className="space-y-1 mt-1">
                    {Object.entries(optimization.metaTags.twitter).map(([key, value]) => (
                      <div key={key} className="text-xs font-mono bg-muted p-2 rounded">
                        <span className="font-semibold">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schema" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Schema Markup (JSON-LD)</CardTitle>
                <CardDescription>
                  Structured data for search engines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <pre className="text-xs font-mono bg-muted p-4 rounded overflow-auto">
                    {JSON.stringify(optimization.schema, null, 2)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sitemap" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Sitemap.xml</CardTitle>
                    <CardDescription>
                      XML sitemap for search engines
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDownloadSitemap}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <pre className="text-xs font-mono bg-muted p-4 rounded overflow-auto">
                    {optimization.sitemap}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="robots" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Robots.txt</CardTitle>
                    <CardDescription>
                      Search engine crawler instructions
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDownloadRobots}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <pre className="text-xs font-mono bg-muted p-4 rounded overflow-auto">
                    {optimization.robotsTxt}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* No Optimization */}
      {!optimization && (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No SEO optimization yet</p>
            <p className="text-sm text-muted-foreground">
              Click "Auto-Optimize SEO" to generate schema markup, sitemap, and meta tags
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

