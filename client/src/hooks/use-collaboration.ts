import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './use-websocket';
import {
  CollaborationUser,
  CollaborationMessage,
  CursorPosition,
  Selection,
} from '@/types/collaboration';

const USER_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#f97316',
];

interface UseCollaborationOptions {
  projectId: string;
  userId: string;
  username: string;
  enabled?: boolean; // Feature flag to disable WebSocket
}

export function useCollaboration({
  projectId,
  userId,
  username,
  enabled = true,
}: UseCollaborationOptions) {
  const [users, setUsers] = useState<Map<string, CollaborationUser>>(() => new Map());
  const [isConnected, setIsConnected] = useState(false);

  const handleMessage = useCallback((message: CollaborationMessage) => {
    switch (message.type) {
      case 'presence':
        setUsers(prev => {
          const newUsers = new Map(prev);
          const userData = message.data;

          if (userData.action === 'joined') {
            newUsers.set(message.userId, {
              id: message.userId,
              username: message.userId, // In production, fetch actual username
              color: USER_COLORS[Array.from(newUsers.keys()).length % USER_COLORS.length],
              isActive: true,
            });
          } else if (userData.action === 'left') {
            newUsers.delete(message.userId);
          }

          return newUsers;
        });
        break;

      case 'cursor':
        setUsers(prev => {
          const newUsers = new Map(prev);
          const user = newUsers.get(message.userId);
          if (user) {
            newUsers.set(message.userId, {
              ...user,
              cursor: message.data.position,
              isActive: true,
            });
          }
          return newUsers;
        });
        break;

      case 'selection':
        setUsers(prev => {
          const newUsers = new Map(prev);
          const user = newUsers.get(message.userId);
          if (user) {
            newUsers.set(message.userId, {
              ...user,
              selection: message.data.selection,
              isActive: true,
            });
          }
          return newUsers;
        });
        break;
    }
  }, []);

  const { sendMessage, isConnected: wsConnected } = useWebSocket({
    projectId,
    userId,
    onMessage: handleMessage,
    onConnect: () => setIsConnected(true),
    onDisconnect: () => setIsConnected(false),
    enabled, // Pass enabled flag to WebSocket hook
  });

  const sendCursorUpdate = useCallback(
    (position: CursorPosition) => {
      sendMessage({
        type: 'cursor',
        projectId,
        userId,
        data: { position },
      });
    },
    [sendMessage, projectId, userId]
  );

  const sendSelectionUpdate = useCallback(
    (selection: Selection) => {
      sendMessage({
        type: 'selection',
        projectId,
        userId,
        data: { selection },
      });
    },
    [sendMessage, projectId, userId]
  );

  const sendEditOperation = useCallback(
    (operation: any) => {
      sendMessage({
        type: 'edit',
        projectId,
        userId,
        data: operation,
      });
    },
    [sendMessage, projectId, userId]
  );

  // Remove redundant useEffect - wsConnected is already being used directly
  // This was causing unnecessary re-renders

  // Return disabled state if collaboration is disabled
  if (!enabled) {
    return {
      users: new Map<string, CollaborationUser>(),
      isConnected: false,
      sendCursorUpdate: () => {},
      sendSelectionUpdate: () => {},
      sendEditOperation: () => {},
    };
  }

  return {
    users,
    isConnected: wsConnected, // Use wsConnected directly instead of separate state
    sendCursorUpdate,
    sendSelectionUpdate,
    sendEditOperation,
  };
}
