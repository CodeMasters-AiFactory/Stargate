import React, { createContext, useContext, useMemo, useEffect, useRef } from 'react';
import { useIDE } from '@/hooks/use-ide';
import { useCollaboration } from '@/hooks/use-collaboration';
import { IDEState, Tab } from '@/types/ide';
import { CollaborationUser } from '@/types/collaboration';
import { trackRender } from '@/utils/renderTracker';

interface IDEContextType {
  state: IDEState;
  openFile: (filePath: string) => void;
  closeTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  saveFile: (tabId: string) => Promise<void>;
  createFile: (path: string) => void;
  deleteFile: (path: string) => void;
  setState: React.Dispatch<React.SetStateAction<IDEState>>;
  isLoading: boolean;
  collaborationUsers: CollaborationUser[];
  isCollaborationConnected: boolean;
}

const IDEContext = createContext<IDEContextType | undefined>(undefined);

export const IDEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ide = useIDE();
  const prevIdeRef = useRef(ide);
  const prevCollaborationRef = useRef<{ usersSize: number; isConnected: boolean }>({
    usersSize: 0,
    isConnected: false,
  });

  // DISABLED: Collaboration WebSocket to prevent flickering and excessive re-renders
  // Enable only when collaboration features are actually needed
  const ENABLE_COLLABORATION = false;

  const collaboration = useCollaboration({
    projectId: ide.state.currentProject?.id || 'no-project',
    userId: 'demo-user-1',
    username: 'demo',
    enabled: ENABLE_COLLABORATION && !!ide.state.currentProject?.id,
  });

  // Memoize collaboration users array to prevent unnecessary re-renders
  // Use size as dependency instead of Map object to prevent re-renders on Map reference changes
  const collaborationUsersArray = useMemo(() => {
    if (!ENABLE_COLLABORATION) return [];
    return Array.from(collaboration.users.values());
  }, [collaboration.users.size, ENABLE_COLLABORATION]); // Use size instead of Map object

  // Memoize value - ide object from useIDE hook is already memoized, so this should be stable
  // Only re-create when collaboration state changes (which is now disabled)
  const value: IDEContextType = useMemo(
    () => ({
      ...ide,
      isLoading: ide.state.isLoading,
      collaborationUsers: collaborationUsersArray,
      isCollaborationConnected: ENABLE_COLLABORATION && collaboration.isConnected,
    }),
    [ide, collaborationUsersArray, collaboration.isConnected, ENABLE_COLLABORATION]
  );

  // Track re-renders and identify cause - only when dependencies actually change
  useEffect(() => {
    const reasons: string[] = [];

    // Check if ide object reference changed
    if (prevIdeRef.current !== ide) {
      const prevState = prevIdeRef.current.state;
      const currState = ide.state;
      const changedKeys: string[] = [];

      if (prevState.currentView !== currState.currentView) changedKeys.push('currentView');
      if (prevState.currentProject?.id !== currState.currentProject?.id)
        changedKeys.push('currentProject');
      if (prevState.activeTabId !== currState.activeTabId) changedKeys.push('activeTabId');
      if (prevState.openTabs.length !== currState.openTabs.length)
        changedKeys.push('openTabs.length');
      if (prevState.fileTree.length !== currState.fileTree.length)
        changedKeys.push('fileTree.length');
      if (prevState.isLoading !== currState.isLoading) changedKeys.push('isLoading');

      if (changedKeys.length > 0) {
        reasons.push(`IDE state: ${changedKeys.join(', ')}`);
      } else {
        reasons.push('IDE object reference changed (but state appears same)');
      }
      prevIdeRef.current = ide;
    }

    // Check if collaboration changed
    if (
      prevCollaborationRef.current.usersSize !== collaboration.users.size ||
      prevCollaborationRef.current.isConnected !== collaboration.isConnected
    ) {
      reasons.push(
        `Collaboration: users=${collaboration.users.size}, connected=${collaboration.isConnected}`
      );
      prevCollaborationRef.current = {
        usersSize: collaboration.users.size,
        isConnected: collaboration.isConnected,
      };
    }

    // Only track if there's an actual reason (something changed)
    if (reasons.length > 0) {
      trackRender('IDEProvider', reasons.join(' | '));
    }
  }, [ide, collaboration.users.size, collaboration.isConnected]); // Only track when these change

  return <IDEContext.Provider value={value}>{children}</IDEContext.Provider>;
};

export function useIDEContext() {
  const context = useContext(IDEContext);
  if (!context) {
    throw new Error('useIDEContext must be used within an IDEProvider');
  }
  return context;
}
