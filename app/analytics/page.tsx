'use client';
import { useMemo, useEffect, useState } from 'react';
import { useLastNMonths, useAllTransactions } from '@/hooks/useAnalytics';
import { MonthlySavingsChart, buildMonthlySavingsData } from '@/components/analytics/MonthlySavingsChart';
import { DayOfWeekChart, buildDayOfWeekData } from '@/components/analytics/DayOfWeekChart';
import { TopMerchants, buildTopMerchants } from '@/components/analytics/TopMerchants';
import { SpendingStreak, computeStreak } from '@/components/analytics/SpendingStreak';
import { getSettings } from '@/lib/db/queries';

function getLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

export default function AnalyticsPage() {
  const months6 = useMemo(getLast6Months, []);
  const currentMonth = new Date().toISOString().slice(0, 7);

  const last6Txns = useLastNMonths(6);
  const allTxns = useAllTransactions();
  const currentMonthTxns = useMemo(
    () => last6Txns.filter(t => t.date.startsWith(currentMonth)),
    [last6Txns, currentMonth]
  );

  const [salary, setSalary] = useState(0);
  useEffect(() => {
    getSettings().then(s => setSalary(s.salary));
  }, []);

  const savingsData = useMemo(
    () => buildMonthlySavingsData(last6Txns, months6),
    [last6Txns, months6]
  );

  const dowData = useMemo(() => buildDayOfWeekData(allTxns), [allTxns]);

  const topMerchants = useMemo(() => buildTopMerchants(allTxns), [allTxns]);

  const { streak, dailyBudget } = useMemo(
    () => computeStreak(currentMonthTxns, salary, currentMonth),
    [currentMonthTxns, salary, currentMonth]
  );

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-foreground tracking-tight">ניתוח הוצאות</h1>

      {/* Spending Streak */}
      <SpendingStreak streak={streak} dailyBudget={dailyBudget} />

      {/* Monthly Savings */}
      <div className="bg-card rounded-2xl p-4 card-hover animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <p className="text-[9px] tracking-[0.2em] text-muted-foreground/50 uppercase mb-3">
          חיסכון חודשי — 6 חודשים אחרונים
        </p>
        <MonthlySavingsChart data={savingsData} />
      </div>

      {/* Day of Week */}
      <div className="bg-card rounded-2xl p-4 card-hover animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <p className="text-[9px] tracking-[0.2em] text-muted-foreground/50 uppercase mb-1">
          הוצאות לפי יום בשבוע
        </p>
        <p className="text-[10px] text-muted-foreground mb-3">ממוצע הוצאה בכל יום (כל הזמן)</p>
        <DayOfWeekChart data={dowData} />
        {dowData.some(d => d.avg > 0) && (
          <p className="text-[10px] text-muted-foreground/60 mt-2 text-center">
            🔶 צהוב = היום עם ההוצאה הגבוהה ביותר
          </p>
        )}
      </div>

      {/* Top Merchants */}
      <div className="bg-card rounded-2xl p-4 card-hover animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <p className="text-[9px] tracking-[0.2em] text-muted-foreground/50 uppercase mb-3">
          הוצאות חוזרות (לפי הערה)
        </p>
        <TopMerchants merchants={topMerchants} />
      </div>
    </div>
  );
}
