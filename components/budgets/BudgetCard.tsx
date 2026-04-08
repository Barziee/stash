import type { Budget, Category } from '@/types';

interface Props {
  budget: Budget;
  category: Category;
  spent: number;
}

export function BudgetCard({ budget, category, spent }: Props) {
  const pct = Math.min((spent / budget.limitAmount) * 100, 100);
  const over = spent > budget.limitAmount;
  const warning = pct >= 80 && !over;

  const barGradient = over
    ? 'linear-gradient(90deg, var(--spend), #f87171)'
    : warning
    ? 'linear-gradient(90deg, var(--warn), #fcd34d)'
    : 'linear-gradient(90deg, var(--income), #34d399)';

  return (
    <div className={`bg-card rounded-xl p-3 border ${over ? 'border-[var(--spend)]/20' : 'border-transparent'}`}>
      <div className="flex justify-between items-center mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base">{category.icon}</span>
          <span className="text-sm font-medium text-foreground">{category.name}</span>
        </div>
        {over && <span className="text-xs font-medium text-[var(--spend)]">חריגה מתקציב</span>}
        {warning && <span className="text-xs font-medium text-[var(--warn)]">קרוב לגבול</span>}
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barGradient }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground/50">
        <span>הוצא ₪{spent.toFixed(0)}</span>
        <span>מגבלה ₪{budget.limitAmount}</span>
      </div>
    </div>
  );
}
