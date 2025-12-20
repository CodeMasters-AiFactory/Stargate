/**
 * Real-Time Collaboration Service
 * Figma-like collaboration with live cursors, comments, approvals
 */

import { Server as SocketServer } from 'socket.io';
import type { Socket } from 'socket.io';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { COLLABORATION_CONSTANTS } from '../utils/constants';

// Extend Socket interface to include data properties
interface CollaborationSocket extends Socket {
  data: {
    userId?: string;
    userName?: string;
    websiteId?: string;
  };
}

let collaborationIo: SocketServer | null = null;

// Lock map for optimistic locking (elementId -> { userId, timestamp })
const elementLocks = new Map<string, { userId: string; timestamp: number }>();

export interface CollaborationCursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

export interface CollaborationComment {
  id: string;
  websiteId: string;
  elementSelector: string;
  userId: string;
  userName: string;
  text: string;
  replies: Array<{
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: number;
  }>;
  resolved: boolean;
  timestamp: number;
}

export interface ApprovalRequest {
  id: string;
  websiteId: string;
  section: string;
  requestedBy: string;
  requestedByName: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  timestamp: number;
}

/**
 * Initialize collaboration WebSocket server
 * NOTE: This registers handlers on an existing SocketServer instance.
 * The connection handler is already set up in realtimePreview.ts,
 * so this function adds collaboration-specific event handlers to the existing connection.
 */
export function initializeCollaboration(io: SocketServer): void {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'realtimeCollaboration.ts:48',message:'initializeCollaboration entry',data:{ioExists:!!io},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion agent log
  collaborationIo = io;

  // Register collaboration event handlers on the existing connection handler
  // Socket.io allows multiple connection handlers - they all fire, which is fine
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'realtimeCollaboration.ts:57',message:'registering collaboration connection handler',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion agent log
  io.on('connection', (socket: CollaborationSocket) => {
    console.log('[Collaboration] ✅ Client connected:', socket.id);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'realtimeCollaboration.ts:54',message:'collaboration connection established',data:{socketId:socket.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion agent log

    // Join website room
    socket.on('join-website', (data: { websiteId: string; userId: string; userName: string }) => {
      socket.join(`website:${data.websiteId}`);
      socket.data.userId = data.userId;
      socket.data.userName = data.userName;
      socket.data.websiteId = data.websiteId;
      
      // Notify others
      socket.to(`website:${data.websiteId}`).emit('user-joined', {
        userId: data.userId,
        userName: data.userName,
      });
      
      console.log(`[Collaboration] User ${data.userName} joined website ${data.websiteId}`);
    });

    // Cursor movement
    socket.on('cursor-move', (data: { x: number; y: number; color?: string }) => {
      const websiteId = socket.data.websiteId;
      if (!websiteId) return;

      const cursor: CollaborationCursor = {
        userId: socket.data.userId,
        userName: socket.data.userName,
        x: data.x,
        y: data.y,
        color: data.color || '#FF0000',
        timestamp: Date.now(),
      };

      socket.to(`website:${websiteId}`).emit('cursor-update', cursor);
    });

    // Add comment
    socket.on('add-comment', (data: {
      websiteId: string;
      elementSelector: string;
      text: string;
    }) => {
      if (!socket.data.userId || !socket.data.userName) return;
      
      const comment: CollaborationComment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        websiteId: data.websiteId,
        elementSelector: data.elementSelector,
        userId: socket.data.userId,
        userName: socket.data.userName,
        text: data.text,
        replies: [],
        resolved: false,
        timestamp: Date.now(),
      };

      io.to(`website:${data.websiteId}`).emit('comment-added', comment);
      console.log(`[Collaboration] Comment added by ${socket.data.userName}`);
    });

    // Reply to comment
    socket.on('reply-comment', (data: {
      commentId: string;
      websiteId: string;
      text: string;
    }) => {
      if (!socket.data.userId || !socket.data.userName) return;
      
      const reply = {
        id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: socket.data.userId,
        userName: socket.data.userName,
        text: data.text,
        timestamp: Date.now(),
      };

      io.to(`website:${data.websiteId}`).emit('comment-reply', {
        commentId: data.commentId,
        reply,
      });
    });

    // Resolve comment
    socket.on('resolve-comment', (data: { commentId: string; websiteId: string }) => {
      if (!socket.data.userName) return;
      
      io.to(`website:${data.websiteId}`).emit('comment-resolved', {
        commentId: data.commentId,
        resolvedBy: socket.data.userName,
      });
    });

    // Request approval
    socket.on('request-approval', (data: {
      websiteId: string;
      section: string;
      comments?: string;
    }) => {
      if (!socket.data.userId || !socket.data.userName) return;
      
      const approval: ApprovalRequest = {
        id: `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        websiteId: data.websiteId,
        section: data.section,
        requestedBy: socket.data.userId,
        requestedByName: socket.data.userName,
        status: 'pending',
        comments: data.comments,
        timestamp: Date.now(),
      };

      io.to(`website:${data.websiteId}`).emit('approval-requested', approval);
      console.log(`[Collaboration] Approval requested by ${socket.data.userName} for ${data.section}`);
    });

    // Process approval
    socket.on('process-approval', (data: {
      approvalId: string;
      websiteId: string;
      approved: boolean;
      comments?: string;
    }) => {
      if (!socket.data.userName) return;
      
      io.to(`website:${data.websiteId}`).emit('approval-processed', {
        approvalId: data.approvalId,
        approved: data.approved,
        processedBy: socket.data.userName,
        comments: data.comments,
      });
      console.log(`[Collaboration] Approval ${data.approved ? 'approved' : 'rejected'} by ${socket.data.userName}`);
    });

    // Element update with optimistic locking
    socket.on('element-update', (data: {
      websiteId: string;
      elementId: string;
      changes: any;
    }) => {
      if (!socket.data.userId || !socket.data.websiteId) return;
      
      const lockKey = `${data.websiteId}:${data.elementId}`;
      const existingLock = elementLocks.get(lockKey);
      const now = Date.now();
      
      // Check if element is locked by another user
      if (existingLock && existingLock.userId !== socket.data.userId) {
        const lockAge = now - existingLock.timestamp;
        if (lockAge < COLLABORATION_CONSTANTS.LOCK_TIMEOUT_MS) {
          // Element is locked by another user
          socket.emit('element-update-failed', {
            elementId: data.elementId,
            reason: 'Element is being edited by another user',
            lockedBy: existingLock.userId,
          });
          return;
        }
        // Lock expired, remove it
        elementLocks.delete(lockKey);
      }
      
      // Acquire lock
      elementLocks.set(lockKey, {
        userId: socket.data.userId,
        timestamp: now,
      });
      
      // Broadcast update to others
      socket.to(`website:${data.websiteId}`).emit('element-updated', {
        elementId: data.elementId,
        changes: data.changes,
        updatedBy: socket.data.userId,
        timestamp: now,
      });
      
      // Auto-release lock after timeout
      setTimeout(() => {
        const currentLock = elementLocks.get(lockKey);
        if (currentLock && currentLock.userId === socket.data.userId) {
          elementLocks.delete(lockKey);
        }
      }, COLLABORATION_CONSTANTS.LOCK_TIMEOUT_MS);
    });

    // Disconnect
    socket.on('disconnect', () => {
      const websiteId = socket.data.websiteId;
      if (websiteId) {
        socket.to(`website:${websiteId}`).emit('user-left', {
          userId: socket.data.userId,
          userName: socket.data.userName,
        });
      }
      console.log('[Collaboration] Client disconnected:', socket.id);
    });
  });
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'realtimeCollaboration.ts:212',message:'after io.on connection setup',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion agent log

  console.log('[Collaboration] ✅ Collaboration WebSocket server initialized');
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'realtimeCollaboration.ts:215',message:'initializeCollaboration success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion agent log
}

/**
 * Broadcast change to all collaborators
 */
export function broadcastChange(websiteId: string, change: {
  type: 'html' | 'css' | 'image' | 'content';
  data: any;
  userId?: string;
}): void {
  if (!collaborationIo) {
    console.warn('[Collaboration] ⚠️ Collaboration server not initialized');
    return;
  }

  collaborationIo.to(`website:${websiteId}`).emit('change', {
    ...change,
    timestamp: Date.now(),
  });
}
