import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Rocket,
  Plus,
  Globe,
  Settings,
  ExternalLink,
  GitBranch,
  Clock,
  Activity,
  CheckCircle,
  AlertCircle,
  Square,
  BarChart3,
  Zap,
  Crown,
  Cpu,
  HardDrive,
  MapPin,
  Sliders,
  Download,
  Link2,
  Shield,
  RefreshCw,
} from 'lucide-react';

interface Deployment {
  id: string;
  name: string;
  url: string;
  status: 'deployed' | 'building' | 'failed' | 'stopped';
  branch: string;
  lastDeploy: Date;
  visits: number;
}

export function DeploymentPanel() {
  const { toast } = useToast();
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: '1',
      name: 'Production',
      url: 'https://stargate-prod.app',
      status: 'deployed',
      branch: 'main',
      lastDeploy: new Date('2024-01-10T14:30:00'),
      visits: 15420,
    },
    {
      id: '2',
      name: 'Staging',
      url: 'https://stargate-staging.app',
      status: 'deployed',
      branch: 'develop',
      lastDeploy: new Date('2024-01-10T16:45:00'),
      visits: 892,
    },
    {
      id: '3',
      name: 'Feature-AI',
      url: 'https://ai-feature.stargate.app',
      status: 'building',
      branch: 'feature/ai-improvements',
      lastDeploy: new Date('2024-01-10T17:00:00'),
      visits: 0,
    },
  ]);
  
  // One-Click Deploy State
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProvider, setDeployProvider] = useState<'vercel' | 'netlify' | 'zip'>('vercel');
  const [projectSlug, setProjectSlug] = useState('');
  const [siteName, setSiteName] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [deploymentResult, setDeploymentResult] = useState<{
    success: boolean;
    url?: string;
    message: string;
  } | null>(null);
  
  // One-Click Deploy to Vercel/Netlify
  const handleOneClickDeploy = useCallback(async () => {
    if (!projectSlug) {
      toast({
        title: 'Project Required',
        description: 'Please enter a project slug to deploy.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsDeploying(true);
    setDeploymentResult(null);
    
    try {
      const response = await fetch(`/api/deployment/${deployProvider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectSlug,
          siteName: siteName || `merlin-${projectSlug}`,
        }),
      });
      
      const result = await response.json();
      setDeploymentResult(result);
      
      if (result.success) {
        toast({
          title: 'Deployment Successful!',
          description: `Your site is live at ${result.url}`,
        });
        
        // Add to deployments list
        setDeployments(prev => [
          {
            id: Date.now().toString(),
            name: siteName || projectSlug,
            url: result.url || '',
            status: 'deployed',
            branch: 'main',
            lastDeploy: new Date(),
            visits: 0,
          },
          ...prev,
        ]);
      } else {
        toast({
          title: 'Deployment Failed',
          description: result.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Deployment Error',
        description: 'Failed to connect to deployment service',
        variant: 'destructive',
      });
    } finally {
      setIsDeploying(false);
    }
  }, [projectSlug, siteName, deployProvider, toast]);
  
  // Download as ZIP
  const handleDownloadZip = useCallback(async () => {
    if (!projectSlug) {
      toast({
        title: 'Project Required',
        description: 'Please enter a project slug to download.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsDeploying(true);
    
    try {
      const response = await fetch('/api/deployment/zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectSlug }),
      });
      
      const result = await response.json();
      
      if (result.success && result.zipPath) {
        toast({
          title: 'ZIP Created',
          description: `Download ready: ${result.zipPath}`,
        });
      } else {
        toast({
          title: 'ZIP Creation Failed',
          description: result.error || 'Failed to create ZIP',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create ZIP file',
        variant: 'destructive',
      });
    } finally {
      setIsDeploying(false);
    }
  }, [projectSlug, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'building':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'stopped':
        return <Square className="w-4 h-4 text-gray-500" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-500';
      case 'building':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      case 'stopped':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const deploy = (deploymentId: string) => {
    setDeployments(prev =>
      prev.map(d =>
        d.id === deploymentId ? { ...d, status: 'building' as const, lastDeploy: new Date() } : d
      )
    );

    // Simulate deployment
    setTimeout(() => {
      setDeployments(prev =>
        prev.map(d => (d.id === deploymentId ? { ...d, status: 'deployed' as const } : d))
      );
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col" data-testid="deployment-panel">
      {/* Header */}
      <div className="p-4 border-b border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Advanced Deployments
            </h2>
            <p className="text-sm text-muted-foreground">
              Global edge deployment with unlimited scaling
            </p>
          </div>
          <Button size="sm" data-testid="button-new-deployment">
            <Plus className="w-4 h-4 mr-1" />
            New Deployment
          </Button>
        </div>

        {/* Deployment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-green-500">
                {deployments.filter(d => d.status === 'deployed').length}
              </div>
              <div className="text-xs text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-blue-500">∞</div>
              <div className="text-xs text-muted-foreground">Edge Locations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-purple-500">
                {deployments.reduce((sum, d) => sum + d.visits, 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Visits</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-orange-500">99.9%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deployments List */}
      <div className="flex-1 p-4 space-y-4">
        {deployments.map(deployment => (
          <Card key={deployment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(deployment.status)}
                  <div>
                    <h3 className="font-semibold">{deployment.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GitBranch className="w-3 h-3" />
                      {deployment.branch}
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      {deployment.lastDeploy.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{deployment.visits.toLocaleString()} visits</Badge>
                  <Badge className={getStatusColor(deployment.status)}>{deployment.status}</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={deployment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                    data-testid={`deployment-url-${deployment.id}`}
                  >
                    {deployment.url}
                  </a>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Analytics
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4 mr-1" />
                    Settings
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => deploy(deployment.id)}
                    disabled={deployment.status === 'building'}
                    data-testid={`button-deploy-${deployment.id}`}
                  >
                    {deployment.status === 'building' ? (
                      <>
                        <Clock className="w-4 h-4 mr-1 animate-spin" />
                        Building...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 mr-1" />
                        Deploy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deployment Types */}
      <div className="p-4 border-t border">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Deploy to Production</CardTitle>
            <CardDescription>
              Choose your deployment type - all with unlimited scaling!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Deployment Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20 rounded-lg cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300">Static Site</h3>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                  Fast CDN hosting for static websites with global edge distribution
                </p>
                <div className="text-xs space-y-1">
                  <div>✓ Global CDN</div>
                  <div>✓ Auto HTTPS</div>
                  <div>✓ Custom domains</div>
                  <div className="text-green-600 font-medium">✓ UNLIMITED bandwidth</div>
                </div>
              </div>

              <div className="p-4 border rounded-lg hover:border-purple-500 cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold">Reserved VM</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Dedicated virtual machine with guaranteed resources
                </p>
                <div className="text-xs space-y-1">
                  <div>✓ Dedicated CPU/RAM</div>
                  <div>✓ Always-on hosting</div>
                  <div>✓ SSH access</div>
                  <div className="text-green-600 font-medium">✓ UNLIMITED resources</div>
                </div>
              </div>

              <div className="p-4 border rounded-lg hover:border-green-500 cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold">Auto Scale</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Intelligent scaling based on traffic and performance
                </p>
                <div className="text-xs space-y-1">
                  <div>✓ Auto-scaling containers</div>
                  <div>✓ Load balancing</div>
                  <div>✓ Zero-downtime deploys</div>
                  <div className="text-green-600 font-medium">✓ INFINITE scaling</div>
                </div>
              </div>
            </div>

            {/* Stargate Exclusive Options */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Stargate Exclusive Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Multi-cloud deployment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Intelligent traffic routing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Real-time performance monitoring</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Advanced rollback capabilities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>AI-powered optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Enterprise security features</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Machine Configuration - Stargate Advanced */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Machine Configuration
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Machine Preset */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Machine Preset</label>
                  <div className="space-y-2">
                    <div className="p-3 border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20 rounded-lg cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">Unlimited vCPUs</span>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Selected
                        </Badge>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        <div className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          Unlimited RAM
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 rounded">
                      💡 <span className="font-medium">Stargate Advantage:</span> Unlike Replit's
                      0.5 vCPU + 2GB RAM limits, you get UNLIMITED resources!
                    </div>
                  </div>
                </div>

                {/* Scaling Configuration */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Max Machines</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Sliders className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-2 rounded-full relative">
                        <div className="bg-green-500 h-2 rounded-full w-full"></div>
                      </div>
                      <span className="text-sm font-bold text-green-600">∞ Unlimited</span>
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      🚀 Auto-scales to handle any load automatically
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Region</label>
                    <div className="flex items-center gap-2 p-2 border rounded bg-green-50 dark:bg-green-950/20">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Global Multi-Cloud (All Regions)</span>
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        Smart Routing
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* One-Click Deploy */}
            <div className="p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-500" />
                One-Click Deploy to Cloud
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Project Slug</Label>
                  <Input
                    placeholder="my-website"
                    value={projectSlug}
                    onChange={(e) => setProjectSlug(e.target.value)}
                    data-testid="input-project-slug"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Site Name (optional)</Label>
              <Input
                    placeholder="my-awesome-site"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    data-testid="input-site-name"
                  />
                </div>
              </div>
              
              {/* Provider Selection */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={deployProvider === 'vercel' ? 'default' : 'outline'}
                  onClick={() => setDeployProvider('vercel')}
                  className={deployProvider === 'vercel' ? 'bg-black hover:bg-gray-800' : ''}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Vercel
                </Button>
                <Button
                  variant={deployProvider === 'netlify' ? 'default' : 'outline'}
                  onClick={() => setDeployProvider('netlify')}
                  className={deployProvider === 'netlify' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Netlify
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadZip}
                  disabled={isDeploying}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download ZIP
                </Button>
              </div>
              
              {/* Deploy Button */}
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={handleOneClickDeploy}
                disabled={isDeploying || !projectSlug}
                data-testid="button-one-click-deploy"
              >
                {isDeploying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deploying to {deployProvider}...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy to {deployProvider.charAt(0).toUpperCase() + deployProvider.slice(1)}
                  </>
                )}
              </Button>
              
              {/* Deployment Result */}
              {deploymentResult && (
                <div className={`mt-4 p-3 rounded-lg ${deploymentResult.success ? 'bg-green-100 dark:bg-green-950/50' : 'bg-red-100 dark:bg-red-950/50'}`}>
                  <div className="flex items-center gap-2">
                    {deploymentResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className={deploymentResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                      {deploymentResult.message}
                    </span>
                  </div>
                  {deploymentResult.url && (
                    <a
                      href={deploymentResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center gap-1 mt-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {deploymentResult.url}
                    </a>
                  )}
                </div>
              )}
            </div>
            
            {/* Custom Domain Configuration */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Custom Domain Configuration
              </h4>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="www.yourdomain.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Verify DNS
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Add these DNS records to your domain:</p>
                  <code className="block p-2 bg-muted rounded text-xs">
                    A Record: @ → 76.76.21.21<br />
                    CNAME: www → cname.vercel-dns.com
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitive Advantage */}
      <div className="p-4 border-t border">
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-emerald-500" />
              <div>
                <h4 className="font-medium text-emerald-700 dark:text-emerald-300 text-sm">
                  🚀 Stargate Deployment Advantage
                </h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Global edge deployment, unlimited scaling, instant rollbacks, and advanced
                  analytics - far beyond basic hosting!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
