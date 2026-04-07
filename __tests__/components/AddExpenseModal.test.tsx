import 'fake-indexeddb/auto';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddExpenseModal } from '@/components/shared/AddExpenseModal';

// Mock the hook so the test doesn't hit IndexedDB for categories
jest.mock('@/hooks/useCategories', () => ({
  useCategories: () => [
    { id: 1, name: 'Food', color: '#FF6B6B', icon: '🍔' },
  ],
}));

jest.mock('@/lib/db/queries', () => ({
  addTransaction: jest.fn().mockResolvedValue(1),
}));

jest.mock('@/hooks/useExchangeRate', () => ({
  useExchangeRate: () => 3.7,
}));

describe('AddExpenseModal', () => {
  it('renders trigger button', () => {
    render(<AddExpenseModal />);
    expect(screen.getByRole('button', { name: /הוסף הוצאה/i })).toBeInTheDocument();
  });

  it('opens modal on button click', async () => {
    render(<AddExpenseModal />);
    fireEvent.click(screen.getByRole('button', { name: /הוסף הוצאה/i }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/סכום/i)).toBeInTheDocument();
    });
  });
});
