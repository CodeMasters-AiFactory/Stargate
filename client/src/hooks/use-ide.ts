import { apiRequest } from '@/lib/queryClient';
import { FileNode, IDEState, Tab } from '@/types/ide';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// Storage key for persisting current view
const VIEW_STORAGE_KEY = 'stargate-current-view';

// Get persisted view from localStorage or URL
function getPersistedView(): IDEState['currentView'] {
  // First check URL path
  const path = window.location.pathname;
  if (path === '/stargate-websites' || path === '/merlin' || path === '/wizard') {
    return 'stargate-websites';
  }
  if (path === '/admin') {
    return 'admin';
  }

  // Check URL query param
  const searchParams = new URLSearchParams(window.location.search);
  const viewParam = searchParams.get('view');
  if (viewParam) {
    return viewParam as IDEState['currentView'];
  }

  // Then check localStorage
  try {
    const saved = localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved) {
      return saved as IDEState['currentView'];
    }
  } catch (e) {
    // localStorage not available
  }

  // Default to landing only if nothing is persisted
  return 'landing';
}

const initialState: IDEState = {
  currentProject: null,
  openTabs: [],
  activeTabId: null,
  fileTree: [],
  isLoading: false,
  bottomPanelHeight: 320,
  rightPanelWidth: 320,
  leftPanelWidth: 320,
  activeBottomPanel: 'terminal',
  currentView: getPersistedView(), // Restore persisted view on load
};

interface IDEContextType {
  state: IDEState;
  setState: React.Dispatch<React.SetStateAction<IDEState>>;
  openFile: (path: string) => void;
  closeTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  saveFile: (tabId: string) => Promise<void>;
  createFile: (path: string) => void;
  deleteFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  moveFile: (sourcePath: string, targetPath: string) => void;
  createFolder: (path: string) => void;
}

const IDEContext = createContext<IDEContextType | undefined>(undefined);

export function IDEProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IDEState>(initialState);
  const queryClient = useQueryClient();

  // PERSIST currentView to localStorage whenever it changes
  // This ensures the view survives refresh, errors, and page reloads
  useEffect(() => {
    if (state.currentView) {
      try {
        localStorage.setItem(VIEW_STORAGE_KEY, state.currentView);
        console.log(`[IDEProvider] View persisted: ${state.currentView}`);
      } catch (e) {
        // localStorage not available
      }
    }
  }, [state.currentView]);

  // DISABLED: Demo project queries completely removed to eliminate 404 errors
  // These were causing unnecessary API calls on every page load
  // Project data will only be loaded when user actually selects/creates a project
  const project = null;
  const files = null;

  const updateFileMutation = useMutation({
    mutationFn: async ({ path, content }: { path: string; content: string }) => {
      if (!state.currentProject) throw new Error('No project loaded');
      return apiRequest('PUT', `/api/projects/${state.currentProject.id}/files/${path}`, {
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/projects', state.currentProject?.id, 'files'],
      });
    },
  });

  // Convert files to file tree
  const buildFileTree = useCallback((files: Record<string, string>): FileNode[] => {
    const tree: FileNode[] = [];
    const pathMap: Map<string, FileNode> = new Map();

    Object.keys(files).forEach(filePath => {
      const parts = filePath.split('/');
      let currentPath = '';

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!pathMap.has(currentPath)) {
          const node: FileNode = {
            name: part,
            path: currentPath,
            type: isLast ? 'file' : 'folder',
            children: isLast ? undefined : [],
            isOpen: true,
          };

          pathMap.set(currentPath, node);

          if (index === 0) {
            tree.push(node);
          } else {
            const parentPath = parts.slice(0, index).join('/');
            const parent = pathMap.get(parentPath);
            if (parent && parent.children) {
              parent.children.push(node);
            }
          }
        }
      });
    });

    return tree;
  }, []);

  // Update state when project/files load
  useEffect(() => {
    if (project && files) {
      const fileMap: Record<string, string> = (files as Record<string, string>) || {};
      const projectData = project as any; // Type assertion to handle API response
      setState(prev => {
        const newState = {
          ...prev,
          currentProject: {
            id: projectData?.id || 'demo-project-1',
            name: projectData?.name || 'Demo Project',
            isPublic: projectData?.isPublic || false,
            template: projectData?.template || 'react',
            files: fileMap,
          },
          fileTree: buildFileTree(fileMap),
          isLoading: false,
        };

        // Open App.jsx by default (check in the same state update to avoid loop)
        if (fileMap['src/App.jsx'] && !newState.openTabs.find(tab => tab.path === 'src/App.jsx')) {
          const fileName = 'App.jsx';
          const filePath = 'src/App.jsx';
          const content = fileMap[filePath] || '';
          const newTab: Tab = {
            id: `${filePath}-${Date.now()}`,
            path: filePath,
            name: fileName,
            content,
            isDirty: false,
            language: 'javascript',
          };

          return {
            ...newState,
            openTabs: [...newState.openTabs, newTab],
            activeTabId: newTab.id,
          };
        }

        return newState;
      });
    }
  }, [project, files, buildFileTree]); // Removed state.openTabs to prevent loop

  const openFile = useCallback(
    (filePath: string) => {
      if (!state.currentProject) return;

      const content = state.currentProject.files?.[filePath] || '';
      const existingTab = state.openTabs.find(tab => tab.path === filePath);

      if (existingTab) {
        setState(prev => ({ ...prev, activeTabId: existingTab.id }));
        return;
      }

      const fileName = filePath.split('/').pop() || filePath;
      const newTab: Tab = {
        id: `${filePath}-${Date.now()}`,
        path: filePath,
        name: fileName,
        content,
        isDirty: false,
        language: getLanguageFromPath(filePath),
      };

      setState(prev => ({
        ...prev,
        openTabs: [...prev.openTabs, newTab],
        activeTabId: newTab.id,
      }));
    },
    [state.currentProject, state.openTabs]
  );

  const closeTab = useCallback((tabId: string) => {
    setState(prev => {
      const tabIndex = prev.openTabs.findIndex(tab => tab.id === tabId);
      if (tabIndex === -1) return prev;

      const newTabs = prev.openTabs.filter(tab => tab.id !== tabId);
      let newActiveTabId = prev.activeTabId;

      if (prev.activeTabId === tabId) {
        if (newTabs.length > 0) {
          const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
          newActiveTabId = newTabs[newActiveIndex]?.id || null;
        } else {
          newActiveTabId = null;
        }
      }

      return {
        ...prev,
        openTabs: newTabs,
        activeTabId: newActiveTabId,
      };
    });
  }, []);

  const updateTabContent = useCallback((tabId: string, content: string) => {
    setState(prev => {
      const updatedTabs = prev.openTabs.map(tab =>
        tab.id === tabId ? { ...tab, content, isDirty: true } : tab
      );
      return { ...prev, openTabs: updatedTabs };
    });
  }, []);

  const saveFile = useCallback(
    async (tabId: string) => {
      const tab = state.openTabs.find(t => t.id === tabId);
      if (!tab || !tab.isDirty) return;

      try {
        await updateFileMutation.mutateAsync({
          path: tab.path,
          content: tab.content,
        });

        setState(prev => ({
          ...prev,
          openTabs: prev.openTabs.map(t => (t.id === tabId ? { ...t, isDirty: false } : t)),
        }));
      } catch (error) {
        console.error('Failed to save file:', error);
      }
    },
    [state.openTabs, updateFileMutation]
  );

  const createFile = useCallback(
    (path: string) => {
      if (!state.currentProject) return;

      setState(prev => {
        if (!prev.currentProject) return prev;

        const updatedProject = {
          ...prev.currentProject,
          files: { ...prev.currentProject.files, [path]: '' },
        };

        return {
          ...prev,
          currentProject: updatedProject,
          fileTree: buildFileTree(updatedProject.files),
        };
      });

      openFile(path);
    },
    [state.currentProject, buildFileTree, openFile]
  );

  const deleteFile = useCallback(
    (path: string) => {
      if (!state.currentProject) return;

      setState(prev => {
        if (!prev.currentProject) return prev;

        const newFiles = { ...prev.currentProject.files };
        delete newFiles[path];

        const updatedProject = {
          ...prev.currentProject,
          files: newFiles,
        };

        // Close tab if open
        const tabToClose = prev.openTabs.find(tab => tab.path === path);
        let newTabs = prev.openTabs;
        let newActiveTabId = prev.activeTabId;

        if (tabToClose) {
          newTabs = prev.openTabs.filter(tab => tab.id !== tabToClose.id);
          if (prev.activeTabId === tabToClose.id) {
            newActiveTabId = newTabs.length > 0 ? newTabs[0].id : null;
          }
        }

        return {
          ...prev,
          currentProject: updatedProject,
          fileTree: buildFileTree(updatedProject.files),
          openTabs: newTabs,
          activeTabId: newActiveTabId,
        };
      });
    },
    [state.currentProject, buildFileTree]
  );

  const renameFile = useCallback(
    (oldPath: string, newPath: string) => {
      if (!state.currentProject) return;

      setState(prev => {
        if (!prev.currentProject) return prev;

        const newFiles = { ...prev.currentProject.files };
        if (newFiles[oldPath] !== undefined) {
          newFiles[newPath] = newFiles[oldPath];
          delete newFiles[oldPath];
        }

        const updatedProject = {
          ...prev.currentProject,
          files: newFiles,
        };

        // Update tabs if file is open
        const updatedTabs = prev.openTabs.map(tab => {
          if (tab.path === oldPath) {
            return {
              ...tab,
              path: newPath,
              name: newPath.split('/').pop() || newPath,
            };
          }
          return tab;
        });

        return {
          ...prev,
          currentProject: updatedProject,
          fileTree: buildFileTree(updatedProject.files),
          openTabs: updatedTabs,
        };
      });
    },
    [state.currentProject, buildFileTree]
  );

  const moveFile = useCallback(
    (sourcePath: string, targetPath: string) => {
      if (!state.currentProject) return;

      setState(prev => {
        if (!prev.currentProject) return prev;

        const newFiles = { ...prev.currentProject.files };
        if (newFiles[sourcePath] !== undefined) {
          newFiles[targetPath] = newFiles[sourcePath];
          delete newFiles[sourcePath];
        }

        const updatedProject = {
          ...prev.currentProject,
          files: newFiles,
        };

        // Update tabs if file is open
        const updatedTabs = prev.openTabs.map(tab => {
          if (tab.path === sourcePath) {
            return {
              ...tab,
              path: targetPath,
              name: targetPath.split('/').pop() || targetPath,
            };
          }
          return tab;
        });

        return {
          ...prev,
          currentProject: updatedProject,
          fileTree: buildFileTree(updatedProject.files),
          openTabs: updatedTabs,
        };
      });
    },
    [state.currentProject, buildFileTree]
  );

  const createFolder = useCallback(
    (path: string) => {
      if (!state.currentProject) return;

      // Folders are represented by having at least one file inside them
      // For now, we'll create a placeholder file to represent the folder
      // In a real implementation, you might want to track folders separately
      const folderPath = path.endsWith('/') ? path : `${path}/`;
      const placeholderFile = `${folderPath}.gitkeep`;

      setState(prev => {
        if (!prev.currentProject) return prev;

        const updatedProject = {
          ...prev.currentProject,
          files: { ...prev.currentProject.files, [placeholderFile]: '' },
        };

        return {
          ...prev,
          currentProject: updatedProject,
          fileTree: buildFileTree(updatedProject.files),
        };
      });
    },
    [state.currentProject, buildFileTree]
  );

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      css: 'css',
      html: 'html',
      json: 'json',
      md: 'markdown',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
    };
    return langMap[ext || ''] || 'text';
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<IDEContextType>(
    () => ({
      state,
      setState,
      openFile,
      closeTab,
      updateTabContent,
      saveFile,
      createFile,
      deleteFile,
      renameFile,
      moveFile,
      createFolder,
    }),
    [
      state,
      openFile,
      closeTab,
      updateTabContent,
      saveFile,
      createFile,
      deleteFile,
      renameFile,
      moveFile,
      createFolder,
    ]
  );

  return React.createElement(IDEContext.Provider, { value: contextValue }, children);
}

export function useIDE() {
  const context = useContext(IDEContext);
  if (!context) {
    throw new Error('useIDE must be used within IDEProvider');
  }
  return context;
}
