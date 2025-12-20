import React, { useState } from 'react';
import {
  Folder,
  Globe,
  GitBranch,
  Bot,
  Package,
  User,
  Settings,
  Activity,
  Brain,
  Terminal,
  Monitor,
  Database,
  HardDrive,
  Key,
  Users,
  History,
  Puzzle,
  BarChart3,
  Eye,
  FileText,
  Atom,
  Route,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles,
  Download,
  Bug,
  Ticket,
  Headphones,
  Store,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useServiceAccess } from '@/hooks/use-service-access';
import { PERMISSIONS } from '@/hooks/use-permissions';

interface SidebarProps {
  activePanel?: string;
  onPanelChange?: (panel: string) => void;
  currentModule?: string;
  onModuleChange?: (module: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  activePanel = 'explorer',
  onPanelChange,
  currentModule = 'stargate',
  onModuleChange: _onModuleChange,
  isCollapsed: externalCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const { hasPermission, isAdmin } = useAuth();
  const { isServiceActive } = useServiceAccess();
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const sidebarWidth = 300; // Fixed width, no resizing - increased to prevent text cutoff

  // All groups collapsed by default, except Services which is open by default
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Core: false,
    Services: true, // Services always open by default
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const collapsedWidth = 12; // Ultra-thin - just enough for expand arrow
  const currentWidth = isCollapsed ? collapsedWidth : sidebarWidth;

  const toolGroups = [
    {
      name: 'Core',
      color: 'text-blue-500',
      glowColor: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.6)]',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      items: [
        { id: 'website', icon: Globe, title: 'Home' },
      ],
    },
    {
      name: 'Services',
      color: 'text-cyan-500',
      glowColor: 'hover:shadow-[0_0_15px_rgba(6,182,212,0.6)]',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950',
      collapsible: true,
      items: [
        {
          id: 'stargate-websites',
          icon: Globe,
          title: 'Merlin Website Wizard',
          available: isServiceActive('websites'),
          isAvailable: isServiceActive('websites'),
        },
        {
          id: 'stargate-ide',
          icon: Sparkles,
          title: 'Stargate IDE',
          available: isServiceActive('stargate'),
          isAvailable: isServiceActive('stargate'),
          comingSoon: !isServiceActive('stargate'), // Show "Soon" badge
          // NO dropdown - removed hasSubmenu and submenu
        },
        { 
          id: 'pandora', 
          icon: Brain, 
          title: 'PANDORA', 
          available: isServiceActive('pandora'),
          isAvailable: isServiceActive('pandora'),
          comingSoon: !isServiceActive('pandora'),
        },
        { 
          id: 'quantum', 
          icon: Atom, 
          title: 'Quantum Core', 
          available: isServiceActive('quantum'),
          isAvailable: isServiceActive('quantum'),
          comingSoon: !isServiceActive('quantum'),
        },
        { 
          id: 'regis', 
          icon: Route, 
          title: 'Regis Core', 
          available: isServiceActive('regis'),
          isAvailable: isServiceActive('regis'),
          comingSoon: !isServiceActive('regis'),
        },
        { 
          id: 'nero', 
          icon: Shield, 
          title: 'Nero Core', 
          available: isServiceActive('nero'),
          isAvailable: isServiceActive('nero'),
          comingSoon: !isServiceActive('nero'),
        },
        { 
          id: 'titan-ticket', 
          icon: Ticket, 
          title: 'Titan Ticket Master', 
          available: isServiceActive('titanTicket'),
          isAvailable: isServiceActive('titanTicket'),
          comingSoon: !isServiceActive('titanTicket'),
        },
        { 
          id: 'titan-support', 
          icon: Headphones, 
          title: 'Titan Support Master', 
          available: isServiceActive('titanSupport'),
          isAvailable: isServiceActive('titanSupport'),
          comingSoon: !isServiceActive('titanSupport'),
        },
        { 
          id: 'ai-factory', 
          icon: Store, 
          title: 'AI Factory', 
          available: isServiceActive('aiFactory'),
          isAvailable: isServiceActive('aiFactory'),
          comingSoon: !isServiceActive('aiFactory'),
        },
      ],
    },
    // Development group removed - now nested under Stargate IDE as a dropdown
  ];

  return (
    <div className="flex relative">
      <div
        className={`bg-gradient-to-b from-slate-800 via-blue-900 to-slate-800 border-r border-blue-700/50 flex flex-col backdrop-blur-xl shadow-2xl h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? 'overflow-hidden' : ''
        }`}
        style={{ width: currentWidth }}
        data-testid="sidebar"
      >
        {/* Stargate Branding at Top - Hidden when collapsed, clickable like Home */}
        {!isCollapsed && (
          <div className="border-b border-blue-700/30 pt-8 pb-5 px-5">
            <div className="flex items-center justify-center">
              <button
                onClick={() => {
                  console.log('Panel change: home (via Stargate)');
                  onPanelChange?.('home');
                }}
                className="relative px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{
                  background: activePanel === 'home'
                    ? 'linear-gradient(135deg, rgba(203, 213, 225, 0.25) 0%, rgba(148, 163, 184, 0.2) 100%)'
                    : 'linear-gradient(135deg, rgba(203, 213, 225, 0.15) 0%, rgba(148, 163, 184, 0.1) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: activePanel === 'home'
                    ? '1px solid rgba(203, 213, 225, 0.5)'
                    : '1px solid rgba(203, 213, 225, 0.3)',
                  boxShadow: activePanel === 'home'
                    ? '0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 20px rgba(203, 213, 225, 0.3)'
                    : '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                }}
                title="Home"
                data-testid="stargate-home-button"
              >
                <div
                  className="absolute top-0 left-0 w-full h-1/2 rounded-t-lg"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)',
                    pointerEvents: 'none',
                  }}
                />
                <div className="text-center relative z-10">
                  <h2
                    className="text-lg font-light tracking-[0.15em] text-white"
                    style={{
                      textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(200, 220, 255, 0.3)',
                      filter: 'drop-shadow(0 2px 8px rgba(100, 150, 255, 0.3))',
                    }}
                  >
                    Complete AI
                  </h2>
                  <h2
                    className="text-lg font-light tracking-[0.15em] text-white"
                    style={{
                      textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(200, 220, 255, 0.3)',
                      filter: 'drop-shadow(0 2px 8px rgba(100, 150, 255, 0.3))',
                    }}
                  >
                    Development System
                  </h2>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable content area - Hidden when collapsed */}
        {!isCollapsed && (
          <div
            className="flex-1 overflow-y-auto px-4 space-y-4 py-4"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#3b82f6 transparent',
            }}
          >
          {/* Home - Standalone (no group header) */}
          {toolGroups
            .find(g => g.name === 'Core')
            ?.items.map((item: any) => {
              const Icon = item.icon;
              const isActive = activePanel === item.id;
              const isAvailable = item.available !== false;
              const group = toolGroups.find(g => g.name === 'Core')!;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isAvailable) {
                      console.log('Panel change:', item.id);
                      onPanelChange?.(item.id);
                    }
                  }}
                  disabled={!isAvailable}
                  className={cn(
                    'w-full flex items-center transition-all duration-200',
                    isCollapsed
                      ? 'px-2 py-2.5 justify-center'
                      : 'space-x-3 px-3 py-2.5 rounded-lg text-left',
                    isAvailable && group.glowColor,
                    isActive && isAvailable
                      ? `bg-gradient-to-r from-blue-600/20 to-purple-600/20 ${group.color} shadow-lg border border-blue-500/30 rounded-lg`
                      : isAvailable
                        ? `hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10 text-white hover:text-white hover:scale-[1.02] ${isCollapsed ? 'rounded-lg' : ''}`
                        : 'text-gray-400'
                  )}
                  title={item.title}
                  data-testid={`sidebar-${item.id}`}
                >
                  <Icon
                    className={cn(
                      isCollapsed ? 'w-5 h-5' : 'w-5 h-5',
                      isActive && isAvailable
                        ? group.color
                        : isAvailable
                          ? 'text-white'
                          : 'text-gray-500'
                    )}
                  />
                  {!isCollapsed && (
                    <span
                      className={cn(
                        'text-sm font-normal',
                        isAvailable ? 'text-white' : 'text-gray-500'
                      )}
                    >
                      {item.title}
                    </span>
                  )}
                </button>
              );
            })}

          {/* Other Groups */}
          {toolGroups
            .filter(g => {
              // Core is always shown (handled separately above)
              if (g.name === 'Core') return false;
              
              // All groups are always visible
              return true;
            })
            .map((group, _groupIndex) => {
              const isGroupExpanded = expandedGroups[group.name] || false;

              return (
                <div key={group.name} className="space-y-2">
                  {/* Group Header */}
                  {!isCollapsed && (
                    <div
                      className={cn(
                        'px-3 py-1 border-b border-blue-700/30 cursor-pointer hover:bg-blue-600/10 rounded transition-colors'
                      )}
                      onClick={() => toggleGroup(group.name)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-blue-200/80 uppercase tracking-wider">
                          {group.name}
                        </h3>
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 text-blue-300 transition-transform',
                            !isGroupExpanded && '-rotate-90'
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Group Items */}
                  {isGroupExpanded && (
                    <div className="space-y-1">
                      {group.items
                        .filter((item: any) => {
                          // For Services group: show all services for admins, only active for regular users
                          if (group.name === 'Services') {
                            if (isAdmin) {
                              // Admin sees all services
                              return true;
                            } else {
                              // Regular users only see active services
                              if (item.available === false) {
                                return false;
                              }
                            }
                          }
                          // Check permission if required
                          if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
                            return false;
                          }
                          return true;
                        })
                        .map((item: any) => {
                        const Icon = item.icon;
                        const isActive = activePanel === item.id;
                        const isAvailable = item.available !== false;
                        const isComingSoon = item.comingSoon === true;
                        const isAvailableBadge = item.isAvailable === true;
                        const hasSubmenu = item.hasSubmenu === true;
                        const isSubmenuExpanded = expandedGroups[item.id] || false;

                        // Render item with submenu if it has one
                        if (hasSubmenu && item.submenu) {
                          return (
                            <div key={item.id} className="space-y-1">
                              {/* Main item button with dropdown toggle */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Toggle submenu
                                  setExpandedGroups(prev => ({
                                    ...prev,
                                    [item.id]: !prev[item.id]
                                  }));
                                  // Also change panel if available
                                  if (isAvailable) {
                                    console.log('Panel change:', item.id);
                                    onPanelChange?.(item.id);
                                  }
                                }}
                                disabled={!isAvailable}
                                className={cn(
                                  'w-full flex items-center transition-all duration-200',
                                  isCollapsed
                                    ? 'px-2 py-2.5 justify-center'
                                    : 'space-x-3 px-3 py-2.5 rounded-lg text-left',
                                  !isAvailable &&
                                    'opacity-70 cursor-not-allowed text-muted-foreground/60',
                                  isAvailable && group.glowColor,
                                  isAvailableBadge && 'hover:shadow-[0_0_15px_rgba(34,197,94,0.6)]',
                                  isActive && isAvailable
                                    ? `bg-gradient-to-r from-blue-600/20 to-purple-600/20 ${group.color} shadow-lg border border-blue-500/30 rounded-lg`
                                    : isAvailable
                                      ? `hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10 text-white hover:text-white hover:scale-[1.02] ${isCollapsed ? 'rounded-lg' : ''}`
                                      : 'text-gray-400'
                                )}
                                title={item.title}
                                data-testid={`sidebar-${item.id}`}
                              >
                                <Icon
                                  className={cn(
                                    isCollapsed ? 'w-5 h-5' : 'w-5 h-5',
                                    isActive && isAvailable
                                      ? group.color
                                      : isAvailable
                                        ? 'text-white'
                                        : 'text-gray-500'
                                  )}
                                />
                                {!isCollapsed && (
                                  <div className="flex items-center justify-between flex-1">
                                    <span
                                      className={cn(
                                        'text-sm font-normal',
                                        isAvailable ? 'text-white' : 'text-gray-500'
                                      )}
                                    >
                                      {item.title}
                                    </span>
                                    <ChevronDown
                                      className={cn(
                                        'w-4 h-4 text-blue-300 transition-transform',
                                        !isSubmenuExpanded && '-rotate-90'
                                      )}
                                    />
                                  </div>
                                )}
                              </button>
                              {/* Submenu items (Development items) */}
                              {isSubmenuExpanded && !isCollapsed && (
                                <div className="ml-4 space-y-1 border-l-2 border-blue-700/30 pl-3">
                                  {/* Development heading with icon */}
                                  <div className="px-2 py-2 flex items-center gap-2">
                                    <Code2 className="w-4 h-4 text-green-400" />
                                    <h4 className="text-xs font-semibold text-blue-200/80 uppercase tracking-wider">
                                      Development
                                    </h4>
                                  </div>
                                  {/* Submenu items */}
                                  {item.submenu
                                    .filter((subItem: any) => {
                                      // Check permission if required
                                      if (subItem.requiredPermission && !hasPermission(subItem.requiredPermission)) {
                                        return false;
                                      }
                                      return true;
                                    })
                                    .map((subItem: any) => {
                                      const SubIcon = subItem.icon;
                                      const isSubActive = activePanel === subItem.id;
                                      const isSubAvailable = subItem.available !== false;

                                      return (
                                        <button
                                          key={subItem.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (isSubAvailable) {
                                              console.log('Panel change:', subItem.id);
                                              onPanelChange?.(subItem.id);
                                            }
                                          }}
                                          disabled={!isSubAvailable}
                                          className={cn(
                                            'w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-left transition-all duration-200',
                                            isSubActive && isSubAvailable
                                              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                              : 'text-white/70 hover:text-white hover:bg-blue-600/10'
                                          )}
                                          title={subItem.title}
                                          data-testid={`sidebar-${subItem.id}`}
                                        >
                                          <SubIcon className="w-4 h-4" />
                                          <span className="text-xs font-normal">
                                            {subItem.title}
                                          </span>
                                        </button>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Regular item without submenu
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              if (isAvailable) {
                                console.log('Panel change:', item.id);
                                onPanelChange?.(item.id);
                              }
                            }}
                            disabled={!isAvailable}
                            className={cn(
                              'w-full flex items-center transition-all duration-200',
                              isCollapsed
                                ? 'px-2 py-2.5 justify-center'
                                : 'space-x-3 px-3 py-2.5 rounded-lg text-left',
                              !isAvailable &&
                                'opacity-70 cursor-not-allowed text-muted-foreground/60',
                              isAvailable && group.glowColor,
                              isAvailableBadge && 'hover:shadow-[0_0_15px_rgba(34,197,94,0.6)]',
                              isActive && isAvailable
                                ? `bg-gradient-to-r from-blue-600/20 to-purple-600/20 ${group.color} shadow-lg border border-blue-500/30 rounded-lg`
                                : isAvailable
                                  ? `hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10 text-white hover:text-white hover:scale-[1.02] ${isCollapsed ? 'rounded-lg' : ''}`
                                  : 'text-gray-400'
                            )}
                            title={
                              isComingSoon
                                ? `${item.title} - Coming Soon`
                                : isAvailableBadge
                                  ? `${item.title} - Available`
                                  : item.title
                            }
                            data-testid={`sidebar-${item.id}`}
                          >
                            <Icon
                              className={cn(
                                isCollapsed ? 'w-5 h-5' : 'w-5 h-5',
                                isActive && isAvailable
                                  ? group.color
                                  : isAvailable
                                    ? 'text-white'
                                    : 'text-gray-500'
                              )}
                            />
                            {!isCollapsed && (
                              <div className="flex items-center justify-between flex-1">
                                <span
                                  className={cn(
                                    'text-sm font-normal',
                                    isAvailable ? 'text-white' : 'text-gray-500'
                                  )}
                                >
                                  {item.title}
                                </span>
                                {isComingSoon && (
                                  <span className="text-xs px-2 py-0.5 rounded neon-soon-badge">
                                    Soon
                                  </span>
                                )}
                                {isAvailableBadge && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.4)]">
                                    Available
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                        );
                      })
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Fixed Bottom - Collapse Toggle (only shown when expanded) */}
        {!isCollapsed && (
          <div className="px-4 pb-4">
            <button
              onClick={() =>
                onToggleCollapse ? onToggleCollapse() : setInternalCollapsed(!internalCollapsed)
              }
              className="w-full flex items-center justify-center px-2 py-2 rounded-lg text-blue-300 hover:text-white hover:bg-blue-600/20 transition-all duration-200 border border-blue-700/30 hover:border-blue-500/50"
              title="Collapse Sidebar"
              data-testid="sidebar-toggle"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="ml-2 text-xs">Collapse</span>
            </button>
          </div>
        )}
      </div>

      {/* Expand Arrow - Only visible when collapsed, positioned on left edge */}
      {isCollapsed && (
        <button
          onClick={() =>
            onToggleCollapse ? onToggleCollapse() : setInternalCollapsed(false)
          }
          className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-16 bg-gradient-to-r from-blue-600/90 to-purple-600/90 border-r border-blue-500/50 rounded-r-lg flex items-center justify-center text-white hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg z-50 group"
          title="Expand Sidebar"
          data-testid="sidebar-expand"
        >
          <ChevronRight className="w-3 h-3 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
}
