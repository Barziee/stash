'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { Transaction, Category } from '@/types';

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

export function SpendingChart({ transactions, categories }: Props) {
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
    return <p className="text-center text-[#404042] py-8 text-sm">אין הוצאות החודש</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => `₪${Number(v).toFixed(2)}`}
          contentStyle={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--foreground)',
            fontSize: '12px',
          }}
          labelStyle={{ color: '#666668' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
