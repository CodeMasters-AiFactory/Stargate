import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIDE } from '@/hooks/use-ide';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Code,
  Palette,
  Settings,
  FilePlus,
  FolderPlus,
  RefreshCw,
  Play,
  Package,
  FlaskConical,
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Edit3,
  Download,
} from 'lucide-react';
import { FileNode } from '@/types/ide';

interface FileExplorerProps {
  isVisible: boolean;
}

export function FileExplorer({ isVisible }: FileExplorerProps) {
  const { state, setState, openFile, createFile, deleteFile, renameFile, moveFile, createFolder } =
    useIDE();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['src', 'src/components'])
  );
  const [renamingNode, setRenamingNode] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [clipboardItem, setClipboardItem] = useState<{ path: string; type: 'cut' | 'copy' } | null>(
    null
  );

  if (!isVisible) return null;

  const getFileIcon = (fileName: string, type: 'file' | 'folder', isOpen?: boolean) => {
    if (type === 'folder') {
      return isOpen ? (
        <FolderOpen className="w-4 h-4 text-blue-400" />
      ) : (
        <Folder className="w-4 h-4 text-blue-400" />
      );
    }

    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, { icon: React.ComponentType<any>; color: string }> = {
      jsx: { icon: Code, color: 'text-orange-400' },
      js: { icon: Code, color: 'text-orange-400' },
      tsx: { icon: Code, color: 'text-blue-400' },
      ts: { icon: Code, color: 'text-blue-400' },
      css: { icon: Palette, color: 'text-blue-300' },
      json: { icon: Settings, color: 'text-gray-400' },
      md: { icon: FileText, color: 'text-gray-400' },
    };

    const iconInfo = iconMap[ext || ''] || { icon: FileText, color: 'text-gray-400' };
    const IconComponent = iconInfo.icon;

    return <IconComponent className={`w-4 h-4 ${iconInfo.color}`} />;
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  // File operation handlers
  const handleRename = (node: FileNode) => {
    setRenamingNode(node.path);
    setRenameValue(node.name);
  };

  const handleRenameSubmit = (oldPath: string) => {
    if (!renameValue.trim() || renameValue === oldPath.split('/').pop()) {
      setRenamingNode(null);
      return;
    }

    const pathParts = oldPath.split('/');
    pathParts[pathParts.length - 1] = renameValue.trim();
    const newPath = pathParts.join('/');

    renameFile(oldPath, newPath);
    setRenamingNode(null);
  };

  const handleCopy = (node: FileNode) => {
    setClipboardItem({ path: node.path, type: 'copy' });
  };

  const handleCut = (node: FileNode) => {
    setClipboardItem({ path: node.path, type: 'cut' });
  };

  const handlePaste = (targetPath: string) => {
    if (!clipboardItem || !state.currentProject) return;

    const sourcePath = clipboardItem.path;
    const sourceName = sourcePath.split('/').pop() || '';
    const targetFolder = targetPath.endsWith('/') ? targetPath : `${targetPath}/`;
    const newPath = `${targetFolder}${sourceName}`;

    if (clipboardItem.type === 'cut') {
      moveFile(sourcePath, newPath);
    } else {
      // Copy: create a new file with the same content
      const sourceContent = state.currentProject.files[sourcePath] || '';
      // Create file and then update its content
      createFile(newPath);
      // Update content immediately after creation
      setState(prev => {
        if (!prev.currentProject) return prev;
        const updatedFiles = {
          ...prev.currentProject.files,
          [newPath]: sourceContent,
        };
        return {
          ...prev,
          currentProject: {
            ...prev.currentProject,
            files: updatedFiles,
          },
        };
      });
    }

    setClipboardItem(null);
  };

  const handleDelete = (node: FileNode) => {
    if (confirm(`Are you sure you want to delete "${node.name}"?`)) {
      deleteFile(node.path);
    }
  };

  const handleDownload = (node: FileNode) => {
    if (node.type !== 'file' || !state.currentProject) return;

    const content = state.currentProject.files[node.path] || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = node.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderFileNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const hasChanges = node.isDirty;
    const isRenaming = renamingNode === node.path;

    const nodeContent = (
      <div
        className={`flex items-center px-2 py-1 rounded text-sm cursor-pointer hover:bg-accent ${
          depth > 0 ? `ml-${depth * 4}` : ''
        } ${clipboardItem?.type === 'cut' && clipboardItem.path === node.path ? 'opacity-50' : ''}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => {
          if (isRenaming) return;
          if (node.type === 'folder') {
            toggleFolder(node.path);
          } else {
            openFile(node.path);
          }
        }}
        data-testid={`file-tree-${node.path}`}
      >
        {node.type === 'folder' && (
          <Button
            variant="ghost"
            size="sm"
            className="w-3 h-3 p-0 mr-1"
            onClick={e => {
              e.stopPropagation();
              toggleFolder(node.path);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </Button>
        )}
        {node.type === 'file' && <div className="w-4 mr-1" />}

        {getFileIcon(node.name, node.type, isExpanded)}

        {isRenaming ? (
          <Input
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={() => handleRenameSubmit(node.path)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleRenameSubmit(node.path);
              } else if (e.key === 'Escape') {
                setRenamingNode(null);
              }
            }}
            className="ml-2 flex-1 h-6 text-sm"
            autoFocus
            data-testid={`rename-input-${node.path}`}
          />
        ) : (
          <span className="ml-2 flex-1">{node.name}</span>
        )}

        {hasChanges && !isRenaming && (
          <div className="w-2 h-2 bg-amber-400 rounded-full ml-auto" title="Unsaved changes" />
        )}
      </div>
    );

    return (
      <div key={node.path}>
        <ContextMenu>
          <ContextMenuTrigger>{nodeContent}</ContextMenuTrigger>
          <ContextMenuContent>
            {node.type === 'file' && (
              <>
                <ContextMenuItem
                  onClick={() => openFile(node.path)}
                  data-testid={`menu-open-${node.path}`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Open
                </ContextMenuItem>
                <ContextMenuSeparator />
              </>
            )}

            <ContextMenuItem
              onClick={() => handleCopy(node)}
              data-testid={`menu-copy-${node.path}`}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCut(node)} data-testid={`menu-cut-${node.path}`}>
              <Scissors className="w-4 h-4 mr-2" />
              Cut
            </ContextMenuItem>

            {node.type === 'folder' && clipboardItem && (
              <ContextMenuItem
                onClick={() => handlePaste(node.path)}
                data-testid={`menu-paste-${node.path}`}
              >
                <Clipboard className="w-4 h-4 mr-2" />
                Paste
              </ContextMenuItem>
            )}

            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => handleRename(node)}
              data-testid={`menu-rename-${node.path}`}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Rename
            </ContextMenuItem>

            {node.type === 'file' && (
              <ContextMenuItem
                onClick={() => handleDownload(node)}
                data-testid={`menu-download-${node.path}`}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </ContextMenuItem>
            )}

            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => handleDelete(node)}
              className="text-destructive focus:text-destructive"
              data-testid={`menu-delete-${node.path}`}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {node.type === 'folder' && isExpanded && node.children && (
          <div>{node.children.map(child => renderFileNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  const handleCreateFile = () => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      createFile(fileName);
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName && folderName.trim()) {
      createFolder(folderName.trim());
    }
  };

  return (
    <div className="h-full bg-card border-r border flex flex-col">
      {/* Explorer Header */}
      <div className="px-4 py-3 border-b border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground">EXPLORER</h2>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0"
              title="New File"
              onClick={handleCreateFile}
              data-testid="button-new-file"
            >
              <FilePlus className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0"
              title="New Folder"
              onClick={handleCreateFolder}
              data-testid="button-new-folder"
            >
              <FolderPlus className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0"
              title="Refresh Explorer"
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Project Info */}
        <div className="flex items-center space-x-2 text-sm">
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{state.currentProject?.name || 'Loading...'}</span>
          <div className="flex items-center space-x-1 ml-auto">
            <span className="bg-green-500 w-2 h-2 rounded-full"></span>
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto p-2 scrollbar-thin">
        {state.fileTree.map(node => renderFileNode(node))}
      </div>

      {/* NPM Scripts Panel */}
      <div className="border-t border p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase">NPM Scripts</h3>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start h-auto p-2 text-xs"
            data-testid="script-start"
          >
            <Play className="w-3 h-3 mr-2 text-green-400" />
            <span>start</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-auto p-2 text-xs"
            data-testid="script-build"
          >
            <Package className="w-3 h-3 mr-2 text-blue-400" />
            <span>build</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-auto p-2 text-xs"
            data-testid="script-test"
          >
            <FlaskConical className="w-3 h-3 mr-2 text-purple-400" />
            <span>test</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
