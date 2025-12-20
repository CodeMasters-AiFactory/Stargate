import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, RefreshCw, Filter, X } from 'lucide-react';

interface DebugLogEntry {
  id: string;
  timestamp: number;
  location: string;
  message: string;
  data?: any;
  sessionId?: string;
  runId?: string;
  hypothesisId?: string;
}

interface DebugStats {
  exists: boolean;
  totalEntries: number;
  hypotheses: Record<string, number>;
  sessions: Record<string, number>;
  locations: Record<string, number>;
  oldestTimestamp: number;
  newestTimestamp: number;
}

export function DebugConsole() {
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const [stats, setStats] = useState<DebugStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    hypothesisId: '',
    sessionId: '',
    location: '',
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  // Get log level color based on message
  const getLogColor = (entry: DebugLogEntry) => {
    const msg = entry.message.toLowerCase();
    if (msg.includes('error') || msg.includes('failed') || msg.includes('fail')) {
      return 'text-red-400';
    }
    if (msg.includes('warning') || msg.includes('warn')) {
      return 'text-yellow-400';
    }
    if (msg.includes('success') || msg.includes('complete') || msg.includes('ok')) {
      return 'text-green-400';
    }
    return 'text-blue-400';
  };

  // Load logs
  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filter.hypothesisId) params.append('hypothesisId', filter.hypothesisId);
      if (filter.sessionId) params.append('sessionId', filter.sessionId);
      if (filter.location) params.append('location', filter.location);
      params.append('limit', '500'); // Limit to last 500 logs

      const response = await fetch(`/api/debug/logs?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to load logs: ${response.statusText}`);
      }

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
      console.error('[DebugConsole] Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const response = await fetch('/api/debug/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('[DebugConsole] Error loading stats:', err);
    }
  };

  // Clear logs
  const clearLogs = async () => {
    if (!confirm('Clear all debug logs? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/debug/logs', { method: 'DELETE' });
      if (response.ok) {
        setLogs([]);
        setStats(null);
        await loadStats();
      }
    } catch (err) {
      console.error('[DebugConsole] Error clearing logs:', err);
    }
  };

  // Setup SSE streaming
  useEffect(() => {
    if (!autoRefresh) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const eventSource = new EventSource('/api/debug/logs/stream');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const newEntry = JSON.parse(event.data) as DebugLogEntry;
        setLogs(prev => [newEntry, ...prev].slice(0, 500)); // Keep last 500
        loadStats(); // Refresh stats
      } catch (err) {
        console.error('[DebugConsole] Error parsing SSE message:', err);
      }
    };

    eventSource.onerror = () => {
      // SSE connection error - fall back to polling
      eventSource.close();
      eventSourceRef.current = null;
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [autoRefresh]);

  // Initial load
  useEffect(() => {
    loadLogs();
    loadStats();
  }, []);

  // Reload when filters change
  useEffect(() => {
    if (!autoRefresh) {
      loadLogs();
    }
  }, [filter, autoRefresh]);

  // Auto-scroll to top when new logs arrive
  useEffect(() => {
    if (scrollAreaRef.current && logs.length > 0) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }
  }, [logs.length]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Debug Console</h3>
          {stats && (
            <span className="text-xs text-muted-foreground">
              {stats.totalEntries} entries
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'text-green-400' : ''}
            title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadLogs}
            disabled={loading}
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearLogs}
            title="Clear all logs"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-2 border-b border space-y-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium">Filters:</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Input
            placeholder="Hypothesis ID"
            value={filter.hypothesisId}
            onChange={(e) => setFilter(prev => ({ ...prev, hypothesisId: e.target.value }))}
            className="h-7 text-xs"
          />
          <Input
            placeholder="Session ID"
            value={filter.sessionId}
            onChange={(e) => setFilter(prev => ({ ...prev, sessionId: e.target.value }))}
            className="h-7 text-xs"
          />
          <Input
            placeholder="Location"
            value={filter.location}
            onChange={(e) => setFilter(prev => ({ ...prev, location: e.target.value }))}
            className="h-7 text-xs"
          />
        </div>
        {(filter.hypothesisId || filter.sessionId || filter.location) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilter({ hypothesisId: '', sessionId: '', location: '' })}
            className="h-6 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-2 bg-red-500/10 border-b border-red-500/20">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Logs */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-2 space-y-1">
          {logs.length === 0 && !loading && (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">No debug logs found</p>
              <p className="text-xs mt-1">Logs will appear here when the server runs</p>
            </div>
          )}
          {logs.map((log) => (
            <div
              key={log.id}
              className="font-mono text-xs p-2 rounded border border-border/50 hover:border-border bg-card/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-muted-foreground">{formatTimestamp(log.timestamp)}</span>
                    <span className={`font-semibold ${getLogColor(log)}`}>
                      {log.message}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-[10px] mb-1">
                    <span className="font-medium">Location:</span> {log.location}
                  </div>
                  {log.hypothesisId && (
                    <div className="text-muted-foreground text-[10px] mb-1">
                      <span className="font-medium">Hypothesis:</span> {log.hypothesisId}
                    </div>
                  )}
                  {log.sessionId && (
                    <div className="text-muted-foreground text-[10px] mb-1">
                      <span className="font-medium">Session:</span> {log.sessionId}
                    </div>
                  )}
                  {log.data && Object.keys(log.data).length > 0 && (
                    <details className="mt-1">
                      <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">
                        Data ({Object.keys(log.data).length} keys)
                      </summary>
                      <pre className="mt-1 p-2 bg-muted rounded text-[10px] overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}


