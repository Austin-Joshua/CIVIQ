'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Map, Route, TrendingUp, Recycle,
  Layers, AlertTriangle, Sliders, Settings,
  Leaf, ChevronRight, Activity, Database, FileText, X, ShieldCheck,
  Building2, Users, Share2, CreditCard, ChevronLeft, PanelLeftClose, PanelLeftOpen,
  Monitor, Zap, BarChart3, ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

export const NAV_CATEGORIES = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Executive Dashboard' },
      { href: '/dashboard/incidents', icon: AlertTriangle, label: 'Command Center' },
      { href: '/dashboard/notifications', icon: Zap, label: 'Alerts' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { href: '/dashboard/map', icon: Monitor, label: 'Asset Monitor' },
      { href: '/dashboard/routes', icon: Route, label: 'Route Intelligence' },
    ]
  },
  {
    label: 'Planning',
    items: [
      { href: '/dashboard/forecast', icon: TrendingUp, label: 'Forecasting' },
      { href: '/dashboard/recycling', icon: Recycle, label: 'Recycling Planner' },
      { href: '/dashboard/landfill', icon: Layers, label: 'Landfill Intelligence' },
    ]
  },
  {
    label: 'Analysis',
    items: [
      { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics Center' },
      { href: '/dashboard/compliance', icon: ShieldCheck, label: 'Sustainability Metrics' },
      { href: '/dashboard/activity', icon: ClipboardList, label: 'Reports' },
    ]
  },
  {
    label: 'Administration',
    items: [
      { href: '/dashboard/users', icon: Users, label: 'Users & Roles' },
      { href: '/dashboard/data', icon: Database, label: 'Data Manager' },
      { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { 
    isMobileSidebarOpen, 
    closeMobileSidebar, 
    isSidebarCollapsed, 
    toggleSidebarCollapse 
  } = useUIStore();

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
        "fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out flex flex-col border-r border-border liquid-glass backdrop-blur-xl",
        // Desktop widths
        isSidebarCollapsed ? "lg:w-20" : "lg:w-64",
        // Mobile behavior
        isMobileSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header / Logo Section */}
        <div className={cn(
          "flex items-center justify-between pt-6 pb-4 px-4 mb-2 transition-all",
          isSidebarCollapsed ? "flex-col gap-4 px-2" : "px-6"
        )}>
          <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden">
            <div className={cn(
              "rounded-xl overflow-hidden flex-shrink-0 shadow-xl shadow-emerald-500/10 border border-white/10 glow-accent transition-all",
              isSidebarCollapsed ? "w-10 h-10" : "w-12 h-12"
            )}>
              <img src="/logo.png" alt="CIVIQ Logo" className="w-full h-full object-cover relative z-10" />
            </div>
            {!isSidebarCollapsed && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-foreground font-black text-2xl tracking-tighter block leading-none">CIVIQ</span>
                <p className="text-[8px] text-primary font-black uppercase tracking-[0.3em] mt-1 opacity-80">Command</p>
              </div>
            )}
          </Link>
          
          {/* Mobile Close Button / Desktop Collapse Toggle removed in favor of external header toggle */}
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 px-3 py-4 space-y-6 overflow-y-auto no-scrollbar transition-all",
          isSidebarCollapsed && "px-2"
        )}>
          {NAV_CATEGORIES.map((category) => {
            // RBAC Filter
            if (category.label === 'Administration' && 
                !['SUPER_ADMIN', 'GOV_ADMIN', 'OPS_MANAGER'].includes(user?.role || '')) {
              return null;
            }

            return (
              <div key={category.label} className="space-y-1">
                {!isSidebarCollapsed ? (
                  <h3 className="px-4 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-2 animate-in fade-in duration-500">
                    {category.label}
                  </h3>
                ) : (
                  <div className="h-px bg-border/50 mx-2 mb-4" />
                )}

                <div className="space-y-1">
                  {category.items.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => {
                          if (window.innerWidth < 1024) closeMobileSidebar();
                        }}
                        title={isSidebarCollapsed ? label : undefined}
                        className={cn(
                          'flex items-center rounded-xl text-sm font-bold transition-all duration-150 group relative overflow-hidden',
                          isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-4 py-2.5",
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-500 shadow-[inset_0_0_12px_rgba(16,185,129,0.05)]'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
                        )}>
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full shadow-[0_0_8px_#10b981]" />
                        )}
                        
                        <Icon className={cn(
                          'flex-shrink-0 transition-all duration-200',
                          isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4",
                          isActive ? 'text-emerald-500 scale-110' : 'text-muted-foreground group-hover:text-emerald-500 group-hover:scale-110'
                        )} />
                        
                        {!isSidebarCollapsed && (
                          <span className="tracking-tight transition-all duration-200 truncate">{label}</span>
                        )}
                        
                        {isActive && !isSidebarCollapsed && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom Status (Optional) */}
        {!isSidebarCollapsed && (
          <div className="p-6 border-t border-border/50 bg-background/20">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Online</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
