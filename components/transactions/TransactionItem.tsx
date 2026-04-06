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
  const sign = transaction.type === 'expense' ? '-' : '+';
  const color = transaction.type === 'expense' ? 'text-red-500' : 'text-green-600';

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{category?.icon ?? '📦'}</span>
        <div>
          <p className="text-sm font-medium">{category?.name ?? 'Unknown'}</p>
          {transaction.notes && (
            <p className="text-xs text-muted-foreground">{transaction.notes}</p>
          )}
          <p className="text-xs text-muted-foreground">{transaction.date}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${color}`}>
          {sign}₪{transaction.amount.toFixed(2)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={() => transaction.id && deleteTransaction(transaction.id)}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}
