import 'fake-indexeddb/auto';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import type { Transaction, Category } from '@/types';

jest.mock('@/lib/db/queries', () => ({
  deleteTransaction: jest.fn().mockResolvedValue(undefined),
  updateTransaction: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/hooks/useCategories', () => ({
  useCategories: () => [
    { id: 1, name: 'מסעדות', color: '#c47840', icon: '🍽️' },
  ],
}));

const category: Category = { id: 1, name: 'מסעדות', color: '#c47840', icon: '🍽️' };

const expense: Transaction = {
  id: 1,
  amount: 49.9,
  currency: 'NIS',
  originalAmount: 49.9,
  originalCurrency: 'NIS',
  categoryId: 1,
  date: '2026-04-01',
  notes: 'ארוחת צהריים',
  type: 'expense',
  source: 'manual',
};

const income: Transaction = {
  id: 2,
  amount: 5000,
  currency: 'NIS',
  originalAmount: 5000,
  originalCurrency: 'NIS',
  categoryId: 1,
  date: '2026-04-03',
  type: 'income',
  source: 'manual',
};

describe('TransactionItem', () => {
  it('renders category name', () => {
    render(<TransactionItem transaction={expense} category={category} />);
    expect(screen.getByText('מסעדות')).toBeInTheDocument();
  });

  it('renders category icon', () => {
    render(<TransactionItem transaction={expense} category={category} />);
    expect(screen.getByText('🍽️')).toBeInTheDocument();
  });

  it('renders notes when present', () => {
    render(<TransactionItem transaction={expense} category={category} />);
    expect(screen.getByText('ארוחת צהריים')).toBeInTheDocument();
  });

  it('renders amount with minus sign for expense', () => {
    render(<TransactionItem transaction={expense} category={category} />);
    expect(screen.getByText('-₪49.90')).toBeInTheDocument();
  });

  it('renders amount with plus sign for income', () => {
    render(<TransactionItem transaction={income} category={category} />);
    expect(screen.getByText('+₪5000.00')).toBeInTheDocument();
  });

  it('renders fallback icon when category is missing', () => {
    render(<TransactionItem transaction={expense} />);
    expect(screen.getByText('📦')).toBeInTheDocument();
  });

  it('renders date', () => {
    render(<TransactionItem transaction={expense} category={category} />);
    expect(screen.getByText('2026-04-01')).toBeInTheDocument();
  });

  it('calls deleteTransaction when delete button is clicked', async () => {
    const { deleteTransaction } = await import('@/lib/db/queries');
    render(<TransactionItem transaction={expense} category={category} />);

    // Buttons are always in DOM (opacity-0 on non-hover, opacity-100 on hover)
    // Order: [edit, delete] — delete is the last button
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons[buttons.length - 1];
    fireEvent.click(deleteButton);
    expect(deleteTransaction).toHaveBeenCalledWith(1);
  });
});
