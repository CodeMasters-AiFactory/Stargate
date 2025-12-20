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
  Atom,
  Route,
  Ticket,
  Headphones,
  Store,
} from 'lucide-react';
import { useIDE } from '@/hooks/use-ide';
import { LoginSignupModal } from '@/components/Auth/LoginSignupModal';

// YouTube API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function MarketingLandingPage() {
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
    
    const suppressYouTubeWarnings = () => {
      console.error = (...args: any[]) => {
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

      console.warn = (...args: any[]) => {
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

    let player: any;
    let checkInterval: NodeJS.Timeout;
    const videoId = 'mSDsLpMogtM';
    
    // Video segments to play (in seconds): [start, end]
    // Only playing 0-13 seconds as requested
    const VIDEO_SEGMENTS: [number, number][] = [
      [0, 13],           // 0-13 seconds only (loops)
    ];
    
    let currentSegmentIndex = 0;
    let segmentCheckInterval: NodeJS.Timeout;

    const playNextSegment = (event: any) => {
      try {
        if (currentSegmentIndex >= VIDEO_SEGMENTS.length) {
          // Loop back to first segment
          currentSegmentIndex = 0;
        }
        
        const [startTime, endTime] = VIDEO_SEGMENTS[currentSegmentIndex];
        console.log(`Playing segment ${currentSegmentIndex + 1}/${VIDEO_SEGMENTS.length}: ${startTime}s - ${endTime}s`);
        
        // Seek to start of segment
        event.target.seekTo(startTime, true);
        event.target.playVideo();
        
        // Check if we've reached the end of this segment
        segmentCheckInterval = setInterval(() => {
          try {
            const currentTime = event.target.getCurrentTime();
            if (currentTime >= endTime) {
              // Move to next segment
              currentSegmentIndex++;
              clearInterval(segmentCheckInterval);
              playNextSegment(event);
            }
          } catch (e) {
            // Silently handle timing errors
          }
        }, 100); // Check every 100ms for smooth transitions
      } catch (e) {
        // Silently handle segment errors
      }
    };

    const initializePlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      try {
        player = new window.YT.Player('youtube-background', {
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
            onReady: (event: any) => {
              try {
                // Wait for video to load, then start playing segments
                setTimeout(() => {
                  playNextSegment(event);
                }, 1000);
              } catch (e) {
                // Silently handle player ready errors
              }
            },
            onStateChange: (event: any) => {
              try {
                // Keep video playing if paused
                if (event.data === window.YT.PlayerState.PAUSED) {
                  event.target.playVideo();
                }
                // If video ends, restart from first segment
                if (event.data === window.YT.PlayerState.ENDED) {
                  currentSegmentIndex = 0;
                  playNextSegment(event);
                }
              } catch (e) {
                // Silently handle state change errors
              }
            },
            onError: (event: any) => {
              // Only log actual errors, not warnings
              if (event.data !== 150 && event.data !== 101) {
                originalConsoleError('YouTube player error:', event.data);
              }
            },
          },
        });
      } catch (e) {
        // Silently handle initialization errors
      }
    };

    window.onYouTubeIframeAPIReady = initializePlayer;

    // If API is already loaded
    if (window.YT && window.YT.Player) {
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
          player.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#030014] text-white overflow-x-hidden antialiased relative">
      {/* YouTube Video Background - Now only in hero section, placeholder here for API loading */}
      <div id="youtube-background-container" className="hidden" />

      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50 ? 'bg-[#030014]/90 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-sm text-white/60 hover:text-white transition-colors">Services</a>
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
              <a href="#services" className="block text-white/60 hover:text-white">Services</a>
              <a href="#features" className="block text-white/60 hover:text-white">Features</a>
              <a href="#pricing" className="block text-white/60 hover:text-white">Pricing</a>
              <a href="#testimonials" className="block text-white/60 hover:text-white">Testimonials</a>
              <Button onClick={handleGetStarted} className="w-full bg-violet-600">Get Started</Button>
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
            className="absolute inset-0 bg-[#030014]/40"
            style={{
              background: 'linear-gradient(to bottom, rgba(3,0,20,0.3) 0%, rgba(3,0,20,0.2) 50%, rgba(3,0,20,0.6) 100%)',
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
              Complete AI Ecosystem
            </span>
            <br />
            <span 
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 25%, #e879f9 50%, #22d3ee 75%, #06b6d4 100%)',
                backgroundSize: '200% 200%',
              }}
            >
              For Modern Development
            </span>
          </h1>

          {/* Subheadline - Better typography */}
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed font-normal tracking-wide">
            Stargate provides cutting-edge AI-powered solutions across multiple platforms. From website creation with Merlin, 
            to advanced development with Stargate IDE, to revolutionary AI systems - experience the complete ecosystem of intelligent tools.
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

      {/* Services Section - All Stargate Services */}
      <section id="services" className="py-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm text-violet-400 font-medium tracking-wider uppercase mb-4 block">
              Our Services
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Complete{' '}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Stargate Ecosystem
              </span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Discover the full suite of Stargate services designed to transform your digital presence and development workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {/* Merlin Website Wizard */}
            <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-blue-950/80 to-slate-900/90 border-2 border-cyan-500/40 hover:border-cyan-400 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] cursor-pointer">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                  Active
                </span>
              </div>
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-400/50 group-hover:scale-110 transition-all">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="relative text-lg font-bold mb-2 text-white group-hover:text-cyan-100">Merlin Website Wizard</h3>
              <p className="relative text-white/60 text-sm mb-4 leading-relaxed">
                AI-powered website builder. Create stunning sites in minutes.
              </p>
              <ul className="relative space-y-1.5 mb-4">
                <li className="flex items-center gap-2 text-xs text-cyan-300/80">
                  <CheckCircle className="w-3 h-3 text-cyan-400" />
                  <span>60-second generation</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-cyan-300/80">
                  <CheckCircle className="w-3 h-3 text-cyan-400" />
                  <span>1000+ templates</span>
                </li>
              </ul>
              <Button
                onClick={handleMerlinWizard}
                className="relative w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-sm py-2"
              >
                Launch Wizard
              </Button>
            </div>

            {/* Stargate IDE */}
            <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-blue-950/80 to-slate-900/90 border-2 border-cyan-500/40 hover:border-cyan-400 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] cursor-pointer">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-medium border border-cyan-500/30">
                  Admin
                </span>
              </div>
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 group-hover:shadow-cyan-400/50 group-hover:scale-110 transition-all">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="relative text-lg font-bold mb-2 text-white group-hover:text-cyan-100">Stargate IDE</h3>
              <p className="relative text-white/60 text-sm mb-4 leading-relaxed">
                Advanced AI Development Platform with full IDE capabilities.
              </p>
              <ul className="relative space-y-1.5 mb-4">
                <li className="flex items-center gap-2 text-xs text-cyan-300/80">
                  <CheckCircle className="w-3 h-3 text-cyan-400" />
                  <span>AI code generation</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-cyan-300/80">
                  <CheckCircle className="w-3 h-3 text-cyan-400" />
                  <span>Full dev environment</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="relative w-full border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 text-sm py-2"
              >
                Access IDE
              </Button>
            </div>

            {/* PANDORA */}
            <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-blue-950/80 to-slate-900/90 border-2 border-blue-500/30 hover:border-cyan-400 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] cursor-pointer">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30">
                  Soon
                </span>
              </div>
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 group-hover:shadow-cyan-400/50 group-hover:scale-110 transition-all opacity-80">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="relative text-lg font-bold mb-2 text-white group-hover:text-cyan-100">PANDORA</h3>
              <p className="relative text-white/60 text-sm mb-4 leading-relaxed">
                Multi-AI collaboration platform for advanced problem-solving.
              </p>
              <ul className="relative space-y-1.5 mb-4">
                <li className="flex items-center gap-2 text-xs text-blue-300/70">
                  <Star className="w-3 h-3 text-blue-400" />
                  <span>Multi-AI collaboration</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-blue-300/70">
                  <Star className="w-3 h-3 text-blue-400" />
                  <span>AI orchestration</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="relative w-full border-blue-500/30 text-blue-400/70 cursor-not-allowed text-sm py-2"
                disabled
              >
                Coming Soon
              </Button>
            </div>

            {/* Quantum Core */}
            <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-blue-950/80 to-slate-900/90 border-2 border-blue-500/30 hover:border-cyan-400 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] cursor-pointer">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30">
                  Soon
                </span>
              </div>
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-teal-500/30 group-hover:shadow-cyan-400/50 group-hover:scale-110 transition-all opacity-80">
                <Atom className="w-6 h-6 text-white" />
              </div>
              <h3 className="relative text-lg font-bold mb-2 text-white group-hover:text-cyan-100">Quantum Core</h3>
              <p className="relative text-white/60 text-sm mb-4 leading-relaxed">
                Quantum investigations and intelligent decision-making.
              </p>
              <ul className="relative space-y-1.5 mb-4">
                <li className="flex items-center gap-2 text-xs text-blue-300/70">
                  <Star className="w-3 h-3 text-blue-400" />
                  <span>Quantum investigations</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-blue-300/70">
                  <Star className="w-3 h-3 text-blue-400" />
                  <span>Pattern analysis</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="relative w-full border-blue-500/30 text-blue-400/70 cursor-not-allowed text-sm py-2"
                disabled
              >
                Coming Soon
              </Button>
            </div>

            {/* Regis Core */}
            <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-blue-950/80 to-slate-900/90 border-2 border-blue-500/30 hover:border-cyan-400 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] cursor-pointer">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30">
                  Soon
                </span>
              </div>
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-sky-500/30 group-hover:shadow-cyan-400/50 group-hover:scale-110 transition-all opacity-80">
                <Route className="w-6 h-6 text-white" />
              </div>
              <h3 className="relative text-lg font-bold mb-2 text-white group-hover:text-cyan-100">Regis Core</h3>
              <p className="relative text-white/60 text-sm mb-4 leading-relaxed">
                AI routing and cost optimization for maximum efficiency.
              </p>
              <ul className="relative space-y-1.5 mb-4">
                <li className="flex items-center gap-2 text-xs text-blue-300/70">
                  <Star className="w-3 h-3 text-blue-400" />
                  <span>Intelligent routing</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-blue-300/70">
                  <Star className="w-3 h-3 text-blue-400" />
                  <span>Cost optimization</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="relative w-full border-blue-500/30 text-blue-400/70 cursor-not-allowed text-sm py-2"
                disabled
              >
                Coming Soon
              </Button>
            </div>

            {/* Nero Core */}
            <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-blue-950/80 to-slate-900/90 border-2 border-blue-500/30 hover:border-cyan-400 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] cursor-pointer">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30">
                  Soon
                </span>
              </div>
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30 group-hover:shadow-cyan-400/50 group-hover:scale-110 transition-all opacity-80">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="relative text-lg font-bold mb-2 text-white group-hover:text-cyan-100">Nero Core</h3>
              <p className="relative text-white/60 text-sm mb-4 leading-relaxed">
                AI firewall and security with intelligent threat protection.
              </p>
              <ul className="relative space-y-1.5 mb-4">
                <li className="flex items-center gap-2 text-xs text-blue-300/70">
                  <Star className="w-3 h-3 text-blue-400" />
                  <span>AI-powered firewall</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-blue-300/70">
                  <Star className="w-3 h-3 text-blue-400" />
                  <span>Threat protection</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="relative w-full border-blue-500/30 text-blue-400/70 cursor-not-allowed text-sm py-2"
                disabled
              >
                Coming Soon
              </Button>
            </div>

            {/* Titan Ticket Master */}
            <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-blue-950/80 to-slate-900/90 border-2 border-blue-500/30 hover:border-cyan-400 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] cursor-pointer">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30">
                  Soon
                </span>
              </div>
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/30 group-hover:shadow-cyan-400/50 group-hover:scale-110 transition-all opacity-80">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <h3 className="relative text-lg font-bold mb-2 text-white group-hover:text-cyan-100">Titan Ticket Master</h3>
              <p className="relative text-white/60 text-sm mb-4 leading-relaxed">
                Enterprise ticket management with AI automation.
              </p>
              <ul className="relative space-y-1.5 mb-4">
                <li className="flex items-center gap-2 text-xs text-blue-300/70">
                  <Star className="w-3 h-3 text-blue-400" />
                  <span>AI ticket automation</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-blue-300/70">
                  <Star className="w-3 h-3 text-blue-400" />
                  <span>Analytics dashboard</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="relative w-full border-blue-500/30 text-blue-400/70 cursor-not-allowed text-sm py-2"
                disabled
              >
                Coming Soon
              </Button>
            </div>

            {/* Titan Support Master */}
            <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-blue-950/80 to-slate-900/90 border-2 border-blue-500/30 hover:border-cyan-400 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] cursor-pointer">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30">
                  Soon
                </span>
              </div>
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-400/50 group-hover:scale-110 transition-all opacity-80">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <h3 className="relative text-lg font-bold mb-2 text-white group-hover:text-cyan-100">Titan Support Master</h3>
              <p className="relative text-white/60 text-sm mb-4 leading-relaxed">
                Customer support with multi-channel AI assistance.
              </p>
              <ul className="relative space-y-1.5 mb-4">
                <li className="flex items-center gap-2 text-xs text-blue-300/70">
                  <Star className="w-3 h-3 text-blue-400" />
                  <span>Multi-channel support</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-blue-300/70">
                  <Star className="w-3 h-3 text-blue-400" />
                  <span>AI-powered responses</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="relative w-full border-blue-500/30 text-blue-400/70 cursor-not-allowed text-sm py-2"
                disabled
              >
                Coming Soon
              </Button>
            </div>

            {/* AI Factory */}
            <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-blue-950/80 to-slate-900/90 border-2 border-blue-500/30 hover:border-cyan-400 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] cursor-pointer">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30">
                  Soon
                </span>
              </div>
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 group-hover:shadow-cyan-400/50 group-hover:scale-110 transition-all opacity-80">
                <Store className="w-6 h-6 text-white" />
              </div>
              <h3 className="relative text-lg font-bold mb-2 text-white group-hover:text-cyan-100">AI Factory</h3>
              <p className="relative text-white/60 text-sm mb-4 leading-relaxed">
                Global marketplace for developers to sell apps worldwide.
              </p>
              <ul className="relative space-y-1.5 mb-4">
                <li className="flex items-center gap-2 text-xs text-blue-300/70">
                  <Star className="w-3 h-3 text-blue-400" />
                  <span>Global app marketplace</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-blue-300/70">
                  <Star className="w-3 h-3 text-blue-400" />
                  <span>Developer monetization</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="relative w-full border-blue-500/30 text-blue-400/70 cursor-not-allowed text-sm py-2"
                disabled
              >
                Coming Soon
              </Button>
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

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
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
