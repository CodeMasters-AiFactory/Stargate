/**
 * STARGATE PORTAL - Pricing Page
 * 
 * Shows all packages in USD with Stripe integration
 */

import { useState } from 'react';
import { ModelSelector, CreditDisplay } from './merlin/ModelSelector';

// Package data (matches server/services/creditsSystem.ts)
const PACKAGES = {
  free: {
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
    popular: false,
    cta: 'Start Free',
  },
  starter: {
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
    popular: false,
    cta: 'Get Started',
  },
  pro: {
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
    popular: true,
    cta: 'Go Pro',
  },
  agency: {
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
    popular: false,
    cta: 'Contact Sales',
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    credits: 10000,
    websites: -1,
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
    popular: false,
    cta: 'Contact Us',
  },
};

const CREDIT_PACKS = [
  { credits: 50, price: 4, discount: null },
  { credits: 100, price: 7, discount: '12% off' },
  { credits: 250, price: 15, discount: '25% off' },
  { credits: 500, price: 25, discount: '37% off' },
  { credits: 1000, price: 40, discount: '50% off' },
  { credits: 5000, price: 150, discount: '62% off' },
];

interface PricingPageProps {
  onSelectPackage?: (packageKey: string) => void;
  onBuyCredits?: (packIndex: number) => void;
}

export function PricingPage({ onSelectPackage, onBuyCredits }: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCreditPacks, setShowCreditPacks] = useState(false);

  const yearlyDiscount = 0.2; // 20% off for yearly

  const getPrice = (monthlyPrice: number) => {
    if (billingCycle === 'yearly' && monthlyPrice > 0) {
      return (monthlyPrice * 12 * (1 - yearlyDiscount) / 12).toFixed(0);
    }
    return monthlyPrice;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-purple-200 mb-8">
            Build unlimited websites with AI. Pay only for what you use.
          </p>
          
          {/* Billing toggle */}
          <div className="inline-flex items-center bg-gray-800 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
          {Object.entries(PACKAGES).map(([key, pkg]) => (
            <div
              key={key}
              className={`relative rounded-2xl p-6 transition-all hover:scale-105 ${
                pkg.popular
                  ? 'bg-gradient-to-b from-purple-600 to-purple-800 border-2 border-purple-400 shadow-2xl shadow-purple-500/30'
                  : 'bg-gray-800/80 border border-gray-700'
              }`}
            >
              {/* Popular badge */}
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full">
                  Most Popular
                </div>
              )}

              {/* Package name */}
              <h3 className="text-xl font-bold text-white mb-1">{pkg.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{pkg.description}</p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  ${getPrice(pkg.price)}
                </span>
                {pkg.price > 0 && (
                  <span className="text-gray-400">/month</span>
                )}
                {billingCycle === 'yearly' && pkg.price > 0 && (
                  <div className="text-sm text-green-400">
                    Billed ${(pkg.price * 12 * (1 - yearlyDiscount)).toFixed(0)}/year
                  </div>
                )}
              </div>

              {/* Credits & Websites */}
              <div className="flex gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-purple-300">
                  <span className="text-lg">💎</span>
                  <span>{pkg.credits} credits</span>
                </div>
                <div className="flex items-center gap-1 text-purple-300">
                  <span className="text-lg">🌐</span>
                  <span>{pkg.websites === -1 ? '∞' : pkg.websites} sites</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => onSelectPackage?.(key)}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  pkg.popular
                    ? 'bg-white text-purple-600 hover:bg-gray-100'
                    : pkg.price === 0
                    ? 'bg-purple-600 text-white hover:bg-purple-500'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {pkg.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Credit Packs Section */}
        <div className="bg-gray-800/50 rounded-2xl p-8 mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Need More Credits?</h2>
              <p className="text-gray-400">Buy credit packs anytime. No subscription required.</p>
            </div>
            <button
              onClick={() => setShowCreditPacks(!showCreditPacks)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all"
            >
              {showCreditPacks ? 'Hide Packs' : 'View Credit Packs'}
            </button>
          </div>

          {showCreditPacks && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CREDIT_PACKS.map((pack, i) => (
                <button
                  key={i}
                  onClick={() => onBuyCredits?.(i)}
                  className="bg-gray-700 hover:bg-gray-600 rounded-xl p-4 text-center transition-all hover:scale-105"
                >
                  <div className="text-2xl font-bold text-white mb-1">
                    {pack.credits}
                  </div>
                  <div className="text-sm text-gray-400 mb-2">credits</div>
                  <div className="text-xl font-bold text-purple-400">
                    ${pack.price}
                  </div>
                  {pack.discount && (
                    <div className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded mt-2">
                      {pack.discount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Models Section */}
        <div className="bg-gray-800/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2">AI Model Pricing</h2>
          <p className="text-gray-400 mb-6">Choose the right AI for your needs. Cheaper models are faster, premium models are smarter.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-gray-400">Model</th>
                  <th className="py-3 px-4 text-gray-400">Credits/Message</th>
                  <th className="py-3 px-4 text-gray-400">Best For</th>
                  <th className="py-3 px-4 text-gray-400">Speed</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700/50">
                  <td className="py-3 px-4">🌱 Haiku 3</td>
                  <td className="py-3 px-4 text-green-400 font-bold">1 credit</td>
                  <td className="py-3 px-4">Simple edits, quick tasks</td>
                  <td className="py-3 px-4">⚡⚡⚡ Fastest</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-3 px-4">⚡ Haiku 3.5</td>
                  <td className="py-3 px-4 text-green-400 font-bold">2 credits</td>
                  <td className="py-3 px-4">Efficient conversations</td>
                  <td className="py-3 px-4">⚡⚡⚡ Very Fast</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-3 px-4">🚀 Haiku 4.5</td>
                  <td className="py-3 px-4 text-yellow-400 font-bold">3 credits</td>
                  <td className="py-3 px-4">Near-frontier speed</td>
                  <td className="py-3 px-4">⚡⚡ Fast</td>
                </tr>
                <tr className="border-b border-gray-700/50 bg-purple-900/20">
                  <td className="py-3 px-4">✨ Sonnet 4.5 <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded ml-2">Recommended</span></td>
                  <td className="py-3 px-4 text-purple-400 font-bold">8 credits</td>
                  <td className="py-3 px-4">Website building, coding</td>
                  <td className="py-3 px-4">⚡ Balanced</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-3 px-4">👑 Opus 4.5</td>
                  <td className="py-3 px-4 text-orange-400 font-bold">15 credits</td>
                  <td className="py-3 px-4">Complex reasoning</td>
                  <td className="py-3 px-4">Premium</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">🔮 Opus 4.1</td>
                  <td className="py-3 px-4 text-red-400 font-bold">40 credits</td>
                  <td className="py-3 px-4">Ultimate intelligence</td>
                  <td className="py-3 px-4">Ultimate</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ or Trust badges could go here */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">
            Trusted by businesses worldwide. Secure payments via Stripe.
          </p>
          <div className="flex items-center justify-center gap-6 opacity-60">
            <span className="text-2xl">💳</span>
            <span className="text-white font-medium">Visa</span>
            <span className="text-white font-medium">Mastercard</span>
            <span className="text-white font-medium">Amex</span>
            <span className="text-2xl">🔒</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;
