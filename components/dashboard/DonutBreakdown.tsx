'use client';
import { useMemo } from 'react';
import type { Transaction, Category } from '@/types';

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

interface Segment {
  name: string;
  icon: string;
  amount: number;
  pct: number;
  color: string;
  dashArray: string;
  dashOffset: number;
}

const R = 48;
const CIRCUMFERENCE = 2 * Math.PI * R;
const STROKE = 18;

export function DonutBreakdown({ transactions, categories }: Props) {
  const segments: Segment[] = useMemo(() => {
    const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
    const totals: Record<number, number> = {};
    const expenses = transactions.filter(t => t.type === 'expense');
    for (const t of expenses) {
      totals[t.categoryId] = (totals[t.categoryId] ?? 0) + t.amount;
    }
    const totalSpent = expenses.reduce((s, t) => s + t.amount, 0);
    if (totalSpent === 0) return [];

    let offset = 0;
    return Object.entries(totals)
      .map(([id, amount]) => ({ cat: catMap[Number(id)], amount }))
      .filter(r => r.cat)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(({ cat, amount }) => {
        const pct = (amount / totalSpent) * 100;
        const segLen = (pct / 100) * CIRCUMFERENCE;
        const seg: Segment = {
          name: cat.name,
          icon: cat.icon,
          amount,
          pct,
          color: cat.color,
          dashArray: `${segLen} ${CIRCUMFERENCE}`,
          dashOffset: -offset,
        };
        offset += segLen;
        return seg;
      });
  }, [transactions, categories]);

  if (segments.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-5 border border-border text-center">
        <p className="text-sm text-muted-foreground py-6">אין הוצאות להצגה</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-5 border border-border card-hover animate-fade-in-up">
      <p className="text-[9px] tracking-[0.2em] text-muted-foreground/50 uppercase mb-5">התפלגות הוצאות</p>

      <div className="flex items-center gap-6">
        {/* Donut SVG — matches mock: 120x120 viewBox, stroke 18, r=48 */}
        <svg viewBox="0 0 120 120" className="w-[120px] h-[120px] flex-shrink-0">
          <circle cx="60" cy="60" r={R} fill="none"
            className="stroke-secondary" strokeWidth={STROKE} />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx="60" cy="60" r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              className="transition-all duration-700"
            />
          ))}
        </svg>

        {/* Legend — name left, percentage right */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-[10px] h-[10px] rounded-full flex-shrink-0"
                  style={{ background: seg.color }} />
                <span className="text-[13px] text-foreground truncate">{seg.name}</span>
              </div>
              <span className="text-[12px] text-muted-foreground flex-shrink-0 tabular-nums">{seg.pct.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
