import type { Transaction, Category } from '@/types';

export interface FilterOptions {
  type: string;          // 'all' | 'expense' | 'income'
  categoryId: string;    // 'all' | numeric string
  search: string;
  catMap: Record<number, Category>;
}

/**
 * Pure filter function for transactions.
 * Kept separate from the component so it can be unit-tested without React.
 */
export function filterTransactions(
  transactions: Transaction[],
  { type, categoryId, search, catMap }: FilterOptions
): Transaction[] {
  const q = search.trim().toLowerCase();

  return transactions.filter(t => {
    if (type !== 'all' && t.type !== type) return false;
    if (categoryId !== 'all' && t.categoryId !== parseInt(categoryId)) return false;

    if (q) {
      const notesMatch = t.notes?.toLowerCase().includes(q) ?? false;
      const catName = catMap[t.categoryId]?.name?.toLowerCase() ?? '';
      const catMatch = catName.includes(q);
      if (!notesMatch && !catMatch) return false;
    }

    return true;
  });
}
