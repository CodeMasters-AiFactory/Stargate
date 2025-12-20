/**
 * Merlin Chat Sidebar
 * AI-powered chat interface for website editing
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'merlin';
  content: string;
  timestamp: Date;
}

interface MerlinChatSidebarProps {
  currentHtml: string;
  businessContext: {
    businessName: string;
    industry?: string;
    location?: string;
  };
  onWebsiteUpdate?: (updatedHtml: string) => void;
  width?: number;
  onWidthChange?: (width: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function MerlinChatSidebar({
  currentHtml,
  businessContext,
  onWebsiteUpdate,
  width: externalWidth,
  onWidthChange,
  isCollapsed: externalCollapsed,
  onToggleCollapse,
}: MerlinChatSidebarProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Resize and collapse state
  const [internalWidth, setInternalWidth] = useState(() => {
    const saved = localStorage.getItem('merlin-sidebar-width');
    return saved ? parseInt(saved, 10) : 250;
  });
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    const saved = localStorage.getItem('merlin-sidebar-collapsed');
    return saved === 'true';
  });
  
  const width = externalWidth ?? internalWidth;
  const isCollapsed = externalCollapsed ?? internalCollapsed;
  const collapsedWidth = 8; // Minimal width for expand button visibility
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Handle collapse toggle
  const handleToggleCollapse = useCallback(() => {
    const newCollapsed = !isCollapsed;
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(newCollapsed);
    }
    localStorage.setItem('merlin-sidebar-collapsed', String(newCollapsed));
  }, [isCollapsed, onToggleCollapse]);

  // Initialize greeting on mount
  useEffect(() => {
    const userName = user?.username || user?.email?.split('@')[0] || null;
    const greeting = userName
      ? `Hi ${userName}! I'm Merlin, your Website Wizard. What do you want to do today?`
      : "Hi there! I'm Merlin, your Website Wizard. What do you want to do today?";

    setMessages([
      {
        id: 'greeting-1',
        role: 'merlin',
        content: greeting,
        timestamp: new Date(),
      },
    ]);
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    const messageText = input.trim();
    if (!messageText || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/website-editor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          currentHtml: currentHtml, // Use the latest HTML from props
          context: businessContext,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `Server error: ${response.status}` };
        }
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // If we got updated HTML, update the website preview live
        if (data.updatedHtml && onWebsiteUpdate) {
          onWebsiteUpdate(data.updatedHtml);
        }

        // Add Merlin's response (works for both conversation and editing)
        const merlinMessage: ChatMessage = {
          id: `merlin-${Date.now()}`,
          role: 'merlin',
          content: data.message || 'I\'ve made the changes you requested!',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, merlinMessage]);
      } else {
        throw new Error(data.error || 'Failed to process request');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      // Provide more helpful error messages (local-only, no AI dependencies)
      let userFriendlyMessage = 'I apologize, but I encountered an error processing your request.';
      
      if (errorMsg.includes('404') || errorMsg.includes('Cannot POST')) {
        userFriendlyMessage = 'The server needs to be restarted to enable chat functionality. Please restart the development server.';
      } else if (errorMsg.includes('500') || errorMsg.includes('Internal Server Error')) {
        userFriendlyMessage = 'The server encountered an error. Please check the server logs and try again.';
      } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        userFriendlyMessage = 'Unable to connect to the server. Please check your connection and try again.';
      }
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'merlin',
        content: userFriendlyMessage,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Ensure input is enabled and focused after response
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Force re-enable by removing disabled attribute
          inputRef.current.disabled = false;
        }
      }, 50);
    }
  };


  const currentWidth = isCollapsed ? collapsedWidth : width;
  
  // If collapsed, show only expand button on the left edge
  if (isCollapsed) {
    return (
      <div
        ref={sidebarRef}
        className="flex flex-col h-full flex-shrink-0 relative overflow-visible bg-slate-900 border-r border-slate-700"
        style={{ width: `${collapsedWidth}px` }}
      >
        {/* Expand Button - Positioned on left edge */}
        <button
          onClick={handleToggleCollapse}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-50 w-8 h-16 bg-slate-800 border border-slate-700 rounded-r-lg flex items-center justify-center hover:bg-slate-700 transition-colors shadow-lg"
          title="Expand Merlin Chat"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>
    );
  }
  
  return (
    <div
      ref={sidebarRef}
      className="flex flex-col bg-slate-900 border-r border-slate-700 flex-shrink-0 relative h-full"
      style={{ width: `${currentWidth}px`, overflow: 'visible' }}
    >
      {/* Resize Handle - Extends beyond edge for easier clicking */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const startX = e.clientX;
          const startWidth = width; // Use current width (handles both external and internal)
          
          const handleMouseMove = (e: MouseEvent) => {
            e.preventDefault();
            const diff = e.clientX - startX; // Calculate relative movement
            const newWidth = Math.max(200, Math.min(600, startWidth + diff)); // Add diff to start width
            
            if (onWidthChange) {
              onWidthChange(newWidth);
            } else {
              setInternalWidth(newWidth);
            }
            localStorage.setItem('merlin-sidebar-width', newWidth.toString());
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
          };
          
          // Add listeners immediately (no React state delay)
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
        }}
        className="absolute top-0 bottom-0 cursor-col-resize hover:bg-purple-500/50 active:bg-purple-500/70 transition-colors z-50 group"
        style={{ 
          right: '-4px', // Extend 4px beyond the edge for easier clicking
          width: '12px', // Wider handle for easier grabbing
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          pointerEvents: 'auto',
          backgroundColor: 'transparent'
        }}
        title="Drag to resize"
      >
        {/* Visual indicator - visible on hover */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-24 bg-purple-500/0 group-hover:bg-purple-500/90 rounded-full transition-all" />
      </div>
      
        {/* Header */}
        <div className="p-3 border-b border-slate-700 bg-gradient-to-r from-purple-900/30 to-blue-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-purple-500/30 flex-shrink-0">
              <img 
                src="/merlin.jpg" 
                alt="Merlin" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm truncate">Merlin</h3>
            </div>
          </div>
        {/* Collapse Button */}
        <button
          onClick={handleToggleCollapse}
          className="ml-2 p-1 hover:bg-slate-800 rounded transition-colors flex-shrink-0"
          title="Collapse sidebar"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Messages Area - Scrollable (takes remaining space) - Hidden scrollbar */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="h-full px-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-4 py-4">
            {/* Show greeting first */}
            {messages.length > 0 && messages[0].role === 'merlin' && messages[0].id === 'greeting-1' && (
              <div className="flex gap-3 justify-start">
                <div className="rounded-lg px-4 py-2 max-w-[80%] bg-slate-800 text-slate-100 border border-slate-700">
                  <p className="text-sm whitespace-pre-wrap">{messages[0].content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {messages[0].timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* All conversation messages (excluding greeting) */}
            {messages.filter(msg => msg.id !== 'greeting-1').map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'rounded-lg px-4 py-2 max-w-[80%]',
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-100 border border-slate-700'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="bg-slate-800 rounded-lg px-4 py-2 border border-slate-700">
                  <div className="flex gap-1">
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    <p className="text-sm text-slate-400">Merlin is thinking...</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area - FIXED AT BOTTOM, ALWAYS VISIBLE (outside scrollable area) */}
      <div className="flex-shrink-0 p-4 pt-3 border-t border-slate-700 bg-slate-900/50 z-10" style={{ position: 'relative' }}>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading && input.trim()) {
                  handleSendMessage();
                }
              }
            }}
            placeholder="Ask Merlin to make changes..."
            disabled={isLoading}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 flex-1 text-sm"
            style={{ pointerEvents: 'auto', zIndex: 20 }}
            autoFocus={false}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex-shrink-0 h-9 px-3"
            type="button"
            style={{ pointerEvents: 'auto', zIndex: 20 }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

