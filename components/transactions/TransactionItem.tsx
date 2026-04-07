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
  const amountColor = isExpense ? 'text-[#f56565]' : 'text-[#3ecf8e]';

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#22222e] last:border-0">
      {/* Category color stripe */}
      <div
        className="w-1 self-stretch rounded-sm flex-shrink-0 min-h-[36px]"
        style={{ backgroundColor: category?.color ?? '#444' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{category?.name ?? 'לא ידוע'}</p>
        {transaction.notes && (
          <p className="text-xs text-[#555] truncate">{transaction.notes}</p>
        )}
        <p className="text-xs text-[#444]">{transaction.date}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`text-sm font-semibold ${amountColor}`}>
          {sign}₪{transaction.amount.toFixed(2)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-[#444] hover:text-[#f56565]"
          onClick={() => transaction.id && deleteTransaction(transaction.id)}
        >
          <Trash2 size={12} />
        </Button>
      </div>
    </div>
  );
}
