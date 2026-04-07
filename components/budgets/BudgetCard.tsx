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
    ? 'linear-gradient(90deg, #f56565, #f87171)'
    : warning
    ? 'linear-gradient(90deg, #f6c90e, #f7d325)'
    : 'linear-gradient(90deg, #3ecf8e, #45d68f)';

  return (
    <div className={`bg-[#1a1a24] rounded-xl p-3 ${over ? 'border border-[#f5656522]' : ''}`}>
      <div className="flex justify-between items-center mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-sm font-medium text-white">{category.name}</span>
        </div>
        {over && <span className="text-xs font-semibold text-[#f56565]">חריגה מתקציב</span>}
        {warning && <span className="text-xs font-semibold text-[#f6c90e]">קרוב לגבול</span>}
      </div>
      {/* 4px slim progress bar */}
      <div className="h-1 bg-[#252535] rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barGradient }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[#444]">
        <span>הוצא ₪{spent.toFixed(0)}</span>
        <span>מגבלה ₪{budget.limitAmount}</span>
      </div>
    </div>
  );
}
