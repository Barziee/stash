'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseCSVRows, deduplicateByHash } from '@/lib/csv/import';
import { addTransaction } from '@/lib/db/queries';
import { useCategories } from '@/hooks/useCategories';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { convertToNIS } from '@/lib/currency/exchange';
import { Upload } from 'lucide-react';
import type { Currency } from '@/types';

const FIELD_LABELS: Record<string, string> = {
  date: 'תאריך',
  amount: 'סכום',
  currency: 'מטבע',
  description: 'תיאור',
};

export function CsvImport() {
  const categories = useCategories();
  const rate = useExchangeRate();
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [colMap, setColMap] = useState({ date: '', amount: '', currency: '', description: '' });
  const [categoryId, setCategoryId] = useState('');
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const parsed = parseCSVRows(text);
      setRows(parsed);
      setHeaders(parsed.length > 0 ? Object.keys(parsed[0]) : []);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!categoryId || !colMap.date || !colMap.amount) return;
    setImporting(true);
    const deduped = deduplicateByHash(rows.map(r => ({
      date: r[colMap.date],
      amount: r[colMap.amount],
      description: r[colMap.description] ?? '',
      currency: r[colMap.currency] ?? 'NIS',
    })));
    for (const row of deduped) {
      const originalAmount = parseFloat(row.amount);
      const currency = (row.currency === 'USD' ? 'USD' : 'NIS') as Currency;
      if (isNaN(originalAmount)) continue;
      await addTransaction({
        amount: convertToNIS(originalAmount, currency, rate),
        currency,
        originalAmount,
        originalCurrency: currency,
        categoryId: parseInt(categoryId),
        date: row.date,
        notes: row.description,
        type: 'expense',
        source: 'imported',
      });
    }
    setImporting(false);
    setDone(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-sm">יבוא מ-CSV</h3>
      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="hidden"
        id="csv-file-input"
      />
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => document.getElementById('csv-file-input')?.click()}
      >
        <Upload size={14} />
        בחר קובץ CSV
      </Button>
      {headers.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">מיפוי עמודות CSV:</p>
          {(['date', 'amount', 'currency', 'description'] as const).map(field => (
            <div key={field} className="flex items-center gap-2">
              <Label className="w-24 text-xs">{FIELD_LABELS[field]}</Label>
              <Select value={colMap[field]} onValueChange={v => setColMap(m => ({ ...m, [field]: v }))}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="בחר עמודה" /></SelectTrigger>
                <SelectContent>
                  {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
          <div>
            <Label className="text-xs">קטגוריה ברירת מחדל</Label>
            <Select value={categoryId} onValueChange={v => setCategoryId(v ?? '')}>
              <SelectTrigger><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.icon} {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleImport} disabled={importing || done}>
            {done ? `יובאו ${rows.length} שורות` : importing ? 'מייבא...' : `ייבא ${rows.length} שורות`}
          </Button>
        </>
      )}
    </div>
  );
}
