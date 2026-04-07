import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/database';
import type { Transaction } from '@/types';

/**
 * Returns all transactions from the last N months (including current).
 */
export function useLastNMonths(n: number): Transaction[] {
  return useLiveQuery(
    async () => {
      const months: string[] = [];
      const now = new Date();
      for (let i = 0; i < n; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(d.toISOString().slice(0, 7));
      }
      const results = await Promise.all(
        months.map(m => db.transactions.where('date').startsWith(m).toArray())
      );
      return results.flat();
    },
    [n],
    []
  );
}

/**
 * Returns all transactions ever stored.
 */
export function useAllTransactions(): Transaction[] {
  return useLiveQuery(() => db.transactions.toArray(), [], []);
}
