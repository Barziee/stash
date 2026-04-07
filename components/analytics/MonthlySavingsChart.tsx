'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import type { Transaction } from '@/types';

interface MonthData {
  month: string;   // YYYY-MM
  label: string;   // e.g. "ינו׳"
  income: number;
  expenses: number;
  savings: number;
}

interface Props {
  data: MonthData[];
}

const MONTH_LABELS_HE: Record<number, string> = {
  1: 'ינו׳', 2: 'פבר׳', 3: 'מרץ', 4: 'אפר׳', 5: 'מאי', 6: 'יוני',
  7: 'יולי', 8: 'אוג׳', 9: 'ספט׳', 10: 'אוק׳', 11: 'נוב׳', 12: 'דצמ׳',
};

export function buildMonthlySavingsData(
  transactions: Transaction[],
  months: string[]
): MonthData[] {
  return months.map(month => {
    const txns = transactions.filter(t => t.date.startsWith(month));
    const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings = income - expenses;
    const [, m] = month.split('-').map(Number);
    return { month, label: MONTH_LABELS_HE[m] ?? month, income, expenses, savings };
  });
}

export function MonthlySavingsChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8 text-sm">אין נתונים להצגה</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `₪${Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
        />
        <ReferenceLine y={0} stroke="var(--border)" />
        <Tooltip
          formatter={(v: number) => [`₪${v.toFixed(0)}`, 'חיסכון']}
          contentStyle={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--foreground)',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'var(--muted-foreground)' }}
        />
        <Bar dataKey="savings" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.savings >= 0 ? 'var(--income)' : 'var(--spend)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
