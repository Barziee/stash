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

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen border-s border-[#22222e] bg-[#1a1a24] p-4 gap-1">
      <h1 className="text-lg font-bold mb-4 px-2 text-white">💸 מעקב הוצאות</h1>
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors border-e-2 ${
              active
                ? 'border-[#3ecf8e] text-[#3ecf8e] bg-[#3ecf8e11]'
                : 'border-transparent text-[#555] hover:bg-[#252535] hover:text-[#888]'
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
