'use client';
import { useState, useEffect, useMemo } from 'react';
import { MonthStrip } from '@/components/dashboard/MonthStrip';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { usePrivacyMode } from '@/hooks/usePrivacyMode';
import { getSettings, processRecurringTransactions } from '@/lib/db/queries';
import { seedDefaultCategories } from '@/lib/db/database';

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

  const lastMonthSpent = lastMonthTxns
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const vsLastMonth = lastMonthSpent > 0
    ? ((totalSpent - lastMonthSpent) / lastMonthSpent) * 100
    : null;

  // Daily average: days elapsed in selected month
  const daysElapsed = useMemo(() => {
    const today = new Date();
    const [y, m] = month.split('-').map(Number);
    const isCurrentMonth = today.getFullYear() === y && today.getMonth() + 1 === m;
    return isCurrentMonth ? today.getDate() : new Date(y, m, 0).getDate();
  }, [month]);

  const dailyAvg = daysElapsed > 0 ? totalSpent / daysElapsed : 0;

  // Days left this month (for current month only)
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

  const balance = (salary || 0) - totalSpent;

  return (
    <div className="flex flex-col gap-5">

      {/* Top row: privacy toggle */}
      <div className="flex justify-end">
        <button
          onClick={toggleHidden}
          className={`text-[10px] tracking-widest px-3 py-1.5 rounded-full transition-colors ${
            hidden
              ? 'bg-[#4a9e7818] border border-[#4a9e7830] text-[#4a9e78]'
              : 'bg-[#191919] text-[#505052] hover:text-[#666668]'
          }`}
        >
          👁 {hidden ? 'הצג' : 'הסתר'}
        </button>
      </div>

      {/* Month strip */}
      <MonthStrip activeMonth={month} onMonthChange={setMonth} salary={salary} />

      {/* Spending hero */}
      <div className="text-center">
        <p className="text-[9px] tracking-[0.2em] text-[#404042] uppercase mb-2">הוצאות החודש</p>
        <p className="text-5xl font-extrabold tracking-tight text-[#d1d1d4]">
          ₪{totalSpent.toFixed(0)}
        </p>
        {vsLastMonth !== null && (
          <p className={`text-xs mt-2 ${vsLastMonth > 0 ? 'text-[#a84444]' : 'text-[#4a9e78]'}`}>
            {vsLastMonth > 0 ? '↑' : '↓'} {Math.abs(vsLastMonth).toFixed(0)}% לעומת חודש שעבר
          </p>
        )}
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#191919] rounded-xl p-3 text-center">
          <p className="text-[9px] text-[#404042] uppercase tracking-wide mb-1">ממוצע יומי</p>
          <p className="text-sm font-bold text-[#d1d1d4]">₪{dailyAvg.toFixed(0)}</p>
        </div>
        <div className="bg-[#191919] rounded-xl p-3 text-center">
          <p className="text-[9px] text-[#404042] uppercase tracking-wide mb-1">
            {isCurrentMonth ? 'ימים נותרים' : 'ימים בחודש'}
          </p>
          <p className="text-sm font-bold text-[#d1d1d4]">
            {isCurrentMonth ? daysLeft : daysInMonth}
          </p>
        </div>
        <div className="bg-[#191919] rounded-xl p-3 text-center">
          <p className="text-[9px] text-[#404042] uppercase tracking-wide mb-1">יתרה</p>
          <p
            className={`text-sm font-bold transition-all ${balance >= 0 ? 'text-[#4a9e78]' : 'text-[#a84444]'}`}
            style={hidden ? { filter: 'blur(6px)', userSelect: 'none' } : {}}
          >
            ₪{balance.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Top spending categories */}
      {topCategories.length > 0 && (
        <div className="bg-[#191919] rounded-2xl p-4 flex flex-col gap-2.5">
          <p className="text-[9px] tracking-[0.2em] text-[#404042] uppercase mb-1">הוצאות לפי קטגוריה</p>
          {topCategories.map(({ category, amount }) => {
            const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
            return (
              <div key={category.id} className="flex items-center gap-2">
                <span className="text-base w-6">{category.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-[#d1d1d4]">{category.name}</span>
                    <span className="text-[#666668]">₪{amount.toFixed(0)}</span>
                  </div>
                  <div className="h-1 bg-[#222224] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: category.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pie chart */}
      <SpendingChart transactions={transactions} categories={categories} />

    </div>
  );
}
