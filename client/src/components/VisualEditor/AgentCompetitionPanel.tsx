/**
 * Agent Competition Panel
 * Shows 3 AI agents competing with different design philosophies
 * User picks the winner, system learns preferences
 * Phase 1A Week 4: Agent Competition Mode
 */

import { useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap,
  Loader2,
  Trophy,
  CheckCircle,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Info,
} from 'lucide-react';

interface AgentProfile {
  id: string;
  name: string;
  philosophy: 'minimalist' | 'bold' | 'elegant';
  description: string;
  personality: string;
  strengths: string[];
  designPrinciples: string[];
  exampleWebsites: string[];
}

interface AgentDesign {
  agentId: string;
  agentName: string;
  philosophy: 'minimalist' | 'bold' | 'elegant';
  html: string;
  css: string;
  reasoning: string;
  designChoices: {
    colors: string[];
    typography: string[];
    spacing: string;
    layout: string;
    visualStyle: string;
  };
  confidence: number;
  generationTime: number;
}

interface CompetitionResult {
  competitionId: string;
  designs: AgentDesign[];
  status: 'generating' | 'completed' | 'error';
  winner?: string;
}

interface AgentCompetitionPanelProps {
  userId: string;
  projectId: string;
  onSelectWinner?: (design: AgentDesign, competitionId: string) => void;
}

const PHILOSOPHY_COLORS = {
  minimalist: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600',
  bold: 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-600',
  elegant: 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-600',
};

const PHILOSOPHY_ICONS = {
  minimalist: '🎯',
  bold: '⚡',
  elegant: '✨',
};

export function AgentCompetitionPanel({ userId, projectId, onSelectWinner }: AgentCompetitionPanelProps) {
  const [agentProfiles, setAgentProfiles] = useState<AgentProfile[]>([]);
  const [competition, setCompetition] = useState<CompetitionResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [componentType, setComponentType] = useState('hero section');
  const [context, setContext] = useState({
    pageType: 'landing page',
    industry: '',
    targetAudience: '',
  });
  const [stats, setStats] = useState<{
    totalCompetitions: number;
    winsByPhilosophy: Record<string, number>;
    preferredPhilosophy: string | null;
  } | null>(null);

  // Fetch agent profiles
  const fetchAgentProfiles = useCallback(async () => {
    try {
      const response = await fetch('/api/visual-editor/agent-competition/profiles');
      const data = await response.json();
      if (data.success) {
        setAgentProfiles(data.profiles);
      }
    } catch (err) {
      console.error('Failed to fetch agent profiles:', err);
    }
  }, []);

  // Fetch competition stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/visual-editor/agent-competition/stats/${userId}/${projectId}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [userId, projectId]);

  // Start competition
  const startCompetition = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setSelectedDesign(null);

    try {
      const response = await fetch('/api/visual-editor/agent-competition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentType,
          context: {
            pageType: context.pageType,
            industry: context.industry || undefined,
            targetAudience: context.targetAudience || undefined,
          },
          userId,
          projectId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Competition failed');
      }

      setCompetition(data.competition);
      console.log('✅ Competition completed:', data.competition);
    } catch (err) {
      console.error('Competition error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start competition');
    } finally {
      setIsGenerating(false);
    }
  }, [componentType, context, userId, projectId]);

  // Select winner
  const handleSelectWinner = useCallback(
    async (design: AgentDesign) => {
      if (!competition) return;

      try {
        const response = await fetch('/api/visual-editor/agent-competition/select-winner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            competitionId: competition.competitionId,
            winnerAgentId: design.agentId,
            userId,
            projectId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setSelectedDesign(design.agentId);
          onSelectWinner?.(design, competition.competitionId);
          await fetchStats(); // Refresh stats
          console.log(`✅ Winner selected: ${design.agentName}`);
        }
      } catch (err) {
        console.error('Failed to select winner:', err);
      }
    },
    [competition, userId, projectId, onSelectWinner, fetchStats]
  );

  // Initial load
  useState(() => {
    fetchAgentProfiles();
    fetchStats();
  });

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold">Agent Competition</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { fetchAgentProfiles(); fetchStats(); }}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          3 AI designers with different philosophies compete. Pick the winner!
        </p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Competition Stats */}
          {stats && stats.totalCompetitions > 0 && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Your Design Preference</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Based on {stats.totalCompetitions} competitions
                </p>
                {stats.preferredPhilosophy && (
                  <Badge variant="secondary" className="text-xs">
                    {PHILOSOPHY_ICONS[stats.preferredPhilosophy as keyof typeof PHILOSOPHY_ICONS]}{' '}
                    You prefer <strong>{stats.preferredPhilosophy}</strong> designs
                  </Badge>
                )}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {Object.entries(stats.winsByPhilosophy).map(([philosophy, wins]) => (
                    <div key={philosophy} className="text-center">
                      <div className="text-lg font-bold">{wins}</div>
                      <div className="text-xs text-muted-foreground capitalize">{philosophy}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Competition Setup */}
          <Card className="p-4">
            <h4 className="text-sm font-semibold mb-3">Competition Setup</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Component Type</label>
                <input
                  type="text"
                  value={componentType}
                  onChange={(e) => setComponentType(e.target.value)}
                  placeholder="e.g., hero section, pricing table, testimonial"
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Page Type</label>
                <input
                  type="text"
                  value={context.pageType}
                  onChange={(e) => setContext({ ...context, pageType: e.target.value })}
                  placeholder="e.g., landing page, about page"
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Industry (optional)</label>
                <input
                  type="text"
                  value={context.industry}
                  onChange={(e) => setContext({ ...context, industry: e.target.value })}
                  placeholder="e.g., SaaS, E-commerce, Finance"
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Target Audience (optional)</label>
                <input
                  type="text"
                  value={context.targetAudience}
                  onChange={(e) => setContext({ ...context, targetAudience: e.target.value })}
                  placeholder="e.g., Developers, Designers, Entrepreneurs"
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
            </div>
            <Button
              onClick={startCompetition}
              disabled={isGenerating || !componentType}
              className="w-full mt-4"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Agents Competing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Start Competition
                </>
              )}
            </Button>
          </Card>

          {/* Error */}
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

          {/* Generating Progress */}
          {isGenerating && (
            <Card className="p-6 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-sm font-medium mb-2">3 AI Agents Competing</p>
              <p className="text-xs text-muted-foreground mb-4">
                Minimalist Maven, Bold Innovator, and Elegant Craftsperson are designing...
              </p>
              <Progress value={66} className="h-2" />
            </Card>
          )}

          {/* Agent Designs (Side-by-Side) */}
          {competition && competition.status === 'completed' && competition.designs.length > 0 && (
            <>
              <Separator />
              <h4 className="text-sm font-semibold">Design Submissions</h4>

              <Tabs defaultValue="side-by-side" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="side-by-side">Side-by-Side</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="side-by-side" className="space-y-3">
                  {competition.designs.map((design) => (
                    <Card
                      key={design.agentId}
                      className={`p-4 transition-all ${
                        selectedDesign === design.agentId
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                          : PHILOSOPHY_COLORS[design.philosophy]
                      }`}
                    >
                      {/* Agent Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{PHILOSOPHY_ICONS[design.philosophy]}</span>
                          <div>
                            <p className="text-sm font-semibold">{design.agentName}</p>
                            <p className="text-xs text-muted-foreground capitalize">{design.philosophy}</p>
                          </div>
                        </div>
                        {selectedDesign === design.agentId && (
                          <Badge variant="default" className="bg-green-500">
                            <Trophy className="w-3 h-3 mr-1" />
                            Winner
                          </Badge>
                        )}
                      </div>

                      {/* Preview */}
                      <div
                        className="border rounded-md p-4 bg-white dark:bg-slate-950 mb-3 min-h-[200px]"
                        dangerouslySetInnerHTML={{ __html: design.html }}
                      />

                      {/* Reasoning */}
                      <p className="text-xs text-muted-foreground mb-3">{design.reasoning}</p>

                      {/* Design Choices */}
                      <div className="space-y-2 mb-3">
                        {design.designChoices.colors.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">Colors:</span>
                            <div className="flex gap-1">
                              {design.designChoices.colors.map((color, i) => (
                                <div
                                  key={i}
                                  className="w-5 h-5 rounded border"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs">
                          <span className="font-medium">Confidence:</span> {Math.round(design.confidence * 100)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Generated in {design.generationTime}ms
                        </p>
                      </div>

                      {/* Select Button */}
                      {!selectedDesign && (
                        <Button
                          onClick={() => handleSelectWinner(design)}
                          variant="default"
                          size="sm"
                          className="w-full"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Select This Design
                        </Button>
                      )}
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="details" className="space-y-3">
                  {competition.designs.map((design) => (
                    <Card key={design.agentId} className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{PHILOSOPHY_ICONS[design.philosophy]}</span>
                        <span className="text-sm font-semibold">{design.agentName}</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-medium">Typography:</span>{' '}
                          {design.designChoices.typography.join(', ') || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Spacing:</span> {design.designChoices.spacing}
                        </div>
                        <div>
                          <span className="font-medium">Layout:</span> {design.designChoices.layout}
                        </div>
                        <div>
                          <span className="font-medium">Visual Style:</span> {design.designChoices.visualStyle}
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </>
          )}

          {/* Agent Profiles (Info) */}
          {agentProfiles.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Meet the Agents</h4>
                </div>
                {agentProfiles.map((agent) => (
                  <Card key={agent.id} className={`p-3 ${PHILOSOPHY_COLORS[agent.philosophy]}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{PHILOSOPHY_ICONS[agent.philosophy]}</span>
                      <div>
                        <p className="text-sm font-semibold">{agent.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{agent.philosophy}</p>
                      </div>
                    </div>
                    <p className="text-xs mb-2">{agent.description}</p>
                    <p className="text-xs text-muted-foreground italic">{agent.personality}</p>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
