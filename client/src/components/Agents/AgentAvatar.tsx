/**
 * Agent Avatar Component
 * Displays an agent's avatar with status indicator
 */

import { cn } from '@/lib/utils';
import { getAgentConfig } from './types';
import type { AgentInfo } from './types';

interface AgentAvatarProps {
  agentName: string;
  size?: 'sm' | 'md' | 'lg';
  status?: AgentInfo['status'];
  showStatus?: boolean;
  className?: string;
}

export function AgentAvatar({
  agentName,
  size = 'md',
  status = 'idle',
  showStatus = true,
  className,
}: AgentAvatarProps) {
  const config = getAgentConfig(agentName);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-14 h-14 text-3xl',
  };

  const statusColors = {
    idle: 'bg-green-500',
    working: 'bg-yellow-500 animate-pulse',
    researching: 'bg-blue-500 animate-pulse',
    reporting: 'bg-purple-500 animate-pulse',
    upgrading: 'bg-amber-500 animate-pulse',
    error: 'bg-red-500',
  };

  const statusDotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full',
          `bg-gradient-to-br ${config.gradient}`,
          sizeClasses[size],
          'shadow-lg'
        )}
        style={{ boxShadow: `0 0 20px ${config.color}40` }}
      >
        <span className="drop-shadow-md">{config.emoji}</span>
      </div>
      
      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-gray-900',
            statusColors[status],
            statusDotSizes[size]
          )}
          title={status}
        />
      )}
    </div>
  );
}

