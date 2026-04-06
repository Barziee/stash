import { db } from './database';
import type { Transaction, Budget, Category, AppSettings } from '@/types';

// ── Transactions ────────────────────────────────────────────────────────────

export async function addTransaction(t: Omit<Transaction, 'id'>): Promise<number> {
  return db.transactions.add(t);
}

export async function updateTransaction(id: number, changes: Partial<Transaction>): Promise<void> {
  await db.transactions.update(id, changes);
}

export async function deleteTransaction(id: number): Promise<void> {
  await db.transactions.delete(id);
}

/** Returns all transactions for a given YYYY-MM month string */
export async function getTransactionsByMonth(month: string): Promise<Transaction[]> {
  return db.transactions
    .where('date')
    .startsWith(month)
    .toArray();
}

// ── Budgets ─────────────────────────────────────────────────────────────────

export async function getBudgetsForMonth(month: string): Promise<Budget[]> {
  return db.budgets.where('month').equals(month).toArray();
}

export async function upsertBudget(budget: Omit<Budget, 'id'> & { id?: number }): Promise<number> {
  if (budget.id) {
    await db.budgets.update(budget.id, budget);
    return budget.id;
  }
  return db.budgets.add(budget);
}

export async function deleteBudget(id: number): Promise<void> {
  await db.budgets.delete(id);
}

// ── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  return db.categories.toArray();
}

export async function addCategory(c: Omit<Category, 'id'>): Promise<number> {
  return db.categories.add(c);
}

export async function updateCategory(id: number, changes: Partial<Category>): Promise<void> {
  await db.categories.update(id, changes);
}

export async function deleteCategory(id: number): Promise<void> {
  await db.categories.delete(id);
}

// ── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  const s = await db.settings.toCollection().first();
  if (s) return s;
  const id = await db.settings.add({ salary: 0, displayCurrency: 'NIS' });
  return { id, salary: 0, displayCurrency: 'NIS' };
}

export async function updateSettings(changes: Partial<AppSettings>): Promise<void> {
  const s = await getSettings();
  await db.settings.update(s.id!, changes);
}

// ── Exchange Rate ─────────────────────────────────────────────────────────────

export async function getCachedRate(): Promise<number | null> {
  const rate = await db.exchangeRates.orderBy('fetchedAt').last();
  if (!rate) return null;
  const fetchedAt = new Date(rate.fetchedAt);
  const ageHours = (Date.now() - fetchedAt.getTime()) / 3_600_000;
  if (ageHours > 24) return null; // stale
  return rate.usdToNis;
}

export async function saveRate(usdToNis: number): Promise<void> {
  await db.exchangeRates.clear();
  await db.exchangeRates.add({ usdToNis, fetchedAt: new Date().toISOString() });
}
