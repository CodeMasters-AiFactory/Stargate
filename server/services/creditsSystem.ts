/**
 * STARGATE PORTAL - Credit & Usage System (USD)
 * 
 * ALL Anthropic Models with USD Pricing
 * From cheapest (Haiku 3) to premium (Opus 4.1)
 */

// ===========================================
// ALL ANTHROPIC MODELS - API PRICING (per 1M tokens)
// ===========================================
export const ANTHROPIC_PRICING = {
  'haiku-3': { input: 0.25, output: 1.25, name: 'Haiku 3', speed: 'Fastest' },
  'haiku-3.5': { input: 0.80, output: 4.00, name: 'Haiku 3.5', speed: 'Very Fast' },
  'haiku-4.5': { input: 1.00, output: 5.00, name: 'Haiku 4.5', speed: 'Fast' },
  'sonnet-4': { input: 3.00, output: 15.00, name: 'Sonnet 4', speed: 'Balanced' },
  'sonnet-4.5': { input: 3.00, output: 15.00, name: 'Sonnet 4.5', speed: 'Balanced' },
  'opus-4.5': { input: 5.00, output: 25.00, name: 'Opus 4.5', speed: 'Premium' },
  'opus-4.1': { input: 15.00, output: 75.00, name: 'Opus 4.1', speed: 'Ultimate' },
} as const;

// ===========================================
// CREDIT COSTS PER MODEL (in credits)
// 1 Credit = $0.01 USD
// ===========================================
export const MODEL_CREDITS = {
  'haiku-3': 1,       // ~$0.01 per message (CHEAPEST - great for simple tasks)
  'haiku-3.5': 2,     // ~$0.02 per message
  'haiku-4.5': 3,     // ~$0.03 per message
  'sonnet-4': 8,      // ~$0.08 per message (RECOMMENDED)
  'sonnet-4.5': 8,    // ~$0.08 per message (BEST VALUE)
  'opus-4.5': 15,     // ~$0.15 per message (PREMIUM)
  'opus-4.1': 40,     // ~$0.40 per message (ULTIMATE - deep reasoning)
} as const;

// ===========================================
// MODEL DISPLAY INFO
// ===========================================
export const MODEL_INFO = {
  'haiku-3': {
    name: 'Haiku 3',
    icon: '🌱',
    description: 'Fastest & cheapest',
    badge: 'Budget',
    credits: 1,
    color: '#22c55e', // green
    apiModel: 'claude-3-haiku-20240307',
    recommended: false,
  },
  'haiku-3.5': {
    name: 'Haiku 3.5',
    icon: '⚡',
    description: 'Fast & efficient',
    badge: 'Efficient',
    credits: 2,
    color: '#10b981', // emerald
    apiModel: 'claude-3-5-haiku-20241022',
    recommended: false,
  },
  'haiku-4.5': {
    name: 'Haiku 4.5',
    icon: '🚀',
    description: 'Near-frontier speed',
    badge: 'Fast',
    credits: 3,
    color: '#14b8a6', // teal
    apiModel: 'claude-haiku-4-5-20251001',
    recommended: false,
  },
  'sonnet-4': {
    name: 'Sonnet 4',
    icon: '🧠',
    description: 'Smart & reliable',
    badge: 'Balanced',
    credits: 8,
    color: '#3b82f6', // blue
    apiModel: 'claude-sonnet-4-20250514',
    recommended: false,
  },
  'sonnet-4.5': {
    name: 'Sonnet 4.5',
    icon: '✨',
    description: 'Best for websites',
    badge: '⭐ Recommended',
    credits: 8,
    color: '#6366f1', // indigo
    apiModel: 'claude-sonnet-4-5-20250929',
    recommended: true,
  },
  'opus-4.5': {
    name: 'Opus 4.5',
    icon: '👑',
    description: 'Most intelligent',
    badge: 'Premium',
    credits: 15,
    color: '#8b5cf6', // violet
    apiModel: 'claude-opus-4-5-20251101',
    recommended: false,
  },
  'opus-4.1': {
    name: 'Opus 4.1',
    icon: '🔮',
    description: 'Ultimate reasoning',
    badge: 'Ultimate',
    credits: 40,
    color: '#a855f7', // purple
    apiModel: 'claude-opus-4-1-20250630',
    recommended: false,
  },
} as const;

// ===========================================
// PACKAGES (USD PRICING)
// ===========================================
export const PACKAGES = {
  'free': {
    name: 'Free Trial',
    price: 0,
    credits: 25,
    websites: 1,
    description: 'Try before you buy',
    features: [
      '25 free credits',
      '1 website',
      'Basic templates',
      'Haiku models only',
      'Community support',
    ],
    allowedModels: ['haiku-3', 'haiku-3.5'],
  },
  'starter': {
    name: 'Starter',
    price: 9,
    credits: 150,
    websites: 2,
    description: 'Perfect for individuals',
    features: [
      '150 credits/month',
      '2 websites',
      'All templates',
      'Haiku & Sonnet models',
      'Email support',
      'AI image generation',
    ],
    allowedModels: ['haiku-3', 'haiku-3.5', 'haiku-4.5', 'sonnet-4', 'sonnet-4.5'],
  },
  'pro': {
    name: 'Pro',
    price: 29,
    credits: 500,
    websites: 10,
    description: 'For professionals',
    features: [
      '500 credits/month',
      '10 websites',
      'Premium templates',
      'All AI models',
      'Priority support',
      'AI image generation',
      'Custom domains',
      'Analytics',
    ],
    allowedModels: ['haiku-3', 'haiku-3.5', 'haiku-4.5', 'sonnet-4', 'sonnet-4.5', 'opus-4.5'],
  },
  'agency': {
    name: 'Agency',
    price: 79,
    credits: 2000,
    websites: 50,
    description: 'For agencies & teams',
    features: [
      '2000 credits/month',
      '50 websites',
      'All premium features',
      'ALL AI models (including Opus)',
      'White-label option',
      'API access',
      'Dedicated support',
      'Team collaboration',
    ],
    allowedModels: ['haiku-3', 'haiku-3.5', 'haiku-4.5', 'sonnet-4', 'sonnet-4.5', 'opus-4.5', 'opus-4.1'],
  },
  'enterprise': {
    name: 'Enterprise',
    price: 199,
    credits: 10000,
    websites: -1, // unlimited
    description: 'Unlimited power',
    features: [
      '10,000 credits/month',
      'Unlimited websites',
      'All features included',
      'ALL AI models',
      'Custom integrations',
      'SLA guarantee',
      'Dedicated account manager',
      'On-boarding & training',
    ],
    allowedModels: ['haiku-3', 'haiku-3.5', 'haiku-4.5', 'sonnet-4', 'sonnet-4.5', 'opus-4.5', 'opus-4.1'],
  },
} as const;

// ===========================================
// CREDIT PACKS (One-time purchase, USD)
// ===========================================
export const CREDIT_PACKS = [
  { credits: 50, price: 4, discount: null, perCredit: 0.08 },
  { credits: 100, price: 7, discount: '12% off', perCredit: 0.07 },
  { credits: 250, price: 15, discount: '25% off', perCredit: 0.06 },
  { credits: 500, price: 25, discount: '37% off', perCredit: 0.05 },
  { credits: 1000, price: 40, discount: '50% off', perCredit: 0.04 },
  { credits: 5000, price: 150, discount: '62% off', perCredit: 0.03 },
] as const;

// ===========================================
// TYPES
// ===========================================
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
  action: 'chat' | 'generate' | 'edit' | 'image';
  projectId?: string;
  createdAt: Date;
}

export interface UserCredits {
  userId: string;
  packageType: PackageType;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  bonusCredits: number;
  renewsAt: Date;
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Calculate actual API cost for a message
 */
export function calculateApiCost(
  model: ModelType,
  tokensIn: number,
  tokensOut: number
): number {
  const pricing = ANTHROPIC_PRICING[model];
  const inputCost = (tokensIn / 1_000_000) * pricing.input;
  const outputCost = (tokensOut / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

/**
 * Calculate credits for a message
 * Scales with message length for longer conversations
 */
export function calculateCredits(
  model: ModelType,
  tokensIn: number,
  tokensOut: number
): { credits: number; apiCostUsd: number } {
  const baseCredits = MODEL_CREDITS[model];
  const apiCostUsd = calculateApiCost(model, tokensIn, tokensOut);
  
  // Base credit cost per model
  let credits = baseCredits;
  
  // Scale up for longer messages
  const totalTokens = tokensIn + tokensOut;
  if (totalTokens > 2000) credits = Math.ceil(baseCredits * 1.5);
  if (totalTokens > 5000) credits = Math.ceil(baseCredits * 2);
  if (totalTokens > 10000) credits = Math.ceil(baseCredits * 3);
  
  return { credits, apiCostUsd };
}

/**
 * Check if user can use a specific model
 */
export function canUseModel(
  packageType: PackageType,
  model: ModelType
): boolean {
  const pkg = PACKAGES[packageType];
  return pkg.allowedModels.includes(model);
}

/**
 * Get models available for a package
 */
export function getAvailableModels(packageType: PackageType): ModelType[] {
  return PACKAGES[packageType].allowedModels as unknown as ModelType[];
}

/**
 * Format price for display
 */
export function formatPrice(usd: number): string {
  return `$${usd.toFixed(2)}`;
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
  if (credits >= 1000) return `${(credits / 1000).toFixed(1)}k`;
  return credits.toString();
}

// ===========================================
// PROFIT CALCULATION (for business planning)
// ===========================================
export function calculateProfit(
  packagesSold: Record<PackageType, number>
): { revenue: number; estimatedCost: number; profit: number } {
  let revenue = 0;
  let estimatedCost = 0;
  
  for (const [pkgType, count] of Object.entries(packagesSold)) {
    const pkg = PACKAGES[pkgType as PackageType];
    revenue += pkg.price * count;
    // Estimate 60% credit usage, average $0.05 per credit cost
    estimatedCost += (pkg.credits * 0.6 * 0.05) * count;
  }
  
  return {
    revenue,
    estimatedCost,
    profit: revenue - estimatedCost,
  };
}

console.log('[Credits System] 💰 USD Pricing loaded');
console.log('[Credits System] 🤖 Models:', Object.keys(MODEL_CREDITS).length);
console.log('[Credits System] 📦 Packages:', Object.keys(PACKAGES).join(', '));
