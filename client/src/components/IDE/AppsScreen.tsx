import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderPlus, MoreHorizontal, FolderOpen, Lock, Settings } from 'lucide-react';
import { useIDE } from '@/hooks/use-ide';
import { BackButton } from './BackButton';

export function AppsScreen() {
  const { setState } = useIDE();
  const [filter, setFilter] = useState('all');

  const apps = [
    {
      id: '1',
      name: 'StargatePortal',
      lastModified: '13 hours ago',
      status: 'Private',
      isDeployed: false,
    },
    {
      id: '2',
      name: 'ApiConnect',
      lastModified: '4 weeks ago',
      status: 'Private',
      isDeployed: true,
    },
    {
      id: '3',
      name: 'MTFACTORY',
      lastModified: '4 weeks ago',
      status: 'Private',
      isDeployed: true,
    },
    {
      id: '4',
      name: 'Genesis Church Authentication',
      lastModified: '3 months ago',
      status: 'Private',
      isDeployed: true,
    },
    {
      id: '5',
      name: 'CodeMasters',
      lastModified: '3 months ago',
      status: 'Private',
      isDeployed: true,
    },
    {
      id: '6',
      name: 'CrystalReid',
      lastModified: '4 months ago',
      status: 'Private',
      isDeployed: true,
    },
    {
      id: '7',
      name: 'E-Commerce Platform',
      lastModified: '1 week ago',
      status: 'Private',
      isDeployed: true,
    },
    {
      id: '8',
      name: 'Chat Application',
      lastModified: '2 days ago',
      status: 'Public',
      isDeployed: false,
    },
    {
      id: '9',
      name: 'Portfolio Website',
      lastModified: '5 days ago',
      status: 'Public',
      isDeployed: true,
    },
    {
      id: '10',
      name: 'Task Manager',
      lastModified: '1 month ago',
      status: 'Private',
      isDeployed: false,
    },
    {
      id: '11',
      name: 'Weather Dashboard',
      lastModified: '3 weeks ago',
      status: 'Public',
      isDeployed: true,
    },
    {
      id: '12',
      name: 'Blog System',
      lastModified: '2 months ago',
      status: 'Private',
      isDeployed: true,
    },
    {
      id: '13',
      name: 'Social Media App',
      lastModified: '6 days ago',
      status: 'Private',
      isDeployed: false,
    },
    {
      id: '14',
      name: 'Recipe Finder',
      lastModified: '1 week ago',
      status: 'Public',
      isDeployed: true,
    },
    {
      id: '15',
      name: 'Music Player',
      lastModified: '10 days ago',
      status: 'Private',
      isDeployed: false,
    },
    {
      id: '16',
      name: 'File Manager',
      lastModified: '2 weeks ago',
      status: 'Private',
      isDeployed: true,
    },
    {
      id: '17',
      name: 'Calculator App',
      lastModified: '1 month ago',
      status: 'Public',
      isDeployed: true,
    },
    {
      id: '18',
      name: 'Game Engine',
      lastModified: '3 days ago',
      status: 'Private',
      isDeployed: false,
    },
  ];

  const openApp = (_appName: string) => {
    // Switch to file explorer view when opening an app
    setState(prev => ({ ...prev, currentView: 'explorer' }));
  };

  return (
    <div className="h-full bg-background flex flex-col" data-testid="apps-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border">
        <div className="flex items-center gap-4">
          <BackButton />
          <FolderOpen className="w-6 h-6" />
          <h1 className="text-2xl font-semibold">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Stargate
            </span>{' '}
            Apps
          </h1>
        </div>
        <Button className="bg-primary hover:bg-primary/90" data-testid="button-create">
          Create
        </Button>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-20 bg-transparent border-none p-0 h-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="deployed">Deployed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              data-testid="button-new-folder"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New folder
            </Button>

            <div className="text-sm text-muted-foreground">Shared with me</div>

            <Button variant="ghost" size="sm" data-testid="button-settings">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Apps List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-4">
          {apps.map(app => (
            <div
              key={app.id}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 cursor-pointer group"
              onClick={() => openApp(app.name)}
              data-testid={`app-item-${app.id}`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-sm">{app.name}</h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-muted-foreground">{app.lastModified}</span>

                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>{app.status}</span>
                      </Badge>

                      {app.isDeployed && (
                        <Badge variant="outline" className="text-xs">
                          Deployed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid={`button-app-menu-${app.id}`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
