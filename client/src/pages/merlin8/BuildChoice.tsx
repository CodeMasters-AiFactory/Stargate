/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MERLIN 8.0 - BUILD CHOICE SCREEN
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Entry point for website creation. Four paths:
 * 1. Free Templates - Access free templates (all packages)
 * 2. Premium Templates - Paid templates (paid packages only)
 * 3. Create from Scratch - AI generates unique design based on intake
 * 4. Professional Design - Human designers create your website
 */

import React from 'react';
import { useLocation } from 'wouter';
import {
  Sparkles,
  Layout,
  ArrowRight,
  Zap,
  Palette,
  Clock,
  Crown,
  Users,
  Star,
  Gift,
  Gem,
  Trophy,
  Wand2,
  Unlock
} from 'lucide-react';

export default function BuildChoice() {
  const [, setLocation] = useLocation();

  // Premium templates are independently purchasable - no package check needed
  const handlePaidTemplatesClick = () => {
    setLocation('/merlin8/templates?type=premium');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      {/* Background Effects - Pink/Fuchsia Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-fuchsia-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30 rounded-full text-fuchsia-300 text-sm mb-6 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
            <Sparkles className="w-4 h-4" />
            <span>Merlin 8.0 Website Builder</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How would you like to{' '}
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              build?
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Choose your path to create a stunning, professional website
          </p>
        </div>

        {/* Choice Cards - 4 Options in 2x2 grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* 1. Free Templates */}
          <button
            onClick={() => setLocation('/merlin8/templates?type=free')}
            className="group relative bg-gradient-to-b from-slate-800/90 to-[#0a0a0f] backdrop-blur border border-slate-600/50 rounded-2xl p-6 text-left transition-all duration-300 hover:border-emerald-400 hover:shadow-[0_0_40px_rgba(52,211,153,0.35)] hover:scale-[1.02]"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300" />

            {/* Free Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full text-white text-xs font-bold shadow-[0_0_15px_rgba(52,211,153,0.5)]">
              <div className="flex items-center gap-1">
                <Gift className="w-3 h-3" />
                FREE
              </div>
            </div>

            <div className="relative pt-2">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center mb-5 group-hover:border-emerald-400/50 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all">
                <Unlock className="w-7 h-7 text-emerald-400" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                Free Templates
              </h2>
              <p className="text-slate-400 text-sm mb-5">
                Start with our collection of free professionally designed templates.
              </p>

              {/* Benefits */}
              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm">Ready in 2-3 minutes</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Layout className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm">10+ free designs</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm">AI-enhanced content</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-emerald-400 font-semibold group-hover:gap-3 transition-all">
                <span>Browse Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* 2. Premium Templates - Independently purchasable */}
          <button
            onClick={handlePaidTemplatesClick}
            className="group relative bg-gradient-to-b from-fuchsia-900/60 via-purple-900/40 to-[#0f0a1a] backdrop-blur border-2 rounded-2xl p-6 text-left transition-all duration-300 border-fuchsia-400/70 shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:shadow-[0_0_50px_rgba(236,72,153,0.5)] hover:border-fuchsia-300 hover:scale-[1.02]"
          >
            {/* Premium Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-violet-500 rounded-full text-white text-xs font-bold shadow-[0_0_15px_rgba(236,72,153,0.5)]">
              <div className="flex items-center gap-1">
                <Gem className="w-3 h-3" />
                PREMIUM
              </div>
            </div>

            <div className="relative pt-2">
              <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-400/50 rounded-xl flex items-center justify-center mb-5 transition-all group-hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                <Layout className="w-7 h-7 text-fuchsia-400" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                Premium Templates
              </h2>
              <p className="text-slate-400 text-sm mb-5">
                Exclusive designs with advanced features and unique layouts.
              </p>

              {/* Benefits */}
              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Palette className="w-4 h-4 text-fuchsia-400" />
                  <span className="text-sm">25+ premium designs</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Star className="w-4 h-4 text-fuchsia-400" />
                  <span className="text-sm">Exclusive layouts</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Sparkles className="w-4 h-4 text-fuchsia-400" />
                  <span className="text-sm">Advanced animations</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-fuchsia-400 font-semibold group-hover:gap-3 transition-all">
                <span>Browse Premium</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* 3. Create from Scratch - AI Generated (POPULAR) */}
          <button
            onClick={() => setLocation('/merlin8/create')}
            className="group relative bg-gradient-to-b from-fuchsia-900/90 via-purple-900/70 to-[#0f0a1a] backdrop-blur border-2 border-fuchsia-400 rounded-2xl p-6 text-left transition-all duration-300 shadow-[0_0_40px_rgba(236,72,153,0.4),inset_0_1px_0_rgba(236,72,153,0.3)] hover:shadow-[0_0_60px_rgba(236,72,153,0.6),inset_0_1px_0_rgba(236,72,153,0.5)] hover:border-fuchsia-300 hover:scale-[1.03]"
          >
            {/* Popular Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 rounded-full text-white text-xs font-bold shadow-[0_0_20px_rgba(236,72,153,0.6)]">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                MOST POPULAR
              </div>
            </div>

            <div className="relative pt-2">
              <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500/30 to-purple-500/30 border border-fuchsia-400/50 rounded-xl flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(236,72,153,0.3)] group-hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all">
                <Wand2 className="w-7 h-7 text-fuchsia-300" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                Create from Scratch
              </h2>
              <p className="text-slate-300 text-sm mb-5">
                Merlin AI generates a completely unique website just for you.
              </p>

              {/* Benefits */}
              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2.5 text-slate-200">
                  <Sparkles className="w-4 h-4 text-fuchsia-300" />
                  <span className="text-sm">100% unique design</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-200">
                  <Palette className="w-4 h-4 text-fuchsia-300" />
                  <span className="text-sm">AI-generated images</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-200">
                  <Zap className="w-4 h-4 text-fuchsia-300" />
                  <span className="text-sm">Industry design DNA</span>
                </div>
              </div>

              {/* AI Power Info */}
              <div className="mb-4 p-2.5 bg-fuchsia-950/50 rounded-lg border border-fuchsia-500/30">
                <p className="text-xs text-fuchsia-200">
                  ⚡ Powered by Leonardo AI
                </p>
              </div>

              <div className="flex items-center gap-2 text-fuchsia-300 font-semibold group-hover:gap-3 transition-all">
                <span>Start Creating</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* 4. Professional Design Service */}
          <button
            onClick={() => setLocation('/merlin8/professional')}
            className="group relative bg-gradient-to-b from-amber-900/40 via-orange-900/30 to-[#0f0a0a] backdrop-blur border-2 border-amber-500/70 rounded-2xl p-6 text-left transition-all duration-300 shadow-[0_0_30px_rgba(251,146,60,0.25)] hover:shadow-[0_0_50px_rgba(251,146,60,0.4)] hover:border-amber-400 hover:scale-[1.02]"
          >
            {/* Premium Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full text-white text-xs font-bold shadow-[0_0_20px_rgba(251,146,60,0.6)]">
              <div className="flex items-center gap-1">
                <Crown className="w-3 h-3" />
                CONCIERGE
              </div>
            </div>

            <div className="relative pt-2">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center mb-5 group-hover:border-amber-400/60 group-hover:shadow-[0_0_20px_rgba(251,146,60,0.3)] transition-all">
                <Trophy className="w-7 h-7 text-amber-400" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                Professional Design
              </h2>
              <p className="text-slate-400 text-sm mb-5">
                Expert designers create a bespoke website for your brand.
              </p>

              {/* Benefits */}
              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span className="text-sm">Expert designers</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Gem className="w-4 h-4 text-amber-400" />
                  <span className="text-sm">Fully custom & bespoke</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-sm">Premium quality</span>
                </div>
              </div>

              {/* Premium Info */}
              <div className="mb-4 p-2.5 bg-amber-950/30 rounded-lg border border-amber-500/30">
                <p className="text-xs text-amber-200">
                  👑 Best designers on planet
                </p>
              </div>

              <div className="flex items-center gap-2 text-amber-400 font-semibold group-hover:gap-3 transition-all">
                <span>Learn More</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-slate-500 text-sm mt-8">
          All options include mobile-responsive design and SEO optimization
        </p>

        {/* Test Bypass Button & Back to Packages Link */}
        <div className="flex justify-center items-center gap-6 mt-4">
          <button
            onClick={() => setLocation('/merlin8/packages')}
            className="text-fuchsia-400 hover:text-fuchsia-300 text-sm underline underline-offset-2 transition-colors"
          >
            ← Back to Packages
          </button>

          {/* Bypass Button for Testing */}
          <button
            onClick={() => setLocation('/merlin8/create')}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-all"
            title="Skip straight to intake form"
          >
            <Zap className="w-4 h-4" />
            Bypass to Intake
          </button>
        </div>
      </div>
    </div>
  );
}
