import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/database';
import type { Budget } from '@/types';

export function useBudgets(month: string): Budget[] {
  return useLiveQuery(
    () => db.budgets.where('month').equals(month).toArray(),
    [month],
    []
  );
}
