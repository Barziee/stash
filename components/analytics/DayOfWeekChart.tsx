'use client';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import type { Transaction } from '@/types';

const DAY_LABELS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export interface DayOfWeekData {
  day: string;
  avg: number;
  count: number;
}

export function buildDayOfWeekData(transactions: Transaction[]): DayOfWeekData[] {
  const expenses = transactions.filter(t => t.type === 'expense');

  const totals = Array(7).fill(0) as number[];
  const seenDays: Set<string>[] = Array.from({ length: 7 }, () => new Set<string>());

  for (const t of expenses) {
    const d = new Date(t.date + 'T12:00:00');
    const dow = d.getDay();
    totals[dow] += t.amount;
    seenDays[dow].add(t.date);
  }

  return DAY_LABELS_HE.map((day, i) => ({
    day,
    avg: seenDays[i].size > 0 ? Math.round(totals[i] / seenDays[i].size) : 0,
    count: seenDays[i].size,
  }));
}

interface Props {
  data: DayOfWeekData[];
}

function useCSSColor(varName: string, fallback: string): string {
  const [color, setColor] = useState(fallback);
  useEffect(() => {
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (resolved) setColor(resolved);
  }, [varName]);
  return color;
}

export function DayOfWeekChart({ data }: Props) {
  const primaryColor = useCSSColor('--primary', '#8b5cf6');
  const warnColor = useCSSColor('--warn', '#fbbf24');
  const borderColor = useCSSColor('--border', '#1f2140');
  const mutedColor = useCSSColor('--muted-foreground', '#6b72a8');
  const cardColor = useCSSColor('--card', '#131425');
  const fgColor = useCSSColor('--foreground', '#dde0f5');

  if (data.every(d => d.avg === 0)) {
    return (
      <p className="text-center text-muted-foreground py-8 text-sm">אין נתונים להצגה</p>
    );
  }

  const maxVal = Math.max(...data.map(d => d.avg));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={borderColor} vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: mutedColor, fontSize: 9 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: mutedColor, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `₪${v}`}
        />
        <Tooltip
          formatter={(v) => [`₪${v}`, 'ממוצע הוצאה']}
          contentStyle={{
            background: cardColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            color: fgColor,
            fontSize: '12px',
          }}
          labelStyle={{ color: mutedColor }}
        />
        <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.avg === maxVal && maxVal > 0 ? warnColor : primaryColor}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
