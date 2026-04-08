'use client';
import { useMemo, useEffect, useRef } from 'react';
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

  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  }, [activeMonth]);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {monthData.map(({ month, label, net, isFuture, hasData }) => {
          const isActive = month === activeMonth;
          return (
            <button
              key={month}
              ref={isActive ? activeRef : undefined}
              onClick={() => !isFuture && onMonthChange(month)}
              disabled={isFuture}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 press-scale ${
                isActive
                  ? 'bg-card border border-primary/20 text-primary'
                  : isFuture
                  ? 'bg-secondary text-muted-foreground/20 cursor-default'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <span className="font-semibold">{label}</span>
              <span className={`text-[10px] mt-0.5 ${
                isFuture ? 'text-muted-foreground/20' : hasData
                  ? net >= 0 ? 'text-[var(--income)]' : 'text-[var(--spend)]'
                  : 'text-muted-foreground/30'
              }`}>
                {!isFuture && hasData ? fmtNet(net) : '—'}
              </span>
            </button>
          );
        })}
      </div>

      {annualGoal > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
            <span>חסכונות {year}</span>
            <span className={ytdSavings >= 0 ? 'text-[var(--income)]' : 'text-[var(--spend)]'}>
              {ytdSavings >= 0 ? '+' : ''}₪{ytdSavings.toFixed(0)}
            </span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${savingsPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
