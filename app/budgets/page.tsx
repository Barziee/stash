'use client';
import { useState } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { BudgetList } from '@/components/budgets/BudgetList';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function formatMonth(d: Date) { return d.toISOString().slice(0, 7); }
function monthLabel(yyyymm: string) {
  const [y, m] = yyyymm.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

export default function BudgetsPage() {
  const [month, setMonth] = useState(formatMonth(new Date()));
  const budgets = useBudgets(month);
  const transactions = useTransactions(month);
  const categories = useCategories();

  function prev() {
    const d = new Date(month + '-01'); d.setMonth(d.getMonth() - 1);
    setMonth(formatMonth(d));
  }
  function next() {
    const d = new Date(month + '-01'); d.setMonth(d.getMonth() + 1);
    setMonth(formatMonth(d));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prev}><ChevronLeft /></Button>
        <h2 className="text-base font-semibold">{monthLabel(month)}</h2>
        <Button variant="ghost" size="icon" onClick={next}><ChevronRight /></Button>
      </div>
      <BudgetList budgets={budgets} categories={categories} transactions={transactions} />
    </div>
  );
}
