import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { useState } from 'react';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface FileTreeProps {
  files?: FileNode[];
  onFileSelect?: (path: string) => void;
}

function FileTreeNode({
  node,
  level = 0,
  path = '',
  onFileSelect,
}: {
  node: FileNode;
  level?: number;
  path?: string;
  onFileSelect?: (path: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const fullPath = path ? `${path}/${node.name}` : node.name;

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect?.(fullPath);
    }
  };

  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover-elevate active-elevate-2 rounded-sm"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        data-testid={`file-tree-${node.type}-${node.name}`}
      >
        {node.type === 'folder' ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-primary" />
            ) : (
              <Folder className="h-4 w-4 text-primary" />
            )}
          </>
        ) : (
          <>
            <span className="w-3" />
            <File className="h-4 w-4 text-muted-foreground" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child, idx) => (
            <FileTreeNode
              key={idx}
              node={child}
              level={level + 1}
              path={fullPath}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ files, onFileSelect }: FileTreeProps) {
  const defaultFiles: FileNode[] = [
    {
      name: 'src',
      type: 'folder',
      children: [
        { name: 'App.tsx', type: 'file' },
        { name: 'main.tsx', type: 'file' },
        { name: 'index.css', type: 'file' },
        {
          name: 'components',
          type: 'folder',
          children: [
            { name: 'Header.tsx', type: 'file' },
            { name: 'Footer.tsx', type: 'file' },
          ],
        },
      ],
    },
    {
      name: 'public',
      type: 'folder',
      children: [{ name: 'favicon.png', type: 'file' }],
    },
    { name: 'package.json', type: 'file' },
    { name: 'tsconfig.json', type: 'file' },
  ];

  const fileStructure = files || defaultFiles;

  return (
    <div className="h-full overflow-y-auto py-2">
      {fileStructure.map((node, idx) => (
        <FileTreeNode key={idx} node={node} onFileSelect={onFileSelect} />
      ))}
    </div>
  );
}

export type { FileNode };
