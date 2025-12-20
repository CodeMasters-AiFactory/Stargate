/**
 * Accessibility Panel - 120% Feature
 * WCAG 2.1 AA compliance UI
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Accessibility, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  CheckCircle,
  Wand2,
  Eye,
  FileText,
  RefreshCw
} from 'lucide-react';

interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  wcagLevel: 'A' | 'AA' | 'AAA';
  wcagCriteria: string;
  element: string;
  message: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  fix?: {
    description: string;
    autoFixable: boolean;
  };
}

interface AccessibilityReport {
  score: number;
  level: 'A' | 'AA' | 'AAA' | 'Non-compliant';
  totalIssues: number;
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  issues: AccessibilityIssue[];
  passedChecks: string[];
}

interface AccessibilityPanelProps {
  html: string;
  css: string;
  colorPairs?: Array<{ foreground: string; background: string; isLargeText?: boolean }>;
  onAutoFix?: (fixedHtml: string, fixedCss: string) => void;
}

export function AccessibilityPanel({ 
  html, 
  css, 
  colorPairs = [],
  onAutoFix 
}: AccessibilityPanelProps) {
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  useEffect(() => {
    if (html) {
      runAccessibilityCheck();
    }
  }, [html, css, colorPairs]);

  async function runAccessibilityCheck() {
    try {
      setLoading(true);
      const response = await fetch('/api/design-assistant/accessibility/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, css, colorPairs }),
      });
      const data = await response.json();
      if (data.success) {
        setReport(data.report);
      }
    } catch (error) {
      console.error('Accessibility check failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAutoFix() {
    try {
      setFixing(true);
      const response = await fetch('/api/design-assistant/accessibility/autofix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, css }),
      });
      const data = await response.json();
      if (data.success) {
        onAutoFix?.(data.html, data.css);
        // Re-run check after fix
        setTimeout(runAccessibilityCheck, 500);
      }
    } catch (error) {
      console.error('Auto-fix failed:', error);
    } finally {
      setFixing(false);
    }
  }

  function getImpactColor(impact: string): string {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'serious': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'moderate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'minor': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  }

  function getLevelColor(level: string): string {
    switch (level) {
      case 'AAA': return 'bg-green-500';
      case 'AA': return 'bg-blue-500';
      case 'A': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  }

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Accessibility className="h-5 w-5" />
            Accessibility
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runAccessibilityCheck}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Recheck
            </Button>
            {report && report.totalIssues > 0 && (
              <Button
                size="sm"
                onClick={handleAutoFix}
                disabled={fixing}
              >
                <Wand2 className="h-4 w-4 mr-1" />
                {fixing ? 'Fixing...' : 'Auto-Fix'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {report && (
          <>
            {/* Score Overview */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Accessibility Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{report.score}</span>
                  <Badge className={getLevelColor(report.level)}>
                    {report.level}
                  </Badge>
                </div>
              </div>
              <Progress value={report.score} className="h-2" />
            </div>

            {/* Issue Summary */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center p-2 rounded-lg bg-red-500/10">
                <div className="text-lg font-bold text-red-600">{report.criticalIssues}</div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-orange-500/10">
                <div className="text-lg font-bold text-orange-600">{report.seriousIssues}</div>
                <div className="text-xs text-muted-foreground">Serious</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-yellow-500/10">
                <div className="text-lg font-bold text-yellow-600">{report.moderateIssues}</div>
                <div className="text-xs text-muted-foreground">Moderate</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-blue-500/10">
                <div className="text-lg font-bold text-blue-600">{report.minorIssues}</div>
                <div className="text-xs text-muted-foreground">Minor</div>
              </div>
            </div>

            {/* Passed Checks */}
            {report.passedChecks.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-400">
                    {report.passedChecks.length} Passed Checks
                  </span>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                  {report.passedChecks.slice(0, 3).map((check, i) => (
                    <div key={i}>{check}</div>
                  ))}
                  {report.passedChecks.length > 3 && (
                    <div>+{report.passedChecks.length - 3} more</div>
                  )}
                </div>
              </div>
            )}

            {/* Issues List */}
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {report.issues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p className="font-medium text-green-600">No Issues Found!</p>
                    <p className="text-sm text-muted-foreground">
                      Your website meets WCAG {report.level} standards
                    </p>
                  </div>
                ) : (
                  report.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-colors
                        ${expandedIssue === issue.id ? 'border-primary' : 'border-border hover:border-primary/50'}
                      `}
                      onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                    >
                      <div className="flex items-start gap-2">
                        {getTypeIcon(issue.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{issue.wcagCriteria}</span>
                            <Badge variant="outline" className="text-xs">
                              {issue.wcagLevel}
                            </Badge>
                            <Badge className={`text-xs ${getImpactColor(issue.impact)}`}>
                              {issue.impact}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {issue.message}
                          </p>
                          
                          {expandedIssue === issue.id && issue.fix && (
                            <div className="mt-3 p-2 rounded bg-muted">
                              <div className="flex items-center gap-2 mb-1">
                                <Wand2 className="h-3 w-3" />
                                <span className="text-xs font-medium">How to fix:</span>
                                {issue.fix.autoFixable && (
                                  <Badge variant="secondary" className="text-xs">
                                    Auto-fixable
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {issue.fix.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default AccessibilityPanel;

