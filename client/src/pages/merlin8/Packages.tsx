/**
 * Merlin Pricing Page - Leonardo.ai Style
 * Clean, modern pricing page with card layout and comparison table
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  Building2,
  Rocket,
  ArrowRight,
  Info
} from 'lucide-react';

type BillingPeriod = 'monthly' | 'yearly';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  badge?: string;
  highlighted?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  perfectFor: string;
  features: string[];
  cta: string;
  ctaStyle: 'default' | 'primary' | 'premium';
}

const pricingTiers: PricingTier[] = [
  {
    id: 'home',
    name: 'Home',
    description: 'Personal & Portfolio',
    monthlyPrice: 29,
    yearlyPrice: 24,
    icon: Zap,
    perfectFor: 'Personal websites, portfolios, and hobby projects',
    features: [
      '100 AI Credits/month',
      'Up to 5 pages',
      'Responsive design',
      'Basic SEO optimization',
      'Contact form',
      'SSL certificate',
      'Email support',
    ],
    cta: 'Get Started',
    ctaStyle: 'default',
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Small & Medium Business',
    monthlyPrice: 79,
    yearlyPrice: 65,
    badge: 'Most Popular',
    highlighted: true,
    icon: Sparkles,
    perfectFor: 'Growing businesses ready to establish their online presence',
    features: [
      '500 AI Credits/month',
      'Unlimited pages',
      'E-commerce (50 products)',
      'Advanced SEO tools',
      'Blog functionality',
      'Analytics dashboard',
      'Custom domain included',
      'Priority support',
    ],
    cta: 'Start Business',
    ctaStyle: 'primary',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Large Organizations',
    monthlyPrice: 199,
    yearlyPrice: 165,
    badge: 'Best Value',
    icon: Building2,
    perfectFor: 'Enterprises and large organizations with complex needs',
    features: [
      '2,000 AI Credits/month',
      'Unlimited pages',
      'Unlimited e-commerce',
      'API access',
      'White-label options',
      'Advanced analytics',
      '24/7 priority support',
      'Dedicated account manager',
    ],
    cta: 'Start Corporate',
    ctaStyle: 'primary',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'White-Glove Service',
    monthlyPrice: 499,
    yearlyPrice: 415,
    icon: Crown,
    perfectFor: 'Businesses wanting dedicated development support',
    features: [
      '5,000 AI Credits/month',
      'Everything in Corporate',
      'Dedicated dev team',
      'Custom AI model training',
      'Enterprise SLA',
      'Custom integrations',
      'Quarterly strategy calls',
    ],
    cta: 'Contact Sales',
    ctaStyle: 'premium',
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'Fully Managed',
    monthlyPrice: 799,
    yearlyPrice: 665,
    badge: 'Elite',
    icon: Rocket,
    perfectFor: 'Full-service website management and continuous development',
    features: [
      'Unlimited AI Credits',
      'Everything in Premium',
      'Daily content updates',
      'Unlimited dev hours',
      'Custom integrations',
      'Dedicated success manager',
      'SLA guarantee (99.9%)',
    ],
    cta: 'Contact Sales',
    ctaStyle: 'premium',
  },
];

// Feature comparison data
const comparisonFeatures = [
  { name: 'AI Credits/Month', home: '100', business: '500', corporate: '2,000', premium: '5,000', elite: 'Unlimited' },
  { name: 'Number of Pages', home: 'Up to 5', business: 'Unlimited', corporate: 'Unlimited', premium: 'Unlimited', elite: 'Unlimited' },
  { name: 'E-Commerce Products', home: false, business: '50', corporate: 'Unlimited', premium: 'Unlimited', elite: 'Unlimited' },
  { name: 'SEO Optimization', home: 'Basic', business: 'Advanced', corporate: 'Advanced', premium: 'Advanced', elite: 'Advanced' },
  { name: 'Analytics Dashboard', home: false, business: true, corporate: true, premium: true, elite: true },
  { name: 'Custom Domain', home: false, business: true, corporate: true, premium: true, elite: true },
  { name: 'API Access', home: false, business: false, corporate: true, premium: true, elite: true },
  { name: 'White-Label Options', home: false, business: false, corporate: true, premium: true, elite: true },
  { name: 'Dedicated Account Manager', home: false, business: false, corporate: true, premium: true, elite: true },
  { name: 'Custom AI Training', home: false, business: false, corporate: false, premium: true, elite: true },
  { name: 'Dedicated Dev Team', home: false, business: false, corporate: false, premium: true, elite: true },
  { name: 'Support Level', home: 'Email', business: 'Priority', corporate: '24/7 Priority', premium: 'Dedicated', elite: 'Dedicated + SLA' },
];

export default function MerlinPackages() {
  const [, setLocation] = useLocation();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('yearly');

  const handleSelectPlan = (tierId: string) => {
    // Store selected package and navigate to build choice
    localStorage.setItem('merlin-selected-package', tierId);
    setLocation('/merlin8');
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (value === true) {
      return <Check className="w-5 h-5 text-green-400 mx-auto" />;
    }
    if (value === false) {
      return <X className="w-5 h-5 text-slate-600 mx-auto" />;
    }
    return <span className="text-slate-300">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Unlock the power of{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Merlin
            </span>
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            One subscription, unlimited possibilities
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Pay Yearly
              {billingPeriod === 'yearly' && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                  <Sparkles className="w-3 h-3" />
                  Save 17%
                </span>
              )}
            </button>
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-lg transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Pay Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {pricingTiers.map((tier) => {
              const price = billingPeriod === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice;
              const originalPrice = billingPeriod === 'yearly' ? tier.monthlyPrice : null;
              const Icon = tier.icon;

              return (
                <div
                  key={tier.id}
                  className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 cursor-pointer group ${
                    tier.highlighted
                      ? 'bg-gradient-to-b from-fuchsia-900/90 via-purple-900/70 to-[#0f0a1a] border-2 border-fuchsia-400 shadow-[0_0_40px_rgba(236,72,153,0.4),inset_0_1px_0_rgba(236,72,153,0.3)] hover:shadow-[0_0_60px_rgba(236,72,153,0.6),inset_0_1px_0_rgba(236,72,153,0.5)] hover:border-fuchsia-300 hover:scale-[1.03]'
                      : 'bg-gradient-to-b from-slate-800/90 to-[#0a0a0f] border border-slate-600/50 hover:border-fuchsia-400 hover:shadow-[0_0_40px_rgba(236,72,153,0.35)] hover:scale-[1.03]'
                  }`}
                >
                  {/* Badge */}
                  {tier.badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 text-xs font-bold rounded-full ${
                      tier.badge === 'Most Popular' ? 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.6)]' :
                      tier.badge === 'Best Value' ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white shadow-[0_0_20px_rgba(251,146,60,0.6)]' :
                      'bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 text-black shadow-[0_0_20px_rgba(251,191,36,0.6)]'
                    }`}>
                      {tier.badge}
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-5 h-5 ${tier.highlighted ? 'text-fuchsia-400' : 'text-slate-400'}`} />
                      <h2 className="text-xl font-bold">{tier.name}</h2>
                    </div>
                    <p className="text-slate-500 text-sm">{tier.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      {originalPrice && (
                        <span className="text-slate-500 line-through text-lg">${originalPrice}</span>
                      )}
                      <span className="text-4xl font-bold">${price}</span>
                      <span className="text-slate-500">/ month</span>
                    </div>
                    {billingPeriod === 'yearly' && (
                      <p className="text-slate-500 text-sm mt-1">Billed annually</p>
                    )}
                  </div>

                  {/* Perfect For */}
                  <div className="mb-4 pb-4 border-b border-slate-800">
                    <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Perfect for</p>
                    <p className="text-slate-300 text-sm">{tier.perfectFor}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6 flex-1">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          tier.highlighted ? 'text-fuchsia-400' : 'text-emerald-400'
                        }`} />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleSelectPlan(tier.id)}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                      tier.ctaStyle === 'primary'
                        ? 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:from-pink-400 hover:via-fuchsia-400 hover:to-purple-500 text-white shadow-[0_4px_20px_rgba(236,72,153,0.4)] hover:shadow-[0_6px_30px_rgba(236,72,153,0.6)] hover:-translate-y-0.5'
                        : tier.ctaStyle === 'premium'
                        ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-300 hover:via-orange-400 hover:to-red-400 text-white shadow-[0_4px_20px_rgba(251,146,60,0.4)] hover:shadow-[0_6px_30px_rgba(251,146,60,0.6)] hover:-translate-y-0.5'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-600 hover:border-fuchsia-400 hover:shadow-[0_4px_20px_rgba(236,72,153,0.25)] hover:-translate-y-0.5'
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-2xl font-bold">Compare all features</h2>
              <p className="text-slate-400 mt-1">See what's included in each plan</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                    {pricingTiers.map((tier) => (
                      <th key={tier.id} className="p-4 text-center">
                        <span className={`font-semibold ${tier.highlighted ? 'text-purple-400' : 'text-white'}`}>
                          {tier.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, idx) => (
                    <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="p-4 text-slate-300">{feature.name}</td>
                      <td className="p-4 text-center">{renderFeatureValue(feature.home)}</td>
                      <td className="p-4 text-center bg-purple-900/10">{renderFeatureValue(feature.business)}</td>
                      <td className="p-4 text-center">{renderFeatureValue(feature.corporate)}</td>
                      <td className="p-4 text-center">{renderFeatureValue(feature.premium)}</td>
                      <td className="p-4 text-center">{renderFeatureValue(feature.elite)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* AI Credits Info */}
      <div className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl border border-purple-500/30 p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">How AI Credits Work</h3>
                <p className="text-slate-400 mb-4">
                  Credits are used for AI-powered services like website generation, content writing, and image creation.
                  Unused credits roll over for 30 days.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-slate-400">Website Generation</div>
                    <div className="text-white font-semibold">20 credits</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-slate-400">Content Writing</div>
                    <div className="text-white font-semibold">5 credits/page</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-slate-400">Image Generation</div>
                    <div className="text-white font-semibold">10 credits</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-slate-400">SEO Optimization</div>
                    <div className="text-white font-semibold">15 credits</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-6 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-500 mb-4">
            All plans include: Custom domain & SSL • CDN hosting • 24/7 uptime monitoring • No coding required
          </p>
          <p className="text-slate-400">
            Need help choosing?{' '}
            <button
              onClick={() => setLocation('/contact')}
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Contact our team
            </button>
            {' '}for personalized recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
