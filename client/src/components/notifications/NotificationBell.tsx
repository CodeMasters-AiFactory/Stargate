import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  actionLabel?: string;
}

// Demo notifications (in real app, these would come from API/WebSocket)
const demoNotifications: Notification[] = [
  {
    id: '1',
    title: 'Website Generated',
    message: 'Your new website "Pacific Prime Properties" is ready to preview',
    type: 'success',
    read: false,
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    actionUrl: '/projects',
    actionLabel: 'View Project',
  },
  {
    id: '2',
    title: 'New Template Available',
    message: '15 new professional templates have been added to the gallery',
    type: 'info',
    read: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    actionUrl: '/templates',
    actionLabel: 'Browse',
  },
  {
    id: '3',
    title: 'AI Assistant Ready',
    message: 'Merlin is ready to help you build your next website',
    type: 'info',
    read: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '4',
    title: 'Deploy Complete',
    message: 'Your website has been deployed successfully',
    type: 'success',
    read: true,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    actionUrl: '/deployments',
    actionLabel: 'View',
  },
];

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const typeColors: Record<Notification['type'], string> = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'px-3 py-2 border-b last:border-b-0 hover:bg-muted/50 transition-colors',
                  !notification.read && 'bg-muted/30'
                )}
              >
                <div className="flex gap-3">
                  {/* Type indicator */}
                  <div
                    className={cn(
                      'mt-1.5 h-2 w-2 rounded-full flex-shrink-0',
                      typeColors[notification.type]
                    )}
                  />
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2">
                      {notification.actionUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          asChild
                        >
                          <a href={notification.actionUrl}>
                            {notification.actionLabel || 'View'}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={clearAll}
              >
                Clear all
              </Button>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <a href="/settings#notifications">
                  <Settings className="h-3 w-3 mr-1" />
                  Settings
                </a>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
