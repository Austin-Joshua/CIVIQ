'use client';

import { Toaster } from 'sonner';

/**
 * Single app-wide toast surface — neutral, accessible styling suitable for a public-sector portal.
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      closeButton
      richColors={false}
      expand={false}
      visibleToasts={5}
      toastOptions={{
        duration: 5200,
        classNames: {
          toast:
            'group border border-border bg-card text-card-foreground shadow-md rounded-md font-sans',
          title: 'text-sm font-semibold text-foreground',
          description: 'text-xs text-muted-foreground leading-snug',
          success: 'border-emerald-700/25',
          error: 'border-destructive/40',
          warning: 'border-amber-600/35',
          info: 'border-primary/30',
        },
      }}
    />
  );
}
