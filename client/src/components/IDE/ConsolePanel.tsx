import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Terminal,
  Play,
  Square,
  Trash2,
  Copy,
  Download,
  Settings,
  ChevronRight,
} from 'lucide-react';

interface ConsoleLog {
  id: string;
  timestamp: Date;
  type: 'input' | 'output' | 'error' | 'info';
  content: string;
}

export function ConsolePanel() {
  const [logs, setLogs] = useState<ConsoleLog[]>([
    {
      id: '1',
      timestamp: new Date(),
      type: 'info',
      content: 'Stargate Terminal v2.0 - Advanced Cloud Console',
    },
    {
      id: '2',
      timestamp: new Date(),
      type: 'info',
      content: 'Connected to unlimited compute resources 🚀',
    },
    {
      id: '3',
      timestamp: new Date(),
      type: 'output',
      content: '$ npm run dev',
    },
    {
      id: '4',
      timestamp: new Date(),
      type: 'output',
      content: '> rest-express@1.0.0 dev',
    },
    {
      id: '5',
      timestamp: new Date(),
      type: 'output',
      content: '> NODE_ENV=development tsx server/index.ts',
    },
    {
      id: '6',
      timestamp: new Date(),
      type: 'info',
      content: '⚡ Advanced Resource Manager initialized with unlimited scaling',
    },
    {
      id: '7',
      timestamp: new Date(),
      type: 'info',
      content: '🤖 Multi-Model AI Assistant initialized with 4+ models',
    },
    {
      id: '8',
      timestamp: new Date(),
      type: 'info',
      content: '🚀 Auto-scaling triggered: requestsPerSecond (167) > 100',
    },
  ]);

  const [currentInput, setCurrentInput] = useState('');
  const [isRunning, setIsRunning] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  useEffect(() => {
    // Focus input when component mounts
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const executeCommand = () => {
    if (!currentInput.trim()) return;

    // Add input to logs
    const inputLog: ConsoleLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'input',
      content: `$ ${currentInput}`,
    };

    // Simulate command execution
    let outputLogs: ConsoleLog[] = [];

    switch (currentInput.trim().toLowerCase()) {
      case 'help':
        outputLogs = [
          {
            id: Date.now() + '1',
            timestamp: new Date(),
            type: 'info',
            content: 'Available commands: help, clear, ls, npm, node, python, git, docker, status',
          },
        ];
        break;
      case 'clear':
        setLogs([]);
        setCurrentInput('');
        return;
      case 'ls':
        outputLogs = [
          {
            id: Date.now() + '1',
            timestamp: new Date(),
            type: 'output',
            content: 'client/  server/  package.json  README.md  tsconfig.json',
          },
        ];
        break;
      case 'status':
        outputLogs = [
          {
            id: Date.now() + '1',
            timestamp: new Date(),
            type: 'info',
            content: '🚀 System Status: UNLIMITED POWER ACTIVE',
          },
          {
            id: Date.now() + '2',
            timestamp: new Date(),
            type: 'info',
            content: '⚡ CPU: ∞ cores available',
          },
          {
            id: Date.now() + '3',
            timestamp: new Date(),
            type: 'info',
            content: '🧠 Memory: ∞ GB available',
          },
          {
            id: Date.now() + '4',
            timestamp: new Date(),
            type: 'info',
            content: '🤖 AI Models: 4+ active (OpenAI, Anthropic, Cohere, Local)',
          },
        ];
        break;
      default:
        outputLogs = [
          {
            id: Date.now() + '1',
            timestamp: new Date(),
            type: 'error',
            content: `Command not found: ${currentInput}. Type 'help' for available commands.`,
          },
        ];
    }

    setLogs(prev => [...prev, inputLog, ...outputLogs]);
    setCurrentInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const copyLogs = () => {
    const logText = logs
      .map(log => `${log.timestamp.toLocaleTimeString()} [${log.type}] ${log.content}`)
      .join('\n');
    navigator.clipboard.writeText(logText);
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-500';
      case 'info':
        return 'text-blue-500';
      case 'input':
        return 'text-green-500';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="h-full flex flex-col" data-testid="console-panel">
      {/* Header */}
      <div className="p-4 border-b border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Advanced Console
            </h2>
            <p className="text-sm text-muted-foreground">Unlimited compute power terminal</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isRunning ? 'default' : 'secondary'}>
              {isRunning ? 'Active' : 'Inactive'}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRunning(!isRunning)}
              data-testid="button-toggle-console"
            >
              {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={clearLogs} data-testid="button-clear-logs">
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
          <Button size="sm" variant="outline" onClick={copyLogs} data-testid="button-copy-logs">
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
          <Button size="sm" variant="outline" data-testid="button-download-logs">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <div className="ml-auto">
            <Button size="sm" variant="ghost">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Console Output */}
      <div className="flex-1 p-4 bg-black text-green-400 font-mono text-sm overflow-auto">
        <div className="space-y-1">
          {logs.map(log => (
            <div key={log.id} className="flex items-start gap-2">
              <span className="text-muted-foreground text-xs w-20 flex-shrink-0">
                {log.timestamp.toLocaleTimeString()}
              </span>
              <span className={getLogColor(log.type)}>{log.content}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>

        {/* Input Line */}
        {isRunning && (
          <div className="flex items-center gap-2 mt-4">
            <ChevronRight className="w-4 h-4 text-green-400" />
            <span className="text-green-400">$</span>
            <Input
              ref={inputRef}
              value={currentInput}
              onChange={e => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-0 text-green-400 focus:ring-0 font-mono"
              placeholder="Enter command..."
              data-testid="console-input"
            />
          </div>
        )}
      </div>

      {/* Competitive Advantage */}
      <div className="p-4 border-t border">
        <Card className="border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-500" />
              <div>
                <h4 className="font-medium text-cyan-700 dark:text-cyan-300 text-sm">
                  💻 Stargate Console Advantage
                </h4>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">
                  Unlimited compute access, real-time system monitoring, and advanced command
                  features - far beyond basic terminals!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
