import { deduplicateTransactions } from '@/lib/scraper/deduplicate';
import type { Transaction } from '@/types';

function makeTxn(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 1,
    amount: 100,
    currency: 'NIS',
    originalAmount: 100,
    originalCurrency: 'NIS',
    categoryId: 1,
    date: '2024-01-15',
    notes: 'Test payment',
    type: 'expense',
    source: 'scraped',
    ...overrides,
  };
}

function makeScraped(overrides: Partial<Omit<Transaction, 'id'>> = {}): Omit<Transaction, 'id'> {
  const { id: _id, ...base } = makeTxn(overrides);
  return base;
}

describe('deduplicateTransactions', () => {
  it('returns all scraped when existing is empty', () => {
    const scraped = [makeScraped(), makeScraped({ amount: 200, notes: 'Another' })];
    const result = deduplicateTransactions(scraped, []);
    expect(result).toHaveLength(2);
  });

  it('skips exact duplicates (same date, amount, notes)', () => {
    const scraped = [makeScraped({ date: '2024-01-15', amount: 100, notes: 'Coffee' })];
    const existing = [makeTxn({ date: '2024-01-15', amount: 100, notes: 'Coffee' })];
    const result = deduplicateTransactions(scraped, existing);
    expect(result).toHaveLength(0);
  });

  it('keeps transactions with same date but different amount', () => {
    const scraped = [makeScraped({ date: '2024-01-15', amount: 150, notes: 'Coffee' })];
    const existing = [makeTxn({ date: '2024-01-15', amount: 100, notes: 'Coffee' })];
    const result = deduplicateTransactions(scraped, existing);
    expect(result).toHaveLength(1);
  });

  it('keeps transactions with same amount but different date', () => {
    const scraped = [makeScraped({ date: '2024-01-20', amount: 100, notes: 'Coffee' })];
    const existing = [makeTxn({ date: '2024-01-15', amount: 100, notes: 'Coffee' })];
    const result = deduplicateTransactions(scraped, existing);
    expect(result).toHaveLength(1);
  });

  it('handles floating point amounts within ±0.01 tolerance as duplicates', () => {
    // 100.005 is within ±0.01 of 100
    const scraped = [makeScraped({ date: '2024-01-15', amount: 100.005, notes: 'Coffee' })];
    const existing = [makeTxn({ date: '2024-01-15', amount: 100, notes: 'Coffee' })];
    const result = deduplicateTransactions(scraped, existing);
    expect(result).toHaveLength(0);
  });

  it('keeps transactions outside ±0.01 floating point tolerance', () => {
    // 100.02 is outside ±0.01 of 100
    const scraped = [makeScraped({ date: '2024-01-15', amount: 100.02, notes: 'Coffee' })];
    const existing = [makeTxn({ date: '2024-01-15', amount: 100, notes: 'Coffee' })];
    const result = deduplicateTransactions(scraped, existing);
    expect(result).toHaveLength(1);
  });

  it('handles missing notes (undefined vs empty string) as equal', () => {
    const scraped = [makeScraped({ date: '2024-01-15', amount: 50, notes: undefined })];
    const existing = [makeTxn({ date: '2024-01-15', amount: 50, notes: undefined })];
    const result = deduplicateTransactions(scraped, existing);
    expect(result).toHaveLength(0);
  });

  it('keeps transactions with different notes on same date and amount', () => {
    const scraped = [makeScraped({ date: '2024-01-15', amount: 100, notes: 'Coffee' })];
    const existing = [makeTxn({ date: '2024-01-15', amount: 100, notes: 'Tea' })];
    const result = deduplicateTransactions(scraped, existing);
    expect(result).toHaveLength(1);
  });

  it('correctly filters a mix of duplicates and new transactions', () => {
    const scraped = [
      makeScraped({ date: '2024-01-10', amount: 50, notes: 'Duplicate' }),
      makeScraped({ date: '2024-01-11', amount: 75, notes: 'New one' }),
      makeScraped({ date: '2024-01-12', amount: 200, notes: 'Also new' }),
    ];
    const existing = [
      makeTxn({ date: '2024-01-10', amount: 50, notes: 'Duplicate' }),
    ];
    const result = deduplicateTransactions(scraped, existing);
    expect(result).toHaveLength(2);
    expect(result[0].notes).toBe('New one');
    expect(result[1].notes).toBe('Also new');
  });
});
