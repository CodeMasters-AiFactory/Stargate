import React from 'react';
import { AIAssistant } from './AIAssistant';

interface RightPanelProps {
  isVisible: boolean;
}

export function RightPanel({ isVisible }: RightPanelProps) {
  if (!isVisible) return null;

  return (
    <div
      className="w-72 bg-card border-r border flex flex-col"
      style={{
        minWidth: '240px',
        maxWidth: '400px',
        resize: 'horizontal',
        overflow: 'auto',
      }}
    >
      <div className="px-3 py-2 border-b border bg-muted/30">
        <h3 className="text-sm font-medium">Agent</h3>
      </div>
      <AIAssistant />
    </div>
  );
}
