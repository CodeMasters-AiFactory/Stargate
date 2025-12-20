/**
 * AI Assistant Panel
 * Multi-model AI voting system for design recommendations
 * Provides real-time AI critique and suggestions
 */

import { useState, useEffect, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles,
  Brain,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';
import type { GeneratedWebsitePackage } from '@/types/websiteBuilder';

interface SelectedElement {
  id: string;
  type: 'component' | 'section' | 'element';
  path: string[];
}

interface AIModel {
  id: string;
  name: string;
  vote: 'approve' | 'reject' | 'neutral';
  confidence: number;
  reasoning: string;
}

interface AIRecommendation {
  id: string;
  type: 'color' | 'layout' | 'typography' | 'spacing' | 'content' | 'accessibility';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  models: AIModel[];
  consensusVote: 'approve' | 'reject' | 'neutral';
  consensusPercentage: number;
  suggestedFix?: {
    html?: string;
    css?: string;
    js?: string;
  };
}

interface AIAssistantPanelProps {
  website: GeneratedWebsitePackage;
  selectedElement: SelectedElement | null;
  onApplyRecommendation?: (recommendation: AIRecommendation) => void;
}

export function AIAssistantPanel({
  website,
  selectedElement,
  onApplyRecommendation,
}: AIAssistantPanelProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  // Fetch AI recommendations when website or selection changes
  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/visual-editor/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          selectedElement,
          context: {
            activePageId: website.activePageId || 'home',
            manifest: website.manifest,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('AI recommendations error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load AI recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [website, selectedElement]);

  // Auto-refresh recommendations when selection changes
  useEffect(() => {
    fetchRecommendations();
  }, [selectedElement]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <Info className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getConsensusIcon = (vote: string, percentage: number) => {
    if (percentage >= 75) {
      return vote === 'approve' ? (
        <ThumbsUp className="w-4 h-4 text-green-500" />
      ) : (
        <ThumbsDown className="w-4 h-4 text-red-500" />
      );
    }
    return <Info className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <div className="flex flex-col h-full bg-background border-l">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold">AI Design Assistant</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRecommendations}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {selectedElement
            ? `Analyzing ${selectedElement.type} element`
            : 'Select an element for AI-powered suggestions'}
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
              <p className="text-sm text-muted-foreground">
                Consulting AI models...
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  GPT-4o
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Claude 3.5
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Gemini 2.0
                </Badge>
              </div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
              <p className="text-sm font-medium">No issues found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your design looks great! AI models found no major issues.
              </p>
            </div>
          ) : (
            recommendations.map((recommendation) => (
              <Card
                key={recommendation.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedRecommendation === recommendation.id
                    ? 'ring-2 ring-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() =>
                  setSelectedRecommendation(
                    selectedRecommendation === recommendation.id
                      ? null
                      : recommendation.id
                  )
                }
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(recommendation.priority)}
                    <h4 className="text-sm font-medium">
                      {recommendation.title}
                    </h4>
                  </div>
                  <Badge variant={getPriorityColor(recommendation.priority)}>
                    {recommendation.priority}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground mb-3">
                  {recommendation.description}
                </p>

                {/* AI Consensus */}
                <div className="flex items-center gap-2 mb-3">
                  {getConsensusIcon(
                    recommendation.consensusVote,
                    recommendation.consensusPercentage
                  )}
                  <span className="text-xs font-medium">
                    {recommendation.consensusPercentage}% AI consensus
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {recommendation.models.length} models
                  </Badge>
                </div>

                {/* Expanded view */}
                {selectedRecommendation === recommendation.id && (
                  <>
                    <Separator className="my-3" />

                    {/* Model votes */}
                    <div className="space-y-2 mb-3">
                      <p className="text-xs font-medium mb-2">AI Model Votes:</p>
                      {recommendation.models.map((model) => (
                        <div
                          key={model.id}
                          className="flex items-start gap-2 text-xs"
                        >
                          <div className="flex items-center gap-1 min-w-[120px]">
                            {model.vote === 'approve' ? (
                              <ThumbsUp className="w-3 h-3 text-green-500" />
                            ) : model.vote === 'reject' ? (
                              <ThumbsDown className="w-3 h-3 text-red-500" />
                            ) : (
                              <Info className="w-3 h-3 text-yellow-500" />
                            )}
                            <span className="font-medium">{model.name}</span>
                            <span className="text-muted-foreground">
                              ({Math.round(model.confidence * 100)}%)
                            </span>
                          </div>
                          <span className="text-muted-foreground flex-1">
                            {model.reasoning}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Apply button */}
                    {recommendation.suggestedFix && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onApplyRecommendation?.(recommendation);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Apply AI Fix
                      </Button>
                    )}
                  </>
                )}
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Multi-Model AI</span>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-xs">
              GPT-4o
            </Badge>
            <Badge variant="outline" className="text-xs">
              Claude
            </Badge>
            <Badge variant="outline" className="text-xs">
              Gemini
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
