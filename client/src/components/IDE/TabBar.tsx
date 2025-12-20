import React from 'react';
import { Button } from '@/components/ui/button';
import { useIDE } from '@/hooks/use-ide';
import { X, Columns, Code, Palette, FileText, Settings } from 'lucide-react';

export function TabBar() {
  const { state, closeTab, setState } = useIDE();

  const getTabIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, { icon: React.ComponentType<any>; color: string }> = {
      jsx: { icon: Code, color: 'text-orange-400' },
      js: { icon: Code, color: 'text-orange-400' },
      css: { icon: Palette, color: 'text-blue-300' },
      json: { icon: Settings, color: 'text-gray-400' },
      md: { icon: FileText, color: 'text-gray-400' },
    };

    const iconInfo = iconMap[ext || ''] || { icon: FileText, color: 'text-gray-400' };
    const IconComponent = iconInfo.icon;

    return <IconComponent className={`w-4 h-4 ${iconInfo.color}`} />;
  };

  const handleTabClick = (tabId: string) => {
    setState(prev => ({ ...prev, activeTabId: tabId }));
  };

  if (state.openTabs.length === 0) {
    return null;
  }

  return (
    <div className="h-10 bg-muted border-b border flex items-center">
      {/* Open Tabs */}
      <div className="flex">
        {state.openTabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center px-3 py-2 border-r border text-sm cursor-pointer group ${
              state.activeTabId === tab.id
                ? 'bg-background text-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            onClick={() => handleTabClick(tab.id)}
            data-testid={`tab-${tab.path}`}
          >
            {getTabIcon(tab.name)}
            <span className="ml-2">{tab.name}</span>
            {tab.isDirty && (
              <div className="w-2 h-2 bg-amber-400 rounded-full ml-2" title="Unsaved changes" />
            )}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 w-4 h-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
              onClick={e => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              data-testid={`close-tab-${tab.path}`}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Tab Actions */}
      <div className="ml-auto flex items-center px-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-6 h-6 p-0"
          title="Split Editor"
          data-testid="button-split-editor"
        >
          <Columns className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
