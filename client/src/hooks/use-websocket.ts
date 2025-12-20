import { useEffect, useRef, useState } from 'react';
import { CollaborationMessage } from '@/types/collaboration';

interface UseWebSocketOptions {
  projectId: string;
  userId: string;
  onMessage?: (message: CollaborationMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  enabled?: boolean; // Feature flag to disable WebSocket
}

export function useWebSocket({
  projectId,
  userId,
  onMessage,
  onConnect,
  onDisconnect,
  enabled = true,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);

  const connect = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Use collaboration WebSocket path - requires sessionId (using projectId as sessionId)
      const sessionId = projectId || 'default-session';
      const wsUrl = `${protocol}//${window.location.host}/ws/collaboration?sessionId=${sessionId}&userId=${userId}&userName=${userId}&role=editor`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      wsRef.current.onmessage = event => {
        try {
          const message: CollaborationMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        onDisconnect?.();

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < 5) {
          const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = event => {
        setError('WebSocket connection failed');
        console.error('WebSocket error:', event);
      };
    } catch (err) {
      setError('Failed to create WebSocket connection');
      console.error('WebSocket creation error:', err);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  };

  const sendMessage = (message: CollaborationMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    // Only connect if enabled
    if (!enabled) {
      setIsConnected(false);
      return;
    }

    connect();
    return disconnect;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Only reconnect if enabled flag changes, not on projectId/userId changes to prevent flickering
  }, [enabled]);

  return {
    isConnected,
    error,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
}
