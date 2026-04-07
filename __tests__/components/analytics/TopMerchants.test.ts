import { buildTopMerchants } from '@/components/analytics/TopMerchants';
import type { Transaction } from '@/types';

const base: Omit<Transaction, 'id' | 'type' | 'amount' | 'date' | 'notes'> = {
  currency: 'NIS',
  originalAmount: 100,
  originalCurrency: 'NIS',
  categoryId: 1,
  source: 'manual',
};

function makeTxn(notes: string | undefined, amount: number, type: 'income' | 'expense' = 'expense'): Transaction {
  return { ...base, notes, date: '2026-04-01', amount, originalAmount: amount, type };
}

describe('buildTopMerchants', () => {
  it('returns empty array when no expense notes', () => {
    const result = buildTopMerchants([]);
    expect(result).toHaveLength(0);
  });

  it('excludes income transactions', () => {
    const txns = [makeTxn('Salary', 5000, 'income')];
    expect(buildTopMerchants(txns)).toHaveLength(0);
  });

  it('excludes transactions with no notes', () => {
    const txns = [{ ...base, notes: undefined, date: '2026-04-01', amount: 100, originalAmount: 100, type: 'expense' as const }];
    expect(buildTopMerchants(txns)).toHaveLength(0);
  });

  it('groups by notes and sums correctly', () => {
    const txns = [
      makeTxn('Starbucks', 30),
      makeTxn('Starbucks', 25),
      makeTxn('Sushi', 120),
    ];
    const result = buildTopMerchants(txns);
    expect(result).toHaveLength(2);
    // Sushi has higher total
    expect(result[0].name).toBe('Sushi');
    expect(result[0].total).toBe(120);
    expect(result[1].name).toBe('Starbucks');
    expect(result[1].total).toBe(55);
    expect(result[1].count).toBe(2);
  });

  it('respects the limit parameter', () => {
    const txns = Array.from({ length: 10 }, (_, i) =>
      makeTxn(`Merchant ${i}`, 100 + i)
    );
    const result = buildTopMerchants(txns, 5);
    expect(result).toHaveLength(5);
  });
});
