/**
 * Automation Cursor Component
 * Shows a visual cursor indicator when AI automation is happening
 * 
 * Features:
 * - Red bubble cursor that follows automation actions
 * - Click animation ripple effect
 * - Trail effect showing movement path
 * - Status indicator showing what action is happening
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CursorPosition {
  x: number;
  y: number;
  action?: 'move' | 'click' | 'type' | 'hover' | 'scroll';
  target?: string;
  timestamp: number;
}

interface AutomationCursorProps {
  enabled?: boolean;
}

export function AutomationCursor({ enabled = true }: AutomationCursorProps) {
  const [position, setPosition] = useState<CursorPosition | null>(null);
  const [isClicking, setIsClicking] = useState(false);
  const [trail, setTrail] = useState<CursorPosition[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  // Listen for automation events from the server
  useEffect(() => {
    if (!enabled) return;

    // Create EventSource for automation cursor updates
    const eventSource = new EventSource('/api/automation/cursor-stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'cursor-move') {
          const newPos: CursorPosition = {
            x: data.x,
            y: data.y,
            action: data.action || 'move',
            target: data.target,
            timestamp: Date.now(),
          };
          
          setPosition(newPos);
          setIsVisible(true);
          setStatusMessage(data.message || '');
          
          // Add to trail
          setTrail(prev => [...prev.slice(-10), newPos]);
          
          // Handle click animation
          if (data.action === 'click') {
            setIsClicking(true);
            setTimeout(() => setIsClicking(false), 300);
          }
        } else if (data.type === 'cursor-hide') {
          setIsVisible(false);
          setTrail([]);
        }
      } catch (e) {
        console.error('[AutomationCursor] Parse error:', e);
      }
    };

    eventSource.onerror = () => {
      console.log('[AutomationCursor] Connection lost, reconnecting...');
    };

    return () => {
      eventSource.close();
    };
  }, [enabled]);

  // Also listen for window postMessage events (alternative method)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'automation-cursor') {
        const { x, y, action, target, message } = event.data;
        
        setPosition({
          x,
          y,
          action,
          target,
          timestamp: Date.now(),
        });
        setIsVisible(true);
        setStatusMessage(message || '');
        
        if (action === 'click') {
          setIsClicking(true);
          setTimeout(() => setIsClicking(false), 300);
        }
      } else if (event.data?.type === 'automation-cursor-hide') {
        setIsVisible(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Manual trigger for testing - can be called from console
  useEffect(() => {
    (window as any).showAutomationCursor = (x: number, y: number, action?: string, message?: string) => {
      setPosition({ x, y, action: action as any || 'move', timestamp: Date.now() });
      setIsVisible(true);
      setStatusMessage(message || `Moving to (${x}, ${y})`);
      
      if (action === 'click') {
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 300);
      }
    };
    
    (window as any).hideAutomationCursor = () => {
      setIsVisible(false);
      setTrail([]);
    };

    return () => {
      delete (window as any).showAutomationCursor;
      delete (window as any).hideAutomationCursor;
    };
  }, []);

  // Always render the SSE listener, but only show visuals when visible
  if (!enabled) return null;

  // If not visible yet, still render an empty div to keep the SSE connection alive
  if (!isVisible || !position) {
    return <div className="hidden" data-automation-cursor="connected" />;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999]" style={{ isolation: 'isolate' }}>
      {/* Trail effect */}
      <AnimatePresence>
        {trail.map((pos, i) => (
          <motion.div
            key={pos.timestamp + i}
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute w-3 h-3 rounded-full bg-red-500/30"
            style={{
              left: pos.x - 6,
              top: pos.y - 6,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Main cursor */}
      <motion.div
        className="absolute"
        initial={false}
        animate={{
          x: position.x - 15,
          y: position.y - 15,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {/* Outer glow */}
        <div 
          className={`
            w-[30px] h-[30px] rounded-full 
            ${isClicking ? 'bg-red-500 scale-150' : 'bg-red-500/80'}
            shadow-[0_0_20px_rgba(239,68,68,0.8),0_0_40px_rgba(239,68,68,0.4)]
            transition-all duration-150
          `}
        />
        
        {/* Click ripple effect */}
        <AnimatePresence>
          {isClicking && (
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 rounded-full border-2 border-red-500"
            />
          )}
        </AnimatePresence>
        
        {/* Inner dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white" />
      </motion.div>

      {/* Status message */}
      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            x: position.x + 20,
            top: position.y + 20,
          }}
          className="absolute bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg"
          style={{ maxWidth: '300px' }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>{statusMessage}</span>
          </div>
        </motion.div>
      )}

      {/* AI indicator badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          x: position.x - 60,
          top: position.y - 40,
        }}
        className="absolute bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded text-xs font-bold shadow-lg"
      >
        🤖 AI Cursor
      </motion.div>
    </div>
  );
}

export default AutomationCursor;

