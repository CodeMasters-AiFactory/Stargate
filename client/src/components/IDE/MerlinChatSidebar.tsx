/**
 * Merlin Chat Sidebar - ENHANCED with LIVE Avatar
 * AI-powered chat interface with voice input/output
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MerlinAvatar, MerlinState, MERLIN_GREETINGS } from '@/components/merlin/MerlinAvatar';
import { ModelSelector, CreditDisplay, ModelType } from '@/components/merlin/ModelSelector';

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
  
  // LIVE Merlin states
  const [merlinState, setMerlinState] = useState<MerlinState>('default');
  const [merlinMessage, setMerlinMessage] = useState<string>('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelType>('sonnet-4.5');
  const [userCredits, setUserCredits] = useState(150); // TODO: Fetch from API
  
  // Resize and collapse state
  const [internalWidth, setInternalWidth] = useState(() => {
    const saved = localStorage.getItem('merlin-sidebar-width');
    return saved ? parseInt(saved, 10) : 320;
  });
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    const saved = localStorage.getItem('merlin-sidebar-collapsed');
    return saved === 'true';
  });
  
  const width = externalWidth ?? internalWidth;
  const isCollapsed = externalCollapsed ?? internalCollapsed;
  const collapsedWidth = 8;
  
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

  // Initialize greeting with voice
  useEffect(() => {
    const userName = user?.username || user?.email?.split('@')[0] || null;
    const randomGreeting = MERLIN_GREETINGS[Math.floor(Math.random() * MERLIN_GREETINGS.length)];
    const greeting = userName
      ? `Hi ${userName}! ${randomGreeting.replace("I'm Merlin, your magical website wizard. ", "")}`
      : randomGreeting;

    setMessages([
      {
        id: 'greeting-1',
        role: 'merlin',
        content: greeting,
        timestamp: new Date(),
      },
    ]);
    
    // Speak the greeting after a short delay
    setTimeout(() => {
      if (voiceEnabled) {
        setMerlinMessage(greeting);
        setMerlinState('talking');
      }
    }, 500);
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle voice input from Merlin Avatar
  const handleVoiceInput = useCallback((transcript: string) => {
    setInput(transcript);
    // Auto-send after voice input
    setTimeout(() => {
      const sendButton = document.querySelector('[data-send-button]') as HTMLButtonElement;
      if (sendButton) sendButton.click();
    }, 100);
  }, []);

  // Handle Merlin state changes
  const handleMerlinStateChange = useCallback((state: MerlinState) => {
    setMerlinState(state);
  }, []);

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
    setMerlinState('thinking');

    try {
      const response = await fetch('/api/website-editor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          currentHtml: currentHtml,
          context: businessContext,
          model: selectedModel, // Send selected model
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

        const responseText = data.message || 'I\'ve made the changes you requested!';
        
        // Add Merlin's response
        const merlinMessage: ChatMessage = {
          id: `merlin-${Date.now()}`,
          role: 'merlin',
          content: responseText,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, merlinMessage]);
        
        // Speak response and update state
        setMerlinState('happy');
        if (voiceEnabled) {
          setMerlinMessage(responseText);
        }
        
        // Deduct credits (TODO: Actually track this)
        // setUserCredits(prev => prev - MODEL_CREDITS[selectedModel]);
      } else {
        throw new Error(data.error || 'Failed to process request');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      let userFriendlyMessage = 'I apologize, but I encountered an error processing your request.';
      
      if (errorMsg.includes('404') || errorMsg.includes('Cannot POST')) {
        userFriendlyMessage = 'The server needs to be restarted to enable chat functionality.';
      } else if (errorMsg.includes('500') || errorMsg.includes('Internal Server Error')) {
        userFriendlyMessage = 'The server encountered an error. Please try again.';
      } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        userFriendlyMessage = 'Unable to connect to the server. Please check your connection.';
      }
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'merlin',
        content: userFriendlyMessage,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      setMerlinState('default');
      if (voiceEnabled) {
        setMerlinMessage(userFriendlyMessage);
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.disabled = false;
        }
      }, 50);
    }
  };

  const currentWidth = isCollapsed ? collapsedWidth : width;
  
  // If collapsed, show only expand button
  if (isCollapsed) {
    return (
      <div
        ref={sidebarRef}
        className="flex flex-col h-full flex-shrink-0 relative overflow-visible bg-slate-900 border-r border-slate-700"
        style={{ width: `${collapsedWidth}px` }}
      >
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
      className="flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-r border-slate-700 flex-shrink-0 relative h-full"
      style={{ width: `${currentWidth}px`, overflow: 'visible' }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const startX = e.clientX;
          const startWidth = width;
          
          const handleMouseMove = (e: MouseEvent) => {
            e.preventDefault();
            const diff = e.clientX - startX;
            const newWidth = Math.max(280, Math.min(600, startWidth + diff));
            
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
          
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
        className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize z-30 group flex items-center justify-center"
        style={{ right: '-8px' }}
      >
        <div className="w-1 h-16 bg-slate-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      {/* Collapse Button */}
      <button
        onClick={handleToggleCollapse}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-6 h-12 bg-slate-800 border border-slate-700 rounded-l-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
        style={{ right: '-24px' }}
        title="Collapse Chat"
      >
        <ChevronLeft className="w-4 h-4 text-white" />
      </button>

      {/* Header with LIVE Merlin Avatar */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-indigo-900/50 to-purple-900/50">
        <div className="flex items-start gap-4">
          {/* LIVE Merlin Avatar */}
          <MerlinAvatar
            state={merlinState}
            message={merlinMessage}
            onSpeechInput={handleVoiceInput}
            onStateChange={handleMerlinStateChange}
            size="medium"
            enableVoice={voiceEnabled}
            enableMicrophone={true}
            autoIdle={true}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Merlin</h2>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-1.5 rounded-lg transition-all ${
                  voiceEnabled 
                    ? 'bg-purple-500/30 text-purple-300' 
                    : 'bg-gray-700 text-gray-400'
                }`}
                title={voiceEnabled ? 'Mute Merlin' : 'Enable Voice'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-purple-300 truncate">
              AI Website Wizard • {businessContext.businessName}
            </p>
          </div>
        </div>
        
        {/* Model Selector & Credits */}
        <div className="mt-3 space-y-2">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            userCredits={userCredits}
            compact={true}
          />
          <CreditDisplay 
            credits={userCredits} 
            maxCredits={150}
            onBuyMore={() => window.open('/pricing', '_blank')}
          />
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'merlin' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm flex-shrink-0">
                  🧙
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                  message.role === 'user'
                    ? "bg-purple-600 text-white rounded-br-md"
                    : "bg-slate-800 text-gray-100 rounded-bl-md border border-slate-700"
                )}
              >
                {message.content}
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm flex-shrink-0">
                  {user?.username?.[0]?.toUpperCase() || '👤'}
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm flex-shrink-0">
                🧙
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-purple-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Merlin is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700 bg-slate-900/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Merlin anything..."
            disabled={isLoading}
            className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            data-send-button
            className="bg-purple-600 hover:bg-purple-500 text-white px-4"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        
        <p className="text-[10px] text-slate-500 mt-2 text-center">
          🎤 Click the mic on Merlin to speak • Press Enter to send
        </p>
      </div>
    </div>
  );
}

export default MerlinChatSidebar;
