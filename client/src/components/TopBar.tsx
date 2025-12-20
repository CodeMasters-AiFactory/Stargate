import { Menu, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';

interface TopBarProps {
  onToggleSidebar?: () => void;
  currentFile?: string;
}

export default function TopBar({ onToggleSidebar, currentFile }: TopBarProps) {
  return (
    <div className="flex items-center justify-between h-12 px-2 border-b bg-background">
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleSidebar}
          data-testid="button-toggle-sidebar"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Complete AI Development System</span>
          {currentFile && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">{currentFile}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" data-testid="button-search">
          <Search className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" data-testid="button-settings">
          <Settings className="h-4 w-4" />
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
}
