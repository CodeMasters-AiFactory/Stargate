/**
 * Agent Message Component
 * Displays a single message in the agent conversation
 */

import { cn } from '@/lib/utils';
import { AgentAvatar } from './AgentAvatar';
import { getAgentConfig } from './types';
import type { AgentMessage as AgentMessageType } from './types';
import { motion } from 'framer-motion';

interface AgentMessageProps {
  message: AgentMessageType;
  isLatest?: boolean;
}

export function AgentMessage({ message, isLatest = false }: AgentMessageProps) {
  const config = getAgentConfig(message.agentName);
  const isMerlin = message.role === 'merlin';
  
  // Parse timestamp
  const timestamp = new Date(message.timestamp);
  const timeString = timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Message type styling
  const messageTypeStyles: Record<AgentMessageType['messageType'], string> = {
    greeting: 'border-l-4 border-emerald-500',
    analysis: 'border-l-4 border-blue-500',
    question: 'border-l-4 border-amber-500',
    answer: 'border-l-4 border-cyan-500',
    report: 'border-l-4 border-purple-500 bg-purple-500/5',
    action: 'border-l-4 border-orange-500',
    completion: 'border-l-4 border-green-500 bg-green-500/5',
  };

  // Format content with markdown-like styling
  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\n/g, '<br />')
      .replace(/• /g, '<span class="text-gray-400">• </span>');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3 p-3 rounded-lg transition-all',
        isMerlin ? 'bg-purple-500/10' : 'bg-gray-800/50',
        messageTypeStyles[message.messageType],
        isLatest && 'ring-1 ring-white/10'
      )}
    >
      <AgentAvatar
        agentName={message.agentName}
        size="sm"
        status={isLatest ? 'working' : 'idle'}
        showStatus={isLatest}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span 
            className="font-semibold text-sm"
            style={{ color: config.color }}
          >
            {config.emoji} {config.name}
          </span>
          {message.metadata && typeof message.metadata === 'object' && 'version' in message.metadata && typeof message.metadata.version === 'string' && (
            <span className="text-xs text-gray-500">
              v{message.metadata.version}
            </span>
          )}
          <span className="text-xs text-gray-600">
            {timeString}
          </span>
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded',
            message.messageType === 'report' && 'bg-purple-500/20 text-purple-400',
            message.messageType === 'completion' && 'bg-green-500/20 text-green-400',
            message.messageType === 'action' && 'bg-orange-500/20 text-orange-400',
            message.messageType === 'greeting' && 'bg-emerald-500/20 text-emerald-400',
          )}>
            {message.messageType}
          </span>
        </div>
        
        <div 
          className="text-sm text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
        />
      </div>
    </motion.div>
  );
}

/**
 * Typing indicator for when an agent is thinking
 */
export function AgentTypingIndicator({ agentName }: { agentName: string }) {
  const config = getAgentConfig(agentName);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3 p-3"
    >
      <AgentAvatar agentName={agentName} size="sm" status="working" />
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-400">{config.name} is thinking</span>
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: config.color }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </span>
      </div>
    </motion.div>
  );
}

