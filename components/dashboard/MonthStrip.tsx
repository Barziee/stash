'use client';
import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/database';

interface Props {
  activeMonth: string;
  onMonthChange: (month: string) => void;
  salary: number;
}

const MONTH_LABELS = ['ינו','פבר','מרץ','אפר','מאי','יוני','יול','אוג','ספט','אוק','נוב','דצמ'];

export function MonthStrip({ activeMonth, onMonthChange, salary }: Props) {
  const year = activeMonth.slice(0, 4);
  const todayMonth = new Date().toISOString().slice(0, 7);

  const yearTxns = useLiveQuery(
    () => db.transactions.where('date').startsWith(year).toArray(),
    [year],
    []
  );

  const monthData = useMemo(() => (
    Array.from({ length: 12 }, (_, i) => {
      const mm = String(i + 1).padStart(2, '0');
      const month = `${year}-${mm}`;
      const txns = yearTxns.filter(t => t.date.startsWith(month));
      const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return {
        month,
        label: MONTH_LABELS[i],
        net: income - expenses,
        isFuture: month > todayMonth,
        hasData: txns.length > 0,
      };
    })
  ), [yearTxns, year, todayMonth]);

  const ytdSavings = monthData
    .filter(m => !m.isFuture)
    .reduce((s, m) => s + m.net, 0);
  const annualGoal = salary * 12;
  const savingsPct = annualGoal > 0 ? Math.min((ytdSavings / annualGoal) * 100, 100) : 0;

  function fmtNet(net: number): string {
    const abs = Math.abs(net);
    const val = abs >= 1000 ? `${(abs / 1000).toFixed(1)}k` : abs.toFixed(0);
    return `${net >= 0 ? '+' : '-'}₪${val}`;
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {monthData.map(({ month, label, net, isFuture, hasData }) => {
          const isActive = month === activeMonth;
          return (
            <button
              key={month}
              onClick={() => !isFuture && onMonthChange(month)}
              disabled={isFuture}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs transition-colors ${
                isActive
                  ? 'bg-[#1e1e28] border border-[#34b87a30] text-[#34b87a]'
                  : isFuture
                  ? 'bg-[#16161e] text-[#252535] cursor-default'
                  : 'bg-[#16161e] text-[#4a4a5a] hover:text-[#8a8a9a]'
              }`}
            >
              <span className="font-semibold">{label}</span>
              <span className={`text-[10px] mt-0.5 ${
                isFuture ? 'text-[#252535]' : hasData
                  ? net >= 0 ? 'text-[#34b87a]' : 'text-[#c95555]'
                  : 'text-[#2a2a3a]'
              }`}>
                {!isFuture && hasData ? fmtNet(net) : '—'}
              </span>
            </button>
          );
        })}
      </div>

      {annualGoal > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-[#3a3a4a] mb-1.5">
            <span>חסכונות {year}</span>
            <span className={ytdSavings >= 0 ? 'text-[#34b87a]' : 'text-[#c95555]'}>
              {ytdSavings >= 0 ? '+' : ''}₪{ytdSavings.toFixed(0)}
            </span>
          </div>
          <div className="h-1 bg-[#16161e] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#34b87a] rounded-full transition-all duration-500"
              style={{ width: `${savingsPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
