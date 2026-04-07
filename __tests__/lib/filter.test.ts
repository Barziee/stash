import { filterTransactions } from '@/lib/transactions/filter';
import type { Transaction, Category } from '@/types';

const cat1: Category = { id: 1, name: 'מסעדות', color: '#c47840', icon: '🍽️' };
const cat2: Category = { id: 2, name: 'תחבורה', color: '#4088a8', icon: '🚌' };
const catMap = { 1: cat1, 2: cat2 };

const txns: Transaction[] = [
  {
    id: 1, amount: 50, currency: 'NIS', originalAmount: 50, originalCurrency: 'NIS',
    categoryId: 1, date: '2026-04-01', notes: 'קפה', type: 'expense', source: 'manual',
  },
  {
    id: 2, amount: 30, currency: 'NIS', originalAmount: 30, originalCurrency: 'NIS',
    categoryId: 2, date: '2026-04-02', type: 'expense', source: 'manual',
  },
  {
    id: 3, amount: 5000, currency: 'NIS', originalAmount: 5000, originalCurrency: 'NIS',
    categoryId: 1, date: '2026-04-03', notes: 'משכורת אפריל', type: 'income', source: 'manual',
  },
];

describe('filterTransactions', () => {
  it('returns all when no filters applied', () => {
    const result = filterTransactions(txns, { type: 'all', categoryId: 'all', search: '', catMap });
    expect(result).toHaveLength(3);
  });

  it('filters by type=expense', () => {
    const result = filterTransactions(txns, { type: 'expense', categoryId: 'all', search: '', catMap });
    expect(result).toHaveLength(2);
    expect(result.every(t => t.type === 'expense')).toBe(true);
  });

  it('filters by type=income', () => {
    const result = filterTransactions(txns, { type: 'income', categoryId: 'all', search: '', catMap });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  it('filters by categoryId', () => {
    const result = filterTransactions(txns, { type: 'all', categoryId: '2', search: '', catMap });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('filters by search matching notes', () => {
    const result = filterTransactions(txns, { type: 'all', categoryId: 'all', search: 'קפה', catMap });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('filters by search matching category name', () => {
    const result = filterTransactions(txns, { type: 'all', categoryId: 'all', search: 'תחבורה', catMap });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('search is case-insensitive (latin)', () => {
    const txnsLatin: Transaction[] = [
      {
        id: 10, amount: 20, currency: 'NIS', originalAmount: 20, originalCurrency: 'NIS',
        categoryId: 1, date: '2026-04-01', notes: 'Coffee', type: 'expense', source: 'manual',
      },
    ];
    const result = filterTransactions(txnsLatin, { type: 'all', categoryId: 'all', search: 'coffee', catMap });
    expect(result).toHaveLength(1);
  });

  it('returns empty array when no match', () => {
    const result = filterTransactions(txns, { type: 'all', categoryId: 'all', search: 'xyznotfound', catMap });
    expect(result).toHaveLength(0);
  });

  it('combines type + search filters', () => {
    const result = filterTransactions(txns, { type: 'expense', categoryId: 'all', search: 'קפה', catMap });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('handles transactions with no notes', () => {
    const result = filterTransactions(txns, { type: 'all', categoryId: 'all', search: 'תחבורה', catMap });
    expect(result[0].notes).toBeUndefined();
    expect(result).toHaveLength(1);
  });
});
