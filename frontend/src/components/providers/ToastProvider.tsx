'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastProps[];
  toast: (props: Omit<ToastProps, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    ({ title, description, type = 'info', duration = 5000 }: Omit<ToastProps, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { id, title, description, type, duration };
      
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 w-full md:max-w-[420px] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastItem({ title, description, type = 'info', onDismiss }: ToastProps & { onDismiss: () => void }) {
  const Icon = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }[type];

  return (
    <div
      className={cn(
        "pointer-events-auto w-full rounded-xl border p-4 shadow-xl flex items-start gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300",
        type === 'success' && "bg-[#051109] border-emerald-500/20 text-emerald-400",
        type === 'error' && "bg-[#110505] border-red-500/20 text-red-400",
        type === 'warning' && "bg-[#110b05] border-orange-500/20 text-orange-400",
        type === 'info' && "bg-[#050b11] border-blue-500/20 text-blue-400"
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 w-full flex flex-col gap-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && <p className="text-xs opacity-80 leading-relaxed">{description}</p>}
      </div>
      <button 
        onClick={() => {
          setTimeout(onDismiss, 200);
        }}
        className="text-current opacity-50 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
