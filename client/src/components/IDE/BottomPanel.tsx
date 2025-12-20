import React from 'react';
import { Button } from '@/components/ui/button';
import { useIDE } from '@/hooks/use-ide';
import { Terminal } from './Terminal';
import { DebugConsole } from './DebugConsole';
import { Maximize2 } from 'lucide-react';

export function BottomPanel() {
  const { state, setState } = useIDE();

  const panels = [
    { id: 'terminal', label: 'Terminal' },
    { id: 'problems', label: 'Problems' },
    { id: 'output', label: 'Output' },
    { id: 'debug', label: 'Debug Console' },
  ] as const;

  const handlePanelChange = (panelId: typeof state.activeBottomPanel) => {
    setState(prev => ({ ...prev, activeBottomPanel: panelId }));
  };

  const renderPanelContent = () => {
    switch (state.activeBottomPanel) {
      case 'terminal':
        return <Terminal />;
      case 'problems':
        return (
          <div className="p-4 text-muted-foreground">
            <div className="text-center">
              <h3 className="font-medium mb-2">No problems detected</h3>
              <p className="text-sm">Your code looks clean! 🎉</p>
            </div>
          </div>
        );
      case 'output':
        return (
          <div className="p-4 font-mono text-sm">
            <div className="space-y-1">
              <div className="text-blue-400">[INFO] Starting development server...</div>
              <div className="text-green-400">[SUCCESS] Server started on port 3000</div>
              <div className="text-yellow-400">[WARN] Hot reloading enabled</div>
              <div className="text-muted-foreground">[LOG] Watching for file changes...</div>
            </div>
          </div>
        );
      case 'debug':
        return <DebugConsole />;
      default:
        return null;
    }
  };

  // Don't render anything if height is 0 (completely hidden)
  if (state.bottomPanelHeight === 0) {
    return (
      <div className="h-8 bg-muted border-t border flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          title="Show Console"
          onClick={() => setState(prev => ({ ...prev, bottomPanelHeight: 320 }))}
          data-testid="button-show-panel"
        >
          ↑ Show Console
        </Button>
      </div>
    );
  }

  return (
    <div
      className="bg-card border-t border flex flex-col"
      style={{
        height: `${state.bottomPanelHeight}px`,
        minHeight: '40px',
        resize: 'vertical',
        overflow: 'auto',
      }}
    >
      {/* Resize Handle */}
      <div
        className="h-1 bg-border hover:bg-primary/50 cursor-row-resize"
        onMouseDown={e => {
          const startY = e.clientY;
          const startHeight = state.bottomPanelHeight;

          const handleMouseMove = (e: MouseEvent) => {
            // Fixed: Drag DOWN = bigger, drag UP = smaller - NO MAXIMUM LIMIT
            const newHeight = Math.max(120, startHeight + (startY - e.clientY));
            setState(prev => ({ ...prev, bottomPanelHeight: newHeight }));
          };

          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />

      {/* Panel Tabs */}
      <div className="flex items-center border-b border">
        {panels.map(panel => (
          <Button
            key={panel.id}
            variant="ghost"
            className={`px-4 py-2 text-sm rounded-none border-r border ${
              state.activeBottomPanel === panel.id
                ? 'bg-background text-primary border-b-2 border-b-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handlePanelChange(panel.id)}
            data-testid={`panel-tab-${panel.id}`}
          >
            {panel.label}
          </Button>
        ))}

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 mr-1"
          title="Hide Console Completely"
          onClick={() => setState(prev => ({ ...prev, bottomPanelHeight: 0 }))}
          data-testid="button-hide-panel"
        >
          <span className="text-xs">✕</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 mr-1"
          title="Minimize Panel"
          onClick={() => setState(prev => ({ ...prev, bottomPanelHeight: 40 }))}
          data-testid="button-minimize-panel"
        >
          <span className="text-xs">−</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 mr-2"
          title="Maximize Panel"
          onClick={() => setState(prev => ({ ...prev, bottomPanelHeight: 400 }))}
          data-testid="button-maximize-panel"
        >
          <Maximize2 className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">{renderPanelContent()}</div>
    </div>
  );
}
