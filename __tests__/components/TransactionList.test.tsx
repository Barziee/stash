import 'fake-indexeddb/auto';
import { render, screen } from '@testing-library/react';
import { TransactionList } from '@/components/transactions/TransactionList';
import type { Transaction, Category } from '@/types';

jest.mock('@/lib/db/queries', () => ({
  deleteTransaction: jest.fn().mockResolvedValue(undefined),
  updateTransaction: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/hooks/useCategories', () => ({
  useCategories: () => [],
}));

const categories: Category[] = [
  { id: 1, name: 'מסעדות', color: '#c47840', icon: '🍽️' },
  { id: 2, name: 'תחבורה', color: '#4088a8', icon: '🚌' },
];

const transactions: Transaction[] = [
  {
    id: 1, amount: 50, currency: 'NIS', originalAmount: 50, originalCurrency: 'NIS',
    categoryId: 1, date: '2026-04-01', notes: 'ארוחת צהריים', type: 'expense', source: 'manual',
  },
  {
    id: 2, amount: 30, currency: 'NIS', originalAmount: 30, originalCurrency: 'NIS',
    categoryId: 2, date: '2026-04-02', type: 'expense', source: 'manual',
  },
];

describe('TransactionList', () => {
  it('renders all transaction items', () => {
    render(<TransactionList transactions={transactions} categories={categories} />);
    expect(screen.getByText('מסעדות')).toBeInTheDocument();
    expect(screen.getByText('תחבורה')).toBeInTheDocument();
  });

  it('shows empty state when no transactions', () => {
    render(<TransactionList transactions={[]} categories={categories} />);
    expect(screen.getByText('אין עסקאות')).toBeInTheDocument();
  });

  it('renders notes for transactions that have them', () => {
    render(<TransactionList transactions={transactions} categories={categories} />);
    expect(screen.getByText('ארוחת צהריים')).toBeInTheDocument();
  });

  it('renders all amounts', () => {
    render(<TransactionList transactions={transactions} categories={categories} />);
    expect(screen.getByText('-₪50.00')).toBeInTheDocument();
    expect(screen.getByText('-₪30.00')).toBeInTheDocument();
  });
});
