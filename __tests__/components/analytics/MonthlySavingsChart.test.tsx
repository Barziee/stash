import { buildMonthlySavingsData } from '@/components/analytics/MonthlySavingsChart';
import type { Transaction } from '@/types';

const base: Omit<Transaction, 'id' | 'type' | 'amount' | 'date'> = {
  currency: 'NIS',
  originalAmount: 100,
  originalCurrency: 'NIS',
  categoryId: 1,
  source: 'manual',
};

function makeTxn(date: string, amount: number, type: 'income' | 'expense'): Transaction {
  return { ...base, date, amount, originalAmount: amount, type };
}

describe('buildMonthlySavingsData', () => {
  const months = ['2026-01', '2026-02', '2026-03'];

  it('calculates savings correctly when income > expenses', () => {
    const txns = [
      makeTxn('2026-01-10', 5000, 'income'),
      makeTxn('2026-01-15', 2000, 'expense'),
    ];
    const data = buildMonthlySavingsData(txns, months);
    expect(data[0].income).toBe(5000);
    expect(data[0].expenses).toBe(2000);
    expect(data[0].savings).toBe(3000);
  });

  it('returns negative savings when expenses > income', () => {
    const txns = [
      makeTxn('2026-02-05', 500, 'income'),
      makeTxn('2026-02-20', 1500, 'expense'),
    ];
    const data = buildMonthlySavingsData(txns, months);
    expect(data[1].savings).toBe(-1000);
  });

  it('returns zero savings for months with no transactions', () => {
    const data = buildMonthlySavingsData([], months);
    data.forEach(d => {
      expect(d.income).toBe(0);
      expect(d.expenses).toBe(0);
      expect(d.savings).toBe(0);
    });
  });

  it('assigns correct Hebrew month labels', () => {
    const data = buildMonthlySavingsData([], ['2026-01', '2026-06', '2026-12']);
    expect(data[0].label).toBe('ינו׳');
    expect(data[1].label).toBe('יוני');
    expect(data[2].label).toBe('דצמ׳');
  });
});
