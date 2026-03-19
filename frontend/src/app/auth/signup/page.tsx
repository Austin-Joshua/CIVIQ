'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  Shield, 
  Globe, 
  Zap, 
  BarChart3, 
  Users, 
  Database, 
  Layout, 
  ArrowUpRight,
  Maximize2,
  CheckCircle2,
  Cpu,
  Fingerprint,
  Bot
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { getApiBaseUrl } from '@/lib/api/baseUrl';

const API_URL = getApiBaseUrl();

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || 'Signup failed');
      }

      setAuth(
        {
          id: String(payload.user.id),
          name: payload.user.name,
          email: payload.user.email,
          role: payload.user.role,
        },
        payload.token
      );
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Deployment request failed. Network latency detected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 lg:p-10 font-outfit overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 -left-1/4 w-[1000px] h-[1000px] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-0 -right-1/4 w-[1000px] h-[1000px] bg-teal-500/10 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-3xl auth-flip-enter">
        <div className="grid grid-cols-1 lg:grid-cols-2">
         {/* Visual Side */}
         <div className="hidden lg:block relative bg-[#022c22] overflow-hidden border-r border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-[#064e3b] to-[#022c22] z-10" />
            
            <div className="absolute inset-0 flex flex-col justify-center p-20 z-20">
              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-emerald-500/30 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-36 h-36 rounded-[2.5rem] bg-slate-950/40 backdrop-blur-3xl border-2 border-white/10 flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.2)] group-hover:border-emerald-500/50 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    <img src="/globe.svg" className="w-24 h-24 object-contain relative z-10 drop-shadow-2xl" alt="CIVIQ" />
                  </div>
                </div>
                <h2 className="text-6xl font-black tracking-tighter leading-tight text-white">
                  Built for <br /> <span className="text-emerald-500">Scale.</span>
                </h2>
                <div className="h-1.5 w-24 bg-emerald-500 rounded-full" />
                <p className="text-slate-300 font-medium text-lg leading-relaxed max-w-sm">
                  Initialize your district node and start transforming waste into actionable intelligence.
                </p>
              </div>
            </div>

            {/* Stats removed for cleaner SaaS UI */}
          </div>

          {/* Form Side */}
          <div className="p-8 lg:p-20 flex flex-col justify-center bg-slate-900 text-slate-200">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-emerald-500 transition-colors mb-8 lg:mb-12 group w-fit p-1 -ml-1"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
              <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest">Back to Vision</span>
            </button>

            {/* Mobile Logo */}
            <div className="lg:hidden mb-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-950/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-xl">
                <img src="/globe.svg" className="w-8 h-8 object-contain" alt="CIVIQ" />
              </div>
              <div>
                <span className="text-foreground font-black text-xl tracking-tighter block">CIVIQ</span>
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Urban OS</span>
              </div>
            </div>

            <div className="mb-10">
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white mb-4">Sign Up</h1>
              <p className="text-slate-400 font-medium">Create your administrative node credentials.</p>
            </div>

            <div className="max-w-md w-full mx-auto">
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="signup-name" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
                  <input
                    id="signup-name"
                    type="text"
                    placeholder="Operator Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-800 border-none rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all text-sm font-medium text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="admin@civiq.city"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-800 border-none rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all text-sm font-medium text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Password</label>
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-800 border-none rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all text-sm font-medium text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl transition-all shadow-xl shadow-emerald-900/40 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-xs mt-4"
                >
                  {loading ? 'Processing...' : 'Deploy Node'} 
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </div>

            <p className="mt-10 text-center text-sm text-muted-foreground font-medium">
              Already have a node?{' '}
              <Link href="/auth/login" className="text-emerald-500 font-black hover:underline underline-offset-4 decoration-2">
                Authorized Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
