'use client';
import type { Category } from '@/types';

interface Props {
  categories: Category[];
  filterCategory: string;
  filterType: string;
  onCategoryChange: (v: string) => void;
  onTypeChange: (v: string) => void;
}

export function TransactionFilters({
  categories, filterCategory, filterType, onCategoryChange, onTypeChange
}: Props) {
  const activePill = 'bg-[#3ecf8e22] border border-[#3ecf8e44] text-[#3ecf8e]';
  const idlePill = 'bg-[#1a1a24] text-[#555] hover:text-[#888]';

  return (
    <div className="flex flex-col gap-2">
      {/* Type pills */}
      <div className="flex gap-2">
        {(['all', 'expense', 'income'] as const).map(type => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-colors ${
              filterType === type ? activePill : idlePill
            }`}
          >
            {type === 'all' ? 'הכל' : type === 'expense' ? 'הוצאות' : 'הכנסות'}
          </button>
        ))}
      </div>
      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onCategoryChange('all')}
          className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filterCategory === 'all' ? activePill : idlePill
          }`}
        >
          הכל
        </button>
        {categories.map(c => {
          const isActive = filterCategory === String(c.id);
          return (
            <button
              key={c.id}
              onClick={() => onCategoryChange(String(c.id))}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={isActive
                ? { backgroundColor: c.color + '33', border: `1px solid ${c.color}66`, color: c.color }
                : { backgroundColor: '#1a1a24', color: '#555' }
              }
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
