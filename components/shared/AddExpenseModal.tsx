'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { addTransaction } from '@/lib/db/queries';
import { convertToNIS } from '@/lib/currency/exchange';
import type { Currency } from '@/types';
import { Plus } from 'lucide-react';

export function AddExpenseModal() {
  const categories = useCategories();
  const rate = useExchangeRate();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [currency, setCurrency] = useState<Currency>('NIS');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const raw = parseFloat(amount);
    if (!raw || !categoryId) return;
    setSaving(true);
    const nisAmount = convertToNIS(raw, currency, rate);
    await addTransaction({
      amount: nisAmount,
      currency,
      originalAmount: raw,
      originalCurrency: currency,
      categoryId: parseInt(categoryId),
      date: new Date().toISOString().slice(0, 10),
      notes: notes || undefined,
      type: 'expense',
      source: 'manual',
    });
    setAmount('');
    setCategoryId('');
    setNotes('');
    setSaving(false);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className="gap-2" />}>
        <Plus size={16} />
        הוסף הוצאה
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto pb-8">
        <SheetHeader>
          <SheetTitle>הוסף הוצאה</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-4">
          <div>
            <Label>סכום</Label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="סכום"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <Label>קטגוריה</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.icon} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>מטבע</Label>
            <Select value={currency} onValueChange={v => setCurrency(v as Currency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NIS">₪ שקל</SelectItem>
                <SelectItem value="USD">$ דולר</SelectItem>
              </SelectContent>
            </Select>
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
            {saving ? 'שומר...' : 'שמור'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
