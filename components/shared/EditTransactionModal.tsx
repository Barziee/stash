'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { updateTransaction } from '@/lib/db/queries';
import type { Transaction, Currency, TransactionType } from '@/types';

interface Props {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTransactionModal({ transaction, open, onOpenChange }: Props) {
  const categories = useCategories();
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [currency, setCurrency] = useState<Currency>('NIS');
  const [type, setType] = useState<TransactionType>('expense');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);

  // Populate form when transaction changes
  useEffect(() => {
    setAmount(String(transaction.originalAmount));
    setCategoryId(String(transaction.categoryId));
    setCurrency(transaction.originalCurrency);
    setType(transaction.type);
    setNotes(transaction.notes ?? '');
    setDate(transaction.date);
  }, [transaction]);

  async function handleSave() {
    const raw = parseFloat(amount);
    if (!raw || !categoryId || !transaction.id) return;
    setSaving(true);
    await updateTransaction(transaction.id, {
      amount: raw,
      originalAmount: raw,
      currency,
      originalCurrency: currency,
      categoryId: parseInt(categoryId),
      type,
      notes: notes || undefined,
      date,
    });
    setSaving(false);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto pb-8">
        <SheetHeader>
          <SheetTitle>עריכת עסקה</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            {(['expense', 'income'] as TransactionType[]).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`py-2 rounded-xl text-sm font-medium transition-colors ${
                  type === t
                    ? t === 'expense'
                      ? 'bg-[var(--spend)]/15 text-[var(--spend)] border border-[var(--spend)]/30'
                      : 'bg-[var(--income)]/15 text-[var(--income)] border border-[var(--income)]/30'
                    : 'bg-secondary text-muted-foreground border border-transparent'
                }`}
              >
                {t === 'expense' ? 'הוצאה' : 'הכנסה'}
              </button>
            ))}
          </div>

          <div>
            <Label>סכום</Label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="סכום"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label>קטגוריה</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.icon} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>מטבע</Label>
            <Select value={currency} onValueChange={v => setCurrency(v as Currency)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NIS">₪ שקל</SelectItem>
                <SelectItem value="USD">$ דולר</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>תאריך</Label>
            <Input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div>
            <Label>הערה (אופציונלי)</Label>
            <Input
              placeholder="לדוגמה: קפה בעבודה"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <Button onClick={handleSave} disabled={saving || !amount || !categoryId}>
            {saving ? 'שומר...' : 'עדכן עסקה'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
