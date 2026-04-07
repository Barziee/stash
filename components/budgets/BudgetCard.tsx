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
    ? 'linear-gradient(90deg, #a84444, #b85050)'
    : warning
    ? 'linear-gradient(90deg, #9e8030, #ae9030)'
    : 'linear-gradient(90deg, #4a9e78, #3d8e68)';

  return (
    <div className={`bg-[#191919] rounded-xl p-3 ${over ? 'border border-[#a8444420]' : ''}`}>
      <div className="flex justify-between items-center mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-sm font-medium text-[#d1d1d4]">{category.name}</span>
        </div>
        {over && <span className="text-xs font-medium text-[#a84444]">חריגה מתקציב</span>}
        {warning && <span className="text-xs font-medium text-[#9e8030]">קרוב לגבול</span>}
      </div>
      <div className="h-1 bg-[#222224] rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barGradient }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[#404042]">
        <span>הוצא ₪{spent.toFixed(0)}</span>
        <span>מגבלה ₪{budget.limitAmount}</span>
      </div>
    </div>
  );
}
