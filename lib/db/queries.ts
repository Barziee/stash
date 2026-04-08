import { db } from './database';
import type { Transaction, Budget, Category, AppSettings, RecurringTransaction, SavingsGoal } from '@/types';

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

export async function getTransactionsByMonth(month: string): Promise<Transaction[]> {
  return db.transactions.where('date').startsWith(month).toArray();
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
  if (ageHours > 24) return null;
  return rate.usdToNis;
}

export async function saveRate(usdToNis: number): Promise<void> {
  await db.exchangeRates.clear();
  await db.exchangeRates.add({ usdToNis, fetchedAt: new Date().toISOString() });
}

// ── Recurring Transactions ───────────────────────────────────────────────────

export async function getRecurringTransactions(): Promise<RecurringTransaction[]> {
  return db.recurringTransactions.toArray();
}

export async function addRecurringTransaction(r: Omit<RecurringTransaction, 'id'>): Promise<number> {
  return db.recurringTransactions.add(r);
}

export async function deleteRecurringTransaction(id: number): Promise<void> {
  await db.recurringTransactions.delete(id);
}

/**
 * Called on app load — checks each recurring transaction and auto-adds
 * transactions for the current month if not already added.
 */
export async function processRecurringTransactions(): Promise<void> {
  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7);
  const dayOfMonth = today.getDate();

  const recurrings = await db.recurringTransactions.toArray();
  for (const r of recurrings) {
    if (r.lastAddedMonth === currentMonth) continue;
    if (dayOfMonth < r.dayOfMonth) continue;

    // Use a transaction to prevent race conditions (React Strict Mode double-fire)
    await db.transaction('rw', [db.recurringTransactions, db.transactions], async () => {
      // Re-check inside transaction to prevent duplicate adds
      const fresh = await db.recurringTransactions.get(r.id!);
      if (!fresh || fresh.lastAddedMonth === currentMonth) return;

      await db.transactions.add({
        amount: r.amount,
        currency: 'NIS',
        originalAmount: r.amount,
        originalCurrency: 'NIS',
        categoryId: r.categoryId,
        date: `${currentMonth}-${String(r.dayOfMonth).padStart(2, '0')}`,
        notes: r.notes,
        type: r.type,
        source: 'manual',
      });

      await db.recurringTransactions.update(r.id!, { lastAddedMonth: currentMonth });
    });
  }
}

// ── Analytics ────────────────────────────────────────────────────────────────

/**
 * Returns transactions for a range of months (e.g. last N months).
 * months: array of YYYY-MM strings
 */
export async function getTransactionsForMonths(months: string[]): Promise<Transaction[]> {
  const results = await Promise.all(
    months.map(m => db.transactions.where('date').startsWith(m).toArray())
  );
  return results.flat();
}

/**
 * Returns all transactions ever recorded.
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  return db.transactions.toArray();
}

// ── Savings Goals ────────────────────────────────────────────────────────────

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  return db.savingsGoals.toArray();
}

export async function addSavingsGoal(g: Omit<SavingsGoal, 'id'>): Promise<number> {
  return db.savingsGoals.add(g);
}

export async function updateSavingsGoal(id: number, changes: Partial<SavingsGoal>): Promise<void> {
  await db.savingsGoals.update(id, changes);
}

export async function deleteSavingsGoal(id: number): Promise<void> {
  await db.savingsGoals.delete(id);
}

// ── Reset ───────────────────────────────────────────────────────────────────

export async function resetAllData(): Promise<void> {
  await db.transactions.clear();
  await db.budgets.clear();
  await db.recurringTransactions.clear();
  await db.savingsGoals.clear();
  await db.exchangeRates.clear();
  await db.bankCredentials.clear();
  await db.settings.clear();
  await db.categories.clear();
}
