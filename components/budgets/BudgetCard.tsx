import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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

  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex justify-between items-start mb-2">
          <span className="font-medium">{category.icon} {category.name}</span>
          {over && <Badge variant="destructive">Over budget</Badge>}
          {warning && <Badge variant="outline" className="text-yellow-600 border-yellow-400">Near limit</Badge>}
        </div>
        <Progress
          value={pct}
          className={`h-2 mb-1 ${over ? '[&>div]:bg-red-500' : warning ? '[&>div]:bg-yellow-400' : ''}`}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₪{spent.toFixed(0)} spent</span>
          <span>₪{budget.limitAmount} limit</span>
        </div>
      </CardContent>
    </Card>
  );
}
