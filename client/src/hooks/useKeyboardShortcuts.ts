/**
 * Keyboard Shortcuts Hook
 * Phase 4.2: UI/UX Polish - Keyboard shortcuts for better UX
 */

import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
}

/**
 * Register keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
                          event.code.toLowerCase() === shortcut.key.toLowerCase();

        if (!keyMatches) continue;

        const ctrlMatches = shortcut.ctrl === undefined || (event.ctrlKey === shortcut.ctrl);
        const shiftMatches = shortcut.shift === undefined || (event.shiftKey === shortcut.shift);
        const altMatches = shortcut.alt === undefined || (event.altKey === shortcut.alt);
        const metaMatches = shortcut.meta === undefined || (event.metaKey === shortcut.meta);

        if (ctrlMatches && shiftMatches && altMatches && metaMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}

/**
 * Common keyboard shortcuts for the editor
 */
export const EDITOR_SHORTCUTS: Array<{ key: string; description: string }> = [
  { key: 'Ctrl+S', description: 'Save' },
  { key: 'Ctrl+Z', description: 'Undo' },
  { key: 'Ctrl+Y', description: 'Redo' },
  { key: 'Ctrl+B', description: 'Bold' },
  { key: 'Ctrl+I', description: 'Italic' },
  { key: 'Ctrl+/', description: 'Show shortcuts' },
  { key: 'Escape', description: 'Close dialog' },
  { key: 'Delete', description: 'Delete selected' },
];

