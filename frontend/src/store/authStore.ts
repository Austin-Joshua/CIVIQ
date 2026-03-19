'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const AUTH_COOKIE = 'civiq_auth';

function setAuthCookie(token: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=86400; SameSite=Lax`;
}

function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        setAuthCookie(token);
        set({ user, token });
      },
      logout: () => {
        clearAuthCookie();
        set({ user: null, token: null });
      },
    }),
    {
      name: 'civiq-auth',
    }
  )
);
