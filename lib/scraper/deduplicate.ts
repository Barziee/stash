import type { Transaction } from '@/types';

/**
 * Returns only the scraped transactions that are NOT already present in the DB.
 * Match criteria: same date + same amount (within ±0.01) + same notes/description.
 */
export function deduplicateTransactions(
  scraped: Omit<Transaction, 'id'>[],
  existing: Transaction[]
): Omit<Transaction, 'id'>[] {
  return scraped.filter(s => {
    return !existing.some(e => {
      const sameDate = e.date === s.date;
      const sameAmount = Math.abs(e.amount - s.amount) <= 0.01;
      const sameNotes = (e.notes ?? '') === (s.notes ?? '');
      return sameDate && sameAmount && sameNotes;
    });
  });
}
