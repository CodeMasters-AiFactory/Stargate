import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import stargateLogoUrl from '../assets/stargate-logo.jpg';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeroLiveStats } from '@/components/Stats/LiveStats';
import {
  Rocket,
  Brain,
  Shield,
  Zap,
  Users,
  Infinity,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Globe,
  Database,
  Crown,
  Target,
} from 'lucide-react';

export function StargateSite() {
  // Reserved for future use: activeTab, setActiveTab
  // const [activeTab, setActiveTab] = useState('planner');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation - Fixed and Highly Visible */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <img src={stargateLogoUrl} alt="Stargate" className="w-6 h-6 rounded object-cover" />
            <span className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Stargate
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#platform"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
            >
              Platform
            </a>
            <a
              href="#features"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
            >
              Pricing
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => {
                // Use proper navigation to go back to IDE
                const event = new CustomEvent('navigate-to-ide');
                window.dispatchEvent(event);
              }}
            >
              ← Back to IDE
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Sign In
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Content with top padding */}
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-8">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                  ✨ Introducing the next generation of development
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                Build with
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {' '}
                  AI agents
                </span>
                <br />
                that think together
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
                The first development platform powered by collaborative AI agents. Multiple
                specialists work together to plan, investigate, and execute your projects with
                unprecedented intelligence and efficiency.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-base font-medium"
                >
                  Start Building Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="px-8 py-4 text-base font-medium">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>

              {/* Live Stats */}
              <HeroLiveStats className="mt-4" />
            </div>
          </div>
        </section>

        {/* Platform Overview */}
        <section id="platform" className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                How our AI agents collaborate
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Multiple specialized AI agents work together like a world-class development team,
                each bringing unique expertise to solve complex problems.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 mb-20">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Strategy Planners
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Multiple planning agents analyze requirements from different perspectives,
                  creating comprehensive architectural strategies and implementation roadmaps.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-6">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Research Investigators
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Specialized research agents conduct deep analysis, identify optimal solutions, and
                  predict potential challenges before implementation begins.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Execution Agents
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Decision-making agents evaluate all proposed solutions, select optimal approaches
                  using advanced rating algorithms, and execute with precision.
                </p>
              </div>
            </div>

            {/* Agent Collaboration Demo */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
                Real-time Agent Collaboration
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    SP
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 flex-1 shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                      Strategy Planner
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      "Analyzing requirements: I recommend a microservices architecture with React
                      frontend and distributed backend services."
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    RI
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 flex-1 shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                      Research Investigator
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      "Analysis complete: Serverless functions would reduce infrastructure costs by
                      60% and improve auto-scaling capabilities."
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    EA
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 flex-1 shadow-sm border-l-4 border-green-600 dark:border-green-500">
                    <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                      Execution Agent
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      "Decision: Serverless approach rated 9.2/10. Implementing optimized serverless
                      architecture with automated deployment pipeline."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Enterprise-grade capabilities
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Built for scale, security, and performance. Everything you need to build, deploy,
                and manage applications at enterprise level.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                  <Infinity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Quantum Computing Access
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Revolutionary quantum computing integration that opens new dimensions of
                  computational power. Solve complex problems that traditional computing cannot
                  handle, from optimization to cryptography.
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  Quantum Powered
                </span>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Advanced AI Router
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Intelligent routing system that analyzes each task and automatically selects the
                  optimal AI model or distributes work across multiple models for maximum efficiency
                  and cost savings. Choose your preferred AI or let our router decide.
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                  Smart Routing
                </span>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Advanced Security
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Enterprise-grade security with customizable protection levels, advanced
                  encryption, and comprehensive access controls you can adjust to your needs.
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  Military Grade
                </span>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  AI Collaboration Hub
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Watch multiple AI agents collaborate in real-time on project planning, code
                  discussions, and execution decisions. Each agent brings specialized expertise to
                  create optimal solutions.
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                  Team AI
                </span>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-6">
                  <Crown className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Unrestricted AI Access
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Access to all AI models without external restrictions or censorship. Only limited
                  by our fair usage policies, giving you complete creative and technical freedom.
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                  Uncensored
                </span>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-6">
                  <Globe className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Global Edge Network
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Deploy instantly to 50+ global regions with zero-downtime deployments.
                  Auto-scaling capabilities that handle millions of users with enterprise-grade
                  reliability.
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300">
                  Global Scale
                </span>
              </div>

              <Card className="border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Crown className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle>Unrestricted AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Access to ALL AI models without external restrictions. Only limited by our fair
                    usage rules, not corporate censorship.
                  </p>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Uncensored
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-purple-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Database className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>Unlimited Everything</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    No credit systems. No usage caps. No overage fees. True unlimited compute,
                    storage, deployments, and AI usage.
                  </p>
                  <Badge variant="outline" className="text-purple-600 border-purple-600">
                    Truly Unlimited
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>Global Edge Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Deploy to 50+ global regions instantly. Zero-downtime deployments with
                    auto-scaling to millions of users.
                  </p>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    Planet-Scale
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Competitive Advantages */}
        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Why choose Stargate
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Compare our enterprise platform with traditional development solutions.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <div className="p-8 border-r border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      Traditional Platforms
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">×</span>
                        </div>
                        <span className="text-gray-600 dark:text-gray-300">
                          Single AI assistant
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">×</span>
                        </div>
                        <span className="text-gray-600 dark:text-gray-300">
                          $20-40+/month with usage limits
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">×</span>
                        </div>
                        <span className="text-gray-600 dark:text-gray-300">
                          Limited model selection
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">×</span>
                        </div>
                        <span className="text-gray-600 dark:text-gray-300">
                          Basic security features
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 bg-blue-50 dark:bg-blue-900/10">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      Stargate Platform
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-xs text-white">✓</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">
                          Multi-agent AI collaboration
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-xs text-white">✓</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">
                          Transparent, predictable pricing
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-xs text-white">✓</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">
                          Access to leading AI models
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-xs text-white">✓</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">
                          Enterprise-grade security
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Pricing That <span className="text-green-600">Humiliates</span> Competition
              </h2>
              <p className="text-xl text-muted-foreground mb-4">
                While Replit charges $20-40+/month with credit limits, we deliver infinite power for
                pocket change.
              </p>
              <Badge className="bg-red-100 text-red-800 border-red-200">
                🔥 Save 70-90% vs Replit
              </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Starter Plan */}
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <div className="text-4xl font-bold text-blue-600 mt-4">FREE</div>
                  <p className="text-muted-foreground">Forever. No catches.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Unlimited public projects</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Multi-agent AI system</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Smart AI routing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Quantum computing access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Custom security firewalls</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>50 GB storage</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                    Start Free Forever
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    vs Replit FREE: Public only, limited AI
                  </p>
                </CardContent>
              </Card>

              {/* Pro Plan - Most Popular */}
              <Card className="border-4 border-purple-400 relative hover:border-purple-500 transition-colors">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-6 py-1">🚀 DESTROYS REPLIT</Badge>
                </div>
                <CardHeader className="text-center pb-8 pt-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl">Pro</CardTitle>
                  <div className="text-4xl font-bold text-purple-600 mt-4">
                    $5<span className="text-lg">/month</span>
                  </div>
                  <p className="text-muted-foreground">vs Replit $20-25/month</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>
                        <strong>Everything in Starter</strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Unlimited private projects</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>ALL AI models (unrestricted)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Unlimited compute & memory</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Unlimited deployments</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>500 GB storage</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Priority support</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
                    Choose Pro - Save $15-20/mo
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    vs Replit $20/mo: Limited credits, basic AI
                  </p>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="border-2 border-gold-200 hover:border-gold-400 transition-colors">
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                  <div className="text-4xl font-bold text-orange-600 mt-4">
                    $15<span className="text-lg">/user/month</span>
                  </div>
                  <p className="text-muted-foreground">vs Replit $40+/user/month</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>
                        <strong>Everything in Pro</strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Team collaboration tools</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Advanced admin controls</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>SSO/SAML integration</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Dedicated support</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Unlimited everything</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-orange-600 hover:bg-orange-700">
                    Contact Sales - Save $25+/user
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    vs Replit $40+/user: Credit limits, restrictions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Savings Calculator */}
            <Card className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Annual Savings Calculator</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Solo Developer</h4>
                    <div className="text-3xl font-bold text-red-600">-$180</div>
                    <div className="text-sm text-muted-foreground">Replit: $240/year</div>
                    <div className="text-sm text-green-600">Stargate: $60/year</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">5-Person Team</h4>
                    <div className="text-3xl font-bold text-red-600">-$1,500</div>
                    <div className="text-sm text-muted-foreground">Replit: $2,400/year</div>
                    <div className="text-sm text-green-600">Stargate: $900/year</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">20-Person Team</h4>
                    <div className="text-3xl font-bold text-red-600">-$6,000</div>
                    <div className="text-sm text-muted-foreground">Replit: $9,600/year</div>
                    <div className="text-sm text-green-600">Stargate: $3,600/year</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Developers Are <span className="text-purple-600">Switching</span> en Masse
              </h2>
              <p className="text-xl text-muted-foreground">
                See why top developers are abandoning Replit for Stargate
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "The multi-agent system is revolutionary. What used to take me hours with
                    Replit's single AI now happens in minutes with Stargate's collaborative agents.
                    Plus I'm saving $200/month!"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold">SH</span>
                    </div>
                    <div>
                      <div className="font-semibold">Sarah Harrison</div>
                      <div className="text-sm text-muted-foreground">
                        Senior Full-Stack Developer
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "Quantum computing integration opened possibilities I never imagined. Our
                    startup can now solve complex optimization problems that were impossible on
                    traditional platforms."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">MC</span>
                    </div>
                    <div>
                      <div className="font-semibold">Marcus Chen</div>
                      <div className="text-sm text-muted-foreground">CTO, TechFlow Startup</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "The unrestricted AI access is a game-changer. No more dealing with censored
                    responses or hitting arbitrary limits. Pure development freedom at a fraction of
                    Replit's cost."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">AR</span>
                    </div>
                    <div>
                      <div className="font-semibold">Alex Rodriguez</div>
                      <div className="text-sm text-muted-foreground">Lead DevOps Engineer</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-blue-600">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to accelerate your development?
            </h2>
            <p className="text-xl text-blue-100 mb-12">
              Join thousands of developers building the future with AI agent collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 text-base font-medium px-8 py-4"
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 text-base font-medium px-8 py-4"
              >
                Contact Sales
              </Button>
            </div>
            <p className="text-sm text-blue-200 mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
