/**
 * Real-time Collaboration Hook - 120% Feature
 * Connect to WebSocket for multi-user editing
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface CollaboratorCursor {
  odId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  selection?: {
    start: number;
    end: number;
  };
}

export interface DocumentOperation {
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content?: string;
  length?: number;
  userId: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

export interface CollaborationState {
  connected: boolean;
  roomId: string | null;
  collaborators: CollaboratorCursor[];
  operations: DocumentOperation[];
  chatMessages: ChatMessage[];
}

interface UseCollaborationOptions {
  projectId: string;
  userId: string;
  userName: string;
  onRemoteOperation?: (op: DocumentOperation) => void;
  onCursorUpdate?: (cursor: CollaboratorCursor) => void;
  onChatMessage?: (message: ChatMessage) => void;
}

export function useCollaboration(options: UseCollaborationOptions) {
  const { projectId, userId, userName, onRemoteOperation, onCursorUpdate, onChatMessage } = options;
  
  const [state, setState] = useState<CollaborationState>({
    connected: false,
    roomId: null,
    collaborators: [],
    operations: [],
    chatMessages: [],
  });
  
  const socketRef = useRef<Socket | null>(null);
  const cursorColorRef = useRef(generateRandomColor());

  // Generate random color for cursor
  function generateRandomColor(): string {
    const colors = [
      '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Connect to collaboration server
  useEffect(() => {
    if (!projectId || !userId) return;

    const socket = io(window.location.origin, {
      path: '/collaboration',
      query: {
        projectId,
        userId,
        userName,
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Collaboration] Connected');
      setState(prev => ({ ...prev, connected: true }));
      
      // Join room
      socket.emit('join-room', {
        roomId: projectId,
        userId,
        userName,
        color: cursorColorRef.current,
      });
    });

    socket.on('disconnect', () => {
      console.log('[Collaboration] Disconnected');
      setState(prev => ({ ...prev, connected: false }));
    });

    socket.on('room-joined', (data: { roomId: string; collaborators: CollaboratorCursor[] }) => {
      console.log('[Collaboration] Joined room:', data.roomId);
      setState(prev => ({
        ...prev,
        roomId: data.roomId,
        collaborators: data.collaborators,
      }));
    });

    socket.on('collaborator-joined', (cursor: CollaboratorCursor) => {
      console.log('[Collaboration] Collaborator joined:', cursor.name);
      setState(prev => ({
        ...prev,
        collaborators: [...prev.collaborators.filter(c => c.odId !== cursor.odId), cursor],
      }));
    });

    socket.on('collaborator-left', (data: { odId: string }) => {
      console.log('[Collaboration] Collaborator left:', data.odId);
      setState(prev => ({
        ...prev,
        collaborators: prev.collaborators.filter(c => c.odId !== data.odId),
      }));
    });

    socket.on('cursor-update', (cursor: CollaboratorCursor) => {
      setState(prev => ({
        ...prev,
        collaborators: prev.collaborators.map(c => 
          c.odId === cursor.odId ? cursor : c
        ),
      }));
      onCursorUpdate?.(cursor);
    });

    socket.on('operation', (op: DocumentOperation) => {
      console.log('[Collaboration] Received operation:', op.type);
      setState(prev => ({
        ...prev,
        operations: [...prev.operations, op],
      }));
      onRemoteOperation?.(op);
    });

    socket.on('chat-message', (message: ChatMessage) => {
      setState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, message],
      }));
      onChatMessage?.(message);
    });

    socket.on('error', (error: { message: string }) => {
      console.error('[Collaboration] Error:', error.message);
    });

    return () => {
      socket.emit('leave-room', { roomId: projectId, odId: userId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [projectId, userId, userName, onRemoteOperation, onCursorUpdate, onChatMessage]);

  // Send cursor position
  const updateCursor = useCallback((x: number, y: number, selection?: { start: number; end: number }) => {
    if (!socketRef.current || !state.connected) return;

    socketRef.current.emit('cursor-move', {
      roomId: projectId,
      cursor: {
        odId: userId,
        name: userName,
        color: cursorColorRef.current,
        x,
        y,
        selection,
      },
    });
  }, [state.connected, projectId, userId, userName]);

  // Send document operation
  const sendOperation = useCallback((op: Omit<DocumentOperation, 'userId' | 'timestamp'>) => {
    if (!socketRef.current || !state.connected) return;

    const fullOp: DocumentOperation = {
      ...op,
      userId,
      timestamp: Date.now(),
    };

    socketRef.current.emit('operation', {
      roomId: projectId,
      operation: fullOp,
    });

    setState(prev => ({
      ...prev,
      operations: [...prev.operations, fullOp],
    }));
  }, [state.connected, projectId, userId]);

  // Send chat message
  const sendChatMessage = useCallback((content: string) => {
    if (!socketRef.current || !state.connected) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName,
      content,
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit('chat-message', {
      roomId: projectId,
      message,
    });

    setState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, message],
    }));
  }, [state.connected, projectId, userId, userName]);

  // Request document sync
  const requestSync = useCallback(() => {
    if (!socketRef.current || !state.connected) return;

    socketRef.current.emit('request-sync', {
      roomId: projectId,
      userId,
    });
  }, [state.connected, projectId, userId]);

  return {
    ...state,
    updateCursor,
    sendOperation,
    sendChatMessage,
    requestSync,
    isConnected: state.connected,
  };
}

/**
 * Collaboration Cursor Overlay Component
 */
export function CollaboratorCursors({ collaborators }: { collaborators: CollaboratorCursor[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {collaborators.map(cursor => (
        <div
          key={cursor.odId}
          className="absolute transition-all duration-100"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-2px, -2px)',
          }}
        >
          {/* Cursor */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={cursor.color}
            className="drop-shadow-md"
          >
            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.37 2.78a.5.5 0 0 0-.87.43z" />
          </svg>
          {/* Name label */}
          <div
            className="absolute left-6 top-0 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </div>
  );
}

export default useCollaboration;

