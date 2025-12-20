import { useLocation } from 'wouter';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Route name mappings
const routeNames: Record<string, string> = {
  '': 'Home',
  'dashboard': 'Dashboard',
  'projects': 'Projects',
  'templates': 'Templates',
  'editor': 'Editor',
  'builder': 'Website Builder',
  'merlin': 'Merlin Wizard',
  'settings': 'Settings',
  'profile': 'Profile',
  'admin': 'Admin Panel',
  'ide': 'IDE',
  'services': 'Services',
  'apps': 'Applications',
  'deployments': 'Deployments',
  'analytics': 'Analytics',
  'billing': 'Billing',
};

// Routes that shouldn't show breadcrumbs
const hiddenRoutes = ['/', ''];

interface PageBreadcrumbProps {
  customSegments?: { label: string; href?: string }[];
  className?: string;
}

export function PageBreadcrumb({ customSegments, className }: PageBreadcrumbProps) {
  const [location] = useLocation();

  // Parse path into segments
  const pathSegments = location.split('/').filter(Boolean);

  // Don't show on home page
  if (hiddenRoutes.includes(location) || pathSegments.length === 0) {
    return null;
  }

  // Build breadcrumb items
  const breadcrumbItems = customSegments || pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    return { label, href };
  });

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {/* Home link */}
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {/* Path segments */}
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <BreadcrumbItem key={item.href || item.label}>
              {isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
