/**
 * Email Analytics Component
 * Phase 2.3: Complete email analytics dashboard
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Mail, Eye, MousePointerClick, AlertCircle, TrendingUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EmailAnalyticsProps {
  websiteId: string;
}

interface CampaignMetrics {
  campaignId: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  lastUpdated: string;
}

interface AnalyticsSummary {
  totalCampaigns: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  averageOpenRate: number;
  averageClickRate: number;
}

export function EmailAnalytics({ websiteId }: EmailAnalyticsProps) {
  const [analytics, setAnalytics] = useState<{
    campaigns: CampaignMetrics[];
    summary: AnalyticsSummary;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    
    // Refresh analytics every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, [websiteId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/email-marketing/${websiteId}/analytics`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics({
          campaigns: data.campaigns || [],
          summary: data.summary || {
            totalCampaigns: 0,
            totalSent: 0,
            totalOpened: 0,
            totalClicked: 0,
            averageOpenRate: 0,
            averageClickRate: 0,
          },
        });
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Email Analytics</h3>
        <div className="text-center p-8 text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics || analytics.summary.totalCampaigns === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Email Analytics</h3>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No campaign data available yet.</p>
            <p className="text-sm mt-2">Send your first campaign to see analytics here.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary, campaigns } = analytics;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Email Analytics</h3>
        <p className="text-sm text-muted-foreground">
          Track performance of your email campaigns
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Sent</p>
                <p className="text-2xl font-bold">{summary.totalSent.toLocaleString()}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Opens</p>
                <p className="text-2xl font-bold">{summary.totalOpened.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Clicks</p>
                <p className="text-2xl font-bold">{summary.totalClicked.toLocaleString()}</p>
              </div>
              <MousePointerClick className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Open Rate</p>
                <p className="text-2xl font-bold">{summary.averageOpenRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign ID</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>Click Rate</TableHead>
                <TableHead>Bounced</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.campaignId}>
                  <TableCell className="font-mono text-xs">{campaign.campaignId}</TableCell>
                  <TableCell>{campaign.sent.toLocaleString()}</TableCell>
                  <TableCell>{campaign.opened.toLocaleString()}</TableCell>
                  <TableCell>{campaign.clicked.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={campaign.openRate >= 20 ? 'text-green-600 font-semibold' : ''}>
                      {campaign.openRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={campaign.clickRate >= 3 ? 'text-green-600 font-semibold' : ''}>
                      {campaign.clickRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {campaign.bounced > 0 && (
                      <span className="text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {campaign.bounced}
                      </span>
                    )}
                    {campaign.bounced === 0 && <span className="text-muted-foreground">0</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

