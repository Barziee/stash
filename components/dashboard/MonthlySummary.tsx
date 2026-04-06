import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/types';

interface Props {
  transactions: Transaction[];
  salary: number;
}

export function MonthlySummary({ transactions, salary }: Props) {
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, salary);
  const balance = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs text-muted-foreground">Income</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <p className="text-lg font-bold text-green-600">₪{totalIncome.toFixed(0)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs text-muted-foreground">Expenses</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <p className="text-lg font-bold text-red-500">₪{totalExpenses.toFixed(0)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs text-muted-foreground">Balance</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <p className={`text-lg font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
            ₪{balance.toFixed(0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
