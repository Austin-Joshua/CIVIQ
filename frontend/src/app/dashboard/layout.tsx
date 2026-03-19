'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader, MobileBottomNav } from '@/components/layout/Header';

const GlobalReportView = dynamic(
  () => import('@/components/layout/GlobalReportView').then((mod) => mod.GlobalReportView),
  { ssr: false }
);

const AICopilot = dynamic(
  () => import('@/components/ui/AICopilot').then((mod) => mod.AICopilot),
  { ssr: false }
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    // Keep middleware-visible cookie in sync for server-side route protection.
    document.cookie = `civiq_auth=${encodeURIComponent(token)}; Path=/; Max-Age=86400; SameSite=Lax`;
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen relative z-10">
        <TopHeader />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 overflow-hidden">
          <div className="page-transition">
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
