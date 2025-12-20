/**
 * Collaboration Sidebar
 * Displays active users, comments, and collaboration controls
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, Send, X } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export interface CollaborationSidebarProps {
  roomId: string;
  userId: string;
  userName: string;
  avatar?: string;
  onClose?: () => void;
}

export interface ActiveUser {
  userId: string;
  userName: string;
  avatar?: string;
  status: 'idle' | 'typing' | 'editing' | 'viewing';
  cursor?: { x: number; y: number };
  color?: string;
}

export function CollaborationSidebar({
  roomId,
  userId,
  userName,
  avatar,
  onClose,
}: CollaborationSidebarProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [comments, setComments] = useState<Array<{ id: string; text: string; userId: string; userName: string; timestamp: Date }>>([]);
  const [commentText, setCommentText] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io(process.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      // Join room
      newSocket.emit('join-room', {
        roomId,
        userId,
        userName,
        avatar,
      });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for user events
    newSocket.on('user-joined', (data: { userId: string; userName: string; avatar?: string }) => {
      setActiveUsers(prev => {
        if (prev.find(u => u.userId === data.userId)) {
          return prev;
        }
        return [...prev, {
          userId: data.userId,
          userName: data.userName,
          avatar: data.avatar,
          status: 'viewing',
        }];
      });
    });

    newSocket.on('user-left', (data: { userId: string }) => {
      setActiveUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    newSocket.on('status-update', (data: { userId: string; status: ActiveUser['status'] }) => {
      setActiveUsers(prev =>
        prev.map(u => u.userId === data.userId ? { ...u, status: data.status } : u)
      );
    });

    newSocket.on('room-state', (data: { users: ActiveUser[] }) => {
      setActiveUsers(data.users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-room', { roomId });
      newSocket.disconnect();
    };
  }, [roomId, userId, userName, avatar]);

  const handleSendComment = () => {
    if (!commentText.trim() || !socket) return;

    // In production, this would send to server
    const newComment = {
      id: `comment-${Date.now()}`,
      text: commentText,
      userId,
      userName,
      timestamp: new Date(),
    };

    setComments(prev => [...prev, newComment]);
    setCommentText('');
  };

  const getStatusColor = (status: ActiveUser['status']) => {
    switch (status) {
      case 'editing':
        return 'bg-green-500';
      case 'typing':
        return 'bg-blue-500';
      case 'viewing':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full w-80 border-l bg-background">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <h3 className="font-semibold">Collaboration</h3>
          <Badge variant={isConnected ? 'default' : 'secondary'} className="ml-2">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Active Users */}
      <div className="p-4 border-b">
        <h4 className="text-sm font-semibold mb-3">Active Users ({activeUsers.length})</h4>
        <ScrollArea className="h-32">
          <div className="space-y-2">
            {activeUsers.map(user => (
              <div key={user.userId} className="flex items-center gap-2">
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.userName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold">
                        {user.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
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
        </ScrollArea>
      </div>

      {/* Comments */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <h4 className="text-sm font-semibold">Comments</h4>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{comment.userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {comment.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{comment.text}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No comments yet. Start a conversation!
              </p>
            )}
          </div>
        </ScrollArea>

        {/* Comment Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
              placeholder="Add a comment..."
              className="flex-1"
            />
            <Button onClick={handleSendComment} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

