import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useIDE } from '@/hooks/use-ide';
import { useAuth } from '@/contexts/AuthContext';

interface BackButtonProps {
  /** Custom label for the back button */
  label?: string;
  /** Custom destination view. If not provided, goes to 'dashboard' for authenticated users or 'landing' for non-authenticated */
  destination?: string;
  /** Custom onClick handler. If provided, overrides default navigation */
  onClick?: () => void;
  /** Additional className for styling */
  className?: string;
  /** Show icon or not */
  showIcon?: boolean;
}

// URL mapping for views
const urlMap: Record<string, string> = {
  'landing': '/',
  'dashboard': '/dashboard',
  'admin': '/admin',
  'ide': '/ide',
  'merlin-packages': '/merlin',
  'stargate-websites': '/stargate-websites',
  'services': '/services',
  'settings': '/settings',
  'templates': '/templates',
  'projects': '/projects',
};

// Shared navigation function - use window.location for reliable navigation
function navigateToView(setState: ReturnType<typeof useIDE>['setState'], targetView: string) {
  const targetUrl = urlMap[targetView] || '/';

  // Use direct navigation for reliable page transitions
  // pushState alone doesn't trigger React Router to update
  window.location.href = targetUrl;
}

export function BackButton({
  label = 'Back',
  destination,
  onClick,
  className = '',
  showIcon = true,
}: BackButtonProps) {
  const { setState } = useIDE();
  const { isAuthenticated } = useAuth();

  const handleBack = () => {
    if (onClick) {
      onClick();
      return;
    }

    const targetView = destination || (isAuthenticated ? 'dashboard' : 'landing');
    navigateToView(setState, targetView);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleBack}
      className={`flex items-center gap-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${className}`}
      data-testid="back-button"
    >
      {showIcon && <ArrowLeft className="w-4 h-4" />}
      <span>{label}</span>
    </Button>
  );
}

/**
 * Home button that always navigates to landing page
 */
export function HomeButton({
  label = 'Home',
  className = '',
  showIcon = true,
}: Omit<BackButtonProps, 'destination' | 'onClick'>) {
  const { setState } = useIDE();

  const handleHome = () => {
    navigateToView(setState, 'landing');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleHome}
      className={`flex items-center gap-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${className}`}
      data-testid="home-button"
    >
      {showIcon && <Home className="w-4 h-4" />}
      <span>{label}</span>
    </Button>
  );
}

/**
 * Combined navigation buttons - Back and Home together
 * Use this at the top of pages for consistent navigation
 */
interface NavigationButtonsProps {
  /** Where the back button should go. Defaults to dashboard for auth users */
  backDestination?: string;
  /** Custom back button label */
  backLabel?: string;
  /** Whether to show the home button */
  showHome?: boolean;
  /** Additional className for the container */
  className?: string;
}

export function NavigationButtons({
  backDestination,
  backLabel = 'Back',
  showHome = true,
  className = '',
}: NavigationButtonsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <BackButton label={backLabel} destination={backDestination} />
      {showHome && <HomeButton />}
    </div>
  );
}

