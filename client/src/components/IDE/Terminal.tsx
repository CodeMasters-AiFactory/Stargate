import React, { useState, useRef, useEffect } from 'react';
import { TerminalLine } from '@/types/ide';
import { Button } from '@/components/ui/button';
import { X, Plus, Terminal as TerminalIcon } from 'lucide-react';

interface TerminalTab {
  id: string;
  name: string;
  isActive: boolean;
  lines: TerminalLine[];
  commandHistory: string[];
  historyIndex: number;
  currentCommand: string;
  workingDir: string;
}

export function Terminal() {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: 'terminal-1',
      name: 'bash',
      isActive: true,
      workingDir: '~/my-react-app',
      currentCommand: '',
      historyIndex: -1,
      commandHistory: [],
      lines: [
        {
          id: 'welcome-1',
          content: 'Welcome to Stargate IDE Terminal',
          type: 'output',
          timestamp: new Date(),
        },
        {
          id: 'welcome-2',
          content: 'Type "help" for available commands or start coding!',
          type: 'output',
          timestamp: new Date(),
        },
      ],
    },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find(tab => tab.isActive);
  const commonCommands = [
    'npm start',
    'npm install',
    'npm test',
    'npm run build',
    'npm run dev',
    'git status',
    'git add .',
    'git commit -m',
    'git push',
    'git pull',
    'ls',
    'cd',
    'mkdir',
    'rm',
    'cp',
    'mv',
    'cat',
    'pwd',
    'clear',
    'help',
    'python',
    'node',
    'java',
    'go run',
    'cargo run',
    'docker build',
  ];

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (terminalRef.current && activeTab) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [activeTab?.lines]);

  // Focus input when terminal is clicked
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  // Update suggestions based on current input
  useEffect(() => {
    if (activeTab?.currentCommand) {
      const filtered = commonCommands.filter(cmd =>
        cmd.toLowerCase().startsWith(activeTab.currentCommand.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [activeTab?.currentCommand]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!activeTab) return;

    if (e.key === 'Enter' && !isProcessing) {
      executeCommand(activeTab.currentCommand);
      setShowSuggestions(false);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory('down');
    } else if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      updateCurrentCommand(suggestions[0]);
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const navigateHistory = (direction: 'up' | 'down') => {
    if (!activeTab) return;

    const history = activeTab.commandHistory;
    let newIndex = activeTab.historyIndex;

    if (direction === 'up' && newIndex < history.length - 1) {
      newIndex++;
    } else if (direction === 'down' && newIndex > -1) {
      newIndex--;
    }

    const command = newIndex >= 0 ? history[history.length - 1 - newIndex] : '';

    setTabs(prev =>
      prev.map(tab =>
        tab.id === activeTab.id ? { ...tab, historyIndex: newIndex, currentCommand: command } : tab
      )
    );
  };

  const updateCurrentCommand = (command: string) => {
    if (!activeTab) return;

    setTabs(prev =>
      prev.map(tab => (tab.id === activeTab.id ? { ...tab, currentCommand: command } : tab))
    );
  };

  const executeCommand = async (command: string) => {
    if (!command.trim() || !activeTab) return;

    setIsProcessing(true);

    // Add command to history and lines
    const commandLine: TerminalLine = {
      id: Date.now().toString(),
      content: `➜ ${activeTab.workingDir} $ ${command}`,
      type: 'command',
      timestamp: new Date(),
    };

    // Update tab with new command in history and lines
    setTabs(prev =>
      prev.map(tab =>
        tab.id === activeTab.id
          ? {
              ...tab,
              lines: [...tab.lines, commandLine],
              commandHistory: [...tab.commandHistory, command],
              currentCommand: '',
              historyIndex: -1,
            }
          : tab
      )
    );

    try {
      // Execute command on backend
      const response = await fetch('/api/terminal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: 'demo-project-1',
          command: command,
          workingDir: '/workspace',
        }),
      });

      const result = await response.json();

      // Add output to terminal
      const newLines: TerminalLine[] = [];

      if (result.output) {
        newLines.push({
          id: Date.now().toString(),
          content: result.output,
          type: 'output',
          timestamp: new Date(),
        });
      }

      if (result.errors) {
        newLines.push({
          id: (Date.now() + 1).toString(),
          content: result.errors,
          type: 'error',
          timestamp: new Date(),
        });
      }

      // Update tab with new output lines
      if (newLines.length > 0) {
        setTabs(prev =>
          prev.map(tab =>
            tab.id === activeTab.id ? { ...tab, lines: [...tab.lines, ...newLines] } : tab
          )
        );
      }
    } catch (error) {
      // Fallback to simulation if backend is unavailable
      const output = simulateCommand(command);
      if (output) {
        const outputLine: TerminalLine = {
          id: (Date.now() + 1).toString(),
          content: output,
          type: 'output',
          timestamp: new Date(),
        };
        setTabs(prev =>
          prev.map(tab =>
            tab.id === activeTab.id ? { ...tab, lines: [...tab.lines, outputLine] } : tab
          )
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateCommand = (command: string): string => {
    const cmd = command.toLowerCase().trim();

    if (cmd === 'ls' || cmd === 'dir') {
      return 'src  public  package.json  README.md  node_modules';
    } else if (cmd === 'pwd') {
      return '/home/stargate/my-react-app';
    } else if (cmd.startsWith('cd')) {
      return ''; // No output for successful cd
    } else if (cmd === 'npm install' || cmd === 'npm i') {
      return 'Dependencies installed successfully!';
    } else if (cmd === 'npm test') {
      return 'Test Suites: 1 passed, 1 total\nTests: 1 passed, 1 total';
    } else if (cmd === 'npm run build') {
      return 'Build completed successfully!\nFiles written to dist/';
    } else if (cmd === 'clear') {
      setTabs(prev => prev.map(tab => (tab.id === activeTab?.id ? { ...tab, lines: [] } : tab)));
      return '';
    } else if (cmd === 'help') {
      return `Available commands:
  ls, dir     - List files and directories
  pwd         - Show current directory
  cd <dir>    - Change directory
  npm start   - Start development server
  npm test    - Run tests
  npm run build - Build for production
  clear       - Clear terminal
  help        - Show this help`;
    } else {
      return `Command not found: ${command}. Type 'help' for available commands.`;
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-foreground';
      case 'error':
        return 'text-red-400';
      case 'output':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  };

  const addNewTerminal = () => {
    const newId = `terminal-${Date.now()}`;
    const newTab: TerminalTab = {
      id: newId,
      name: `bash-${tabs.length + 1}`,
      isActive: false,
      workingDir: '~/my-react-app',
      currentCommand: '',
      historyIndex: -1,
      commandHistory: [],
      lines: [
        {
          id: `${newId}-welcome`,
          content: 'New terminal session started',
          type: 'output',
          timestamp: new Date(),
        },
      ],
    };

    setTabs(prev => [
      ...prev.map(tab => ({ ...tab, isActive: false })),
      { ...newTab, isActive: true },
    ]);
  };

  const switchTab = (tabId: string) => {
    setTabs(prev =>
      prev.map(tab => ({
        ...tab,
        isActive: tab.id === tabId,
      }))
    );
  };

  const closeTab = (tabId: string) => {
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);
      if (filtered.length === 0) {
        // Create a new tab if all are closed
        return [
          {
            id: 'terminal-default',
            name: 'bash',
            isActive: true,
            workingDir: '~/my-react-app',
            currentCommand: '',
            historyIndex: -1,
            commandHistory: [],
            lines: [],
          },
        ];
      }
      // If we closed the active tab, activate the first one
      const hasActive = filtered.some(tab => tab.isActive);
      if (!hasActive) {
        filtered[0].isActive = true;
      }
      return filtered;
    });
  };

  if (!activeTab) return null;

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Terminal Tabs */}
      <div className="flex items-center bg-muted border-b border">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center px-3 py-2 border-r border text-sm cursor-pointer group ${
              tab.isActive
                ? 'bg-background text-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            onClick={() => switchTab(tab.id)}
            data-testid={`terminal-tab-${tab.id}`}
          >
            <TerminalIcon className="w-4 h-4 mr-2" />
            <span>{tab.name}</span>
            {tabs.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 w-4 h-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                onClick={e => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                data-testid={`close-terminal-tab-${tab.id}`}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}

        {/* Add new terminal button */}
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 w-6 h-6 p-0"
          onClick={addNewTerminal}
          title="New Terminal"
          data-testid="button-new-terminal"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Terminal Content */}
      <div
        className="flex-1 p-4 bg-background overflow-auto scrollbar-thin font-mono text-sm cursor-text relative"
        onClick={handleTerminalClick}
        ref={terminalRef}
        data-testid="terminal"
      >
        <div className="space-y-1">
          {activeTab.lines.map(line => (
            <div
              key={line.id}
              className={`${getLineColor(line.type)} leading-6`}
              data-testid={`terminal-line-${line.id}`}
            >
              {line.content}
            </div>
          ))}

          {/* Current input line */}
          <div className="flex items-center leading-6">
            <span className="text-green-400 mr-2">➜</span>
            <span className="text-primary mr-2">{activeTab.workingDir}</span>
            <span className="mr-2">$</span>
            <input
              ref={inputRef}
              type="text"
              value={activeTab.currentCommand}
              onChange={e => updateCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-foreground"
              disabled={isProcessing}
              autoFocus
              data-testid="terminal-input"
            />
            {isProcessing && (
              <span className="animate-pulse text-muted-foreground ml-2">Processing...</span>
            )}
            {!isProcessing && <span className="animate-pulse">▋</span>}
          </div>

          {/* Command Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute bg-card border border rounded-lg shadow-lg mt-1 z-10 max-w-md">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  className={`px-3 py-2 cursor-pointer hover:bg-accent ${
                    index === 0 ? 'bg-accent' : ''
                  }`}
                  onClick={() => {
                    updateCurrentCommand(suggestion);
                    setShowSuggestions(false);
                    inputRef.current?.focus();
                  }}
                  data-testid={`suggestion-${index}`}
                >
                  <span className="font-mono text-sm">{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
