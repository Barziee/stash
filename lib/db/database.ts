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

const CURRENT_CATEGORIES = [
  { name: 'סופרמרקט',  color: '#c46060', icon: '🛒' },
  { name: 'מסעדות',    color: '#c47840', icon: '🍽️' },
  { name: 'תחבורה',    color: '#4088a8', icon: '🚌' },
  { name: 'קניות',     color: '#5070a8', icon: '👕' },
  { name: 'בידור',     color: '#6858a8', icon: '🎬' },
  { name: 'בריאות',    color: '#a07030', icon: '💊' },
  { name: 'דיור',      color: '#7060a0', icon: '🏠' },
  { name: 'אחר',       color: '#505055', icon: '📦' },
  { name: 'משכורת',    color: '#4a9e78', icon: '💰' },
];

// Names that indicate the old English seed — triggers migration
const OLD_ENGLISH_MARKERS = ['Food & Dining', 'Transportation', 'Shopping', 'Salary'];

export async function seedDefaultCategories(): Promise<void> {
  const existing = await db.categories.toArray();

  if (existing.length > 0) {
    const needsMigration = existing.some(c => OLD_ENGLISH_MARKERS.includes(c.name));
    if (!needsMigration) return; // already correct Hebrew set
    await db.categories.clear();
  }

  await db.categories.bulkAdd(CURRENT_CATEGORIES);
}
