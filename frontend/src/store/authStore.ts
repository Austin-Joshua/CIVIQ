'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId?: string;
  organizationName?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

const AUTH_COOKIE = 'civiq_auth';

function setAuthCookie(token: string) {
  if (typeof document === 'undefined') return;
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=86400; SameSite=Lax${secure}`;
}

function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      let timeoutId: NodeJS.Timeout | null = null;
      const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

      const resetTimeout = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (get().token) {
          timeoutId = setTimeout(() => {
            get().logout();
            if (typeof window !== 'undefined') {
               window.location.href = '/auth/login?expired=true';
            }
          }, SESSION_TIMEOUT_MS);
        }
      };

      if (typeof window !== 'undefined') {
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        events.forEach(e => window.addEventListener(e, resetTimeout, { passive: true }));
      } // Initial setup

      return {
        user: null,
        token: null,
        hasHydrated: false,
        setAuth: (user, token) => {
          setAuthCookie(token);
          set({ user, token });
          resetTimeout();
        },
        logout: () => {
          clearAuthCookie();
          if (timeoutId) clearTimeout(timeoutId);
          set({ user: null, token: null });
        },
        setHasHydrated: (value) => {
           set({ hasHydrated: value });
           if (value) resetTimeout();
        },
      };
    },
    {
      name: 'civiq-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
