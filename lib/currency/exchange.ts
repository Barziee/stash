import type { Currency } from '@/types';
import { getCachedRate, saveRate } from '@/lib/db/queries';

export function convertToNIS(amount: number, currency: Currency, usdToNis: number): number {
  if (currency === 'NIS') return amount;
  return amount * usdToNis;
}

export function formatAmount(amount: number, currency: Currency): string {
  const symbol = currency === 'NIS' ? '₪' : '$';
  return `${symbol}${amount.toFixed(2)}`;
}

export async function getExchangeRate(): Promise<number> {
  const cached = await getCachedRate();
  if (cached) return cached;

  try {
    const res = await fetch('/api/exchange-rate');
    if (!res.ok) throw new Error('Rate fetch failed');
    const { usdToNis } = await res.json();
    await saveRate(usdToNis);
    return usdToNis;
  } catch {
    // Fallback rate if fetch fails and no cache
    return 3.7;
  }
}
