import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Star,
  CheckCircle,
  Zap,
  Shield,
  Brain,
  ArrowRight,
  Play,
  Github,
  Twitter,
  Linkedin,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Wand2,
} from 'lucide-react';
import { useIDE } from '@/hooks/use-ide';
import { LoginSignupModal } from '@/components/Auth/LoginSignupModal';

export function WebPage() {
  const { setState } = useIDE();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setState(prev => ({ ...prev, currentView: 'dashboard' }));
  };

  const handleMerlinWizard = () => {
    setState(prev => ({ ...prev, currentView: 'stargate-websites' }));
  };

  const features = [
    {
      icon: <Wand2 className="w-6 h-6" />,
      title: 'Merlin AI Wizard',
      description: 'Create stunning websites in minutes with our AI-powered wizard. No coding required.',
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Multi-Agent AI',
      description: 'Multiple AI agents collaborate to deliver exceptional results.',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Generate complete websites in under 60 seconds.',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and security for all your projects.',
      color: 'from-emerald-500 to-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-[#030014] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px] transition-transform duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
            top: '-200px',
            right: '-200px',
            transform: `translate(${scrollY * 0.05}px, ${scrollY * 0.05}px)`,
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-25 blur-[100px] transition-transform duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 70%)',
            bottom: '-100px',
            left: '-100px',
            transform: `translate(${scrollY * -0.03}px, ${scrollY * -0.03}px)`,
          }}
        />
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50 ? 'bg-[#030014]/80 backdrop-blur-xl border-b border-white/5' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Stargate
                </span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm text-white/60 hover:text-white transition-colors">Testimonials</a>
              <button 
                onClick={handleGetStarted}
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-6 rounded-full shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 space-y-4">
              <a href="#features" className="block text-white/60 hover:text-white">Features</a>
              <a href="#pricing" className="block text-white/60 hover:text-white">Pricing</a>
              <a href="#testimonials" className="block text-white/60 hover:text-white">Testimonials</a>
              <Button onClick={handleGetStarted} className="w-full bg-violet-600">Get Started</Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-white/70">
              Trusted by 50,000+ developers worldwide
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]">
            <span className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent">
              Build Websites
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              With AI Magic
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            Create stunning, professional websites in minutes. Our Merlin AI Wizard 
            transforms your ideas into beautiful reality. No coding required.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              size="lg"
              onClick={handleMerlinWizard}
              className="group bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-8 py-6 text-lg rounded-full shadow-2xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-105"
            >
              <Wand2 className="w-5 h-5 mr-2" />
              Launch Merlin Wizard
              <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white px-8 py-6 text-lg rounded-full"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-white/40 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Free tier available</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Hero Visual - Floating Cards */}
        <div className="relative mt-20 max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-b from-white/[0.08] to-transparent rounded-3xl border border-white/10 p-2 shadow-2xl">
            <div className="bg-[#0a0a1a] rounded-2xl p-8 min-h-[400px] flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                  <Wand2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">Merlin AI Website Builder</h3>
                <p className="text-white/50 max-w-md mx-auto">
                  Describe your dream website and watch AI create it in real-time. 
                  Professional designs, optimized code, instant deployment.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm">AI Powered</span>
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm">60 Second Build</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm">SEO Optimized</span>
                </div>
              </div>
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl -z-10" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm text-violet-400 font-medium tracking-wider uppercase mb-4 block">
              Why Choose Stargate
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                build faster
              </span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Powerful tools designed to accelerate your development workflow and bring your ideas to life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-6 rounded-2xl border transition-all duration-500 cursor-pointer ${
                  activeFeature === index 
                    ? 'bg-white/[0.08] border-white/20 scale-105' 
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm">{feature.description}</p>
                {activeFeature === index && (
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-cyan-500/5 rounded-2xl" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm text-emerald-400 font-medium tracking-wider uppercase mb-4 block">
              Simple Pricing
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Start free, scale as you{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                grow
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">Starter</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">Free</span>
                  <span className="text-white/50">forever</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {['3 AI-generated websites', 'Basic templates', 'Community support', 'Stargate subdomain'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/70">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full py-6 rounded-xl border-white/20 hover:bg-white/5">
                Get Started Free
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="relative p-8 rounded-3xl bg-gradient-to-b from-violet-500/20 to-purple-500/10 border border-violet-500/30 scale-105 shadow-2xl shadow-violet-500/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-white/50">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {['Unlimited websites', 'Premium templates', 'Priority support', 'Custom domains', 'Analytics dashboard', 'Remove branding'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/70">
                    <CheckCircle className="w-5 h-5 text-violet-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full py-6 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500">
                Start Pro Trial
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {['Everything in Pro', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'On-premise option'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/70">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full py-6 rounded-xl border-white/20 hover:bg-white/5">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm text-amber-400 font-medium tracking-wider uppercase mb-4 block">
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                developers
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Merlin AI built my portfolio site in 2 minutes. The quality is incredible - better than what I could code myself in days.",
                name: "Sarah Chen",
                role: "Full-Stack Developer",
                avatar: "SC",
              },
              {
                quote: "Finally, an AI that understands design. The websites it generates are not just functional but genuinely beautiful.",
                name: "Marcus Williams",
                role: "UX Designer",
                avatar: "MW",
              },
              {
                quote: "We switched from Webflow to Stargate. 10x faster, better results, and our clients are thrilled.",
                name: "Alex Rodriguez",
                role: "Agency Owner",
                avatar: "AR",
              },
            ].map((testimonial, index) => (
              <div key={index} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-white/70 mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-white/50">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to build something{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              amazing?
            </span>
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of developers and creators who are building the future with Stargate.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              onClick={handleMerlinWizard}
              className="group bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-8 py-6 text-lg rounded-full shadow-2xl shadow-violet-500/25"
            >
              <Wand2 className="w-5 h-5 mr-2" />
              Start Building Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 blur-[100px]" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Stargate</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/50">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-white/50 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/50 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/50 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-white/30">
            © 2024 Stargate. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <LoginSignupModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
