'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Shield } from 'lucide-react';
import { useIsMounted } from '@/hooks/useIsMounted';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, allowedRoles, fallback }: ProtectedRouteProps) {
  const { user, hasHydrated } = useAuthStore();
  const router = useRouter();
  const isMounted = useIsMounted();

  useEffect(() => {
    if (hasHydrated && !user) {
      router.push('/auth/login');
    }
  }, [user, hasHydrated, router]);

  if (!isMounted || !hasHydrated) return null;

  if (!user) return null; // Will redirect via useEffect

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Shield className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-black mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          You do not have the necessary permissions to access this area.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
