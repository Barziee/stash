'use client';
import type { Transaction } from '@/types';

export interface MerchantData {
  name: string;
  total: number;
  count: number;
}

export function buildTopMerchants(transactions: Transaction[], limit = 8): MerchantData[] {
  const expenses = transactions.filter(t => t.type === 'expense' && t.notes && t.notes.trim());

  const map: Record<string, { total: number; count: number }> = {};
  for (const t of expenses) {
    const key = t.notes!.trim();
    if (!map[key]) map[key] = { total: 0, count: 0 };
    map[key].total += t.amount;
    map[key].count += 1;
  }

  return Object.entries(map)
    .filter(([, v]) => v.count >= 1)
    .map(([name, v]) => ({ name, total: v.total, count: v.count }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

interface Props {
  merchants: MerchantData[];
}

export function TopMerchants({ merchants }: Props) {
  if (merchants.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-6 text-sm">
        אין הוצאות עם הערות חוזרות
      </p>
    );
  }

  const maxTotal = merchants[0]?.total ?? 1;

  return (
    <div className="flex flex-col gap-2">
      {merchants.map((m, i) => {
        const pct = (m.total / maxTotal) * 100;
        return (
          <div key={m.name} className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground w-4 text-center">{i + 1}</span>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-foreground font-medium truncate max-w-[180px]">{m.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-muted-foreground text-[10px]">{m.count}×</span>
                  <span className="text-foreground font-semibold">₪{m.total.toFixed(0)}</span>
                </div>
              </div>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: 'var(--primary)' }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
