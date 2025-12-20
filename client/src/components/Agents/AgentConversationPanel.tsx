/**
 * Agent Conversation Panel
 * Main component for displaying real-time agent conversations
 * Designed to be embedded inline in the wizard steps
 */

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AgentMessage, AgentTypingIndicator } from './AgentMessage';
import { AgentAvatar } from './AgentAvatar';
import { getAgentConfig } from './types';
import type { AgentMessage as AgentMessageType, AgentConversation } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Users,
  Sparkles,
  Minimize2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentConversationPanelProps {
  conversation?: AgentConversation;
  messages: AgentMessageType[];
  isLoading?: boolean;
  currentAgent?: string;
  phase?: string;
  onMessageClick?: (message: AgentMessageType) => void;
  className?: string;
  variant?: 'inline' | 'sidebar' | 'modal';
  defaultCollapsed?: boolean;
}

export function AgentConversationPanel({
  conversation,
  messages,
  isLoading = false,
  currentAgent,
  phase,
  onMessageClick: _onMessageClick,
  className,
  variant = 'inline',
  defaultCollapsed = false,
}: AgentConversationPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Get unique participants
  const participants = conversation?.participants || 
    [...new Set(messages.map(m => m.agentName))];

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'fixed bottom-4 right-4 z-50',
          'bg-gray-900/95 backdrop-blur-sm rounded-full',
          'shadow-2xl border border-white/10',
          'cursor-pointer hover:scale-105 transition-transform'
        )}
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex -space-x-2">
            {participants.slice(0, 3).map((name) => (
              <AgentAvatar 
                key={name} 
                agentName={name} 
                size="sm" 
                showStatus={false}
              />
            ))}
          </div>
          <span className="text-sm text-white font-medium">
            {messages.length} messages
          </span>
          {isLoading && (
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl overflow-hidden',
        'bg-gray-900/80 backdrop-blur-sm',
        'border border-white/10',
        'shadow-2xl',
        variant === 'inline' && 'w-full',
        variant === 'sidebar' && 'w-80 fixed right-4 top-20 bottom-20 z-40',
        variant === 'modal' && 'w-full max-w-2xl mx-auto',
        className
      )}
    >
      {/* Header */}
      <div 
        className={cn(
          'flex items-center justify-between px-4 py-3',
          'bg-gradient-to-r from-purple-600/20 to-violet-600/20',
          'border-b border-white/10',
          'cursor-pointer'
        )}
        onClick={() => variant === 'inline' && setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {participants.slice(0, 4).map((name) => (
              <AgentAvatar 
                key={name} 
                agentName={name} 
                size="sm" 
                showStatus={false}
                className="ring-2 ring-gray-900"
              />
            ))}
            {participants.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white ring-2 ring-gray-900">
                +{participants.length - 4}
              </div>
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">
                🏛️ The Council
              </span>
              {phase && (
                <Badge variant="outline" className="text-xs">
                  {phase}
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {participants.length} agent{participants.length !== 1 && 's'} • 
              {messages.length} message{messages.length !== 1 && 's'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isLoading && (
            <Badge className="bg-purple-500/20 text-purple-400 text-xs animate-pulse">
              <Sparkles className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
          
          {variant !== 'inline' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(true);
              }}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
          
          {variant === 'inline' && (
            <Button variant="ghost" size="icon" className="h-7 w-7">
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ScrollArea 
              className={cn(
                variant === 'inline' && 'h-[400px]',
                variant === 'sidebar' && 'h-[calc(100vh-200px)]',
                variant === 'modal' && 'h-[500px]'
              )}
              ref={scrollRef}
            >
              <div className="p-3 space-y-2">
                {messages.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs">Agents will appear here when called</p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <AgentMessage
                    key={message.id}
                    message={message}
                    isLatest={index === messages.length - 1 && isLoading}
                  />
                ))}

                {isLoading && currentAgent && (
                  <AgentTypingIndicator agentName={currentAgent} />
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer with active agents */}
      {!isCollapsed && participants.length > 0 && (
        <div className="px-4 py-2 bg-gray-900/50 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Users className="w-3 h-3" />
            <span>Active:</span>
            {participants.map((name, i) => {
              const config = getAgentConfig(name);
              return (
                <span key={name} style={{ color: config.color }}>
                  {config.emoji} {config.name}
                  {i < participants.length - 1 && ','}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Compact version for embedding in wizard steps
 */
export function AgentConversationCompact({
  messages,
  isLoading,
  currentAgent,
  maxMessages = 5,
}: {
  messages: AgentMessageType[];
  isLoading?: boolean;
  currentAgent?: string;
  maxMessages?: number;
}) {
  const recentMessages = messages.slice(-maxMessages);
  
  return (
    <div className="rounded-lg bg-gray-900/50 border border-white/5 overflow-hidden">
      <div className="p-2 space-y-1.5">
        {recentMessages.map((message, index) => {
          const config = getAgentConfig(message.agentName);
          const isLatest = index === recentMessages.length - 1;
          
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'flex items-start gap-2 p-2 rounded',
                message.role === 'merlin' ? 'bg-purple-500/10' : 'bg-gray-800/30'
              )}
            >
              <span className="text-lg flex-shrink-0">{config.emoji}</span>
              <div className="min-w-0 flex-1">
                <span 
                  className="text-xs font-medium"
                  style={{ color: config.color }}
                >
                  {config.name}
                </span>
                <p className="text-xs text-gray-400 truncate">
                  {message.content.slice(0, 100)}
                  {message.content.length > 100 && '...'}
                </p>
              </div>
              {isLatest && isLoading && (
                <Sparkles className="w-3 h-3 text-purple-400 animate-pulse flex-shrink-0" />
              )}
            </motion.div>
          );
        })}
        
        {isLoading && currentAgent && (
          <AgentTypingIndicator agentName={currentAgent} />
        )}
      </div>
      
      {messages.length > maxMessages && (
        <div className="px-2 py-1 bg-gray-900/30 text-xs text-gray-500 text-center">
          +{messages.length - maxMessages} more messages
        </div>
      )}
    </div>
  );
}

export default AgentConversationPanel;

