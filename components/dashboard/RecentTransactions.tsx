'use client';
import type { Transaction, Category } from '@/types';
import Link from 'next/link';

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

export function RecentTransactions({ transactions, categories }: Props) {
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-3">
        <p className="text-[9px] tracking-[0.2em] text-muted-foreground/50 uppercase">עסקאות אחרונות</p>
        <Link href="/transactions" className="text-xs text-primary hover:underline">הצג הכל</Link>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {recent.map((t, i) => {
          const cat = catMap[t.categoryId];
          const isExpense = t.type === 'expense';
          return (
            <div
              key={t.id ?? i}
              className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ backgroundColor: (cat?.color ?? '#383d5c') + '20' }}
              >
                {cat?.icon ?? '📦'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {t.notes || cat?.name || 'עסקה'}
                </p>
                <p className="text-[10px] text-muted-foreground/50">{t.date}</p>
              </div>
              <span className={`text-sm font-semibold flex-shrink-0 ${isExpense ? 'text-[var(--spend)]' : 'text-[var(--income)]'}`}>
                {isExpense ? '-' : '+'}₪{t.amount.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
