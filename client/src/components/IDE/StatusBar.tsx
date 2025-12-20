import React from 'react';
import { useIDEContext } from '@/components/providers/IDEProvider';
import { GitBranch, AlertCircle, TriangleAlert, Activity } from 'lucide-react';
import { ResearchStatusIndicator } from './ResearchStatusIndicator';

export function StatusBar() {
  const { state } = useIDEContext();

  const activeTab = state.openTabs.find(tab => tab.id === state.activeTabId);

  // Mock cursor position - in real implementation, get from editor
  const cursorPosition = { line: 8, column: 23 };

  // Mock metrics
  const problems = { errors: 0, warnings: 2 };
  const performance = { cpu: 15, memory: 342 };

  return (
    <div className="h-6 bg-primary text-primary-foreground text-xs flex items-center px-4 justify-between">
      <div className="flex items-center space-x-4">
        {/* Research Status Indicator */}
        <ResearchStatusIndicator />

        {/* Git Branch */}
        <div className="flex items-center space-x-1" data-testid="git-branch">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>

        {/* Problems */}
        <div className="flex items-center space-x-1" data-testid="problems-count">
          <AlertCircle className="w-3 h-3" />
          <span>{problems.errors}</span>
        </div>

        <div className="flex items-center space-x-1" data-testid="warnings-count">
          <TriangleAlert className="w-3 h-3" />
          <span>{problems.warnings}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Language */}
        {activeTab && (
          <span data-testid="language-info">
            {activeTab.language === 'javascript' ? 'JavaScript React' : activeTab.language}
          </span>
        )}

        {/* Encoding */}
        <span data-testid="encoding">UTF-8</span>

        {/* Line Endings */}
        <span data-testid="line-endings">LF</span>

        {/* Cursor Position */}
        {activeTab && (
          <span data-testid="cursor-position">
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </span>
        )}

        {/* Performance */}
        <div className="flex items-center space-x-1" data-testid="performance">
          <Activity className="w-3 h-3" />
          <span>CPU: {performance.cpu}%</span>
        </div>
      </div>
    </div>
  );
}
