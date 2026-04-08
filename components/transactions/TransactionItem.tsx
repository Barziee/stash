'use client';
import { useState } from 'react';
import type { Transaction, Category } from '@/types';
import { deleteTransaction } from '@/lib/db/queries';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil } from 'lucide-react';
import { EditTransactionModal } from '@/components/shared/EditTransactionModal';

interface Props {
  transaction: Transaction;
  category?: Category;
}

export function TransactionItem({ transaction, category }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const isExpense = transaction.type === 'expense';
  const sign = isExpense ? '-' : '+';
  const amountColor = isExpense ? 'text-[var(--spend)]' : 'text-[var(--income)]';

  return (
    <>
      <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0 group hover:bg-accent/30 rounded-lg px-1 -mx-1 transition-colors duration-150">
        {/* Category icon circle */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: (category?.color ?? '#383d5c') + '28' }}
        >
          {category?.icon ?? '📦'}
        </div>

        {/* Text info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{category?.name ?? 'לא ידוע'}</p>
          {transaction.notes && (
            <p className="text-xs text-muted-foreground truncate">{transaction.notes}</p>
          )}
          <p className="text-[10px] text-muted-foreground/40">{transaction.date}</p>
        </div>

        {/* Amount + actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className={`text-sm font-semibold ${amountColor}`}>
            {sign}₪{transaction.amount.toFixed(2)}
          </span>
          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground/40 hover:text-primary"
              onClick={() => setEditOpen(true)}
            >
              <Pencil size={11} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground/40 hover:text-[var(--spend)]"
              onClick={() => transaction.id && deleteTransaction(transaction.id)}
            >
              <Trash2 size={11} />
            </Button>
          </div>
        </div>
      </div>

      <EditTransactionModal
        transaction={transaction}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
