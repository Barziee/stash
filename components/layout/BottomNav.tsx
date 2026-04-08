'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Settings, BarChart2 } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'ראשי',    Icon: LayoutDashboard },
  { href: '/transactions', label: 'תנועות',  Icon: ArrowLeftRight },
  { href: '/analytics',   label: 'ניתוח',   Icon: BarChart2 },
  { href: '/budgets',      label: 'תקציב',   Icon: PiggyBank },
  { href: '/settings',     label: 'הגדרות',  Icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex bg-card/80 backdrop-blur-lg border-t border-border md:hidden">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs transition-all duration-200 press-scale relative ${
              active ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div className="relative">
              <Icon size={20} className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
              {active && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-fade-in" />
              )}
            </div>
            <span className={`transition-all duration-200 ${active ? 'font-semibold' : 'font-normal'}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
