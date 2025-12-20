import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, Crown, Zap, HardDrive, Cpu, Sparkles } from 'lucide-react';
import { BackButton } from './BackButton';

export function UsageScreen() {
  // Mock usage statistics
  const stats = {
    totalProjects: 12,
    activeProjects: 8,
    completedProjects: 4,
    totalUsage: 75, // percentage
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-y-auto" data-testid="usage-screen">
      <div className="w-full px-8 py-8">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-cyan-300 flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8" />
            Stargate Usage Analytics
          </h2>
          <p className="text-cyan-400">
            Monitor your resource usage, projects, and system performance
          </p>
        </div>

        {/* Summary Statistics Cards - Matching TemplateQA Design */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-cyan-900/30 border-cyan-500/50">
            <div className="text-2xl font-bold text-cyan-300">{stats.totalProjects}</div>
            <div className="text-sm text-cyan-400">Total Projects</div>
          </Card>
          <Card className="p-4 bg-green-900/30 border-green-500/50">
            <div className="text-2xl font-bold text-green-300">{stats.activeProjects}</div>
            <div className="text-sm text-green-400">✅ Active Projects</div>
          </Card>
          <Card className="p-4 bg-blue-900/30 border-blue-500/50">
            <div className="text-2xl font-bold text-blue-300">{stats.completedProjects}</div>
            <div className="text-sm text-blue-400">✅ Completed</div>
          </Card>
          <Card className="p-4 bg-yellow-900/30 border-yellow-500/50">
            <div className="text-2xl font-bold text-yellow-300">{stats.totalUsage}%</div>
            <div className="text-sm text-yellow-400">Total Usage</div>
          </Card>
        </div>

        {/* Stargate Unlimited Plan */}
        <Card className="mb-6 p-4 bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-500/50">
          <div className="flex items-center space-x-2 mb-3">
            <Crown className="w-6 h-6 text-yellow-400" />
            <CardTitle className="text-yellow-300">Stargate Unlimited Plan</CardTitle>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">∞</div>
              <div className="text-sm text-yellow-400">CPU Hours</div>
              <div className="text-xs text-yellow-500">No limits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">∞</div>
              <div className="text-sm text-yellow-400">Memory</div>
              <div className="text-xs text-yellow-500">Auto-scaling</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">∞</div>
              <div className="text-sm text-yellow-400">Storage</div>
              <div className="text-xs text-yellow-500">Unlimited</div>
            </div>
          </div>
        </Card>

        {/* Resource Usage Cards - Matching TemplateQA Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4 bg-purple-900/30 border-purple-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-purple-300">
                <Cpu className="w-5 h-5" />
                <span>CPU Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-purple-300">Current</span>
                  <span className="text-sm font-bold text-purple-200">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-purple-300">Peak (24h)</span>
                  <span className="text-sm font-bold text-purple-200">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="p-4 bg-blue-900/30 border-blue-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-blue-300">
                <Zap className="w-5 h-5" />
                <span>Memory Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-blue-300">Current</span>
                  <span className="text-sm font-bold text-blue-200">2.1 GB</span>
                </div>
                <Progress value={32} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-blue-300">Peak (24h)</span>
                  <span className="text-sm font-bold text-blue-200">4.8 GB</span>
                </div>
                <Progress value={73} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="p-4 bg-indigo-900/30 border-indigo-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-indigo-300">
                <HardDrive className="w-5 h-5" />
                <span>Storage Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-indigo-300">Projects</span>
                  <span className="text-sm font-bold text-indigo-200">1.2 GB</span>
                </div>
                <Progress value={24} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-indigo-300">Databases</span>
                  <span className="text-sm font-bold text-indigo-200">340 MB</span>
                </div>
                <Progress value={12} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="p-4 bg-emerald-900/30 border-emerald-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-300">AI Models Active</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-emerald-300">GPT-4 Turbo</span>
                <span className="text-xs bg-green-600/50 text-green-200 px-2 py-1 rounded border border-green-500/50">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-emerald-300">Claude-3 Sonnet</span>
                <span className="text-xs bg-green-600/50 text-green-200 px-2 py-1 rounded border border-green-500/50">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-emerald-300">Gemini Pro</span>
                <span className="text-xs bg-green-600/50 text-green-200 px-2 py-1 rounded border border-green-500/50">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-emerald-300">Mixtral 8x7B</span>
                <span className="text-xs bg-green-600/50 text-green-200 px-2 py-1 rounded border border-green-500/50">
                  Active
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
