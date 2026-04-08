interface Props {
  dailyAvg: number;
  daysInMonth: number;
  totalSpent: number;
  salary: number;
  isCurrentMonth: boolean;
}

export function SpendingForecast({ dailyAvg, daysInMonth, totalSpent, salary, isCurrentMonth }: Props) {
  if (!isCurrentMonth || dailyAvg === 0) return null;

  const projected = dailyAvg * daysInMonth;
  const overshoot = projected - salary;
  const isOver = overshoot > 0;
  const pct = Math.min((projected / (salary || projected)) * 100, 200);
  const safeZone = Math.min((salary / (salary || projected)) * 100, 100);

  return (
    <div className="bg-card rounded-2xl p-4">
      <div className="flex justify-between items-baseline mb-3">
        <p className="text-[9px] tracking-[0.2em] text-muted-foreground/50 uppercase">תחזית חודשית</p>
        <p className={`text-sm font-bold ${isOver ? 'text-[var(--spend)]' : 'text-[var(--income)]'}`}>
          ₪{projected.toFixed(0)}
        </p>
      </div>

      {/* Progress bar showing projected vs salary */}
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-2">
        {/* Safe zone marker */}
        <div
          className="absolute top-0 bottom-0 bg-[var(--income)]/20 rounded-full"
          style={{ width: `${safeZone}%` }}
        />
        {/* Projected fill */}
        <div
          className="absolute top-0 bottom-0 rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: isOver
              ? 'linear-gradient(90deg, var(--warn), var(--spend))'
              : 'linear-gradient(90deg, var(--income), #34d399)',
          }}
        />
        {/* Salary target line */}
        {salary > 0 && (
          <div
            className="absolute top-0 bottom-0 w-px bg-foreground/20"
            style={{ left: `${safeZone}%` }}
          />
        )}
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground/40">
        <span>עכשיו ₪{totalSpent.toFixed(0)}</span>
        {salary > 0 && (
          <span className={isOver ? 'text-[var(--spend)]' : 'text-muted-foreground/40'}>
            {isOver ? `חריגה צפויה ₪${overshoot.toFixed(0)}` : `חיסכון צפוי ₪${(-overshoot).toFixed(0)}`}
          </span>
        )}
      </div>
    </div>
  );
}
