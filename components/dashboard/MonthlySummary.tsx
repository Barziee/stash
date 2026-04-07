import type { Transaction } from '@/types';

interface Props {
  transactions: Transaction[];
  salary: number;
  hidden: boolean;
}

export function MonthlySummary({ transactions, salary, hidden }: Props) {
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, salary);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-[#1a1a24] rounded-xl p-3">
        <p className="text-[9px] tracking-[0.15em] text-[#444] uppercase mb-1.5">הכנסה</p>
        <p
          className="text-xl font-bold text-[#3ecf8e] transition-all duration-200"
          style={hidden ? { filter: 'blur(8px)', userSelect: 'none' } : {}}
        >
          ₪{totalIncome.toFixed(0)}
        </p>
      </div>
      <div className="bg-[#1a1a24] rounded-xl p-3">
        <p className="text-[9px] tracking-[0.15em] text-[#444] uppercase mb-1.5">הוצאות</p>
        <p className="text-xl font-bold text-[#f56565]">
          ₪{totalExpenses.toFixed(0)}
        </p>
      </div>
    </div>
  );
}
