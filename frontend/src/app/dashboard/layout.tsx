'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader, MobileBottomNav } from '@/components/layout/Header';
import { GlobalReportView } from '@/components/layout/GlobalReportView';
import { useIsMounted } from '@/hooks/useIsMounted';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router = useRouter();
  const isMounted = useIsMounted();

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
    }
  }, [token, router]);

  // We only redirect if we are sure there is no token.
  // We don't return null for isMounted to prevent "waiting page" flashes of empty content.
  // Instead, we let the shell render.
  if (!token && isMounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopHeader />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 overflow-hidden">
          <div className="page-transition">
            {children}
          </div>
        </main>
        <MobileBottomNav />
      </div>
      <GlobalReportView />
    </div>
  );
}
