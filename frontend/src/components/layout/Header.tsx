'use client';

import { Bell, Search, Sun, Moon, Leaf, User, LogOut, Settings, Check, CheckCheck, ArrowRight, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/authStore';
import { useState, useRef, useEffect } from 'react';
import { NAV_ITEMS } from './Sidebar';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useUIStore } from '@/store/uiStore';

const MOBILE_NAV = [
  { href: '/dashboard', icon: '⌂', label: 'Home' },
  { href: '/dashboard/map', icon: '⊹', label: 'Map' },
  { href: '/dashboard/routes', icon: '◎', label: 'Routes' },
  { href: '/dashboard/risk', icon: '⚠', label: 'Risk' },
  { href: '/dashboard/simulator', icon: '⟐', label: 'Sim' },
];

const MOCK_NOTIFS = [
  { id: '1', title: 'Zone C overflow risk detected', type: 'risk', read: false },
  { id: '2', title: 'Route V04 optimization complete', type: 'system', read: false },
  { id: '3', title: 'Sensor network sync failure in Zone D', type: 'risk', read: false },
  { id: '4', title: 'Nightly database backup successful', type: 'system', read: true },
  { id: '5', title: 'New AI policy recommendation available', type: 'system', read: true },
];

const SEARCHABLE_ITEMS = [
  { label: 'Command Nexus', href: '/dashboard', category: 'Node' },
  { label: 'Geospatial Map', href: '/dashboard/map', category: 'Node' },
  { label: 'Route Intelligence', href: '/dashboard/routes', category: 'Node' },
  { label: 'Sustainability Engine', href: '/dashboard/recycling', category: 'Node' },
  { label: 'Waste Management', href: '/dashboard/landfill', category: 'Node' },
  { label: 'Risk Evaluation', href: '/dashboard/risk', category: 'Node' },
  { label: 'Simulation Engine', href: '/dashboard/simulator', category: 'Node' },
  { label: 'Urban Intel', href: '/dashboard/analytics', category: 'Node' },
  { label: 'Identity Sync', href: '/dashboard/data', category: 'Node' },
  { label: 'Audit Console', href: '/dashboard/activity', category: 'Node' },
  { label: 'System Settings', href: '/dashboard/settings', category: 'Node' },
];

export function TopHeader() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { openMobileSidebar } = useUIStore();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const isMounted = useIsMounted();

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredResults = search.trim() 
    ? SEARCHABLE_ITEMS.filter(item => 
        item.label.toLowerCase().includes(search.toLowerCase()) || 
        item.category.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearchResults(false);
    }
    
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      }
    }

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const pathname = usePathname();

  return (
    <>
    <header className="sticky top-0 z-20 h-14 flex items-center px-4 lg:px-6 bg-background/80 backdrop-blur-md border-b border-border gap-2 font-outfit">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={openMobileSidebar}
        className="lg:hidden p-2 -ml-2 rounded-xl text-muted-foreground hover:text-emerald-500 transition-all interactive-scale"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div ref={searchRef} className={cn(
        "relative transition-all duration-300",
        isSearchExpanded ? "flex-1" : "flex-1 lg:max-w-md",
        "lg:flex" // Always visible on desktop
      )}>
        <div className={cn(
          "relative w-full transition-all duration-300",
          !isSearchExpanded && "hidden lg:block"
        )}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search zones, routes, pages…"
            className="w-full pl-9 pr-4 py-1.5 bg-card/50 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 transition-all"
          />
        </div>

        {/* Mobile Search Toggle */}
        <button 
          onClick={() => setIsSearchExpanded(!isSearchExpanded)}
          className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-emerald-500"
        >
          {isSearchExpanded ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
        </button>

        {showSearchResults && filteredResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
             <div className="p-2 space-y-1">
                {filteredResults.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      router.push(item.href);
                      setShowSearchResults(false);
                      setSearch('');
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-emerald-500/10 rounded-xl transition-all group group text-left"
                  >
                     <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <Search className="w-4 h-4" />
                     </div>
                     <div className="flex-1">
                        <p className="text-sm font-black text-foreground">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{item.category}</p>
                     </div>
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-3 h-3 text-emerald-500" />
                     </div>
                  </button>
                ))}
             </div>
          </div>
        )}
      </div>

      <div className={cn(
        "ml-auto flex items-center gap-1",
        isSearchExpanded && "hidden xs:flex lg:flex" // Hide icons in extreme mobile when search is expanded
      )}>
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5 transition-all interactive-scale"
        >
          {isMounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
            className="relative p-2 rounded-xl text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5 transition-all interactive-scale"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 shadow-lg shadow-emerald-500/20">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
                <h3 className="text-xs font-black text-foreground uppercase tracking-widest">System Alerts</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider transition-colors"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-64 overflow-y-auto">
                {notifs.map(n => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-center justify-between gap-4 px-4 py-3 border-b border-border/50 last:border-0 transition-colors hover:bg-muted/30",
                      !n.read ? "bg-primary/[0.02]" : "opacity-70"
                    )}
                  >
                    <span className={cn(
                      "text-xs truncate flex-1",
                      n.read ? "text-muted-foreground" : "text-foreground font-black"
                    )}>
                      {n.title}
                    </span>
                    <button
                      onClick={() => toggleRead(n.id)}
                      className={cn(
                        "p-1.5 rounded-lg transition-all flex-shrink-0",
                        n.read ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                      )}
                      title={n.read ? 'Mark unread' : 'Mark read'}
                    >
                      {n.read ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
                {notifs.length === 0 && (
                  <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No new notifications
                  </div>
                )}
              </div>

              {/* Footer */}
              <Link
                href="/dashboard/notifications"
                onClick={() => setShowNotifs(false)}
                className="block text-center py-2.5 text-[10px] font-bold text-primary uppercase tracking-wider border-t border-border hover:bg-muted/30 transition-colors"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        {/* User Avatar Dropdown */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
            className="flex items-center pl-2 border-l border-border ml-1 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xs font-bold">
              {isMounted ? (user?.name?.[0]?.toUpperCase() || 'U') : 'U'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-100">
              {/* User info */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-black text-foreground">{isMounted ? (user?.name || 'Administrator') : 'Administrator'}</p>
                <p className="text-[11px] text-muted-foreground">{isMounted ? (user?.email || 'admin@civiq.city') : 'admin@civiq.city'}</p>
                <span className="inline-block mt-1.5 text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {isMounted ? (user?.role || 'ADMIN') : 'ADMIN'}
                </span>
              </div>

              {/* Actions */}
              <div className="py-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-50"
                >
                  <Settings className="w-3.5 h-3.5" /> Settings
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-75"
                >
                  <User className="w-3.5 h-3.5" /> Profile
                </Link>
              </div>

              <div className="border-t border-border py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-500/5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
    </>
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
