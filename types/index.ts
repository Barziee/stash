export type TransactionType = 'income' | 'expense';
export type TransactionSource = 'manual' | 'scraped' | 'imported';
export type Currency = 'NIS' | 'USD';

export interface Category {
  id?: number;
  name: string;
  color: string;
  icon: string;
}

export interface Transaction {
  id?: number;
  amount: number;
  currency: Currency;
  originalAmount: number;
  originalCurrency: Currency;
  categoryId: number;
  date: string;             // YYYY-MM-DD
  notes?: string;
  type: TransactionType;
  source: TransactionSource;
  supabaseId?: string;
  splitWithName?: string;   // e.g. "נועה"
  splitRatio?: number;      // 0.5 = 50/50, 0.33 = you paid 33%
}

export interface Budget {
  id?: number;
  categoryId: number;
  month: string;
  limitAmount: number;
  supabaseId?: string;
}

export interface AppSettings {
  id?: number;
  salary: number;
  displayCurrency: Currency;
}

export interface BankCredential {
  id?: number;
  bankName: string;
  username: string;
  encryptedPassword: string;
  iv: string;
}

export interface ExchangeRate {
  id?: number;
  usdToNis: number;
  fetchedAt: string;
}

export interface RecurringTransaction {
  id?: number;
  categoryId: number;
  amount: number;
  dayOfMonth: number;   // 1–28, day to auto-add each month
  notes?: string;
  type: TransactionType;
  lastAddedMonth?: string; // YYYY-MM — prevents double-adding
}

export interface SavingsGoal {
  id?: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;  // YYYY-MM-DD
  color: string;
  icon: string;
}
