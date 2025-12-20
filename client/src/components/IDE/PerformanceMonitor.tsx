import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  TrendingUp,
  Zap,
  Crown,
} from 'lucide-react';

interface ResourceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskIO: number;
  networkIO: number;
  activeContainers: number;
  executionTime: number;
  requestsPerSecond: number;
  errorRate: number;
}

interface ResourcePlan {
  id: string;
  name: string;
  maxCPU: number;
  maxMemory: number;
  maxStorage: number;
  maxBandwidth: number;
  maxConcurrentExecutions: number;
  autoScaling: boolean;
  priority: string;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<ResourceMetrics | null>(null);
  const [plans, setPlans] = useState<ResourcePlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<ResourcePlan | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    fetchMetrics();
    fetchPlans();
    fetchInsights();

    // DISABLED auto-refresh to prevent performance issues
    // Only fetch on mount - user can manually refresh if needed
    // const interval = setInterval(() => {
    //   fetchMetrics();
    // }, 10000); // Update every 10 seconds

    // return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/performance/metrics');
      const data = await response.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/performance/plans');
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
        // Assume first plan is current (demo)
        const unlimited = data.plans.find((p: ResourcePlan) => p.name === 'Unlimited');
        setCurrentPlan(unlimited || data.plans[0]);
        setIsUnlimited(unlimited?.name === 'Unlimited');
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/performance/insights/demo-project-1');
      const data = await response.json();
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    }
  };

  const enableUnlimitedMode = async () => {
    try {
      const response = await fetch('/api/performance/unlimited/demo-project-1', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setIsUnlimited(true);
        fetchPlans();
      }
    } catch (error) {
      console.error('Failed to enable unlimited mode:', error);
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'text-green-500';
    if (usage < 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const _getUsageBg = (usage: number) => {
    if (usage < 50) return 'bg-green-500';
    if (usage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!metrics) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6" data-testid="performance-monitor">
      {/* Header with Unlimited Mode */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Monitor
          </h2>
          <p className="text-sm text-muted-foreground">
            Real-time resource monitoring and optimization
          </p>
        </div>

        {!isUnlimited && (
          <Button
            onClick={enableUnlimitedMode}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            data-testid="button-unlimited-mode"
          >
            <Crown className="w-4 h-4 mr-2" />
            Enable Unlimited Mode
          </Button>
        )}

        {isUnlimited && (
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Crown className="w-3 h-3 mr-1" />
            Unlimited Mode Active
          </Badge>
        )}
      </div>

      {/* Current Plan */}
      {currentPlan && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {currentPlan.name === 'Unlimited' && <Crown className="w-5 h-5 text-purple-500" />}
              Current Plan: {currentPlan.name}
            </CardTitle>
            <CardDescription>
              {currentPlan.name === 'Unlimited'
                ? '🚀 No limits! Scale infinitely with intelligent auto-scaling'
                : `${currentPlan.maxCPU} CPU cores • ${currentPlan.maxMemory}GB RAM • ${currentPlan.maxStorage}GB storage`}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">CPU Usage</span>
              </div>
              <span className={`text-lg font-bold ${getUsageColor(metrics.cpuUsage)}`}>
                {metrics.cpuUsage.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.cpuUsage} className="mt-2" data-testid="cpu-usage-progress" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MemoryStick className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <span className={`text-lg font-bold ${getUsageColor(metrics.memoryUsage)}`}>
                {metrics.memoryUsage.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={metrics.memoryUsage}
              className="mt-2"
              data-testid="memory-usage-progress"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Disk I/O</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                {metrics.diskIO.toFixed(0)} MB/s
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Network</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                {metrics.networkIO.toFixed(0)} MB/s
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {insights.averageExecutionTime.toFixed(0)}ms
                </div>
                <div className="text-sm text-muted-foreground">Avg Execution Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {insights.reliability.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Reliability Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {insights.peakCPU.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Peak CPU Usage</div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">💡 Recommendations:</h4>
              <ul className="space-y-1">
                {insights.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitive Advantage Callout */}
      {isUnlimited && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-purple-500" />
              <div>
                <h3 className="font-semibold text-purple-700 dark:text-purple-300">
                  🚀 Stargate Advantage Active
                </h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Unlike Replit's limited resources or GitHub's expensive scaling, you now have
                  truly unlimited compute power with intelligent auto-scaling!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Active containers: {metrics.activeContainers}</span>
        <span>Requests/sec: {metrics.requestsPerSecond}</span>
        <span>Error rate: {metrics.errorRate.toFixed(1)}%</span>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
