import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLocation } from 'wouter';
import { Bell, RefreshCw, ChevronDown, Shield } from 'lucide-react';
import { useIDE } from '@/hooks/use-ide';
import { useAuth } from '@/contexts/AuthContext';

interface TopNavbarProps {
  currentSection?: string;
}

export function TopNavbar({ currentSection = 'Dashboard' }: TopNavbarProps) {
  // Use ref to store time and only update DOM directly to prevent re-renders
  const timeRef = useRef<HTMLDivElement>(null);
  const [serverStatus] = useState('Online');
  const [notifications] = useState(3);
  const [, setLocation] = useLocation();
  const { setState } = useIDE();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const updateTime = () => {
      if (timeRef.current) {
        const now = new Date();
        timeRef.current.textContent = now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      }
    };

    // Update immediately
    updateTime();

    // Then update every second
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  // Reserved for future use: formatTime, formatDate
  // const formatTime = (date: Date) => { ... }
  // const formatDate = (date: Date) => { ... }

  return (
    <div className="h-10 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-blue-800/50 flex items-center justify-between px-4 backdrop-blur-xl flex-shrink-0">
      {/* Left side - Page Title */}
      <div className="flex items-center">
        <h1 className="text-sm font-bold bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
          {currentSection}
        </h1>
      </div>

      {/* Center - Spacer */}
      <div className="flex-1"></div>

      {/* Right side - Time, Notifications, Profile */}
      <div className="flex items-center space-x-2">
        {/* Admin Button - Only visible to admins, positioned before Online status */}
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-300 hover:text-white hover:bg-blue-600/20 h-7 px-2 flex items-center space-x-1"
            onClick={() => setState(prev => ({ ...prev, currentView: 'admin' }))}
            data-testid="button-admin"
          >
            <Shield className="w-3 h-3" />
            <span className="text-xs font-medium">Admin</span>
          </Button>
        )}

        {/* Server Status */}
        <div className="flex items-center space-x-1 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-xs font-medium">{serverStatus}</span>
        </div>

        {/* Time Only - Using ref to prevent re-renders */}
        <div ref={timeRef} className="text-blue-200 font-mono text-xs font-semibold">
          {new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>

        {/* Refresh Button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-300 hover:text-white hover:bg-blue-600/20 h-7 w-7 p-0"
          data-testid="button-refresh"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative text-blue-300 hover:text-white hover:bg-blue-600/20 h-7 w-7 p-0"
          data-testid="button-notifications"
        >
          <Bell className="w-3 h-3" />
          {notifications > 0 && (
            <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
              {notifications}
            </Badge>
          )}
        </Button>

        {/* Profile Button - Avatar Only */}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-0.5 text-blue-300 hover:text-white hover:bg-blue-600/20 h-7"
          onClick={() => setLocation('/account-settings')}
          data-testid="button-profile"
        >
          <Avatar className="w-4 h-4">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-xs">
              RD
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="w-2.5 h-2.5" />
        </Button>
      </div>
    </div>
  );
}
