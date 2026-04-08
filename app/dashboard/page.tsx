'use client';
import { useState, useEffect, useMemo } from 'react';
import { MonthStrip } from '@/components/dashboard/MonthStrip';
import { HeroCard } from '@/components/dashboard/HeroCard';
import { DonutBreakdown } from '@/components/dashboard/DonutBreakdown';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { SpendingForecast } from '@/components/dashboard/SpendingForecast';
import { SavingsGoalManager } from '@/components/settings/SavingsGoalManager';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { usePrivacyMode } from '@/hooks/usePrivacyMode';
import { getSettings, processRecurringTransactions } from '@/lib/db/queries';
import { seedDefaultCategories } from '@/lib/db/database';
import { Card, CardContent } from '@/components/ui/card';

function formatMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}

function prevMonth(yyyymm: string): string {
  const [y, m] = yyyymm.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return d.toISOString().slice(0, 7);
}

export default function DashboardPage() {
  const [month, setMonth] = useState(formatMonth(new Date()));
  const [salary, setSalary] = useState(0);
  const [hidden, toggleHidden] = usePrivacyMode();
  const transactions = useTransactions(month);
  const lastMonthTxns = useTransactions(prevMonth(month));
  const categories = useCategories();

  useEffect(() => {
    seedDefaultCategories();
    processRecurringTransactions();
    getSettings().then(s => setSalary(s.salary));
  }, []);

  const expenses = transactions.filter(t => t.type === 'expense');
  const totalSpent = expenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const income = totalIncome + (salary || 0);
  const balance = income - totalSpent;

  const lastMonthSpent = lastMonthTxns
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const vsLastMonth = lastMonthSpent > 0
    ? ((totalSpent - lastMonthSpent) / lastMonthSpent) * 100
    : null;

  const daysElapsed = useMemo(() => {
    const today = new Date();
    const [y, m] = month.split('-').map(Number);
    const isCurrentMonth = today.getFullYear() === y && today.getMonth() + 1 === m;
    return isCurrentMonth ? today.getDate() : new Date(y, m, 0).getDate();
  }, [month]);

  const dailyAvg = daysElapsed > 0 ? totalSpent / daysElapsed : 0;

  const today = new Date();
  const [selY, selM] = month.split('-').map(Number);
  const isCurrentMonth = today.getFullYear() === selY && today.getMonth() + 1 === selM;
  const daysInMonth = new Date(selY, selM, 0).getDate();
  const daysLeft = isCurrentMonth ? daysInMonth - today.getDate() : 0;

  // Top categories by spend
  const topCategories = useMemo(() => {
    const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
    const totals: Record<number, number> = {};
    for (const t of expenses) {
      totals[t.categoryId] = (totals[t.categoryId] ?? 0) + t.amount;
    }
    return Object.entries(totals)
      .map(([id, amount]) => ({ category: catMap[Number(id)], amount }))
      .filter(r => r.category)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [expenses, categories]);

  return (
    <div className="flex flex-col gap-5">

      {/* Greeting + privacy toggle */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-extrabold text-foreground animate-fade-in">
          שלום 👋
        </h1>
        <button
          onClick={toggleHidden}
          className={`text-[10px] tracking-widest px-3 py-1.5 rounded-full transition-colors ${
            hidden
              ? 'bg-primary/10 border border-primary/20 text-primary'
              : 'bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          {hidden ? 'הצג' : 'הסתר'}
        </button>
      </div>

      {/* Month strip */}
      <MonthStrip activeMonth={month} onMonthChange={setMonth} salary={salary} />

      {/* Gradient hero card */}
      <HeroCard
        balance={balance}
        income={income}
        expenses={totalSpent}
        transactions={transactions}
        month={month}
        hidden={hidden}
      />

      {/* Stat chips */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card rounded-xl p-3 text-center border border-border card-hover animate-fade-in-up stagger-1">
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wide mb-1">ממוצע יומי</p>
          <p className="text-sm font-bold text-foreground">₪{dailyAvg.toFixed(0)}</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center border border-border card-hover animate-fade-in-up stagger-2">
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wide mb-1">
            {isCurrentMonth ? 'ימים נותרים' : 'ימים בחודש'}
          </p>
          <p className="text-sm font-bold text-foreground">
            {isCurrentMonth ? daysLeft : daysInMonth}
          </p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center border border-border card-hover animate-fade-in-up stagger-3">
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wide mb-1">לעומת ח׳ שעבר</p>
          <p className={`text-sm font-bold ${vsLastMonth !== null && vsLastMonth > 0 ? 'text-[var(--spend)]' : 'text-[var(--income)]'}`}>
            {vsLastMonth !== null
              ? `${vsLastMonth > 0 ? '↑' : '↓'}${Math.abs(vsLastMonth).toFixed(0)}%`
              : '—'
            }
          </p>
        </div>
      </div>

      {/* Donut breakdown */}
      <DonutBreakdown transactions={transactions} categories={categories} />

      {/* Top spending categories with bars */}
      {topCategories.length > 0 && (
        <div className="bg-card rounded-2xl p-4 border border-border flex flex-col gap-2.5 card-hover animate-fade-in-up">
          <p className="text-[9px] tracking-[0.2em] text-muted-foreground/50 uppercase mb-1">הוצאות לפי קטגוריה</p>
          {topCategories.map(({ category, amount }) => {
            const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
            return (
              <div key={category.id} className="flex items-center gap-2">
                <span className="text-base w-6">{category.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-foreground">{category.name}</span>
                    <span className="text-muted-foreground">₪{amount.toFixed(0)}</span>
                  </div>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%`, backgroundColor: category.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent transactions */}
      <RecentTransactions transactions={transactions} categories={categories} />

      {/* Spending forecast */}
      <SpendingForecast
        dailyAvg={dailyAvg}
        daysInMonth={daysInMonth}
        totalSpent={totalSpent}
        salary={salary}
        isCurrentMonth={isCurrentMonth}
      />

      {/* Savings goals */}
      <Card>
        <CardContent className="pt-4"><SavingsGoalManager /></CardContent>
      </Card>
    </div>
  );
}
