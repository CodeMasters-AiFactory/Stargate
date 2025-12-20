import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Folder,
  Zap,
  Crown,
  Brain,
  Activity,
  Star,
  GitBranch,
  Play,
} from 'lucide-react';

export function HomePanel() {
  return (
    <div className="p-6 space-y-6" data-testid="home-panel">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚀</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Welcome to Stargate IDE</h1>
        <p className="text-muted-foreground">
          The next-generation cloud development platform that surpasses all competitors
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">∞</div>
            <div className="text-sm text-muted-foreground">CPU Cores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">∞</div>
            <div className="text-sm text-muted-foreground">Memory (GB)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">4+</div>
            <div className="text-sm text-muted-foreground">AI Models</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">100%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Recent Projects
          </CardTitle>
          <CardDescription>Your most recently accessed projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                  <span className="text-sm">📱</span>
                </div>
                <div>
                  <div className="font-medium">Mobile E-commerce App</div>
                  <div className="text-sm text-muted-foreground">React Native • Updated 2h ago</div>
                </div>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                  <span className="text-sm">🌐</span>
                </div>
                <div>
                  <div className="font-medium">AI-Powered Dashboard</div>
                  <div className="text-sm text-muted-foreground">Next.js • Updated 1d ago</div>
                </div>
              </div>
              <Badge variant="outline">Ready</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded flex items-center justify-center">
                  <span className="text-sm">⚡</span>
                </div>
                <div>
                  <div className="font-medium">Microservices API</div>
                  <div className="text-sm text-muted-foreground">Node.js • Updated 3d ago</div>
                </div>
              </div>
              <Badge variant="outline">Deployed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stargate Advantages */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Crown className="w-5 h-5" />
            Stargate Advantages
          </CardTitle>
          <CardDescription>Why Stargate beats every competitor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium">Unlimited Resources</div>
                <div className="text-sm text-muted-foreground">vs Replit's 2GB limit</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">4+ AI Models</div>
                <div className="text-sm text-muted-foreground">vs GitHub's single Copilot</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="font-medium">Auto-Scaling</div>
                <div className="text-sm text-muted-foreground">vs manual resource management</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-purple-500" />
              <div>
                <div className="font-medium">Enterprise-Grade</div>
                <div className="text-sm text-muted-foreground">vs basic team features</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started quickly with these actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-16 flex-col gap-2">
              <Folder className="w-5 h-5" />
              Create Project
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <GitBranch className="w-5 h-5" />
              Import from Git
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Play className="w-5 h-5" />
              Try Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
