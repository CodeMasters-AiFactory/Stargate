/**
 * Cursor Overlay
 * Displays other users' cursors in real-time
 */

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface CursorOverlayProps {
  roomId: string;
  userId: string;
  userName: string;
  onCursorMove?: (x: number, y: number) => void;
}

export interface RemoteCursor {
  userId: string;
  userName: string;
  avatar?: string;
  x: number;
  y: number;
  color: string;
}

export function CursorOverlay({
  roomId,
  userId,
  userName,
  onCursorMove,
}: CursorOverlayProps) {
  const socketRef = useRef<Socket | null>(null);
  const cursorsRef = useRef<Map<string, RemoteCursor>>(new Map());
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    const socket = io(process.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('join-room', {
        roomId,
        userId,
        userName,
      });
    });

    // Listen for cursor updates
    socket.on('cursor-update', (data: { userId: string; cursor: { x: number; y: number } }) => {
      if (data.userId === userId) return;

      const cursor = cursorsRef.current.get(data.userId);
      if (cursor) {
        cursor.x = data.cursor.x;
        cursor.y = data.cursor.y;
      } else {
        // Generate color for new user
        const colors = [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
          '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
        ];
        const color = colors[data.userId.charCodeAt(0) % colors.length];

        cursorsRef.current.set(data.userId, {
          userId: data.userId,
          userName: data.userId, // Would get from server
          x: data.cursor.x,
          y: data.cursor.y,
          color,
        });
      }

      updateCursors();
    });

    // Listen for user left
    socket.on('user-left', (data: { userId: string }) => {
      cursorsRef.current.delete(data.userId);
      updateCursors();
    });

    socketRef.current = socket;

    // Track local cursor movement
    const handleMouseMove = (e: MouseEvent) => {
      socket.emit('cursor-move', {
        roomId,
        userId,
        cursor: { x: e.clientX, y: e.clientY },
      });

      if (onCursorMove) {
        onCursorMove(e.clientX, e.clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      socket.emit('leave-room', { roomId });
      socket.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [roomId, userId, userName, onCursorMove]);

  const updateCursors = () => {
    if (!overlayRef.current) return;

    // Clear existing cursors
    overlayRef.current.innerHTML = '';

    // Render all remote cursors
    cursorsRef.current.forEach(cursor => {
      const cursorElement = document.createElement('div');
      cursorElement.className = 'absolute pointer-events-none z-50';
      cursorElement.style.left = `${cursor.x}px`;
      cursorElement.style.top = `${cursor.y}px`;
      cursorElement.style.transform = 'translate(-50%, -50%)';

      cursorElement.innerHTML = `
        <div class="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 3L17 17M17 3L3 17" stroke="${cursor.color}" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <div class="px-2 py-1 rounded text-xs font-medium text-white" style="background-color: ${cursor.color}">
            ${cursor.userName}
          </div>
        </div>
      `;

      overlayRef.current?.appendChild(cursorElement);
    });
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ pointerEvents: 'none' }}
    />
  );
}

