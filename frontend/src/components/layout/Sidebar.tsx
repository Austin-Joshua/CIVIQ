'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Map, Route, TrendingUp, Recycle,
  Layers, AlertTriangle, Sliders, Settings, Bell,
  User, LogOut, Leaf, ChevronRight, Activity, Database, FileText
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Command Center' },
  { href: '/dashboard/map', icon: Map, label: 'Command Map' },
  { href: '/dashboard/routes', icon: Route, label: 'Route Intelligence' },
  { href: '/dashboard/forecast', icon: TrendingUp, label: 'Waste Forecast' },
  { href: '/dashboard/recycling', icon: Recycle, label: 'Recycling Planner' },
  { href: '/dashboard/landfill', icon: Layers, label: 'Landfill Intel' },
  { href: '/dashboard/risk', icon: AlertTriangle, label: 'Risk Monitor' },
  { href: '/dashboard/simulator', icon: Sliders, label: 'Decision Simulator' },
  { href: '/dashboard/analytics', icon: Activity, label: 'Analytics' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-background border-r border-border fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow shadow-emerald-900/20 flex-shrink-0">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-foreground font-bold text-lg tracking-tight">CIVIQ</span>
          <p className="text-[10px] text-primary font-medium uppercase tracking-widest -mt-0.5">Urban OS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-widest px-2 mb-2">Platform</p>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
              )}>
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
              <span>{label}</span>
              {isActive && <ChevronRight className="w-3 h-3 ml-auto text-primary/50" />}
            </Link>
          );
        })}

        <div className="my-3 border-t border-border" />
        <p className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-widest px-2 mb-2">Account & Utilities</p>
        <Link href="/dashboard/data" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all">
          <Database className="w-4 h-4 text-muted-foreground/80" /><span>Data Management</span>
        </Link>
        <Link href="/dashboard/activity" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all">
          <FileText className="w-4 h-4 text-muted-foreground/80" /><span>Activity Logs</span>
        </Link>
        <Link href="/dashboard/notifications" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all">
          <Bell className="w-4 h-4 text-muted-foreground/80" /><span>Notifications</span>
        </Link>
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all">
          <Settings className="w-4 h-4 text-muted-foreground/80" /><span>Settings</span>
        </Link>
        <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all">
          <User className="w-4 h-4 text-muted-foreground/80" /><span>Profile</span>
        </Link>
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground/90 text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-muted-foreground text-xs truncate">{user?.role?.replace('_', ' ') || 'Operator'}</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
