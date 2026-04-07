'use client';
import type { Transaction, Category } from '@/types';
import { deleteTransaction } from '@/lib/db/queries';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Props {
  transaction: Transaction;
  category?: Category;
}

export function TransactionItem({ transaction, category }: Props) {
  const isExpense = transaction.type === 'expense';
  const sign = isExpense ? '-' : '+';
  const amountColor = isExpense ? 'text-[#c95555]' : 'text-[#34b87a]';

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#1e1e2a] last:border-0">
      <div
        className="w-1 self-stretch rounded-sm flex-shrink-0 min-h-[36px]"
        style={{ backgroundColor: category?.color ?? '#3a3a4a' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#e2e2e8]">{category?.name ?? 'לא ידוע'}</p>
        {transaction.notes && (
          <p className="text-xs text-[#4a4a5a] truncate">{transaction.notes}</p>
        )}
        <p className="text-xs text-[#3a3a4a]">{transaction.date}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`text-sm font-semibold ${amountColor}`}>
          {sign}₪{transaction.amount.toFixed(2)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-[#3a3a4a] hover:text-[#c95555]"
          onClick={() => transaction.id && deleteTransaction(transaction.id)}
        >
          <Trash2 size={12} />
        </Button>
      </div>
    </div>
  );
}
