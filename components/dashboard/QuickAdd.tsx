'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { addTransaction } from '@/lib/db/queries';
import { convertToNIS } from '@/lib/currency/exchange';

export function QuickAdd() {
  const categories = useCategories();
  const rate = useExchangeRate();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  // Show expense categories only (not Salary/income)
  const expenseCategories = categories.filter(c => c.name !== 'משכורת' && c.name !== 'Salary');

  async function handleAdd() {
    const raw = parseFloat(amount);
    if (!raw || selectedCategoryId === null) return;
    setSaving(true);
    await addTransaction({
      amount: convertToNIS(raw, 'NIS', rate),
      currency: 'NIS',
      originalAmount: raw,
      originalCurrency: 'NIS',
      categoryId: selectedCategoryId,
      date: new Date().toISOString().slice(0, 10),
      type: 'expense',
      source: 'manual',
    });
    setAmount('');
    setSelectedCategoryId(null);
    setSaving(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd();
  }

  return (
    <div className="bg-[#16161e] rounded-2xl p-4 flex flex-col gap-3">
      <p className="text-[9px] tracking-[0.2em] text-[#3a3a4a] uppercase">הוספה מהירה</p>

      {/* Category icon row */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {expenseCategories.map(c => {
          const active = selectedCategoryId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryId(active ? null : c.id!)}
              className="flex-shrink-0 flex flex-col items-center gap-1 transition-all"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all duration-150"
                style={{
                  backgroundColor: active ? c.color + '33' : '#1e1e28',
                  border: `1.5px solid ${active ? c.color : 'transparent'}`,
                  transform: active ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                {c.icon}
              </div>
              <span
                className="text-[9px] max-w-[44px] truncate text-center"
                style={{ color: active ? c.color : '#3a3a4a' }}
              >
                {c.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Amount row */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-1.5 bg-[#1e1e28] rounded-xl px-3 py-2.5">
          <span className="text-[#4a4a5a] text-sm">₪</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[#e2e2e8] text-base font-semibold outline-none placeholder:text-[#2a2a3a] min-w-0"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={saving || !amount || selectedCategoryId === null}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 ${
            amount && selectedCategoryId !== null
              ? 'bg-[#34b87a] text-[#0e0e12] hover:bg-[#2daa70]'
              : 'bg-[#1e1e28] text-[#2a2a3a]'
          }`}
        >
          <Plus size={20} />
        </button>
      </div>

      {selectedCategoryId === null && (
        <p className="text-[10px] text-[#2a2a3a] text-center">בחר קטגוריה ולאחר מכן הזן סכום</p>
      )}
    </div>
  );
}
