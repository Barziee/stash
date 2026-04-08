// israeli-bank-scrapers runs client-side only (uses Puppeteer/browser APIs)
// This wrapper is dynamically imported only in browser context
import type { Transaction } from '@/types';

export interface ScrapeResult {
  transactions: Omit<Transaction, 'id'>[];
  error?: string;
}

const BANK_ID_MAP: Record<string, string> = {
  hapoalim:  'hapoalim',
  leumi:     'leumi',
  discount:  'discount',
  mizrahi:   'mizrahi',
  isracard:  'isracard',
  max:       'max',
  cal:       'cal',
  amex:      'amex',
};

export async function runScraper(
  bankName: string,
  username: string,
  password: string,
  defaultCategoryId: number
): Promise<ScrapeResult> {
  try {
    // Dynamic import — library only works in browser with Chrome
    const { createScraper } = await import('israeli-bank-scrapers');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scraper = createScraper({ companyId: BANK_ID_MAP[bankName], verbose: false, startDate: new Date(Date.now() - 90 * 86400000) } as any);
    const result = await scraper.scrape({ username, password });

    if (!result.success) {
      return { transactions: [], error: result.errorMessage };
    }

    const txns: Omit<Transaction, 'id'>[] = (result.accounts ?? [])
      .flatMap(acc => acc.txns)
      .map(t => ({
        amount: Math.abs(t.chargedAmount),
        currency: 'NIS',
        originalAmount: Math.abs(t.chargedAmount),
        originalCurrency: 'NIS',
        categoryId: defaultCategoryId,
        date: t.date.slice(0, 10),
        notes: t.description,
        type: t.chargedAmount < 0 ? 'expense' : 'income',
        source: 'scraped',
      }));

    return { transactions: txns };
  } catch (err) {
    return { transactions: [], error: String(err) };
  }
}
