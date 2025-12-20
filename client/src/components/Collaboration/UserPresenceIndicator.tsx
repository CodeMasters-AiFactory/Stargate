/**
 * User Presence Indicator
 * Shows who's currently online and collaborating
 */

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Users, Circle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export interface UserPresence {
  userId: string;
  userName: string;
  avatar?: string;
  status: 'idle' | 'typing' | 'editing' | 'viewing';
  cursor?: { x: number; y: number };
}

export interface UserPresenceIndicatorProps {
  roomId: string;
  currentUserId: string;
}

export function UserPresenceIndicator({
  roomId,
  currentUserId,
}: UserPresenceIndicatorProps) {
  const [users, setUsers] = useState<UserPresence[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketClient = io(process.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });

    socketClient.on('connect', () => {
      // Fetch active users
      fetch(`/api/collaboration/room/${roomId}/users`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUsers(data.users.filter((u: UserPresence) => u.userId !== currentUserId));
          }
        })
        .catch(err => console.error('Failed to load users:', err));
    });

    socketClient.on('users-update', (data: { users: UserPresence[] }) => {
      setUsers(data.users.filter(u => u.userId !== currentUserId));
    });

    socketClient.on('user-joined', (data: { user: UserPresence }) => {
      if (data.user.userId !== currentUserId) {
        setUsers(prev => {
          if (prev.find(u => u.userId === data.user.userId)) {
            return prev;
          }
          return [...prev, data.user];
        });
      }
    });

    socketClient.on('user-left', (data: { userId: string }) => {
      setUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    setSocket(socketClient);

    return () => {
      socketClient.disconnect();
    };
  }, [roomId, currentUserId]);

  const getStatusColor = (status: UserPresence['status']) => {
    switch (status) {
      case 'editing':
        return 'bg-green-500';
      case 'typing':
        return 'bg-yellow-500';
      case 'viewing':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">{users.length}</span>
          <span className="text-xs text-muted-foreground">online</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm mb-3">Active Collaborators</h4>
          {users.map(user => (
            <div key={user.userId} className="flex items-center gap-3 p-2 rounded hover:bg-muted">
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.userName}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.status}</p>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

