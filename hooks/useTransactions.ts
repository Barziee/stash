import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/database';
import type { Transaction } from '@/types';

/** Returns live transactions for a YYYY-MM month string */
export function useTransactions(month: string): Transaction[] {
  return useLiveQuery(
    () => db.transactions.where('date').startsWith(month).toArray(),
    [month],
    []
  );
}
