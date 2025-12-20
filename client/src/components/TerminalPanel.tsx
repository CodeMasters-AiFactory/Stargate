import { Terminal, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface TerminalPanelProps {
  height?: number;
  onClose?: () => void;
  onResize?: (height: number) => void;
}

export default function TerminalPanel({ height = 200, onClose, onResize }: TerminalPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [output] = useState([
    '$ npm run dev',
    '',
    '> vite',
    '',
    '  VITE v5.0.0  ready in 324 ms',
    '',
    '  ➜  Local:   http://localhost:5000/',
    '  ➜  Network: use --host to expose',
  ]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    onResize?.(isExpanded ? 32 : height);
  };

  return (
    <div
      className="flex flex-col bg-background border-t"
      style={{ height: isExpanded ? height : 32 }}
    >
      <div className="flex items-center justify-between h-8 px-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={toggleExpand}
            data-testid="button-toggle-terminal"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={onClose}
            data-testid="button-close-terminal"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-2 font-mono text-sm">
          {output.map((line, idx) => (
            <div
              key={idx}
              className={line.startsWith('$') ? 'text-primary' : ''}
              data-testid={`terminal-line-${idx}`}
            >
              {line || ' '}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
