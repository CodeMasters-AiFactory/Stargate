/**
 * AI Marketplace Service
 * Platform for discovering and integrating AI features
 */

import { getErrorMessage, logError } from '../utils/errorHandler';

export interface MarketplaceFeature {
  id: string;
  name: string;
  description: string;
  category: 'generation' | 'optimization' | 'analysis' | 'integration' | 'custom';
  provider: string; // 'built-in' | 'third-party'
  pricing: {
    type: 'free' | 'usage-based' | 'subscription';
    price?: number;
    unit?: string; // 'per-request', 'per-month', etc.
  };
  rating: number; // 0-5
  usageCount: number;
  status: 'active' | 'beta' | 'deprecated';
  apiEndpoint?: string;
  documentation?: string;
  examples?: Array<{
    title: string;
    description: string;
    code: string;
  }>;
}

export interface FeatureIntegration {
  featureId: string;
  websiteId: string;
  config: Record<string, any>;
  status: 'active' | 'paused' | 'error';
  lastUsed?: Date;
  usageStats?: {
    requests: number;
    successRate: number;
    avgResponseTime: number;
  };
}

// In-memory stores (use database in production)
const marketplaceFeatures = new Map<string, MarketplaceFeature>();
const featureIntegrations = new Map<string, FeatureIntegration[]>();

/**
 * Initialize marketplace with built-in features
 */
export function initializeMarketplace(): void {
  console.log('[AIMarketplace] 🏪 Initializing marketplace...');

  // Register built-in features
  const builtInFeatures: MarketplaceFeature[] = [
    {
      id: 'predictive-content',
      name: 'Predictive Content Generator',
      description: 'AI that predicts content needs and generates suggestions',
      category: 'generation',
      provider: 'built-in',
      pricing: { type: 'free' },
      rating: 4.8,
      usageCount: 0,
      status: 'active',
      apiEndpoint: '/api/predictive-content',
      documentation: '/docs/predictive-content',
    },
    {
      id: 'smart-ab-testing',
      name: 'Smart A/B Testing Engine',
      description: 'Automated A/B testing with AI-powered variation generation',
      category: 'optimization',
      provider: 'built-in',
      pricing: { type: 'free' },
      rating: 4.9,
      usageCount: 0,
      status: 'active',
      apiEndpoint: '/api/ab-testing',
      documentation: '/docs/ab-testing',
    },
    {
      id: 'self-healing',
      name: 'Self-Healing Websites',
      description: 'Automatically detects and fixes website issues',
      category: 'optimization',
      provider: 'built-in',
      pricing: { type: 'free' },
      rating: 4.7,
      usageCount: 0,
      status: 'active',
      apiEndpoint: '/api/self-healing',
      documentation: '/docs/self-healing',
    },
    {
      id: 'neural-designer',
      name: 'Neural Website Designer',
      description: 'AI that learns from user preferences and predicts design choices',
      category: 'generation',
      provider: 'built-in',
      pricing: { type: 'free' },
      rating: 5.0,
      usageCount: 0,
      status: 'beta',
      apiEndpoint: '/api/neural-designer',
      documentation: '/docs/neural-designer',
    },
  ];

  builtInFeatures.forEach(feature => {
    marketplaceFeatures.set(feature.id, feature);
  });

  console.log(`[AIMarketplace] ✅ Initialized with ${builtInFeatures.length} features`);
}

/**
 * List all marketplace features
 */
export function listFeatures(filters?: {
  category?: string;
  provider?: string;
  status?: string;
  minRating?: number;
}): MarketplaceFeature[] {
  let features = Array.from(marketplaceFeatures.values());

  if (filters) {
    if (filters.category) {
      features = features.filter(f => f.category === filters.category);
    }
    if (filters.provider) {
      features = features.filter(f => f.provider === filters.provider);
    }
    if (filters.status) {
      features = features.filter(f => f.status === filters.status);
    }
    if (filters.minRating) {
      features = features.filter(f => f.rating >= filters.minRating!);
    }
  }

  return features.sort((a, b) => b.rating - a.rating);
}

/**
 * Get feature by ID
 */
export function getFeature(featureId: string): MarketplaceFeature | undefined {
  return marketplaceFeatures.get(featureId);
}

/**
 * Register a third-party feature
 */
export async function registerFeature(feature: Omit<MarketplaceFeature, 'id' | 'usageCount'>): Promise<MarketplaceFeature> {
  try {
    console.log(`[AIMarketplace] 📝 Registering feature: ${feature.name}`);

    const newFeature: MarketplaceFeature = {
      id: `feature-${Date.now()}`,
      ...feature,
      usageCount: 0,
    };

    marketplaceFeatures.set(newFeature.id, newFeature);
    
    console.log(`[AIMarketplace] ✅ Registered feature: ${newFeature.id}`);
    return newFeature;
  } catch (error) {
    logError(error, 'AIMarketplace - RegisterFeature');
    throw new Error(`Failed to register feature: ${getErrorMessage(error)}`);
  }
}

/**
 * Integrate a feature into a website
 */
export async function integrateFeature(
  featureId: string,
  websiteId: string,
  config: Record<string, any>
): Promise<FeatureIntegration> {
  try {
    console.log(`[AIMarketplace] 🔌 Integrating feature ${featureId} into website ${websiteId}...`);

    const feature = marketplaceFeatures.get(featureId);
    if (!feature) {
      throw new Error(`Feature not found: ${featureId}`);
    }

    const integration: FeatureIntegration = {
      featureId,
      websiteId,
      config,
      status: 'active',
      lastUsed: new Date(),
      usageStats: {
        requests: 0,
        successRate: 0,
        avgResponseTime: 0,
      },
    };

    const integrations = featureIntegrations.get(websiteId) || [];
    integrations.push(integration);
    featureIntegrations.set(websiteId, integrations);

    // Update feature usage count
    feature.usageCount++;
    marketplaceFeatures.set(featureId, feature);

    console.log(`[AIMarketplace] ✅ Feature integrated`);
    return integration;
  } catch (error) {
    logError(error, 'AIMarketplace - IntegrateFeature');
    throw new Error(`Failed to integrate feature: ${getErrorMessage(error)}`);
  }
}

/**
 * Get integrations for a website
 */
export function getWebsiteIntegrations(websiteId: string): FeatureIntegration[] {
  return featureIntegrations.get(websiteId) || [];
}

/**
 * Update integration status
 */
export function updateIntegrationStatus(
  websiteId: string,
  featureId: string,
  status: 'active' | 'paused' | 'error'
): void {
  const integrations = featureIntegrations.get(websiteId) || [];
  const integration = integrations.find(i => i.featureId === featureId);
  
  if (integration) {
    integration.status = status;
    featureIntegrations.set(websiteId, integrations);
  }
}

/**
 * Record feature usage
 */
export function recordFeatureUsage(
  websiteId: string,
  featureId: string,
  success: boolean,
  responseTime: number
): void {
  const integrations = featureIntegrations.get(websiteId) || [];
  const integration = integrations.find(i => i.featureId === featureId);
  
  if (integration && integration.usageStats) {
    integration.usageStats.requests++;
    
    // Update success rate
    const successWeight = success ? 1 : 0;
    integration.usageStats.successRate = 
      (integration.usageStats.successRate * (integration.usageStats.requests - 1) + successWeight) / 
      integration.usageStats.requests;
    
    // Update average response time
    integration.usageStats.avgResponseTime = 
      (integration.usageStats.avgResponseTime * (integration.usageStats.requests - 1) + responseTime) / 
      integration.usageStats.requests;
    
    integration.lastUsed = new Date();
    featureIntegrations.set(websiteId, integrations);
  }
}

/**
 * Search features
 */
export function searchFeatures(query: string): MarketplaceFeature[] {
  const features = Array.from(marketplaceFeatures.values());
  const lowerQuery = query.toLowerCase();
  
  return features.filter(f => 
    f.name.toLowerCase().includes(lowerQuery) ||
    f.description.toLowerCase().includes(lowerQuery) ||
    f.category.toLowerCase().includes(lowerQuery)
  );
}

// Initialize marketplace on module load
initializeMarketplace();

