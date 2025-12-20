import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useIDE } from '@/hooks/use-ide';
import { Button } from '@/components/ui/button';
import { Sparkles, Play, Square } from 'lucide-react';
// Lazy load Monaco Editor - it's a very large bundle (~2MB)
const Editor = lazy(() => import('@monaco-editor/react'));
import * as monaco from 'monaco-editor';

// Monaco Editor Component with all IDE features
interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  theme?: string;
}

function MonacoEditorComponent({
  value,
  onChange,
  language,
  theme = 'vs-dark',
}: MonacoEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // Configure advanced editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'Fira Code, Monaco, Consolas, monospace',
      lineHeight: 24,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true,
      },
      parameterHints: { enabled: true },
      formatOnPaste: true,
      formatOnType: true,
    });

    // Enable advanced language features
    editor.getModel()?.updateOptions({
      tabSize: 2,
      insertSpaces: true,
    });
  };

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue);
    }
  };

  // Detect Monaco language from file extension
  const getMonacoLanguage = (lang: string) => {
    const languageMap: Record<string, string> = {
      javascript: 'javascript',
      js: 'javascript',
      jsx: 'javascript',
      typescript: 'typescript',
      ts: 'typescript',
      tsx: 'typescript',
      python: 'python',
      py: 'python',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
      less: 'less',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yaml',
      markdown: 'markdown',
      md: 'markdown',
      sql: 'sql',
      php: 'php',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      csharp: 'csharp',
      go: 'go',
      rust: 'rust',
      ruby: 'ruby',
      shell: 'shell',
      bash: 'shell',
      dockerfile: 'dockerfile',
    };

    return languageMap[lang.toLowerCase()] || 'plaintext';
  };

  return (
    <div className="flex-1 relative" data-testid="code-editor">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading editor...</p>
          </div>
        </div>
      }>
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
        theme={theme}
        options={{
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: 'line',
          automaticLayout: true,
          glyphMargin: true,
          folding: true,
          showFoldingControls: 'always',
          foldingHighlight: true,
          foldingImportsByDefault: false,
          unfoldOnClickAfterEndOfLine: false,
          contextmenu: true,
          mouseWheelScrollSensitivity: 1,
          fastScrollSensitivity: 5,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            verticalScrollbarSize: 17,
            horizontalScrollbarSize: 17,
          },
        }}
      />
      </Suspense>
    </div>
  );
}

export function CodeEditor() {
  const { state, updateTabContent, saveFile } = useIDE();
  const [showAISuggestion, setShowAISuggestion] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [executionOutput, setExecutionOutput] = useState('');
  const [executionRequestId, setExecutionRequestId] = useState<string | null>(null);

  const activeTab = state.openTabs.find((tab: any) => tab.id === state.activeTabId);

  const handleContentChange = (content: string) => {
    if (activeTab) {
      updateTabContent(activeTab.id, content);
    }
  };

  const handleSave = async () => {
    if (activeTab) {
      await saveFile(activeTab.id);
    }
  };

  const handleAcceptSuggestion = () => {
    if (activeTab) {
      const suggestion = '\n  const [loading, setLoading] = useState(false);';
      const currentContent = activeTab.content;
      const lines = currentContent.split('\n');
      lines.splice(5, 0, suggestion); // Insert after line 5
      updateTabContent(activeTab.id, lines.join('\n'));
    }
    setShowAISuggestion(false);
  };

  const handleDismissSuggestion = () => {
    setShowAISuggestion(false);
  };

  const handleRunCode = async () => {
    if (!activeTab || !state.currentProject) return;

    setIsRunning(true);
    setExecutionOutput('');
    const requestId = `exec-${Date.now()}`;
    setExecutionRequestId(requestId);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          projectId: state.currentProject.id,
          language: activeTab.language,
          code: activeTab.content,
          files: state.currentProject.files,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setExecutionOutput(`✓ Execution completed in ${result.duration}ms\n${result.output}`);
      } else {
        setExecutionOutput(
          `✗ Execution failed (exit code: ${result.exitCode})\n${result.errors || result.output}`
        );
      }
    } catch (error) {
      setExecutionOutput(
        `✗ Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsRunning(false);
      setExecutionRequestId(null);
    }
  };

  const handleStopExecution = async () => {
    if (!executionRequestId) {
      setIsRunning(false);
      return;
    }

    try {
      const response = await fetch(`/api/containers/${executionRequestId}/stop`, {
        method: 'POST',
      });

      if (response.ok) {
        setExecutionOutput('✗ Execution stopped by user');
      } else {
        setExecutionOutput('✗ Failed to stop execution');
      }
    } catch (error) {
      setExecutionOutput(
        `✗ Error stopping execution: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsRunning(false);
      setExecutionRequestId(null);
    }
  };

  // Auto-save on Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No file open</h3>
          <p>Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative flex flex-col overflow-hidden">
      {/* Code Editor Toolbar */}
      <div className="h-10 bg-muted border-b border flex items-center px-4 space-x-2">
        <Button
          size="sm"
          onClick={isRunning ? handleStopExecution : handleRunCode}
          disabled={!activeTab || (!isRunning && !activeTab.content.trim())}
          data-testid="button-run-code"
          variant={isRunning ? 'destructive' : 'default'}
        >
          {isRunning ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground">
          {activeTab ? `${activeTab.name} • ${activeTab.language}` : 'No file selected'}
        </div>

        <div className="flex-1" />

        {activeTab?.isDirty && (
          <Button size="sm" variant="outline" onClick={handleSave}>
            Save (Ctrl+S)
          </Button>
        )}
      </div>

      {/* Code Editor */}
      <div className="flex-1 relative">
        <MonacoEditorComponent
          value={activeTab?.content || ''}
          onChange={handleContentChange}
          language={activeTab?.language || 'text'}
        />
      </div>

      {/* Execution Output */}
      {executionOutput && (
        <div className="h-32 bg-background border-t border p-4 font-mono text-sm overflow-auto">
          <div className="text-muted-foreground mb-2">Execution Output:</div>
          <pre
            className={`whitespace-pre-wrap ${executionOutput.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}
          >
            {executionOutput}
          </pre>
        </div>
      )}

      {/* AI Autocomplete Suggestion */}
      {showAISuggestion && activeTab?.language === 'javascript' && (
        <div className="absolute right-4 top-16 bg-card border border rounded-lg p-3 shadow-xl z-10 glow">
          <div className="flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 animate-pulse" />
            <div className="text-sm">
              <div className="text-muted-foreground mb-1">AI Suggestion</div>
              <div className="font-mono text-xs bg-muted p-2 rounded">
                <span className="text-green-600">// Add loading state</span>
                <br />
                <span className="text-blue-400">const</span> [loading, setLoading] ={' '}
                <span className="text-purple-400">useState</span>(
                <span className="text-orange-400">false</span>);
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Button
                  size="sm"
                  onClick={handleAcceptSuggestion}
                  data-testid="button-accept-suggestion"
                >
                  Accept
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissSuggestion}
                  data-testid="button-dismiss-suggestion"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
