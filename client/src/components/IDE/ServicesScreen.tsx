import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Star,
  Atom,
  Route,
  Shield,
  Brain,
  Check,
  ShoppingCart,
  CreditCard,
  Zap,
  Globe,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BackButton } from './BackButton';

export function ServicesScreen() {
  const { toast } = useToast();

  // Service ownership and status states
  const [serviceStates, setServiceStates] = useState<
    Record<string, { owned: boolean; active: boolean }>
  >({
    websites: { owned: true, active: true },
    stargate: { owned: true, active: true },
    pandora: { owned: false, active: false },
    regis: { owned: false, active: false },
    neuro: { owned: false, active: false },
    quantum: { owned: false, active: false },
  });

  const services = [
    {
      id: 'websites',
      name: 'Merlin Websites',
      description: 'Merlin Website Wizard',
      subtitle: 'Generate stunning websites with AI in seconds - perfect for clients',
      icon: Globe,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      features: [
        'AI-Powered Generation',
        'Template Library',
        'Export Source Code',
        'No Lock-in Policy',
      ],
      price: 'Starting from $29/month',
      popular: true,
      available: true,
    },
    {
      id: 'stargate',
      name: 'Stargate IDE',
      description: 'AI Development Platform',
      subtitle: 'Revolutionary cloud development with advanced AI assistance',
      icon: Star,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
      features: [
        'Multi-Model AI Integration',
        'Smart Code Generation',
        'Real-time Collaboration',
        'Advanced Analytics',
      ],
      price: '$49/month',
      popular: false,
      available: false,
    },
    {
      id: 'pandora',
      name: 'PANDORA',
      description: 'Multi-AI Collaboration',
      subtitle: 'Revolutionary Multi-AI Collaboration Platform',
      icon: Brain,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/30',
      borderColor: 'border-gray-300 dark:border-gray-700',
      features: [
        'AI-to-AI Communication',
        'Collaborative Debate System',
        'Multi-Agent Workflows',
        'Quantum-Enhanced Processing',
      ],
      price: '$59/month',
      popular: false,
      available: false,
    },
    {
      id: 'regis',
      name: 'Regis Core',
      description: 'AI Routing & Cost Optimization',
      subtitle: 'Intelligent AI routing for maximum cost efficiency and performance',
      icon: Route,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/30',
      borderColor: 'border-gray-300 dark:border-gray-700',
      features: ['Smart AI Routing', 'Cost-Effective Mode', 'Planning Mode', 'Execution Mode'],
      price: '$69/month',
      popular: false,
      available: false,
    },
    {
      id: 'neuro',
      name: 'Nero Core',
      description: 'AI Firewall & Security',
      subtitle: 'External DNS server with intelligent firewall protection',
      icon: Shield,
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/30',
      borderColor: 'border-gray-300 dark:border-gray-700',
      features: [
        'AI-Powered Firewall',
        'DNS Security',
        'Threat Intelligence',
        'Real-time Protection',
      ],
      price: '$89/month',
      popular: false,
      available: false,
    },
    {
      id: 'quantum',
      name: 'Quantum Core',
      description: 'Quantum Investigations',
      subtitle: 'Advanced quantum computing capabilities for complex problem solving',
      icon: Atom,
      color: 'from-green-500 to-blue-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/30',
      borderColor: 'border-gray-300 dark:border-gray-700',
      features: [
        'Quantum Algorithm Design',
        'Complex Problem Solving',
        'Advanced Simulations',
        'Research Tools',
      ],
      price: '$149/month',
      popular: false,
      available: false,
    },
  ];

  const handlePurchase = (serviceId: string) => {
    // Simulate purchase process
    toast({
      title: 'Processing Payment',
      description: 'Please wait while we process your purchase...',
    });

    // Simulate API call delay
    setTimeout(() => {
      setServiceStates(prev => ({
        ...prev,
        [serviceId]: { owned: true, active: true },
      }));

      const service = services.find(s => s.id === serviceId);
      toast({
        title: 'Purchase Successful!',
        description: `${service?.name} has been activated for your account.`,
        variant: 'default',
      });
    }, 2000);
  };

  const handleToggleActive = (serviceId: string) => {
    const currentState = serviceStates[serviceId];
    if (!currentState) return;

    setServiceStates(prev => ({
      ...prev,
      [serviceId]: {
        ...currentState,
        active: !currentState.active,
      },
    }));

    const service = services.find(s => s.id === serviceId);
    const newState = !currentState.active;

    toast({
      title: newState ? 'Service Activated' : 'Service Deactivated',
      description: `${service?.name} is now ${newState ? 'active' : 'inactive'}.`,
    });
  };

  return (
    <div className="w-full bg-background h-full overflow-y-auto" data-testid="services-screen">
      <div className="w-full max-w-none mx-auto px-8 py-8">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton />
        </div>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Stargate Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the perfect services to supercharge your development workflow with AI-powered
            tools and advanced capabilities.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map(service => {
            const IconComponent = service.icon;
            const serviceState = serviceStates[service.id];

            return (
              <Card
                key={service.id}
                className={`relative transition-all duration-300 ${
                  service.available !== false
                    ? 'hover:shadow-2xl hover:shadow-purple-500/10 hover:scale-[1.02]'
                    : 'opacity-60 cursor-not-allowed'
                } ${service.bgColor} ${service.borderColor} border-2 ${
                  service.popular && service.available !== false
                    ? 'ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-400/20'
                    : ''
                }`}
                data-testid={`service-card-${service.id}`}
              >
                {/* Popular Badge */}
                {service.popular && service.available !== false && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 text-xs font-semibold">
                      🔥 MOST POPULAR
                    </Badge>
                  </div>
                )}

                {/* Coming Soon Badge */}
                {service.available === false && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-3 py-1 text-xs font-semibold">
                      <Clock className="w-3 h-3 mr-1" />
                      COMING SOON
                    </Badge>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {service.available !== false ? (
                    <Badge
                      variant={serviceState.active ? 'default' : 'secondary'}
                      className={`${
                        serviceState.active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : serviceState.owned
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      }`}
                    >
                      {serviceState.active
                        ? 'Active'
                        : serviceState.owned
                          ? 'Inactive'
                          : 'Not Owned'}
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      Not Available
                    </Badge>
                  )}
                </div>

                <CardHeader className="text-center pb-4 pt-8">
                  <div className="relative mb-6">
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${
                        service.available === false ? 'from-gray-400 to-gray-600' : service.color
                      } rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
                        service.available === false ? 'opacity-50' : ''
                      }`}
                    >
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  <CardTitle
                    className={`text-2xl font-bold mb-2 ${
                      service.available === false
                        ? 'text-gray-500 dark:text-gray-600'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {service.name}
                  </CardTitle>
                  <p
                    className={`text-base font-medium mb-2 ${
                      service.available === false
                        ? 'text-gray-400 dark:text-gray-600'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {service.description}
                  </p>
                  <p
                    className={`text-sm ${
                      service.available === false
                        ? 'text-gray-400 dark:text-gray-700'
                        : 'text-gray-500 dark:text-gray-500'
                    }`}
                  >
                    {service.subtitle}
                  </p>

                  {/* Price */}
                  <div className="mt-4">
                    <span
                      className={`text-3xl font-bold ${
                        service.available === false
                          ? 'text-gray-400 dark:text-gray-600'
                          : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {service.price}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Features List */}
                  <div className="space-y-3 mb-6">
                    {service.features.map((feature, index) => (
                      <div
                        key={index}
                        className={`flex items-center text-sm ${
                          service.available === false
                            ? 'text-gray-400 dark:text-gray-600'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Check
                          className={`w-4 h-4 mr-3 flex-shrink-0 ${
                            service.available === false ? 'text-gray-400' : 'text-green-500'
                          }`}
                        />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {service.available === false ? (
                      <Button
                        disabled
                        className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium py-3 cursor-not-allowed"
                        data-testid={`button-coming-soon-${service.id}`}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Coming Soon
                      </Button>
                    ) : !serviceState.owned ? (
                      <Button
                        className={`w-full bg-gradient-to-r ${service.color} text-white font-medium py-3 hover:shadow-lg transition-all duration-300`}
                        onClick={() => handlePurchase(service.id)}
                        data-testid={`button-purchase-${service.id}`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Purchase {service.name}
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          variant={serviceState.active ? 'destructive' : 'default'}
                          className="w-full font-medium py-3"
                          onClick={() => handleToggleActive(service.id)}
                          data-testid={`button-toggle-${service.id}`}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          {serviceState.active ? 'Deactivate' : 'Activate'} Service
                        </Button>

                        <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400">
                          <Check className="w-4 h-4 mr-1" />
                          Owned
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 to-purple-950 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              Need Help Choosing?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Contact our team for personalized recommendations based on your development needs.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-950"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
