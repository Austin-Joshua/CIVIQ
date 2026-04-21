import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { AppToaster } from '@/components/providers/AppToaster';
import { WebSocketProvider } from '@/providers/WebSocketProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CIVIQ — Municipal Operations',
  description:
    'Secure municipal operations workspace for waste, recycling, routing, compliance, and field coordination.',
  keywords: [
    'municipal operations',
    'waste management',
    'public works',
    'recycling',
    'urban services',
  ],
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ToastProvider>
            <WebSocketProvider>
              {children}
              <AppToaster />
            </WebSocketProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
