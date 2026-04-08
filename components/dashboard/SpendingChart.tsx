'use client';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { Transaction, Category } from '@/types';

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

function useCSSColor(varName: string, fallback: string): string {
  const [color, setColor] = useState(fallback);
  useEffect(() => {
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (resolved) setColor(resolved);
  }, [varName]);
  return color;
}

export function SpendingChart({ transactions, categories }: Props) {
  const cardColor = useCSSColor('--card', '#131425');
  const borderColor = useCSSColor('--border', '#1f2140');
  const fgColor = useCSSColor('--foreground', '#dde0f5');
  const mutedColor = useCSSColor('--muted-foreground', '#6b72a8');

  const data = categories
    .map(cat => ({
      name: `${cat.icon} ${cat.name}`,
      value: transactions
        .filter(t => t.type === 'expense' && t.categoryId === cat.id)
        .reduce((s, t) => s + t.amount, 0),
      color: cat.color,
    }))
    .filter(d => d.value > 0);

  if (data.length === 0) {
    return <p className="text-center text-muted-foreground py-8 text-sm">אין הוצאות החודש</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => `₪${Number(v).toFixed(2)}`}
          contentStyle={{
            background: cardColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            fontSize: '12px',
          }}
          itemStyle={{ color: fgColor }}
          labelStyle={{ color: mutedColor }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
