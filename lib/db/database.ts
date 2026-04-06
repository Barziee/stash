import Dexie, { type Table } from 'dexie';
import type { Category, Transaction, Budget, AppSettings, BankCredential, ExchangeRate } from '@/types';

class ExpenseDB extends Dexie {
  categories!: Table<Category>;
  transactions!: Table<Transaction>;
  budgets!: Table<Budget>;
  settings!: Table<AppSettings>;
  bankCredentials!: Table<BankCredential>;
  exchangeRates!: Table<ExchangeRate>;

  constructor() {
    super('ExpenseTrackerDB');
    this.version(1).stores({
      categories: '++id, name',
      transactions: '++id, date, categoryId, type, source, supabaseId',
      budgets: '++id, categoryId, month',
      settings: '++id',
      bankCredentials: '++id, bankName',
      exchangeRates: '++id, fetchedAt',
    });
  }
}

export const db = new ExpenseDB();

export async function seedDefaultCategories(): Promise<void> {
  const count = await db.categories.count();
  if (count > 0) return;

  await db.categories.bulkAdd([
    { name: 'Food & Dining',   color: '#FF6B6B', icon: '🍔' },
    { name: 'Transportation',  color: '#4ECDC4', icon: '🚗' },
    { name: 'Shopping',        color: '#45B7D1', icon: '🛍️' },
    { name: 'Entertainment',   color: '#96CEB4', icon: '🎬' },
    { name: 'Health',          color: '#FFEAA7', icon: '💊' },
    { name: 'Housing',         color: '#DDA0DD', icon: '🏠' },
    { name: 'Utilities',       color: '#98D8C8', icon: '⚡' },
    { name: 'Education',       color: '#F7DC6F', icon: '📚' },
    { name: 'Salary',          color: '#58D68D', icon: '💰' },
    { name: 'Other',           color: '#BDC3C7', icon: '📦' },
  ]);
}
