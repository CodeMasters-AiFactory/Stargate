import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Tab {
  id: string;
  name: string;
  modified?: boolean;
}

interface EditorTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabClick?: (id: string) => void;
  onTabClose?: (id: string) => void;
}

export default function EditorTabs({ tabs, activeTab, onTabClick, onTabClose }: EditorTabsProps) {
  return (
    <div className="flex items-center h-8 bg-muted/30 border-b overflow-x-auto">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`group flex items-center gap-1 px-3 h-full border-r cursor-pointer text-sm ${
            activeTab === tab.id
              ? 'bg-background text-foreground'
              : 'text-muted-foreground hover-elevate'
          }`}
          onClick={() => onTabClick?.(tab.id)}
          data-testid={`tab-${tab.id}`}
        >
          <span className="flex items-center gap-1">
            {tab.name}
            {tab.modified && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
            onClick={e => {
              e.stopPropagation();
              onTabClose?.(tab.id);
            }}
            data-testid={`button-close-tab-${tab.id}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export type { Tab };
