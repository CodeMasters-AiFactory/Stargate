/**
 * Client Top Bar
 * Top navigation bar for website preview with controls and user menu
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Bell,
  HelpCircle,
  Search,
  FolderOpen,
  BarChart3,
  Settings,
  Archive,
  CreditCard,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface ClientTopBarProps {
  websiteId?: string;
  websiteName?: string;
  onSave?: () => void | Promise<void>;
  onPublish?: () => void | Promise<void>;
  onPreviewModeChange?: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  isDirty?: boolean; // Has unsaved changes
  publishStatus?: 'draft' | 'published' | 'publishing';
  saveStatus?: 'saving' | 'saved' | 'error' | null;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  previewMode?: 'desktop' | 'tablet' | 'mobile';
}

export function ClientTopBar({
  websiteId: _websiteId,
  websiteName: _websiteName = 'My Website',
  onSave: _onSave,
  onPublish: _onPublish,
  onPreviewModeChange,
  isDirty: _isDirty = false,
  publishStatus: _publishStatus = 'draft',
  saveStatus: _saveStatus = null,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  previewMode = 'desktop',
}: ClientTopBarProps) {
  const { user, logout } = useAuth();
  const [, _setLocation] = useLocation();

  return (
    <div className="h-10 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-blue-900/50 flex items-center justify-between px-4 flex-shrink-0 z-50">
      {/* Left Section - Preview Mode Toggle Only */}
      <div className="flex items-center gap-3">
        {/* Preview Mode Toggle */}
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreviewModeChange?.('desktop')}
                  className={cn(
                    'h-8 w-8 p-0 text-white hover:bg-slate-800/50',
                    previewMode === 'desktop' && 'bg-slate-800/70'
                  )}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Desktop View</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreviewModeChange?.('tablet')}
                  className={cn(
                    'h-8 w-8 p-0 text-white hover:bg-slate-800/50',
                    previewMode === 'tablet' && 'bg-slate-800/70'
                  )}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tablet View</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreviewModeChange?.('mobile')}
                  className={cn(
                    'h-8 w-8 p-0 text-white hover:bg-slate-800/50',
                    previewMode === 'mobile' && 'bg-slate-800/70'
                  )}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mobile View</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-l border-slate-700 pl-3 ml-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="h-8 w-8 p-0 text-white hover:bg-slate-800/50 disabled:opacity-30"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="h-8 w-8 p-0 text-white hover:bg-slate-800/50 disabled:opacity-30"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Center Section - Spacer (Navigation moved to left sidebar) */}
      <div className="flex-1" />

      {/* Right Section - Quick Actions & User Menu */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // TODO: Implement search functionality
                  console.log('Search clicked - feature coming soon');
                }}
                className="h-8 w-8 p-0 text-white hover:bg-slate-800/50"
              >
                <Search className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Search</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Notifications */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // TODO: Implement notifications panel
                  console.log('Notifications clicked - feature coming soon');
                }}
                className="relative h-8 w-8 p-0 text-white hover:bg-slate-800/50"
              >
                <Bell className="w-3.5 h-3.5" />
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                  3
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Help */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Open help documentation or support
                  window.open('https://docs.stargateportal.com', '_blank');
                }}
                className="h-8 w-8 p-0 text-white hover:bg-slate-800/50"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Help & Support</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-white hover:bg-slate-800/50"
            >
              <Avatar className="w-5 h-5 mr-2">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-xs">
                  {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs hidden sm:inline">
                {user?.username || user?.email?.split('@')[0] || 'User'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700 text-white">
            <DropdownMenuLabel className="text-slate-400">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-700" />

            {/* My Projects */}
            <DropdownMenuItem className="text-white hover:bg-slate-800 focus:bg-slate-800">
              <FolderOpen className="w-4 h-4 mr-2" />
              My Projects
            </DropdownMenuItem>

            {/* Usage */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-white hover:bg-slate-800 focus:bg-slate-800">
                <BarChart3 className="w-4 h-4 mr-2" />
                Usage
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-slate-900 border-slate-700 text-white">
                <DropdownMenuItem className="text-white hover:bg-slate-800">
                  <span className="text-xs">Package: Professional</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-800">
                  <span className="text-xs">Pages: 5/10</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-800">
                  <span className="text-xs">Images: 12/50</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-800">
                  <span className="text-xs">Storage: 2.5GB/10GB</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Settings */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-white hover:bg-slate-800 focus:bg-slate-800">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-slate-900 border-slate-700 text-white">
                <DropdownMenuItem className="text-white hover:bg-slate-800">
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-800">
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-800">
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Backup & Restore */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-white hover:bg-slate-800 focus:bg-slate-800">
                <Archive className="w-4 h-4 mr-2" />
                Backup & Restore
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-slate-900 border-slate-700 text-white">
                <DropdownMenuItem className="text-white hover:bg-slate-800">
                  Create Backup
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-800">
                  View Backups
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-800">
                  Restore from Backup
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Billing */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-white hover:bg-slate-800 focus:bg-slate-800">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-slate-900 border-slate-700 text-white">
                <DropdownMenuItem className="text-white hover:bg-slate-800">
                  Current Plan
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-800">
                  Payment Method
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-800">
                  Billing History
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              className="text-white hover:bg-slate-800 focus:bg-slate-800"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

