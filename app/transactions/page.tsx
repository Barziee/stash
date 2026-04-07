'use client';
import { useState, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { AddExpenseModal } from '@/components/shared/AddExpenseModal';
import { seedDefaultCategories } from '@/lib/db/database';
import { exportToExcel, exportToPdf } from '@/lib/export/exportTransactions';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, FileSpreadsheet, FileText } from 'lucide-react';

function formatMonth(d: Date) { return d.toISOString().slice(0, 7); }
function monthLabel(yyyymm: string) {
  const [y, m] = yyyymm.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleString('he-IL', { month: 'long', year: 'numeric' });
}

export default function TransactionsPage() {
  const [month, setMonth] = useState(formatMonth(new Date()));
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const all = useTransactions(month);
  const categories = useCategories();

  useEffect(() => { seedDefaultCategories(); }, []);

  const filtered = all.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCategory !== 'all' && t.categoryId !== parseInt(filterCategory)) return false;
    return true;
  });

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
        <Button variant="ghost" size="icon" onClick={prev}><ChevronRight /></Button>
        <h2 className="text-base font-semibold">{monthLabel(month)}</h2>
        <Button variant="ghost" size="icon" onClick={next}><ChevronLeft /></Button>
      </div>

      {/* Export buttons */}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" className="text-[#4a4a5a] text-xs gap-1.5"
          onClick={() => exportToExcel(all, categories, month)}>
          <FileSpreadsheet size={13} /> Excel
        </Button>
        <Button variant="ghost" size="sm" className="text-[#4a4a5a] text-xs gap-1.5"
          onClick={() => exportToPdf(all, categories, month)}>
          <FileText size={13} /> PDF
        </Button>
      </div>

      <TransactionFilters
        categories={categories}
        filterCategory={filterCategory}
        filterType={filterType}
        onCategoryChange={setFilterCategory}
        onTypeChange={setFilterType}
      />
      <TransactionList transactions={filtered} categories={categories} />
      <div className="flex justify-center">
        <AddExpenseModal />
      </div>
    </div>
  );
}
