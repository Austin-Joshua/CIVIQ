import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { WebSocketProvider } from '@/providers/WebSocketProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CIVIQ',
  description: 'The Brain Behind Clean Cities — Predict. Optimize. Sustain.',
  keywords: ['smart city', 'waste management', 'urban intelligence', 'sustainability'],
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} font-sans antialiased text-foreground bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <ToastProvider>
            <WebSocketProvider>
              {children}
            </WebSocketProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
