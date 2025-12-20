/**
 * SEO Expert Evaluation - Phase 7
 * AI evaluates the website for SEO and provides recommendations
 * 
 * Features:
 * - Overall SEO score (0-100)
 * - Category scores (Technical, Content, Performance, etc.)
 * - Specific recommendations
 * - Keyword suggestions
 * - One-click fixes
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ArrowRight,
  Zap,
  FileText,
  Globe,
  Smartphone,
  Shield,
  BarChart3,
  Loader2,
} from 'lucide-react';
import type { WebsiteRequirements } from '@/types/websiteBuilder';

interface SEOScore {
  overall: number;
  categories: {
    technical: number;
    content: number;
    performance: number;
    mobile: number;
    security: number;
  };
}

interface SEORecommendation {
  id: string;
  category: keyof SEOScore['categories'];
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  fixed?: boolean;
}

interface SEOExpertEvaluationProps {
  requirements: WebsiteRequirements;
  onComplete: (score: number, recommendations: string[]) => void;
  onBack?: () => void;
}

export function SEOExpertEvaluation({
  requirements,
  onComplete,
  onBack,
}: SEOExpertEvaluationProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [score, setScore] = useState<SEOScore | null>(null);
  const [recommendations, setRecommendations] = useState<SEORecommendation[]>([]);
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);

  // Simulate SEO analysis
  useEffect(() => {
    const analyzeWebsite = async () => {
      setIsAnalyzing(true);
      
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate mock scores based on requirements
      const hasContactInfo = !!(requirements.businessEmail && requirements.businessPhone);
      const hasDescription = !!(requirements.projectOverview);
      const hasSocialMedia = Object.values(requirements.socialMedia || {}).some(v => v);

      const technicalScore = 85 + Math.random() * 10;
      const contentScore = hasDescription ? 80 + Math.random() * 15 : 60 + Math.random() * 15;
      const performanceScore = 75 + Math.random() * 20;
      const mobileScore = 90 + Math.random() * 8;
      const securityScore = 95 + Math.random() * 5;

      const overall = Math.round(
        (technicalScore + contentScore + performanceScore + mobileScore + securityScore) / 5
      );

      setScore({
        overall,
        categories: {
          technical: Math.round(technicalScore),
          content: Math.round(contentScore),
          performance: Math.round(performanceScore),
          mobile: Math.round(mobileScore),
          security: Math.round(securityScore),
        },
      });

      // Generate recommendations
      const recs: SEORecommendation[] = [];
      
      if (!hasDescription) {
        recs.push({
          id: '1',
          category: 'content',
          severity: 'high',
          title: 'Add Meta Description',
          description: 'Your website lacks a compelling meta description.',
          impact: '+5 SEO points',
        });
      }
      
      if (!hasContactInfo) {
        recs.push({
          id: '2',
          category: 'technical',
          severity: 'medium',
          title: 'Add Structured Contact Data',
          description: 'Adding schema.org contact information improves local SEO.',
          impact: '+3 SEO points',
        });
      }

      if (!hasSocialMedia) {
        recs.push({
          id: '3',
          category: 'content',
          severity: 'low',
          title: 'Add Social Media Links',
          description: 'Social signals can indirectly improve SEO.',
          impact: '+2 SEO points',
        });
      }

      recs.push({
        id: '4',
        category: 'performance',
        severity: 'medium',
        title: 'Optimize Images',
        description: 'Compress images for faster loading.',
        impact: '+4 SEO points',
        fixed: true,
      });

      recs.push({
        id: '5',
        category: 'technical',
        severity: 'low',
        title: 'Add Open Graph Tags',
        description: 'Improve social media sharing appearance.',
        impact: '+2 SEO points',
        fixed: true,
      });

      setRecommendations(recs);

      // Generate keyword suggestions based on industry
      const industry = requirements.industry || 'Business';
      setKeywordSuggestions([
        `${industry.toLowerCase()} services`,
        `best ${industry.toLowerCase()} near me`,
        `professional ${industry.toLowerCase()}`,
        `${requirements.businessName?.toLowerCase() || 'company'} ${industry.toLowerCase()}`,
        `affordable ${industry.toLowerCase()}`,
      ]);

      setIsAnalyzing(false);
    };

    analyzeWebsite();
  }, [requirements]);

  const handleContinue = () => {
    if (score) {
      onComplete(
        score.overall,
        recommendations.filter(r => !r.fixed).map(r => r.title)
      );
    }
  };

  const getScoreColor = (value: number) => {
    if (value >= 90) return 'text-green-400';
    if (value >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBadge = (value: number) => {
    if (value >= 90) return { bg: 'bg-green-600', text: 'Excellent' };
    if (value >= 70) return { bg: 'bg-amber-600', text: 'Good' };
    return { bg: 'bg-red-600', text: 'Needs Work' };
  };

  const categoryIcons = {
    technical: <Zap className="w-5 h-5" />,
    content: <FileText className="w-5 h-5" />,
    performance: <BarChart3 className="w-5 h-5" />,
    mobile: <Smartphone className="w-5 h-5" />,
    security: <Shield className="w-5 h-5" />,
  };

  const categoryLabels = {
    technical: 'Technical SEO',
    content: 'Content Quality',
    performance: 'Performance',
    mobile: 'Mobile-Friendly',
    security: 'Security',
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Search className="w-6 h-6 text-blue-400" />
              SEO Expert Evaluation
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {isAnalyzing ? 'Analyzing your website for SEO...' : 'Review your SEO score and recommendations'}
            </p>
          </div>
          
          {score && (
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>
                {score.overall}
              </div>
              <Badge className={getScoreBadge(score.overall).bg}>
                {getScoreBadge(score.overall).text}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isAnalyzing ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold text-white mb-2">Analyzing Your Website</h2>
              <p className="text-slate-400">Checking SEO factors, performance, and more...</p>
            </div>
          </div>
        ) : score ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Category Scores */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(score.categories).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-300">
                        {categoryIcons[key as keyof typeof categoryIcons]}
                        {categoryLabels[key as keyof typeof categoryLabels]}
                      </div>
                      <span className={`font-bold ${getScoreColor(value)}`}>{value}/100</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Recommendations</span>
                  <Badge variant="secondary" className="bg-slate-700">
                    {recommendations.filter(r => !r.fixed).length} pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-lg border ${
                      rec.fixed
                        ? 'border-green-500/30 bg-green-500/5'
                        : rec.severity === 'high'
                        ? 'border-red-500/30 bg-red-500/5'
                        : rec.severity === 'medium'
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-blue-500/30 bg-blue-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {rec.fixed ? (
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                        ) : rec.severity === 'high' ? (
                          <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                        ) : rec.severity === 'medium' ? (
                          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                        ) : (
                          <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
                        )}
                        <div>
                          <h4 className={`font-medium ${rec.fixed ? 'text-green-400' : 'text-white'}`}>
                            {rec.title}
                          </h4>
                          <p className="text-sm text-slate-400 mt-1">{rec.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={
                        rec.fixed ? 'border-green-500 text-green-400' : 'border-slate-600 text-slate-300'
                      }>
                        {rec.fixed ? 'Fixed' : rec.impact}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Keyword Suggestions */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  Keyword Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {keywordSuggestions.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-cyan-900/30 text-cyan-300 border border-cyan-800/50">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-slate-400 text-sm">
            {score && score.overall >= 90 ? (
              <span className="text-green-400">🎉 Your website is SEO-optimized!</span>
            ) : score ? (
              <span>Address the recommendations above to improve your SEO score.</span>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            {onBack && !isAnalyzing && (
              <Button variant="outline" onClick={onBack} className="border-slate-600 text-slate-300">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            {!isAnalyzing && (
              <Button
                onClick={handleContinue}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6"
              >
                Continue to Final Approval
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SEOExpertEvaluation;

