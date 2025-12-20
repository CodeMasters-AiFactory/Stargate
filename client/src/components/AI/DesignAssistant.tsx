/**
 * AI Design Assistant
 * Real-time design suggestions and recommendations
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sparkles,
  Palette,
  Type,
  Layout,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Wand2,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

export interface DesignSuggestion {
  type: 'color' | 'typography' | 'layout' | 'accessibility' | 'performance' | 'content' | 'seo';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  currentValue?: string;
  suggestedValue?: string;
  impact: string;
  autoFixAvailable: boolean;
}

export interface DesignScore {
  overall: number;
  breakdown: {
    colorHarmony: number;
    typography: number;
    layout: number;
    accessibility: number;
    industryFit: number;
  };
}

export interface ColorHarmony {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  type: 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'monochromatic';
  contrastRatios: {
    textOnBackground: number;
    textOnPrimary: number;
  };
}

export interface TypographyPairing {
  headingFont: string;
  bodyFont: string;
  headingSizes: { h1: string; h2: string; h3: string; h4: string };
  lineHeights: { heading: number; body: number };
  letterSpacing: { heading: string; body: string };
  category: 'classic' | 'modern' | 'playful' | 'elegant' | 'bold';
}

export interface DesignAssistantProps {
  websiteId?: string;
  currentColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  currentFonts?: {
    heading?: string;
    body?: string;
  };
  industry?: string;
  businessName?: string;
  onApplySuggestion?: (suggestion: DesignSuggestion) => void;
  onApplyColorPalette?: (palette: ColorHarmony) => void;
  onApplyTypography?: (typography: TypographyPairing) => void;
}

export function DesignAssistant({
  websiteId,
  currentColors,
  currentFonts,
  industry = 'technology',
  businessName = 'Your Business',
  onApplySuggestion,
  onApplyColorPalette,
  onApplyTypography,
}: DesignAssistantProps) {
  const [suggestions, setSuggestions] = useState<DesignSuggestion[]>([]);
  const [score, setScore] = useState<DesignScore | null>(null);
  const [colorPalettes, setColorPalettes] = useState<ColorHarmony[]>([]);
  const [typographyPairings, setTypographyPairings] = useState<TypographyPairing[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [open, setOpen] = useState(false);

  const analyzeDesign = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/design-assistant/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry,
          businessName,
          currentColors: currentColors || {},
          currentFonts: currentFonts || {},
          currentLayout: { sections: [] },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuggestions(data.suggestions || []);
        setScore(data.score || null);
      }
    } catch (error) {
      console.error('Failed to analyze design:', error);
      toast.error('Failed to analyze design');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadColorPalettes = async () => {
    try {
      const baseColor = currentColors?.primary || '#3B82F6';
      const response = await fetch(`/api/design-assistant/colors/harmonies?baseColor=${baseColor}`);
      const data = await response.json();
      if (data.success) {
        setColorPalettes(data.harmonies || []);
      }
    } catch (error) {
      console.error('Failed to load color palettes:', error);
    }
  };

  const loadTypographyPairings = async () => {
    try {
      const response = await fetch('/api/design-assistant/typography/pairings');
      const data = await response.json();
      if (data.success) {
        setTypographyPairings(data.pairings || []);
      }
    } catch (error) {
      console.error('Failed to load typography pairings:', error);
    }
  };

  const getRecommendations = async () => {
    try {
      const response = await fetch('/api/design-assistant/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry,
          businessName,
          currentColors: currentColors || {},
          currentFonts: currentFonts || {},
          currentLayout: { sections: [] },
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (data.recommendations?.colorPalette) {
          setColorPalettes([data.recommendations.colorPalette]);
        }
        if (data.recommendations?.typography) {
          setTypographyPairings([data.recommendations.typography]);
        }
      }
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    }
  };

  useEffect(() => {
    if (open) {
      analyzeDesign();
      loadColorPalettes();
      loadTypographyPairings();
    }
  }, [open, currentColors, currentFonts]);

  const getPriorityColor = (priority: DesignSuggestion['priority']) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTypeIcon = (type: DesignSuggestion['type']) => {
    switch (type) {
      case 'color':
        return <Palette className="w-4 h-4" />;
      case 'typography':
        return <Type className="w-4 h-4" />;
      case 'layout':
        return <Layout className="w-4 h-4" />;
      case 'accessibility':
        return <Eye className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const handleApplySuggestion = async (suggestion: DesignSuggestion) => {
    if (suggestion.autoFixAvailable && onApplySuggestion) {
      onApplySuggestion(suggestion);
      toast.success(`Applied: ${suggestion.title}`);
    } else {
      toast.info('Auto-fix not available for this suggestion');
    }
  };

  const handleApplyColorPalette = (palette: ColorHarmony) => {
    if (onApplyColorPalette) {
      onApplyColorPalette(palette);
      toast.success('Color palette applied');
    }
  };

  const handleApplyTypography = (typography: TypographyPairing) => {
    if (onApplyTypography) {
      onApplyTypography(typography);
      toast.success('Typography pairing applied');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wand2 className="w-4 h-4" />
          AI Design Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Design Assistant
          </DialogTitle>
          <DialogDescription>
            Get real-time design suggestions and improve your website's design score
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="suggestions" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="score">Score</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="suggestions" className="space-y-4">
              {/* Design Score Card */}
              {score && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Design Score</span>
                      <Badge variant={score.overall >= 80 ? 'default' : score.overall >= 60 ? 'secondary' : 'destructive'}>
                        {score.overall}/100
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(score.breakdown).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${value}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-10 text-right">{value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Suggestions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Design Suggestions</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={analyzeDesign}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
                  </Button>
                </div>

                {suggestions.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
                      <p className="text-muted-foreground">No suggestions at this time</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Your design is looking great!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  suggestions.map((suggestion, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">{getTypeIcon(suggestion.type)}</div>
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                {suggestion.title}
                                <Badge variant={getPriorityColor(suggestion.priority)}>
                                  {suggestion.priority}
                                </Badge>
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {suggestion.description}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {suggestion.currentValue && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Current: </span>
                            <span className="font-mono">{suggestion.currentValue}</span>
                          </div>
                        )}
                        {suggestion.suggestedValue && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Suggested: </span>
                            <span className="font-mono font-semibold text-primary">
                              {suggestion.suggestedValue}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <p className="text-xs text-muted-foreground">{suggestion.impact}</p>
                          {suggestion.autoFixAvailable && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplySuggestion(suggestion)}
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Apply Fix
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Color Palettes</h3>
                <Button variant="outline" size="sm" onClick={getRecommendations}>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Get AI Recommendations
                </Button>
              </div>

              {colorPalettes.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Palette className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No color palettes available</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {colorPalettes.map((palette, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base capitalize">{palette.type} Harmony</CardTitle>
                        <CardDescription>
                          Contrast: {palette.contrastRatios.textOnBackground.toFixed(2)}:1
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { name: 'Primary', color: palette.primary },
                            { name: 'Secondary', color: palette.secondary },
                            { name: 'Accent', color: palette.accent },
                            { name: 'Background', color: palette.background },
                            { name: 'Text', color: palette.text },
                          ].map(({ name, color }) => (
                            <div key={name} className="space-y-1">
                              <div
                                className="w-full h-16 rounded border"
                                style={{ backgroundColor: color }}
                              />
                              <p className="text-xs text-center font-mono">{color}</p>
                              <p className="text-xs text-center text-muted-foreground">{name}</p>
                            </div>
                          ))}
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleApplyColorPalette(palette)}
                        >
                          Apply This Palette
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Typography Pairings</h3>
                <Button variant="outline" size="sm" onClick={loadTypographyPairings}>
                  Refresh
                </Button>
              </div>

              {typographyPairings.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Type className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No typography pairings available</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {typographyPairings.map((pairing, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base capitalize">
                          {pairing.headingFont} + {pairing.bodyFont}
                        </CardTitle>
                        <CardDescription className="capitalize">{pairing.category} Style</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-semibold mb-1" style={{ fontFamily: pairing.headingFont }}>
                              Heading Font: {pairing.headingFont}
                            </p>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p>H1: {pairing.headingSizes.h1}</p>
                              <p>H2: {pairing.headingSizes.h2}</p>
                              <p>H3: {pairing.headingSizes.h3}</p>
                              <p>H4: {pairing.headingSizes.h4}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold mb-1" style={{ fontFamily: pairing.bodyFont }}>
                              Body Font: {pairing.bodyFont}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              <p>Line Height: {pairing.lineHeights.body}</p>
                              <p>Letter Spacing: {pairing.letterSpacing.body}</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleApplyTypography(pairing)}
                        >
                          Apply This Typography
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="score" className="space-y-4">
              {score ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Design Score Breakdown</CardTitle>
                    <CardDescription>
                      Overall score: {score.overall}/100
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(score.breakdown).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-sm font-bold">{value}/100</span>
                        </div>
                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              value >= 80 ? 'bg-green-500' :
                              value >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Run analysis to see your design score</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

