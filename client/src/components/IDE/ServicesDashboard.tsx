import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Star,
  Brain,
  Route,
  Shield,
  Atom,
  Ticket,
  Headphones,
  Store,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { useIDE } from '@/hooks/use-ide';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useServiceAccess } from '@/hooks/use-service-access';
import { cn } from '@/lib/utils';
import { NavigationButtons } from './BackButton';

type ServiceStatus = 'active' | 'payment-needed' | 'inactive';

interface ServiceCard {
  id: string;
  name: string;
  description: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgGradient: string;
  borderGradient: string;
}

const services: ServiceCard[] = [
  {
    id: 'websites',
    name: 'Merlin Websites',
    description: 'Merlin Website Wizard',
    subtitle: 'Generate stunning websites with AI in seconds - perfect for clients',
    icon: Globe,
    gradient: 'from-blue-500 to-cyan-600',
    bgGradient: 'from-blue-500/10 to-cyan-600/10',
    borderGradient: 'from-blue-500/30 to-cyan-600/30',
  },
  {
    id: 'stargate',
    name: 'Stargate IDE',
    description: 'AI Development Platform',
    subtitle: 'Revolutionary cloud development with advanced AI assistance - Coming Soon',
    icon: Star,
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-500/10 to-pink-600/10',
    borderGradient: 'from-purple-500/30 to-pink-600/30',
  },
  {
    id: 'pandora',
    name: 'PANDORA',
    description: 'Multi-AI Collaboration',
    subtitle: 'Revolutionary Multi-AI Collaboration Platform',
    icon: Brain,
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-500/10 to-pink-600/10',
    borderGradient: 'from-purple-500/30 to-pink-600/30',
  },
  {
    id: 'regis',
    name: 'Regis Core',
    description: 'AI Routing & Cost Optimization',
    subtitle: 'Intelligent AI routing for maximum cost efficiency and performance',
    icon: Route,
    gradient: 'from-orange-500 to-red-600',
    bgGradient: 'from-orange-500/10 to-red-600/10',
    borderGradient: 'from-orange-500/30 to-red-600/30',
  },
  {
    id: 'nero',
    name: 'Nero Core',
    description: 'AI Firewall & Security',
    subtitle: 'External DNS server with intelligent firewall protection',
    icon: Shield,
    gradient: 'from-red-500 to-pink-600',
    bgGradient: 'from-red-500/10 to-pink-600/10',
    borderGradient: 'from-red-500/30 to-pink-600/30',
  },
  {
    id: 'quantum',
    name: 'Quantum Core',
    description: 'Quantum Investigations',
    subtitle: 'Advanced quantum computing capabilities for complex problem solving',
    icon: Atom,
    gradient: 'from-green-500 to-blue-600',
    bgGradient: 'from-green-500/10 to-blue-600/10',
    borderGradient: 'from-green-500/30 to-blue-600/30',
  },
  {
    id: 'titan-ticket',
    name: 'Titan Ticket Master',
    description: 'Advanced Ticket Management',
    subtitle: 'Enterprise-grade ticket system with AI-powered automation and analytics',
    icon: Ticket,
    gradient: 'from-indigo-500 to-purple-600',
    bgGradient: 'from-indigo-500/10 to-purple-600/10',
    borderGradient: 'from-indigo-500/30 to-purple-600/30',
  },
  {
    id: 'titan-support',
    name: 'Titan Support Master',
    description: 'Customer Support Platform',
    subtitle: 'Comprehensive support solution with multi-channel communication and AI assistance',
    icon: Headphones,
    gradient: 'from-teal-500 to-cyan-600',
    bgGradient: 'from-teal-500/10 to-cyan-600/10',
    borderGradient: 'from-teal-500/30 to-cyan-600/30',
  },
  {
    id: 'ai-factory',
    name: 'AI Factory',
    description: 'Global App Marketplace',
    subtitle: 'Sell your apps and programs to the entire world - the ultimate marketplace for developers',
    icon: Store,
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-500/10 to-orange-600/10',
    borderGradient: 'from-amber-500/30 to-orange-600/30',
  },
];

export function ServicesDashboard() {
  const { setState } = useIDE();
  const { user } = useAuth();
  const { toast } = useToast();
  const { getServiceStatus } = useServiceAccess();

  const handleServiceClick = (serviceId: string) => {
    const status = getServiceStatus(serviceId) as ServiceStatus;
    
    if (status !== 'active') {
      if (status === 'payment-needed') {
        toast({
          title: 'Payment Required',
          description: 'Please update your payment method to access this service.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Service Not Active',
          description: 'This service is not currently available. Please subscribe to access.',
          variant: 'default',
        });
      }
      return;
    }

    // Route to appropriate view based on service
    switch (serviceId) {
      case 'websites':
        // Go directly to website wizard (has built-in package selection)
        setState(prev => ({ ...prev, currentView: 'stargate-websites' }));
        break;
      case 'stargate':
        setState(prev => ({ ...prev, currentView: 'website' }));
        break;
      case 'pandora':
        setState(prev => ({ ...prev, currentView: 'pandora' }));
        break;
      case 'regis':
        setState(prev => ({ ...prev, currentView: 'regis' }));
        break;
      case 'nero':
        setState(prev => ({ ...prev, currentView: 'nero' }));
        break;
      case 'quantum':
        setState(prev => ({ ...prev, currentView: 'quantum' }));
        break;
      case 'titan-ticket':
        setState(prev => ({ ...prev, currentView: 'titan-ticket' }));
        break;
      case 'titan-support':
        setState(prev => ({ ...prev, currentView: 'titan-support' }));
        break;
      case 'ai-factory':
        setState(prev => ({ ...prev, currentView: 'ai-factory' }));
        break;
      default:
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    const serviceStatus = status as ServiceStatus;
    switch (serviceStatus) {
      case 'active':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'payment-needed':
        return (
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Payment Needed
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-y-auto">
      {/* Navigation Buttons - Fixed position, always visible */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <NavigationButtons
          backDestination="landing"
          backLabel="Back to Home"
          className="[&_button]:bg-blue-600 [&_button]:hover:bg-blue-700 [&_button]:border-none [&_button]:text-white [&_button]:shadow-lg [&_button]:px-4 [&_button]:py-2"
        />
      </div>

      {/* Hero Section */}
      <div className="relative pt-12 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-white/[0.08] to-white/[0.03] border border-white/[0.08] mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />
            <span className="text-sm font-medium text-white/80 tracking-wide">
              Welcome back, {user?.username || 'User'}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight mb-6 leading-[1.05]">
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
              Your Services
            </span>
            <br />
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400">
              Dashboard
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
            Access and manage all your Stargate services from one central location.
            Click on any active service to get started.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            const status = getServiceStatus(service.id) as ServiceStatus;
            const isActive = status === 'active';
            const Icon = service.icon;

            return (
              <div
                key={service.id}
                onClick={() => handleServiceClick(service.id)}
                className={cn(
                  'group relative p-8 rounded-3xl border transition-all duration-300',
                  `bg-gradient-to-br ${service.bgGradient}`,
                  `border ${service.borderGradient}`,
                  isActive
                    ? 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20'
                    : 'cursor-not-allowed opacity-75',
                  !isActive && 'hover:opacity-90'
                )}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {getStatusBadge(status)}
                </div>

                {/* Service Icon */}
                <div
                  className={cn(
                    'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-lg transition-transform',
                    `bg-gradient-to-br ${service.gradient}`,
                    isActive && 'group-hover:scale-110'
                  )}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Service Info */}
                <h3 className="text-2xl font-bold mb-2">{service.name}</h3>
                <p className="text-sm text-white/60 mb-1 font-medium">{service.description}</p>
                <p className="text-sm text-white/50 mb-6 leading-relaxed">{service.subtitle}</p>

                {/* Action Button/Message */}
                {isActive ? (
                  <div className="flex items-center text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                    <span>Access Service</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                ) : status === 'payment-needed' ? (
                  <div className="text-sm text-amber-300/80">
                    Update payment to continue
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">
                    Subscribe to activate
                  </div>
                )}

                {/* Hover Glow Effect (only for active) */}
                {isActive && (
                  <div
                    className={cn(
                      'absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
                      `bg-gradient-to-br ${service.gradient} blur-xl -z-10`
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <p className="text-center text-sm text-white/40">
          Need help? Contact support or visit our documentation for more information.
        </p>
      </div>
    </div>
  );
}

