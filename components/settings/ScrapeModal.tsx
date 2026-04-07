'use client';
import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/database';
import { decrypt } from '@/lib/crypto/credentials';
import { runScraper } from '@/lib/scraper/bank';
import { deduplicateTransactions } from '@/lib/scraper/deduplicate';
import { addTransaction, getCategories, getTransactionsByMonth } from '@/lib/db/queries';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { Transaction, Category } from '@/types';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

type ModalState = 'select' | 'scraping' | 'review' | 'done' | 'error';

interface ReviewTransaction extends Omit<Transaction, 'id'> {
  _key: string;
  checked: boolean;
}

interface ScrapeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getLastThreeMonths(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

export function ScrapeModal({ open, onOpenChange }: ScrapeModalProps) {
  const credentials = useLiveQuery(() => db.bankCredentials.toArray(), [], []);
  const categories = useLiveQuery(() => db.categories.toArray(), [], []) as Category[];

  const [selectedCredId, setSelectedCredId] = useState<string>('');
  const [masterPassword, setMasterPassword] = useState('');
  const [state, setState] = useState<ModalState>('select');
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [reviewItems, setReviewItems] = useState<ReviewTransaction[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [importedCount, setImportedCount] = useState(0);

  const defaultCategoryId = categories?.[0]?.id ?? 1;

  const handleScrape = useCallback(async () => {
    const credId = parseInt(selectedCredId, 10);
    const cred = credentials?.find(c => c.id === credId);
    if (!cred) return;
    if (!masterPassword) return;

    setState('scraping');
    setStatusText('מפענח פרטי כניסה...');

    try {
      let plainPassword: string;
      try {
        plainPassword = await decrypt(cred.encryptedPassword, cred.iv, masterPassword);
      } catch {
        setErrorMsg('סיסמת המאסטר שגויה — לא ניתן לפענח את הסיסמה');
        setState('error');
        return;
      }

      setStatusText('מתחבר לבנק...');

      const result = await runScraper(cred.bankName, cred.username, plainPassword, defaultCategoryId);

      if (result.error) {
        setErrorMsg(result.error);
        setState('error');
        return;
      }

      setStatusText('בודק כפילויות...');

      // Fetch last 3 months of transactions for dedup
      const months = getLastThreeMonths();
      const existingArrays = await Promise.all(months.map(m => getTransactionsByMonth(m)));
      const existing = existingArrays.flat();

      const newTxns = deduplicateTransactions(result.transactions, existing);
      const skipped = result.transactions.length - newTxns.length;

      setSkippedCount(skipped);
      setReviewItems(
        newTxns.map((t, i) => ({
          ...t,
          _key: `${t.date}-${t.amount}-${i}`,
          checked: true,
          categoryId: t.categoryId ?? defaultCategoryId,
        }))
      );
      setState('review');
    } catch (err) {
      setErrorMsg(String(err));
      setState('error');
    }
  }, [selectedCredId, credentials, masterPassword, defaultCategoryId]);

  const handleImport = useCallback(async () => {
    const toImport = reviewItems.filter(r => r.checked);
    for (const item of toImport) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _key, checked, ...txn } = item;
      await addTransaction(txn);
    }
    setImportedCount(toImport.length);
    setState('done');
  }, [reviewItems]);

  function handleClose() {
    // Reset state on close
    setState('select');
    setSelectedCredId('');
    setMasterPassword('');
    setStatusText('');
    setErrorMsg('');
    setReviewItems([]);
    setSkippedCount(0);
    setImportedCount(0);
    onOpenChange(false);
  }

  function updateItemCategory(key: string, catId: number) {
    setReviewItems(prev =>
      prev.map(r => r._key === key ? { ...r, categoryId: catId } : r)
    );
  }

  function toggleItem(key: string) {
    setReviewItems(prev =>
      prev.map(r => r._key === key ? { ...r, checked: !r.checked } : r)
    );
  }

  const checkedCount = reviewItems.filter(r => r.checked).length;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" showCloseButton className="max-h-[90vh] overflow-y-auto rounded-t-2xl p-0">
        <SheetHeader className="p-4 pb-2 border-b border-border sticky top-0 bg-card z-10">
          <SheetTitle>סנכרון מבנק</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* ── State 1: Select & Scrape ── */}
          {(state === 'select' || state === 'scraping') && (
            <div className="flex flex-col gap-4 p-4">
              {(!credentials || credentials.length === 0) ? (
                <p className="text-sm text-muted-foreground">
                  אין חשבונות בנק שמורים. הוסף חשבון בקטע &quot;חשבונות בנק&quot; למטה.
                </p>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <Label>בחר חשבון בנק</Label>
                    <Select
                      value={selectedCredId}
                      onValueChange={val => val && setSelectedCredId(val)}
                      disabled={state === 'scraping'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר חשבון" />
                      </SelectTrigger>
                      <SelectContent>
                        {credentials.map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.bankName} — {c.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>סיסמת מאסטר (לפענוח)</Label>
                    <Input
                      type="password"
                      value={masterPassword}
                      onChange={e => setMasterPassword(e.target.value)}
                      placeholder="סיסמת המאסטר שלך"
                      disabled={state === 'scraping'}
                    />
                  </div>
                </>
              )}

              {state === 'scraping' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="animate-spin" size={16} />
                  <span>{statusText}</span>
                </div>
              )}
            </div>
          )}

          {/* ── State: Error ── */}
          {state === 'error' && (
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--spend)' }}>
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">שגיאה בסריקה</p>
                  <p className="text-muted-foreground mt-1 break-all">{errorMsg}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setState('select')}>
                נסה שוב
              </Button>
            </div>
          )}

          {/* ── State 2: Review ── */}
          {state === 'review' && (
            <div className="flex flex-col gap-3 p-4">
              <p className="text-sm text-muted-foreground">
                נמצאו <span className="font-semibold text-foreground">{reviewItems.length}</span> עסקאות חדשות
                {skippedCount > 0 && (
                  <> ({skippedCount} כפולים דולגו)</>
                )}
              </p>

              {reviewItems.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  אין עסקאות חדשות לייבוא
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {reviewItems.map(item => (
                    <div
                      key={item._key}
                      className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/30 p-3"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItem(item._key)}
                          className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">{item.date}</span>
                            <span
                              className="font-semibold text-sm"
                              style={{ color: item.type === 'income' ? 'var(--income)' : 'var(--spend)' }}
                            >
                              {item.type === 'income' ? '+' : '-'}
                              {item.amount.toFixed(2)} ₪
                            </span>
                          </div>
                          <p className="text-sm truncate mt-0.5">{item.notes || '—'}</p>
                        </div>
                      </div>

                      {/* Category selector */}
                      <div className="pr-7">
                        <Select
                          value={String(item.categoryId)}
                          onValueChange={val => val && updateItemCategory(item._key, parseInt(val, 10))}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="קטגוריה" />
                          </SelectTrigger>
                          <SelectContent>
                            {(categories ?? []).map(cat => (
                              <SelectItem key={cat.id} value={String(cat.id)} className="text-xs">
                                {cat.icon} {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── State 3: Done ── */}
          {state === 'done' && (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <CheckCircle2 size={40} style={{ color: 'var(--income)' }} />
              <p className="font-semibold text-foreground">
                יובאו {importedCount} עסקאות בהצלחה
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <SheetFooter className="border-t border-border p-4 sticky bottom-0 bg-card">
          {state === 'select' && (
            <Button
              className="w-full"
              onClick={handleScrape}
              disabled={!selectedCredId || !masterPassword || !credentials?.length}
            >
              סרוק עסקאות
            </Button>
          )}

          {state === 'scraping' && (
            <Button className="w-full" disabled>
              <Loader2 className="animate-spin ml-2" size={16} />
              סורק...
            </Button>
          )}

          {state === 'review' && reviewItems.length > 0 && (
            <Button
              className="w-full"
              onClick={handleImport}
              disabled={checkedCount === 0}
            >
              ייבא {checkedCount} עסקאות
            </Button>
          )}

          {(state === 'done' || state === 'error' || (state === 'review' && reviewItems.length === 0)) && (
            <Button variant="outline" className="w-full" onClick={handleClose}>
              סגור
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
