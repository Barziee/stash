import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'Personal finance tracker with NIS/USD support',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
