import type { Transaction, Category } from '@/types';
import { TransactionItem } from './TransactionItem';

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

export function TransactionList({ transactions, categories }: Props) {
  const catMap = Object.fromEntries(categories.map(c => [c.id!, c]));
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground/40 animate-fade-in">
        <span className="text-4xl">🪹</span>
        <p className="text-sm">אין עסקאות</p>
      </div>
    );
  }
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {transactions.map((t, i) => (
        <div
          key={t.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}
        >
          <TransactionItem transaction={t} category={catMap[t.categoryId]} />
        </div>
      ))}
    </div>
  );
}
