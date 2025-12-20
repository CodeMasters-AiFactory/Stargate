/**
 * Real-Time Preview Service
 * WebSocket-based live preview with hot module replacement
 */

import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { initializeCollaboration } from './realtimeCollaboration';

let io: SocketServer | null = null;

/**
 * Initialize real-time preview WebSocket server
 */
export function initializeRealtimePreview(server: Server): void {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'realtimePreview.ts:16',message:'initializeRealtimePreview entry',data:{serverType:typeof server,serverExists:!!server},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion agent log
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'realtimePreview.ts:18',message:'before SocketServer creation',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion agent log
    io = new SocketServer(server, {
      path: '/socket.io/preview',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'realtimePreview.ts:27',message:'after SocketServer creation',data:{ioExists:!!io},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion agent log

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'realtimePreview.ts:29',message:'before io.on connection setup',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion agent log
    io.on('connection', (socket) => {
      console.log('[RealtimePreview] ✅ Client connected:', socket.id);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'realtimePreview.ts:32',message:'preview connection established',data:{socketId:socket.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion agent log

      socket.on('subscribe', (data: { websiteId: string }) => {
        socket.join(`website:${data.websiteId}`);
        console.log(`[RealtimePreview] Client ${socket.id} subscribed to website ${data.websiteId}`);
      });

      socket.on('disconnect', () => {
        console.log('[RealtimePreview] Client disconnected:', socket.id);
      });
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'realtimePreview.ts:42',message:'after io.on connection setup',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion agent log

    // Initialize collaboration handlers within the same connection handler
    // This avoids duplicate connection handlers and ensures proper event registration
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'realtimePreview.ts:45',message:'before initializeCollaboration',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion agent log
    initializeCollaboration(io);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'realtimePreview.ts:47',message:'after initializeCollaboration',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion agent log

    console.log('[RealtimePreview] ✅ WebSocket server initialized');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'realtimePreview.ts:44',message:'initializeRealtimePreview success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion agent log
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'realtimePreview.ts:45',message:'initializeRealtimePreview error',data:{errorMessage:error instanceof Error?error.message:String(error),errorStack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion agent log
    logError(error, 'RealtimePreview - Initialize');
    console.warn('[RealtimePreview] ⚠️ Failed to initialize, continuing without real-time preview');
  }
}

/**
 * Broadcast HTML update to all subscribers
 */
export function broadcastHTMLUpdate(websiteId: string, html: string, pageSlug?: string): void {
  if (!io) {
    console.warn('[RealtimePreview] ⚠️ WebSocket server not initialized');
    return;
  }

  try {
    io.to(`website:${websiteId}`).emit('html-update', {
      html,
      pageSlug,
      timestamp: Date.now(),
    });
    console.log(`[RealtimePreview] 📡 Broadcasted HTML update for website ${websiteId}${pageSlug ? ` (page: ${pageSlug})` : ''}`);
  } catch (error) {
    logError(error, 'RealtimePreview - BroadcastHTMLUpdate');
  }
}

/**
 * Broadcast CSS update
 */
export function broadcastCSSUpdate(websiteId: string, css: string): void {
  if (!io) {
    return;
  }

  try {
    io.to(`website:${websiteId}`).emit('css-update', {
      css,
      timestamp: Date.now(),
    });
    console.log(`[RealtimePreview] 📡 Broadcasted CSS update for website ${websiteId}`);
  } catch (error) {
    logError(error, 'RealtimePreview - BroadcastCSSUpdate');
  }
}

/**
 * Broadcast progress update
 */
export function broadcastProgress(websiteId: string, progress: {
  currentPage: number;
  totalPages: number;
  currentPhase: string;
  pageProgress: number;
  overallProgress: number;
  message: string;
}): void {
  if (!io) {
    return;
  }

  try {
    io.to(`website:${websiteId}`).emit('progress', {
      ...progress,
      timestamp: Date.now(),
    });
  } catch (error) {
    logError(error, 'RealtimePreview - BroadcastProgress');
  }
}

/**
 * Broadcast page completion
 */
export function broadcastPageComplete(websiteId: string, pageData: {
  pageIndex: number;
  pageName: string;
  html: string;
  keywords: string[];
  images: Array<{ url: string; alt: string; context: string }>;
  qualityScore: number;
}): void {
  if (!io) {
    return;
  }

  try {
    io.to(`website:${websiteId}`).emit('page-complete', {
      ...pageData,
      timestamp: Date.now(),
    });
    console.log(`[RealtimePreview] ✅ Broadcasted page completion: ${pageData.pageName}`);
  } catch (error) {
    logError(error, 'RealtimePreview - BroadcastPageComplete');
  }
}

