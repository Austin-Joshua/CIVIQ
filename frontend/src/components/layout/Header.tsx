'use client';

import { Bell, Search, Sun, Moon, Menu, Leaf } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const MOBILE_NAV = [
  { href: '/dashboard', icon: '⌂', label: 'Home' },
  { href: '/dashboard/map', icon: '⊹', label: 'Map' },
  { href: '/dashboard/routes', icon: '◎', label: 'Routes' },
  { href: '/dashboard/risk', icon: '⚠', label: 'Risk' },
  { href: '/dashboard/simulator', icon: '⟐', label: 'Sim' },
];

export function TopHeader() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');

  return (
    <header className="sticky top-0 z-20 h-14 flex items-center px-4 lg:px-6 bg-background/80 backdrop-blur-md border-b border-border gap-3">
      {/* Logo on mobile */}
      <div className="lg:hidden flex items-center gap-2 mr-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span className="text-foreground font-bold text-base">CIVIQ</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search zones, routes, alerts…"
          className="w-full pl-9 pr-4 py-1.5 bg-card/50 border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <Link href="/dashboard/notifications" className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500"></span>
        </Link>

        {/* User avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-foreground/90 text-xs font-medium leading-none">{user?.name || 'User'}</p>
            <p className="text-muted-foreground text-[10px] mt-0.5">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around pb-safe">
        {MOBILE_NAV.map(({ href, icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn(
                'flex flex-col items-center gap-1 py-3 px-4 min-w-0 flex-1',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
              <span className="text-lg leading-none">{icon}</span>
              <span className="text-[10px] font-medium truncate">{label}</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
