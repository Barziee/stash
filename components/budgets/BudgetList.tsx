import type { Budget, Category, Transaction } from '@/types';
import { BudgetCard } from './BudgetCard';

interface Props {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
}

export function BudgetList({ budgets, categories, transactions }: Props) {
  const catMap = Object.fromEntries(categories.map(c => [c.id!, c]));
  if (budgets.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No budgets set for this month</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {budgets.map(b => {
        const spent = transactions
          .filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
          .reduce((s, t) => s + t.amount, 0);
        return (
          <BudgetCard
            key={b.id}
            budget={b}
            category={catMap[b.categoryId] ?? { id: b.categoryId, name: 'Unknown', color: '#ccc', icon: '📦' }}
            spent={spent}
          />
        );
      })}
    </div>
  );
}
