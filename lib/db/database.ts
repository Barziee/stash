import Dexie, { type Table } from 'dexie';
import type {
  Category, Transaction, Budget, AppSettings,
  BankCredential, ExchangeRate, RecurringTransaction, SavingsGoal
} from '@/types';

class ExpenseDB extends Dexie {
  categories!: Table<Category>;
  transactions!: Table<Transaction>;
  budgets!: Table<Budget>;
  settings!: Table<AppSettings>;
  bankCredentials!: Table<BankCredential>;
  exchangeRates!: Table<ExchangeRate>;
  recurringTransactions!: Table<RecurringTransaction>;
  savingsGoals!: Table<SavingsGoal>;

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
    this.version(2).stores({
      categories: '++id, name',
      transactions: '++id, date, categoryId, type, source, supabaseId',
      budgets: '++id, categoryId, month',
      settings: '++id',
      bankCredentials: '++id, bankName',
      exchangeRates: '++id, fetchedAt',
      recurringTransactions: '++id, categoryId, lastAddedMonth',
      savingsGoals: '++id',
    });
  }
}

export const db = new ExpenseDB();

export async function seedDefaultCategories(): Promise<void> {
  const count = await db.categories.count();
  if (count > 0) return;

  await db.categories.bulkAdd([
    { name: 'סופרמרקט',   color: '#e05c5c', icon: '🛒' },
    { name: 'מסעדות',     color: '#e07a3a', icon: '🍽️' },
    { name: 'תחבורה',     color: '#3aacaa', icon: '🚌' },
    { name: 'קניות',      color: '#4a9cd4', icon: '👕' },
    { name: 'בידור',      color: '#7a6fd4', icon: '🎬' },
    { name: 'בריאות',     color: '#d4a030', icon: '💊' },
    { name: 'דיור',       color: '#9b7fba', icon: '🏠' },
    { name: 'חשבונות',    color: '#4aaa8a', icon: '⚡' },
    { name: 'חינוך',      color: '#c9b040', icon: '📚' },
    { name: 'משכורת',     color: '#34b87a', icon: '💰' },
    { name: 'אחר',        color: '#5a5a6a', icon: '📦' },
  ]);
}
