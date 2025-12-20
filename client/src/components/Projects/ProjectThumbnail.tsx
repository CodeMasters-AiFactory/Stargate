/**
 * Project Thumbnail Component
 * Generates visual thumbnails for projects based on their template/type
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Globe,
  ShoppingBag,
  Briefcase,
  Building2,
  Utensils,
  GraduationCap,
  Heart,
  Camera,
  Music,
  Car,
  Home,
  Plane,
  Laptop,
  Dumbbell,
  Palette,
  FileText
} from 'lucide-react';

// Industry/template type to icon mapping
const industryIcons: Record<string, React.ReactNode> = {
  'real-estate': <Home className="w-8 h-8" />,
  'realestate': <Home className="w-8 h-8" />,
  'ecommerce': <ShoppingBag className="w-8 h-8" />,
  'e-commerce': <ShoppingBag className="w-8 h-8" />,
  'shop': <ShoppingBag className="w-8 h-8" />,
  'business': <Briefcase className="w-8 h-8" />,
  'corporate': <Building2 className="w-8 h-8" />,
  'restaurant': <Utensils className="w-8 h-8" />,
  'food': <Utensils className="w-8 h-8" />,
  'education': <GraduationCap className="w-8 h-8" />,
  'school': <GraduationCap className="w-8 h-8" />,
  'healthcare': <Heart className="w-8 h-8" />,
  'medical': <Heart className="w-8 h-8" />,
  'photography': <Camera className="w-8 h-8" />,
  'portfolio': <Camera className="w-8 h-8" />,
  'music': <Music className="w-8 h-8" />,
  'entertainment': <Music className="w-8 h-8" />,
  'automotive': <Car className="w-8 h-8" />,
  'travel': <Plane className="w-8 h-8" />,
  'technology': <Laptop className="w-8 h-8" />,
  'tech': <Laptop className="w-8 h-8" />,
  'fitness': <Dumbbell className="w-8 h-8" />,
  'gym': <Dumbbell className="w-8 h-8" />,
  'creative': <Palette className="w-8 h-8" />,
  'design': <Palette className="w-8 h-8" />,
  'blog': <FileText className="w-8 h-8" />,
  'default': <Globe className="w-8 h-8" />,
};

// Industry/template type to gradient mapping
const industryGradients: Record<string, string> = {
  'real-estate': 'from-emerald-500 to-teal-600',
  'realestate': 'from-emerald-500 to-teal-600',
  'ecommerce': 'from-violet-500 to-purple-600',
  'e-commerce': 'from-violet-500 to-purple-600',
  'shop': 'from-violet-500 to-purple-600',
  'business': 'from-blue-500 to-indigo-600',
  'corporate': 'from-slate-600 to-gray-700',
  'restaurant': 'from-orange-500 to-red-600',
  'food': 'from-orange-500 to-red-600',
  'education': 'from-sky-500 to-blue-600',
  'school': 'from-sky-500 to-blue-600',
  'healthcare': 'from-rose-500 to-pink-600',
  'medical': 'from-rose-500 to-pink-600',
  'photography': 'from-gray-700 to-gray-900',
  'portfolio': 'from-gray-700 to-gray-900',
  'music': 'from-purple-600 to-indigo-700',
  'entertainment': 'from-purple-600 to-indigo-700',
  'automotive': 'from-red-600 to-red-800',
  'travel': 'from-cyan-500 to-blue-600',
  'technology': 'from-blue-600 to-cyan-500',
  'tech': 'from-blue-600 to-cyan-500',
  'fitness': 'from-green-500 to-emerald-600',
  'gym': 'from-green-500 to-emerald-600',
  'creative': 'from-pink-500 to-rose-600',
  'design': 'from-pink-500 to-rose-600',
  'blog': 'from-amber-500 to-orange-600',
  'default': 'from-purple-600 to-blue-600',
};

interface ProjectThumbnailProps {
  projectName: string;
  industry?: string;
  templateName?: string;
  templatePreview?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProjectThumbnail({
  projectName,
  industry,
  templateName,
  templatePreview,
  size = 'md',
  className,
}: ProjectThumbnailProps) {
  const [imageError, setImageError] = useState(false);

  // Determine the category for icon and gradient
  const category = (
    industry?.toLowerCase() ||
    templateName?.toLowerCase() ||
    ''
  ).replace(/[^a-z-]/g, '');

  // Find matching icon and gradient
  const matchedKey = Object.keys(industryIcons).find(key =>
    category.includes(key)
  ) || 'default';

  const icon = industryIcons[matchedKey];
  const gradient = industryGradients[matchedKey];

  // Size configurations
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-base',
  };

  const iconScale = {
    sm: 'scale-50',
    md: 'scale-75',
    lg: 'scale-100',
  };

  // If we have a valid preview image, use it
  if (templatePreview && !imageError) {
    return (
      <div
        className={cn(
          'rounded-lg overflow-hidden bg-slate-700',
          sizeClasses[size],
          className
        )}
      >
        <img
          src={templatePreview}
          alt={projectName}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Generate thumbnail from project name initial + gradient
  const initial = projectName.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'rounded-lg flex items-center justify-center bg-gradient-to-br relative overflow-hidden',
        gradient,
        sizeClasses[size],
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-full h-full">
          {/* Decorative circles */}
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full border-2 border-white/20" />
          <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full border border-white/20" />
        </div>
      </div>

      {/* Icon or Initial */}
      <div className={cn('relative text-white/90', iconScale[size])}>
        {category && matchedKey !== 'default' ? (
          icon
        ) : (
          <span className="font-bold text-2xl">{initial}</span>
        )}
      </div>
    </div>
  );
}

// Grid of project thumbnails for preview
export function ProjectThumbnailGrid({ className }: { className?: string }) {
  const demoProjects = [
    { name: 'Real Estate Pro', industry: 'real-estate' },
    { name: 'Fashion Store', industry: 'ecommerce' },
    { name: 'Tech Startup', industry: 'technology' },
    { name: 'Fitness Club', industry: 'fitness' },
    { name: 'Restaurant', industry: 'restaurant' },
    { name: 'Law Firm', industry: 'corporate' },
  ];

  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      {demoProjects.map((project, index) => (
        <ProjectThumbnail
          key={index}
          projectName={project.name}
          industry={project.industry}
          size="md"
        />
      ))}
    </div>
  );
}
