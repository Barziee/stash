import { useState, useEffect } from 'react';
import { getExchangeRate } from '@/lib/currency/exchange';

export function useExchangeRate(): number {
  const [rate, setRate] = useState<number>(3.7);

  useEffect(() => {
    getExchangeRate().then(setRate);
  }, []);

  return rate;
}
