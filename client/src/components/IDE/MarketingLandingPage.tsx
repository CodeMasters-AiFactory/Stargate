import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Star,
  CheckCircle,
  Zap,
  Shield,
  Brain,
  Globe,
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

// YouTube API types
declare global {
  interface Window {
    YT: Record<string, unknown>;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function MarketingLandingPage() {
  const { setState } = useIDE();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [_scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = (): void => setScrollY(window.scrollY);
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
    setState(prev => ({ ...prev, currentView: 'stargate-websites' }));
  };

  const handleMerlinWizard = () => {
    // Go directly to website wizard (has built-in package selection)
    setState(prev => ({ ...prev, currentView: 'stargate-websites' as const }));
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

  // YouTube video background with proper looping and 30-second cutoff
  // NOTE: YouTube iframe API may show cross-origin warnings in console.
  // These are harmless browser security warnings and don't affect functionality.
  // We suppress them where possible, but some may still appear due to browser-level logging.
  useEffect(() => {
    // Suppress YouTube API console warnings (runs as early as possible)
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    const suppressYouTubeWarnings = (): void => {
      console.error = (...args: unknown[]): void => {
        const message = args[0]?.toString() || '';
        // Suppress YouTube-specific warnings
        if (
          message.includes('Unrecognized feature:') ||
          message.includes('postMessage') ||
          message.includes('target origin') ||
          message.includes('youtube.com') ||
          message.includes('web-share')
        ) {
          return; // Suppress these warnings
        }
        originalConsoleError.apply(console, args);
      };

      console.warn = (...args: unknown[]): void => {
        const message = args[0]?.toString() || '';
        // Suppress YouTube-specific warnings
        if (
          message.includes('Unrecognized feature:') ||
          message.includes('postMessage') ||
          message.includes('target origin') ||
          message.includes('youtube.com') ||
          message.includes('web-share')
        ) {
          return; // Suppress these warnings
        }
        originalConsoleWarn.apply(console, args);
      };
    };

    suppressYouTubeWarnings();

    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    let player: Record<string, unknown>;
    let checkInterval: NodeJS.Timeout;
    const videoId = 'mSDsLpMogtM';

    // Video segments to play (in seconds): [start, end]
    // Only playing 0-13 seconds as requested
    const VIDEO_SEGMENTS: [number, number][] = [
      [0, 13],           // 0-13 seconds only (loops)
    ];

    let currentSegmentIndex = 0;
    let segmentCheckInterval: NodeJS.Timeout;

    const playNextSegment = (event: Record<string, unknown>): void => {
      try {
        if (currentSegmentIndex >= VIDEO_SEGMENTS.length) {
          // Loop back to first segment
          currentSegmentIndex = 0;
        }

        const [startTime, endTime] = VIDEO_SEGMENTS[currentSegmentIndex];
        console.log(`Playing segment ${currentSegmentIndex + 1}/${VIDEO_SEGMENTS.length}: ${startTime}s - ${endTime}s`);

        // Seek to start of segment
        const target = event.target as Record<string, ((...args: unknown[]) => unknown) | unknown>;
        (target.seekTo as (time: number, allowSeekAhead: boolean) => void)(startTime, true);
        (target.playVideo as () => void)();

        // Check if we've reached the end of this segment
        segmentCheckInterval = setInterval(() => {
          try {
            const currentTime = (target.getCurrentTime as () => number)();
            if (currentTime >= endTime) {
              // Move to next segment
              currentSegmentIndex++;
              clearInterval(segmentCheckInterval);
              playNextSegment(event);
            }
          } catch (_error: unknown) {
            // Silently handle timing errors
          }
        }, 100); // Check every 100ms for smooth transitions
      } catch (_error: unknown) {
        // Silently handle segment errors
      }
    };

    const initializePlayer = (): void => {
      if (!window.YT || !(window.YT as Record<string, unknown>).Player) return;

      try {
        const YTPlayer = (window.YT as Record<string, unknown>).Player as new (
          element: string,
          config: Record<string, unknown>
        ) => Record<string, unknown>;

        player = new YTPlayer('youtube-background', {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            mute: 1,
            loop: 0, // We'll handle looping manually
            controls: 0,
            showinfo: 0,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            start: VIDEO_SEGMENTS[0][0], // Start at first segment
            enablejsapi: 1,
            origin: window.location.origin, // Set origin to prevent postMessage warnings
          },
          events: {
            onReady: (event: Record<string, unknown>) => {
              try {
                // Wait for video to load, then start playing segments
                setTimeout(() => {
                  playNextSegment(event);
                }, 1000);
              } catch (_error: unknown) {
                // Silently handle player ready errors
              }
            },
            onStateChange: (event: Record<string, unknown>) => {
              try {
                const PlayerState = (window.YT as Record<string, unknown>).PlayerState as Record<string, unknown>;
                const target = event.target as Record<string, ((...args: unknown[]) => unknown) | unknown>;
                // Keep video playing if paused
                if (event.data === PlayerState.PAUSED) {
                  (target.playVideo as () => void)();
                }
                // If video ends, restart from first segment
                if (event.data === PlayerState.ENDED) {
                  currentSegmentIndex = 0;
                  playNextSegment(event);
                }
              } catch (_error: unknown) {
                // Silently handle state change errors
              }
            },
            onError: (event: Record<string, unknown>) => {
              // Only log actual errors, not warnings
              if (event.data !== 150 && event.data !== 101) {
                originalConsoleError('YouTube player error:', event.data);
              }
            },
          },
        });
      } catch (_error: unknown) {
        // Silently handle initialization errors
      }
    };

    window.onYouTubeIframeAPIReady = initializePlayer;

    // If API is already loaded
    if (window.YT && (window.YT as Record<string, unknown>).Player) {
      setTimeout(initializePlayer, 100);
    }

    return () => {
      // Restore original console methods
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;

      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (segmentCheckInterval) {
        clearInterval(segmentCheckInterval);
      }
      if (player) {
        try {
          (player.destroy as () => void)();
        } catch (_error: unknown) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden antialiased">
      {/* YouTube Video Background - Now only in hero section, placeholder here for API loading */}
      <div id="youtube-background-container" className="hidden" />

      {/* Navigation - FIXED AT TOP - Must be outside any relative/transform containers */}
      <nav 
        className="fixed top-0 left-0 right-0 z-[9999] bg-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-lg"
        style={{ position: 'fixed' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo on LEFT */}
            <div className="flex items-center">
              <img 
                src="/images/stargate-logo.png" 
                alt="Stargate" 
                className="h-14 md:h-16 lg:h-20 w-auto object-contain"
              />
            </div>

            {/* Desktop Nav on RIGHT */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Services Dropdown */}
              <div className="relative group">
                <button className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1">
                  Services
                  <ChevronRight className="w-4 h-4 rotate-90 group-hover:rotate-[270deg] transition-transform" />
                </button>
                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                  <div className="bg-slate-800 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden max-h-[80vh] overflow-y-auto">
                    <div className="p-2">
                      {/* Active Services */}
                      <div className="px-3 py-2 text-xs text-emerald-400 font-medium uppercase tracking-wider">Active Services</div>
                      <a href="#" onClick={(e) => { e.preventDefault(); handleMerlinWizard(); }} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-violet-500/20 hover:shadow-lg hover:shadow-violet-500/20 transition-all group/item">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover/item:shadow-violet-500/50 transition-shadow">
                          <Wand2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Merlin Website Wizard</div>
                          <div className="text-xs text-white/50">AI website builder in 60 seconds</div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
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
            <div className="md:hidden pt-4 pb-2 space-y-2 bg-slate-800 rounded-xl mt-2 p-4">
              <div className="text-xs text-emerald-400 font-medium uppercase mb-2">Services</div>
              <a href="#" onClick={(e) => { e.preventDefault(); handleMerlinWizard(); setMobileMenuOpen(false); }} className="flex items-center gap-3 py-2">
                <Wand2 className="w-5 h-5 text-violet-400" />
                <span className="text-white/80">Merlin Website Wizard</span>
              </a>
              <div className="border-t border-white/10 my-3"></div>
              <a href="#features" className="block text-white/60 hover:text-white py-2">Features</a>
              <a href="#pricing" className="block text-white/60 hover:text-white py-2">Pricing</a>
              <a href="#testimonials" className="block text-white/60 hover:text-white py-2">Testimonials</a>
              <Button onClick={handleGetStarted} className="w-full bg-violet-600 mt-3">Get Started</Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Contains the video background */}
      <section className="relative pt-16 pb-16 px-6 min-h-[90vh] overflow-hidden">
        {/* Video Background - Only in hero section */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div
            id="youtube-background"
            className="absolute inset-0 w-full h-full"
            style={{
              pointerEvents: 'none',
              transform: 'scale(1.2)', // Zoom to fill and avoid black borders
              filter: 'brightness(0.6)',
            }}
          />
          {/* Overlay for text readability */}
          <div
            className="absolute inset-0 bg-slate-900/40"
            style={{
              background: 'linear-gradient(to bottom, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.2) 50%, rgba(15,23,42,0.6) 100%)',
            }}
          />
          {/* Subtle gradient overlay for depth */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,119,198,0.15), transparent)',
            }}
          />
        </div>
        {/* Hero content - above video */}
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-white/[0.08] to-white/[0.03] border border-white/[0.08] mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />
            <span className="text-sm font-medium text-white/80 tracking-wide">
              Trusted by 50,000+ developers worldwide
            </span>
          </div>

          {/* Main Headline - Enhanced with better gradients */}
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight mb-6 leading-[1.05]">
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, rgba(255,255,255,0.7) 100%)',
              }}
            >
              Merlin Website Wizard
            </span>
            <br />
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 25%, #e879f9 50%, #22d3ee 75%, #06b6d4 100%)',
                backgroundSize: '200% 200%',
              }}
            >
              The Best Website Builder on the Planet
            </span>
          </h1>

          {/* Subheadline - Better typography */}
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed font-normal tracking-wide">
            Create stunning, professional websites in under 60 seconds. Just describe what you want and watch the magic happen.
            No coding required - Merlin AI handles everything for you.
          </p>

          {/* CTA Buttons - Smoother with better shadows */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Button 
              size="lg"
              onClick={handleMerlinWizard}
              className="group relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 hover:from-violet-500 hover:via-purple-500 hover:to-violet-500 text-white px-8 py-6 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-[1.02]"
              style={{
                boxShadow: '0 0 40px rgba(139,92,246,0.3), 0 0 80px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <Wand2 className="w-5 h-5 mr-2" />
              Launch Merlin Wizard
              <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="bg-white/[0.03] border border-white/[0.1] hover:bg-white/[0.08] hover:border-white/[0.15] text-white px-8 py-6 text-lg font-medium rounded-full backdrop-blur-sm transition-all duration-200"
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
      </section>

      {/* Services Section - Merlin Website Wizard */}
      <section id="services" className="py-20 px-6 relative overflow-hidden min-h-[600px]">
        {/* Merlin Background Image - Highly visible */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/merlin-wizard.jpg)',
            opacity: 0.6,
          }}
        />
        {/* Subtle dark overlay for text readability */}
        <div className="absolute inset-0 bg-slate-900/40" />
        {/* Purple/violet magical glow effect - lighter */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/20 via-transparent to-violet-900/20" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="text-sm text-violet-400 font-medium tracking-wider uppercase mb-4 block">
              AI Website Builder
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Create Stunning Websites with{' '}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Merlin AI
              </span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Build professional websites in minutes using our AI-powered wizard. No coding required.
            </p>
          </div>

          <div className="flex justify-center">
            {/* Merlin Website Wizard - Featured Card */}
            <div className="group relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-violet-950/60 to-slate-900/80 border-2 border-violet-500/50 hover:border-violet-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_80px_rgba(139,92,246,0.5)] cursor-pointer overflow-hidden max-w-xl w-full">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" style={{boxShadow: 'inset 0 0 50px rgba(139,92,246,0.3)'}} />

              <div className="relative text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(139,92,246,0.6)] group-hover:shadow-[0_0_60px_rgba(139,92,246,0.8)] group-hover:scale-110 transition-all">
                  <Wand2 className="w-10 h-10 text-white" />
                </div>

                <h3 className="relative text-3xl font-bold mb-3 text-white group-hover:text-violet-200">Merlin Website Wizard</h3>
                <p className="relative text-white/60 text-lg mb-6 leading-relaxed max-w-md mx-auto">
                  Create stunning, professional websites in minutes using AI. No coding required - just describe what you want.
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <div className="flex items-center gap-2 text-sm text-violet-300 bg-violet-500/10 px-4 py-2 rounded-full">
                    <CheckCircle className="w-4 h-4 text-violet-400" />
                    <span>60-second generation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-violet-300 bg-violet-500/10 px-4 py-2 rounded-full">
                    <CheckCircle className="w-4 h-4 text-violet-400" />
                    <span>7,000+ templates</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-violet-300 bg-violet-500/10 px-4 py-2 rounded-full">
                    <CheckCircle className="w-4 h-4 text-violet-400" />
                    <span>AI-powered design</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-violet-300 bg-violet-500/10 px-4 py-2 rounded-full">
                    <CheckCircle className="w-4 h-4 text-violet-400" />
                    <span>One-click publish</span>
                  </div>
                </div>

                <Button
                  onClick={handleMerlinWizard}
                  size="lg"
                  className="relative bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 text-lg px-10 py-6"
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  Launch Merlin Wizard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
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

      {/* Pricing Section - Leonardo.ai Style */}
      <section id="pricing" className="py-20 px-6 relative bg-slate-950">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Unlock the power of{' '}
              <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                Merlin.Ai
              </span>
            </h2>
            <p className="text-white/60 text-lg">
              One subscription, all platforms
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center bg-slate-800/50 rounded-full p-1 border border-white/10">
              <button className="px-6 py-2.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-sm font-medium flex items-center gap-2">
                Pay Yearly
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">Up to 20% off</span>
              </button>
              <button className="px-6 py-2.5 rounded-full text-white/60 text-sm font-medium hover:text-white transition-colors">
                Pay Monthly
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
            {/* Free Tier */}
            <div className="relative p-6 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-white/20 transition-all">
              <h3 className="text-xl font-bold mb-4 text-white">Free</h3>
              <div className="mb-2">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-white/50 text-sm">/month</span>
              </div>
              <p className="text-white/50 text-sm mb-6">Forever</p>

              <div className="text-fuchsia-400 text-sm font-medium mb-3">Perfect for</div>
              <p className="text-white/60 text-sm mb-6">Casual creators who want to explore AI websites</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">1 Website generation daily</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">All websites are public</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">Basic templates only</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">Community AI models</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">1 active project</span>
                </div>
              </div>

              <Button variant="outline" className="w-full rounded-lg border-white/20 hover:bg-white/5 text-white" onClick={handleGetStarted}>
                Subscribe
              </Button>
            </div>

            {/* Starter Tier */}
            <div className="relative p-6 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-white/20 transition-all">
              <h3 className="text-xl font-bold mb-4 text-fuchsia-400">Starter</h3>
              <div className="mb-2">
                <span className="text-white/40 line-through text-lg mr-2">$15</span>
                <span className="text-4xl font-bold text-white">$12</span>
                <span className="text-white/50 text-sm">/month</span>
              </div>
              <p className="text-white/50 text-sm mb-6">ex. tax</p>

              <div className="text-fuchsia-400 text-sm font-medium mb-3">Perfect for</div>
              <p className="text-white/60 text-sm mb-6">Hobbyists and enthusiasts who create regularly</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">10 Website generations monthly</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">Private websites - only you see</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">500+ premium templates</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">Custom domain connection</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">5 active projects</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">Email support</span>
                </div>
              </div>

              <Button variant="outline" className="w-full rounded-lg border-white/20 hover:bg-white/5 text-white" onClick={handleGetStarted}>
                Subscribe
              </Button>
            </div>

            {/* Creator Tier - Best Offer */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-b from-fuchsia-950/50 to-slate-900/80 border-2 border-fuchsia-500/50 shadow-xl shadow-fuchsia-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-xs font-bold text-white">
                  Best offer
                </span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-fuchsia-400">Creator</h3>
              <div className="mb-2">
                <span className="text-white/40 line-through text-lg mr-2">$35</span>
                <span className="text-4xl font-bold text-white">$28</span>
                <span className="text-white/50 text-sm">/month</span>
              </div>
              <p className="text-white/50 text-sm mb-6">ex. tax</p>

              <div className="text-fuchsia-400 text-sm font-medium mb-3">Perfect for</div>
              <p className="text-white/60 text-sm mb-6">Professional creators, small businesses, and content producers</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  <span className="text-white/70">50 Website generations monthly</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  <span className="text-white/70">Unlimited revisions & edits</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  <span className="text-white/70">All 7,000+ templates</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  <span className="text-white/70">Premium AI models</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  <span className="text-white/70">25 active projects</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  <span className="text-white/70">SEO optimization tools</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  <span className="text-white/70">Priority support</span>
                </div>
              </div>

              <Button className="w-full rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white" onClick={handleGetStarted}>
                Subscribe
              </Button>
            </div>

            {/* Professional Tier */}
            <div className="relative p-6 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-white/20 transition-all">
              <h3 className="text-xl font-bold mb-4 text-fuchsia-400">Professional</h3>
              <div className="mb-2">
                <span className="text-white/40 line-through text-lg mr-2">$70</span>
                <span className="text-4xl font-bold text-white">$56</span>
                <span className="text-white/50 text-sm">/month</span>
              </div>
              <p className="text-white/50 text-sm mb-6">ex. tax</p>

              <div className="text-fuchsia-400 text-sm font-medium mb-3">Perfect for</div>
              <p className="text-white/60 text-sm mb-6">Professional creators, agencies, and businesses</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">150 Website generations monthly</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">Unlimited AI-powered edits</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">White-label exports</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">All AI models + priority queue</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">100 active projects</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">Advanced analytics</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70">API access</span>
                </div>
              </div>

              <Button variant="outline" className="w-full rounded-lg border-white/20 hover:bg-white/5 text-white" onClick={handleGetStarted}>
                Subscribe
              </Button>
            </div>

            {/* Teams Tier */}
            <div className="relative p-6 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-white/20 transition-all">
              <h3 className="text-xl font-bold mb-4 text-fuchsia-400">Merlin for Teams</h3>
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>

              <div className="text-fuchsia-400 text-sm font-medium mb-3">Perfect for</div>
              <p className="text-white/60 text-sm mb-6">Design teams, studios, agencies, and businesses</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  <span className="text-white/70">Shared generation pool</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  <span className="text-white/70">Unlimited for all members</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  <span className="text-white/70">Shared project library</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  <span className="text-white/70">Priority customer support</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  <span className="text-white/70">Enterprise security & SSO</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  <span className="text-white/70">Team collections & workspaces</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  <span className="text-white/70">Centralized billing</span>
                </div>
              </div>

              <Button variant="outline" className="w-full rounded-lg border-white/20 hover:bg-white/5 text-white" onClick={handleGetStarted}>
                Get Started Now
              </Button>
            </div>
          </div>

          {/* Compare All Benefits Table */}
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-2xl font-bold text-white">Compare all benefits</h3>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 p-4 bg-slate-800/50 border-b border-white/10">
              <div className="col-span-1"></div>
              <div className="text-center">
                <div className="font-semibold text-white/80">Free</div>
                <Button variant="outline" size="sm" className="mt-2 text-xs border-white/20 hover:bg-white/5" onClick={handleGetStarted}>Subscribe</Button>
              </div>
              <div className="text-center">
                <div className="font-semibold text-fuchsia-400">Starter</div>
                <Button variant="outline" size="sm" className="mt-2 text-xs border-white/20 hover:bg-white/5" onClick={handleGetStarted}>Subscribe</Button>
              </div>
              <div className="text-center relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <span className="px-2 py-0.5 rounded-full bg-fuchsia-500 text-[10px] font-bold text-white">Best offer</span>
                </div>
                <div className="font-semibold text-fuchsia-400">Creator</div>
                <Button size="sm" className="mt-2 text-xs bg-fuchsia-600 hover:bg-fuchsia-500" onClick={handleGetStarted}>Subscribe</Button>
              </div>
              <div className="text-center">
                <div className="font-semibold text-fuchsia-400">Professional</div>
                <Button variant="outline" size="sm" className="mt-2 text-xs border-white/20 hover:bg-white/5" onClick={handleGetStarted}>Subscribe</Button>
              </div>
              <div className="text-center">
                <div className="font-semibold text-fuchsia-400">Teams Plan</div>
                <Button variant="outline" size="sm" className="mt-2 text-xs border-white/20 hover:bg-white/5" onClick={handleGetStarted}>Get started</Button>
              </div>
            </div>

            {/* Generation Power Section */}
            <div className="border-b border-white/10">
              <div className="flex items-center gap-2 p-4 bg-slate-800/30">
                <Sparkles className="w-5 h-5 text-fuchsia-400" />
                <span className="font-semibold text-white">Generation Power</span>
              </div>

              {/* Website Generations */}
              <div className="grid grid-cols-6 gap-4 p-4 border-t border-white/5 hover:bg-white/[0.02]">
                <div className="text-white/60 text-sm">Website Generations</div>
                <div className="text-center text-white/70 text-sm">1 Daily</div>
                <div className="text-center text-white/70 text-sm">10 Monthly</div>
                <div className="text-center text-white/70 text-sm">50 Monthly</div>
                <div className="text-center text-white/70 text-sm">150 Monthly</div>
                <div className="text-center text-white/70 text-sm">Shared Pool</div>
              </div>

              {/* Generation Rollover */}
              <div className="grid grid-cols-6 gap-4 p-4 border-t border-white/5 hover:bg-white/[0.02]">
                <div className="text-white/60 text-sm">Unused Rollover</div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center text-white/70 text-sm">Up to 20</div>
                <div className="text-center text-white/70 text-sm">Up to 100</div>
                <div className="text-center text-white/70 text-sm">Up to 300</div>
                <div className="text-center text-white/70 text-sm">Shared Bank</div>
              </div>

              {/* Concurrent Generations */}
              <div className="grid grid-cols-6 gap-4 p-4 border-t border-white/5 hover:bg-white/[0.02]">
                <div className="text-white/60 text-sm">Concurrent Generations</div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center text-white/70 text-sm">2 at once</div>
                <div className="text-center text-white/70 text-sm">3 at once</div>
                <div className="text-center text-white/70 text-sm">6 at once</div>
                <div className="text-center text-white/70 text-sm">6 at once</div>
              </div>

              {/* Priority Queue */}
              <div className="grid grid-cols-6 gap-4 p-4 border-t border-white/5 hover:bg-white/[0.02]">
                <div className="text-white/60 text-sm">Priority Queue</div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center"><CheckCircle className="w-4 h-4 text-fuchsia-400 mx-auto" /></div>
                <div className="text-center"><CheckCircle className="w-4 h-4 text-fuchsia-400 mx-auto" /></div>
                <div className="text-center"><CheckCircle className="w-4 h-4 text-fuchsia-400 mx-auto" /></div>
              </div>
            </div>

            {/* Creative Features Section */}
            <div className="border-b border-white/10">
              <div className="flex items-center gap-2 p-4 bg-slate-800/30">
                <Wand2 className="w-5 h-5 text-fuchsia-400" />
                <span className="font-semibold text-white">Creative Features</span>
              </div>

              {/* Templates Access */}
              <div className="grid grid-cols-6 gap-4 p-4 border-t border-white/5 hover:bg-white/[0.02]">
                <div className="text-white/60 text-sm">Template Library</div>
                <div className="text-center text-white/70 text-sm">Basic Only</div>
                <div className="text-center text-white/70 text-sm">500+</div>
                <div className="text-center text-white/70 text-sm">7,000+</div>
                <div className="text-center text-white/70 text-sm">7,000+</div>
                <div className="text-center text-white/70 text-sm">7,000+</div>
              </div>

              {/* AI Models */}
              <div className="grid grid-cols-6 gap-4 p-4 border-t border-white/5 hover:bg-white/[0.02]">
                <div className="text-white/60 text-sm">AI Models</div>
                <div className="text-center text-white/70 text-sm">Community</div>
                <div className="text-center text-white/70 text-sm">Standard</div>
                <div className="text-center text-white/70 text-sm">Premium</div>
                <div className="text-center text-white/70 text-sm">All + Priority</div>
                <div className="text-center text-white/70 text-sm">All + Priority</div>
              </div>

              {/* Custom Domains */}
              <div className="grid grid-cols-6 gap-4 p-4 border-t border-white/5 hover:bg-white/[0.02]">
                <div className="text-white/60 text-sm">Custom Domains</div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center"><CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /></div>
                <div className="text-center"><CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /></div>
                <div className="text-center"><CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /></div>
                <div className="text-center"><CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /></div>
              </div>

              {/* White Label */}
              <div className="grid grid-cols-6 gap-4 p-4 border-t border-white/5 hover:bg-white/[0.02]">
                <div className="text-white/60 text-sm">White-label Export</div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center"><CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /></div>
                <div className="text-center"><CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /></div>
              </div>

              {/* SEO Tools */}
              <div className="grid grid-cols-6 gap-4 p-4 border-t border-white/5 hover:bg-white/[0.02]">
                <div className="text-white/60 text-sm">SEO Optimization</div>
                <div className="text-center text-white/70 text-sm">Basic</div>
                <div className="text-center text-white/70 text-sm">Standard</div>
                <div className="text-center"><CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /></div>
                <div className="text-center"><CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /></div>
                <div className="text-center"><CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /></div>
              </div>
            </div>

            {/* Workflow & Management Section */}
            <div>
              <div className="flex items-center gap-2 p-4 bg-slate-800/30">
                <Globe className="w-5 h-5 text-fuchsia-400" />
                <span className="font-semibold text-white">Workflow & Management</span>
              </div>

              {/* Active Projects */}
              <div className="grid grid-cols-6 gap-4 p-4 border-t border-white/5 hover:bg-white/[0.02]">
                <div className="text-white/60 text-sm">Active Projects</div>
                <div className="text-center text-white/70 text-sm">1</div>
                <div className="text-center text-white/70 text-sm">5</div>
                <div className="text-center text-white/70 text-sm">25</div>
                <div className="text-center text-white/70 text-sm">100</div>
                <div className="text-center text-white/70 text-sm">Unlimited</div>
              </div>

              {/* Team Members */}
              <div className="grid grid-cols-6 gap-4 p-4 border-t border-white/5 hover:bg-white/[0.02]">
                <div className="text-white/60 text-sm">Team Members</div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center text-white/70 text-sm">Unlimited</div>
              </div>

              {/* API Access */}
              <div className="grid grid-cols-6 gap-4 p-4 border-t border-white/5 hover:bg-white/[0.02]">
                <div className="text-white/60 text-sm">API Access</div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center"><CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /></div>
                <div className="text-center"><CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /></div>
              </div>

              {/* Support */}
              <div className="grid grid-cols-6 gap-4 p-4 border-t border-white/5 hover:bg-white/[0.02]">
                <div className="text-white/60 text-sm">Support Level</div>
                <div className="text-center text-white/70 text-sm">Community</div>
                <div className="text-center text-white/70 text-sm">Email</div>
                <div className="text-center text-white/70 text-sm">Priority</div>
                <div className="text-center text-white/70 text-sm">Priority</div>
                <div className="text-center text-white/70 text-sm">Dedicated</div>
              </div>

              {/* SSO */}
              <div className="grid grid-cols-6 gap-4 p-4 border-t border-white/5 hover:bg-white/[0.02]">
                <div className="text-white/60 text-sm">Enterprise SSO</div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center"><X className="w-4 h-4 text-white/20 mx-auto" /></div>
                <div className="text-center"><CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /></div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-6 bg-slate-900/50 border border-white/10 rounded-xl">
            <p className="text-white/40 text-sm">
              * Unused generations from monthly allocation may roll over based on plan limits. Generation concurrency and queuing may be adjusted based on demand to ensure fair access for all users. All plans include SSL certificates, CDN delivery, and 99.9% uptime guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
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
            ].map((testimonial, _index) => (
              <div key={_index} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
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
      <section className="py-16 px-6 relative">
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
            <div className="flex items-center">
              <span className="font-semibold bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Complete AI Development System</span>
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
            © 2024 Complete AI Development System. All rights reserved.
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
