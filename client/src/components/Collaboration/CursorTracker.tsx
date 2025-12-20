/**
 * Cursor Tracker
 * Displays real-time cursor positions of other collaborators
 */

import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { io, Socket } from 'socket.io-client';

export interface CursorTrackerProps {
  roomId: string;
  userId: string;
  userName: string;
  avatar?: string;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export interface RemoteCursor {
  userId: string;
  userName: string;
  avatar?: string;
  color: string;
  x: number;
  y: number;
  isActive: boolean;
}

export function CursorTracker({
  roomId,
  userId,
  userName,
  avatar,
  containerRef,
}: CursorTrackerProps) {
  const [cursors, setCursors] = useState<RemoteCursor[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const cursorRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketClient = io(process.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });

    socketClient.on('connect', () => {
      console.log('[CursorTracker] Connected to collaboration server');
      // Join room
      socketClient.emit('join-room', {
        roomId,
        userId,
        userName,
        avatar,
      });
    });

    // Listen for cursor updates
    socketClient.on('cursor-update', (data: { userId: string; cursor: { x: number; y: number } }) => {
      if (data.userId !== userId) {
        setCursors(prev => {
          const existing = prev.find(c => c.userId === data.userId);
          if (existing) {
            return prev.map(c =>
              c.userId === data.userId
                ? { ...c, x: data.cursor.x, y: data.cursor.y, isActive: true }
                : c
            );
          }
          return [...prev, {
            userId: data.userId,
            userName: data.userId, // Will be updated from user list
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            x: data.cursor.x,
            y: data.cursor.y,
            isActive: true,
          }];
        });
      }
    });

    // Listen for user list updates
    socketClient.on('users-update', (data: { users: Array<{ userId: string; userName: string; avatar?: string; cursor: { x: number; y: number } }> }) => {
      setCursors(data.users
        .filter(u => u.userId !== userId)
        .map(user => ({
          userId: user.userId,
          userName: user.userName,
          avatar: user.avatar,
          color: `hsl(${user.userId.charCodeAt(0) * 137.508 % 360}, 70%, 50%)`,
          x: user.cursor.x,
          y: user.cursor.y,
          isActive: true,
        }))
      );
    });

    // Listen for user leaving
    socketClient.on('user-left', (data: { userId: string }) => {
      setCursors(prev => prev.filter(c => c.userId !== data.userId));
    });

    setSocket(socketClient);

    // Track local cursor movement
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        socketClient.emit('cursor-move', {
          roomId,
          userId,
          cursor: { x, y },
        });
      }
    };

    const container = containerRef?.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      socketClient.emit('leave-room', { roomId });
      socketClient.disconnect();
    };
  }, [roomId, userId, userName, avatar, containerRef]);

  // Cleanup inactive cursors
  useEffect(() => {
    const interval = setInterval(() => {
      setCursors(prev => prev.filter(c => {
        // Mark as inactive if no updates for 5 seconds
        return c.isActive;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (cursors.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {cursors.map(cursor => (
        <div
          key={cursor.userId}
          ref={el => {
            if (el) cursorRefs.current.set(cursor.userId, el);
          }}
          className="absolute transition-all duration-100 ease-out"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          <div className="flex flex-col items-center">
            {/* Cursor */}
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: cursor.color }}
            />
            {/* User label */}
            <div
              className="mt-1 px-2 py-1 rounded text-xs text-white whitespace-nowrap shadow-lg"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.userName}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

