/**
 * Automation Cursor API
 * Streams cursor position updates to connected clients
 * 
 * This allows users to SEE where AI automation is clicking/moving
 */

import { Express, Response } from 'express';

// Store connected clients with metadata
interface ClientConnection {
  res: Response;
  connectedAt: number;
  clientId: string;
}
const connectedClients: Map<string, ClientConnection> = new Map();

// Limit max connections to prevent resource exhaustion
const MAX_CONNECTIONS = 10;

// Current cursor state
let cursorState = {
  x: 0,
  y: 0,
  visible: false,
  action: 'idle' as 'idle' | 'move' | 'click' | 'type' | 'hover' | 'scroll',
  target: '',
  message: '',
};

/**
 * Broadcast cursor update to all connected clients
 */
export function broadcastCursorUpdate(data: {
  x: number;
  y: number;
  action?: string;
  target?: string;
  message?: string;
}) {
  cursorState = {
    ...cursorState,
    ...data,
    visible: true,
  };

  const eventData = JSON.stringify({
    type: 'cursor-move',
    ...data,
  });

  connectedClients.forEach((client, clientId) => {
    try {
      client.res.write(`data: ${eventData}\n\n`);
    } catch (e) {
      connectedClients.delete(clientId);
    }
  });
}

/**
 * Hide the cursor
 */
export function hideCursor() {
  cursorState.visible = false;

  const eventData = JSON.stringify({ type: 'cursor-hide' });

  connectedClients.forEach((client, clientId) => {
    try {
      client.res.write(`data: ${eventData}\n\n`);
    } catch (e) {
      connectedClients.delete(clientId);
    }
  });
}

/**
 * Show click animation at position
 */
export function showClick(x: number, y: number, target?: string) {
  broadcastCursorUpdate({
    x,
    y,
    action: 'click',
    target,
    message: target ? `Clicking: ${target}` : `Click at (${x}, ${y})`,
  });
}

/**
 * Show cursor moving to position
 */
export function showMove(x: number, y: number, message?: string) {
  broadcastCursorUpdate({
    x,
    y,
    action: 'move',
    message: message || `Moving to (${x}, ${y})`,
  });
}

/**
 * Show typing action
 */
export function showTyping(x: number, y: number, text: string) {
  broadcastCursorUpdate({
    x,
    y,
    action: 'type',
    message: `Typing: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
  });
}

export function registerAutomationCursorRoutes(app: Express) {
  // SSE endpoint for cursor updates
  app.get('/api/automation/cursor-stream', (req, res) => {
    // Generate client ID from query param or create new one
    const clientId = (req.query.clientId as string) || `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Check if this client is already connected (prevent duplicate connections)
    if (connectedClients.has(clientId)) {
      // Close the old connection
      const oldClient = connectedClients.get(clientId);
      if (oldClient) {
        try {
          oldClient.res.end();
        } catch (e) {
          // Ignore error if already closed
        }
      }
      connectedClients.delete(clientId);
    }

    // Enforce connection limit - remove oldest connections if at limit
    if (connectedClients.size >= MAX_CONNECTIONS) {
      // Find and remove the oldest connection
      let oldestId: string | null = null;
      let oldestTime = Infinity;
      connectedClients.forEach((client, id) => {
        if (client.connectedAt < oldestTime) {
          oldestTime = client.connectedAt;
          oldestId = id;
        }
      });
      if (oldestId) {
        const oldClient = connectedClients.get(oldestId);
        if (oldClient) {
          try {
            oldClient.res.end();
          } catch (e) {
            // Ignore
          }
        }
        connectedClients.delete(oldestId);
      }
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send initial state with client ID
    res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

    // Add to connected clients
    connectedClients.set(clientId, {
      res,
      connectedAt: Date.now(),
      clientId,
    });

    // Only log occasionally to reduce console spam
    if (connectedClients.size === 1 || connectedClients.size % 5 === 0) {
      console.log(`[AutomationCursor] Client connected. Total: ${connectedClients.size}`);
    }

    // Send heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
      } catch (e) {
        clearInterval(heartbeat);
        connectedClients.delete(clientId);
      }
    }, 30000);

    // Clean up on disconnect
    req.on('close', () => {
      clearInterval(heartbeat);
      connectedClients.delete(clientId);
      // Only log occasionally
      if (connectedClients.size === 0 || connectedClients.size % 5 === 0) {
        console.log(`[AutomationCursor] Client disconnected. Total: ${connectedClients.size}`);
      }
    });
  });

  // Manual trigger endpoint (for testing)
  app.post('/api/automation/cursor/show', (req, res) => {
    const { x, y, action, target, message } = req.body;
    broadcastCursorUpdate({ x, y, action, target, message });
    res.json({ success: true });
  });

  app.post('/api/automation/cursor/hide', (req, res) => {
    hideCursor();
    res.json({ success: true });
  });

  app.post('/api/automation/cursor/click', (req, res) => {
    const { x, y, target } = req.body;
    showClick(x, y, target);
    res.json({ success: true });
  });

  // Demo endpoint - shows cursor moving around
  app.post('/api/automation/cursor/demo', async (req, res) => {
    const positions = [
      { x: 100, y: 100, message: 'Starting demo...' },
      { x: 300, y: 200, message: 'Moving to center...' },
      { x: 500, y: 300, action: 'click', message: 'Clicking button!' },
      { x: 700, y: 400, message: 'Navigating...' },
      { x: 900, y: 300, action: 'type', message: 'Typing text...' },
      { x: 600, y: 500, action: 'click', message: 'Final click!' },
    ];

    for (const pos of positions) {
      broadcastCursorUpdate(pos as any);
      await new Promise(r => setTimeout(r, 1000));
    }

    setTimeout(() => hideCursor(), 500);
    res.json({ success: true, message: 'Demo complete!' });
  });

  console.log('[AutomationCursor] Routes registered');
}

// Export for use in browser automation wrapper
export const automationCursor = {
  show: broadcastCursorUpdate,
  hide: hideCursor,
  click: showClick,
  move: showMove,
  type: showTyping,
};

