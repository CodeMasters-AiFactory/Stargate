/**
 * A/B Test Results
 * View and analyze A/B test results
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Award, BarChart3, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export interface ABTestResult {
  variationId: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  confidence: number;
  isWinner: boolean;
  improvement: number;
}

export interface ABTest {
  id: string;
  name: string;
  elementSelector: string;
  variations: Array<{
    id: string;
    name: string;
    html: string;
    description: string;
  }>;
  status: 'running' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
  results?: ABTestResult[];
  winner?: string;
}

export interface ABTestResultsProps {
  testId?: string;
  onImplementWinner?: (testId: string, winnerId: string) => void;
}

export function ABTestResults({ testId, onImplementWinner }: ABTestResultsProps) {
  const [test, setTest] = useState<ABTest | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (testId) {
      loadTest(testId);
    }
  }, [testId]);

  const loadTest = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ab-testing/test/${id}`);
      const data = await response.json();
      if (data.success) {
        setTest(data.test);
      }
    } catch (error) {
      console.error('Failed to load test:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImplementWinner = async (winnerId: string) => {
    if (!testId) return;

    try {
      const response = await fetch(`/api/ab-testing/implement-winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          winnerId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Winner implemented successfully');
        if (onImplementWinner) {
          onImplementWinner(testId, winnerId);
        }
        loadTest(testId);
      } else {
        toast.error(data.error || 'Failed to implement winner');
      }
    } catch (error) {
      console.error('Failed to implement winner:', error);
      toast.error('Failed to implement winner');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading test results...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">No test selected</p>
        <p className="text-sm text-muted-foreground">Select a test to view results</p>
      </div>
    );
  }

  const controlResult = test.results?.find(r => r.variationId === 'control');
  const bestResult = test.results?.reduce((best, current) => {
    if (!best || current.conversionRate > best.conversionRate) {
      return current;
    }
    return best;
  }, undefined as ABTestResult | undefined);

  return (
    <div className="space-y-6">
      {/* Test Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{test.name}</CardTitle>
              <CardDescription>
                Element: {test.elementSelector} • Status: {test.status}
              </CardDescription>
            </div>
            <Badge variant={test.status === 'running' ? 'default' : 'secondary'}>
              {test.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Results Summary */}
      {test.results && test.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Test Results
            </CardTitle>
            <CardDescription>
              Statistical analysis of all variations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {test.results.map((result) => {
              const variation = test.variations.find(v => v.id === result.variationId);
              const isControl = result.variationId === 'control';
              const isBest = bestResult?.variationId === result.variationId && !isControl;

              return (
                <div
                  key={result.variationId}
                  className={`p-4 border rounded-lg ${
                    isBest ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">
                          {variation?.name || `Variation ${result.variationId}`}
                        </h4>
                        {isControl && <Badge variant="outline">Control</Badge>}
                        {isBest && (
                          <Badge className="gap-1">
                            <Award className="w-3 h-3" />
                            Winner
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {variation?.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {(result.conversionRate * 100).toFixed(2)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Conversion Rate</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Visitors</div>
                      <div className="text-lg font-semibold">{result.visitors}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Conversions</div>
                      <div className="text-lg font-semibold">{result.conversions}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                      <div className="text-lg font-semibold">
                        {(result.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {!isControl && controlResult && (
                    <div className="flex items-center gap-2 text-sm">
                      {result.improvement > 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-green-500">
                            +{result.improvement.toFixed(1)}% vs Control
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-red-500" />
                          <span className="text-red-500">
                            {result.improvement.toFixed(1)}% vs Control
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  <div className="mt-3">
                    <Progress value={result.conversionRate * 100} className="h-2" />
                  </div>

                  {isBest && test.status === 'completed' && (
                    <Button
                      className="w-full mt-3"
                      onClick={() => handleImplementWinner(result.variationId)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Implement Winner
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {(!test.results || test.results.length === 0) && (
        <Card>
          <CardContent className="py-8 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No results yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Results will appear as visitors interact with your test
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

