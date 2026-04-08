# Stash Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix recurring transaction duplication, redistribute Settings features to contextual tabs, add light/dark theme toggle, fix analytics charts, style CSV import button, add data reset, QA with seed data, then PR into main.

**Architecture:** Client-side Next.js 16 + Dexie (IndexedDB) app. All state is local. Theme via CSS variables + class toggle on `<html>`. Feature redistribution moves components between page files — no new data layer needed.

**Tech Stack:** Next.js 16, React 19, Dexie, Recharts, Tailwind CSS 4, shadcn/ui, Lucide icons

---

## File Structure

### Modified files:
- `app/globals.css` — add light theme variables, make colors more vibrant
- `app/layout.tsx` — remove hardcoded `dark`, use ThemeProvider
- `app/settings/page.tsx` — slim down to salary, categories, bank accounts, theme toggle, reset
- `app/transactions/page.tsx` — add RecurringManager and CsvImport sections
- `app/dashboard/page.tsx` — add SavingsGoalManager section
- `app/analytics/page.tsx` — no changes needed (charts fix is in components)
- `components/layout/AppShell.tsx` — wrap with ThemeProvider
- `components/layout/BottomNav.tsx` — update sidebar colors to use CSS vars
- `components/layout/Sidebar.tsx` — update sidebar colors to use CSS vars
- `components/settings/CsvImport.tsx` — style the file input as a proper button
- `components/analytics/MonthlySavingsChart.tsx` — ensure chart colors resolve properly
- `components/analytics/DayOfWeekChart.tsx` — ensure chart colors resolve properly
- `lib/db/queries.ts` — fix race condition in processRecurringTransactions, add resetAllData

### New files:
- `hooks/useTheme.ts` — theme state hook (localStorage + class toggle)
- `components/settings/ThemeToggle.tsx` — light/dark toggle UI
- `components/settings/ResetData.tsx` — reset all data button with confirmation
- `lib/db/seed.ts` — QA seed data function

---

### Task 1: Fix recurring transaction duplicate bug

**Files:**
- Modify: `lib/db/queries.ts:106-130`

The race condition happens because React Strict Mode (or fast re-renders) calls `processRecurringTransactions()` twice before the first call updates `lastAddedMonth`. Fix: use a Dexie transaction with a re-check inside.

- [ ] **Step 1: Fix processRecurringTransactions with transaction lock**

In `lib/db/queries.ts`, replace the `processRecurringTransactions` function:

```typescript
export async function processRecurringTransactions(): Promise<void> {
  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7);
  const dayOfMonth = today.getDate();

  const recurrings = await db.recurringTransactions.toArray();
  for (const r of recurrings) {
    if (r.lastAddedMonth === currentMonth) continue;
    if (dayOfMonth < r.dayOfMonth) continue;

    // Use a transaction to prevent race conditions (React Strict Mode double-fire)
    await db.transaction('rw', [db.recurringTransactions, db.transactions], async () => {
      // Re-check inside transaction to prevent duplicate adds
      const fresh = await db.recurringTransactions.get(r.id!);
      if (!fresh || fresh.lastAddedMonth === currentMonth) return;

      await db.transactions.add({
        amount: r.amount,
        currency: 'NIS',
        originalAmount: r.amount,
        originalCurrency: 'NIS',
        categoryId: r.categoryId,
        date: `${currentMonth}-${String(r.dayOfMonth).padStart(2, '0')}`,
        notes: r.notes,
        type: r.type,
        source: 'manual',
      });

      await db.recurringTransactions.update(r.id!, { lastAddedMonth: currentMonth });
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/db/queries.ts
git commit -m "fix: prevent recurring transaction duplicates with Dexie transaction lock"
```

---

### Task 2: Add light theme + theme toggle hook

**Files:**
- Create: `hooks/useTheme.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add light theme CSS variables to globals.css**

Add a `.light` class block after the existing `.dark` block in `globals.css`, and update `:root` to not duplicate dark theme (`:root` stays as the default dark). Add `.light` variables:

```css
.light {
  --background: #f8f9fc;
  --foreground: #1a1c2e;
  --card: #ffffff;
  --card-foreground: #1a1c2e;
  --popover: #ffffff;
  --popover-foreground: #1a1c2e;
  --primary: #6c5ce7;
  --primary-foreground: #ffffff;
  --secondary: #f0f1f5;
  --secondary-foreground: #1a1c2e;
  --muted: #f0f1f5;
  --muted-foreground: #6b7280;
  --accent: #e8e9f0;
  --accent-foreground: #1a1c2e;
  --destructive: #ef4444;
  --border: #e2e4eb;
  --input: #e2e4eb;
  --ring: #6c5ce7;
  --income: #10b981;
  --spend: #ef4444;
  --warn: #f59e0b;
  --chart-1: #6c5ce7;
  --chart-2: #10b981;
  --chart-3: #f59e0b;
  --chart-4: #ec4899;
  --chart-5: #0ea5e9;
  --sidebar: #ffffff;
  --sidebar-foreground: #1a1c2e;
  --sidebar-primary: #6c5ce7;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #f0f1f5;
  --sidebar-accent-foreground: #1a1c2e;
  --sidebar-border: #e2e4eb;
  --sidebar-ring: #6c5ce7;
}
```

- [ ] **Step 2: Make dark palette more vibrant**

Update the `.dark` block and `:root` to use more vibrant chart/semantic colors:

```css
  --income: #34d399;
  --spend: #f87171;
  --warn: #fbbf24;
  --chart-1: #8b5cf6;
  --chart-2: #34d399;
  --chart-3: #fbbf24;
  --chart-4: #f472b6;
  --chart-5: #38bdf8;
```

- [ ] **Step 3: Create useTheme hook**

Create `hooks/useTheme.ts`:

```typescript
'use client';
import { useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('stash-theme') as Theme | null;
    const initial = stored || 'dark';
    setThemeState(initial);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(initial);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('stash-theme', t);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(t);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggle };
}
```

- [ ] **Step 4: Update layout.tsx to not hardcode dark**

Change `app/layout.tsx` — remove `className="dark"` from `<html>`, use `suppressHydrationWarning` since theme is set client-side:

```tsx
<html lang="he" dir="rtl" className="dark" suppressHydrationWarning>
```

Keep `className="dark"` as the SSR default, but `suppressHydrationWarning` allows the client-side hook to switch it without a hydration error.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css hooks/useTheme.ts app/layout.tsx
git commit -m "feat: add light theme palette and useTheme hook"
```

---

### Task 3: Create ThemeToggle component

**Files:**
- Create: `components/settings/ThemeToggle.tsx`

- [ ] **Step 1: Create ThemeToggle component**

```tsx
'use client';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-card border border-border hover:bg-accent transition-colors"
    >
      {theme === 'dark' ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-amber-500" />}
      <div className="flex-1 text-start">
        <p className="text-sm font-medium text-foreground">
          {theme === 'dark' ? 'מצב כהה' : 'מצב בהיר'}
        </p>
        <p className="text-xs text-muted-foreground">
          לחץ להחלפה ל{theme === 'dark' ? 'בהיר' : 'כהה'}
        </p>
      </div>
      <div className={`w-11 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'start-5' : 'start-0.5'}`} />
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/settings/ThemeToggle.tsx
git commit -m "feat: add ThemeToggle component"
```

---

### Task 4: Create ResetData component

**Files:**
- Create: `components/settings/ResetData.tsx`
- Modify: `lib/db/queries.ts` — add `resetAllData` function

- [ ] **Step 1: Add resetAllData to queries.ts**

Add at the bottom of `lib/db/queries.ts`:

```typescript
export async function resetAllData(): Promise<void> {
  await db.transactions.clear();
  await db.budgets.clear();
  await db.recurringTransactions.clear();
  await db.savingsGoals.clear();
  await db.exchangeRates.clear();
  await db.bankCredentials.clear();
  await db.settings.clear();
  await db.categories.clear();
}
```

- [ ] **Step 2: Create ResetData component**

```tsx
'use client';
import { useState } from 'react';
import { resetAllData } from '@/lib/db/queries';
import { seedDefaultCategories } from '@/lib/db/database';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ResetData() {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  async function handleReset() {
    await resetAllData();
    await seedDefaultCategories();
    setDone(true);
    setTimeout(() => window.location.reload(), 1000);
  }

  if (done) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-center">
        <p className="text-sm text-green-500">כל הנתונים אופסו בהצלחה!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {!confirming ? (
        <Button
          variant="outline"
          className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 gap-2"
          onClick={() => setConfirming(true)}
        >
          <Trash2 size={14} />
          איפוס כל הנתונים
        </Button>
      ) : (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-sm text-destructive font-medium text-center">
            האם אתה בטוח? כל הנתונים יימחקו לצמיתות.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirming(false)}>
              ביטול
            </Button>
            <Button
              className="flex-1 bg-destructive text-white hover:bg-destructive/90"
              onClick={handleReset}
            >
              מחק הכל
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/db/queries.ts components/settings/ResetData.tsx
git commit -m "feat: add reset all data functionality"
```

---

### Task 5: Redistribute Settings features to contextual tabs

**Files:**
- Modify: `app/settings/page.tsx` — keep salary, categories, bank accounts; add theme toggle, reset
- Modify: `app/transactions/page.tsx` — add RecurringManager, CsvImport
- Modify: `app/dashboard/page.tsx` — add SavingsGoalManager

- [ ] **Step 1: Rewrite settings page**

`app/settings/page.tsx` should contain:
- Salary setting (keep)
- ThemeToggle
- CategoryManager
- BankAccountManager
- ResetData

Remove: SavingsGoalManager, RecurringManager, CsvImport

```tsx
'use client';
import { useState, useEffect } from 'react';
import { CategoryManager } from '@/components/settings/CategoryManager';
import { BankAccountManager } from '@/components/settings/BankAccountManager';
import { ThemeToggle } from '@/components/settings/ThemeToggle';
import { ResetData } from '@/components/settings/ResetData';
import { getSettings, updateSettings } from '@/lib/db/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [salary, setSalary] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(s => setSalary(String(s.salary)));
  }, []);

  async function handleSaveSalary() {
    await updateSettings({ salary: parseFloat(salary) || 0 });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">הגדרות</h2>

      <ThemeToggle />

      <Card>
        <CardHeader><CardTitle className="text-sm">משכורת חודשית (₪)</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="לדוגמה: 12000" />
          <Button onClick={handleSaveSalary}>{saved ? 'נשמר!' : 'שמור'}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4"><CategoryManager /></CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4"><BankAccountManager /></CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4"><ResetData /></CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Add RecurringManager and CsvImport to Transactions page**

In `app/transactions/page.tsx`, add the two imports and render them after the AddExpenseModal at the bottom, inside collapsible Card sections.

- [ ] **Step 3: Add SavingsGoalManager to Dashboard page**

In `app/dashboard/page.tsx`, import and render SavingsGoalManager after the SpendingChart, inside a Card.

- [ ] **Step 4: Commit**

```bash
git add app/settings/page.tsx app/transactions/page.tsx app/dashboard/page.tsx
git commit -m "feat: redistribute settings features to contextual tabs"
```

---

### Task 6: Fix analytics charts + vibrant colors

**Files:**
- Modify: `components/analytics/MonthlySavingsChart.tsx`
- Modify: `components/analytics/DayOfWeekChart.tsx`

The black/white squares issue is caused by recharts rendering `<Cell>` components that reference CSS variables via `var(--xxx)` in the SVG `fill` attribute. SVG doesn't resolve CSS custom properties in all rendering contexts. Fix: resolve the variables at render time using `getComputedStyle`.

- [ ] **Step 1: Fix MonthlySavingsChart to use resolved colors**

Add a color resolution helper and use it:

```tsx
function getCSSColor(varName: string): string {
  if (typeof window === 'undefined') return '#888';
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#888';
}
```

Replace `fill={entry.savings >= 0 ? 'var(--income)' : 'var(--spend)'}` with resolved colors using the helper.

- [ ] **Step 2: Fix DayOfWeekChart similarly**

Same pattern — resolve `var(--warn)`, `var(--primary)` at render time.

- [ ] **Step 3: Commit**

```bash
git add components/analytics/MonthlySavingsChart.tsx components/analytics/DayOfWeekChart.tsx
git commit -m "fix: resolve CSS vars for recharts SVG fills, fix black/white squares"
```

---

### Task 7: Style CSV import button

**Files:**
- Modify: `components/settings/CsvImport.tsx`

- [ ] **Step 1: Replace bare file input with styled button**

Replace `<input type="file" accept=".csv" onChange={handleFile} className="text-sm" />` with a hidden input + styled button trigger:

```tsx
<div>
  <input
    type="file"
    accept=".csv"
    onChange={handleFile}
    className="hidden"
    id="csv-file-input"
  />
  <Button
    variant="outline"
    className="w-full gap-2"
    onClick={() => document.getElementById('csv-file-input')?.click()}
  >
    <Upload size={14} />
    בחר קובץ CSV
  </Button>
</div>
```

Add `Upload` to the lucide-react imports.

- [ ] **Step 2: Commit**

```bash
git add components/settings/CsvImport.tsx
git commit -m "feat: style CSV import as proper button"
```

---

### Task 8: Update Sidebar/BottomNav to use CSS variables

**Files:**
- Modify: `components/layout/Sidebar.tsx`
- Modify: `components/layout/BottomNav.tsx`
- Modify: `components/settings/RecurringManager.tsx`
- Modify: `components/settings/SavingsGoalManager.tsx`

These files use hardcoded hex colors (`#222224`, `#505052`, etc.) that won't adapt to light theme. Replace with CSS variable equivalents.

- [ ] **Step 1: Update Sidebar to use CSS vars**

Replace hardcoded colors:
- `bg-[#191919]` → `bg-sidebar`
- `text-[#d1d1d4]` → `text-sidebar-foreground`
- `border-[#272729]` → `border-sidebar-border`
- `border-[#4a9e78]` / `text-[#4a9e78]` → `border-primary text-primary`
- `bg-[#4a9e780d]` → `bg-primary/5`
- `text-[#505052]` → `text-muted-foreground`
- `hover:bg-[#222224]` → `hover:bg-sidebar-accent`
- `hover:text-[#808082]` → `hover:text-sidebar-foreground`

- [ ] **Step 2: Update RecurringManager and SavingsGoalManager hardcoded colors**

Replace all `#222224`, `#505052`, `#d1d1d4`, `#272729`, `#191919`, `#404042`, `#a84444` references with CSS variable equivalents (`bg-card`, `text-muted-foreground`, `text-foreground`, `border-border`, `bg-secondary`, etc.)

- [ ] **Step 3: Commit**

```bash
git add components/layout/Sidebar.tsx components/layout/BottomNav.tsx components/settings/RecurringManager.tsx components/settings/SavingsGoalManager.tsx
git commit -m "feat: replace hardcoded colors with CSS vars for theme support"
```

---

### Task 9: QA seed data

**Files:**
- Create: `lib/db/seed.ts`

- [ ] **Step 1: Create seed data script**

Create `lib/db/seed.ts` with a function that populates:
- 60+ transactions across current and past 3 months (variety of categories, amounts, dates)
- 3 recurring transactions (rent, gym, streaming)
- 2 savings goals
- 3 budgets
- Salary setting of 15000

- [ ] **Step 2: Add a temporary "Seed QA Data" button to Settings**

Add a dev-only button to settings page that calls the seed function.

- [ ] **Step 3: Commit**

```bash
git add lib/db/seed.ts app/settings/page.tsx
git commit -m "feat: add QA seed data for testing"
```

---

### Task 10: Build verification + PR

- [ ] **Step 1: Run build to verify no errors**

```bash
npm run build
```

- [ ] **Step 2: Fix any build errors**

- [ ] **Step 3: Create PR from dev into main**

```bash
git push origin dev
gh pr create --base main --head dev --title "feat: improvements — theme, settings redistribution, chart fixes, QA" --body "..."
```
