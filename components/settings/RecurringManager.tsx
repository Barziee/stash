'use client';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/database';
import { addRecurringTransaction, deleteRecurringTransaction } from '@/lib/db/queries';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import type { TransactionType } from '@/types';

export function RecurringManager() {
  const categories = useCategories();
  const recurrings = useLiveQuery(() => db.recurringTransactions.toArray(), [], []);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('1');
  const [type, setType] = useState<TransactionType>('expense');
  const [notes, setNotes] = useState('');

  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c]));

  async function handleAdd() {
    if (!categoryId || !amount) return;
    await addRecurringTransaction({
      categoryId: parseInt(categoryId),
      amount: parseFloat(amount),
      dayOfMonth: parseInt(day),
      type,
      notes: notes || undefined,
    });
    setCategoryId(''); setAmount(''); setNotes('');
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-sm">עסקאות קבועות</h3>
      <p className="text-xs text-[#4a4a5a]">נוספות אוטומטית בכל חודש ביום שנקבע.</p>

      {recurrings?.map(r => {
        const cat = categoryMap[r.categoryId];
        return (
          <div key={r.id} className="flex items-center justify-between bg-[#1e1e28] rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <span>{cat?.icon}</span>
              <div>
                <p className="text-sm text-[#e2e2e8]">{cat?.name}</p>
                <p className="text-xs text-[#4a4a5a]">
                  יום {r.dayOfMonth} · {r.type === 'income' ? '+' : '-'}₪{r.amount}
                  {r.notes ? ` · ${r.notes}` : ''}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-[#3a3a4a] hover:text-[#c95555]"
              onClick={() => r.id && deleteRecurringTransaction(r.id)}>
              <Trash2 size={14} />
            </Button>
          </div>
        );
      })}

      <div className="flex flex-col gap-2 border border-[#1e1e2a] rounded-xl p-3 mt-1">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">קטגוריה</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.icon} {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">סוג</Label>
            <Select value={type} onValueChange={v => setType(v as TransactionType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">הוצאה</SelectItem>
                <SelectItem value="income">הכנסה</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">סכום (₪)</Label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
          </div>
          <div>
            <Label className="text-xs">יום בחודש</Label>
            <Input type="number" min="1" max="28" value={day} onChange={e => setDay(e.target.value)} />
          </div>
        </div>
        <div>
          <Label className="text-xs">הערה (אופציונלי)</Label>
          <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="לדוגמה: שכר דירה" />
        </div>
        <Button onClick={handleAdd} className="w-full gap-1.5">
          <Plus size={14} /> הוסף
        </Button>
      </div>
    </div>
  );
}
