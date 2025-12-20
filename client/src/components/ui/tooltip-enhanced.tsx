/**
 * Enhanced Tooltip Component
 * Phase 4.2: UI/UX Polish - Better tooltips with help text
 */

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedTooltipProps {
  content: string;
  children?: React.ReactNode;
  variant?: 'default' | 'info' | 'help';
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function EnhancedTooltip({
  content,
  children,
  variant = 'default',
  side = 'top',
  className,
}: EnhancedTooltipProps) {
  const icon = variant === 'info' ? <Info className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <button
              type="button"
              className={cn(
                'inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors',
                className
              )}
            >
              {icon}
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface HelpTextProps {
  text: string;
  className?: string;
}

export function HelpText({ text, className }: HelpTextProps) {
  return (
    <div className={cn('flex items-start gap-2 text-sm text-muted-foreground', className)}>
      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <p>{text}</p>
    </div>
  );
}

