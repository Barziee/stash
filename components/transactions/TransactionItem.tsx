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
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 group hover:bg-accent/30 transition-colors duration-150">
        {/* Category icon — rounded square like mock */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: (category?.color ?? '#383d5c') + '20' }}
        >
          {category?.icon ?? '📦'}
        </div>

        {/* Text info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground">
            {transaction.notes || category?.name || 'לא ידוע'}
          </p>
          <p className="text-[10px] text-muted-foreground/50 mt-0.5">{transaction.date}</p>
        </div>

        {/* Amount + actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className={`text-sm font-semibold ${amountColor}`}>
            {sign}₪{transaction.amount.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
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
