'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'לוח בקרה',  Icon: LayoutDashboard },
  { href: '/transactions', label: 'עסקאות',    Icon: ArrowLeftRight },
  { href: '/budgets',      label: 'תקציבים',   Icon: PiggyBank },
  { href: '/settings',     label: 'הגדרות',    Icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex bg-[#1a1a24] border-t border-[#22222e] md:hidden">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
              active ? 'text-[#3ecf8e]' : 'text-[#555]'
            }`}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
