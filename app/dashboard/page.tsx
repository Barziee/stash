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
