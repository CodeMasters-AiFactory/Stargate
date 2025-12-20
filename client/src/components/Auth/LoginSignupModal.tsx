import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, User, Sparkles, ArrowLeft, Github, Chrome } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface LoginSignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LoginSignupModal({ open, onOpenChange, onSuccess }: LoginSignupModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Auto-fill admin credentials from localStorage or use defaults
  const getStoredCredentials = () => {
    try {
      const stored = localStorage.getItem('stargate_admin_credentials');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // Ignore parse errors
    }
    // Default admin credentials
    return {
      email: 'info@code-masters.co.za',
      password: 'Diamond2024!!!',
    };
  };
  
  const storedCreds = getStoredCredentials();
  const [email, setEmail] = useState(storedCreds.email || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(storedCreds.password || '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  
  // Auto-fill credentials when modal opens
  useEffect(() => {
    if (open && isLogin) {
      const creds = getStoredCredentials();
      setEmail(creds.email || '');
      setPassword(creds.password || '');
    }
  }, [open, isLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, onSuccess);
      // Save credentials to localStorage for auto-fill next time
      try {
        localStorage.setItem('stargate_admin_credentials', JSON.stringify({ email, password }));
      } catch (e) {
        // Ignore localStorage errors
      }
      // Close modal on success
      onOpenChange(false);
      // Don't reset form - keep credentials for next time
    } catch (error) {
      // Error is handled by auth context toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    setIsLoading(true);
    try {
      await signup(username, email, password, onSuccess);
      // Close modal on success
      onOpenChange(false);
      // Reset form
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      // Error is handled by auth context toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-800/95 backdrop-blur-xl border-blue-500/20 !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2">
        <DialogHeader className="text-center space-y-4 pb-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <DialogTitle className="text-2xl font-bold text-white">Welcome to Stargate</DialogTitle>
            <DialogDescription className="text-blue-200/80 mt-2">
              Sign in to your dashboard or create a new account
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white hover:bg-slate-700/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={v => setIsLogin(v === 'login')}>
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-700/50">
            <TabsTrigger value="login" className="data-[state=active]:bg-blue-600">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-blue-600">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            {/* OAuth Buttons */}
            <div className="space-y-3 mb-4">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-white"
                onClick={() => {
                  // TODO: Implement Google OAuth
                  console.log('Google OAuth - Coming Soon');
                }}
              >
                <Chrome className="w-4 h-4 mr-2" />
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-white"
                onClick={() => {
                  // TODO: Implement GitHub OAuth
                  console.log('GitHub OAuth - Coming Soon');
                }}
              >
                <Github className="w-4 h-4 mr-2" />
                Continue with GitHub
              </Button>
            </div>

            <div className="relative my-4">
              <Separator className="bg-slate-600" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 px-2 text-xs text-gray-400">
                or continue with email
              </span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="modal-login-email" className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="modal-login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="modal-login-password" className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="modal-login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="modal-signup-username"
                  className="text-sm font-medium text-gray-300"
                >
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="modal-signup-username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="modal-signup-email" className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="modal-signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="modal-signup-password"
                  className="text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="modal-signup-password"
                    type="password"
                    placeholder="Create a password (min. 6 characters)"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="modal-signup-confirm" className="text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="modal-signup-confirm"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                    required
                    disabled={isLoading}
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={
                  isLoading ||
                  !username ||
                  !email ||
                  !password ||
                  password !== confirmPassword ||
                  password.length < 6
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
