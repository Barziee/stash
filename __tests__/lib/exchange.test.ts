import { convertToNIS, formatAmount } from '@/lib/currency/exchange';

describe('convertToNIS', () => {
  it('returns same amount when currency is NIS', () => {
    expect(convertToNIS(100, 'NIS', 3.7)).toBe(100);
  });

  it('converts USD to NIS using rate', () => {
    expect(convertToNIS(10, 'USD', 3.7)).toBeCloseTo(37);
  });
});

describe('formatAmount', () => {
  it('formats NIS with ₪ symbol', () => {
    expect(formatAmount(150, 'NIS')).toBe('₪150.00');
  });

  it('formats USD with $ symbol', () => {
    expect(formatAmount(10.5, 'USD')).toBe('$10.50');
  });
});
