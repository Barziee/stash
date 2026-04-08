import { computeStreak } from '@/components/analytics/SpendingStreak';
import type { Transaction } from '@/types';

const base: Omit<Transaction, 'id' | 'type' | 'amount' | 'date'> = {
  currency: 'NIS',
  originalAmount: 100,
  originalCurrency: 'NIS',
  categoryId: 1,
  source: 'manual',
};

function makeExpense(date: string, amount: number): Transaction {
  return { ...base, date, amount, originalAmount: amount, type: 'expense' };
}

describe('computeStreak', () => {
  // Use a past month so all days are "completed"
  const month = '2025-01'; // January 2025 — 31 days, in the past

  it('returns streak=0 when salary is 0', () => {
    const { streak, dailyBudget } = computeStreak([], 0, month);
    expect(streak).toBe(0);
    expect(dailyBudget).toBe(0);
  });

  it('counts all days as within budget when no expenses', () => {
    const { streak } = computeStreak([], 31000, month);
    // dailyBudget = 31000/31 = 1000; all days have 0 spend ≤ 1000
    expect(streak).toBe(31);
  });

  it('breaks streak on last day that exceeds daily budget', () => {
    // dailyBudget = 1000/day; Jan 31 (last day) has 2000 spend → streak breaks immediately
    const txns = [makeExpense('2025-01-31', 2000)];
    const { streak } = computeStreak(txns, 31000, month);
    // Starting from day 31, it fails immediately → streak = 0
    expect(streak).toBe(0);
  });

  it('streak stops at first over-budget day from the end', () => {
    // Jan 29 is over budget, 30 and 31 are fine
    const txns = [makeExpense('2025-01-29', 9999)];
    const { streak } = computeStreak(txns, 31000, month);
    // days 30, 31 are fine (0 spend each) → streak = 2
    expect(streak).toBe(2);
  });

  it('calculates dailyBudget correctly', () => {
    const { dailyBudget } = computeStreak([], 3100, month);
    expect(dailyBudget).toBeCloseTo(100, 1);
  });
});
