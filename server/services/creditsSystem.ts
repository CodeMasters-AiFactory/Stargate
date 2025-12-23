/**
 * STARGATE PORTAL - Credit & Usage System
 * 
 * Tracks AI model usage and credits for billing
 */

// Credit costs per model (in credits, not Rand)
export const MODEL_CREDITS = {
  'haiku': 2,      // Cheap & fast
  'sonnet': 8,     // Balanced (recommended)
  'opus': 25,      // Premium (best quality)
} as const;

// Model display names and descriptions
export const MODEL_INFO = {
  'haiku': {
    name: 'Haiku',
    icon: '⚡',
    description: 'Fast & efficient',
    badge: 'Budget Friendly',
    credits: 2,
  },
  'sonnet': {
    name: 'Sonnet',
    icon: '🧠',
    description: 'Smart & balanced',
    badge: 'Recommended',
    credits: 8,
  },
  'opus': {
    name: 'Opus',
    icon: '👑',
    description: 'Most intelligent',
    badge: 'Premium',
    credits: 25,
  },
} as const;

// Package definitions
export const PACKAGES = {
  'starter': {
    name: 'Starter',
    price: 0,
    credits: 50,
    description: 'Try before you buy',
    features: ['50 free credits', '1 website', 'Basic support'],
  },
  'basic': {
    name: 'Basic',
    price: 199, // ZAR
    credits: 300,
    description: 'Perfect for small business',
    features: ['300 credits/month', '3 websites', 'Email support', 'All AI models'],
  },
  'pro': {
    name: 'Pro',
    price: 499,
    credits: 1000,
    description: 'For growing agencies',
    features: ['1000 credits/month', '10 websites', 'Priority support', 'All AI models', 'Custom branding'],
  },
  'enterprise': {
    name: 'Enterprise',
    price: 1499,
    credits: 5000,
    description: 'Unlimited potential',
    features: ['5000 credits/month', 'Unlimited websites', 'Dedicated support', 'All AI models', 'White label', 'API access'],
  },
} as const;

// Credit pack pricing (with discounts)
export const CREDIT_PACKS = [
  { credits: 100, price: 80, discount: '20% off' },
  { credits: 500, price: 350, discount: '30% off' },
  { credits: 1000, price: 600, discount: '40% off' },
] as const;

// Anthropic API model mapping
export const ANTHROPIC_MODELS = {
  'haiku': 'claude-haiku-4-5-20251001',
  'sonnet': 'claude-sonnet-4-5-20250929',
  'opus': 'claude-opus-4-5-20251101',
} as const;

// Types
export type ModelType = keyof typeof MODEL_CREDITS;
export type PackageType = keyof typeof PACKAGES;

export interface UsageLog {
  id: string;
  userId: string;
  model: ModelType;
  tokensIn: number;
  tokensOut: number;
  creditsUsed: number;
  apiCostUsd: number;
  action: 'chat' | 'generate' | 'edit';
  projectId?: string;
  createdAt: Date;
}

export interface UserCredits {
  userId: string;
  packageType: PackageType;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  renewsAt: Date;
}

/**
 * Calculate credits for a message based on model and tokens
 */
export function calculateCredits(
  model: ModelType,
  tokensIn: number,
  tokensOut: number
): { credits: number; estimatedCostUsd: number } {
  // Base credit cost per model
  const baseCredits = MODEL_CREDITS[model];
  
  // Anthropic pricing per million tokens (USD)
  const pricing = {
    'haiku': { input: 1, output: 5 },
    'sonnet': { input: 3, output: 15 },
    'opus': { input: 5, output: 25 },
  };
  
  // Calculate actual API cost in USD
  const modelPricing = pricing[model];
  const inputCost = (tokensIn / 1_000_000) * modelPricing.input;
  const outputCost = (tokensOut / 1_000_000) * modelPricing.output;
  const estimatedCostUsd = inputCost + outputCost;
  
  // For simple messages, charge base rate
  // For longer messages, scale up slightly
  const totalTokens = tokensIn + tokensOut;
  let credits = baseCredits;
  
  if (totalTokens > 2000) {
    credits = Math.ceil(baseCredits * 1.5);
  }
  if (totalTokens > 5000) {
    credits = Math.ceil(baseCredits * 2);
  }
  
  return { credits, estimatedCostUsd };
}

/**
 * Check if user has enough credits
 */
export function hasEnoughCredits(
  userCredits: UserCredits,
  model: ModelType
): boolean {
  return userCredits.remainingCredits >= MODEL_CREDITS[model];
}

/**
 * Format credit display
 */
export function formatCredits(credits: number): string {
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}k`;
  }
  return credits.toString();
}

console.log('[Credits System] 💰 Loaded - Packages:', Object.keys(PACKAGES).join(', '));
console.log('[Credits System] 🤖 Models:', Object.keys(MODEL_CREDITS).map(m => `${m}(${MODEL_CREDITS[m as ModelType]}cr)`).join(', '));
