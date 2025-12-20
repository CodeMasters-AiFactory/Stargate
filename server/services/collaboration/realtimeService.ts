/**
 * Real-Time Collaboration Service
 * WebSocket-based real-time collaboration with cursor tracking and shared editing
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import type { Express } from 'express';

export interface UserPresence {
  userId: string;
  userName: string;
  avatar?: string;
  cursor: { x: number; y: number };
  selection?: string;
  status: 'idle' | 'typing' | 'editing' | 'viewing';
  lastSeen: Date;
}

export interface RoomState {
  roomId: string;
  users: Map<string, UserPresence>;
  content: string;
  version: number;
}

class RealtimeService {
  private io: SocketIOServer | null = null;
  private rooms: Map<string, RoomState> = new Map();

  initialize(server: HTTPServer, app: Express) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`[RealtimeService] User connected: ${socket.id}`);

      // Join room
      socket.on('join-room', (data: { roomId: string; userId: string; userName: string; avatar?: string }) => {
        this.handleJoinRoom(socket, data);
      });

      // Leave room
      socket.on('leave-room', (data: { roomId: string }) => {
        this.handleLeaveRoom(socket, data);
      });

      // Cursor movement
      socket.on('cursor-move', (data: { roomId: string; userId: string; cursor: { x: number; y: number } }) => {
        this.handleCursorMove(socket, data);
      });

      // Content change
      socket.on('content-change', (data: { roomId: string; userId: string; change: any; version: number }) => {
        this.handleContentChange(socket, data);
      });

      // User status update
      socket.on('status-update', (data: { roomId: string; userId: string; status: UserPresence['status'] }) => {
        this.handleStatusUpdate(socket, data);
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });

    console.log('[RealtimeService] Real-time collaboration service initialized');
  }

  private handleJoinRoom(socket: Socket, data: { roomId: string; userId: string; userName: string; avatar?: string }) {
    const { roomId, userId, userName, avatar } = data;

    socket.join(roomId);

    // Get or create room
    let room = this.rooms.get(roomId);
    if (!room) {
      room = {
        roomId,
        users: new Map(),
        content: '',
        version: 0,
      };
      this.rooms.set(roomId, room);
    }

    // Add user to room
    const userPresence: UserPresence = {
      userId,
      userName,
      avatar,
      cursor: { x: 0, y: 0 },
      status: 'viewing',
      lastSeen: new Date(),
    };

    room.users.set(userId, userPresence);

    // Notify others
    socket.to(roomId).emit('user-joined', {
      userId,
      userName,
      avatar,
    });

    // Send current room state to new user
    socket.emit('room-state', {
      users: Array.from(room.users.values()),
      content: room.content,
      version: room.version,
    });

    console.log(`[RealtimeService] User ${userName} joined room ${roomId}`);
  }

  private handleLeaveRoom(socket: Socket, data: { roomId: string }) {
    const { roomId } = data;
    socket.leave(roomId);

    const room = this.rooms.get(roomId);
    if (room) {
      // Remove user from room
      const userId = Array.from(room.users.keys()).find(
        id => room.users.get(id)?.userId === (socket as any).userId
      );

      if (userId) {
        room.users.delete(userId);
        socket.to(roomId).emit('user-left', { userId });
      }
    }
  }

  private handleCursorMove(socket: Socket, data: { roomId: string; userId: string; cursor: { x: number; y: number } }) {
    const { roomId, userId, cursor } = data;
    const room = this.rooms.get(roomId);

    if (room && room.users.has(userId)) {
      const user = room.users.get(userId)!;
      user.cursor = cursor;
      user.lastSeen = new Date();

      // Broadcast to others in room
      socket.to(roomId).emit('cursor-update', {
        userId,
        cursor,
      });
    }
  }

  private handleContentChange(socket: Socket, data: { roomId: string; userId: string; change: any; version: number }) {
    const { roomId, userId, change, version } = data;
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    // Simple conflict resolution: accept if version matches
    if (version === room.version) {
      room.content = change.content || room.content;
      room.version += 1;

      // Broadcast to others in room
      socket.to(roomId).emit('content-update', {
        userId,
        change,
        version: room.version,
      });

      // Confirm to sender
      socket.emit('content-confirmed', {
        version: room.version,
      });
    } else {
      // Version conflict - send current state
      socket.emit('content-conflict', {
        currentVersion: room.version,
        currentContent: room.content,
      });
    }
  }

  private handleStatusUpdate(socket: Socket, data: { roomId: string; userId: string; status: UserPresence['status'] }) {
    const { roomId, userId, status } = data;
    const room = this.rooms.get(roomId);

    if (room && room.users.has(userId)) {
      const user = room.users.get(userId)!;
      user.status = status;
      user.lastSeen = new Date();

      // Broadcast to others in room
      socket.to(roomId).emit('status-update', {
        userId,
        status,
      });
    }
  }

  private handleDisconnect(socket: Socket) {
    // Remove user from all rooms
    for (const [roomId, room] of this.rooms.entries()) {
      const userId = Array.from(room.users.keys()).find(
        id => room.users.get(id)?.userId === (socket as any).userId
      );

      if (userId) {
        room.users.delete(userId);
        this.io?.to(roomId).emit('user-left', { userId });
      }
    }

    console.log(`[RealtimeService] User disconnected: ${socket.id}`);
  }

  getRoomState(roomId: string): RoomState | null {
    return this.rooms.get(roomId) || null;
  }

  getActiveUsers(roomId: string): UserPresence[] {
    const room = this.rooms.get(roomId);
    if (!room) {
      return [];
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return Array.from(room.users.values()).filter(
      user => user.lastSeen > fiveMinutesAgo
    );
  }
}

export const realtimeService = new RealtimeService();

