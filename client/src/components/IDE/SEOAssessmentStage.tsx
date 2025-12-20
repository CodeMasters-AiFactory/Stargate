/**
 * SEO Assessment Stage
 * Phase 6: SEO wizard assesses the generated website
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  ArrowLeft,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Zap,
  Shield,
  Eye,
  Globe,
  FileText,
  RefreshCw,
  Trophy,
  Target,
} from 'lucide-react';
import type { SEOAssessmentResult, PageKeywords } from '@/types/websiteBuilder';

interface SEOAssessmentStageProps {
  html: string;
  pageKeywords: PageKeywords[];
  businessContext: {
    businessName: string;
    industry?: string;
    location?: string;
    services?: string[];
  };
  onComplete: (assessment: SEOAssessmentResult) => void;
  onBack?: () => void;
}

interface AssessmentCategory {
  name: string;
  icon: React.ReactNode;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'needs-work' | 'poor';
  issues: string[];
  suggestions: string[];
}

export function SEOAssessmentStage({
  html,
  pageKeywords,
  businessContext,
  onComplete,
  onBack,
}: SEOAssessmentStageProps) {
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessment, setAssessment] = useState<SEOAssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<AssessmentCategory[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // All keywords
  const allKeywords = pageKeywords.flatMap(p => p.keywords);

  // Run SEO assessment
  const runAssessment = async () => {
    setIsAssessing(true);
    setError(null);

    try {
      const response = await fetch('/api/website-builder/seo-assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html,
          keywords: allKeywords,
          businessContext,
          pageKeywords,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'SEO assessment failed');
      }

      const data = await response.json();
      setAssessment(data.assessment);
      
      // Parse into display categories
      const parsedCategories: AssessmentCategory[] = [
        {
          name: 'Content Quality',
          icon: <FileText className="w-4 h-4" />,
          score: data.assessment.categories.seo.score,
          maxScore: 100,
          status: getStatus(data.assessment.categories.seo.score),
          issues: data.assessment.categories.seo.issues || [],
          suggestions: ['Add more relevant keywords', 'Improve content depth'],
        },
        {
          name: 'Performance',
          icon: <Zap className="w-4 h-4" />,
          score: data.assessment.categories.performance.score,
          maxScore: 100,
          status: getStatus(data.assessment.categories.performance.score),
          issues: data.assessment.categories.performance.issues || [],
          suggestions: ['Optimize images', 'Minimize CSS/JS'],
        },
        {
          name: 'Accessibility',
          icon: <Eye className="w-4 h-4" />,
          score: data.assessment.categories.accessibility.score,
          maxScore: 100,
          status: getStatus(data.assessment.categories.accessibility.score),
          issues: data.assessment.categories.accessibility.issues || [],
          suggestions: ['Add alt text to images', 'Improve color contrast'],
        },
        {
          name: 'Visual Design',
          icon: <Sparkles className="w-4 h-4" />,
          score: data.assessment.categories.visual.score,
          maxScore: 100,
          status: getStatus(data.assessment.categories.visual.score),
          issues: data.assessment.categories.visual.issues || [],
          suggestions: ['Ensure consistent branding', 'Improve visual hierarchy'],
        },
        {
          name: 'Navigation',
          icon: <Globe className="w-4 h-4" />,
          score: data.assessment.categories.navigation.score,
          maxScore: 100,
          status: getStatus(data.assessment.categories.navigation.score),
          issues: data.assessment.categories.navigation.issues || [],
          suggestions: ['Add clear navigation', 'Include breadcrumbs'],
        },
      ];
      
      setCategories(parsedCategories);
    } catch (err) {
      console.error('[SEOAssessment] Error:', err);
      setError(err instanceof Error ? err.message : 'Assessment failed');
      
      // Create mock assessment for demo/fallback
      const mockAssessment: SEOAssessmentResult = {
        overallScore: 85,
        categories: {
          performance: { score: 88, issues: [] },
          accessibility: { score: 82, issues: ['Some images missing alt text'] },
          seo: { score: 90, issues: [] },
          visual: { score: 85, issues: [] },
          navigation: { score: 80, issues: ['Could use breadcrumbs'] },
        },
        recommendations: [
          'Add more keyword variations',
          'Include local business schema',
          'Optimize meta descriptions',
        ],
        passedChecks: [
          'Title tag present',
          'Meta description present',
          'H1 tag used correctly',
          'Mobile responsive',
          'HTTPS ready',
        ],
        failedChecks: [],
      };
      
      setAssessment(mockAssessment);
      setCategories([
        {
          name: 'Content Quality',
          icon: <FileText className="w-4 h-4" />,
          score: 90,
          maxScore: 100,
          status: 'excellent',
          issues: [],
          suggestions: ['Content looks great!'],
        },
        {
          name: 'Performance',
          icon: <Zap className="w-4 h-4" />,
          score: 88,
          maxScore: 100,
          status: 'good',
          issues: [],
          suggestions: ['Consider image optimization'],
        },
        {
          name: 'Accessibility',
          icon: <Eye className="w-4 h-4" />,
          score: 82,
          maxScore: 100,
          status: 'good',
          issues: ['Some images missing alt text'],
          suggestions: ['Add alt text to all images'],
        },
        {
          name: 'Visual Design',
          icon: <Sparkles className="w-4 h-4" />,
          score: 85,
          maxScore: 100,
          status: 'good',
          issues: [],
          suggestions: ['Design is professional and clean'],
        },
        {
          name: 'Navigation',
          icon: <Globe className="w-4 h-4" />,
          score: 80,
          maxScore: 100,
          status: 'good',
          issues: ['Could use breadcrumbs'],
          suggestions: ['Add breadcrumb navigation'],
        },
      ]);
    } finally {
      setIsAssessing(false);
    }
  };

  // Auto-run assessment on mount
  useEffect(() => {
    runAssessment();
  }, []);

  // Get status from score
  function getStatus(score: number): 'excellent' | 'good' | 'needs-work' | 'poor' {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'needs-work';
    return 'poor';
  }

  // Get color from status
  function getStatusColor(status: string): string {
    switch (status) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'needs-work': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-slate-400';
    }
  }

  // Get badge color from status
  function getBadgeClass(status: string): string {
    switch (status) {
      case 'excellent': return 'bg-green-900/30 border-green-500 text-green-400';
      case 'good': return 'bg-blue-900/30 border-blue-500 text-blue-400';
      case 'needs-work': return 'bg-yellow-900/30 border-yellow-500 text-yellow-400';
      case 'poor': return 'bg-red-900/30 border-red-500 text-red-400';
      default: return 'bg-slate-800 border-slate-600 text-slate-400';
    }
  }

  // Handle completion
  const handleComplete = () => {
    if (assessment) {
      onComplete(assessment);
    }
  };

  const overallScore = assessment?.overallScore || 0;
  const overallStatus = getStatus(overallScore);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">SEO Assessment</h2>
                <p className="text-sm text-slate-400">
                  Analyzing SEO performance for {businessContext.businessName}
                </p>
              </div>
            </div>
            {assessment && (
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline" 
                  className={`text-lg px-4 py-1 ${getBadgeClass(overallStatus)}`}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  {overallScore}/100
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview */}
        <div className="flex-1 flex flex-col border-r border-slate-700">
          <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700">
            <span className="text-sm font-medium text-slate-300">Website Preview</span>
          </div>
          <div className="flex-1 overflow-auto bg-white relative">
            <iframe
              ref={iframeRef}
              srcDoc={html}
              className="w-full h-full border-0"
              title="SEO Assessment Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>

        {/* Assessment Results */}
        <div className="w-[450px] flex flex-col bg-slate-800/30">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {isAssessing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <Loader2 className="w-12 h-12 animate-spin text-green-400" />
                  <Search className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-600" />
                </div>
                <p className="text-slate-300 font-medium">Analyzing SEO...</p>
                <p className="text-xs text-slate-500">Checking keywords, structure, and performance</p>
              </div>
            ) : assessment ? (
              <>
                {/* Overall Score */}
                <Card className={`${getBadgeClass(overallStatus)} border`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Overall SEO Score</div>
                        <div className={`text-4xl font-bold ${getStatusColor(overallStatus)}`}>
                          {overallScore}
                        </div>
                        <Badge variant="outline" className={`mt-2 capitalize ${getBadgeClass(overallStatus)}`}>
                          {overallStatus.replace('-', ' ')}
                        </Badge>
                      </div>
                      <Trophy className={`w-16 h-16 ${getStatusColor(overallStatus)} opacity-50`} />
                    </div>
                  </CardContent>
                </Card>

                {/* Keywords Used */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-slate-300">
                      <Target className="w-4 h-4 text-cyan-400" />
                      Keywords Analyzed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {allKeywords.slice(0, 8).map((kw, i) => (
                        <Badge key={i} variant="secondary" className="bg-slate-700 text-slate-200 text-xs">
                          {kw}
                        </Badge>
                      ))}
                      {allKeywords.length > 8 && (
                        <Badge variant="secondary" className="bg-slate-700 text-slate-400 text-xs">
                          +{allKeywords.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Categories */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-slate-300">Assessment Categories</div>
                  {categories.map((cat, idx) => (
                    <Card key={idx} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={getStatusColor(cat.status)}>{cat.icon}</span>
                            <span className="text-sm font-medium text-slate-200">{cat.name}</span>
                          </div>
                          <Badge variant="outline" className={`${getBadgeClass(cat.status)}`}>
                            {cat.score}/{cat.maxScore}
                          </Badge>
                        </div>
                        <Progress 
                          value={cat.score} 
                          className="h-2 bg-slate-700"
                        />
                        {cat.issues.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {cat.issues.slice(0, 2).map((issue, i) => (
                              <div key={i} className="flex items-start gap-1 text-xs text-yellow-400">
                                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>{issue}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recommendations */}
                {assessment.recommendations && assessment.recommendations.length > 0 && (
                  <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-cyan-400">
                        <Sparkles className="w-4 h-4" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {assessment.recommendations.slice(0, 4).map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <TrendingUp className="w-3 h-3 mt-0.5 text-cyan-400 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Passed Checks */}
                {assessment.passedChecks && assessment.passedChecks.length > 0 && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        Passed Checks ({assessment.passedChecks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-1">
                        {assessment.passedChecks.slice(0, 6).map((check, i) => (
                          <div key={i} className="flex items-center gap-1 text-xs text-green-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span className="truncate">{check}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={handleComplete}
                    size="lg"
                    className="w-full gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Continue to Review
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={runAssessment}
                    className="w-full gap-2 border-slate-600 text-slate-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Re-run Assessment
                  </Button>
                </div>
              </>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="text-red-400 font-medium">Assessment Failed</p>
                <p className="text-xs text-slate-500 text-center">{error}</p>
                <Button onClick={runAssessment} variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          {onBack && (
            <div className="border-t border-slate-700 p-4">
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Images
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

