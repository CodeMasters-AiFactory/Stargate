/**
 * Version History Panel - 120% Feature
 * Visual diff and rollback interface
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  GitBranch, 
  RotateCcw, 
  Eye, 
  GitCompare,
  Clock,
  User,
  Tag,
  ChevronRight,
  Save
} from 'lucide-react';

interface VersionSnapshot {
  id: string;
  version: number;
  branch: string;
  message: string;
  author: string;
  timestamp: string;
  tags: string[];
  isAutoSave: boolean;
}

interface VersionHistoryProps {
  projectId: string;
  currentVersion?: number;
  onRollback?: (snapshotId: string) => void;
  onPreview?: (snapshotId: string) => void;
  onCompare?: (snapshotA: string, snapshotB: string) => void;
}

export function VersionHistory({ 
  projectId, 
  currentVersion,
  onRollback, 
  onPreview,
  onCompare 
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showAutoSaves, setShowAutoSaves] = useState(false);

  useEffect(() => {
    loadVersionHistory();
  }, [projectId, showAutoSaves]);

  async function loadVersionHistory() {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/version-control/project/${projectId}?includeAutoSaves=${showAutoSaves}`
      );
      const data = await response.json();
      if (data.success) {
        setVersions(data.snapshots);
      }
    } catch (error) {
      console.error('Failed to load version history:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleVersionSelect(id: string) {
    setSelectedVersions(prev => {
      if (prev.includes(id)) {
        return prev.filter(v => v !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  }

  function handleCompare() {
    if (selectedVersions.length === 2) {
      onCompare?.(selectedVersions[0], selectedVersions[1]);
    }
  }

  function formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAutoSaves(!showAutoSaves)}
            >
              {showAutoSaves ? 'Hide' : 'Show'} Auto-saves
            </Button>
            {selectedVersions.length === 2 && (
              <Button size="sm" onClick={handleCompare}>
                <GitCompare className="h-4 w-4 mr-1" />
                Compare
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {versions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Save className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No versions saved yet</p>
                <p className="text-sm">Changes will be saved automatically</p>
              </div>
            ) : (
              versions.map((version) => (
                <div
                  key={version.id}
                  className={`
                    p-3 rounded-lg border transition-colors cursor-pointer
                    ${selectedVersions.includes(version.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                    }
                    ${version.version === currentVersion ? 'ring-2 ring-primary/30' : ''}
                  `}
                  onClick={() => handleVersionSelect(version.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">v{version.version}</span>
                        {version.isAutoSave && (
                          <Badge variant="secondary" className="text-xs">
                            Auto-save
                          </Badge>
                        )}
                        {version.version === currentVersion && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {version.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(version.timestamp)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {version.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          {version.branch}
                        </span>
                      </div>
                      {version.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          {version.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview?.(version.id);
                        }}
                        title="Preview this version"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {version.version !== currentVersion && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRollback?.(version.id);
                          }}
                          title="Rollback to this version"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * Visual Diff Viewer
 */
interface DiffViewerProps {
  snapshotA: string;
  snapshotB: string;
  diff?: {
    changes: {
      html: { hunks: any[] };
      css: { hunks: any[] };
      js?: { hunks: any[] };
    };
    summary: {
      linesAdded: number;
      linesRemoved: number;
      filesChanged: number;
    };
  };
}

export function DiffViewer({ snapshotA, snapshotB, diff }: DiffViewerProps) {
  const [activeFile, setActiveFile] = useState<'html' | 'css' | 'js'>('html');

  if (!diff) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const hunks = diff.changes[activeFile]?.hunks || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GitCompare className="h-5 w-5" />
            Changes
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600">+{diff.summary.linesAdded}</span>
            <span className="text-red-600">-{diff.summary.linesRemoved}</span>
            <span className="text-muted-foreground">{diff.summary.filesChanged} files</span>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          {(['html', 'css', 'js'] as const).map(file => (
            <Button
              key={file}
              variant={activeFile === file ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFile(file)}
              disabled={file === 'js' && !diff.changes.js}
            >
              {file.toUpperCase()}
              {diff.changes[file]?.hunks.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {diff.changes[file]?.hunks.length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <pre className="text-sm font-mono">
            {hunks.map((hunk, hunkIndex) => (
              <div key={hunkIndex} className="mb-4">
                <div className="bg-muted px-2 py-1 text-muted-foreground text-xs">
                  @@ -{hunk.startLineA},{hunk.countA} +{hunk.startLineB},{hunk.countB} @@
                </div>
                {hunk.lines.map((line: any, lineIndex: number) => (
                  <div
                    key={lineIndex}
                    className={`px-2 ${
                      line.type === 'added' 
                        ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                        : line.type === 'removed'
                          ? 'bg-red-500/10 text-red-700 dark:text-red-400'
                          : ''
                    }`}
                  >
                    <span className="inline-block w-6 text-muted-foreground mr-2">
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                    </span>
                    {line.content}
                  </div>
                ))}
              </div>
            ))}
            {hunks.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No changes in this file
              </div>
            )}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default VersionHistory;

