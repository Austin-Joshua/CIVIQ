'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader, MobileBottomNav } from '@/components/layout/Header';
import { cn } from '@/lib/utils';
import { useIsMounted } from '@/hooks/useIsMounted';

const GlobalReportView = dynamic(
  () => import('@/components/layout/GlobalReportView').then((mod) => mod.GlobalReportView),
  { ssr: false }
);

const AICopilot = dynamic(
  () => import('@/components/ui/AICopilot').then((mod) => mod.AICopilot),
  { ssr: false }
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token, hasHydrated } = useAuthStore();
  const { isSidebarCollapsed } = useUIStore();
  const router = useRouter();
  const isMounted = useIsMounted();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    // Keep middleware-visible cookie in sync for server-side route protection.
    document.cookie = `civiq_auth=${encodeURIComponent(token)}; Path=/; Max-Age=86400; SameSite=Lax`;
  }, [hasHydrated, token, router]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        Loading dashboard...
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-[#020617] dark:to-[#0a0f1f] text-foreground relative flex transition-colors duration-300">
      <Sidebar />
      <div className={cn(
        "flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-300 ease-in-out w-full",
        isMounted && isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        <TopHeader />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 overflow-hidden flex flex-col">
          <div className="page-transition flex-1 h-full w-full">
            {children}
          </div>
        </main>
        <MobileBottomNav />
      </div>
      <GlobalReportView />
      <AICopilot />
    </div>
  );
}
