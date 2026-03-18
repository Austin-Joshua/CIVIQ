'use client';

import { User, Mail, Shield, MapPin, Calendar, Clock, Edit2, LogOut, Activity, BarChart3, Leaf } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { SectionHeader } from '@/components/ui/Cards';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Your Identity" subtitle="Operational credentials and system permissions within the CIVIQ network." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card/50 border border-border rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <User className="w-32 h-32 text-foreground" />
            </div>
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-emerald-900/50 mb-6 border-4 border-background/50">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <h2 className="text-2xl font-bold text-foreground">{user?.name || 'User'}</h2>
              <p className="text-primary text-sm font-bold uppercase tracking-widest mt-1">{user?.role?.replace('_', ' ') || 'Officer'}</p>
              
              <div className="w-full mt-8 space-y-4 text-left border-t border-border pt-8">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{user?.email || 'admin@civiq.city'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Level 4 Clearance</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Metropolitan HQ</span>
                </div>
              </div>

              <button className="w-full mt-10 py-3 bg-foreground/5 border border-border hover:bg-muted rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full py-4 text-red-500/60 hover:text-red-400 text-xs font-bold uppercase tracking-widest transition-all border border-red-500/10 hover:border-red-500/20 hover:bg-red-500/5 rounded-2xl flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Terminate Session
          </button>
        </div>

        {/* Stats & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card/50 border border-border rounded-2xl p-5">
              <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mb-3" />
              <p className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-widest mb-1">Commands issued</p>
              <p className="text-xl font-bold text-foreground">1,242</p>
            </div>
            <div className="bg-card/50 border border-border rounded-2xl p-5">
              <BarChart3 className="w-5 h-5 text-teal-500 dark:text-teal-400 mb-3" />
              <p className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-widest mb-1">Decisions made</p>
              <p className="text-xl font-bold text-foreground">482</p>
            </div>
            <div className="bg-card/50 border border-border rounded-2xl p-5">
              <Leaf className="w-5 h-5 text-emerald-500 dark:text-emerald-300 mb-3" />
              <p className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-widest mb-1">Eco Impact</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">12.4T</p>
            </div>
          </div>

          <div className="bg-card/50 border border-border rounded-2xl p-8">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-8 border-l-2 border-border pl-4">Session History</h3>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 pb-6 border-b border-border last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Session {i === 1 ? 'Established' : 'Logged'} • HQ Gateway</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">System login from IP 192.168.1.{100+i} using biometric verification.</p>
                    <div className="mt-3 flex items-center gap-4 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Mar {17-i}, 2026</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> 09:42 AM</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
