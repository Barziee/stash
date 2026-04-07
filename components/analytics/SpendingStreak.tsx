'use client';
import type { Transaction } from '@/types';

export interface StreakResult {
  streak: number;      // days within budget in a row (up to today)
  dailyBudget: number; // salary / days in month
}

export function computeStreak(
  transactions: Transaction[],
  salary: number,
  month: string
): StreakResult {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === y && today.getMonth() + 1 === m;
  const lastDay = isCurrentMonth ? today.getDate() : daysInMonth;

  const dailyBudget = salary > 0 ? salary / daysInMonth : 0;

  // Group expenses by date
  const byDate: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    byDate[t.date] = (byDate[t.date] ?? 0) + t.amount;
  }

  // Count consecutive days from today backwards that are within daily budget
  let streak = 0;
  if (dailyBudget > 0) {
    for (let day = lastDay; day >= 1; day--) {
      const dateStr = `${month}-${String(day).padStart(2, '0')}`;
      const spent = byDate[dateStr] ?? 0;
      if (spent <= dailyBudget) {
        streak++;
      } else {
        break;
      }
    }
  }

  return { streak, dailyBudget };
}

interface Props {
  streak: number;
  dailyBudget: number;
}

export function SpendingStreak({ streak, dailyBudget }: Props) {
  if (dailyBudget === 0) {
    return (
      <div className="bg-card rounded-2xl p-4 text-center">
        <p className="text-xs text-muted-foreground">הגדר משכורת בהגדרות כדי לראות רצף</p>
      </div>
    );
  }

  const emoji = streak === 0 ? '💸' : streak < 3 ? '🌱' : streak < 7 ? '🔥' : '🏆';
  const color = streak === 0 ? 'var(--spend)' : streak < 3 ? 'var(--warn)' : 'var(--income)';

  return (
    <div className="bg-card rounded-2xl p-4 flex items-center gap-4">
      <div className="text-3xl">{emoji}</div>
      <div className="flex-1">
        <p className="text-[9px] tracking-[0.2em] text-muted-foreground/50 uppercase mb-0.5">רצף בתקציב</p>
        <p className="text-2xl font-extrabold" style={{ color }}>
          {streak} <span className="text-sm font-normal text-muted-foreground">ימים</span>
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          תקציב יומי: ₪{dailyBudget.toFixed(0)}
        </p>
      </div>
      {streak >= 7 && (
        <div className="text-[10px] text-center bg-secondary rounded-lg px-2 py-1">
          <p className="text-foreground font-bold">{streak}</p>
          <p className="text-muted-foreground">רצף</p>
        </div>
      )}
    </div>
  );
}
