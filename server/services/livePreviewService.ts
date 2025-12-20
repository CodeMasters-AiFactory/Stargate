/**
 * Live Preview Service
 * Provides real-time preview updates during website generation via WebSocket
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export interface PreviewUpdate {
  type: 'html' | 'css' | 'js' | 'progress' | 'complete' | 'error';
  pageSlug?: string;
  content?: string;
  progress?: number;
  message?: string;
  timestamp: number;
}

export class LivePreviewService {
  private io: SocketIOServer | null = null;
  private activeConnections: Map<string, Socket> = new Map();

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*', // In production, restrict to your domain
        methods: ['GET', 'POST'],
      },
      path: '/socket.io',
    });

    this.io.on('connection', (socket: Socket) => {
      console.log('[LivePreview] Client connected:', socket.id);

      // Join a room for a specific website generation
      socket.on('join-generation', (generationId: string) => {
        socket.join(generationId);
        this.activeConnections.set(socket.id, socket);
        console.log(`[LivePreview] Client ${socket.id} joined generation: ${generationId}`);
      });

      // Leave generation room
      socket.on('leave-generation', (generationId: string) => {
        socket.leave(generationId);
        console.log(`[LivePreview] Client ${socket.id} left generation: ${generationId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.activeConnections.delete(socket.id);
        console.log('[LivePreview] Client disconnected:', socket.id);
      });
    });

    console.log('[LivePreview] WebSocket server initialized');
  }

  /**
   * Emit preview update to a specific generation room
   */
  emitUpdate(generationId: string, update: PreviewUpdate): void {
    if (!this.io) {
      console.warn('[LivePreview] WebSocket server not initialized');
      return;
    }

    this.io.to(generationId).emit('preview-update', update);
    console.log(`[LivePreview] Emitted ${update.type} update to generation: ${generationId}`);
  }

  /**
   * Emit HTML update for a specific page
   */
  emitHTMLUpdate(generationId: string, pageSlug: string, html: string): void {
    this.emitUpdate(generationId, {
      type: 'html',
      pageSlug,
      content: html,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit CSS update
   */
  emitCSSUpdate(generationId: string, css: string): void {
    this.emitUpdate(generationId, {
      type: 'css',
      content: css,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit JavaScript update
   */
  emitJSUpdate(generationId: string, js: string): void {
    this.emitUpdate(generationId, {
      type: 'js',
      content: js,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit progress update
   */
  emitProgress(generationId: string, progress: number, message: string): void {
    this.emitUpdate(generationId, {
      type: 'progress',
      progress,
      message,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit completion signal
   */
  emitComplete(generationId: string, data?: any): void {
    this.emitUpdate(generationId, {
      type: 'complete',
      timestamp: Date.now(),
      ...data,
    });
  }

  /**
   * Emit error
   */
  emitError(generationId: string, error: string): void {
    this.emitUpdate(generationId, {
      type: 'error',
      message: error,
      timestamp: Date.now(),
    });
  }

  /**
   * Get active connections count
   */
  getActiveConnectionsCount(): number {
    return this.activeConnections.size;
  }

  /**
   * Check if WebSocket server is initialized
   */
  isInitialized(): boolean {
    return this.io !== null;
  }
}

// Singleton instance
let livePreviewService: LivePreviewService | null = null;

/**
 * Get or create LivePreviewService instance
 */
export function getLivePreviewService(): LivePreviewService {
  if (!livePreviewService) {
    livePreviewService = new LivePreviewService();
  }
  return livePreviewService;
}

/**
 * Initialize LivePreviewService with HTTP server
 */
export function initializeLivePreview(httpServer: HTTPServer): LivePreviewService {
  const service = getLivePreviewService();
  service.initialize(httpServer);
  return service;
}

