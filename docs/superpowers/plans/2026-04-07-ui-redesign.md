# UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the app as a dark-finance theme (Revolut/Robinhood feel) with a hero balance, horizontal month-strip navigation, income privacy toggle, and modernized transaction/budget UI.

**Architecture:** All changes are pure UI — no new data models or API routes. New files: `hooks/usePrivacyMode.ts`, `components/dashboard/MonthStrip.tsx`. Modified files: globals.css, layout.tsx, dashboard page, and 7 existing components. Tests updated/added for changed behaviour.

**Tech Stack:** Next.js 14 App Router · Tailwind CSS v4 · Dexie.js · Recharts · React Testing Library

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `app/globals.css` | Modify | Override CSS vars with dark palette; add `.scrollbar-none` utility |
| `app/layout.tsx` | Modify | Add `class="dark"` to `<html>` for shadcn dark-mode CSS cascade |
| `hooks/usePrivacyMode.ts` | Create | `[hidden, toggle]` — localStorage-backed privacy toggle |
| `components/dashboard/MonthStrip.tsx` | Create | Horizontal scrollable month chips + year savings bar |
| `app/dashboard/page.tsx` | Modify | Wire MonthStrip, hero balance, privacy toggle; remove arrow buttons |
| `components/dashboard/MonthlySummary.tsx` | Modify | 2-col (income + spent), accept `hidden` prop, dark styling |
| `components/dashboard/SpendingChart.tsx` | Modify | Dark tooltip style |
| `components/transactions/TransactionItem.tsx` | Modify | Left category-color border stripe, dark colours |
| `components/transactions/TransactionFilters.tsx` | Modify | Replace Select dropdowns with pill buttons |
| `components/budgets/BudgetCard.tsx` | Modify | Slim 4px gradient bar, no Badge, glow border on over-budget |
| `components/layout/BottomNav.tsx` | Modify | Dark surface, green active tab |
| `components/layout/Sidebar.tsx` | Modify | Dark surface, green active left-border |
| `__tests__/hooks/usePrivacyMode.test.ts` | Create | Toggle + persistence tests |
| `__tests__/components/BudgetCard.test.tsx` | Modify | Update assertion from `'🍔 Food'` → `'Food'` (emoji removed from header) |

---

## Task 1: Dark Theme — globals.css + layout.tsx

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `:root` CSS variables and add scrollbar utility**

Replace the entire contents of `app/globals.css` with:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-sans);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

/* ── Dark Finance palette — applied as the single global theme ── */
:root {
  --background: #0f0f13;
  --foreground: #ffffff;
  --card: #1a1a24;
  --card-foreground: #ffffff;
  --popover: #1a1a24;
  --popover-foreground: #ffffff;
  --primary: #3ecf8e;
  --primary-foreground: #0f0f13;
  --secondary: #252535;
  --secondary-foreground: #ffffff;
  --muted: #252535;
  --muted-foreground: #888888;
  --accent: #252535;
  --accent-foreground: #ffffff;
  --destructive: #f56565;
  --border: #22222e;
  --input: #22222e;
  --ring: #3ecf8e;
  --radius: 0.75rem;
  --chart-1: #3ecf8e;
  --chart-2: #f56565;
  --chart-3: #f6c90e;
  --chart-4: #4ECDC4;
  --chart-5: #DDA0DD;
  --sidebar: #1a1a24;
  --sidebar-foreground: #ffffff;
  --sidebar-primary: #3ecf8e;
  --sidebar-primary-foreground: #0f0f13;
  --sidebar-accent: #252535;
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: #22222e;
  --sidebar-ring: #3ecf8e;
}

.dark {
  --background: #0f0f13;
  --foreground: #ffffff;
  --card: #1a1a24;
  --card-foreground: #ffffff;
  --popover: #1a1a24;
  --popover-foreground: #ffffff;
  --primary: #3ecf8e;
  --primary-foreground: #0f0f13;
  --secondary: #252535;
  --secondary-foreground: #ffffff;
  --muted: #252535;
  --muted-foreground: #888888;
  --accent: #252535;
  --accent-foreground: #ffffff;
  --destructive: #f56565;
  --border: #22222e;
  --input: #22222e;
  --ring: #3ecf8e;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}

@layer utilities {
  .scrollbar-none {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
}
```

- [ ] **Step 2: Add `class="dark"` to `<html>` in layout.tsx**

In `app/layout.tsx`, change:
```tsx
<html lang="en">
```
to:
```tsx
<html lang="en" className="dark">
```

- [ ] **Step 3: Commit**

```bash
cd D:/expense-tracker
git add app/globals.css app/layout.tsx
git commit -m "feat: dark finance theme — CSS variable overrides"
```

---

## Task 2: usePrivacyMode Hook

**Files:**
- Create: `hooks/usePrivacyMode.ts`
- Create: `__tests__/hooks/usePrivacyMode.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/hooks/usePrivacyMode.test.ts
import { renderHook, act } from '@testing-library/react';
import { usePrivacyMode } from '@/hooks/usePrivacyMode';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => { store[key] = val; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

describe('usePrivacyMode', () => {
  beforeEach(() => localStorageMock.clear());

  it('starts hidden=false by default', () => {
    const { result } = renderHook(() => usePrivacyMode());
    expect(result.current[0]).toBe(false);
  });

  it('toggles to true on first call', () => {
    const { result } = renderHook(() => usePrivacyMode());
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
  });

  it('toggles back to false on second call', () => {
    const { result } = renderHook(() => usePrivacyMode());
    act(() => result.current[1]());
    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
  });

  it('persists across remounts via localStorage', () => {
    const { result: r1 } = renderHook(() => usePrivacyMode());
    act(() => r1.current[1]());
    const { result: r2 } = renderHook(() => usePrivacyMode());
    expect(r2.current[0]).toBe(true);
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
cd D:/expense-tracker && npx jest __tests__/hooks/usePrivacyMode.test.ts
```
Expected: FAIL — `Cannot find module '@/hooks/usePrivacyMode'`

- [ ] **Step 3: Implement the hook**

```typescript
// hooks/usePrivacyMode.ts
'use client';
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'privacy_mode';

export function usePrivacyMode(): [boolean, () => void] {
  const [hidden, setHidden] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const toggle = useCallback(() => {
    setHidden(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return [hidden, toggle];
}
```

- [ ] **Step 4: Run tests**

```bash
cd D:/expense-tracker && npx jest __tests__/hooks/usePrivacyMode.test.ts
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
cd D:/expense-tracker
git add hooks/usePrivacyMode.ts __tests__/hooks/usePrivacyMode.test.ts
git commit -m "feat: usePrivacyMode hook with localStorage persistence"
```

---

## Task 3: MonthStrip Component

**Files:**
- Create: `components/dashboard/MonthStrip.tsx`

No unit test for this component (it wraps `useLiveQuery` which requires IndexedDB — covered by the integration of the dashboard page in the browser).

- [ ] **Step 1: Create `components/dashboard/MonthStrip.tsx`**

```tsx
'use client';
import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/database';

interface Props {
  activeMonth: string;        // YYYY-MM
  onMonthChange: (month: string) => void;
  salary: number;             // monthly salary in NIS, used for year savings bar
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function MonthStrip({ activeMonth, onMonthChange, salary }: Props) {
  const year = activeMonth.slice(0, 4);
  const todayMonth = new Date().toISOString().slice(0, 7);

  const yearTxns = useLiveQuery(
    () => db.transactions.where('date').startsWith(year).toArray(),
    [year],
    []
  );

  const monthData = useMemo(() => (
    Array.from({ length: 12 }, (_, i) => {
      const mm = String(i + 1).padStart(2, '0');
      const month = `${year}-${mm}`;
      const txns = yearTxns.filter(t => t.date.startsWith(month));
      const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return {
        month,
        label: MONTH_LABELS[i],
        net: income - expenses,
        isFuture: month > todayMonth,
        hasData: txns.length > 0,
      };
    })
  ), [yearTxns, year, todayMonth]);

  const ytdSavings = monthData
    .filter(m => !m.isFuture)
    .reduce((s, m) => s + m.net, 0);
  const annualGoal = salary * 12;
  const savingsPct = annualGoal > 0 ? Math.min((ytdSavings / annualGoal) * 100, 100) : 0;

  function fmtNet(net: number): string {
    const abs = Math.abs(net);
    const val = abs >= 1000 ? `${(abs / 1000).toFixed(1)}k` : abs.toFixed(0);
    return `${net >= 0 ? '+' : '-'}₪${val}`;
  }

  return (
    <div>
      {/* Scrollable month chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {monthData.map(({ month, label, net, isFuture, hasData }) => {
          const isActive = month === activeMonth;
          return (
            <button
              key={month}
              onClick={() => !isFuture && onMonthChange(month)}
              disabled={isFuture}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs transition-colors ${
                isActive
                  ? 'bg-[#252535] border border-[#3ecf8e44] text-[#3ecf8e]'
                  : isFuture
                  ? 'bg-[#1a1a24] text-[#2a2a2a] cursor-default'
                  : 'bg-[#1a1a24] text-[#888] hover:text-white'
              }`}
            >
              <span className="font-semibold">{label}</span>
              <span className={`text-[10px] mt-0.5 ${
                isFuture ? 'text-[#2a2a2a]' : hasData
                  ? net >= 0 ? 'text-[#3ecf8e]' : 'text-[#f56565]'
                  : 'text-[#333]'
              }`}>
                {!isFuture && hasData ? fmtNet(net) : '—'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Year savings bar — only shown when salary is configured */}
      {annualGoal > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-[#444] mb-1.5">
            <span>{year} Savings</span>
            <span className={ytdSavings >= 0 ? 'text-[#3ecf8e]' : 'text-[#f56565]'}>
              {ytdSavings >= 0 ? '+' : ''}₪{ytdSavings.toFixed(0)}
            </span>
          </div>
          <div className="h-1 bg-[#1a1a24] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3ecf8e] rounded-full transition-all duration-500"
              style={{ width: `${savingsPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd D:/expense-tracker
git add components/dashboard/MonthStrip.tsx
git commit -m "feat: MonthStrip — horizontal month scroll with per-month savings and year bar"
```

---

## Task 4: Dashboard Page Refactor

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Rewrite `app/dashboard/page.tsx`**

```tsx
'use client';
import { useState, useEffect } from 'react';
import { MonthStrip } from '@/components/dashboard/MonthStrip';
import { MonthlySummary } from '@/components/dashboard/MonthlySummary';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { AddExpenseModal } from '@/components/shared/AddExpenseModal';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { usePrivacyMode } from '@/hooks/usePrivacyMode';
import { getSettings } from '@/lib/db/queries';
import { seedDefaultCategories } from '@/lib/db/database';

function formatMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}

export default function DashboardPage() {
  const [month, setMonth] = useState(formatMonth(new Date()));
  const [salary, setSalary] = useState(0);
  const [hidden, toggleHidden] = usePrivacyMode();
  const transactions = useTransactions(month);
  const categories = useCategories();

  useEffect(() => {
    seedDefaultCategories();
    getSettings().then(s => setSalary(s.salary));
  }, []);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, salary);
  const balance = totalIncome - totalExpenses;

  return (
    <div className="p-4 flex flex-col gap-5 max-w-2xl mx-auto">
      {/* Privacy toggle */}
      <div className="flex justify-end">
        <button
          onClick={toggleHidden}
          className={`text-[10px] tracking-widest px-3 py-1.5 rounded-full transition-colors ${
            hidden
              ? 'bg-[#3ecf8e22] border border-[#3ecf8e44] text-[#3ecf8e]'
              : 'bg-[#1a1a24] text-[#666] hover:text-[#888]'
          }`}
        >
          👁 {hidden ? 'SHOW' : 'HIDE'}
        </button>
      </div>

      {/* Month strip */}
      <MonthStrip activeMonth={month} onMonthChange={setMonth} salary={salary} />

      {/* Hero balance */}
      <div className="text-center py-1">
        <p className="text-[9px] tracking-[0.2em] text-[#444] uppercase mb-2">Balance</p>
        <p
          className="text-5xl font-extrabold tracking-tight text-white transition-all duration-200"
          style={hidden ? { filter: 'blur(10px)', userSelect: 'none' } : {}}
        >
          ₪{balance.toFixed(0)}
        </p>
      </div>

      {/* Income + Spent cards */}
      <MonthlySummary transactions={transactions} salary={salary} hidden={hidden} />

      {/* Spending donut */}
      <SpendingChart transactions={transactions} categories={categories} />

      <div className="flex justify-center mt-1">
        <AddExpenseModal />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd D:/expense-tracker
git add app/dashboard/page.tsx
git commit -m "feat: dashboard — hero balance, month strip, privacy toggle"
```

---

## Task 5: MonthlySummary — 2-Col Dark Restyling

**Files:**
- Modify: `components/dashboard/MonthlySummary.tsx`

- [ ] **Step 1: Rewrite `components/dashboard/MonthlySummary.tsx`**

The balance card is removed (balance now lives in the hero). This component now shows only Income + Spent. The `hidden` prop blurs the income amount.

```tsx
import type { Transaction } from '@/types';

interface Props {
  transactions: Transaction[];
  salary: number;
  hidden: boolean;
}

export function MonthlySummary({ transactions, salary, hidden }: Props) {
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, salary);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-[#1a1a24] rounded-xl p-3">
        <p className="text-[9px] tracking-[0.15em] text-[#444] uppercase mb-1.5">Income</p>
        <p
          className="text-xl font-bold text-[#3ecf8e] transition-all duration-200"
          style={hidden ? { filter: 'blur(8px)', userSelect: 'none' } : {}}
        >
          ₪{totalIncome.toFixed(0)}
        </p>
      </div>
      <div className="bg-[#1a1a24] rounded-xl p-3">
        <p className="text-[9px] tracking-[0.15em] text-[#444] uppercase mb-1.5">Spent</p>
        <p className="text-xl font-bold text-[#f56565]">
          ₪{totalExpenses.toFixed(0)}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd D:/expense-tracker
git add components/dashboard/MonthlySummary.tsx
git commit -m "feat: MonthlySummary — 2-col dark cards, income blur on hidden"
```

---

## Task 6: SpendingChart — Dark Tooltip

**Files:**
- Modify: `components/dashboard/SpendingChart.tsx`

- [ ] **Step 1: Update tooltip style in `components/dashboard/SpendingChart.tsx`**

```tsx
'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { Transaction, Category } from '@/types';

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

export function SpendingChart({ transactions, categories }: Props) {
  const data = categories
    .map(cat => ({
      name: `${cat.icon} ${cat.name}`,
      value: transactions
        .filter(t => t.type === 'expense' && t.categoryId === cat.id)
        .reduce((s, t) => s + t.amount, 0),
      color: cat.color,
    }))
    .filter(d => d.value > 0);

  if (data.length === 0) {
    return <p className="text-center text-[#444] py-8 text-sm">No expenses this month</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) => [`₪${v.toFixed(2)}`, '']}
          contentStyle={{
            background: '#1a1a24',
            border: '1px solid #22222e',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '12px',
          }}
          labelStyle={{ color: '#888' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd D:/expense-tracker
git add components/dashboard/SpendingChart.tsx
git commit -m "feat: SpendingChart — dark tooltip styling"
```

---

## Task 7: TransactionItem — Left Border Stripe

**Files:**
- Modify: `components/transactions/TransactionItem.tsx`

- [ ] **Step 1: Rewrite `components/transactions/TransactionItem.tsx`**

```tsx
'use client';
import type { Transaction, Category } from '@/types';
import { deleteTransaction } from '@/lib/db/queries';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Props {
  transaction: Transaction;
  category?: Category;
}

export function TransactionItem({ transaction, category }: Props) {
  const isExpense = transaction.type === 'expense';
  const sign = isExpense ? '-' : '+';
  const amountColor = isExpense ? 'text-[#f56565]' : 'text-[#3ecf8e]';

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#22222e] last:border-0">
      {/* Category color stripe */}
      <div
        className="w-1 self-stretch rounded-sm flex-shrink-0 min-h-[36px]"
        style={{ backgroundColor: category?.color ?? '#444' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{category?.name ?? 'Unknown'}</p>
        {transaction.notes && (
          <p className="text-xs text-[#555] truncate">{transaction.notes}</p>
        )}
        <p className="text-xs text-[#444]">{transaction.date}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`text-sm font-semibold ${amountColor}`}>
          {sign}₪{transaction.amount.toFixed(2)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-[#444] hover:text-[#f56565]"
          onClick={() => transaction.id && deleteTransaction(transaction.id)}
        >
          <Trash2 size={12} />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd D:/expense-tracker
git add components/transactions/TransactionItem.tsx
git commit -m "feat: TransactionItem — category color left-border stripe, dark styling"
```

---

## Task 8: TransactionFilters — Pill Buttons

**Files:**
- Modify: `components/transactions/TransactionFilters.tsx`

- [ ] **Step 1: Rewrite `components/transactions/TransactionFilters.tsx`**

```tsx
'use client';
import type { Category } from '@/types';

interface Props {
  categories: Category[];
  filterCategory: string;
  filterType: string;
  onCategoryChange: (v: string) => void;
  onTypeChange: (v: string) => void;
}

export function TransactionFilters({
  categories, filterCategory, filterType, onCategoryChange, onTypeChange
}: Props) {
  const activePill = 'bg-[#3ecf8e22] border border-[#3ecf8e44] text-[#3ecf8e]';
  const idlePill = 'bg-[#1a1a24] text-[#555] hover:text-[#888]';

  return (
    <div className="flex flex-col gap-2">
      {/* Type pills */}
      <div className="flex gap-2">
        {(['all', 'expense', 'income'] as const).map(type => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide transition-colors ${
              filterType === type ? activePill : idlePill
            }`}
          >
            {type === 'all' ? 'All' : type === 'expense' ? 'Expenses' : 'Income'}
          </button>
        ))}
      </div>
      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onCategoryChange('all')}
          className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filterCategory === 'all' ? activePill : idlePill
          }`}
        >
          All
        </button>
        {categories.map(c => {
          const isActive = filterCategory === String(c.id);
          return (
            <button
              key={c.id}
              onClick={() => onCategoryChange(String(c.id))}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={isActive
                ? { backgroundColor: c.color + '33', border: `1px solid ${c.color}66`, color: c.color }
                : { backgroundColor: '#1a1a24', color: '#555' }
              }
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd D:/expense-tracker
git add components/transactions/TransactionFilters.tsx
git commit -m "feat: TransactionFilters — replace dropdowns with pill buttons"
```

---

## Task 9: BudgetCard — Slim Progress Bar + Glow

**Files:**
- Modify: `components/budgets/BudgetCard.tsx`
- Modify: `__tests__/components/BudgetCard.test.tsx`

- [ ] **Step 1: Update the BudgetCard test first**

The new component no longer renders `'🍔 Food'` (emoji removed from header). Update the first assertion:

```typescript
// __tests__/components/BudgetCard.test.tsx
import { render, screen } from '@testing-library/react';
import { BudgetCard } from '@/components/budgets/BudgetCard';

const budget = { id: 1, categoryId: 1, month: '2026-03', limitAmount: 1000 };
const category = { id: 1, name: 'Food', color: '#FF6B6B', icon: '🍔' };

describe('BudgetCard', () => {
  it('shows category name and limit', () => {
    render(<BudgetCard budget={budget} category={category} spent={400} />);
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText(/₪1000/)).toBeInTheDocument();
  });

  it('shows no warning when under 80%', () => {
    render(<BudgetCard budget={budget} category={category} spent={400} />);
    expect(screen.queryByText(/over budget/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/near limit/i)).not.toBeInTheDocument();
  });

  it('shows over budget label when spent exceeds limit', () => {
    render(<BudgetCard budget={budget} category={category} spent={1200} />);
    expect(screen.getByText(/over budget/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the old test to confirm it now fails (because we changed the expectation)**

```bash
cd D:/expense-tracker && npx jest __tests__/components/BudgetCard.test.tsx
```
Expected: FAIL on "shows category name and limit" — `'🍔 Food'` not found (component hasn't changed yet)

- [ ] **Step 3: Rewrite `components/budgets/BudgetCard.tsx`**

```tsx
import type { Budget, Category } from '@/types';

interface Props {
  budget: Budget;
  category: Category;
  spent: number;
}

export function BudgetCard({ budget, category, spent }: Props) {
  const pct = Math.min((spent / budget.limitAmount) * 100, 100);
  const over = spent > budget.limitAmount;
  const warning = pct >= 80 && !over;

  const barGradient = over
    ? 'linear-gradient(90deg, #f56565, #f87171)'
    : warning
    ? 'linear-gradient(90deg, #f6c90e, #f7d325)'
    : 'linear-gradient(90deg, #3ecf8e, #45d68f)';

  return (
    <div className={`bg-[#1a1a24] rounded-xl p-3 ${over ? 'border border-[#f5656522]' : ''}`}>
      <div className="flex justify-between items-center mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-sm font-medium text-white">{category.name}</span>
        </div>
        {over && <span className="text-xs font-semibold text-[#f56565]">Over budget</span>}
        {warning && <span className="text-xs font-semibold text-[#f6c90e]">Near limit</span>}
      </div>
      {/* 4px slim progress bar */}
      <div className="h-1 bg-[#252535] rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barGradient }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[#444]">
        <span>₪{spent.toFixed(0)} spent</span>
        <span>₪{budget.limitAmount} limit</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
cd D:/expense-tracker && npx jest __tests__/components/BudgetCard.test.tsx
```
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
cd D:/expense-tracker
git add components/budgets/BudgetCard.tsx __tests__/components/BudgetCard.test.tsx
git commit -m "feat: BudgetCard — slim gradient progress bar, glow border on over-budget"
```

---

## Task 10: App Shell — Dark Nav Styling

**Files:**
- Modify: `components/layout/BottomNav.tsx`
- Modify: `components/layout/Sidebar.tsx`

- [ ] **Step 1: Rewrite `components/layout/BottomNav.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',    Icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', Icon: ArrowLeftRight },
  { href: '/budgets',      label: 'Budgets',      Icon: PiggyBank },
  { href: '/settings',     label: 'Settings',     Icon: Settings },
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
```

- [ ] **Step 2: Rewrite `components/layout/Sidebar.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',    Icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', Icon: ArrowLeftRight },
  { href: '/budgets',      label: 'Budgets',      Icon: PiggyBank },
  { href: '/settings',     label: 'Settings',     Icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen border-r border-[#22222e] bg-[#1a1a24] p-4 gap-1">
      <h1 className="text-lg font-bold mb-4 px-2 text-white">💸 Expense Tracker</h1>
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors border-l-2 ${
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
```

- [ ] **Step 3: Commit**

```bash
cd D:/expense-tracker
git add components/layout/BottomNav.tsx components/layout/Sidebar.tsx
git commit -m "feat: nav shell — dark surface, green active tab/border"
```

---

## Task 11: Run Full Test Suite

- [ ] **Step 1: Run all tests**

```bash
cd D:/expense-tracker && npx jest
```
Expected: All tests pass (20 tests across 7 suites — 16 original + 4 new usePrivacyMode tests)

- [ ] **Step 2: If any test fails, fix it before proceeding**

- [ ] **Step 3: Final commit if any fixup changes were needed**

```bash
cd D:/expense-tracker
git add -A
git commit -m "fix: test suite green after UI redesign"
```
