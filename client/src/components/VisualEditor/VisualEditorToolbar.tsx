/**
 * Visual Editor Toolbar
 * Top toolbar with mode switching, undo/redo, and actions
 */

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Undo2,
  Redo2,
  Save,
  Maximize2,
  Minimize2,
  X,
  MousePointer2,
  Move,
  Maximize,
  Eye,
  Code,
  Download,
} from 'lucide-react';
import type { EditorMode, SelectionMode } from './VisualEditor';

export interface VisualEditorToolbarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  selectionMode: SelectionMode;
  onSelectionModeChange: (mode: SelectionMode) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  onExport?: (format: 'html' | 'zip') => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  onClose?: () => void;
}

export function VisualEditorToolbar({
  mode,
  onModeChange,
  selectionMode,
  onSelectionModeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  onExport,
  onFullscreen,
  isFullscreen,
  onClose,
}: VisualEditorToolbarProps) {
  return (
    <div className="border-b bg-background px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold">Visual Editor</h2>
        <Separator orientation="vertical" className="h-4" />
        
        {/* Selection Mode */}
        <div className="flex items-center gap-1 bg-muted rounded-md p-1">
          <Button
            variant={selectionMode === 'select' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onSelectionModeChange('select')}
            className="h-7 px-2"
          >
            <MousePointer2 className="w-4 h-4" />
          </Button>
          <Button
            variant={selectionMode === 'move' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onSelectionModeChange('move')}
            className="h-7 px-2"
          >
            <Move className="w-4 h-4" />
          </Button>
          <Button
            variant={selectionMode === 'resize' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onSelectionModeChange('resize')}
            className="h-7 px-2"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* History */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-8"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-8"
        >
          <Redo2 className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-4" />

        {/* Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          className="h-8 gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </Button>
        
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('zip')}
            className="h-8 gap-2"
            title="Export as ZIP"
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onFullscreen}
          className="h-8"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>

        {onClose && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

