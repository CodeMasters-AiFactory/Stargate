/**
 * Research Status Indicator
 * Compact status bar component showing real-time research/testing progress
 * Can be expanded to show full details
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle2, XCircle, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { AgentTestingPanel } from './AgentTestingPanel';
import { useResearchStatus, type ResearchStatus } from '@/contexts/ResearchStatusContext';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function ResearchStatusIndicator() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { status: researchStatus } = useResearchStatus();

  const getStatusIcon = () => {
    switch (researchStatus.status) {
      case 'researching':
      case 'analyzing':
        return <Loader2 className="w-3 h-3 animate-spin text-blue-500" />;
      case 'complete':
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return <Activity className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (researchStatus.status) {
      case 'researching':
      case 'analyzing':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'complete':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const completedSteps = researchStatus.steps?.filter(s => s.status === 'success').length || 0;
  const totalSteps = researchStatus.steps?.length || 0;

  return (
    <>
      {/* Compact Status Indicator */}
      <Sheet open={isExpanded} onOpenChange={setIsExpanded}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 px-2 border rounded-md ${getStatusColor()} hover:opacity-80 transition-all`}
          >
            <div className="flex items-center gap-1.5">
              {getStatusIcon()}
              <span className="text-xs font-medium">
                {researchStatus.status === 'idle' ? 'Research' : researchStatus.department}
              </span>
              {researchStatus.status !== 'idle' && (
                <>
                  <span className="text-xs opacity-70">
                    {completedSteps}/{totalSteps}
                  </span>
                  {researchStatus.progress > 0 && (
                    <div className="w-12 h-1 bg-background/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-current transition-all"
                        style={{ width: `${researchStatus.progress}%` }}
                      />
                    </div>
                  )}
                </>
              )}
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </div>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-96 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Research & Testing Status
            </SheetTitle>
            <SheetDescription>Real-time progress for all departments</SheetDescription>
          </SheetHeader>
          <div className="h-full overflow-y-auto">
            <AgentTestingPanel autoStart={false} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/**
 * Department Status Badge
 * Shows status for a specific department
 */
export function DepartmentStatusBadge({
  department,
  status,
  progress,
  currentStep,
}: {
  department: string;
  status: ResearchStatus['status'];
  progress: number;
  currentStep?: string;
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'researching':
      case 'analyzing':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'complete':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 rounded-md border text-xs ${getStatusColor()}`}
    >
      {status === 'researching' || status === 'analyzing' ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : status === 'complete' ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <Activity className="w-3 h-3" />
      )}
      <span className="font-medium">{department}</span>
      {currentStep && <span className="opacity-70">• {currentStep}</span>}
      {progress > 0 && (
        <div className="w-16 h-1 bg-background/20 rounded-full overflow-hidden ml-auto">
          <div className="h-full bg-current transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
