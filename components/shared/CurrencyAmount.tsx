import type { Currency } from '@/types';
import { formatAmount } from '@/lib/currency/exchange';

interface Props {
  amount: number;
  currency: Currency;
  className?: string;
}

export function CurrencyAmount({ amount, currency, className }: Props) {
  return <span className={className}>{formatAmount(amount, currency)}</span>;
}
