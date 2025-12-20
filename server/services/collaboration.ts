/**
 * Real-Time Collaboration Service
 * Handles WebSocket connections for team collaboration
 */

import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

export interface CollaborationSession {
  id: string;
  websiteId: string;
  participants: Map<string, Participant>;
  cursors: Map<string, CursorPosition>;
  changes: Change[];
  createdAt: Date;
}

export interface Participant {
  id: string;
  userId: string;
  name: string;
  color: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
}

export interface CursorPosition {
  participantId: string;
  x: number;
  y: number;
  element?: string;
}

export interface Change {
  id: string;
  participantId: string;
  type: 'edit' | 'comment' | 'selection';
  path: string;
  content?: string;
  timestamp: Date;
}

// Store active collaboration sessions
const sessions = new Map<string, CollaborationSession>();

// Generate participant color
function generateParticipantColor(index: number): string {
  const colors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316', // Orange
  ];
  return colors[index % colors.length];
}

/**
 * Create a collaboration WebSocket server
 */
export function createCollaborationServer(httpServer: Server): WebSocketServer {
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws/collaboration',
  });

  wss.on('connection', (ws: WebSocket, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('sessionId');
    const userId = url.searchParams.get('userId');
    const userName = url.searchParams.get('userName') || 'Anonymous';
    const role = (url.searchParams.get('role') || 'viewer') as 'owner' | 'editor' | 'viewer';

    if (!sessionId || !userId) {
      ws.close(1008, 'Missing sessionId or userId');
      return;
    }

    // Get or create session
    let session = sessions.get(sessionId);
    if (!session) {
      session = {
        id: sessionId,
        websiteId: url.searchParams.get('websiteId') || '',
        participants: new Map(),
        cursors: new Map(),
        changes: [],
        createdAt: new Date(),
      };
      sessions.set(sessionId, session);
    }

    // Create participant
    const participantId = `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const participant: Participant = {
      id: participantId,
      userId,
      name: userName,
      color: generateParticipantColor(session.participants.size),
      role,
      joinedAt: new Date(),
    };

    session.participants.set(participantId, participant);

    // Send welcome message
    ws.send(
      JSON.stringify({
        type: 'connected',
        participantId,
        session: {
          id: session.id,
          participants: Array.from(session.participants.values()),
        },
      })
    );

    // Broadcast participant joined
    broadcastToSession(session, {
      type: 'participant_joined',
      participant,
    }, ws);

    // Handle messages
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'cursor_move':
            session.cursors.set(participantId, {
              participantId,
              x: message.x,
              y: message.y,
              element: message.element,
            });
            broadcastToSession(session, {
              type: 'cursor_update',
              cursor: session.cursors.get(participantId),
            }, ws);
            break;

          case 'change':
            if (role === 'viewer') {
              ws.send(JSON.stringify({ type: 'error', message: 'Viewers cannot make changes' }));
              return;
            }
            const change: Change = {
              id: `change-${Date.now()}`,
              participantId,
              type: message.changeType,
              path: message.path,
              content: message.content,
              timestamp: new Date(),
            };
            session.changes.push(change);
            broadcastToSession(session, {
              type: 'change_applied',
              change,
            }, ws);
            break;

          case 'comment':
            if (role === 'viewer') {
              ws.send(JSON.stringify({ type: 'error', message: 'Viewers cannot comment' }));
              return;
            }
            const comment: Change = {
              id: `comment-${Date.now()}`,
              participantId,
              type: 'comment',
              path: message.path,
              content: message.content,
              timestamp: new Date(),
            };
            session.changes.push(comment);
            broadcastToSession(session, {
              type: 'comment_added',
              comment,
            }, ws);
            break;

          case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
        }
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    // Handle disconnect
    ws.on('close', () => {
      session.participants.delete(participantId);
      session.cursors.delete(participantId);

      broadcastToSession(session, {
        type: 'participant_left',
        participantId,
      }, ws);

      // Clean up empty sessions after 5 minutes
      if (session.participants.size === 0) {
        setTimeout(() => {
          if (sessions.get(sessionId)?.participants.size === 0) {
            sessions.delete(sessionId);
          }
        }, 5 * 60 * 1000);
      }
    });

    // Send periodic updates
    const updateInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'session_update',
            participants: Array.from(session.participants.values()),
            cursors: Array.from(session.cursors.values()),
          })
        );
      } else {
        clearInterval(updateInterval);
      }
    }, 5000);
  });

  return wss;
}

/**
 * Broadcast message to all participants in a session except sender
 */
function broadcastToSession(
  session: CollaborationSession,
  message: unknown,
  exclude?: WebSocket
) {
  // In a real implementation, we'd need to track WebSocket connections per session
  // For now, this is a placeholder that would need to be integrated with the WebSocket server
}

/**
 * Get collaboration session
 */
export function getCollaborationSession(sessionId: string): CollaborationSession | undefined {
  return sessions.get(sessionId);
}

/**
 * Create collaboration session
 */
export function createCollaborationSession(websiteId: string): CollaborationSession {
  const sessionId = `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const session: CollaborationSession = {
    id: sessionId,
    websiteId,
    participants: new Map(),
    cursors: new Map(),
    changes: [],
    createdAt: new Date(),
  };
  sessions.set(sessionId, session);
  return session;
}

