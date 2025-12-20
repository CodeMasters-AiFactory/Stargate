import React from 'react';
import { Button } from '@/components/ui/button';
import { useIDEContext } from '@/components/providers/IDEProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { ChevronRight, Plus, Sun, Moon, Home, Eye, Terminal, Database, Rocket } from 'lucide-react';

interface TopBarProps {
  activeTopPanel?: string;
  onTopPanelChange?: (panel: string) => void;
}

export function TopBar({ activeTopPanel = 'code', onTopPanelChange }: TopBarProps) {
  const { state, collaborationUsers, isCollaborationConnected } = useIDEContext();
  const { theme, toggleTheme } = useTheme();

  const topNavItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'preview', icon: Eye, label: 'Preview' },
    { id: 'console', icon: Terminal, label: 'Console' },
    { id: 'database', icon: Database, label: 'Database' },
    { id: 'deployments', icon: Rocket, label: 'Deployments' },
  ];

  const getBreadcrumbs = () => {
    if (!state.currentProject) return [];

    const activeTab = state.openTabs.find(tab => tab.id === state.activeTabId);
    if (!activeTab) return [state.currentProject.name];

    const pathParts = activeTab.path.split('/');
    return [state.currentProject.name, ...pathParts];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="h-12 bg-card border-b border flex items-center px-4">
      <div className="flex items-center space-x-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-3 h-3" />}
              <span className={index === breadcrumbs.length - 1 ? 'text-foreground' : ''}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex items-center space-x-1 ml-8">
        {topNavItems.map(item => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            className={`h-8 px-3 text-xs ${
              activeTopPanel === item.id
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => onTopPanelChange?.(item.id)}
            data-testid={`top-nav-${item.id}`}
          >
            <item.icon className="w-3 h-3 mr-1" />
            {item.label}
          </Button>
        ))}
      </div>

      <div className="ml-auto flex items-center space-x-3">
        {/* Collaboration Avatars */}
        <div className="flex items-center space-x-1">
          {collaborationUsers.slice(0, 3).map((user, _index) => (
            <div
              key={user.id}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium"
              style={{ backgroundColor: user.color }}
              title={user.username}
              data-testid={`avatar-${user.id}`}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
          ))}
          {collaborationUsers.length > 3 && (
            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs">
              +{collaborationUsers.length - 3}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0"
            title="Invite Collaborators"
            data-testid="button-invite"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2" data-testid="connection-status">
          <div
            className={`w-2 h-2 rounded-full ${
              isCollaborationConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {isCollaborationConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0"
          title="Toggle Theme"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Moon className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
}
