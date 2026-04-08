'use client';
import { useMemo } from 'react';
import type { Transaction } from '@/types';

interface Props {
  balance: number;
  income: number;
  expenses: number;
  transactions: Transaction[];
  month: string;
  hidden: boolean;
}

export function HeroCard({ balance, income, expenses, transactions, month, hidden }: Props) {
  // Compute daily spending for mini chart (last 7 days of the selected month)
  const dailyBars = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === y && today.getMonth() + 1 === m;
    const endDay = isCurrentMonth ? today.getDate() : new Date(y, m, 0).getDate();
    const startDay = Math.max(1, endDay - 6);

    const days: { day: number; amount: number }[] = [];
    for (let d = startDay; d <= endDay; d++) {
      const dateStr = `${month}-${String(d).padStart(2, '0')}`;
      const dayExpenses = transactions
        .filter(t => t.type === 'expense' && t.date === dateStr)
        .reduce((s, t) => s + t.amount, 0);
      days.push({ day: d, amount: dayExpenses });
    }
    return days;
  }, [transactions, month]);

  const maxBar = Math.max(...dailyBars.map(d => d.amount), 1);

  const blur = hidden ? { filter: 'blur(8px)', userSelect: 'none' as const } : {};

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 animate-fade-in-up"
      style={{
        background: 'linear-gradient(135deg, #4c3a99 0%, #7c6ff7 50%, #9f8cff 100%)',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-12 -left-8 w-40 h-40 rounded-full"
        style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="absolute -bottom-16 -right-12 w-48 h-48 rounded-full"
        style={{ background: 'rgba(255,255,255,0.04)' }} />

      {/* Balance */}
      <p className="text-xs text-white/60 mb-1">יתרת החודש</p>
      <p className="text-4xl font-extrabold text-white tracking-tight mb-4" style={blur}>
        ₪{Math.abs(balance).toLocaleString('he-IL', { maximumFractionDigits: 0 })}
        {balance < 0 && <span className="text-lg text-red-300 mr-1">-</span>}
      </p>

      {/* Income / Expense row */}
      <div className="flex gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
            style={{ background: 'rgba(52,211,153,0.2)', color: '#34d399' }}>↓</div>
          <div>
            <p className="text-[10px] text-white/50">הכנסות</p>
            <p className="text-sm font-bold text-white" style={blur}>
              ₪{income.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
            style={{ background: 'rgba(248,113,113,0.2)', color: '#f87171' }}>↑</div>
          <div>
            <p className="text-[10px] text-white/50">הוצאות</p>
            <p className="text-sm font-bold text-white">
              ₪{expenses.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      {/* Mini bar chart */}
      {dailyBars.length > 0 && (
        <div className="flex items-end gap-1 h-10">
          {dailyBars.map(({ day, amount }) => (
            <div
              key={day}
              className="flex-1 rounded-t transition-all duration-500"
              style={{
                height: `${Math.max((amount / maxBar) * 100, 4)}%`,
                background: `rgba(255,255,255,${amount > 0 ? 0.15 + (amount / maxBar) * 0.25 : 0.08})`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
