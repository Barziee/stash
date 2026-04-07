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
    ? 'linear-gradient(90deg, #c95555, #d96060)'
    : warning
    ? 'linear-gradient(90deg, #c9a030, #d4b040)'
    : 'linear-gradient(90deg, #34b87a, #2daa70)';

  return (
    <div className={`bg-[#16161e] rounded-xl p-3 ${over ? 'border border-[#c9555520]' : ''}`}>
      <div className="flex justify-between items-center mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-sm font-medium text-[#e2e2e8]">{category.name}</span>
        </div>
        {over && <span className="text-xs font-medium text-[#c95555]">חריגה מתקציב</span>}
        {warning && <span className="text-xs font-medium text-[#c9a030]">קרוב לגבול</span>}
      </div>
      <div className="h-1 bg-[#1e1e28] rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barGradient }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[#3a3a4a]">
        <span>הוצא ₪{spent.toFixed(0)}</span>
        <span>מגבלה ₪{budget.limitAmount}</span>
      </div>
    </div>
  );
}
