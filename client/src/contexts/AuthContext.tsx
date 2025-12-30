import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { trackRender } from '@/utils/renderTracker';

// Helper: Add timeout to fetch requests to prevent infinite hang
function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
    )
  ]);
}

export type UserRole = 'administrator' | 'user' | 'technical' | 'designer';

interface User {
  id: string;
  username: string;
  email?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  isAdmin: boolean;
  hasPermission: (permission: string) => boolean;
  login: (email: string, password: string, onSuccess?: () => void) => Promise<void>;
  signup: (
    username: string,
    email: string,
    password: string,
    onSuccess?: () => void
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const prevUserRef = useRef(user);
  const prevLoadingRef = useRef(isLoading);

  // Track re-renders - only when user or isLoading actually changes
  useEffect(() => {
    const reasons: string[] = [];
    if (prevUserRef.current !== user) {
      reasons.push(`User changed: ${user?.id || 'null'} -> ${user?.id || 'null'}`);
      prevUserRef.current = user;
    }
    if (prevLoadingRef.current !== isLoading) {
      reasons.push(`Loading changed: ${prevLoadingRef.current} -> ${isLoading}`);
      prevLoadingRef.current = isLoading;
    }
    if (reasons.length > 0) {
      trackRender('AuthProvider', reasons.join(' | '));
    }
  }, [user, isLoading]); // Only track when these actually change

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('[AuthContext] Checking authentication...');
      
      const response = await fetchWithTimeout('/api/auth/me', {
        credentials: 'include',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 5000);

      console.log('[AuthContext] Auth check response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('[AuthContext] ✅ User authenticated:', userData.username);
        setUser(userData);
        return; // Success - exit early
      }

      // If not OK (401, 500, etc.), retry once - backend will auto-create session
      console.log('[AuthContext] ⚠️ Initial auth check failed, retrying with auto-auth...');

      // Wait a brief moment before retry to allow backend to initialize
      await new Promise(resolve => setTimeout(resolve, 100));

        const retryResponse = await fetchWithTimeout('/api/auth/status', {
          credentials: 'include',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }, 5000);

      console.log('[AuthContext] Retry response status:', retryResponse.status);

      if (retryResponse.ok) {
        const userData = await retryResponse.json();
        console.log('[AuthContext] ✅ User authenticated on retry:', userData.username);
        setUser(userData);
      } else {
        // SECURITY FIX: Do NOT create fallback admin user - user must authenticate properly
        console.warn('[AuthContext] ⚠️ Authentication failed - user must log in');
        setUser(null);
      }
    } catch (error: any) {
      console.error('[AuthContext] ❌ Auth check error:', error);
      console.error('[AuthContext] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
      // On error, retry once more to trigger auto-auth
      try {
        console.log('[AuthContext] Retrying after error...');
        await new Promise(resolve => setTimeout(resolve, 200));

        const retryResponse = await fetchWithTimeout('/api/auth/me', {
          credentials: 'include',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }, 5000);

        if (retryResponse.ok) {
          const userData = await retryResponse.json();
          console.log('[AuthContext] ✅ User authenticated after error retry:', userData.username);
          setUser(userData);
        } else {
          // SECURITY FIX: Do NOT create fallback admin user - user must authenticate properly
          console.warn('[AuthContext] ⚠️ Retry failed - user must log in');
          setUser(null);
        }
      } catch (retryError: any) {
        console.error('[AuthContext] ❌ Retry also failed:', retryError);
        // SECURITY FIX: Do NOT create fallback admin user - user must authenticate properly
        console.warn('[AuthContext] ⚠️ All auth attempts failed - user must log in');
        setUser(null);
      }
    } finally {
      setIsLoading(false);
      console.log('[AuthContext] ✅ Auth check completed - isLoading set to false');
      console.log('[AuthContext] Current user:', user?.username || 'null');
    }
  }, []);

  // Only check auth once EVER - prevent re-runs
  const hasCheckedAuthRef = useRef(false);
  useEffect(() => {
    if (!hasCheckedAuthRef.current) {
      hasCheckedAuthRef.current = true;
      checkAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once EVER

  // Memoize login, signup, and logout functions to prevent re-renders
  const loginMemo = useCallback(
    async (email: string, password: string, onSuccess?: () => void) => {
      try {
        const response = await apiRequest('POST', '/api/auth/login', {
          email,
          password,
        });

        const userData = await response.json();
        setUser(userData);

        toast({
          title: 'Welcome back!',
          description: `Logged in as ${userData.username}`,
        });

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } catch (error: any) {
        toast({
          title: 'Login failed',
          description: error.message || 'Invalid email or password',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [toast]
  );

  const signupMemo = useCallback(
    async (username: string, email: string, password: string, onSuccess?: () => void) => {
      try {
        const response = await apiRequest('POST', '/api/auth/signup', {
          username,
          email,
          password,
        });

        const userData = await response.json();
        setUser(userData);

        toast({
          title: 'Account created!',
          description: `Welcome to Stargate, ${username}!`,
        });

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } catch (error: any) {
        toast({
          title: 'Signup failed',
          description: error.message || 'Failed to create account',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [toast]
  );

  const logoutMemo = useCallback(async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      setUser(null);

      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    } catch (error: any) {
      console.error('Logout failed:', error);
      // Still clear user state even if request fails
      setUser(null);
    }
  }, [toast]);

  // Helper function to check permissions - memoized to prevent re-renders
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user?.role) return false;

      // Administrator always has all permissions
      if (user.role === 'administrator') {
        return true;
      }

      // Simplified client-side permission check
      const ROLE_PERMISSIONS: Record<string, string[]> = {
        administrator: ['full_access'], // Has everything
        user: ['view_own_billing', 'view_own_usage', 'create_websites', 'edit_websites'],
        technical: [
          'view_own_billing',
          'view_all_usage',
          'view_own_usage',
          'view_analytics',
          'access_technical_tools',
          'manage_infrastructure',
          'view_logs',
          'manage_servers',
          'create_websites',
          'edit_websites',
        ],
        designer: [
          'view_own_billing',
          'view_own_usage',
          'create_websites',
          'edit_websites',
          'delete_websites',
          'manage_templates',
          'publish_websites',
        ],
      };

      const rolePerms = ROLE_PERMISSIONS[user.role] || [];
      return rolePerms.includes(permission) || rolePerms.includes('full_access');
    },
    [user?.role]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      role: (user?.role as UserRole) || null,
      isAdmin: user?.role === 'administrator',
      hasPermission,
      login: loginMemo,
      signup: signupMemo,
      logout: logoutMemo,
      checkAuth,
    }),
    [user, isLoading, hasPermission, loginMemo, signupMemo, logoutMemo, checkAuth]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
