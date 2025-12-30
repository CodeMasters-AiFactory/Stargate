/**
 * Predictive Analytics Service
 * Visitor behavior prediction, conversion prediction, and trend analysis
 */

import { db } from '../db';
import { analyticsEvents } from '@shared/schema';
import { eq, and, gte, desc } from 'drizzle-orm';

export interface VisitorPrediction {
  visitorId: string;
  conversionProbability: number;
  predictedValue: number;
  recommendedActions: string[];
  riskFactors: string[];
}

export interface ConversionPrediction {
  sessionId: string;
  conversionProbability: number;
  predictedTimeToConvert: number; // minutes
  factors: Array<{ factor: string; impact: number }>;
}

export interface TrendAnalysis {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  rate: number; // Percentage change per period
  forecast: Array<{ date: string; predicted: number }>;
  confidence: number;
}

class PredictiveAnalyticsService {
  /**
   * Predict visitor behavior
   */
  async predictVisitorBehavior(
    websiteId: string,
    visitorData: {
      sessionId: string;
      pageViews: number;
      timeOnSite: number;
      referrer?: string;
      device?: string;
    }
  ): Promise<VisitorPrediction> {
    if (!db) {
      return this.getDefaultPrediction(visitorData.sessionId);
    }

    try {
      // Get historical data for similar visitors
      const similarVisitors = await db
        .select()
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.websiteId, websiteId),
            gte(analyticsEvents.timestamp, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          )
        )
        .limit(1000);

      // Calculate conversion probability based on patterns
      const conversionRate = this.calculateConversionRate(similarVisitors, visitorData);
      const predictedValue = this.predictValue(visitorData, conversionRate);
      const recommendedActions = this.generateVisitorRecommendations(visitorData, conversionRate);
      const riskFactors = this.identifyRiskFactors(visitorData);

      return {
        visitorId: visitorData.sessionId,
        conversionProbability: conversionRate,
        predictedValue,
        recommendedActions,
        riskFactors,
      };
    } catch (_error: unknown) {
      console.error('[PredictiveAnalytics] Prediction error:', _error);
      return this.getDefaultPrediction(visitorData.sessionId);
    }
  }

  /**
   * Predict conversion for a session
   */
  async predictConversion(
    websiteId: string,
    sessionId: string
  ): Promise<ConversionPrediction> {
    if (!db) {
      return {
        sessionId,
        conversionProbability: 0.1,
        predictedTimeToConvert: 30,
        factors: [],
      };
    }

    try {
      // Get session events
      const sessionEvents = await db
        .select()
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.websiteId, websiteId),
            eq(analyticsEvents.sessionId, sessionId)
          )
        )
        .orderBy(desc(analyticsEvents.timestamp));

      // Analyze session behavior
      const pageViews = sessionEvents.filter((e: { eventType?: string | null }) => e.eventType === 'pageview').length;
      const timeOnSite = this.calculateTimeOnSite(sessionEvents);
      const hasEngagement = sessionEvents.some((e: { eventType?: string | null }) => e.eventType === 'click' || e.eventType === 'scroll');

      // Calculate conversion probability
      let probability = 0.1; // Base probability
      if (pageViews > 3) probability += 0.2;
      if (timeOnSite > 120) probability += 0.2;
      if (hasEngagement) probability += 0.3;
      if (sessionEvents.some((e: { path?: string | null }) => e.path?.includes('pricing') || e.path?.includes('contact'))) {
        probability += 0.2;
      }

      probability = Math.min(1, probability);

      // Predict time to convert
      const predictedTime = this.predictTimeToConvert(sessionEvents, probability);

      // Identify factors
      const factors = [
        { factor: 'Page Views', impact: pageViews > 3 ? 0.3 : 0.1 },
        { factor: 'Time on Site', impact: timeOnSite > 120 ? 0.3 : 0.1 },
        { factor: 'Engagement', impact: hasEngagement ? 0.4 : 0 },
      ];

      return {
        sessionId,
        conversionProbability: probability,
        predictedTimeToConvert: predictedTime,
        factors,
      };
    } catch (_error: unknown) {
      console.error('[PredictiveAnalytics] Conversion prediction error:', _error);
      return {
        sessionId,
        conversionProbability: 0.1,
        predictedTimeToConvert: 30,
        factors: [],
      };
    }
  }

  /**
   * Analyze trends
   */
  async analyzeTrends(
    websiteId: string,
    metric: 'pageviews' | 'conversions' | 'bounceRate' | 'avgSessionDuration',
    days: number = 30
  ): Promise<TrendAnalysis> {
    if (!db) {
      return {
        metric,
        trend: 'stable',
        rate: 0,
        forecast: [],
        confidence: 0.5,
      };
    }

    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const events = await db
        .select()
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.websiteId, websiteId),
            gte(analyticsEvents.timestamp, startDate)
          )
        );

      // Calculate metric values over time
      const dailyValues = this.calculateDailyMetric(events, metric, days);

      // Determine trend
      const trend = this.determineTrend(dailyValues);
      const rate = this.calculateTrendRate(dailyValues);

      // Generate forecast
      const forecast = this.generateForecast(dailyValues, 7);

      return {
        metric,
        trend,
        rate,
        forecast,
        confidence: 0.8, // Would calculate based on data quality
      };
    } catch (_error: unknown) {
      console.error('[PredictiveAnalytics] Trend analysis error:', _error);
      return {
        metric,
        trend: 'stable',
        rate: 0,
        forecast: [],
        confidence: 0.5,
      };
    }
  }

  /**
   * Generate recommendations
   */
  async generateRecommendations(
    _websiteId: string,
    analytics: {
      pageViews: number;
      conversions: number;
      bounceRate: number;
      avgTimeOnPage: number;
    }
  ): Promise<Array<{ type: string; action: string; expectedImpact: number; priority: number }>> {
    const recommendations = [];

    if (analytics.bounceRate > 60) {
      recommendations.push({
        type: 'content',
        action: 'Improve hero section to reduce bounce rate',
        expectedImpact: 15,
        priority: 1,
      });
    }

    if (analytics.conversions / analytics.pageViews < 0.02) {
      recommendations.push({
        type: 'cta',
        action: 'Optimize call-to-action buttons',
        expectedImpact: 25,
        priority: 1,
      });
    }

    if (analytics.avgTimeOnPage < 30) {
      recommendations.push({
        type: 'engagement',
        action: 'Add interactive elements to increase engagement',
        expectedImpact: 20,
        priority: 2,
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  // Helper methods
  private getDefaultPrediction(visitorId: string): VisitorPrediction {
    return {
      visitorId,
      conversionProbability: 0.1,
      predictedValue: 0,
      recommendedActions: [],
      riskFactors: [],
    };
  }

  private calculateConversionRate(events: Array<{ eventType?: string | null }>, _visitorData: { pageViews: number; timeOnSite: number }): number {
    // Simplified calculation
    const conversions = events.filter((e: { eventType?: string | null }) => e.eventType === 'conversion' || e.eventType === 'purchase').length;
    const total = events.length;
    return total > 0 ? conversions / total : 0.1;
  }

  private predictValue(visitorData: { pageViews: number }, conversionRate: number): number {
    // Simplified value prediction
    return visitorData.pageViews * conversionRate * 100; // Mock value
  }

  private generateVisitorRecommendations(_visitorData: { pageViews: number; timeOnSite: number }, conversionRate: number): string[] {
    const recommendations = [];
    if (conversionRate < 0.1) {
      recommendations.push('Improve page content');
      recommendations.push('Add social proof');
    }
    return recommendations;
  }

  private identifyRiskFactors(visitorData: { pageViews: number; timeOnSite: number }): string[] {
    const factors = [];
    if (visitorData.timeOnSite < 30) {
      factors.push('Low engagement');
    }
    if (visitorData.pageViews === 1) {
      factors.push('Single page visit');
    }
    return factors;
  }

  private calculateTimeOnSite(events: Array<{ timestamp: Date | string }>): number {
    if (events.length < 2) return 0;
    const first = events[events.length - 1].timestamp;
    const last = events[0].timestamp;
    return (new Date(last).getTime() - new Date(first).getTime()) / 1000;
  }

  private predictTimeToConvert(_events: Array<{ timestamp: Date | string }>, probability: number): number {
    // Simplified prediction
    return probability > 0.5 ? 15 : 45;
  }

  private calculateDailyMetric(events: Array<{ timestamp: Date | string }>, _metric: string, _days: number): Array<{ date: string; value: number }> {
    // Group events by date and calculate metric
    const daily = new Map<string, number[]>();

    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!daily.has(date)) {
        daily.set(date, []);
      }
      daily.get(date)!.push(1); // Simplified
    });

    return Array.from(daily.entries()).map(([date, values]) => ({
      date,
      value: values.length,
    }));
  }

  private determineTrend(values: Array<{ date: string; value: number }>): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    const first = values[0].value;
    const last = values[values.length - 1].value;
    const change = (last - first) / first;
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private calculateTrendRate(values: Array<{ date: string; value: number }>): number {
    if (values.length < 2) return 0;
    const first = values[0].value;
    const last = values[values.length - 1].value;
    return ((last - first) / first) * 100;
  }

  private generateForecast(values: Array<{ date: string; value: number }>, days: number): Array<{ date: string; predicted: number }> {
    // Simple linear forecast
    if (values.length < 2) return [];

    const trend = this.calculateTrendRate(values) / values.length;
    const lastValue = values[values.length - 1].value;
    const forecast = [];

    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecast.push({
        date: date.toISOString().split('T')[0],
        predicted: lastValue * (1 + trend / 100 * i),
      });
    }

    return forecast;
  }
}

export const predictiveAnalyticsService = new PredictiveAnalyticsService();

