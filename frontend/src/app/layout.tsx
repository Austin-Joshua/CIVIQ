import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CIVIQ — Urban Intelligence OS',
  description: 'The Brain Behind Clean Cities — Predict. Optimize. Sustain.',
  keywords: ['smart city', 'waste management', 'urban intelligence', 'sustainability'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased text-foreground bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
