/**
 * Protected Route Component
 * Handles authentication and authorization checks for protected routes
 */

import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallbackPath?: string;
}

/**
 * ProtectedRoute - Wraps components that require authentication
 *
 * @param children - The component to render if authorized
 * @param requiredRole - Optional role(s) required to access the route
 * @param fallbackPath - Path to redirect to if unauthorized (default: '/')
 */
export function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = '/'
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, isAdmin, role } = useAuth();
  const [, setLocation] = useLocation();

  // Check if user has required role
  const hasRequiredRole = (): boolean => {
    if (!requiredRole) return true; // No specific role required
    if (!role) return false;

    // Admin always has access
    if (isAdmin) return true;

    // Check if user's role matches required role(s)
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    return role === requiredRole;
  };

  // Check if this is a real authenticated user (not fallback)
  const isRealUser = (): boolean => {
    if (!user) return false;
    // Detect fallback/auto-generated users by their ID pattern
    if (user.id === 'auto-user-fallback' || user.id.startsWith('auto-')) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) return;

    // If not authenticated or using fallback user, redirect
    if (!isAuthenticated || !isRealUser()) {
      console.log('[ProtectedRoute] User not authenticated, redirecting to:', fallbackPath);
      setLocation(fallbackPath);
      return;
    }

    // If authenticated but doesn't have required role, redirect
    if (requiredRole && !hasRequiredRole()) {
      console.log('[ProtectedRoute] User lacks required role:', requiredRole, 'User role:', role);
      setLocation(fallbackPath);
      return;
    }
  }, [isLoading, isAuthenticated, user, role, requiredRole, fallbackPath, setLocation]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or using fallback user, show nothing (redirect in progress)
  if (!isAuthenticated || !isRealUser()) {
    return null;
  }

  // If requires specific role and user doesn't have it, show nothing (redirect in progress)
  if (requiredRole && !hasRequiredRole()) {
    return null;
  }

  // User is authenticated and authorized - render children
  return <>{children}</>;
}

/**
 * AdminRoute - Convenience wrapper for admin-only routes
 */
export function AdminRoute({
  children,
  fallbackPath = '/'
}: {
  children: React.ReactNode;
  fallbackPath?: string;
}) {
  return (
    <ProtectedRoute requiredRole="administrator" fallbackPath={fallbackPath}>
      {children}
    </ProtectedRoute>
  );
}

export default ProtectedRoute;
