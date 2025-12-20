/**
 * Live Stats Component
 * Animated real-time statistics display for homepage hero
 */

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Globe, Users, Code, Zap } from 'lucide-react';

interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
  color: string;
  incrementRate: number; // How much to increment per interval
}

const baseStats: StatItem[] = [
  {
    id: 'websites',
    label: 'Websites Created',
    value: 12847,
    suffix: '+',
    icon: <Globe className="w-5 h-5" />,
    color: 'text-blue-400',
    incrementRate: 1,
  },
  {
    id: 'developers',
    label: 'Active Developers',
    value: 8234,
    suffix: '+',
    icon: <Users className="w-5 h-5" />,
    color: 'text-green-400',
    incrementRate: 0.5,
  },
  {
    id: 'templates',
    label: 'Templates Available',
    value: 7280,
    icon: <Code className="w-5 h-5" />,
    color: 'text-purple-400',
    incrementRate: 0.2,
  },
  {
    id: 'deployments',
    label: 'Deployments Today',
    value: 1456,
    icon: <Zap className="w-5 h-5" />,
    color: 'text-orange-400',
    incrementRate: 2,
  },
];

function AnimatedCounter({
  value,
  duration = 2000,
  prefix = '',
  suffix = ''
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  const formattedValue = displayValue.toLocaleString();

  return (
    <span>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}

interface LiveStatsProps {
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'compact';
  animate?: boolean;
}

export function LiveStats({
  className,
  variant = 'horizontal',
  animate = true
}: LiveStatsProps) {
  const [stats, setStats] = useState(baseStats);
  const [isLoaded, setIsLoaded] = useState(false);

  // Animate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Simulate live updates
  useEffect(() => {
    if (!animate) return;

    const interval = setInterval(() => {
      setStats(prevStats =>
        prevStats.map(stat => ({
          ...stat,
          value: stat.value + Math.floor(Math.random() * stat.incrementRate * 2),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [animate]);

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-6 text-sm', className)}>
        {stats.slice(0, 2).map((stat, index) => (
          <div
            key={stat.id}
            className={cn(
              'flex items-center gap-2 transition-all duration-500',
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            )}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <span className={stat.color}>{stat.icon}</span>
            <span className="text-white font-semibold">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </span>
            <span className="text-slate-400">{stat.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {stats.map((stat, index) => (
          <div
            key={stat.id}
            className={cn(
              'flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700 transition-all duration-500',
              isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            )}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className={cn('p-2 rounded-lg bg-slate-700', stat.color)}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={cn(
      'grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8',
      className
    )}>
      {stats.map((stat, index) => (
        <div
          key={stat.id}
          className={cn(
            'text-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm transition-all duration-500 hover:bg-slate-800/50 hover:border-slate-600',
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <div className={cn('flex justify-center mb-3', stat.color)}>
            {stat.icon}
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white mb-1">
            <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
          </p>
          <p className="text-xs md:text-sm text-slate-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// Minimal inline stats for hero section
export function HeroLiveStats({ className }: { className?: string }) {
  const [websiteCount, setWebsiteCount] = useState(12847);
  const [developerCount, setDeveloperCount] = useState(8234);

  useEffect(() => {
    const interval = setInterval(() => {
      setWebsiteCount(prev => prev + Math.floor(Math.random() * 3));
      setDeveloperCount(prev => prev + Math.floor(Math.random() * 2));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn('flex items-center justify-center gap-8 text-sm', className)}>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-slate-400">
          <span className="text-white font-semibold">{websiteCount.toLocaleString()}+</span> websites created
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <span className="text-slate-400">
          <span className="text-white font-semibold">{developerCount.toLocaleString()}+</span> active developers
        </span>
      </div>
    </div>
  );
}
