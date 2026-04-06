'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',     label: 'Dashboard',    Icon: LayoutDashboard },
  { href: '/transactions',  label: 'Transactions', Icon: ArrowLeftRight },
  { href: '/budgets',       label: 'Budgets',      Icon: PiggyBank },
  { href: '/settings',      label: 'Settings',     Icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen border-r bg-background p-4 gap-1">
      <h1 className="text-lg font-bold mb-4 px-2">💸 Expense Tracker</h1>
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              active
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </aside>
  );
}
