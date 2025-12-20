/**
 * Tabs Component
 * Accessible tabbed interface
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export function Tabs({
  items,
  defaultTab,
  onChange,
  variant = 'default',
  className = '',
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id || '');

  const handleTabChange = (tabId: string) => {
    const tab = items.find((t) => t.id === tabId);
    if (tab && !tab.disabled) {
      setActiveTab(tabId);
      onChange?.(tabId);
    }
  };

  const activeTabContent = items.find((tab) => tab.id === activeTab)?.content;

  const variantClasses = {
    default: 'border-b',
    pills: 'bg-muted rounded-lg p-1',
    underline: 'border-b-2 border-transparent',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        className={cn('flex gap-2 mb-4', variantClasses[variant])}
        role="tablist"
      >
        {items.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                {
                  'border-b-2 border-primary text-primary': (variant === 'default' || variant === 'underline') && isActive,
                  'bg-background text-foreground shadow-sm rounded-md': variant === 'pills' && isActive,
                  'text-muted-foreground hover:text-foreground': !isActive && !tab.disabled,
                  'opacity-50 cursor-not-allowed': tab.disabled,
                }
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="tab-content"
      >
        {activeTabContent}
      </div>
    </div>
  );
}

