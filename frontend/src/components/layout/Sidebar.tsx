'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Map, Route, TrendingUp, Recycle,
  Layers, AlertTriangle, Sliders, Settings,
  Leaf, ChevronRight, Activity, Database, FileText, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

export const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Command Nexus' },
  { href: '/dashboard/map', icon: Map, label: 'Geospatial Map' },
  { href: '/dashboard/routes', icon: Route, label: 'Route Intel' },
  { href: '/dashboard/forecast', icon: TrendingUp, label: 'Predictive Ops' },
  { href: '/dashboard/compliance', icon: ShieldCheck, label: 'Gov. Compliance' },
  { href: '/dashboard/recycling', icon: Recycle, label: 'Sustainability' },
  { href: '/dashboard/landfill', icon: Layers, label: 'Waste Management' },
  { href: '/dashboard/risk', icon: AlertTriangle, label: 'Risk Evaluation' },
  { href: '/dashboard/simulator', icon: Sliders, label: 'Sim Engine' },
  { href: '/dashboard/analytics', icon: Activity, label: 'Urban Intel' },
  { href: '/dashboard/data', icon: Database, label: 'Identity Sync' },
  { href: '/dashboard/activity', icon: FileText, label: 'Audit Console' },
  { href: '/dashboard/settings', icon: Settings, label: 'System Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isMobileSidebarOpen, closeMobileSidebar } = useUIStore();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen liquid-glass border-r border-border transition-transform duration-300 lg:translate-x-0 lg:w-64 flex flex-col",
        isMobileSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full w-64"
      )}>
        <div className="flex items-center justify-between pt-8 pb-4 px-6 mb-2">
          <Link href="/" className="flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden flex-shrink-0 shadow-2xl shadow-emerald-500/20 border border-white/10 glow-accent">
              <img src="/logo.png" alt="CIVIQ Logo" className="w-full h-full object-cover relative z-10" />
            </div>
            <div>
              <span className="text-foreground font-black text-4xl tracking-tighter block leading-none">CIVIQ</span>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em] mt-1.5 opacity-80">Urban OS</p>
            </div>
          </Link>
          
          {/* Mobile Close Button */}
          <button 
            onClick={closeMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Selector */}
        <div className="px-4 mb-4">
          <div className="w-full flex items-center justify-between px-3 py-2 bg-background/40 hover:bg-background/60 border border-white/5 rounded-xl transition-colors cursor-pointer group">
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs uppercase">
                CT
              </div>
              <div className="flex flex-col truncate">
                 <span className="text-xs font-bold text-foreground truncate">CIVIQ Demo City</span>
                 <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Enterprise</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link 
                key={href} 
                href={href}
                onClick={() => {
                  if (window.innerWidth < 1024) closeMobileSidebar();
                }}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-75 group relative overflow-hidden interactive-scale',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-500 glow-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-emerald-500/5'
                )}>
                {isActive && <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 transition-transform duration-100 rounded-r-full",
                  isActive ? "scale-y-100" : "scale-y-0 group-hover:scale-y-50"
                )} />
                <Icon className={cn('w-4 h-4 flex-shrink-0 transition-colors duration-75 relative z-10', isActive ? 'text-emerald-500' : 'text-muted-foreground group-hover:text-emerald-500')} />
                <span className="tracking-tight relative z-10">{label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] relative z-10" />
                )}
              </Link>
            );
          })}
        </nav>

      </aside>
    </>
  );
}
