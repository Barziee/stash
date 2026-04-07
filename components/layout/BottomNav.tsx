'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'ראשי',    Icon: LayoutDashboard },
  { href: '/transactions', label: 'תנועות',  Icon: ArrowLeftRight },
  { href: '/budgets',      label: 'תקציב',   Icon: PiggyBank },
  { href: '/settings',     label: 'הגדרות',  Icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex bg-[#191919] border-t border-[#272729] md:hidden">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
              active ? 'text-[#4a9e78]' : 'text-[#505052]'
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
