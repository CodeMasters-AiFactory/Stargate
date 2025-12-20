/**
 * Website Analysis Component
 * UI for analyzing any website URL against quality standards
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { NavigationButtons } from './BackButton';

interface WebsiteAnalysis {
  url: string;
  timestamp: string;
  overallSummary: string;
  categoryScores: {
    visualDesign: number;
    uxStructure: number;
    contentPositioning: number;
    conversionTrust: number;
    seoFoundations: number;
    creativityDifferentiation: number;
  };
  categoryDetails: {
    visualDesign: { strengths: string[]; improvements: string[] };
    uxStructure: { strengths: string[]; improvements: string[] };
    contentPositioning: { strengths: string[]; improvements: string[] };
    conversionTrust: { strengths: string[]; improvements: string[] };
    seoFoundations: { strengths: string[]; improvements: string[] };
    creativityDifferentiation: { strengths: string[]; improvements: string[] };
  };
  finalVerdict: 'Poor' | 'OK' | 'Good' | 'Excellent' | 'World-Class';
  averageScore: number;
}

export function WebsiteAnalysis() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/website-builder/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze website');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze website');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score < 4) return 'text-red-500';
    if (score < 6) return 'text-yellow-500';
    if (score < 7.5) return 'text-blue-500';
    if (score < 8.5) return 'text-green-500';
    return 'text-emerald-500';
  };

  const getVerdictColor = (verdict: string): string => {
    switch (verdict) {
      case 'Poor':
        return 'bg-red-100 text-red-800';
      case 'OK':
        return 'bg-yellow-100 text-yellow-800';
      case 'Good':
        return 'bg-blue-100 text-blue-800';
      case 'Excellent':
        return 'bg-green-100 text-green-800';
      case 'World-Class':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (score: number) => {
    if (score < 4) return <XCircle className="h-5 w-5 text-red-500" />;
    if (score < 6) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    if (score < 7.5) return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
    if (score < 8.5) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  };

  const categories = [
    { key: 'visualDesign', label: 'Visual Design & Layout' },
    { key: 'uxStructure', label: 'UX & Structure' },
    { key: 'contentPositioning', label: 'Content & Positioning' },
    { key: 'conversionTrust', label: 'Conversion & Trust' },
    { key: 'seoFoundations', label: 'SEO Foundations' },
    { key: 'creativityDifferentiation', label: 'Creativity & Differentiation' },
  ] as const;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <NavigationButtons backDestination="dashboard" className="mb-4" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Website Analysis</h1>
        <p className="text-muted-foreground">
          Analyze any website against our strict quality standards. Get honest, actionable feedback.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Enter Website URL</CardTitle>
          <CardDescription>
            Provide a website URL to analyze. The analysis will be strict and honest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={handleAnalyze} disabled={loading || !url.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Website'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Overall Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Analysis Results</CardTitle>
                <Badge className={getVerdictColor(analysis.finalVerdict)}>
                  {analysis.finalVerdict}
                </Badge>
              </div>
              <CardDescription>
                Average Score:{' '}
                <span className={`font-bold ${getScoreColor(analysis.averageScore)}`}>
                  {analysis.averageScore.toFixed(1)}/10
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{analysis.overallSummary}</p>
              {analysis.averageScore < 7.5 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>This website is NOT excellent.</strong> At least one category is below
                    7.5/10, or the average score is below 7.5. See improvements below.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Category Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Category Scores</CardTitle>
              <CardDescription>Detailed scoring for each quality dimension</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.map(category => {
                const score = analysis.categoryScores[category.key];
                const details = analysis.categoryDetails[category.key];

                return (
                  <div key={category.key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(score)}
                        <h3 className="font-semibold">{category.label}</h3>
                      </div>
                      <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                        {score.toFixed(1)}/10
                      </span>
                    </div>
                    <Progress value={score * 10} className="mb-3" />

                    {details.strengths.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-green-700 mb-1 flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          Strengths
                        </h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          {details.strengths.map((strength, i) => (
                            <li key={i}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {details.improvements.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-orange-700 mb-1 flex items-center gap-1">
                          <TrendingDown className="h-4 w-4" />
                          Improvements Needed
                        </h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          {details.improvements.map((improvement, i) => (
                            <li key={i}>{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Final Verdict */}
          <Card>
            <CardHeader>
              <CardTitle>Final Verdict</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge className={`text-lg px-4 py-2 ${getVerdictColor(analysis.finalVerdict)}`}>
                  {analysis.finalVerdict}
                </Badge>
                <span className="text-muted-foreground">
                  Average Score:{' '}
                  <strong className={getScoreColor(analysis.averageScore)}>
                    {analysis.averageScore.toFixed(1)}/10
                  </strong>
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                <strong>Analysis Date:</strong> {new Date(analysis.timestamp).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
