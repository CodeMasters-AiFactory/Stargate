/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MERLIN 8.0 - BUILD CHOICE SCREEN
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Entry point for website creation. Two paths:
 * 1. Choose a Template - Browse and customize existing templates
 * 2. Start from Scratch - AI generates unique design based on intake
 */

import React from 'react';
import { useLocation } from 'wouter';
import { Sparkles, Layout, ArrowRight, Zap, Palette, Clock } from 'lucide-react';

export default function BuildChoice() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Merlin 8.0 Website Builder</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How would you like to start?
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Choose your path to create a stunning, professional website in minutes
          </p>
        </div>

        {/* Choice Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Template Path */}
          <button
            onClick={() => setLocation('/merlin8/templates')}
            className="group relative bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 text-left transition-all duration-300 hover:border-blue-500/50 hover:bg-slate-800/80 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            
            <div className="relative">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-all">
                <Layout className="w-8 h-8 text-blue-400" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">
                Choose a Template
              </h2>
              <p className="text-slate-400 mb-6">
                Browse our collection of 33+ professionally designed templates. 
                Pick one that matches your industry and customize it with your content.
              </p>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-300">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Ready in 2-3 minutes</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Palette className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Pre-designed layouts</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">AI-enhanced with your content</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-blue-400 font-semibold group-hover:gap-4 transition-all">
                <span>Browse Templates</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>

          {/* From Scratch Path */}
          <button
            onClick={() => setLocation('/merlin8/create')}
            className="group relative bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 text-left transition-all duration-300 hover:border-purple-500/50 hover:bg-slate-800/80 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
            
            {/* Popular Badge */}
            <div className="absolute -top-3 right-6 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xs font-bold">
              POPULAR
            </div>

            <div className="relative">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/30 transition-all">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">
                Create from Scratch
              </h2>
              <p className="text-slate-400 mb-6">
                Tell us about your business and Merlin AI will generate a completely 
                unique website with custom images, copy, and design tailored to you.
              </p>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-300">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">100% unique design</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Palette className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">AI-generated images (Leonardo AI)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">Industry-specific design DNA</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-purple-400 font-semibold group-hover:gap-4 transition-all">
                <span>Start Creating</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-slate-500 text-sm mt-8">
          Both options include AI-powered image generation, professional copy, and mobile-responsive design
        </p>
      </div>
    </div>
  );
}
