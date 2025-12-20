/**
 * Template Verification Badge Component
 * Shows verification status with visual indicator
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  FileCode,
  Image,
  Code,
  Type,
  Link2,
  Smartphone,
  Zap,
  RefreshCw,
} from 'lucide-react';

export interface VerificationStatus {
  verified: boolean;
  score: number;
  verifiedAt?: string;
  checks?: {
    htmlStructure: { passed: boolean; score: number; details: string };
    cssFiles: { passed: boolean; score: number; details: string };
    jsFiles: { passed: boolean; score: number; details: string };
    images: { passed: boolean; score: number; details: string };
    fonts: { passed: boolean; score: number; details: string };
    links: { passed: boolean; score: number; details: string };
    responsive: { passed: boolean; score: number; details: string };
    performance: { passed: boolean; score: number; details: string };
  };
  issues?: Array<{
    severity: 'critical' | 'warning' | 'info';
    category: string;
    message: string;
  }>;
}

interface VerificationBadgeProps {
  templateId: string;
  status?: VerificationStatus | null;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onVerify?: () => Promise<void>;
  className?: string;
}

const checkIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  htmlStructure: FileCode,
  cssFiles: Code,
  jsFiles: Code,
  images: Image,
  fonts: Type,
  links: Link2,
  responsive: Smartphone,
  performance: Zap,
};

const checkLabels: Record<string, string> = {
  htmlStructure: 'HTML Structure',
  cssFiles: 'CSS Files',
  jsFiles: 'JavaScript',
  images: 'Images',
  fonts: 'Fonts',
  links: 'Links',
  responsive: 'Responsive',
  performance: 'Performance',
};

export function VerificationBadge({
  templateId,
  status,
  size = 'md',
  showDetails = true,
  onVerify,
  className = '',
}: VerificationBadgeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleVerify = async () => {
    if (onVerify) {
      setIsLoading(true);
      try {
        await onVerify();
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      badge: 'text-xs px-1.5 py-0.5',
      icon: 'w-3 h-3',
      text: 'text-xs',
    },
    md: {
      badge: 'text-sm px-2 py-1',
      icon: 'w-4 h-4',
      text: 'text-sm',
    },
    lg: {
      badge: 'text-base px-3 py-1.5',
      icon: 'w-5 h-5',
      text: 'text-base',
    },
  };

  const config = sizeConfig[size];

  // Render loading state
  if (isLoading) {
    return (
      <Badge variant="outline" className={`${config.badge} ${className}`}>
        <Loader2 className={`${config.icon} mr-1 animate-spin`} />
        Verifying...
      </Badge>
    );
  }

  // Render unverified state
  if (!status) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`${config.badge} cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${className}`}
              onClick={handleVerify}
            >
              <ShieldQuestion className={`${config.icon} mr-1 text-slate-400`} />
              <span className={config.text}>Not Verified</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to verify this template</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Determine badge color based on score
  const getBadgeStyle = () => {
    if (status.verified && status.score >= 90) {
      return {
        variant: 'default' as const,
        className: 'bg-green-500 hover:bg-green-600 text-white border-green-600',
        icon: ShieldCheck,
        iconColor: 'text-white',
        label: 'Verified',
      };
    }
    if (status.verified && status.score >= 70) {
      return {
        variant: 'default' as const,
        className: 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600',
        icon: CheckCircle2,
        iconColor: 'text-white',
        label: 'Verified',
      };
    }
    if (status.score >= 50) {
      return {
        variant: 'outline' as const,
        className: 'border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950',
        icon: AlertTriangle,
        iconColor: 'text-yellow-500',
        label: 'Partial',
      };
    }
    return {
      variant: 'outline' as const,
      className: 'border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950',
      icon: ShieldAlert,
      iconColor: 'text-red-500',
      label: 'Issues Found',
    };
  };

  const badgeStyle = getBadgeStyle();
  const BadgeIcon = badgeStyle.icon;

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={badgeStyle.variant}
              className={`${config.badge} cursor-pointer ${badgeStyle.className} ${className}`}
              onClick={() => showDetails && setShowDialog(true)}
            >
              <BadgeIcon className={`${config.icon} mr-1 ${badgeStyle.iconColor}`} />
              <span className={config.text}>{badgeStyle.label}</span>
              {size !== 'sm' && (
                <span className="ml-1 opacity-80">{status.score}%</span>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Score: {status.score}% - Click for details</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Detailed Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Template Verification
            </DialogTitle>
            <DialogDescription>
              Detailed verification results for this template
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Overall Score */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Overall Score</span>
                <span className={`text-lg font-bold ${
                  status.score >= 70 ? 'text-green-600' :
                  status.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {status.score}%
                </span>
              </div>
              <Progress value={status.score} className="h-2" />
              {status.verifiedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Verified: {new Date(status.verifiedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Individual Checks */}
            {status.checks && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Verification Checks</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(status.checks).map(([key, check]) => {
                    const Icon = checkIcons[key] || Shield;
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                          check.passed
                            ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
                            : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {check.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <Icon className="w-4 h-4 opacity-60" />
                        <span className="flex-1 truncate">{checkLabels[key]}</span>
                        <span className="text-xs opacity-70">{check.score}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Issues */}
            {status.issues && status.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Issues Found</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {status.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 p-2 rounded-md text-sm ${
                        issue.severity === 'critical'
                          ? 'bg-red-50 dark:bg-red-950'
                          : issue.severity === 'warning'
                          ? 'bg-yellow-50 dark:bg-yellow-950'
                          : 'bg-blue-50 dark:bg-blue-950'
                      }`}
                    >
                      {issue.severity === 'critical' ? (
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      ) : issue.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                      ) : (
                        <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
                      )}
                      <div>
                        <span className="font-medium">{issue.category}:</span>{' '}
                        {issue.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Re-verify Button */}
            {onVerify && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleVerify}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Re-verify Template
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Simple verified checkmark for corner of template cards
 */
export function VerifiedCheckmark({
  verified,
  score,
  size = 'md',
  className = '',
}: {
  verified: boolean;
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  if (!verified) return null;

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`absolute top-2 right-2 rounded-full p-1 ${
              score >= 90
                ? 'bg-green-500'
                : score >= 70
                ? 'bg-emerald-500'
                : 'bg-yellow-500'
            } ${className}`}
          >
            <CheckCircle2 className={`${sizeClasses[size]} text-white`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified Template - {score}% Score</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
