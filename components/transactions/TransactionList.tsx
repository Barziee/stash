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
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground/40">
        <span className="text-4xl">🪹</span>
        <p className="text-sm">אין עסקאות</p>
      </div>
    );
  }
  return (
    <div>
      {transactions.map(t => (
        <TransactionItem key={t.id} transaction={t} category={catMap[t.categoryId]} />
      ))}
    </div>
  );
}
