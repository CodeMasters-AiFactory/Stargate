import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

export interface ResourceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskIO: number;
  networkIO: number;
  activeContainers: number;
  executionTime: number;
  requestsPerSecond: number;
  errorRate: number;
}

export interface ResourcePlan {
  id: string;
  name: string;
  maxCPU: number; // in cores
  maxMemory: number; // in GB
  maxStorage: number; // in GB
  maxBandwidth: number; // in Mbps
  maxConcurrentExecutions: number;
  autoScaling: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ScalingRule {
  metricType: keyof ResourceMetrics;
  threshold: number;
  scaleDirection: 'up' | 'down';
  cooldownPeriod: number; // in seconds
  scaleFactor: number;
}

class AdvancedResourceManager extends EventEmitter {
  private currentMetrics: ResourceMetrics;
  private resourcePlans: Map<string, ResourcePlan> = new Map();
  private projectResources: Map<string, string> = new Map(); // projectId -> planId
  private scalingRules: ScalingRule[] = [];
  private metricsHistory: ResourceMetrics[] = [];
  private readonly maxHistorySize = 1000;

  // Stargate's superior resource plans - NO artificial limits!
  private readonly defaultPlans: ResourcePlan[] = [
    {
      id: 'developer',
      name: 'Developer',
      maxCPU: 4,
      maxMemory: 8,
      maxStorage: 50,
      maxBandwidth: 100,
      maxConcurrentExecutions: 10,
      autoScaling: true,
      priority: 'medium'
    },
    {
      id: 'professional',
      name: 'Professional',
      maxCPU: 8,
      maxMemory: 16,
      maxStorage: 200,
      maxBandwidth: 500,
      maxConcurrentExecutions: 25,
      autoScaling: true,
      priority: 'high'
    },
    {
      id: 'unlimited',
      name: 'Unlimited', // Stargate's killer feature!
      maxCPU: -1, // No limits
      maxMemory: -1,
      maxStorage: -1,
      maxBandwidth: -1,
      maxConcurrentExecutions: -1,
      autoScaling: true,
      priority: 'critical'
    }
  ];

  constructor() {
    super();
    this.initializeResourceManager();
    this.currentMetrics = this.getInitialMetrics();
    this.startMonitoring();
  }

  private initializeResourceManager() {
    // Initialize default plans
    this.defaultPlans.forEach(plan => {
      this.resourcePlans.set(plan.id, plan);
    });

    // Setup intelligent scaling rules
    this.scalingRules = [
      {
        metricType: 'cpuUsage',
        threshold: 80,
        scaleDirection: 'up',
        cooldownPeriod: 300,
        scaleFactor: 1.5
      },
      {
        metricType: 'memoryUsage', 
        threshold: 85,
        scaleDirection: 'up',
        cooldownPeriod: 300,
        scaleFactor: 1.3
      },
      {
        metricType: 'requestsPerSecond',
        threshold: 100,
        scaleDirection: 'up',
        cooldownPeriod: 180,
        scaleFactor: 2.0
      },
      {
        metricType: 'errorRate',
        threshold: 5, // 5% error rate
        scaleDirection: 'up',
        cooldownPeriod: 120,
        scaleFactor: 1.8
      }
    ];

    console.log('⚡ Advanced Resource Manager initialized with unlimited scaling');
  }

  private getInitialMetrics(): ResourceMetrics {
    return {
      cpuUsage: 0,
      memoryUsage: 0,
      diskIO: 0,
      networkIO: 0,
      activeContainers: 0,
      executionTime: 0,
      requestsPerSecond: 0,
      errorRate: 0
    };
  }

  private startMonitoring() {
    // Monitoring disabled to prevent console spam
    // Real-time metrics collection every 10 seconds
    // setInterval(() => {
    //   this.collectMetrics();
    //   this.analyzeAndScale();
    // }, 10000);

    // Historical data cleanup every hour
    // setInterval(() => {
    //   this.cleanupHistory();
    // }, 3600000);
    
    console.log('📊 Resource monitoring initialized (collection disabled in development)');
  }

  private async collectMetrics() {
    const startTime = performance.now();

    try {
      // Collect system metrics (in production, this would use OS APIs)
      const metrics: ResourceMetrics = {
        cpuUsage: this.getCPUUsage(),
        memoryUsage: this.getMemoryUsage(),
        diskIO: this.getDiskIO(),
        networkIO: this.getNetworkIO(),
        activeContainers: this.getActiveContainers(),
        executionTime: performance.now() - startTime,
        requestsPerSecond: this.getRequestsPerSecond(),
        errorRate: this.getErrorRate()
      };

      this.currentMetrics = metrics;
      this.metricsHistory.push({ ...metrics });
      
      // Emit metrics for real-time monitoring
      this.emit('metrics', metrics);

    } catch (error) {
      console.error('Failed to collect metrics:', error);
    }
  }

  private getCPUUsage(): number {
    // Simulate CPU monitoring (in production: use os.loadavg())
    return Math.random() * 100;
  }

  private getMemoryUsage(): number {
    // Simulate memory monitoring (in production: use process.memoryUsage())
    return Math.random() * 100;
  }

  private getDiskIO(): number {
    return Math.random() * 1000; // MB/s
  }

  private getNetworkIO(): number {
    return Math.random() * 500; // MB/s
  }

  private getActiveContainers(): number {
    return Math.floor(Math.random() * 20);
  }

  private getRequestsPerSecond(): number {
    return Math.floor(Math.random() * 200);
  }

  private getErrorRate(): number {
    return Math.random() * 10; // Percentage
  }

  private analyzeAndScale() {
    for (const rule of this.scalingRules) {
      const currentValue = this.currentMetrics[rule.metricType];
      
      if (currentValue > rule.threshold && rule.scaleDirection === 'up') {
        this.triggerScaling(rule);
      }
    }
  }

  private triggerScaling(rule: ScalingRule) {
    console.log(`🚀 Auto-scaling triggered: ${rule.metricType} (${this.currentMetrics[rule.metricType]}) > ${rule.threshold}`);
    
    this.emit('scaling', {
      rule,
      currentMetrics: this.currentMetrics,
      scaleFactor: rule.scaleFactor,
      timestamp: new Date()
    });
  }

  // Public API methods
  async assignResourcePlan(projectId: string, planId: string): Promise<boolean> {
    const plan = this.resourcePlans.get(planId);
    if (!plan) {
      throw new Error(`Resource plan ${planId} not found`);
    }

    this.projectResources.set(projectId, planId);
    
    console.log(`📊 Project ${projectId} assigned to ${plan.name} plan`);
    return true;
  }

  getProjectResourcePlan(projectId: string): ResourcePlan | null {
    const planId = this.projectResources.get(projectId);
    return planId ? this.resourcePlans.get(planId) || null : null;
  }

  getCurrentMetrics(): ResourceMetrics {
    return { ...this.currentMetrics };
  }

  getMetricsHistory(limit: number = 100): ResourceMetrics[] {
    return this.metricsHistory.slice(-limit);
  }

  getPerformanceInsights(projectId: string): {
    averageExecutionTime: number;
    peakCPU: number;
    peakMemory: number;
    reliability: number;
    recommendations: string[];
  } {
    const recent = this.metricsHistory.slice(-50);
    
    return {
      averageExecutionTime: recent.reduce((sum, m) => sum + m.executionTime, 0) / recent.length,
      peakCPU: Math.max(...recent.map(m => m.cpuUsage)),
      peakMemory: Math.max(...recent.map(m => m.memoryUsage)),
      reliability: 100 - (recent.reduce((sum, m) => sum + m.errorRate, 0) / recent.length),
      recommendations: this.generateRecommendations(recent)
    };
  }

  private generateRecommendations(metrics: ResourceMetrics[]): string[] {
    const recommendations: string[] = [];
    const avg = metrics.reduce((acc, m) => ({
      cpu: acc.cpu + m.cpuUsage,
      memory: acc.memory + m.memoryUsage,
      errors: acc.errors + m.errorRate
    }), { cpu: 0, memory: 0, errors: 0 });

    avg.cpu /= metrics.length;
    avg.memory /= metrics.length;
    avg.errors /= metrics.length;

    if (avg.cpu > 70) {
      recommendations.push('Consider upgrading to higher CPU allocation for better performance');
    }

    if (avg.memory > 75) {
      recommendations.push('Memory usage is high - optimize your application or upgrade plan');
    }

    if (avg.errors > 3) {
      recommendations.push('Error rate is elevated - review recent deployments and logs');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your application is performing optimally! 🚀');
    }

    return recommendations;
  }

  private cleanupHistory() {
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.splice(0, this.metricsHistory.length - this.maxHistorySize);
    }
  }

  // Stargate's unique unlimited scaling feature
  enableUnlimitedMode(projectId: string): Promise<boolean> {
    return this.assignResourcePlan(projectId, 'unlimited');
  }

  getAvailablePlans(): ResourcePlan[] {
    return Array.from(this.resourcePlans.values());
  }
}

export const resourceManager = new AdvancedResourceManager();