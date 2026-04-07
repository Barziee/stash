'use client';
import { useState, useEffect, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { AddExpenseModal } from '@/components/shared/AddExpenseModal';
import { QuickAdd } from '@/components/dashboard/QuickAdd';
import { seedDefaultCategories } from '@/lib/db/database';
import { exportToExcel, exportToPdf } from '@/lib/export/exportTransactions';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, FileSpreadsheet, FileText, Search, X } from 'lucide-react';
import { filterTransactions } from '@/lib/transactions/filter';

function formatMonth(d: Date) { return d.toISOString().slice(0, 7); }
function monthLabel(yyyymm: string) {
  const [y, m] = yyyymm.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleString('he-IL', { month: 'long', year: 'numeric' });
}

export default function TransactionsPage() {
  const [month, setMonth] = useState(formatMonth(new Date()));
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');
  const all = useTransactions(month);
  const categories = useCategories();

  useEffect(() => { seedDefaultCategories(); }, []);

  const catMap = useMemo(
    () => Object.fromEntries(categories.map(c => [c.id!, c])),
    [categories]
  );

  const filtered = useMemo(
    () => filterTransactions(all, { type: filterType, categoryId: filterCategory, search, catMap }),
    [all, filterType, filterCategory, search, catMap]
  );

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
      {/* Quick add — always visible at top */}
      <QuickAdd />

      {/* Month nav + export */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prev}><ChevronRight /></Button>
        <h2 className="text-sm font-semibold text-foreground">{monthLabel(month)}</h2>
        <Button variant="ghost" size="icon" onClick={next}><ChevronLeft /></Button>
      </div>

      {/* Search bar */}
      <div className="relative flex items-center">
        <Search size={14} className="absolute start-3 text-muted-foreground/40 pointer-events-none" />
        <input
          type="text"
          placeholder="חיפוש לפי קטגוריה או הערה..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl ps-9 pe-9 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/40 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute end-3 text-muted-foreground/40 hover:text-muted-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" className="text-muted-foreground text-xs gap-1.5"
          onClick={() => exportToExcel(all, categories, month)}>
          <FileSpreadsheet size={13} /> Excel
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground text-xs gap-1.5"
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

      {/* Results count when searching */}
      {search && (
        <p className="text-[10px] text-muted-foreground/50 text-center">
          {filtered.length} תוצאות עבור &quot;{search}&quot;
        </p>
      )}

      <TransactionList transactions={filtered} categories={categories} />

      <div className="flex justify-center pb-2">
        <AddExpenseModal />
      </div>
    </div>
  );
}
