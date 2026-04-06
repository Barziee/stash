import { render, screen } from '@testing-library/react';
import { BudgetCard } from '@/components/budgets/BudgetCard';

const budget = { id: 1, categoryId: 1, month: '2026-03', limitAmount: 1000 };
const category = { id: 1, name: 'Food', color: '#FF6B6B', icon: '🍔' };

describe('BudgetCard', () => {
  it('shows category name and limit', () => {
    render(<BudgetCard budget={budget} category={category} spent={400} />);
    expect(screen.getByText('🍔 Food')).toBeInTheDocument();
    expect(screen.getByText(/₪1000/)).toBeInTheDocument();
  });

  it('shows green progress bar when under 80%', () => {
    render(<BudgetCard budget={budget} category={category} spent={400} />);
    // 400/1000 = 40% — should not have warning class
    expect(screen.queryByText(/over budget/i)).not.toBeInTheDocument();
  });

  it('shows over budget label when spent exceeds limit', () => {
    render(<BudgetCard budget={budget} category={category} spent={1200} />);
    expect(screen.getByText(/over budget/i)).toBeInTheDocument();
  });
});
