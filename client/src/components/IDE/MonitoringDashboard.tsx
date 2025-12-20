import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Cpu,
  HardDrive,
  Globe,
  DollarSign,
  BarChart3,
  Monitor,
  Server,
  Database,
  RefreshCw,
  Bell,
  Settings,
  Eye,
  Download,
  X,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    inbound: number;
    outbound: number;
  };
  uptime: number;
  requestsPerSecond: number;
  errorRate: number;
  responseTime: number;
}

interface DeploymentMetric {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'deploying';
  url: string;
  metrics: {
    requests: number;
    errors: number;
    responseTime: number;
    uptime: number;
    memory: number;
    cpu: number;
  };
  cost: number;
  lastUpdated: string;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export function MonitoringDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'deployments' | 'performance' | 'alerts'>(
    'overview'
  );
  const [timeRange, setTimeRange] = useState('1h');

  // System metrics query - DISABLED AUTO-REFRESH to prevent performance issues
  // Only fetch when component is visible or manually refreshed
  const { data: systemMetrics } = useQuery({
    queryKey: ['/api/monitoring/system'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/monitoring/system');
      return response as unknown as SystemMetrics;
    },
    refetchInterval: false, // DISABLED - was causing performance issues
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Deployments monitoring query - DISABLED AUTO-REFRESH
  const { data: deploymentMetrics } = useQuery({
    queryKey: ['/api/monitoring/deployments'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/monitoring/deployments');
      return response as unknown as DeploymentMetric[];
    },
    refetchInterval: false, // DISABLED - was causing performance issues
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Alerts query - DISABLED AUTO-REFRESH
  const { data: alerts } = useQuery({
    queryKey: ['/api/monitoring/alerts'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/monitoring/alerts');
      return response as unknown as Alert[];
    },
    refetchInterval: false, // DISABLED - was causing performance issues
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      running: 'default',
      error: 'destructive',
      deploying: 'secondary',
      stopped: 'outline',
    };
    return variants[status as keyof typeof variants] || 'outline';
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getHealthScore = (metrics: SystemMetrics | undefined) => {
    if (!metrics) return 0;

    const cpuScore = Math.max(0, 100 - metrics.cpu);
    const memoryScore = Math.max(0, 100 - metrics.memory);
    const errorScore = Math.max(0, 100 - metrics.errorRate * 10);

    return Math.round((cpuScore + memoryScore + errorScore) / 3);
  };

  const healthScore = getHealthScore(systemMetrics);
  const totalCost = deploymentMetrics?.reduce((sum, dep) => sum + dep.cost, 0) || 0;
  const activeAlerts = alerts?.filter(a => !a.resolved).length || 0;

  return (
    <div className="h-full bg-background overflow-y-auto" data-testid="monitoring-dashboard">
      <div className="w-full px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Activity className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Monitoring Dashboard
              </span>
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
              Real-time
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="bg-background border rounded px-3 py-2"
              data-testid="select-time-range"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            <Button size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">System Health</p>
                  <p className="text-3xl font-bold text-green-700">{healthScore}%</p>
                  <p className="text-green-500 text-xs flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2% from yesterday
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Active Deployments</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {deploymentMetrics?.filter(d => d.status === 'running').length || 0}
                  </p>
                  <p className="text-blue-500 text-xs flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />2 deployed today
                  </p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full">
                  <Server className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Monthly Cost</p>
                  <p className="text-3xl font-bold text-purple-700">${totalCost.toFixed(2)}</p>
                  <p className="text-purple-500 text-xs flex items-center mt-1">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -12% vs last month
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-full">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`bg-gradient-to-br ${activeAlerts > 0 ? 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200' : 'from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 border-gray-200'}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${activeAlerts > 0 ? 'text-red-600' : 'text-gray-600'}`}
                  >
                    Active Alerts
                  </p>
                  <p
                    className={`text-3xl font-bold ${activeAlerts > 0 ? 'text-red-700' : 'text-gray-700'}`}
                  >
                    {activeAlerts}
                  </p>
                  <p
                    className={`text-xs flex items-center mt-1 ${activeAlerts > 0 ? 'text-red-500' : 'text-gray-500'}`}
                  >
                    {activeAlerts > 0 ? (
                      <>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Needs attention
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        All clear
                      </>
                    )}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-full ${activeAlerts > 0 ? 'bg-red-500' : 'bg-gray-500'}`}
                >
                  <Bell className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: Monitor },
            { id: 'deployments', label: 'Deployments', icon: Server },
            { id: 'performance', label: 'Performance', icon: BarChart3 },
            { id: 'alerts', label: 'Alerts', icon: Bell },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center space-x-2"
                data-testid={`button-tab-${tab.id}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* System Resources */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Cpu className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">CPU Usage</span>
                          </div>
                          <span className="text-sm font-semibold">
                            {systemMetrics?.cpu.toFixed(1) || 0}%
                          </span>
                        </div>
                        <Progress value={systemMetrics?.cpu || 0} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <HardDrive className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium">Memory Usage</span>
                          </div>
                          <span className="text-sm font-semibold">
                            {systemMetrics?.memory.toFixed(1) || 0}%
                          </span>
                        </div>
                        <Progress value={systemMetrics?.memory || 0} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Database className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium">Disk Usage</span>
                          </div>
                          <span className="text-sm font-semibold">
                            {systemMetrics?.disk.toFixed(1) || 0}%
                          </span>
                        </div>
                        <Progress value={systemMetrics?.disk || 0} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Globe className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium">Network I/O</span>
                          </div>
                          <span className="text-sm font-semibold">
                            ↑{systemMetrics?.network?.outbound.toFixed(1) || 0} MB/s
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ↓{systemMetrics?.network?.inbound.toFixed(1) || 0} MB/s inbound
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-blue-600">
                          {systemMetrics?.requestsPerSecond.toFixed(0) || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Requests/sec</div>
                        <div className="flex items-center justify-center text-xs text-green-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +5.2%
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-green-600">
                          {systemMetrics?.responseTime.toFixed(0) || 0}ms
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Response</div>
                        <div className="flex items-center justify-center text-xs text-green-600">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          -12ms
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-red-600">
                          {systemMetrics?.errorRate.toFixed(2) || 0}%
                        </div>
                        <div className="text-sm text-muted-foreground">Error Rate</div>
                        <div className="flex items-center justify-center text-xs text-red-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +0.1%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'deployments' && (
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deploymentMetrics?.map(deployment => (
                      <div key={deployment.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${deployment.status === 'running' ? 'bg-green-500' : deployment.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}
                            />
                            <div>
                              <p className="font-semibold">{deployment.name}</p>
                              <p className="text-sm text-muted-foreground">{deployment.url}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={getStatusBadge(deployment.status) as any}>
                              {deployment.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              ${deployment.cost.toFixed(2)}/mo
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-center text-sm">
                          <div>
                            <div className="font-semibold text-blue-600">
                              {deployment.metrics.requests}
                            </div>
                            <div className="text-muted-foreground">Requests</div>
                          </div>
                          <div>
                            <div className="font-semibold text-red-600">
                              {deployment.metrics.errors}
                            </div>
                            <div className="text-muted-foreground">Errors</div>
                          </div>
                          <div>
                            <div className="font-semibold text-green-600">
                              {deployment.metrics.responseTime}ms
                            </div>
                            <div className="text-muted-foreground">Response</div>
                          </div>
                          <div>
                            <div className="font-semibold text-purple-600">
                              {formatUptime(deployment.metrics.uptime)}
                            </div>
                            <div className="text-muted-foreground">Uptime</div>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <p className="text-center text-muted-foreground py-8">No deployments found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'alerts' && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alerts
                      ?.filter(alert => !alert.resolved)
                      .map(alert => (
                        <div
                          key={alert.id}
                          className={`p-4 border-l-4 rounded ${
                            alert.type === 'error'
                              ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                              : alert.type === 'warning'
                                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                                : 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                {alert.type === 'error' && (
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                )}
                                {alert.type === 'warning' && (
                                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                )}
                                {alert.type === 'info' && (
                                  <CheckCircle className="w-4 h-4 text-blue-500" />
                                )}
                                <span className="font-semibold">{alert.title}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                              <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                            </div>
                            <Button size="sm" variant="outline">
                              Resolve
                            </Button>
                          </div>
                        </div>
                      )) || (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <p className="text-muted-foreground">No active alerts</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      healthScore >= 90
                        ? 'bg-green-100 text-green-800'
                        : healthScore >= 70
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {healthScore >= 90 ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Healthy
                      </>
                    ) : healthScore >= 70 ? (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Warning
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Critical
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uptime:</span>
                    <span className="font-semibold">
                      {formatUptime(systemMetrics?.uptime || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Check:</span>
                    <span className="font-semibold">Just now</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  View Logs
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Alerts
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Metrics
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Force Refresh
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Deployment completed</span>
                    <span className="text-muted-foreground text-xs ml-auto">2m ago</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Auto-scaling triggered</span>
                    <span className="text-muted-foreground text-xs ml-auto">5m ago</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span>High CPU usage detected</span>
                    <span className="text-muted-foreground text-xs ml-auto">12m ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
