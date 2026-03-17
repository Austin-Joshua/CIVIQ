'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader, MobileBottomNav } from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-[#060d08] text-white">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopHeader />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
