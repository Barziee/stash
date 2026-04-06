import type { Transaction, Category } from '@/types';
import { TransactionItem } from './TransactionItem';

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

export function TransactionList({ transactions, categories }: Props) {
  const catMap = Object.fromEntries(categories.map(c => [c.id!, c]));
  if (transactions.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No transactions</p>;
  }
  return (
    <div>
      {transactions.map(t => (
        <TransactionItem key={t.id} transaction={t} category={catMap[t.categoryId]} />
      ))}
    </div>
  );
}
