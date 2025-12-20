/**
 * Design Insights Panel
 * Shows learned design preferences and auto-applies styles
 * Neural design learning - Phase 1A Week 2
 */

import { useState, useEffect, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Lightbulb,
  Zap,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface DesignPreferenceProfile {
  userId: string;
  projectId: string;
  lastUpdated: Date;
  confidence: number;
  preferences: {
    colors: {
      primaryColors: string[];
      accentColors: string[];
      preferredPalette?: string;
    };
    typography: {
      headingFonts: string[];
      preferredStyle?: string;
    };
    spacing: {
      preferredDensity?: string;
    };
    layout: {
      preferredStyle?: string;
    };
    components: {
      mostUsed: string[];
    };
  };
  insights: {
    designPhilosophy: string;
    expertiseLevel: string;
    consistencyScore: number;
    explorationScore: number;
  };
}

interface LearningRecommendation {
  id: string;
  type: 'color' | 'typography' | 'spacing' | 'layout' | 'component';
  confidence: number;
  suggestion: string;
  reasoning: string;
  autoApply: boolean;
}

interface DesignInsightsPanelProps {
  userId: string;
  projectId: string;
  onApplyRecommendation?: (recommendation: LearningRecommendation) => void;
}

export function DesignInsightsPanel({
  userId,
  projectId,
  onApplyRecommendation,
}: DesignInsightsPanelProps) {
  const [profile, setProfile] = useState<DesignPreferenceProfile | null>(null);
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch preference profile and recommendations
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch preference profile
      const profileResponse = await fetch(`/api/visual-editor/preferences/${userId}/${projectId}`);
      const profileData = await profileResponse.json();

      if (profileData.success && profileData.profile) {
        setProfile(profileData.profile);
      }

      // Fetch learned recommendations
      const recsResponse = await fetch('/api/visual-editor/learned-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, projectId, context: {} }),
      });
      const recsData = await recsResponse.json();

      if (recsData.success) {
        setRecommendations(recsData.recommendations || []);
      }

      // Fetch design insights
      const insightsResponse = await fetch(`/api/visual-editor/insights/${userId}/${projectId}`);
      const insightsData = await insightsResponse.json();

      if (insightsData.success) {
        setInsights(insightsData.insights || []);
      }
    } catch (err) {
      console.error('Failed to fetch design insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load design insights');
    } finally {
      setIsLoading(false);
    }
  }, [userId, projectId]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-500';
    if (confidence > 0.5) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence > 0.8) return 'High Confidence';
    if (confidence > 0.5) return 'Medium Confidence';
    return 'Learning...';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'color':
        return <span className="text-xl">🎨</span>;
      case 'typography':
        return <span className="text-xl">✍️</span>;
      case 'spacing':
        return <span className="text-xl">📐</span>;
      case 'layout':
        return <span className="text-xl">📱</span>;
      case 'component':
        return <span className="text-xl">🧩</span>;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-l">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold">Design Learning</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            title="Refresh insights"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          AI learns your design preferences and suggests improvements
        </p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {error && (
            <Card className="p-4 border-destructive bg-destructive/10">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="text-xs text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing your design style...</p>
            </div>
          ) : !profile || profile.confidence < 0.3 ? (
            <Card className="p-6 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">Start Designing!</p>
              <p className="text-xs text-muted-foreground">
                Make a few design decisions and I'll learn your style. The more you design, the
                smarter my suggestions become.
              </p>
              <Progress value={profile ? (profile.confidence * 100) : 0} className="mt-4 h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {profile ? Math.round(profile.confidence * 100) : 0}% learned
              </p>
            </Card>
          ) : (
            <>
              {/* Confidence Score */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">AI Confidence</span>
                  <Badge variant="outline" className={getConfidenceColor(profile.confidence)}>
                    {getConfidenceLabel(profile.confidence)}
                  </Badge>
                </div>
                <Progress value={profile.confidence * 100} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {Math.round(profile.confidence * 100)}% confident in your design preferences
                </p>
              </Card>

              {/* Design Philosophy */}
              {profile.insights.designPhilosophy && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">Your Design Philosophy</p>
                      <p className="text-xs text-muted-foreground">
                        {profile.insights.designPhilosophy}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Insights */}
              {insights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                    Insights
                  </h4>
                  {insights.map((insight, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-xs">{insight}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <Separator />

              {/* Learned Recommendations */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                    Smart Suggestions
                  </h4>
                  {recommendations.filter(r => r.autoApply).length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Auto-applied
                    </Badge>
                  )}
                </div>

                {recommendations.length === 0 ? (
                  <Card className="p-4 text-center">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-xs text-muted-foreground">
                      No suggestions right now. Keep designing and I'll learn more!
                    </p>
                  </Card>
                ) : (
                  recommendations.map((rec) => (
                    <Card
                      key={rec.id}
                      className={`p-3 ${
                        rec.autoApply ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className="flex-shrink-0 mt-0.5">{getTypeIcon(rec.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-medium">{rec.suggestion}</p>
                            {rec.autoApply && (
                              <Badge variant="secondary" className="text-xs">
                                <Zap className="w-3 h-3" />
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{rec.reasoning}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {Math.round(rec.confidence * 100)}% confidence
                            </span>
                            {!rec.autoApply && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onApplyRecommendation?.(rec)}
                                className="h-7 text-xs"
                              >
                                Apply
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Preference Summary */}
              {profile.preferences && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                      Learned Preferences
                    </h4>

                    {profile.preferences.colors.primaryColors.length > 0 && (
                      <Card className="p-3">
                        <p className="text-xs font-medium mb-2">Favorite Colors</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.preferences.colors.primaryColors.slice(0, 5).map((color, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-md border shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </Card>
                    )}

                    {profile.preferences.typography.headingFonts.length > 0 && (
                      <Card className="p-3">
                        <p className="text-xs font-medium mb-1">Typography</p>
                        <p className="text-xs text-muted-foreground">
                          {profile.preferences.typography.preferredStyle || 'Modern'} style •{' '}
                          {profile.preferences.typography.headingFonts[0]}
                        </p>
                      </Card>
                    )}

                    {profile.preferences.components.mostUsed.length > 0 && (
                      <Card className="p-3">
                        <p className="text-xs font-medium mb-2">Most Used Components</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.preferences.components.mostUsed.slice(0, 5).map((comp, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {comp}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {profile && profile.confidence > 0.3 && (
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Neural Learning Active</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Learning</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
