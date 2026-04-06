'use client';
import { useState, useEffect } from 'react';
import { MonthlySummary } from '@/components/dashboard/MonthlySummary';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { AddExpenseModal } from '@/components/shared/AddExpenseModal';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { getSettings } from '@/lib/db/queries';
import { seedDefaultCategories } from '@/lib/db/database';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function formatMonth(date: Date): string {
  return date.toISOString().slice(0, 7); // YYYY-MM
}

function monthLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleString('default', {
    month: 'long', year: 'numeric'
  });
}

export default function DashboardPage() {
  const [month, setMonth] = useState(formatMonth(new Date()));
  const [salary, setSalary] = useState(0);
  const transactions = useTransactions(month);
  const categories = useCategories();

  useEffect(() => {
    seedDefaultCategories();
    getSettings().then(s => setSalary(s.salary));
  }, []);

  function prevMonth() {
    const d = new Date(month + '-01');
    d.setMonth(d.getMonth() - 1);
    setMonth(formatMonth(d));
  }

  function nextMonth() {
    const d = new Date(month + '-01');
    d.setMonth(d.getMonth() + 1);
    setMonth(formatMonth(d));
  }

  return (
    <div className="p-4 flex flex-col gap-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft /></Button>
        <h2 className="text-base font-semibold">{monthLabel(month)}</h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight /></Button>
      </div>
      <MonthlySummary transactions={transactions} salary={salary} />
      <SpendingChart transactions={transactions} categories={categories} />
      <div className="flex justify-center mt-2">
        <AddExpenseModal />
      </div>
    </div>
  );
}
