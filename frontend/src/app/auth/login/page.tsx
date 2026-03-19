'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { 
  ArrowLeft, 
  ArrowRight, 
  Eye,
  EyeOff,
  Sun,
  Moon
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

function toDisplayName(identifier: string) {
  const local = identifier.split('@')[0] || 'user';
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
    .trim();
}

function normalizeUsername(input: string) {
  const value = input.trim().toLowerCase();
  if (!value) return 'guest_user';
  if (value.includes('@')) {
    return value.split('@')[0] || 'guest_user';
  }
  return value.replace(/[^a-z0-9._-]/g, '') || 'guest_user';
}

function normalizeEmailFromUsername(username: string) {
  return `${username}@civiq.city`;
}

function buildLocalToken(username: string) {
  const nonce = Math.random().toString(36).slice(2);
  return `local-${username}-${Date.now()}-${nonce}`;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotHelp, setShowForgotHelp] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const target = searchParams.get('next') || '/dashboard';

  useEffect(() => {
    setMounted(true);
  }, []);

  const finishLogin = (user: { id: string; name: string; email: string; role: string }, token: string) => {
    setAuth(user, token);
    router.replace(target);
    setTimeout(() => {
      if (window.location.pathname !== target) {
        window.location.assign(target);
      }
    }, 150);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const username = normalizeUsername(email);
      const displayName = toDisplayName(username);
      const accountEmail = normalizeEmailFromUsername(username);

      finishLogin(
        {
          id: `local-${username}`,
          name: displayName,
          email: accountEmail,
          role: 'OPS_MANAGER',
        },
        buildLocalToken(username)
      );
      toast.success(`Welcome, ${displayName}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    finishLogin(
      {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@civiq.city',
        role: 'VIEWER',
      },
      'demo-access-token'
    );
    toast.success('Signed in with demo access.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-page-from to-page-to flex items-center justify-center p-4 lg:p-6 font-outfit overflow-hidden text-foreground transition-colors duration-300">
      {/* Theme Toggle in Top Right Corner of Viewport */}
      <button
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed top-8 right-8 z-50 h-12 w-12 rounded-2xl border border-slate-300 dark:border-white/10 bg-white/80 dark:bg-slate-950/60 backdrop-blur shadow-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-emerald-500 transition-all active:scale-95"
        aria-label="Toggle theme"
      >
        {mounted && theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 -left-1/4 w-[1000px] h-[1000px] bg-emerald-500/20 dark:bg-emerald-500/10 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-0 -right-1/4 w-[1000px] h-[1000px] bg-teal-500/20 dark:bg-teal-500/10 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-5xl bg-panel-bg border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-3xl auth-flip-enter">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Visual Side (Fixed on Left) */}
          <div className="hidden lg:block relative bg-visual-to overflow-hidden auth-panel-slide-right">
            <div className="absolute inset-0 bg-gradient-to-br from-visual-from to-visual-to z-10" />
            <button 
              onClick={() => router.push('/')}
              className="absolute top-10 left-10 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors group w-fit p-1"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
              <span className="text-xs font-black uppercase tracking-widest">Back to Vision</span>
            </button>
            <div className="absolute inset-0 flex flex-col justify-center p-14 z-20">
              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-emerald-500/30 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-32 h-32 rounded-[2rem] bg-slate-950/40 backdrop-blur-3xl border-2 border-white/10 flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.2)] group-hover:border-emerald-500/50 transition-all duration-300 overflow-hidden">
                    <img src="/logo.png" className="w-20 h-20 object-cover relative z-10 drop-shadow-2xl" alt="CIVIQ" />
                  </div>
                </div>
                <h2 className="text-5xl font-black tracking-tighter leading-tight text-white">
                  Manage your city <br /> <span className="text-emerald-500">in one place.</span>
                </h2>
                <div className="h-1.5 w-20 bg-emerald-500 rounded-full" />
                <p className="text-slate-300 font-medium text-base leading-relaxed max-w-xs">
                  Track operations, incidents, and reports from a single dashboard.
                </p>
              </div>
            </div>
            {/* Stats removed for cleaner SaaS UI */}
          </div>

          {/* Form Side (On Right) */}
          <div className="p-8 lg:p-14 flex flex-col justify-center bg-panel-bg text-foreground auth-panel-slide-left">
            {/* Mobile Logo Branding */}
            <div className="lg:hidden mb-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-950/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-xl">
                <img src="/logo.png" className="w-8 h-8 object-cover" alt="CIVIQ" />
              </div>
              <span className="text-foreground font-black text-xl tracking-tighter block">CIVIQ</span>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-black tracking-tighter text-foreground mb-3 uppercase">Login</h1>
              <p className="text-muted-foreground font-medium text-sm">Sign in to your account.</p>
            </div>

            <div className="max-w-md w-full mx-auto">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email or Username</label>
                  <input
                    id="login-email"
                    type="text"
                    placeholder="Enter your username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3 bg-input-bg border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all text-sm font-medium text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="login-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Password</label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 py-3 pr-12 bg-input-bg border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all text-sm font-medium text-foreground placeholder:text-muted-foreground"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-500">Any username and password will sign in.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForgotHelp((prev) => !prev)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </button>

                {showForgotHelp && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-slate-700 dark:text-slate-200 space-y-1">
                    <p><strong>Option 1:</strong> Reset by creating a new account with another email.</p>
                    <p><strong>Option 2:</strong> Use Quick Access below to enter instantly.</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl transition-all shadow-xl shadow-emerald-900/40 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-xs mt-4"
                >
                  {loading ? 'Signing in...' : 'Sign In'} 
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleGuestAccess}
                  disabled={loading}
                  className="w-full py-3 bg-secondary hover:bg-secondary/80 disabled:opacity-50 text-secondary-foreground font-black rounded-xl transition-all active:scale-[0.98] text-xs uppercase tracking-widest"
                >
                  {loading ? 'Please wait...' : 'Quick Access (No Password)'}
                </button>
              </form>
            </div>

            <div className="mt-6 text-center text-xs text-slate-400">
              <p>Default login: <span className="text-slate-600 dark:text-slate-200">admin@civiq.city</span> / <span className="text-slate-600 dark:text-slate-200">civiq2026</span></p>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
              New user?{' '}
              <Link href="/auth/signup" className="text-emerald-500 font-black hover:underline underline-offset-4 decoration-2">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
