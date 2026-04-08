import { buildDayOfWeekData } from '@/components/analytics/DayOfWeekChart';
import type { Transaction } from '@/types';

const base: Omit<Transaction, 'id' | 'type' | 'amount' | 'date'> = {
  currency: 'NIS',
  originalAmount: 100,
  originalCurrency: 'NIS',
  categoryId: 1,
  source: 'manual',
};

function makeTxn(date: string, amount: number, type: 'income' | 'expense' = 'expense'): Transaction {
  return { ...base, date, amount, originalAmount: amount, type };
}

describe('buildDayOfWeekData', () => {
  it('returns 7 entries for all days', () => {
    const data = buildDayOfWeekData([]);
    expect(data).toHaveLength(7);
  });

  it('returns zero avg for all days with no transactions', () => {
    const data = buildDayOfWeekData([]);
    data.forEach(d => expect(d.avg).toBe(0));
  });

  it('ignores income transactions', () => {
    // 2026-04-06 is a Monday (day index 1)
    const txns = [makeTxn('2026-04-06', 500, 'income')];
    const data = buildDayOfWeekData(txns);
    data.forEach(d => expect(d.avg).toBe(0));
  });

  it('correctly averages spend across days', () => {
    // 2026-04-05 is a Sunday (day 0): two separate Sundays with spend 100 each
    // 2026-04-12 is also a Sunday
    const txns = [
      makeTxn('2026-04-05', 100, 'expense'),
      makeTxn('2026-04-12', 200, 'expense'),
    ];
    const data = buildDayOfWeekData(txns);
    const sunday = data[0]; // Sunday = index 0
    expect(sunday.avg).toBe(150); // (100+200)/2
    expect(sunday.count).toBe(2);
  });

  it('sums multiple expenses on the same day', () => {
    // 2026-04-05 Sunday — two transactions on same day
    const txns = [
      makeTxn('2026-04-05', 100, 'expense'),
      makeTxn('2026-04-05', 50, 'expense'),
    ];
    const data = buildDayOfWeekData(txns);
    const sunday = data[0];
    expect(sunday.avg).toBe(150); // 150 total, 1 day
    expect(sunday.count).toBe(1);
  });
});
