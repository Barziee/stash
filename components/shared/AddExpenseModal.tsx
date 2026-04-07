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
import { Plus, SplitSquareHorizontal } from 'lucide-react';

export function AddExpenseModal() {
  const categories = useCategories();
  const rate = useExchangeRate();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [currency, setCurrency] = useState<Currency>('NIS');
  const [notes, setNotes] = useState('');
  const [splitWith, setSplitWith] = useState('');
  const [isSplit, setIsSplit] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const raw = parseFloat(amount);
    if (!raw || !categoryId) return;
    setSaving(true);
    const nisAmount = convertToNIS(raw, currency, rate);
    const myAmount = isSplit && splitWith ? nisAmount * 0.5 : nisAmount;
    await addTransaction({
      amount: myAmount,
      currency,
      originalAmount: isSplit ? raw * 0.5 : raw,
      originalCurrency: currency,
      categoryId: parseInt(categoryId),
      date: new Date().toISOString().slice(0, 10),
      notes: notes || undefined,
      type: 'expense',
      source: 'manual',
      ...(isSplit && splitWith ? { splitWithName: splitWith, splitRatio: 0.5 } : {}),
    });
    setAmount(''); setCategoryId(''); setNotes(''); setIsSplit(false);
    setSaving(false);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" className="gap-2 text-[#4a4a5a] border-[#1e1e2a]" />}>
        <Plus size={14} />
        הוסף הוצאה מפורטת
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto pb-8">
        <SheetHeader>
          <SheetTitle>הוסף הוצאה</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-4">
          <div>
            <Label>סכום</Label>
            <Input type="number" inputMode="decimal" placeholder="סכום"
              value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
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
            <Label>הערה (אופציונלי)</Label>
            <Input placeholder="לדוגמה: קפה בעבודה" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {/* Split toggle */}
          <div className="flex items-center justify-between bg-[#16161e] rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2 text-sm text-[#6b6b7a]">
              <SplitSquareHorizontal size={15} />
              <span>פיצול עם</span>
            </div>
            <div className="flex items-center gap-2">
              {isSplit && (
                <Input
                  value={splitWith}
                  onChange={e => setSplitWith(e.target.value)}
                  placeholder="שם"
                  className="h-7 w-24 text-sm"
                />
              )}
              <button
                onClick={() => setIsSplit(v => !v)}
                className={`w-10 h-5 rounded-full transition-colors relative ${isSplit ? 'bg-[#34b87a]' : 'bg-[#1e1e28]'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isSplit ? 'end-0.5' : 'start-0.5'}`} />
              </button>
            </div>
          </div>
          {isSplit && amount && (
            <p className="text-xs text-[#34b87a] text-center">
              החלק שלך: ₪{(parseFloat(amount) * 0.5).toFixed(2)}
            </p>
          )}

          <Button onClick={handleSave} disabled={saving || !amount || !categoryId}>
            {saving ? 'שומר...' : 'שמור'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
