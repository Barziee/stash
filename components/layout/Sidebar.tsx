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

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen border-s border-sidebar-border bg-sidebar p-4 gap-1">
      <div className="flex items-center gap-2 mb-5 px-2">
        <StashLogo size={22} />
        <h1 className="text-base font-bold text-sidebar-foreground tracking-wide">Stash</h1>
      </div>
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors border-e-2 ${
              active
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
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

function StashLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="14" rx="2.5" className="fill-card stroke-primary" strokeWidth="1.5"/>
      <rect x="7" y="3" width="10" height="5" rx="1.5" className="fill-background stroke-primary" strokeWidth="1.5"/>
      <circle cx="12" cy="13" r="2.5" className="fill-primary" opacity="0.85"/>
      <path d="M10.5 13.5 L11.5 14.5 L13.5 12" className="stroke-background" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
