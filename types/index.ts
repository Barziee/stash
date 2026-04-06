export type TransactionType = 'income' | 'expense';
export type TransactionSource = 'manual' | 'scraped' | 'imported';
export type Currency = 'NIS' | 'USD';

export interface Category {
  id?: number;
  name: string;
  color: string;   // hex e.g. "#FF6B6B"
  icon: string;    // emoji e.g. "🍔"
}

export interface Transaction {
  id?: number;
  amount: number;           // always NIS equivalent at time of entry
  currency: Currency;       // display currency
  originalAmount: number;   // amount in original currency
  originalCurrency: Currency;
  categoryId: number;
  date: string;             // YYYY-MM-DD
  notes?: string;
  type: TransactionType;
  source: TransactionSource;
  supabaseId?: string;
}

export interface Budget {
  id?: number;
  categoryId: number;
  month: string;       // YYYY-MM
  limitAmount: number; // NIS
  supabaseId?: string;
}

export interface AppSettings {
  id?: number;
  salary: number;      // monthly salary in NIS
  displayCurrency: Currency;
}

export interface BankCredential {
  id?: number;
  bankName: string;
  username: string;
  encryptedPassword: string; // base64 AES-256-GCM ciphertext
  iv: string;                // base64 IV
}

export interface ExchangeRate {
  id?: number;
  usdToNis: number;
  fetchedAt: string; // ISO timestamp
}
