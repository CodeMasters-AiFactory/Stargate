/**
 * Analytics Dashboard Component
 * Real-time visitor tracking, conversion funnels, and performance metrics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Eye,
  TrendingUp,
  Clock,
  Globe,
} from 'lucide-react';

export interface AnalyticsData {
  visitors: {
    total: number;
    unique: number;
    returning: number;
    new: number;
  };
  pageViews: {
    total: number;
    average: number;
    topPages: Array<{ path: string; views: number }>;
  };
  traffic: {
    sources: Array<{ source: string; visitors: number; percentage: number }>;
    devices: Array<{ device: string; visitors: number; percentage: number }>;
    countries: Array<{ country: string; visitors: number; percentage: number }>;
  };
  conversions: {
    total: number;
    rate: number;
    funnel: Array<{ stage: string; visitors: number; dropoff: number }>;
  };
  performance: {
    averageLoadTime: number;
    bounceRate: number;
    sessionDuration: number;
  };
  timeSeries: Array<{ date: string; visitors: number; pageViews: number }>;
}

interface AnalyticsDashboardProps {
  websiteId?: string;
  timeRange?: '24h' | '7d' | '30d' | '90d';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function AnalyticsDashboard({ websiteId = 'default', timeRange = '7d' }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    // DISABLED: Real-time updates to prevent flickering and excessive API calls
    // Users can manually refresh if needed
    // const interval = setInterval(fetchAnalytics, 30000); // Update every 30 seconds
    // return () => clearInterval(interval);
  }, [websiteId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/${websiteId}?range=${timeRange}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      // Use mock data for development
      setData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.visitors.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.visitors.unique} unique, {data.visitors.returning} returning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pageViews.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.pageViews.average.toFixed(1)} avg per visitor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.conversions.rate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">{data.conversions.total} conversions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Load Time</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.performance.averageLoadTime}ms</div>
            <p className="text-xs text-muted-foreground">
              {data.performance.bounceRate.toFixed(1)}% bounce rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visitor Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="visitors" stroke="#3b82f6" name="Visitors" />
                  <Line type="monotone" dataKey="pageViews" stroke="#10b981" name="Page Views" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.pageViews.topPages.slice(0, 5).map((page, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm truncate flex-1">{page.path}</span>
                      <Badge variant="secondary">{page.views}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.traffic.devices}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, percentage }) => `${device} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="visitors"
                    >
                      {data.traffic.devices.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Traffic Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.traffic.sources}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="visitors" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.traffic.countries.slice(0, 10).map((country, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm">{country.country}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${country.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {country.visitors}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.conversions.funnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="visitors" fill="#10b981" name="Visitors" />
                  <Bar dataKey="dropoff" fill="#ef4444" name="Dropoff" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Load Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.performance.averageLoadTime}ms</div>
                <p className="text-xs text-muted-foreground mt-1">Average page load</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Bounce Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.performance.bounceRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Single page sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Session Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor(data.performance.sessionDuration / 60)}m{' '}
                  {Math.floor(data.performance.sessionDuration % 60)}s
                </div>
                <p className="text-xs text-muted-foreground mt-1">Average session</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Mock data generator for development
function generateMockData(): AnalyticsData {
  const now = new Date();
  const timeSeries = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visitors: Math.floor(Math.random() * 500) + 100,
      pageViews: Math.floor(Math.random() * 2000) + 500,
    };
  });

  return {
    visitors: {
      total: 3420,
      unique: 2890,
      returning: 530,
      new: 2360,
    },
    pageViews: {
      total: 12450,
      average: 3.6,
      topPages: [
        { path: '/', views: 3420 },
        { path: '/about', views: 1890 },
        { path: '/products', views: 1560 },
        { path: '/contact', views: 890 },
        { path: '/blog', views: 670 },
      ],
    },
    traffic: {
      sources: [
        { source: 'Organic Search', visitors: 1420, percentage: 41.5 },
        { source: 'Direct', visitors: 980, percentage: 28.7 },
        { source: 'Social Media', visitors: 670, percentage: 19.6 },
        { source: 'Referral', visitors: 350, percentage: 10.2 },
      ],
      devices: [
        { device: 'Desktop', visitors: 1890, percentage: 55.3 },
        { device: 'Mobile', visitors: 1230, percentage: 36.0 },
        { device: 'Tablet', visitors: 300, percentage: 8.7 },
      ],
      countries: [
        { country: 'United States', visitors: 1890, percentage: 55.3 },
        { country: 'United Kingdom', visitors: 450, percentage: 13.2 },
        { country: 'Canada', visitors: 320, percentage: 9.4 },
        { country: 'Australia', visitors: 280, percentage: 8.2 },
        { country: 'Germany', visitors: 200, percentage: 5.8 },
      ],
    },
    conversions: {
      total: 142,
      rate: 4.15,
      funnel: [
        { stage: 'Visitors', visitors: 3420, dropoff: 0 },
        { stage: 'Page View', visitors: 2890, dropoff: 530 },
        { stage: 'Product View', visitors: 1890, dropoff: 1000 },
        { stage: 'Add to Cart', visitors: 670, dropoff: 1220 },
        { stage: 'Checkout', visitors: 320, dropoff: 350 },
        { stage: 'Purchase', visitors: 142, dropoff: 178 },
      ],
    },
    performance: {
      averageLoadTime: 1240,
      bounceRate: 32.5,
      sessionDuration: 185,
    },
    timeSeries,
  };
}
