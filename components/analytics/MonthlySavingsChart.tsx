'use client';
import { useState, useEffect } from 'react';
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

function useCSSColor(varName: string, fallback: string): string {
  const [color, setColor] = useState(fallback);
  useEffect(() => {
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (resolved) setColor(resolved);
  }, [varName]);
  return color;
}

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
  const incomeColor = useCSSColor('--income', '#34d399');
  const spendColor = useCSSColor('--spend', '#f87171');
  const borderColor = useCSSColor('--border', '#1f2140');
  const mutedColor = useCSSColor('--muted-foreground', '#6b72a8');
  const cardColor = useCSSColor('--card', '#131425');
  const fgColor = useCSSColor('--foreground', '#dde0f5');

  if (data.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8 text-sm">אין נתונים להצגה</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={borderColor} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: mutedColor, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: mutedColor, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `₪${Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
        />
        <ReferenceLine y={0} stroke={borderColor} />
        <Tooltip
          formatter={(v: number) => [`₪${v.toFixed(0)}`, 'חיסכון']}
          contentStyle={{
            background: cardColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            color: fgColor,
            fontSize: '12px',
          }}
          labelStyle={{ color: mutedColor }}
        />
        <Bar dataKey="savings" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.savings >= 0 ? incomeColor : spendColor}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
